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
	if (!isMobile) {
		const sideout = projects.locator(':scope > .site-header__sideout');
		await expect(sideout).toHaveCSS('position', 'absolute');
		for (const width of [1021, 1100, 1200, 1280]) {
			await page.setViewportSize({ width, height: 900 });
			await expect(sideout).toHaveCSS('position', 'static');
			const box = await sideout.boundingBox();
			expect(box).not.toBeNull();
			if (box) {
				expect(box.x).toBeGreaterThanOrEqual(0);
				expect(box.x + box.width).toBeLessThanOrEqual(width);
			}
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
			).toBe(false);
		}
		await page.setViewportSize({ width: 1281, height: 900 });
		await expect(sideout).toHaveCSS('position', 'absolute');
		const lateralBox = await sideout.boundingBox();
		expect(lateralBox).not.toBeNull();
		if (lateralBox) {
			expect(lateralBox.x).toBeGreaterThanOrEqual(0);
			expect(lateralBox.x + lateralBox.width).toBeLessThanOrEqual(1281);
		}
		await page.setViewportSize({ width: 1440, height: 900 });
	}

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
	} else {
		await page.setViewportSize({ width: 1100, height: 360 });
		const explore = page.locator('details[data-nav-group]').nth(1);
		await explore.locator(':scope > summary').click();
		const panel = explore.locator(':scope > .site-header__panel');
		await expect(panel).toBeVisible();
		await expect(panel).toHaveCSS('overflow-y', 'auto');
		const panelBox = await panel.boundingBox();
		expect(panelBox).not.toBeNull();
		if (panelBox) expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(360);
		expect(await panel.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
			true,
		);
		const finalLink = panel.getByRole('link', { name: 'GitHub Pages' });
		await finalLink.focus();
		await expect(finalLink).toBeInViewport();
		await page.keyboard.press('Escape');
		await page.setViewportSize({ width: 1100, height: 900 });
		await workTrigger.click();
		await projectsTrigger.click();
		await expect(projects.locator(':scope > .site-header__sideout')).toHaveCSS(
			'position',
			'static',
		);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
		).toBe(false);
	}
});

test('search Escape preserves the navigation layer beneath the dialog', async ({ page }) => {
	await page.goto('', { waitUntil: 'networkidle' });
	const menu = page.locator('.site-header__menu');
	if (await menu.isVisible()) await menu.click();
	const work = page.locator('details[data-nav-group]').first();
	await work.locator(':scope > summary').click();
	await expect(work).toHaveJSProperty('open', true);
	const projects = work.locator('details[data-nav-submenu]').first();
	await projects.locator(':scope > summary').click();
	await expect(projects).toHaveJSProperty('open', true);
	const searchTrigger = page.locator('.search-trigger');
	await searchTrigger.click();
	await expect(page.locator('.search-dialog')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.locator('.search-dialog')).toBeHidden();
	await expect(work).toHaveJSProperty('open', true);
	await expect(projects).toHaveJSProperty('open', true);
	await expect(searchTrigger).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(projects).toHaveJSProperty('open', false);
	await expect(work).toHaveJSProperty('open', true);
	await page.keyboard.press('Escape');
	await expect(work).toHaveJSProperty('open', false);
});

test('header breakpoint cleanup preserves a governance modal scroll lock', async ({ page }) => {
	test.skip((page.viewportSize()?.width ?? 0) > 1020, 'mobile breakpoint transition only');
	await page.goto('for/openai/', { waitUntil: 'networkidle' });
	await page.locator('#view-trace-btn').click();
	await expect(page.locator('#gov-preview')).toBeVisible();
	await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
	await page.setViewportSize({ width: 1100, height: 844 });
	await expect(page.locator('#gov-preview')).toBeVisible();
	await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
	await page.locator('#close-gov-preview').click();
	await expect(page.locator('#gov-preview')).toBeHidden();
	await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
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
	await page.evaluate(() => {
		document.documentElement.style.scrollBehavior = 'auto';
		window.scrollTo(0, document.documentElement.scrollHeight);
	});
	await expect
		.poll(() =>
			page.evaluate(
				() =>
					Math.abs(window.scrollY - (document.documentElement.scrollHeight - window.innerHeight)) <=
					1,
			),
		)
		.toBe(true);
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
	await expect(bottom).toBeInViewport({ ratio: 1 });
	await expect(backToTop).toBeVisible();
	const buttonBox = await backToTop.boundingBox();
	expect(buttonBox).not.toBeNull();
	const reservedRight = await bottom.evaluate((element) =>
		Number.parseFloat(getComputedStyle(element).paddingRight),
	);
	if (buttonBox) {
		expect(reservedRight).toBeGreaterThanOrEqual(buttonBox.width + 8);
		const contentBoxes = await bottom.locator('p').evaluateAll((elements) =>
			elements.map((element) => {
				const box = element.getBoundingClientRect();
				return { x: box.x, y: box.y, width: box.width, height: box.height };
			}),
		);
		for (const contentBox of contentBoxes) {
			const overlaps = !(
				buttonBox.x + buttonBox.width <= contentBox.x ||
				buttonBox.x >= contentBox.x + contentBox.width ||
				buttonBox.y + buttonBox.height <= contentBox.y ||
				buttonBox.y >= contentBox.y + contentBox.height
			);
			expect(overlaps).toBe(false);
		}
	}
});
