const REQUIRED_SCHEMA = 'laurea.report.v2';
const REQUIRED_SUBJECT = '4444J99';
const REQUIRED_REPOSITORY = 'organvm/laurea';
export const FRESHNESS_MS = 36 * 60 * 60 * 1000;
export const PUBLIC_LIMITATION =
	'GitHub activity does not establish authorship, quality, reliability, adoption, or impact.';

function withheldMetrics() {
	return {
		contributions_trailing_12_months: null,
		non_fork_repositories_visible: null,
		pull_requests_opened_trailing_12_months: null,
		organization_memberships_queried: null,
	};
}

function baseSnapshot(state, generatedAt = null) {
	return {
		schema_version: 'portfolio.laurea_snapshot.v2',
		subject: REQUIRED_SUBJECT,
		generated_at: generatedAt,
		source_repository: REQUIRED_REPOSITORY,
		source_sha: null,
		state,
		public_claim: null,
		profile: null,
		limitations: [PUBLIC_LIMITATION],
		metrics: withheldMetrics(),
	};
}

function finiteNonNegative(value) {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validRepositories(repositories) {
	return (
		Array.isArray(repositories) &&
		repositories.every(
			(repository) =>
				repository !== null &&
				typeof repository === 'object' &&
				typeof repository.isFork === 'boolean',
		)
	);
}

function validFindings(findings) {
	if (!Array.isArray(findings) || findings.length === 0) return false;
	return findings.every(
		(finding) =>
			finding !== null &&
			typeof finding === 'object' &&
			typeof finding.axis === 'string' &&
			['measured', 'derived'].includes(finding.status) &&
			!Object.hasOwn(finding, 'tier'),
	);
}

export function normalizeLaureaSnapshot(raw, now = new Date()) {
	try {
		if (!raw || typeof raw !== 'object') return baseSnapshot('error');
		const generatedAt = typeof raw.generated_at === 'string' ? raw.generated_at : null;
		const generatedMs = generatedAt ? Date.parse(generatedAt) : Number.NaN;
		const snapshot = raw.snapshot;
		if (
			raw.schema_version !== REQUIRED_SCHEMA ||
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
		const repositories = snapshot.repos;
		const organizations = snapshot.orgs;
		const sourceSha = raw.source_sha;
		if (
			!finiteNonNegative(contributions?.total) ||
			!finiteNonNegative(contributions?.pull_requests) ||
			!validRepositories(repositories) ||
			!Array.isArray(organizations) ||
			!organizations.every((organization) => typeof organization === 'string') ||
			!validFindings(raw.findings) ||
			typeof sourceSha !== 'string' ||
			!/^[0-9a-f]{7,40}$/i.test(sourceSha)
		) {
			return baseSnapshot('error', generatedAt);
		}

		const nonForkRepositories = repositories.filter(
			(repository) => repository.isFork === false,
		).length;
		return {
			...baseSnapshot('ready', generatedAt),
			source_sha: sourceSha,
			public_claim: {
				claim_id: `laurea.github-activity-profile.${REQUIRED_SUBJECT}.${sourceSha.slice(0, 12)}`,
				claim_status: 'derived_reviewed',
				evidence_state: 'ready',
				disclosure_level: 'L1',
				source_ref: `${REQUIRED_REPOSITORY}@${sourceSha}`,
			},
			profile: {
				label: 'Measured GitHub activity profile',
			},
			metrics: {
				contributions_trailing_12_months: contributions.total,
				non_fork_repositories_visible: nonForkRepositories,
				pull_requests_opened_trailing_12_months: contributions.pull_requests,
				organization_memberships_queried: organizations.length,
			},
		};
	} catch {
		return baseSnapshot('error');
	}
}

export function unavailableLaureaSnapshot() {
	return baseSnapshot('error');
}

export function isLastKnownGoodLaureaSnapshot(candidate) {
	if (!candidate || typeof candidate !== 'object') return false;
	const sourceSha = candidate.source_sha;
	const publicClaim = candidate.public_claim;
	const metrics = candidate.metrics;
	const requiredMetrics = [
		'contributions_trailing_12_months',
		'non_fork_repositories_visible',
		'pull_requests_opened_trailing_12_months',
		'organization_memberships_queried',
	];
	return Boolean(
		candidate.schema_version === 'portfolio.laurea_snapshot.v2' &&
			candidate.subject === REQUIRED_SUBJECT &&
			candidate.source_repository === REQUIRED_REPOSITORY &&
			candidate.state === 'ready' &&
			typeof candidate.generated_at === 'string' &&
			Number.isFinite(Date.parse(candidate.generated_at)) &&
			typeof sourceSha === 'string' &&
			/^[0-9a-f]{7,40}$/i.test(sourceSha) &&
			candidate.profile?.label === 'Measured GitHub activity profile' &&
			Array.isArray(candidate.limitations) &&
			candidate.limitations.includes(PUBLIC_LIMITATION) &&
			publicClaim?.claim_id ===
				`laurea.github-activity-profile.${REQUIRED_SUBJECT}.${sourceSha.slice(0, 12)}` &&
			['verified', 'derived_reviewed'].includes(publicClaim?.claim_status) &&
			publicClaim?.evidence_state === 'ready' &&
			publicClaim?.disclosure_level === 'L1' &&
			publicClaim?.source_ref === `${REQUIRED_REPOSITORY}@${sourceSha}` &&
			metrics &&
			requiredMetrics.every((metric) => finiteNonNegative(metrics[metric])),
	);
}
