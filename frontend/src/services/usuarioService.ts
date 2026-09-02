import { apiFetch } from './api';
import { Usuario } from '@/types/usuario';

export const usuarioService = {
  async listar(filtros: { perfil?: string; busca?: string; ativo?: boolean } = {}): Promise<Usuario[]> {
    const params = new URLSearchParams();
    if (filtros.perfil) params.append('perfil', filtros.perfil);
    if (filtros.busca) params.append('busca', filtros.busca);
    if (filtros.ativo !== undefined) params.append('ativo', String(filtros.ativo));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch<{ data: Usuario[] }>(`/usuarios${queryString}`);
    return res.data;
  },

  async criar(dados: Partial<Usuario> & { password?: string }): Promise<{ mensagem: string; usuario: Usuario }> {
    return apiFetch<{ mensagem: string; usuario: Usuario }>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  async atualizar(id: number, dados: Partial<Usuario> & { password?: string }): Promise<{ mensagem: string; usuario: Usuario }> {
    return apiFetch<{ mensagem: string; usuario: Usuario }>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  },

  async alternarStatus(id: number): Promise<{ mensagem: string; usuario: Usuario }> {
    return apiFetch<{ mensagem: string; usuario: Usuario }>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },

  async excluirPermanente(id: number): Promise<{ mensagem: string }> {
    return apiFetch<{ mensagem: string }>(`/usuarios/${id}?permanente=true`, {
      method: 'DELETE',
    });
  },
};
