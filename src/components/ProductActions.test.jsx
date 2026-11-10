import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../app/App.jsx'
import { CART_COUNT_KEY } from '../storage/cartCount.js'
import { productDetails, productList } from '../test/fixtures.js'

const [first, second, single] = productDetails
const json = value => new Response(JSON.stringify(value))
const posts = () => fetch.mock.calls.filter(([, options]) => options.method === 'POST')
let mutate

beforeEach(() => {
  localStorage.clear()
  mutate = vi.fn(async () => json({ count: 1 }))
  fetch.mockImplementation(async (url, options) => {
    if (options.method === 'POST') return mutate(url, options)
    const path = new URL(url).pathname
    if (path === '/api/product') return json(productList)
    const product = productDetails.find(item => path.endsWith(`/${item.id}`))
    return json(product)
  })
})

function renderProduct(product = first, navigation = false) {
  return render(<MemoryRouter initialEntries={[`/products/${product.id}`]}>
    <App />
    {navigation && <nav aria-label="Test routes"><Link to={`/products/${second.id}`}>Otro producto</Link></nav>}
  </MemoryRouter>)
}
async function ready(product = first) {
  await screen.findByRole('heading', { name: product.model, level: 1 })
  return screen.getByRole('button', { name: 'Añadir', exact: true })
}
function group(name) { return within(screen.getByRole('group', { name })) }
const count = value => screen.getByLabelText(`Carrito: ${value} artículos`)

describe('visible native product options and valid exact requests', () => {
  it('preselects one color, leaves multiple storages unselected and sends numeric codes', async () => {
    const user = userEvent.setup()
    renderProduct()
    const add = await ready()
    expect(group('Color').getByRole('radio', { name: 'Black' })).toBeChecked()
    expect(group('Almacenamiento').getAllByRole('radio').every(radio => !radio.checked)).toBe(true)
    expect(add).toBeDisabled()
    fireEvent.submit(add.closest('form'))
    expect(posts()).toHaveLength(0)
    await user.click(group('Almacenamiento').getByRole('radio', { name: '32 GB' }))
    expect(add).toBeEnabled()
    await user.click(add)
    await waitFor(() => expect(count(1)).toBeInTheDocument())
    expect(JSON.parse(posts()[0][1].body)).toEqual({ id: first.id, colorCode: 1000, storageCode: 2001 })
    expect(screen.getByRole('dialog', { name: 'Producto añadido.' })).toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getAllByRole('definition').map(item => item.textContent)).toEqual(['Black', '32 GB'])
  })

  it('preselects singleton storage but waits for a choice between multiple colors', async () => {
    const user = userEvent.setup()
    renderProduct(second)
    const add = await ready(second)
    expect(group('Almacenamiento').getByRole('radio', { name: '32 GB' })).toBeChecked()
    expect(group('Color').getAllByRole('radio').every(radio => !radio.checked)).toBe(true)
    expect(add).toBeDisabled()
    await user.click(group('Color').getByRole('radio', { name: 'White' }))
    await user.click(add)
    await waitFor(() => expect(posts()).toHaveLength(1))
    expect(JSON.parse(posts()[0][1].body)).toEqual({ id: second.id, colorCode: 1001, storageCode: 2000 })
  })

  it('shows/preselects both singletons even with no price, without inventing stock rules', async () => {
    renderProduct(single)
    expect(await ready(single)).toBeEnabled()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getAllByRole('radio').every(radio => radio.checked)).toBe(true)
  })

  it('leaves both multi-option groups unselected initially', async () => {
    fetch.mockResolvedValue(json({ ...first, options: { colors: second.options.colors, storages: first.options.storages } }))
    renderProduct()
    expect(await ready()).toBeDisabled()
    expect(screen.getAllByRole('radio').every(radio => !radio.checked)).toBe(true)
  })

  it.each([undefined, {}, { colors: [], storages: [] }, { colors: [{ code: '1000', name: 'Black' }], storages: [{ code: null, name: '32 GB' }] }])(
    'handles missing/invalid option groups %j with explanation and no POST', async options => {
      fetch.mockImplementation(async () => json({ ...first, options }))
      renderProduct()
      const add = await ready()
      expect(add).toBeDisabled()
      expect(screen.getAllByText('No disponible')).toHaveLength(2)
      expect(screen.getByText(/No hay opciones válidas suficientes/)).toBeInTheDocument()
      fireEvent.submit(add.closest('form'))
      expect(posts()).toHaveLength(0)
    },
  )

  it('accepts real numeric zero codes in a synthetic robustness fixture', async () => {
    fetch.mockImplementation(async (_url, options) => options.method === 'POST' ? json({ count: 1 })
      : json({ ...single, options: { colors: [{ code: 0, name: 'Black' }], storages: [{ code: 0, name: '32 GB' }] } }))
    renderProduct(single)
    fireEvent.click(await ready(single))
    await waitFor(() => expect(count(1)).toBeInTheDocument())
    expect(JSON.parse(posts()[0][1].body)).toEqual({ id: single.id, colorCode: 0, storageCode: 0 })
  })

  it('resets product selections and feedback when changing IDs', async () => {
    const user = userEvent.setup()
    renderProduct(first, true)
    await ready()
    await user.click(group('Almacenamiento').getByRole('radio', { name: '32 GB' }))
    await user.click(screen.getByRole('link', { name: 'Otro producto' }))
    expect(await ready(second)).toBeDisabled()
    expect(group('Color').getAllByRole('radio').every(radio => !radio.checked)).toBe(true)
    expect(group('Almacenamiento').getByRole('radio', { name: '32 GB' })).toBeChecked()
  })

  it('supports native keyboard radio selection and submission', async () => {
    const user = userEvent.setup()
    renderProduct()
    const add = await ready()
    group('Almacenamiento').getByRole('radio', { name: '16 GB' }).focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowRight}')
    expect(group('Almacenamiento').getByRole('radio', { name: '32 GB' })).toBeChecked()
    await user.tab()
    expect(add).toHaveFocus()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(count(1)).toBeInTheDocument())
  })
})

