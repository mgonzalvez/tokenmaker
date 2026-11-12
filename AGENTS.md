# TokenMaker Maintenance Notes

## Stack

TokenMaker is a static, framework-free GitHub Pages application. It has no build step and no server component.

## Critical Rules

1. Physical dimensions are stored internally in inches. Metric values are display/input conversions only.
2. A sheet spec is the combination `shape|sizeIn`. Placements from different specs must never be mixed.
3. Preview and export must use `layout-engine.js`; do not duplicate packing math in `app.js`.
4. Token SVGs use a 1000 × 1000 design viewBox. Hexagon physical height is `size × √3 / 2`. Octagon and other rectangular-bounding shapes use `size × size`. Dormant triangle geometry is retained in the layout engine but is not exposed in the UI.
5. The PDF renderer uses 300 pixels per inch and places the final page image at exact physical dimensions.
6. Token shape geometry (`element`, `path`, `points`, and the circle `radius`) is defined once in `layout-engine.js` as `TOKEN_SHAPES` / `getTokenShape()`. `app.js` must not re-declare shape polygons. Icon artwork is drawn in a 620-unit box at 100% scale (`layoutApi.ICON_BASE_UNITS`) inside the 1000-unit token viewBox and is clipped to the token shape. `design.iconFit` is `"fit"` (whole image, letterboxed) or `"fill"` (cropped to the icon box). The scale slider runs 25–260%, and the "Fill shape" button computes the exact coverage scale with `coverScaleForShape()` (162% for a hexagon, 160% for a circle or square).
7. Uploaded SVG content must pass through `normalizeSvgSource()` before it is inserted into the document.
8. Uploaded raster artwork and SVG source text must remain serializable in project JSON.
9. Keep the Fractal Symbols attribution in the site footer and printable PDF footer.
10. Hex sheets support two layout modes: "straight-cut" (alternating rows, zero gutter, landscape forced, no rectangular guides) and "grid" (rectangular grid, user-controlled gutter/orientation, standard cutting guides). `layoutApi.resolveHexLayout()` is the single source of truth for which mode is active; `effectiveHexMode()` in `app.js` is the only place that reads `state.sheet.hexLayoutMode` for layout decisions, and both `getSheetLayout()` and `refreshSheetControls()` must use it. Straight-cut only exists for flat-top hexagons, so a pointy-top sheet reports `grid` even if the toggle was previously set to straight-cut. The toggle is only visible for hexagon sheets and is disabled when pointy-top is active.
11. The `hex-dashed` guide style draws a dashed outline tracing the token shape (hexagons and octagons) and suppresses the token border in both preview and PDF export. It is offered only for hexagon sheets. Rectangular guide styles return no segments for it, so the outline comes from `guideMarkup()` in the token SVG and `drawCutGuide()` in the PDF renderer.
12. Draft edits never mutate a saved design until `addOrUpdateDesign()` runs. `designSignature()` is the canonical comparison used both for the "draft differs from saved design" note (`updateDesignSyncNote()`, called from `setDirty()`) and for the token markup cache key.
13. Every pointer interaction has a keyboard equivalent: arrow keys nudge the active preview target (Shift for a larger step), and arrow keys swap a focused placed token with its neighbour. Toggle controls must set `aria-pressed` through `setToggleActive()` rather than only an `active` class.

## Project State

```js
{
  unit: "in" | "mm",
  draft: TokenDesign,
  designs: TokenDesign[],
  sheet: {
    specKey,
    paperSize,
    orientation,
    gutterIn,
    marginIn,
    guideStyle,
    includeBacks,
    currentPage,
    placementsBySpec,
    hexLayoutMode: "straight-cut" | "grid",
    hexOrientation: "flat-top" | "pointy-top"
  }
}
```

`placementsBySpec` maps a sheet spec to an ordered array of design IDs. Quantities are derived from repeated IDs rather than stored separately.

Each `TokenDesign` carries `icon` (library, uploaded SVG, or uploaded raster with `width`/`height`), `iconScale` (25–260), `iconFit` (`"fit"` or `"fill"`), `iconRotation`, `iconX`/`iconY` in preview units, and the value fields.

`hexLayoutMode` and `hexOrientation` are only active when `specKey` starts with `hex|`. `hexLayoutMode` controls the packing algorithm used by `calculateSheetLayout()` — straight-cut uses `hexSlots()` while grid uses `hexGridSlots()`. `hexOrientation` controls the token rotation: flat-top has a flat side facing up; pointy-top has a vertex facing up. Pointy-top swaps the token's width and height bounds (`size × √3/2` × `size` instead of `size` × `size × √3/2`). Straight-cut layout is incompatible with pointy-top and returns zero slots.

## Icon Library

The browser cannot enumerate repository folders. Run:

```bash
node scripts/build-icon-manifest.mjs
```

after changing the Fractal Symbols folders. Commit the regenerated `icon-manifest.js`.

## Regression Checks

Run:

```bash
node --check app.js
node --check layout-engine.js
node --check scripts/build-icon-manifest.mjs
node --test tests/*.test.js
```

The layout property test checks every supported shape across representative sizes, gutters, paper sizes, and orientations.

`.github/workflows/deploy-pages.yml` runs the same checks on every push to `main` and fails if `icon-manifest.js` drifts from a fresh generator run.

## Key Files

- `index.html` — UI for designer, sheet builder, hex layout toggle, hex orientation toggle, octagon shape button
- `app.js` — Main app logic: `shapeGeometry()` (delegates to `layoutApi.getTokenShape`), `effectiveHexMode()`, `aspectFit`/`coverScaleForDesign`, `renderTokenSvgCached()` (per-pass render cache), `hexLayoutMode`/`hexOrientation` state, `refreshSheetControls()`, `guideMarkup()` (hex-dashed styling), `getSheetLayout()`
- `layout-engine.js` — Layout algorithms: `getTokenShape()`, `resolveHexLayout()`, `coverScaleForShape()`, `hexSlots()`, `hexGridSlots()`, `calculateSheetLayout()` (layoutMode and hexOrientation routing); `tokenBoundsForSize()` returns swapped dimensions for pointy-top hex
- `tests/layout-engine.test.js` — Hex grid layout, straight-cut rejection for pointy-top, pointy-top bounds and capacity tests, token shape geometry, artwork coverage scale
- `tests/source-integrity.test.js` — Source assertions for hex-dashed guide styling and suppressTokenStroke fix

## Registry & provenance rule (portfolio-wide)

Personal project — completely separate from Apple work.

- `.npmrc` pins `registry=https://registry.npmjs.org`. This repo has no npm dependencies today, but the pin is committed so a future `npm install` can never write an Apple-mirror lockfile. Never let Apple's internal npm mirror (`npm.apple.com`, `artifacts.apple.com/artifactory/...`) end up in `package-lock.json`; GitHub Actions can't reach it and CI fails with `ENOTFOUND`.
- Audit before pushing: `../scripts/check-registry.sh` (add `--fix` to normalize).
- No work credentials, internal hostnames, proprietary assets, or confidential material in this repo.
