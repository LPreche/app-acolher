'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { LogOut, ChevronDown, Users, Shield, FileText } from 'lucide-react';
import { IconeVertical } from '@/components/ui/IconeVertical';
import { ModalPermissaoNotificacao } from '@/components/ui/ModalPermissaoNotificacao';
import { clsx } from 'clsx';

export function Header() {
  const { usuario, contextoAtivo, setModalSeletorAberto, logout } = useAuth();

  if (!usuario) return null;

  const podeAlternar = (usuario.pode_acessar_familia && usuario.pode_acessar_vertical) || usuario.e_admin;

  const configContexto = {
    familia: {
      titulo: 'Família',
      tituloCurto: 'Família',
      icone: <Users className="w-3.5 h-3.5 flex-shrink-0" />,
      badgeClasse: 'bg-indigo-50 text-[#1E3370] border-indigo-200 hover:bg-indigo-100',
    },
    vertical: {
      titulo: 'Vertical',
      tituloCurto: 'Vertical',
      icone: <IconeVertical className="w-3.5 h-3.5 flex-shrink-0" />,
      badgeClasse: 'bg-blue-50 text-[#2563EB] border-blue-200 hover:bg-blue-100',
    },
    admin: {
      titulo: 'Administrador',
      tituloCurto: 'Admin',
      icone: <Shield className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />,
      badgeClasse: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    },
  }[contextoAtivo];

  return (
    <header className="sticky top-0 z-40 w-full glass-header box-border">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2 w-full box-border">
        {/* Logo & Título (com flex-shrink e sem quebra forçada) */}
        <Link href={contextoAtivo === 'admin' ? '/admin' : `/painel/${contextoAtivo}`} className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-shrink">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-xs border border-slate-100 bg-white flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo-acolher.jpg"
              alt="Logo Acolher"
              width={36}
              height={36}
              className="object-cover"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#1E3370] truncate">Acolher</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 hidden xs:inline whitespace-nowrap">IBI Chapecó</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block truncate">Recepção & Visitantes</p>
          </div>
        </Link>

        {/* Controles da Direita (compactos e responsivos) */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Seletor de Contexto / Pill */}
          {podeAlternar ? (
            <button
              onClick={() => setModalSeletorAberto(true)}
              className={clsx(
                'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold transition-smooth cursor-pointer flex-shrink-0',
                configContexto.badgeClasse
              )}
              title="Clique para alternar de painel"
            >
              {configContexto.icone}
              <span className="hidden sm:inline">{configContexto.titulo}</span>
              <span className="sm:hidden">{configContexto.tituloCurto}</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60 flex-shrink-0" />
            </button>
          ) : (
            <div
              className={clsx(
                'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold flex-shrink-0',
                configContexto.badgeClasse
              )}
            >
              {configContexto.icone}
              <span className="hidden sm:inline">{configContexto.titulo}</span>
              <span className="sm:hidden">{configContexto.tituloCurto}</span>
            </div>
          )}

          {/* Link para Relatórios (Exclusivo para Administradores e Líderes) */}
          {(usuario.pode_acessar_relatorios || usuario.e_admin || usuario.e_lider) && (
            <Link
              href="/relatorios"
              className="p-1.5 sm:p-2 text-slate-500 hover:text-[#1E3370] rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
              title="Relatórios e Exportações (PDF, CSV, XLSX)"
            >
              <FileText className="w-4 h-4" />
            </Link>
          )}

          {/* Botão de Logout */}
          <button
            onClick={logout}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
            title="Sair do sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Convidativo para Ativação de Notificações no Celular */}
      <ModalPermissaoNotificacao />
    </header>
  );
}
