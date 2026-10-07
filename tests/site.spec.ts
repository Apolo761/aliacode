import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page renders without errors, overflow or broken local links', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/AliaCode/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Inteligência.*artificial.*Impacto real/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.locator('a[href^="#"]').evaluateAll(links => links.every(link => !!document.getElementById(link.getAttribute('href')!.slice(1))))).toBe(true);
  expect(await page.locator('a[href^="mailto:"], a[href*="wa.me"], form').count()).toBe(0);
  expect((await page.request.get('/logo-aliacode.png')).ok()).toBe(true);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-full.png`, fullPage: true, animations: 'disabled' });
  expect(errors).toEqual([]);
});

test('interactive examples update the whole workflow and FAQ opens', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Operação', exact: false }).click();
  await expect(page.locator('#scenario-title')).toHaveText('Do trabalho manual ao fluxo inteligente.');
  await expect(page.locator('#scenario-input')).toContainText('documento');
  await expect(page.locator('#scenario-tag')).toHaveText('Revisão antes de executar');
  await page.getByRole('button', { name: 'Conhecimento', exact: false }).click();
  await expect(page.locator('#scenario-output')).toContainText('fontes');
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Atendimento', exact: false }).click();
  await expect(page.locator('#scenario-input')).toContainText('pedido');
  await page.locator('summary').first().click();
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  await expect(page.locator('details').first().locator('p')).toBeVisible();
});

test('navigation reaches sections and mobile menu supports escape', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    const menu = page.getByRole('button', { name: 'Abrir menu' });
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
  }
  await page.getByRole('navigation').getByRole('link', { name: 'Soluções', exact: true }).click();
  await expect(page).toHaveURL(/#solucoes$/);
  if (testInfo.project.name === 'mobile') await expect(page.getByRole('button', {name:'Abrir menu'})).toHaveAttribute('aria-expanded','false');
});

test('accessibility has no serious or critical issues', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(results.violations.filter(v => ['serious','critical'].includes(v.impact || ''))).toEqual([]);
});

test('missing page has a useful 404 and a working return link', async ({ page }) => {
  const response = await page.goto('/pagina-inexistente/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading',{level:1})).toContainText('não foi construído');
  await page.getByRole('link',{name:'Voltar ao início'}).click();
  await expect(page).toHaveTitle(/Impacto real/);
});
