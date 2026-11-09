import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { productList, productDetails, unknownProductError } from '../test/fixtures.js'
import App from './App.jsx'

beforeEach(() => {
  localStorage.clear()
  fetch.mockImplementation(async url => {
    const path = new URL(url).pathname
    const detail = productDetails.find(product => path === `/api/product/${encodeURIComponent(product.id)}`)
    if (detail) return new Response(JSON.stringify(detail))
    return path === '/api/product' ? new Response(JSON.stringify(productList))
      : new Response(JSON.stringify(unknownProductError), { status: 500 })
  })
})

function renderRoute(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

describe('shell y navegación de M02', () => {
  it('navega al detalle y vuelve mediante el enlace de inicio de la cabecera', async () => {
    const user = userEvent.setup()
    renderRoute()

    expect(screen.getByRole('heading', { name: 'Productos', level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText('Carrito: 0 artículos')).toBeInTheDocument()

    await user.click(await screen.findByRole('link', { name: `Ver detalle de ${productList[0].brand} ${productList[0].model}` }))

    expect(await screen.findByRole('heading', { name: productDetails[0].model, level: 1 })).toBeInTheDocument()
    expect(document.title).toBe('Detalle del producto | ITX Mobile')
    expect(screen.getByRole('main')).toHaveFocus()
    const breadcrumbs = screen.getByRole('navigation', { name: 'Ruta de navegación' })
    expect(within(breadcrumbs).getByRole('link', { name: 'Productos' })).toHaveAttribute('href', '/')
    expect(within(breadcrumbs).getByText('Detalle del producto')).toHaveAttribute('aria-current', 'page')

    await user.click(screen.getByRole('link', { name: 'ITX Mobile, inicio' }))

    expect(screen.getByRole('heading', { name: 'Productos', level: 1 })).toBeInTheDocument()
    expect(document.title).toBe('Productos | ITX Mobile')
  })

  it('admite entrada directa con un identificador y retorno explícito al listado', async () => {
    const user = userEvent.setup()
    renderRoute(`/products/${productDetails[1].id}`)

    expect(await screen.findByRole('heading', { name: productDetails[1].model, level: 1 })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Volver a productos' }))
    expect(screen.getByRole('heading', { name: 'Productos', level: 1 })).toBeInTheDocument()
  })

  it('resuelve una ruta desconocida en el listado con un aviso, sin una tercera vista', async () => {
    renderRoute('/ruta-inexistente')

    expect(await screen.findByRole('heading', { name: 'Productos', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Página no encontrada. Te mostramos el inicio.')).toHaveAttribute('role', 'status')
  })
})
