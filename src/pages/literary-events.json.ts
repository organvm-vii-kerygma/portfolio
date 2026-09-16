import type { APIRoute } from 'astro';
import {
	literaryEvents,
	literaryGuideCoverage,
	literaryGuideUpdatedAt,
} from '../data/literary-events';

export const GET: APIRoute = () =>
	new Response(
		JSON.stringify(
			{
				name: 'NYC Literary Field Guide',
				updatedAt: literaryGuideUpdatedAt,
				coverage: literaryGuideCoverage,
				license: 'CC BY 4.0',
				events: literaryEvents,
			},
			null,
			2,
		),
		{ headers: { 'Content-Type': 'application/json; charset=utf-8' } },
	);
