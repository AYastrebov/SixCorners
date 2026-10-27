#!/usr/bin/env python3
"""Traces the 2011 splash screen (Default@2x.png) into a layered SVG.

Each colour of a fixed palette is masked out, grown by a pixel so layers
overlap without seams, traced with potrace and stacked: fills first, black
outlines last. The khaki background is left out; the comic skin draws it.

Needs ImageMagick 7 (`magick`) and `potrace`. Usage:
    scripts/trace-splash.py OUT.svg
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

# Colours sampled from Default@2x.png, in drawing order.
PALETTE = {
    "#565839": "dark grey hex shading",
    "#8e8e67": "grey hex",
    "#99966d": "grey hex highlight",
    "#e87723": "logo",
    "#1ad600": "green hex",
    "#e3e500": "yellow hex",
    "#00b0a4": "teal hex",
    "#f7f8a6": "hands and eye whites",
    "#050504": "outlines",
}
BACKGROUND = ["#d7c988", "#cbbd87"]


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def main(out: Path) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        png = work / "default.png"
        png.write_bytes(
            subprocess.run(
                ["git", "show", "v0-ios-legacy:Resources/Default@2x.png"],
                check=True,
                capture_output=True,
            ).stdout
        )
        # Palette image: one pixel per colour, background included so it stays background.
        colours = list(PALETTE) + BACKGROUND
        run("magick", *[f"xc:{c}" for c in colours], "+append", str(work / "palette.png"))
        # A median filter removes the halftone dots before snapping to the palette.
        run(
            "magick", str(png), "-statistic", "Median", "3",
            "-dither", "None", "-remap", str(work / "palette.png"), str(work / "flat.png"),
        )
        layers = []
        for i, (colour, name) in enumerate(PALETTE.items()):
            mask = work / f"mask{i}.pbm"
            grow = [] if colour == "#050504" else ["-morphology", "Dilate", "Disk:1.5"]
            run(
                "magick", str(work / "flat.png"), "-alpha", "off",
                "-fill", "white", "-opaque", colour,
                "-fill", "black", "+opaque", "white",
                *grow, "-negate", str(mask),
            )
            svg = work / f"layer{i}.svg"
            run("potrace", "-b", "svg", "-t", "6", "-a", "1.1", "-O", "0.4",
                "--color", colour, "-o", str(svg), str(mask))
            text = svg.read_text()
            group = re.search(r"<g transform.*</g>", text, re.S)
            if group:
                layers.append(f"<!-- {name} -->\n{group.group(0)}")
        out.write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 960">\n'
            + "\n".join(layers)
            + "\n</svg>\n"
        )
    print(f"Wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
