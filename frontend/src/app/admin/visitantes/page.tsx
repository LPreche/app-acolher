'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { CardVisitante } from '@/components/visitantes/CardVisitante';
import { CardVisitanteCompacto } from '@/components/visitantes/CardVisitanteCompacto';
import { ModalFormVisitante } from '@/components/visitantes/ModalFormVisitante';
import { ModalWhatsApp } from '@/components/visitantes/ModalWhatsApp';
import { ModalConfirmacaoStatus } from '@/components/visitantes/ModalConfirmacaoStatus';
import { ModalConfirmacaoExclusao } from '@/components/ui/ModalConfirmacaoExclusao';
import { Visitante } from '@/types/visitante';
import { visitanteService } from '@/services/visitanteService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Plus,
  Users,
  RefreshCw,
  ArrowLeft,
  LayoutGrid,
  List,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { IconeVertical } from '@/components/ui/IconeVertical';
import { clsx } from 'clsx';

function VisitantesAdminConteudo() {
  const { usuario, carregando: authCarregando } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const segmentoInicial = (searchParams.get('segmento') as 'todos' | 'familia' | 'vertical') || 'todos';

  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroSegmento, setFiltroSegmento] = useState<'todos' | 'familia' | 'vertical'>(segmentoInicial);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'nao_contactado' | 'contactado'>('todos');
  const [modoVisualizacao, setModoVisualizacao] = useState<'cards' | 'compacto'>('cards');

  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [visitanteParaEditar, setVisitanteParaEditar] = useState<Visitante | null>(null);
  const [visitanteWhatsApp, setVisitanteWhatsApp] = useState<Visitante | null>(null);
  const [visitanteConfirmarStatus, setVisitanteConfirmarStatus] = useState<Visitante | null>(null);
  const [visitanteParaExcluir, setVisitanteParaExcluir] = useState<Visitante | null>(null);

  // Redireciona se não for administrador
  useEffect(() => {
    if (!authCarregando && (!usuario || !usuario.e_admin)) {
      router.push('/login');
    }
  }, [usuario, authCarregando, router]);

  // Carrega os visitantes do backend
  const carregarVisitantes = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await visitanteService.listar({
        tipo_acolhimento: filtroSegmento === 'todos' ? undefined : filtroSegmento,
        status: filtroStatus === 'todos' ? undefined : filtroStatus,
        busca: busca.trim() || undefined,
      });
      setVisitantes(data);
    } catch (err) {
      console.error('Erro ao carregar visitantes:', err);
    } finally {
      setCarregando(false);
    }
  }, [filtroSegmento, filtroStatus, busca]);

  useEffect(() => {
    carregarVisitantes();
  }, [carregarVisitantes]);

  // Contadores
  const contadores = useMemo(() => {
    const total = visitantes.length;
    const naoContactados = visitantes.filter((v) => v.status === 'nao_contactado').length;
    const contactados = visitantes.filter((v) => v.status === 'contactado').length;
    return { total, naoContactados, contactados };
  }, [visitantes]);

  // Ações
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

  const handleConfirmarAlternanciaStatus = async (visitante: Visitante) => {
    try {
      const res = await visitanteService.alternarStatus(visitante.id);
      handleSucessoSalvar(res.visitante);
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!visitanteParaExcluir) return;
    try {
      await visitanteService.inativar(visitanteParaExcluir.id);
      setVisitantes((prev) => prev.filter((v) => v.id !== visitanteParaExcluir.id));
      setVisitanteParaExcluir(null);
    } catch (err) {
      console.error('Erro ao inativar visitante:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 box-border">
      <Header />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 space-y-4 box-border">
        {/* Topo com Navegação de Volta */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Voltar para o Painel do Administrador"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-purple-100 text-purple-700">
                  <Shield className="w-3.5 h-3.5" />
                </span>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">Visitantes (Geral)</h1>
              </div>
              <p className="text-xs text-slate-500">Gestão unificada de todos os cultos</p>
            </div>
          </div>

          <Button
            onClick={() => {
              setVisitanteParaEditar(null);
              setModalNovoAberto(true);
            }}
            variant="primary"
            size="sm"
            className="font-bold shadow-sm"
            icone={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Novo Visitante
          </Button>
        </div>

        {/* Barra de Busca e Filtro de Cultos */}
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 box-border">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou observações..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3370] focus:bg-white transition-all box-border"
            />
          </div>

          {/* Filtro por Culto / Segmento */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setFiltroSegmento('todos')}
              className={clsx(
                'px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-smooth cursor-pointer',
                filtroSegmento === 'todos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Todos os Cultos
            </button>
            <button
              onClick={() => setFiltroSegmento('familia')}
              className={clsx(
                'px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-smooth cursor-pointer flex items-center gap-1',
                filtroSegmento === 'familia'
                  ? 'bg-[#1E3370] text-white shadow-xs'
                  : 'bg-indigo-50 text-[#1E3370] hover:bg-indigo-100'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Acolher Família</span>
            </button>
            <button
              onClick={() => setFiltroSegmento('vertical')}
              className={clsx(
                'px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-smooth cursor-pointer flex items-center gap-1',
                filtroSegmento === 'vertical'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-blue-50 text-[#2563EB] hover:bg-blue-100'
              )}
            >
              <IconeVertical className="w-3.5 h-3.5" variante={filtroSegmento === 'vertical' ? 'branco' : 'padrao'} />
              <span>Acolher Vertical</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtro de Status + Seletor de Modo de Exibição */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Status Chips */}
          <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto pb-1">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={clsx(
                'px-3 py-1 rounded-xl transition-smooth',
                filtroStatus === 'todos'
                  ? 'bg-slate-800 text-white font-bold shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              Todos ({contadores.total})
            </button>
            <button
              onClick={() => setFiltroStatus('nao_contactado')}
              className={clsx(
                'px-3 py-1 rounded-xl transition-smooth flex items-center gap-1',
                filtroStatus === 'nao_contactado'
                  ? 'bg-amber-500 text-white font-bold shadow-2xs'
                  : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendentes ({contadores.naoContactados})</span>
            </button>
            <button
              onClick={() => setFiltroStatus('contactado')}
              className={clsx(
                'px-3 py-1 rounded-xl transition-smooth flex items-center gap-1',
                filtroStatus === 'contactado'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Contactados ({contadores.contactados})</span>
            </button>
          </div>

          {/* Toggle de Modo Visual: Cards vs Simples */}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="flex items-center bg-white border border-slate-200/80 rounded-xl p-0.5 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setModoVisualizacao('cards')}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-semibold',
                  modoVisualizacao === 'cards'
                    ? 'bg-[#1E3370] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
                title="Visualização em Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setModoVisualizacao('compacto')}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-semibold',
                  modoVisualizacao === 'compacto'
                    ? 'bg-[#1E3370] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
                title="Visualização em Linhas Simples"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Simples</span>
              </button>
            </div>

            <button
              onClick={carregarVisitantes}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Atualizar lista"
            >
              <RefreshCw className={clsx('w-4 h-4', carregando && 'animate-spin text-[#1E3370]')} />
            </button>
          </div>
        </div>

        {/* Lista de Visitantes */}
        {carregando ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#1E3370]" />
            <p className="text-xs font-semibold">Carregando visitantes...</p>
          </div>
        ) : visitantes.length === 0 ? (
          <div className="py-12 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Nenhum visitante encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {busca ? 'Nenhum resultado corresponde à sua busca.' : 'Não há visitantes cadastrados neste filtro.'}
              </p>
            </div>
            <Button
              onClick={() => {
                setVisitanteParaEditar(null);
                setModalNovoAberto(true);
              }}
              variant="outline"
              size="sm"
            >
              Cadastrar Primeiro Visitante
            </Button>
          </div>
        ) : (
          <div className={clsx(
            modoVisualizacao === 'cards' ? 'space-y-3' : 'space-y-2'
          )}>
            {visitantes.map((v) =>
              modoVisualizacao === 'cards' ? (
                <CardVisitante
                  key={v.id}
                  visitante={v}
                  onContatoWhatsApp={(item) => setVisitanteWhatsApp(item)}
                  onEditar={(item) => {
                    setVisitanteParaEditar(item);
                    setModalNovoAberto(true);
                  }}
                  onAlternarStatus={(item) => setVisitanteConfirmarStatus(item)}
                  onInativar={(item) => setVisitanteParaExcluir(item)}
                />
              ) : (
                <CardVisitanteCompacto
                  key={v.id}
                  visitante={v}
                  onContatoWhatsApp={(item) => setVisitanteWhatsApp(item)}
                  onEditar={(item) => {
                    setVisitanteParaEditar(item);
                    setModalNovoAberto(true);
                  }}
                  onAlternarStatus={(item) => setVisitanteConfirmarStatus(item)}
                  onInativar={(item) => setVisitanteParaExcluir(item)}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* Modais do Sistema */}
      <ModalFormVisitante
        aberto={modalNovoAberto}
        onClose={() => {
          setModalNovoAberto(false);
          setVisitanteParaEditar(null);
        }}
        visitanteParaEditar={visitanteParaEditar}
        tipoAcolhimentoPadrao={filtroSegmento === 'vertical' ? 'vertical' : 'familia'}
        onSucesso={handleSucessoSalvar}
      />

      <ModalWhatsApp
        aberto={!!visitanteWhatsApp}
        onClose={() => setVisitanteWhatsApp(null)}
        visitante={visitanteWhatsApp}
        onSucesso={handleSucessoSalvar}
      />

      <ModalConfirmacaoStatus
        aberto={!!visitanteConfirmarStatus}
        onClose={() => setVisitanteConfirmarStatus(null)}
        visitante={visitanteConfirmarStatus}
        onConfirmar={handleConfirmarAlternanciaStatus}
      />

      <ModalConfirmacaoExclusao
        aberto={!!visitanteParaExcluir}
        onClose={() => setVisitanteParaExcluir(null)}
        onConfirmar={handleConfirmarExclusao}
        titulo="Inativar Visitante"
        nomeItem={visitanteParaExcluir?.nome}
        descricao="Tem certeza que deseja inativar este visitante? Ele sairá da lista ativa de acompanhamento."
        textoBotaoConfirmar="Sim, Inativar Visitante"
      />

      {/* Barra de Navegação Inferior */}
      <BottomNav onAbrirNovoVisitante={() => {
        setVisitanteParaEditar(null);
        setModalNovoAberto(true);
      }} />
    </div>
  );
}

export default function VisitantesAdminPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1E3370]" />
        </div>
      }
    >
      <VisitantesAdminConteudo />
    </React.Suspense>
  );
}
