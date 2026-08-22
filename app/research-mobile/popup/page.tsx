import type { Metadata } from "next";
import { getReport, getReportsByModule } from "@/lib/reports";

export const metadata: Metadata = {
  title: "Popup Research · 课题目录索引",
  description: "移动端 Agent UI 弹窗研究的课题入口、交付关系和安全边界。",
};

export default function PopupTopic() {
  const index = getReport("index");
  const solutionReports = getReportsByModule("solutions");
  const paperReports = getReportsByModule("papers");
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
      <section className="report-register" aria-labelledby="solutions-heading">
        <div className="section-heading">
          <span>MODULE / 01 · SOLUTIONS</span>
          <h2 id="solutions-heading">底层解决方法</h2>
        </div>
        <p className="module-summary">
          先理解弹窗如何取得前景控制权，再比较可直接落地的跨平台识别、决策与恢复方法。
        </p>
        {solutionReports.map((report, indexNumber) => (
          <a
            key={report.slug}
            href={`/research-mobile/popup/${report.slug}`}
            className="report-record"
          >
            <span className="record-number">
              {`S${String(indexNumber + 1).padStart(2, "0")}`}
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
          </a>
        ))}
      </section>
      <section
        className="report-register report-module-papers"
        aria-labelledby="papers-heading"
      >
        <div className="section-heading">
          <span>MODULE / 02 · PAPER READING</span>
          <h2 id="papers-heading">论文模块</h2>
        </div>
        <p className="module-summary">
          精读论文不再与底层方法平铺：每篇文章独立保留研究问题、机制、证据、负结果和适用边界。
        </p>
        {paperReports.map((report, indexNumber) => (
          <a
            key={report.slug}
            href={`/research-mobile/popup/${report.slug}`}
            className="report-record"
          >
            <span className="record-number">
              {`P${String(indexNumber + 1).padStart(2, "0")}`}
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
          </a>
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
