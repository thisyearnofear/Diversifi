import type { Metadata } from "next";
import { Toaster } from "sonner";
import Script from "next/script";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { LeftSidebar } from "@/components/left-sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Providers } from "@/lib/web3/providers";
import { MobileNavigation } from "@/components/mobile-navigation";

import "./globals.css";
import "@coinbase/onchainkit/styles.css";
import { ConnectButton } from "@/components/connect-button-new";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://chat.vercel.ai"),
  title: "Stable Station",
  description: "Learn about stablecoins and get started with Web3",
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <Providers>
            <SidebarProvider>
              <div className="grid grid-cols-[auto,1fr,auto] min-h-screen w-full">
                <LeftSidebar />
                <div className="flex justify-center items-start">
                  <div className="fixed top-0 right-0 z-50 p-4 m-4 bg-background/80 backdrop-blur-sm border rounded-md shadow-sm">
                    <ConnectButton />
                  </div>
                  <main className="w-full max-w-3xl mx-auto">{children}</main>
                  <MobileNavigation />
                </div>
                <RightSidebar />
              </div>
            </SidebarProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
