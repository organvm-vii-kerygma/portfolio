/* Verify the current merchant decision explorer, separately from the retained legacy guide. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '@playwright/test');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const checks = [];
const output = path.resolve('.quality/merchant-decisions');
fs.mkdirSync(output, { recursive: true });
function check(name, condition) {
	checks.push({ name, passed: Boolean(condition) });
	assert(condition, name);
}
function fresh(scenario = 'list-mismatch') {
	const context = {};
	vm.createContext(context);
	scripts.slice(0, 2).forEach((script) => vm.runInContext(script, context));
	return new context.DecisionExplorer.DecisionCase(scenario);
}
function use(flow, id) {
	flow.select(id);
	flow.commit();
}
function finish(flow) {
	while (!flow.state().complete)
		use(flow, flow.choices().find((c) => c.verdict === 'supported').id);
	return flow.packet();
}
function models() {
	check('Three inline scripts retained from reviewed artifact', scripts.length === 3);
	check(
		'Every executable script is bound to the CSP',
		scripts.every((s) =>
			html.includes(`'sha256-${crypto.createHash('sha256').update(s).digest('base64')}'`),
		),
	);
	check(
		'Network connections and form submissions are disabled',
		html.includes("connect-src 'none'") && html.includes("form-action 'none'"),
	);
	let paths = 0,
		rejected = 0;
	for (const scenario of ['list-mismatch', 'pending-consent', 'delivery-failure', 'unexplained']) {
		const visit = (prefix) => {
			const flow = fresh(scenario);
			prefix.forEach((id) => use(flow, id));
			if (flow.state().complete) {
				const packet = flow.packet();
				assert.equal(packet.decisions.length, 5);
				assert.equal(packet.emailsSent, 0);
				assert.equal(packet.externalWrites, 0);
				assert.equal(packet.actualOwnerAccepted, false);
				assert.equal(packet.actualOwner, null);
				assert.equal(packet.launchApproved, false);
				assert.equal(packet.readiness, 'Hold');
				assert.equal(packet.liveOutcome, 'Unverified');
				assert(packet.proposedOwner.name && packet.plan);
				assert.equal(Object.keys(packet.drafts).length, 3);
				if (packet.localTest) assert.equal(packet.localTest.passed, true);
				paths++;
				return;
			}
			assert.equal(flow.choices().length, 3);
			for (const option of flow.choices()) {
				assert(option.why.length > 30 && option.consequence.length > 30);
				if (option.canProceed) visit([...prefix, option.id]);
				else {
					flow.select(option.id);
					assert.throws(() => flow.commit());
					assert.equal(flow.step, prefix.length);
					rejected++;
				}
			}
		};
		visit([]);
		check(`${scenario}: all reachable paths retain draft-only boundaries`, true);
	}
	check(`All ${paths} reachable decision paths checked`, paths >= 40);
	check(`${rejected} unsupported continuations rejected`, rejected > 50);
	const defaultFlow = fresh();
	assert.throws(() => defaultFlow.packet());
	check('Cannot export an unfinished case', true);
	assert.throws(() => defaultFlow.select('invented-action'));
	check('Unknown action is rejected', true);
	const packet = finish(defaultFlow);
	check('Suggested mismatch path produces a tested proposal', Boolean(packet.localTest?.passed));
	const alt = fresh();
	use(alt, 'confirm');
	use(alt, 'investigate');
	const alternative = finish(alt);
	check(
		'Investigation alternative is not represented as a tested repair',
		alternative.localTest === null && alternative.plan !== packet.plan,
	);
	check(
		'A focused confirmation survives into the handoff',
		alternative.nextChecks.some((s) => s.includes('Confirm')),
	);
	defaultFlow.back();
	assert.throws(() => defaultFlow.packet());
	defaultFlow.back();
	check(
		'Backtracking clears downstream plan and completed state',
		defaultFlow.state().plan === null && !defaultFlow.state().complete,
	);
	check('Revision is explicitly recorded', defaultFlow.events.at(-1).downstreamDiscarded === true);
	return { paths, rejected };
}
async function browserTests() {
	const server = http.createServer((_request, response) => {
		response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
		response.end(html);
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	const browser = await chromium.launch(
		process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
	);
	try {
		const context = await browser.newContext({
			viewport: { width: 1440, height: 1050 },
			acceptDownloads: true,
			reducedMotion: 'reduce',
		});
		const page = await context.newPage();
		const errors = [],
			forbidden = [];
		const url = process.env.PROOF_URL || `http://127.0.0.1:${server.address().port}/`;
		page.on('pageerror', (e) => errors.push(e.message));
		page.on('request', (request) => {
			if (
				['xhr', 'fetch', 'websocket'].includes(request.resourceType()) ||
				request.method() !== 'GET'
			)
				forbidden.push(request.url());
		});
		const response = await page.goto(url, { waitUntil: 'networkidle' });
		check(
			'HTTP page initializes with CSP enforced',
			response.status() === 200 && (await page.locator('#app').isVisible()),
		);
		check(
			'Published response matches exact reviewed HTML',
			crypto
				.createHash('sha256')
				.update(await response.body())
				.digest('hex') === crypto.createHash('sha256').update(html).digest('hex'),
		);
		check('Three meaningful choices on entry', (await page.locator('[data-choice]').count()) === 3);
		check('Feedback hidden until a choice is made', await page.locator('#feedback').isHidden());
		check(
			'Project details are initially collapsed',
			!(await page.locator('#connections').getAttribute('open')) &&
				(await page.locator('.evidence:visible').count()) === 0,
		);
		await page.screenshot({ path: path.join(output, 'entry-desktop.png'), fullPage: true });
		await page.locator('[data-choice="ready"]').click();
		check(
			'Unsupported choice explains its consequence',
			(await page.locator('#feedback-title').innerText()).includes('Not supported') &&
				(await page.locator('#feedback-consequence').innerText()).length > 30,
		);
		check('Unsupported choice cannot continue', await page.locator('#next').isDisabled());
		await page.locator('[data-choice="confirm"]').click();
		check(
			'Reasoned alternative is allowed, not marked wrong',
			(await page.locator('#feedback-title').innerText()).includes('trade-off') &&
				(await page.locator('#next').isEnabled()),
		);
		await page.locator('[data-choice="hold"]').click();
		await page.locator('#next').click();
		check(
			'Selected choice advances to relevant evidence',
			(await page.evaluate(() => window.reviewSnapshot().step)) === 1,
		);
		check(
			'Diagnostic evidence contains the two different list IDs',
			(await page.locator('#evidence').innerText()).includes('L-101') &&
				(await page.locator('#evidence').innerText()).includes('L-202'),
		);
		await page.locator('#help-suggestion').click();
		await page.locator('#next').click();
		await page.locator('#help-suggestion').click();
		await page.locator('#next').click();
		check(
			'Task owner is proposed, not silently accepted',
			(await page.locator('#owner-state').innerText()).includes('not accepted'),
		);
		const choices = await page.evaluate(() => {
			const { DecisionCase } = window.DecisionExplorer;
			const f = new DecisionCase();
			for (let i = 0; i < 3; i++) {
				f.select(f.choices().find((c) => c.verdict === 'supported').id);
				f.commit();
			}
			return f.choices();
		});
		const failed = choices.find((c) => c.effect.report && !c.effect.report.passed);
		await page.locator(`[data-choice="${failed.id}"]`).click();
		check(
			'Wrong routing produces a visible failed calculation',
			(await page.locator('#result-heading').innerText()).includes('still blocked') &&
				(await page.locator('#test-rows').innerText()).includes('Fail'),
		);
		await page.locator('#help-suggestion').click();
		check(
			'Proposed correction shows three passing expectations',
			(await page.locator('#test-rows tr').count()) === 3 &&
				!(await page.locator('#test-rows').innerText()).includes('Fail'),
		);
		await page.locator('#next').click();
		await page.locator('[data-choice="claim-fixed"]').click();
		check(
			'Cannot turn a local test into a live fix claim',
			await page.locator('#next').isDisabled(),
		);
		await page.locator('#help-suggestion').click();
		await page.locator('#next').click();
		check(
			'The chosen path creates three draft views',
			(await page.locator('#complete-screen').isVisible()) &&
				(await page.locator('[data-tab]').count()) === 3,
		);
		const snapshot = await page.evaluate(() => window.reviewSnapshot());
		check(
			'Final packet remains fictional and unsent',
			snapshot.packet.emailsSent === 0 &&
				snapshot.packet.externalWrites === 0 &&
				snapshot.packet.liveOutcome === 'Unverified',
		);
		await page.locator('#tab-crm').click();
		check(
			'CRM draft contains a hold rather than launch approval',
			(await page.locator('#draft-text').innerText()).includes('HOLD'),
		);
		await page.locator('#tab-crm').focus();
		await page.keyboard.press('ArrowRight');
		check(
			'Draft tabs support keyboard navigation',
			(await page.locator('#tab-customer').getAttribute('aria-selected')) === 'true',
		);
		await page.keyboard.press('Tab');
		check(
			'Text-only draft panel remains keyboard reachable',
			await page.locator('#draft-text').evaluate((el) => el === document.activeElement),
		);
		await page.getByText('What if the proposed owner never accepts?', { exact: true }).click();
		await page.locator('#deadline-preview').click();
		check(
			'Missed-acceptance preview does not pretend to notify anyone',
			(await page.locator('#no-reply').innerText()).includes('not a live clock'),
		);
		const downloadPromise = page.waitForEvent('download');
		await page.locator('#save-drafts').click();
		const download = await downloadPromise;
		const saved = path.join(output, 'draft-packet.json');
		await download.saveAs(saved);
		check(
			'Downloaded JSON contains selected decisions and no external writes',
			JSON.parse(fs.readFileSync(saved, 'utf8')).decisions.length === 5 &&
				JSON.parse(fs.readFileSync(saved, 'utf8')).externalWrites === 0,
		);
		await page.locator('#previous').click();
		check(
			'Backtracking clears stale generated drafts',
			(await page.evaluate(() => window.reviewSnapshot())).packet === null &&
				(await page.locator('#complete-screen').isHidden()),
		);
		for (const width of [320, 390, 768, 1440]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.goto(url, { waitUntil: 'networkidle' });
			check(
				`${width}px: no horizontal overflow`,
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
			);
			check(
				`${width}px: selectable choices have accessible touch height`,
				await page
					.locator('[data-choice]')
					.evaluateAll((buttons) => buttons.every((b) => b.getBoundingClientRect().height >= 44)),
			);
			if (width === 390)
				await page.screenshot({ path: path.join(output, 'entry-mobile.png'), fullPage: true });
			for (let i = 0; i < 5; i++) {
				await page.locator('#help-suggestion').click();
				await page.locator('#next').click();
			}
			check(
				`${width}px: completes using the visible controls`,
				await page.locator('#complete-screen').isVisible(),
			);
		}
		for (const scenario of ['pending-consent', 'delivery-failure', 'unexplained']) {
			if (!(await page.locator('#variations').evaluate((el) => el.open)))
				await page.locator('#variations > summary').click();
			await page.locator('#scenario').selectOption(scenario);
			for (let i = 0; i < 5; i++) {
				await page.locator('#help-suggestion').click();
				await page.locator('#next').click();
			}
			const p = (await page.evaluate(() => window.reviewSnapshot())).packet;
			check(
				`${scenario}: output is investigation, not recycled list repair`,
				p.localTest === null && p.liveOutcome === 'Unverified',
			);
		}
		check('No JavaScript exceptions', errors.length === 0);
		check('No provider requests, writes or messages', forbidden.length === 0);
		await context.close();
	} finally {
		await browser.close();
		await new Promise((resolve) => server.close(resolve));
	}
}
(async () => {
	let modelCounts,
		completed = false,
		failure = null;
	try {
		modelCounts = models();
		await browserTests();
		completed = true;
	} catch (error) {
		failure = { name: error.name, message: error.message };
		throw error;
	} finally {
		const report = {
			completed,
			failure,
			checked_at: new Date().toISOString(),
			html_sha256: crypto.createHash('sha256').update(html).digest('hex'),
			url: process.env.PROOF_URL || 'local HTTP',
			modelCounts,
			passed: checks.filter((c) => c.passed).length,
			failed: checks.filter((c) => !c.passed).length + (failure ? 1 : 0),
			checks,
			scope:
				'Fictional browser-only decision explorer; no live AI, CRM, email delivery, real owner acceptance or load testing.',
		};
		fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
		console.log(JSON.stringify(report, null, 2));
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
