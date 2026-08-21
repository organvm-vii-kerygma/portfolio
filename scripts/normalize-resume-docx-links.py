"""Normalize and verify canonical hyperlinks in generated resume DOCX files."""

from __future__ import annotations

import argparse
import html
import os
import re
import tempfile
import urllib.parse
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

CANONICAL_PORTFOLIO = "https://organvm-vii-kerygma.github.io/portfolio/"
CANONICAL_EMAIL = "mailto:padavano.anthony@gmail.com"
RELATIONSHIPS_PATH = "word/_rels/document.xml.rels"
RELATIONSHIPS_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
HYPERLINK_TYPE = (
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"
)


def canonical_target(target: str) -> str:
    decoded = urllib.parse.unquote(target)
    if "organvm-vii-kerygma.github.io/portfolio" in decoded:
        return CANONICAL_PORTFOLIO
    if "padavano.anthony@gmail.com" in decoded:
        return CANONICAL_EMAIL
    return target


def relationship_tree(data: bytes) -> ET.Element:
    return ET.fromstring(data)


def normalized_relationship_xml(data: bytes) -> tuple[bytes, bool]:
    changed = False

    def replace_target(match: re.Match[bytes]) -> bytes:
        nonlocal changed
        encoded_target = match.group(1).decode("utf-8")
        target = html.unescape(encoded_target)
        normalized = canonical_target(target)
        if normalized == target:
            return match.group(0)
        changed = True
        escaped = html.escape(normalized, quote=True).encode("utf-8")
        return b'Target="' + escaped + b'"'

    return re.sub(rb'Target="([^\"]*)"', replace_target, data), changed


def hyperlink_targets(root: ET.Element) -> list[str]:
    return [
        relationship.attrib["Target"]
        for relationship in root.findall(f"{{{RELATIONSHIPS_NS}}}Relationship")
        if relationship.attrib.get("Type") == HYPERLINK_TYPE
    ]


def validate_targets(path: Path, targets: list[str]) -> None:
    malformed = [
        target
        for target in targets
        if "HttpUrl" in urllib.parse.unquote(target)
        or "['" in urllib.parse.unquote(target)
        or '["' in urllib.parse.unquote(target)
    ]
    if malformed:
        raise ValueError(f"{path}: malformed hyperlink targets: {malformed}")
    for required in (CANONICAL_PORTFOLIO, CANONICAL_EMAIL):
        if required not in targets:
            raise ValueError(f"{path}: missing canonical hyperlink {required}")


def normalize(path: Path, check_only: bool) -> None:
    with zipfile.ZipFile(path, "r") as archive:
        archive.testzip()
        entries = [(item, archive.read(item.filename)) for item in archive.infolist()]

    relationship_entry = next(
        (entry for entry in entries if entry[0].filename == RELATIONSHIPS_PATH),
        None,
    )
    if relationship_entry is None:
        raise ValueError(f"{path}: missing {RELATIONSHIPS_PATH}")

    relationship_xml, changed = normalized_relationship_xml(relationship_entry[1])
    root = relationship_tree(relationship_xml)

    targets = hyperlink_targets(root)
    validate_targets(path, targets)
    if check_only:
        if changed:
            raise ValueError(f"{path}: hyperlinks require normalization")
        return
    if not changed:
        return

    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    os.close(descriptor)
    temporary_path = Path(temporary_name)
    try:
        with zipfile.ZipFile(temporary_path, "w") as output:
            for info, data in entries:
                output.writestr(
                    info,
                    relationship_xml if info.filename == RELATIONSHIPS_PATH else data,
                )
        os.replace(temporary_path, path)
    finally:
        temporary_path.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("paths", nargs="+", type=Path)
    args = parser.parse_args()
    for path in args.paths:
        normalize(path, args.check)
        print(f"resume links: {'verified' if args.check else 'normalized'} {path}")


if __name__ == "__main__":
    main()
