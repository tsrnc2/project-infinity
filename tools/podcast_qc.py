#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlparse


BASE_URLS = (
    "https://tsrnc2.github.io/project-infinity/",
    "https://jacobscryptotrader.duckdns.org/transformation/",
)
ITUNES = "{http://www.itunes.com/dtds/podcast-1.0.dtd}"


def child_text(node: ET.Element, name: str) -> str:
    child = node.find(name)
    return (child.text or "").strip() if child is not None else ""


def parse_duration(value: str) -> float | None:
    value = value.strip()
    if not value:
        return None
    parts = value.split(":")
    try:
        numbers = [int(part) for part in parts]
    except ValueError:
        return None
    if len(numbers) == 1:
        return float(numbers[0])
    if len(numbers) == 2:
        minutes, seconds = numbers
        return float(minutes * 60 + seconds)
    if len(numbers) == 3:
        hours, minutes, seconds = numbers
        return float(hours * 3600 + minutes * 60 + seconds)
    return None


def ffprobe(path: Path) -> dict[str, object]:
    command = [
        "ffprobe",
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        str(path),
    ]
    result = subprocess.run(command, check=False, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or "ffprobe failed")
    return json.loads(result.stdout)


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


def transcript_path_for(audio_path: Path) -> Path:
    return audio_path.parent.parent / "transcripts" / f"{audio_path.stem}.txt"


def report(kind: str, message: str) -> None:
    print(f"{kind}: {message}")


def check_required_channel_fields(channel: ET.Element) -> int:
    failures = 0
    for field in ("title", "link", "description", "language"):
        if not child_text(channel, field):
            report("FAIL", f"channel is missing <{field}>")
            failures += 1
    return failures


def check_pubdate(item: ET.Element, title: str) -> int:
    pubdate = child_text(item, "pubDate")
    if not pubdate:
        report("FAIL", f"{title}: missing pubDate")
        return 1
    try:
        parsedate_to_datetime(pubdate)
    except (TypeError, ValueError):
        report("FAIL", f"{title}: pubDate is not RFC 2822 parseable: {pubdate}")
        return 1
    return 0


def check_item(root: Path, item: ET.Element, seen_guids: set[str]) -> int:
    failures = 0
    title = child_text(item, "title") or "(untitled item)"
    guid = child_text(item, "guid")
    duration_text = child_text(item, f"{ITUNES}duration")
    enclosure = item.find("enclosure")

    for field in ("title", "description", "link"):
        if not child_text(item, field):
            report("FAIL", f"{title}: missing <{field}>")
            failures += 1

    if not guid:
        report("FAIL", f"{title}: missing guid")
        failures += 1
    elif guid in seen_guids:
        report("FAIL", f"{title}: duplicate guid {guid}")
        failures += 1
    else:
        seen_guids.add(guid)

    failures += check_pubdate(item, title)

    if enclosure is None:
        report("FAIL", f"{title}: missing enclosure")
        return failures + 1

    url = enclosure.attrib.get("url", "")
    length = enclosure.attrib.get("length", "")
    media_type = enclosure.attrib.get("type", "")

    if not url or not length or not media_type:
        report("FAIL", f"{title}: enclosure must include url, length, and type")
        failures += 1

    if media_type != "audio/mpeg":
        report("WARN", f"{title}: enclosure type is {media_type}, expected audio/mpeg for MP3")

    if re.search(r"[^A-Za-z0-9:/._#?=&%-]", url):
        report("FAIL", f"{title}: enclosure URL contains non-ASCII or unsafe characters")
        failures += 1

    audio_path = enclosure_path(root, url)
    if audio_path is None:
        report("WARN", f"{title}: enclosure URL is outside configured base URL")
        return failures

    if not audio_path.exists():
        report("FAIL", f"{title}: audio file not found: {audio_path.relative_to(root)}")
        return failures + 1

    try:
        expected_length = int(length)
    except ValueError:
        report("FAIL", f"{title}: enclosure length is not an integer")
        failures += 1
    else:
        actual_length = audio_path.stat().st_size
        if actual_length != expected_length:
            report(
                "FAIL",
                f"{title}: enclosure length {expected_length} does not match file size {actual_length}",
            )
            failures += 1

    transcript_path = transcript_path_for(audio_path)
    if not transcript_path.exists():
        report("FAIL", f"{title}: transcript missing: {transcript_path.relative_to(root)}")
        failures += 1

    try:
        probe = ffprobe(audio_path)
    except RuntimeError as exc:
        report("FAIL", f"{title}: {exc}")
        return failures + 1

    streams = [stream for stream in probe.get("streams", []) if stream.get("codec_type") == "audio"]
    if not streams:
        report("FAIL", f"{title}: no audio stream found")
        return failures + 1

    stream = streams[0]
    codec = stream.get("codec_name")
    sample_rate = int(stream.get("sample_rate", 0) or 0)
    channels = int(stream.get("channels", 0) or 0)
    actual_duration = float(probe.get("format", {}).get("duration", 0) or 0)
    expected_duration = parse_duration(duration_text)

    if codec != "mp3":
        report("WARN", f"{title}: codec is {codec}, expected mp3")
    if sample_rate not in (44100, 48000):
        report("WARN", f"{title}: sample rate is {sample_rate}, expected 44100 or 48000")
    if channels not in (1, 2):
        report("WARN", f"{title}: channel count is {channels}, expected mono or stereo")
    if expected_duration is None:
        report("FAIL", f"{title}: missing or invalid itunes:duration")
        failures += 1
    elif abs(actual_duration - expected_duration) > 2:
        report(
            "FAIL",
            f"{title}: itunes:duration {duration_text} differs from file duration {actual_duration:.1f}s",
        )
        failures += 1

    report(
        "OK",
        f"{title}: {actual_duration:.1f}s, {sample_rate} Hz, {channels} channel(s), {audio_path.name}",
    )
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate podcast RSS, audio enclosures, and transcripts.")
    parser.add_argument("--root", default=".", help="site root containing podcast.xml")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    feed_path = root / "podcast.xml"
    if not feed_path.exists():
        report("FAIL", f"podcast.xml not found under {root}")
        return 1

    try:
        tree = ET.parse(feed_path)
    except ET.ParseError as exc:
        report("FAIL", f"podcast.xml is not valid XML: {exc}")
        return 1

    channel = tree.getroot().find("channel")
    if channel is None:
        report("FAIL", "podcast.xml is missing channel")
        return 1

    failures = check_required_channel_fields(channel)
    items = channel.findall("item")
    if not items:
        report("FAIL", "feed has no episode items")
        failures += 1

    seen_guids: set[str] = set()
    for item in items:
        failures += check_item(root, item, seen_guids)

    if failures:
        report("FAIL", f"{failures} issue(s) need attention")
        return 1

    report("OK", f"podcast feed passed with {len(items)} episode(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
