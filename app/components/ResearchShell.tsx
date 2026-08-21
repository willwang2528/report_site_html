"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- vinext production Link navigation is broken; force document loads. */
import { usePathname } from "next/navigation";
import { useState } from "react";

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

  return (
    <div className="research-shell">
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
        className={`archive-spine ${menuOpen ? "archive-spine-open" : ""}`}
      >
        <div>
          <a href="/" className="archive-brand" onClick={() => setMenuOpen(false)}>
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
      </aside>

      <main className="research-main">
        <div className="compact-owner-strip" aria-label="前景所有者中断栈">
          <span>FOREGROUND OWNERS</span>
          <i>APP</i>
          <i className="active">OS</i>
          <i>BROWSER</i>
          <i className="security">SECURITY</i>
        </div>
        {children}
      </main>

      <aside className="interrupt-stack" aria-label="前景所有者中断栈">
        <div className="stack-kicker">INTERRUPT</div>
        <div className="stack-title">STACK</div>
        <div className="stack-layers" aria-hidden="true">
          <span className="stack-layer stack-app">APP</span>
          <span className="stack-layer stack-os">OS</span>
          <span className="stack-layer stack-browser">BROWSER</span>
          <span className="stack-layer stack-security">SECURITY</span>
        </div>
        <p>前景控制权在所有者之间切换。</p>
      </aside>

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
