'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const usuarioLimpo = usuario.trim().toLowerCase();

    if (!usuarioLimpo || !password.trim()) {
      setErro('Informe seu usuário de acesso e senha.');
      return;
    }

    setCarregando(true);
    try {
      await login(usuarioLimpo, password);
    } catch (err: any) {
      setErro(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        {/* Header com Logo e Apresentação */}
        <div className="text-center mb-6">
          <div className="inline-block p-2.5 rounded-3xl bg-white shadow-xl shadow-indigo-100 border border-slate-100 mb-4">
            <div className="w-20 h-20 relative rounded-2xl overflow-hidden flex items-center justify-center">
              <Image
                src="/logo-acolher.jpg"
                alt="Logo Acolher IBI Chapecó"
                width={80}
                height={80}
                className="object-cover"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#1E3370]">Acolher</h1>
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mt-0.5">
            IBI Chapecó
          </p>
          <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
            Sistema de registro e acompanhamento caloroso de visitantes nos cultos.
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/60 border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-2xl text-left animate-shake">
                {erro}
              </div>
            )}

            <Input
              label="Usuário de Acesso"
              type="text"
              placeholder="Digite seu usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              iconeEsquerda={<User className="w-4 h-4 text-slate-400" />}
              autoComplete="username"
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              iconeEsquerda={<Lock className="w-4 h-4 text-slate-400" />}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3 font-bold shadow-md shadow-indigo-200"
              carregando={carregando}
              icone={<ArrowRight className="w-4 h-4" />}
            >
              Entrar no Sistema
            </Button>
          </form>

          {/* Rodapé de Segurança */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acesso autenticado e criptografado</span>
          </div>
        </div>
      </div>
    </main>
  );
}
