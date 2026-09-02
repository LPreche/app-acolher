import { apiFetch } from './api';
import { TemplateMensagem, MomentoMensagem, TipoAcolhimentoTemplate } from '@/types/templateMensagem';

export const templateMensagemService = {
  async listar(filtros: { momento?: MomentoMensagem; tipo_acolhimento?: TipoAcolhimentoTemplate; ativo?: boolean } = {}): Promise<TemplateMensagem[]> {
    const params = new URLSearchParams();
    if (filtros.momento) params.append('momento', filtros.momento);
    if (filtros.tipo_acolhimento) params.append('tipo_acolhimento', filtros.tipo_acolhimento);
    if (filtros.ativo !== undefined) params.append('ativo', String(filtros.ativo));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch<{ data: TemplateMensagem[] }>(`/templates-mensagens${queryString}`);
    return res.data;
  },

  async criar(dados: Partial<TemplateMensagem>): Promise<{ mensagem: string; data: TemplateMensagem }> {
    return apiFetch<{ mensagem: string; data: TemplateMensagem }>('/templates-mensagens', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  async atualizar(id: number, dados: Partial<TemplateMensagem>): Promise<{ mensagem: string; data: TemplateMensagem }> {
    return apiFetch<{ mensagem: string; data: TemplateMensagem }>(`/templates-mensagens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  },

  async excluir(id: number): Promise<{ mensagem: string }> {
    return apiFetch<{ mensagem: string }>(`/templates-mensagens/${id}`, {
      method: 'DELETE',
    });
  },
};
