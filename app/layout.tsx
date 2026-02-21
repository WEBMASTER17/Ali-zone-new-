import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Ali Zone Deals | أفضل عروض أمازون مصر - amazon.eg",
  description: "منصة تصفح وتسوق آمنة من أمازون مصر. آلاف المنتجات الحقيقية يومياً مع كود الأفيلييت alizonedeals-20.",
  keywords: ["امازون مصر", "amazon.eg", "عروض امازون مصر", "ali zone deals", "amazon affiliate egypt", "تسوق اونلاين مصر", "alizonedeals-20"],
  authors: [{ name: "Ali Zone Deals" }],
  openGraph: {
    title: "Ali Zone Deals - أفضل عروض أمازون مصر والعالم",
    description: "تسوق آلاف المنتجات الحقيقية من أمازون مصر بأفضل الأسعار",
    images: [{ url: "https://picsum.photos/id/1015/1200/630" }],
    locale: "ar_EG",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Ali Zone Deals",
              url: "https://alizonedeals.com",
              description: "منصة أمازون أفيلييت مصر",
              publisher: { "@type": "Organization", name: "Ali Zone Deals", address: { "@type": "PostalAddress", addressCountry: "EG" } }
            })
          }}
        />
      </body>
    </html>
  );
}
