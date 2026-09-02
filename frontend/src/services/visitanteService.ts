import { apiFetch } from './api';
import { TemplatesContatoResponse, Visitante } from '@/types/visitante';

export interface FiltrosVisitante {
  tipo_acolhimento?: string;
  status?: string;
  mes_ano?: string;
  busca?: string;
  ordem?: 'prioridade' | 'mais_recentes' | 'dias_sem_contato_desc';
  ativo?: boolean;
}

export const visitanteService = {
  async listar(filtros: FiltrosVisitante = {}): Promise<Visitante[]> {
    const params = new URLSearchParams();

    if (filtros.tipo_acolhimento) params.append('tipo_acolhimento', filtros.tipo_acolhimento);
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.mes_ano) params.append('mes_ano', filtros.mes_ano);
    if (filtros.busca) params.append('busca', filtros.busca);
    if (filtros.ordem) params.append('ordem', filtros.ordem);
    if (filtros.ativo !== undefined) params.append('ativo', String(filtros.ativo));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch<{ data: Visitante[] }>(`/visitantes${queryString}`);
    return res.data;
  },

  async obterPorId(id: number): Promise<Visitante> {
    const res = await apiFetch<{ visitante: Visitante }>(`/visitantes/${id}`);
    return res.visitante;
  },

  async criar(dados: Partial<Visitante>): Promise<{ mensagem: string; visitante: Visitante }> {
    return apiFetch<{ mensagem: string; visitante: Visitante }>('/visitantes', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  async atualizar(id: number, dados: Partial<Visitante>): Promise<{ mensagem: string; visitante: Visitante }> {
    return apiFetch<{ mensagem: string; visitante: Visitante }>(`/visitantes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  },

  async inativar(id: number): Promise<{ mensagem: string }> {
    return apiFetch<{ mensagem: string }>(`/visitantes/${id}`, {
      method: 'DELETE',
    });
  },

  async reativar(id: number): Promise<{ mensagem: string; visitante: Visitante }> {
    return apiFetch<{ mensagem: string; visitante: Visitante }>(`/visitantes/${id}/ativar`, {
      method: 'PATCH',
    });
  },

  async alternarStatus(id: number): Promise<{ mensagem: string; visitante: Visitante }> {
    return apiFetch<{ mensagem: string; visitante: Visitante }>(`/visitantes/${id}/alternar-status`, {
      method: 'PATCH',
    });
  },

  async obterTemplatesContato(id: number): Promise<TemplatesContatoResponse> {
    return apiFetch<TemplatesContatoResponse>(`/visitantes/${id}/templates-contato`);
  },

  async registrarContato(
    id: number,
    tipoMensagem: string,
    mensagem: string,
    momento?: 'segunda' | 'sexta' | 'geral'
  ): Promise<{ mensagem: string; link_whatsapp: string; visitante: Visitante }> {
    return apiFetch<{ mensagem: string; link_whatsapp: string; visitante: Visitante }>(
      `/visitantes/${id}/registrar-contato`,
      {
        method: 'POST',
        body: JSON.stringify({
          tipo_mensagem: tipoMensagem,
          mensagem: mensagem,
          momento: momento,
        }),
      }
    );
  },
};
