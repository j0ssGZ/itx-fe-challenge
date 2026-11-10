import { StrictMode } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../app/App.jsx'
import { productDetails, productList, unknownProductError } from '../test/fixtures.js'

const [first, second] = productDetails
const path = id => `/products/${encodeURIComponent(id)}`
const detailPath = id => `/api/product/${encodeURIComponent(id)}`
const respond = data => fetch.mockImplementation(async () => new Response(JSON.stringify(data)))

function renderDetail(id = first.id, { navigation = false, strict = false } = {}) {
  const app = (
    <MemoryRouter initialEntries={[path(id)]}>
      <App />
      {navigation && <nav aria-label="Test: cambiar producto">
        <Link to={path(first.id)}>Abrir A</Link><Link to={path(second.id)}>Abrir B</Link>
      </nav>}
    </MemoryRouter>
  )
  return render(strict ? <StrictMode>{app}</StrictMode> : app)
}

function valueFor(label) {
  return within(screen.getByText(label, { selector: 'dt' }).parentElement).getByRole('definition')
}

beforeEach(() => {
  localStorage.clear()
  fetch.mockImplementation(async url => {
    const pathname = new URL(url).pathname
    if (pathname === '/api/product') return new Response(JSON.stringify(productList))
    const product = productDetails.find(detail => pathname === detailPath(detail.id))
    return product ? new Response(JSON.stringify(product))
      : new Response(JSON.stringify(unknownProductError), { status: 500 })
  })
})

