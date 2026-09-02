import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ContextSelectorModal } from '@/components/layout/ContextSelectorModal';

export const metadata: Metadata = {
  title: 'Acolher - IBI Chapecó',
  description: 'Sistema de recepção, registro e acompanhamento de visitantes da Igreja Batista Independente em Chapecó.',
  icons: {
    icon: '/logo-acolher.jpg',
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
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#1E3370] selection:text-white">
        <AuthProvider>
          {children}
          <ContextSelectorModal />
        </AuthProvider>
      </body>
    </html>
  );
}
