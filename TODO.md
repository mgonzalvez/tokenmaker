# TokenMaker — TODO

Resumed work list from the code review on 2026-11-11. Group 1 and group 2 are done; CI is in progress; group 3 items 2–6 are queued.

Last audit: **53 tests passing** (`node --test tests/*.test.js`). Repo: `mgonzalvez/tokenmaker`, branch `main`, deployed to https://tokenmaker.gonzhome.us/ (Pages, legacy branch build).

---

## Done

### Group 1 — bugs
- [x] `traceGuideShape` missing `options` parameter (latent `ReferenceError`) — fixed, plus octagon geometry.
- [x] `state.sheet` initial literal was missing `hexLayoutMode` and mis-indented.
- [x] Two conflicting definitions of "straight-cut" → single `layoutApi.resolveHexLayout()` used by `effectiveHexMode()`, `getSheetLayout()`, `refreshSheetControls()`, and the sheet summary copy.
- [x] `getEffectiveGuideStyle()` ignored its `shape` argument.
- [x] Duplicate `renderTokenSvg` calls per design → `renderTokenSvgCached()` + `paintedVectorMarkup()` caches.
- [x] `display: grid !important`, `nextElementSibling` DOM coupling, silent `catch {}` blocks.

### Group 2 — UX / accessibility
- [x] `hex-dashed` is a real, selectable guide style (hexagon sheets only) instead of dead code.
- [x] Preview parity: bleed and dashed cut lines now render in the live preview; drag mapping scales to the actual viewBox.
- [x] "Draft differs from the saved design" indicator (`designSignature()` + `updateDesignSyncNote()`).
- [x] Keyboard controls: arrow keys nudge the icon/value (Shift = 5), arrow keys swap a focused placed token.
- [x] `aria-pressed` on all segmented toggles; `aria-live` moved from the icon grid to the icon count.
- [x] README + AGENTS.md updated (rules 6, 10–13).

---

## Group 3 — remaining (recommended order)

### 1. CI workflow — ~15–20 min
**Why:** 53 tests and zero CI. Every sibling repo has one.
- [x] Added `.github/workflows/deploy-pages.yml`: Node 24, `node --check app.js layout-engine.js scripts/build-icon-manifest.mjs`, `node --test tests/*.test.js`, icon-manifest drift check, upload static artifact, `github-pages` deploy environment with `url: ${{ steps.deployment.outputs.page_url }}`, `workflow_dispatch` enabled.
- [x] Added a source-integrity test asserting the workflow runs the same release checks.
- [ ] Flip Pages from branch build to Actions:
  ```bash
  gh api -X PUT repos/mgonzalvez/tokenmaker/pages -f build_type=workflow
  ```
  (`gh` is authenticated on this machine.)
- [ ] Confirm the first run goes green and the custom domain still resolves.

### 2. Vendor jsPDF locally — ~20–30 min
**Why:** PDF export is the whole point of the tool, and it currently depends on a CDN script (`index.html:649`).
- Download `jspdf.umd.min.js` (2.5.1, ~300 KB) into `vendor/`, replace the CDN `<script>` tag, keep the existing "PDF library unavailable" fallback.
- Add a source-integrity test asserting the local file exists and is referenced.
- Optional: bump jsPDF to a current release while vendoring.

### 3. Session autosave / recovery — ~60–90 min
**Why:** a refresh loses the entire project; `beforeunload` (`app.js:2478`) only warns.
- Debounced snapshot of `serializeProject()` to `localStorage` (key e.g. `tokenmaker-session-v1`), ~2 s after the last change.
- Size guard: localStorage is roughly 5 MB; a 10 MB raster upload's data URL will not fit. Skip rasters above a threshold and tell the user to save the JSON.
- Restore on load with a version check, plus a "Restored your last session" toast and a "Start fresh" affordance.
- Tests: round-trip serialization, the size guard, version mismatch handling.
- Project JSON export remains the durable artifact; autosave is only crash recovery.

### 4. Value input validation + honest units — ~20–30 min
**Why:** `index.html:350` is `type="text"` with `inputmode="numeric"` and `maxlength="5"` — anything is accepted. `valueSize` is labelled "px" (`app.js:957`, `app.js:2368`) but is really a 1000-unit viewBox measure.
- Validate/normalize the value (digits, optional sign, cap length), clamp `valueSize` in `valueTextMarkup` (already clamped at render, but the UI should agree).
- Relabel size units, e.g. "size" with the equivalent printed inches shown alongside.

### 5. `confirm()` dialogs → `<dialog>` — ~40–60 min
**Why:** native `confirm()` (`app.js:1239`, `app.js:1453`) is unstyled and inconsistent with the license modal already in the app.
- One reusable modal component (Escape closes, focus return, aria labelled).
- Wire delete-design and clear-sheet through it.

### 6. Repo weight — ~10–15 min
**Why:** 13.4 MB on GitHub; two tracked files are referenced only in the README.
- Move or delete `token example.pdf` (1.2 MB) and `Hex_grid_token_template_blank.png` (800 KB).
- Honest caveat: deleting them does **not** shrink the 14 MB history — that would need a history rewrite, not worth it for 2 MB.
- Keep debug artifacts out of the site root: `user_request_*/`, `no borders  issue/`, `blank preview when pointy top is selected.png` are gitignored but still sit in the working directory.

---

## Nice-to-have (unscheduled)

- Playwright e2e in CI (~45 min): actually load the page, click through designer → sheet → PDF export. No headless browser is installed locally, so runtime behaviour (PDF guides, autosave restore) is currently verified only by unit tests and source assertions.
- Undo/redo in the designer.
- "Fill shape" applied to all designs in a project at once.
- Octagon-aware guide geometry beyond the dashed outline.
- Per-design bleed/orientation instead of sheet-level.

---

## Reference commands

```bash
cd /Users/gonz/Desktop/websites/TokenMaker
node --check app.js layout-engine.js scripts/build-icon-manifest.mjs
node --test tests/*.test.js
python3 -m http.server 8766   # local serve; opening index.html directly won't load the icon SVGs
```

Registry rule (portfolio-wide): this repo has no npm dependencies; `.npmrc` pins `registry=https://registry.npmjs.org` so a future `npm install` can never write an Apple internal mirror lockfile into CI.
