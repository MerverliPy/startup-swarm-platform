import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startup Swarm Platform",
  description: "A multi-agent collaboration platform with GitHub login.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Arial, sans-serif", maxWidth: 960, margin: "0 auto", padding: 32 }}>
        {children}
      </body>
    </html>
  );
}
