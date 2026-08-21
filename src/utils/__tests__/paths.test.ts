import { describe, expect, it } from 'vitest';
import { canonicalBase } from '../paths';

describe('paths', () => {
	it('canonicalBase is a valid HTTPS URL', () => {
		expect(() => new URL(canonicalBase)).not.toThrow();
		expect(canonicalBase).toMatch(/^https:\/\//);
	});

	it('canonicalBase includes /portfolio path', () => {
		const url = new URL(canonicalBase);
		expect(url.pathname).toBe('/portfolio/');
	});

	it('canonicalBase has a stable trailing slash for URL resolution', () => {
		expect(canonicalBase.endsWith('/')).toBe(true);
	});

	it('module exports base as a string', async () => {
		const mod = await import('../paths');
		expect(typeof mod.base).toBe('string');
		expect(mod.base.endsWith('/')).toBe(true);
	});
});
