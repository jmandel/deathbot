#!/usr/bin/env python3
"""Finds the stretches where the app was waiting on a reply (Stop showing instead of Send) in a recording.

Usage: detect_busy.py WORKDIR   (reads session-fixed.mkv at full 1080x2400 resolution, writes busy.json)

It samples a small patch of the Send/Stop button 4 times a second. The patch averages to about
(139, 97, 21) when Send shows and (138, 134, 143) when Stop shows, with the keyboard hidden.
"""
import json, os, subprocess, sys
import numpy as np

W = sys.argv[1]
raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", os.path.join(W, "session-fixed.mkv"),
                      "-vf", "fps=4,crop=40:24:873:2237", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                     capture_output=True, check=True).stdout
m = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 24, 40, 3).astype(int).mean(axis=(1, 2))
busy = np.linalg.norm(m - np.array([138, 134, 143]), axis=1) < 10
runs, i = [], 0
while i < len(busy):
    if busy[i]:
        j = i
        while j < len(busy) and busy[j]: j += 1
        if (j - i) / 4 >= 1.5: runs.append((i / 4, j / 4))
        i = j
    else:
        i += 1
json.dump(runs, open(os.path.join(W, "busy.json"), "w"))
print(f"{len(runs)} waits, {sum(b - a for a, b in runs):.0f} s in total")
