import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import Script from 'next/script';
import { Inter } from 'next/font/google';

import { ThemeProvider } from '@/components/theme-provider';
import { LeftSidebar } from '@/components/left-sidebar';
import { RightSidebar } from '@/components/right-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Providers } from '@/lib/web3/providers';
import { MobileNavigation } from '@/components/mobile-navigation';
import { MobileHeader } from '@/components/mobile-header';
import { RegionProvider } from '@/contexts/region-context';
import { ReactQueryProvider } from '@/lib/react-query';
import { cn } from '@/lib/utils';

import './globals.css';
import '@coinbase/onchainkit/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'Stable Station',
  description: 'Hub for Stablecoins & Real World Assets',
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
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
          <ReactQueryProvider>
            <Providers>
              <RegionProvider>
                <SidebarProvider>
                  <div
                    className={cn(
                      'grid min-h-screen w-full',
                      'grid-cols-1',
                      'md:grid-cols-[auto,1fr,auto]',
                    )}
                  >
                    <LeftSidebar />
                    <div
                      className={cn(
                        'flex flex-col items-start w-full',
                        'px-2',
                        'md:px-0 md:justify-center',
                      )}
                    >
                      <MobileHeader />
                      <main
                        className={cn(
                          'w-full mx-auto',
                          'pb-24 mt-14',
                          'md:pb-0 md:mt-0',
                          'max-w-3xl',
                        )}
                      >
                        {children}
                      </main>
                      <MobileNavigation />
                    </div>
                    <RightSidebar />
                  </div>
                </SidebarProvider>
              </RegionProvider>
            </Providers>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
