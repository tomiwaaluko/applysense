import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "~/components/SessionProvider";
import { Navigation } from "~/components/Navigation";
import { FloatingActionButton } from "~/components/FloatingActionButton";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "Job Tracker - AI-Powered Application Management",
  description:
    "Track your job applications with AI-powered screenshot analysis. Upload job postings and let AI extract details automatically.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <TRPCReactProvider>
            <Navigation user={session?.user} />
            {children}
            {session?.user && <FloatingActionButton />}
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
