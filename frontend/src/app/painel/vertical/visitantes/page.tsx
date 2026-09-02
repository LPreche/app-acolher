'use client';

import React from 'react';
import { PainelVisitantesView } from '@/components/visitantes/PainelVisitantesView';

export default function VisitantesVerticalPage() {
  return (
    <PainelVisitantesView
      tipo="vertical"
      titulo="Visitantes - Vertical"
      subtitulo="Lista completa de visitantes cadastrados no Acolher Vertical"
    />
  );
}
