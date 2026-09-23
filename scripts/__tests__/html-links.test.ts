import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { collectHtmlLinks } from '../lib/html-links.mjs';

describe('HTML build-link extraction', () => {
	it('ignores JavaScript template links but retains script source attributes', () => {
		const html =
			'<script src="engine.js">const a = `<a href="${esc(docs[ref])}">Docs</a>`;</script><a href="real.html">Real</a>';
		expect(collectHtmlLinks(html)).toEqual(['engine.js', 'real.html']);
	});

	it('does not execute embedded scripts', () => {
		expect(collectHtmlLinks('<script>throw new Error("must never execute")</script>')).toEqual([]);
	});

	it('ignores comments, CSS, textareas, titles and escaped markup', () => {
		const html =
			'<title>&lt;a href="title"&gt;</title><!-- <a href="comment"> --><style>.x{content:\'<a href="css">\'}</style><textarea><a href="text">Text</a></textarea><pre>&lt;a href="escaped"&gt;</pre>';
		expect(collectHtmlLinks(html)).toEqual([]);
	});

	it('supports valid attribute spacing, case, quotes, unquoted values and entities', () => {
		const html =
			'<A HREF = "page.html?a=1&amp;b=2">A</A><img src=photo.png><a href=\'other.html\'>B</a>';
		expect(collectHtmlLinks(html)).toEqual(['page.html?a=1&b=2', 'photo.png', 'other.html']);
	});

	it('retains actual missing-file links for downstream validation', () => {
		const html =
			'<script>const fake = \'<a href="ignored.html">\';</script><a href="missing.html">Broken</a><img src="missing.png">';
		expect(collectHtmlLinks(html)).toEqual(['missing.html', 'missing.png']);
	});

	it('does not exempt an actual DOM attribute containing interpolation syntax', () => {
		expect(collectHtmlLinks('<a href="${missing}">Broken output</a>')).toEqual(['${missing}']);
	});

	it('retains stylesheets and excludes data attributes', () => {
		const html = '<link rel="stylesheet" href="site.css"><div data-href="not-a-link"></div>';
		expect(collectHtmlLinks(html)).toEqual(['site.css']);
	});

	it('checks the deployed merchant source without its runtime template literals', () => {
		const html = readFileSync('public/proofs/conversation-resolution/index.html', 'utf8');
		const links = collectHtmlLinks(html);
		expect(html).toContain('${esc(docs[ref])}');
		expect(links).not.toContain('${esc(docs[ref])}');
		expect(links.some((href) => href.startsWith('https://'))).toBe(true);
	});
});
