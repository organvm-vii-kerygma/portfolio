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
