'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'flame' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  carregando?: boolean;
  icone?: React.ReactNode;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  carregando = false,
  icone,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variantStyles = {
    primary: 'bg-[#1E3370] text-white hover:bg-[#162654] focus:ring-[#1E3370] shadow-sm',
    flame: 'bg-[#E63946] text-white hover:bg-[#D62828] focus:ring-[#E63946] shadow-sm shadow-red-200',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-[#1E3370]',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 focus:ring-rose-400',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-5 py-3 gap-2.5 min-h-[50px]',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || carregando}
      {...props}
    >
      {carregando ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1" />
      ) : (
        icone && <span className="flex-shrink-0">{icone}</span>
      )}
      {children}
    </button>
  );
}
