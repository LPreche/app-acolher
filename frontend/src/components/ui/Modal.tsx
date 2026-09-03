'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  aberto: boolean;
  onClose: () => void;
  titulo?: string;
  subtitulo?: string;
  children: React.ReactNode;
  tamanho?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({
  aberto,
  onClose,
  titulo,
  subtitulo,
  children,
  tamanho = 'md',
}: ModalProps) {
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [aberto]);

  if (!aberto) return null;

  const tamanhoClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-xl',
    full: 'sm:max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={clsx(
          'relative w-full max-w-[calc(100vw-1.5rem)] bg-white rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[88vh] transition-all animate-scale-up box-border border border-slate-100/80 my-auto',
          tamanhoClasses[tamanho]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-3.5 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
          <div className="pr-2 min-w-0">
            {titulo && <h3 className="text-[clamp(1rem,3.2vw,1.15rem)] font-bold text-slate-900 leading-tight truncate">{titulo}</h3>}
            {subtitulo && <p className="text-[clamp(0.7rem,2.4vw,0.78rem)] text-slate-500 mt-0.5 leading-snug line-clamp-2">{subtitulo}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body com Scroll Suave e Padding Responsivo */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto overflow-x-hidden flex-1 w-full max-w-full box-border">
          {children}
        </div>
      </div>
    </div>
  );
}
