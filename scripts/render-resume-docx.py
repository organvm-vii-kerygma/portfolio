"""Convert one RenderCV Markdown file to a deterministic DOCX artifact."""

from __future__ import annotations

import argparse
import os
from pathlib import Path

import pypandoc

CANONICAL_PORTFOLIO = "https://organvm-vii-kerygma.github.io/portfolio/"
RENDERCV_PORTFOLIO_LABEL = "organvm-vii-kerygma.github.ioportfolio"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    if not os.environ.get("SOURCE_DATE_EPOCH"):
        raise RuntimeError(
            "SOURCE_DATE_EPOCH is required for reproducible DOCX metadata"
        )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    markdown = args.input.read_text()
    markdown = markdown.replace(
        f"[{RENDERCV_PORTFOLIO_LABEL}]({CANONICAL_PORTFOLIO})",
        f"[{CANONICAL_PORTFOLIO}]({CANONICAL_PORTFOLIO})",
    )
    if f"]({CANONICAL_PORTFOLIO})" not in markdown:
        raise ValueError(
            "RenderCV Markdown is missing the canonical portfolio hyperlink"
        )
    pypandoc.convert_text(
        markdown,
        "docx",
        format="md",
        outputfile=str(args.output),
    )


if __name__ == "__main__":
    main()
