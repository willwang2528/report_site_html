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
    eyebrow: "POPUP RESEARCH / INDEX",
    summary: "移动端 Agent 弹窗研究的入口、交付关系与安全边界。",
    scope: "课题入口 · 研究边界 · 报告关系",
  },
  {
    slug: "principles",
    file: "01-popup-principles.md",
    kind: "底层原理",
    eyebrow: "INTERRUPT STACK / PRINCIPLES",
    summary:
      "解释弹窗的所有者、显示层、输入焦点与语义树，以及它为何会阻断移动端 Agent。",
    scope: "Android · iOS · Mobile Web / WebView",
  },
  {
    slug: "methods",
    file: "02-methods-comparison.md",
    kind: "方法对比",
    eyebrow: "RECOVERY POLICY / METHODS",
    summary:
      "比较状态预置、原生 watcher、语义 UI、OCR/VLM 与人工接管，并给出跨平台恢复架构。",
    scope: "检测 · 分类 · 决策 · 动作 · 验证 · 恢复",
  },
  {
    slug: "principles-brief",
    file: "03-popup-principles-brief.md",
    kind: "论文精读",
    eyebrow: "PAPER READING / PERMISSION LITERACY",
    summary:
      "拆解移动 GUI Agent 的权限素养、任务条件化请求者偏差，以及提示缓解中的安全—可用性权衡。",
    scope: "权限素养 · 最小权限 · 任务先验 · 提示缓解",
    ogImage: "/research-mobile/popup-assets/2608.04755/figure-2.png",
  },
];

marked.use({ gfm: true, breaks: false });

function rewriteMarkdownLinks(markdown) {
  return markdown
    .replaceAll("(./01-popup-principles.md)", "(/research-mobile/popup/principles)")
    .replaceAll("(./02-methods-comparison.md)", "(/research-mobile/popup/methods)");
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
  const rendered = render(raw, definition.slug);
  const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? definition.kind;
  const date = raw.match(/^- 日期：(.+)$/m)?.[1]?.trim() ?? "2026-08-06";

  reports.push({
    ...definition,
    title,
    date,
    sourceHash: createHash("sha256").update(raw).digest("hex"),
    raw,
    html: rendered.html,
    headings: rendered.headings,
    sections: makeSections(raw, definition.slug),
  });
}

await writeFile(
  path.join(outputDir, "reports.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${reports.length} reports.`);
