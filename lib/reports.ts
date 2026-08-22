import reportData from "./generated/reports.json";

export type ReportHeading = {
  depth: number;
  id: string;
  text: string;
};

export type ReportSection = {
  id: string;
  title: string;
  html: string;
};

export type ReportModule = "index" | "solutions" | "papers";

export type ReportRecord = {
  slug: string;
  file: string;
  kind: string;
  module: ReportModule;
  eyebrow: string;
  title: string;
  summary: string;
  scope: string;
  ogImage?: string;
  date: string;
  sourceHash: string;
  raw: string;
  html: string;
  headings: ReportHeading[];
  sections: ReportSection[];
};

export const reports = reportData.reports as ReportRecord[];

export function getReport(slug: string) {
  return reports.find((report) => report.slug === slug);
}

export function getPublishedReports() {
  return reports.filter((report) => report.slug !== "index");
}

export function getReportsByModule(module: Exclude<ReportModule, "index">) {
  return getPublishedReports().filter((report) => report.module === module);
}
