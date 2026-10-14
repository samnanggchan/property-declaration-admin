import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Battambang } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ReduxProvider from "@/lib/redux/ReduxProvider";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const battambang = Battambang({
  weight: ["300", "400", "700", "900"],
  subsets: ["khmer"],
  variable: "--font-battambang",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Property Declaration System",
  description: "Production-ready Property Declaration & RBAC Admin Management System",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans",
        inter.variable,
        fontMono.variable,
        battambang.variable,
      )}
    >
      <body suppressHydrationWarning>
        <ReduxProvider>
          <ThemeProvider>
            <I18nProvider>
              {children}
              <Toaster position="top-right" richColors />
            </I18nProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
