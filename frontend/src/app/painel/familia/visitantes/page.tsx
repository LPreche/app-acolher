'use client';

import React from 'react';
import { PainelVisitantesView } from '@/components/visitantes/PainelVisitantesView';

export default function VisitantesFamiliaPage() {
  return (
    <PainelVisitantesView
      tipo="familia"
      titulo="Visitantes - Família"
      subtitulo="Lista completa de visitantes cadastrados no Acolher Família"
    />
  );
}
