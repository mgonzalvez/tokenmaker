# TokenMaker Maintenance Notes

## Stack

TokenMaker is a static, framework-free GitHub Pages application. It has no build step and no server component.

## Critical Rules

1. Physical dimensions are stored internally in inches. Metric values are display/input conversions only.
2. A sheet spec is the combination `shape|sizeIn`. Placements from different specs must never be mixed.
3. Preview and export must use `layout-engine.js`; do not duplicate packing math in `app.js`.
4. Token SVGs use a 1000 × 1000 design viewBox. Hexagon physical height is `size × √3 / 2`. Octagon and other rectangular-bounding shapes use `size × size`. Dormant triangle geometry is retained in the layout engine but is not exposed in the UI.
5. The PDF renderer uses 300 pixels per inch and places the final page image at exact physical dimensions.
6. Uploaded SVG content must pass through `normalizeSvgSource()` before it is inserted into the document.
7. Uploaded raster artwork and SVG source text must remain serializable in project JSON.
8. Keep the Fractal Symbols attribution in the site footer and printable PDF footer.
9. Hex sheets support two layout modes: "straight-cut" (alternating rows, zero gutter, landscape forced, no cutting guides) and "grid" (rectangular grid, user-controlled gutter/orientation, standard cutting guides). The toggle defaults to straight-cut for backward compatibility and is only visible for hexagon sheets. Straight-cut is incompatible with pointy-top orientation and is disabled when pointy-top is active.

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

## Key Files

- `index.html` — UI for designer, sheet builder, hex layout toggle, hex orientation toggle, octagon shape button
- `app.js` — Main app logic: `shapeGeometry()`, `hexLayoutMode`/`hexOrientation` state, `refreshSheetControls()`, `guideMarkup()` (hex-dashed styling), `getSheetLayout()`
- `layout-engine.js` — Layout algorithms: `hexSlots()`, `hexGridSlots()`, `calculateSheetLayout()` (layoutMode and hexOrientation routing); `tokenBoundsForSize()` returns swapped dimensions for pointy-top hex
- `tests/layout-engine.test.js` — Hex grid layout, straight-cut rejection for pointy-top, pointy-top bounds and capacity tests
- `tests/source-integrity.test.js` — Source assertions for hex-dashed guide styling and suppressTokenStroke fix
