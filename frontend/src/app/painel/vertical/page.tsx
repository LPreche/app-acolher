'use client';

import React from 'react';
import { PainelInicioView } from '@/components/visitantes/PainelInicioView';

export default function PainelVerticalPage() {
  return (
    <PainelInicioView
      tipo="vertical"
      titulo="Acolher Vertical"
      subtitulo="Recepção e conexão com jovens e visitantes do culto Vertical"
      corTema="navy"
    />
  );
}
