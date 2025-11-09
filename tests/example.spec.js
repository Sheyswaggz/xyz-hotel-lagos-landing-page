const { test, expect } = require('@playwright/test');

test.describe('XYZ Hotel Landing Page', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await expect(page).toHaveTitle(/XYZ Hotel Lagos/i);
  });

  test('should have main navigation elements', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have hero section', async ({ page }) => {
    await page.goto('http://localhost:8080');
    const hero = page.locator('[role="banner"], header, .hero');
    await expect(hero.first()).toBeVisible();
  });
});