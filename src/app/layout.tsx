import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { cn } from "@/lib/utils";
import { AppStateProvider } from "@/contexts/app-state-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeFusion",
  description: "The AI-powered code editor for modern developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("h-screen bg-background font-sans antialiased", inter.className)}>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
