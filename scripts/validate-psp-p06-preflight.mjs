import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const defaultContractUrl = new URL(
	'../src/data/psp-p06-experience-contract.json',
	import.meta.url,
);

export async function loadContract(url = defaultContractUrl) {
	return JSON.parse(await readFile(url, 'utf8'));
}

export function validateContract(contract) {
	const errors = [];
	if (contract.status !== 'PREPARED/PREFLIGHT')
		errors.push('status must remain PREPARED/PREFLIGHT');
	if (contract.repository?.repository_id !== 1155412125)
		errors.push('canonical repository id mismatch');
	if (contract.dependencies?.c02?.status !== 'closed')
		errors.push('PSP-P02 must be recorded closed');
	if (
		contract.dependencies?.registry_owner_resolution?.canonical_target !==
		'organvm-vii-kerygma/portfolio'
	)
		errors.push('canonical registry target mismatch');
	if (contract.dependencies?.c03?.exact_head !== 'c94bc3748fcf2d1dc802a4bae972df23d9a9fbec') {
		errors.push('C03 exact-head checkpoint mismatch');
	}
	if (
		contract.dependencies?.c03?.registry_alignment_commit !==
		'986ebb41778cf082e01ede0cb6d268cebf54a106'
	) {
		errors.push('C03 registry-alignment checkpoint mismatch');
	}
	if (contract.dependencies?.c03?.formal_closure_required !== true)
		errors.push('C03 closure must remain required');
	if (
		JSON.stringify(contract.dependencies?.c03?.closed_leaves) !==
		JSON.stringify([
			'PSP-P03-W01',
			'PSP-P03-W02',
			'PSP-P03-W03',
			'PSP-P03-W04',
			'PSP-P03-W05',
			'PSP-P03-W06',
		])
	)
		errors.push('C03 closed leaves must be W01-W06');
	if (contract.dependencies?.c03?.sole_unsatisfied_leaf?.work_id !== 'PSP-P03-W07')
		errors.push('C03 sole unsatisfied leaf must be PSP-P03-W07');
	if (contract.dependencies?.c03?.sole_unsatisfied_leaf?.outbound_from_c04 !== false)
		errors.push('C04 must not solicit W07 readers');
	if (
		contract.dependencies?.c03?.w06_receipt?.url !==
		'https://github.com/organvm/limen/issues/2187#issuecomment-5271254820'
	)
		errors.push('C03 W06 receipt URL mismatch');
	if (
		contract.dependencies?.c03?.w06_receipt?.sha256 !==
		'260081dfbffc75d55824c0e6ed7d7718a7e397763afb689c94d2230963d79617'
	)
		errors.push('C03 W06 receipt SHA mismatch');
	if (contract.identity_contract?.authority_boundary?.scope !== 'sponsor-granted and written')
		errors.push('accepted W06 authority boundary mismatch');

	const routeOwners = new Map();
	for (const route of contract.canonical_routes ?? []) {
		if (!route.route?.startsWith('/')) errors.push(`route is not canonical: ${route.route}`);
		for (const artifactId of route.artifact_ids ?? []) {
			if (routeOwners.has(artifactId))
				errors.push(`artifact has multiple canonical routes: ${artifactId}`);
			routeOwners.set(artifactId, route.route);
		}
	}

	const privateLevel = (contract.disclosure_levels ?? []).find(
		(level) => level.id === 'PRIVATE_WITHHELD',
	);
	if (!privateLevel || !privateLevel.forbidden?.includes('route'))
		errors.push('private disclosure must be non-routable');
	if ((contract.canonical_routes ?? []).some((route) => route.level === 'PRIVATE_WITHHELD')) {
		errors.push('private disclosure cannot have a canonical route');
	}

	const partner = (contract.audience_flows ?? []).find(
		(flow) => flow.audience_id === 'product_operating_partner',
	);
	if (
		!partner ||
		partner.public_door !== false ||
		partner.L1?.required?.length ||
		partner.L2?.required?.length
	) {
		errors.push('operating partner must remain absent from L1 and L2');
	}

	const requiredStates = new Set([
		'loading',
		'ready',
		'empty',
		'stale',
		'error',
		'withheld',
		'private',
	]);
	for (const state of contract.evidence_card_states ?? []) requiredStates.delete(state.id);
	if (requiredStates.size)
		errors.push(`missing evidence states: ${[...requiredStates].sort().join(', ')}`);

	const performance = contract.quality_budgets?.performance ?? {};
	if (
		performance.lcp_ms_p75_max > 2500 ||
		performance.inp_ms_p75_max > 200 ||
		performance.cls_p75_max > 0.1
	) {
		errors.push('core performance budgets are too weak');
	}
	if (contract.quality_budgets?.reduced_motion?.required !== true)
		errors.push('reduced motion must be required');

	const gate = contract.visual_ideation_gate ?? {};
	if (gate.option_slots?.length !== 3 || new Set(gate.option_slots).size !== 3)
		errors.push('ideation gate requires exactly three options');
	if (!String(gate.status).startsWith('LOCKED_')) errors.push('ideation gate must remain locked');
	if ('selected_direction' in gate) errors.push('preflight cannot select a visual direction');

	const serialized = JSON.stringify(contract).toLowerCase();
	if (serialized.includes('$'))
		errors.push('public contract cannot contain numeric price notation');
	return errors;
}

async function main() {
	const contract = await loadContract();
	const errors = validateContract(contract);
	const result = {
		contract: fileURLToPath(defaultContractUrl),
		status: errors.length ? 'fail' : 'pass',
		errors,
	};
	console.log(JSON.stringify(result, null, 2));
	if (errors.length) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
