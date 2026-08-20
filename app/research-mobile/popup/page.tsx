import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedReports, getReport } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Popup Research · 课题目录索引",
  description: "移动端 Agent UI 弹窗研究的课题入口、交付关系和安全边界。",
};

export default function PopupTopic() {
  const index = getReport("index");
  const reports = getPublishedReports();
  if (!index) return null;

  return (
    <div className="topic-page">
      <header className="topic-hero">
        <p className="report-eyebrow">{index.eyebrow}</p>
        <h1>{index.title}</h1>
        <p>{index.summary}</p>
      </header>
      <section
        className="topic-source markdown-body"
        aria-label="课题原始索引"
        dangerouslySetInnerHTML={{ __html: index.html }}
      />
      <section className="report-register" aria-labelledby="reports-heading">
        <div className="section-heading">
          <span>REPORT REGISTER</span>
          <h2 id="reports-heading">当前报告</h2>
        </div>
        {reports.map((report, indexNumber) => (
          <Link
            key={report.slug}
            href={`/research-mobile/popup/${report.slug}`}
            className="report-record"
          >
            <span className="record-number">
              {String(indexNumber + 1).padStart(2, "0")}
            </span>
            <span className="record-main">
              <small>{report.kind}</small>
              <strong>{report.title}</strong>
              <p>{report.summary}</p>
            </span>
            <span className="record-meta">
              <span>{report.scope}</span>
              <span>{report.date}</span>
            </span>
            <span className="record-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        ))}
      </section>
      <aside className="boundary-note">
        <span>RESEARCH BOUNDARY</span>
        <p>
          处理 App、系统或浏览器弹窗，不等于规避 CAPTCHA、风控、身份认证或平台安全控制。
        </p>
      </aside>
    </div>
  );
}
