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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet */}
      <div
        className={clsx(
          'relative w-full bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] transition-transform animate-slide-up sm:animate-scale-up',
          tamanhoClasses[tamanho]
        )}
      >
        {/* Handle bar para mobile touch */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div>
            {titulo && <h3 className="text-lg font-bold text-slate-900">{titulo}</h3>}
            {subtitulo && <p className="text-xs text-slate-500 mt-0.5">{subtitulo}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