describe('confirmed shared count, errors and mutation lifecycle', () => {
  it('blocks double clicks and repeated submits synchronously while pending', async () => {
    const user = userEvent.setup()
    let finish
    mutate.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    renderProduct(single)
    const add = await ready(single)
    await user.dblClick(add)
    expect(posts()).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Añadiendo…' })).toBeDisabled()
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
    fireEvent.submit(add.closest('form'))
    expect(posts()).toHaveLength(1)
    expect(count(0)).toBeInTheDocument()
    await act(async () => finish(json({ count: 4 })))
    expect(count(4)).toBeInTheDocument()
    expect(add).toBeEnabled()
  })

  it('replaces counts exactly, including repeated 1, persists and restores across remount/routes', async () => {
    const user = userEvent.setup()
    const view = renderProduct(single)
    const add = await ready(single)
    for (const value of [6, 1, 1, 0, 9]) {
      mutate.mockResolvedValueOnce(json({ count: value }))
      await user.click(add)
      await waitFor(() => expect(count(value)).toBeInTheDocument())
      expect(JSON.parse(localStorage.getItem(CART_COUNT_KEY))).toEqual({ version: 1, count: value })
      expect(within(screen.getByRole('dialog')).getByText(String(value), { selector: 'strong' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Cerrar', exact: true }))
    }
    expect(posts()).toHaveLength(5)
    await user.click(screen.getByRole('link', { name: 'Volver a productos' }))
    expect(count(9)).toBeInTheDocument()
    view.unmount()
    render(<MemoryRouter><App /></MemoryRouter>)
    expect(count(9)).toBeInTheDocument()
  })

  it.each(['http', 'network', 'json', 'count'])(
    'preserves selection and previous confirmed count after %s failure, without retries', async failure => {
      localStorage.setItem(CART_COUNT_KEY, '{"version":1,"count":5}')
      if (failure === 'http') mutate.mockResolvedValue(new Response('private server details', { status: 500 }))
      if (failure === 'network') mutate.mockRejectedValue(new TypeError('private diagnostic'))
      if (failure === 'json') mutate.mockResolvedValue(new Response('private diagnostic'))
      if (failure === 'count') mutate.mockResolvedValue(json({ count: -1 }))
      const user = userEvent.setup()
      renderProduct()
      await ready()
      await user.click(group('Almacenamiento').getByRole('radio', { name: '32 GB' }))
      await user.click(screen.getByRole('button', { name: 'Añadir', exact: true }))
      expect(await screen.findByRole('alert')).toHaveTextContent('No hemos podido confirmar la operación')
      expect(screen.queryByText(/private/)).not.toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(count(5)).toBeInTheDocument()
      expect(group('Almacenamiento').getByRole('radio', { name: '32 GB' })).toBeChecked()
      expect(posts()).toHaveLength(1)
      expect(JSON.parse(localStorage.getItem(CART_COUNT_KEY)).count).toBe(5)
    },
  )

  it('storage denial does not turn a confirmed server success into an API failure', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    const user = userEvent.setup()
    renderProduct(single)
    await user.click(await ready(single))
    await waitFor(() => expect(count(1)).toBeInTheDocument())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cerrar', exact: true }))
    await user.click(screen.getByRole('link', { name: 'Volver a productos' }))
    expect(count(1)).toBeInTheDocument()
  })

  it('corrupted storage safely starts the header at zero', async () => {
    localStorage.setItem(CART_COUNT_KEY, '{broken')
    renderProduct(single)
    await ready(single)
    expect(count(0)).toBeInTheDocument()
  })

  it('a mutation completed after leaving PDP still confirms the shared count without replay', async () => {
    let finish
    mutate.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const user = userEvent.setup()
    renderProduct(single)
    await user.click(await ready(single))
    await user.click(screen.getByRole('link', { name: 'Volver a productos' }))
    expect(count(0)).toBeInTheDocument()
    await act(async () => finish(json({ count: 3 })))
    expect(count(3)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(posts()).toHaveLength(1)
  })

  it.each(['success', 'failure'])('does not let an older add overwrite a newer %s outcome', async outcome => {
    let finishOlder
    mutate.mockImplementationOnce(() => new Promise(resolve => { finishOlder = resolve }))
    const user = userEvent.setup()
    renderProduct(single, true)
    await user.click(await ready(single))
    await user.click(screen.getByRole('link', { name: 'Otro producto' }))
    await ready(second)
    await user.click(group('Color').getByRole('radio', { name: 'White' }))
    mutate.mockResolvedValueOnce(outcome === 'success' ? json({ count: 8 }) : new Response('failure', { status: 500 }))
    await user.click(screen.getByRole('button', { name: 'Añadir', exact: true }))
    if (outcome === 'success') await waitFor(() => expect(count(8)).toBeInTheDocument())
    else await screen.findByRole('alert')
    await act(async () => finishOlder(json({ count: 3 })))
    // A failed newer add supplies no confirmation; the older valid reply still counts.
    const expected = outcome === 'success' ? 8 : 3
    expect(count(expected)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(CART_COUNT_KEY)).count).toBe(expected)
    expect(posts()).toHaveLength(2)
  })
})
