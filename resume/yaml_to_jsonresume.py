"""Convert RenderCV YAML to JSON Resume schema.

Usage:
    python yaml_to_jsonresume.py Anthony_James_Padavano_CV.yaml > resume.json

Then publish:
    gh gist create resume.json --public -d "JSON Resume for registry.jsonresume.org"
"""

import json
import sys

import yaml


def convert(yaml_path: str) -> dict:
    with open(yaml_path) as f:
        data = yaml.safe_load(f)

    cv = data["cv"]
    sections = cv.get("sections", {})

    def scalar(value: object) -> str:
        if isinstance(value, list):
            return str(value[0]) if value else ""
        return str(value) if value else ""

    # Basics
    basics = {
        "name": cv["name"],
        "label": cv.get("headline", ""),
        "email": scalar(cv.get("email")),
        "url": scalar(cv.get("website")),
        "summary": sections.get("summary", [""])[0],
        "location": {
            "city": cv.get("location", ""),
            "countryCode": "US",
        },
        "profiles": [],
    }

    for sn in cv.get("social_networks", []):
        if sn["network"] == "GitHub":
            basics["profiles"].append(
                {
                    "network": "GitHub",
                    "username": sn["username"],
                    "url": f"https://github.com/{sn['username']}",
                }
            )

    # Skills
    skills = []
    for s in sections.get("skills", []):
        skills.append(
            {
                "name": s["label"],
                "keywords": [k.strip() for k in s["details"].split(",")],
            }
        )

    # Work
    work = []
    for exp in sections.get("experience", []):
        entry = {
            "name": exp["company"],
            "position": exp["position"],
            "startDate": str(exp["start_date"]),
            "highlights": exp.get("highlights", []),
        }
        if exp.get("end_date"):
            entry["endDate"] = str(exp["end_date"])
        if exp.get("location"):
            entry["location"] = exp["location"]
        work.append(entry)

    # Education
    education = []
    for edu in sections.get("education", []):
        education.append(
            {
                "institution": edu["institution"],
                "area": edu["area"],
                "studyType": edu["degree"],
                "startDate": str(edu["start_date"]),
                "endDate": str(edu["end_date"]),
            }
        )

    # Certificates
    certificates = []
    for cert in sections.get("certifications", []):
        label_parts = cert["label"].split(" — ")
        certificates.append(
            {
                "name": label_parts[0].strip(),
                "issuer": label_parts[1].strip() if len(label_parts) > 1 else "",
                "date": cert.get("details", ""),
            }
        )

    # Projects
    projects = []
    for proj in sections.get("selected projects", []):
        projects.append(
            {
                "name": proj["name"],
                "description": "; ".join(proj.get("highlights", [])),
                "startDate": proj.get("date", "").split(" — ")[0].strip(),
            }
        )

    return {
        "$schema": "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
        "basics": basics,
        "work": work,
        "education": education,
        "skills": skills,
        "certificates": certificates,
        "projects": projects,
        "meta": {
            "canonical": "https://raw.githubusercontent.com/4444J99/portfolio/main/resume/resume.json",
            "version": "v1.0.0",
            "lastModified": "2026-02-12",
        },
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <yaml_file>", file=sys.stderr)
        sys.exit(1)

    result = convert(sys.argv[1])
    print(json.dumps(result, indent=2, ensure_ascii=False))
