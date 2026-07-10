# Podcast Production Pipeline

This guide defines the working production pipeline for The Turning Life podcast and captures the research behind the audio, publishing, and audience-growth choices.

## Production Goal

The show should sound like a calm spiritual dialogue, not a lecture. The recurring format is an older religious guide, Father Rowan, answering sincere questions from Maya Vale and Amara Keene, adult cohosts who are romantic partners. Maya is the younger adult cohost and is in recovery from compulsive sexual behavior, which she may personally describe as sex addiction. Amara is the older of the two adult cohosts and is in recovery from fentanyl addiction / opioid use disorder. Each episode should leave the listener with one concrete practice they can apply that day.

The core promise:

- thoughtful spiritual guidance without coercion
- consent-centered relationship language
- practical self-examination rather than vague inspiration
- enough conversational warmth that listeners return for the cast, not just the topic

## Minimum Release Standard

Every public episode needs:

- MP3 RSS master in `assets/audio/`
- WAV archive master in `assets/audio/`
- transcript in `assets/transcripts/`
- episode entry in `podcast.html`
- item in `podcast.xml`
- stable GUID that never changes
- ASCII-only file name and URL
- checked duration, byte length, and enclosure type

Run these before publishing:

```bash
python3 tools/podcast_qc.py --root .
python3 tools/podcast_loudness_report.py --root .
```

## Recommended Tool Stack

### Core CLI Tools

- `ffmpeg`: render, concatenate, normalize, transcode, inspect audio.
- `ffprobe`: verify codec, duration, channels, sample rate, and stream metadata.
- `edge-tts`: generate the current professional-style voice drafts.
- `python3`: run repeatable QC scripts and feed checks.

### Editing Tools

- REAPER: recommended primary DAW for serious multitrack podcast editing. It supports flexible audio routing, many plugin formats, rendering to many media formats, and render loudness reports.
- Audacity: best free editor for simple cuts, voice cleanup, fast exports, and lightweight work. It is cross-platform, free/open-source, and supports multitrack editing, voice cleanup, plugins, WAV, MP3, FLAC, and Ogg.
- Adobe Audition: paid professional option for cleanup, restoration, spectral repair, multitrack editing, and polished podcast production.

### Optional Processing Tools

- `tools/podcast_loudness_report.py`: verify integrated LUFS/LKFS and true peak on the published MP3 files.
- A loudness meter or DAW render report for interactive mix work.
- A speech-to-text tool for first-pass transcripts, followed by human cleanup.
- A podcast hosting validator or platform dashboard after deployment.

## Audio Specifications

Use the Apple Podcasts RSS audio target as the house standard because it is strict enough for broad podcast distribution.

- RSS audio format: MP3 for current compatibility, AAC is also accepted by Apple.
- Sample rate: 44.1 kHz or 48 kHz.
- Mono voice episode bitrate: 64-128 kbps.
- Stereo episode bitrate: 128-256 kbps.
- Loudness target: about -16 LKFS/LUFS, plus or minus 1 dB.
- True peak ceiling: no higher than -1 dBFS / -1 dBTP.
- Keep WAV archive masters even when the feed uses MP3.

For a three-voice talk show, mono is acceptable when all voices are centered. Stereo can be useful if music, ambience, or spatial cohost placement becomes part of the show identity.

## Episode Pipeline

### 1. Brief

Write a one-page brief before scripting:

- episode title
- listener problem
- one-sentence promise
- theological theme
- relationship or daily-life example
- one concrete practice
- risk notes, such as medical, addiction, consent, abuse, compulsive sexual behavior, opioid/fentanyl recovery, or crisis topics

### 2. Script

Keep the script conversational and structured:

- open with a direct listener problem in the first 15 seconds
- let Maya and Amara ask plain-language questions
- let Father Rowan answer slowly and concretely
- include one moment of gentle disagreement or clarification
- end with one practice, not a slogan

For sensitive topics such as drug abuse relief, recovery, trauma, compulsive sexual behavior, coercive belief, or relationship distress, avoid promising cures. Point listeners toward support, consent, professional help, and self-directed change. Treat Maya's and Amara's recovery histories as lived context, not spectacle or moral branding.

### 3. Voice Generation or Recording

Current generated-voice casting:

- Father Rowan: `en-GB-ThomasNeural`, slower pace, lower pitch.
- Maya Vale: `en-US-JennyNeural`, warm American/Midwestern-style delivery; younger adult cohost in recovery from compulsive sexual behavior.
- Amara Keene: `en-AU-NatashaNeural`, Australian delivery; older adult cohost in recovery from fentanyl addiction / opioid use disorder.

Keep each speaker on a separate source track. This makes pacing, silence, level balancing, and replacement lines easier.

