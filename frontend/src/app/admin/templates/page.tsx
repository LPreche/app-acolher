'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ModalFormTemplate } from '@/components/admin/ModalFormTemplate';
import { ModalConfirmacaoExclusao } from '@/components/ui/ModalConfirmacaoExclusao';
import { TemplateMensagem, MomentoMensagem } from '@/types/templateMensagem';
import { templateMensagemService } from '@/services/templateMensagemService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  MessageSquareText,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function TemplatesAdminPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<TemplateMensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroMomento, setFiltroMomento] = useState<'todos' | MomentoMensagem>('todos');
  const [busca, setBusca] = useState('');

  // Modais
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [templateParaEditar, setTemplateParaEditar] = useState<TemplateMensagem | null>(null);
  const [templateParaExcluir, setTemplateParaExcluir] = useState<TemplateMensagem | null>(null);

  // Redireciona se não for admin
  useEffect(() => {
    if (!authCarregando && usuario && !usuario.e_admin) {
      router.push('/painel/familia');
    }
  }, [usuario, authCarregando, router]);

  const carregarTemplates = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await templateMensagemService.listar();
      setTemplates(lista);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (usuario?.e_admin) {
      carregarTemplates();
    }
  }, [carregarTemplates, usuario]);

  const templatesFiltrados = useMemo(() => {
    let res = templates;
    if (filtroMomento !== 'todos') {
      res = res.filter((t) => t.momento === filtroMomento);
    }
    if (busca.trim()) {
      const q = busca.toLowerCase();
      res = res.filter((t) => t.titulo.toLowerCase().includes(q) || t.conteudo.toLowerCase().includes(q));
    }
    return res;
  }, [templates, filtroMomento, busca]);

  const totalSegunda = templates.filter((t) => t.momento === 'segunda').length;
  const totalSexta = templates.filter((t) => t.momento === 'sexta').length;

  const handleConfirmarExclusao = async () => {
    if (!templateParaExcluir) return;
    try {
      await templateMensagemService.excluir(templateParaExcluir.id);
      setTemplates((prev) => prev.filter((t) => t.id !== templateParaExcluir.id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir modelo.');
    }
  };

  const handleSucessoSalvar = (templateSalvo: TemplateMensagem) => {
    setTemplates((prev) => {
      const existe = prev.some((t) => t.id === templateSalvo.id);
      if (existe) {
        return prev.map((t) => (t.id === templateSalvo.id ? templateSalvo : t));
      }
      return [...prev, templateSalvo];
    });
  };

  if (authCarregando || !usuario?.e_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-[#1E3370] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header />

      <main className="max-w-4xl mx-auto px-3.5 sm:px-4 pt-4 space-y-4 text-left">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin"
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors flex-shrink-0"
              title="Voltar à visão geral"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 truncate">
                <MessageSquareText className="w-5 h-5 text-[#1E3370] flex-shrink-0" />
                <span>Modelos de Mensagens</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Gestão de templates automáticos para Segunda e Sexta-feira
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              setTemplateParaEditar(null);
              setModalFormAberto(true);
            }}
            variant="primary"
            size="md"
            className="flex-shrink-0 shadow-sm"
            icone={<Plus className="w-4 h-4" />}
          >
            Novo Modelo
          </Button>
        </div>

        {/* Busca e Filtros por Momento */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por título ou palavras do texto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-all"
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

          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFiltroMomento('todos')}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full font-bold transition-smooth text-xs',
                  filtroMomento === 'todos'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                Todos ({templates.length})
              </button>

              <button
                onClick={() => setFiltroMomento('segunda')}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full font-bold transition-smooth text-xs flex items-center gap-1.5',
                  filtroMomento === 'segunda'
                    ? 'bg-[#1E3370] text-white shadow-sm'
                    : 'bg-white text-[#1E3370] border border-indigo-200 hover:bg-indigo-50'
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Segunda-feira ({totalSegunda})</span>
              </button>

              <button
                onClick={() => setFiltroMomento('sexta')}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full font-bold transition-smooth text-xs flex items-center gap-1.5',
                  filtroMomento === 'sexta'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white text-[#2563EB] border border-blue-200 hover:bg-blue-50'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sexta-feira ({totalSexta})</span>
              </button>
            </div>

            <button
              onClick={() => carregarTemplates()}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex-shrink-0"
              title="Recarregar lista"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', carregando && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Lista de Modelos */}
        {carregando && templates.length === 0 ? (
          <div className="space-y-3 py-12 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#1E3370] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Carregando modelos de mensagens...</p>
          </div>
        ) : templatesFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquareText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Nenhum modelo encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {busca ? 'Nenhum resultado para os termos pesquisados.' : 'Nenhum modelo cadastrado nesta categoria.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {templatesFiltrados.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{t.titulo}</h4>
                      <span
                        className={clsx(
                          'text-[10px] px-2 py-0.5 rounded-md font-bold border',
                          t.momento === 'segunda'
                            ? 'bg-indigo-50 text-[#1E3370] border-indigo-200'
                            : t.momento === 'sexta'
                            ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        )}
                      >
                        {t.momento === 'segunda' ? '📅 Segunda' : t.momento === 'sexta' ? '✨ Sexta' : 'Geral'}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                        {t.tipo_acolhimento === 'familia' ? 'Família' : t.tipo_acolhimento === 'vertical' ? 'Vertical' : 'Ambos os Cultos'}
                      </span>
                    </div>

                    {t.descricao && (
                      <p className="text-xs text-slate-500">{t.descricao}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        setTemplateParaEditar(t);
                        setModalFormAberto(true);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      title="Editar modelo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTemplateParaExcluir(t)}
                      className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                      title="Excluir modelo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Prévia da Mensagem */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 font-sans border border-slate-100 whitespace-pre-line leading-relaxed">
                  {t.conteudo}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      {/* Modal de Exclusão */}
      <ModalConfirmacaoExclusao
        aberto={!!templateParaExcluir}
        onClose={() => setTemplateParaExcluir(null)}
        nomeItem={templateParaExcluir ? `Modelo: ${templateParaExcluir.titulo}` : undefined}
        titulo="Excluir Modelo de Mensagem"
        descricao="Tem certeza que deseja excluir este modelo de mensagem? Os voluntários não poderão mais utilizá-lo nos disparos."
        textoBotaoConfirmar="Sim, Excluir"
        onConfirmar={handleConfirmarExclusao}
      />

      {/* Modal de Formulário */}
      <ModalFormTemplate
        aberto={modalFormAberto}
        onClose={() => setModalFormAberto(false)}
        templateParaEditar={templateParaEditar}
        onSucesso={handleSucessoSalvar}
      />
    </div>
  );
}
