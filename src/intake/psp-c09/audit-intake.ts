export const PSP_C09_SOURCE_LOCK = {
	commercialContract: {
		repository: 'organvm/limen',
		pullRequest: 2312,
		head: 'b6af8086c9050634313f519c29a6dfcb922c3721',
		mergeCommit: '8f89ad16ca1df84b00cb8227c88f368d0d64631a',
		acceptedThrough: 'PSP-P03-W06',
		readerGate: 'PSP-P03-W07',
		readerIssue: 2188,
		readerEvidenceSatisfied: false,
	},
	deliveryOs: {
		repository: 'organvm-iii-ergon/collaboration-operations-platform',
		pullRequest: 135,
		head: '432c31ea6bcaf2c175b0fde08b6e1733fe4c2926',
		mergeCommit: '9172619633bb9a09ea3a05eae9f48e987f2b3e7d',
		limenRelayPullRequest: 2315,
		limenRelayHead: '1f884631f7472552a038cef6cb85468cec618f35',
	},
	proofLedContent: {
		repository: 'organvm/limen',
		pullRequest: 2316,
		head: '78736b8133c98e59d85069ea54eba2f20ed7b0a2',
		state: 'prepared_preflight',
	},
	proofExperience: {
		repository: 'organvm/limen',
		pullRequest: 2313,
		head: '543fa28df52c9db7be3b7307019dcf209361d0b9',
		state: 'prepared_preflight',
	},
	experienceContract: {
		repository: 'organvm-vii-kerygma/portfolio',
		pullRequest: 220,
		head: '8974543ba9675ed0504141895812476efef5dd80',
		mergeCommit: 'a01b6d85f78d2d744c0c994f7220081bb54a85c5',
		state: 'merged_preflight_contract',
	},
	publicSurfaces: {
		repository: 'organvm-vii-kerygma/portfolio',
		pullRequest: 221,
		head: 'cacb53c1b2514ed52f926b64f0944d35526fbbf1',
		limenRelayPullRequest: 2317,
		limenRelayHead: '4eb50463b7f4136b47a103c9792c1ded5caf7873',
		state: 'prepared_preflight',
		legacyDeadLinkCount: 11,
		canonicalRepository: 'organvm-vii-kerygma/portfolio',
		visualDirectionSelected: false,
		renderedSurfaceChangesAuthorized: false,
	},
	privateInbound: {
		repository: 'organvm/limen',
		pullRequest: 2318,
		head: '947921af6c1101acda6b1085d45381a393f3b20a',
		state: 'prepared_preflight',
		externalEffects: [],
	},
} as const;

export type AuditIntakeRoute = 'audit' | 'one_bounded_follow_up' | 'human_review' | 'decline';

export interface RegistryQualificationRef {
	workId: 'PSP-P10-W01';
	sourceHead: string;
	scoreId: string;
	route: AuditIntakeRoute;
	uncertainty: 'low' | 'medium' | 'high';
}

export interface AuditIntakeInput {
	opportunityId: string;
	partitionId: string;
	decision: string;
	decisionBy: string;
	initiativeBoundary: string;
	sponsorRole: string;
	handoffOwnerRole: string;
	evidenceCategories: string[];
	constraints: string[];
	qualification: RegistryQualificationRef;
}

export interface AuditIntakeDraft extends AuditIntakeInput {
	schemaVersion: 'portfolio.psp-c09.audit-intake-draft.v1';
	status: 'draft_only';
	synthetic: true;
	doorTag: 'client';
	offerTag: 'agentic_delivery_audit';
	externalEffects: [];
	transport: 'none';
}

const secretPattern =
	/(?:password|secret|api[_ -]?key|access[_ -]?token|refresh[_ -]?token|private[_ -]?key|session[_ -]?cookie|credential)/i;

export function createAuditIntakeDraft(input: AuditIntakeInput): AuditIntakeDraft {
	if (
		!input.opportunityId.startsWith('synthetic_') ||
		!input.partitionId.startsWith('synthetic_')
	) {
		throw new Error('preflight intake accepts synthetic opaque identifiers only');
	}
	if (input.qualification.workId !== 'PSP-P10-W01' || !input.qualification.sourceHead) {
		throw new Error('registry-derived W01 qualification is required');
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(input.decisionBy)) {
		throw new Error('a dated decision is required');
	}
	if (!input.sponsorRole || !input.handoffOwnerRole || !input.initiativeBoundary) {
		throw new Error('bounded sponsor, initiative, and handoff owner are required');
	}
	if (input.evidenceCategories.length === 0) throw new Error('evidence categories are required');

	for (const [key, value] of Object.entries(input)) {
		if (secretPattern.test(key) || secretPattern.test(JSON.stringify(value))) {
			throw new Error(`secret-shaped material prohibited: ${key}`);
		}
	}

	return {
		...structuredClone(input),
		schemaVersion: 'portfolio.psp-c09.audit-intake-draft.v1',
		status: 'draft_only',
		synthetic: true,
		doorTag: 'client',
		offerTag: 'agentic_delivery_audit',
		externalEffects: [],
		transport: 'none',
	};
}

export type SyntheticConversionEventName =
	| 'offer_viewed'
	| 'fit_reviewed'
	| 'intake_started'
	| 'intake_routed'
	| 'draft_decision_recorded';

export interface SyntheticConversionEvent {
	schemaVersion: 'portfolio.psp-c09.conversion-event.v1';
	eventId: string;
	event: SyntheticConversionEventName;
	opportunityId: string;
	doorTag: 'client';
	offerTag: 'agentic_delivery_audit';
	route: AuditIntakeRoute;
	synthetic: true;
	personalData: false;
	transport: 'none';
	externalEffects: [];
}

export function buildSyntheticConversionEvent(input: {
	eventId: string;
	event: SyntheticConversionEventName;
	draft: AuditIntakeDraft;
}): SyntheticConversionEvent {
	if (!input.eventId.startsWith('synthetic_')) throw new Error('synthetic event id required');
	return {
		schemaVersion: 'portfolio.psp-c09.conversion-event.v1',
		eventId: input.eventId,
		event: input.event,
		opportunityId: input.draft.opportunityId,
		doorTag: input.draft.doorTag,
		offerTag: input.draft.offerTag,
		route: input.draft.qualification.route,
		synthetic: true,
		personalData: false,
		transport: 'none',
		externalEffects: [],
	};
}

export interface TargetReaderContract {
	audience: string;
	expensiveProblem: string;
	proofRefs: string[];
	nextStep: string;
	fitSignals: string[];
	exclusions: string[];
}

export function targetReaderComprehension(contract: TargetReaderContract): {
	pass: boolean;
	missing: string[];
} {
	const missing: string[] = [];
	if (!contract.audience) missing.push('audience');
	if (!contract.expensiveProblem) missing.push('expensive_problem');
	if (contract.proofRefs.length === 0) missing.push('proof');
	if (!contract.nextStep) missing.push('next_step');
	if (contract.fitSignals.length === 0) missing.push('fit');
	if (contract.exclusions.length === 0) missing.push('exclusions');
	return { pass: missing.length === 0, missing };
}
