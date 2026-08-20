/* eslint-disable @next/next/no-html-link-for-pages -- vinext production Link navigation is broken; force document loads. */
import type { Metadata } from "next";
import { getPublishedReports } from "@/lib/reports";

export const metadata: Metadata = {
  title: "research-移动端",
  description: "移动端 Agent、UI 中断与恢复策略研究主题。",
};

export default function ResearchMobileTheme() {
  const reports = getPublishedReports();
  return (
    <div className="theme-page">
      <header className="theme-hero">
        <p className="report-eyebrow">THEME / MOBILE RESEARCH</p>
        <h1>research-移动端</h1>
        <p>
          围绕移动端 Agent 的观察、决策与执行边界，持续沉淀可阅读、可验证、可演示的专题研究。
        </p>
      </header>
      <section className="topic-register" aria-labelledby="topic-heading">
        <div className="section-heading">
          <span>TOPIC / 001</span>
          <h2 id="topic-heading">Popup Research</h2>
        </div>
        <p className="topic-abstract">
          研究正常、获授权的软件使用或测试流程中，Agent 如何识别并处理阻断任务的 UI
          弹窗。
        </p>
        <dl className="topic-meta">
          <div>
            <dt>范围</dt>
            <dd>Android / iOS / Mobile Web</dd>
          </div>
          <div>
            <dt>材料</dt>
            <dd>1 份索引 / {reports.length} 份报告</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>原理与方法调研完成</dd>
          </div>
        </dl>
        <div className="topic-actions">
          <a href="/research-mobile/popup" className="primary-link">
            打开课题索引 →
          </a>
        </div>
      </section>
    </div>
  );
}
