# Human Podcast Recording Guide

Local `edge-tts` generated voices are draft placeholders. Public podcast masters should be built from a professional voice provider or consented human recordings that can deliver genuinely natural performances with proper rights for web and podcast use.

## Voice Casting

- Father Rowan: older male religious guide, calm, slow, warm, British/Boston-inspired cadence without caricature.
- Maya Vale: adult West Coast woman in her 20s, direct, emotionally honest, careful around recovery material.
- Amara Keene: adult West Coast woman in her 20s, grounded, protective, warm, emotionally clear.

Do not use unauthorized voice cloning or imitation of a real person. Get written permission for every voice used publicly.

## Recording Standard

Record each speaker separately when possible.

- Format: WAV, mono preferred, 44.1 kHz or 48 kHz, 16-bit or 24-bit PCM.
- Level: peaks around -12 dBFS to -6 dBFS; no clipping.
- Room: quiet, dry room with soft surfaces; turn off fans, TVs, appliances, and notification sounds.
- Mic: 6-8 inches from mouth with a pop filter; keep the angle and distance consistent.
- Monitoring: closed-back headphones if recording against guide audio.
- Takes: record a few seconds of room tone for each speaker and line retakes when needed.
- Processing: no baked-in music, reverb, aggressive noise reduction, stereo widening, or final loudness processing.

## File Naming

Generate the actor packet first:

```bash
python3 tools/build_podcast_audio.py --episodes 5
```

The command writes cue sheets under `docs/podcast-recording-packets/<episode-slug>/` and a manifest under `assets/audio/human-recordings/<episode-slug>/recording-manifest.json`.

Place every recorded line in:

```text
assets/audio/human-recordings/<episode-slug>/takes/
```

Use the exact filename from the recording packet, for example:

```text
e05-s02-l001-maya-vale.wav
```

## Human Master Build

After all takes are present, render the public episode from human recordings:

```bash
python3 tools/build_podcast_audio.py --episodes 5 --voice-source human
python3 tools/podcast_qc.py --root .
python3 tools/podcast_loudness_report.py --root .
```

The build keeps raw takes separate, creates section stems and a master-track manifest, then renders the public WAV and MP3.

## Draft Synthetic Review Only

Synthetic voices can still be used for timing and script review, but they should not be treated as public human-quality recordings:

```bash
python3 tools/build_podcast_audio.py --episodes 5 --voice-source tts --allow-synthetic
```

If the generated voices sound artificial, do not publish them as final podcast audio. Use them only to judge pacing, script length, music placement, and RSS mechanics.
