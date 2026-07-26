const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");

function loadManifest() {
  const source = fs.readFileSync(path.join(projectRoot, "icon-manifest.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  return sandbox.window.TOKENMAKER_ICONS;
}

test("manifest includes the complete newer pack and selected non-duplicate legacy icons", () => {
  const icons = loadManifest();
  const currentSvgCount = fs
    .readdirSync(path.join(projectRoot, "Fractal-Symbols-Complete-Pack"), { recursive: true })
    .filter((name) => String(name).toLowerCase().endsWith(".svg")).length;
  const currentIcons = icons.filter((icon) => icon.path.startsWith("Fractal-Symbols-Complete-Pack/"));
  const legacyIcons = icons.filter((icon) => icon.path.startsWith("FractalSymbols Icons Set/"));
  assert.equal(currentIcons.length, currentSvgCount);
  assert.equal(legacyIcons.length, 41);
  assert.equal(icons.length, 327);
});

test("every manifest entry has matching vector and raster assets", () => {
  const icons = loadManifest();
  const ids = new Set();
  for (const icon of icons) {
    assert.ok(icon.id && !ids.has(icon.id), `duplicate or missing id: ${icon.id}`);
    ids.add(icon.id);
    assert.ok(fs.existsSync(path.join(projectRoot, icon.path)), icon.path);
    assert.ok(fs.existsSync(path.join(projectRoot, icon.thumbnail)), icon.thumbnail);
    assert.equal(icon.attribution, "fractal-symbols");
  }
});

test("core starter symbols are available", () => {
  const icons = loadManifest();
  for (const name of ["Heart", "Shield", "Meeple", "Fist", "Shield And Sword", "Skull"]) {
    assert.ok(icons.some((icon) => icon.name === name), name);
  }
});

test("distinctive legacy-only symbols remain available without renamed legacy duplicates", () => {
  const icons = loadManifest();
  for (const name of ["Complexity rating", "Hex grid line", "Disc Cube", "Clay", "Coal"]) {
    assert.ok(icons.some((icon) => icon.name === name), name);
  }
  for (const name of ["Sword in shield", "Break shield", "Agent add", "Random all"]) {
    assert.ok(!icons.some((icon) => icon.name === name), name);
  }
});
