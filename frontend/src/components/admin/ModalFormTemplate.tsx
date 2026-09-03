'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TemplateMensagem, MomentoMensagem, TipoAcolhimentoTemplate } from '@/types/templateMensagem';
import { templateMensagemService } from '@/services/templateMensagemService';

interface ModalFormTemplateProps {
  aberto: boolean;
  onClose: () => void;
  templateParaEditar?: TemplateMensagem | null;
  onSucesso: (templateSalvo: TemplateMensagem) => void;
}

export function ModalFormTemplate({
  aberto,
  onClose,
  templateParaEditar,
  onSucesso,
}: ModalFormTemplateProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [titulo, setTitulo] = useState('');
  const [momento, setMomento] = useState<MomentoMensagem>('segunda');
  const [tipoAcolhimento, setTipoAcolhimento] = useState<TipoAcolhimentoTemplate>('ambos');
  const [descricao, setDescricao] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (templateParaEditar) {
      setTitulo(templateParaEditar.titulo);
      setMomento(templateParaEditar.momento);
      setTipoAcolhimento(templateParaEditar.tipo_acolhimento);
      setDescricao(templateParaEditar.descricao || '');
      setConteudo(templateParaEditar.conteudo);
      setAtivo(templateParaEditar.ativo);
    } else {
      setTitulo('');
      setMomento('segunda');
      setTipoAcolhimento('ambos');
      setDescricao('');
      setConteudo('');
      setAtivo(true);
    }
    setErro(null);
  }, [templateParaEditar, aberto]);

  const inserirTag = (tag: string) => {
    setConteudo((prev) => prev + tag);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!titulo.trim() || !conteudo.trim()) {
      setErro('Título e Conteúdo da mensagem são obrigatórios.');
      return;
    }

    setSalvando(true);

    try {
      const payload: Partial<TemplateMensagem> = {
        titulo: titulo.trim(),
        momento,
        tipo_acolhimento: tipoAcolhimento,
        descricao: descricao.trim() || null,
        conteudo: conteudo.trim(),
        ativo,
      };

      let res;
      if (templateParaEditar) {
        res = await templateMensagemService.atualizar(templateParaEditar.id, payload);
      } else {
        res = await templateMensagemService.criar(payload);
      }

      onSucesso(res.data);
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar template de mensagem.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo={templateParaEditar ? 'Editar Modelo de Mensagem' : 'Novo Modelo de Mensagem'}
      subtitulo="Configure os textos padrão de WhatsApp para Segunda ou Sexta-feira."
      tamanho="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left w-full box-border">
        {erro && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200 animate-shake">
            {erro}
          </div>
        )}

        <Input
          label="Título do Modelo *"
          placeholder="Ex: Sexta - Visitante que respondeu na segunda"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full box-border">
          {/* Momento do Contato */}
          <div className="space-y-1.5 w-full">
            <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
              Momento do Contato *
            </label>
            <select
              value={momento}
              onChange={(e) => setMomento(e.target.value as MomentoMensagem)}
              className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-sm py-2.5 px-3.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-smooth box-border"
            >
              <option value="segunda">📅 Segunda-feira (Boas-Vindas)</option>
              <option value="sexta">✨ Sexta-feira (Convite Culto)</option>
              <option value="geral">💬 Outros / Geral</option>
            </select>
          </div>

          {/* Tipo de Acolhimento */}
          <div className="space-y-1.5 w-full">
            <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
              Área de Culto *
            </label>
            <select
              value={tipoAcolhimento}
              onChange={(e) => setTipoAcolhimento(e.target.value as TipoAcolhimentoTemplate)}
              className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-sm py-2.5 px-3.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-smooth box-border"
            >
              <option value="ambos">✨ Ambos (Família & Vertical)</option>
              <option value="familia">👥 Acolher Família</option>
              <option value="vertical">⬆⬇ Acolher Vertical</option>
            </select>
          </div>
        </div>

        <Input
          label="Descrição / Quando Usar (Opcional)"
          placeholder="Ex: Usar quando o visitante respondeu no primeiro contato"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        {/* Conteúdo do Template com Tags Dinâmicas */}
        <div className="space-y-1.5 w-full box-border">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
              Texto da Mensagem *
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold">Inserir:</span>
              <button
                type="button"
                onClick={() => inserirTag('{nome}')}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] border border-slate-200 transition-colors shadow-2xs"
                title="Insere o nome do visitante"
              >
                + &#123;nome&#125;
              </button>
              <button
                type="button"
                onClick={() => inserirTag('{responsavel}')}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] border border-slate-200 transition-colors shadow-2xs"
                title="Insere o nome do voluntário responsável"
              >
                + &#123;responsavel&#125;
              </button>
            </div>
          </div>
          <textarea
            rows={5}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Digite o texto da mensagem... Ex: Olá {nome}, tudo bem? Meu nome é {responsavel}..."
            className="block w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-slate-900 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-smooth resize-y box-border"
            required
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="template_ativo"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="w-4 h-4 text-[#1E3370] rounded border-slate-300 focus:ring-[#1E3370]"
          />
          <label htmlFor="template_ativo" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Modelo ativo para envio
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={salvando} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" carregando={salvando} className="flex-1 sm:flex-none font-bold">
            {templateParaEditar ? 'Salvar Alterações' : 'Cadastrar Modelo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
