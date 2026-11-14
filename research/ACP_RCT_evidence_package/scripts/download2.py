"""Collect source material per study.

1. Publisher/repository PDFs found via OpenAlex open-access locations (plus PLOS printable PDFs).
2. PMC Article Datasets (official NIH open-data bucket): full-text XML/TXT, figures, supplements, metadata JSON.
3. ClinicalTrials.gov records and posted protocol/SAP documents.

Usage: python3 -I download2.py <meta_json> <download_dir> <report_json>
"""
import json
import os
import re
import sys
import time
from urllib.parse import quote, urlparse

import requests

META, DL, REPORT = sys.argv[1], sys.argv[2], sys.argv[3]
for sub in ("papers", "pmc", "registry"):
    os.makedirs(os.path.join(DL, sub), exist_ok=True)

S = requests.Session()
S.headers["User-Agent"] = "acp-evidence-package/1.0 (research compilation; mailto not provided)"
BUCKET = "https://pmc-oa-opendata.s3.amazonaws.com/"
# Hosts that answered with bot challenges in testing; do not keep retrying them.
SKIP_HOSTS = {"europepmc.org", "www.ncbi.nlm.nih.gov", "pmc.ncbi.nlm.nih.gov", "www.bmj.com"}

meta = json.load(open(META))
OVERRIDES = {
    "T01": {"doi_found": "10.1001/jama.1995.03530200027032", "pmid_found": "7474243"},
    "T05": {"registry": ["NCT01565642"]},
    "T22": {"registry": ["NCT04819191"]},
    "T23": {"registry": ["NCT03609177"]},
}
EXTRA_PDFS = {
    "T13": [("Erasmus University repository (author version)", "https://repub.eur.nl/pub/115345/Repub_115345_O-A.pdf")],
}


def slug(s, n=60):
    return re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")[:n]


def get_pdf(url, dest):
    try:
        r = S.get(url, timeout=60, allow_redirects=True)
    except Exception as e:  # noqa: BLE001
        return False, f"error {type(e).__name__}"
    if r.status_code == 200 and r.content[:5].startswith(b"%PDF") and len(r.content) > 20000:
        with open(dest, "wb") as f:
            f.write(r.content)
        return True, f"ok {len(r.content)} bytes"
    return False, f"http {r.status_code} {r.headers.get('content-type', '?')[:30]} {len(r.content)}B"


def openalex_pdf_urls(doi):
    try:
        r = S.get(f"https://api.openalex.org/works/https://doi.org/{quote(doi)}",
                  params={"select": "id,open_access,locations"}, timeout=30)
        j = r.json()
    except Exception:  # noqa: BLE001
        return None, []
    urls = []
    for loc in j.get("locations") or []:
        if loc.get("is_oa") and loc.get("pdf_url"):
            src = (loc.get("source") or {}).get("display_name") or urlparse(loc["pdf_url"]).netloc
            urls.append((f"{src} ({loc.get('version') or 'version n/a'}, {loc.get('license') or 'license n/a'})", loc["pdf_url"]))
    return j.get("open_access"), urls


def bucket_files(pmcid):
    x = S.get(BUCKET, params={"list-type": "2", "prefix": pmcid + ".", "max-keys": "200"}, timeout=30).text
    keys = re.findall(r"<Key>([^<]+)</Key>", x)
    if not keys:
        return None, []
    vers = sorted({int(k.split("/")[0].split(".")[1]) for k in keys})
    v = vers[-1]
    return v, [k for k in keys if k.startswith(f"{pmcid}.{v}/")]


