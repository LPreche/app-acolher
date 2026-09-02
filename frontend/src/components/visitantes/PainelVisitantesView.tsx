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
import { Button } from '@/components/ui/Button';
import {
  Search,
  Plus,
  Users,
  RefreshCw,
  ArrowLeft,
  LayoutGrid,
  List,
} from 'lucide-react';
import { IconeVertical } from '@/components/ui/IconeVertical';
import { clsx } from 'clsx';

interface PainelVisitantesViewProps {
  tipo: TipoAcolhimento;
  titulo: string;
  subtitulo: string;
}

export function PainelVisitantesView({
  tipo,
  titulo,
  subtitulo,
}: PainelVisitantesViewProps) {
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'nao_contactado' | 'contactado'>('todos');
  const [modoVisualizacao, setModoVisualizacao] = useState<'cards' | 'compacto'>('cards');

  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
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

  // Carrega sempre a lista completa do segmento para manter os contadores de chips 100% corretos
  const carregarVisitantes = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await visitanteService.listar({
        tipo_acolhimento: tipo,
        busca: busca.trim() || undefined,
        ordem: 'prioridade',
        ativo: true,
      });
      setVisitantes(lista);
    } catch (err) {
      console.error('Erro ao carregar lista de visitantes:', err);
    } finally {
      setCarregando(false);
    }
  }, [tipo, busca]);

  useEffect(() => {
    carregarVisitantes();
  }, [carregarVisitantes]);

  // Contadores fixos e precisos baseados na lista completa carregada
  const totalNaoContactados = useMemo(
    () => visitantes.filter((v) => v.status === 'nao_contactado').length,
    [visitantes]
  );
  const totalContactados = useMemo(
    () => visitantes.filter((v) => v.status === 'contactado').length,
    [visitantes]
  );
  const totalTodos = visitantes.length;

  // Filtragem dinâmica instantânea para renderização
  const visitantesFiltrados = useMemo(() => {
    if (filtroStatus === 'nao_contactado') {
      return visitantes.filter((v) => v.status === 'nao_contactado');
    }
    if (filtroStatus === 'contactado') {
      return visitantes.filter((v) => v.status === 'contactado');
    }
    return visitantes;
  }, [visitantes, filtroStatus]);

  const handleConfirmarInativacao = async () => {
    if (!visitanteParaExcluir) return;
    try {
      await visitanteService.inativar(visitanteParaExcluir.id);
      setVisitantes((prev) => prev.filter((v) => v.id !== visitanteParaExcluir.id));
    } catch (err) {
      alert('Erro ao inativar visitante.');
    }
  };

  // Callback de sucesso ao salvar (novo ou edição)
  const handleSucessoSalvar = (visitanteSalvo: Visitante) => {
    setVisitantes((prev) => {
      const index = prev.findIndex((v) => v.id === visitanteSalvo.id);
      if (index >= 0) {
        const nova = [...prev];
        nova[index] = visitanteSalvo;
        return nova;
      }
      return [visitanteSalvo, ...prev];
    });
  };

  // Abre modal de confirmação de status com seleção de momento
  const handleClicarStatus = (visitante: Visitante) => {
    setVisitanteConfirmarStatus(visitante);
  };

  // Aplica a alteração de status confirmada pelo modal
  const handleSucessoStatus = (visitanteAtualizado: Visitante) => {
    setVisitantes((prev) =>
      prev.map((v) => (v.id === visitanteAtualizado.id ? visitanteAtualizado : v))
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 text-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Topbar com Botão Voltar e Título da Página */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/painel/${tipo}`}
              className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-xs"
              title="Voltar ao início"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[clamp(1.1rem,3.8vw,1.4rem)] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {tipo === 'vertical' ? (
                    <span className="flex items-center gap-1.5">
                      <IconeVertical className="w-5 h-5" />
                      {titulo}
                    </span>
                  ) : (
                    <span>👥 {titulo}</span>
                  )}
                </h1>
              </div>
              <p className="text-[clamp(0.72rem,2.4vw,0.82rem)] text-slate-500 font-medium">
                {subtitulo}
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              setVisitanteParaEditar(null);
              setModalNovoAberto(true);
            }}
            variant="primary"
            size="sm"
            icone={<Plus className="w-4 h-4" />}
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Novo Visitante</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="space-y-2.5">
          {/* Input de Busca */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3370] focus:border-transparent transition-all"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros em Chips, Seletor de Modo e Botão de Atualizar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <button
                onClick={() => setFiltroStatus('todos')}
                className={clsx(
                  'px-3 py-1.5 rounded-full font-bold transition-smooth text-[clamp(0.68rem,2.2vw,0.75rem)] whitespace-nowrap',
                  filtroStatus === 'todos'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                Todos ({totalTodos})
              </button>
              <button
                onClick={() => setFiltroStatus('nao_contactado')}
                className={clsx(
                  'px-3 py-1.5 rounded-full font-bold transition-smooth text-[clamp(0.68rem,2.2vw,0.75rem)] whitespace-nowrap',
                  filtroStatus === 'nao_contactado'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                )}
              >
                ⏳ Não Contactados ({totalNaoContactados})
              </button>
              <button
                onClick={() => setFiltroStatus('contactado')}
                className={clsx(
                  'px-3 py-1.5 rounded-full font-bold transition-smooth text-[clamp(0.68rem,2.2vw,0.75rem)] whitespace-nowrap',
                  filtroStatus === 'contactado'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                )}
              >
                ✅ Contactados ({totalContactados})
              </button>
            </div>
          </div>
        </div>

        {/* Lista Completa de Cards de Visitantes */}
        {carregando && visitantes.length === 0 ? (
          <div className="space-y-3 py-8 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#1E3370] border-t-transparent animate-spin mx-auto" />
            <p className="text-[clamp(0.72rem,2.4vw,0.82rem)] text-slate-500 font-medium">Carregando visitantes...</p>
          </div>
        ) : visitantesFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-center border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[clamp(0.9rem,3vw,1.05rem)]">
                Nenhum visitante {filtroStatus === 'nao_contactado' ? 'pendente' : filtroStatus === 'contactado' ? 'contactado' : ''} encontrado
              </h3>
              <p className="text-[clamp(0.72rem,2.4vw,0.82rem)] text-slate-500 mt-1 max-w-xs mx-auto">
                {busca
                  ? 'Nenhum resultado para os termos pesquisados.'
                  : filtroStatus !== 'todos'
                  ? 'Não há visitantes correspondentes a este filtro.'
                  : 'Nenhum visitante cadastrado nesta visualização. Clique no botão abaixo para adicionar.'}
              </p>
            </div>
            {filtroStatus === 'todos' && (
              <Button
                onClick={() => {
                  setVisitanteParaEditar(null);
                  setModalNovoAberto(true);
                }}
                variant="primary"
                size="md"
                className="mx-auto"
                icone={<Plus className="w-4 h-4" />}
              >
                Cadastrar Novo Visitante
              </Button>
            )}
          </div>
        ) : (
          <div className={clsx(modoVisualizacao === 'compacto' ? 'space-y-2' : 'space-y-3')}>
            <div className="flex items-center justify-between px-1 gap-2 flex-wrap pb-0.5">
              <span className="text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold uppercase tracking-wider text-slate-500">
                Lista de Visitantes ({visitantesFiltrados.length})
              </span>

              <div className="flex items-center gap-1.5">
                {/* Seletor de Visualização (Cards vs Simples) */}
                <div className="flex items-center bg-white p-0.5 rounded-full border border-slate-200 shadow-xs">
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

                {/* Botão de Atualizar / Recarregar Lista */}
                <button
                  type="button"
                  onClick={() => carregarVisitantes()}
                  className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-xs flex-shrink-0"
                  title="Recarregar lista"
                >
                  <RefreshCw className={clsx('w-3.5 h-3.5', carregando && 'animate-spin')} />
                </button>
              </div>
            </div>

            {visitantesFiltrados.map((visitante) =>
              modoVisualizacao === 'compacto' ? (
                <CardVisitanteCompacto
                  key={visitante.id}
                  visitante={visitante}
                  onContatoWhatsApp={(v) => setVisitanteWhatsApp(v)}
                  onEditar={(v) => {
                    setVisitanteParaEditar(v);
                    setModalNovoAberto(true);
                  }}
                  onInativar={(v) => setVisitanteParaExcluir(v)}
                  onAlternarStatus={handleClicarStatus}
                />
              ) : (
                <CardVisitante
                  key={visitante.id}
                  visitante={visitante}
                  onContatoWhatsApp={(v) => setVisitanteWhatsApp(v)}
                  onEditar={(v) => {
                    setVisitanteParaEditar(v);
                    setModalNovoAberto(true);
                  }}
                  onInativar={(v) => setVisitanteParaExcluir(v)}
                  onAlternarStatus={handleClicarStatus}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* Navegação Inferior Mobile com botão flutuante + */}
      <BottomNav
        onAbrirNovoVisitante={() => {
          setVisitanteParaEditar(null);
          setModalNovoAberto(true);
        }}
      />

      {/* Modal Visual de Confirmação de Exclusão/Inativação de Visitante */}
      <ModalConfirmacaoExclusao
        aberto={!!visitanteParaExcluir}
        onClose={() => setVisitanteParaExcluir(null)}
        nomeItem={visitanteParaExcluir ? `Visitante: ${visitanteParaExcluir.nome}` : undefined}
        onConfirmar={handleConfirmarInativacao}
        descricao="Ao inativar, este visitante sairá do painel operacional, mas seu histórico permanecerá salvo no sistema."
      />

      {/* Modal de Confirmação de Alteração de Status */}
      <ModalConfirmacaoStatus
        aberto={!!visitanteConfirmarStatus}
        onClose={() => setVisitanteConfirmarStatus(null)}
        visitante={visitanteConfirmarStatus}
        onConfirmar={async (v) => {
          const res = await visitanteService.alternarStatus(v.id);
          handleSucessoStatus(res.visitante);
        }}
      />

      {/* Modal de Formulário de Visitante (Criar / Editar) */}
      <ModalFormVisitante
        aberto={modalNovoAberto}
        onClose={() => {
          setModalNovoAberto(false);
          setVisitanteParaEditar(null);
        }}
        visitanteParaEditar={visitanteParaEditar}
        tipoAcolhimentoPadrao={tipo}
        onSucesso={handleSucessoSalvar}
      />

      {/* Modal de Disparo WhatsApp */}
      <ModalWhatsApp
        aberto={!!visitanteWhatsApp}
        onClose={() => setVisitanteWhatsApp(null)}
        visitante={visitanteWhatsApp}
        onSucesso={handleSucessoSalvar}
      />
    </div>
  );
}
