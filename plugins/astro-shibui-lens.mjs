/**
 * astro-shibui-lens — Astro integration wrapper
 *
 * Runs the shibui lens as a post-build HTML transformation on ALL pages,
 * not just MDX content. This catches .astro project pages that bypass
 * the markdown rehype pipeline.
 *
 * Skips elements already wrapped by manual ShibuiContent or the rehype plugin.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import rehypeShibuiLens from './rehype-shibui-lens.mjs';

function findHtmlFiles(dir) {
	const results = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...findHtmlFiles(full));
		} else if (entry.name.endsWith('.html')) {
			results.push(full);
		}
	}
	return results;
}

export default function astroShibuiLens() {
	return {
		name: 'astro-shibui-lens',
		hooks: {
			'astro:build:done': async ({ dir }) => {
				const distDir = dir.pathname || dir.toString().replace('file://', '');
				const htmlFiles = findHtmlFiles(distDir);

				console.log(`[shibui-lens] Post-processing ${htmlFiles.length} HTML files...`);

				const processor = unified()
					.use(rehypeParse)
					.use(rehypeShibuiLens)
					.use(rehypeStringify, { allowDangerousHtml: true });

				let scored = 0;
				let annotated = 0;
				let entries = 0;

				for (const file of htmlFiles) {
					// Preserve the standalone proof's tested bytes and independent UI.
					// It remains subject to build, HTML, link and runtime route validation.
					const proofFile = resolve(distDir, 'proofs/conversation-resolution/index.html');
					if (resolve(file) === proofFile) continue;

					const html = readFileSync(file, 'utf8');

					// Skip if already fully processed (has data-shibui-c on paragraphs)
					// Only process pages that have paragraphs WITHOUT scores
					const hasUnscored = /<p(?![^>]*data-shibui-c)[^>]*>/.test(html) && html.includes('<p');
					if (!hasUnscored) continue;

					try {
						const result = await processor.process(html);
						const output = String(result);

						// Count what was added
						const newScores =
							(output.match(/data-shibui-c="/g) || []).length -
							(html.match(/data-shibui-c="/g) || []).length;
						const newTerms =
							(output.match(/class="shibui-term"/g) || []).length -
							(html.match(/class="shibui-term"/g) || []).length;
						const newEntries =
							(output.match(/class="shibui-entry"/g) || []).length -
							(html.match(/class="shibui-entry"/g) || []).length;

						if (newScores > 0 || newTerms > 0 || newEntries > 0) {
							writeFileSync(file, output, 'utf8');
							scored += newScores;
							annotated += newTerms;
							entries += newEntries;
						}
					} catch (e) {
						// Don't fail the build — log and continue
						console.warn(`[shibui-lens] Warning processing ${file}: ${e.message}`);
					}
				}

				console.log(
					`[shibui-lens] Done: ${scored} paragraphs scored, ${annotated} terms annotated, ${entries} entry texts generated`,
				);
			},
		},
	};
}