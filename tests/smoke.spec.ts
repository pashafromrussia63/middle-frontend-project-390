import { test, expect } from '@playwright/test';

test('Главная страница открывается без ошибок в консоли и показывает <h1>', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/');

  expect(errors).toHaveLength(0);

  const heading = page.locator('[data-testid="main-heading"]');
  await expect(heading).toBeVisible();
  
  const h1Text = await heading.textContent();
  expect(h1Text?.trim()).not.toBe('');
});