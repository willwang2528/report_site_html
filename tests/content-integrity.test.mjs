import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const expected = {
  index: {
    file: "README.md",
    hash: "1272ec71938947484c2ecce9baa7e7b6ddc6523836c3383293f6e1f5988748cc",
    h2: 0,
    tables: 0,
    codeBlocks: 0,
    links: 10,
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
  popsweeper: {
    file: "05-popsweeper.md",
    hash: "acd4b3ab82d12375bf6cd235598ba633cf3262da469150b0fedf31faacb4afed",
    h2: 12,
    tables: 2,
    codeBlocks: 0,
    links: 4,
    presentationSections: 27,
  },
  "sneaky-popups": {
    file: "06-sneaky-popups.md",
    hash: "b63290e172ce593c94a50d5de470f7d8ae02cf1cd6b69ac45de0376a6042f705",
    h2: 12,
    tables: 2,
    codeBlocks: 0,
    links: 4,
    presentationSections: 24,
  },
  whispertest: {
    file: "07-whispertest.md",
    hash: "15639994a13873a4c5227e480a173e026284cf21b6d5a9d70d9727eb309734da",
    h2: 12,
    tables: 1,
    codeBlocks: 0,
    links: 4,
    presentationSections: 27,
  },
  cookieverse: {
    file: "08-cookieverse.md",
    hash: "d8403d6146c9efe75d3bbb01324a1918e9bce79a25c4c7cb100e2f396b65686b",
    h2: 12,
    tables: 1,
    codeBlocks: 0,
    links: 6,
    presentationSections: 28,
  },
  "popup-paper-extracts": {
    file: "09-popup-paper-extracts.md",
    hash: "1b06074657bae36016139622e523b9daf1a7df510005965da7bd6cdc6ad47905",
    h2: 6,
    tables: 0,
    codeBlocks: 0,
    links: 5,
    presentationSections: 7,
  },
  "mobile-popup-solutions": {
    file: "10-mobile-popup-solutions.md",
    hash: "a0774d756894bea0fbbcf8586dea0cefce26dd4674936af75adda1254accf078",
    h2: 5,
    tables: 1,
    codeBlocks: 0,
    links: 19,
    presentationSections: 16,
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

test("published reports declare one of the three topic modules", () => {
  const published = generated.reports.filter((item) => item.slug !== "index");
  assert.deepEqual(
    published.map((item) => [item.slug, item.module]),
    [
      ["principles", "solutions"],
      ["methods", "solutions"],
      ["principles-brief", "papers"],
      ["vlm-fuzz", "papers"],
      ["popsweeper", "papers"],
      ["sneaky-popups", "papers"],
      ["whispertest", "papers"],
      ["cookieverse", "papers"],
      ["popup-paper-extracts", "extracts"],
      ["mobile-popup-solutions", "extracts"],
    ],
  );
});
