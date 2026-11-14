import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI E-posta Asistanı — nejdettut.com",
  description:
    "Resmi, samimi veya diplomatik tonda, Türkçe veya İngilizce profesyonel e-posta taslakları üretir. Kısa bir brief yaz, yapay zekâ konu başlığı + gövde + imza üretir.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
