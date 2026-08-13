# PSP-P06 design-context and progressive-disclosure preflight

Status: **PREPARED/PREFLIGHT**. This is an information-architecture and quality contract, not a
visual redesign. The current public release remains the rollback baseline.

The canonical owner is `organvm-vii-kerygma/portfolio` (repository id `1155412125`), as accepted
by PSP-P02 and the current Limen program registry. This portfolio contract remains non-publishing
and does not rewrite Limen registry state.

## Bound identity and commercial context

This package consumes the current fetched C03 checkpoint at
`c94bc3748fcf2d1dc802a4bae972df23d9a9fbec`, including formally closed W01-W06, the W06
authority-language receipt at
https://github.com/organvm/limen/issues/2187#issuecomment-5271254820, and receipt SHA-256
`260081dfbffc75d55824c0e6ed7d7718a7e397763afb689c94d2230963d79617`, without claiming
C03 closure:

- canonical identity: **Production-systems architect**;
- headline: **I build production systems that solve expensive problems.**;
- proof hierarchy: governed method and Limen first; the public-records platform and AI Chat
  Exporter as supporting, non-overlapping proof; the wider estate only for diligence;
- authorship: architected and directed by one person through a governed multi-agent production
  system;
- client path: read-only Agentic Delivery Audit, then a one-team/pipeline Governance Install, then
  a finite retainer when prerequisites exist;
- recruiter path: a named senior systems mandate mapped to inspectable proof, without executive
  title inflation;
- authority boundary: sponsor-granted written scope, collaborative and reversible work,
  current-owner visibility, and explicit handoff;
- partnership path: secondary, qualified L3 diligence only—never an L1 or L2 door;
- no public price, implied agreement, send, production access, or organization-takeover promise.

PSP-P02 is formally closed. Evidence-sensitive copy still resolves through dated claim sources and
remains withheld when stale, contradictory, private, or unsupported.

C03 W07 remains the sole unsatisfied dependency. Its genuine five-reader evidence cannot be
solicited by this lane or replaced by W06 model review.

## Taste brief

The desired experience is premium because it is calm, exact, and evidence-bearing—not because it
adds ornament. L1 should feel like a confident executive brief: one identity, one expensive
problem, one strongest proof, two audience doors. L2 should feel like a well-edited case file:
method, decision, evidence, failure, limitation, and bounded next step. L3 may become dense, but its
density must be indexed, searchable, and voluntary.

The visual language must be derived later from the existing Astro design system, semantic tokens,
theme behavior, project cards, depth controls, and portfolio assets. The preflight does not invent
a palette, type system, icon language, grid, hero treatment, or animation style.

### Anti-patterns

- repository/test volume as hero proof;
- percentile, ranking, or top-percent badges;
- a dashboard wall before the reader understands the role and problem;
- more than two public front-door choices;
- partnership, equity, or operator solicitation at L1/L2;
- hover-only evidence, hidden focus, or motion-dependent comprehension;
- stale evidence presented as current;
- private data or identifiers shipped to the browser;
- a visual direction selected implicitly through early code.

## Content and route contract

[`src/data/psp-p06-experience-contract.json`](../../src/data/psp-p06-experience-contract.json)
defines the typed content objects, canonical route map, disclosure rules, audience flows,
evidence-card states, and quality budgets. Existing routes are reused where their purpose fits.
Planned flagship routes remain declarations only; no page or component is scaffolded by this
checkpoint.

L1 contains identity, expensive problem, Limen proof pointer, authorship boundary, and the client
and recruiter doors. L2 contains method, all three proof roles, offer or role boundaries, dated
evidence state, and limitations. L3 contains the public claim/evidence index, failures, change
history, qualification, and the gated partnership-review pointer. `PRIVATE_WITHHELD` is never a
route, navigation item, search record, analytics label, or client payload.

## Evidence-card state matrix

| State | What the reader sees | Safety rule |
| --- | --- | --- |
| `loading` | Neutral skeleton and explicit status | No claim value while unresolved |
| `ready` | Bounded claim, source, date, exact head, limitations | Only after resolver approval |
| `empty` | Evidence not yet supplied | Claim withheld |
| `stale` | Last observation and expired status | Numeric/liveness value hidden |
| `error` | Evidence temporarily unavailable | Last known state is not promoted |
| `withheld` | Policy or evidence gate is unsatisfied | No substitute claim |
| `private` | Public boundary only | No private title, value, path, or identifier |

## Client and recruiter L1-L3 requirements

The client must move from “Can this become governable without takeover?” to method and bounded
scope, then to receipts and a decision to approve, narrow, or decline. The recruiter/executive must
move from identity and mandate fit to role-to-proof mapping, then to architecture, failures, and
limitations. Either public reader reaches L3 in no more than two deliberate actions. The operating
partner has no L1/L2 path and may appear only inside qualified L3 diligence.

## Accessibility, performance, and motion budgets

The later selected design targets WCAG 2.2 AA, complete keyboard operation and visible focus,
sequential headings, 200% zoom, and a 320px minimum responsive review. Production measurement must
hold LCP at or below 2.5s p75, INP at or below 200ms p75, CLS at or below 0.1, initial compressed JS
at or below 200KB, initial compressed CSS at or below 60KB, and L1 media at or below 500KB unless a
reviewed exception narrows another budget. Reduced-motion mode removes nonessential transforms,
parallax, autoplay, and reveal dependencies while keeping state changes immediate and legible.

## Locked three-direction gate

Visual ideation starts only after W07 closes and C03 formally integrates. Product Design then
produces exactly three materially distinct visual targets from this same content and
interaction contract, showing desktop/mobile L1 and one L2 evidence state. The human selection
receipt records the chosen and rejected directions, rationale, identity/proof fit, accessibility
and performance risks, and rollback. Until that receipt exists: no UI code, new routes, mock server,
deployment, analytics mutation, or public effect.
