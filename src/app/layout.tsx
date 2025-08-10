import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "~/components/SessionProvider";
import { Navigation } from "~/components/Navigation";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "Job Tracker - AI-Powered Application Management",
  description:
    "Track your job applications with AI-powered screenshot analysis. Upload job postings and let AI extract details automatically.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <Navigation user={session?.user} />
            {children}
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
