const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { WorkflowDemo } = require('./workflow-engine.js');

const html = fs.readFileSync(path.join(__dirname, 'legacy-guide.html'), 'utf8');
const script = html.match(/<script id="walkthrough-guide">([\s\S]*?)<\/script>/)[1];
const context = { WorkflowDemo };
vm.runInNewContext(script, context);
const { GuidedDemo } = context;
let passed = 0;
const tests = [];
function test(name, callback) {
	callback();
	passed += 1;
	tests.push({ name, status: 'PASS' });
}
function finish(guide) {
	for (let index = 0; index < 12 && guide.current().key !== 'done'; index++) {
		guide.advance();
	}
	assert.equal(guide.current().key, 'done');
}

test('Inline guide is authorized by an exact CSP hash', () => {
	const hash = crypto.createHash('sha256').update(script).digest('base64');
	assert(html.includes(`'sha256-${hash}'`));
	assert(!html.includes("'unsafe-inline'; style-src"));
});
test('Default is one customer request, not the operator console', () => {
	const guide = new GuidedDemo();
	assert.equal(guide.current().key, 'intro');
	assert.equal(guide.current().cards.length, 1);
	assert.equal(guide.current().primary, 'Follow this request');
});
for (const scenario of ['happy', 'conflict', 'ambiguous', 'unaccepted']) {
	test(`${scenario}: guide reaches a guarded closure`, () => {
		const guide = new GuidedDemo(scenario);
		finish(guide);
		const state = guide.engine.state;
		assert.equal(state.status, 'closed');
		assert(state.acceptedOwner);
		assert(state.verification.passed);
		assert(state.communication);
		assert.equal(state.executionCount, 1);
	});
}
test('Conflict remains unapproved until the explicit review action', () => {
	const guide = new GuidedDemo();
	guide.advance();
	assert.equal(guide.current().key, 'conflict');
	assert.equal(guide.engine.state.scope, null);
	assert(guide.engine.state.conflictPending);
	guide.advance();
	assert.equal(guide.engine.state.scope, 'checklist-only');
	assert(guide.engine.state.adjudication);
	assert.equal(guide.engine.state.sources.length, 3);
});
test('Naming Alex does not invent acceptance', () => {
	const guide = new GuidedDemo();
	guide.advance();
	guide.advance();
	guide.advance();
	assert.equal(guide.current().key, 'waiting');
	assert.equal(guide.engine.state.acceptedOwner, null);
	guide.advance();
	assert.equal(guide.engine.state.acceptedOwner, 'Alex (Customer Success)');
});
test('Contextual missed-deadline path escalates without losing the task', () => {
	const guide = new GuidedDemo();
	guide.advance();
	guide.advance();
	guide.advance();
	guide.wait();
	assert.equal(guide.current().key, 'escalated');
	assert.equal(guide.engine.state.acceptedOwner, null);
	finish(guide);
});
test('Reviewing an earlier explanation does not rewind committed state', () => {
	const guide = new GuidedDemo();
	finish(guide);
	const before = JSON.stringify(guide.engine.state);
	guide.back();
	assert(guide.screen().reviewing);
	assert.equal(guide.screen().primary, 'Return to the current step');
	guide.advance();
	assert.equal(guide.current().key, 'done');
	assert.equal(JSON.stringify(guide.engine.state), before);
});
test('Reopening keeps the earlier result and asks for fresh review', () => {
	const guide = new GuidedDemo();
	finish(guide);
	guide.reopen();
	assert.equal(guide.current().key, 'conflict');
	assert.equal(guide.engine.state.priorCases.length, 1);
	assert.equal(guide.engine.state.scope, null);
});
test('All twelve examples survive inside an optional disclosure', () => {
	assert.equal((html.match(/class="evidence"/g) || []).length, 12);
	assert(html.includes('<details id="connections">'));
	assert(!html.includes('<details id="connections" open'));
});
test('Starting over resets only the local demonstration', () => {
	const guide = new GuidedDemo();
	finish(guide);
	guide.reset('happy');
	assert.equal(guide.current().key, 'intro');
	assert.equal(guide.engine.state.executionCount, 0);
	assert.equal(guide.history.length, 0);
});
console.log(JSON.stringify({ schema: 'guided-proof-tests.v1', passed, failed: 0, tests }, null, 2));
