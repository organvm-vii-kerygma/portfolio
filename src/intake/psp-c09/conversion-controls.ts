import type { AuditIntakeDraft, AuditIntakeRoute } from './audit-intake';

export type Cta = 'audit_draft' | 'bounded_follow_up' | 'human_review' | 'decline';
export type Stage =
	| 'offer'
	| 'fit'
	| 'intake_draft'
	| 'qualification'
	| 'decision_draft'
	| 'human_effect_gate'
	| 'human_review'
	| 'declined';

export interface Authority {
	conversationConsent: 'synthetic_recorded' | 'not_recorded' | 'withdrawn';
	followUpConsent: 'synthetic_recorded' | 'not_recorded' | 'withdrawn';
	decisionAuthority: 'named_role' | 'missing';
	evidenceAccess: 'read_only_declared' | 'not_declared';
	sendAuthority: 'human_gate';
	signatureAuthority: 'human_gate';
}

export interface Projection {
	id: string;
	partitionId: string;
	route: AuditIntakeRoute;
	cta: Cta;
	stage: Stage;
	authority: Authority;
	history: Array<{ from: Stage; to: Stage; reason: string }>;
	synthetic: true;
	contactFields: [];
	transport: 'none';
	externalEffects: [];
}

const graph: Record<Stage, Stage[]> = {
	offer: ['fit', 'human_review', 'declined'],
	fit: ['intake_draft', 'human_review', 'declined'],
	intake_draft: ['qualification', 'human_review', 'declined'],
	qualification: ['decision_draft', 'human_review', 'declined'],
	decision_draft: ['human_effect_gate', 'human_review', 'declined'],
	human_effect_gate: [],
	human_review: [],
	declined: [],
};

export function routeCta(route: AuditIntakeRoute): Cta {
	return {
		audit: 'audit_draft',
		one_bounded_follow_up: 'bounded_follow_up',
		human_review: 'human_review',
		decline: 'decline',
	}[route] as Cta;
}

export function createProjection(draft: AuditIntakeDraft, authority: Authority): Projection {
	if (!draft.synthetic || draft.transport !== 'none' || draft.externalEffects.length) {
		throw new Error('local_synthetic_draft_required');
	}
	if (authority.sendAuthority !== 'human_gate' || authority.signatureAuthority !== 'human_gate') {
		throw new Error('human_effect_gates_required');
	}
	if (
		draft.qualification.route === 'audit' &&
		(authority.conversationConsent !== 'synthetic_recorded' ||
			authority.decisionAuthority !== 'named_role' ||
			authority.evidenceAccess !== 'read_only_declared')
	) {
		throw new Error('audit_authority_required');
	}
	if (
		draft.qualification.route === 'one_bounded_follow_up' &&
		authority.followUpConsent !== 'synthetic_recorded'
	) {
		throw new Error('follow_up_consent_required');
	}
	if (authority.conversationConsent === 'withdrawn' && draft.qualification.route !== 'decline') {
		throw new Error('withdrawn_consent');
	}
	return {
		id: draft.opportunityId,
		partitionId: draft.partitionId,
		route: draft.qualification.route,
		cta: routeCta(draft.qualification.route),
		stage: 'offer',
		authority: structuredClone(authority),
		history: [],
		synthetic: true,
		contactFields: [],
		transport: 'none',
		externalEffects: [],
	};
}

export function transition(record: Projection, to: Stage, reason: string): Projection {
	if (!graph[record.stage].includes(to)) {
		throw new Error('invalid_transition:' + record.stage + '->' + to);
	}
	if (!reason.trim()) throw new Error('reason_required');
	if (record.authority.conversationConsent === 'withdrawn' && to !== 'declined') {
		throw new Error('withdrawn_consent');
	}
	if (record.cta === 'decline' && to !== 'declined') throw new Error('decline_only');
	if (record.cta === 'human_review' && to !== 'human_review') {
		throw new Error('human_review_only');
	}
	if (record.cta === 'bounded_follow_up' && to === 'human_effect_gate') {
		throw new Error('no_send_boundary');
	}
	return {
		...structuredClone(record),
		stage: to,
		history: [...record.history, { from: record.stage, to, reason }],
		externalEffects: [],
	};
}

export interface Scenario {
	id: string;
	draft: AuditIntakeDraft;
	authority: Authority;
	steps: Array<{ to: Stage; reason: string }>;
	expectedStage: Stage;
	expectedCta: Cta;
}

export function runScenario(scenario: Scenario): Projection {
	if (!scenario.id.startsWith('synthetic_')) throw new Error('scenario_id');
	let record = createProjection(scenario.draft, scenario.authority);
	for (const step of scenario.steps) {
		record = transition(record, step.to, step.reason);
	}
	if (record.stage !== scenario.expectedStage || record.cta !== scenario.expectedCta) {
		throw new Error('scenario_mismatch');
	}
	return record;
}
