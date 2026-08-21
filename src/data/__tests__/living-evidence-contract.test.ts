import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { canonicalBase, siteConfig } from '../../../site.config.mjs';
import { projectCatalog } from '../project-catalog';
import vitals from '../vitals.json';

function walk(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = resolve(directory, entry.name);
		if (
			entry.isDirectory() &&
			[
				'node_modules',
				'.git',
				'dist',
				'.quality',
				'.a11y',
				'coverage',
				'playwright-report',
				'test-results',
			].includes(entry.name)
		) {
			return [];
		}
		return entry.isDirectory() ? walk(path) : [path];
	});
}

describe('Living Evidence Field contracts', () => {
	it('uses the current Pages origin without activating the staged custom domain', () => {
		expect(canonicalBase).toBe('https://organvm-vii-kerygma.github.io/portfolio/');
		expect(siteConfig.origin).not.toContain('4444j99.dev');
		expect(readFileSync(resolve('src/pages/robots.txt.ts'), 'utf8')).toContain(
			"siteUrl('sitemap-index.xml')",
		);
		expect(readFileSync(resolve('workers/consult-api/wrangler.jsonc'), 'utf8')).toContain(
			'https://organvm-vii-kerygma.github.io',
		);
	});

	it('forbids the failed legacy portfolio host outside the historical P07 fixture', () => {
		const failedLegacyHost = ['https://organvm', '.github.io/portfolio'].join('');
		const files = walk(resolve('.')).filter(
			(path) =>
				!path.endsWith('.pdf') && !path.endsWith('src/data/psp-p07-public-surface-contract.json'),
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

	it('classifies audience relevance instead of treating every project as relevant to both doors', () => {
		const clientSlugs = projectCatalog
			.filter((project) => project.audienceRelevance.includes('client'))
			.map((project) => project.slug);
		const recruiterSlugs = projectCatalog
			.filter((project) => project.audienceRelevance.includes('recruiter'))
			.map((project) => project.slug);
		expect(clientSlugs.length).toBeGreaterThan(0);
		expect(clientSlugs.length).toBeLessThan(projectCatalog.length);
		expect(recruiterSlugs.length).toBeLessThan(projectCatalog.length);
		expect(clientSlugs).not.toEqual(recruiterSlugs);
		expect(projectCatalog.every((project) => project.audienceRelevance.length > 0)).toBe(true);
	});

	it('serializes filter values without splitting multi-word tags', () => {
		const source = readFileSync(resolve('src/pages/projects/index.astro'), 'utf8');
		expect(source).toContain('data-filters={JSON.stringify');
		expect(source).toContain("JSON.parse(card.dataset.filters ?? '[]')");
	});

	it('uses precise CI adoption semantics', () => {
		expect(vitals.substance).toHaveProperty('ci_workflow_count');
		expect(vitals.substance).toHaveProperty('repos_with_ci');
		expect(vitals.substance).toHaveProperty('ci_adoption_pct');
		expect(vitals.substance).not.toHaveProperty('ci_passing');
		expect(vitals.substance).not.toHaveProperty('ci_coverage_pct');
		const generator = readFileSync(resolve('scripts/generate-system-data.py'), 'utf8');
		expect(generator).toContain('count_repositories_with_ci(registry)');
		expect(generator).not.toContain('"repos_with_ci": ci_workflows');
		const sync = readFileSync(resolve('scripts/sync-trust-metrics.mjs'), 'utf8');
		expect(sync).toContain('const reposWithCi = c.repos_with_ci');
		expect(sync).not.toContain('repos_with_ci: c.ci_workflows');
	});

	it('declares one canonical public contact', () => {
		expect(siteConfig.contact.email).toBe('padavano.anthony@gmail.com');
	});

	it('bounds upstream evidence fetches before deployment gates', () => {
		const source = readFileSync(resolve('scripts/sync-laurea.mjs'), 'utf8');
		expect(source).toContain('AbortSignal.timeout(15_000)');
	});

	it('keeps resume sources on the canonical portfolio origin', () => {
		for (const path of [
			'resume/Anthony_James_Padavano_CV.yaml',
			'resume/Anthony_James_Padavano_Developer.yaml',
			'resume/Anthony_James_Padavano_Multimedia.yaml',
		]) {
			const source = readFileSync(resolve(path), 'utf8');
			expect(source).toContain(canonicalBase);
			expect(source).not.toContain('https://4444j99.github.io/portfolio/');
		}
	});

	it('generates a dedicated social image for the projects catalog', () => {
		const source = readFileSync(resolve('src/pages/og/[...slug].png.ts'), 'utf8');
		expect(source).toContain("slug: 'projects'");
	});

	it('requires traceable renderable fields before publishing a LAVREA claim', () => {
		const normalizer = readFileSync(resolve('scripts/lib/laurea-snapshot.mjs'), 'utf8');
		const card = readFileSync(resolve('src/components/home/LaurelsBentoCell.astro'), 'utf8');
		for (const field of [
			'claim_id',
			'claim_status',
			'evidence_state',
			'disclosure_level',
			'source_ref',
		]) {
			expect(normalizer).toContain(field);
			expect(card).toContain(field);
		}
		expect(card).toContain("['verified', 'derived_reviewed'].includes");
		expect(normalizer).toContain('raw.schema_version !== REQUIRED_SCHEMA');
		expect(normalizer).toContain("!Object.hasOwn(finding, 'tier')");
		expect(card).toContain('Measured GitHub activity profile');
		expect(card).toContain('publishes no population ranking');
		expect(card).not.toContain('snapshot.composite');
	});

	it('keeps reduced-motion proof rails static until the user explicitly resumes', () => {
		const source = readFileSync(resolve('src/components/home/LaurelsBentoCell.astro'), 'utf8');
		expect(source).toContain('.laurea__proof-rail i { animation: none; opacity: 1; }');
		expect(source).toContain("html[data-ambient-motion='running']");
	});
});
