'use client';

import React from 'react';
import { PainelInicioView } from '@/components/visitantes/PainelInicioView';

export default function PainelFamiliaPage() {
  return (
    <PainelInicioView
      tipo="familia"
      titulo="Acolher Família"
      subtitulo="Recepção dos cultos de domingo e acolhimento das famílias"
      corTema="navy"
    />
  );
}
