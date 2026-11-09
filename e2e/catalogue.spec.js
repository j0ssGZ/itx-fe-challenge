import { expect, test } from '@playwright/test'
import { apiBase, catalogue, firstProduct, firstProductLink, mockCatalogue } from './fixtures.js'

test('catalogue: responsive grid, search placement, live filtering and keyboard navigation', async ({ page }) => {
  const requests = await mockCatalogue(page)
  await page.goto('/')
  const list = page.getByRole('list', { name: 'Catálogo de productos' })
  await expect(list.getByRole('listitem')).toHaveCount(catalogue.length)
  const width = page.viewportSize().width
  const expectedColumns = width >= 1024 ? 4 : width >= 768 ? 3 : width >= 480 ? 2 : 1
  const columns = await list.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)
  expect(columns).toBe(expectedColumns)
  expect(columns).toBeLessThanOrEqual(4)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const search = page.getByRole('searchbox', { name: 'Buscar por marca o modelo' })
  const searchBox = await page.getByRole('search', { name: 'Buscar en el catálogo' }).boundingBox()
  const gridBox = await list.boundingBox()
  expect(searchBox.y + searchBox.height).toBeLessThan(gridBox.y)
  if (width >= 768) expect(Math.abs(searchBox.x + searchBox.width - gridBox.x - gridBox.width)).toBeLessThan(2)

  if (width === 320) {
    await page.setViewportSize({ width: 480, height: 800 })
    expect(await list.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(2)
    await page.setViewportSize({ width: 320, height: 800 })
  }
  // App gives main focus on route entry. The next tab reaches labeled search.
  await page.keyboard.press('Tab')
  await expect(search).toBeFocused()
  await page.keyboard.type('ALCaT')
  await expect(list.getByRole('listitem')).toHaveCount(1)
  await expect(list.getByRole('heading', { name: 'Flash (2017)' })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Limpiar búsqueda' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(search).toBeFocused()
  await expect(list.getByRole('listitem')).toHaveCount(catalogue.length)
  await search.fill('not-an-observed-model')
  await expect(page.locator('#product-results')).toHaveText('No hay productos que coincidan con tu búsqueda.')
  await expect(list).toHaveCount(0)
  await page.getByRole('button', { name: 'Mostrar todos los productos' }).click()
  await search.fill('TaLk S')
  await expect(list.getByRole('listitem')).toHaveCount(1)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: firstProductLink })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(`/products/${firstProduct.id}`)
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page.getByText(firstProduct.id, { exact: true })).toBeVisible()
  expect(requests).toEqual([{ url: `${apiBase}/api/product`, method: 'GET' }])
})

test('catalogue: accessible loading then empty response', async ({ page }) => {
  await mockCatalogue(page)
  let release
  const gate = new Promise(resolve => { release = resolve })
  await page.route(`${apiBase}/api/product`, async route => {
    await gate
    await route.fulfill({ json: [] })
  })
  await page.goto('/')
  await expect(page.locator('#product-results')).toHaveText('Cargando productos…')
  await expect(page.getByRole('link', { name: 'ITX Mobile, inicio' })).toBeVisible()
  await expect(page.getByLabel('Carrito: 0 artículos')).toBeVisible()
  await expect(page.getByRole('list', { name: 'Catálogo de productos' })).toHaveCount(0)
  release()
  await expect(page.locator('#product-results')).toHaveText('No hay productos disponibles en este momento.')
  await expect(page.getByRole('searchbox')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('catalogue: safe HTTP error and deliberate retry', async ({ page }) => {
  await mockCatalogue(page)
  let attempts = 0
  await page.route(`${apiBase}/api/product`, route => {
    attempts += 1
    return attempts === 1
      ? route.fulfill({ status: 500, body: 'internal secret trace' })
      : route.fulfill({ json: catalogue })
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('No hemos podido cargar los productos')
  await expect(page.getByText('internal secret trace')).toHaveCount(0)
  expect(attempts).toBe(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(page.getByRole('list', { name: 'Catálogo de productos' }).getByRole('listitem')).toHaveCount(catalogue.length)
  expect(attempts).toBe(2)
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('catalogue: missing photo, failed photo and actual empty prices stay visible', async ({ page }) => {
  // Deliberately modified image fields simulate faults; prices remain from M01.
  const emptyPriceProducts = catalogue.filter(product => product.price === '').slice(0, 2)
  const products = [{ ...emptyPriceProducts[0], imgUrl: null }, emptyPriceProducts[1]]
  await mockCatalogue(page, products)
  await page.route(products[1].imgUrl, route => route.abort())
  await page.goto('/')
  await expect(page.getByText('Precio no disponible', { exact: true })).toHaveCount(2)
  await expect(page.getByText('Imagen no disponible', { exact: true })).toHaveCount(2)
  await expect(page.getByRole('img', { name: /^Imagen no disponible:/ })).toHaveCount(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
