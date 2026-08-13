import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const defaultContractPath = fileURLToPath(
	new URL('../src/data/psp-p07-public-surface-contract.json', import.meta.url),
);
const contractPath = process.env.PSP_P07_CONTRACT_PATH || defaultContractPath;
const visualDirectory = new URL('../docs/positioning/visual-directions/psp-c06/', import.meta.url);
const defaultManifestPath = fileURLToPath(new URL('manifest.json', visualDirectory));
const manifestPath = process.env.PSP_P07_MANIFEST_PATH || defaultManifestPath;
const contract = JSON.parse(await readFile(contractPath, 'utf8'));
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const failures = [];

const assert = (condition, message) => {
	if (!condition) failures.push(message);
};

const hasExactUniqueStrings = (actual, expected) =>
	Array.isArray(actual) &&
	actual.length === expected.length &&
	new Set(actual).size === actual.length &&
	expected.every((value) => actual.includes(value));

const canonicalJson = (value) => {
	if (Array.isArray(value)) return value.map(canonicalJson);
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([key, child]) => [key, canonicalJson(child)]),
		);
	}
	return value;
};

const deepExact = (actual, expected) =>
	JSON.stringify(canonicalJson(actual)) === JSON.stringify(canonicalJson(expected));

const collectKeys = (value) => {
	if (Array.isArray(value)) return value.flatMap(collectKeys);
	if (!value || typeof value !== 'object') return [];
	return Object.entries(value).flatMap(([key, child]) => [key, ...collectKeys(child)]);
};

