"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReportRecord } from "@/lib/reports";

type ViewMode = "read" | "present" | "compose" | "custom" | "source";
type SectionWidth = "full" | "half";
type SectionLayout = {
  id: string;
  width: SectionWidth;
  hidden: boolean;
};

const LAYOUT_VERSION = 1;
const REPORT_OUTLINE_COLLAPSED_KEY = "research-archive:report-outline-collapsed";

function createDefaultLayout(report: ReportRecord): SectionLayout[] {
  return report.sections.map((section) => ({
    id: section.id,
    width: "full",
    hidden: false,
  }));
}

function normalizeLayout(
  value: unknown,
  report: ReportRecord,
): SectionLayout[] | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as {
    version?: unknown;
    sourceHash?: unknown;
    sections?: unknown;
  };
  if (
    candidate.version !== LAYOUT_VERSION ||
    candidate.sourceHash !== report.sourceHash ||
    !Array.isArray(candidate.sections)
  ) {
    return null;
  }

  const validIds = new Set(report.sections.map((section) => section.id));
  const seen = new Set<string>();
  const normalized: SectionLayout[] = [];

  for (const item of candidate.sections) {
    if (!item || typeof item !== "object") continue;
    const section = item as Partial<SectionLayout>;
    if (
      typeof section.id !== "string" ||
      !validIds.has(section.id) ||
      seen.has(section.id)
    ) {
      continue;
    }
    seen.add(section.id);
    normalized.push({
      id: section.id,
      width: section.width === "half" ? "half" : "full",
      hidden: section.hidden === true,
    });
  }

  for (const section of report.sections) {
    if (!seen.has(section.id)) {
      normalized.push({ id: section.id, width: "full", hidden: false });
    }
  }
  return normalized;
}

