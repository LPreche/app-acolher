'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Visitante } from '@/types/visitante';
import { CheckCircle2, AlertCircle, ArrowRight, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ModalConfirmacaoStatusProps {
  visitante: Visitante | null;
  aberto: boolean;
  onClose: () => void;
  onConfirmar: (visitante: Visitante) => Promise<void>;
}

export function ModalConfirmacaoStatus({
  visitante,
  aberto,
  onClose,
  onConfirmar,
}: ModalConfirmacaoStatusProps) {
  const [salvando, setSalvando] = useState(false);

  if (!visitante) return null;

  const eNaoContactado = visitante.status === 'nao_contactado';

  const handleConfirmar = async () => {
    setSalvando(true);
    try {
      await onConfirmar(visitante);
      onClose();
    } catch {
      // Erro tratado no handler principal
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Confirmar Alteração de Status"
      subtitulo="Atualização do acompanhamento de acolhimento"
      tamanho="sm"
    >
      <div className="space-y-4 py-1 text-left">
        {/* Identificação do Visitante */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-[#1E3370] rounded-xl">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{visitante.nome}</h4>
              <p className="text-xs text-slate-500">{visitante.whatsapp}</p>
            </div>
          </div>

          {/* Transição de Status Visual */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs font-semibold">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Status Atual:</span>
              {eNaoContactado ? (
                <Badge variant="warning" dot size="sm">
                  Não Contactado
                </Badge>
              ) : (
                <Badge variant="success" dot size="sm">
                  Contactado
                </Badge>
              )}
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 mt-3" />

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Novo Status:</span>
              {eNaoContactado ? (
                <Badge variant="success" dot size="sm">
                  Contactado
                </Badge>
              ) : (
                <Badge variant="warning" dot size="sm">
                  Não Contactado
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem Explicativa */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {eNaoContactado ? (
            <span>
              Ao marcar como <strong className="text-emerald-700 font-bold">Contactado</strong>, o sistema registrará a data de hoje como último contato e o visitante sairá da fila prioritária de espera.
            </span>
          ) : (
            <span>
              Ao retornar para <strong className="text-amber-800 font-bold">Não Contactado</strong>, o visitante voltará a constar na lista prioritária de contatos pendentes.
            </span>
          )}
        </p>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={salvando}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant={eNaoContactado ? 'primary' : 'outline'}
            size="md"
            carregando={salvando}
            onClick={handleConfirmar}
            className={eNaoContactado ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200' : ''}
            icone={eNaoContactado ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
          >
            {eNaoContactado ? 'Sim, Marcar Contactado' : 'Sim, Retornar Status'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