### 4. Assembly Edit

Editing order:

- remove bad takes and repeated phrasing
- tighten long silences but keep the priestly cadence
- remove clicks, hard starts, and unnatural transitions
- balance voice levels before compression
- add intro/outro only if it serves the episode

Avoid overprocessing. A spiritual dialogue should sound intimate, clean, and steady rather than loud or compressed.

### 5. Mix and Master

Recommended processing chain:

1. high-pass filter around 70-90 Hz for speech rumble
2. light noise reduction only when needed
3. gentle compression for level consistency
4. de-esser if sibilance is sharp
5. limiter with true peak ceiling at -1 dBTP
6. loudness normalization around -16 LUFS/LKFS

Export the WAV archive first, then encode feed MP3 from the final master.

### 6. Metadata and Publishing

Update:

- `podcast.html`
- `podcast.xml`
- transcript text file
- episode audio files
- README if the process changes

RSS feed checks:

- RSS 2.0 XML declaration is present.
- Feed is publicly addressable after deployment.
- Each item has exactly one enclosure.
- Enclosure has `url`, `length`, and `type`.
- GUID remains stable and unique.
- PubDate follows RFC 2822.
- Episode URLs and filenames use ASCII characters.
- XML entities are escaped correctly.

YouTube RSS ingestion has a separate reality: it creates static-image videos from show art, uploads new RSS episodes automatically, and does not automatically update already published videos when an RSS audio file changes. Treat YouTube as a distribution copy, not the canonical source.

## Growth Strategy

### Positioning

The show needs a narrow, repeatable promise:

> Spiritual conversations about consent, self-examination, relationship, service, and inner transformation.

Do not chase every religious topic. The show becomes easier to recommend when a listener can describe it in one sentence.

### Cadence

Use a seasonal weekly cadence unless production capacity is high enough for more. A weekly schedule is frequent enough to build habit and realistic enough to keep quality stable.

Recommended launch shape:

- 4-6 finished episodes before public launch
- weekly release day
- one short trailer
- one clear show page
- RSS feed submitted to major directories

### Episode Design

The repeatable structure:

1. Hook: name the listener problem.
2. Question: Maya or Amara asks the practical version.
3. Teaching: Father Rowan gives the principle.
4. Relationship test: the cohosts apply it to adult partnership.
5. Correction: clarify consent, limits, or self-responsibility.
6. Practice: one action for the listener.

This structure keeps episodes useful, searchable, and familiar without sounding mechanical.

### Discovery

Podcast discovery depends heavily on metadata, transcripts, recommendations, and word of mouth. For each episode:

- write a specific title, not a vague inspirational title
- include names of key topics in the description
- publish a transcript
- add chapters for longer episodes
- publish one short quote or clip for social sharing
- link back to the episode page from related site pages

For this site, each episode should also support the broader religious text. Episodes can link to the discernment guide, calendar symbols, affirmations, and member sections when directly relevant.

### Distribution

Priority channels:

- website episode page
- RSS feed
- Apple Podcasts
- Spotify
- YouTube RSS ingestion
- email list or registration flow

The website remains the canonical home because it can host the transcript, supporting text, donation flow, and religious context without platform limits.

### Measurement

Track:

- downloads and plays per episode
- completion rate or average consumption when available
- followers/subscribers
- website clicks from podcast platforms
- transcript page visits
- email registrations after episode release
- topics that produce return listeners

Treat metrics as editorial feedback, not as theology. If a topic performs well, make the next episode more useful, not more manipulative.

## Ethical Guardrails

The show should model the religion's consent principle.

- Never pressure listeners to accept a belief.
- Never frame disagreement as spiritual failure.
- Never promise addiction recovery, mental health healing, compulsive-behavior recovery, or relationship repair as guaranteed.
- Encourage professional help for medical, addiction, compulsive sexual behavior, abuse, self-harm, overdose, or crisis topics.
- Use person-first recovery language; avoid glamorizing fentanyl use, sexual compulsion, relapse, secrecy, or shame.
- Avoid parasocial manipulation: the hosts can be warm without pretending to personally know the listener.
- Preserve listener autonomy: lead people to knowledge, but let them drink by choice.

## Checklists

### Pre-Production

- brief written
- sensitive-topic risks identified
- sources or doctrinal references noted
- episode practice defined
- host roles clear

### Editing

- all voices on separate tracks
- bad takes removed
- transitions natural
- voice levels balanced
- sibilance and plosives checked
- no clipping

### Mastering

- WAV archive exported
- MP3 feed file exported
- loudness near -16 LUFS/LKFS
- true peak no higher than -1 dBTP
- `python3 tools/podcast_loudness_report.py --root .` passes
- duration recorded
- file size recorded

