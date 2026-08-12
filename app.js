(() => {
  "use strict";

  const APP_VERSION = 1;
  const EXPORT_DPI = 300;
  const TUTORIAL_STORAGE_KEY = "tokenmaker-tutorial-seen-v1";
  const icons = Array.isArray(window.TOKENMAKER_ICONS) ? window.TOKENMAKER_ICONS : [];
  const layoutApi = window.TokenMakerLayout;
  const assetCache = new Map();
  let renderCounter = 0;
  let previewRenderToken = 0;
  let sheetRenderToken = 0;
  let designStripRenderToken = 0;
  let mixRenderToken = 0;
  let activeCategory = "All";
  let dragState = null;
  let draggedPlacementIndex = null;
  let tutorialPositionTimer = null;
  const tutorialState = {
    active: false,
    index: 0,
    startWorkspace: "designer",
    target: null,
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const els = {
    saveStatus: $("#save-status"),
    saveProjectBtn: $("#save-project-btn"),
    loadProjectBtn: $("#load-project-btn"),
    loadProjectInput: $("#load-project-input"),
    licenseBtn: $("#license-btn"),
    licenseDialog: $("#license-dialog"),
    licenseCloseBtn: $("#license-close-btn"),
    tutorialBtn: $("#tutorial-btn"),
    themeBtn: $("#theme-btn"),
    relatedBtn: $("#related-btn"),
    relatedMenu: $("#related-menu"),
    designerTab: $("#designer-tab"),
    sheetTab: $("#sheet-tab"),
    sheetTabCount: $("#sheet-tab-count"),
    designerWorkspace: $("#designer-workspace"),
    sheetWorkspace: $("#sheet-workspace"),
    iconSearch: $("#icon-search"),
    categoryChips: $("#category-chips"),
    iconGrid: $("#icon-grid"),
    iconCount: $("#icon-count"),
    noIconResults: $("#no-icon-results"),
    uploadArtBtn: $("#upload-art-btn"),
    uploadArtInput: $("#upload-art-input"),
    designName: $("#design-name"),
    dimensions: $("#draft-dimensions"),
    resetDraftBtn: $("#reset-draft-btn"),
    tokenPreviewWrap: $("#token-preview-wrap"),
    tokenPreview: $("#token-preview"),
    addDesignBtn: $("#add-design-btn"),
    newDesignBtn: $("#new-design-btn"),
    exportImageBtn: $("#export-image-btn"),
    exportImageMenu: $("#export-image-menu"),
    designCount: $("#design-count"),
    openSheetBuilderBtn: $("#open-sheet-builder-btn"),
    designStrip: $("#design-strip"),
    designEmpty: $("#design-empty"),
    sizeRange: $("#size-range"),
    sizeNumber: $("#size-number"),
    sizeUnitLabel: $("#size-unit-label"),
    sizeMinLabel: $("#size-min-label"),
    sizeMaxLabel: $("#size-max-label"),
    tokenFill: $("#token-fill"),
    tokenFillText: $("#token-fill-text"),
    tokenStroke: $("#token-stroke"),
    tokenStrokeText: $("#token-stroke-text"),
    transparentFill: $("#transparent-fill"),
    tokenStrokeWidth: $("#token-stroke-width"),
    tokenStrokeOutput: $("#token-stroke-output"),
    selectedIconThumb: $("#selected-icon-thumb"),
    selectedIconName: $("#selected-icon-name"),
    selectedIconSource: $("#selected-icon-source"),
    centerIconBtn: $("#center-icon-btn"),
    resetIconValuesBtn: $("#reset-icon-values-btn"),
    iconFill: $("#icon-fill"),
    iconFillText: $("#icon-fill-text"),
    iconStroke: $("#icon-stroke"),
    iconStrokeText: $("#icon-stroke-text"),
    iconScale: $("#icon-scale"),
    iconScaleOutput: $("#icon-scale-output"),
    iconRotation: $("#icon-rotation"),
    iconRotationOutput: $("#icon-rotation-output"),
    iconStrokeWidth: $("#icon-stroke-width"),
    iconStrokeOutput: $("#icon-stroke-output"),
    valueText: $("#value-text"),
    clearValueBtn: $("#clear-value-btn"),
    valueMode: $("#value-mode"),
    valueFont: $("#value-font"),
    valueWeight: $("#value-weight"),
    valueSize: $("#value-size"),
    valueSizeOutput: $("#value-size-output"),
    valueFill: $("#value-fill"),
    valueFillText: $("#value-fill-text"),
    valueStroke: $("#value-stroke"),
    valueStrokeText: $("#value-stroke-text"),
    valueStrokeWidth: $("#value-stroke-width"),
    valueStrokeOutput: $("#value-stroke-output"),
    resetFontValuesBtn: $("#reset-font-values-btn"),
    sheetSpecSelect: $("#sheet-spec-select"),
    paperSize: $("#paper-size"),
    paperOrientation: $("#paper-orientation"),
    orientationHelp: $("#orientation-help"),
    sheetGutter: $("#sheet-gutter"),
    sheetMargin: $("#sheet-margin"),
    addBleed: $("#add-bleed"),
    bleedHelp: $("#bleed-help"),
    touchingLayout: $("#touching-layout"),
    touchingHelp: $("#touching-help"),
    guideStyle: $("#guide-style"),
    guideHelp: $("#guide-help"),
    hexLayoutToggleRow: $("#hex-layout-toggle-row"),
    hexLayoutToggle: $("#hex-layout-toggle"),
    hexOrientationRow: $("#hex-orientation-row"),
    hexOrientationRowDesign: $("#hex-orientation-row-design"),
    hexOrientationToggle: $("#hex-orientation-toggle"),
    hexOrientationToggleDesign: $("#hex-orientation-toggle-design"),
    duplexBacks: $("#duplex-backs"),
    capacityNumber: $("#capacity-number"),
    sheetSummaryCopy: $("#sheet-summary-copy"),
    pageHeading: $("#page-heading"),
    prevPageBtn: $("#prev-page-btn"),
    nextPageBtn: $("#next-page-btn"),
    sheetQuickAdd: $("#sheet-quick-add"),
    quickAddNote: $("#quick-add-note"),
    quickAddList: $("#quick-add-list"),
    paperPreview: $("#paper-preview"),
    paperTokens: $("#paper-tokens"),
    paperGuides: $("#paper-guides"),
    emptySheetState: $("#empty-sheet-state"),
    exportPdfBtn: $("#export-pdf-btn"),
    clearSheetBtn: $("#clear-sheet-btn"),
    exportStatus: $("#export-status"),
    placedCount: $("#placed-count"),
    mixList: $("#mix-list"),
    mixEmpty: $("#mix-empty"),
    fillDesignSelect: $("#fill-design-select"),
    fillPageBtn: $("#fill-page-btn"),
    returnDesignerBtn: $("#return-designer-btn"),
    tutorialLayer: $("#tutorial-layer"),
    tutorialSpotlight: $("#tutorial-spotlight"),
    tutorialCallout: $("#tutorial-callout"),
    tutorialProgress: $("#tutorial-progress"),
    tutorialTitle: $("#tutorial-title"),
    tutorialCopy: $("#tutorial-copy"),
    tutorialSkipBtn: $("#tutorial-skip-btn"),
    tutorialBackBtn: $("#tutorial-back-btn"),
    tutorialNextBtn: $("#tutorial-next-btn"),
    toastRegion: $("#toast-region"),
  };

  const tutorialSteps = [
    {
      target: ".workflow-tabs",
      workspace: "designer",
      title: "Two simple stages",
      copy: "Start in Design tokens to create reusable token designs. Then move to Build sheet to choose quantities, page settings, and export a printable PDF.",
    },
    {
      target: "#license-btn",
      workspace: "designer",
      title: "Icons are free to use",
      copy: "The included Fractal Symbols are licensed under CC BY 4.0. You may share, modify, and use them in commercial or noncommercial projects when you provide attribution. This button keeps the license details and suggested credit easy to find.",
    },
    {
      target: ".library-panel",
      workspace: "designer",
      title: "Choose your artwork",
      copy: "Search the open icon library, browse its categories, or upload your own SVG, PNG, or JPG. Selecting an icon updates the token immediately.",
    },
    {
      target: ".inspector-panel",
      workspace: "designer",
      title: "Set the shape and style",
      copy: "Choose Circle, Square, or Hex, set the finished physical size, then adjust background, border, icon colors, scale, and rotation. You can also add a numeric value.",
    },
    {
      target: "#token-preview-wrap",
      workspace: "designer",
      title: "Watch the live preview",
      copy: "Every change appears here. Use the icon/value selector below the preview, then drag directly on the token to position that element.",
    },
    {
      target: "#add-design-btn",
      workspace: "designer",
      title: "Save the token design",
      copy: "Give the token a useful name and select Add to project. You can save several designs, as long as a printable sheet uses one common shape and finished size.",
    },
    {
      target: ".project-strip",
      workspace: "designer",
      title: "Continue to Sheet Builder",
      copy: "Saved designs appear here. As soon as one exists, the prominent Build printable sheet button appears and takes you to the next stage.",
    },
    {
      target: ".sheet-settings-panel",
      workspace: "sheet",
      title: "Prepare the printable page",
      copy: "Choose Letter or A4, margins, gutter, optional bleed, cutting guides, and mirrored duplex backs. Capacity updates automatically using maximum-fit calculations.",
    },
    {
      target: ".mix-panel",
      workspace: "sheet",
      title: "Mix designs and quantities",
      copy: "Add as many copies of each compatible design as you need. Different designs can share a sheet when their token shape and finished size match.",
    },
    {
      target: "#export-pdf-btn",
      workspace: "sheet",
      title: "Export and print",
      copy: "Review each page, then export the print-ready PDF. The attribution footer and selected cutting guides are included automatically.",
    },
  ];

  const defaultHeart =
    icons.find((icon) => icon.category === "Combat" && icon.name === "Heart") ||
    icons[0] ||
    null;

  function makeLibraryIcon(icon = defaultHeart) {
    if (!icon) return null;
    return {
      kind: "library",
      id: icon.id,
      name: icon.name,
      category: icon.category,
      path: icon.path,
      thumbnail: icon.thumbnail,
      attribution: icon.attribution,
      mime: "image/svg+xml",
    };
  }

  function defaultDraft() {
    return {
      id: null,
      name: "Heart token",
      shape: "circle",
      sizeIn: 1,
      tokenFill: "#f7c948",
      tokenFillTransparent: false,
      tokenStroke: "#17223b",
      tokenStrokeWidth: 4,
      icon: makeLibraryIcon(),
      iconFill: "#17223b",
      iconStroke: "#17223b",
      iconStrokeWidth: 0,
      iconScale: 100,
      iconRotation: 0,
      iconX: 0,
      iconY: 0,
      value: "5",
      valuePlacement: "center",
      valueMode: "overlay",
      valueFont: "Arial, sans-serif",
      valueWeight: "700",
      valueSize: 180,
      valueFill: "#ffffff",
      valueStroke: "#17223b",
      valueStrokeWidth: 6,
      valueX: 0,
      valueY: 0,
    };
  }

  const state = {
    unit: "in",
    draft: defaultDraft(),
    designs: [],
    sheet: {
      specKey: "",
      paperSize: "letter",
      orientation: "portrait",
      gutterIn: 0.3,
      marginIn: 0.25,
      bleedIn: 0.1,
      guideStyle: "combined",
      includeBacks: false,
        currentPage: 0,
        placementsBySpec: {},
        hexOrientation: "flat-top",
      },
    dragTarget: "icon",
    dirty: false,
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uid(prefix = "item") {
    if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function escapeXml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function safeHex(value, fallback = "#000000") {
    const raw = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) {
      return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
    }
    return fallback;
  }

  function slugify(value) {
    return (
      String(value || "token")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "token"
    );
  }

  function formatNumber(value, decimals = 2) {
    return Number(value)
      .toFixed(decimals)
      .replace(/\.?0+$/, "");
  }

  function displayMeasurement(inches, decimals = 2) {
    const value = layoutApi.inchesToUnit(inches, state.unit);
    return `${formatNumber(value, state.unit === "mm" ? 1 : decimals)} ${state.unit}`;
  }

  function specKeyFor(design) {
    return `${design.shape}|${Number(design.sizeIn).toFixed(4)}`;
  }

  function parseSpecKey(key) {
    const [shape = "circle", rawSize = "1"] = String(key).split("|");
    return { shape, sizeIn: clamp(rawSize, 0.5, 3) };
  }

  function shapeLabel(shape) {
    return { circle: "Circle", square: "Square", hexagon: "Hexagon", octagon: "Octagon", triangle: "Triangle" }[shape] || "Circle";
  }

  function setDirty(isDirty = true) {
    state.dirty = isDirty;
    els.saveStatus.textContent = isDirty ? "Unsaved changes" : "Project saved";
    els.saveStatus.classList.toggle("dirty", isDirty);
  }

  function toast(message, type = "") {
    const node = document.createElement("div");
    node.className = `toast ${type}`.trim();
    node.textContent = message;
    els.toastRegion.append(node);
    setTimeout(() => node.remove(), 3300);
  }

  function closeMenus(except = null) {
    for (const [button, menu] of [
      [els.relatedBtn, els.relatedMenu],
      [els.exportImageBtn, els.exportImageMenu],
    ]) {
      if (menu !== except) {
        menu.hidden = true;
        button?.setAttribute("aria-expanded", "false");
      }
    }
  }

  function toggleMenu(button, menu) {
    const willOpen = menu.hidden;
    closeMenus(willOpen ? menu : null);
    menu.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
  }

  function setWorkspace(name) {
    const isDesigner = name === "designer";
    els.designerWorkspace.hidden = !isDesigner;
    els.sheetWorkspace.hidden = isDesigner;
    els.designerTab.classList.toggle("active", isDesigner);
    els.sheetTab.classList.toggle("active", !isDesigner);
    els.designerTab.setAttribute("aria-selected", String(isDesigner));
    els.sheetTab.setAttribute("aria-selected", String(!isDesigner));
    if (!isDesigner) refreshSheet();
  }

  function positionTutorialCallout() {
    if (!tutorialState.active || !tutorialState.target) return;
    const targetRect = tutorialState.target.getBoundingClientRect();
    const padding = 8;
    const viewportMargin = 12;
    const gap = 16;
    const spotlightLeft = Math.max(4, targetRect.left - padding);
    const spotlightTop = Math.max(4, targetRect.top - padding);
    const spotlightRight = Math.min(window.innerWidth - 4, targetRect.right + padding);
    const spotlightBottom = Math.min(window.innerHeight - 4, targetRect.bottom + padding);
    Object.assign(els.tutorialSpotlight.style, {
      left: `${spotlightLeft}px`,
      top: `${spotlightTop}px`,
      width: `${Math.max(0, spotlightRight - spotlightLeft)}px`,
      height: `${Math.max(0, spotlightBottom - spotlightTop)}px`,
    });

    const calloutRect = els.tutorialCallout.getBoundingClientRect();
    const candidates = [
      {
        placement: "right",
        left: targetRect.right + gap,
        top: targetRect.top + (targetRect.height - calloutRect.height) / 2,
        fits: targetRect.right + gap + calloutRect.width <= window.innerWidth - viewportMargin,
      },
      {
        placement: "left",
        left: targetRect.left - gap - calloutRect.width,
        top: targetRect.top + (targetRect.height - calloutRect.height) / 2,
        fits: targetRect.left - gap - calloutRect.width >= viewportMargin,
      },
      {
        placement: "bottom",
        left: targetRect.left + (targetRect.width - calloutRect.width) / 2,
        top: targetRect.bottom + gap,
        fits: targetRect.bottom + gap + calloutRect.height <= window.innerHeight - viewportMargin,
      },
      {
        placement: "top",
        left: targetRect.left + (targetRect.width - calloutRect.width) / 2,
        top: targetRect.top - gap - calloutRect.height,
        fits: targetRect.top - gap - calloutRect.height >= viewportMargin,
      },
    ];
    const position = candidates.find((candidate) => candidate.fits) || candidates[2];
    const left = clamp(
      position.left,
      viewportMargin,
      Math.max(viewportMargin, window.innerWidth - calloutRect.width - viewportMargin),
    );
    const top = clamp(
      position.top,
      viewportMargin,
      Math.max(viewportMargin, window.innerHeight - calloutRect.height - viewportMargin),
    );
    els.tutorialCallout.dataset.placement = position.placement;
    els.tutorialCallout.style.left = `${left}px`;
    els.tutorialCallout.style.top = `${top}px`;
  }

  function showTutorialStep() {
    if (!tutorialState.active) return;
    const step = tutorialSteps[tutorialState.index];
    setWorkspace(step.workspace);
    const target = $(step.target);
    if (!target) {
      endTutorial();
      return;
    }
    tutorialState.target = target;
    els.tutorialProgress.textContent = `Step ${tutorialState.index + 1} of ${tutorialSteps.length}`;
    els.tutorialTitle.textContent = step.title;
    els.tutorialCopy.textContent = step.copy;
    els.tutorialBackBtn.disabled = tutorialState.index === 0;
    els.tutorialNextBtn.textContent = tutorialState.index === tutorialSteps.length - 1 ? "Finish" : "Next";
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });
    clearTimeout(tutorialPositionTimer);
    requestAnimationFrame(positionTutorialCallout);
    tutorialPositionTimer = setTimeout(positionTutorialCallout, reduceMotion ? 0 : 260);
    els.tutorialNextBtn.focus({ preventScroll: true });
  }

  function startTutorial() {
    if (tutorialState.active) return;
    closeMenus();
    tutorialState.active = true;
    tutorialState.index = 0;
    tutorialState.startWorkspace = els.sheetWorkspace.hidden ? "designer" : "sheet";
    els.tutorialLayer.hidden = false;
    els.tutorialBtn.setAttribute("aria-pressed", "true");
    els.tutorialBtn.title = "Stop tutorial";
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
    } catch {}
    showTutorialStep();
  }

  function endTutorial() {
    if (!tutorialState.active) return;
    clearTimeout(tutorialPositionTimer);
    tutorialState.active = false;
    tutorialState.target = null;
    els.tutorialLayer.hidden = true;
    els.tutorialBtn.setAttribute("aria-pressed", "false");
    els.tutorialBtn.title = "Start tutorial";
    setWorkspace(tutorialState.startWorkspace);
    els.tutorialBtn.focus({ preventScroll: true });
  }

  function moveTutorial(delta) {
    if (!tutorialState.active) return;
    const nextIndex = tutorialState.index + delta;
    if (nextIndex >= tutorialSteps.length) {
      endTutorial();
      return;
    }
    tutorialState.index = clamp(nextIndex, 0, tutorialSteps.length - 1);
    showTutorialStep();
  }

  function launchFirstVisitTutorial() {
    let seen = false;
    try {
      seen = localStorage.getItem(TUTORIAL_STORAGE_KEY) === "1";
    } catch {}
    if (!seen) setTimeout(startTutorial, 500);
  }

  function shapeGeometry(shape, orientation = "flat-top") {
    const geometries = {
      circle: {
        element: '<circle class="token-shape" cx="500" cy="500" r="495"/>',
        path: "M500 5a495 495 0 1 1 0 990 495 495 0 1 1 0-990Z",
        points: [[500, 5], [995, 500], [500, 995], [5, 500]],
      },
      square: {
        element: '<rect class="token-shape" x="5" y="5" width="990" height="990" rx="4"/>',
        path: "M5 5H995V995H5Z",
        points: [[5, 5], [995, 5], [995, 995], [5, 995]],
      },
      hexagon: {
        element: orientation === "pointy-top"
          ? '<path class="token-shape" d="M500 0L933.0127 250V750L500 1000L66.9873 750V250Z"/>'
          : '<path class="token-shape" d="M0 500 250 66.9873h500L1000 500 750 933.0127H250Z"/>',
        path: orientation === "pointy-top"
          ? "M500 0L933.0127 250V750L500 1000L66.9873 750V250Z"
          : "M0 500 250 66.9873h500L1000 500 750 933.0127H250Z",
        points: orientation === "pointy-top"
          ? [[500, 0], [933.0127, 250], [933.0127, 750], [500, 1000], [66.9873, 750], [66.9873, 250]]
          : [[0, 500], [250, 66.9873], [750, 66.9873], [1000, 500], [750, 933.0127], [250, 933.0127]],
      },
      octagon: {
        element: '<path class="token-shape" d="M292.893 0H707.107L1000 292.893V707.107L707.107 1000H292.893L0 707.107V292.893Z"/>',
        path: "M292.893 0H707.107L1000 292.893V707.107L707.107 1000H292.893L0 707.107V292.893Z",
        points: [[292.893, 0], [707.107, 0], [1000, 292.893], [1000, 707.107], [707.107, 1000], [292.893, 1000], [0, 707.107], [0, 292.893]],
      },
      triangle: {
        element: '<path class="token-shape" d="M500 66.9873 1000 933.0127H0Z"/>',
        path: "M500 66.9873 1000 933.0127H0Z",
        points: [[500, 66.9873], [1000, 933.0127], [0, 933.0127]],
      },
    };
    return geometries[shape] || geometries.circle;
  }

  function normalizeSvgSource(sourceText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(sourceText, "image/svg+xml");
    const root = doc.documentElement;
    if (!root || root.nodeName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) {
      throw new Error("This SVG could not be read.");
    }

    const viewBox =
      root.getAttribute("viewBox") ||
      `0 0 ${parseFloat(root.getAttribute("width")) || 1000} ${parseFloat(root.getAttribute("height")) || 1000}`;
    const styleText = [...root.querySelectorAll("style")].map((node) => node.textContent || "").join(" ");
    const evenOddClasses = new Set(
      [...styleText.matchAll(/\.([a-zA-Z0-9_-]+)[^{]*\{[^}]*fill-rule\s*:\s*evenodd/gi)].map((match) => match[1]),
    );

    root.querySelectorAll("script, foreignObject, iframe, object, embed, style").forEach((node) => node.remove());
    const graphicSelector = "path, polygon, rect, circle, ellipse, line, polyline, text";

    root.querySelectorAll("*").forEach((node) => {
      for (const attribute of [...node.attributes]) {
        const name = attribute.name.toLowerCase();
        if (name.startsWith("on") || name === "style") node.removeAttribute(attribute.name);
        if ((name === "href" || name === "xlink:href") && !attribute.value.startsWith("#")) {
          node.removeAttribute(attribute.name);
        }
      }
    });

    root.querySelectorAll(graphicSelector).forEach((node) => {
      const classes = (node.getAttribute("class") || "").split(/\s+/);
      if (classes.some((name) => evenOddClasses.has(name))) node.setAttribute("fill-rule", "evenodd");
      node.removeAttribute("class");
      node.removeAttribute("fill");
      node.removeAttribute("stroke");
      node.removeAttribute("stroke-width");
      node.setAttribute("data-tm-graphic", "");
    });

    root.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    root.querySelectorAll("title, desc").forEach((node) => node.remove());
    const serializer = new XMLSerializer();
    const markup = [...root.childNodes].map((node) => serializer.serializeToString(node)).join("");
    return { viewBox, markup };
  }

  async function getVectorAsset(icon) {
    if (!icon || icon.kind === "raster") return null;
    const cacheKey = icon.kind === "library" ? icon.path : `upload:${icon.id}`;
    if (assetCache.has(cacheKey)) return assetCache.get(cacheKey);

    const promise = (async () => {
      const source =
        icon.kind === "library"
          ? await fetch(icon.path).then((response) => {
              if (!response.ok) throw new Error(`Could not load ${icon.name}.`);
              return response.text();
            })
          : icon.sourceText;
      return normalizeSvgSource(source);
    })();
    assetCache.set(cacheKey, promise);
    return promise;
  }

  function paintVectorMarkup(markup, fill, stroke, strokeWidth) {
    const parser = new DOMParser();
    const wrapper = parser.parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`,
      "image/svg+xml",
    );
    wrapper.querySelectorAll("[data-tm-graphic]").forEach((node) => {
      node.setAttribute("fill", fill);
      node.setAttribute("stroke", strokeWidth > 0 ? stroke : "none");
      node.setAttribute("stroke-width", String(strokeWidth * 2.5));
      node.setAttribute("stroke-linejoin", "round");
      node.setAttribute("stroke-linecap", "round");
      node.setAttribute("paint-order", "stroke fill");
      node.removeAttribute("data-tm-graphic");
    });
    const serializer = new XMLSerializer();
    return [...wrapper.documentElement.childNodes]
      .map((node) => serializer.serializeToString(node))
      .join("");
  }

  function getIconTransform(design) {
    const x = 500 + clamp(design.iconX, -45, 45) * 10;
    const y = 500 + clamp(design.iconY, -45, 45) * 10;
    const size = 620 * clamp(design.iconScale, 25, 150) / 100;
    const rotation = clamp(design.iconRotation, -180, 180);
    return { x, y, size, rotation };
  }

  function viewBoxRect(viewBox) {
    const values = String(viewBox)
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
      return { x: 0, y: 0, width: 1000, height: 1000 };
    }
    return { x: values[0], y: values[1], width: values[2], height: values[3] };
  }

  async function iconMarkupFor(design, paint = {}) {
    const icon = design.icon;
    if (!icon) return "";
    const { x, y, size, rotation } = getIconTransform(design);
    const transform = `translate(${x} ${y}) rotate(${rotation})`;
    const x0 = -size / 2;
    const y0 = -size / 2;

    if (icon.kind === "raster") {
      return `<g transform="${transform}"><image href="${escapeXml(icon.dataUrl)}" x="${x0}" y="${y0}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/></g>`;
    }

    const asset = await getVectorAsset(icon);
    const fill = paint.fill || safeHex(design.iconFill, "#17223b");
    const stroke = paint.stroke || safeHex(design.iconStroke, fill);
    const strokeWidth = paint.strokeWidth ?? clamp(design.iconStrokeWidth, 0, 12);
    const markup = paintVectorMarkup(asset.markup, fill, stroke, strokeWidth);
    const bounds = viewBoxRect(asset.viewBox);
    const clipId = `tm-icon-clip-${++renderCounter}`;
    return `<g transform="${transform}"><svg x="${x0}" y="${y0}" width="${size}" height="${size}" viewBox="${escapeXml(asset.viewBox)}" preserveAspectRatio="xMidYMid meet" overflow="hidden"><defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}"/></clipPath></defs><g clip-path="url(#${clipId})">${markup}</g></svg></g>`;
  }

  function valueTextMarkup(design, paint = {}) {
    if (!String(design.value || "").trim()) return "";
    const x = 500 + clamp(design.valueX, -45, 45) * 10;
    const y = 500 + clamp(design.valueY, -45, 45) * 10;
    const fill = paint.fill || safeHex(design.valueFill, "#ffffff");
    const stroke = paint.stroke || safeHex(design.valueStroke, "#17223b");
    const strokeWidth = paint.strokeWidth ?? clamp(design.valueStrokeWidth, 0, 20) * 2.5;
    const allowedFonts = new Set([
      "Arial, sans-serif",
      "Georgia, serif",
      "'Trebuchet MS', sans-serif",
      "'Courier New', monospace",
    ]);
    const font = allowedFonts.has(design.valueFont) ? design.valueFont : "Arial, sans-serif";
    const weight = ["400", "500", "700", "900"].includes(String(design.valueWeight))
      ? String(design.valueWeight)
      : "700";
    return `<text x="${x}" y="${y}" dy=".35em" text-anchor="middle" font-family="${escapeXml(font)}" font-size="${clamp(design.valueSize, 60, 360)}" font-weight="${weight}" fill="${fill}" stroke="${strokeWidth ? stroke : "none"}" stroke-width="${strokeWidth}" stroke-linejoin="round" paint-order="stroke fill">${escapeXml(design.value)}</text>`;
  }

  function guideMarkup(shape, style) {
    if (shape !== "hexagon" || style !== "hex-dashed") return "";
    const geometry = shapeGeometry(shape);
    return `<path d="${geometry.path}" fill="none" stroke="#ff0000" stroke-opacity="0.8" stroke-width="3" stroke-dasharray="14 10" vector-effect="non-scaling-stroke"/>`;
  }

  async function renderTokenSvg(design, options = {}) {
    const id = `tm-${++renderCounter}`;
    const geometry = shapeGeometry(design.shape, options.orientation);
    const fill = design.tokenFillTransparent ? "none" : safeHex(design.tokenFill, "#f7c948");
    const stroke = safeHex(design.tokenStroke, "#17223b");
    const strokeWidth = clamp(design.tokenStrokeWidth, 0, 20) * 2.5;
    const suppressTokenStroke = Boolean(options.suppressTokenStroke)
      || (design.shape === "hexagon" && options.guideStyle === "hex-dashed");
    const iconMarkup = await iconMarkupFor(design);
    const valueMarkup = valueTextMarkup(design);
    const bleedIn = clamp(options.bleedIn, 0, 0.25);
    const bleedUnits = bleedIn / Math.max(0.5, design.sizeIn) * 1000;
    const bleedScale = 1 + bleedUnits * 2 / 1000;
    const viewBox = bleedIn
      ? `${-bleedUnits} ${-bleedUnits} ${1000 + bleedUnits * 2} ${1000 + bleedUnits * 2}`
      : "0 0 1000 1000";
    const bleedMarkup = bleedIn && fill !== "none"
      ? `<g transform="translate(500 500) scale(${bleedScale}) translate(-500 -500)">${geometry.element.replace("/>", ` fill="${fill}" stroke="none"/>`)}</g>`
      : "";
    let artMarkup = iconMarkup;

    if (design.valueMode === "knockout" && String(design.value || "").trim()) {
      const maskIcon = await iconMarkupFor(design, { fill: "#ffffff", stroke: "#ffffff" });
      const cutText = valueTextMarkup(design, {
        fill: "#000000",
        stroke: "#000000",
        strokeWidth: clamp(design.valueStrokeWidth, 0, 20) * 2.5,
      });
      artMarkup = `
        <mask id="${id}-value-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000" style="mask-type:alpha">
          <rect width="1000" height="1000" fill="#000000"/>
          ${maskIcon}
          ${cutText}
        </mask>
        <g mask="url(#${id}-value-mask)">${iconMarkup}</g>`;
    } else {
      artMarkup = `${iconMarkup}${valueMarkup}`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${escapeXml(design.name || "Token")}">
      <defs><clipPath id="${id}-clip">${geometry.element}</clipPath></defs>
      ${bleedMarkup}
      ${geometry.element.replace("/>", ` fill="${fill}" stroke="${strokeWidth && !suppressTokenStroke ? stroke : "none"}" stroke-width="${suppressTokenStroke ? 0 : strokeWidth}" stroke-linejoin="round"/>`)}
      <g clip-path="url(#${id}-clip)">${artMarkup}</g>
      ${guideMarkup(design.shape, options.guideStyle)}
    </svg>`;
  }

  async function renderPreview() {
    const token = ++previewRenderToken;
    try {
      const markup = await renderTokenSvg(state.draft, { orientation: state.sheet.hexOrientation });
      if (token !== previewRenderToken) return;
      const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
      const sourceRoot = doc.documentElement;
      els.tokenPreview.replaceChildren(...[...sourceRoot.childNodes].map((node) => document.importNode(node, true)));
      els.tokenPreview.setAttribute("aria-label", `${state.draft.name} preview`);
    } catch (error) {
      if (token === previewRenderToken) {
        els.tokenPreview.innerHTML = "";
        toast(error.message || "The icon could not be rendered.", "error");
      }
    }
  }

  function updateDraftDimensions() {
    els.dimensions.textContent = `${displayMeasurement(state.draft.sizeIn)} ${state.draft.shape}`;
  }

  function updateSelectedIconUi() {
    const icon = state.draft.icon;
    if (!icon) {
      els.selectedIconName.textContent = "No icon";
      els.selectedIconSource.textContent = "";
      els.selectedIconThumb.replaceChildren();
      return;
    }
    els.selectedIconName.textContent = icon.name;
    els.selectedIconSource.textContent =
      icon.kind === "library"
        ? `Fractal Symbols · ${icon.category}`
        : icon.kind === "raster"
          ? "Uploaded raster · colors preserved"
          : "Uploaded SVG";
    const image = new Image();
    image.alt = "";
    image.src = icon.thumbnail || icon.dataUrl || "";
    els.selectedIconThumb.replaceChildren(image);
  }

  function syncDraftControls() {
    const draft = state.draft;
    els.designName.value = draft.name;
    $$(".shape-button").forEach((button) => button.classList.toggle("active", button.dataset.shape === draft.shape));
    $$(".unit-toggle button").forEach((button) => button.classList.toggle("active", button.dataset.unit === state.unit));
    const displayedSize = layoutApi.inchesToUnit(draft.sizeIn, state.unit);
    if (state.unit === "mm") {
      els.sizeRange.min = "12.7";
      els.sizeRange.max = "76.2";
      els.sizeRange.step = "0.5";
      els.sizeNumber.min = "12.7";
      els.sizeNumber.max = "76.2";
      els.sizeNumber.step = "0.5";
      els.sizeMinLabel.textContent = "12.7 mm";
      els.sizeMaxLabel.textContent = "76.2 mm";
    } else {
      els.sizeRange.min = "0.5";
      els.sizeRange.max = "3";
      els.sizeRange.step = "0.05";
      els.sizeNumber.min = "0.5";
      els.sizeNumber.max = "3";
      els.sizeNumber.step = "0.05";
      els.sizeMinLabel.textContent = "0.5 in";
      els.sizeMaxLabel.textContent = "3 in";
    }
    els.sizeRange.value = String(displayedSize);
    els.sizeNumber.value = formatNumber(displayedSize, state.unit === "mm" ? 1 : 2);
    els.sizeUnitLabel.textContent = state.unit;

    setColorInputs("tokenFill", draft.tokenFill);
    setColorInputs("tokenStroke", draft.tokenStroke);
    els.transparentFill.checked = draft.tokenFillTransparent;
    els.tokenStrokeWidth.value = draft.tokenStrokeWidth;
    els.tokenStrokeOutput.textContent = `${formatNumber(draft.tokenStrokeWidth, 1)} px`;
    setColorInputs("iconFill", draft.iconFill);
    setColorInputs("iconStroke", draft.iconStroke);
    els.iconScale.value = draft.iconScale;
    els.iconScaleOutput.textContent = `${draft.iconScale}%`;
    els.iconRotation.value = draft.iconRotation;
    els.iconRotationOutput.textContent = `${draft.iconRotation}°`;
    els.iconStrokeWidth.value = draft.iconStrokeWidth;
    els.iconStrokeOutput.textContent = `${formatNumber(draft.iconStrokeWidth, 1)} px`;
    els.valueText.value = draft.value;
    els.valueMode.value = draft.valueMode;
    els.valueFont.value = draft.valueFont;
    els.valueWeight.value = draft.valueWeight;
    els.valueSize.value = draft.valueSize;
    els.valueSizeOutput.textContent = `${draft.valueSize} px`;
    setColorInputs("valueFill", draft.valueFill);
    setColorInputs("valueStroke", draft.valueStroke);
    els.valueStrokeWidth.value = draft.valueStrokeWidth;
    els.valueStrokeOutput.textContent = `${draft.valueStrokeWidth} px`;
    $$("[data-value-placement]").forEach((button) =>
      button.classList.toggle("active", button.dataset.valuePlacement === draft.valuePlacement),
    );
    $$("[data-drag-target]").forEach((button) =>
      button.classList.toggle("active", button.dataset.dragTarget === state.dragTarget),
    );
    els.addDesignBtn.innerHTML = draft.id
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg> Update design'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg> Add to project';
    updateDraftDimensions();
    updateSelectedIconUi();
    const isHexDraft = draft.shape === "hexagon";
    if (els.hexOrientationRow) {
      els.hexOrientationRow.hidden = !isHexDraft;
    }
    if (els.hexOrientationRowDesign) {
      els.hexOrientationRowDesign.hidden = !isHexDraft;
    }
    if (els.hexOrientationToggle) {
      els.hexOrientationToggle.checked = state.sheet.hexOrientation === "pointy-top";
    }
    if (els.hexOrientationToggleDesign) {
      els.hexOrientationToggleDesign.checked = state.sheet.hexOrientation === "pointy-top";
    }
    renderPreview();
  }

  function setColorInputs(key, value) {
    const color = safeHex(value);
    els[key].value = color;
    els[`${key}Text`].value = color.toUpperCase();
  }

  function selectIcon(icon) {
    state.draft.icon = makeLibraryIcon(icon);
    if (!state.draft.id || /^Heart token$/.test(state.draft.name)) {
      state.draft.name = `${icon.name} token`;
    }
    state.draft.iconX = state.draft.valuePlacement === "left" ? 13 : 0;
    setDirty();
    syncDraftControls();
    renderIconLibrary();
  }

  function renderCategoryChips() {
    const categories = ["All", ...new Set(icons.map((icon) => icon.category))];
    const fragment = document.createDocumentFragment();
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = `category-chip${activeCategory === category ? " active" : ""}`;
      button.type = "button";
      button.textContent = category;
      button.addEventListener("click", () => {
        activeCategory = category;
        renderCategoryChips();
        renderIconLibrary();
      });
      fragment.append(button);
    });
    els.categoryChips.replaceChildren(fragment);
  }

  function renderIconLibrary() {
    const query = els.iconSearch.value.trim().toLowerCase();
    const matches = icons.filter(
      (icon) =>
        (activeCategory === "All" || icon.category === activeCategory) &&
        (!query || `${icon.name} ${icon.category}`.toLowerCase().includes(query)),
    );
    const selectedId = state.draft.icon?.kind === "library" ? state.draft.icon.id : "";
    const fragment = document.createDocumentFragment();
    matches.forEach((icon) => {
      const button = document.createElement("button");
      button.className = `icon-card${selectedId === icon.id ? " active" : ""}`;
      button.type = "button";
      button.title = `${icon.name} · ${icon.category}`;
      button.innerHTML = `<img src="${escapeXml(icon.thumbnail)}" alt="" loading="lazy" decoding="async"><span>${escapeXml(icon.name)}</span>`;
      button.addEventListener("click", () => selectIcon(icon));
      fragment.append(button);
    });
    els.iconGrid.replaceChildren(fragment);
    els.iconCount.textContent = String(matches.length);
    els.noIconResults.hidden = matches.length > 0;
  }

  async function handleArtworkUpload(file) {
    if (!file) return;
    if (!["image/svg+xml", "image/png", "image/jpeg"].includes(file.type)) {
      toast("Choose an SVG, PNG, or JPG file.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast("Artwork must be 10 MB or smaller for this MVP.", "error");
      return;
    }

    const name = file.name.replace(/\.[^.]+$/, "") || "Uploaded artwork";
    try {
      if (file.type === "image/svg+xml") {
        const sourceText = await file.text();
        const normalized = normalizeSvgSource(sourceText);
        const thumbnailSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXml(normalized.viewBox)}">${paintVectorMarkup(normalized.markup, "#1d1d1b", "#1d1d1b", 0)}</svg>`;
        const thumbnail = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(thumbnailSvg)}`;
        state.draft.icon = {
          kind: "svg",
          id: uid("upload"),
          name,
          sourceText,
          thumbnail,
          mime: file.type,
          attribution: "user",
        };
      } else {
        const dataUrl = await readFileAsDataUrl(file);
        state.draft.icon = {
          kind: "raster",
          id: uid("upload"),
          name,
          dataUrl,
          thumbnail: dataUrl,
          mime: file.type,
          attribution: "user",
        };
      }
      state.draft.name = `${name} token`;
      state.draft.iconX = state.draft.valuePlacement === "left" ? 13 : 0;
      setDirty();
      syncDraftControls();
      renderIconLibrary();
      toast(`${name} is ready to use.`);
    } catch (error) {
      toast(error.message || "The artwork could not be loaded.", "error");
    } finally {
      els.uploadArtInput.value = "";
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("The file could not be read."));
      reader.readAsDataURL(file);
    });
  }

  function applyValuePlacement(placement) {
    const draft = state.draft;
    draft.valuePlacement = placement;
    if (placement === "center") {
      draft.valueX = 0;
      draft.valueY = 0;
      draft.iconX = 0;
    } else if (placement === "left") {
      draft.valueX = -20;
      draft.valueY = 0;
      draft.iconX = 13;
    }
    setDirty();
    syncDraftControls();
  }

  function resetIconValues() {
    const defaults = defaultDraft();
    state.draft.iconFill = defaults.iconFill;
    state.draft.iconStroke = defaults.iconStroke;
    state.draft.iconStrokeWidth = defaults.iconStrokeWidth;
    state.draft.iconScale = defaults.iconScale;
    state.draft.iconRotation = defaults.iconRotation;
    state.draft.iconX = state.draft.valuePlacement === "left" ? 13 : defaults.iconX;
    state.draft.iconY = defaults.iconY;
    setDirty();
    syncDraftControls();
    toast("Icon settings reset.");
  }

  function resetFontValues() {
    const defaults = defaultDraft();
    state.draft.valueFont = defaults.valueFont;
    state.draft.valueWeight = defaults.valueWeight;
    state.draft.valueSize = defaults.valueSize;
    state.draft.valueFill = defaults.valueFill;
    state.draft.valueStroke = defaults.valueStroke;
    state.draft.valueStrokeWidth = defaults.valueStrokeWidth;
    setDirty();
    syncDraftControls();
    toast("Font settings reset.");
  }

  function addOrUpdateDesign() {
    const draft = clone(state.draft);
    draft.name = draft.name.trim() || "Untitled token";
    let message;
    if (draft.id) {
      const index = state.designs.findIndex((design) => design.id === draft.id);
      if (index >= 0) {
        const oldKey = specKeyFor(state.designs[index]);
        const newKey = specKeyFor(draft);
        state.designs[index] = draft;
        if (oldKey !== newKey) {
          const placements = state.sheet.placementsBySpec[oldKey] || [];
          const removed = placements.filter((id) => id === draft.id).length;
          state.sheet.placementsBySpec[oldKey] = placements.filter((id) => id !== draft.id);
          if (removed) toast(`${removed} incompatible sheet ${removed === 1 ? "copy was" : "copies were"} removed.`);
        }
        message = `${draft.name} updated.`;
      }
    } else {
      draft.id = uid("design");
      state.designs.push(draft);
      state.draft.id = draft.id;
      message = `${draft.name} added to the project.`;
    }

    const key = specKeyFor(draft);
    if (!state.sheet.specKey) state.sheet.specKey = key;
    if (!state.sheet.placementsBySpec[key]) state.sheet.placementsBySpec[key] = [];
    state.draft = clone(draft);
    setDirty();
    refreshDesignStrip();
    refreshSheetSpecOptions();
    syncDraftControls();
    toast(message);
  }

  function startNewDesign() {
    state.draft = defaultDraft();
    state.dragTarget = "icon";
    syncDraftControls();
    renderIconLibrary();
  }

  function editDesign(id) {
    const design = state.designs.find((item) => item.id === id);
    if (!design) return;
    state.draft = clone(design);
    syncDraftControls();
    renderIconLibrary();
    setWorkspace("designer");
  }

  function duplicateDesign(id) {
    const source = state.designs.find((item) => item.id === id);
    if (!source) return;
    const copy = clone(source);
    copy.id = uid("design");
    copy.name = `${source.name} copy`;
    state.designs.push(copy);
    state.draft = clone(copy);
    setDirty();
    refreshDesignStrip();
    refreshSheetSpecOptions();
    syncDraftControls();
    toast(`${copy.name} created.`);
  }

  function deleteDesign(id) {
    const design = state.designs.find((item) => item.id === id);
    if (!design) return;
    if (!confirm(`Delete “${design.name}” and remove its copies from all sheets?`)) return;
    state.designs = state.designs.filter((item) => item.id !== id);
    for (const key of Object.keys(state.sheet.placementsBySpec)) {
      state.sheet.placementsBySpec[key] = state.sheet.placementsBySpec[key].filter((designId) => designId !== id);
    }
    if (state.draft.id === id) state.draft = defaultDraft();
    setDirty();
    refreshDesignStrip();
    refreshSheetSpecOptions();
    syncDraftControls();
    refreshSheet();
    toast(`${design.name} deleted.`);
  }

  async function refreshDesignStrip() {
    const renderToken = ++designStripRenderToken;
    els.designEmpty.hidden = state.designs.length > 0;
    els.designCount.textContent = `${state.designs.length} ${state.designs.length === 1 ? "design" : "designs"}`;
    els.openSheetBuilderBtn.hidden = state.designs.length === 0;
    els.sheetTab.classList.toggle("ready", state.designs.length > 0);
    els.designStrip.querySelectorAll(".design-card").forEach((node) => node.remove());

    for (const design of state.designs) {
      const card = document.createElement("article");
      card.className = `design-card${state.draft.id === design.id ? " active" : ""}`;
      card.dataset.designId = design.id;
      card.innerHTML = `
        <div class="design-thumb"></div>
        <div class="design-card-copy">
          <b title="${escapeXml(design.name)}">${escapeXml(design.name)}</b>
          <span>${displayMeasurement(design.sizeIn)} · ${escapeXml(shapeLabel(design.shape))}</span>
          <div class="card-actions">
            <button type="button" data-card-action="edit" title="Edit design" aria-label="Edit ${escapeXml(design.name)}"><svg viewBox="0 0 24 24"><path d="m4 16-1 5 5-1L19 9l-4-4Z M13 7l4 4"/></svg></button>
            <button type="button" data-card-action="duplicate" title="Duplicate design" aria-label="Duplicate ${escapeXml(design.name)}"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></button>
            <button type="button" data-card-action="delete" title="Delete design" aria-label="Delete ${escapeXml(design.name)}"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/></svg></button>
          </div>
        </div>`;
      card.querySelector('[data-card-action="edit"]').addEventListener("click", () => editDesign(design.id));
      card.querySelector('[data-card-action="duplicate"]').addEventListener("click", () => duplicateDesign(design.id));
      card.querySelector('[data-card-action="delete"]').addEventListener("click", () => deleteDesign(design.id));
      els.designStrip.append(card);
      try {
        const markup = await renderTokenSvg(design, { orientation: state.sheet.hexOrientation });
        if (renderToken !== designStripRenderToken) return;
        $(".design-thumb", card).innerHTML = markup;
      } catch {}
    }
  }

  function getDistinctSpecs() {
    const map = new Map();
    state.designs.forEach((design) => {
      const key = specKeyFor(design);
      if (!map.has(key)) map.set(key, { key, shape: design.shape, sizeIn: design.sizeIn });
    });
    return [...map.values()];
  }

  function refreshSheetSpecOptions() {
    const specs = getDistinctSpecs();
    const previous = state.sheet.specKey;
    if (!specs.some((spec) => spec.key === previous)) state.sheet.specKey = specs[0]?.key || "";
    const fragment = document.createDocumentFragment();
    if (!specs.length) {
      const option = new Option("Add a token design first", "");
      fragment.append(option);
    } else {
      specs.forEach((spec) => {
        const label = `${displayMeasurement(spec.sizeIn)} ${shapeLabel(spec.shape)}`;
        const option = new Option(label, spec.key, false, spec.key === state.sheet.specKey);
        fragment.append(option);
      });
    }
    els.sheetSpecSelect.replaceChildren(fragment);
    els.sheetSpecSelect.value = state.sheet.specKey;
  }

  function getPlacements() {
    if (!state.sheet.specKey) return [];
    if (!Array.isArray(state.sheet.placementsBySpec[state.sheet.specKey])) {
      state.sheet.placementsBySpec[state.sheet.specKey] = [];
    }
    return state.sheet.placementsBySpec[state.sheet.specKey];
  }

  function getCompatibleDesigns() {
    return state.designs.filter((design) => specKeyFor(design) === state.sheet.specKey);
  }

  function getEffectiveGuideStyle(shape = parseSpecKey(state.sheet.specKey || "circle|1").shape) {
    return state.sheet.guideStyle;
  }

  function getSheetLayout() {
    const spec = parseSpecKey(state.sheet.specKey || "circle|1");
    const isHex = spec.shape === "hexagon";
    const isStraightCut = isHex && state.sheet.hexLayoutMode === "straight-cut" && state.sheet.hexOrientation === "flat-top";
    return layoutApi.calculateSheetLayout({
      paperSize: state.sheet.paperSize,
      orientation: isStraightCut ? "landscape" : state.sheet.orientation,
      shape: spec.shape,
      sizeIn: spec.sizeIn,
      gutterIn: isStraightCut ? 0 : state.sheet.gutterIn,
      bleedIn: state.sheet.bleedIn,
      marginIn: state.sheet.marginIn,
      footerIn: 0.28,
      layoutMode: isStraightCut ? "straight-cut" : undefined,
      hexOrientation: state.sheet.hexOrientation,
    });
  }

  async function refreshMixList() {
    const renderToken = ++mixRenderToken;
    const compatible = getCompatibleDesigns();
    const placements = getPlacements();
    els.mixEmpty.hidden = compatible.length > 0;
    els.mixList.hidden = compatible.length === 0;
    els.sheetQuickAdd.hidden = compatible.length === 0;
    els.mixList.replaceChildren();
    els.quickAddList.replaceChildren();
    els.fillDesignSelect.replaceChildren();
    const incompatibleCount = state.designs.length - compatible.length;
    els.quickAddNote.textContent = incompatibleCount
      ? `${compatible.length} compatible ${compatible.length === 1 ? "design" : "designs"} shown. ${incompatibleCount} other ${incompatibleCount === 1 ? "design uses" : "designs use"} a different shape or size.`
      : "Use − and + to choose how many copies of each design to print.";

    for (const design of compatible) {
      const count = placements.filter((id) => id === design.id).length;
      const item = document.createElement("div");
      item.className = "mix-item";
      item.innerHTML = `
        <div class="mix-item-thumb"></div>
        <div class="mix-item-copy"><b>${escapeXml(design.name)}</b><span>${displayMeasurement(design.sizeIn)} ${escapeXml(design.shape)}</span></div>
        <div class="quantity-stepper">
          <button type="button" data-quantity="-1" aria-label="Remove one ${escapeXml(design.name)}">−</button>
          <output>${count}</output>
          <button type="button" data-quantity="1" aria-label="Add one ${escapeXml(design.name)}">+</button>
        </div>`;
      item.querySelectorAll("[data-quantity]").forEach((button) => {
        button.addEventListener("click", () => changeQuantity(design.id, Number(button.dataset.quantity)));
      });
      els.mixList.append(item);

      const quickItem = document.createElement("div");
      quickItem.className = "quick-add-item";
      quickItem.innerHTML = `
        <div class="quick-add-thumb"></div>
        <div class="quick-add-copy">
          <b title="${escapeXml(design.name)}">${escapeXml(design.name)}</b>
          <div class="quick-add-controls">
            <button type="button" data-quick-quantity="-1" aria-label="Remove one ${escapeXml(design.name)}">−</button>
            <output>${count} ${count === 1 ? "copy" : "copies"}</output>
            <button type="button" data-quick-quantity="1" aria-label="Add one ${escapeXml(design.name)}">+</button>
          </div>
        </div>`;
      quickItem.querySelectorAll("[data-quick-quantity]").forEach((button) => {
        button.addEventListener("click", () => changeQuantity(design.id, Number(button.dataset.quickQuantity)));
      });
      els.quickAddList.append(quickItem);

      const option = new Option(design.name, design.id);
      els.fillDesignSelect.append(option);
      try {
        const [markup, quickMarkup] = await Promise.all([
          renderTokenSvg(design, { orientation: state.sheet.hexOrientation }),
          renderTokenSvg(design, { orientation: state.sheet.hexOrientation }),
        ]);
        if (renderToken !== mixRenderToken) return;
        $(".mix-item-thumb", item).innerHTML = markup;
        $(".quick-add-thumb", quickItem).innerHTML = quickMarkup;
      } catch {}
    }
    els.fillPageBtn.disabled = compatible.length === 0;
  }

  function changeQuantity(designId, delta) {
    const placements = getPlacements();
    if (delta > 0) placements.push(designId);
    else {
      const index = placements.lastIndexOf(designId);
      if (index >= 0) placements.splice(index, 1);
    }
    const contentPageCount = Math.ceil(placements.length / Math.max(1, getSheetLayout().capacity));
    const printablePageCount = contentPageCount * (state.sheet.includeBacks ? 2 : 1);
    state.sheet.currentPage = Math.min(state.sheet.currentPage, Math.max(0, printablePageCount - 1));
    setDirty();
    refreshSheet();
  }

  function fillCurrentPage() {
    const designId = els.fillDesignSelect.value;
    if (!designId) return;
    const layout = getSheetLayout();
    if (!layout.capacity) return;
    const placements = getPlacements();
    const contentPageIndex = state.sheet.includeBacks
      ? Math.floor(state.sheet.currentPage / 2)
      : state.sheet.currentPage;
    const pageStart = contentPageIndex * layout.capacity;
    const target = pageStart + layout.capacity;
    while (placements.length < target) placements.push(designId);
    setDirty();
    refreshSheet();
    toast(`Sheet ${contentPageIndex + 1} filled.`);
  }

  function clearSheet() {
    const placements = getPlacements();
    if (!placements.length) return;
    if (!confirm("Remove every token from this sheet set? Your saved designs will remain.")) return;
    placements.splice(0);
    state.sheet.currentPage = 0;
    setDirty();
    refreshSheet();
  }

  function getGuideSlotsForSide(layout, side) {
    const cutSlots = layoutApi.getCutGuideSlots(layout);
    if (side !== "back") return cutSlots;
    return cutSlots.map((slot) => ({
      ...slot,
      x: layout.paper.width - slot.x - slot.width,
    }));
  }

  function renderPaperGuides(layout, side = "front") {
    els.paperGuides.setAttribute("viewBox", `0 0 ${layout.paper.width} ${layout.paper.height}`);
    const isHexStraightCut = layout.config.shape === "hexagon"
      && state.sheet.hexLayoutMode === "straight-cut";
    if (isHexStraightCut) {
      els.paperGuides.replaceChildren();
      return;
    }
    const guideSlots = getGuideSlotsForSide(layout, side);
    const segments = layoutApi.getSheetGuideSegments(
      guideSlots,
      layout,
      getEffectiveGuideStyle(layout.config.shape),
    );
    els.paperGuides.replaceChildren(
      ...segments.map((segment) => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(segment.x1));
        line.setAttribute("y1", String(segment.y1));
        line.setAttribute("x2", String(segment.x2));
        line.setAttribute("y2", String(segment.y2));
        return line;
      }),
    );
  }

  async function refreshSheetPreview() {
    const token = ++sheetRenderToken;
    const placements = getPlacements();
    const layout = getSheetLayout();
    const contentPages = layoutApi.paginatePlacements(placements, layout);
    const printablePages = layoutApi.buildPrintablePages(
      contentPages,
      layout.paper,
      state.sheet.includeBacks,
    );
    const pageCount = Math.max(1, printablePages.length);
    state.sheet.currentPage = clamp(state.sheet.currentPage, 0, pageCount - 1);
    const currentPage = printablePages[state.sheet.currentPage];
    const current = currentPage?.placements || [];
    const paper = layout.paper;
    const isBack = currentPage?.side === "back";

    els.pageHeading.textContent = state.sheet.includeBacks && currentPage
      ? `Sheet ${currentPage.sheetIndex + 1} ${isBack ? "mirrored back" : "front"} · PDF page ${state.sheet.currentPage + 1} of ${pageCount}`
      : `Page ${state.sheet.currentPage + 1} of ${pageCount}`;
    els.prevPageBtn.disabled = state.sheet.currentPage <= 0;
    els.nextPageBtn.disabled = state.sheet.currentPage >= pageCount - 1;
    els.capacityNumber.textContent = String(layout.capacity);
    els.sheetSummaryCopy.textContent = placements.length
      ? state.sheet.includeBacks
        ? `${placements.length} placed across ${contentPages.length} ${contentPages.length === 1 ? "sheet" : "sheets"} · ${printablePages.length} PDF pages.`
        : `${placements.length} placed across ${contentPages.length} ${contentPages.length === 1 ? "page" : "pages"}.`
      : layout.config.shape === "hexagon"
        ? state.sheet.hexLayoutMode === "straight-cut"
          ? `Straight-cut template · ${displayMeasurement(layout.config.sizeIn)}`
          : `Grid layout · ${displayMeasurement(layout.config.sizeIn)}`
        : `${shapeLabel(layout.config.shape)} · ${displayMeasurement(layout.config.sizeIn)}`;
    els.placedCount.textContent = `${placements.length} placed`;
    els.sheetTabCount.textContent = `${placements.length} placed`;
    els.exportPdfBtn.disabled = placements.length === 0;

    const aspect = paper.height / paper.width;
    els.paperPreview.style.aspectRatio = `${paper.width} / ${paper.height}`;
    els.paperPreview.classList.toggle("visible", placements.length > 0);
    els.emptySheetState.hidden = placements.length > 0;
    els.paperTokens.replaceChildren();
    renderPaperGuides(layout, currentPage?.side);

    if (!placements.length) return;

    const globalOffset = (currentPage?.sheetIndex || 0) * layout.capacity;
    for (let localIndex = 0; localIndex < current.length; localIndex += 1) {
      const placement = current[localIndex];
      const design = state.designs.find((item) => item.id === placement.designId);
      if (!design) continue;
      const printSize = design.sizeIn + state.sheet.bleedIn * 2;
      const bounds = layoutApi.getPrintedTokenBounds(design.shape, design.sizeIn, state.sheet.bleedIn, state.sheet.hexOrientation);
      const transparentPad = (printSize - bounds.height) / 2;
      const element = document.createElement("div");
      element.className = "paper-token";
      element.draggable = !isBack;
      element.dataset.placementIndex = String(globalOffset + localIndex);
      element.style.left = `${placement.x / paper.width * 100}%`;
      element.style.top = `${(placement.y - transparentPad) / paper.height * 100}%`;
      element.style.width = `${printSize / paper.width * 100}%`;
      element.style.height = `${printSize / paper.height * 100}%`;
      element.style.transform = `rotate(${placement.rotation || 0}deg)`;
      element.title = isBack ? `${design.name} · mirrored back preview` : `${design.name} · drag to reorder`;
      if (!isBack) {
        element.addEventListener("dragstart", () => {
          draggedPlacementIndex = Number(element.dataset.placementIndex);
        });
        element.addEventListener("dragover", (event) => {
          event.preventDefault();
          element.classList.add("drag-over");
        });
        element.addEventListener("dragleave", () => element.classList.remove("drag-over"));
        element.addEventListener("drop", (event) => {
          event.preventDefault();
          element.classList.remove("drag-over");
          const targetIndex = Number(element.dataset.placementIndex);
          if (Number.isInteger(draggedPlacementIndex) && draggedPlacementIndex !== targetIndex) {
            [placements[draggedPlacementIndex], placements[targetIndex]] = [
              placements[targetIndex],
              placements[draggedPlacementIndex],
            ];
            setDirty();
            refreshSheetPreview();
          }
          draggedPlacementIndex = null;
        });
      }
      els.paperTokens.append(element);
      try {
        const markup = await renderTokenSvg(design, {
          guideStyle: getEffectiveGuideStyle(design.shape),
          bleedIn: state.sheet.bleedIn,
          orientation: state.sheet.hexOrientation,
        });
        if (token !== sheetRenderToken) return;
        element.innerHTML = markup;
      } catch {}
    }
  }

  function refreshSheetControls() {
    const spec = parseSpecKey(state.sheet.specKey || "circle|1");
    const isHexSheet = spec.shape === "hexagon";
    const isStraightCut = isHexSheet && state.sheet.hexLayoutMode === "straight-cut";
    const isPointyTop = isHexSheet && state.sheet.hexOrientation === "pointy-top";
    if (isStraightCut) {
      state.sheet.gutterIn = 0;
      state.sheet.orientation = "landscape";
    }
    els.paperSize.value = state.sheet.paperSize;
    els.paperOrientation.value = state.sheet.orientation;
    els.paperOrientation.disabled = isStraightCut;
    els.orientationHelp.hidden = !isHexSheet;
    els.guideStyle.value = getEffectiveGuideStyle(spec.shape);
    els.guideHelp.textContent = state.sheet.guideStyle === "combined"
      ? "Combined guides provide both outside crop marks and internal registration points."
      : state.sheet.guideStyle === "perimeter"
        ? "Crop marks appear around the outside edge of the full token grid."
        : state.sheet.guideStyle === "crosshairs"
          ? "Registration crosshairs appear at the corners of every token cut box."
          : "No cutting guides will be added.";
    els.duplexBacks.checked = state.sheet.includeBacks;
    els.addBleed.checked = state.sheet.bleedIn > 0;
    const finishedSize = spec.sizeIn;
    const printedSize = finishedSize + (state.sheet.bleedIn > 0 ? 0.2 : 0);
    els.bleedHelp.textContent = state.sheet.bleedIn > 0
      ? `${displayMeasurement(finishedSize)} finished size → ${displayMeasurement(printedSize)} printed artwork. Cut or punch on the inner guide.`
      : `Keeps ${displayMeasurement(finishedSize)} as the exact printed and finished size.`;
    const gutterDisplay = layoutApi.inchesToUnit(state.sheet.gutterIn, state.unit);
    const marginDisplay = layoutApi.inchesToUnit(state.sheet.marginIn, state.unit);
    const max = state.unit === "mm" ? 25.4 : 1;
    const step = state.unit === "mm" ? 0.5 : 0.01;
    for (const input of [els.sheetGutter, els.sheetMargin]) {
      input.max = String(max);
      input.step = String(step);
    }
    els.sheetGutter.value = formatNumber(gutterDisplay, state.unit === "mm" ? 1 : 2);
    els.sheetMargin.value = formatNumber(marginDisplay, state.unit === "mm" ? 1 : 2);
    els.touchingLayout.checked = state.sheet.gutterIn === 0;
    els.touchingLayout.disabled = isStraightCut;
    els.sheetGutter.disabled = isStraightCut || state.sheet.gutterIn === 0;
    els.touchingHelp.textContent = isStraightCut
      ? "Required for the straight-cut hex template."
      : "Sets the gutter to zero.";
    if (els.hexLayoutToggleRow) {
      els.hexLayoutToggleRow.hidden = !isHexSheet;
    }
    if (els.hexLayoutToggle) {
      els.hexLayoutToggle.checked = isStraightCut;
    }
    if (els.hexOrientationRow) {
      els.hexOrientationRow.hidden = !isHexSheet;
    }
    if (els.hexOrientationRowDesign) {
      els.hexOrientationRowDesign.hidden = !isHexSheet;
    }
    if (els.hexOrientationToggle) {
      els.hexOrientationToggle.checked = isPointyTop;
    }
    if (els.hexOrientationToggleDesign) {
      els.hexOrientationToggleDesign.checked = isPointyTop;
    }
    els.hexLayoutToggle.disabled = isPointyTop;
    if (els.hexLayoutToggle) {
      els.hexLayoutToggle.nextElementSibling.querySelector("small").textContent = isPointyTop
        ? "Straight-cut is not compatible with pointy-top orientation."
        : "Alternating rows create continuous cut lines for straight line cutting.";
    }
    $$(".sheet-unit-label").forEach((node) => {
      node.textContent = state.unit;
    });
  }

  function refreshSheet() {
    refreshSheetSpecOptions();
    refreshSheetControls();
    refreshMixList();
    refreshSheetPreview();
  }

  function setUnit(unit) {
    if (!["in", "mm"].includes(unit) || state.unit === unit) return;
    state.unit = unit;
    setDirty();
    syncDraftControls();
    refreshDesignStrip();
    refreshSheet();
  }

  function updateDraftFromSizeInput(rawValue) {
    const inches = layoutApi.unitToInches(rawValue, state.unit);
    state.draft.sizeIn = clamp(inches, 0.5, 3);
    setDirty();
    syncDraftControls();
  }

  function bindColorPair(key, draftKey) {
    const colorInput = els[key];
    const textInput = els[`${key}Text`];
    colorInput.addEventListener("input", () => {
      state.draft[draftKey] = colorInput.value;
      textInput.value = colorInput.value.toUpperCase();
      setDirty();
      renderPreview();
    });
    textInput.addEventListener("change", () => {
      const color = safeHex(textInput.value, state.draft[draftKey]);
      state.draft[draftKey] = color;
      colorInput.value = color;
      textInput.value = color.toUpperCase();
      setDirty();
      renderPreview();
    });
  }

  function bindRange(element, draftKey, output, formatter = (value) => value) {
    element.addEventListener("input", () => {
      state.draft[draftKey] = Number(element.value);
      if (output) output.textContent = formatter(element.value);
      setDirty();
      renderPreview();
    });
  }

  function handlePreviewPointerDown(event) {
    if (event.button !== 0) return;
    const targetKey = state.dragTarget === "value" ? "value" : "icon";
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originalX: state.draft[`${targetKey}X`],
      originalY: state.draft[`${targetKey}Y`],
      targetKey,
    };
    els.tokenPreviewWrap.setPointerCapture(event.pointerId);
    els.tokenPreviewWrap.classList.add("dragging");
    event.preventDefault();
  }

  function handlePreviewPointerMove(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const rect = els.tokenPreviewWrap.getBoundingClientRect();
    const dx = (event.clientX - dragState.startX) / rect.width * 100;
    const dy = (event.clientY - dragState.startY) / rect.height * 100;
    state.draft[`${dragState.targetKey}X`] = clamp(dragState.originalX + dx, -45, 45);
    state.draft[`${dragState.targetKey}Y`] = clamp(dragState.originalY + dy, -45, 45);
    if (dragState.targetKey === "value") {
      state.draft.valuePlacement = "custom";
      $$("[data-value-placement]").forEach((button) =>
        button.classList.toggle("active", button.dataset.valuePlacement === "custom"),
      );
    }
    setDirty();
    renderPreview();
  }

  function handlePreviewPointerUp(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    dragState = null;
    els.tokenPreviewWrap.classList.remove("dragging");
    try {
      els.tokenPreviewWrap.releasePointerCapture(event.pointerId);
    } catch {}
  }

  function readSvgIntoImage(svgText) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("The token image could not be rendered."));
      };
      image.src = url;
    });
  }

  async function renderTokenCanvas(design, pixelSize, background = null, options = {}) {
    const svg = await renderTokenSvg(design, options);
    const image = await readSvgIntoImage(svg);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(pixelSize));
    canvas.height = Math.max(1, Math.round(pixelSize));
    const context = canvas.getContext("2d");
    if (background) {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function exportCurrentImage(format) {
    closeMenus();
    const design = state.draft;
    try {
      els.exportImageBtn.disabled = true;
      els.exportImageBtn.textContent = "Rendering…";
      const pixels = Math.round(design.sizeIn * EXPORT_DPI);
      const canvas = await renderTokenCanvas(design, pixels, format === "jpg" ? "#ffffff" : null);
      const mime = format === "jpg" ? "image/jpeg" : "image/png";
      const extension = format === "jpg" ? "jpg" : "png";
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, format === "jpg" ? 0.94 : undefined));
      if (!blob) throw new Error("The image could not be encoded.");
      downloadBlob(blob, `${slugify(design.name)}-${EXPORT_DPI}dpi.${extension}`);
      toast(`${format.toUpperCase()} exported at ${pixels} × ${pixels} pixels.`);
    } catch (error) {
      toast(error.message || "Image export failed.", "error");
    } finally {
      els.exportImageBtn.disabled = false;
      els.exportImageBtn.innerHTML = 'Export image <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"/></svg>';
    }
  }

  function traceGuideShape(context, shape, x, y, width, height) {
    context.beginPath();
    if (shape === "circle") {
      context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    } else if (shape === "square") {
      context.rect(x, y, width, height);
    } else if (shape === "hexagon") {
      const isPointyTop = options?.orientation === "pointy-top";
      const points = isPointyTop
        ? [
            [x + width / 2, y],
            [x + width, y + height / 4],
            [x + width, y + height * 3 / 4],
            [x + width / 2, y + height],
            [x, y + height * 3 / 4],
            [x, y + height / 4],
          ]
        : [
            [x, y + height / 2],
            [x + width / 4, y],
            [x + width * 3 / 4, y],
            [x + width, y + height / 2],
            [x + width * 3 / 4, y + height],
            [x + width / 4, y + height],
          ];
      points.forEach(([px, py], index) => (index ? context.lineTo(px, py) : context.moveTo(px, py)));
      context.closePath();
    } else {
      context.moveTo(x + width / 2, y);
      context.lineTo(x + width, y + height);
      context.lineTo(x, y + height);
      context.closePath();
    }
  }

  function drawCutGuide(context, placement, shape, style, dpi, orientation = "flat-top") {
    if (style !== "hex-dashed" || shape !== "hexagon") return;
    const centerX = (placement.x + placement.width / 2) * dpi;
    const centerY = (placement.y + placement.height / 2) * dpi;
    const width = placement.width * dpi;
    const height = placement.height * dpi;
    const x = -width / 2;
    const y = -height / 2;
    context.save();
    context.translate(centerX, centerY);
    context.rotate((placement.rotation || 0) * Math.PI / 180);
    context.strokeStyle = "#000000";
    context.globalAlpha = 0.5;
    context.lineWidth = Math.max(1, 1.5 / 72 * dpi);
    context.lineCap = "butt";
    context.lineJoin = "miter";
    context.setLineDash([0.07 * dpi, 0.045 * dpi]);
    traceGuideShape(context, shape, x, y, width, height, { orientation });
    context.stroke();
    context.restore();
  }

  function drawSheetGuides(context, layout, side, dpi) {
    const guideSlots = getGuideSlotsForSide(layout, side);
    const segments = layoutApi.getSheetGuideSegments(
      guideSlots,
      layout,
      getEffectiveGuideStyle(layout.config.shape),
    );
    if (!segments.length) return;
    context.save();
    context.strokeStyle = "#6b7280";
    context.lineWidth = Math.max(1, 0.00347 * dpi);
    context.lineCap = "butt";
    context.beginPath();
    for (const segment of segments) {
      context.moveTo(segment.x1 * dpi, segment.y1 * dpi);
      context.lineTo(segment.x2 * dpi, segment.y2 * dpi);
    }
    context.stroke();
    context.restore();
  }

  async function exportPdf() {
    const placements = getPlacements();
    if (!placements.length) return;
    if (!window.jspdf?.jsPDF) {
      toast("The PDF library is unavailable. Check the internet connection and reload.", "error");
      return;
    }

    const layout = getSheetLayout();
    if (!layout.capacity) {
      toast("The selected token size does not fit within the current page settings.", "error");
      return;
    }
    const contentPages = layoutApi.paginatePlacements(placements, layout);
    const printablePages = layoutApi.buildPrintablePages(
      contentPages,
      layout.paper,
      state.sheet.includeBacks,
    );
    const { jsPDF } = window.jspdf;
    const orientation = layout.paper.width > layout.paper.height ? "landscape" : "portrait";
    const pdf = new jsPDF({
      orientation,
      unit: "in",
      format: [layout.paper.width, layout.paper.height],
      compress: true,
      hotfixes: ["px_scaling"],
    });
    pdf.setProperties({
      title: "TokenMaker printable token sheet",
      subject: "Print-and-play board-game tokens",
      creator: "TokenMaker",
    });

    const canvasCache = new Map();
    els.exportPdfBtn.disabled = true;
    els.exportStatus.textContent = "Preparing PDF…";

    try {
      for (let pageIndex = 0; pageIndex < printablePages.length; pageIndex += 1) {
        if (pageIndex) pdf.addPage([layout.paper.width, layout.paper.height], orientation);
        const printablePage = printablePages[pageIndex];
        els.exportStatus.textContent = `Rendering ${printablePage.side} page ${pageIndex + 1} of ${printablePages.length}…`;
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = Math.round(layout.paper.width * EXPORT_DPI);
        pageCanvas.height = Math.round(layout.paper.height * EXPORT_DPI);
        const context = pageCanvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        for (const placement of printablePage.placements) {
          const design = state.designs.find((item) => item.id === placement.designId);
          if (!design) continue;
          let tokenCanvas = canvasCache.get(design.id);
          if (!tokenCanvas) {
            const printSize = design.sizeIn + state.sheet.bleedIn * 2;
            tokenCanvas = await renderTokenCanvas(
              design,
              Math.round(printSize * EXPORT_DPI),
              null,
              {
                bleedIn: state.sheet.bleedIn,
                suppressTokenStroke: design.shape === "hexagon" && getEffectiveGuideStyle(design.shape) === "hex-dashed",
                orientation: state.sheet.hexOrientation,
              },
            );
            canvasCache.set(design.id, tokenCanvas);
          }
          const printSize = design.sizeIn + state.sheet.bleedIn * 2;
          const bounds = layoutApi.getPrintedTokenBounds(design.shape, design.sizeIn, state.sheet.bleedIn, state.sheet.hexOrientation);
          const padIn = (printSize - bounds.height) / 2;
          const drawX = placement.x * EXPORT_DPI;
          const drawY = (placement.y - padIn) * EXPORT_DPI;
          const drawSize = printSize * EXPORT_DPI;
          context.save();
          context.translate(drawX + drawSize / 2, drawY + drawSize / 2);
          context.rotate((placement.rotation || 0) * Math.PI / 180);
          context.drawImage(tokenCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          context.restore();
          const finishedBounds = layoutApi.getTokenBounds(design.shape, design.sizeIn, state.sheet.hexOrientation);
          const cutPlacement = {
            ...placement,
            x: placement.x + (placement.width - finishedBounds.width) / 2,
            y: placement.y + (placement.height - finishedBounds.height) / 2,
            width: finishedBounds.width,
            height: finishedBounds.height,
          };
          drawCutGuide(
            context,
            cutPlacement,
            design.shape,
            getEffectiveGuideStyle(design.shape),
            EXPORT_DPI,
            state.sheet.hexOrientation,
          );
        }
        drawSheetGuides(context, layout, printablePage.side, EXPORT_DPI);

        context.fillStyle = "#596273";
        context.font = `${Math.round(7 / 72 * EXPORT_DPI)}px Arial, sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "alphabetic";
        context.fillText(
          "TokenMaker · Fractal Symbols by Felix Thalin · fractalsymbols.com · CC BY 4.0",
          pageCanvas.width / 2,
          pageCanvas.height - Math.round(0.12 * EXPORT_DPI),
        );

        const pageData = pageCanvas.toDataURL("image/jpeg", 0.96);
        pdf.addImage(pageData, "JPEG", 0, 0, layout.paper.width, layout.paper.height, undefined, "FAST");
        pageCanvas.width = 1;
        pageCanvas.height = 1;
      }
      pdf.save(`tokenmaker-${shapeLabel(layout.config.shape).toLowerCase()}-${formatNumber(layout.config.sizeIn)}in.pdf`);
      els.exportStatus.textContent = "";
      toast(`${printablePages.length}-page printable PDF exported.`);
    } catch (error) {
      console.error(error);
      els.exportStatus.textContent = "";
      toast(error.message || "PDF export failed.", "error");
    } finally {
      els.exportPdfBtn.disabled = false;
    }
  }

  function serializeProject() {
    return {
      app: "TokenMaker",
      version: APP_VERSION,
      savedAt: new Date().toISOString(),
      unit: state.unit,
      designs: clone(state.designs),
      draft: clone(state.draft),
      sheet: clone(state.sheet),
    };
  }

  function saveProject() {
    const project = serializeProject();
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    downloadBlob(blob, `tokenmaker-project-${new Date().toISOString().slice(0, 10)}.json`);
    setDirty(false);
    toast("Project JSON saved.");
  }

  function validateLoadedDesign(raw) {
    const base = defaultDraft();
    const design = { ...base, ...raw };
    design.id = typeof raw.id === "string" ? raw.id : uid("design");
    design.name = String(raw.name || "Untitled token").slice(0, 60);
    design.shape = ["circle", "square", "hexagon", "octagon"].includes(raw.shape) ? raw.shape : "circle";
    design.sizeIn = clamp(raw.sizeIn, 0.5, 3);
    design.icon = raw.icon && typeof raw.icon === "object" ? raw.icon : makeLibraryIcon();
    return design;
  }

  async function loadProjectFile(file) {
    if (!file) return;
    try {
      const project = JSON.parse(await file.text());
      if (project.app !== "TokenMaker" || !Array.isArray(project.designs)) {
        throw new Error("This is not a valid TokenMaker project.");
      }
      state.unit = project.unit === "mm" ? "mm" : "in";
      state.designs = project.designs.map(validateLoadedDesign);
      state.draft = project.draft ? validateLoadedDesign(project.draft) : clone(state.designs[0] || defaultDraft());
      state.sheet = {
        specKey: "",
        paperSize: "letter",
        orientation: "portrait",
        gutterIn: 0.3,
        marginIn: 0.25,
        bleedIn: 0.1,
        guideStyle: "combined",
        includeBacks: false,
        currentPage: 0,
        hexLayoutMode: "straight-cut",
        hexOrientation: "flat-top",
        placementsBySpec: {},
        ...(project.sheet || {}),
      };
      if (["crop", "solid", "dashed", "hex-dashed"].includes(state.sheet.guideStyle)) {
        state.sheet.guideStyle = "combined";
      }
      if (!["combined", "perimeter", "crosshairs", "none"].includes(state.sheet.guideStyle)) {
        state.sheet.guideStyle = "combined";
      }
      state.sheet.includeBacks = Boolean(state.sheet.includeBacks);
      state.sheet.bleedIn = state.sheet.bleedIn > 0 ? 0.1 : 0;
      if (!state.sheet.placementsBySpec || typeof state.sheet.placementsBySpec !== "object") {
        state.sheet.placementsBySpec = {};
      }
      for (const key of Object.keys(state.sheet.placementsBySpec)) {
        state.sheet.placementsBySpec[key] = state.sheet.placementsBySpec[key].filter((id) =>
          state.designs.some((design) => design.id === id && specKeyFor(design) === key),
        );
      }
      refreshCategoryAndAll();
      setDirty(false);
      toast(`${state.designs.length} token ${state.designs.length === 1 ? "design" : "designs"} loaded.`);
    } catch (error) {
      toast(error.message || "The project could not be loaded.", "error");
    } finally {
      els.loadProjectInput.value = "";
    }
  }

  function refreshCategoryAndAll() {
    renderCategoryChips();
    renderIconLibrary();
    syncDraftControls();
    refreshDesignStrip();
    refreshSheetSpecOptions();
    refreshSheet();
  }

  function bindEvents() {
    els.licenseBtn.addEventListener("click", () => {
      if (tutorialState.active) endTutorial();
      closeMenus();
      els.licenseDialog.showModal();
    });
    els.licenseCloseBtn.addEventListener("click", () => els.licenseDialog.close());
    els.licenseDialog.addEventListener("click", (event) => {
      if (event.target === els.licenseDialog) els.licenseDialog.close();
    });
    els.tutorialBtn.addEventListener("click", () => {
      if (tutorialState.active) endTutorial();
      else startTutorial();
    });
    els.tutorialSkipBtn.addEventListener("click", endTutorial);
    els.tutorialBackBtn.addEventListener("click", () => moveTutorial(-1));
    els.tutorialNextBtn.addEventListener("click", () => moveTutorial(1));
    window.addEventListener("resize", positionTutorialCallout);
    window.addEventListener("scroll", positionTutorialCallout, { capture: true, passive: true });
    document.addEventListener("keydown", (event) => {
      if (tutorialState.active && event.key === "Escape") endTutorial();
    });
    els.themeBtn.addEventListener("click", () => {
      const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem("tokenmaker-theme", theme);
      } catch {}
    });
    els.relatedBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMenu(els.relatedBtn, els.relatedMenu);
    });
    els.exportImageBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMenu(els.exportImageBtn, els.exportImageMenu);
    });
    document.addEventListener("click", () => closeMenus());
    els.relatedMenu.addEventListener("click", (event) => event.stopPropagation());
    els.exportImageMenu.addEventListener("click", (event) => event.stopPropagation());

    els.designerTab.addEventListener("click", () => setWorkspace("designer"));
    els.sheetTab.addEventListener("click", () => setWorkspace("sheet"));
    els.openSheetBuilderBtn.addEventListener("click", () => {
      setWorkspace("sheet");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    els.returnDesignerBtn.addEventListener("click", () => setWorkspace("designer"));
    els.iconSearch.addEventListener("input", renderIconLibrary);
    els.uploadArtBtn.addEventListener("click", () => els.uploadArtInput.click());
    els.uploadArtInput.addEventListener("change", () => handleArtworkUpload(els.uploadArtInput.files[0]));

    els.designName.addEventListener("input", () => {
      state.draft.name = els.designName.value;
      setDirty();
    });
    els.resetDraftBtn.addEventListener("click", () => {
      const preservedId = state.draft.id;
      state.draft = defaultDraft();
      state.draft.id = preservedId;
      syncDraftControls();
      renderIconLibrary();
      setDirty();
    });
    els.addDesignBtn.addEventListener("click", addOrUpdateDesign);
    els.newDesignBtn.addEventListener("click", startNewDesign);
    els.exportImageMenu.querySelectorAll("[data-export-image]").forEach((button) => {
      button.addEventListener("click", () => exportCurrentImage(button.dataset.exportImage));
    });

    $$(".shape-button").forEach((button) => {
      button.addEventListener("click", () => {
        state.draft.shape = button.dataset.shape;
        setDirty();
        syncDraftControls();
        refreshSheetControls();
      });
    });
    $$(".unit-toggle button").forEach((button) => button.addEventListener("click", () => setUnit(button.dataset.unit)));
    els.sizeRange.addEventListener("input", () => updateDraftFromSizeInput(els.sizeRange.value));
    els.sizeNumber.addEventListener("change", () => updateDraftFromSizeInput(els.sizeNumber.value));
    bindColorPair("tokenFill", "tokenFill");
    bindColorPair("tokenStroke", "tokenStroke");
    els.transparentFill.addEventListener("change", () => {
      state.draft.tokenFillTransparent = els.transparentFill.checked;
      setDirty();
      renderPreview();
    });
    bindRange(els.tokenStrokeWidth, "tokenStrokeWidth", els.tokenStrokeOutput, (value) => `${value} px`);
    bindColorPair("iconFill", "iconFill");
    bindColorPair("iconStroke", "iconStroke");
    bindRange(els.iconScale, "iconScale", els.iconScaleOutput, (value) => `${value}%`);
    bindRange(els.iconRotation, "iconRotation", els.iconRotationOutput, (value) => `${value}°`);
    bindRange(els.iconStrokeWidth, "iconStrokeWidth", els.iconStrokeOutput, (value) => `${value} px`);
    els.centerIconBtn.addEventListener("click", () => {
      state.draft.iconX = state.draft.valuePlacement === "left" ? 13 : 0;
      state.draft.iconY = 0;
      setDirty();
      renderPreview();
    });
    els.resetIconValuesBtn.addEventListener("click", resetIconValues);
    els.valueText.addEventListener("input", () => {
      state.draft.value = els.valueText.value;
      setDirty();
      renderPreview();
    });
    els.clearValueBtn.addEventListener("click", () => {
      state.draft.value = "";
      els.valueText.value = "";
      setDirty();
      renderPreview();
    });
    $$("[data-value-placement]").forEach((button) =>
      button.addEventListener("click", () => applyValuePlacement(button.dataset.valuePlacement)),
    );
    els.valueMode.addEventListener("change", () => {
      state.draft.valueMode = els.valueMode.value;
      setDirty();
      renderPreview();
    });
    els.valueFont.addEventListener("change", () => {
      state.draft.valueFont = els.valueFont.value;
      setDirty();
      renderPreview();
    });
    els.valueWeight.addEventListener("change", () => {
      state.draft.valueWeight = els.valueWeight.value;
      setDirty();
      renderPreview();
    });
    bindRange(els.valueSize, "valueSize", els.valueSizeOutput, (value) => `${value} px`);
    bindColorPair("valueFill", "valueFill");
    bindColorPair("valueStroke", "valueStroke");
    bindRange(els.valueStrokeWidth, "valueStrokeWidth", els.valueStrokeOutput, (value) => `${value} px`);
    els.resetFontValuesBtn.addEventListener("click", resetFontValues);
    $$("[data-drag-target]").forEach((button) => {
      button.addEventListener("click", () => {
        state.dragTarget = button.dataset.dragTarget;
        $$("[data-drag-target]").forEach((node) => node.classList.toggle("active", node === button));
      });
    });
    els.tokenPreviewWrap.addEventListener("pointerdown", handlePreviewPointerDown);
    els.tokenPreviewWrap.addEventListener("pointermove", handlePreviewPointerMove);
    els.tokenPreviewWrap.addEventListener("pointerup", handlePreviewPointerUp);
    els.tokenPreviewWrap.addEventListener("pointercancel", handlePreviewPointerUp);

    els.sheetSpecSelect.addEventListener("change", () => {
      state.sheet.specKey = els.sheetSpecSelect.value;
      state.sheet.currentPage = 0;
      setDirty();
      refreshSheet();
    });
    els.paperSize.addEventListener("change", () => {
      state.sheet.paperSize = els.paperSize.value;
      state.sheet.currentPage = 0;
      setDirty();
      refreshSheet();
    });
    els.paperOrientation.addEventListener("change", () => {
      state.sheet.orientation = els.paperOrientation.value;
      state.sheet.currentPage = 0;
      setDirty();
      refreshSheet();
    });
    els.guideStyle.addEventListener("change", () => {
      state.sheet.guideStyle = els.guideStyle.value;
      setDirty();
      refreshSheetPreview();
    });
    els.duplexBacks.addEventListener("change", () => {
      state.sheet.includeBacks = els.duplexBacks.checked;
      state.sheet.currentPage = 0;
      setDirty();
      refreshSheet();
    });
    els.addBleed.addEventListener("change", () => {
      state.sheet.bleedIn = els.addBleed.checked ? 0.1 : 0;
      state.sheet.currentPage = 0;
      setDirty();
      refreshSheet();
    });
    els.sheetGutter.addEventListener("change", () => {
      state.sheet.gutterIn = clamp(layoutApi.unitToInches(els.sheetGutter.value, state.unit), 0, 1);
      state.sheet.currentPage = 0;
      setDirty();
      refreshSheet();
    });
    els.sheetMargin.addEventListener("change", () => {
      state.sheet.marginIn = clamp(layoutApi.unitToInches(els.sheetMargin.value, state.unit), 0, 1);
      state.sheet.currentPage = 0;
      setDirty();
      refreshSheet();
    });
    els.touchingLayout.addEventListener("change", () => {
      state.sheet.gutterIn = els.touchingLayout.checked ? 0 : 0.3;
      state.sheet.currentPage = 0;
      setDirty();
      refreshSheet();
    });
    if (els.hexOrientationToggle) {
      els.hexOrientationToggle.addEventListener("change", () => {
        state.sheet.hexOrientation = els.hexOrientationToggle.checked ? "pointy-top" : "flat-top";
        state.sheet.currentPage = 0;
        setDirty();
        refreshSheet();
      });
    }
    if (els.hexOrientationToggleDesign) {
      els.hexOrientationToggleDesign.addEventListener("change", () => {
        state.sheet.hexOrientation = els.hexOrientationToggleDesign.checked ? "pointy-top" : "flat-top";
        state.sheet.currentPage = 0;
        setDirty();
        refreshSheet();
        refreshSheetControls();
      });
    }
    if (els.hexLayoutToggle) {
      els.hexLayoutToggle.addEventListener("change", () => {
        state.sheet.hexLayoutMode = els.hexLayoutToggle.checked ? "straight-cut" : "grid";
        state.sheet.currentPage = 0;
        setDirty();
        refreshSheet();
      });
    }
    els.prevPageBtn.addEventListener("click", () => {
      state.sheet.currentPage -= 1;
      refreshSheetPreview();
    });
    els.nextPageBtn.addEventListener("click", () => {
      state.sheet.currentPage += 1;
      refreshSheetPreview();
    });
    els.fillPageBtn.addEventListener("click", fillCurrentPage);
    els.clearSheetBtn.addEventListener("click", clearSheet);
    els.exportPdfBtn.addEventListener("click", exportPdf);

    els.saveProjectBtn.addEventListener("click", saveProject);
    els.loadProjectBtn.addEventListener("click", () => els.loadProjectInput.click());
    els.loadProjectInput.addEventListener("change", () => loadProjectFile(els.loadProjectInput.files[0]));
    window.addEventListener("beforeunload", (event) => {
      if (!state.dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function init() {
    bindEvents();
    renderCategoryChips();
    renderIconLibrary();
    syncDraftControls();
    refreshDesignStrip();
    refreshSheetSpecOptions();
    refreshSheetControls();
    setDirty(false);
    launchFirstVisitTutorial();
  }

  init();
})();
