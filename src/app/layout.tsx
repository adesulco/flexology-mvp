import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import Script from "next/script";
import { getTenant } from "@/lib/tenant";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0CF2D4",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant();
  
  if (!tenant) {
     return {
        title: "Jemari App | Global Wellness Discovery",
        description: "Discover and book premium wellness experiences across Indonesia.",
        manifest: "/manifest.json",
        icons: { icon: "/logo.png", apple: "/logo.png" },
        openGraph: { title: "Jemari App", description: "Discover wellness.", url: "https://jemariapp.com", type: "website" }
     };
  }

  const title = `${tenant.name || "Flex"} | Premium & Wellness Recovery`;
  const description = `Book assisted stretching and premium services at ${tenant.name || "Flex"}.`;
  
  return {
     title,
     description,
     manifest: "/manifest.json",
     appleWebApp: {
       capable: true,
       statusBarStyle: "black-translucent",
       title: tenant.name || "Flex",
     },
     icons: {
       icon: tenant.logoUrl || "/logo.png",
       apple: tenant.logoUrl || "/logo.png",
     },
     openGraph: {
       title,
       description,
       url: `https://${tenant.slug}.jemariapp.com`,
       siteName: tenant.name || "Flex",
       images: [
         {
           url: tenant.logoUrl || "https://flex.jemariapp.com/logo.png",
           width: 1200,
           height: 630,
           alt: `${tenant.name} Logo`,
         },
       ],
       locale: "en_US",
       type: "website",
     },
     twitter: {
       card: "summary_large_image",
       title,
       description,
       images: [tenant.logoUrl || "https://flex.jemariapp.com/logo.png"],
     },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenant = await getTenant();
  
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased bg-gray-100`}
      style={{ 
         "--color-brand": tenant ? (tenant.primaryColor || "#000000") : "#2563EB",
         "--color-brand-muted": "rgba(0,0,0,0.05)"
      } as React.CSSProperties}
    >
      <body className="h-full w-full bg-gray-100 antialiased overflow-x-hidden">
        {children}
        <Navigation />
        <Script src={process.env.NODE_ENV === "production" ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js"} strategy="lazyOnload" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('PWA ServiceWorker registration successful'); },
                  function(err) { console.log('PWA ServiceWorker registration failed: ', err); }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
