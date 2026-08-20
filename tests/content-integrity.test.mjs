import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const expected = {
  index: {
    file: "README.md",
    hash: "837d77f1dca8d6d59c171b707b36cbf55771383c401e4a6996aaee85202e657c",
    h2: 0,
    tables: 0,
    codeBlocks: 0,
    links: 2,
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
      (raw.match(/\[[^\]]+\]\([^)]+\)/g) ?? []).length,
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
