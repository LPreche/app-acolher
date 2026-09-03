'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Visitante, TipoAcolhimento, StatusContato } from '@/types/visitante';
import { Usuario } from '@/types/usuario';
import { mascaraTelefone } from '@/utils/mascaras';
import { useAuth } from '@/context/AuthContext';
import { visitanteService } from '@/services/visitanteService';
import { usuarioService } from '@/services/usuarioService';

interface ModalFormVisitanteProps {
  aberto: boolean;
  onClose: () => void;
  visitanteParaEditar?: Visitante | null;
  tipoAcolhimentoPadrao?: TipoAcolhimento;
  onSucesso: (visitante: Visitante) => void;
}

const OPCOES_COMO_CHEGOU = [
  'Convite de amigo/familiar',
  'Instagram / Redes Sociais',
  'Passou em frente / Espontâneo',
  'Evento especial da igreja',
  'Indicação de membros',
  'Outros',
];

export function ModalFormVisitante({
  aberto,
  onClose,
  visitanteParaEditar,
  tipoAcolhimentoPadrao = 'familia',
  onSucesso,
}: ModalFormVisitanteProps) {
  const { usuario, contextoAtivo } = useAuth();
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Lista de usuários para o dropdown de responsável (administrador)
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [responsavelId, setResponsavelId] = useState<number | undefined>(undefined);

  // Determina automaticamente o tipo de acolhimento ativo
  const tipoAcolhimentoAutomatico: TipoAcolhimento =
    visitanteParaEditar?.tipo_acolhimento ||
    (contextoAtivo === 'vertical' ? 'vertical' : tipoAcolhimentoPadrao || 'familia');

  // Form State
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [opcaoComoChegou, setOpcaoComoChegou] = useState('Convite de amigo/familiar');
  const [outroComoChegou, setOutroComoChegou] = useState('');
  const [status, setStatus] = useState<StatusContato>('nao_contactado');
  const [dataVisita, setDataVisita] = useState('');
  const [proximaAcao, setProximaAcao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Carrega lista de usuários se o usuário logado for administrador
  useEffect(() => {
    if (aberto && usuario?.e_admin) {
      usuarioService
        .listar({ ativo: true })
        .then((lista) => setUsuarios(lista))
        .catch((err) => console.error('Erro ao carregar usuários:', err));
    }
  }, [aberto, usuario]);

  // Seta valores ao abrir ou mudar visitante
  useEffect(() => {
    if (visitanteParaEditar) {
      setNome(visitanteParaEditar.nome);
      setWhatsapp(mascaraTelefone(visitanteParaEditar.whatsapp));

      const comoChegouOriginal = visitanteParaEditar.como_chegou || '';
      if (OPCOES_COMO_CHEGOU.includes(comoChegouOriginal)) {
        setOpcaoComoChegou(comoChegouOriginal);
        setOutroComoChegou('');
      } else if (comoChegouOriginal) {
        setOpcaoComoChegou('Outros');
        setOutroComoChegou(comoChegouOriginal);
      } else {
        setOpcaoComoChegou('Convite de amigo/familiar');
        setOutroComoChegou('');
      }

      setStatus(visitanteParaEditar.status);
      setDataVisita(visitanteParaEditar.data_visita || '');
      setProximaAcao(visitanteParaEditar.proxima_acao || '');
      setObservacoes(visitanteParaEditar.observacoes || '');
      setResponsavelId(visitanteParaEditar.usuario_responsavel_id || usuario?.id);
    } else {
      // Valores padrão para novo cadastro
      setNome('');
      setWhatsapp('');
      setOpcaoComoChegou('Convite de amigo/familiar');
      setOutroComoChegou('');
      setStatus('nao_contactado');
      setDataVisita(new Date().toISOString().split('T')[0]);
      setProximaAcao('');
      setObservacoes('');
      setResponsavelId(usuario?.id);
    }
    setErroGeral(null);
  }, [visitanteParaEditar, aberto, usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroGeral(null);

    if (!nome.trim()) {
      setErroGeral('Por favor, informe o nome do visitante.');
      return;
    }

    if (!whatsapp.trim()) {
      setErroGeral('Por favor, informe o WhatsApp do visitante.');
      return;
    }

    // Processa a opção "Como chegou"
    let comoChegouFinal = opcaoComoChegou;
    if (opcaoComoChegou === 'Outros') {
      if (!outroComoChegou.trim()) {
        setErroGeral('Por favor, descreva como o visitante chegou até nós no campo Outros.');
        return;
      }
      comoChegouFinal = outroComoChegou.trim();
    }

    setSalvando(true);

    try {
      const payload: Partial<Visitante> = {
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        como_chegou: comoChegouFinal,
        tipo_acolhimento: tipoAcolhimentoAutomatico,
        // No cadastro é sempre nao_contactado; na edição preserva o status selecionado
        status: visitanteParaEditar ? status : 'nao_contactado',
        data_visita: dataVisita || new Date().toISOString().split('T')[0],
        proxima_acao: proximaAcao.trim() || null,
        observacoes: observacoes.trim() || null,
        usuario_responsavel_id: usuario?.e_admin ? responsavelId : (visitanteParaEditar?.usuario_responsavel_id || usuario?.id),
      };

      let res;
      if (visitanteParaEditar) {
        res = await visitanteService.atualizar(visitanteParaEditar.id, payload);
      } else {
        res = await visitanteService.criar(payload);
      }

      onSucesso(res.visitante);
      onClose();
    } catch (err: any) {
      setErroGeral(err.message || 'Ocorreu um erro ao salvar o visitante.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo={visitanteParaEditar ? 'Editar Visitante' : 'Novo Visitante'}
      subtitulo={
        visitanteParaEditar
          ? 'Atualize os dados e acompanhamento do visitante.'
          : 'Cadastre um visitante que esteve presente no culto.'
      }
      tamanho="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 w-full box-border">
        {erroGeral && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200 animate-shake">
            {erroGeral}
          </div>
        )}

        {/* Nome do Visitante */}
        <Input
          label="Nome do Visitante *"
          placeholder="Ex: João da Silva ou Família Silva"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        {/* WhatsApp com máscara */}
        <Input
          label="WhatsApp / Telefone *"
          placeholder="(49) 99999-9999"
          value={whatsapp}
          onChange={(e) => setWhatsapp(mascaraTelefone(e.target.value))}
          required
        />

        {/* Seleção de Voluntário / Responsável (Exibido apenas para Administradores) */}
        {usuario?.e_admin && (
          <div className="space-y-1.5 text-left w-full">
            <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
              Voluntário Responsável
            </label>
            <select
              value={responsavelId || ''}
              onChange={(e) => setResponsavelId(Number(e.target.value))}
              className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-sm py-2.5 px-3.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-smooth box-border"
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.usuario}) {u.id === usuario.id ? '— (Você)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Como administrador, você pode definir qual voluntário cuidará deste visitante.
            </p>
          </div>
        )}

        {/* Como Chegou Até Nós com suporte a campo manual para Outros */}
        <div className="space-y-1.5 text-left w-full">
          <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
            Como chegou até nós?
          </label>
          <select
            value={opcaoComoChegou}
            onChange={(e) => setOpcaoComoChegou(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-sm py-2.5 px-3.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-smooth box-border"
          >
            {OPCOES_COMO_CHEGOU.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>

          {/* Campo aberto manual caso selecione "Outros" */}
          {opcaoComoChegou === 'Outros' && (
            <input
              type="text"
              placeholder="Descreva como chegou até nós (ex: Convite do Lucas, Google, etc.)..."
              value={outroComoChegou}
              onChange={(e) => setOutroComoChegou(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-sm py-2.5 px-3.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] animate-fadeIn box-border"
              required
              autoFocus
            />
          )}
        </div>

        {/* Data da Visita */}
        <div className="space-y-1.5 text-left w-full">
          <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
            Data da Visita
          </label>
          <input
            type="date"
            value={dataVisita}
            onChange={(e) => setDataVisita(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-sm py-2.5 px-3.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-smooth box-border"
          />
        </div>

        {/* Status de Contato - EXIBIDO APENAS NA EDIÇÃO */}
        {visitanteParaEditar && (
          <div className="space-y-1.5 text-left w-full">
            <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
              Status de Contato
            </label>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => setStatus('nao_contactado')}
                className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-smooth flex items-center justify-center ${
                  status === 'nao_contactado'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ⏳ Não Contactado
              </button>
              <button
                type="button"
                onClick={() => setStatus('contactado')}
                className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-smooth flex items-center justify-center ${
                  status === 'contactado'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ✅ Contactado
              </button>
            </div>
          </div>
        )}

        {/* Próxima Ação */}
        <div className="space-y-1.5 text-left w-full">
          <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
            Próxima Ação / Passo
          </label>
          <input
            type="text"
            placeholder="Ex: Convidar para o PG, discipulado ou evento"
            value={proximaAcao}
            onChange={(e) => setProximaAcao(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-sm py-2.5 px-3.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-smooth box-border"
          />
        </div>

        {/* Observações */}
        <div className="space-y-1.5 text-left w-full">
          <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
            Observações
          </label>
          <textarea
            rows={2}
            placeholder="Informações adicionais, filhos, onde sentou, etc."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-sm p-3 min-h-[72px] focus:outline-none focus:ring-2 focus:ring-[#1E3370] transition-smooth resize-y box-border"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={salvando} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" carregando={salvando} className="flex-1 sm:flex-none font-bold">
            {visitanteParaEditar ? 'Salvar Alterações' : 'Cadastrar Visitante'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
