import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import AntWrapper from "./ant";
import { AuthProvider } from "./auth_provider";
import Head from "next/head";
import ReactQuery from "./react_query";

// TODO: change font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoCert",
  description:
    "A Bulk Certificate Creation, E-Signing, and Certificate Repository Platform",
  icons: [
    {
      rel: "autocert-logo",
      url: "/logo.png",
      sizes: "192x192",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQuery>
          <AntWrapper>
            <AuthProvider>{children}</AuthProvider>
          </AntWrapper>
        </ReactQuery>
      </body>
    </html>
  );
}
