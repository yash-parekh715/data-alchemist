import { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Data Alchemist" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ...existing head... */}
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {/* Decorative gradient backdrop */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(168,85,247,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(1000px_500px_at_90%_10%,rgba(59,130,246,0.14),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_120%,rgba(16,185,129,0.12),transparent_60%)]" />
        </div>
        <div className="mx-auto max-w-7xl p-4 md:p-6">{children}</div>
      </body>
    </html>
  );
}
