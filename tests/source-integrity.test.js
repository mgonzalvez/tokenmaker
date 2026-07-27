const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

test("every DOM id referenced by app.js exists in index.html", () => {
  const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const referencedIds = [...app.matchAll(/\$\("#([^"]+)"\)/g)].map((match) => match[1]);
  const missing = [...new Set(referencedIds.filter((id) => !htmlIds.has(id)))];
  assert.deepEqual(missing, []);
});

test("index.html does not contain duplicate ids", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test("all local scripts and styles referenced by index.html exist", () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((ref) => !/^(?:https?:|mailto:|tel:|#)/.test(ref));
  for (const ref of refs) assert.ok(fs.existsSync(path.join(root, ref)), ref);
});

test("release metadata and external dependency integrity are present", () => {
  assert.match(html, /rel="canonical" href="https:\/\/tokenmaker\.gonzhome\.us\/"/);
  assert.match(html, /rel="icon" href="favicon\.svg"/);
  assert.match(html, /integrity="sha512-[A-Za-z0-9+/=]+"/);
  assert.match(html, /crossorigin="anonymous"/);
});

test("GitHub Pages custom domain is configured", () => {
  const cname = fs.readFileSync(path.join(root, "CNAME"), "utf8").trim();
  assert.equal(cname, "tokenmaker.gonzhome.us");
});

test("imported vectors are clipped to their declared viewBox", () => {
  assert.match(app, /preserveAspectRatio="xMidYMid meet" overflow="hidden"/);
  assert.match(app, /clipPathUnits="userSpaceOnUse"/);
  assert.match(app, /<g clip-path="url\(#\$\{clipId\}\)">\$\{markup\}<\/g>/);
  assert.doesNotMatch(app, /preserveAspectRatio="xMidYMid meet" overflow="visible"/);
});

test("the guided tutorial has persistent first-visit behavior and anchored controls", () => {
  for (const id of [
    "tutorial-btn",
    "tutorial-layer",
    "tutorial-spotlight",
    "tutorial-callout",
    "tutorial-back-btn",
    "tutorial-next-btn",
    "tutorial-skip-btn",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(app, /tokenmaker-tutorial-seen-v1/);
  assert.match(app, /scrollIntoView/);
  assert.match(app, /positionTutorialCallout/);
  assert.match(app, /localStorage\.setItem\(TUTORIAL_STORAGE_KEY/);
});

test("triangle is not offered as a token shape", () => {
  assert.doesNotMatch(html, /data-shape="triangle"/);
});

test("cutting guide controls use combined guides and automatic hex outlines", () => {
  assert.match(html, /option value="combined"/);
  assert.match(html, /option value="hex-dashed"/);
  assert.doesNotMatch(html, /option value="solid"/);
  assert.doesNotMatch(html, /option value="dashed"/);
  assert.match(app, /stroke-opacity="0\.8"/);
  assert.match(app, /stroke-width="3" stroke-dasharray="14 10"/);
  assert.match(app, /context\.globalAlpha = 0\.5/);
  assert.match(app, /1\.5 \/ 72 \* dpi/);
  assert.match(app, /suppressTokenStroke: design\.shape === "hexagon"/);
});

test("sheet bleed is enabled by default but remains user-selectable", () => {
  assert.match(html, /id="add-bleed" type="checkbox" checked/);
  assert.match(app, /bleedIn: 0\.1/);
  assert.match(app, /els\.addBleed\.checked \? 0\.1 : 0/);
});

test("prominent icon licensing information explains permitted use and attribution", () => {
  assert.match(html, /id="license-btn" class="header-button license-button"/);
  assert.match(html, /Free icon license/);
  assert.match(html, /Free to use with attribution/);
  assert.match(html, /including commercial projects/);
  assert.match(html, /Attribution is required/);
  assert.match(html, /creativecommons\.org\/licenses\/by\/4\.0/);
  assert.match(app, /target: "#license-btn"/);
  assert.match(app, /Icons are free to use/);
});

test("icon source links use the current Fractal Symbols site", () => {
  assert.match(html, /https:\/\/fractalsymbols\.com/);
  assert.doesNotMatch(html, /afractalthought\.com\/fractal-symbols/);
});

test("copyright, feedback, Ko-fi, and current related-site links are present", () => {
  assert.match(html, /Copyright 2026 by/);
  assert.match(html, /Martin Gonzalvez/);
  assert.match(html, /Feedback%20for%20TokenMaker/);
  assert.match(html, /https:\/\/ko-fi\.com\/marting/);
  assert.match(html, /https:\/\/formatter\.gonzhome\.us/);
  assert.match(html, /https:\/\/extractor\.gonzhome\.us/);
  assert.doesNotMatch(html, /cardformatter\.gonzhome\.us/);
  assert.doesNotMatch(html, /cardextractor\.gonzhome\.us/);
  assert.match(app, /fractalsymbols\.com · CC BY 4\.0/);
});

test("Related sites appears before the light and dark mode toggle", () => {
  assert.ok(html.indexOf('id="related-btn"') < html.indexOf('id="theme-btn"'));
});
