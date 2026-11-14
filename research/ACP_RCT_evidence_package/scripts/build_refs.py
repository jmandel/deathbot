"""Build normalized study records (used for references, index.json and index.html).

Usage: python3 -I build_refs.py <meta_json> <downloads_json> <out_records_json> <out_refs_md>
"""
import json
import sys

meta = {m["id"]: m for m in json.load(open(sys.argv[1]))}
dl = {d["id"]: d for d in json.load(open(sys.argv[2]))}

LICENSE_NOTE = {
    "CC BY": "Open access, CC BY",
    "CC BY-NC": "Open access, CC BY-NC",
    "TDM": "NIH author manuscript in PMC (free to read; text-mining license, personal use)",
}


def authors_short(a):
    if not a:
        return ""
    parts = [p.strip() for p in a.rstrip(".").split(",")]
    return ", ".join(parts[:3]) + (", et al." if len(parts) > 3 else ".")


records = []
for id_, m in meta.items():
    d = dl.get(id_, {})
    doi = m.get("doi_found") or m.get("doi")
    pmid = m.get("pmid_found")
    pmcid = m.get("pmcid_found")
    pmc = d.get("pmc_dataset") or {}
    vol = m.get("volume") or ""
    iss = f"({m['issue']})" if m.get("issue") else ""
    pages = f":{m['pages']}" if m.get("pages") else ""
    cite = f"{m.get('journal_abbrev') or m.get('journal')}. {m.get('year')};{vol}{iss}{pages}"
    rec = {
        "id": id_,
        "short_name": m["short"],
        "kind": m["kind"],
        "title": (m.get("title") or "").rstrip("."),
        "authors": m.get("authors"),
        "journal": m.get("journal"),
        "year": m.get("year"),
        "citation": cite,
        "doi": doi,
        "pmid": pmid,
        "pmcid": pmcid,
        "registry_ids": m.get("registry") or [],
        "links": {
            "doi": f"https://doi.org/{doi}" if doi else None,
            "pubmed": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None,
            "pmc": f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/" if pmcid else None,
            "europepmc": f"https://europepmc.org/article/MED/{pmid}" if pmid else None,
            "registry": [f"https://clinicaltrials.gov/study/{r}" if r.startswith("NCT") else
                         (f"https://www.isrctn.com/{r}" if r.startswith("ISRCTN") else
                          (f"https://www.anzctr.org.au/ACTRN{r[5:]}.aspx" if r.startswith("ACTRN") else None))
                         for r in (m.get("registry") or [])],
        },
        "open_access_flag_europepmc": m.get("is_open_access"),
        "pdf": None,
        "pmc_fulltext": None,
        "registry_files": d.get("registry_files") or [],
    }
    rec["links"]["registry"] = [x for x in rec["links"]["registry"] if x]
    if d.get("pdf_file"):
        rec["pdf"] = {"file": d["pdf_file"], "source": d["pdf_source"]["label"], "url": d["pdf_source"]["url"]}
    if pmc:
        rec["pmc_fulltext"] = {"dir": pmc["dir"], "files": pmc["files"], "license_code": pmc.get("license_code"),
                               "is_author_manuscript": pmc.get("is_manuscript"),
                               "license_note": LICENSE_NOTE.get(pmc.get("license_code"), pmc.get("license_code"))}
    if rec["pdf"]:
        access = "PDF (publisher or repository copy)"
    elif rec["pmc_fulltext"]:
        access = "PDF rendered from PMC full text, plus XML"
    else:
        access = "Links only (no free copy found)"
    rec["package_access"] = access
    records.append(rec)

json.dump(records, open(sys.argv[3], "w"), indent=2)

lines = []
for r in records:
    links = []
    if r["links"]["doi"]:
        links.append(f"[doi:{r['doi']}]({r['links']['doi']})")
    if r["pmid"]:
        links.append(f"[PMID {r['pmid']}]({r['links']['pubmed']})")
    if r["pmcid"]:
        links.append(f"[{r['pmcid']}]({r['links']['pmc']})")
    reg = "; ".join(f"[{i}]({u})" for i, u in zip(r["registry_ids"], r["links"]["registry"])) if r["links"]["registry"] else ""
    tail = " · ".join(links + ([f"Registry: {reg}"] if reg else []))
    lines.append(f"{len(lines) + 1}. **[{r['id']}]** {authors_short(r['authors'])} {r['title']}{'' if r['title'].endswith('?') else '.'} *{r['citation']}*. {tail}. In package: {r['package_access']}.")
open(sys.argv[4], "w").write("\n".join(lines))
print("\n".join(lines))
