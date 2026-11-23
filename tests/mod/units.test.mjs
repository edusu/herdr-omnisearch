import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TEXT, DEFAULTS, BOUNDS, px, grow, fit, setSizes } from "../../omnisearch/mods/omnisearch/scale.js";
import { placementOf } from "../../omnisearch/mods/omnisearch/placement.js";

test("the defaults draw at the sizes the mod was designed at", () => {
  setSizes({});
  assert.equal(TEXT.base, 13);
  assert.equal(TEXT.input, 16);
  assert.equal(grow(36), 36);
  assert.equal(px(17), 17);
});

test("font_size moves the text and the rows holding it, not the icons; scale moves icons and rows, not the text", () => {
  setSizes({ font_size: 16.5 });
  assert.equal(TEXT.base, 16.5);
  assert.ok(Math.abs(TEXT.input / TEXT.base - 16 / 13) < 1e-9);
  assert.equal(grow(28), 36);
  assert.equal(px(44), 44);
  setSizes({ scale: 1.25 });
  assert.equal(TEXT.base, 13);
  assert.equal(px(44), 55);
  assert.equal(grow(15), 19);
  setSizes({ scale: 9, font_size: "big" });
  assert.equal(px(10), 16);
  assert.equal(TEXT.base, 13);
  assert.equal(fit(0.9, "list_width"), 0.6);
  assert.equal(fit(undefined, "list_width"), 0.4);
  setSizes({});
});

test("mod.schema.json describes the same defaults and bounds", () => {
  const schema = JSON.parse(readFileSync(new URL("../../omnisearch/mods/omnisearch/mod.schema.json", import.meta.url), "utf8"));
  for (const key of Object.keys(DEFAULTS)) {
    const spec = schema.properties.settings.properties[key];
    assert.deepEqual([spec.default, spec.minimum, spec.maximum], [DEFAULTS[key], ...BOUNDS[key]], key);
  }
});

test("a copy's placement: the popup, a pane beside the terminals, or a tab of its own", () => {
  const panes = [{ pane: "p1", tab: "t1" }, { pane: "p2", tab: "t1" }, { pane: "p3", tab: "t2" }];
  assert.equal(placementOf({ overlay: "o1" }, panes, "t1"), "popup");
  assert.equal(placementOf({ pane: "p2" }, panes, "t1"), "pane");
  assert.equal(placementOf({ pane: "p3" }, panes, "t1"), "tab");
  // A pane Herdr doesn't list yet: beside something.
  assert.equal(placementOf({ pane: "p9" }, panes, "t1"), "pane");
});
