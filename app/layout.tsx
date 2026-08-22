import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecosystem OS",
  description: "Central operating system for your business ecosystem",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-PT"><body>{children}</body></html>;
}
