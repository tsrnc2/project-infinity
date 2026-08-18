#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path


def run(command: list[str]) -> str:
    result = subprocess.run(command, check=False, capture_output=True, text=True)
    output = result.stdout + result.stderr
    if result.returncode:
        raise SystemExit(output.strip() or f"command failed: {' '.join(command)}")
    return output


def loudnorm_measure(input_path: Path, target: float, true_peak: float, lra: float) -> dict[str, str]:
    output = run([
        "ffmpeg",
        "-hide_banner",
        "-nostats",
        "-i",
        str(input_path),
        "-af",
        f"loudnorm=I={target}:TP={true_peak}:LRA={lra}:print_format=json",
        "-f",
        "null",
        "-",
    ])
    match = re.search(r"\{\s*\"input_i\".*?\}\s*", output, re.S)
    if not match:
        raise SystemExit("ffmpeg did not emit loudnorm JSON")
    return json.loads(match.group(0))


def build_filter(data: dict[str, str], target: float, true_peak: float, lra: float) -> str:
    return (
        f"loudnorm=I={target}:TP={true_peak}:LRA={lra}:"
        f"measured_I={data['input_i']}:"
        f"measured_TP={data['input_tp']}:"
        f"measured_LRA={data['input_lra']}:"
        f"measured_thresh={data['input_thresh']}:"
        f"offset={data['target_offset']}:linear=true:print_format=summary"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Apply two-pass FFmpeg loudnorm mastering to an audio file.")
    parser.add_argument("input", help="input audio path")
    parser.add_argument("output", help="output audio path")
    parser.add_argument("--target", type=float, default=-16.0, help="integrated loudness target in LUFS/LKFS")
    parser.add_argument("--true-peak", type=float, default=-1.0, help="maximum true peak in dBTP")
    parser.add_argument("--lra", type=float, default=11.0, help="loudness range target")
    parser.add_argument("--sample-rate", default="44100", help="output sample rate")
    parser.add_argument("--channels", default="1", help="output channel count")
    parser.add_argument("--codec", default=None, help="audio codec, for example libmp3lame, aac, pcm_s16le, flac")
    parser.add_argument("--bitrate", default=None, help="audio bitrate, for example 96k")
    parser.add_argument("--extra-output-option", action="append", default=[], help="additional ffmpeg output option, repeat as needed")
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()
    if not input_path.exists():
        raise SystemExit(f"input not found: {input_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    data = loudnorm_measure(input_path, args.target, args.true_peak, args.lra)
    filtergraph = build_filter(data, args.target, args.true_peak, args.lra)

    command = [
        "ffmpeg",
        "-hide_banner",
        "-nostats",
        "-y",
        "-i",
        str(input_path),
        "-af",
        filtergraph,
        "-ar",
        str(args.sample_rate),
        "-ac",
        str(args.channels),
    ]
    if args.codec:
        command.extend(["-c:a", args.codec])
    if args.bitrate:
        command.extend(["-b:a", args.bitrate])
    command.extend(args.extra_output_option)
    command.append(str(output_path))
    run(command)

    print(f"wrote {output_path}")
    print(f"measured input_i={data['input_i']} input_tp={data['input_tp']} input_lra={data['input_lra']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
