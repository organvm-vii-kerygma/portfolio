import { describe, expect, it } from 'vitest';
import { personas } from '../personas.json';
import { projectCatalog } from '../project-catalog';
import { buildSiteNavigation, flattenSiteNavigation } from '../site-navigation';

const base = '/portfolio/';
const groups = buildSiteNavigation(base);
const items = flattenSiteNavigation(groups);
const hrefs = new Set(items.flatMap((item) => (item.href ? [item.href] : [])));

describe('site navigation', () => {
	it('restores every public gateway removed by the homepage redesign', () => {
		for (const route of [
			'projects/',
			'resume/',
			'products/',
			'dashboard/',
			'roadmap/',
			'testimonials/',
			'essays/',
			'logos/',
			'pathos/',
			'gallery/',
			'directory/',
			'philosophy/',
			'architecture/',
			'impact/',
			'validation/',
			'omega/',
			'github-pages/',
			'about/',
			'community/',
			'consult/',
			'press/',
		]) {
			expect(hrefs, `missing ${route}`).toContain(`${base}${route}`);
		}
	});

	it('derives every project and role-fit résumé leaf from its canonical catalog', () => {
		for (const project of projectCatalog) {
			expect(hrefs).toContain(`${base}${project.route.replace(/^\//, '')}`);
		}
		for (const persona of personas) {
			expect(hrefs).toContain(`${base}resume/${persona.slug}/`);
		}
		expect(hrefs).toContain(`${base}resume/polymath/`);
	});

	it('keeps the global tree compact while retaining lateral project and résumé browsers', () => {
		expect(groups.map((group) => group.label)).toEqual([
			'Work',
			'Explore',
			'About',
			'Docs',
			'Connect',
		]);
		const nested = groups.flatMap((group) => group.items).filter((item) => item.children);
		expect(nested.map((item) => item.label)).toEqual(['Projects', 'Résumés', 'Writing']);
		expect(nested.find((item) => item.label === 'Projects')?.children).toHaveLength(
			projectCatalog.length + 1,
		);
	});
});
