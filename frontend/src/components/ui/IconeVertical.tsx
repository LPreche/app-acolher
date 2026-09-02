'use client';

import React from 'react';

interface IconeVerticalProps {
  className?: string;
  variante?: 'padrao' | 'branco' | 'vermelho';
  alt?: string;
}

export function IconeVertical({
  className = 'w-4 h-4',
  variante = 'padrao',
  alt = 'Vertical',
}: IconeVerticalProps) {
  let filterClass = 'mix-blend-multiply';

  if (variante === 'branco') {
    // Torna o ícone 100% branco para fundos escuros ou coloridos
    filterClass = 'brightness-0 invert';
  } else if (variante === 'vermelho') {
    // Aplica tonalidade avermelhada/coral se necessário
    filterClass = 'sepia hue-rotate-[320deg] saturate-[300%]';
  }

  return (
    <img
      src="/icone-vertical.png"
      alt={alt}
      className={`inline-block object-contain flex-shrink-0 align-middle ${filterClass} ${className}`}
    />
  );
}
