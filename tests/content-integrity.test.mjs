import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const expected = {
  index: {
    file: "README.md",
    hash: "94ae66f16b841b0e8ed9e54839e031e8ceb484c7b1078017caf153b6f73d950b",
    h2: 0,
    tables: 0,
    codeBlocks: 0,
    links: 4,
    presentationSections: 1,
  },
  principles: {
    file: "01-popup-principles.md",
    hash: "7407bd7bf98d813935aa612ef61c10cc5cff23478e7cdb17081e76745e18dfaf",
    h2: 10,
    tables: 2,
    codeBlocks: 2,
    links: 16,
    presentationSections: 20,
  },
  methods: {
    file: "02-methods-comparison.md",
    hash: "3311755e193042125762b3698f4d6945ad6c0b0554de4922624a3251322d978a",
    h2: 9,
    tables: 5,
    codeBlocks: 7,
    links: 20,
    presentationSections: 22,
  },
  "principles-brief": {
    file: "03-popup-principles-brief.md",
    hash: "61cc0fec3f953cd89116bb5bdaacef54e9fb6a794fc6e40abc750d02aadd0561",
    h2: 10,
    tables: 4,
    codeBlocks: 2,
    links: 3,
    presentationSections: 11,
  },
  "vlm-fuzz": {
    file: "04-vlm-fuzz.md",
    hash: "4c9d6a26eec0153476b9521fefa8a4eff9a9d3c0488549e9a493c41ec935897d",
    h2: 8,
    tables: 2,
    codeBlocks: 2,
    links: 3,
    presentationSections: 15,
  },
};

const generated = JSON.parse(
  await readFile(new URL("../lib/generated/reports.json", import.meta.url), "utf8"),
);

for (const [slug, baseline] of Object.entries(expected)) {
  test(`${slug} keeps the original Markdown logic and structure`, async () => {
    const raw = await readFile(
      new URL(`../content/research-mobile/popup/${baseline.file}`, import.meta.url),
      "utf8",
    );
    const report = generated.reports.find((item) => item.slug === slug);
    assert.ok(report);
    assert.equal(report.raw, raw);
    assert.equal(createHash("sha256").update(raw).digest("hex"), baseline.hash);
    assert.equal((raw.match(/^##\s/gm) ?? []).length, baseline.h2);
    assert.equal(
      (raw.match(/^\|(?:\s*:?-{3,}:?\s*\|)+$/gm) ?? []).length,
      baseline.tables,
    );
    assert.equal((raw.match(/^```/gm) ?? []).length / 2, baseline.codeBlocks);
    assert.equal(
      (raw.match(/(?<!!)\[[^\]]+\]\([^)]+\)/g) ?? []).length,
      baseline.links,
    );
    assert.equal((report.html.match(/<table>/g) ?? []).length, baseline.tables);
    assert.equal((report.html.match(/<pre>/g) ?? []).length, baseline.codeBlocks);
    assert.equal((report.html.match(/<a\s/g) ?? []).length, baseline.links);
    assert.equal(report.sections.length, baseline.presentationSections);

    const markdownHeadings = [...raw.matchAll(/^(#{1,4})\s+(.+)$/gm)].map(
      ([, marks, text]) => ({ depth: marks.length, text: text.trim() }),
    );
    assert.deepEqual(report.headings, markdownHeadings.map((heading, index) => ({
      ...heading,
      id: `${slug}-h${heading.depth}-${index}`,
    })));
  });
}

test("rewrites Markdown cross-links to stable site routes", () => {
  const methods = generated.reports.find((item) => item.slug === "methods");
  assert.match(methods.html, /href="\/research-mobile\/popup\/principles"/);
  assert.doesNotMatch(methods.html, /\.\/01-popup-principles\.md/);
});

test("every table-of-contents target has a stable heading id", () => {
  for (const report of generated.reports) {
    for (const heading of report.headings) {
      assert.match(report.html, new RegExp(`id="${heading.id}"`));
    }
  }
});

test("published reports declare one of the two topic modules", () => {
  const published = generated.reports.filter((item) => item.slug !== "index");
  assert.deepEqual(
    published.map((item) => [item.slug, item.module]),
    [
      ["principles", "solutions"],
      ["methods", "solutions"],
      ["principles-brief", "papers"],
      ["vlm-fuzz", "papers"],
    ],
  );
});
