'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { notificacoesPush } from '@/utils/notificacoesPush';
import { Bell, Calendar, Sparkles, ShieldCheck } from 'lucide-react';

export function ModalPermissaoNotificacao() {
  const [aberto, setAberto] = useState(false);
  const [ativando, setAtivando] = useState(false);

  useEffect(() => {
    // Verifica se deve abrir a solicitação de permissão
    if (typeof window === 'undefined') return;

    const suportado = notificacoesPush.isSuportado();
    const status = notificacoesPush.obterStatus();
    const jaDispensou = localStorage.getItem('acolher_notif_prompt_dismissed');

    if (suportado && status === 'default' && !jaDispensou) {
      // Abre o modal após 1.5s de carregamento da página para não ser intrusivo
      const timer = setTimeout(() => {
        setAberto(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAtivar = async () => {
    setAtivando(true);
    try {
      const permitiu = await notificacoesPush.solicitarPermissaoEAssinar();
      if (permitiu) {
        await notificacoesPush.enviarNotificacaoLocal('🔔 Notificações Ativadas!', {
          body: 'Seu celular está configurado para receber lembretes de acolhimento nas segundas e sextas-feiras.',
        });
      }
      setAberto(false);
    } finally {
      setAtivando(false);
    }
  };

  const handleDispensar = () => {
    localStorage.setItem('acolher_notif_prompt_dismissed', 'true');
    setAberto(false);
  };

  if (!aberto) return null;

  return (
    <Modal
      aberto={aberto}
      onClose={handleDispensar}
      tamanho="sm"
      titulo="Ativar Lembretes no Celular"
      subtitulo="Nunca perca o momento de acolher um visitante."
    >
      <div className="space-y-4 text-left">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#1E3370] flex items-center justify-center mx-auto border border-indigo-100 shadow-sm">
          <Bell className="w-7 h-7 animate-bounce" />
        </div>

        <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-[#1E3370] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900">Segunda-feira:</strong> Aviso matinal dos visitantes que aguardam seu 1º contato de boas-vindas.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900">Sexta-feira:</strong> Alerta para convidar seus visitantes para o culto deste final de semana.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900">100% Direcionado:</strong> Você receberá alertas apenas dos visitantes sob sua responsabilidade.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <Button
            type="button"
            variant="primary"
            onClick={handleAtivar}
            carregando={ativando}
            className="w-full py-3 font-bold shadow-md shadow-indigo-100"
          >
            Ativar Notificações Agora
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleDispensar}
            className="w-full text-slate-500 hover:text-slate-700 text-xs"
          >
            Lembrar mais tarde
          </Button>
        </div>
      </div>
    </Modal>
  );
}
