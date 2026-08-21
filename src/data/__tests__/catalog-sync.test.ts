import { describe, expect, it } from 'vitest';
import { organGroups } from '../organ-groups';
import { projectCatalog } from '../project-catalog';
import { projectIndex } from '../project-index';

const catalogSlugs = new Set(projectCatalog.map((p) => p.slug));
const indexSlugs = new Set(projectIndex.map((p) => p.slug));
const organGroupSlugs = new Set(organGroups.flatMap((g) => g.projects.map((p) => p.slug)));

describe('cross-catalog sync', () => {
	it('every project-index slug exists in project-catalog', () => {
		for (const slug of indexSlugs) {
			expect(
				catalogSlugs.has(slug),
				`project-index slug "${slug}" missing from project-catalog`,
			).toBe(true);
		}
	});

	it('every organ-groups slug exists in project-catalog', () => {
		for (const slug of organGroupSlugs) {
			expect(
				catalogSlugs.has(slug),
				`organ-groups slug "${slug}" missing from project-catalog`,
			).toBe(true);
		}
	});

	it('every organ-groups slug exists in project-index', () => {
		for (const slug of organGroupSlugs) {
			expect(indexSlugs.has(slug), `organ-groups slug "${slug}" missing from project-index`).toBe(
				true,
			);
		}
	});

	it('project-index is derived from the complete canonical catalog', () => {
		expect([...indexSlugs].sort()).toEqual([...catalogSlugs].sort());
	});
});
