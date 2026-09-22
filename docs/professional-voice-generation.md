# Professional Voice Generation

The podcast should not use local `edge-tts` output for public episodes. That path is draft-only because the voices sound synthetic. Use a professional voice generation provider for public generated audio, or recorded human actors when available.

## Supported Providers

### OpenAI Speech

Default provider for this repo.

- API key: `OPENAI_API_KEY`
- Build flag: `--voice-source professional --voice-provider openai`
- Default model: `gpt-4o-mini-tts`
- Output requested by the pipeline: WAV, then remastered to the site podcast target
- Voice control: built-in voice plus per-character `instructions`

Official docs: https://platform.openai.com/docs/api-reference/audio/createSpeech

### ElevenLabs

Use this when the account has selected or licensed specific voices for the cast.

- API key: `ELEVENLABS_API_KEY`
- Build flag: `--voice-source professional --voice-provider elevenlabs`
- Requires `tools/professional_voice_config.json` with real `voice_id` values for Father Rowan, Maya Vale, and Amara Keene
- Default model in the example config: `eleven_multilingual_v2`
- Default output: `mp3_44100_128`, converted to WAV before podcast mastering

Official docs: https://elevenlabs.io/docs/api-reference/text-to-speech/convert

## Config

Start from:

```bash
cp tools/professional_voice_config.example.json tools/professional_voice_config.json
```

Do not commit secrets. API keys stay in environment variables, not in JSON files.

OpenAI can run from the example config because it uses built-in voices. ElevenLabs requires replacing the placeholder voice IDs.

## Commands

Render episode 5 with OpenAI:

```bash
OPENAI_API_KEY=... python3 tools/build_podcast_audio.py --episodes 5 --voice-source professional --voice-provider openai
```

Render episode 5 with ElevenLabs:

```bash
ELEVENLABS_API_KEY=... python3 tools/build_podcast_audio.py --episodes 5 --voice-source professional --voice-provider elevenlabs --voice-config tools/professional_voice_config.json
```

Then validate:

```bash
python3 tools/podcast_qc.py --root .
python3 tools/podcast_loudness_report.py --root .
```

## Casting Policy

Use fictional or licensed voices only. Do not clone, imitate, or imply a real person without explicit permission. Keep the cast adult, non-explicit, and recovery-safe.

Suggested character direction:

- Father Rowan: older male religious guide, slow, warm, composed, lightly British/Boston-inspired cadence.
- Maya Vale: adult West Coast woman in her 20s, warm, direct, vulnerable but steady.
- Amara Keene: adult West Coast woman in her 20s, grounded, protective, emotionally clear.

## Draft Audio

The old local synthetic path is still available only for timing review:

```bash
python3 tools/build_podcast_audio.py --episodes 5 --voice-source tts --allow-synthetic
```

Do not publish that output as final podcast audio.
