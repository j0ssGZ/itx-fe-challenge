import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import ProductImage from './ProductImage.jsx'
import { productList } from '../test/fixtures.js'

it('recovers from a failed source when a different product image is provided', () => {
  const [first, second] = productList
  const { rerender } = render(<ProductImage src={first.imgUrl} alt={first.model} />)
  fireEvent.error(screen.getByRole('img'))
  expect(screen.getByRole('img')).toHaveAccessibleName(`Imagen no disponible: ${first.model}`)
  rerender(<ProductImage src={second.imgUrl} alt={second.model} />)
  expect(screen.getByRole('img')).toHaveAttribute('src', second.imgUrl)
  expect(screen.getByRole('img')).toHaveAccessibleName(second.model)
})

it('distinguishes a pending image from a failed source without retrying it', () => {
  render(<ProductImage src={productList[0].imgUrl} alt="Móvil" />)
  expect(screen.getByText('Cargando imagen…')).toHaveAttribute('aria-hidden', 'true')
  expect(screen.queryByText('Imagen no disponible')).not.toBeInTheDocument()
  fireEvent.error(screen.getByRole('img'))
  expect(screen.queryByText('Cargando imagen…')).not.toBeInTheDocument()
  expect(screen.getByRole('img')).toHaveAccessibleName('Imagen no disponible: Móvil')
  expect(document.querySelector('img')).toBeNull()
})

it('shows a deliberate accessible fallback immediately for a missing URL', () => {
  render(<ProductImage alt="Móvil" />)
  expect(screen.getByText('Imagen no disponible')).toBeInTheDocument()
  expect(screen.getByText('Consulta los detalles del producto.')).toBeInTheDocument()
  expect(screen.queryByText('Cargando imagen…')).not.toBeInTheDocument()
})

it('removes loading feedback on success and caps enlargement using natural image dimensions', () => {
  render(<ProductImage src={productList[0].imgUrl} alt="Móvil" />)
  const image = screen.getByRole('img')
  Object.defineProperties(image, { naturalWidth: { value: 160 }, naturalHeight: { value: 212 } })
  fireEvent.load(image)
  expect(screen.queryByText('Cargando imagen…')).not.toBeInTheDocument()
  expect(image).toHaveStyle({ maxWidth: '240px', maxHeight: '318px' })
  expect(image).toHaveAttribute('src', productList[0].imgUrl)
})
