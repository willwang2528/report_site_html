import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "研究档案",
  description: "以可阅读、可演示的 HTML 组织持续扩展的个人研究主题。",
};

export default function Home() {
  return (
    <main className="archive-home">
      <nav className="home-topline" aria-label="站点导航">
        <span className="archive-brand-mark">R/</span>
        <span>RESEARCH ARCHIVE</span>
        <span>HTML EDITION · 2026</span>
      </nav>
      <section className="home-hero">
        <div className="home-thesis">
          <p>移动端系统研究 / 第一辑</p>
          <h1>
            弹窗不是一个框，
            <br />
            而是一次前景控制权切换。
          </h1>
          <p className="home-deck">
            把原始 Markdown 保留下来，把论证转换为可链接、可检索、可全屏演示的 HTML
            研究档案。
          </p>
          <Link href="/research-mobile" className="primary-link">
            进入 research-移动端 <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div
          className="home-stack"
          aria-label="App、系统、浏览器与安全界面的前景栈示意"
        >
          <div className="home-window home-window-security">
            <span>SECURITY</span>
          </div>
          <div className="home-window home-window-browser">
            <span>BROWSER</span>
          </div>
          <div className="home-window home-window-os">
            <span>OS / ACTIVE</span>
          </div>
          <div className="home-window home-window-app">
            <span>APP</span>
          </div>
        </div>
      </section>
      <section className="archive-register" aria-labelledby="register-heading">
        <header>
          <p>ARCHIVE REGISTER</p>
          <h2 id="register-heading">主题档案</h2>
        </header>
        <Link href="/research-mobile" className="register-row">
          <span className="register-code">THEME / 001</span>
          <span>
            <strong>research-移动端</strong>
            <small>移动端 Agent、UI 中断与恢复策略</small>
          </span>
          <span className="register-count">1 个课题 · 2 份报告</span>
          <span className="register-arrow" aria-hidden="true">
            ↗
          </span>
        </Link>
      </section>
      <footer className="home-footer">
        <span>原始材料：Markdown</span>
        <span>呈现方式：HTML / Fullscreen</span>
        <span>边界：不规避 CAPTCHA、风控或安全控制</span>
      </footer>
    </main>
  );
}
