'use client';

import React from 'react';
import { Visitante } from '@/types/visitante';
import { Badge } from '@/components/ui/Badge';
import { obterEstiloDiasSemContato } from '@/utils/formatters';
import {
  MessageCircle,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

interface CardVisitanteCompactoProps {
  visitante: Visitante;
  onContatoWhatsApp: (visitante: Visitante) => void;
  onEditar: (visitante: Visitante) => void;
  onInativar: (visitante: Visitante) => void;
  onAlternarStatus?: (visitante: Visitante) => void;
}

export function CardVisitanteCompacto({
  visitante,
  onContatoWhatsApp,
  onEditar,
  onInativar,
  onAlternarStatus,
}: CardVisitanteCompactoProps) {
  const estiloDias = obterEstiloDiasSemContato(
    visitante.dias_sem_contato,
    visitante.status
  );

  const eNaoContactado = visitante.status === 'nao_contactado';

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl p-3 sm:p-3.5 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5',
        eNaoContactado && estiloDias.urgente
          ? 'border-rose-200 bg-rose-50/15 hover:border-rose-300'
          : 'border-slate-200/80 hover:border-slate-300'
      )}
    >
      {/* Informações Principais (Nome, Telefone, Etapas e Dias) */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-slate-900 text-sm truncate leading-snug">
            {visitante.nome}
          </h4>

          {/* Badge de Status Interativo */}
          <button
            type="button"
            onClick={() => onAlternarStatus && onAlternarStatus(visitante)}
            className="cursor-pointer active:scale-95 transition-transform inline-flex items-center"
            title="Clique para alternar o status deste visitante"
          >
            {eNaoContactado ? (
              <Badge variant="warning" size="sm" className="text-[10px] py-0 px-2 font-bold">
                ⏳ Pendente
              </Badge>
            ) : (
              <Badge variant="success" size="sm" className="text-[10px] py-0 px-2 font-bold">
                ✅ Contactado
              </Badge>
            )}
          </button>
        </div>

        {/* Linha Compacta com Telefone, Origem e Etapas de Contato */}
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <span className="font-semibold text-slate-700">{visitante.whatsapp}</span>
          <span className="text-slate-300">•</span>
          <span className="truncate max-w-[140px] sm:max-w-xs">{visitante.como_chegou}</span>

          {/* Badges de Lembretes Segunda & Sexta */}
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[11px]">
            <span
              className={clsx(
                'px-1.5 py-0.2 rounded border',
                visitante.contato_segunda_enviado
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              )}
              title={
                visitante.contato_segunda_enviado
                  ? `Segunda enviada (${visitante.data_contato_segunda_formatada || ''})`
                  : 'Mensagem de segunda pendente'
              }
            >
              Seg: {visitante.contato_segunda_enviado ? '✅' : '⏳'}
            </span>
            <span
              className={clsx(
                'px-1.5 py-0.2 rounded border',
                visitante.contato_sexta_enviado
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              )}
              title={
                visitante.contato_sexta_enviado
                  ? `Sexta enviada (${visitante.data_contato_sexta_formatada || ''})`
                  : 'Mensagem de sexta pendente'
              }
            >
              Sex: {visitante.contato_sexta_enviado ? '✅' : '⏳'}
            </span>
          </span>

          {/* Dias Sem Contato */}
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span
            className={clsx(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold border',
              estiloDias.classe
            )}
          >
            <Clock className="w-3 h-3" />
            <span>{estiloDias.texto}</span>
          </span>
        </div>
      </div>

      {/* Ações Rápidas (WhatsApp, Editar, Inativar) */}
      <div className="flex items-center gap-1.5 justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
        <button
          type="button"
          onClick={() => onContatoWhatsApp(visitante)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          title="Enviar WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => onEditar(visitante)}
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all"
          title="Editar dados do visitante"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onInativar(visitante)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-xl transition-all"
          title="Inativar visitante"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
