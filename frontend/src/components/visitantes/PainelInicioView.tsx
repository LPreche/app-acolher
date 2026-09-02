'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { CardVisitante } from '@/components/visitantes/CardVisitante';
import { CardVisitanteCompacto } from '@/components/visitantes/CardVisitanteCompacto';
import { ModalFormVisitante } from '@/components/visitantes/ModalFormVisitante';
import { ModalWhatsApp } from '@/components/visitantes/ModalWhatsApp';
import { ModalConfirmacaoStatus } from '@/components/visitantes/ModalConfirmacaoStatus';
import { ModalConfirmacaoExclusao } from '@/components/ui/ModalConfirmacaoExclusao';
import { Visitante, TipoAcolhimento } from '@/types/visitante';
import { visitanteService } from '@/services/visitanteService';
import { notificacoesPush } from '@/utils/notificacoesPush';
import {
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Calendar,
  Sparkles,
  Bell,
  CheckCircle2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { IconeVertical } from '@/components/ui/IconeVertical';
import { clsx } from 'clsx';

interface PainelInicioViewProps {
  tipo: TipoAcolhimento;
  titulo: string;
  subtitulo: string;
  corTema: 'navy' | 'flame';
}

export function PainelInicioView({
  tipo,
  titulo,
  subtitulo,
  corTema,
}: PainelInicioViewProps) {
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [statusNotificacao, setStatusNotificacao] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [modoVisualizacao, setModoVisualizacao] = useState<'cards' | 'compacto'>('cards');

  // Modais de ação rápida nos cards
  const [visitanteParaEditar, setVisitanteParaEditar] = useState<Visitante | null>(null);
  const [visitanteWhatsApp, setVisitanteWhatsApp] = useState<Visitante | null>(null);
  const [visitanteConfirmarStatus, setVisitanteConfirmarStatus] = useState<Visitante | null>(null);
  const [visitanteParaExcluir, setVisitanteParaExcluir] = useState<Visitante | null>(null);

  // Carrega preferência de visualização do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem('acolher_modo_vis_visitantes');
      if (salvo === 'cards' || salvo === 'compacto') {
        setModoVisualizacao(salvo);
      }
    }
  }, []);

  const alternarModoVisualizacao = (modo: 'cards' | 'compacto') => {
    setModoVisualizacao(modo);
    if (typeof window !== 'undefined') {
      localStorage.setItem('acolher_modo_vis_visitantes', modo);
    }
  };

  const carregarVisitantes = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await visitanteService.listar({
        tipo_acolhimento: tipo,
        ordem: 'prioridade',
        ativo: true,
      });
      setVisitantes(lista);

      // Dispara lembretes push automáticos direcionados para este usuário
      notificacoesPush.verificarLembretesDirecionados();
    } catch (err) {
      console.error('Erro ao carregar visitantes:', err);
    } finally {
      setCarregando(false);
    }
  }, [tipo]);

  useEffect(() => {
    carregarVisitantes();
    setStatusNotificacao(notificacoesPush.obterStatus());
  }, [carregarVisitantes]);

  // Contadores para o banner
  const totalNaoContactados = visitantes.filter((v) => v.status === 'nao_contactado').length;
  const totalContactados = visitantes.filter((v) => v.status === 'contactado').length;

  // Lógica de dia da semana para Lembrete Inteligente
  const diaSemana = useMemo(() => new Date().getDay(), []); // 1 = Seg, 5 = Sex
  const pendentesSegunda = useMemo(() => visitantes.filter((v) => !v.contato_segunda_enviado), [visitantes]);
  const pendentesSexta = useMemo(() => visitantes.filter((v) => !v.contato_sexta_enviado), [visitantes]);

  const handleAtivarNotificacoes = async () => {
    const permitiu = await notificacoesPush.solicitarPermissaoEAssinar();
    setStatusNotificacao(permitiu ? 'granted' : 'denied');
    if (permitiu) {
      await notificacoesPush.enviarNotificacaoLocal('🔔 Notificações Ativadas!', {
        body: 'Seu celular receberá lembretes automáticos dos visitantes sob sua responsabilidade.',
      });
    }
  };

  // Visitantes não contactados ordenados pelo maior tempo sem contato
  const visitantesNaoContactados = visitantes
    .filter((v) => v.status === 'nao_contactado')
    .sort((a, b) => b.dias_sem_contato - a.dias_sem_contato);

  // Exibe estritamente os 3 com maior tempo sem contato
  const top3SemContato = visitantesNaoContactados.slice(0, 3);
  const maisUrgente = top3SemContato[0];

  // Inativação com confirmação via modal visual
  const handleConfirmarInativacao = async () => {
    if (!visitanteParaExcluir) return;
    try {
      await visitanteService.inativar(visitanteParaExcluir.id);
      setVisitantes((prev) => prev.filter((v) => v.id !== visitanteParaExcluir.id));
    } catch (err) {
      alert('Erro ao inativar visitante.');
    }
  };

  // Abre o modal visual de confirmação de status
  const handleClicarStatus = (visitante: Visitante) => {
    setVisitanteConfirmarStatus(visitante);
  };

  // Efetua a alteração após confirmação no modal
  const handleConfirmarStatus = async (visitante: Visitante) => {
    try {
      const res = await visitanteService.alternarStatus(visitante.id);
      setVisitantes((prev) =>
        prev.map((v) => (v.id === visitante.id ? res.visitante : v))
      );
    } catch (err) {
      alert('Erro ao alternar status do visitante.');
    }
  };

  const handleSucessoSalvar = (visitanteSalvo: Visitante) => {
    setVisitantes((prev) => {
      const existe = prev.some((v) => v.id === visitanteSalvo.id);
      if (existe) {
        return prev.map((v) => (v.id === visitanteSalvo.id ? visitanteSalvo : v));
      }
      return [visitanteSalvo, ...prev];
    });
  };

  const rotaVisitantes = `/painel/${tipo}/visitantes`;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Fixo */}
      <Header />

      <main className="max-w-4xl mx-auto px-3.5 sm:px-4 pt-3.5 sm:pt-4 space-y-3.5 sm:space-y-4 text-left">
        {/* Banner do Painel com Tipografia Fluida */}
        <div
          className={clsx(
            'rounded-3xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden',
            corTema === 'navy'
              ? 'bg-gradient-to-br from-[#1E3370] to-[#13224C]'
              : 'bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]'
          )}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              {corTema === 'navy' ? (
                <Users className="w-5 h-5 opacity-90 flex-shrink-0" />
              ) : (
                <IconeVertical className="w-5 h-5 opacity-90 flex-shrink-0" variante="branco" />
              )}
              <h1 className="text-[clamp(1.15rem,4vw,1.45rem)] font-extrabold tracking-tight leading-tight">
                {titulo}
              </h1>
            </div>
            <p className="text-[clamp(0.72rem,2.4vw,0.85rem)] text-white/80 mt-1 max-w-sm leading-relaxed">
              {subtitulo}
            </p>
          </div>

          {/* Cards Rápidos de Métricas */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-3.5 sm:mt-4 pt-3 border-t border-white/15">
            <Link
              href={rotaVisitantes}
              className="bg-white/10 hover:bg-white/15 rounded-2xl p-2.5 backdrop-blur-sm transition-colors text-left"
            >
              <p className="text-[clamp(0.6rem,2vw,0.72rem)] uppercase font-bold text-white/70 tracking-wider">
                Total
              </p>
              <p className="text-[clamp(1.15rem,4vw,1.6rem)] font-black leading-tight mt-0.5">
                {visitantes.length}
              </p>
            </Link>
            <Link
              href={rotaVisitantes}
              className="bg-white/10 hover:bg-white/15 rounded-2xl p-2.5 backdrop-blur-sm transition-colors text-left"
            >
              <p className="text-[clamp(0.6rem,2vw,0.72rem)] uppercase font-bold text-amber-200 tracking-wider">
                Pendentes
              </p>
              <p className="text-[clamp(1.15rem,4vw,1.6rem)] font-black text-amber-200 leading-tight mt-0.5">
                {totalNaoContactados}
              </p>
            </Link>
            <Link
              href={rotaVisitantes}
              className="bg-white/10 hover:bg-white/15 rounded-2xl p-2.5 backdrop-blur-sm transition-colors text-left"
            >
              <p className="text-[clamp(0.6rem,2vw,0.72rem)] uppercase font-bold text-emerald-200 tracking-wider">
                Contactados
              </p>
              <p className="text-[clamp(1.15rem,4vw,1.6rem)] font-black text-emerald-200 leading-tight mt-0.5">
                {totalContactados}
              </p>
            </Link>
          </div>
        </div>

        {/* Banner de Lembrete Inteligente: Segunda-feira ou Sexta-feira */}
        {diaSemana === 1 && pendentesSegunda.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-indigo-50/90 rounded-2xl border border-indigo-200/90 text-indigo-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-[#1E3370] text-white rounded-xl flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-slate-900">
                  📅 Lembrete de Hoje (Segunda-feira)
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Você tem <strong className="text-[#1E3370] font-black">{pendentesSegunda.length} visitante(s)</strong> aguardando mensagem de boas-vindas pós-culto.
                </p>
              </div>
            </div>

            <Link
              href={rotaVisitantes}
              className="px-3.5 py-2 bg-[#1E3370] hover:bg-indigo-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
            >
              <span>Ver Lista de Segunda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {diaSemana === 5 && pendentesSexta.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-blue-50/90 rounded-2xl border border-blue-200/90 text-blue-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-[#2563EB] text-white rounded-xl flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-slate-900">
                  ✨ Lembrete de Hoje (Sexta-feira)
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Você tem <strong className="text-[#2563EB] font-black">{pendentesSexta.length} visitante(s)</strong> para convidar para o culto do fim de semana.
                </p>
              </div>
            </div>

            <Link
              href={rotaVisitantes}
              className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
            >
              <span>Ver Lista de Sexta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Prompt para Ativação de Notificações Push (apenas se pendente) */}
        {statusNotificacao === 'default' && (
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-slate-600">
                Deseja receber lembretes no navegador nas segundas e sextas-feiras?
              </span>
            </div>
            <button
              onClick={handleAtivarNotificacoes}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-sm"
            >
              Ativar Notificações
            </button>
          </div>
        )}

        {/* Card do Contato Mais Antigo */}
        {maisUrgente && maisUrgente.dias_sem_contato > 0 && (
          <div className="p-3.5 sm:p-4 bg-amber-50/90 rounded-2xl border border-amber-200/90 text-amber-900 shadow-sm space-y-2.5 transition-all">
            <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800 flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="font-bold text-[clamp(0.82rem,2.8vw,0.95rem)] leading-tight text-amber-950">
                Atenção ao contato mais antigo:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              <p className="text-[clamp(0.75rem,2.5vw,0.875rem)] text-slate-700 leading-relaxed">
                <strong className="text-slate-900 font-semibold">{maisUrgente.nome}</strong> está há{' '}
                <strong className="text-amber-800 font-bold">{maisUrgente.dias_sem_contato} dias</strong> sem contato.
              </p>
              <button
                onClick={() => setVisitanteWhatsApp(maisUrgente)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[clamp(0.72rem,2.4vw,0.82rem)] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all flex-shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Falar no WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* Cabeçalho da Seção de Prioridades */}
        <div className="flex items-center justify-between px-1 pt-1 gap-2 flex-wrap">
          <span className="text-[clamp(0.68rem,2.3vw,0.78rem)] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            Mais tempo sem contato (Top 3)
          </span>

          <div className="flex items-center gap-2.5">
            {/* Seletor de Modo de Visualização */}
            <div className="flex items-center bg-white p-0.5 rounded-full border border-slate-200 shadow-xs text-xs">
              <button
                type="button"
                onClick={() => alternarModoVisualizacao('cards')}
                className={clsx(
                  'p-1.5 rounded-full transition-all flex items-center gap-1',
                  modoVisualizacao === 'cards'
                    ? 'bg-[#1E3370] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                )}
                title="Modo Detalhado (Cards)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold pr-1 hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => alternarModoVisualizacao('compacto')}
                className={clsx(
                  'p-1.5 rounded-full transition-all flex items-center gap-1',
                  modoVisualizacao === 'compacto'
                    ? 'bg-[#1E3370] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                )}
                title="Modo Simples (Lista Compacta)"
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold pr-1 hidden sm:inline">Simples</span>
              </button>
            </div>

            <Link
              href={rotaVisitantes}
              className="text-[clamp(0.72rem,2.4vw,0.82rem)] font-bold text-[#1E3370] hover:text-indigo-900 flex items-center gap-1 transition-colors"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Lista dos 3 mais urgentes */}
        {carregando && visitantes.length === 0 ? (
          <div className="space-y-3 py-6 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#1E3370] border-t-transparent animate-spin mx-auto" />
            <p className="text-[clamp(0.72rem,2.4vw,0.82rem)] text-slate-500">Carregando prioridades...</p>
          </div>
        ) : top3SemContato.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-[clamp(0.85rem,2.8vw,0.95rem)] font-bold text-slate-800">Tudo em dia!</p>
            <p className="text-[clamp(0.72rem,2.4vw,0.82rem)] text-slate-500">
              Todos os visitantes cadastrados já foram contactados.
            </p>
          </div>
        ) : (
          <div className={clsx(modoVisualizacao === 'compacto' ? 'space-y-2' : 'space-y-3')}>
            {top3SemContato.map((visitante) =>
              modoVisualizacao === 'compacto' ? (
                <CardVisitanteCompacto
                  key={visitante.id}
                  visitante={visitante}
                  onContatoWhatsApp={(v) => setVisitanteWhatsApp(v)}
                  onEditar={(v) => setVisitanteParaEditar(v)}
                  onInativar={(v) => setVisitanteParaExcluir(v)}
                  onAlternarStatus={handleClicarStatus}
                />
              ) : (
                <CardVisitante
                  key={visitante.id}
                  visitante={visitante}
                  onContatoWhatsApp={(v) => setVisitanteWhatsApp(v)}
                  onEditar={(v) => setVisitanteParaEditar(v)}
                  onInativar={(v) => setVisitanteParaExcluir(v)}
                  onAlternarStatus={handleClicarStatus}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* Navegação Inferior Mobile */}
      <BottomNav />

      {/* Modal Visual de Confirmação de Exclusão/Inativação */}
      <ModalConfirmacaoExclusao
        aberto={!!visitanteParaExcluir}
        onClose={() => setVisitanteParaExcluir(null)}
        nomeItem={visitanteParaExcluir ? `Visitante: ${visitanteParaExcluir.nome}` : undefined}
        descricao="Tem certeza que deseja inativar este visitante? Ele sairá da fila de contatos prioritários."
        textoBotaoConfirmar="Sim, Inativar"
        onConfirmar={handleConfirmarInativacao}
      />

      {/* Modal Visual de Confirmação de Alteração de Status */}
      <ModalConfirmacaoStatus
        visitante={visitanteConfirmarStatus}
        aberto={!!visitanteConfirmarStatus}
        onClose={() => setVisitanteConfirmarStatus(null)}
        onConfirmar={handleConfirmarStatus}
      />

      {/* Modal de Disparo do WhatsApp */}
      <ModalWhatsApp
        aberto={!!visitanteWhatsApp}
        onClose={() => setVisitanteWhatsApp(null)}
        visitante={visitanteWhatsApp}
        onSucesso={handleSucessoSalvar}
      />

      {/* Modal de Edição */}
      <ModalFormVisitante
        aberto={!!visitanteParaEditar}
        onClose={() => setVisitanteParaEditar(null)}
        visitanteParaEditar={visitanteParaEditar}
        tipoAcolhimentoPadrao={tipo}
        onSucesso={handleSucessoSalvar}
      />
    </div>
  );
}
