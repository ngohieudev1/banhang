import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({
  page,
  serverURL = 'http://localhost:3001',
  user,
}: LoginOptions): Promise<void> {
  await page.goto(`${serverURL}/admin/login`)

  await page.locator('input[name="username"], input[name="email"], #field-email').first().fill(user.email)
  await page.locator('input[name="password"], #field-password').first().fill(user.password)
  const loginResponsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/api/users/login') && response.request().method() === 'POST',
    { timeout: 15_000 },
  )
  await page.click('button[type="submit"]')
  const loginResponse = await loginResponsePromise
  if (!loginResponse.ok()) {
    const body = await loginResponse.text().catch(() => '')
    throw new Error(`Admin login failed (${loginResponse.status()}): ${body.slice(0, 300)}`)
  }

  await page.waitForURL(new RegExp(`${serverURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/admin(?:/)?$`))
  await expect(page.locator('body')).not.toContainText('This page could not be found')
}
