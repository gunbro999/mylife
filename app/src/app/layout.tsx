import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { PWAProvider } from "@/components/layout/PWAProvider";

export const metadata: Metadata = {
  title: "浮生记 - MyLife",
  description: "智能写作与生活记录 — 让每一次落笔，都成为一种享受",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "浮生记",
    statusBarStyle: "default",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#8b7355",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__MYLIFE_CONFIG__ = ${JSON.stringify({ url: supabaseUrl, key: supabaseKey })};`,
          }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="浮生记" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="h-full antialiased">
        <ThemeProvider>
          <AuthProvider>
            <PWAProvider>{children}</PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
