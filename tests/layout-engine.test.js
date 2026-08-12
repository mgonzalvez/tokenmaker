const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildPrintablePages,
  calculateSheetLayout,
  getCutGuideSlots,
  getPaperDimensions,
  getPrintedTokenBounds,
  getSheetGuideSegments,
  getTokenBounds,
  inchesToUnit,
  paginatePlacements,
  unitToInches,
} = require("../layout-engine.js");

test("paper dimensions rotate without changing physical size", () => {
  assert.deepEqual(getPaperDimensions("letter", "portrait"), { width: 8.5, height: 11 });
  assert.deepEqual(getPaperDimensions("letter", "landscape"), { width: 11, height: 8.5 });
});

test("unit conversion round-trips", () => {
  assert.equal(inchesToUnit(1, "mm"), 25.4);
  assert.equal(unitToInches(25.4, "mm"), 1);
  assert.equal(unitToInches(inchesToUnit(2.375, "mm"), "mm"), 2.375);
});

test("token sizes are clamped to the supported range", () => {
  assert.equal(getTokenBounds("circle", 0.1).width, 0.5);
  assert.equal(getTokenBounds("square", 8).width, 3);
});

test("bleed expands printed artwork without changing the finished cut size", () => {
  assert.equal(getTokenBounds("circle", 1).width, 1);
  assert.equal(getPrintedTokenBounds("circle", 1, 0.1).width, 1.2);
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "circle",
    sizeIn: 1,
    bleedIn: 0.1,
    gutterIn: 0.3,
    marginIn: 0.25,
    footerIn: 0.28,
  });
  assert.equal(layout.capacity, 35);
  const firstPrinted = layout.slots[0];
  const firstCut = getCutGuideSlots(layout)[0];
  assert.equal(Number((firstCut.x - firstPrinted.x).toFixed(6)), 0.1);
  assert.equal(Number((firstCut.y - firstPrinted.y).toFixed(6)), 0.1);
  assert.equal(firstCut.width, 1);
  assert.equal(firstCut.height, 1);
});

test("one-inch circles fit on letter paper with margins and footer", () => {
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "circle",
    sizeIn: 1,
    gutterIn: 0.125,
    marginIn: 0.25,
    footerIn: 0.28,
  });
  assert.ok(layout.capacity > 50);
  for (const slot of layout.slots) {
    assert.ok(slot.x >= layout.usable.x - 1e-8);
    assert.ok(slot.y >= layout.usable.y - 1e-8);
    assert.ok(slot.x + slot.width <= layout.usable.x + layout.usable.width + 1e-8);
    assert.ok(slot.y + slot.height <= layout.usable.y + layout.usable.height + 1e-8);
  }
});

test("default sheet gutter is 0.3 inches", () => {
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "circle",
    sizeIn: 1,
  });
  assert.equal(layout.config.gutterIn, 0.3);
});

test("circle capacity uses edge-to-edge gutter spacing", () => {
  const touching = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "circle",
    sizeIn: 1,
    gutterIn: 0,
    marginIn: 0.5,
    footerIn: 0,
  });
  const spaced = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "circle",
    sizeIn: 1,
    gutterIn: 0.3,
    marginIn: 0.5,
    footerIn: 0,
  });
  assert.equal(touching.capacity, 70);
  assert.equal(spaced.capacity, 42);
});

test("one-inch circle sheets use maximum fit while reserving the attribution footer", () => {
  for (const paperSize of ["letter", "a4"]) {
    const layout = calculateSheetLayout({
      paperSize,
      orientation: "portrait",
      shape: "circle",
      sizeIn: 1,
      gutterIn: 0.3,
      marginIn: 0.25,
      footerIn: 0.28,
    });
    assert.equal(layout.capacity, 48);
  }

  const withoutFooter = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "circle",
    sizeIn: 1,
    gutterIn: 0,
    marginIn: 0.5,
    footerIn: 0,
  });
  const withFooter = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "circle",
    sizeIn: 1,
    gutterIn: 0,
    marginIn: 0.5,
    footerIn: 0.28,
  });
  assert.equal(withoutFooter.capacity, 70);
  assert.equal(withFooter.capacity, 63);
});

test("duplex pages mirror positions horizontally without mirroring token artwork", () => {
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "circle",
    sizeIn: 1,
    gutterIn: 0.3,
    marginIn: 0.5,
    footerIn: 0.28,
  });
  const contentPages = paginatePlacements(["a", "b"], layout);
  const printablePages = buildPrintablePages(contentPages, layout.paper, true);
  assert.equal(printablePages.length, 2);
  assert.equal(printablePages[0].side, "front");
  assert.equal(printablePages[1].side, "back");
  assert.equal(printablePages[1].placements[0].designId, "a");
  assert.equal(
    Number(printablePages[1].placements[0].x.toFixed(6)),
    Number((layout.paper.width - printablePages[0].placements[0].x - 1).toFixed(6)),
  );
  assert.equal(printablePages[1].placements[0].rotation, printablePages[0].placements[0].rotation);
});

