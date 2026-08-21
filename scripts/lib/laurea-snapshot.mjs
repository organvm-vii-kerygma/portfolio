const REQUIRED_SUBJECT = '4444J99';
const REQUIRED_REPOSITORY = 'organvm/laurea';
export const FRESHNESS_MS = 36 * 60 * 60 * 1000;
export const PUBLIC_LIMITATION =
	'GitHub activity does not establish quality, reliability, adoption, or business impact.';

function withheldMetrics() {
	return {
		contributions_trailing_12_months: null,
		non_fork_repositories_visible: null,
		pull_requests_opened_trailing_12_months: null,
		organizations_queried: null,
	};
}

function baseSnapshot(state, generatedAt = null) {
	return {
		schema_version: 'portfolio.laurea_snapshot.v1',
		subject: REQUIRED_SUBJECT,
		generated_at: generatedAt,
		source_repository: REQUIRED_REPOSITORY,
		source_sha: null,
		state,
		composite: null,
		limitations: [PUBLIC_LIMITATION],
		metrics: withheldMetrics(),
	};
}

function finiteNonNegative(value) {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function normalizeLaureaSnapshot(raw, now = new Date()) {
	try {
		if (!raw || typeof raw !== 'object') return baseSnapshot('error');
		const generatedAt = typeof raw.generated_at === 'string' ? raw.generated_at : null;
		const generatedMs = generatedAt ? Date.parse(generatedAt) : Number.NaN;
		const snapshot = raw.snapshot;
		if (
			raw.login !== REQUIRED_SUBJECT ||
			snapshot?.login !== REQUIRED_SUBJECT ||
			raw.source_repository !== REQUIRED_REPOSITORY ||
			!Number.isFinite(generatedMs)
		) {
			return baseSnapshot('error', Number.isFinite(generatedMs) ? generatedAt : null);
		}

		const ageMs = now.getTime() - generatedMs;
		if (ageMs < -5 * 60 * 1000 || ageMs > FRESHNESS_MS) {
			return {
				...baseSnapshot('stale', generatedAt),
				source_sha: typeof raw.source_sha === 'string' ? raw.source_sha : null,
			};
		}

		const contributions = snapshot.contributions;
		const nonForkRepos = Array.isArray(snapshot.repos)
			? snapshot.repos.filter((repo) => repo?.isFork === false).length
			: Number.NaN;
		const organizations = Array.isArray(snapshot.orgs) ? snapshot.orgs.length : Number.NaN;
		const composite = Array.isArray(raw.findings)
			? raw.findings.find((finding) => finding?.axis === 'composite_python_full_stack')
			: null;
		const sourceSha = raw.source_sha;
		if (
			!finiteNonNegative(contributions?.total) ||
			!finiteNonNegative(contributions?.pull_requests) ||
			!finiteNonNegative(nonForkRepos) ||
			!finiteNonNegative(organizations) ||
			!composite ||
			typeof composite.tier !== 'string' ||
			!/^top (0\.1|1|5)%$/.test(composite.tier) ||
			typeof sourceSha !== 'string' ||
			!/^[0-9a-f]{7,40}$/i.test(sourceSha)
		) {
			return baseSnapshot('error', generatedAt);
		}

		return {
			...baseSnapshot('ready', generatedAt),
			source_sha: sourceSha,
			composite: {
				tier: composite.tier,
				claim: `${composite.tier.replace(/^./, (char) => char.toUpperCase())} GitHub output profile`,
			},
			metrics: {
				contributions_trailing_12_months: contributions.total,
				non_fork_repositories_visible: nonForkRepos,
				pull_requests_opened_trailing_12_months: contributions.pull_requests,
				organizations_queried: organizations,
			},
		};
	} catch {
		return baseSnapshot('error');
	}
}

export function unavailableLaureaSnapshot() {
	return baseSnapshot('error');
}
