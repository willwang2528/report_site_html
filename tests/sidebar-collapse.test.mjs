import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("desktop collapsed archive hides its full navigation content", async () => {
  const css = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  const hiddenStateRule = css.match(
    /\.archive-spine-content\[hidden\]\s*\{(?<declarations>[^}]*)\}/,
  );

  assert.ok(hiddenStateRule, "missing the collapsed archive hidden-state rule");
  assert.match(hiddenStateRule.groups.declarations, /display:\s*none\s*;/);
});

test("mobile archive drawer can reveal navigation from a collapsed preference", async () => {
  const css = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(
    css,
    /@media \(max-width: 860px\)[\s\S]*?\.archive-spine-content\[hidden\]\s*\{\s*display:\s*flex\s*!important;\s*\}/,
  );
});
