"""Bounded content/choice-order correction for the reviewed merchant demonstration."""
from pathlib import Path
import base64, hashlib, json, re

root = Path('public/proofs/conversation-resolution')
p = root / 'index.html'
html = p.read_text()
assert hashlib.sha256(p.read_bytes()).hexdigest() == '908f6f333ca53c83332633eb9be84f502cf8cc2dd259448415dc0a7eab323a6e', 'Unexpected source; do not overwrite'

def replace(old, new, count=1):
    global html
    assert html.count(old) == count, f'Expected {count} occurrences: {old[:100]}'
    html = html.replace(old, new)

replace('Local review · fictional case', 'Independent demo · fictional case')
replace('Anthony James Padavano · Local review copy', 'Anthony James Padavano · Interactive demonstration')
replace('<span>No messages sent. No live settings changed.</span>', '<span>Fictional data · No connected accounts</span>')
replace('Product documentation reviewed September 22, 2026. Referenced prior projects are supporting examples, not components running together behind this page. No customer-scale performance, hiring outcome or real-user usability result is established.', 'Product documentation reviewed September 23, 2026. This is Anthony Padavano’s independent demonstration, not an Alia product. Related projects illustrate prior work; they do not run behind this page.')
replace('For the modeled welcome marketing message, the local policy excludes pending and suppressed test profiles. Real subscription, flow-entry and sending behavior must be checked separately.', 'This fictional list uses double opt-in, so pending confirmations stay out of the modeled welcome flow; suppressed profiles are also excluded. Double opt-in is a scenario setting, not an Alia-wide requirement. Real account behavior must be verified separately.')
replace('https://github.com/organvm/organvm-engine/', 'https://github.com/4444J99/organvm-engine/', 2)
replace('https://github.com/organvm/linguistic-atomization-framework/', 'https://github.com/4444J99/linguistic-atomization-framework/')
replace('Coordination and evidence records connect distributed work to its source and subsequent decisions.', 'ORGANVM Engine provides registry validation, dependency checks, governance transitions and event dispatch for work spread across repositories.')
replace('Cross-repository governance is not a customer-operation capacity benchmark. Repository count is not throughput.', 'A coordination implementation—not evidence of customer-volume capacity.')
replace('A knowledge atomizer separates messages and code blocks, retains conversation identity, and applies redaction and format-specific chunking strategies.', 'A knowledge atomizer separates messages and code blocks into typed, searchable records while retaining their conversation context.')
replace('The inspected message pass skips content under 20 characters and uses random unit IDs. A sales adaptation needs short-approval preservation and replay-safe identity; those limitations are not hidden.', 'The inspected message pass skips content under 20 characters. A customer-workflow adaptation must preserve brief approvals and their context; this demo does not perform extraction.')
replace('Private integration code, not a live customer test, owner-acceptance system or proof of idempotent remote creation.', 'An integration implementation, not a live connection in this demo or proof of duplicate-safe remote creation.')
replace('Testament / governance corpus', 'Testament · artifact history')
replace('Testament catalogs rendered artifacts with source module, format, time and metadata. The governance corpus preserves the history from source conversations through plans, evaluations and later revisions.', 'Testament appends artifact records containing the source module, format, time and metadata, then reads them back as an inspectable catalog.')
replace('A human-gated operating workflow links intake, approvals, drafts, routing and commitments. A stale-projection defect showed why a saved decision must also reach the operator\'s next view.', 'HOSPES links podcast intake, human approvals, correspondence drafts and guest routing. Preparing a draft remains separate from permission to send it.')
replace('<strong>Universal Mail Automation</strong>', '<strong>Universal Communications Synth</strong>')
replace('Mail-processing mechanisms distinguish incoming material, triage, routing, escalation, approval and delivery evidence.', 'Also called Universal Mail Automation: shared rules classify messages and route work across provider adapters, with escalation and approval controls.')
replace("flowEnabled: true, deliveryState: 'received', testConsent: 'confirmed'", "flowEnabled: true, doubleOptIn: true, deliveryState: 'received', testConsent: 'confirmed'")
replace("      record.setup.testConsent = 'pending';\n      record.sources[3].text = 'The profile exists, but double-opt-in confirmation is still pending. No welcome-flow entry was observed.';", "      record.setup.testConsent = 'pending';\n      record.setup.deliveryState = 'unknown';\n      record.sources[3].text = 'The example signup log shows confirmation pending. Arrival in the subscribed list and welcome-email delivery have not been verified.';")
replace("    return validate(record);\n  }\n  function diagnose", "    record.sources[2].text += ' This fictional list uses double opt-in.';\n    return validate(record);\n  }\n  function diagnose")
replace("      // A pending confirmation does not establish list membership or delivery.\n      if (scenario === 'pending-consent') this.record.sources[3].text = 'The example signup log shows confirmation pending. Arrival in the subscribed list and welcome-email delivery have not been verified.';\n", '')
consent = "    if (record.setup.testConsent !== 'confirmed') return { ...base, code: 'pending-consent', title: 'The lists match. Consent has not been confirmed.', team: 'Onboarding support / merchant email owner', reason: 'The observed test profile is not consent-confirmed. That is a different blocker from a list mismatch.', next: 'Check the confirmation process with the merchant. Do not disable double opt-in or contact an unsubscribed profile to make a test pass.' };\n"
replace(consent, '')
unknown = "    if (record.setup.deliveryState === 'unknown') return"
replace(unknown, "    if (record.setup.doubleOptIn && record.setup.testConsent === 'pending') return { ...base, code: 'pending-consent', title: 'Confirmation is pending; list arrival is unverified.', team: 'Onboarding support / merchant email owner', reason: 'This fictional list uses double opt-in. Pending confirmation is an investigation lead, not proof of list membership or email delivery.', next: 'Check the controlled signup’s confirmation, then verify list arrival and the welcome flow without changing the merchant’s subscription policy.' };\n" + unknown)
replace("What should happen to Friday’s launch?", 'Should this popup be marked ready for Friday?')
replace("'Keep the launch marked ready'", "'Keep this popup marked ready'")
replace("'Change this popup to Welcome Subscribers'", "'Propose Welcome Subscribers for this popup'")
replace("$('case-status').textContent=s.hold?'Launch on hold'", "$('case-status').textContent=s.hold?'Popup held in this example'")
replace("sources.map(item => sourceCard(flow.step===0 && item.id==='CALL-01' ? {...item,text:'The test signup never received our welcome email. … Please keep the popup paused until we test it.'} : item))", 'sources.map(sourceCard)')
replace("    consent: 'https://help.klaviyo.com/hc/en-us/articles/115005251108',", "    destination: 'https://intercom.help/alia-help-center/en/articles/14061256-how-to-confirm-which-list-your-popup-is-going-to',\n    consent: 'https://help.klaviyo.com/hc/en-us/articles/115005251108',")
replace("['SETUP-01','TEST-01','alia','suppression']", "['SETUP-01','TEST-01','destination','suppression']")
replace("ref==='consent'?'Klaviyo opt-in':'Klaviyo suppression'", "ref==='consent'?'Klaviyo opt-in':ref==='destination'?'Alia popup destination':'Klaviyo suppression'")
start = html.index('      const customer = this.accepted[4].id')
end = html.index('      const evidence =', start)
html = html[:start] + '''      const ownerLine = `Proposed investigator: ${t.proposedOwner} (${t.team}); acceptance is still pending.`;
      const findingLine = test ? 'The supplied records show signups reaching Popup Leads while the welcome flow starts from Welcome Subscribers.' : `Finding from the supplied records: ${finding}.`;
      const nextLine = test ? 'A local routing calculation supports testing a destination change for POPUP-07 only. It does not establish a live repair or inbox delivery.' : `Next investigation: ${p.plan}.`;
      const holdLine = 'This popup stays on hold pending authorized account testing and your approval to launch.';
      const clarifyLine = s.needsClarification ? 'Before any change, please confirm that Welcome Subscribers is the intended list.\\n\\n' : '';
      const customer = this.accepted[4].id === 'approval'
        ? `${question}\\n\\n${clarifyLine}${ownerLine}\\n${holdLine}`
        : `${findingLine}\\n\\n${ownerLine}\\n${nextLine}\\n\\n${clarifyLine}${holdLine}`;
''' + html[end:]
replace('leaving the campaign paused?', 'leaving this popup paused?')
replace("    constructor(scenario = 'list-mismatch') { this.reset(scenario); }", """    constructor(scenario = 'list-mismatch', seed) {
      if (seed === undefined) seed = root.crypto?.getRandomValues ? root.crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 4294967296);
      if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) throw new Error('Choice-order seed must be an unsigned 32-bit integer.');
      this.orderSeed = seed;
      let state = seed >>> 0;
      const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
      const slots = [0, 1, 2, seed % 3, (seed + 1) % 3];
      for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
      this.choiceSlots = slots;
      this.reverseAlternatives = slots.map(() => random() >= .5);
      this.reset(scenario);
    }""")
