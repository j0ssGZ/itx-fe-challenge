import { expect, test } from '@playwright/test'
import { apiBase, firstProduct, mockCatalogue, productDetails } from './fixtures.js'

test('PDP: direct entry, responsive image/description layout, refresh and keyboard return', async ({ page }) => {
  const requests = await mockCatalogue(page)
  await page.goto(`/products/${firstProduct.id}`)
  const heading = page.getByRole('heading', { name: firstProduct.model, level: 1 })
  await expect(heading).toBeVisible()
  await expect(page.getByRole('term')).toHaveCount(11)
  const specifications = page.getByRole('region', { name: 'Especificaciones' })
  await expect(specifications).toContainText(productDetails[0].displaySize)
  await expect(specifications).not.toContainText(productDetails[0].displayResolution)
  await expect(specifications).toContainText(productDetails[0].secondaryCmera.join(', '))
  const photo = page.getByRole('img', { name: `${firstProduct.brand} ${firstProduct.model}` })
  await expect(photo).toBeVisible()
  const imageBox = await photo.boundingBox()
  const titleBox = await heading.boundingBox()
  if (page.viewportSize().width >= 768) {
    expect(imageBox.x + imageBox.width).toBeLessThan(titleBox.x)
  } else {
    expect(imageBox.y + imageBox.height).toBeLessThan(titleBox.y)
  }
  const initialViewport = page.viewportSize()
  // Intermediate phone widths exposed an intrinsic-size grid overflow during QA.
  for (const width of initialViewport.width === 320 ? [320, 375, 480] : [initialViewport.width]) {
    await page.setViewportSize({ ...initialViewport, width })
    const frame = await photo.locator('..').boundingBox()
    const image = await photo.boundingBox()
    expect(image.y).toBeGreaterThanOrEqual(frame.y)
    expect(image.y + image.height).toBeLessThanOrEqual(frame.y + frame.height + 1)
    expect(image.x + image.width).toBeLessThanOrEqual(frame.x + frame.width + 1)
  }
  await page.setViewportSize(initialViewport)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const breadcrumb = page.getByRole('navigation', { name: 'Ruta de navegación' })
  await expect(breadcrumb.getByText('Detalle del producto')).toHaveAttribute('aria-current', 'page')
  await expect(breadcrumb.getByRole('link', { name: 'Productos' })).toHaveAttribute('href', '/')
  await expect(page.getByRole('radio')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'Añadir', exact: true })).toBeDisabled()
  await page.reload()
  await expect(heading).toBeVisible()
  await expect(page.getByRole('status').first()).toHaveText('Información del producto cargada.')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Volver a productos' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Productos', level: 1 })).toBeVisible()
  expect(requests).toEqual([
    { url: `${apiBase}/api/product/${firstProduct.id}`, method: 'GET' },
    { url: `${apiBase}/api/product`, method: 'GET' },
  ])
})

test('PDP: loading, generic HTTP 500 feedback and explicit retry', async ({ page }) => {
  await mockCatalogue(page)
  let attempts = 0
  let release
  const gate = new Promise(resolve => { release = resolve })
  await page.route(`${apiBase}/api/product/${firstProduct.id}`, async route => {
    attempts += 1
    if (attempts === 1) {
      await gate
      return route.fulfill({ status: 500, json: { message: 'An Unexpected Error Occurred', code: 0 } })
    }
    return route.fulfill({ json: productDetails[0] })
  })
  await page.goto(`/products/${firstProduct.id}`)
  await expect(page.getByRole('status').first()).toHaveText('Cargando el producto…')
  await expect(page.getByRole('link', { name: 'Volver a productos' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  release()
  await expect(page.getByRole('alert')).toContainText('No hemos podido cargar el producto')
  await expect(page.getByText(/Unexpected Error|producto no encontrado/i)).toHaveCount(0)
  expect(attempts).toBe(1)
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(page.getByRole('heading', { name: firstProduct.model, level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Volver a productos' })).toBeFocused()
  expect(attempts).toBe(2)
})

test('PDP: actual empty specifications/prices and failed image remain accessible', async ({ page }) => {
  await mockCatalogue(page)
  const product = productDetails[2]
  await page.route(product.imgUrl, route => route.abort())
  await page.goto(`/products/${product.id}`)
  await expect(page.getByRole('heading', { name: product.model, level: 1 })).toBeVisible()
  await expect(page.getByRole('term')).toHaveCount(11)
  await expect(page.getByRole('img', { name: `Imagen no disponible: ${product.brand} ${product.model}` })).toBeVisible()
  await expect(page.getByText('Precio no disponible', { exact: true })).toHaveCount(2)
  const specifications = page.getByRole('region', { name: 'Especificaciones' })
  for (const label of ['Batería', 'Dimensiones', 'Peso']) {
    const row = specifications.locator('dl > div').filter({ has: page.getByText(label, { exact: true }) })
    await expect(row.locator('dd')).toHaveText('No disponible')
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('PDP: invalid product data is an inline unavailable state with a route back', async ({ page }) => {
  await mockCatalogue(page)
  await page.route(`${apiBase}/api/product/${firstProduct.id}`, route => route.fulfill({ json: null }))
  await page.goto(`/products/${firstProduct.id}`)
  await expect(page.getByRole('alert')).toContainText('No podemos mostrar este producto')
  await expect(page.getByRole('region', { name: 'Especificaciones' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Volver a productos' })).toHaveAttribute('href', '/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
