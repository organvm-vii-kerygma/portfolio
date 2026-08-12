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
		head: '6ff7d4e6bd9003213e2675f4e8d59c41a3726b3b',
		limenRelayPullRequest: 2315,
		limenRelayHead: 'a72a05d917bf14d53221c7d02ec52d3786b4f88e',
	},
	proofLedContent: {
		repository: 'organvm/limen',
		pullRequest: 2316,
		head: 'a7937bb1e122574edc5d9e9cb74e18538d2b86c5',
		state: 'prepared_preflight',
	},
	proofExperience: {
		repository: 'organvm/limen',
		pullRequest: 2313,
		head: '23712398c6586e005c303eff632604985cd0a25c',
		state: 'prepared_preflight',
	},
	experienceContract: {
		repository: 'organvm-vii-kerygma/portfolio',
		pullRequest: 220,
		head: '9bcc4606b68da83dc0878b060989d35c3b649d7f',
		state: 'prepared_preflight',
	},
	publicSurfaces: {
		repository: 'organvm-vii-kerygma/portfolio',
		pullRequest: 221,
		head: '6cb7f291ef758d26d136620398c6e9c09f74d0ea',
		limenRelayPullRequest: 2317,
		limenRelayHead: 'b3c8dcb8ee461fad7be971efc0fc60ca27726668',
		state: 'prepared_preflight',
		legacyDeadLinkCount: 11,
		canonicalRepository: 'organvm-vii-kerygma/portfolio',
		visualDirectionSelected: false,
		renderedSurfaceChangesAuthorized: false,
	},
	privateInbound: {
		repository: 'organvm/limen',
		pullRequest: 2318,
		head: '6ee6bd7d546a56474cf3bd38e06fad794ab7bc45',
		state: 'prepared_preflight',
		externalEffects: [],
	},
} as const;

export type AuditIntakeRoute = 'audit' | 'human_review' | 'decline';

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
