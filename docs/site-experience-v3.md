# Site Experience v3

Status: candidate upgrade  
Scope: public Religion of Transformation website shell and information architecture

## Goals

1. Make the site feel coherent and intentional rather than like a collection of independent features.
2. Preserve the existing doctrine, practices, rites, calendar logic, symbol content, member flows, podcast, and donation pages.
3. Make the Almanac a first-class organizing surface for calendar, rites, symbols, reflection, and seasonal observance.
4. Keep the public site usable on desktop and mobile with keyboard-visible focus and reduced-motion support.
5. Keep the upgrade reversible.

## Architecture

The upgrade is additive:

- `experience.css` is the final stylesheet on public HTML pages and supplies the shared v3 visual layer.
- `site.js` owns the responsive primary navigation behavior.
- `almanac.html` is the editorial hub that connects existing calendar and practice surfaces instead of duplicating their logic.
- `index.html` keeps all existing substantive sections while replacing the entry experience with a clearer four-part path and Almanac gateway.

The core practice cycle remains:

`Witness → Refine → Create → Serve`

## Visual system

Primary visual language:

- near-black / midnight field;
- cyan for living/process signals;
- gold for vows, thresholds, and primary actions;
- violet as a secondary celestial accent;
- parchment surfaces for long-form reading;
- concentric/celestial geometry used as a pattern, not as decorative clutter.

Typography uses system sans-serif for interface text and a serif display face for doctrinal/editorial hierarchy. No external font dependency is required.

## Navigation

The shared primary navigation is intentionally reduced to:

- Beliefs
- Practice
- Rites
- Almanac
- Symbols
- Community
- Listen
- Members
- Join

Deep features remain available from their page content and the Almanac hub.

## Validation

The candidate branch was checked for:

- one `experience.css` reference per public HTML page;
- one responsive primary navigation per public HTML page;
- one `site.js` reference per public HTML page;
- balanced `head` and `body` structure;
- existence of the newly referenced local files;
- balanced braces in `experience.css`;
- presence of the new homepage hero and Almanac gateway.

## Rollback

The v3 layer can be rolled back independently by reverting the upgrade commits. Because the existing underlying pages, calendar implementation, doctrine, and specialized scripts were not replaced, rollback does not require reconstructing the prior content model.
