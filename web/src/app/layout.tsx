import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArgMetrics - Economic Indicators for Argentina",
  description: "Dashboard with USD exchange rates, inflation, and macroeconomic indicators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
