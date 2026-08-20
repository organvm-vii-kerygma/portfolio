import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { canonicalBase, siteConfig } from '../../../site.config.mjs';
import { projectCatalog } from '../project-catalog';
import vitals from '../vitals.json';

function walk(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = resolve(directory, entry.name);
		return entry.isDirectory() ? walk(path) : [path];
	});
}

describe('Living Evidence Field contracts', () => {
	it('uses the current Pages origin without activating the staged custom domain', () => {
		expect(canonicalBase).toBe('https://organvm-vii-kerygma.github.io/portfolio/');
		expect(siteConfig.origin).not.toContain('4444j99.dev');
	});

	it('forbids the failed legacy portfolio host outside the historical P07 fixture', () => {
		const failedLegacyHost = ['https://organvm', '.github.io/portfolio'].join('');
		const files = walk(resolve('.')).filter(
			(path) =>
				!path.includes('/node_modules/') &&
				!path.includes('/.git/') &&
				!path.includes('/dist/') &&
				!path.endsWith('.pdf') &&
				!path.endsWith('src/data/psp-p07-public-surface-contract.json'),
		);
		const offenders = files.filter((path) => {
			try {
				return readFileSync(path, 'utf8').includes(failedLegacyHost);
			} catch {
				return false;
			}
		});
		expect(offenders).toEqual([]);
	});

	it('catalogs exactly the existing project routes plus Limen from one source', () => {
		expect(projectCatalog).toHaveLength(24);
		expect(new Set(projectCatalog.map((project) => project.slug)).size).toBe(projectCatalog.length);
		for (const project of projectCatalog) {
			expect(project.route).toBe(`/projects/${project.slug}/`);
			expect(existsSync(resolve(`src/pages/projects/${project.slug}.astro`))).toBe(true);
		}
	});

	it('uses precise CI adoption semantics', () => {
		expect(vitals.substance).toHaveProperty('ci_workflow_count');
		expect(vitals.substance).toHaveProperty('repos_with_ci');
		expect(vitals.substance).toHaveProperty('ci_adoption_pct');
		expect(vitals.substance).not.toHaveProperty('ci_passing');
		expect(vitals.substance).not.toHaveProperty('ci_coverage_pct');
	});

	it('declares one canonical public contact', () => {
		expect(siteConfig.contact.email).toBe('padavano.anthony@gmail.com');
	});
});
