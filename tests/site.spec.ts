import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const locales = [
  { id: 'pt-BR', path: '/', heading: /Inteligência.*artificial.*Impacto real/, operations: 'Operação', knowledge: 'Conhecimento', service: 'Atendimento', scenario: 'Do trabalho manual ao fluxo inteligente.', document: 'documento', review: 'Revisão antes de executar', sources: 'fontes', order: 'pedido', navigation: 'Soluções', menu: 'Abrir menu', notFound: 'não foi construído', back: 'Voltar ao início' },
  { id: 'en', path: '/en/', heading: /Artificial.*intelligence.*Real impact/, operations: 'Operations', knowledge: 'Knowledge', service: 'Customer service', scenario: 'From manual work to intelligent workflows.', document: 'document', review: 'Review before execution', sources: 'sources', order: 'order', navigation: 'Solutions', menu: 'Open menu', notFound: 'been built yet', back: 'Back to home' },
];

for (const locale of locales) {
  test.describe(locale.id, () => {
    test('page renders with localized metadata, company details, and no overflow', async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(locale.path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(locale.heading);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.id);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://aliacode.com${locale.path}`);
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', 'https://aliacode.com/en/');
      await expect(page.locator('link[hreflang="pt-BR"]')).toHaveAttribute('href', 'https://aliacode.com/');
      await expect(page.locator('.footer-company')).toContainText('ALIACODE DESENVOLVIMENTO DE SOFTWARE LTDA');
      await expect(page.locator('.footer-company')).toContainText('58.056.597/0001-76');
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await page.locator('a[href^="#"]').evaluateAll(links => links.every(link => !!document.getElementById(link.getAttribute('href')!.slice(1))))).toBe(true);
      expect(await page.locator('a[href^="mailto:"], a[href*="wa.me"], form').count()).toBe(0);
      expect((await page.request.get('/logo-aliacode.png')).ok()).toBe(true);
      const prefix = `test-results/${testInfo.project.name}-${locale.id}`;
      await page.screenshot({ path: `${prefix}-full.png`, fullPage: true, animations: 'disabled' });
      await page.locator('.site-footer').screenshot({ path: `${prefix}-footer.png`, animations: 'disabled' });
      await page.goto(locale.path);
      await page.screenshot({ path: `${prefix}-hero.png`, animations: 'disabled' });
      expect(errors).toEqual([]);
    });

    test('interactive examples and FAQ use the selected language', async ({ page }) => {
      await page.goto(locale.path);
      await page.getByRole('button', { name: locale.operations, exact: false }).click();
      await expect(page.locator('#scenario-title')).toHaveText(locale.scenario);
      await expect(page.locator('#scenario-input')).toContainText(locale.document);
      await expect(page.locator('#scenario-tag')).toHaveText(locale.review);
      await page.getByRole('button', { name: locale.knowledge, exact: false }).click();
      await expect(page.locator('#scenario-output')).toContainText(locale.sources);
      await expect(page.locator('[aria-pressed="true"]')).toHaveCount(1);
      await page.getByRole('button', { name: locale.service, exact: false }).click();
      await expect(page.locator('#scenario-input')).toContainText(locale.order);
      await page.locator('summary').first().click();
      await expect(page.locator('details').first()).toHaveAttribute('open', '');
      await expect(page.locator('details').first().locator('p')).toBeVisible();
    });

    test('navigation reaches sections and mobile menu supports escape', async ({ page }, testInfo) => {
      await page.goto(locale.path);
      if (testInfo.project.name === 'mobile') {
        const menu = page.locator('.menu-toggle');
        await menu.click();
        await expect(menu).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('Escape');
        await expect(menu).toHaveAttribute('aria-expanded', 'false');
        await menu.click();
      }
      await page.getByRole('navigation').getByRole('link', { name: locale.navigation, exact: true }).click();
      await expect(page).toHaveURL(/#solucoes$/);
      if (testInfo.project.name === 'mobile') await expect(page.getByRole('button', {name:locale.menu})).toHaveAttribute('aria-expanded','false');
    });

    test('accessibility has no serious or critical issues', async ({ page }) => {
      await page.goto(locale.path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(results.violations.filter(v => ['serious','critical'].includes(v.impact || ''))).toEqual([]);
    });

    test('missing page returns 404 with a localized return link', async ({ page }) => {
      test.skip(locale.id === 'en' && !process.env.BASE_URL, 'Nearest-directory 404 routing is provided by Cloudflare Pages; verified against the deployment.');
      const response = await page.goto(`${locale.path}pagina-inexistente/`);
      expect(response?.status()).toBe(404);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.id);
      await expect(page.getByRole('heading',{level:1})).toContainText(locale.notFound);
      await page.getByRole('link',{name:locale.back, exact:true}).click();
      await expect(page.getByRole('heading',{level:1})).toHaveText(locale.heading);
    });
  });
}

test('language switch works both ways and preserves the current section', async ({ page }, testInfo) => {
  await page.goto('/#possibilidades');
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/#possibilidades$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', { name:'English', exact:true })).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: 'Português (Brasil)', exact: true }).click();
  await expect(page).toHaveURL(/\.?(?:\/|:\d+\/)#possibilidades$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('link', { name:'Português (Brasil)', exact:true })).toHaveAttribute('aria-current', 'page');
  if (testInfo.project.name === 'mobile') {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto('/en/');
    await expect(page.getByRole('link', { name:'English', exact:true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('both languages and their links work with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL || process.env.BASE_URL || 'http://127.0.0.1:4321');
  await page.getByRole('link', { name:'English', exact:true }).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText(/Artificial.*intelligence.*Real impact/);
  await expect(page.locator('.footer-company')).toContainText('58.056.597/0001-76');
  await context.close();
});
