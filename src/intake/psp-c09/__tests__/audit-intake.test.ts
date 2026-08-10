import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import offer from '../../../content/psp-c09/agentic-delivery-audit.preflight.json';
import manifest from '../../../content/psp-c09/preflight-manifest.json';
import {
	buildSyntheticConversionEvent,
	createAuditIntakeDraft,
	PSP_C09_SOURCE_LOCK,
	targetReaderComprehension,
} from '../audit-intake';

const root = resolve(import.meta.dirname, '../../../..');

function syntheticDraft() {
	return createAuditIntakeDraft({
		opportunityId: 'synthetic_portfolio_audit_01',
		partitionId: 'synthetic_partition_audit_01',
		decision: 'Keep, narrow, stop, or govern one synthetic delivery initiative.',
		decisionBy: '2026-08-31',
		initiativeBoundary: 'One synthetic team and delivery workflow.',
		sponsorRole: 'VP Engineering',
		handoffOwnerRole: 'Platform lead',
		evidenceCategories: ['workflow_map', 'ci_summary', 'sanitized_failure_examples'],
		constraints: ['read_only', 'no_production_effect'],
		qualification: {
			workId: 'PSP-P10-W01',
			sourceHead: 'synthetic_w01_preflight_head',
			scoreId: 'synthetic_score_01',
			route: 'audit',
			uncertainty: 'low',
		},
	});
}

describe('PSP-P10-W04 sales and intake preflight', () => {
	it('locks exact upstream preflight heads without copying their contracts', () => {
		expect(PSP_C09_SOURCE_LOCK.commercialContract.head).toBe(
			'b5bc01585a10615e85e1ef5b31a2356c24fb9bc9',
		);
		expect(PSP_C09_SOURCE_LOCK.deliveryOs.head).toBe('4ae8e81665e35e6a5d403a3e13935021ce6544ec');
		expect(PSP_C09_SOURCE_LOCK.proofLedContent.head).toBe(
			'36bf386c22e64785db8e7843899bf9aabf85bf89',
		);
		expect(PSP_C09_SOURCE_LOCK.experienceContract.head).toBe(
			'fa86b67a7283c15ab801302ffac655c30898b6a1',
		);
		expect(PSP_C09_SOURCE_LOCK.publicSurfaces).toMatchObject({
			head: '7283219f98053aabfede5c41467c7cc1010165c3',
			limenRelayHead: 'f5c5a03749a3ec44cf7eab278735b07f841bf60a',
			legacyDeadLinkCount: 11,
			visualDirectionSelected: false,
			renderedSurfaceChangesAuthorized: false,
		});
	});

	it('builds a tagged local intake draft with no contact data, transport, or external effect', () => {
		const draft = syntheticDraft();
		expect(draft).toMatchObject({
			status: 'draft_only',
			synthetic: true,
			doorTag: 'client',
			offerTag: 'agentic_delivery_audit',
			transport: 'none',
			externalEffects: [],
		});
		expect(draft).not.toHaveProperty('email');
		expect(draft).not.toHaveProperty('name');
		expect(draft).not.toHaveProperty('send');
	});

	it('rejects secret-shaped material and incomplete authority boundaries', () => {
		expect(() =>
			createAuditIntakeDraft({
				...syntheticDraft(),
				constraints: ['paste access_token for review'],
			}),
		).toThrow('secret-shaped material prohibited');
		expect(() =>
			createAuditIntakeDraft({
				...syntheticDraft(),
				sponsorRole: '',
			}),
		).toThrow('bounded sponsor');
	});

	it('records conversion instrumentation as synthetic local events only', () => {
		const event = buildSyntheticConversionEvent({
			eventId: 'synthetic_event_01',
			event: 'intake_routed',
			draft: syntheticDraft(),
		});
		expect(event).toMatchObject({
			route: 'audit',
			synthetic: true,
			personalData: false,
			transport: 'none',
			externalEffects: [],
		});
	});

	it('passes the target-reader comprehension contract with explicit fit and exclusions', () => {
		expect(targetReaderComprehension(offer.readerContract)).toEqual({ pass: true, missing: [] });
		expect(targetReaderComprehension({ ...offer.readerContract, proofRefs: [] })).toEqual({
			pass: false,
			missing: ['proof'],
		});
	});

	it('keeps W04 contract-only with no page, route, component, visual, or numeric price claim', () => {
		const pagePath = resolve(root, 'src/pages/psp-c09/agentic-delivery-audit.astro.preflight');
		expect(existsSync(pagePath)).toBe(false);
		expect(manifest.paths.some((path) => path.startsWith('src/pages/'))).toBe(false);
		expect(manifest.renderedSurfaceChanged).toBe(false);
		expect(manifest.pageOrComponentCreated).toBe(false);
		expect(JSON.stringify(offer)).not.toMatch(/[$£€]|\b(?:USD|GBP|EUR)\b/);
		expect(offer.activeRoute).toBe(false);
		expect(offer.published).toBe(false);
		expect(offer.publicSurfaceBoundary).toEqual({
			visualDirectionSelected: false,
			visualImplementationAuthorized: false,
			renderedRouteOrComponentAuthorized: false,
			legacyDeadLinkCount: 11,
			linkHealthState: 'recorded_not_repaired',
			canonicalRepository: 'organvm-vii-kerygma/portfolio',
		});
	});

	it('homes the W04 artifacts and preserves its exact formal assignment for later execution', () => {
		expect(manifest).toMatchObject({
			workId: 'PSP-P10-W04',
			assignedModel: 'gpt-5.6-terra',
			assignedEffort: 'high',
			status: 'prepared_preflight',
			formalPredicateRun: false,
			formalIssueClosed: false,
			externalEffects: [],
		});
		for (const path of manifest.paths) expect(existsSync(resolve(root, path))).toBe(true);
	});
});
