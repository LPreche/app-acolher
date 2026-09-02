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
      icone: <Users className="w-3.5 h-3.5" />,
      badgeClasse: 'bg-indigo-50 text-[#1E3370] border-indigo-200 hover:bg-indigo-100',
    },
    vertical: {
      titulo: 'Vertical',
      icone: <IconeVertical className="w-3.5 h-3.5" />,
      badgeClasse: 'bg-blue-50 text-[#2563EB] border-blue-200 hover:bg-blue-100',
    },
    admin: {
      titulo: 'Administrador',
      icone: <Shield className="w-3.5 h-3.5 text-purple-600" />,
      badgeClasse: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    },
  }[contextoAtivo];

  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Subtítulo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 bg-white flex items-center justify-center">
            <Image
              src="/logo-acolher.jpg"
              alt="Logo Acolher"
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#1E3370]">Acolher</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">IBI Chapecó</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Recepção & Visitantes</p>
          </div>
        </div>

        {/* Controles da Direita */}
        <div className="flex items-center gap-2">
          {/* Seletor de Contexto / Pill */}
          {podeAlternar ? (
            <button
              onClick={() => setModalSeletorAberto(true)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-smooth cursor-pointer',
                configContexto.badgeClasse
              )}
              title="Clique para alternar de painel"
            >
              {configContexto.icone}
              <span>{configContexto.titulo}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          ) : (
            <div
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold',
                configContexto.badgeClasse
              )}
            >
              {configContexto.icone}
              <span>{configContexto.titulo}</span>
            </div>
          )}

          {/* Link para Relatórios (Exclusivo para Administradores e Líderes) */}
          {(usuario.pode_acessar_relatorios || usuario.e_admin || usuario.e_lider) && (
            <Link
              href="/relatorios"
              className="p-2 text-slate-500 hover:text-[#1E3370] rounded-xl hover:bg-slate-100 transition-colors"
              title="Relatórios e Exportações (PDF, CSV, XLSX)"
            >
              <FileText className="w-4 h-4" />
            </Link>
          )}

          {/* Botão de Logout */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
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
