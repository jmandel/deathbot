"""Assemble the evidence package folder, index.json, index.html and README.md.

Usage: python3 -I assemble.py <scripts_dir> <records_json> <download_dir> <rendered_dir> <report_dir> <out_dir>
"""
import datetime
import glob
import html
import json
import os
import re
import shutil
import sys

SCRIPTS, REC, DL, RENDERED, REPORT, OUT = sys.argv[1:7]
sys.path.insert(0, SCRIPTS)
from annotations import NOTES  # noqa: E402

DOC_URL = "https://claude.ai/artifact/FJWyHCGwCNivPKTQVNW9TK"
GROUPS = {"T07": "PROVEN", "T08": "PROVEN", "T09": "PROVEN", "T10": "Serious Illness Care Program", "T11": "Serious Illness Care Program",
          "T12": "Overbeek Respecting Choices (Netherlands)", "T13": "Overbeek Respecting Choices (Netherlands)",
          "T17": "Penn ML nudge trial", "T18": "Penn ML nudge trial", "T19": "Penn ML nudge trial"}

if os.path.exists(OUT):
    shutil.rmtree(OUT)
for sub in ("papers", "fulltext", "registry", "report", "scripts"):
    os.makedirs(os.path.join(OUT, sub))

records = json.load(open(REC))
studies = []
for r in records:
    files = []
    avail = "links_only"
    reason = None
    if r.get("pdf"):
        src = os.path.join(DL, r["pdf"]["file"])
        dst = os.path.join("papers", os.path.basename(src))
        shutil.copy2(src, os.path.join(OUT, dst))
        files.append({"path": dst, "type": "pdf", "description": "Article PDF (publisher or institutional-repository copy)",
                      "source": r["pdf"]["source"], "source_url": r["pdf"]["url"]})
        avail = "pdf"
    else:
        rend = glob.glob(os.path.join(RENDERED, f"{r['id']}_*.pdf"))
        if rend:
            base = os.path.basename(rend[0])[:-4] + "__rendered_from_PMC.pdf"
            dst = os.path.join("papers", base)
            shutil.copy2(rend[0], os.path.join(OUT, dst))
            files.append({"path": dst, "type": "pdf", "description": "Readable PDF rendered from the PMC full-text XML (not the publisher's typeset layout)",
                          "source": "PMC Article Datasets (NIH open data)", "source_url": f"https://pmc-oa-opendata.s3.amazonaws.com/?prefix={r['pmcid']}."})
            avail = "rendered_pmc"
    pf = r.get("pmc_fulltext")
    if pf:
        srcdir = os.path.join(DL, pf["dir"])
        dstdir = os.path.join("fulltext", r["id"])
        shutil.copytree(srcdir, os.path.join(OUT, dstdir))
        for fn in sorted(os.listdir(srcdir)):
            kind = ("full-text XML (JATS)" if fn.endswith(".xml") else "full text (plain text)" if fn.endswith(".txt")
                    else "PMC metadata" if fn.endswith(".json") else "supplement (PDF)" if fn.endswith(".pdf")
                    else "figure" if re.search(r"\.(jpe?g|png|gif)$", fn, re.I) else "other")
            files.append({"path": f"{dstdir}/{fn}", "type": kind, "source": "PMC Article Datasets (NIH open data)",
                          "license": pf.get("license_note")})
    for rf in r.get("registry_files") or []:
        src = os.path.join(DL, rf["file"])
        dst = os.path.join("registry", os.path.basename(src))
        if not os.path.exists(os.path.join(OUT, dst)):
            shutil.copy2(src, os.path.join(OUT, dst))
        files.append({"path": dst, "type": "trial registry " + ("record (JSON)" if dst.endswith(".json") else "document (PDF)"),
                      "description": rf.get("kind"), "source": "ClinicalTrials.gov", "source_url": rf.get("url")})
    if avail == "links_only":
        if r.get("pmcid"):
            reason = "Free to read on PMC, but not in the PMC open-data set and PMC blocks automated downloads; open the PMC link in a browser."
        else:
            reason = "No open-access copy found (checked OpenAlex open-access locations and PMC open data); publisher access required."
    lic = None
    if pf:
        lic = pf.get("license_note")
    elif r.get("pdf"):
        m = re.search(r"\(([^)]*)\)$", r["pdf"]["source"])
        lic = m.group(1) if m else r["pdf"]["source"]
    entry = {
        "id": r["id"],
        "kind": r["kind"],
        "trial_group": GROUPS.get(r["id"]),
        "short_name": r["short_name"],
        "title": r["title"],
        "authors": r["authors"],
        "journal": r["journal"],
        "year": r["year"],
        "citation": r["citation"],
        "doi": r["doi"],
        "pmid": r["pmid"],
        "pmcid": r["pmcid"],
        "registry_ids": r["registry_ids"],
        "links": r["links"],
        **NOTES.get(r["id"], {}),
        "availability": avail,
        "availability_note": reason,
        "license_or_access": lic,
        "files": files,
    }
    studies.append(entry)

