import { expect, test } from '@playwright/test'

test('shell SPA: navegación, entrada directa, recarga y fallback', async ({ page }) => {
  const apiRequests = []
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.route('**/api/**', route => {
    apiRequests.push(route.request().url())
    return route.abort()
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Productos', level: 1 })).toBeVisible()
  await expect(page.getByLabel('Carrito: 0 artículos')).toBeVisible()
  await page.evaluate(() => { document.documentElement.dataset.navigationMarker = 'same-document' })

  await page.getByRole('link', { name: 'Ver detalle de ejemplo' }).click()
  await expect(page).toHaveURL('/products/ejemplo')
  await expect(page.getByRole('heading', { name: 'Detalle del producto', level: 1 })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-navigation-marker', 'same-document')
  await expect(page.getByRole('main')).toBeFocused()

  await page.goBack()
  await expect(page).toHaveURL('/')
  await page.goForward()
  await expect(page).toHaveURL('/products/ejemplo')
  await page.getByRole('link', { name: 'Volver a productos' }).click()
  await expect(page).toHaveURL('/')

  await page.goto('/products/entrada-directa')
  await page.reload()
  await expect(page.getByText('entrada-directa', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'ITX Mobile, inicio' }).click()
  await expect(page).toHaveURL('/')

  await page.goto('/ruta-inexistente')
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('status')).toContainText('Página no encontrada')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(apiRequests).toEqual([])
  expect(pageErrors).toEqual([])
})
