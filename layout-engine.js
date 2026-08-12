(function attachTokenMakerLayout(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.TokenMakerLayout = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function makeLayoutEngine() {
  "use strict";

  const SQRT3 = Math.sqrt(3);
  const PAPER_SIZES = Object.freeze({
    letter: Object.freeze({ width: 8.5, height: 11, label: "US Letter" }),
    a4: Object.freeze({ width: 210 / 25.4, height: 297 / 25.4, label: "A4" }),
  });

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function getPaperDimensions(paperSize = "letter", orientation = "portrait") {
    const base = PAPER_SIZES[paperSize] || PAPER_SIZES.letter;
    return orientation === "landscape"
      ? { width: base.height, height: base.width }
      : { width: base.width, height: base.height };
  }

  function tokenBoundsForSize(shape, size, orientation = "flat-top") {
    if (shape === "triangle") {
      return { width: size, height: size * SQRT3 / 2 };
    }
    if (shape === "hexagon") {
      if (orientation === "pointy-top") {
        return { width: size * SQRT3 / 2, height: size };
      }
      return { width: size, height: size * SQRT3 / 2 };
    }
    if (shape === "octagon") {
      return { width: size, height: size };
    }
    return { width: size, height: size };
  }

  function getTokenBounds(shape, sizeIn, orientation = "flat-top") {
    return tokenBoundsForSize(shape, clamp(sizeIn, 0.5, 3), orientation);
  }

  function getPrintedTokenBounds(shape, sizeIn, bleedIn = 0, orientation = "flat-top") {
    const finishedSize = clamp(sizeIn, 0.5, 3);
    const bleed = clamp(bleedIn, 0, 0.25);
    return tokenBoundsForSize(shape, finishedSize + bleed * 2, orientation);
  }

  function rectSlots(config, usable) {
    const { width, height } = getPrintedTokenBounds(config.shape, config.sizeIn, config.bleedIn);
    const pitchX = width + config.gutterIn;
    const pitchY = height + config.gutterIn;
    const cols = Math.max(0, Math.floor((usable.width + config.gutterIn + 1e-8) / pitchX));
    const rows = Math.max(0, Math.floor((usable.height + config.gutterIn + 1e-8) / pitchY));
    const usedW = cols ? cols * width + Math.max(0, cols - 1) * config.gutterIn : 0;
    const usedH = rows ? rows * height + Math.max(0, rows - 1) * config.gutterIn : 0;
    const startX = usable.x + Math.max(0, (usable.width - usedW) / 2);
    const startY = usable.y + Math.max(0, (usable.height - usedH) / 2);
    const slots = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        slots.push({
          x: startX + col * pitchX,
          y: startY + row * pitchY,
          width,
          height,
          rotation: 0,
          row,
          col,
        });
      }
    }
    return slots;
  }

  function triangleSlots(config, usable) {
    const bounds = getPrintedTokenBounds("triangle", config.sizeIn, config.bleedIn);
    const gap = config.gutterIn;
    const pitchX = bounds.width / 2 + gap * SQRT3 / 2;
    const pitchY = bounds.height + gap;
    const cols = Math.max(0, Math.floor((usable.width - bounds.width + 1e-8) / pitchX) + 1);
    const rows = Math.max(0, Math.floor((usable.height + gap + 1e-8) / pitchY));
    const usedW = cols ? bounds.width + (cols - 1) * pitchX : 0;
    const usedH = rows ? rows * bounds.height + Math.max(0, rows - 1) * gap : 0;
    const startX = usable.x + Math.max(0, (usable.width - usedW) / 2);
    const startY = usable.y + Math.max(0, (usable.height - usedH) / 2);
    const slots = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        slots.push({
          x: startX + col * pitchX,
          y: startY + row * pitchY,
          width: bounds.width,
          height: bounds.height,
          rotation: col % 2 ? 180 : 0,
          row,
          col,
        });
      }
    }
    return slots;
  }

  function hexSlots(config, usable, pageHeight, orientation = "flat-top") {
    if (orientation === "pointy-top") return [];
    const bounds = getPrintedTokenBounds("hexagon", config.sizeIn, config.bleedIn, orientation);
    const gap = config.gutterIn;
    const pitchX = bounds.width + gap;
    const pitchY = bounds.height + gap;
    const baseCols = Math.max(0, Math.floor((usable.width + gap + 1e-8) / pitchX));
    const rows = Math.max(0, Math.floor((usable.height + gap + 1e-8) / pitchY));
    const slots = [];

    if (!baseCols || !rows) return slots;

    const baseUsedW = baseCols * bounds.width + Math.max(0, baseCols - 1) * gap;
    const baseStartX = usable.x + Math.max(0, (usable.width - baseUsedW) / 2);
    const shiftedStartX = baseStartX + pitchX / 2;
    const usableRight = usable.x + usable.width;
    const shiftedCols = Math.max(
      0,
      Math.floor((usableRight - shiftedStartX - bounds.width + 1e-8) / pitchX) + 1,
    );
    const usedH = rows * bounds.height + Math.max(0, rows - 1) * gap;
    const centeredOnPage = (pageHeight - usedH) / 2;
    const minStartY = usable.y;
    const maxStartY = usable.y + usable.height - usedH;
    const startY = Math.min(maxStartY, Math.max(minStartY, centeredOnPage));

    for (let row = 0; row < rows; row += 1) {
      const shifted = row % 2 === 0;
      const cols = shifted ? shiftedCols : baseCols;
      const rowStartX = shifted ? shiftedStartX : baseStartX;
      for (let col = 0; col < cols; col += 1) {
        slots.push({
          x: rowStartX + col * pitchX,
          y: startY + row * pitchY,
          width: bounds.width,
          height: bounds.height,
          rotation: 0,
          row,
          col,
        });
      }
    }

    return slots;
  }

  function hexGridSlots(config, usable, orientation = "flat-top") {
    const bounds = getPrintedTokenBounds("hexagon", config.sizeIn, config.bleedIn, orientation);
    const gap = config.gutterIn;
    const pitchX = bounds.width + gap;
    const pitchY = bounds.height + gap;
    const cols = Math.max(0, Math.floor((usable.width + gap + 1e-8) / pitchX));
    const rows = Math.max(0, Math.floor((usable.height + gap + 1e-8) / pitchY));
    const usedW = cols ? cols * bounds.width + Math.max(0, cols - 1) * gap : 0;
    const usedH = rows ? rows * bounds.height + Math.max(0, rows - 1) * gap : 0;
    const startX = usable.x + Math.max(0, (usable.width - usedW) / 2);
    const startY = usable.y + Math.max(0, (usable.height - usedH) / 2);
    const slots = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        slots.push({
          x: startX + col * pitchX,
          y: startY + row * pitchY,
          width: bounds.width,
          height: bounds.height,
          rotation: 0,
          row,
          col,
        });
      }
    }

    return slots;
  }

  function calculateSheetLayout(options = {}) {
    const paper = getPaperDimensions(options.paperSize, options.orientation);
    const marginIn = clamp(options.marginIn ?? 0.25, 0, 1);
    const footerIn = clamp(options.footerIn ?? 0.28, 0, 0.75);
    const config = {
      shape: ["circle", "square", "hexagon", "octagon", "triangle"].includes(options.shape)
        ? options.shape
        : "circle",
      sizeIn: clamp(options.sizeIn ?? 1, 0.5, 3),
      gutterIn: clamp(options.gutterIn ?? 0.3, 0, 1),
      bleedIn: clamp(options.bleedIn ?? 0, 0, 0.25),
    };
    const usable = {
      x: marginIn,
      y: marginIn,
      width: Math.max(0, paper.width - marginIn * 2),
      height: Math.max(0, paper.height - marginIn * 2 - footerIn),
    };

    let slots;
    if (config.shape === "hexagon") {
      const layoutMode = options.layoutMode || "straight-cut";
      const hexOrientation = options.hexOrientation || "flat-top";
      slots = layoutMode === "straight-cut" ? hexSlots(config, usable, paper.height, hexOrientation) : hexGridSlots(config, usable, hexOrientation);
    }
    else if (config.shape === "triangle") slots = triangleSlots(config, usable);
    else slots = rectSlots(config, usable);

    return {
      paper,
      usable,
      slots,
      capacity: slots.length,
      config,
      marginIn,
      footerIn,
    };
  }

  function paginatePlacements(designIds, layout) {
    const capacity = layout.capacity;
    if (!capacity) return [];
    const pages = [];
    for (let index = 0; index < designIds.length; index += capacity) {
      pages.push(
        designIds.slice(index, index + capacity).map((designId, slotIndex) => ({
          designId,
          slotIndex,
          ...layout.slots[slotIndex],
        })),
      );
    }
    return pages;
  }

  function buildPrintablePages(contentPages, paper, includeMirroredBacks = false) {
    const printablePages = [];
    contentPages.forEach((placements, sheetIndex) => {
      printablePages.push({
        side: "front",
        sheetIndex,
        placements,
      });
      if (includeMirroredBacks) {
        printablePages.push({
          side: "back",
          sheetIndex,
          placements: placements.map((placement) => ({
            ...placement,
            x: paper.width - placement.x - placement.width,
          })),
        });
      }
    });
    return printablePages;
  }

  function getCutGuideSlots(layout) {
    const finished = getTokenBounds(layout.config.shape, layout.config.sizeIn);
    return layout.slots.map((slot) => ({
      ...slot,
      x: slot.x + (slot.width - finished.width) / 2,
      y: slot.y + (slot.height - finished.height) / 2,
      width: finished.width,
      height: finished.height,
    }));
  }

  function uniqueCoordinates(values) {
    return [...new Set(values.map((value) => Number(value.toFixed(6))))].sort((a, b) => a - b);
  }

  function getSheetGuideSegments(placements, layout, style) {
    if (!placements.length) return [];
    if (style === "combined") {
      return [
        ...getSheetGuideSegments(placements, layout, "perimeter"),
        ...getSheetGuideSegments(placements, layout, "crosshairs"),
      ];
    }
    if (!["perimeter", "crosshairs"].includes(style)) return [];
    const segments = [];

    if (style === "crosshairs") {
      const length = 0.075;
      for (const placement of placements) {
        const corners = [
          [placement.x, placement.y],
          [placement.x + placement.width, placement.y],
          [placement.x + placement.width, placement.y + placement.height],
          [placement.x, placement.y + placement.height],
        ];
        for (const [x, y] of corners) {
          segments.push({ x1: x - length, y1: y, x2: x + length, y2: y });
          segments.push({ x1: x, y1: y - length, x2: x, y2: y + length });
        }
      }
      return segments;
    }

    const left = Math.min(...placements.map((placement) => placement.x));
    const right = Math.max(...placements.map((placement) => placement.x + placement.width));
    const top = Math.min(...placements.map((placement) => placement.y));
    const bottom = Math.max(...placements.map((placement) => placement.y + placement.height));
    const xEdges = uniqueCoordinates(
      placements.flatMap((placement) => [placement.x, placement.x + placement.width]),
    );
    const yEdges = uniqueCoordinates(
      placements.flatMap((placement) => [placement.y, placement.y + placement.height]),
    );
    const safetyGap = 0.125;
    const footerTop = layout.paper.height - layout.footerIn;

    for (const y of yEdges) {
      if (left > safetyGap) segments.push({ x1: 0, y1: y, x2: left - safetyGap, y2: y });
      if (right + safetyGap < layout.paper.width) {
        segments.push({ x1: right + safetyGap, y1: y, x2: layout.paper.width, y2: y });
      }
    }
    for (const x of xEdges) {
      if (top > safetyGap) segments.push({ x1: x, y1: 0, x2: x, y2: top - safetyGap });
      if (bottom + safetyGap < footerTop) {
        segments.push({ x1: x, y1: bottom + safetyGap, x2: x, y2: footerTop });
      }
    }
    return segments;
  }

  function inchesToUnit(inches, unit) {
    return unit === "mm" ? inches * 25.4 : inches;
  }

  function unitToInches(value, unit) {
    return unit === "mm" ? Number(value) / 25.4 : Number(value);
  }

  return Object.freeze({
    PAPER_SIZES,
    buildPrintablePages,
    calculateSheetLayout,
    getCutGuideSlots,
    getPrintedTokenBounds,
    getSheetGuideSegments,
    getPaperDimensions,
    getTokenBounds,
    inchesToUnit,
    paginatePlacements,
    unitToInches,
  });
});
