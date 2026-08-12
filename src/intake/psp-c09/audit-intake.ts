export const PSP_C09_SOURCE_LOCK = {
	commercialContract: {
		repository: 'organvm/limen',
		pullRequest: 2312,
		head: 'c94bc3748fcf2d1dc802a4bae972df23d9a9fbec',
		acceptedThrough: 'PSP-P03-W06',
		readerGate: 'PSP-P03-W07',
		readerIssue: 2188,
		readerEvidenceSatisfied: false,
	},
	deliveryOs: {
		repository: 'organvm-iii-ergon/collaboration-operations-platform',
		pullRequest: 135,
		head: '2c4efce84082f344fd5e0d90cc110662a379435f',
		limenRelayPullRequest: 2315,
		limenRelayHead: 'fdd41da45bdf5909e7b782a03dbaedf85e105c25',
	},
	proofLedContent: {
		repository: 'organvm/limen',
		pullRequest: 2316,
		head: 'ef6e4df64f97c11dba2c159752d5a13b50a96c10',
		state: 'prepared_preflight',
	},
	proofExperience: {
		repository: 'organvm/limen',
		pullRequest: 2313,
		head: '5bf686f6ceba200c6157bd87eb6e5298750a4ffb',
		state: 'prepared_preflight',
	},
	experienceContract: {
		repository: 'organvm-vii-kerygma/portfolio',
		pullRequest: 220,
		head: '8974543ba9675ed0504141895812476efef5dd80',
		state: 'prepared_preflight',
	},
	publicSurfaces: {
		repository: 'organvm-vii-kerygma/portfolio',
		pullRequest: 221,
		head: '6cb1abf0bf08e71341476886385eba5499c51bb7',
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
		head: 'c3b92707a0f6d0ea3076680d100d60d0217f8fe9',
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
