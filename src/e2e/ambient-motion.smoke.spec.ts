import { expect, test } from '@playwright/test';

test('ambient motion cycles when browser storage is unavailable', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			configurable: true,
			get() {
				throw new DOMException('Storage denied', 'SecurityError');
			},
		});
	});
	await page.goto('/portfolio/', { waitUntil: 'networkidle' });
	const control = page.locator('[data-ambient-motion-control]').first();
	await expect(control).toHaveAttribute('aria-label', /Ambient motion: system/);
	await control.click();
	await expect(control).toHaveAttribute('aria-label', /Ambient motion: paused/);
	await control.click();
	await expect(control).toHaveAttribute('aria-label', /Ambient motion: running/);
	await control.click();
	await expect(control).toHaveAttribute('aria-label', /Ambient motion: system/);
});

test('proof rail is static without JavaScript under reduced motion', async ({
	browser,
}, testInfo) => {
	const context = await browser.newContext({
		baseURL: testInfo.project.use.baseURL as string,
		javaScriptEnabled: false,
		reducedMotion: 'reduce',
	});
	const page = await context.newPage();
	await page.goto('/portfolio/', { waitUntil: 'networkidle' });
	const animationName = await page
		.locator('.laurea__proof-rail i')
		.first()
		.evaluate((element) => getComputedStyle(element).animationName);
	expect(animationName).toBe('none');
	await context.close();
});
