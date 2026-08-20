import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname, origin = "http://localhost") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  const requestUrl = new URL(pathname, origin);
  return worker.fetch(
    new Request(`${origin}${pathname}`, {
      headers: {
        accept: "text/html",
        host: requestUrl.host,
        "x-forwarded-host": requestUrl.host,
        "x-forwarded-proto": requestUrl.protocol.slice(0, -1),
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the research archive home", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /弹窗不是一个框/);
  assert.match(html, /research-移动端/);
  assert.equal((html.match(/href="\/research-mobile"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

for (const [path, title, proof] of [
  [
    "/research-mobile/popup/principles",
    "移动端 UI 弹窗底层原理调研",
    "普通 UI 弹窗通常不是人类检测",
  ],
  [
    "/research-mobile/popup/methods",
    "移动端弹窗自动化：现有方法对比",
    "不存在一个在 Android、iOS、Web",
  ],
]) {
  test(`server-renders ${path}`, async () => {
    const response = await render(path, "https://reports.example");
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    assert.match(html, new RegExp(title));
    assert.match(html, new RegExp(proof));
    assert.match(html, new RegExp(`<title>[^<]*${title}[^<]*</title>`));
    assert.match(
      html,
      /property="og:image" content="https:\/\/reports\.example\/og\.png"/,
    );
    assert.match(html, /布局编排/);
    assert.match(html, /编排预览/);
    assert.match(html, /Markdown 原文/);
    assert.match(html, /<table>/);
  });
}

test("renders the complete hierarchy and rejects unknown reports", async () => {
  for (const path of ["/research-mobile", "/research-mobile/popup"]) {
    const response = await render(path);
    assert.equal(response.status, 200);
  }
  const missing = await render("/research-mobile/popup/not-a-report");
  assert.equal(missing.status, 404);
});

test("critical site navigation avoids the broken vinext client Link runtime", async () => {
  for (const source of [
    "../app/page.tsx",
    "../app/research-mobile/page.tsx",
    "../app/research-mobile/popup/page.tsx",
    "../app/components/ResearchShell.tsx",
  ]) {
    const code = await readFile(new URL(source, import.meta.url), "utf8");
    assert.doesNotMatch(code, /next\/link/);
  }
});
