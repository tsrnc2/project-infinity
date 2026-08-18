#!/usr/bin/env python3
"""Render one synthetic agent-ensemble episode and publish static HTML/RSS. No trading access."""
from __future__ import annotations
import argparse, email.utils, html, json, re, subprocess
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape, quoteattr

CAST = {
    "Iris": "en-US-AvaNeural",
    "Vale": "en-US-AndrewNeural",
    "Kestrel": "en-GB-SoniaNeural",
    "Forge": "en-US-GuyNeural",
    "Lumen": "en-US-EmmaNeural",
    "Sentinel": "en-GB-RyanNeural",
    "Patch": "en-AU-WilliamNeural",
}
SECTIONS = {"Opening", "Personal life check-in", "Teaching", "Emotional turn", "Daily practice", "Closing statement"}

def run(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def probe(path):
    result=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",str(path)],check=True,capture_output=True,text=True)
    return float(result.stdout.strip())

def parse_transcript(path):
    lines=[]; section=None
    for raw in path.read_text(encoding="utf-8").splitlines():
        value=raw.strip()
        if not value: continue
        if value.startswith("[") and value.endswith("]"):
            section=value[1:-1]
            if section not in SECTIONS: raise ValueError(f"unknown section: {section}")
            continue
        match=re.match(r"^([A-Za-z]+):\s+(.+)$",value)
        if not match or match.group(1) not in CAST: raise ValueError(f"invalid transcript line: {value}")
        if not section: raise ValueError("dialogue before section")
        lines.append({"section":section,"speaker":match.group(1),"text":match.group(2)})
    if not lines or not SECTIONS.issubset({line["section"] for line in lines}): raise ValueError("all six sections are required")
    return lines

def intro(path):
    if path.exists(): return
    run("ffmpeg","-y","-f","lavfi","-i","sine=frequency=220:duration=4.2:sample_rate=44100","-af","volume=0.08,afade=t=in:st=0:d=0.25,afade=t=out:st=3.4:d=0.8","-ac","1","-c:a","pcm_s16le",str(path))

def render(args):
    root=Path(args.root).resolve(); lines=parse_transcript(Path(args.transcript))
    slug=args.slug
    tracks=root/"assets/audio/master-tracks"/slug; tracks.mkdir(parents=True,exist_ok=True)
    audio=root/"assets/audio"; transcripts=root/"assets/transcripts"; transcripts.mkdir(parents=True,exist_ok=True)
    transcript_out=transcripts/f"{slug}.txt"; transcript_out.write_text(Path(args.transcript).read_text(encoding="utf-8"),encoding="utf-8")
    intro_path=audio/"the-becoming-system-geometric-intro.wav"; intro(intro_path)
    concat=[intro_path]; stems=[]
    for index,line in enumerate(lines,1):
        safe=re.sub(r"[^a-z0-9]+","-",line["speaker"].lower()).strip("-")
        mp3=tracks/f"{index:03d}-{safe}.source.mp3"; wav=tracks/f"{index:03d}-{safe}.wav"
        if not wav.exists():
            run("edge-tts","--voice",CAST[line["speaker"]],"--text",line["text"],"--write-media",str(mp3))
            run("ffmpeg","-y","-i",str(mp3),"-ar","44100","-ac","1","-c:a","pcm_s16le",str(wav))
            mp3.unlink()
        stems.append({"index":index,**line,"path":str(wav.relative_to(root))})
        concat.append(wav)
    concat_file=tracks/"concat.txt"
    concat_file.write_text("".join("file "+str(path)+"\n" for path in concat),encoding="utf-8")
    premaster=tracks/f"{slug}.premaster.wav"; master=audio/f"{slug}.wav"; mp3=audio/f"{slug}.mp3"
    run("ffmpeg","-y","-f","concat","-safe","0","-i",str(concat_file),"-af","silenceremove=stop_periods=-1:stop_duration=1.2:stop_threshold=-46dB:stop_silence=0.35","-ar","44100","-ac","1","-c:a","pcm_s16le",str(premaster))
    norm=Path(args.normalizer)
    run("python3",str(norm),str(premaster),str(master),"--sample-rate","44100","--channels","1","--codec","pcm_s16le")
    run("python3",str(norm),str(master),str(mp3),"--sample-rate","44100","--channels","1","--codec","libmp3lame","--bitrate","96k")
    duration=probe(mp3)
    manifest={"schema_version":1,"slug":slug,"title":args.title,"synthetic_dramatization":True,"source_transcript":str(transcript_out.relative_to(root)),"intro":str(intro_path.relative_to(root)),"dry_stems":stems,"premaster":str(premaster.relative_to(root)),"archive_master":str(master.relative_to(root)),"feed_file":str(mp3.relative_to(root)),"duration_seconds":round(duration,3)}
    (tracks/f"{slug}.master.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    publish(root,args,duration,mp3,transcript_out)
    print(json.dumps({"slug":slug,"duration":duration,"bytes":mp3.stat().st_size}))

def publish(root,args,duration,mp3,transcript):
    page=root/"podcast.html"; feed=root/"podcast.xml"
    date=datetime.fromisoformat(args.date.replace("Z","+00:00")).astimezone(timezone.utc)
    minutes=int(duration//60); seconds=int(round(duration%60)); display=f"{minutes}:{seconds:02d}"
    card=f'''        <article class="episode-card" id="{html.escape(args.slug)}">
          <span class="episode-meta">Daily system diary | {display} | {date.strftime("%B %d, %Y")}</span>
          <h3>{html.escape(args.title)}</h3>
          <p>{html.escape(args.summary)}</p>
          <p><strong>Cast:</strong> Iris, Vale, Kestrel, Forge, Lumen, Sentinel, and Patch.</p>
          <p><small>Synthetic, anthropomorphic dramatization grounded in sanitized project telemetry. Emotions and dialogue are fictionalized; measurements are not.</small></p>
          <div class="podcast-player"><audio controls preload="metadata"><source src="assets/audio/{args.slug}.mp3" type="audio/mpeg"><source src="assets/audio/{args.slug}.wav" type="audio/wav"></audio></div>
          <div class="episode-actions"><a class="button secondary" href="assets/audio/{args.slug}.mp3">MP3</a><a class="button secondary" href="assets/audio/{args.slug}.wav">WAV</a><a class="button secondary" href="assets/transcripts/{args.slug}.txt">Transcript</a></div>
        </article>
'''
    page_text=page.read_text(encoding="utf-8")
    if f'id="{args.slug}"' not in page_text: page.write_text(page_text.replace("        <!-- DAILY_EPISODES -->",card+"        <!-- DAILY_EPISODES -->"),encoding="utf-8")
    base="https://jacobscryptotrader.duckdns.org/transformation"
    item=f'''    <item>
      <title>{escape(args.title)}</title>
      <description>{escape(args.summary)} Synthetic agent dramatization grounded in sanitized telemetry.</description>
      <content:encoded><![CDATA[<p>{html.escape(args.summary)}</p><p><a href="{base}/assets/transcripts/{args.slug}.txt">Read the transcript</a></p>]]></content:encoded>
      <link>{base}/podcast.html#{args.slug}</link>
      <guid isPermaLink="false">becoming-system-{escape(args.slug)}</guid>
      <pubDate>{email.utils.format_datetime(date)}</pubDate>
      <enclosure url="{base}/assets/audio/{args.slug}.mp3" length="{mp3.stat().st_size}" type="audio/mpeg" />
      <itunes:author>Religion of Transformation Systems Ensemble</itunes:author>
      <itunes:duration>{minutes:02d}:{seconds:02d}</itunes:duration>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>false</itunes:explicit>
    </item>
'''
    feed_text=feed.read_text(encoding="utf-8")
    if f"becoming-system-{args.slug}" not in feed_text:
        feed_text=feed_text.replace("    <!-- DAILY_RSS_ITEMS -->",item+"    <!-- DAILY_RSS_ITEMS -->")
        feed_text=re.sub(r"<lastBuildDate>.*?</lastBuildDate>",f"<lastBuildDate>{email.utils.format_datetime(date)}</lastBuildDate>",feed_text)
        feed.write_text(feed_text,encoding="utf-8")

if __name__=="__main__":
    p=argparse.ArgumentParser(); p.add_argument("--root",required=True); p.add_argument("--transcript",required=True); p.add_argument("--slug",required=True); p.add_argument("--title",required=True); p.add_argument("--summary",required=True); p.add_argument("--date",required=True); p.add_argument("--normalizer",required=True); render(p.parse_args())
