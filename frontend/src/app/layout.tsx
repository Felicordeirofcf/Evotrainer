import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Configuração de Metadados para PWA e SEO
export const metadata: Metadata = {
  title: "EvoTrainer",
  description: "A sua plataforma de treino inteligente.",
  manifest: "/manifest.json",
  applicationName: "EvoTrainer",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EvoTrainer",
  },
  formatDetection: {
    telephone: false,
  },
};

// Configuração da Viewport (Separada no Next.js 14)
export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Faz o app ocupar a tela toda, incluindo a área do "notch" no iPhone
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        {/* Tags extras de compatibilidade para dispositivos móveis */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50 overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}