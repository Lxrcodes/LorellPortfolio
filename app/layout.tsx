import type { Metadata } from "next";
import { Bebas_Neue, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lorell — Developer, Founder, Runner",
  description:
    "London-based freelance web developer, startup founder, and marathon runner. I build things that go the distance.",
  keywords: [
    "web developer",
    "freelance",
    "London",
    "startup founder",
    "Next.js",
    "React",
    "full-stack",
  ],
  authors: [{ name: "Lorell" }],
  openGraph: {
    title: "Lorell — Developer, Founder, Runner",
    description:
      "London-based freelance web developer, startup founder, and marathon runner. I build things that go the distance.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmMono.variable} ${dmSans.variable}`}
    >
      <body className="font-body antialiased">
        <Cursor />
        <Nav />
        {children}
      </body>
    </html>
  );
}
