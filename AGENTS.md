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
9. Hex sheets always use a zero gutter and landscape orientation. Their alternating full-height rows form the continuous three-direction straight-cut lattice from the supplied template.

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
    placementsBySpec
  }
}
```

`placementsBySpec` maps a sheet spec to an ordered array of design IDs. Quantities are derived from repeated IDs rather than stored separately.

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
