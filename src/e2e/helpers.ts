import { expect, type Page } from '@playwright/test';

export const TOP_LEVEL_ROUTES = [
	'',
	'about',
	'community',
	'consult',
	'dashboard',
	'essays',
	'gallery',
	'omega',
	'products',
	'resume',
	'architecture',
	'github-pages',
	'philosophy',
];

export const TRANSITION_STRESS_ROUTES = [
	'projects/recursive-engine',
	'projects/ai-conductor',
	'projects/distribution-strategy',
	'projects/org-architecture',
];

export async function replayAstroPageLoad(page: Page, cycles = 3) {
	await page.evaluate((count) => {
		for (let i = 0; i < count; i += 1) {
			document.dispatchEvent(new Event('astro:page-load'));
		}
	}, cycles);
}

export async function assertMenuSingleFire(page: Page) {
	const toggle = page.locator('.site-header__menu').first();
	if ((await toggle.count()) === 0 || !(await toggle.isVisible())) return;

	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');
	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
}

export async function assertSearchSingleFire(page: Page) {
	const trigger = page.locator('.search-trigger').first();
	const dialog = page.locator('.search-dialog').first();
	if ((await trigger.count()) === 0 || !(await trigger.isVisible()) || (await dialog.count()) === 0)
		return;

	await trigger.click();
	await expect(dialog).toBeVisible();

	const close = page.locator('.search-dialog__close').first();
	if ((await close.count()) > 0 && (await close.isVisible())) {
		await close.click();
	} else {
		await page.keyboard.press('Escape');
	}

	await expect(dialog).not.toBeVisible();
}

export async function assertThemeSingleFire(page: Page) {
	const toggle = page.locator('.theme-toggle').first();
	if ((await toggle.count()) === 0 || !(await toggle.isVisible())) return;

	const before = await page.evaluate(() => ({
		pref: localStorage.getItem('theme-preference'),
		theme: document.documentElement.dataset.theme ?? null,
	}));

	await toggle.click();
	await page.waitForTimeout(120);

	const after = await page.evaluate(() => ({
		pref: localStorage.getItem('theme-preference'),
		theme: document.documentElement.dataset.theme ?? null,
		themeColor:
			document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content ?? null,
	}));

	expect(after.pref !== before.pref || after.theme !== before.theme).toBe(true);
	expect(after.themeColor).toBe(after.theme === 'light' ? '#f5f5f0' : '#0a0a0b');
}

export async function assertFullscreenSingleFire(page: Page) {
	const button = page.locator('.sketch-ctrl--fullscreen').first();
	if ((await button.count()) === 0 || !(await button.isVisible())) return;

	const fullscreenEnabled = await page.evaluate(() => document.fullscreenEnabled);
	if (!fullscreenEnabled) return;

	await button.click();
	await expect
		.poll(async () => page.evaluate(() => Boolean(document.fullscreenElement)), { timeout: 3000 })
		.toBe(true);

	await page.keyboard.press('Escape');
	// In some CI environments, Escape might not fire correctly if focus is lost.
	// We'll also try explicit exit as a fallback to ensure the test can proceed.
	await page.evaluate(
		() => document.fullscreenElement && document.exitFullscreen().catch(() => {}),
	);

	await expect
		.poll(async () => page.evaluate(() => Boolean(document.fullscreenElement)), { timeout: 5000 })
		.toBe(false);
}
