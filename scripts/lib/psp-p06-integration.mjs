const HEAD = /^[0-9a-f]{40}$/;
const PRICE = /(?:[$€£]\s*\d|\b(?:usd|eur|gbp)\s*\d)/i;
const PRIVATE = new Set([
	'customer',
	'customer_name',
	'email',
	'private_path',
	'private_repository',
	'private_value',
	'pricing_amount',
	'secret',
	'token',
]);
const ARRAYS = new Set([
	'acceptance',
	'audience_actions',
	'change_history',
	'claim_refs',
	'claim_register',
	'evidence_ids',
	'exclusions',
	'failure_modes',
	'limitations',
	'proof_receipts',
	'qualification',
]);

function keys(value, found = new Set()) {
	if (Array.isArray(value)) for (const item of value) keys(item, found);
	else if (value && typeof value === 'object')
		for (const [key, item] of Object.entries(value)) {
			found.add(key);
			keys(item, found);
		}
	return found;
}

function privacyErrors(value) {
	const errors = [];
	const found = [...keys(value)].filter((key) => PRIVATE.has(key));
	if (found.length) errors.push(`private fields are prohibited: ${found.sort().join(', ')}`);
	if (PRICE.test(JSON.stringify(value))) errors.push('numeric public pricing is prohibited');
	return errors;
}

export function validateAudienceFlows(contract) {
	const errors = [];
	const flows = contract.audience_flows ?? [];
	const publicFlows = flows.filter((flow) => flow.public_door);
	if (
		publicFlows.length !== 2 ||
		!publicFlows.some((flow) => flow.audience_id === 'direct_client') ||
		!publicFlows.some((flow) => flow.audience_id === 'recruiter_executive')
	)
		errors.push('exactly the client and recruiter doors must be public');
	for (const flow of publicFlows) {
		if (flow.max_actions_from_L1_to_L3 > 2)
			errors.push(`${flow.audience_id} exceeds the two-action depth budget`);
		for (const level of ['L1', 'L2', 'L3'])
			if (!Array.isArray(flow[level]?.required) || !flow[level].required.length)
				errors.push(`${flow.audience_id} ${level} requirements are missing`);
	}
	const partner = flows.find((flow) => flow.audience_id === 'product_operating_partner');
	if (
		!partner ||
		partner.public_door !== false ||
		partner.L1?.required?.length ||
		partner.L2?.required?.length
	)
		errors.push('operating partner must remain absent from L1 and L2');
	return errors;
}

export function syntheticContentFixture(contract) {
	const typeById = {
		front_door: 'identity_block',
		client_door: 'audience_door',
		recruiter_door: 'audience_door',
		public_evidence_register: 'diligence_index',
		estate_diligence_index: 'diligence_index',
	};
	return {
		synthetic_only: true,
		objects: (contract.canonical_routes ?? []).flatMap((route) =>
			(route.artifact_ids ?? []).map((id) => {
				const type = typeById[id] ?? 'proof_object';
				const object = {
					id,
					type,
					disclosure_level: route.level,
					canonical_route: route.route,
				};
				const definition = contract.content_types.find((row) => row.id === type);
				for (const field of definition.required_fields)
					if (!(field in object))
						object[field] = ARRAYS.has(field)
							? field === 'limitations'
								? ['Synthetic fixture only.']
								: []
							: field === 'observed_at'
								? '2026-08-10'
								: field === 'status'
									? 'withheld'
									: field === 'audience_id'
										? id === 'recruiter_door'
											? 'recruiter_executive'
											: 'direct_client'
										: 'synthetic';
				return object;
			}),
		),
	};
}

export function projectContent(contract, model) {
	const errors = [...validateAudienceFlows(contract)];
	if (model?.synthetic_only !== true && model?.source_status !== 'ratified_public')
		errors.push('content must be synthetic or ratified public');
	if (!Array.isArray(model?.objects))
		return { status: 'fail', errors: [...errors, 'objects must be a list'] };
	const owners = new Map();
	for (const route of contract.canonical_routes ?? [])
		for (const id of route.artifact_ids ?? []) {
			if (owners.has(id)) errors.push(`${id} has multiple canonical routes`);
			owners.set(id, route);
		}
	const seen = new Set();
	const projection = [];
	for (const object of model.objects) {
		errors.push(...privacyErrors(object));
		if (!object.id || seen.has(object.id))
			errors.push(`duplicate or missing object id: ${object.id}`);
		seen.add(object.id);
		if (object.disclosure_level === 'PRIVATE_WITHHELD')
			errors.push(`${object.id} is private and non-routable`);
		const type = contract.content_types.find((row) => row.id === object.type);
		if (!type) errors.push(`${object.id} has unknown type`);
		else {
			if (!type.allowed_levels.includes(object.disclosure_level))
				errors.push(`${object.id} has an invalid disclosure level`);
			for (const field of type.required_fields)
				if (!(field in object) || object[field] === null)
					errors.push(`${object.id} missing ${field}`);
		}
		if (
			object.audience_id === 'product_operating_partner' &&
			['L1', 'L2'].includes(object.disclosure_level)
		)
			errors.push('operating partner is prohibited at L1 and L2');
		const route = owners.get(object.id);
		if (!route) errors.push(`${object.id} has no canonical route`);
		else {
			if (object.canonical_route !== route.route) errors.push(`${object.id} route mismatch`);
			if (object.disclosure_level !== route.level) errors.push(`${object.id} disclosure mismatch`);
			projection.push({
				id: object.id,
				route: route.route,
				level: route.level,
				type: object.type,
			});
		}
	}
	const missing = [...owners.keys()].filter((id) => !seen.has(id));
	if (missing.length) errors.push(`missing route artifacts: ${missing.join(', ')}`);
	return { status: errors.length ? 'fail' : 'pass', errors, projection };
}

