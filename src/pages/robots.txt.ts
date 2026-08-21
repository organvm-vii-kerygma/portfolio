import type { APIRoute } from 'astro';
import { siteUrl } from '../utils/paths';

export const GET: APIRoute = () =>
	new Response(
		`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl('sitemap-index.xml')}\nFeed: ${siteUrl('feed.xml')}\n`,
		{ headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
	);
