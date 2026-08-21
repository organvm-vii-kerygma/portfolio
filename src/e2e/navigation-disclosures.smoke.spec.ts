import { expect, test } from '@playwright/test';
import { projectCatalog } from '../data/project-catalog';

test('grouped navigation exposes the complete project browser at every breakpoint', async ({
	page,
}) => {
	await page.goto('', { waitUntil: 'networkidle' });
	const isMobile = (page.viewportSize()?.width ?? 0) <= 1020;
	const menu = page.locator('.site-header__menu');
	if (isMobile) {
		await menu.click();
		await expect(menu).toHaveAttribute('aria-expanded', 'true');
		await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
		await menu.focus();
		await page.keyboard.press('Shift+Tab');
		await expect(page.locator('.theme-toggle')).toBeFocused();
	}

	const work = page.locator('details[data-nav-group]').first();
	const workTrigger = work.locator(':scope > summary');
	await workTrigger.click();
	await expect(work).toHaveJSProperty('open', true);

	const projects = work.locator('details[data-nav-submenu]').first();
	const projectsTrigger = projects.locator(':scope > summary');
	await projectsTrigger.click();
	await expect(projects).toHaveJSProperty('open', true);
	await expect(projects.locator(':scope > .site-header__sideout a')).toHaveCount(
		projectCatalog.length + 1,
	);
	await expect(projects.getByRole('link', { name: /Limen META-ORGANVM/i })).toBeVisible();

	if (isMobile) {
		const hasHorizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > window.innerWidth,
		);
		expect(hasHorizontalOverflow).toBe(false);
	}

	await page.keyboard.press('Escape');
	await expect(projects).toHaveJSProperty('open', false);
	await expect(projectsTrigger).toBeFocused();
	await expect(work).toHaveJSProperty('open', true);

	await page.keyboard.press('Escape');
	await expect(work).toHaveJSProperty('open', false);
	await expect(workTrigger).toBeFocused();
	if (isMobile) {
		await page.keyboard.press('Escape');
		await expect(menu).toHaveAttribute('aria-expanded', 'false');
		await expect(menu).toBeFocused();
		await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
		await menu.click();
		await page.locator('main').dispatchEvent('pointerdown');
		await expect(menu).toHaveAttribute('aria-expanded', 'false');
		await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
	}
});

test('collection detail pages retain their parent navigation context', async ({ page }) => {
	await page.goto('logos/aesthetic-nervous-system/', { waitUntil: 'networkidle' });
	const menu = page.locator('.site-header__menu');
	if (await menu.isVisible()) await menu.click();
	const explore = page.locator('details[data-nav-group]').nth(1);
	await expect(explore.locator(':scope > summary')).toHaveClass(/is-active/);
	await explore.locator(':scope > summary').click();
	await expect(explore.locator('details[data-nav-submenu] > summary')).toHaveClass(/is-active/);
});

test('footer has an opaque hierarchy and reserves the back-to-top footprint', async ({ page }) => {
	await page.goto('', { waitUntil: 'networkidle' });
	await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
	const footer = page.locator('.site-footer');
	await expect(footer).toBeVisible();
	const footerAlpha = await footer.evaluate((element) => {
		const color = getComputedStyle(element).backgroundColor;
		const channels = color.match(/[\d.]+/g)?.map(Number) ?? [];
		return channels.length === 4 ? channels[3] : 1;
	});
	expect(footerAlpha).toBe(1);

	const bottom = page.locator('.site-footer__bottom');
	const backToTop = page.locator('.btt');
	if (await backToTop.isVisible()) {
		const [bottomBox, buttonBox] = await Promise.all([
			bottom.boundingBox(),
			backToTop.boundingBox(),
		]);
		expect(bottomBox).not.toBeNull();
		expect(buttonBox).not.toBeNull();
		if (bottomBox && buttonBox) {
			const overlaps = !(
				buttonBox.x + buttonBox.width <= bottomBox.x ||
				buttonBox.x >= bottomBox.x + bottomBox.width ||
				buttonBox.y + buttonBox.height <= bottomBox.y ||
				buttonBox.y >= bottomBox.y + bottomBox.height
			);
			expect(overlaps).toBe(false);
		}
	}
});
