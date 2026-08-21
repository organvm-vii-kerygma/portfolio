import assert from 'node:assert/strict';
import test from 'node:test';
import {
	isLastKnownGoodLaureaSnapshot,
	normalizeLaureaSnapshot,
	PUBLIC_LIMITATION,
} from '../lib/laurea-snapshot.mjs';

const NOW = new Date('2026-08-20T12:00:00Z');

function fixture(overrides = {}) {
	return {
		schema_version: 'laurea.report.v2',
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
		findings: [
			{ axis: 'contributions_year', status: 'measured' },
			{ axis: 'language_breadth', status: 'derived' },
		],
		...overrides,
	};
}

test('fresh v2 source normalizes only bounded activity evidence', () => {
	const result = normalizeLaureaSnapshot(fixture(), NOW);
	assert.equal(result.schema_version, 'portfolio.laurea_snapshot.v2');
	assert.equal(result.state, 'ready');
	assert.equal(result.profile.label, 'Measured GitHub activity profile');
	assert.equal('composite' in result, false);
	assert.deepEqual(result.public_claim, {
		claim_id: 'laurea.github-activity-profile.4444J99.abcdef123456',
		claim_status: 'derived_reviewed',
		evidence_state: 'ready',
		disclosure_level: 'L1',
		source_ref: 'organvm/laurea@abcdef1234567890',
	});
	assert.deepEqual(Object.values(result.metrics), [321, 2, 45, 2]);
	assert.deepEqual(result.limitations, [PUBLIC_LIMITATION]);
});

test('stale source withholds all numeric activity claims', () => {
	const result = normalizeLaureaSnapshot(fixture({ generated_at: '2026-08-18T00:00:00Z' }), NOW);
	assert.equal(result.state, 'stale');
	assert.equal(result.profile, null);
	assert.equal(result.public_claim, null);
	assert.ok(Object.values(result.metrics).every((value) => value === null));
});

test('legacy ranking schema and mismatched identities fail closed', () => {
	for (const raw of [
		null,
		{},
		fixture({ schema_version: undefined }),
		fixture({ schema_version: 'laurea.report.v1' }),
		fixture({ login: 'organvm' }),
		fixture({ source_sha: 'unknown' }),
		fixture({ generated_at: 'not-a-date' }),
	]) {
		const result = normalizeLaureaSnapshot(raw, NOW);
		assert.equal(result.state, 'error');
		assert.equal(result.profile, null);
		if (raw?.generated_at === 'not-a-date') assert.equal(result.generated_at, null);
	}
});

test('ranked or malformed findings fail closed', () => {
	for (const findings of [
		[],
		[{ axis: 'composite_python_full_stack', tier: 'top 1%' }],
		[{ axis: 'contributions_year', status: 'verified' }],
	]) {
		const result = normalizeLaureaSnapshot(fixture({ findings }), NOW);
		assert.equal(result.state, 'error');
		assert.equal(result.public_claim, null);
	}
});

test('malformed repository entries fail closed instead of undercounting', () => {
	for (const repos of [[{}], [{ isFork: null }], ['repository']]) {
		const snapshot = { ...fixture().snapshot, repos };
		const result = normalizeLaureaSnapshot(fixture({ snapshot }), NOW);
		assert.equal(result.state, 'error');
		assert.ok(Object.values(result.metrics).every((value) => value === null));
	}
});

test('unavailable input cannot promote claims', () => {
	const result = normalizeLaureaSnapshot(undefined, NOW);
	assert.equal(result.state, 'error');
	assert.ok(Object.values(result.metrics).every((value) => value === null));
});

test('only a complete normalized snapshot can survive a transport failure', () => {
	const ready = normalizeLaureaSnapshot(fixture(), NOW);
	assert.equal(isLastKnownGoodLaureaSnapshot(ready), true);

	for (const candidate of [
		undefined,
		{ ...ready, state: 'error' },
		{ ...ready, source_sha: 'unknown' },
		{ ...ready, public_claim: null },
		{ ...ready, metrics: { ...ready.metrics, contributions_trailing_12_months: null } },
	]) {
		assert.equal(isLastKnownGoodLaureaSnapshot(candidate), false);
	}
});
