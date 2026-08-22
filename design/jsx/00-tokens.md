# Locked design system — single source of truth for every render

## Substrate (dark only)
ground  #0a0d12   panel #12161d   pane #161b22
ink     #bfc6d0 (11.31:1)   ink-hi #e8ecf1   muted #848e9c (5.87:1)
rule    #242a33 (1.42 minor)   rule-hi #555f6c (3.00 major)

## Spectral ramp — one hue, one job
O/B #7fa8f5   8.17:1  links · active nav        (Rigel · Spica)
A   #bfd2f2  12.71:1  types · infra tags        (Sirius · Vega)
F   #edebe6  16.33:1  headings                  (Procyon)
G   #f0ce72  12.77:1  strings · Sun values      (the Sun · Capella)
K   #eda05b   9.06:1  numbers · language tags   (Arcturus)
M   #e8776a   6.74:1  errors only               (Betelgeuse)

## Type — 5 steps, 2 families
display   112-128  Archivo Black    -0.04em  lh 0.88  UPPERCASE
title     20-24    Archivo SemiBold
body      17       Archivo          lh 1.65  measure 38rem (~72 CPL)
secondary 13       Archivo
data      11       IBM Plex Mono    0.14em   THE FLOOR, nothing smaller

## Geometry
8px scale: 8 / 16 / 24 / 32 / 48 / 96 / 128
grid: 192px margins, 1056px column, page 1440

## Contracts (non-negotiable)
- No cards. Structure is rules: 1px #242a33 minor, #555f6c major.
- Radius 0 everywhere. A machined readout has square corners.
- Accent is for structure and large marks, never small body text.
- State carried by colour, never opacity. Opacity broke the old nav at 1.75:1.
- Chrome recedes: four corners at 11px, no persistent bar.
- Canvas alpha under text stays under 169/255, enforced by verify:legibility.

## Render traps (learned the hard way)
- <Text> CANNOT nest another element. No Frame inside Text.
- Text without explicit w= will not wrap.
- h="hug" + grid does not size the parent. Use flex only.
- Always pass parent_id to render, or it lands on page 1.
- replace_id resets x/y to 0,0 -> node_move after every replace.
- One frame per render call, to stay under the ~20s RPC ceiling.
