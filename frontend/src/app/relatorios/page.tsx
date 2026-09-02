'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Visitante, TipoAcolhimento } from '@/types/visitante';
import { visitanteService } from '@/services/visitanteService';
import { useAuth } from '@/context/AuthContext';
import {
  exportarParaPDF,
  exportarParaCSV,
  exportarParaXLSX,
  mapearVisitanteParaRelatorio,
} from '@/utils/exportRelatorios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';
import { clsx } from 'clsx';

import { useRouter } from 'next/navigation';

export default function RelatoriosPage() {
  const { usuario, carregando: authCarregando, contextoAtivo } = useAuth();
  const router = useRouter();
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [exportando, setExportando] = useState<string | null>(null);

  // Redireciona usuários sem permissão (apenas Admin e Líder podem acessar relatórios)
  useEffect(() => {
    if (!authCarregando && usuario) {
      const temPermissao = usuario.pode_acessar_relatorios || usuario.e_admin || usuario.e_lider;
      if (!temPermissao) {
        router.push(usuario.pode_acessar_vertical ? '/painel/vertical' : '/painel/familia');
      }
    }
  }, [usuario, authCarregando, router]);

  // Filtros
  const [filtroSegmento, setFiltroSegmento] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroMes, setFiltroMes] = useState<string>('todos');
  const [busca, setBusca] = useState('');

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await visitanteService.listar({
        tipo_acolhimento: filtroSegmento === 'todos' ? undefined : filtroSegmento,
        status: filtroStatus === 'todos' ? undefined : filtroStatus,
        busca: busca.trim() || undefined,
        ordem: 'mais_recentes',
      });
      setVisitantes(lista);
    } catch (err) {
      console.error('Erro ao carregar visitantes para o relatório:', err);
    } finally {
      setCarregando(false);
    }
  }, [filtroSegmento, filtroStatus, busca]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Lista única de meses disponíveis nos dados
  const mesesDisponiveis = useMemo(() => {
    const mesesSet = new Set<string>();
    visitantes.forEach((v) => {
      if (v.mes_ano) mesesSet.add(v.mes_ano);
    });
    return Array.from(mesesSet);
  }, [visitantes]);

  // Visitantes filtrados também por mês selecionado
  const visitantesFiltrados = useMemo(() => {
    if (filtroMes === 'todos') return visitantes;
    return visitantes.filter((v) => v.mes_ano === filtroMes);
  }, [visitantes, filtroMes]);

  const totalNaoContactados = visitantesFiltrados.filter((v) => v.status === 'nao_contactado').length;
  const totalContactados = visitantesFiltrados.filter((v) => v.status === 'contactado').length;

  const rotaVoltar = contextoAtivo === 'admin'
    ? '/admin'
    : `/painel/${contextoAtivo}`;

  const handleExportarPDF = () => {
    setExportando('pdf');
    try {
      const tituloFiltro = filtroSegmento === 'todos'
        ? 'Todos os Cultos'
        : filtroSegmento === 'vertical' ? 'Acolher Vertical' : 'Acolher Família';
      exportarParaPDF(visitantesFiltrados, tituloFiltro);
    } finally {
      setExportando(null);
    }
  };

  const handleExportarCSV = () => {
    setExportando('csv');
    try {
      exportarParaCSV(visitantesFiltrados);
    } finally {
      setExportando(null);
    }
  };

  const handleExportarXLSX = async () => {
    setExportando('xlsx');
    try {
      await exportarParaXLSX(visitantesFiltrados);
    } finally {
      setExportando(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Fixo */}
      <Header />

      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-4 space-y-4">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href={rotaVoltar}
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Voltar ao painel"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1E3370]" />
                Relatório de Visitantes
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Exportação de dados conforme tabela oficial da igreja
              </p>
            </div>
          </div>

          {/* Botões de Exportação Rápidos Padronizados com Tamanho Uniforme e Tipografia Fluida */}
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center">
            {/* Exportar PDF */}
            <button
              onClick={handleExportarPDF}
              disabled={visitantesFiltrados.length === 0 || !!exportando}
              className="flex-1 sm:flex-initial sm:min-w-[125px] h-10 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-[clamp(0.68rem,2.1vw,0.8rem)] font-bold shadow-sm shadow-rose-200 active:scale-95 transition-all whitespace-nowrap"
              title="Baixar em formato PDF"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>Gerar PDF</span>
            </button>

            {/* Exportar XLSX */}
            <button
              onClick={handleExportarXLSX}
              disabled={visitantesFiltrados.length === 0 || !!exportando}
              className="flex-1 sm:flex-initial sm:min-w-[125px] h-10 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[clamp(0.68rem,2.1vw,0.8rem)] font-bold shadow-sm shadow-emerald-200 active:scale-95 transition-all whitespace-nowrap"
              title="Baixar em planilha Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
              <span>Gerar Excel</span>
            </button>

            {/* Exportar CSV */}
            <button
              onClick={handleExportarCSV}
              disabled={visitantesFiltrados.length === 0 || !!exportando}
              className="flex-1 sm:flex-initial sm:min-w-[125px] h-10 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 rounded-xl bg-[#1E3370] hover:bg-[#162654] disabled:opacity-50 text-white text-[clamp(0.68rem,2.1vw,0.8rem)] font-bold shadow-sm shadow-indigo-200 active:scale-95 transition-all whitespace-nowrap"
              title="Baixar em formato CSV"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span>Gerar CSV</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {/* Busca */}
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar nome, fone, resp..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3370]"
              />
            </div>

            {/* Segmento */}
            <div>
              <select
                value={filtroSegmento}
                onChange={(e) => setFiltroSegmento(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3370] font-medium"
              >
                <option value="todos">👥 Todos os Cultos</option>
                <option value="familia">Família</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3370] font-medium"
              >
                <option value="todos">📋 Todos os Status</option>
                <option value="nao_contactado">⏳ Não contatados</option>
                <option value="contactado">✅ Contato realizado</option>
              </select>
            </div>

            {/* Mês */}
            <div className="flex items-center gap-1.5">
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3370] font-medium"
              >
                <option value="todos">📅 Todos os Meses</option>
                {mesesDisponiveis.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <button
                onClick={() => carregarDados()}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex-shrink-0"
                title="Recarregar dados"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', carregando && 'animate-spin')} />
              </button>
            </div>
          </div>

          {/* Resumo dos registros filtrados */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
            <span>
              Exibindo <strong className="text-slate-800 font-bold">{visitantesFiltrados.length}</strong> registros
            </span>
            <div className="flex items-center gap-3">
              <span className="text-amber-800 font-medium">
                ⏳ Não contatados: <strong>{totalNaoContactados}</strong>
              </span>
              <span className="text-emerald-700 font-medium">
                ✅ Contato realizado: <strong>{totalContactados}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tabela de Pré-visualização do Relatório */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1E3370] text-white font-bold divide-x divide-white/10">
                  <th className="py-3 px-3 whitespace-nowrap text-center">Data da visita</th>
                  <th className="py-3 px-3 whitespace-nowrap">Nome</th>
                  <th className="py-3 px-3 whitespace-nowrap">WhatsApp</th>
                  <th className="py-3 px-3 whitespace-nowrap">Como chegou</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center">Status</th>
                  <th className="py-3 px-3 whitespace-nowrap">Responsável</th>
                  <th className="py-3 px-3 whitespace-nowrap">Próxima ação</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center">Data do contato</th>
                  <th className="py-3 px-3 whitespace-nowrap">Observações</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center">Mês</th>
                  <th className="py-3 px-3 whitespace-nowrap text-center">Dias sem contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-slate-700">
                {carregando && visitantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <div className="w-8 h-8 rounded-full border-2 border-[#1E3370] border-t-transparent animate-spin mx-auto mb-2" />
                      Carregando relatório...
                    </td>
                  </tr>
                ) : visitantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      Nenhum visitante encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  visitantesFiltrados.map((v, index) => {
                    const linha = mapearVisitanteParaRelatorio(v);
                    const ePar = index % 2 === 1;

                    return (
                      <tr
                        key={v.id}
                        className={clsx(
                          'hover:bg-slate-100/70 transition-colors divide-x divide-slate-100',
                          ePar ? 'bg-slate-50/60' : 'bg-white'
                        )}
                      >
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-medium text-slate-800">
                          {linha.dataVisita}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {linha.nome}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          {linha.whatsapp}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[180px] truncate">
                          {linha.comoChegou}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {v.status === 'contactado' ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                              Contato realizado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200">
                              Não contatado
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {linha.responsavel}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[150px] truncate">
                          {linha.proximaAcao}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap text-slate-600">
                          {linha.dataContato}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate">
                          {linha.observacoes}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap text-slate-500">
                          {linha.mes}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-slate-800">
                          {linha.diasSemContato !== '-' ? (
                            <span className="text-amber-800">{linha.diasSemContato}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
