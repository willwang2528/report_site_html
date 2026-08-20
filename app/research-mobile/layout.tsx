import type { Metadata } from "next";
import { ResearchShell } from "@/app/components/ResearchShell";

export const metadata: Metadata = {
  title: "research-移动端",
  description: "移动端 Agent、UI 中断与恢复策略研究主题。",
};

export default function ResearchMobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResearchShell>{children}</ResearchShell>;
}
