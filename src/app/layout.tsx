import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Tour Management System — Chiang Mai Clicks",
  description: "Internal operations platform for Chiang Mai Clicks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Runs before first paint — applies saved colour theme with no flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var c=localStorage.getItem('color-theme');if(c)document.documentElement.setAttribute('data-color',c);}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
