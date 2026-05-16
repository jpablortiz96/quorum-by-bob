import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QUORUM - Multi-Agent Architecture Tribunal",
  description: "Stop making architecture decisions alone. Multi-agent tribunal for technical governance. Built on IBM Bob.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#161616] text-[#f4f4f4] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
