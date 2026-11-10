import { expect, test } from '@playwright/test'
import { apiBase, mockCatalogue, productDetails } from './fixtures.js'

const [first, , single] = productDetails

test('confirmation: native modal contains keyboard focus, restores Add focus, and cleans scrolling after continue', async ({ page }) => {
  await mockCatalogue(page)
  let posts = 0
  await page.route(`${apiBase}/api/cart`, route => {
    posts += 1
    return route.fulfill({ json: { count: 7 } })
  })
  await page.goto(`/products/${first.id}`)
  await page.getByRole('radio', { name: '32 GB' }).check()
  const add = page.getByRole('button', { name: 'Añadir', exact: true })
  await add.click()
  const dialog = page.getByRole('dialog', { name: 'Producto añadido.' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAccessibleDescription('Tu selección se ha añadido correctamente.')
  await expect(dialog.getByRole('heading', { name: first.model })).toBeVisible()
  await expect(dialog.locator('dd')).toHaveText(['Black', '32 GB'])
  await expect(dialog.locator('strong')).toHaveText('7')
  await expect(page.getByRole('status').filter({ hasText: 'Producto añadido' })).toHaveCount(0)
  const close = dialog.getByRole('button', { name: 'Cerrar confirmación' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Cerrar', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  // showModal's top layer makes the underlying document inert.
  await page.locator('header a').first().evaluate(element => element.focus())
  await expect(close).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
  await dialog.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)))
  const box = await dialog.boundingBox()
  const { width, height } = page.viewportSize()
  if (width < 768) {
    expect(box.width).toBeCloseTo(width, 0)
    expect(box.y + box.height).toBeCloseTo(height, 0)
    expect(await dialog.evaluate(element => getComputedStyle(element).animationName)).toMatch(/sheet-in/)
  } else {
    expect(box.x + box.width).toBeCloseTo(width, 0)
    expect(box.height).toBeCloseTo(height, 0)
    expect(await dialog.evaluate(element => getComputedStyle(element).animationName)).toMatch(/drawer-in/)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(add).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  await add.click()
  await dialog.getByRole('link', { name: 'Seguir comprando' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page.getByLabel('Carrito: 7 artículos', { exact: true })).toBeVisible()
  await expect(dialog).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('searchbox')).toBeFocused()
  expect(posts).toBe(2)
})

test('confirmation: closing, repeated rapid additions, reduced motion and external navigation clean up correctly', async ({ page }) => {
  await mockCatalogue(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let posts = 0
  await page.route(`${apiBase}/api/cart`, route => {
    posts += 1
    return route.fulfill({ json: { count: 1 } })
  })
  await page.goto('/')
  await page.getByRole('link', { name: `Ver detalle de ${single.brand} ${single.model}`, exact: true }).click()
  const add = page.getByRole('button', { name: 'Añadir', exact: true })
  for (let index = 0; index < 2; index += 1) {
    await add.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('strong')).toHaveText('1')
    expect(await dialog.evaluate(element => getComputedStyle(element).animationName)).toBe('none')
    await dialog.getByRole('button', { name: 'Cerrar confirmación' }).click()
    await expect(add).toBeFocused()
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  }
  await add.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  expect(posts).toBe(3)
})

test('images: pending, failed and missing sources are distinct, loaded low-resolution photos retain proportions', async ({ page }) => {
  const products = [first, productDetails[1], { ...single, imgUrl: '' }]
  await mockCatalogue(page, products)
  let release
  const gate = new Promise(resolve => { release = resolve })
  await page.route(first.imgUrl, async route => {
    await gate
    await route.abort()
  })
  // Explicit synthetic 80x120 image to check the enlargement policy, not a product asset.
  await page.route(productDetails[1].imgUrl, route => route.fulfill({ contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="120"><rect width="80" height="120" fill="#ccc"/></svg>' }))
  await page.goto('/')
  const cards = page.getByRole('list', { name: 'Catálogo de productos' }).getByRole('link')
  await expect(cards.nth(0).getByText('Cargando imagen…')).toBeVisible()
  await expect(cards.nth(2).getByRole('img')).toHaveAccessibleName(`Imagen no disponible: ${single.brand} ${single.model}`)
  await cards.nth(1).scrollIntoViewIfNeeded()
  await expect(cards.nth(1).getByText('Cargando imagen…')).toHaveCount(0)
  const photo = await cards.nth(1).getByRole('img').boundingBox()
  expect(photo.width).toBeLessThanOrEqual(120)
  expect(photo.height).toBeLessThanOrEqual(180)
  release()
  await cards.nth(0).scrollIntoViewIfNeeded()
  await expect(cards.nth(0).getByText('Imagen no disponible', { exact: true })).toBeVisible()
  await expect(cards.nth(0).getByText('Cargando imagen…')).toHaveCount(0)
})
