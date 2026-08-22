import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content", "research-mobile", "popup");
const outputDir = path.join(root, "lib", "generated");

const definitions = [
  {
    slug: "index",
    file: "README.md",
    kind: "课题索引",
    module: "index",
    eyebrow: "POPUP RESEARCH / INDEX",
    summary: "移动端 Agent 弹窗研究的入口、交付关系与安全边界。",
    scope: "课题入口 · 研究边界 · 报告关系",
  },
  {
    slug: "principles",
    file: "01-popup-principles.md",
    kind: "底层原理",
    module: "solutions",
    eyebrow: "INTERRUPT STACK / PRINCIPLES",
    summary:
      "解释弹窗的所有者、显示层、输入焦点与语义树，以及它为何会阻断移动端 Agent。",
    scope: "Android · iOS · Mobile Web / WebView",
  },
  {
    slug: "methods",
    file: "02-methods-comparison.md",
    kind: "方法对比",
    module: "solutions",
    eyebrow: "RECOVERY POLICY / METHODS",
    summary:
      "比较状态预置、原生 watcher、语义 UI、OCR/VLM 与人工接管，并给出跨平台恢复架构。",
    scope: "检测 · 分类 · 决策 · 动作 · 验证 · 恢复",
  },
  {
    slug: "principles-brief",
    file: "03-popup-principles-brief.md",
    kind: "论文精读",
    module: "papers",
    eyebrow: "PAPER READING / PERMISSION LITERACY",
    summary:
      "拆解移动 GUI Agent 的权限素养、任务条件化请求者偏差，以及提示缓解中的安全—可用性权衡。",
    scope: "权限素养 · 最小权限 · 任务先验 · 提示缓解",
    ogImage: "/research-mobile/popup-assets/2608.04755/figure-2.png",
  },
  {
    slug: "vlm-fuzz",
    file: "04-vlm-fuzz.md",
    kind: "论文精读",
    module: "papers",
    eyebrow: "PAPER READING / VLM-FUZZ",
    summary:
      "拆解 Android 测试器如何把 Dialog、Popup 与 Spinner 建模为临时状态，并在关闭后恢复宿主 DFS。",
    scope: "临时状态 · 宿主差分 · 路径重放 · 多入口测试",
    ogImage: "/research-mobile/popup-assets/vlm-fuzz/fig-7-popup-state-space.png",
  },
  {
    slug: "popsweeper",
    file: "05-popsweeper.md",
    kind: "论文精读",
    module: "papers",
    eyebrow: "PAPER READING / POPSWEEPER",
    summary:
      "拆解 Android 测试器如何检测阻塞弹窗、定位关闭入口并把点击坐标回传给自动化脚本。",
    scope: "视觉检测 · 关闭控件定位 · 模拟回放 · Android",
    ogImage:
      "/research-mobile/popup-assets/popsweeper/page_007_fig_fig_3.png",
  },
  {
    slug: "sneaky-popups",
    file: "06-sneaky-popups.md",
    kind: "论文精读",
    module: "papers",
    eyebrow: "PAPER READING / POKER",
    summary:
      "拆解 Poker 如何识别弹窗区域、点击候选控件直到弹窗消失，并继续采集 Android 应用。",
    scope: "欺骗弹窗 · 视觉识别 · 消失验证 · Android",
    ogImage:
      "/research-mobile/popup-assets/sneaky-popups/page_003_fig_figure_2.png",
  },
  {
    slug: "whispertest",
    file: "07-whispertest.md",
    kind: "论文精读",
    module: "papers",
    eyebrow: "PAPER READING / WHISPERTEST",
    summary:
      "拆解非越狱 iPhone 如何结合可访问性、OCR 与 Voice Control，完成阻塞弹窗的真机交互。",
    scope: "Accessibility · OCR · Voice Control · iOS",
    ogImage:
      "/research-mobile/popup-assets/whispertest/page_003_fig_figure_1.png",
  },
  {
    slug: "cookieverse",
    file: "08-cookieverse.md",
    kind: "论文精读",
    module: "papers",
    eyebrow: "PAPER READING / BANNERCLICK",
    summary:
      "拆解 BannerClick 如何在移动网页配置中识别 Cookie Banner，并进入设置面板继续执行拒绝。",
    scope: "Mobile Web · DOM · Cookie Banner · CMP",
    ogImage:
      "/research-mobile/popup-assets/cookieverse/page_007_fig_fig_1.png",
  },
];

marked.use({ gfm: true, breaks: false });

function rewriteMarkdownLinks(markdown) {
  return markdown
    .replaceAll("(./01-popup-principles.md)", "(/research-mobile/popup/principles)")
    .replaceAll("(./02-methods-comparison.md)", "(/research-mobile/popup/methods)")
    .replaceAll(
      "(./03-popup-principles-brief.md)",
      "(/research-mobile/popup/principles-brief)",
    )
    .replaceAll("(./04-vlm-fuzz.md)", "(/research-mobile/popup/vlm-fuzz)")
    .replaceAll("(./05-popsweeper.md)", "(/research-mobile/popup/popsweeper)")
    .replaceAll(
      "(./06-sneaky-popups.md)",
      "(/research-mobile/popup/sneaky-popups)",
    )
    .replaceAll("(./07-whispertest.md)", "(/research-mobile/popup/whispertest)")
    .replaceAll("(./08-cookieverse.md)", "(/research-mobile/popup/cookieverse)");
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, "");
}

function plainText(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .trim();
}

function render(markdown, prefix) {
  const parsed = marked.parse(rewriteMarkdownLinks(markdown));
  const headings = [];
  let headingIndex = 0;
  let html = parsed.replace(
    /<h([1-4])>([\s\S]*?)<\/h\1>/g,
    (_match, depth, inner) => {
      const id = `${prefix}-h${depth}-${headingIndex++}`;
      headings.push({ depth: Number(depth), id, text: plainText(inner) });
      return `<h${depth} id="${id}">${inner}</h${depth}>`;
    },
  );

  html = html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noreferrer"',
  );

  return { html, headings };
}

function makeSections(markdown, slug) {
  return markdown
    .split(/\n(?=#{2,3}\s+)/g)
    .filter((chunk) => chunk.trim().length > 0)
    .map((chunk, index) => {
      const heading = chunk.match(/^#{2,3}\s+(.+)$/m)?.[1] ?? "导读";
      const rendered = render(chunk, `${slug}-slide-${index}`);
      return {
        id: `${slug}-section-${index}`,
        title: heading.replace(/\*\*/g, "").trim(),
        html: rendered.html,
      };
    });
}

await mkdir(outputDir, { recursive: true });

const reports = [];
for (const definition of definitions) {
  const sourcePath = path.join(contentDir, definition.file);
  const raw = await readFile(sourcePath, "utf8");
  const source = stripFrontmatter(raw);
  const rendered = render(source, definition.slug);
  const title = source.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? definition.kind;
  const date =
    raw.match(/^- 日期：(.+)$/m)?.[1]?.trim() ??
    raw.match(/^date:\s*(.+)$/m)?.[1]?.trim() ??
    "2026-08-06";

  reports.push({
    ...definition,
    title,
    date,
    sourceHash: createHash("sha256").update(raw).digest("hex"),
    raw,
    html: rendered.html,
    headings: rendered.headings,
    sections: makeSections(source, definition.slug),
  });
}

await writeFile(
  path.join(outputDir, "reports.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${reports.length} reports.`);
