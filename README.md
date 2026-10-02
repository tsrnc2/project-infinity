# Project Infinity

Project Infinity is a static website for the Religion of Transformation, centered on the belief that willpower and disciplined practice can transform people into better versions of themselves. It includes the public site, a custom Transformation Calendar with multi-part solar and lunar cycle readings, complete symbol system, supplementary religious text, sacred geometry symbols, holy mathematics, a 3D planetary pinwheel diagram, discernment guide, annual gathering page, podcast page, donation page, and ETH/BTC donation UI placeholders.


## Current site experience

The public site now uses a shared v3 experience layer:

- `experience.css` provides the common visual shell and responsive presentation.
- `almanac.html` is the first-class Almanac hub for the Transformation Calendar, rites, symbols, reflection, and seasonal observance.
- The homepage entry experience is organized around `Witness → Refine → Create → Serve`.
- The implementation and rollback model are documented in `docs/site-experience-v3.md`.

## Preview

Open `index.html` directly in a browser.

Additional pages:

- `podcast.html`
- `donate.html`
- `symbols.html`
- `affirmations.html`
- `discernment.html`
- `gathering.html`
- `login.html`

## Notes

- Replace the placeholder ETH and BTC wallet addresses in `crypto.js` before accepting live crypto donations.
- The podcast page includes sectioned three-speaker generated episode audio files with personal-life check-ins, an original geometric rhythm intro, integrated emotional moments, natural hesitations, subtle park ambience, an original free-use transition soundtrack, non-destructive master-track manifests, a recurring closing statement, transcript links, and `podcast.xml` RSS feed metadata; update feed base URLs if a custom domain replaces GitHub Pages.
- The podcast production workflow, tool stack, research notes, publishing checklist, and growth plan are documented in `docs/podcast-production-pipeline.md`; professional voice-provider setup is in `docs/professional-voice-generation.md`, and human recording requirements are in `docs/human-podcast-recording-guide.md`.
- Run `python3 tools/podcast_qc.py --root .` before publishing podcast changes to validate RSS enclosure sizes, durations, audio files, and transcripts.
- Run `python3 tools/podcast_loudness_report.py --root .` to check published MP3 loudness against the -16 LUFS / -1 dBTP target.
- The donation page uses an email pledge flow until a payment processor is connected.
- The annual gathering page describes the Turning Games, symbolic prizes, yearly all-member leader vote, appointed council, service prizes, no-gambling fair-play rules, and generated sundial/fractal hero background.

- The membership signup form assigns a member pseudonym, requires email and phone verification, posts JSON to `data-registration-endpoint` when that attribute is set on `#join-form`, otherwise saves locally and opens an email signup draft. Configure `data-email-code-endpoint`, `data-email-verify-endpoint`, `data-phone-code-endpoint`, and `data-phone-verify-endpoint` for live verification; without them the page uses a labeled local demo code.
- The member login page requires HTTPS or localhost, redirects `http://` deployments to `https://`, and posts credentials to `data-login-endpoint` on `#login-form`. The backend should set Secure, HttpOnly, SameSite session cookies and send HSTS headers from the host.
- The members section uses `assets/images/founding-circle-hot-springs-group.webp` for the hot springs solidarity group portrait, with the PNG source saved beside it.

- Daily affirmation audio files live in `assets/audio/`, with transcripts in `assets/transcripts/`.
- Podcast episode audio files live in `assets/audio/`, with transcripts in `assets/transcripts/`.
- Professional generated podcast voices use `tools/professional_voice_config.example.json`; render with `--voice-source professional --voice-provider openai` or `--voice-provider elevenlabs` after setting the required API key.
- Human podcast takes belong under `assets/audio/human-recordings/`; generate actor cue sheets with `python3 tools/build_podcast_audio.py --episodes 5 --voice-source human` and render final public masters with `--voice-source human` after takes are recorded.
- The calendar shows selected-day daily, weekly, monthly, and yearly symbols, plus a birth moon core symbol with advanced daily meaning and self-question prompts.
- The holy math section treats quantum and universal-number language as devotional symbolism, with an explicit boundary against false physics or miracle claims.
- The 3D planetary pinwheel uses a local Three.js module in `vendor/three.module.min.js` and `planet-pinwheel.js`.
