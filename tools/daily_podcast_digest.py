#!/usr/bin/env python3
"""Build a bounded digest from already-public dashboard JSON. Never reads raw logs."""
import argparse, json
from pathlib import Path

BLOCKED=("secret","token","password","private","credential","prompt","raw_log","journal","internal_path")
def scrub(value,depth=0):
    if depth>5: return "[bounded]"
    if isinstance(value,dict):
        return {str(k):scrub(v,depth+1) for k,v in list(value.items())[:80] if not any(word in str(k).lower() for word in BLOCKED)}
    if isinstance(value,list): return [scrub(v,depth+1) for v in value[:25]]
    if isinstance(value,str): return value[:500]
    return value
p=argparse.ArgumentParser(); p.add_argument("--data",required=True); p.add_argument("--output",required=True); a=p.parse_args()
root=Path(a.data); payload={}
for name in ("status.json","tournament.json","agents.json","backdata.json","runs.json","research.json"):
    path=root/name
    if path.is_file() and path.stat().st_size<=2_000_000:
        try: payload[name]=scrub(json.loads(path.read_text(encoding="utf-8")))
        except (OSError,json.JSONDecodeError): pass
Path(a.output).write_text(json.dumps(payload,indent=2,allow_nan=False)+"\n",encoding="utf-8")
