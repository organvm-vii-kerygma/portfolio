'use strict';
const assert = require('node:assert/strict');
const { WorkflowDemo } = require('./workflow-engine.js');
const tests = [];
function test(name, fn) {
	fn();
	tests.push({ name, status: 'PASS' });
}
function ready(e) {
	assert(e.dispatch('approve', { actor: 'reviewer', scope: 'checklist-only' }).ok);
}
function accepted(e) {
	ready(e);
	assert(e.dispatch('propose', { owner: 'CS owner' }).ok);
	assert(e.dispatch('accept', { actor: 'CS owner' }).ok);
}
function executed(e) {
	accepted(e);
	assert(e.dispatch('execute', { actor: 'CS owner' }).ok);
}
function verified(e) {
	executed(e);
	assert(e.dispatch('verify', { actor: 'verifier', passed: true, resultId: e.state.result.id }).ok);
}
test('Short customer reply retained', () => {
	const e = new WorkflowDemo();
	assert(e.state.sources.some((x) => x.id === 'S3' && x.text.length < 20));
});
test('Duplicate replay does not create source records', () => {
	const e = new WorkflowDemo();
	for (let i = 0; i < 5; i++) assert(e.dispatch('replay').ok);
	assert.equal(e.state.sourceCount, 3);
	assert.equal(e.state.version, 0);
});
test('Source mutation without new revision rejected', () => {
	const e = new WorkflowDemo();
	assert(!e.dispatch('ingest', { source: { ...e.seed[0], text: 'changed' } }).ok);
	assert.equal(e.state.sourceCount, 3);
});
test('Cross-account source rejected', () => {
	const e = new WorkflowDemo();
	assert(!e.dispatch('ingest', { source: { ...e.seed[0], account: 'other-account' } }).ok);
});
test('Cross-tenant source rejected', () => {
	const e = new WorkflowDemo();
	assert(!e.dispatch('ingest', { source: { ...e.seed[0], tenant: 'other-tenant' } }).ok);
});
test('Ambiguous identity blocks approval', () => {
	const e = new WorkflowDemo('ambiguous');
	assert(!e.dispatch('approve', { actor: 'reviewer', scope: 'checklist-only' }).ok);
});
test('Wrong account cannot resolve ambiguity', () => {
	const e = new WorkflowDemo('ambiguous');
	assert(!e.dispatch('resolveAccount', { actor: 'reviewer', account: 'wrong' }).ok);
});
test('Authorized account resolution unlocks review', () => {
	const e = new WorkflowDemo('ambiguous');
	assert(e.dispatch('resolveAccount', { actor: 'reviewer', account: e.state.account }).ok);
	ready(e);
});
test('Conflict blocks approval', () => {
	const e = new WorkflowDemo('conflict');
	assert(!e.dispatch('approve', { actor: 'reviewer', scope: 'checklist-only' }).ok);
});
test('Conflict adjudication preserves all sources', () => {
	const e = new WorkflowDemo('conflict');
	assert(e.dispatch('resolveConflict', { actor: 'reviewer' }).ok);
	ready(e);
	assert.equal(e.state.sourceCount, 3);
});
test('Unauthorized reviewer role rejected', () => {
	const e = new WorkflowDemo();
	assert(!e.dispatch('approve', { actor: 'model', scope: 'checklist-only' }).ok);
});
test('Production configuration change is not authorized', () => {
	const e = new WorkflowDemo();
	assert(!e.dispatch('approve', { actor: 'reviewer', scope: 'change-production' }).ok);
});
test('Assignment is not acceptance', () => {
	const e = new WorkflowDemo();
	ready(e);
	e.dispatch('propose', { owner: 'CS owner' });
	assert.equal(e.state.acceptedOwner, null);
	assert(!e.dispatch('execute', { actor: 'CS owner' }).ok);
});
test('Wrong owner cannot accept', () => {
	const e = new WorkflowDemo();
	ready(e);
	e.dispatch('propose', { owner: 'CS owner' });
	assert(!e.dispatch('accept', { actor: 'someone else' }).ok);
});
test('Acceptance timeout escalates without inventing ownership', () => {
	const e = new WorkflowDemo('unaccepted');
	ready(e);
	e.dispatch('propose', { owner: 'CS owner' });
	e.dispatch('wait');
	assert(e.state.escalated);
	assert.equal(e.state.acceptedOwner, null);
	assert.equal(e.state.status, 'proposed');
});
test('Stale-version action rejected', () => {
	const e = new WorkflowDemo();
	const v = e.state.version;
	ready(e);
	assert(!e.dispatch('propose', { owner: 'CS owner' }, v).ok);
	assert.equal(e.state.status, 'ready');
});
test('Only accepted owner executes', () => {
	const e = new WorkflowDemo();
	accepted(e);
	assert(!e.dispatch('execute', { actor: 'wrong' }).ok);
});
test('Repeat execution is blocked', () => {
	const e = new WorkflowDemo();
	executed(e);
	assert(!e.dispatch('execute', { actor: 'CS owner' }).ok);
	assert.equal(e.state.executionCount, 1);
});
test('False closure without verification is rejected', () => {
	const e = new WorkflowDemo();
	executed(e);
	assert(!e.dispatch('close').ok);
});
test('Incorrect evidence reference rejected', () => {
	const e = new WorkflowDemo();
	executed(e);
	assert(!e.dispatch('verify', { actor: 'verifier', passed: true, resultId: 'wrong' }).ok);
});
test('Executor cannot self-verify in the role simulation', () => {
	const e = new WorkflowDemo();
	executed(e);
	assert(
		!e.dispatch('verify', { actor: 'CS owner', passed: true, resultId: e.state.result.id }).ok,
	);
});
test('Failed verification does not close work', () => {
	const e = new WorkflowDemo();
	executed(e);
	assert(
		!e.dispatch('verify', { actor: 'verifier', passed: false, resultId: e.state.result.id }).ok,
	);
	assert.equal(e.state.status, 'executed');
});
test('Closure requires communication receipt', () => {
	const e = new WorkflowDemo();
	verified(e);
	assert(!e.dispatch('close').ok);
});
test('Full guarded path closes with evidence', () => {
	const e = new WorkflowDemo();
	verified(e);
	assert(e.dispatch('notify', { actor: 'coordinator' }).ok);
	assert(e.dispatch('close').ok);
	assert.equal(e.state.status, 'closed');
	assert(e.state.verification.passed && e.state.communication);
});
test('Reopening preserves prior execution and communication', () => {
	const e = new WorkflowDemo();
	verified(e);
	e.dispatch('notify', { actor: 'coordinator' });
	e.dispatch('close');
	assert(e.dispatch('reopen').ok);
	assert.equal(e.state.status, 'unreviewed');
	assert(e.state.conflictPending);
	assert.equal(e.state.priorCases.length, 1);
	assert(e.state.priorCases[0].communication);
	assert.equal(e.state.sourceCount, 4);
	assert(e.state.sources.some((x) => x.id === 'S4-1'));
	assert(e.dispatch('replay').detail.includes('4 sources'));
});
test('New source cannot silently alter an approved record', () => {
	const e = new WorkflowDemo();
	ready(e);
	assert(!e.dispatch('ingest', { source: { ...e.seed[0], id: 'S4', text: 'New request' } }).ok);
	assert.equal(e.state.sourceCount, 3);
});
const report = {
	schema: 'synthetic-demo-tests.v1',
	scope:
		'Only the new deterministic workflow model. Not repository, NLP, security or HubSpot integration tests.',
	passed: tests.length,
	failed: 0,
	tests,
};
console.log(JSON.stringify(report, null, 2));
