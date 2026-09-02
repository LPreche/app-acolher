export type PerfilUsuario =
  | 'administrador'
  | 'lider_familia'
  | 'lider_vertical'
  | 'lider_ambos'
  | 'acolher_familia'
  | 'acolher_vertical'
  | 'ambos';

export interface Usuario {
  id: number;
  nome: string;
  usuario?: string;
  email: string;
  perfil: PerfilUsuario;
  perfil_rotulo: string;
  whatsapp?: string;
  ativo: boolean;
  pode_acessar_familia: boolean;
  pode_acessar_vertical: boolean;
  pode_acessar_relatorios?: boolean;
  e_admin: boolean;
  e_lider?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  mensagem: string;
  token: string;
  usuario: Usuario;
}
