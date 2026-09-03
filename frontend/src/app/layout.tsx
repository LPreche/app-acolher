import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ContextSelectorModal } from '@/components/layout/ContextSelectorModal';

export const metadata: Metadata = {
  title: 'Acolher - IBI Chapecó',
  description: 'Sistema de recepção, registro e acompanhamento caloroso de visitantes nos cultos da Igreja Batista Independente em Chapecó.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo-acolher.jpg', type: 'image/jpeg' },
      { url: '/icon.jpg', type: 'image/jpeg' },
    ],
    shortcut: ['/logo-acolher.jpg'],
    apple: [
      { url: '/apple-touch-icon.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Acolher',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1E3370',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1E3370" />
        <link rel="icon" href="/logo-acolher.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.jpg" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#1E3370] selection:text-white">
        <AuthProvider>
          {children}
          <ContextSelectorModal />
        </AuthProvider>
      </body>
    </html>
  );
}
