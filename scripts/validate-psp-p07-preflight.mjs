import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const contractPath = fileURLToPath(
	new URL('../src/data/psp-p07-public-surface-contract.json', import.meta.url),
);
const visualDirectory = new URL('../docs/positioning/visual-directions/psp-c06/', import.meta.url);
const manifestPath = fileURLToPath(new URL('manifest.json', visualDirectory));
const contract = JSON.parse(await readFile(contractPath, 'utf8'));
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const failures = [];

const assert = (condition, message) => {
	if (!condition) failures.push(message);
};

assert(contract.status === 'PREPARED/PREFLIGHT', 'contract must remain a preflight');
assert(contract.scope === 'PSP-C06 / PSP-P07-W01 through W09', 'contract must cover W01–W09');
assert(contract.surface_inventory.length === 9, 'contract must have exactly nine surface entries');
assert(
	contract.read_only_inputs.portfolio_repository.id === 1155412125,
	'canonical portfolio id must match',
);
assert(
	contract.read_only_inputs.c04_preflight.exact_head === '23712398c6586e005c303eff632604985cd0a25c',
	'C04 exact head must be pinned',
);
assert(
	contract.read_only_inputs.p06_experience_preflight.exact_head ===
		'9bcc4606b68da83dc0878b060989d35c3b649d7f',
	'P06 exact head must be pinned',
);
const c03 = contract.read_only_inputs.c03_upstream;
assert(
	c03.current_preflight_head === 'c7c932205faa405e291f8030235a73cedeaa219e',
	'C03 current preflight head must include the tracked W07 intake package',
);
assert(
	c03.accepted_w01_w06_head === 'c94bc3748fcf2d1dc802a4bae972df23d9a9fbec',
	'C03 accepted W01-W06 head must remain pinned',
);
assert(
	JSON.stringify(c03.closed_work_ids) ===
		JSON.stringify([
			'PSP-P03-W01',
			'PSP-P03-W02',
			'PSP-P03-W03',
			'PSP-P03-W04',
			'PSP-P03-W05',
			'PSP-P03-W06',
		]),
	'C03 must name exactly the six accepted work packets',
);
assert(
	c03.w06_receipt.sha256 === '260081dfbffc75d55824c0e6ed7d7718a7e397763afb689c94d2230963d79617',
	'W06 canonical receipt digest must remain pinned',
);
assert(
	c03.sole_unresolved_dependency.work_id === 'PSP-P03-W07' &&
		c03.sole_unresolved_dependency.state === 'open_five_reader_evidence_gate',
	'W07 must remain the sole unresolved C03 dependency',
);
assert(
	/five genuine independent target-like reader records/i.test(c03.sole_unresolved_dependency.rule),
	'W07 must remain gated on genuine reader evidence',
);
assert(contract.read_only_inputs.c00_p00.status === 'closed', 'C00/P00 must remain closed');
assert(
	/superseded/.test(contract.read_only_inputs.c00_p00.rule),
	'historic identity gate must remain superseded',
);
assert(
	contract.visual_selection.directions_generated === 3,
	'exactly three visual directions are required',
);
assert(
	/No visual target/.test(contract.visual_selection.implementation_rule),
	'visual implementation must remain selection-gated',
);

