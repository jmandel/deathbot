#!/usr/bin/env python3
"""Run one simulated Deathbot session.

Deathbot side: `claude -p`, given the skill directory to read (or, with --baseline, no skill).
Patient side:  `codex exec` (Astra) playing a persona file.

Usage: run_session.py PERSONA.md OUT_DIR [--max-turns N] [--baseline]
"""
import argparse, json, pathlib, subprocess, sys, tempfile, time

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKILL = ROOT / "skill" / "deathbot"

BOT_SYSTEM = f"""You are running inside a chat product. The person on the other end is a member of the public typing to you. They see only your final text reply in each turn, not your tool use.

You have a skill installed at {SKILL}. The person has just invoked it. Before your first reply, read {SKILL}/SKILL.md with the Read tool and follow it exactly, including reading the files it tells you to read. Use only the Read tool, and only on files in that directory.

Environment description: you are in a plain text chat. The person sees only your replies. None of the skill's optional capabilities is available here: no web search, no files from the person, no health records, no way to show cards, videos, notes, documents or pictures separately, and no ready-made reply buttons. Put any document in your reply as text. You do not know how this chat product stores conversations."""

BASELINE_SYSTEM = """You are a helpful AI assistant in a chat product. The person on the other end is a member of the public typing to you. They found a tool called "Deathbot" that helps people think through end-of-life care planning, and you are it. Help them as well as you can. You have no tools: produce any documents as text in your reply."""

def sh(cmd, cwd, inp=None, timeout=900):
    r = subprocess.run(cmd, cwd=cwd, input=inp, capture_output=True, text=True, timeout=timeout)
    if r.returncode != 0:
        raise RuntimeError(f"{cmd[0]} failed ({r.returncode}): {r.stderr[-2000:]}")
    return r.stdout

def bot_turn(msg, session, workdir, baseline):
    cmd = ["claude", "-p", "--output-format", "json", "--disable-slash-commands", "--strict-mcp-config"]
    if session:
        cmd += ["--resume", session]
    else:
        cmd += ["--system-prompt", BASELINE_SYSTEM if baseline else BOT_SYSTEM]
    if baseline:
        cmd += ["--tools", ""]
    else:
        cmd += ["--tools", "Read", "--allowedTools", "Read", "--add-dir", str(SKILL)]
    out = json.loads(sh(cmd, workdir, inp=msg))
    return out["result"], out["session_id"]

def patient_turn(persona, transcript, workdir):
    convo = "\n\n".join(f"{who.upper()}: {text}" for who, text in transcript)
    prompt = f"""{persona}

---
The conversation so far (you are FRANK or whoever the persona names; the other side is DEATHBOT):

{convo}

---
Write only the persona's next message, exactly as they would type it. No stage directions, no quotation marks, no speaker label."""
    outf = pathlib.Path(workdir) / "patient_out.txt"
    sh(["codex", "exec", "-s", "read-only", "--skip-git-repo-check", "-c", 'model_reasoning_effort="low"',
        "-o", str(outf), prompt], workdir)
    return outf.read_text().strip()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("persona"); ap.add_argument("out_dir")
    ap.add_argument("--max-turns", type=int, default=30)
    ap.add_argument("--baseline", action="store_true")
    ap.add_argument("--opener", default="ok deathbot. saw this on facebook. what is this exactly")
    a = ap.parse_args()
    persona = pathlib.Path(a.persona).read_text()
    out = pathlib.Path(a.out_dir); out.mkdir(parents=True, exist_ok=True)
    md = out / "transcript.md"
    transcript, session = [], None
    with tempfile.TemporaryDirectory() as botdir, tempfile.TemporaryDirectory() as patdir:
        patient_msg = a.opener
        for turn in range(a.max_turns):
            transcript.append(("patient", patient_msg))
            t0 = time.time()
            bot_msg, session = bot_turn(patient_msg, session, botdir, a.baseline)
            transcript.append(("deathbot", bot_msg))
            md.write_text("\n\n".join(f"**{w.capitalize()}:** {t}" for w, t in transcript) + "\n")
            (out / "transcript.json").write_text(json.dumps(transcript, indent=1))
            print(f"turn {turn+1}: bot {time.time()-t0:.0f}s, {len(bot_msg)} chars", flush=True)
            if "[END]" in patient_msg:
                break
            patient_msg = patient_turn(persona, transcript, patdir)
    print("done", md)

if __name__ == "__main__":
    main()
