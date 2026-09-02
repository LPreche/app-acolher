'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ModalFormUsuario } from '@/components/admin/ModalFormUsuario';
import { ModalConfirmacaoExclusao } from '@/components/ui/ModalConfirmacaoExclusao';
import { Usuario } from '@/types/usuario';
import { usuarioService } from '@/services/usuarioService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  UserCheck,
  UserPlus,
  Search,
  Plus,
  RefreshCw,
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  PowerOff,
  Shield,
  Users,
  Sparkles,
  AlertOctagon,
} from 'lucide-react';
import { IconeVertical } from '@/components/ui/IconeVertical';
import { clsx } from 'clsx';

export default function UsuariosAdminPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Por padrão, abre com a aba Ativos selecionada
  const [filtroStatus, setFiltroStatus] = useState<'ativos' | 'inativos' | 'todos'>('ativos');

  // Modais
  const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Usuario | null>(null);
  const [usuarioParaInativar, setUsuarioParaInativar] = useState<Usuario | null>(null);
  const [usuarioParaExcluirPermanente, setUsuarioParaExcluirPermanente] = useState<Usuario | null>(null);

  // Redireciona se não for admin
  useEffect(() => {
    if (!authCarregando && usuario && !usuario.e_admin) {
      router.push('/painel/familia');
    }
  }, [usuario, authCarregando, router]);

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await usuarioService.listar({
        busca: busca.trim() || undefined,
      });
      setUsuarios(lista);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setCarregando(false);
    }
  }, [busca]);

  useEffect(() => {
    if (usuario?.e_admin) {
      carregarUsuarios();
    }
  }, [carregarUsuarios, usuario]);

  const usuariosFiltrados = useMemo(() => {
    if (filtroStatus === 'ativos') return usuarios.filter((u) => u.ativo);
    if (filtroStatus === 'inativos') return usuarios.filter((u) => !u.ativo);
    return usuarios;
  }, [usuarios, filtroStatus]);

  const totalAtivos = usuarios.filter((u) => u.ativo).length;
  const totalInativos = usuarios.filter((u) => !u.ativo).length;

  // Inativação ou Reativação de usuário
  const handleConfirmarInativacao = async () => {
    if (!usuarioParaInativar) return;
    try {
      const res = await usuarioService.alternarStatus(usuarioParaInativar.id);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioParaInativar.id ? res.usuario : u))
      );
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status do usuário.');
    }
  };

  // Exclusão Permanente de usuário
  const handleConfirmarExclusaoPermanente = async () => {
    if (!usuarioParaExcluirPermanente) return;
    try {
      await usuarioService.excluirPermanente(usuarioParaExcluirPermanente.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioParaExcluirPermanente.id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir usuário permanentemente.');
    }
  };

  const handleSucessoSalvar = (usuarioSalvo: Usuario) => {
    setUsuarios((prev) => {
      const existe = prev.some((u) => u.id === usuarioSalvo.id);
      if (existe) {
        return prev.map((u) => (u.id === usuarioSalvo.id ? usuarioSalvo : u));
      }
      return [usuarioSalvo, ...prev];
    });
  };

  const obterIconePerfil = (perfil: string) => {
    switch (perfil) {
      case 'administrador':
        return <Shield className="w-3.5 h-3.5 text-purple-600" />;
      case 'lider_familia':
      case 'lider_vertical':
      case 'lider_ambos':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      case 'acolher_vertical':
        return <IconeVertical className="w-3.5 h-3.5" />;
      case 'ambos':
        return <Users className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Users className="w-3.5 h-3.5 text-[#1E3370]" />;
    }
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

      <main className="max-w-4xl mx-auto px-3.5 sm:px-4 pt-4 space-y-4">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin"
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors flex-shrink-0"
              title="Voltar à visão geral do admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 truncate">
                <UserCheck className="w-5 h-5 text-[#1E3370] flex-shrink-0" />
                <span>Gestão de Usuários</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Gerenciamento de operadores, líderes e administradores
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              setUsuarioParaEditar(null);
              setModalUsuarioAberto(true);
            }}
            variant="primary"
            size="md"
            className="flex-shrink-0 shadow-sm"
            icone={<UserPlus className="w-4 h-4" />}
          >
            Novo Usuário
          </Button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, usuário (@login) ou e-mail..."
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
              {/* Aba Ativos (Padrão) */}
              <button
                onClick={() => setFiltroStatus('ativos')}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full font-bold transition-smooth text-xs flex items-center gap-1.5',
                  filtroStatus === 'ativos'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                )}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Ativos ({totalAtivos})</span>
              </button>

              {/* Aba Inativos */}
              <button
                onClick={() => setFiltroStatus('inativos')}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full font-bold transition-smooth text-xs flex items-center gap-1.5',
                  filtroStatus === 'inativos'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                )}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Inativos ({totalInativos})</span>
              </button>

              {/* Aba Todos */}
              <button
                onClick={() => setFiltroStatus('todos')}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full font-bold transition-smooth text-xs',
                  filtroStatus === 'todos'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                Todos ({usuarios.length})
              </button>
            </div>

            <button
              onClick={() => carregarUsuarios()}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex-shrink-0"
              title="Recarregar lista"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', carregando && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Lista de Usuários */}
        {carregando && usuarios.length === 0 ? (
          <div className="space-y-3 py-12 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#1E3370] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Carregando usuários...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Nenhum usuário encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {busca
                  ? 'Nenhum resultado para os termos pesquisados.'
                  : `Nenhum usuário ${filtroStatus === 'ativos' ? 'ativo' : filtroStatus === 'inativos' ? 'inativo' : ''} cadastrado.`}
              </p>
            </div>
            <Button
              onClick={() => {
                setUsuarioParaEditar(null);
                setModalUsuarioAberto(true);
              }}
              variant="primary"
              size="md"
              className="mx-auto"
              icone={<Plus className="w-4 h-4" />}
            >
              Cadastrar Novo Usuário
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Lista de Usuários ({usuariosFiltrados.length})
              </span>
            </div>

            {usuariosFiltrados.map((u) => (
              <div
                key={u.id}
                className={clsx(
                  'bg-white rounded-2xl p-4 border shadow-sm flex items-center justify-between gap-3 transition-colors',
                  u.ativo ? 'border-slate-200/80 hover:border-slate-300' : 'border-rose-100 bg-rose-50/20'
                )}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
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

                  <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                    <span className="font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      @{u.usuario || 'usuario'}
                    </span>
                    {u.email && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 truncate">{u.email}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {obterIconePerfil(u.perfil)}
                      <span>{u.perfil_rotulo}</span>
                    </span>
                    {u.whatsapp && (
                      <span className="text-slate-500">
                        • {u.whatsapp}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {u.ativo ? (
                    // USUÁRIO ATIVO: Permite Editar e Inativar
                    <>
                      <button
                        onClick={() => {
                          setUsuarioParaEditar(u);
                          setModalUsuarioAberto(true);
                        }}
                        className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Editar usuário"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setUsuarioParaInativar(u)}
                        className="p-2.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200"
                        title="Inativar usuário"
                      >
                        <PowerOff className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    // USUÁRIO INATIVO: Não permite editar. Permite Reativar e Excluir Permanentemente
                    <>
                      <button
                        onClick={() => setUsuarioParaInativar(u)}
                        className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 flex items-center gap-1.5"
                        title="Reativar acesso do usuário"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Reativar</span>
                      </button>

                      <button
                        onClick={() => setUsuarioParaExcluirPermanente(u)}
                        className="p-2.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
                        title="Excluir permanentemente do sistema"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      {/* Modal de Inativação / Reativação */}
      <ModalConfirmacaoExclusao
        aberto={!!usuarioParaInativar}
        onClose={() => setUsuarioParaInativar(null)}
        nomeItem={usuarioParaInativar ? `Usuário: ${usuarioParaInativar.nome} (@${usuarioParaInativar.usuario || usuarioParaInativar.email})` : undefined}
        titulo={usuarioParaInativar?.ativo ? 'Confirmar Inativação de Usuário' : 'Reativar Usuário'}
        descricao={
          usuarioParaInativar?.ativo
            ? 'Tem certeza que deseja inativar este usuário? Ele perderá imediatamente o acesso ao sistema até ser reativado.'
            : 'Deseja reativar o acesso deste usuário ao sistema?'
        }
        textoBotaoConfirmar={usuarioParaInativar?.ativo ? 'Sim, Inativar' : 'Sim, Reativar'}
        onConfirmar={handleConfirmarInativacao}
      />

      {/* Modal de Exclusão Permanente */}
      <ModalConfirmacaoExclusao
        aberto={!!usuarioParaExcluirPermanente}
        onClose={() => setUsuarioParaExcluirPermanente(null)}
        nomeItem={usuarioParaExcluirPermanente ? `Usuário: ${usuarioParaExcluirPermanente.nome} (@${usuarioParaExcluirPermanente.usuario || usuarioParaExcluirPermanente.email})` : undefined}
        titulo="Exclusão Permanente de Usuário"
        descricao="ATENÇÃO: Esta ação é definitiva e removerá este usuário permanentemente do banco de dados. Deseja realmente excluir para sempre?"
        textoBotaoConfirmar="Sim, Excluir Definitivamente"
        onConfirmar={handleConfirmarExclusaoPermanente}
      />

      {/* Modal de Cadastro e Edição */}
      <ModalFormUsuario
        aberto={modalUsuarioAberto}
        onClose={() => setModalUsuarioAberto(false)}
        usuarioParaEditar={usuarioParaEditar}
        onSucesso={handleSucessoSalvar}
      />
    </div>
  );
}