describe('PDP read-only attributes and contract mappings', () => {
  it.each(productDetails)('displays all eleven labeled attributes for $model using actual M01 mappings', async product => {
    renderDetail(product.id)
    expect(await screen.findByRole('heading', { name: product.model, level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('term')).toHaveLength(11)
    const expected = {
      Marca: product.brand, Modelo: product.model, Precio: product.price || 'Precio no disponible',
      CPU: Array.isArray(product.cpu) ? product.cpu.join(', ') : product.cpu,
      RAM: product.ram, 'Sistema operativo': product.os,
      'Resolución de pantalla': product.displaySize, Batería: product.battery || 'No disponible',
      Dimensiones: product.dimentions === '-' ? 'No disponible' : product.dimentions,
      Peso: product.weight || 'No disponible',
    }
    for (const [label, value] of Object.entries(expected)) expect(valueFor(label).textContent).toBe(value)
    const mainCamera = Array.isArray(product.primaryCamera) ? product.primaryCamera.join(', ') : product.primaryCamera
    const secondaryCamera = Array.isArray(product.secondaryCmera) ? product.secondaryCmera.join(', ') : product.secondaryCmera
    expect(valueFor('Cámaras')).toHaveTextContent(`Principal: ${mainCamera}`)
    expect(valueFor('Cámaras')).toHaveTextContent(`Secundaria: ${secondaryCamera}`)
    expect(valueFor('Resolución de pantalla')).not.toHaveTextContent(product.displayResolution)
    expect(screen.getByRole('img', { name: `${product.brand} ${product.model}` })).toHaveAttribute('src', product.imgUrl)
    expect(screen.getByRole('button', { name: 'Añadir' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(product.options.colors.length + product.options.storages.length)
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(detailPath(product.id)), expect.objectContaining({ method: 'GET', credentials: 'omit' }))
  })

  it('keeps all labels with honest fallbacks for missing optional values', async () => {
    // Synthetic robustness input derived from a real string ID, not a server guarantee.
    respond({ id: first.id })
    renderDetail()
    await screen.findByRole('heading', { name: 'Especificaciones' })
    expect(screen.getAllByRole('term')).toHaveLength(11)
    for (const label of ['Marca', 'Modelo', 'CPU', 'RAM', 'Sistema operativo', 'Resolución de pantalla', 'Batería', 'Dimensiones', 'Peso']) {
      expect(valueFor(label)).toHaveTextContent(/^No disponible$/)
    }
    expect(valueFor('Precio')).toHaveTextContent(/^Precio no disponible$/)
    expect(valueFor('Cámaras')).toHaveTextContent('Principal: No disponible')
    expect(valueFor('Cámaras')).toHaveTextContent('Secundaria: No disponible')
    expect(screen.getByRole('img')).toHaveAccessibleName('Imagen no disponible: Dispositivo móvil')
  })

  it('handles inconsistent optional objects/arrays without exposing raw JS or invented values', async () => {
    respond({ ...first, price: {}, cpu: ['CPU', null], ram: {}, primaryCamera: {}, secondaryCmera: [], weight: false })
    renderDetail()
    await screen.findByRole('heading', { name: first.model })
    expect(valueFor('Precio')).toHaveTextContent(/^Precio no disponible$/)
    for (const label of ['CPU', 'RAM', 'Peso']) expect(valueFor(label)).toHaveTextContent(/^No disponible$/)
    expect(valueFor('Cámaras')).toHaveTextContent('Principal: No disponible')
    expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument()
  })

  it('preserves leading-zero string IDs and does not display an opaque ID instead of product content', async () => {
    respond({ ...first, id: '0001' })
    renderDetail('0001')
    await screen.findByRole('heading', { name: first.model })
    expect(fetch.mock.calls[0][0]).toBe('https://itx-frontend-test.onrender.com/api/product/0001')
    expect(screen.queryByText('0001', { exact: true })).not.toBeInTheDocument()
  })

  it('reuses ProductImage fallback when the remote image fails', async () => {
    renderDetail()
    await screen.findByRole('heading', { name: first.model })
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByRole('img')).toHaveAccessibleName(`Imagen no disponible: ${first.brand} ${first.model}`)
    expect(screen.getByText('Imagen no disponible')).toBeInTheDocument()
    expect(valueFor('Marca')).toHaveTextContent(first.brand)
  })
})

describe('PDP loading, error states and navigation', () => {
  it('keeps header, breadcrumbs and explicit back link while loading', async () => {
    let finish
    fetch.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    renderDetail()
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('Cargando el producto…')
    expect(screen.getByRole('link', { name: 'Volver a productos' })).toHaveAttribute('href', '/')
    expect(screen.getByLabelText('Carrito: 0 artículos')).toBeInTheDocument()
    const breadcrumb = screen.getByRole('navigation', { name: 'Ruta de navegación' })
    expect(within(breadcrumb).getByText('Detalle del producto')).toHaveAttribute('aria-current', 'page')
    expect(within(breadcrumb).getByRole('link', { name: 'Productos' })).toHaveAttribute('href', '/')
    finish(new Response(JSON.stringify(first)))
    await screen.findByRole('heading', { name: first.model })
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('Información del producto cargada.')
  })

  it.each(['500', '404', 'network', 'json', 'contract', 'mismatched-id'])(
    'handles %s safely, without assuming every failure is a missing product', async failure => {
      if (failure === '500' || failure === '404') {
        fetch.mockImplementation(async () => new Response(JSON.stringify(unknownProductError), { status: Number(failure) }))
      }
      if (failure === 'network') fetch.mockRejectedValue(new TypeError('private diagnostic trace'))
      if (failure === 'json') fetch.mockImplementation(async () => new Response('private diagnostic trace'))
      if (failure === 'contract') respond(null)
      if (failure === 'mismatched-id') respond(second)
      renderDetail()
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(['contract', 'mismatched-id'].includes(failure)
        ? 'No podemos mostrar este producto' : 'No hemos podido cargar el producto')
      expect(screen.queryByText(/private diagnostic|Unexpected Error|producto no encontrado/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Especificaciones' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Volver a productos' })).toHaveAttribute('href', '/')
    },
  )

  it('reports an invalid route argument without a network request', async () => {
    renderDetail(' ')
    expect(await screen.findByRole('alert')).toHaveTextContent('No podemos mostrar este producto')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('retries deliberately, preserves a useful focus target and never retries automatically', async () => {
    const user = userEvent.setup()
    fetch.mockRejectedValue(new TypeError('Offline'))
    renderDetail()
    await screen.findByRole('alert')
    expect(fetch).toHaveBeenCalledTimes(1)
    respond(first)
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    await screen.findByRole('heading', { name: first.model })
    expect(screen.getByRole('link', { name: 'Volver a productos' })).toHaveFocus()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('supports direct entry and keyboard return to the catalogue without depending on browser history', async () => {
    const user = userEvent.setup()
    renderDetail(second.id)
    await screen.findByRole('heading', { name: second.model })
    expect(document.title).toBe('Detalle del producto | ITX Mobile')
    expect(screen.getByRole('main')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Volver a productos' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'Productos', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('provides a working parent breadcrumb after direct entry', async () => {
    const user = userEvent.setup()
    renderDetail()
    await screen.findByRole('heading', { name: first.model })
    const breadcrumb = screen.getByRole('navigation', { name: 'Ruta de navegación' })
    await user.click(within(breadcrumb).getByRole('link', { name: 'Productos' }))
    expect(screen.getByRole('heading', { name: 'Productos', level: 1 })).toBeInTheDocument()
  })
})

describe('PDP route lifecycle and stale-response protection', () => {
  it('clears A immediately on an ID change while B is still loading, then displays B', async () => {
    const user = userEvent.setup()
    let finishB
    fetch.mockImplementation(async url => {
      if (new URL(url).pathname === detailPath(second.id)) return new Promise(resolve => { finishB = resolve })
      return new Response(JSON.stringify(first))
    })
    renderDetail(first.id, { navigation: true })
    await screen.findByRole('heading', { name: first.model })
    await user.click(screen.getByRole('link', { name: 'Abrir B' }))
    expect(screen.queryByRole('heading', { name: first.model })).not.toBeInTheDocument()
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('Cargando el producto…')
    finishB(new Response(JSON.stringify(second)))
    await screen.findByRole('heading', { name: second.model })
    expect(valueFor('Modelo')).toHaveTextContent(second.model)
  })

  it.each(['success', 'failure'])('ignores a late A %s after navigation to B', async outcome => {
    const user = userEvent.setup()
    let finishA
    let failA
    fetch.mockImplementation(url => new URL(url).pathname === detailPath(first.id)
      ? new Promise((resolve, reject) => { finishA = resolve; failA = reject })
      : Promise.resolve(new Response(JSON.stringify(second))))
    renderDetail(first.id, { navigation: true })
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    const signalA = fetch.mock.calls[0][1].signal
    await user.click(screen.getByRole('link', { name: 'Abrir B' }))
    expect(signalA.aborted).toBe(true)
    await screen.findByRole('heading', { name: second.model })
    await act(async () => {
      if (outcome === 'success') finishA(new Response(JSON.stringify(first)))
      else failA(new TypeError('late network failure'))
    })
    expect(screen.getByRole('heading', { name: second.model })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: first.model })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('aborts on unmount without rendering a cancellation error', async () => {
    let finish
    fetch.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const view = renderDetail()
    const { signal } = fetch.mock.calls[0][1]
    view.unmount()
    expect(signal.aborted).toBe(true)
    await act(async () => finish(new Response(JSON.stringify(first))))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('loads correctly in StrictMode after cancellation of the first development read', async () => {
    renderDetail(first.id, { strict: true })
    await screen.findByRole('heading', { name: first.model })
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('reuses a fresh detail on remount while keeping different IDs independent', async () => {
    const view = renderDetail()
    await screen.findByRole('heading', { name: first.model })
    view.unmount()
    const secondView = renderDetail(second.id)
    await screen.findByRole('heading', { name: second.model })
    secondView.unmount()
    renderDetail(first.id)
    await screen.findByRole('heading', { name: first.model })
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
