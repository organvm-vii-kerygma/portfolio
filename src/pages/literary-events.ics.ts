import type { APIRoute } from 'astro';
import { literaryEvents } from '../data/literary-events';

const escapeIcs = (value: string) =>
	value
		.replaceAll('\\', '\\\\')
		.replaceAll(';', '\\;')
		.replaceAll(',', '\\,')
		.replaceAll('\n', '\\n');
const stamp = (value: string) =>
	new Date(value).toISOString().replaceAll('-', '').replaceAll(':', '').replace('.000', '');

export const GET: APIRoute = () => {
	const events = literaryEvents.flatMap((event) => [
		'BEGIN:VEVENT',
		`UID:${event.id}@organvm-vii-kerygma.github.io`,
		`DTSTAMP:${stamp(`${event.verifiedAt}T12:00:00Z`)}`,
		`DTSTART:${stamp(event.start)}`,
		...(event.end ? [`DTEND:${stamp(event.end)}`] : []),
		`SUMMARY:${escapeIcs(event.title)}`,
		`LOCATION:${escapeIcs([event.venue, event.address].filter(Boolean).join(', '))}`,
		`DESCRIPTION:${escapeIcs(`${event.whyItMatters}\n\n${event.priceLabel}\n${event.registrationUrl}`)}`,
		`URL:${event.registrationUrl}`,
		'END:VEVENT',
	]);
	return new Response(
		[
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//ORGANVM//Literary Field Guide//EN',
			...events,
			'END:VCALENDAR',
		].join('\r\n'),
		{
			headers: {
				'Content-Type': 'text/calendar; charset=utf-8',
				'Content-Disposition': 'inline; filename="literary-events.ics"',
			},
		},
	);
};