test("perimeter, internal crosshair, and combined guide treatments produce page-level marks", () => {
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "circle",
    sizeIn: 1,
    gutterIn: 0.3,
    marginIn: 0.5,
    footerIn: 0.28,
  });
  const placements = paginatePlacements(["a", "b"], layout)[0];
  const perimeter = getSheetGuideSegments(placements, layout, "perimeter");
  const crosshairs = getSheetGuideSegments(placements, layout, "crosshairs");
  const combined = getSheetGuideSegments(placements, layout, "combined");
  assert.ok(perimeter.some((segment) => segment.x1 === 0));
  assert.ok(perimeter.every((segment) => segment.y2 <= layout.paper.height - layout.footerIn));
  assert.equal(crosshairs.length, placements.length * 8);
  assert.equal(combined.length, perimeter.length + crosshairs.length);
});

test("zero-gutter hexagons use the supplied straight-cut row lattice", () => {
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "landscape",
    shape: "hexagon",
    sizeIn: 1.5,
    gutterIn: 0,
    marginIn: 0,
    footerIn: 0,
  });
  const firstShifted = layout.slots.find((slot) => slot.row === 0 && slot.col === 0);
  const firstBase = layout.slots.find((slot) => slot.row === 1 && slot.col === 0);
  const nextShifted = layout.slots.find((slot) => slot.row === 2 && slot.col === 0);
  assert.ok(firstShifted);
  assert.ok(firstBase);
  assert.ok(nextShifted);
  assert.equal(Number((firstShifted.x - firstBase.x).toFixed(6)), 0.75);
  assert.equal(
    Number((firstBase.y - firstShifted.y).toFixed(6)),
    Number((1.5 * Math.sqrt(3) / 2).toFixed(6)),
  );
  assert.equal(Number(nextShifted.x.toFixed(6)), Number(firstShifted.x.toFixed(6)));
  assert.equal(
    Number((nextShifted.y - firstBase.y).toFixed(6)),
    Number((1.5 * Math.sqrt(3) / 2).toFixed(6)),
  );
});

test("the supplied 1.5-inch Letter template pattern yields alternating 6/7 rows", () => {
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "landscape",
    shape: "hexagon",
    sizeIn: 1.5,
    gutterIn: 0,
    marginIn: 0.25,
    footerIn: 0.28,
    layoutMode: "straight-cut",
  });
  const rowCounts = [];
  for (const slot of layout.slots) rowCounts[slot.row] = (rowCounts[slot.row] || 0) + 1;
  assert.deepEqual(rowCounts, [6, 7, 6, 7, 6]);
  assert.equal(layout.capacity, 32);
});

test("hex grid layout uses rectangular grid with user-controlled gutter", () => {
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "hexagon",
    sizeIn: 1,
    gutterIn: 0.3,
    marginIn: 0.25,
    footerIn: 0.28,
    layoutMode: "grid",
  });
  assert.ok(layout.capacity > 0);
  for (const slot of layout.slots) {
    assert.ok(slot.x >= layout.usable.x - 1e-8);
    assert.ok(slot.y >= layout.usable.y - 1e-8);
    assert.ok(slot.x + slot.width <= layout.usable.x + layout.usable.width + 1e-8);
    assert.ok(slot.y + slot.height <= layout.usable.y + layout.usable.height + 1e-8);
  }
  const rowGroups = {};
  for (const slot of layout.slots) {
    const row = slot.row;
    if (!rowGroups[row]) rowGroups[row] = [];
    rowGroups[row].push(slot);
  }
  const rows = Object.keys(rowGroups).map(Number).sort((a, b) => a - b);
  for (const row of rows) {
    const rowSlots = rowGroups[row];
    for (let i = 1; i < rowSlots.length; i++) {
      assert.equal(Number(rowSlots[i].y.toFixed(6)), Number(rowSlots[i - 1].y.toFixed(6)));
    }
  }
});

test("pagination preserves order and assigns valid slots", () => {
  const layout = calculateSheetLayout({
    shape: "square",
    sizeIn: 3,
    paperSize: "letter",
    orientation: "portrait",
  });
  const ids = Array.from({ length: layout.capacity + 2 }, (_, index) => `d${index}`);
  const pages = paginatePlacements(ids, layout);
  assert.equal(pages.length, 2);
  assert.equal(pages[0][0].designId, "d0");
  assert.equal(pages[1][1].designId, `d${layout.capacity + 1}`);
});

