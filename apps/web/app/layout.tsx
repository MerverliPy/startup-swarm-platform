import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppSessionProvider from "@/components/session-provider";
import BottomNav from "@/components/bottom-nav";
import InstallCoach from "@/components/install-coach";

export const metadata: Metadata = {
  title: {
    default: "Startup Swarm Platform",
    template: "%s · Startup Swarm Platform",
  },
  description:
    "GitHub-authenticated swarm workspace with a mobile-friendly dashboard, install metadata, and bounded run navigation.",
  applicationName: "Startup Swarm Platform",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "Startup Swarm",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppSessionProvider>
          <div className="app-shell">
            <div className="app-frame">
              <InstallCoach />
              {children}
            </div>
            <BottomNav />
          </div>
        </AppSessionProvider>
      </body>
    </html>
  );
}
