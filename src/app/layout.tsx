import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ThemeToggle from "./components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Fitness Tracker",
  description: "Your personal AI-powered fitness companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full bg-gray-50 dark:bg-gray-900`}>
      <body className={`${inter.className} min-h-screen`}>
        <Providers>
          <main className="">
            {/* Theme toggle context for children */}
            {children}
          </main>
        </Providers>
        <ThemeToggle />
      </body>
    </html>
  );
}
