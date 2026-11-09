import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'

function renderRoute(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

describe('shell y navegación de M02', () => {
  it('navega al detalle y vuelve mediante el enlace de inicio de la cabecera', async () => {
    const user = userEvent.setup()
    renderRoute()

    expect(screen.getByRole('heading', { name: 'Productos', level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText('Carrito: 0 artículos')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Ver detalle de ejemplo' }))

    expect(screen.getByRole('heading', { name: 'Detalle del producto', level: 1 })).toBeInTheDocument()
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
    renderRoute('/products/referencia-directa')

    expect(screen.getByText('referencia-directa')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Volver a productos' }))
    expect(screen.getByRole('heading', { name: 'Productos', level: 1 })).toBeInTheDocument()
  })

  it('resuelve una ruta desconocida en el listado con un aviso, sin una tercera vista', async () => {
    renderRoute('/ruta-inexistente')

    expect(await screen.findByRole('heading', { name: 'Productos', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Página no encontrada')
  })
})
