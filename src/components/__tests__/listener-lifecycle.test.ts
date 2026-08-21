import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

function read(relativePath: string) {
	return readFileSync(resolve(__dirname, '../../', relativePath), 'utf-8');
}

describe('client listener lifecycle guards', () => {
	it('header script uses AbortController-based cleanup across page loads', () => {
		const source = read('components/Header.astro');
		expect(source).toContain('new AbortController()');
		expect(source).toContain('state.controller?.abort()');
		expect(source).toContain("event.key === 'Escape'");
		expect(source).toContain("themeQuery.addEventListener('change'");
		expect(source).toContain('__themeStorageFallback');
		expect(source).toContain('fallback.preference = next');
		expect(source).toContain('<Search />');
		expect(source).toContain("document.addEventListener('astro:before-swap'");
	});

	it('runtime interaction probes target the current mobile menu control', () => {
		for (const path of [
			'scripts/a11y-runtime-audit.mjs',
			'scripts/test-runtime-errors.mjs',
			'src/e2e/helpers.ts',
		]) {
			const source = readFileSync(resolve(path), 'utf-8');
			expect(source).toContain('.site-header__menu');
			expect(source).not.toContain('.header__toggle');
		}
	});

	it('footer carries no duplicate theme controller', () => {
		const source = read('components/Footer.astro');
		expect(source).not.toContain('theme-toggle');
		expect(source).not.toContain('<script>');
	});

	it('ambient motion retains an in-memory preference when storage is unavailable', () => {
		const source = read('components/AmbientMotionControl.astro');
		expect(source).toContain('__ambientMotionFallback');
		expect(source).toContain('fallback.preference = next');
	});

	it('gallery controls clean up fullscreen and click listeners per navigation', () => {
		const source = read('pages/gallery.astro');
		expect(source).toContain('new AbortController()');
		expect(source).toContain('state.controller?.abort()');
		expect(source).toContain("document.addEventListener('fullscreenchange'");
	});

	it('search dialog listeners are rebound through AbortController cleanup', () => {
		const source = read('components/Search.astro');
		expect(source).toContain('new AbortController()');
		expect(source).toContain('state.controller.abort()');
		expect(source).toContain("document.addEventListener('astro:before-swap'");
	});

	it('index filters use singleton page-load binding and AbortController cleanup', () => {
		const source = read('components/home/IndexFilters.astro');
		expect(source).toContain('new AbortController()');
		expect(source).toContain('state.controller?.abort()');
		expect(source).toContain('pageLoadBound');
		expect(source).toContain("document.addEventListener('astro:before-swap'");
	});

	it('flip card script uses AbortController-based cleanup across page loads', () => {
		const source = read('components/ProjectCard.astro');
		expect(source).toContain('new AbortController()');
		expect(source).toContain('state.controller?.abort()');
		expect(source).toContain('pageLoadBound');
		expect(source).toContain("document.addEventListener('astro:before-swap'");
	});

	it('back-to-top button uses AbortController-based cleanup', () => {
		const source = read('components/BackToTop.astro');
		expect(source).toContain('new AbortController()');
		expect(source).toContain('{ signal }');
		expect(source).toContain("document.addEventListener('astro:before-swap'");
	});

	it('table of contents uses AbortController-based cleanup', () => {
		const source = read('components/TableOfContents.astro');
		expect(source).toContain('new AbortController()');
		expect(source).toContain('{ signal }');
		expect(source).toContain("document.addEventListener('astro:before-swap'");
	});

	it('sketch loader keeps a single resize handler and removes it on teardown', () => {
		const source = read('components/sketches/sketch-loader.ts');
		expect(source).toContain('let resizeHandler');
		expect(source).toContain("window.addEventListener('resize', resizeHandler)");
		expect(source).toContain("window.removeEventListener('resize', resizeHandler)");
	});
});
