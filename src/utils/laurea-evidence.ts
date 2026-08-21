export type EvidenceState = 'ready' | 'stale' | 'error' | 'withheld';

const FRESHNESS_MS = 36 * 60 * 60 * 1000;
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export function effectiveEvidenceState(
	state: EvidenceState,
	generatedAt: string | null,
	nowMs = Date.now(),
): EvidenceState {
	if (state !== 'ready') return state;
	const generatedMs = generatedAt ? Date.parse(generatedAt) : Number.NaN;
	if (!Number.isFinite(generatedMs) || nowMs - generatedMs < -FUTURE_TOLERANCE_MS) return 'error';
	return nowMs - generatedMs > FRESHNESS_MS ? 'stale' : 'ready';
}
