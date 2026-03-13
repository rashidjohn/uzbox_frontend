import type { Metadata, Viewport } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default:  "UzBox — Sifatli mahsulotlar",
    template: "%s | UzBox",
  },
  description: "O'zbekistondagi eng yaxshi onlayn do'kon. Sifatli mahsulotlar, tez yetkazib berish.",
  keywords:    ["onlayn do'kon", "O'zbekiston", "xarid", "mahsulotlar", "UzBox"],
  authors:     [{ name: "UzBox" }],
  creator:     "UzBox",
  openGraph: {
    type:        "website",
    locale:      "uz_UZ",
    url:         "https://uzbox.uz",
    siteName:    "UzBox",
    title:       "UzBox — Sifatli mahsulotlar",
    description: "O'zbekistondagi eng yaxshi onlayn do'kon",
  },
  twitter: {
    card:  "summary_large_image",
    title: "UzBox — Sifatli mahsulotlar",
  },
  robots: {
    index:  true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#f97316",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
