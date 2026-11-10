import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it, vi } from 'vitest'
import CartConfirmation from './CartConfirmation.jsx'
import { productDetails } from '../test/fixtures.js'

const confirmation = { product: productDetails[0], color: 'Black', storage: '32 GB' }

function renderConfirmation() {
  const returnFocusRef = createRef()
  const onDismiss = vi.fn()
  const view = render(<MemoryRouter initialEntries={['/product']}>
    <button ref={returnFocusRef}>Añadir</button>
    <Routes>
      <Route path="/product" element={<CartConfirmation confirmation={confirmation} count={7}
        returnFocusRef={returnFocusRef} onDismiss={onDismiss} />} />
      <Route path="/" element={<h1>Catálogo</h1>} />
    </Routes>
  </MemoryRouter>)
  return { ...view, onDismiss, returnFocusRef }
}

it('opens a named modal with actual product/options/count, without an extra live success region', () => {
  renderConfirmation()
  const dialog = screen.getByRole('dialog', { name: 'Producto añadido.' })
  expect(dialog).toHaveAttribute('open')
  expect(dialog).toHaveAccessibleDescription('Tu selección se ha añadido correctamente.')
  expect(screen.getByRole('heading', { name: confirmation.product.model })).toBeInTheDocument()
  expect(screen.getByText('Black')).toBeInTheDocument()
  expect(screen.getByText('32 GB')).toBeInTheDocument()
  expect(screen.getByText('7', { selector: 'strong' })).toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cerrar confirmación' })).toHaveFocus()
})

it.each(['Cerrar confirmación', 'Cerrar'])('closes through %s and returns focus to Add', async name => {
  const { onDismiss, returnFocusRef } = renderConfirmation()
  await userEvent.click(screen.getByRole('button', { name, exact: true }))
  expect(onDismiss).toHaveBeenCalledOnce()
  expect(returnFocusRef.current).toHaveFocus()
  expect(document.querySelector('dialog')).not.toHaveAttribute('open')
})

it('handles native cancellation through the same dismiss path', () => {
  const { onDismiss, returnFocusRef } = renderConfirmation()
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
  expect(onDismiss).toHaveBeenCalledOnce()
  expect(returnFocusRef.current).toHaveFocus()
})

it('wraps Tab and Shift+Tab between the dialog controls', async () => {
  renderConfirmation()
  const user = userEvent.setup()
  const first = screen.getByRole('button', { name: 'Cerrar confirmación' })
  const last = screen.getByRole('button', { name: 'Cerrar', exact: true })
  await user.tab({ shift: true })
  expect(last).toHaveFocus()
  await user.tab()
  expect(first).toHaveFocus()
})

it('continues to the catalogue and restores previous body styles during route cleanup', async () => {
  document.body.style.overflow = 'auto'
  document.body.style.paddingRight = '3px'
  renderConfirmation()
  expect(document.body.style.overflow).toBe('hidden')
  await userEvent.click(screen.getByRole('link', { name: 'Seguir comprando' }))
  expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(document.body.style.overflow).toBe('auto')
  expect(document.body.style.paddingRight).toBe('3px')
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

it('cleans scroll styles and the dialog on unmount, including rapid remount', () => {
  for (let index = 0; index < 2; index += 1) {
    const view = renderConfirmation()
    expect(document.body.style.overflow).toBe('hidden')
    view.unmount()
    expect(document.body.style.overflow).toBe('')
    expect(document.querySelector('dialog')).toBeNull()
  }
})