export function ReportReader({ report }: { report: ReportRecord }) {
  const [mode, setMode] = useState<ViewMode>("read");
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState("");
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const [layout, setLayout] = useState<SectionLayout[]>(() =>
    createDefaultLayout(report),
  );
  const [hasStoredLayout, setHasStoredLayout] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const slideRef = useRef<HTMLElement>(null);

  const layoutKey = `research-archive:layout:${report.slug}:${report.sourceHash}`;
  const toc = useMemo(
    () => report.headings.filter((heading) => heading.depth === 2),
    [report.headings],
  );
  const sectionById = useMemo(
    () => new Map(report.sections.map((section) => [section.id, section])),
    [report.sections],
  );
  const arrangedLayoutSections = useMemo(
    () =>
      layout
        .filter((item) => !item.hidden)
        .map((item) => ({ ...item, section: sectionById.get(item.id) }))
        .filter(
          (
            item,
          ): item is SectionLayout & {
            section: ReportRecord["sections"][number];
          } => Boolean(item.section),
        ),
    [layout, sectionById],
  );
  const arrangedSections = useMemo(() => {
    const visible = arrangedLayoutSections.map((item) => item.section);
    return visible.length > 0 ? visible : report.sections;
  }, [arrangedLayoutSections, report.sections]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setOutlineCollapsed(
          window.localStorage.getItem(REPORT_OUTLINE_COLLAPSED_KEY) === "true",
        );
      } catch {
        setOutlineCollapsed(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const fallback = createDefaultLayout(report);
      try {
        const raw = window.localStorage.getItem(layoutKey);
        if (!raw) {
          setLayout(fallback);
          setHasStoredLayout(false);
          return;
        }
        const stored = normalizeLayout(JSON.parse(raw), report);
        setLayout(stored ?? fallback);
        setHasStoredLayout(Boolean(stored));
      } catch {
        setLayout(fallback);
        setHasStoredLayout(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [layoutKey, report]);

  useEffect(() => {
    if (mode !== "read") return;
    const onScroll = () => {
      const root = document.documentElement;
      const range = root.scrollHeight - root.clientHeight;
      setProgress(range > 0 ? window.scrollY / range : 0);

      let current = "";
      for (const heading of toc) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= 180) {
          current = heading.id;
        }
      }
      setActiveHeading(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode, toc]);

  useEffect(() => {
    if (mode !== "present") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const slideElement = slideRef.current;
      const canScrollDown =
        slideElement &&
        slideElement.scrollTop + slideElement.clientHeight <
          slideElement.scrollHeight - 8;
      const canScrollUp = slideElement && slideElement.scrollTop > 8;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSlide((value) =>
          Math.min(value + 1, arrangedSections.length - 1),
        );
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSlide((value) => Math.max(value - 1, 0));
      }
      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === " "
      ) {
        event.preventDefault();
        if (canScrollDown) {
          slideElement.scrollBy({
            top: slideElement.clientHeight * 0.72,
            behavior: "smooth",
          });
        } else {
          setSlide((value) =>
            Math.min(value + 1, arrangedSections.length - 1),
          );
        }
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        if (canScrollUp) {
          slideElement.scrollBy({
            top: slideElement.clientHeight * -0.72,
            behavior: "smooth",
          });
        } else {
          setSlide((value) => Math.max(value - 1, 0));
        }
      }
      if (event.key === "Escape") {
        if (document.fullscreenElement) void document.exitFullscreen();
        setMode("read");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [arrangedSections.length, mode]);

  useEffect(() => {
    if (mode !== "present") return;
    const element = slideRef.current;
    element?.scrollTo({ top: 0 });
    element?.focus({ preventScroll: true });
  }, [mode, slide]);

  function persistLayout(next: SectionLayout[]) {
    setLayout(next);
    setHasStoredLayout(true);
    try {
      window.localStorage.setItem(
        layoutKey,
        JSON.stringify({
          version: LAYOUT_VERSION,
          report: report.slug,
          sourceHash: report.sourceHash,
          sections: next,
        }),
      );
    } catch {
      setHasStoredLayout(false);
    }
  }

  function toggleOutline() {
    setOutlineCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(
          REPORT_OUTLINE_COLLAPSED_KEY,
          String(next),
        );
      } catch {
        // The current page still updates when browser storage is unavailable.
      }
      return next;
    });
  }

  function moveSection(id: string, delta: number) {
    const index = layout.findIndex((item) => item.id === id);
    const target = Math.max(0, Math.min(index + delta, layout.length - 1));
    if (index < 0 || index === target) return;
    const next = [...layout];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    persistLayout(next);
  }

  function dropSection(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const next = [...layout];
    const sourceIndex = next.findIndex((item) => item.id === sourceId);
    if (sourceIndex < 0) return;
    const [moved] = next.splice(sourceIndex, 1);
    const targetIndex = next.findIndex((item) => item.id === targetId);
    if (targetIndex < 0) return;
    next.splice(targetIndex, 0, moved);
    persistLayout(next);
  }

  function updateSection(id: string, change: Partial<SectionLayout>) {
    persistLayout(
      layout.map((item) => (item.id === id ? { ...item, ...change } : item)),
    );
  }

  function resetLayout() {
    setLayout(createDefaultLayout(report));
    setHasStoredLayout(false);
    window.localStorage.removeItem(layoutKey);
  }

  function downloadMarkdown() {
    downloadFile(
      report.file,
      report.raw,
      "text/markdown;charset=utf-8",
    );
  }

  function downloadLayout() {
    downloadFile(
      `${report.slug}-layout.json`,
      JSON.stringify(
        {
          version: LAYOUT_VERSION,
          report: report.slug,
          sourceHash: report.sourceHash,
          sections: layout,
        },
        null,
        2,
      ),
      "application/json;charset=utf-8",
    );
  }

  function downloadFile(name: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function enterFullscreen() {
    if (document.fullscreenElement) return;
    await document.documentElement.requestFullscreen?.();
  }

  async function exitPresentation() {
    if (document.fullscreenElement) await document.exitFullscreen();
    setMode("read");
  }

  if (mode === "present") {
    const current = arrangedSections[slide] ?? arrangedSections[0];
    if (!current) return null;
    return (
      <section
        className="presentation-view"
        aria-label={`${report.title} 演示模式`}
      >
        <header className="presentation-toolbar">
          <div>
            <span>{report.kind}</span>
            <strong>{report.title}</strong>
          </div>
          <div className="presentation-actions">
            <button type="button" onClick={enterFullscreen}>
              进入全屏
            </button>
            <button type="button" onClick={exitPresentation}>
              退出演示
            </button>
          </div>
        </header>
        <article
          ref={slideRef}
          tabIndex={-1}
          className="presentation-slide markdown-body"
          dangerouslySetInnerHTML={{ __html: current.html }}
        />
        <footer className="presentation-footer">
          <button
            type="button"
            disabled={slide === 0}
            onClick={() => setSlide((value) => Math.max(value - 1, 0))}
          >
            ← 上一节
          </button>
          <div
            className="slide-progress"
            aria-label={`第 ${slide + 1} 节，共 ${arrangedSections.length} 节`}
          >
            <span>{String(slide + 1).padStart(2, "0")}</span>
            <i
              style={{
                transform: `scaleX(${
                  (slide + 1) / arrangedSections.length
                })`,
              }}
            />
            <span>{String(arrangedSections.length).padStart(2, "0")}</span>
          </div>
          <button
            type="button"
            disabled={slide === arrangedSections.length - 1}
            onClick={() =>
              setSlide((value) =>
                Math.min(value + 1, arrangedSections.length - 1),
              )
            }
          >
            下一节 →
          </button>
        </footer>
      </section>
    );
  }

  return (
    <div className="report-page">
      <div className="reading-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <header className="report-hero">
        <p className="report-eyebrow">{report.eyebrow}</p>
        <h1>{report.title}</h1>
        <p className="report-summary">{report.summary}</p>
        <dl className="report-facts">
          <div>
            <dt>主题</dt>
            <dd>reasearch-移动端弹窗问题</dd>
          </div>
          <div>
            <dt>范围</dt>
            <dd>{report.scope}</dd>
          </div>
          <div>
            <dt>更新</dt>
            <dd>{report.date}</dd>
          </div>
          <div>
            <dt>源文件</dt>
            <dd>{report.file}</dd>
          </div>
        </dl>
        <div className="view-switcher" role="group" aria-label="报告视图">
          <button
            type="button"
            className={mode === "read" ? "active" : ""}
            onClick={() => setMode("read")}
          >
            阅读
          </button>
          <button
            type="button"
            onClick={() => {
              setSlide(0);
              setMode("present");
            }}
          >
            演示
          </button>
          <button
            type="button"
            className={mode === "compose" ? "active" : ""}
            onClick={() => setMode("compose")}
          >
            布局编排
          </button>
          <button
            type="button"
            className={mode === "custom" ? "active" : ""}
            onClick={() => setMode("custom")}
          >
            编排预览
          </button>
          <button
            type="button"
            className={mode === "source" ? "active" : ""}
            onClick={() => setMode("source")}
          >
            Markdown 原文
          </button>
          <button type="button" onClick={downloadMarkdown}>
            下载 .md
          </button>
        </div>
      </header>

      {mode === "source" ? (
        <section className="source-panel" aria-label="Markdown 原文">
          <div className="source-panel-heading">
            <span>SHA-256</span>
            <code>{report.sourceHash}</code>
          </div>
          <pre>{report.raw}</pre>
        </section>
      ) : mode === "compose" ? (
        <section className="layout-studio" aria-label="报告布局编排">
          <header className="layout-studio-header">
            <div>
              <p>LOCAL-FIRST COMPOSER</p>
              <h2>拖拽章节，交给网格自动对齐</h2>
              <span>
                这里只改变本机的展示顺序、宽度和可见性；Markdown
                原文与默认阅读顺序保持不变。
              </span>
            </div>
            <div className="layout-studio-actions">
              <button type="button" onClick={() => setMode("custom")}>
                查看编排结果
              </button>
              <button type="button" onClick={downloadLayout}>
                导出布局 JSON
              </button>
              <button
                type="button"
                disabled={!hasStoredLayout}
                onClick={resetLayout}
              >
                恢复原序
              </button>
            </div>
          </header>
          <p className="layout-storage-note" role="status">
            {hasStoredLayout
              ? "布局已保存在当前浏览器；演示模式会立即采用这套顺序。"
              : "当前使用仓库默认顺序；第一次调整后会自动保存到浏览器。"}
          </p>
          <div className="layout-grid">
            {layout.map((item, index) => {
              const section = sectionById.get(item.id);
              if (!section) return null;
              return (
                <article
                  key={item.id}
                  draggable
                  className={`layout-card layout-card-${item.width} ${
                    item.hidden ? "layout-card-hidden" : ""
                  } ${draggedId === item.id ? "dragging" : ""} ${
                    dropTargetId === item.id ? "drop-target" : ""
                  }`}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", item.id);
                    setDraggedId(item.id);
                  }}
                  onDragEnter={() => setDropTargetId(item.id)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const sourceId =
                      event.dataTransfer.getData("text/plain") || draggedId;
                    if (sourceId) dropSection(sourceId, item.id);
                    setDraggedId(null);
                    setDropTargetId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDropTargetId(null);
                  }}
                >
                  <header className="layout-card-header">
                    <span className="layout-drag-handle" aria-hidden="true">
                      ⠿
                    </span>
                    <span className="layout-card-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{section.title}</strong>
                  </header>
                  <div className="layout-card-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSection(item.id, -1)}
                      aria-label={`上移 ${section.title}`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === layout.length - 1}
                      onClick={() => moveSection(item.id, 1)}
                      aria-label={`下移 ${section.title}`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(item.id, {
                          width: item.width === "full" ? "half" : "full",
                        })
                      }
                    >
                      {item.width === "full" ? "半宽" : "通栏"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(item.id, { hidden: !item.hidden })
                      }
                    >
                      {item.hidden ? "显示" : "隐藏"}
                    </button>
                  </div>
                  <div
                    className="layout-card-preview markdown-body"
                    aria-hidden={item.hidden}
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                </article>
              );
            })}
          </div>
        </section>
      ) : mode === "custom" ? (
        <section className="custom-layout-view" aria-label="报告编排预览">
          <header className="custom-layout-header">
            <div>
              <p>COMPOSED HTML VIEW</p>
              <h2>编排结果</h2>
            </div>
            <span>
              当前浏览器的顺序、通栏/半宽和隐藏设置已经应用；原始阅读视图仍保持论文式顺序。
            </span>
          </header>
          {arrangedLayoutSections.length > 0 ? (
            <div className="custom-layout-grid">
              {arrangedLayoutSections.map((item) => (
                <article
                  key={item.id}
                  className={`custom-layout-card custom-layout-card-${item.width} markdown-body`}
                  dangerouslySetInnerHTML={{ __html: item.section.html }}
                />
              ))}
            </div>
          ) : (
            <div className="custom-layout-empty">
              当前所有章节都被隐藏。返回“布局编排”恢复至少一个章节。
            </div>
          )}
        </section>
      ) : (
        <div
          className={`report-reading-grid ${
            outlineCollapsed ? "report-outline-collapsed" : ""
          }`}
        >
          <aside className="report-toc-shell">
            <button
              className="report-toc-toggle"
              type="button"
              aria-expanded={!outlineCollapsed}
              aria-controls={`report-outline-${report.slug}`}
              aria-label={
                outlineCollapsed ? "展开本文目录" : "收起本文目录"
              }
              onClick={toggleOutline}
            >
              <span>本文目录</span>
              <i aria-hidden="true">{outlineCollapsed ? "›" : "‹"}</i>
            </button>
            <nav
              id={`report-outline-${report.slug}`}
              className="report-toc"
              aria-label="本文目录"
              hidden={outlineCollapsed}
            >
              {toc.map((heading) => (
                <a
                  key={heading.id}
                  className={activeHeading === heading.id ? "active" : ""}
                  href={`#${heading.id}`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </aside>
          <article
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: report.html }}
          />
        </div>
      )}
    </div>
  );
}