# Report files
for fn in os.listdir(REPORT):
    if fn.endswith((".pdf", ".md")):
        shutil.copy2(os.path.join(REPORT, fn), os.path.join(OUT, "report", fn))
for fn in ("studies.py", "annotations.py", "fetch_meta.py", "download2.py", "build_refs.py", "render_pmc.py", "assemble.py"):
    shutil.copy2(os.path.join(SCRIPTS, fn), os.path.join(OUT, "scripts", fn))

counts = {
    "studies": len(studies),
    "trials": sum(1 for s in studies if s["kind"] == "trial"),
    "reviews_and_commentary": sum(1 for s in studies if s["kind"] != "trial"),
    "with_publisher_or_repository_pdf": sum(1 for s in studies if s["availability"] == "pdf"),
    "with_pdf_rendered_from_pmc": sum(1 for s in studies if s["availability"] == "rendered_pmc"),
    "links_only": sum(1 for s in studies if s["availability"] == "links_only"),
    "registry_files": len(os.listdir(os.path.join(OUT, "registry"))),
}
index = {
    "package": {
        "title": "Advance Care Planning: Randomized Trial Evidence on Preference-Sensitive End-of-Life Care and Costs",
        "created": datetime.date.today().isoformat(),
        "report_doc_url": DOC_URL,
        "report_files": sorted(f"report/{f}" for f in os.listdir(os.path.join(OUT, "report"))),
        "description": "Source package for the report: citation metadata, links, short evidence notes and available source files for each study.",
        "folders": {
            "papers/": "One PDF per study where available. Files ending __rendered_from_PMC.pdf were generated from PMC full-text XML.",
            "fulltext/<ID>/": "PMC open-data full text (JATS XML, plain text, figures, supplements, PMC metadata).",
            "registry/": "ClinicalTrials.gov records (JSON) and posted protocols, statistical analysis plans and consent forms.",
            "report/": "The report exported from the doc (PDF and Markdown).",
            "scripts/": "Scripts used to look up citations, collect files and build this package.",
        },
        "field_guide": {
            "availability": "pdf = publisher or repository PDF; rendered_pmc = PDF rendered from PMC full text; links_only = no free copy could be downloaded",
            "effect_on_care": "Trials only: effect on preference-sensitive care received (Improved = less burdensome or more preference-concordant care on at least one outcome)",
            "trial_group": "Papers reporting the same trial",
        },
        "licensing": "Files keep their original licenses (see license_or_access). CC BY / CC BY-NC items are open access. Items marked 'NIH author manuscript' are free-to-read PMC copies provided for text mining and personal use; do not redistribute them.",
        "counts": counts,
    },
    "studies": studies,
}
json.dump(index, open(os.path.join(OUT, "index.json"), "w"), indent=2, ensure_ascii=False)

# ---------- index.html ----------
EFFECT_COLORS = {"Improved": "#e5f4e4", "No clear change": "#f0efec", "Worsened": "#fbebeb"}


def a(url, text):
    return f'<a href="{html.escape(url)}">{html.escape(text)}</a>' if url else ""


rows = []
for s in studies:
    local = []
    for f in s["files"]:
        if f["path"].startswith("papers/"):
            local.append(a(f["path"], "PDF" + (" (rendered)" if "rendered" in f["path"] else "")))
    if any(f["path"].startswith("fulltext/") for f in s["files"]):
        x = next(f["path"] for f in s["files"] if f["path"].endswith(".xml"))
        local.append(a(x, "XML"))
        t = next((f["path"] for f in s["files"] if f["path"].endswith(".txt")), None)
        if t:
            local.append(a(t, "text"))
    regdocs = [f for f in s["files"] if f["path"].startswith("registry/")]
    for f in regdocs:
        lab = os.path.basename(f["path"]).replace(".json", "").replace(".pdf", "")
        local.append(a(f["path"], lab))
    online = [a(s["links"].get("doi"), "DOI"), a(s["links"].get("pubmed"), "PubMed"), a(s["links"].get("pmc"), "PMC")]
    online += [a(u, i) for i, u in zip(s["registry_ids"], s["links"].get("registry") or [])]
    eff = s.get("effect_on_care")
    effcell = f'<span class="eff" style="background:{EFFECT_COLORS.get(eff, "#fff")}">{html.escape(eff)}</span>' if eff else ""
    detail = s.get("care_outcomes") or s.get("finding") or ""
    setting = " · ".join(x for x in [s.get("setting"), s.get("n")] if x)
    grp = f'<div class="grp">{html.escape(s["trial_group"])}</div>' if s.get("trial_group") else ""
    note = f'<div class="note">{html.escape(s["availability_note"])}</div>' if s.get("availability_note") else ""
    rows.append(
        f'<tr data-kind="{s["kind"]}"><td class="id">{s["id"]}</td>'
        f'<td><div class="t">{a(s["links"].get("doi") or s["links"].get("pubmed"), s["title"])}</div>'
        f'<div class="c">{html.escape(s["citation"])}</div>{grp}'
        f'<div class="s">{html.escape(setting)}</div></td>'
        f'<td>{effcell}<div class="d">{html.escape(detail)}</div></td>'
        f'<td class="files">{" · ".join(x for x in local if x) or "<span class=none>none</span>"}{note}</td>'
        f'<td class="files">{" · ".join(x for x in online if x)}</td></tr>')

