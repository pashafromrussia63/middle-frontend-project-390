// tests/smoke.spec.ts
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

  const h1Text = await page.textContent('h1');
  expect(h1Text?.trim()).not.toBe('');
});