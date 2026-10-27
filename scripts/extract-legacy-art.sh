#!/usr/bin/env bash
# Extracts the 2011 art from tag v0-ios-legacy into legacy-art/ (git-ignored)
# for the dev-only comparison page at /art.html.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf legacy-art
mkdir -p legacy-art
git archive v0-ios-legacy Resources \
  | tar -x -C legacy-art --wildcards 'Resources/*-hd.png' 'Resources/Default@2x.png' --exclude 'Resources/OFResources*'
echo "Extracted $(find legacy-art -name '*.png' | wc -l) images into legacy-art/"
