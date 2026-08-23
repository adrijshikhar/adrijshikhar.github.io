# Design file recovery note — 2026-08-22

## What happened

`design/portfolio-redesign.fig` is **empty**: 1 page (`EMPTY — ignore`), 0 nodes.
The 15 frames and 276 text nodes that were in it are gone. Verified three ways:

```
openpencil pages design/portfolio-redesign.fig   ->  1 page, 0 nodes
openpencil eval  ... -c '42'                     ->  runs, document is empty
strings design/portfolio-redesign.fig | grep -c EXPERIENCE   ->  0
```

None of the frame names (`EXPERIENCE`, `DESIGN SYSTEM`, `MACHINE VIEW`, `ARCHIVE`,
`CONTACT`) survive anywhere in the file's bytes. The remaining 3.6MB is orphaned
font/blob payload. This is why both OpenPencil and Figma showed a blank document —
not a container-format problem, the content is actually absent.

The file was never committed to git, and the app-written backups were deleted during
an earlier cleanup. There is no copy to restore from.

## Separate, real finding: the CLI's .fig writer rewrites containers

A **no-op** round-trip of a known-good Figma-authored file through the CLI writer:

```
openpencil eval "Portfolio — Brand Board (Adrij Shikhar).fig" -o roundtrip.fig -c '1'
```

- input  3,829,020 bytes — ZIP method `0808` (deflate) + `UT` extended-timestamp field
- output 3,772,149 bytes — ZIP method `0000` (stored), no extra field

Content survives for the CLI's own reader (236 nodes both ways), but the archive is
rewritten in a dialect other consumers reject. `.pen` is **read-only** and `.fig` is the
only writable document format, so **the app's own save is the only route to a loadable
file.** Do not author design files through the CLI writer.

## What survives

- `design/exports/*.png` — 15 valid exports, every surface, the real design record
- The measured spec — see `jsx/00-tokens.md` in the session scratchpad, reproduced below
- `~/Downloads/Portfolio — Brand Board (Adrij Shikhar).fig` — valid, Figma-written,
  2 pages / 236 nodes (brand board + "Redesign v1 — Telemetry / Print")

## Rebuild procedure

1. `/mcp reconnect open-pencil` — the stdio MCP server binds port 7601. Only one process
   may bind it, so **never** start `openpencil-mcp-http` by hand; a manual sidecar
   squatting 7601 is what blocked MCP for most of this session.
2. Launch OpenPencil and open the Downloads brand board, so the app has a live document.
3. `render` one frame per call (stays under the ~20s RPC ceiling), always passing
   `parent_id`. Section-by-section into a shell frame for the large surfaces.
4. `save_file` **through the app** — never the CLI — then verify by reopening.
5. Commit the result so this cannot happen again.

## Render traps, learned the hard way

- `<Text>` cannot nest another element. A Frame inside Text produces TEXT nodes
  containing FRAMEs and mangles the layout.
- `<Text>` without an explicit `w` will not wrap.
- `h="hug"` + `grid` does not size the parent — backgrounds stop partway and content
  spills onto the canvas. Use flex only.
- `render` without `parent_id` appends to the document's first page, not the current one.
- `replace_id` resets x/y to 0,0 — `node_move` after every replace.
- Headless writes flatten one hierarchy level per write, and `appendChild` re-parenting
  never persists. This is the most likely cause of the content loss above.
- A timed-out RPC call has usually **succeeded**. Re-check state before retrying, or you
  create duplicates.
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

## Addendum — headless writes DO work; earlier conclusions retracted

Three claims in this file's earlier draft were wrong. Corrected, all measured:

**RETRACTED: "headless writes are a no-op for content."** False. It came from testing
`.characters` with `openpencil find --type TEXT`, which matches node *names* — setting
characters does not rename a node, so the test could never have detected the change. An
explicit `.name` assignment persists and is findable, proving writes carry content.

**RETRACTED: "the writer aliases node IDs and destroys content."** The real rule is
narrower: created nodes take low, already-occupied IDs, so building into a document that
still holds content overwrites it. Building into a **cleared** document is safe.

