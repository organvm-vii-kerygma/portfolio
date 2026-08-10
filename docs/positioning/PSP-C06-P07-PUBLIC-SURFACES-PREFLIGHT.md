# PSP-C06 / PSP-P07 public-surfaces preflight

Status: **PREPARED/PREFLIGHT**. This is a reversible inventory, privacy contract, and release
readiness contract. It changes no public surface and does not close a P07 leaf or phase.

## Fixed inputs

- Canonical portfolio: `organvm-vii-kerygma/portfolio` (repository id `1155412125`), public at
  `https://organvm-vii-kerygma.github.io/portfolio/`; main baseline
  `85bfaa84287e4a3b90b49187caa4313c4edda1aa`.
- C04 preflight: Limen [PR #2313](https://github.com/organvm/limen/pull/2313), exact head
  `e9c2db2360acd5fd57a48d063e64990dc8f3a768`.
- P06 experience preflight: portfolio [PR #220](https://github.com/organvm-vii-kerygma/portfolio/pull/220),
  exact head `fa86b67a7283c15ab801302ffac655c30898b6a1`.
- C00/P00 is closed by merged Limen [PR #2300](https://github.com/organvm/limen/pull/2300). Its
  historic non-Codex/Agy identity condition is superseded and is not a C06 blocker.

## Captured baseline

On 2026-08-10, the public portfolio, personal profile, organization profile, declared URL map,
and existing link-health/rollback controls were inspected. The portfolio’s rendered front door is
the rollback baseline. This preflight does not relabel current profile claims, treat candidate
flagships as ratified evidence, or convert a reachable URL into a release receipt.

The machine-readable contract in
[`src/data/psp-p07-public-surface-contract.json`](../../src/data/psp-p07-public-surface-contract.json)
records the full W01–W09 inventory, privacy-safe event dictionary, and release/rollback procedure.

## Reversible work staged now

- W01/W02: public-source inventory only; profile and organization changes remain owner-gated.
- W03: current portfolio is explicitly preserved as rollback baseline; visual implementation is
  blocked on selection and later P06 acceptance.
- W04/W05/W06: resume, candidate flagship, and off-platform work are inventory/staging only.
- W07: URL truth is referenced from Limen’s intended-state registry; no DNS/TLS/redirect action.
- W08: an allowlist-only analytics dictionary distinguishes client and recruiter doors and rejects
  personal, free-text, content, identifier, and cross-site fields. Collection is disabled.
- W09: pre-release receipts and restoration order are specified; no production drill is run.

### Live link-health finding

`python3 scripts/link-health.py --verify` recorded **11 dead links across three tracked
surfaces**. The personal profile, portfolio, and resume still contain legacy
`organvm.github.io/portfolio` paths that return 404; their
`organvm-vii-kerygma.github.io/portfolio` counterparts resolve. This is a recorded preflight
failure, not a repaired or released state. The owning profile/portfolio change must repair the
source links, retain the prior release for rollback, and rerun the same check before W09 can pass.

## Visual gate

Exactly three grounded visual targets have been generated from the captured current portfolio and
the P06 design-context brief. The operator must choose one and record the rejected directions,
identity/proof fit, accessibility/performance risk, and rollback before any visual code or
analytics instrumentation starts. This document deliberately contains no selected target.

## Predicate and rollback

Run `node scripts/validate-psp-p07-preflight.mjs` to validate the contract. The predicate proves
only that the preflight remains constrained; it cannot prove public coherence or phase completion.
Rollback is closing this draft and deleting its branch. The existing public release remains
unchanged.
