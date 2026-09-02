'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, Users, Plus, Shield, RefreshCw, FileText, UserCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface BottomNavProps {
  onAbrirNovoVisitante?: () => void;
}

export function BottomNav({ onAbrirNovoVisitante }: BottomNavProps) {
  const pathname = usePathname();
  const { usuario, contextoAtivo, setModalSeletorAberto } = useAuth();

  if (!usuario || pathname.includes('/login')) return null;

  const basePath = contextoAtivo === 'admin'
    ? '/admin'
    : `/painel/${contextoAtivo}`;

  const visitantesPath = contextoAtivo === 'admin'
    ? '/admin'
    : `/painel/${contextoAtivo}/visitantes`;

  const podeAlternar = (usuario.pode_acessar_familia && usuario.pode_acessar_vertical) || usuario.e_admin;
  const podeAcessarRelatorios = usuario.pode_acessar_relatorios || usuario.e_admin || usuario.e_lider;

  const eInicioAtivo = pathname === basePath;
  const eVisitantesAtivo = pathname.startsWith(visitantesPath) && pathname !== '/admin';

  return (
    <>
      {/* Balão Flutuante (+ Novo Visitante) posicionado um pouco acima da barra inferior */}
      {onAbrirNovoVisitante && (
        <button
          onClick={onAbrirNovoVisitante}
          className="fixed bottom-20 right-4 z-40 sm:hidden w-11 h-11 rounded-full bg-[#1E3370] text-white flex items-center justify-center shadow-xl shadow-[#1E3370]/35 ring-2 ring-white/90 active:scale-90 hover:scale-105 transition-all cursor-pointer"
          title="Cadastrar Novo Visitante"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Barra de Navegação Inferior Fixa */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav sm:hidden">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around relative">
          {/* Início */}
          <Link
            href={basePath}
            className={clsx(
              'flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors',
              eInicioAtivo ? 'text-[#1E3370] font-bold' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Início</span>
          </Link>

          {/* Visitantes */}
          <Link
            href={visitantesPath}
            className={clsx(
              'flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors',
              eVisitantesAtivo ? 'text-[#1E3370] font-bold' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Visitantes</span>
          </Link>

          {/* Usuários (Aparece ao lado de Visitantes para o Administrador) */}
          {usuario.e_admin && (
            <Link
              href="/admin/usuarios"
              className={clsx(
                'flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors',
                pathname.startsWith('/admin/usuarios') ? 'text-[#1E3370] font-bold' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <UserCheck className="w-5 h-5" />
              <span className="text-[10px]">Usuários</span>
            </Link>
          )}

          {/* Relatórios (Exclusivo para Líderes e Administradores) */}
          {podeAcessarRelatorios && (
            <Link
              href="/relatorios"
              className={clsx(
                'flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors',
                pathname === '/relatorios' ? 'text-[#1E3370] font-bold' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px]">Relatórios</span>
            </Link>
          )}

          {/* Alternador de Contexto (se perfil ambos ou admin) */}
          {podeAlternar && (
            <button
              onClick={() => setModalSeletorAberto(true)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-[10px]">Alternar</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
