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
  assert.match(html, /reasearch-移动端弹窗问题/);
  assert.equal((html.match(/href="\/research-mobile"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

for (const [path, title, proof, ogImage] of [
  [
    "/research-mobile/popup/principles",
    "移动端 UI 弹窗底层原理调研",
    "普通 UI 弹窗通常不是人类检测",
    "og.png",
  ],
  [
    "/research-mobile/popup/methods",
    "移动端弹窗自动化：现有方法对比",
    "不存在一个在 Android、iOS、Web",
    "og.png",
  ],
  [
    "/research-mobile/popup/principles-brief",
    "“允许”以完成任务，却在无意中授予过多权限",
    "任务条件化的请求者身份偏差",
    "research-mobile/popup-assets/2608.04755/figure-2.png",
  ],
  [
    "/research-mobile/popup/vlm-fuzz",
    "VLM-Fuzz：把弹窗建模为可回放的临时状态",
    "关闭弹窗后，再比较宿主",
    "research-mobile/popup-assets/vlm-fuzz/fig-7-popup-state-space.png",
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
      new RegExp(
        `property="og:image" content="https://reports\\.example/${ogImage.replaceAll(".", "\\.")}"`,
      ),
    );
    assert.match(html, /布局编排/);
    assert.match(html, /编排预览/);
    assert.match(html, /Markdown 原文/);
    assert.match(html, /<table>/);
  });
}

test("publishes the paper deep reading and its primary result figure", async () => {
  const response = await render("/research-mobile/popup/principles-brief");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /href="https:\/\/arxiv\.org\/abs\/2608\.04755"/);
  assert.match(
    html,
    /src="\/research-mobile\/popup-assets\/2608\.04755\/figure-2\.png"/,
  );
  assert.match(html, /26\/32/);
  assert.match(html, /0\/32/);
  assert.doesNotMatch(html, /Android 17 QPR2 Beta 3/);

  const png = await readFile(
    new URL(
      "../dist/client/research-mobile/popup-assets/2608.04755/figure-2.png",
      import.meta.url,
    ),
  );
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("publishes the VLM-Fuzz deep reading with formal-version evidence", async () => {
  const response = await render("/research-mobile/popup/vlm-fuzz");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /href="https:\/\/doi\.org\/10\.1007\/s10664-026-10816-4"/);
  assert.match(html, /52 个独特崩溃/);
  assert.match(html, /68\.5%/);
  assert.match(html, /没有弹窗专项成功率/);
  assert.match(html, /150 像素/);
  assert.match(
    html,
    /src="\/research-mobile\/popup-assets\/vlm-fuzz\/fig-7-popup-state-space\.png"/,
  );

  const png = await readFile(
    new URL(
      "../dist/client/research-mobile/popup-assets/vlm-fuzz/fig-7-popup-state-space.png",
      import.meta.url,
    ),
  );
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("groups reports into solution and paper modules", async () => {
  const response = await render("/research-mobile/popup");
  assert.equal(response.status, 200);
  const html = await response.text();
  const solutionsHeading = html.indexOf("底层解决方法");
  const principles = html.indexOf('href="/research-mobile/popup/principles"');
  const methods = html.indexOf('href="/research-mobile/popup/methods"');
  const papersHeading = html.indexOf("论文模块");
  const brief = html.indexOf('href="/research-mobile/popup/principles-brief"');
  const vlmFuzz = html.indexOf('href="/research-mobile/popup/vlm-fuzz"');
  assert.ok(solutionsHeading >= 0);
  assert.ok(principles > solutionsHeading);
  assert.ok(methods > principles);
  assert.ok(papersHeading > methods);
  assert.ok(brief > papersHeading);
  assert.ok(vlmFuzz > brief);
  assert.doesNotMatch(html, />当前报告</);
});

test("renames the mobile research theme across its hierarchy", async () => {
  for (const path of ["/", "/research-mobile", "/research-mobile/popup/vlm-fuzz"]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /reasearch-移动端弹窗问题/);
  }
});

test("report pages do not reserve space for the decorative interrupt stack", async () => {
  const response = await render("/research-mobile/popup/principles-brief");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.doesNotMatch(html, /前景所有者中断栈/);
  assert.doesNotMatch(html, /INTERRUPT/);
  assert.doesNotMatch(html, /FOREGROUND OWNERS/);
});

test("report pages expose independent controls for the archive and article outlines", async () => {
  const response = await render("/research-mobile/popup/principles-brief");
  assert.equal(response.status, 200);
  const html = await response.text();
  const buttons = html.match(/<button\b[^>]*>/g) ?? [];
  const archiveToggle = buttons.find((button) =>
    button.includes('aria-label="收起研究档案导航"'),
  );
  const articleToggle = buttons.find((button) =>
    button.includes('aria-label="收起本文目录"'),
  );

  assert.ok(archiveToggle, "missing archive navigation collapse control");
  assert.match(archiveToggle, /aria-expanded="true"/);
  assert.match(archiveToggle, /aria-controls="archive-navigation-content"/);
  assert.ok(articleToggle, "missing article outline collapse control");
  assert.match(articleToggle, /aria-expanded="true"/);
  assert.match(articleToggle, /aria-controls="report-outline-principles-brief"/);
});

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
