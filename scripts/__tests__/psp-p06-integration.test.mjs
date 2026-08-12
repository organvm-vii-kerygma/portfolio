import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	evaluateQuality,
	formalizationReadiness,
	projectContent,
	syntheticContentFixture,
	validateAudienceFlows,
	validateEvidenceCard,
} from '../lib/psp-p06-integration.mjs';
import { loadContract } from '../validate-psp-p06-preflight.mjs';

const fixture = async () =>
	JSON.parse(
		await readFile(new URL('./fixtures/psp-p06-integration.json', import.meta.url), 'utf8'),
	);

test('all P06 leaves and audience levels are bound', async () => {
	const contract = await loadContract();
	assert.deepEqual(
		contract.program_binding.leaf_bindings.map((row) => row.id),
		Array.from({ length: 7 }, (_, index) => `PSP-P06-W0${index + 1}`),
	);
	assert.deepEqual(validateAudienceFlows(contract), []);
});

test('every artifact projects to one canonical route', async () => {
	const contract = await loadContract();
	const result = projectContent(contract, syntheticContentFixture(contract));
	assert.equal(result.status, 'pass');
	assert.equal(result.projection.length, contract.canonical_routes.length);
	assert.equal(new Set(result.projection.map((row) => row.id)).size, result.projection.length);
});

test('private, pricing, and route drift fail closed', async () => {
	const contract = await loadContract();
	const model = syntheticContentFixture(contract);
	model.objects[0].private_repository = 'withheld';
	model.objects[0].headline = 'USD 100';
	model.objects[0].canonical_route = '/wrong/';
	const errors = projectContent(contract, model).errors;
	assert.ok(errors.some((error) => error.includes('private fields')));
	assert.ok(errors.includes('numeric public pricing is prohibited'));
	assert.ok(errors.some((error) => error.includes('route mismatch')));
});

test('evidence states require exact proof and withhold stale values', async () => {
	const contract = await loadContract();
	const card = {
		evidence_id: 'synthetic',
		claim_id: 'C02-PROOF-LIMEN',
		disclosure_level: 'L2',
		state: 'ready',
		source_url: 'https://example.invalid/receipt',
		observed_at: '2026-08-12',
		exact_head: '1'.repeat(40),
		summary: 'Synthetic fixture.',
		limitations: ['Not release evidence.'],
		withdrawal_action: 'withhold',
	};
	assert.deepEqual(validateEvidenceCard(contract, card), []);
	card.state = 'stale';
	card.claim_value = 'unsupported';
	assert.ok(
		validateEvidenceCard(contract, card).includes('stale evidence cannot expose a claim value'),
	);
});

test('quality budgets and visual floor are executable but synthetic', async () => {
	const contract = await loadContract();
	const input = await fixture();
	const result = evaluateQuality(contract, input);
	assert.equal(result.status, 'pass');
	assert.equal(result.production_evidence, false);
	input.performance.mobile.lcp_ms_p75 = 2501;
	input.visual_quality.scores['proof credibility'] = 3;
	const failed = evaluateQuality(contract, input);
	assert.ok(failed.errors.includes('mobile lcp_ms_p75 exceeds budget'));
	assert.ok(failed.errors.includes('visual score below floor: proof credibility'));
});

test('formalization remains prepared and cannot implement visuals', async () => {
	const contract = await loadContract();
	const result = formalizationReadiness(contract);
	assert.equal(result.status, 'PREPARED/PREFLIGHT');
	assert.deepEqual(result.residual_gates, [
		'PSP-P03-W07 genuine five-reader receipt',
		'PSP-C03 formal closure',
	]);
	assert.equal(result.visual_implementation_allowed, false);
	assert.equal(result.formal_closure_allowed, false);
});

test('later valid closure unlocks ideation only', async () => {
	const contract = await loadContract();
	const receipt = {
		chunk_id: 'PSP-C03',
		status: 'pass',
		exact_head: '2'.repeat(40),
		accepted_preflight_ancestor: contract.dependencies.c03.exact_head,
		ancestor_check: 'pass',
		phase_predicates: { 'PSP-P03': 'pass', 'PSP-P04': 'pass' },
		w07_receipt: {
			url: 'https://example.invalid/later-receipt',
			sha256: '3'.repeat(64),
		},
	};
	const result = formalizationReadiness(contract, receipt);
	assert.equal(result.status, 'ready_for_three_direction_ideation');
	assert.equal(result.visual_implementation_allowed, false);
	assert.equal(result.formal_closure_allowed, false);
});