### Publishing

- transcript added
- episode page updated
- RSS item added
- enclosure byte length correct
- GUID stable
- `python3 tools/podcast_qc.py --root .` passes
- `python3 tools/podcast_loudness_report.py --root .` passes
- deployed feed checked by platform dashboard

### Post-Release

- confirm audio plays on the website
- confirm RSS feed is reachable
- check platform ingestion
- publish one quote/clip
- note performance after 7 days and 30 days

## Research Notes

- Edison Research, The Infinite Dial 2025: U.S. podcast consumption reached a record high; 70% of Americans age 12+ had listened to a podcast, 73% had consumed a podcast in audio or video format, and 55% were monthly podcast consumers. YouTube was the service used most often by 33% of U.S. weekly podcast listeners. This supports audio-plus-video distribution and a consistent release schedule. https://www.edisonresearch.com/the-infinite-dial-2025/
- Pew Research Center, top-ranked podcast profile: among 451 top-ranked U.S. podcasts studied, 37% had multiple hosts, 60% averaged under 50 minutes, 73% had a website, and 51% had a video component. This supports a recurring cast, a strong website hub, and optional video distribution later. https://www.pewresearch.org/journalism/2023/06/15/a-profile-of-the-top-ranked-podcasts-in-the-u-s/
- Pew Research Center, podcasts as news and information: listeners use podcasts for entertainment, learning, and background listening; trust can be high, so ethical care matters. https://www.pewresearch.org/journalism/2023/04/18/podcasts-as-a-source-of-news-and-information/
- SAMHSA, substance use disorder treatment options: medications combined with counseling and behavioral therapies can support recovery for substance use disorders; buprenorphine, methadone, and naltrexone are FDA-approved medications for opioid use disorder. This supports portraying fentanyl recovery as a health matter with professional support, not a willpower-only moral test. https://www.samhsa.gov/substance-use/treatment/options
- Mayo Clinic, compulsive sexual behavior: compulsive sexual behavior may be called hypersexuality or sexual addiction and involves difficult-to-control sexual urges or behaviors that cause distress or life problems; treatment and self-help can help people manage it. This supports using careful language around Maya's recovery rather than treating sexuality itself as shameful. https://www.mayoclinic.org/diseases-conditions/compulsive-sexual-behavior/symptoms-causes/syc-20360434
- Apple Podcasts RSS requirements: public RSS 2.0 feed, HEAD and byte-range support, unique enclosures, stable GUIDs, ASCII filenames/URLs, RFC 2822 dates, and correct XML entities. https://podcasters.apple.com/support/823-podcast-requirements
- Apple Podcasts audio requirements: RSS accepts MP3 or AAC; recommended 44.1/48 kHz bitrates are 64-128 kbps for mono and 128-256 kbps for stereo; loudness should be about -16 LKFS with true peak no higher than -1 dBFS. https://podcasters.apple.com/support/893-audio-requirements
- YouTube RSS delivery: YouTube can ingest an audio-first podcast RSS feed and create static-image videos, but it does not automatically update already published videos when RSS audio changes. https://support.google.com/youtube/answer/13525207
- Audacity: free/open-source, cross-platform, multitrack editor and recorder with voice editing, plugins, and WAV/MP3 export. https://www.audacityteam.org/
- REAPER: professional DAW with routing, plugin support, broad render formats, and render loudness reports. https://www.reaper.fm/
- Adobe Audition: professional audio workstation for multitrack, waveform, spectral editing, cleanup, restoration, and podcast creation. https://www.adobe.com/products/audition.html
- Sharpe, "A review of metadata fields associated with podcast RSS feeds": RSS metadata affects recommendations and can be inconsistently used, so metadata should be deliberate and accurate. https://arxiv.org/abs/2009.12298
- Carterette et al., "Podcast Metadata and Content": podcast search can use creator metadata and transcripts, which supports publishing transcripts and descriptive episode metadata. https://arxiv.org/abs/2108.11460
- Jones et al., "Current Challenges and Future Directions in Podcast Information Access": podcast discovery is still difficult and often driven by word of mouth. This supports clear positioning and shareable episode pages. https://arxiv.org/abs/2106.09227
- Ghazimatin et al., "PODTILE": chapters help listeners browse long-form conversational audio and improve retrieval. This supports adding chapters as episodes grow longer. https://arxiv.org/abs/2410.16148
- D'Amico et al., "Deploying Semantic ID-based Generative Retrieval for Large-Scale Podcast Discovery at Spotify": podcast discovery systems increasingly combine stable listener preferences with changing intent and semantic/contextual signals. This supports clear positioning, accurate metadata, and topic-specific episode descriptions. https://arxiv.org/abs/2603.17540
