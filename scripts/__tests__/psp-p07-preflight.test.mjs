import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const output = execFileSync('node', ['scripts/validate-psp-p07-preflight.mjs'], {
	encoding: 'utf8',
});

assert.match(output, /PSP-C06 public-surfaces preflight: PASS/);

const sourceContract = JSON.parse(
	readFileSync('src/data/psp-p07-public-surface-contract.json', 'utf8'),
);

function assertRejected(mutator, expectedMessage) {
	const directory = mkdtempSync(join(tmpdir(), 'psp-p07-preflight-'));
	try {
		const candidate = structuredClone(sourceContract);
		mutator(candidate);
		const contractPath = join(directory, 'contract.json');
		writeFileSync(contractPath, `${JSON.stringify(candidate, null, 2)}\n`);
		const result = spawnSync('node', ['scripts/validate-psp-p07-preflight.mjs'], {
			encoding: 'utf8',
			env: { ...process.env, PSP_P07_CONTRACT_PATH: contractPath },
		});
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, expectedMessage);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
}

assertRejected((candidate) => {
	candidate.surface_inventory[8] = structuredClone(candidate.surface_inventory[0]);
}, /each unique W01-W09 surface entry exactly once/);

assertRejected((candidate) => {
	candidate.analytics_schema.events[0].allowed_values.door = ['product_operating_partner'];
}, /two approved public doors/);

assertRejected((candidate) => {
	candidate.analytics_schema.privacy.prohibited_fields =
		candidate.analytics_schema.privacy.prohibited_fields.filter((field) => field !== 'name');
}, /complete prohibited-field set/);

assertRejected((candidate) => {
	candidate.public_content_contract.route_rules.public_front_doors = ['recruiter_executive'];
}, /only the two approved public doors/);

assertRejected((candidate) => {
	candidate.post_selection_integration_gate.before_effect =
		candidate.post_selection_integration_gate.before_effect.filter(
			(value) => value !== 'PSP-P05-W02_claim_reconciliation_receipt',
		);
}, /every pre-implementation prerequisite/);

assertRejected((candidate) => {
	candidate.release_and_rollback_contract.dry_run.prohibited_effects =
		candidate.release_and_rollback_contract.dry_run.prohibited_effects.filter(
			(value) => value !== 'traffic routing',
		);
}, /every production-facing effect prohibition/);
