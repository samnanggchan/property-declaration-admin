import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ReduxProvider from "@/lib/redux/ReduxProvider";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <head>
        {/* Neutralize browser extension DOM mutations (e.g. bis_skin_checked) before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Suppress noisy third-party chrome-extension unhandled errors/rejections (e.g. Urban VPN)
                  window.addEventListener('unhandledrejection', function(event) {
                    var reason = event.reason;
                    var str = (reason && (reason.stack || reason.message || String(reason))) || '';
                    if (str.indexOf('chrome-extension://') !== -1 || str.indexOf('M_ID') !== -1) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  });

                  window.addEventListener('error', function(event) {
                    var str = (event.filename || '') + ' ' + (event.message || '');
                    if (str.indexOf('chrome-extension://') !== -1) {
                      event.preventDefault();
                      event.stopImmediatePropagation();
                    }
                  });

                  // Clean extension-injected attributes before hydration
                  var clean = function() {
                    var els = document.querySelectorAll('[bis_skin_checked]');
                    for (var i = 0; i < els.length; i++) {
                      els[i].removeAttribute('bis_skin_checked');
                    }
                  };
                  clean();
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked' && m.target) {
                        m.target.removeAttribute('bis_skin_checked');
                      }
                    }
                  });
                  observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
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
