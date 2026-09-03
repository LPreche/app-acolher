'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Usuario, PerfilUsuario } from '@/types/usuario';
import { mascaraTelefone } from '@/utils/mascaras';
import { usuarioService } from '@/services/usuarioService';

interface ModalFormUsuarioProps {
  aberto: boolean;
  onClose: () => void;
  usuarioParaEditar?: Usuario | null;
  onSucesso: (usuario: Usuario) => void;
}

export function ModalFormUsuario({
  aberto,
  onClose,
  usuarioParaEditar,
  onSucesso,
}: ModalFormUsuarioProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('acolher_familia');
  const [whatsapp, setWhatsapp] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (usuarioParaEditar) {
      setNome(usuarioParaEditar.nome);
      setUsuarioLogin(usuarioParaEditar.usuario || '');
      setPassword('');
      setPerfil(usuarioParaEditar.perfil);
      setWhatsapp(mascaraTelefone(usuarioParaEditar.whatsapp || ''));
      setAtivo(usuarioParaEditar.ativo);
    } else {
      setNome('');
      setUsuarioLogin('');
      setPassword('');
      setPerfil('acolher_familia');
      setWhatsapp('');
      setAtivo(true);
    }
    setErro(null);
  }, [usuarioParaEditar, aberto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro('Por favor, informe o nome completo do usuário.');
      return;
    }

    if (!usuarioParaEditar && !password.trim()) {
      setErro('A senha é obrigatória para cadastrar um novo usuário.');
      return;
    }

    setSalvando(true);

    try {
      const payload: Partial<Usuario> & { password?: string } = {
        nome: nome.trim(),
        usuario: usuarioLogin.trim().toLowerCase() || undefined,
        perfil,
        whatsapp: whatsapp.trim() || undefined,
        ativo,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      let res;
      if (usuarioParaEditar) {
        res = await usuarioService.atualizar(usuarioParaEditar.id, payload);
      } else {
        res = await usuarioService.criar(payload);
      }

      onSucesso(res.usuario);
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo={usuarioParaEditar ? 'Editar Usuário' : 'Novo Usuário'}
      subtitulo={
        usuarioParaEditar
          ? 'Atualize as permissões ou dados do usuário.'
          : 'Cadastre um novo voluntário, líder ou administrador do sistema.'
      }
      tamanho="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 w-full box-border">
        {erro && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200 animate-shake">
            {erro}
          </div>
        )}

        <Input
          label="Nome Completo *"
          placeholder="Ex: Ana Paula da Silva"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <Input
          label="Usuário de Acesso"
          placeholder="Deixe em branco para gerar automático (ex: ana.silva)"
          value={usuarioLogin}
          onChange={(e) => setUsuarioLogin(e.target.value.toLowerCase().replace(/\s+/g, ''))}
          dica="Usado para fazer login no sistema (primeironome.ultimonome)"
        />

        <Input
          label={usuarioParaEditar ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso *'}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!usuarioParaEditar}
        />

        {/* Perfil de Acesso */}
        <div className="space-y-1.5 text-left w-full">
          <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
            Perfil de Acesso *
          </label>
          <select
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
            className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-sm py-2.5 px-3.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-smooth box-border"
          >
            <optgroup label="Administração">
              <option value="administrador">🛡️ Administrador Geral (Acesso total)</option>
            </optgroup>
            <optgroup label="Liderança (Acesso a Painel e Relatórios)">
              <option value="lider_familia">⭐ Líder — Acolher Família (+ Relatórios)</option>
              <option value="lider_vertical">⭐ Líder — Acolher Vertical (+ Relatórios)</option>
              <option value="lider_ambos">⭐ Líder — Ambos os Cultos (+ Relatórios)</option>
            </optgroup>
            <optgroup label="Voluntários / Operadores (Sem acesso a relatórios)">
              <option value="acolher_familia">👥 Voluntário — Acolher Família</option>
              <option value="acolher_vertical">Voluntário — Acolher Vertical</option>
              <option value="ambos">✨ Voluntário — Ambos os Cultos</option>
            </optgroup>
          </select>
          <p className="text-[11px] text-slate-400">
            Apenas Administradores e Líderes possuem permissão para acessar e exportar relatórios.
          </p>
        </div>

        <Input
          label="WhatsApp do Usuário"
          placeholder="(49) 99999-9999"
          value={whatsapp}
          onChange={(e) => setWhatsapp(mascaraTelefone(e.target.value))}
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="usuario_ativo"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="w-4 h-4 text-[#1E3370] rounded border-slate-300 focus:ring-[#1E3370]"
          />
          <label htmlFor="usuario_ativo" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Usuário ativo no sistema
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={salvando} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" carregando={salvando} className="flex-1 sm:flex-none font-bold">
            {usuarioParaEditar ? 'Salvar Alterações' : 'Cadastrar Usuário'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
