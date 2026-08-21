import { describe, expect, it } from 'vitest';
import { effectiveEvidenceState } from '../laurea-evidence';

const NOW = Date.parse('2026-08-21T12:00:00Z');

describe('effectiveEvidenceState', () => {
	it('keeps a fresh ready snapshot promotable', () => {
		expect(effectiveEvidenceState('ready', '2026-08-21T10:00:00Z', NOW)).toBe('ready');
	});

	it('withholds a committed ready snapshot after 36 hours', () => {
		expect(effectiveEvidenceState('ready', '2026-08-19T00:00:00Z', NOW)).toBe('stale');
	});

	it('fails closed for missing, malformed, or future timestamps', () => {
		expect(effectiveEvidenceState('ready', null, NOW)).toBe('error');
		expect(effectiveEvidenceState('ready', 'not-a-date', NOW)).toBe('error');
		expect(effectiveEvidenceState('ready', '2026-08-21T12:06:00Z', NOW)).toBe('error');
	});
});
