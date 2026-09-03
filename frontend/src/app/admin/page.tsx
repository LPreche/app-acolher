'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { CardVisitante } from '@/components/visitantes/CardVisitante';
import { ModalFormVisitante } from '@/components/visitantes/ModalFormVisitante';
import { ModalWhatsApp } from '@/components/visitantes/ModalWhatsApp';
import { ModalFormUsuario } from '@/components/admin/ModalFormUsuario';
import { ModalConfirmacaoExclusao } from '@/components/ui/ModalConfirmacaoExclusao';
import { Visitante } from '@/types/visitante';
import { Usuario } from '@/types/usuario';
import { visitanteService } from '@/services/visitanteService';
import { usuarioService } from '@/services/usuarioService';
import { dashboardService } from '@/services/dashboardService';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  Shield,
  Users,
  UserPlus,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquareText,
  ArrowRight,
} from 'lucide-react';
import { IconeVertical } from '@/components/ui/IconeVertical';
import { clsx } from 'clsx';

export default function AdminPage() {
  const [abaAtiva, setAbaAtiva] = useState<'visao_geral' | 'visitantes' | 'usuarios'>('visao_geral');
  const [carregando, setCarregando] = useState(true);

  // Dados
  const [metricas, setMetricas] = useState<any>(null);
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Filtros
  const [buscaVisitantes, setBuscaVisitantes] = useState('');
  const [filtroSegmento, setFiltroSegmento] = useState<string>('todos');
  const [buscaUsuarios, setBuscaUsuarios] = useState('');

  // Modais
  const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Usuario | null>(null);
  const [usuarioParaInativar, setUsuarioParaInativar] = useState<Usuario | null>(null);

  const [modalVisitanteAberto, setModalVisitanteAberto] = useState(false);
  const [visitanteParaEditar, setVisitanteParaEditar] = useState<Visitante | null>(null);
  const [visitanteParaExcluir, setVisitanteParaExcluir] = useState<Visitante | null>(null);
  const [visitanteWhatsApp, setVisitanteWhatsApp] = useState<Visitante | null>(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [metricasRes, listaVisitantes, listaUsuarios] = await Promise.all([
        dashboardService.obterMetricas(),
        visitanteService.listar({
          tipo_acolhimento: filtroSegmento === 'todos' ? undefined : filtroSegmento,
          busca: buscaVisitantes.trim() || undefined,
        }),
        usuarioService.listar({
          busca: buscaUsuarios.trim() || undefined,
        }),
      ]);

      setMetricas(metricasRes);
      setVisitantes(listaVisitantes);
      setUsuarios(listaUsuarios);
    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setCarregando(false);
    }
  }, [filtroSegmento, buscaVisitantes, buscaUsuarios]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Confirmação de exclusão / inativação de usuário
  const handleConfirmarInativacaoUsuario = async () => {
    if (!usuarioParaInativar) return;
    try {
      const res = await usuarioService.alternarStatus(usuarioParaInativar.id);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioParaInativar.id ? res.usuario : u))
      );
    } catch (err: any) {
      alert(err.message || 'Erro ao inativar/alterar status do usuário.');
    }
  };

  // Confirmação de inativação de visitante
  const handleConfirmarInativacaoVisitante = async () => {
    if (!visitanteParaExcluir) return;
    try {
      await visitanteService.inativar(visitanteParaExcluir.id);
      setVisitantes((prev) => prev.filter((v) => v.id !== visitanteParaExcluir.id));
    } catch (err) {
      alert('Erro ao inativar visitante.');
    }
  };

  const handleSucessoSalvarUsuario = (usuarioSalvo: Usuario) => {
    setUsuarios((prev) => {
      const existe = prev.some((u) => u.id === usuarioSalvo.id);
      if (existe) {
        return prev.map((u) => (u.id === usuarioSalvo.id ? usuarioSalvo : u));
      }
      return [usuarioSalvo, ...prev];
    });
  };

  const handleSucessoSalvarVisitante = (visitanteSalvo: Visitante) => {
    setVisitantes((prev) => {
      const existe = prev.some((v) => v.id === visitanteSalvo.id);
      if (existe) {
        return prev.map((v) => (v.id === visitanteSalvo.id ? visitanteSalvo : v));
      }
      return [visitanteSalvo, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header />

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Banner do Administrador */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-[#1E3370] text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Shield className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-xl font-black">Painel do Administrador</h1>
                <p className="text-xs text-white/70">Gestão de visitantes, métricas e usuários</p>
              </div>
            </div>

            <Button
              onClick={() => {
                setUsuarioParaEditar(null);
                setModalUsuarioAberto(true);
              }}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
              icone={<UserPlus className="w-4 h-4" />}
            >
              Novo Usuário
            </Button>
          </div>

          {/* Métricas Consolidadas */}
          {metricas && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/15">
              <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-white/70">Total Visitantes</p>
                <p className="text-2xl font-black">{metricas.resumo.total_visitantes}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-amber-200">Aguardando Contato</p>
                <p className="text-2xl font-black text-amber-200">{metricas.resumo.total_nao_contactados}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-indigo-200">Família / Vertical</p>
                <p className="text-lg font-bold">
                  {metricas.resumo.total_familia} <span className="text-xs text-white/60">fam</span> /{' '}
                  {metricas.resumo.total_vertical} <span className="text-xs text-white/60">vert</span>
                </p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-emerald-200">Contactados</p>
                <p className="text-2xl font-black text-emerald-200">{metricas.resumo.total_contactados}</p>
              </div>
            </div>
          )}
        </div>

        {/* Abas de Navegação do Admin */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs font-bold">
          <button
            onClick={() => setAbaAtiva('visao_geral')}
            className={clsx(
              'flex-1 py-2 rounded-xl transition-smooth text-center',
              abaAtiva === 'visao_geral'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )}
          >
            Visão Geral
          </button>
          <Link
            href="/admin/visitantes"
            className="flex-1 py-2 rounded-xl transition-smooth text-center text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            Visitantes ({visitantes.length})
          </Link>
          <Link
            href="/admin/usuarios"
            className="flex-1 py-2 rounded-xl transition-smooth text-center text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            Usuários ({usuarios.length})
          </Link>
        </div>

        {/* Conteúdo da Aba: Visão Geral */}
        {abaAtiva === 'visao_geral' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card Acolher Família */}
              <Link
                href="/admin/visitantes?segmento=familia"
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:border-indigo-300 hover:shadow-md transition-all group block text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-[#1E3370] rounded-xl group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Acolher Família</h3>
                      <p className="text-xs text-slate-500">Cultos de Domingo</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-[#1E3370]">
                    {metricas?.resumo?.total_familia ?? 0}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Pendentes:</span>
                  <span className="font-bold text-amber-600">
                    {metricas?.por_tipo?.familia?.nao_contactados ?? 0}
                  </span>
                </div>
              </Link>

              {/* Card Acolher Vertical */}
              <Link
                href="/admin/visitantes?segmento=vertical"
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:border-blue-300 hover:shadow-md transition-all group block text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-[#2563EB] rounded-xl group-hover:scale-105 transition-transform">
                      <IconeVertical className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Acolher Vertical</h3>
                      <p className="text-xs text-slate-500">Jovens & Visitantes</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-[#2563EB]">
                    {metricas?.resumo?.total_vertical ?? 0}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Pendentes:</span>
                  <span className="font-bold text-amber-600">
                    {metricas?.por_tipo?.vertical?.nao_contactados ?? 0}
                  </span>
                </div>
              </Link>

              {/* Card de Gestão de Modelos de Mensagens */}
              <Link
                href="/admin/templates"
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors group sm:col-span-2 text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-indigo-50 text-[#1E3370] rounded-2xl group-hover:scale-105 transition-transform">
                    <MessageSquareText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Modelos de Mensagens (Segunda & Sexta)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Gerenciar templates de WhatsApp e variações de contato</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#1E3370]">
                  <span>Acessar</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba: Visitantes */}
        {abaAtiva === 'visitantes' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar visitantes..."
                  value={buscaVisitantes}
                  onChange={(e) => setBuscaVisitantes(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setFiltroSegmento('todos')}
                  className={clsx(
                    'px-3 py-1.5 rounded-full font-bold',
                    filtroSegmento === 'todos'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border text-slate-600'
                  )}
                >
                  Todos os Cultos
                </button>
                <button
                  onClick={() => setFiltroSegmento('familia')}
                  className={clsx(
                    'px-3 py-1.5 rounded-full font-bold',
                    filtroSegmento === 'familia'
                      ? 'bg-[#1E3370] text-white'
                      : 'bg-white border text-slate-600'
                  )}
                >
                  👥 Acolher Família
                </button>
                <button
                  onClick={() => setFiltroSegmento('vertical')}
                  className={clsx(
                    'px-3 py-1.5 rounded-full font-bold',
                    filtroSegmento === 'vertical'
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-white border text-slate-600'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    <IconeVertical
                      className="w-3.5 h-3.5"
                      variante={filtroSegmento === 'vertical' ? 'branco' : 'padrao'}
                    />
                    <span>Acolher Vertical</span>
                  </span>
                </button>
              </div>
            </div>

            {visitantes.map((v) => (
              <CardVisitante
                key={v.id}
                visitante={v}
                onContatoWhatsApp={(item) => setVisitanteWhatsApp(item)}
                onEditar={(item) => {
                  setVisitanteParaEditar(item);
                  setModalVisitanteAberto(true);
                }}
                onInativar={(item) => setVisitanteParaExcluir(item)}
              />
            ))}
          </div>
        )}

        {/* Conteúdo da Aba: Usuários */}
        {abaAtiva === 'usuarios' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar usuários por nome ou e-mail..."
                  value={buscaUsuarios}
                  onChange={(e) => setBuscaUsuarios(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm"
                />
              </div>
              <Button
                onClick={() => {
                  setUsuarioParaEditar(null);
                  setModalUsuarioAberto(true);
                }}
                variant="primary"
                size="md"
                icone={<Plus className="w-4 h-4" />}
              >
                Adicionar
              </Button>
            </div>

            <div className="space-y-2.5">
              {usuarios.map((u) => (
                <div
                  key={u.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{u.nome}</h4>
                      {u.ativo ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-semibold border border-rose-200">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{u.usuario ? `@${u.usuario}` : u.email}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                      <span className="font-semibold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {u.perfil_rotulo}
                      </span>
                      {u.whatsapp && <span>• {u.whatsapp}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        setUsuarioParaEditar(u);
                        setModalUsuarioAberto(true);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl transition-colors"
                      title="Editar usuário"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setUsuarioParaInativar(u)}
                      className={clsx(
                        'p-2 rounded-xl transition-colors',
                        u.ativo
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      )}
                      title={u.ativo ? 'Inativar/Excluir usuário' : 'Ativar usuário'}
                    >
                      {u.ativo ? <Trash2 className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav
        onAbrirNovoVisitante={() => {
          setVisitanteParaEditar(null);
          setModalVisitanteAberto(true);
        }}
      />

      {/* Modal Visual de Confirmação de Exclusão de Usuário */}
      <ModalConfirmacaoExclusao
        aberto={!!usuarioParaInativar}
        onClose={() => setUsuarioParaInativar(null)}
        nomeItem={usuarioParaInativar ? `Usuário: ${usuarioParaInativar.nome} (@${usuarioParaInativar.usuario || usuarioParaInativar.email})` : undefined}
        titulo={usuarioParaInativar?.ativo ? 'Confirmar Inativação de Usuário' : 'Reativar Usuário'}
        descricao={
          usuarioParaInativar?.ativo
            ? 'Tem certeza que deseja inativar este usuário? Ele perderá o acesso ao sistema até ser reativado.'
            : 'Deseja reativar o acesso deste usuário ao sistema?'
        }
        textoBotaoConfirmar={usuarioParaInativar?.ativo ? 'Sim, Inativar' : 'Sim, Reativar'}
        onConfirmar={handleConfirmarInativacaoUsuario}
      />

      {/* Modal Visual de Confirmação de Exclusão de Visitante */}
      <ModalConfirmacaoExclusao
        aberto={!!visitanteParaExcluir}
        onClose={() => setVisitanteParaExcluir(null)}
        nomeItem={visitanteParaExcluir ? `Visitante: ${visitanteParaExcluir.nome}` : undefined}
        descricao="Tem certeza que deseja inativar este visitante? Ele sairá das listagens ativas."
        textoBotaoConfirmar="Sim, Inativar"
        onConfirmar={handleConfirmarInativacaoVisitante}
      />

      <ModalFormUsuario
        aberto={modalUsuarioAberto}
        onClose={() => setModalUsuarioAberto(false)}
        usuarioParaEditar={usuarioParaEditar}
        onSucesso={handleSucessoSalvarUsuario}
      />

      <ModalFormVisitante
        aberto={modalVisitanteAberto}
        onClose={() => setModalVisitanteAberto(false)}
        visitanteParaEditar={visitanteParaEditar}
        onSucesso={handleSucessoSalvarVisitante}
      />

      <ModalWhatsApp
        aberto={!!visitanteWhatsApp}
        onClose={() => setVisitanteWhatsApp(null)}
        visitante={visitanteWhatsApp}
        onSucesso={handleSucessoSalvarVisitante}
      />
    </div>
  );
}
