const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const output = path.resolve('.quality/conversation-guide');
fs.mkdirSync(output, { recursive: true });
const tests = [];
function check(name, condition) {
	tests.push({ name, status: condition ? 'PASS' : 'FAIL' });
	assert(condition, name);
}
async function main() {
	const files = {
		'/': ['legacy-guide.html', 'text/html; charset=utf-8'],
		'/workflow-engine.js': ['workflow-engine.js', 'application/javascript'],
		'/verification.json': ['verification.json', 'application/json'],
	};
	const server = http.createServer((request, response) => {
		const file = files[new URL(request.url, 'http://localhost').pathname];
		if (!file) {
			response.writeHead(404);
			response.end();
			return;
		}
		response.writeHead(200, { 'Content-Type': file[1] });
		response.end(fs.readFileSync(path.join(__dirname, file[0])));
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	const browser = await chromium.launch();
	try {
		const context = await browser.newContext({
			viewport: { width: 1440, height: 1000 },
			acceptDownloads: true,
		});
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		const url = process.env.LEGACY_PROOF_URL || `http://127.0.0.1:${server.address().port}/`;
		const response = await page.goto(url, { waitUntil: 'networkidle' });
		check('Page loads over HTTP without bypassing CSP', response.status() === 200);
		check(
			'Guide initializes with the original engine',
			await page.evaluate(() => !!window.proofGuide),
		);
		check(
			'Exactly one prominent next action',
			(await page.locator('.primary:visible').count()) === 1,
		);
		check(
			'Only one button is visible on entry',
			(await page.locator('button:visible').count()) === 1,
		);
		check(
			'Twelve project examples start hidden',
			(await page.locator('.evidence:visible').count()) === 0,
		);
		check(
			'Task summary reflects the unassigned state',
			(await page.locator('#owner-name').innerText()) === 'Not assigned',
		);
		check(
			'Review status is visible before acting',
			(await page.locator('#case-state').innerText()) === 'Needs review',
		);
		check('Raw state starts hidden', !(await page.locator('#record').isVisible()));
		check('Scenario selector starts hidden', !(await page.locator('#scenario').isVisible()));
		check('Simulation is disclosed on entry', await page.locator('.simulation').isVisible());
		await page.screenshot({ path: path.join(output, 'entry-desktop.png'), fullPage: true });
		await page.locator('#explain > summary').focus();
		await page.keyboard.press('Enter');
		check('Explanation expands with keyboard', await page.locator('#step-detail').isVisible());
		await page.locator('#next').click();
		check(
			'Conflict appears when relevant',
			(await page.locator('#step-title').innerText()) === 'Same customer. Different instructions.',
		);
		check(
			'Prior explanation closes on advancement',
			!(await page.locator('#step-detail').isVisible()),
		);
		check(
			'Focus moves to the new explanation',
			await page.evaluate(() => document.activeElement.id === 'step-title'),
		);
		check(
			'Both instructions and the short reply are visible',
			(await page.locator('.story-card').count()) === 3,
		);
		await page.screenshot({ path: path.join(output, 'conflict-desktop.png'), fullPage: true });
		await page.locator('#next').click();
		await page.locator('#next').click();
		check(
			'Proposed owner is not accepted',
			await page.evaluate(() => proofGuide.engine.state.acceptedOwner === null),
		);
		await page.locator('#late-option > summary').click();
		await page.locator('#wait').click();
		check(
			'Missed deadline is explained in plain language',
			(await page.locator('#step-title').innerText()) === 'No reply. Not forgotten.',
		);
		check(
			'Escalation retains unaccepted ownership',
			await page.evaluate(
				() => proofGuide.engine.state.escalated && !proofGuide.engine.state.acceptedOwner,
			),
		);
		for (let index = 0; index < 10; index++) {
			if (await page.evaluate(() => proofGuide.current().key === 'done')) break;
			await page.locator('#next').click();
		}
		check(
			'Guided path closes with evidence',
			await page.evaluate(
				() =>
					proofGuide.engine.state.status === 'closed' && !!proofGuide.engine.state.communication,
			),
		);
		check(
			'Closed card shows accepted owner',
			(await page.locator('#owner-name').innerText()) === 'Alex · accepted',
		);
		check(
			'Closed card shows actual engine status',
			(await page.locator('#case-state').innerText()) === 'Resolved',
		);
		const before = await page.evaluate(() => JSON.stringify(proofGuide.engine.state));
		await page.locator('#previous').click();
		check(
			'Previous explanation is explicitly read-only',
			(await page.locator('#step-label').textContent()).includes('current task unchanged'),
		);
		await page.locator('#next').click();
		check(
			'Returning does not mutate task state',
			(await page.evaluate(() => JSON.stringify(proofGuide.engine.state))) === before,
		);
		await page.locator('#next').click();
		check(
			'Project depth is available after the walkthrough',
			(await page.locator('.evidence:visible').count()) === 4,
		);
		await page.locator('#more-projects > summary').click();
		check(
			'All twelve references remain available on request',
			(await page.locator('.evidence:visible').count()) === 12,
		);
		await page.locator('#technical > summary').click();
		await page.locator('#record-tools > summary').click();
		await page.locator('#test-replay').click();
		check(
			'Safeguard test leaves the walkthrough unchanged',
			(await page.evaluate(() => JSON.stringify(proofGuide.engine.state))) === before,
		);
		const downloadPromise = page.waitForEvent('download');
		await page.locator('#export').click();
		const download = await downloadPromise;
		const file = path.join(output, 'exported-record.json');
		await download.saveAs(file);
		check(
			'Export saves the actual current record',
			JSON.stringify(JSON.parse(fs.readFileSync(file, 'utf8'))) === before,
		);
		await page.locator('#reopen-option > summary').click();
		await page.locator('#reopen').click();
		check(
			'New instructions reopen review, not silently overwrite',
			await page.evaluate(
				() =>
					proofGuide.engine.state.priorCases.length === 1 &&
					proofGuide.engine.state.conflictPending,
			),
		);
		for (const scenario of ['happy', 'conflict', 'ambiguous', 'unaccepted']) {
			await page.evaluate(() => {
				document.getElementById('situations').open = true;
			});
			await page.locator('#scenario').selectOption(scenario);
			await page.locator('#load-scenario').click();
			for (let index = 0; index < 12; index++) {
				if (await page.evaluate(() => proofGuide.current().key === 'done')) break;
				await page.locator('#next').click();
			}
			check(
				`${scenario}: visible controls reach completion`,
				await page.evaluate(() => proofGuide.engine.state.status === 'closed'),
			);
		}
		for (const width of [320, 390, 768]) {
			await page.setViewportSize({ width, height: 844 });
			await page.reload({ waitUntil: 'networkidle' });
			check(
				`${width}px: no horizontal overflow`,
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			);
			check(
				`${width}px: primary target is at least 44px tall`,
				(await page.locator('#next').boundingBox()).height >= 44,
			);
			check(
				`${width}px: primary action fits on the initial screen`,
				await page
					.locator('#next')
					.evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight),
			);
			check(
				`${width}px: task status remains visible`,
				await page.locator('#case-state').isVisible(),
			);
			if (width === 390)
				await page.screenshot({ path: path.join(output, 'entry-mobile.png'), fullPage: true });
			await page.locator('#next').click();
			check(
				`${width}px: conflict remains readable`,
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			);
		}
		await page.evaluate(() => {
			proofGuide.engine.state.sources[0].text = '<img src=x onerror="window.injected=true">';
			proofGuide.started = false;
		});
		await page.locator('#next').click();
		check(
			'Source markup is text, not executable HTML',
			(await page.locator('#cards img').count()) === 0 &&
				!(await page.evaluate(() => !!window.injected)),
		);
		await page.emulateMedia({ reducedMotion: 'reduce' });
		check(
			'Reduced motion disables transitions',
			await page.locator('.ticket').evaluate((el) => getComputedStyle(el).animationName === 'none'),
		);
		check('No JavaScript exceptions', errors.length === 0);
		fs.writeFileSync(
			path.join(output, 'browser-results.json'),
			JSON.stringify(
				{
					schema: 'guided-browser-verification.v1',
					observed_at: new Date().toISOString(),
					browser: browser.version(),
					url,
					passed: tests.filter((item) => item.status === 'PASS').length,
					failed: tests.filter((item) => item.status === 'FAIL').length,
					tests,
				},
				null,
				2,
			),
		);
		console.log(`${tests.length} guided browser checks passed.`);
	} finally {
		await browser.close();
		await new Promise((resolve) => server.close(resolve));
	}
}
main().catch((error) => {
	fs.writeFileSync(
		path.join(output, 'failure.json'),
		JSON.stringify({ error: error.message, tests }, null, 2),
	);
	console.error(error);
	process.exitCode = 1;
});
