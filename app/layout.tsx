import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://lunch-agent.vercel.app"), // Fallback URL (user can update this)
  title: {
    default: "여의도 미식회 | TP타워 생존 가이드",
    template: "%s | 여의도 미식회",
  },
  description: "TP타워 직장인을 위한 점심 메뉴 추천 & 실시간 웨이팅 공유 서비스",
  openGraph: {
    title: "여의도 미식회 - 오늘 점심 뭐 먹지?",
    description: "결정장애는 이제 그만. 상황별 맞춤 식당 추천부터 실시간 웨이팅 정보까지!",
    url: "/",
    siteName: "여의도 미식회",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "여의도 미식회 프리뷰",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "여의도 미식회 | TP타워 생존 가이드",
    description: "오늘 점심은 어디서? 상황별 맞춤 추천 받기",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
