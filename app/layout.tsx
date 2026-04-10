import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "جمعية قوت - منصة إدارة فائض الطعام",
  description: "منصة إلكترونية لجمعية قوت لحفظ فائض الطعام وتوزيعه على الأسر المحتاجة بأعلى كفاءة وسرعة.",
  keywords: "حفظ النعمة, فائض طعام, الأسر المحتاجة, جمعية خيرية, توزيع طعام, منصة قوت",
  openGraph: {
    title: "جمعية قوت - منصة إدارة فائض الطعام",
    description: "نظام إداري متكامل لربط فريق الإدارة بالمناديب الميدانيين لضمان وصول فائض الطعام لمن يستحقه.",
    type: "website",
    locale: "ar_SA",
    siteName: "جمعية قوت",
  },
  twitter: {
    card: "summary_large_image",
    title: "جمعية قوت - منصة الإدارة الذكية",
    description: "نحو مستقبل بدون هدر - منصة جمعية قوت الإدارية",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body>
        {children}
        <Script 
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" 
          crossOrigin=""
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
