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

export type ReportRecord = {
  slug: string;
  file: string;
  kind: string;
  eyebrow: string;
  title: string;
  summary: string;
  scope: string;
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
