import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cinematic",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Forno Nero — Neapolitan Pizzeria, Naples",
  description:
    "A cinematic fine-dining experience. Wood-fired Neapolitan pizza crafted through fire, patience and obsession. Naples, Italy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
