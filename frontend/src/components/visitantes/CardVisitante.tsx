'use client';

import React from 'react';
import { Visitante } from '@/types/visitante';
import { Badge } from '@/components/ui/Badge';
import { obterEstiloDiasSemContato, formatarDataBR } from '@/utils/formatters';
import {
  MessageCircle,
  Edit2,
  Trash2,
  Calendar,
  User,
  Clock,
} from 'lucide-react';
import { IconeVertical } from '@/components/ui/IconeVertical';
import { clsx } from 'clsx';

interface CardVisitanteProps {
  visitante: Visitante;
  onContatoWhatsApp: (visitante: Visitante) => void;
  onEditar: (visitante: Visitante) => void;
  onInativar: (visitante: Visitante) => void;
  onAlternarStatus?: (visitante: Visitante) => void;
}

export function CardVisitante({
  visitante,
  onContatoWhatsApp,
  onEditar,
  onInativar,
  onAlternarStatus,
}: CardVisitanteProps) {
  const estiloDias = obterEstiloDiasSemContato(
    visitante.dias_sem_contato,
    visitante.status
  );

  const eNaoContactado = visitante.status === 'nao_contactado';

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl p-3.5 sm:p-4 card-shadow border transition-smooth',
        eNaoContactado && estiloDias.urgente
          ? 'border-rose-200 ring-1 ring-rose-100 bg-gradient-to-b from-rose-50/20 to-white'
          : 'border-slate-200/80 hover:border-slate-300'
      )}
    >
      {/* Top Header do Card: Nome e Badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 text-[clamp(0.92rem,2.8vw,1.05rem)] leading-snug truncate">
            {visitante.nome}
          </h3>
          <p className="text-[clamp(0.7rem,2.2vw,0.8rem)] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">{visitante.whatsapp}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate">{visitante.como_chegou}</span>
          </p>
        </div>

        {/* Badge de Status com confirmação */}
        <button
          onClick={() => onAlternarStatus && onAlternarStatus(visitante)}
          className="cursor-pointer active:scale-95 transition-transform flex-shrink-0"
          title="Clique para alternar o status deste visitante"
        >
          {eNaoContactado ? (
            <Badge variant="warning" dot size="sm" className="text-[clamp(0.65rem,2vw,0.75rem)]">
              Não Contactado
            </Badge>
          ) : (
            <Badge variant="success" dot size="sm" className="text-[clamp(0.65rem,2vw,0.75rem)]">
              Contactado
            </Badge>
          )}
        </button>
      </div>

      {/* Pill de Dias Sem Contato e Segmento */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span
          className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[clamp(0.68rem,2.2vw,0.75rem)] border',
            estiloDias.classe
          )}
        >
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{estiloDias.texto}</span>
        </span>

        {/* Badge de Culto / Segmento */}
        <span className="inline-flex items-center gap-1 text-[clamp(0.65rem,2vw,0.72rem)] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {visitante.tipo_acolhimento === 'vertical' ? (
            <>
              <IconeVertical className="w-3 h-3" />
              <span>Vertical</span>
            </>
          ) : (
            <span>👥 Família</span>
          )}
        </span>
      </div>

      {/* Detalhes Adicionais: Data da Visita, Responsável e Próxima Ação */}
      <div className="bg-slate-50/80 rounded-xl p-2.5 mb-3 text-[clamp(0.7rem,2.2vw,0.78rem)] space-y-1 text-slate-600 border border-slate-100">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>Visita: {formatarDataBR(visitante.data_visita)}</span>
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <User className="w-3 h-3 flex-shrink-0" />
            <span>Resp: {visitante.responsavel_nome}</span>
          </span>
        </div>

        {visitante.proxima_acao && (
          <div className="pt-1 text-slate-700 font-medium">
            <span className="text-slate-500">Próxima Ação: </span>
            {visitante.proxima_acao}
          </div>
        )}

        {visitante.observacoes && (
          <div className="text-slate-500 italic truncate">
            &ldquo;{visitante.observacoes}&rdquo;
          </div>
        )}

        {/* Rastreamento de Contato: Segunda e Sexta */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 text-[clamp(0.65rem,2vw,0.72rem)] font-medium flex-wrap">
          {/* Segunda */}
          <span
            className={clsx(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border',
              visitante.contato_segunda_enviado
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50/90 text-amber-800 border-amber-200/90'
            )}
            title={visitante.contato_segunda_enviado ? `Mensagem de Segunda enviada` : 'Mensagem de Segunda pendente'}
          >
            <span className="font-bold">Seg:</span>
            {visitante.contato_segunda_enviado ? (
              <span>✅ Enviada {visitante.data_contato_segunda_formatada ? `(${visitante.data_contato_segunda_formatada.slice(0, 5)})` : ''}</span>
            ) : (
              <span>⏳ Pendente</span>
            )}
          </span>

          {/* Sexta */}
          <span
            className={clsx(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border',
              visitante.contato_sexta_enviado
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            )}
            title={visitante.contato_sexta_enviado ? `Mensagem de Sexta enviada` : 'Mensagem de Sexta pendente'}
          >
            <span className="font-bold">Sex:</span>
            {visitante.contato_sexta_enviado ? (
              <span>✅ Enviada {visitante.data_contato_sexta_formatada ? `(${visitante.data_contato_sexta_formatada.slice(0, 5)})` : ''}</span>
            ) : (
              <span>⏳ Pendente</span>
            )}
          </span>
        </div>
      </div>

      {/* Barra de Ações Rápidas */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        {/* Botão Principal de WhatsApp */}
        <button
          onClick={() => onContatoWhatsApp(visitante)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[clamp(0.72rem,2.3vw,0.8rem)] font-bold transition-smooth shadow-sm shadow-emerald-200 active:scale-98"
        >
          <MessageCircle className="w-4 h-4 fill-white flex-shrink-0" />
          <span>Falar no WhatsApp</span>
        </button>

        {/* Botão de Editar */}
        <button
          onClick={() => onEditar(visitante)}
          className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          title="Editar dados"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Botão de Inativar */}
        <button
          onClick={() => onInativar(visitante)}
          className="p-2.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          title="Inativar visitante"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
