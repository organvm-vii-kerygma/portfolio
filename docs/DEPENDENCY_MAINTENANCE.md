# Dependency maintenance

Use npm and the committed `package-lock.json`. Install with `npm ci`; do not
repair a failed frozen install by running `npm install` in CI.

Dependabot checks npm weekly. Compatible version updates use the existing
minor/patch group; Astro and SVG/sanitization updates remain individual review
items. The TypeScript major-version compatibility hold remains in place.
Security updates are independent of the weekly version group. GitHub Actions
updates receive their own weekly checks so pinned actions can also be maintained.

## Review evidence

CI runs three independent jobs:

- `static-checks`: frozen install, lint, strict typecheck, and negative tests for
  the acceptance gate.
- `dependency-review`: reject introduced high/critical vulnerabilities in runtime,
  development, and unknown scopes. API/action failures also fail the check.
  This is a change review, not an assertion that existing vulnerabilities are gone.
- `build-validation`: frozen install, committed-snapshot PR build, existing browser,
  coverage, package, route, output, and resume validation.

The existing `build-and-deploy` check collects these results and rejects missing,
cancelled, skipped, or failed required jobs. Its summary names the PR head, base,
and tested merge checkout. The PR-only dependency review may skip for main builds.

PR builds use `npm run build:ci`: committed content and navigation facets, without
live metrics synchronization. `validate:github-pages -- --snapshot` checks the
committed index's structure and health thresholds without claiming current
freshness. Main's existing refresh, full freshness check, and publishing build
remain in place. Pages/OIDC permissions exist only in the main-only deploy job,
which waits for acceptance. No PR artifact is deployed.

## When a check fails

Read the failed job and exact revision. An install mismatch needs a corrected
manifest/lockfile; an introduced advisory needs a supported fixed version; a
behavior change needs a focused compatibility repair. An unrelated baseline
failure belongs in its existing repair PR. An unavailable API or runner is
missing evidence and must not become a passing security result.

For a security update, also verify the maintainer advisory's affected/fixed range
and every installed copy. Passing the delta check alone does not prove the
intended advisory disappeared from all install paths.

## Acceptance and authority

The maintenance workflow was integrated through #230 and #235; #234 carries the
separate SVGO security repair. Full output validation also exposed runtime
components outside the closing body tag; the layout keeps those components
inside the body. The workflow does not approve or merge PRs, or change CODEOWNERS
or repository rules.
The original required check name is retained, but its name/App identity alone
does not establish trusted workflow identity. Automatic acceptance remains
dependent on the existing governor/relay's provenance and freshness enforcement.
Code on a PR branch is not an independent trust root for its own approval.

Review each published head's hosted jobs and tested checkout. On main, deployment
requires an uncancelled run and a successful acceptance aggregate. The explicit
status condition permits the PR-only dependency review to be skipped without
suppressing deployment. A successful build alone does not establish publication:
verify the deployment job and its live smoke test for the accepted main revision.
