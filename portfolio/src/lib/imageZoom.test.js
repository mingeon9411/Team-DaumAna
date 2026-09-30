import assert from "node:assert/strict";
import { clampZoom, fitZoom } from "./imageZoom.js";

assert.equal(clampZoom(0), 1);
assert.equal(clampZoom(900), 400);
assert.equal(clampZoom(125), 125);
assert.equal(clampZoom(NaN), 100);
assert.equal(fitZoom({ width: 5120, height: 6252 }, { width: 1000, height: 800 }), 12);
assert.equal(fitZoom({ width: 2642, height: 1650 }, { width: 390, height: 600 }), 13);
assert.equal(fitZoom({ width: 100, height: 100 }, { width: 1000, height: 800 }), 100);
console.log("Image zoom bounds and fit checks passed.");
