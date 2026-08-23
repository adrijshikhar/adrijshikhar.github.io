#!/bin/sh
# Rebuild design/spectral.fig from design/build-spectral.js on @open-pencil/cli 0.14.0.
#
# TWO PASSES, and the split is load-bearing: never remove a node in the same write as
# creating one. Removal frees ids into a pool that creation re-draws from, so later nodes
# silently overwrite earlier ones. Doing this in one pass costs the first frame built.
set -e
SRC="${1:-$HOME/Downloads/Portfolio — Brand Board (Adrij Shikhar).fig}"
cd "$(dirname "$0")/.."

# pass 1 — create only, onto a brand-new page, originals untouched
cat design/build-spectral.js | openpencil eval "$SRC" --stdin -o /tmp/op-pass1.fig

# pass 2 — remove only, no creation
openpencil eval /tmp/op-pass1.fig -o design/spectral.fig -c '
var keep=null, all=figma.root.children.slice();
for (var i=0;i<all.length;i++) if (all[i].name.indexOf("SPECTRAL")===0) keep=all[i];
figma.currentPage=keep;
for (i=0;i<all.length;i++) if (all[i]!==keep) all[i].remove();
"pruned"'

openpencil info design/spectral.fig
