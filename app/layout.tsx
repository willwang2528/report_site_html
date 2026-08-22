import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = (
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? ""
  )
    .split(",")[0]
    .trim();
  const forwardedProtocol = (
    requestHeaders.get("x-forwarded-proto") ?? ""
  )
    .split(",")[0]
    .trim();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https";

  let metadataBase = new URL("http://localhost:3000");
  if (host) {
    try {
      metadataBase = new URL(`${protocol}://${host}`);
    } catch {
      // Keep a valid local fallback if an intermediary supplies a malformed host.
    }
  }

  return {
    metadataBase,
    title: {
      default: "Research Archive",
      template: "%s · Research Archive",
    },
    description: "把研究原始材料组织为可阅读、可链接、可演示的 HTML 档案。",
    openGraph: {
      title: "Research Archive",
      description: "弹窗不是一个框，而是一次前景控制权切换。",
      type: "website",
      locale: "zh_CN",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "reasearch-移动端弹窗问题：移动端 UI 弹窗研究档案",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Research Archive",
      description: "弹窗不是一个框，而是一次前景控制权切换。",
      images: ["/og.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#eef2f5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
