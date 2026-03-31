import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flexology | Mobile Booking System",
  description: "Book assisted stretching and sports massage services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased bg-gray-100`}
    >
      <body className="h-full w-full bg-gray-100 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