assert(
	contract.schema_version === 'portfolio.psp_p07_public_surface_preflight.v1',
	'contract schema version must be supported exactly',
);
assert(
	manifest.schema_version === 'portfolio.psp_c06_visual_direction_manifest.v1',
	'visual manifest schema version must be supported exactly',
);
assert(contract.status === 'PREPARED/PREFLIGHT', 'contract must remain a preflight');
assert(contract.scope === 'PSP-C06 / PSP-P07-W01 through W09', 'contract must cover W01–W09');
const expectedSurfaceWorkIds = Array.from(
	{ length: 9 },
	(_, index) => `PSP-P07-W${String(index + 1).padStart(2, '0')}`,
);
assert(
	hasExactUniqueStrings(
		contract.surface_inventory.map((surface) => surface.work_id),
		expectedSurfaceWorkIds,
	),
	'contract must contain each unique W01-W09 surface entry exactly once',
);
assert(
	contract.read_only_inputs.portfolio_repository.id === 1155412125 &&
		contract.read_only_inputs.portfolio_repository.main_head ===
			'a01b6d85f78d2d744c0c994f7220081bb54a85c5',
	'canonical portfolio id and captured rollback baseline must match',
);
assert(
	contract.read_only_inputs.c04_preflight.exact_head === '543fa28df52c9db7be3b7307019dcf209361d0b9',
	'C04 exact head must be pinned',
);
assert(
	contract.read_only_inputs.p06_experience_preflight.exact_head ===
		'8974543ba9675ed0504141895812476efef5dd80' &&
		contract.read_only_inputs.p06_experience_preflight.merge_commit ===
			'a01b6d85f78d2d744c0c994f7220081bb54a85c5' &&
		contract.read_only_inputs.p06_experience_preflight.state === 'merged',
	'P06 exact head must be pinned',
);
const c03 = contract.read_only_inputs.c03_upstream;
assert(
	c03.accepted_pr_head === 'b6af8086c9050634313f519c29a6dfcb922c3721' &&
		c03.merge_commit === '8f89ad16ca1df84b00cb8227c88f368d0d64631a' &&
		c03.state === 'merged',
	'C03 merged head must include the tracked W07 intake package',
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

const expectedProhibitedFields = [
	'name',
	'email',
	'phone',
	'ip',
	'user_agent',
	'referrer_url',
	'free_text',
	'query_parameters',
	'content_body',
	'repository_private_identifier',
	'cross_site_identifier',
];
assert(
	hasExactUniqueStrings(
		contract.analytics_schema.privacy.prohibited_fields,
		expectedProhibitedFields,
	),
	'analytics must retain the complete prohibited-field set',
);
assert(
	contract.analytics_schema.privacy.collection_default === 'disabled',
	'collection must default to disabled',
);
const content = contract.public_content_contract;
const expectedPublicDoors = ['client', 'recruiter_executive'];
assert(
	deepExact(contract.analytics_schema.events, [
		{
			name: 'psp_door_opened',
			required_fields: ['schema_version', 'surface_id', 'audience', 'door', 'event_version'],
			allowed_values: {
				audience: expectedPublicDoors,
				door: expectedPublicDoors,
			},
		},
		{
			name: 'psp_proof_opened',
			required_fields: [
				'schema_version',
				'surface_id',
				'proof_id',
				'disclosure_level',
				'evidence_state',
				'event_version',
			],
			allowed_values: {
				disclosure_level: ['L1', 'L2', 'L3'],
				evidence_state: ['ready', 'empty', 'stale', 'error', 'withheld'],
			},
		},
		{
			name: 'psp_index_opened',
			required_fields: ['schema_version', 'surface_id', 'disclosure_level', 'event_version'],
			allowed_values: { disclosure_level: ['L3'] },
		},
	]),
	'analytics event dictionary must match the complete privacy-safe contract',
);
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
	hasExactUniqueStrings(content.evidence_card.required_fields_when_renderable, [
		'claim_id',
		'evidence_state',
		'disclosure_level',
		'source_ref',
	]),
	'renderable evidence cards must retain every traceability field',
);
assert(
	hasExactUniqueStrings(content.route_rules.public_front_doors, expectedPublicDoors) &&
		content.route_rules.forbidden_public_doors.includes('product_operating_partner'),
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
		deepExact(contract.quality_contract.accessibility.viewports, [320, 768, 1280]) &&
		hasExactUniqueStrings(contract.quality_contract.accessibility.requirements, [
			'keyboard traversal',
			'visible focus',
			'semantic landmarks',
			'text alternatives',
			'reduced-motion support',
		]),
	'accessibility contract must retain its standard, viewports, and complete requirements',
);
assert(
	deepExact(contract.quality_contract.performance.budgets, {
		lcp_ms: 2500,
		inp_ms: 200,
		cls: 0.1,
		javascript_kb_gzip: 200,
		css_kb_gzip: 60,
		initial_media_kb: 500,
	}),
	'performance contract must retain every declared budget',
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
	hasExactUniqueStrings(contract.release_and_rollback_contract.dry_run.prohibited_effects, [
		'deployment',
		'DNS mutation',
		'traffic routing',
		'analytics collection',
		'public identity mutation',
	]),
	'dry-run must retain every production-facing effect prohibition',
);
assert(
	hasExactUniqueStrings(contract.post_selection_integration_gate.before_effect, [
		'operator_selection_receipt',
		'PSP-P03-W07_five_reader_receipt',
		'PSP-P05-W02_claim_reconciliation_receipt',
		'PSP-P06-W07_visual_and_comprehension_QA_receipt',
		'HG-PUBLIC-IDENTITY',
	]),
	'post-selection gate must retain every pre-implementation prerequisite',
);
assert(
	hasExactUniqueStrings(contract.post_selection_integration_gate.before_release, [
		'public_content_contract_validation',
		'analytics_schema_tests',
		'accessibility_and_performance_checks',
		'url_domain_probe',
		'release_dry_run',
		'link_health_report',
	]),
	'post-selection gate must retain every pre-release prerequisite',
);
assert(
	contract.post_selection_integration_gate.rule ===
		'Visual selection alone neither authorizes an implementation effect nor closes a P07 leaf or phase.',
	'selection alone must not authorize implementation',
);
assert(manifest.selection_status === 'UNSELECTED', 'visual directions must remain unselected');
assert(
	collectKeys(manifest).every(
		(key) =>
			key === 'selection_status' ||
			!/(?:^selected|^chosen|^choice|selectionreceipt|selection_receipt)/i.test(key),
	),
	'visual manifest must not contain a selection-bearing field',
);
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
