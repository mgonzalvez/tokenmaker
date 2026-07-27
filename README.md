# TokenMaker

TokenMaker is a desktop-first, browser-based tool for designing exact-size print-and-play board-game tokens and arranging multiple designs on printable US Letter or A4 PDF sheets.

Live site: <https://tokenmaker.gonzhome.us/>

The application is static and framework-free. Token editing, project files, uploaded artwork, image exports, and PDF rendering all happen in the browser.

## Project Status

TokenMaker is an MVP ready for functional validation and iterative polishing. It has no build step, package installation, backend, account system, database, or analytics.

## Features

- Circle, square, flat-top hexagon, and flat-top octagon tokens
- Finished sizes from 0.5 to 3 inches
- Imperial and metric controls
- Live SVG preview with direct icon and value positioning
- Editable background, border, icon fill, icon stroke, and stroke widths
- Centered, left-positioned, or freely positioned numeric values
- Standard overlay and negative-space numeric treatments
- 327 Fractal Symbols icons:
  - 286 vectors from the newer complete pack
  - 41 non-duplicate legacy vectors
- Custom SVG, PNG, and JPG artwork
- Multiple saved designs per project
- One token shape and finished size per printable sheet
- Mixed designs and per-design quantities on the same compatible sheet
- Maximum-fit Letter and A4 layouts
- Adjustable gutter for circle and square sheets
- Zero-gutter straight-cut lattice for hexagon sheets
- Zero-gutter touching layout for octagon sheets
- Default-on 0.1-inch bleed on every side
- Combined perimeter and crosshair guides by default for circles and squares
- Straight-cut hexagon layout with no cutting guides; grid layout with standard guides
- Optional horizontally mirrored back pages for duplex printing
- Individual PNG and JPG exports at 300 DPI
- Multipage PDF export at 300 DPI
- Versioned JSON project save/load
- First-visit interactive tutorial
- Persistent light and dark appearance

## Basic Workflow

1. Select a library icon or upload artwork.
2. Choose a token shape and finished physical size.
3. Adjust the background, border, icon, and optional numeric value.
4. Add the design to the project.
5. Repeat for any additional compatible designs.
6. Select **Build printable sheet**.
7. Choose the quantity of each design.
8. Configure paper, gutter, margin, bleed, guides, and optional backs.
9. Export the print-ready PDF.

Every sheet uses one token shape and one finished physical size. Artwork, colors, and numeric values may differ between designs on that sheet.

## Run Locally

Opening `index.html` directly is not sufficient because browsers restrict local SVG loading. Serve the repository over HTTP instead:

```bash
python3 -m http.server 8766
```

Then open <http://localhost:8766/>.

No installation or compilation is required.

## Validation

Run the release checks from the repository root:

```bash
node --check app.js
node --check layout-engine.js
node --check scripts/build-icon-manifest.mjs
node --test tests/*.test.js
```

The tests cover:

- physical unit conversion and supported size limits;
- bleed, gutter, margin, paper, and pagination calculations;
- circle, square, octagon, and straight-cut hexagon placement;
- mirrored duplex page geometry;
- cutting-guide generation;
- DOM/source integrity and GitHub Pages configuration;
- icon-manifest completeness, uniqueness, and asset availability;
- licensing, footer, tutorial, and release metadata.

## Icon Library Maintenance

The browser cannot enumerate repository folders. After changing either Fractal Symbols source folder, regenerate and commit the manifest:

```bash
node scripts/build-icon-manifest.mjs
node --test tests/icon-manifest.test.js
```

`Fractal-Symbols-Complete-Pack/` is the primary source. `FractalSymbols Icons Set/` is retained for the curated legacy-only additions defined in `scripts/build-icon-manifest.mjs`.

Do not hand-edit `icon-manifest.js`.

## Repository Layout

| Path | Purpose |
| --- | --- |
| `index.html` | Application interface and publishing entry point |
| `styles.css` | Gonzhome visual system and responsive layouts |
| `app.js` | Editor state, rendering, project management, and export |
| `layout-engine.js` | Framework-independent physical sheet geometry |
| `icon-manifest.js` | Generated searchable icon metadata |
| `scripts/build-icon-manifest.mjs` | Deterministic icon-manifest generator |
| `tests/` | Node regression and integrity tests |
| `Fractal-Symbols-Complete-Pack/` | Current Fractal Symbols vectors and thumbnails |
| `FractalSymbols Icons Set/` | Legacy source retained for unique icons |
| `ATTRIBUTION.md` | Third-party artwork attribution |
| `CNAME` | GitHub Pages custom domain |
| `.nojekyll` | Disables Jekyll processing for direct static publishing |
| `Hex_grid_token_template_blank.png` | Reference for straight-cut hex placement |
| `token example.pdf` | Reference for printable circle-token layouts |

## What Git Tracks

The following are intentionally committed because the live application or reproducible development process needs them:

- HTML, CSS, JavaScript, tests, and scripts;
- `icon-manifest.js`;
- both Fractal Symbols folders and their upstream license/readme files;
- `ATTRIBUTION.md`;
- `CNAME`, `.nojekyll`, and `favicon.svg`;
- the supplied PDF and hex-layout reference files.

The `.gitignore` excludes operating-system files, editor state, tool caches, dependencies, logs, local environment/secrets files, test reports, and user-generated TokenMaker exports.

Before the first commit, review the exact set with:

```bash
git status --short
git status --short --ignored
```

## GitHub Pages Deployment

TokenMaker is designed to publish directly from the repository root.

1. Create or connect the GitHub repository.
2. Push the project to the `main` branch.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`.
5. Confirm the custom domain is `tokenmaker.gonzhome.us`.
6. Configure the `tokenmaker` DNS record for the repository’s GitHub Pages hostname.
7. Enable **Enforce HTTPS** after GitHub validates the domain.

For a new local repository:

```bash
git init -b main
git add .
git commit -m "Prepare TokenMaker MVP"
git remote add origin <repository-url>
git push -u origin main
```

GitHub Pages requires `index.html` at the publishing root. The included `.nojekyll` file keeps the repository on the direct static-file path documented by GitHub Pages.

## External Dependency

- [jsPDF 2.5.1](https://github.com/parallax/jsPDF) — MIT licensed, pinned to an exact cdnjs URL with Subresource Integrity verification.

Token design, project save/load, image export, and sheet previews remain available if jsPDF cannot load. Only PDF export requires the dependency and an internet connection.

## Privacy and Security

- TokenMaker has no backend, accounts, analytics, or server-side processing.
- Uploaded artwork is processed locally in the browser.
- SVG artwork is normalized before it is inserted into the document.
- Saved JSON projects may embed uploaded artwork and can therefore become large.
- Users should only load project JSON files from sources they trust.

## Artwork Attribution

The bundled artwork is **Fractal Symbols: Board Game Library** by Felix Thalin, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

See [ATTRIBUTION.md](ATTRIBUTION.md) and the upstream license files bundled with both source packs. TokenMaker’s on-site and printable-page footers retain the required attribution.

## Copyright

TokenMaker application code and interface:

Copyright 2026 by Martin Gonzalvez.

The copyright notice does not replace or restrict the separate CC BY 4.0 license covering Fractal Symbols artwork. No repository-wide open-source license for TokenMaker’s original application code is currently declared.
