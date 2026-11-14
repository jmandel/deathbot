"""Render PMC open-data JATS XML into a readable PDF (pandoc -> HTML -> wkhtmltopdf).

Usage: python3 -I render_pmc.py <records_json> <download_dir> <out_dir> [ID ...]
Writes <out_dir>/<ID>_<name>.pdf and records the result in <out_dir>/render_report.json.
"""
import html
import json
import os
import re
import subprocess
import sys
import tempfile

REC, DL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
only = set(sys.argv[4:])
os.makedirs(OUT, exist_ok=True)
records = json.load(open(REC))

CSS = """
body{font-family:Georgia,'DejaVu Serif',serif;font-size:11pt;line-height:1.45;margin:0 8mm;color:#111}
h1{font-size:17pt;line-height:1.25} h2{font-size:13.5pt;margin-top:1.4em} h3{font-size:12pt}
table{border-collapse:collapse;font-size:8.5pt;margin:0.8em 0;width:100%} td,th{border:1px solid #bbb;padding:2px 4px;vertical-align:top}
img{max-width:100%;page-break-inside:avoid} figure{margin:1em 0;page-break-inside:avoid} figcaption{font-size:9pt;color:#333}
.banner{border:1px solid #888;background:#f3f3f3;padding:6px 10px;font-family:Arial,sans-serif;font-size:8.5pt;margin-bottom:12px}
a{color:#1a4f8b;text-decoration:none}
p.author{display:inline;margin:0;font-size:9.5pt} p.author:after{content:", "}
header p.date, .subtitle{font-size:10pt}
.abstract{background:#fafafa;border-left:3px solid #999;padding:4px 10px;margin:10px 0}
"""


def slug(s, n=60):
    return re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")[:n]


report = []
for r in records:
    if only and r["id"] not in only:
        continue
    pf = r.get("pmc_fulltext")
    if not pf:
        continue
    d = os.path.join(DL, pf["dir"])
    xml = [f for f in pf["files"] if f.endswith(".xml")]
    if not xml:
        continue
    xml_path = os.path.join(d, xml[0])
    try:
        body = subprocess.run(["pandoc", "-f", "jats", "-t", "html5", "-s", "--metadata", "pagetitle=x", xml_path], capture_output=True, text=True, timeout=120, check=True).stdout
    except Exception as e:  # noqa: BLE001
        report.append({"id": r["id"], "ok": False, "error": f"pandoc: {e}"})
        continue
    mb = re.search(r"<body[^>]*>(.*)</body>", body, re.S)
    body = mb.group(1) if mb else body
    body = re.sub(r"<p>pmc</p>", "", body)
    media = [f for f in pf["files"] if re.search(r"\.(jpe?g|png|gif)$", f, re.I)]

    def fix_src(m):
        src = m.group(1)
        base = os.path.basename(src)
        stem = re.sub(r"\.(jpe?g|png|gif|tiff?)$", "", base, flags=re.I)
        cands = [f for f in media if f.startswith(stem)]
        if cands:
            return f'src="file://{os.path.abspath(os.path.join(d, cands[0]))}"'
        return 'src=""'

    body = re.sub(r'src="([^"]*)"', fix_src, body)
    lic = pf.get("license_note") or pf.get("license_code") or "see PMC"
    banner = (
        f"<div class='banner'><b>Rendered copy, not the publisher's typeset PDF.</b> Generated from the PMC Article Datasets "
        f"full-text XML ({html.escape(r.get('pmcid') or '')}). License/status: {html.escape(lic)}.<br>"
        f"Citation: {html.escape(', '.join((r.get('authors') or '').split(', ')[:3]) + (' et al' if len((r.get('authors') or '').split(', '))>3 else ''))}. {html.escape(r['title'])}. {html.escape(r['citation'])}. "
        f"doi:{html.escape(r.get('doi') or 'n/a')}<br>Official version: {html.escape((r['links'].get('doi') or r['links'].get('pmc') or ''))}</div>"
    )
    doc = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>{html.escape(r['title'])}</title><style>{CSS}</style></head><body>{banner}{body}</body></html>"
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tf:
        tf.write(doc)
        tmp = tf.name
    out_pdf = os.path.join(OUT, f"{r['id']}_{slug(r['short_name'])}.pdf")
    res = subprocess.run(["wkhtmltopdf", "--quiet", "--enable-local-file-access", "--encoding", "utf-8",
                          "-s", "Letter", "--margin-top", "14mm", "--margin-bottom", "14mm",
                          "--footer-center", "[page] / [topage]", "--footer-font-size", "7", tmp, out_pdf],
                         capture_output=True, text=True, timeout=300)
    os.unlink(tmp)
    ok = os.path.exists(out_pdf) and os.path.getsize(out_pdf) > 10000
    report.append({"id": r["id"], "ok": ok, "file": os.path.basename(out_pdf) if ok else None,
                   "stderr": res.stderr[-300:] if not ok else ""})
    print(r["id"], "ok" if ok else "FAILED", os.path.getsize(out_pdf) if ok else res.stderr[-200:])

json.dump(report, open(os.path.join(OUT, "render_report.json"), "w"), indent=2)
