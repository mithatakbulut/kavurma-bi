import assert from "node:assert/strict";
import test from "node:test";

import { greet } from "../src/index.js";

test("greet names a person", () => {
  assert.equal(greet("tandem"), "hello, tandem");
});

test("greet defaults to world", () => {
  assert.equal(greet(""), "hello, world");
});
