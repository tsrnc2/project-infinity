# TODO / Next Steps — project-infinity

Status: original active public project  
Primary goal: clarify the product, shrink repository noise, and make the public build/deployment path reproducible.

## P0 — define the project clearly

- [ ] Rewrite the README opening so a new visitor can identify the problem, target user, current maturity, and runnable entry point within 30 seconds.
- [ ] Add a feature/status matrix: working, experimental, planned, deprecated.
- [ ] Document architecture and data flow at subsystem level.
- [ ] Identify original code, generated content, vendor code, and external assets explicitly.

## P0 — repository-size audit

- [ ] Inventory files over 1 MB, 10 MB, 50 MB, and 100 MB.
- [ ] Classify large content as source, runtime asset, vendor dependency, generated output, cache, or release artifact.
- [ ] Remove replaceable build output from Git and use LFS/external release storage where appropriate.
- [ ] Measure clean-clone size and initial setup time after cleanup.

## P1 — reproducible build/deploy

- [ ] Establish one canonical local build/run command.
- [ ] Establish one canonical production/Pages deployment path generated from source.
- [ ] Add dependency lock/version policy.
- [ ] Add a smoke test that proves the built artifact starts and core navigation/features work.
- [ ] Document rollback/recovery for deployment failures.

## P1 — CI and quality

- [ ] Add build, test, lint/format, dependency, secret, and broken-link checks.
- [ ] Add accessibility checks for web-facing UI.
- [ ] Add browser/runtime compatibility matrix appropriate to supported platforms.
- [ ] Set budgets for generated bundle size, startup/load time, and high-cost media assets.

## P1 — public-project hygiene

- [ ] Add/verify LICENSE, SECURITY, CONTRIBUTING, changelog, and issue templates.
- [ ] Resolve or classify open issues by severity/milestone.
- [ ] Add screenshots/demo tied to a version/tag.
- [ ] Make planned capabilities visibly different from shipped capabilities.

## P2 — maintainability

- [ ] Create ADRs for major architecture/deployment choices.
- [ ] Split oversized modules/assets along clear ownership boundaries.
- [ ] Delete duplicated documentation when a canonical source exists.
- [ ] Create release tags with concise release evidence.

## Done when

A stranger can clone, build, understand, and evaluate the project without tribal knowledge; the public deployment is reproducible; and large/generated content has an explicit storage policy.