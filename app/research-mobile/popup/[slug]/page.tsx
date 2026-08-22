import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportReader } from "@/app/components/ReportReader";
import { getPublishedReports, getReport } from "@/lib/reports";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublishedReports().map((report) => ({ slug: report.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = getReport(slug);
  if (!report || report.slug === "index") return {};
  const title = `${report.title} · reasearch-移动端弹窗问题`;
  const ogImage = report.ogImage ?? "/og.png";
  return {
    title,
    description: report.summary,
    openGraph: {
      title,
      description: report.summary,
      images: [
        {
          url: ogImage,
          width: report.ogImage ? 1125 : 1200,
          height: report.ogImage ? 510 : 630,
          alt: `${report.title} · reasearch-移动端弹窗问题`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: report.summary,
      images: [ogImage],
    },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { slug } = await params;
  const report = getReport(slug);
  if (!report || report.slug === "index") notFound();
  return <ReportReader report={report} />;
}
