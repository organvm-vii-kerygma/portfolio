import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const contractPath = fileURLToPath(
	new URL('../src/data/psp-p07-public-surface-contract.json', import.meta.url),
);
const contract = JSON.parse(await readFile(contractPath, 'utf8'));
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
	contract.read_only_inputs.c04_preflight.exact_head === 'e9c2db2360acd5fd57a48d063e64990dc8f3a768',
	'C04 exact head must be pinned',
);
assert(
	contract.read_only_inputs.p06_experience_preflight.exact_head ===
		'fa86b67a7283c15ab801302ffac655c30898b6a1',
	'P06 exact head must be pinned',
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

if (failures.length > 0) {
	throw new Error(`PSP-C06 preflight invalid:\n- ${failures.join('\n- ')}`);
}

console.log('PSP-C06 public-surfaces preflight: PASS');
