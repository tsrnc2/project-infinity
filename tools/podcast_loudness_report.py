#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse


BASE_URLS = (
    "https://tsrnc2.github.io/project-infinity/",
    "https://jacobscryptotrader.duckdns.org/transformation/",
)


def report(kind: str, message: str) -> None:
    print(f"{kind}: {message}")


def enclosure_path(root: Path, url: str) -> Path | None:
    for base_url in BASE_URLS:
        if url.startswith(base_url):
            return root / url.removeprefix(base_url)
    parsed = urlparse(url)
    if parsed.netloc == "tsrnc2.github.io" and parsed.path.startswith("/project-infinity/"):
        return root / parsed.path.removeprefix("/project-infinity/")
    if parsed.netloc == "jacobscryptotrader.duckdns.org" and parsed.path.startswith("/transformation/"):
        return root / parsed.path.removeprefix("/transformation/")
    return None


def feed_audio_files(root: Path) -> list[Path]:
    feed_path = root / "podcast.xml"
    tree = ET.parse(feed_path)
    channel = tree.getroot().find("channel")
    if channel is None:
        raise RuntimeError("podcast.xml is missing channel")

    files: list[Path] = []
    for item in channel.findall("item"):
        enclosure = item.find("enclosure")
        if enclosure is None:
            continue
        path = enclosure_path(root, enclosure.attrib.get("url", ""))
        if path is not None:
            files.append(path)
    return files


def loudness_measure(path: Path, target: float, true_peak: float, lra: float) -> dict[str, str]:
    command = [
        "ffmpeg",
        "-hide_banner",
        "-nostats",
        "-i",
        str(path),
        "-af",
        f"loudnorm=I={target}:TP={true_peak}:LRA={lra}:print_format=json",
        "-f",
        "null",
        "-",
    ]
    result = subprocess.run(command, check=False, capture_output=True, text=True)
    output = result.stdout + result.stderr
    match = re.search(r"\{\s*\"input_i\".*?\}\s*", output, re.S)
    if result.returncode or not match:
        raise RuntimeError(output.strip() or "ffmpeg loudnorm failed")
    return json.loads(match.group(0))


def main() -> int:
    parser = argparse.ArgumentParser(description="Check podcast MP3 loudness against the publishing target.")
    parser.add_argument("--root", default=".", help="site root containing podcast.xml")
    parser.add_argument("files", nargs="*", help="specific audio files to check; defaults to podcast.xml enclosures")
    parser.add_argument("--target", type=float, default=-16.0, help="integrated loudness target in LUFS/LKFS")
    parser.add_argument("--tolerance", type=float, default=1.0, help="allowed loudness variance in dB")
    parser.add_argument("--true-peak", type=float, default=-1.0, help="maximum allowed true peak in dBTP")
    parser.add_argument("--lra", type=float, default=11.0, help="loudness range target passed to ffmpeg loudnorm")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if args.files:
        files = [(root / file).resolve() if not Path(file).is_absolute() else Path(file) for file in args.files]
    else:
        files = feed_audio_files(root)

    if not files:
        report("FAIL", "no audio files found")
        return 1

    failures = 0
    for path in files:
        if not path.exists():
            report("FAIL", f"missing audio file: {path}")
            failures += 1
            continue
        try:
            data = loudness_measure(path, args.target, args.true_peak, args.lra)
        except RuntimeError as exc:
            report("FAIL", f"{path.name}: {exc}")
            failures += 1
            continue

        integrated = float(data["input_i"])
        peak = float(data["input_tp"])
        loudness_ok = abs(integrated - args.target) <= args.tolerance
        peak_ok = peak <= args.true_peak
        kind = "OK" if loudness_ok and peak_ok else "FAIL"
        if kind == "FAIL":
            failures += 1
        report(
            kind,
            f"{path.name}: integrated {integrated:.2f} LUFS, true peak {peak:.2f} dBTP",
        )

    if failures:
        report("FAIL", f"{failures} loudness issue(s) need attention")
        return 1

    report("OK", f"all {len(files)} audio file(s) meet loudness targets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
