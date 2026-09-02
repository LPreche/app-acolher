import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'flame' | 'success' | 'warning' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className,
  dot = false,
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-indigo-50 text-[#1E3370] border-indigo-150',
    flame: 'bg-rose-50 text-[#E63946] border-rose-150',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-white text-slate-700 border-slate-300',
  };

  const dotColors = {
    primary: 'bg-[#1E3370]',
    flame: 'bg-[#E63946]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    neutral: 'bg-slate-400',
    outline: 'bg-slate-500',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border tracking-wide',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
