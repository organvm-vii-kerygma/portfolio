import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeLaureaSnapshot, PUBLIC_LIMITATION } from '../lib/laurea-snapshot.mjs';

const NOW = new Date('2026-08-20T12:00:00Z');

function fixture(overrides = {}) {
	return {
		login: '4444J99',
		generated_at: '2026-08-20T10:00:00Z',
		source_repository: 'organvm/laurea',
		source_sha: 'abcdef1234567890',
		snapshot: {
			login: '4444J99',
			orgs: ['a', 'b'],
			repos: [{ isFork: false }, { isFork: true }, { isFork: false }],
			contributions: { total: 321, pull_requests: 45 },
		},
		findings: [{ axis: 'composite_python_full_stack', tier: 'top 1%' }],
		...overrides,
	};
}

test('fresh source normalizes only the public evidence contract', () => {
	const result = normalizeLaureaSnapshot(fixture(), NOW);
	assert.equal(result.state, 'ready');
	assert.equal(result.composite.claim, 'Top 1% GitHub output profile');
	assert.deepEqual(Object.values(result.metrics), [321, 2, 45, 2]);
	assert.deepEqual(result.limitations, [PUBLIC_LIMITATION]);
});

test('stale source withholds all numeric and percentile claims', () => {
	const result = normalizeLaureaSnapshot(fixture({ generated_at: '2026-08-18T00:00:00Z' }), NOW);
	assert.equal(result.state, 'stale');
	assert.equal(result.composite, null);
	assert.ok(Object.values(result.metrics).every((value) => value === null));
});

test('malformed or mismatched subjects fail closed', () => {
	for (const raw of [null, {}, fixture({ login: 'organvm' }), fixture({ source_sha: 'unknown' })]) {
		const result = normalizeLaureaSnapshot(raw, NOW);
		assert.equal(result.state, 'error');
		assert.equal(result.composite, null);
	}
});

test('unavailable input cannot promote claims', () => {
	const result = normalizeLaureaSnapshot(undefined, NOW);
	assert.equal(result.state, 'error');
	assert.ok(Object.values(result.metrics).every((value) => value === null));
});
