import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import React from "react";

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#2B6A4D" />
        <meta name="description" content="Habit Tracker - Build lasting habits" />

        {/* PWA Settings */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Habit Tracker" />
        <link rel="apple-touch-icon" href="/icon-512.png" />

        {/* Service Worker & Early PWA Install Event Capture */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.__deferredInstallPrompt = e;
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch((err) => {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />

        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
              * {
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
