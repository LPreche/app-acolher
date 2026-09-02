'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { usuario, carregando, contextoAtivo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando) {
      if (!usuario) {
        router.replace('/login');
      } else {
        if (contextoAtivo === 'admin' && usuario.e_admin) {
          router.replace('/admin');
        } else if (contextoAtivo === 'vertical') {
          router.replace('/painel/vertical');
        } else {
          router.replace('/painel/familia');
        }
      }
    }
  }, [usuario, carregando, contextoAtivo, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#1E3370] text-white flex items-center justify-center shadow-lg animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Carregando Sistema Acolher...</p>
      </div>
    </div>
  );
}
