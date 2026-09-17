import { describe, expect, it } from 'vitest';
import { literaryEvents, literaryGuideCoverage } from '../literary-events';

describe('literary field guide data', () => {
	it('uses unique, stable IDs and valid public URLs', () => {
		const ids = literaryEvents.map((event) => event.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const event of literaryEvents) {
			expect(() => new URL(event.registrationUrl)).not.toThrow();
			expect(() => new URL(event.sourceUrl)).not.toThrow();
		}
	});

	it('distinguishes literature from film and keeps film listings genuinely free', () => {
		for (const event of literaryEvents) {
			expect(['literature', 'film']).toContain(event.eventType);
			if (event.eventType === 'film') expect(event.price).toBe('free');
		}
		expect(literaryEvents.some((event) => event.eventType === 'film')).toBe(true);
	});

	it('includes an editorial explanation and community use for every event', () => {
		for (const event of literaryEvents) {
			expect(event.whyItMatters.length).toBeGreaterThan(80);
			expect(event.communityUse.length).toBeGreaterThan(80);
			expect(event.tags.length).toBeGreaterThanOrEqual(2);
		}
	});

	it('keeps coverage broader than a single borough', () => {
		expect(literaryGuideCoverage).toEqual(
			expect.arrayContaining(['Staten Island', 'Brooklyn', 'Manhattan', 'Jersey City', 'Newark']),
		);
	});
});
