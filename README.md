# Project Infinity

Project Infinity is a static website for the Religion of Transformation, centered on the belief that willpower and disciplined practice can transform people into better versions of themselves. It includes the public site, a custom Transformation Calendar with multi-part solar and lunar cycle readings, complete symbol system, supplementary religious text, sacred geometry symbols, discernment guide, podcast page, donation page, and ETH/BTC donation UI placeholders.

## Preview

Open `index.html` directly in a browser.

Additional pages:

- `podcast.html`
- `donate.html`
- `symbols.html`
- `affirmations.html`
- `discernment.html`

## Notes

- Replace the placeholder ETH and BTC wallet addresses in `crypto.js` before accepting live crypto donations.
- The podcast page includes three-speaker professional-style generated episode audio files, transcript links, and `podcast.xml` RSS feed metadata; update feed base URLs if a custom domain replaces GitHub Pages.
- The podcast production workflow, tool stack, research notes, publishing checklist, and growth plan are documented in `docs/podcast-production-pipeline.md`.
- Run `python3 tools/podcast_qc.py --root .` before publishing podcast changes to validate RSS enclosure sizes, durations, audio files, and transcripts.
- Run `python3 tools/podcast_loudness_report.py --root .` to check published MP3 loudness against the -16 LUFS / -1 dBTP target.
- The donation page uses an email pledge flow until a payment processor is connected.

- The founding circle form posts JSON to `data-registration-endpoint` when that attribute is set on `#join-form`; otherwise it saves locally and opens an email registration draft.

- Daily affirmation audio files live in `assets/audio/`, with transcripts in `assets/transcripts/`.
- Podcast episode audio files live in `assets/audio/`, with transcripts in `assets/transcripts/`.
- The calendar shows selected-day daily, weekly, monthly, and yearly symbols, and documents the full sets on the homepage and symbol system page.
