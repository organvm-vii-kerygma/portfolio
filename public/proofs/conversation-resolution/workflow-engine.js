/* Original, synthetic workflow demonstrator. No network, credentials or real authorization. */
((root) => {
	'use strict';
	const clone = (x) => JSON.parse(JSON.stringify(x));
	const scenarios = ['happy', 'unaccepted', 'ambiguous', 'conflict'];
	class WorkflowDemo {
		constructor(scenario = 'happy') {
			if (!scenarios.includes(scenario)) throw new Error('Unknown scenario');
			this.state = {
				scenario,
				version: 0,
				status: 'unreviewed',
				account: 'demo-account-001',
				accountResolved: scenario !== 'ambiguous',
				conflictPending: scenario === 'conflict',
				scope: null,
				coordinator: 'Case coordinator (simulated)',
				proposedOwner: null,
				acceptedOwner: null,
				deadline: null,
				now: 0,
				escalated: false,
				result: null,
				verification: null,
				communication: null,
				adjudication: null,
				executionCount: 0,
				sourceCount: 0,
				audit: [],
				priorCases: [],
				sources: [],
			};
			const note =
				scenario === 'conflict'
					? 'Enable the new configuration today.'
					: 'Customer Success: prepare the checklist-only handoff.';
			this.seed = [
				{
					tenant: 'demo',
					account: this.state.account,
					id: 'S1',
					revision: 1,
					speaker: 'Customer',
					kind: 'Call excerpt',
					text: 'Send the onboarding checklist. Do not change our live configuration yet.',
				},
				{
					tenant: 'demo',
					account: this.state.account,
					id: 'S2',
					revision: 1,
					speaker: 'Internal teammate',
					kind: 'CRM note',
					text: note,
				},
				{
					tenant: 'demo',
					account: this.state.account,
					id: 'S3',
					revision: 1,
					speaker: 'Customer',
					kind: 'Reply to S1',
					parentId: 'S1',
					text: 'Yes—checklist only.',
				},
			];
			for (const s of this.seed) this._ingest(s);
			this._audit(
				'seeded',
				'Three manually structured synthetic sources. No extraction model was run.',
			);
		}
		_check(condition, message) {
			if (!condition) throw new Error(message);
		}
		_audit(action, detail) {
			this.state.audit.push({
				n: this.state.audit.length + 1,
				version: this.state.version,
				action,
				detail,
			});
		}
		_ingest(s) {
			this._check(
				s && typeof s === 'object' && !Array.isArray(s),
				'A structured source is required.',
			);
			const fields = ['tenant', 'account', 'id', 'speaker', 'kind', 'text'];
			for (const field of fields)
				this._check(
					typeof s[field] === 'string' && s[field].trim().length > 0,
					'Missing source field: ' + field,
				);
			this._check(
				Number.isSafeInteger(s.revision) && s.revision > 0,
				'Source revision must be a positive integer.',
			);
			this._check(
				Object.keys(s).every((k) => [...fields, 'revision', 'parentId'].includes(k)),
				'Unexpected source field.',
			);
			this._check(
				s.tenant === 'demo' && s.account === this.state.account,
				'Cross-account or tenant source rejected.',
			);
			if (s.parentId !== undefined)
				this._check(
					typeof s.parentId === 'string' && this.state.sources.some((x) => x.id === s.parentId),
					'Reply parent must reference a retained source.',
				);
			const key = JSON.stringify([s.tenant, s.account, s.id, s.revision]);
			const old = this.state.sources.find((x) => x.key === key);
			if (old) {
				this._check(
					[...fields, 'revision', 'parentId'].every((k) => old[k] === s[k]),
					'Source evidence changed without a new revision.',
				);
				return false;
			}
			this.state.sources.push({ ...clone(s), key });
			this.state.sourceCount = this.state.sources.length;
			return true;
		}
		dispatch(action, payload = {}, expectedVersion = this.state.version) {
			const before = clone(this.state);
			try {
				this._check(
					Number.isInteger(expectedVersion) && expectedVersion === this.state.version,
					'Stale record version rejected; reread before acting.',
				);
				let detail = '';
				let changed = true;
				const s = this.state;
				if (action === 'resolveAccount') {
					this._check(s.status === 'unreviewed', 'Identity changes require a fresh review.');
					this._check(
						payload.account === s.account,
						'Account selection does not match the source evidence.',
					);
					this._check(
						payload.actor === 'reviewer',
						'Only the simulated reviewer can resolve identity.',
					);
					s.accountResolved = true;
					detail = 'Reviewer matched the evidence to the synthetic account; no CRM write.';
				} else if (action === 'resolveConflict') {
					this._check(
						s.status === 'unreviewed' && s.accountResolved,
						'Resolve account identity before adjudicating scope.',
					);
					this._check(
						payload.actor === 'reviewer',
						'Only the simulated reviewer can adjudicate scope.',
					);
					s.conflictPending = false;
					s.adjudication = {
						actor: payload.actor,
						sourceKeys: s.sources.map((x) => x.key),
						scope: 'checklist-only',
					};
					detail =
						'Reviewer retained all sources and resolved the current conflict to checklist-only scope. No live change is authorized.';
				} else if (action === 'approve') {
					this._check(s.status === 'unreviewed', 'Scope approval is not valid in this state.');
					this._check(
						payload.actor === 'reviewer',
						'Only the simulated reviewer can approve scope.',
					);
					this._check(s.accountResolved, 'Blocked: account identity is ambiguous.');
					this._check(
						!s.conflictPending,
						'Blocked: contradictory instructions require adjudication.',
					);
					this._check(
						payload.scope === 'checklist-only',
						'Blocked: changing live configuration is outside the approved scope.',
					);
					s.scope = payload.scope;
					s.status = 'ready';
					detail = 'Checklist-only plan approved; source links retained.';
				} else if (action === 'propose') {
					this._check(s.status === 'ready', 'Approve scope before proposing ownership.');
					this._check(
						typeof payload.owner === 'string' && payload.owner.trim().length > 0,
						'A named proposed owner is required.',
					);
					s.proposedOwner = payload.owner.trim();
					s.deadline = s.now + 60;
					s.status = 'proposed';
					detail = 'Owner proposed, not accepted. Acceptance deadline: 60 simulated minutes.';
				} else if (action === 'accept') {
					this._check(s.status === 'proposed', 'An outstanding proposal is required.');
					this._check(
						payload.actor === s.proposedOwner,
						'Only the proposed owner can accept this simulated assignment.',
					);
					s.acceptedOwner = s.proposedOwner;
					s.status = 'accepted';
					detail = 'Named owner explicitly accepted the work.';
				} else if (action === 'wait') {
					this._check(
						s.status === 'proposed',
						'This scenario advances the clock only for an unaccepted assignment.',
					);
					s.now += 61;
					s.escalated = true;
					detail =
						'Acceptance deadline exceeded. Coordinator alerted; no owner acceptance invented.';
				} else if (action === 'execute') {
					this._check(s.status === 'accepted', 'Execution requires an accepted owner.');
					this._check(
						payload.actor === s.acceptedOwner,
						'Executor must match the accepted owner in this simulation.',
					);
					this._check(
						s.accountResolved && !s.conflictPending && s.scope === 'checklist-only',
						'Scope or identity gate is no longer valid.',
					);
					s.executionCount += 1;
					s.result = {
						id: 'fixture/checklist-delivery/' + (s.priorCases.length + 1),
						account: s.account,
						scope: s.scope,
						simulated: true,
					};
					s.status = 'executed';
					detail =
						'Synthetic checklist-delivery result recorded. No message or network request was sent.';
				} else if (action === 'verify') {
					this._check(
						s.status === 'executed' && !!s.result,
						'Verification requires an execution result.',
					);
					this._check(
						payload.actor === 'verifier',
						'Verification requires the simulated verifier role.',
					);
					this._check(
						payload.actor !== s.acceptedOwner,
						'Executor and verifier must be different simulated identities.',
					);
					this._check(
						payload.passed === true && payload.resultId === s.result.id,
						'Verification evidence does not match a passing result.',
					);
					s.verification = {
						passed: true,
						resultId: s.result.id,
						actor: payload.actor,
						simulated: true,
					};
					s.status = 'verified';
					detail =
						'Independent verifier role checked the synthetic result fixture. This is not a real delivery check.';
				} else if (action === 'notify') {
					this._check(s.status === 'verified', 'Record the customer update after verification.');
					this._check(
						payload.actor === 'coordinator',
						'Customer communication belongs to the simulated coordinator.',
					);
					if (s.communication) {
						changed = false;
						detail = 'Existing synthetic customer-update receipt retained; duplicate ignored.';
					} else {
						s.communication = {
							id: 'fixture/customer-update/' + (s.priorCases.length + 1),
							simulated: true,
						};
						detail = 'Synthetic customer-update receipt recorded. No email was sent.';
					}
				} else if (action === 'close') {
					this._check(
						s.status === 'verified' && s.verification?.passed,
						'False closure rejected: verification is missing.',
					);
					this._check(
						!!s.communication,
						'Closure blocked: customer communication is not recorded.',
					);
					s.status = 'closed';
					detail = 'Closed with accepted owner, verified result and communication receipt.';
				} else if (action === 'replay') {
					let added = 0;
					for (const source of this.seed) if (this._ingest(source)) added++;
					changed = added > 0;
					detail =
						added === 0
							? `Duplicate source replay ignored; ${s.sourceCount} sources remain.`
							: `${added} sources added.`;
				} else if (action === 'ingest') {
					const added = this._ingest(payload.source);
					changed = added;
					detail = added ? 'New source recorded.' : 'Duplicate source ignored.';
					if (added) {
						this._check(
							s.status === 'unreviewed',
							'New source requires a reopened review, not a silent mutation.',
						);
						if (s.adjudication) {
							s.adjudication = null;
							s.conflictPending = true;
							detail = 'New evidence invalidated the earlier adjudication; fresh review required.';
						}
					}
				} else if (action === 'reopen') {
					this._check(
						s.status === 'closed',
						'Only a closed case can be reopened in this bounded demonstrator.',
					);
					s.priorCases.push({
						scope: s.scope,
						owner: s.acceptedOwner,
						result: clone(s.result),
						verification: clone(s.verification),
						communication: clone(s.communication),
					});
					s.status = 'unreviewed';
					s.conflictPending = true;
					s.adjudication = null;
					s.scope = null;
					s.proposedOwner = null;
					s.acceptedOwner = null;
					s.result = null;
					s.verification = null;
					s.communication = null;
					s.deadline = null;
					s.escalated = false;
					this._ingest({
						tenant: 'demo',
						account: s.account,
						id: 'S4-' + s.priorCases.length,
						revision: 1,
						speaker: 'Internal teammate',
						kind: 'New CRM note',
						text: 'Please enable the live configuration now.',
					});
					detail =
						'New contradictory CRM note requires fresh review. Previous result and communication remain in history.';
				} else throw new Error('Unknown action');
				if (changed) s.version += 1;
				this._audit(action, detail);
				return { ok: true, detail, state: clone(s) };
			} catch (e) {
				this.state = before;
				this._audit('blocked:' + action, e.message);
				return { ok: false, detail: e.message, state: clone(this.state) };
			}
		}
	}
	if (typeof module !== 'undefined' && module.exports) module.exports = { WorkflowDemo, scenarios };
	root.WorkflowDemo = WorkflowDemo;
})(typeof globalThis !== 'undefined' ? globalThis : this);
