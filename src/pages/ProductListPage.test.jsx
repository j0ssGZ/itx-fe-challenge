import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import ProductListPage from './ProductListPage.jsx'
import App from '../app/App.jsx'
import { productList, productDetails } from '../test/fixtures.js'

const samples = productList.filter(product => productDetails.some(detail => detail.id === product.id))
const first = samples[0]
const firstLink = `Ver detalle de ${first.brand} ${first.model}`
const respond = data => fetch.mockImplementation(async () => new Response(JSON.stringify(data)))
const renderList = () => render(<MemoryRouter><ProductListPage /></MemoryRouter>)

beforeEach(() => {
  localStorage.clear()
  respond(samples)
})

describe('PLP catalogue and derived live search', () => {
  it('renders every M01 product, image, brand, model, raw price and string-ID link', async () => {
    respond(productList)
    renderList()
    const list = await screen.findByRole('list', { name: 'Catálogo de productos' })
    const cards = within(list).getAllByRole('listitem')
    expect(cards).toHaveLength(productList.length)
    productList.forEach((product, index) => {
      const card = within(cards[index])
      expect(card.getByRole('link')).toHaveAttribute('href', `/products/${encodeURIComponent(product.id)}`)
      expect(card.getByRole('heading', { name: product.model, level: 2 })).toBeInTheDocument()
      expect(card.getByText(product.brand)).toBeInTheDocument()
      expect(card.getByRole('img', { name: `${product.brand} ${product.model}` })).toHaveAttribute('src', product.imgUrl)
      expect(card.getByText(product.price || 'Precio no disponible')).toBeInTheDocument()
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([
    { query: 'ALCaT', ids: samples.filter(product => product.brand === 'alcatel').map(({ id }) => id) },
    { query: 'tAlK', ids: [first.id] },
    { query: '  acer  ', ids: samples.filter(product => product.brand === 'Acer').map(({ id }) => id) },
  ])('filters partial brand/model query "$query" without new requests', async ({ query, ids }) => {
    const user = userEvent.setup()
    renderList()
    await screen.findByRole('link', { name: firstLink })
    const search = screen.getByRole('searchbox', { name: 'Buscar por marca o modelo' })
    await user.type(search, query)
    expect(screen.getAllByRole('link').map(link => link.getAttribute('href')))
      .toEqual(ids.map(id => `/products/${id}`))
    expect(search).toHaveFocus()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('updates immediately after each input change and clearing restores the complete list', async () => {
    const user = userEvent.setup()
    renderList()
    await screen.findByRole('link', { name: firstLink })
    const search = screen.getByRole('searchbox')
    await user.type(search, 'Flash')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    await user.clear(search)
    expect(screen.getAllByRole('listitem')).toHaveLength(samples.length)
    await user.type(search, 'Talk')
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
    expect(screen.getAllByRole('listitem')).toHaveLength(samples.length)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('announces no matches, distinguishes that from an empty API list, and provides reset', async () => {
    const user = userEvent.setup()
    renderList()
    await screen.findByRole('link', { name: firstLink })
    await user.type(screen.getByRole('searchbox'), 'not-an-observed-model')
    expect(screen.getByRole('status')).toHaveTextContent('No hay productos que coincidan con tu búsqueda.')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByText('No hay productos disponibles en este momento.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mostrar todos los productos' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(samples.length)
    expect(screen.getByRole('searchbox')).toHaveFocus()
  })

  it('shows accessible loading feedback until the request completes', async () => {
    let finish
    fetch.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    renderList()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando productos…')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    finish(new Response(JSON.stringify(samples)))
    expect(await screen.findByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(`${samples.length} productos`)
  })

  it('shows a distinct empty API state, keeping the search labeled and usable', async () => {
    respond([])
    renderList()
    expect(await screen.findByText('No hay productos disponibles en este momento.')).toHaveAttribute('role', 'status')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveAccessibleName('Buscar por marca o modelo')
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })

  it.each(['http', 'network', 'json', 'contract'])('handles %s failure with safe feedback and an explicit working retry', async failure => {
    const user = userEvent.setup()
    if (failure === 'http') fetch.mockImplementation(async () => new Response('sensitive backend trace', { status: 500 }))
    if (failure === 'network') fetch.mockRejectedValue(new TypeError('sensitive backend trace'))
    if (failure === 'json') fetch.mockImplementation(async () => new Response('sensitive backend trace'))
    if (failure === 'contract') respond({ trace: 'sensitive backend trace' })
    renderList()
    expect(await screen.findByRole('alert')).toHaveTextContent('No hemos podido cargar los productos')
    expect(screen.queryByText(/sensitive backend trace/)).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    let finish
    fetch.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(screen.getByRole('status')).toHaveTextContent('Cargando productos…')
    expect(screen.getByRole('searchbox')).toHaveFocus()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    finish(new Response(JSON.stringify(samples)))
    expect(await screen.findByRole('link', { name: firstLink })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('uses safe fallback text for missing optional fields and never converts a price to zero', async () => {
    // Synthetic robustness fixture derived from a real identity, not a new API guarantee.
    respond([{ id: first.id }])
    renderList()
    const card = await screen.findByRole('link', { name: 'Ver detalle de Marca no disponible Modelo no disponible' })
    expect(within(card).getByText('Precio no disponible')).toBeInTheDocument()
    expect(within(card).getByRole('img')).toHaveAccessibleName('Imagen no disponible: Marca no disponible Modelo no disponible')
    expect(within(card).queryByText('0')).not.toBeInTheDocument()
    await userEvent.type(screen.getByRole('searchbox'), 'no matches')
    expect(screen.getByRole('status')).toHaveTextContent('No hay productos que coincidan')
  })

  it('replaces a broken image with a bounded accessible fallback', async () => {
    renderList()
    const card = await screen.findByRole('link', { name: firstLink })
    fireEvent.error(within(card).getByRole('img'))
    expect(within(card).getByRole('img')).toHaveAccessibleName(`Imagen no disponible: ${first.brand} ${first.model}`)
    expect(within(card).getByText('Imagen no disponible')).toBeInTheDocument()
    expect(card).toHaveAttribute('href', `/products/${first.id}`)
  })

  it('supports keyboard search, clear and Enter navigation with correct route focus', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><App /></MemoryRouter>)
    await screen.findByRole('link', { name: firstLink })
    await user.tab()
    expect(screen.getByRole('searchbox')).toHaveFocus()
    await user.keyboard('Talk')
    expect(within(screen.getByRole('list', { name: 'Catálogo de productos' })).getAllByRole('listitem')).toHaveLength(1)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('searchbox')).toHaveFocus()
    await user.keyboard('Talk')
    await user.tab()
    await user.tab()
    expect(screen.getByRole('link', { name: firstLink })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: 'Detalle del producto', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(first.id)).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('aborts an obsolete request on unmount and a later success cannot poison the next read', async () => {
    let finish
    let signal
    fetch.mockImplementation((_url, options) => {
      signal = options.signal
      return new Promise(resolve => { finish = resolve })
    })
    const view = renderList()
    view.unmount()
    expect(signal.aborted).toBe(true)
    finish(new Response(JSON.stringify(samples)))
    respond([])
    renderList()
    await screen.findByText('No hay productos disponibles en este momento.')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('reuses the M03 cache after a remount without another request', async () => {
    const view = renderList()
    await screen.findByRole('link', { name: firstLink })
    view.unmount()
    fetch.mockRejectedValue(new Error('Network must not be used for a fresh cache hit'))
    renderList()
    await screen.findByRole('link', { name: firstLink })
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
  })

  it('still loads after StrictMode cancels the first development read', async () => {
    render(<StrictMode><MemoryRouter><ProductListPage /></MemoryRouter></StrictMode>)
    expect(await screen.findByRole('link', { name: firstLink })).toBeInTheDocument()
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
