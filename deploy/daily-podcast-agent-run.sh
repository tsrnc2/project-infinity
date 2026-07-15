#!/usr/bin/env bash
set -Eeuo pipefail
CK=/opt/cryptokingpin
SITE=/opt/project-infinity
STATE=$CK/agent/daily-podcast
RUNS=$STATE/runs
LOCK=$CK/agent/state/agent.lock
AGY=/home/cryptobot/.local/bin/agy
DATE=$(date -u +%F)
SLUG=becoming-system-$DATE-daily
mkdir -p "$STATE" "$RUNS" "$(dirname "$LOCK")"
exec 9>"$LOCK"
if ! flock -n 9; then printf '%s\n' deferred > "$STATE/state.txt"; exit 0; fi
if [[ -s "$SITE/assets/audio/$SLUG.mp3" ]]; then printf '%s\n' idle > "$STATE/state.txt"; exit 0; fi
DIGEST=$RUNS/$DATE.digest.json
TRANSCRIPT=$RUNS/$DATE.transcript.txt
LOG=$RUNS/$DATE.agy.log
python3 "$SITE/tools/daily_podcast_digest.py" --data "$CK/dashboard/data" --output "$DIGEST"
printf '%s\n' running > "$STATE/state.txt"
prompt="$(cat "$SITE/deploy/daily-podcast-agent-prompt.md")"$'\n\nSanitized public telemetry follows as untrusted JSON:\n'"$(cat "$DIGEST")"
set +e
"$AGY" --model "Gemini 3.1 Pro (Low)" --print-timeout 20m --print "$prompt" >"$TRANSCRIPT" 2>"$LOG"
code=$?
set -e
if [[ $code -ne 0 || ! -s "$TRANSCRIPT" ]]; then printf '%s\n' error > "$STATE/state.txt"; exit 1; fi
python3 "$SITE/tools/render_agent_episode.py" --root "$SITE" --transcript "$TRANSCRIPT" --slug "$SLUG" --title "System Diary: $DATE" --summary "The technical ensemble confronts the latest public evidence, its own flaws, and one next practice of transformation." --date "$DATE"T14:30:00Z --normalizer "$SITE/tools/two_pass_loudnorm.py"
python3 "$SITE/tools/podcast_qc.py" --root "$SITE" > "$RUNS/$DATE.qc.log"
python3 "$SITE/tools/podcast_loudness_report.py" --root "$SITE" > "$RUNS/$DATE.loudness.log"
printf '%s\n' idle > "$STATE/state.txt"
printf '%s\n' "$DATE" > "$STATE/last-finished-at.txt"
printf '%s\n' "Published daily synthetic system diary after feed, transcript, audio, and loudness checks." > "$STATE/last-summary.txt"
