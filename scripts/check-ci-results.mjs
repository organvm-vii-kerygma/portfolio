import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function checkResults(results, event) {
	if (!results || typeof results !== 'object' || Array.isArray(results)) {
		throw new Error('Missing CI job results');
	}
	if (
		!['pull_request', 'push', 'schedule', 'workflow_dispatch', 'repository_dispatch'].includes(
			event,
		)
	) {
		throw new Error('Unknown CI event');
	}
	const required = ['static-checks', 'build-validation'];
	if (event === 'pull_request') required.push('dependency-review', 'dependency-evidence');
	return required.filter((job) => results[job]?.result !== 'success');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	try {
		const results = JSON.parse(process.env.CI_RESULTS ?? 'null');
		const failures = checkResults(results, process.env.CI_EVENT);
		const report = [
			`Reviewed head: ${process.env.REVIEWED_HEAD ?? 'unavailable'}`,
			`Tested checkout: ${process.env.TESTED_SHA ?? 'unavailable'}`,
			`PR base: ${process.env.REVIEWED_BASE || 'not a pull request'}`,
			...Object.entries(results).map(([job, value]) => `${job}: ${value.result}`),
			failures.length
				? `Required checks incomplete: ${failures.join(', ')}`
				: 'All applicable checks passed.',
		].join('\n');
		console.log(report);
		if (process.env.GITHUB_STEP_SUMMARY)
			appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
		process.exitCode = failures.length ? 1 : 0;
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
