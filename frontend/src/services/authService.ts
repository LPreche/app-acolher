import { apiFetch } from './api';
import { AuthResponse, Usuario } from '@/types/usuario';

export const authService = {
  async login(usuario: string, password: string): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password }),
    });

    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('acolher_token', response.token);
      localStorage.setItem('acolher_usuario', JSON.stringify(response.usuario));
    }

    return response;
  },

  async me(): Promise<{ usuario: Usuario }> {
    return apiFetch<{ usuario: Usuario }>('/me');
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch {
      // Ignora erro de rede no logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('acolher_token');
        localStorage.removeItem('acolher_usuario');
        localStorage.removeItem('acolher_contexto_ativo');
      }
    }
  },

  getUsuarioSalvo(): Usuario | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('acolher_usuario');
    if (!data) return null;
    try {
      return JSON.parse(data) as Usuario;
    } catch {
      return null;
    }
  },
};