const prohibited = new Set(contract.analytics_schema.privacy.prohibited_fields);
for (const field of ['email', 'ip', 'free_text', 'content_body', 'cross_site_identifier']) {
	assert(prohibited.has(field), `analytics must prohibit ${field}`);
}
assert(
	contract.analytics_schema.privacy.collection_default === 'disabled',
	'collection must default to disabled',
);
assert(
	contract.analytics_schema.events.every(
		(event) => !event.allowed_values?.audience?.includes('partner'),
	),
	'analytics must not create a partner door',
);
const content = contract.public_content_contract;
assert(
	JSON.stringify(content.public_claim_statuses.renderable) ===
		JSON.stringify(['verified', 'derived_reviewed']),
	'only verified or reviewed-derived claims may render publicly',
);
assert(
	content.public_claim_statuses.withhold_required.includes('private') &&
		content.public_claim_statuses.withhold_required.includes('unverified'),
	'private and unverified claims must be withheld',
);
assert(
	content.route_rules.public_front_doors.every((door) =>
		['client', 'recruiter_executive'].includes(door),
	) && content.route_rules.forbidden_public_doors.includes('product_operating_partner'),
	'only the two approved public doors may be exposed',
);
assert(
	contract.url_domain_contract.canonical_public_url ===
		'https://organvm-vii-kerygma.github.io/portfolio/',
	'canonical portfolio URL must remain pinned',
);
assert(
	/does not mutate DNS/.test(contract.url_domain_contract.mutation_rule),
	'URL truth must not authorize a DNS mutation',
);
assert(
	contract.quality_contract.accessibility.standard === 'WCAG 2.2 AA' &&
		JSON.stringify(contract.quality_contract.accessibility.viewports) ===
			JSON.stringify([320, 768, 1280]),
	'accessibility contract must retain declared standard and viewports',
);
assert(
	contract.quality_contract.performance.budgets.lcp_ms === 2500 &&
		contract.quality_contract.performance.budgets.inp_ms === 200,
	'performance contract must retain baseline interaction budgets',
);
assert(
	/does not authorize a deploy/.test(contract.release_and_rollback_contract.hard_boundary),
	'preflight must not authorize a deploy',
);
assert(
	contract.release_and_rollback_contract.preflight_link_health.result === 'failed',
	'the observed link-health failure must remain visible',
);
assert(
	contract.release_and_rollback_contract.preflight_link_health.dead_links === 11,
	'link-health finding must retain its observed denominator',
);
assert(
	contract.release_and_rollback_contract.dry_run.allowed === true,
	'dry-run must remain allowed',
);
assert(
	contract.release_and_rollback_contract.dry_run.prohibited_effects.includes('deployment') &&
		contract.release_and_rollback_contract.dry_run.prohibited_effects.includes('DNS mutation'),
	'dry-run must prohibit deployment and DNS mutation',
);
assert(
	contract.post_selection_integration_gate.before_effect.includes('operator_selection_receipt') &&
		contract.post_selection_integration_gate.before_effect.includes(
			'PSP-P03-W07_five_reader_receipt',
		) &&
		contract.post_selection_integration_gate.before_effect.includes('HG-PUBLIC-IDENTITY'),
	'post-selection gate must retain operator, W07, and public-identity prerequisites',
);
assert(
	contract.post_selection_integration_gate.rule ===
		'Visual selection alone neither authorizes an implementation effect nor closes a P07 leaf or phase.',
	'selection alone must not authorize implementation',
);
assert(manifest.selection_status === 'UNSELECTED', 'visual directions must remain unselected');
assert(manifest.directions.length === 3, 'visual manifest must preserve exactly three directions');
assert(
	/No direction may be regenerated/.test(manifest.no_build_boundary),
	'visual manifest must preserve the no-build boundary',
);
const expectedVisualDigests = [
	'0446be226d12bc108f8120f7a656a79345e043eae7d45c65ee6f2dd099bfbf05',
	'586a5761ed5a17bae7aaa3e5b164e573e105c7d810bb748c0432ba94d59b935d',
	'305387a3b833cccfcd6d73f0554eb1625062f6ddd4a6d61dadd8b3f2a8bd17a1',
];
assert(
	JSON.stringify(manifest.directions.map((direction) => direction.sha256)) ===
		JSON.stringify(expectedVisualDigests),
	'visual manifest must retain the three original direction digests',
);

for (const direction of manifest.directions) {
	const bytes = await readFile(new URL(direction.path, visualDirectory));
	const digest = createHash('sha256').update(bytes).digest('hex');
	assert(
		digest === direction.sha256,
		`visual direction ${direction.option} must retain its exact digest`,
	);
}

if (failures.length > 0) {
	throw new Error(`PSP-C06 preflight invalid:\n- ${failures.join('\n- ')}`);
}

console.log('PSP-C06 public-surfaces preflight: PASS');
