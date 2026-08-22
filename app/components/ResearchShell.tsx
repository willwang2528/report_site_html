"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- vinext production Link navigation is broken; force document loads. */
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ARCHIVE_COLLAPSED_KEY = "research-archive:archive-collapsed";

const topicIndex = {
  href: "/research-mobile/popup",
  label: "课题目录索引",
  code: "INDEX",
};

const reportGroups = [
  {
    label: "底层解决方法",
    code: "SOLUTIONS",
    links: [
      {
        href: "/research-mobile/popup/principles",
        label: "底层原理",
        code: "PRINCIPLES",
      },
      {
        href: "/research-mobile/popup/methods",
        label: "现有方法",
        code: "METHODS",
      },
    ],
  },
  {
    label: "论文模块",
    code: "PAPERS",
    links: [
      {
        href: "/research-mobile/popup/principles-brief",
        label: "权限素养论文精读",
        code: "PERMISSION",
      },
      {
        href: "/research-mobile/popup/vlm-fuzz",
        label: "VLM-Fuzz 论文精读",
        code: "VLM-FUZZ",
      },
      {
        href: "/research-mobile/popup/popsweeper",
        label: "PopSweeper 论文精读",
        code: "POPSWEEPER",
      },
      {
        href: "/research-mobile/popup/sneaky-popups",
        label: "Poker 论文精读",
        code: "POKER",
      },
      {
        href: "/research-mobile/popup/whispertest",
        label: "WhisperTest 论文精读",
        code: "WHISPERTEST",
      },
      {
        href: "/research-mobile/popup/cookieverse",
        label: "Cookieverse 论文精读",
        code: "BANNERCLICK",
      },
    ],
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
        <span className="mobile-path">reasearch-移动端弹窗问题 / Popup</span>
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
                reasearch-移动端弹窗问题
              </a>
              <div className="tree-branch">
                <span className="tree-topic">Popup Research</span>
                <a
                  href={topicIndex.href}
                  className={`tree-report ${isCurrent(pathname, topicIndex.href) ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{topicIndex.label}</span>
                  <small>{topicIndex.code}</small>
                </a>
                {reportGroups.map((group) => (
                  <div className="tree-module" key={group.code}>
                    <span className="tree-module-label">
                      {group.label}
                      <small>{group.code}</small>
                    </span>
                    {group.links.map((item) => (
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
