#!/usr/bin/env python3
"""Cuts the raw demo recording down to the visible segments and speeds up long waits for replies.

Usage: edit.py WORKDIR [--offset SECONDS] [--drop N,N] [--out FILE]

WORKDIR holds session-cfr.mkv (the scrcpy recording converted to 30 fps), marks.log (written by drive.ts / act.sh)
and busy.json (stretches where the app showed Stop instead of Send, detected from the video).
--offset is how far the video clock runs ahead of marks.log (found by lining up the spoken turns).
--drop removes visible segments by index, after drop-previous marks are applied.
"""
import argparse, json, os, subprocess

ap = argparse.ArgumentParser()
ap.add_argument("workdir")
ap.add_argument("--offset", type=float, default=19.9)
ap.add_argument("--drop", default="")
ap.add_argument("--speed", type=float, default=4.0)
ap.add_argument("--out", default="demo.mp4")
ap.add_argument("--source", default="session-cfr.mkv", help="constant-frame-rate copy of the recording (scrcpy writes frames only on change)")
a = ap.parse_args()
W = a.workdir

marks = [l.split() for l in open(os.path.join(W, "marks.log"))]
rec = int(marks[0][0])
segs, start = [], None
for t, what in marks[1:]:
    t = (int(t) - rec) / 1000 + a.offset
    if what == "cut-end":
        start = t
    elif what == "cut-start" and start is not None:
        segs.append((start, t)); start = None
    elif what == "drop-previous" and segs:
        segs.pop()
drop = {int(x) for x in a.drop.split(",") if x}
segs = [s for i, s in enumerate(segs) if i not in drop and s[1] - s[0] > 0.3]
busy = json.load(open(os.path.join(W, "busy.json")))

# Pieces: (start, end, speed). Inside a wait, keep the first 1.5 s and the last 1 s at normal speed.
pieces = []
for s0, s1 in segs:
    cuts = []
    for b0, b1 in busy:
        f0, f1 = max(s0, b0 + 1.5), min(s1, b1 - 1.0)
        if f1 - f0 > 2.0:
            cuts.append((f0, f1))
    t = s0
    for f0, f1 in cuts:
        pieces.append((t, f0, 1.0)); pieces.append((f0, f1, a.speed)); t = f1
    pieces.append((t, s1, 1.0))
pieces = [p for p in pieces if p[1] - p[0] > 0.05]

parts, labels = [], []
for i, (p0, p1, sp) in enumerate(pieces):
    v = f"[0:v]trim={p0:.3f}:{p1:.3f},setpts=(PTS-STARTPTS)/{sp}[v{i}]"
    tempo = "anull" if sp == 1 else "atempo=2.0,atempo=2.0" if sp == 4 else f"atempo={sp}"
    au = f"[0:a]atrim={p0:.3f}:{p1:.3f},asetpts=PTS-STARTPTS,{tempo}[a{i}]"
    parts += [v, au]; labels.append(f"[v{i}][a{i}]")
graph = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(pieces)}:v=1:a=1[v][a0];[a0]volume=26dB,alimiter=limit=0.9[a]"
gfile = os.path.join(W, "edit.filter")
open(gfile, "w").write(graph)
out = os.path.join(W, a.out)
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", os.path.join(W, a.source),
                "-/filter_complex", gfile, "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-crf", "22", "-preset", "medium", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out], check=True)
total = sum((p1 - p0) / sp for p0, p1, sp in pieces)
print(f"{len(segs)} segments, {len(pieces)} pieces, about {total/60:.1f} min -> {out}")
for i, (s0, s1) in enumerate(segs):
    print(i, round(s0, 1), round(s1, 1))
