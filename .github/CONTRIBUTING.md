# Contributing to Portfolio

Thank you for your interest in contributing to the Portfolio project!

## Development Workflow

1.  **Fork the repo** and create your branch from `main`.
2.  **Install dependencies**: use Node 22 (at least 22.19), run `npm install --global npm@11.9.0 --ignore-scripts`, then `npm ci`. The `packageManager` field pins npm; commit only npm lockfiles. Use `npm install <package>@<version> --save-exact` when deliberately changing a dependency, then run `npm run lint:fix` to normalize the manifest.
3.  **Run tests**: `npm run test`.
4.  **Enforce Quality**: Ensure `npm run validate` and `npm run verify:quality` pass.
5.  **Commit with conventional prefixes**: `feat:`, `fix:`, `chore:`, `docs:`.

## Quality Ratchet

This project uses a "Quality Ratchet" system. Every contribution must maintain or improve the current quality metrics (coverage, performance, a11y).

## Reporting Issues

Please use the GitHub Issue templates for bug reports and feature requests.

## Dependency acceptance

Weekly groups contain compatible version updates. Majors, Astro, SVG/sanitization and rendering changes need focused review; security updates remain separate from weekly version groups.

The CI aggregate requires independent static, build/test, dependency-review and dependency-evidence jobs. The evidence artifact records exact base/head/tested revisions, full lockfile graph changes, and base-to-candidate advisory closure. Registry errors fail evidence collection. Existing severe vulnerabilities and unusual changes produce explicit exceptions; a green compatibility check alone never authorizes acceptance.

The governor/relay must verify the trusted workflow identity, complete required-job results and the current base/head/merge revisions before delegated review. A candidate-generated artifact is evidence, not authority. After #230 and #235 land, the existing security PR #234 must be tested again against accepted main; old results do not cover the new workflow.
