'use client';

import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  erro?: string;
  iconeEsquerda?: React.ReactNode;
  iconeDireita?: React.ReactNode;
  dica?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, erro, iconeEsquerda, iconeDireita, dica, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full max-w-full box-border space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative w-full max-w-full rounded-xl shadow-xs box-border">
          {iconeEsquerda && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 flex-shrink-0">
              {iconeEsquerda}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'block w-full max-w-full box-border rounded-xl border bg-white text-slate-900 text-sm transition-smooth',
              'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3370] focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
              'py-2.5 px-3.5 min-h-[44px]',
              iconeEsquerda && 'pl-10',
              iconeDireita && 'pr-10',
              erro
                ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 hover:border-slate-400',
              className
            )}
            {...props}
          />
          {iconeDireita && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 flex-shrink-0">
              {iconeDireita}
            </div>
          )}
        </div>
        {erro && <p className="text-xs text-rose-600 font-medium">{erro}</p>}
        {dica && !erro && <p className="text-xs text-slate-500">{dica}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
