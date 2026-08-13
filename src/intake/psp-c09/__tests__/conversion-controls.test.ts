import { describe, expect, it } from 'vitest';

import { type AuditIntakeRoute, createAuditIntakeDraft } from '../audit-intake';
import {
	type Authority,
	createProjection,
	routeCta,
	runScenario,
	type Scenario,
	transition,
} from '../conversion-controls';

const authority: Authority = {
	conversationConsent: 'synthetic_recorded',
	followUpConsent: 'synthetic_recorded',
	decisionAuthority: 'named_role',
	evidenceAccess: 'read_only_declared',
	sendAuthority: 'human_gate',
	signatureAuthority: 'human_gate',
};

const draft = (route: AuditIntakeRoute) =>
	createAuditIntakeDraft({
		opportunityId: 'synthetic_' + route,
		partitionId: 'synthetic_partition_' + route,
		decision: 'Bounded synthetic decision',
		decisionBy: '2026-08-31',
		initiativeBoundary: 'One synthetic workflow',
		sponsorRole: 'Sponsor role',
		handoffOwnerRole: 'Owner role',
		evidenceCategories: ['workflow_map'],
		constraints: ['read_only'],
		qualification: {
			workId: 'PSP-P10-W01',
			sourceHead: 'synthetic_w01_head',
			scoreId: 'synthetic_score_' + route,
			route,
			uncertainty: 'low',
		},
	});

describe('portfolio local conversion controls', () => {
	it('routes every CTA locally', () => {
		expect(
			(['audit', 'one_bounded_follow_up', 'human_review', 'decline'] as const).map(routeCta),
		).toEqual(['audit_draft', 'bounded_follow_up', 'human_review', 'decline']);
	});

	it('requires consent and authority', () => {
		expect(() =>
			createProjection(draft('audit'), {
				...authority,
				decisionAuthority: 'missing',
			}),
		).toThrow('audit_authority_required');
		expect(() =>
			createProjection(draft('one_bounded_follow_up'), {
				...authority,
				followUpConsent: 'not_recorded',
			}),
		).toThrow('follow_up_consent_required');
		const invalidRouteDraft = {
			...draft('audit'),
			qualification: { ...draft('audit').qualification, route: 'unexpected' },
		};
		expect(() =>
			createProjection(invalidRouteDraft as ReturnType<typeof draft>, authority),
		).toThrow('invalid_qualification_route');
	});

	it('fails closed when bounded follow-up consent is withdrawn after projection', () => {
		const record = createProjection(draft('one_bounded_follow_up'), authority);
		const withdrawn = {
			...record,
			authority: { ...record.authority, followUpConsent: 'withdrawn' as const },
		};
		expect(() => transition(withdrawn, 'fit', 'follow up')).toThrow('follow_up_consent_withdrawn');
		expect(transition(withdrawn, 'human_review', 'manual review').stage).toBe('human_review');
		expect(transition(withdrawn, 'declined', 'consent withdrawn').stage).toBe('declined');
	});

	it('reaches a human gate without transport or rendered effect', () => {
		let record = createProjection(draft('audit'), authority);
		for (const to of [
			'fit',
			'intake_draft',
			'qualification',
			'decision_draft',
			'human_effect_gate',
		] as const) {
			record = transition(record, to, 'synthetic ' + to);
		}
		expect(record).toMatchObject({
			stage: 'human_effect_gate',
			contactFields: [],
			transport: 'none',
			externalEffects: [],
		});
		expect(record).not.toHaveProperty('send');
		expect(record).not.toHaveProperty('sign');
	});

	it('replays audit, follow-up, review, and decline deterministically', () => {
		const scenarios: Scenario[] = [
			{
				id: 'synthetic_audit',
				draft: draft('audit'),
				authority,
				steps: [
					{ to: 'fit', reason: 'fit' },
					{ to: 'intake_draft', reason: 'intake' },
					{ to: 'qualification', reason: 'score' },
					{ to: 'decision_draft', reason: 'decision' },
					{ to: 'human_effect_gate', reason: 'gate' },
				],
				expectedStage: 'human_effect_gate',
				expectedCta: 'audit_draft',
			},
			{
				id: 'synthetic_follow_up',
				draft: draft('one_bounded_follow_up'),
				authority,
				steps: [
					{ to: 'fit', reason: 'fit' },
					{ to: 'intake_draft', reason: 'question' },
					{ to: 'qualification', reason: 'score' },
					{ to: 'decision_draft', reason: 'draft only' },
				],
				expectedStage: 'decision_draft',
				expectedCta: 'bounded_follow_up',
			},
			{
				id: 'synthetic_review',
				draft: draft('human_review'),
				authority,
				steps: [{ to: 'human_review', reason: 'gate' }],
				expectedStage: 'human_review',
				expectedCta: 'human_review',
			},
			{
				id: 'synthetic_decline',
				draft: draft('decline'),
				authority,
				steps: [{ to: 'declined', reason: 'recorded' }],
				expectedStage: 'declined',
				expectedCta: 'decline',
			},
		];
		expect(scenarios.map(runScenario).map((record) => record.stage)).toEqual([
			'human_effect_gate',
			'decision_draft',
			'human_review',
			'declined',
		]);
	});
});
