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
