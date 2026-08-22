# Research Archive HTML

一个以 `GitHub + OpenAI Sites` 发布的分层研究报告站。首个主题为 `reasearch-移动端弹窗问题`，首个课题为 `Popup Research`。

## 内容结构

```text
Workspace
└── Theme: reasearch-移动端弹窗问题
    └── Topic: Popup Research
        ├── 课题目录索引
        ├── 底层解决方法
        │   ├── 底层原理调研报告
        │   └── 现有方法对比
        └── 论文模块
            ├── 权限素养论文精读
            └── VLM-Fuzz 论文精读
```

站点路由：

- `/`：研究档案总入口
- `/research-mobile`：`reasearch-移动端弹窗问题` 主题页
- `/research-mobile/popup`：Popup Research 课题索引
- `/research-mobile/popup/principles`：底层原理调研
- `/research-mobile/popup/methods`：现有方法对比
- `/research-mobile/popup/principles-brief`：权限素养论文精读
- `/research-mobile/popup/vlm-fuzz`：VLM-Fuzz 论文精读

## 原始材料与 HTML

五份 Markdown 原文保存在 `content/research-mobile/popup/`。构建前，`scripts/generate-reports.mjs` 会：

1. 读取可信的仓库内 Markdown；
2. 保持原有标题、段落、列表、表格、代码块与链接顺序；
3. 把相对 `.md` 交叉链接改为稳定站内路由；
4. 生成章节锚点、演示章节和 HTML；
5. 写入 `lib/generated/reports.json` 供 Worker 安全导入。

报告页面提供阅读、布局编排、全屏演示、Markdown 原文查看和 `.md` 下载。原文件 SHA-256 由测试锁定。

## 布局编排架构

首版采用无后端的 local-first 模式：

- 章节可拖拽，也可用上下按钮进行无障碍排序；
- 每个章节可切换通栏/半宽，由 CSS Grid 自动对齐；
- 章节可在编排预览与演示中隐藏；
- “编排预览”会把顺序、列宽和隐藏设置应用到完整 HTML 结果，演示模式同步采用自定义顺序；
- 布局按“报告 slug + 原文 SHA-256”保存在浏览器 `localStorage`；原文变化后不会误用旧布局；
- 可导出布局 JSON，作为后续 GitHub 审核或团队同步的数据格式。

布局编排不会改写 Markdown，也不会改变默认阅读页的论证顺序。当前 GitHub 保存内容源码，Sites 负责运行与展示；首版不依赖 Supabase、D1 或个人服务器。若后续需要多人实时共享同一布局，可保持现有 JSON 数据结构，再接 Sites D1 或 Supabase，而无需重写报告渲染层。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
npm test
```

`npm test` 会重新生成报告、构建 Sites Worker，并核验内容结构与所有公开路由。

## 内容来源

当前快照来自：

- `/Users/will/Documents/ARIS-paper/popup/README.md`
- `/Users/will/Documents/ARIS-paper/popup/01-popup-principles.md`
- `/Users/will/Documents/ARIS-paper/popup/02-methods-comparison.md`
- `/Users/will/Documents/ARIS-paper/paper/notes/20 Papers/gui-agent-security/Allow_to_Achieve_Over_Privileged_Inadvertently_深读笔记/Allow_to_Achieve_Over_Privileged_Inadvertently_深读笔记.md`
- `/Users/will/Documents/ARIS-paper/paper/notes/20 Papers/gui-agent-testing/VLM-Fuzz_深读笔记/VLM-Fuzz_深读笔记.md`

源研究文件不在构建过程中修改。更新站点内容时，应重新复制原文并运行测试确认哈希与结构变化符合预期。
