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
const sourceManifest = JSON.parse(
	readFileSync('docs/positioning/visual-directions/psp-c06/manifest.json', 'utf8'),
);

function assertRejected(mutator, expectedMessage, target = 'contract') {
	const directory = mkdtempSync(join(tmpdir(), 'psp-p07-preflight-'));
	try {
		const candidate = structuredClone(target === 'manifest' ? sourceManifest : sourceContract);
		mutator(candidate);
		const candidatePath = join(directory, `${target}.json`);
		writeFileSync(candidatePath, `${JSON.stringify(candidate, null, 2)}\n`);
		const result = spawnSync('node', ['scripts/validate-psp-p07-preflight.mjs'], {
			encoding: 'utf8',
			env: {
				...process.env,
				[target === 'manifest' ? 'PSP_P07_MANIFEST_PATH' : 'PSP_P07_CONTRACT_PATH']: candidatePath,
			},
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
}, /complete privacy-safe contract/);

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

assertRejected((candidate) => {
	candidate.analytics_schema.events[0].required_fields.push('email');
}, /complete privacy-safe contract/);

assertRejected((candidate) => {
	candidate.quality_contract.performance.budgets.css_kb_gzip = 600;
}, /every declared budget/);

assertRejected((candidate) => {
	candidate.post_selection_integration_gate.before_release.pop();
}, /every pre-release prerequisite/);

assertRejected((candidate) => {
	candidate.quality_contract.accessibility.requirements.pop();
}, /complete requirements/);

assertRejected(
	(candidate) => {
		candidate.selected_direction = 1;
	},
	/unrecognized selection-bearing field/,
	'manifest',
);

assertRejected(
	(candidate) => {
		candidate.selection_receipt.chosen_direction = 'Evidence Ledger';
	},
	/select Living Evidence Field exactly/,
	'manifest',
);

assertRejected(
	(candidate) => {
		candidate.selection_receipt.rejected_directions.pop();
	},
	/reject all three prepared static directions/,
	'manifest',
);

assertRejected(
	(candidate) => {
		candidate.selection_receipt.rollback = 'Restore main.';
	},
	/retain the exact rollback head/,
	'manifest',
);

assertRejected((candidate) => {
	candidate.read_only_inputs.portfolio_repository.main_head = '0'.repeat(40);
}, /captured rollback baseline/);

assertRejected((candidate) => {
	candidate.public_content_contract.evidence_card.required_fields_when_renderable.pop();
}, /every traceability field/);

assertRejected((candidate) => {
	candidate.schema_version = 'portfolio.psp_p07_public_surface_preflight.v2';
}, /schema version must be supported exactly/);
