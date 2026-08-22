"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- vinext production Link navigation is broken; force document loads. */
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ARCHIVE_COLLAPSED_KEY = "research-archive:archive-collapsed";

const reportLinks = [
  { href: "/research-mobile/popup", label: "课题目录索引", code: "INDEX" },
  {
    href: "/research-mobile/popup/principles",
    label: "底层原理调研",
    code: "PRINCIPLES",
  },
  {
    href: "/research-mobile/popup/methods",
    label: "现有方法对比",
    code: "METHODS",
  },
  {
    href: "/research-mobile/popup/principles-brief",
    label: "底层原理调研（简述版）",
    code: "BRIEF",
  },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/research-mobile/popup") return pathname === href;
  return pathname.startsWith(href);
}

export function ResearchShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [archiveCollapsed, setArchiveCollapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setArchiveCollapsed(
          window.localStorage.getItem(ARCHIVE_COLLAPSED_KEY) === "true",
        );
      } catch {
        setArchiveCollapsed(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleArchive() {
    setArchiveCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(ARCHIVE_COLLAPSED_KEY, String(next));
      } catch {
        // The current page still updates when browser storage is unavailable.
      }
      return next;
    });
  }

  return (
    <div
      className={`research-shell ${archiveCollapsed ? "archive-collapsed" : ""}`}
    >
      <header className="mobile-archive-bar">
        <button
          className="archive-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="archive-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span aria-hidden="true">☰</span>
          研究档案
        </button>
        <span className="mobile-path">research-移动端 / Popup</span>
      </header>

      <aside
        id="archive-navigation"
        className={`archive-spine ${
          archiveCollapsed ? "archive-spine-collapsed" : ""
        } ${menuOpen ? "archive-spine-open" : ""}`}
      >
        <button
          className="archive-collapse-toggle"
          type="button"
          aria-expanded={!archiveCollapsed}
          aria-controls="archive-navigation-content"
          aria-label={
            archiveCollapsed ? "展开研究档案导航" : "收起研究档案导航"
          }
          onClick={toggleArchive}
        >
          <span aria-hidden="true">{archiveCollapsed ? "›" : "‹"}</span>
        </button>
        <span className="archive-rail-mark" aria-hidden="true">
          R/
        </span>
        <div
          id="archive-navigation-content"
          className="archive-spine-content"
          hidden={archiveCollapsed}
        >
          <div>
            <a
              href="/"
              className="archive-brand"
              onClick={() => setMenuOpen(false)}
            >
              <span className="archive-brand-mark">R/</span>
              <span>Research Archive</span>
            </a>
            <p className="archive-label">主题档案</p>
            <nav aria-label="研究主题导航">
              <a
                href="/research-mobile"
                className={`tree-theme ${pathname === "/research-mobile" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                research-移动端
              </a>
              <div className="tree-branch">
                <span className="tree-topic">Popup Research</span>
                {reportLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`tree-report ${isCurrent(pathname, item.href) ? "active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    <small>{item.code}</small>
                  </a>
                ))}
              </div>
            </nav>
          </div>
          <div className="archive-spine-footer">
            <span>AUTHORIZED RESEARCH</span>
            <p>只处理正常使用或测试中的 UI 中断。</p>
          </div>
        </div>
      </aside>

      <main className="research-main">{children}</main>

      {menuOpen ? (
        <button
          className="archive-scrim"
          type="button"
          aria-label="关闭研究档案导航"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
    </div>
  );
}