**RETRACTED: "frame names are absent from the file's bytes."** Worthless evidence —
`strings` finds no text in a healthy `.fig` either, because content is compressed inside
the kiwi payload. (The original file being empty still holds, on the CLI reader's word.)

### The three rules that actually make headless authoring work

1. **Clear the document first.** Remove every page but one, then remove its children.
   New nodes then have no occupied IDs to collide with.
2. **Coordinate space depends on assignment order.** Setting `.x`/`.y` BEFORE
   `appendChild` is absolute canvas space; AFTER `appendChild` it is parent-relative.
   Rectangles here are placed before (offset by the parent origin), text after (plain
   relative). Mixing them up silently puts children outside their own frame.
3. **`textAutoResize` is not supported.** Text nodes keep a 100x100 box. Glyphs render
   correctly, so this only pads export bounds — but it means text will not hug or wrap on
   its own. Pass an explicit width for anything that must wrap.

`eval` still suppresses return values in 0.13.2 (`--json`/`-q` make no difference), so
verify by writing the file and reading it back, and above all by exporting a PNG and
looking at it. Every layout bug in this build was found by looking at pixels, not by
trusting the write.

### Root cause of the automation failure: a version mismatch (upstream-confirmed)

MCP/app automation was broken for one reason only: **`@open-pencil/mcp` and
`@open-pencil/cli` were 0.13.2 while the desktop app is 0.14.0.** Matching them fixes it
outright:

```bash
npm i -g @open-pencil/mcp@0.14.0
bun add -g @open-pencil/cli@0.14.0
# quit and relaunch the app, then:
curl -s http://127.0.0.1:7600/health     # {"status":"ok","version":"0.14.0",...}
openpencil pages                          # app mode now works
```

Things that were NOT the cause, each ruled out by measurement:
- **ATS / WKWebView localhost blocking** (upstream #190, fixed by #198) — the installed
  app already carries `NSAllowsLocalNetworking` in its `Info.plist`.
- **PATH** — widening it via `launchctl setenv PATH` was unnecessary; revert with
  `launchctl unsetenv PATH`.
- **Sidecar spawning by hand** — never needed. The app starts its own. A manually started
  `openpencil-mcp-http` squatting 7600/7601 *prevents* the app's own from binding
  (upstream #488 describes the orphan-server variant of this).

### Upstream issues matching what was hit here

| Issue | Title | Bearing |
|---|---|---|
| #374 | clone_node + reparent_node lost on save/reload — "poisoned id-space", pages reopen empty, file size unchanged | This is what emptied `portfolio-redesign.fig`. Closed/fixed. |
| #190 | Tauri release build does not connect the WebSocket bridge | Same `no_app` signature; ATS root cause. Closed/fixed. |
| #488 | Orphan MCP server never self-heals; `no_app` ignored on reuse | Why a hand-started sidecar poisons automation. Closed/fixed. |
| #575 | CLI `openpencil import` fails "Bun is not defined" on Node | The error hit here; fix in open PR #576. |
| #136 | Text exported with WIDTH_AND_HEIGHT overflows | CLOSED/fixed. Its fix made `NONE` the default, which is why text does not hug unless `textAutoResize` is set explicitly. |
| #173 | Cannot save as `.pen` — only `.fig` offered | Why `convert -o x.pen` emitted ZIP bytes. |

Lesson worth keeping: **check the installed tool version against the app before
diagnosing anything.** Hours went into probing behaviour that was simply a mismatched
client, and the upstream tracker already described every symptom.

## 0.14.0: the id-pool rule (measured, and it bit twice)

**Never remove a node in the same write as creating one.** Removal frees ids into a pool
that creation re-draws from, so later-created nodes silently overwrite earlier ones. The
file looks fine by size and by census; whole frames are just missing.

Controlled repro on 0.14.0, wiping a page then creating 4 frames each with one text child:

| Approach | Survivors |
|---|---|
| wipe page, then create (auto-parent) | 0 of 4 |
| wipe page, then create + `appendChild` | 0 of 4 |
| new page, create, delete originals last | 2 of 4 |
| **new page, create, delete nothing** | **4 of 4** |

This is what cost the `00 — DESIGN SYSTEM` frame (97 nodes) on the first 0.14.0 build:
`01 — HERO` was allocated id `0:4`, the slot DESIGN SYSTEM already held.

The fix is two passes — see `design/build.sh`:

1. **Pass 1, create only** — build onto a brand-new page, remove nothing.
2. **Pass 2, remove only** — prune the original pages in a separate write.

Also on 0.14.0: `createFrame` no longer auto-appends to `figma.currentPage`; append
explicitly. `textAutoResize` DOES apply on 0.14.0 (it was ignored on 0.13.2, which is why
that draft wrongly called it unsupported) — but per upstream #136 the default is `NONE`,
so text never hugs unless you set it. Node ids also shift between builds, so never
hardcode ids across rebuilds; resolve them from `tree`/`find`.

## App-mode automation: works, but do not write through it

With versions matched, `openpencil pages`/`info`/`eval` drive the live app. Writes are a
different story: an app-mode `eval` creating one frame on the 256-node document hit the
hardcoded **20s RPC ceiling** and then wedged the renderer — subsequent read-only calls
also timed out while `/health` still said `ok`. Related upstream: #488, #486.

Use app mode for reading and verification. Author with the headless two-pass builder.
