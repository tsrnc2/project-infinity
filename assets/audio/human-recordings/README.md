# Human Podcast Recordings

Place raw actor line takes under `assets/audio/human-recordings/<episode-slug>/takes/` using the exact filenames from the recording packet. Use mono WAV when possible, 44.1 kHz or 48 kHz, clean room tone, no baked-in music, no reverb, and no final loudness processing. The build script converts takes into section stems, then adds intro, transitions, ambience, and final podcast loudness.

Synthetic TTS is draft-only. Public masters should be rendered from consented human recordings.
