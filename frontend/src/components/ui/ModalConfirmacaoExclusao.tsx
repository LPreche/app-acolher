'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ModalConfirmacaoExclusaoProps {
  aberto: boolean;
  onClose: () => void;
  onConfirmar: () => Promise<void> | void;
  titulo?: string;
  nomeItem?: string;
  descricao?: string;
  textoBotaoConfirmar?: string;
}

export function ModalConfirmacaoExclusao({
  aberto,
  onClose,
  onConfirmar,
  titulo = 'Confirmar Exclusão',
  nomeItem,
  descricao = 'Tem certeza que deseja inativar este registro? Esta ação removerá o item das listagens ativas.',
  textoBotaoConfirmar = 'Sim, Excluir',
}: ModalConfirmacaoExclusaoProps) {
  const [carregando, setCarregando] = useState(false);

  const handleConfirmar = async () => {
    setCarregando(true);
    try {
      await onConfirmar();
      onClose();
    } catch {
      // Erro tratado pelo chamador
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo={titulo}
      subtitulo="Ação de segurança do sistema"
      tamanho="sm"
    >
      <div className="space-y-4 py-2 text-left">
        {/* Card de Alerta Visual */}
        <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200/80 flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-700 flex-shrink-0 mt-0.5">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <h4 className="font-bold text-rose-950 text-sm">Atenção para esta ação</h4>
            {nomeItem && (
              <p className="text-xs text-rose-900 font-semibold bg-rose-100/70 px-2.5 py-1 rounded-lg truncate">
                {nomeItem}
              </p>
            )}
            <p className="text-xs text-rose-700 leading-relaxed pt-0.5">
              {descricao}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={carregando}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            carregando={carregando}
            onClick={handleConfirmar}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200"
            icone={<Trash2 className="w-4 h-4" />}
          >
            {textoBotaoConfirmar}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
