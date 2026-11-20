import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fredoka, Lora, Nunito, Pacifico } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
});

export const metadata: Metadata = {
  title: {
    default: "Little Leaf Library",
    template: "%s · Little Leaf Library",
  },
  description:
    "A cozy personal library for your PDF collection. Shelve books by category and read them with pages you can turn.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fredoka.variable} ${nunito.variable} ${lora.variable} ${pacifico.variable}`}
    >
      <body className="bg-cream font-sans text-ink antialiased">{children}</body>
    </html>
  );
}