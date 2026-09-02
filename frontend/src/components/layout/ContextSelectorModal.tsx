'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { Users, Shield, Check } from 'lucide-react';
import { IconeVertical } from '@/components/ui/IconeVertical';
import { clsx } from 'clsx';

export function ContextSelectorModal() {
  const { modalSeletorAberto, setModalSeletorAberto, contextoAtivo, alternarParaContexto, usuario } = useAuth();

  if (!usuario) return null;

  return (
    <Modal
      aberto={modalSeletorAberto}
      onClose={() => setModalSeletorAberto(false)}
      titulo="Escolha a Área de Atuação"
      subtitulo="Selecione em qual painel do Acolher você deseja atuar agora:"
      tamanho="sm"
    >
      <div className="space-y-3 py-2">
        {/* Opção Família */}
        {usuario.pode_acessar_familia && (
          <button
            onClick={() => alternarParaContexto('familia')}
            className={clsx(
              'w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-smooth',
              contextoAtivo === 'familia'
                ? 'border-[#1E3370] bg-indigo-50/50 shadow-sm ring-1 ring-[#1E3370]'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#1E3370] text-white flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Acolher Família</h4>
                <p className="text-xs text-slate-500">Recepção de famílias e cultos gerais</p>
              </div>
            </div>
            {contextoAtivo === 'familia' && (
              <div className="w-6 h-6 rounded-full bg-[#1E3370] text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        )}

        {/* Opção Vertical */}
        {usuario.pode_acessar_vertical && (
          <button
            onClick={() => alternarParaContexto('vertical')}
            className={clsx(
              'w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-smooth',
              contextoAtivo === 'vertical'
                ? 'border-[#2563EB] bg-blue-50/50 shadow-sm ring-1 ring-[#2563EB]'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm shadow-blue-100">
                <IconeVertical className="w-6 h-6" variante="branco" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Acolher Vertical</h4>
                <p className="text-xs text-slate-500">Recepção de jovens e conexão</p>
              </div>
            </div>
            {contextoAtivo === 'vertical' && (
              <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        )}

        {/* Opção Admin (se admin) */}
        {usuario.e_admin && (
          <button
            onClick={() => alternarParaContexto('admin')}
            className={clsx(
              'w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-smooth',
              contextoAtivo === 'admin'
                ? 'border-purple-600 bg-purple-50/50 shadow-sm ring-1 ring-purple-600'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Painel do Administrador</h4>
                <p className="text-xs text-slate-500">Gestão geral e cadastro de usuários</p>
              </div>
            </div>
            {contextoAtivo === 'admin' && (
              <div className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        )}
      </div>
    </Modal>
  );
}