report = []
for m in meta:
    m.update(OVERRIDES.get(m["id"], {}))
    rec = {"id": m["id"], "attempts": [], "pdf_file": None, "pdf_source": None,
           "pmc_dataset": None, "registry_files": [], "openalex_oa": None}
    base = f"{m['id']}_{slug(m['short'])}"
    dest = os.path.join(DL, "papers", base + ".pdf")
    doi = m.get("doi_found") or ""

    # 1. Publisher / repository PDF
    cands = list(EXTRA_PDFS.get(m["id"], []))
    if doi.startswith("10.1371/"):
        cands.insert(0, ("PLOS (publisher, CC BY)", f"https://journals.plos.org/plosmedicine/article/file?id={doi}&type=printable"))
    if doi:
        oa, urls = openalex_pdf_urls(doi)
        rec["openalex_oa"] = oa
        cands += urls
    seen = set()
    for label, url in cands:
        if url in seen or urlparse(url).netloc in SKIP_HOSTS:
            continue
        seen.add(url)
        ok, msg = get_pdf(url, dest)
        rec["attempts"].append({"source": label, "url": url, "result": msg})
        if ok:
            rec["pdf_file"] = os.path.relpath(dest, DL)
            rec["pdf_source"] = {"label": label, "url": url}
            break
        time.sleep(0.3)

    # 2. PMC Article Datasets
    pmcid = m.get("pmcid_found")
    if pmcid:
        v, keys = bucket_files(pmcid)
        if keys:
            outdir = os.path.join(DL, "pmc", m["id"])
            os.makedirs(outdir, exist_ok=True)
            files = []
            for k in keys:
                fn = k.split("/", 1)[1]
                r = S.get(BUCKET + k, timeout=60)
                if r.status_code == 200:
                    with open(os.path.join(outdir, fn), "wb") as f:
                        f.write(r.content)
                    files.append(fn)
            info = {}
            jfn = f"{pmcid}.{v}.json"
            if jfn in files:
                info = json.load(open(os.path.join(outdir, jfn)))
            rec["pmc_dataset"] = {"dir": os.path.relpath(outdir, DL), "version": v, "files": files,
                                  "license_code": info.get("license_code"), "is_manuscript": info.get("is_manuscript"),
                                  "is_pmc_openaccess": info.get("is_pmc_openaccess"), "citation": info.get("citation")}
        else:
            rec["attempts"].append({"source": "PMC Article Datasets", "url": pmcid, "result": "not in open-data bucket"})

    # 3. Registry
    for reg in m.get("registry") or []:
        if not reg.startswith("NCT"):
            continue
        rj = os.path.join(DL, "registry", f"{reg}.json")
        if not os.path.exists(rj):
            r = S.get(f"https://clinicaltrials.gov/api/v2/studies/{reg}", timeout=30)
            with open(rj, "w") as f:
                json.dump(r.json(), f, indent=1)
        data = json.load(open(rj))
        rec["registry_files"].append({"file": os.path.relpath(rj, DL), "kind": "ClinicalTrials.gov record (JSON)",
                                      "url": f"https://clinicaltrials.gov/study/{reg}"})
        docs = (((data.get("documentSection") or {}).get("largeDocumentModule") or {}).get("largeDocs")) or []
        for d in docs:
            fn = d.get("filename")
            if not fn:
                continue
            url = f"https://cdn.clinicaltrials.gov/large-docs/{reg[-2:]}/{reg}/{fn}"
            out = os.path.join(DL, "registry", f"{reg}_{fn}")
            if not os.path.exists(out):
                ok, msg = get_pdf(url, out)
                if not ok:
                    rec["attempts"].append({"source": "ClinicalTrials.gov document", "url": url, "result": msg})
                    continue
            rec["registry_files"].append({"file": os.path.relpath(out, DL), "kind": d.get("label") or d.get("typeAbbrev"), "url": url})
        idm = (data.get("protocolSection") or {}).get("identificationModule") or {}
        rec.setdefault("registry_titles", {})[reg] = {"brief": idm.get("briefTitle"), "acronym": idm.get("acronym"),
                                                      "official": idm.get("officialTitle")}
    report.append(rec)
    pd = rec["pdf_source"]["label"] if rec["pdf_file"] else "-"
    pmc = (rec["pmc_dataset"] or {}).get("license_code") if rec["pmc_dataset"] else "-"
    print(f"{m['id']} PDF: {pd[:55]:55s} | PMC dataset: {pmc} ms={((rec['pmc_dataset'] or {}).get('is_manuscript'))} | reg files: {len(rec['registry_files'])}")

json.dump(report, open(REPORT, "w"), indent=2)
json.dump(meta, open(META, "w"), indent=2)
