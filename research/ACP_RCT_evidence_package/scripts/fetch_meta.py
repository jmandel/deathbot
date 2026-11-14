"""Look up each study in Europe PMC (core result type) and save normalized metadata.

Usage: python3 -I fetch_meta.py <scripts_dir> <out_json>
"""
import json
import sys
import time

import requests

sys.path.insert(0, sys.argv[1])
from studies import STUDIES  # noqa: E402

OUT = sys.argv[2]
API = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
S = requests.Session()
S.headers["User-Agent"] = "acp-evidence-package/1.0 (research compilation)"


def query_for(st):
    if st.get("doi"):
        return f'DOI:"{st["doi"]}"'
    if st.get("pmid"):
        return f"EXT_ID:{st['pmid']} AND SRC:MED"
    if st.get("pmcid"):
        return f"PMCID:{st['pmcid']}"
    return st["q"]


def lookup(st):
    params = {"query": query_for(st), "resultType": "core", "format": "json", "pageSize": 5}
    r = S.get(API, params=params, timeout=30)
    r.raise_for_status()
    res = r.json().get("resultList", {}).get("result", [])
    # Prefer MED source records
    res.sort(key=lambda x: 0 if x.get("source") == "MED" else 1)
    return res


out = []
ABSTRACTS = {}
for st in STUDIES:
    try:
        res = lookup(st)
    except Exception as e:  # noqa: BLE001
        out.append({**st, "error": str(e)})
        continue
    if not res:
        out.append({**st, "error": "no match"})
        continue
    m = res[0]
    ji = m.get("journalInfo", {}) or {}
    jr = ji.get("journal", {}) or {}
    ftu = [
        {"url": u.get("url"), "style": u.get("documentStyle"), "availability": u.get("availability"), "site": u.get("site")}
        for u in (m.get("fullTextUrlList", {}) or {}).get("fullTextUrl", [])
    ]
    out.append({
        **st,
        "n_matches": len(res),
        "title": m.get("title"),
        "authors": m.get("authorString"),
        "journal": jr.get("title"),
        "journal_abbrev": jr.get("isoabbreviation") or jr.get("medlineAbbreviation"),
        "year": m.get("pubYear"),
        "volume": ji.get("volume"),
        "issue": ji.get("issue"),
        "pages": m.get("pageInfo"),
        "pub_date": m.get("firstPublicationDate"),
        "doi_found": m.get("doi"),
        "pmid_found": m.get("pmid"),
        "pmcid_found": m.get("pmcid"),
        "is_open_access": m.get("isOpenAccess"),
        "in_epmc": m.get("inEPMC"),
        "in_pmc": m.get("inPMC"),
        "has_pdf": m.get("hasPDF"),
        "license": m.get("license"),
        "full_text_urls": ftu,
        "pub_types": (m.get("pubTypeList", {}) or {}).get("pubType"),
    })
    ABSTRACTS[st["id"]] = m.get("abstractText")
    time.sleep(0.2)

with open(OUT, "w") as f:
    json.dump(out, f, indent=2)
with open(OUT.replace(".json", "_abstracts.json"), "w") as f:
    json.dump(ABSTRACTS, f, indent=1)

for o in out:
    if "error" in o:
        print(o["id"], "ERROR", o["error"])
    else:
        print(o["id"], o["year"], (o["journal_abbrev"] or ""), o["volume"], o["pages"], "| doi", o["doi_found"], "| pmid", o["pmid_found"], "| pmc", o["pmcid_found"], "| OA", o["is_open_access"], o["license"], "| n", o["n_matches"])
        print("    ", (o["title"] or "")[:110])
