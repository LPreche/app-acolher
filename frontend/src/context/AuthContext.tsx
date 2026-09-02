'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Usuario } from '@/types/usuario';
import { authService } from '@/services/authService';

export type ContextoAtivo = 'familia' | 'vertical' | 'admin';

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  contextoAtivo: ContextoAtivo;
  setContextoAtivo: (contexto: ContextoAtivo) => void;
  modalSeletorAberto: boolean;
  setModalSeletorAberto: (aberto: boolean) => void;
  login: (usuario: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  alternarParaContexto: (contexto: ContextoAtivo) => void;
  recarregarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [contextoAtivo, setContextoAtivoState] = useState<ContextoAtivo>('familia');
  const [modalSeletorAberto, setModalSeletorAberto] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Carrega usuário salvo e contexto
  useEffect(() => {
    const usuarioSalvo = authService.getUsuarioSalvo();
    const contextoSalvo = localStorage.getItem('acolher_contexto_ativo') as ContextoAtivo | null;

    if (usuarioSalvo) {
      setUsuario(usuarioSalvo);
      if (contextoSalvo) {
        setContextoAtivoState(contextoSalvo);
      } else {
        // Define o contexto padrão baseado no perfil
        if (usuarioSalvo.perfil === 'acolher_vertical') {
          setContextoAtivoState('vertical');
        } else if (usuarioSalvo.perfil === 'administrador') {
          setContextoAtivoState('admin');
        } else {
          setContextoAtivoState('familia');
        }
      }
    } else {
      if (!pathname.includes('/login')) {
        router.push('/login');
      }
    }
    setCarregando(false);
  }, []);

  const setContextoAtivo = (contexto: ContextoAtivo) => {
    setContextoAtivoState(contexto);
    localStorage.setItem('acolher_contexto_ativo', contexto);
  };

  const alternarParaContexto = (contexto: ContextoAtivo) => {
    setContextoAtivo(contexto);
    setModalSeletorAberto(false);
    if (contexto === 'admin') {
      router.push('/admin');
    } else if (contexto === 'vertical') {
      router.push('/painel/vertical');
    } else {
      router.push('/painel/familia');
    }
  };

  const login = async (usuarioInput: string, pass: string) => {
    const res = await authService.login(usuarioInput, pass);
    setUsuario(res.usuario);

    // Regra de direcionamento:
    if (res.usuario.perfil === 'ambos') {
      // Usuário 'ambos': abre o modal para ele escolher onde atuar
      setModalSeletorAberto(true);
    } else if (res.usuario.perfil === 'administrador') {
      setContextoAtivo('admin');
      router.push('/admin');
    } else if (res.usuario.perfil === 'acolher_vertical') {
      setContextoAtivo('vertical');
      router.push('/painel/vertical');
    } else {
      setContextoAtivo('familia');
      router.push('/painel/familia');
    }
  };

  const logout = async () => {
    await authService.logout();
    setUsuario(null);
    router.push('/login');
  };

  const recarregarUsuario = async () => {
    try {
      const res = await authService.me();
      setUsuario(res.usuario);
      localStorage.setItem('acolher_usuario', JSON.stringify(res.usuario));
    } catch {
      // Falha silenciosa
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        contextoAtivo,
        setContextoAtivo,
        modalSeletorAberto,
        setModalSeletorAberto,
        login,
        logout,
        alternarParaContexto,
        recarregarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