export function validateEvidenceCard(contract, card) {
	const errors = [...privacyErrors(card)];
	const states = new Set(contract.evidence_card_states.map((row) => row.id));
	if (!states.has(card.state)) errors.push('unknown evidence state');
	if (!['L2', 'L3'].includes(card.disclosure_level))
		errors.push('evidence cards are limited to L2 and L3');
	for (const field of [
		'evidence_id',
		'claim_id',
		'state',
		'summary',
		'limitations',
		'withdrawal_action',
	])
		if (!(field in card)) errors.push(`evidence card missing ${field}`);
	if (card.state === 'ready') {
		if (!HEAD.test(card.exact_head ?? '')) errors.push('ready evidence requires an exact head');
		if (!card.source_url || !card.observed_at)
			errors.push('ready evidence requires a dated source');
		if (!card.limitations?.length) errors.push('ready evidence requires limitations');
	} else if (card.claim_value !== null && card.claim_value !== undefined)
		errors.push(`${card.state} evidence cannot expose a claim value`);
	return errors;
}

function cap(errors, label, value, maximum) {
	if (!Number.isFinite(value)) errors.push(`${label} is missing`);
	else if (value > maximum) errors.push(`${label} exceeds budget`);
}

export function evaluateQuality(contract, fixture) {
	const errors = [];
	const a11y = fixture.accessibility ?? {};
	if (a11y.standard !== contract.quality_budgets.accessibility.target)
		errors.push('accessibility standard mismatch');
	for (const field of [
		'automated_critical',
		'keyboard_blockers',
		'focus_blockers',
		'reflow_blockers',
	])
		if (a11y[field] !== 0) errors.push(`${field} must be zero`);
	if (!a11y.heading_structure_pass || !a11y.zoom_200_pass)
		errors.push('structure and zoom must pass');
	const budget = contract.quality_budgets.performance;
	for (const viewport of ['mobile', 'desktop']) {
		const row = fixture.performance?.[viewport] ?? {};
		for (const [field, maximum] of [
			['lcp_ms_p75', budget.lcp_ms_p75_max],
			['inp_ms_p75', budget.inp_ms_p75_max],
			['cls_p75', budget.cls_p75_max],
			['initial_js_gzip_kb', budget.initial_js_gzip_kb_max],
			['initial_css_gzip_kb', budget.initial_css_gzip_kb_max],
			['l1_media_kb', budget.l1_media_kb_max],
		])
			cap(errors, `${viewport} ${field}`, row[field], maximum);
	}
	const motion = fixture.reduced_motion ?? {};
	if (
		!motion.media_query_present ||
		!motion.nonessential_motion_disabled ||
		motion.content_dependency
	)
		errors.push('reduced-motion contract failed');
	const responsive = fixture.responsive ?? {};
	for (const width of contract.quality_budgets.responsive.required_viewports_css_px)
		if (!responsive.viewports_css_px?.includes(width)) errors.push(`missing viewport ${width}`);
	if (responsive.horizontal_scroll_failures !== 0 || !responsive.reading_order_pass)
		errors.push('responsive contract failed');
	const visual = fixture.visual_quality ?? {};
	if (visual.critical_failures?.length) errors.push('visual quality has critical failures');
	for (const dimension of contract.qa_rubric.scored_dimensions)
		if (!Number.isFinite(visual.scores?.[dimension]))
			errors.push(`missing visual score: ${dimension}`);
		else if (visual.scores[dimension] < visual.floor)
			errors.push(`visual score below floor: ${dimension}`);
	return {
		status: errors.length ? 'fail' : 'pass',
		errors,
		production_evidence: fixture.evidence_kind === 'measured_selected_direction',
	};
}

export function formalizationReadiness(contract, receipt = null) {
	const errors = [];
	if (receipt) {
		if (
			receipt.chunk_id !== 'PSP-C03' ||
			receipt.status !== 'pass' ||
			!HEAD.test(receipt.exact_head ?? '')
		)
			errors.push('invalid C03 closure receipt');
		if (
			receipt.accepted_preflight_ancestor !== contract.dependencies.c03.exact_head ||
			receipt.ancestor_check !== 'pass'
		)
			errors.push('C03 ancestry is unproven');
		if (
			receipt.phase_predicates?.['PSP-P03'] !== 'pass' ||
			receipt.phase_predicates?.['PSP-P04'] !== 'pass' ||
			!receipt.w07_receipt?.url ||
			!receipt.w07_receipt?.sha256
		)
			errors.push('W07 or C03 phase predicates are missing');
	}
	const ready = Boolean(receipt) && !errors.length;
	return {
		status: ready ? 'ready_for_three_direction_ideation' : 'PREPARED/PREFLIGHT',
		ready,
		errors,
		residual_gates: ready
			? []
			: ['PSP-P03-W07 genuine five-reader receipt', 'PSP-C03 formal closure'],
		visual_implementation_allowed: false,
		formal_closure_allowed: false,
	};
}
