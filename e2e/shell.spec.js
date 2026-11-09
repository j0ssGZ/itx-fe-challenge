import { expect, test } from '@playwright/test'
import { apiBase, firstProduct, firstProductLink, mockCatalogue, productDetails } from './fixtures.js'

test('shell SPA: navegación, entrada directa, recarga y fallback', async ({ page }) => {
  const apiRequests = await mockCatalogue(page)
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Productos', level: 1 })).toBeVisible()
  await expect(page.getByLabel('Carrito: 0 artículos')).toBeVisible()
  await page.evaluate(() => { document.documentElement.dataset.navigationMarker = 'same-document' })

  await page.getByRole('link', { name: firstProductLink }).click()
  await expect(page).toHaveURL(`/products/${firstProduct.id}`)
  await expect(page.getByRole('heading', { name: firstProduct.model, level: 1 })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-navigation-marker', 'same-document')
  await expect(page.getByRole('main')).toBeFocused()

  await page.goBack()
  await expect(page).toHaveURL('/')
  await page.goForward()
  await expect(page).toHaveURL(`/products/${firstProduct.id}`)
  await page.getByRole('link', { name: 'Volver a productos' }).click()
  await expect(page).toHaveURL('/')

  await page.goto(`/products/${productDetails[1].id}`)
  await page.reload()
  await expect(page.getByRole('heading', { name: productDetails[1].model, level: 1 })).toBeVisible()
  await page.getByRole('link', { name: 'ITX Mobile, inicio' }).click()
  await expect(page).toHaveURL('/')

  await page.goto('/ruta-inexistente')
  await expect(page).toHaveURL('/')
  await expect(page.getByText('Página no encontrada. Te mostramos el inicio.')).toHaveAttribute('role', 'status')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(apiRequests).toEqual([
    { url: `${apiBase}/api/product`, method: 'GET' },
    { url: `${apiBase}/api/product/${firstProduct.id}`, method: 'GET' },
    { url: `${apiBase}/api/product/${productDetails[1].id}`, method: 'GET' },
  ])
  expect(pageErrors).toEqual([])
})
