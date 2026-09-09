import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { checkResults } from '../check-ci-results.mjs';

const success = () => ({
	'static-checks': { result: 'success' },
	'build-validation': { result: 'success' },
	'dependency-review': { result: 'success' },
});

test('a PR needs every applicable job to succeed', () => {
	assert.deepEqual(checkResults(success(), 'pull_request'), []);
	for (const job of Object.keys(success())) {
		for (const result of ['failure', 'cancelled', 'skipped', undefined]) {
			const results = success();
			results[job] = { result };
			assert.deepEqual(checkResults(results, 'pull_request'), [job]);
		}
		const missing = success();
		delete missing[job];
		assert.deepEqual(checkResults(missing, 'pull_request'), [job]);
	}
});

test('main still needs build/static checks; PR-only review may be skipped', () => {
	const results = success();
	results['dependency-review'].result = 'skipped';
	assert.deepEqual(checkResults(results, 'push'), []);
	results['build-validation'].result = 'failure';
	assert.deepEqual(checkResults(results, 'push'), ['build-validation']);
});

test('unknown events and malformed input cannot pass', () => {
	assert.throws(() => checkResults(success(), 'pull_request_target'));
	assert.throws(() => checkResults(null, 'pull_request'));
	const result = spawnSync(process.execPath, ['scripts/check-ci-results.mjs'], {
		env: { ...process.env, CI_RESULTS: '{invalid', CI_EVENT: 'pull_request' },
		encoding: 'utf8',
	});
	assert.equal(result.status, 1);
});
