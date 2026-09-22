'use strict';
const assert = require('node:assert/strict');
const { WorkflowDemo } = require('./workflow-engine.js');
const tests = [];
function test(name, fn) {
	try {
		fn();
		tests.push({ name, status: 'PASS' });
	} catch (e) {
		tests.push({ name, status: 'FAIL', error: e.message });
	}
}
function a(e, action, payload) {
	assert(e.dispatch(action, payload).ok);
}
function ready(e) {
	a(e, 'approve', { actor: 'reviewer', scope: 'checklist-only' });
}
function execute(e, owner = 'CS owner') {
	ready(e);
	a(e, 'propose', { owner });
	a(e, 'accept', { actor: owner });
	a(e, 'execute', { actor: owner });
}
function verify(e) {
	execute(e);
	a(e, 'verify', { actor: 'verifier', passed: true, resultId: e.state.result.id });
}
const business = (s) => {
	const x = structuredClone(s);
	delete x.audit;
	return x;
};
for (const [field, value] of [
	['speaker', 'Impersonated customer'],
	['kind', 'Different source type'],
	['text', 'Changed meaning'],
])
	test('Immutable ' + field + ' under same source revision', () => {
		const e = new WorkflowDemo();
		assert.equal(e.dispatch('ingest', { source: { ...e.seed[0], [field]: value } }).ok, false);
		assert.equal(e.state.sources[0][field], e.seed[0][field]);
	});
for (const source of [
	null,
	{},
	[],
	{ tenant: 'demo' },
	{
		tenant: 'demo',
		account: 'demo-account-001',
		id: 'S5',
		speaker: 'Customer',
		kind: 'Reply',
		text: '   ',
		revision: 1,
	},
])
	test('Malformed source rejected ' + JSON.stringify(source), () => {
		const e = new WorkflowDemo(),
			before = business(e.state);
		assert(!e.dispatch('ingest', { source }).ok);
		assert.deepEqual(business(e.state), before);
	});
for (const revision of [0, -1, 1.5, '1', null])
	test('Invalid revision rejected ' + JSON.stringify(revision), () => {
		const e = new WorkflowDemo();
		assert(!e.dispatch('ingest', { source: { ...e.seed[0], id: 'S5', revision } }).ok);
	});
test('Reply has an explicit retained parent', () => {
	const e = new WorkflowDemo();
	assert.equal(e.state.sources[2].parentId, 'S1');
});
test('Changing reply parent without revision rejected', () => {
	const e = new WorkflowDemo();
	assert(!e.dispatch('ingest', { source: { ...e.seed[2], parentId: 'S2' } }).ok);
});
test('Missing reply parent rejected', () => {
	const e = new WorkflowDemo();
	assert(!e.dispatch('ingest', { source: { ...e.seed[2], id: 'S5', parentId: 'missing' } }).ok);
});
test('New source revision preserves previous evidence', () => {
	const e = new WorkflowDemo();
	a(e, 'ingest', { source: { ...e.seed[0], revision: 2, text: 'New revision' } });
	assert.equal(e.state.sourceCount, 4);
	assert(e.state.sources.some((s) => s.id === 'S1' && s.revision === 1));
});
test('Adjudication records actor and all reviewed sources', () => {
	const e = new WorkflowDemo('conflict');
	a(e, 'resolveConflict', { actor: 'reviewer' });
	assert.equal(e.state.adjudication.actor, 'reviewer');
	assert.equal(e.state.adjudication.sourceKeys.length, 3);
});
test('New evidence invalidates previous adjudication', () => {
	const e = new WorkflowDemo('conflict');
	a(e, 'resolveConflict', { actor: 'reviewer' });
	a(e, 'ingest', { source: { ...e.seed[1], id: 'S5', text: 'New conflicting instruction' } });
	assert(e.state.conflictPending);
	assert.equal(e.state.adjudication, null);
	assert(!e.dispatch('approve', { actor: 'reviewer', scope: 'checklist-only' }).ok);
});
test('Owner named verifier cannot self-verify', () => {
	const e = new WorkflowDemo();
	execute(e, 'verifier');
	assert(
		!e.dispatch('verify', { actor: 'verifier', passed: true, resultId: e.state.result.id }).ok,
	);
	assert.equal(e.state.status, 'executed');
});
test('Duplicate notification preserves receipt and record version', () => {
	const e = new WorkflowDemo();
	verify(e);
	a(e, 'notify', { actor: 'coordinator' });
	const before = business(e.state);
	a(e, 'notify', { actor: 'coordinator' });
	assert.deepEqual(business(e.state), before);
});
test('Returned state cannot mutate the stored state', () => {
	const e = new WorkflowDemo();
	const r = e.dispatch('replay');
	r.state.sources[0].text = 'Tampered';
	assert.notEqual(e.state.sources[0].text, 'Tampered');
});
test('Unknown action preserves business state', () => {
	const e = new WorkflowDemo(),
		before = business(e.state);
	assert(!e.dispatch('unknown').ok);
	assert.deepEqual(business(e.state), before);
});
test('Invalid scenario rejected', () => assert.throws(() => new WorkflowDemo('nonexistent')));
test('Deterministic invariant checks across 10000 action attempts', () => {
	let seed = 22442;
	const rand = () => {
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
		return seed;
	};
	let n = 0;
	const actions = [
		'approve',
		'propose',
		'accept',
		'execute',
		'verify',
		'notify',
		'close',
		'reopen',
		'wait',
		'replay',
		'resolveAccount',
		'resolveConflict',
		'unknown',
	];
	for (let run = 0; run < 100; run++) {
		const e = new WorkflowDemo(['happy', 'conflict', 'ambiguous', 'unaccepted'][run % 4]);
		for (let i = 0; i < 100; i++) {
			const action = actions[rand() % actions.length];
			const s = e.state;
			const payload =
				{
					approve: { actor: 'reviewer', scope: 'checklist-only' },
					propose: { owner: 'CS owner' },
					accept: { actor: 'CS owner' },
					execute: { actor: 'CS owner' },
					verify: { actor: 'verifier', passed: true, resultId: s.result?.id },
					notify: { actor: 'coordinator' },
					resolveAccount: { actor: 'reviewer', account: s.account },
					resolveConflict: { actor: 'reviewer' },
				}[action] || {};
			const before = business(s);
			const r = e.dispatch(action, payload);
			if (!r.ok) assert.deepEqual(business(e.state), before);
			assert.equal(e.state.sources.length, e.state.sourceCount);
			assert.equal(new Set(e.state.sources.map((s) => s.key)).size, e.state.sourceCount);
			if (e.state.status === 'closed') {
				assert(e.state.acceptedOwner);
				assert(e.state.verification.passed);
				assert(e.state.communication);
				assert.equal(e.state.verification.resultId, e.state.result.id);
			}
			n++;
		}
	}
	assert.equal(n, 10000);
});
const result = {
	schema: 'synthetic-demo-additional-tests.v1',
	passed: tests.filter((t) => t.status === 'PASS').length,
	failed: tests.filter((t) => t.status === 'FAIL').length,
	invariant_attempts: 10000,
	tests,
};
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.failed ? 1 : 0;