test("pointy-top hexagon bounds swap width and height", () => {
  const flat = getTokenBounds("hexagon", 1, "flat-top");
  const pointy = getTokenBounds("hexagon", 1, "pointy-top");
  assert.equal(flat.width, 1);
  assert.equal(flat.height, Math.sqrt(3) / 2);
  assert.equal(pointy.width, Math.sqrt(3) / 2);
  assert.equal(pointy.height, 1);
  const printed = getPrintedTokenBounds("hexagon", 1, 0.1, "pointy-top");
  assert.equal(printed.height, 1.2);
  assert.equal(printed.width, 1.2 * Math.sqrt(3) / 2);
});

test("pointy-top hexagon straight-cut returns empty layout", () => {
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "landscape",
    shape: "hexagon",
    sizeIn: 1.5,
    gutterIn: 0,
    marginIn: 0,
    footerIn: 0,
    layoutMode: "straight-cut",
    orientation: "pointy-top",
  });
  assert.equal(layout.capacity, 0);
  assert.equal(layout.slots.length, 0);
});

test("pointy-top hexagon grid layout fits tokens correctly", () => {
  const layout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "hexagon",
    sizeIn: 1,
    gutterIn: 0.3,
    marginIn: 0.25,
    footerIn: 0.28,
    layoutMode: "grid",
    orientation: "pointy-top",
  });
  assert.ok(layout.capacity > 0);
  const pointyBounds = getTokenBounds("hexagon", 1, "pointy-top");
  for (const slot of layout.slots) {
    assert.equal(Number(slot.width.toFixed(6)), Number(pointyBounds.width.toFixed(6)));
    assert.equal(Number(slot.height.toFixed(6)), Number(pointyBounds.height.toFixed(6)));
    assert.ok(slot.x >= layout.usable.x - 1e-8);
    assert.ok(slot.y >= layout.usable.y - 1e-8);
    assert.ok(slot.x + slot.width <= layout.usable.x + layout.usable.width + 1e-8);
    assert.ok(slot.y + slot.height <= layout.usable.y + layout.usable.height + 1e-8);
  }
});

test("pointy-top hexagon grid capacity differs from flat-top on same paper", () => {
  const flatLayout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "hexagon",
    sizeIn: 1,
    gutterIn: 0.3,
    marginIn: 0.25,
    footerIn: 0.28,
    layoutMode: "grid",
    orientation: "flat-top",
  });
  const pointyLayout = calculateSheetLayout({
    paperSize: "letter",
    orientation: "portrait",
    shape: "hexagon",
    sizeIn: 1,
    gutterIn: 0.3,
    marginIn: 0.25,
    footerIn: 0.28,
    layoutMode: "grid",
    orientation: "pointy-top",
  });
  assert.ok(flatLayout.capacity > 0);
  assert.ok(pointyLayout.capacity > 0);
  assert.notEqual(flatLayout.capacity, pointyLayout.capacity);
});

test("all supported layout combinations stay inside the printable area", () => {
  for (const paperSize of ["letter", "a4"]) {
    for (const paperOrientation of ["portrait", "landscape"]) {
      for (const shape of ["circle", "square", "hexagon", "octagon", "triangle"]) {
        for (const sizeIn of [0.5, 1, 1.75, 3]) {
          for (const gutterIn of [0, 0.125, 0.4]) {
            for (const bleedIn of [0, 0.1]) {
              const orientations = shape === "hexagon" ? ["flat-top", "pointy-top"] : [undefined];
              for (const orientation of orientations) {
                const layoutModes = shape === "hexagon" ? ["straight-cut", "grid"] : [undefined];
                for (const layoutMode of layoutModes) {
                  const layout = calculateSheetLayout({
                    paperSize,
                    orientation: paperOrientation,
                    shape,
                    sizeIn,
                    gutterIn,
                    bleedIn,
                    marginIn: 0.25,
                    footerIn: 0.28,
                    orientation,
                    layoutMode,
                  });
                  if (orientation === "pointy-top" && layoutMode === "straight-cut") {
                    assert.equal(layout.capacity, 0);
                    continue;
                  }
                  assert.ok(layout.capacity > 0, `${paperSize} ${paperOrientation} ${shape} ${sizeIn} ${orientation ?? "flat-top"} ${layoutMode ?? "grid"}`);
                  for (const slot of layout.slots) {
                    assert.ok(slot.x >= layout.usable.x - 1e-8);
                    assert.ok(slot.y >= layout.usable.y - 1e-8);
                    assert.ok(slot.x + slot.width <= layout.usable.x + layout.usable.width + 1e-8);
                    assert.ok(slot.y + slot.height <= layout.usable.y + layout.usable.height + 1e-8);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});
