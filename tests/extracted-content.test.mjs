import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const generated = JSON.parse(
  await readFile(new URL("../lib/generated/reports.json", import.meta.url), "utf8"),
);

test("adds extracted content as a third module while preserving all five deep reads", () => {
  const fiveDeepReads = [
    "vlm-fuzz",
    "popsweeper",
    "sneaky-popups",
    "whispertest",
    "cookieverse",
  ];

  for (const slug of fiveDeepReads) {
    assert.equal(
      generated.reports.find((report) => report.slug === slug)?.module,
      "papers",
    );
  }

  assert.deepEqual(
    generated.reports
      .filter((report) => report.module === "extracts")
      .map((report) => report.slug),
    ["popup-paper-extracts", "mobile-popup-solutions"],
  );
});

test("the five-paper extraction stays inside discovery and closing boundaries", async () => {
  const raw = await readFile(
    new URL(
      "../content/research-mobile/popup/09-popup-paper-extracts.md",
      import.meta.url,
    ),
    "utf8",
  );

  for (const paper of [
    "VLM-Fuzz",
    "PopSweeper",
    "Poker",
    "WhisperTest",
    "Cookieverse",
  ]) {
    assert.match(raw, new RegExp(`^## \\d+\\. ${paper}`, "m"));
  }

  assert.match(raw, /核心提炼/g);
  assert.match(raw, /发现机制/);
  assert.match(raw, /控件来源/);
  assert.match(raw, /动作规则/);
  assert.match(raw, /点击执行/);
  assert.match(raw, /关闭判定/);
  assert.ok((raw.match(/<details>/g) ?? []).length >= 20);
  assert.equal((raw.match(/<details\s+open/g) ?? []).length, 0);
  assert.doesNotMatch(raw, /<summary>[^<]*展开[^<]*<\/summary>/);
});

test("the broader survey keeps practical popup handlers separate from exclusions", async () => {
  const raw = await readFile(
    new URL(
      "../content/research-mobile/popup/10-mobile-popup-solutions.md",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(raw, /^## 纳入标准$/m);
  assert.match(raw, /^## 论文方法$/m);
  assert.match(raw, /^## 工程实现$/m);
  assert.match(raw, /^## 明确排除$/m);
  assert.match(raw, /发现/);
  assert.match(raw, /关闭/);
  assert.doesNotMatch(raw, /弹窗消失.*任务恢复成功/);
});
