#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateGitHubPagesIndex } from '@meta-organvm/github-pages-index-core';
import { parseOption } from './lib/cli-utils.mjs';

const DEFAULT_POLICY_PATH = 'scripts/config/github-pages-policy.json';

function parseFiniteNumber(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function parseFiniteInteger(value, fallback) {
	const parsed = Number.parseInt(String(value), 10);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function loadValidationPolicy(policyPath) {
	let parsed;
	try {
		parsed = JSON.parse(readFileSync(policyPath, 'utf-8'));
	} catch (error) {
		console.error(
			`Failed to read GitHub Pages validation policy (${policyPath}): ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}

	const validation = parsed?.validation ?? {};
	return {
		maxAgeHours: parseFiniteNumber(validation.maxAgeHours, 72),
		maxErrored: parseFiniteInteger(validation.maxErrored, 8),
		maxUnreachable: parseFiniteInteger(validation.maxUnreachable, 5),
	};
}

const inputPath = resolve(parseOption('input', 'src/data/github-pages.json'));
const policyPath = resolve(parseOption('policy', DEFAULT_POLICY_PATH));
const policy = loadValidationPolicy(policyPath);

// Snapshot validation preserves every structural/health check; only elapsed age is excluded.
const snapshot = process.argv.includes('--snapshot');
const maxAgeHours = snapshot
	? Number.POSITIVE_INFINITY
	: parseFiniteNumber(parseOption('max-age-hours', String(policy.maxAgeHours)), policy.maxAgeHours);
const maxErrored = parseFiniteInteger(
	parseOption('max-errored', String(policy.maxErrored)),
	policy.maxErrored,
);
const maxUnreachable = parseFiniteInteger(
	parseOption('max-unreachable', String(policy.maxUnreachable)),
	policy.maxUnreachable,
);

const result = validateGitHubPagesIndex({
	inputPath,
	maxAgeHours,
	maxErrored,
	maxUnreachable,
});

if (snapshot) console.log('Snapshot validation: no claim about current data freshness.');

if (result.summary) {
	console.log(`GitHub Pages validation policy (${policyPath}):`);
	console.log(`- max-age-hours: ${maxAgeHours}`);
	console.log(`- max-errored: ${maxErrored}`);
	console.log(`- max-unreachable: ${maxUnreachable}`);
	console.log(`GitHub Pages index summary (${inputPath}):`);
	console.log(`- total: ${result.summary.totalRepos}`);
	console.log(`- built: ${result.summary.builtCount}`);
	console.log(`- errored: ${result.summary.erroredCount}`);
	console.log(`- unreachable: ${result.summary.unreachableCount}`);
	console.log(`- recently changed (7d): ${result.summary.recentlyChangedCount}`);
	if (typeof result.summary.ageHours === 'number') {
		console.log(
			`- age: ${result.summary.ageHours.toFixed(2)}h (max ${result.summary.maxAgeHours}h)`,
		);
	} else {
		console.log(`- age: n/a (max ${result.summary.maxAgeHours}h)`);
	}
}

for (const warning of result.warnings) console.warn(`Warning: ${warning}`);

if (!result.ok) {
	console.error('GitHub Pages index validation failed:');
	for (const error of result.errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log('GitHub Pages index validation passed.');
