import { expect, test } from '@playwright/test'
import { apiBase, mockCatalogue, productDetails } from './fixtures.js'

const [first, second, single] = productDetails
const header = (page, count) => page.getByLabel(`Carrito: ${count} artículos`, { exact: true })

test('cart: keyboard options, exact payload, response authority across routes and reload', async ({ page }) => {
  await mockCatalogue(page)
  const bodies = []
  const counts = [5, 1, 1]
  await page.route(`${apiBase}/api/cart`, async route => {
    expect(route.request().method()).toBe('POST')
    bodies.push(route.request().postDataJSON())
    await route.fulfill({ json: { count: counts[bodies.length - 1] } })
  })
  await page.goto(`/products/${first.id}`)
  const add = page.getByRole('button', { name: 'Añadir', exact: true })
  const color = page.getByRole('group', { name: 'Color', exact: true })
  const storage = page.getByRole('group', { name: 'Almacenamiento', exact: true })
  await expect(color.getByRole('radio', { name: 'Black' })).toBeChecked()
  await expect(storage.getByRole('radio', { checked: true })).toHaveCount(0)
  await expect(add).toBeDisabled()
  await storage.getByRole('radio', { name: '16 GB' }).focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowRight')
  await expect(storage.getByRole('radio', { name: '32 GB' })).toBeChecked()
  await page.keyboard.press('Tab')
  await expect(add).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(header(page, 5)).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Producto añadido' })).toBeVisible()
  expect(bodies[0]).toEqual({ id: first.id, colorCode: 1000, storageCode: 2001 })
  const descriptionBox = await page.getByRole('region', { name: 'Especificaciones' }).boundingBox()
  const actionsBox = await page.getByRole('region', { name: 'Opciones del producto' }).boundingBox()
  expect(actionsBox.y).toBeGreaterThanOrEqual(descriptionBox.y + descriptionBox.height)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'Volver a productos' }).click()
  await expect(header(page, 5)).toBeVisible()
  await page.reload()
  await expect(header(page, 5)).toBeVisible()
  await page.goto(`/products/${single.id}`)
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(2)
  for (let i = 0; i < 2; i += 1) {
    await add.click()
    await expect(add).toBeEnabled()
    await expect(header(page, 1)).toBeVisible()
  }
  expect(bodies).toHaveLength(3)
  await page.reload()
  await expect(header(page, 1)).toBeVisible()
})

test('cart: double-click and repeated submit produce one pending request', async ({ page }) => {
  await mockCatalogue(page)
  let release
  const gate = new Promise(resolve => { release = resolve })
  let requests = 0
  await page.route(`${apiBase}/api/cart`, async route => {
    requests += 1
    await gate
    await route.fulfill({ json: { count: 4 } })
  })
  await page.goto(`/products/${single.id}`)
  await page.getByRole('button', { name: 'Añadir', exact: true }).dblclick()
  await expect(page.getByRole('button', { name: 'Añadiendo…' })).toBeDisabled()
  for (const radio of await page.getByRole('radio').all()) await expect(radio).toBeDisabled()
  await page.getByRole('button', { name: 'Añadiendo…' }).evaluate(button => {
    button.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
  await expect(header(page, 0)).toBeVisible()
  expect(requests).toBe(1)
  release()
  await expect(header(page, 4)).toBeVisible()
  expect(requests).toBe(1)
})

test('cart: failed POST preserves choices and confirmed count; product switch resets selection', async ({ page }) => {
  await mockCatalogue(page)
  await page.addInitScript(() => localStorage.setItem('itx:cart-count:v1', '{"version":1,"count":7}'))
  let requests = 0
  await page.route(`${apiBase}/api/cart`, async route => {
    requests += 1
    await route.fulfill({ status: 500, body: 'private server diagnostic' })
  })
  await page.goto(`/products/${first.id}`)
  await page.getByRole('radio', { name: '32 GB' }).check()
  await page.getByRole('button', { name: 'Añadir', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('No hemos podido confirmar la operación')
  await expect(header(page, 7)).toBeVisible()
  await expect(page.getByRole('radio', { name: '32 GB' })).toBeChecked()
  await expect(page.getByRole('button', { name: 'Añadir', exact: true })).toBeEnabled()
  expect(requests).toBe(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'Volver a productos' }).click()
  await page.getByRole('link', { name: `Ver detalle de ${second.brand} ${second.model}`, exact: true }).click()
  await expect(page.getByRole('group', { name: 'Color', exact: true }).getByRole('radio', { checked: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Añadir', exact: true })).toBeDisabled()
  await expect(header(page, 7)).toBeVisible()
})

test('cart: invalid options cannot submit, corrupted count safely defaults to zero', async ({ page }) => {
  const requests = await mockCatalogue(page)
  await page.addInitScript(() => localStorage.setItem('itx:cart-count:v1', '{broken'))
  await page.route(`${apiBase}/api/product/${first.id}`, route => route.fulfill({ json: {
    ...first, options: { colors: [{ code: '1000', name: 'Black' }], storages: [] },
  } }))
  await page.goto(`/products/${first.id}`)
  await expect(header(page, 0)).toBeVisible()
  await expect(page.getByText('No hay opciones válidas suficientes para añadir este producto.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Añadir', exact: true })).toBeDisabled()
  await expect(page.getByRole('radio')).toHaveCount(0)
  expect(requests.filter(request => request.method === 'POST')).toHaveLength(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