replace("    select(id) {", """    presentationChoices() {
      const options = this.choices();
      if (!options.length) return [];
      const preferred = options.find(c => c.verdict === 'supported');
      if (!preferred) throw new Error('This decision needs an evidence-supported next step.');
      const others = options.filter(c => c.id !== preferred.id);
      if (this.reverseAlternatives[this.step]) others.reverse();
      others.splice(this.choiceSlots[this.step], 0, preferred);
      return others;
    }
    select(id) {""")
replace("$('choice-list').innerHTML=flow.choices().map", "$('choice-list').innerHTML=flow.presentationChoices().map")
replace('Changing the case clears prior choices, tests and drafts. Explanations, suggested routing and output depend on the selected evidence—not the position of a button.', 'Changing the case clears prior choices, tests and drafts. Options stay in place while you compare them; a new visit varies their order. Recommendations depend on the evidence.')
scripts = re.findall(r'<script[^>]*>([\s\S]*?)</script>', html)
assert len(scripts) == 3
hashes = ' '.join("'sha256-" + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode() + "'" for s in scripts)
html, n = re.subn(r'script-src [^;]+;', 'script-src ' + hashes + ';', html, count=1)
assert n == 1
p.write_text(html)
p = root / 'test-merchant-decisions.cjs'
test = p.read_text()
test = test.replace("function fresh(scenario = 'list-mismatch') {", "function fresh(scenario = 'list-mismatch', seed = 0) {")
test = test.replace('new context.DecisionExplorer.DecisionCase(scenario);', 'new context.DecisionExplorer.DecisionCase(scenario, seed);')
needle = '\tlet paths = 0,'
assert test.count(needle)==1
test = test.replace(needle, '''
	check('Published identity has no local-review label or hiring-outcome text', !/Local review|hiring outcome/.test(html));
	check('Footer states fictional data and no connected accounts', html.includes('Interactive demonstration</span><span>Fictional data · No connected accounts'));
	check('Migrated evidence links use canonical owners', !html.includes('github.com/organvm/organvm-engine/') && !html.includes('github.com/organvm/linguistic-atomization-framework/'));
	check('All twelve project examples remain', (html.match(/class="code">E\\d\\d/g) || []).length === 12);
	const pending = fresh('pending-consent');
	check('Pending confirmation does not fabricate list arrival', pending.record.setup.deliveryState === 'unknown' && pending.record.setup.doubleOptIn === true && pending.record.sources[3].text.includes('have not been verified'));
	check('Double-opt-in is explicitly part of the fictional source', pending.record.sources[2].text.includes('fictional list uses double opt-in'));
	let arrangements = new Set();
	for (const scenario of ['list-mismatch', 'pending-consent', 'delivery-failure', 'unexplained']) {
		for (let seed = 0; seed < 256; seed++) {
			const flow = fresh(scenario, seed), positions = [];
			for (let step = 0; step < 5; step++) {
				const options = flow.presentationChoices();
				const ids = options.map(c => c.id);
				assert.deepEqual([...ids].sort(), [...flow.choices().map(c => c.id)].sort());
				const position = options.findIndex(c => c.verdict === 'supported');
				positions.push(position);
				flow.select(options[position].id);
				assert.deepEqual(flow.presentationChoices().map(c => c.id), ids);
				flow.commit(); flow.back();
				assert.deepEqual(flow.presentationChoices().map(c => c.id), ids);
				flow.commit();
			}
			assert.equal(new Set(positions).size, 3);
			assert.equal(Math.max(...[0,1,2].map(slot => positions.filter(p => p === slot).length)), 2);
			arrangements.add(positions.join(''));
		}
	}
	check('1024 seeded cases vary supported positions across all three slots and retain backtracking order', arrangements.size > 20);
	const customerPacket = finish(fresh());
	check('Customer draft names the selected proposed investigator and pending acceptance', customerPacket.drafts.customer.includes(customerPacket.proposedOwner.name) && customerPacket.drafts.customer.includes('acceptance is still pending'));
	check('Customer draft keeps scope to this popup and distinguishes a local calculation', customerPacket.drafts.customer.includes('This popup stays on hold') && customerPacket.drafts.customer.includes('does not establish a live repair'));
	check('Proposed setting change is labelled as a proposal', customerPacket.decisions[3].choice.startsWith('Propose '));
	const specialist = fresh(); use(specialist, 'hold'); use(specialist, 'list-mismatch'); use(specialist, 'engineering');
	check('Choosing another investigator changes the customer draft too', finish(specialist).drafts.customer.includes('Leo (Integration triage)'));
''' + needle)
test = test.replace("assert.equal(Object.keys(packet.drafts).length, 3);", "assert.equal(Object.keys(packet.drafts).length, 3);\n\t\t\t\tassert(packet.drafts.customer.includes(packet.proposedOwner.name));\n\t\t\t\tassert(packet.drafts.customer.includes('acceptance is still pending'));\n\t\t\t\tassert(packet.drafts.customer.includes('This popup stays on hold'));")
needle = "\t\tawait page.screenshot({ path: path.join(output, 'entry-desktop.png'), fullPage: true });"
assert test.count(needle)==1
test = test.replace(needle, """		check('Published footer is appropriate to the actual hosted demo', (await page.locator('footer').innerText()).includes('Interactive demonstration') && !(await page.locator('footer').innerText()).includes('Local review'));
		check('The first visible evidence includes the list named by the customer', (await page.locator('#evidence').innerText()).includes('Friday’s campaign uses Welcome Subscribers'));
		const entryOrder = await page.locator('[data-choice]').evaluateAll(buttons => buttons.map(b => b.dataset.choice));
""" + needle)
needle = "\t\tcheck('Unsupported choice cannot continue', await page.locator('#next').isDisabled());"
assert test.count(needle)==1
test = test.replace(needle, needle + "\n\t\tcheck('Selecting a choice does not reshuffle the buttons', JSON.stringify(await page.locator('[data-choice]').evaluateAll(buttons => buttons.map(b => b.dataset.choice))) === JSON.stringify(entryOrder));")
needle = "\t\t\tfor (let i = 0; i < 5; i++) {\n\t\t\t\tawait page.locator('#help-suggestion').click();"
assert test.count(needle)==2
replacement = """			const supportedPositions = [];
			for (let i = 0; i < 5; i++) {
				await page.locator('#help-suggestion').click();
				supportedPositions.push(await page.locator('[data-choice]').evaluateAll(buttons => buttons.findIndex(b => b.getAttribute('aria-pressed') === 'true')));"""
test = test.replace(needle, replacement)
needle = "\t\t\t\tawait page.locator('#next').click();\n\t\t\t}\n"
assert test.count(needle)==2
test = test.replace(needle, needle + "\t\t\tcheck('Rendered recommendations cover A, B and C, never a repeated middle-answer path', new Set(supportedPositions).size === 3);\n")
p.write_text(test)
p = root / 'verification.json'
receipt = json.loads(p.read_text())
receipt['revision'] = 'merchant-decisions-r2'
receipt['supersedes_html_sha256'] = receipt['artifacts_sha256']['index.html']
receipt.pop('source_review_sha256', None)
receipt['adaptation'] = 'Content audit: published identity, explicit scenario assumptions, consistent pending-confirmation evidence, corrected source links and project boundaries, owner-aware customer drafts, and stable per-session balanced option order. Behavior and content regressions run separately from the preserved legacy guide.'
for name in receipt['artifacts_sha256']:
    receipt['artifacts_sha256'][name] = hashlib.sha256((root / name).read_bytes()).hexdigest()
p.write_text(json.dumps(receipt, indent='\t') + '\n')
print('Corrected HTML:', receipt['artifacts_sha256']['index.html'])
