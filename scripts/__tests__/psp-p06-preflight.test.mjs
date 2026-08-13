import assert from 'node:assert/strict';
import test from 'node:test';

import { loadContract, validateContract } from '../validate-psp-p06-preflight.mjs';

function copy(value) {
	return JSON.parse(JSON.stringify(value));
}

test('tracked PSP-P06 contract passes', async () => {
	assert.deepEqual(validateContract(await loadContract()), []);
});

test('private routes fail closed', async () => {
	const contract = copy(await loadContract());
	contract.canonical_routes.push({
		route: '/private/',
		level: 'PRIVATE_WITHHELD',
		artifact_ids: ['private'],
	});
	assert.ok(
		validateContract(contract).includes('private disclosure cannot have a canonical route'),
	);
});

test('accepted C03 progress leaves only W07 open', async () => {
	const contract = await loadContract();
	assert.equal(contract.dependencies.c02.status, 'closed');
	assert.equal(
		contract.dependencies.registry_owner_resolution.canonical_target,
		'organvm-vii-kerygma/portfolio',
	);
	assert.deepEqual(contract.dependencies.c03.closed_leaves, [
		'PSP-P03-W01',
		'PSP-P03-W02',
		'PSP-P03-W03',
		'PSP-P03-W04',
		'PSP-P03-W05',
		'PSP-P03-W06',
	]);
	assert.equal(contract.dependencies.c03.sole_unsatisfied_leaf.work_id, 'PSP-P03-W07');
	assert.equal(contract.dependencies.c03.sole_unsatisfied_leaf.outbound_from_c04, false);
	assert.equal(contract.identity_contract.authority_boundary.scope, 'sponsor-granted and written');
});

test('early visual selection and partnership promotion fail closed', async () => {
	const contract = copy(await loadContract());
	contract.visual_ideation_gate.selected_direction = 'direction_a';
	contract.audience_flows
		.find((flow) => flow.audience_id === 'product_operating_partner')
		.L1.required.push('CTA');
	const errors = validateContract(contract);
	assert.ok(errors.includes('preflight cannot select a visual direction'));
	assert.ok(errors.includes('operating partner must remain absent from L1 and L2'));
});