page = f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ACP RCT evidence package: index</title>
<style>
body{{font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;margin:24px;color:#1d1d1f;max-width:1400px}}
h1{{font-size:22px;margin:0 0 4px}} .sub{{color:#555;font-size:13px;margin-bottom:14px}}
.stats span{{display:inline-block;background:#f3f3f1;border-radius:6px;padding:4px 9px;margin:0 6px 6px 0;font-size:12.5px}}
.filters button{{border:1px solid #ccc;background:#fff;border-radius:6px;padding:4px 10px;margin-right:6px;cursor:pointer;font-size:13px}}
.filters button.on{{background:#1d1d1f;color:#fff;border-color:#1d1d1f}}
table{{border-collapse:collapse;width:100%;margin-top:12px;font-size:13px}}
th{{text-align:left;background:#f6f6f4;border-bottom:2px solid #ddd;padding:7px;position:sticky;top:0}}
td{{border-bottom:1px solid #e6e6e6;padding:8px 7px;vertical-align:top}}
td.id{{font-family:ui-monospace,Menlo,monospace;color:#666;white-space:nowrap}}
.t a{{color:#0b4f9c;text-decoration:none;font-weight:600}} .c{{color:#555;font-size:12px;margin-top:2px}}
.s{{color:#333;font-size:12px;margin-top:3px}} .grp{{font-size:11.5px;color:#7a4b00;margin-top:2px}}
.eff{{display:inline-block;border-radius:4px;padding:1px 7px;font-size:12px;margin-bottom:4px}}
.d{{font-size:12.5px;line-height:1.35}} .files a{{color:#0b4f9c;text-decoration:none;white-space:nowrap}}
.note{{font-size:11.5px;color:#8a5a00;margin-top:4px}} .none{{color:#999}}
footer{{margin-top:18px;font-size:12px;color:#666}}
</style></head><body>
<h1>{html.escape(index["package"]["title"])}</h1>
<div class="sub">Source package index · built {index["package"]["created"]} · Report: <a href="report/ACP_RCT_evidence_report.pdf">PDF</a> · <a href="report/ACP_RCT_evidence_report.md">Markdown</a> · <a href="{DOC_URL}">live doc</a> · Machine-readable: <a href="index.json">index.json</a></div>
<div class="stats"><span>{counts["trials"]} trial papers</span><span>{counts["reviews_and_commentary"]} reviews and commentary</span><span>{counts["with_publisher_or_repository_pdf"]} publisher/repository PDFs</span><span>{counts["with_pdf_rendered_from_pmc"]} PDFs rendered from PMC full text</span><span>{counts["links_only"]} links only</span><span>{counts["registry_files"]} registry files</span></div>
<div class="filters"><button class="on" data-f="all">All</button><button data-f="trial">Trials</button><button data-f="review">Reviews</button><button data-f="commentary">Commentary</button></div>
<table><thead><tr><th>ID</th><th>Study</th><th>Effect on care received / key finding</th><th>Files in this package</th><th>Online</th></tr></thead>
<tbody>{"".join(rows)}</tbody></table>
<footer>{html.escape(index["package"]["licensing"])}</footer>
<script>
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{{
 document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
 const f=b.dataset.f;document.querySelectorAll('tbody tr').forEach(tr=>{{tr.style.display=(f==='all'||tr.dataset.kind===f)?'':'none';}});
}});
</script></body></html>"""
open(os.path.join(OUT, "index.html"), "w").write(page)

# ---------- README ----------
missing = [s for s in studies if s["availability"] == "links_only"]
readme = f"""# ACP randomized-trial evidence package

Companion files for the report **{index["package"]["title"]}** ({DOC_URL}).

Open **index.html** in a browser for a clickable index, or read **index.json** for the same data in machine-readable form.

## What's inside

| Folder | Contents |
| --- | --- |
| report/ | The report as PDF and Markdown (exported from the doc) |
| papers/ | One PDF per study where a free copy existed ({counts["with_publisher_or_repository_pdf"]} publisher or repository PDFs, {counts["with_pdf_rendered_from_pmc"]} rendered from PMC full text) |
| fulltext/<ID>/ | PMC open-data full text: JATS XML, plain text, figures, supplements, metadata |
| registry/ | ClinicalTrials.gov records and posted protocols, analysis plans and consent forms |
| scripts/ | Scripts used to verify citations and collect these files |

Files named `*__rendered_from_PMC.pdf` were generated from the article's PMC full-text XML. They contain the full article text, tables and figures, but not the journal's typeset layout; cite the published version.

## Studies without a downloadable copy ({len(missing)})

"""
for s in missing:
    readme += f"- **{s['id']}** {s['short_name']}: {s['links'].get('doi') or s['links'].get('pubmed')}. {s['availability_note']}\n"
readme += f"""
## Licensing

{index["package"]["licensing"]}
"""
open(os.path.join(OUT, "README.md"), "w").write(readme)
print(json.dumps(counts, indent=1))
