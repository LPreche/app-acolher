/**
 * Formata data ISO ou YYYY-MM-DD para DD/MM/YYYY
 */
export function formatarDataBR(dataStr?: string | null): string {
  if (!dataStr) return '-';
  try {
    const dataApenas = dataStr.split('T')[0];
    const partes = dataApenas.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
  } catch {
    return dataStr || '-';
  }
}

/**
 * Retorna classe e texto visual para o badge de dias sem contato
 */
export function obterEstiloDiasSemContato(dias: number, status: string): {
  texto: string;
  classe: string;
  urgente: boolean;
} {
  if (status === 'contactado') {
    return {
      texto: dias === 0 ? 'Contactado hoje' : `${dias}d após contato`,
      classe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      urgente: false,
    };
  }

  if (dias === 0) {
    return {
      texto: 'Visitou hoje',
      classe: 'bg-blue-50 text-blue-700 border-blue-200',
      urgente: false,
    };
  }

  if (dias <= 2) {
    return {
      texto: `${dias} dias sem contato`,
      classe: 'bg-amber-50 text-amber-700 border-amber-200',
      urgente: false,
    };
  }

  if (dias <= 5) {
    return {
      texto: `⚠️ ${dias} dias sem contato`,
      classe: 'bg-orange-50 text-orange-700 border-orange-200 font-medium',
      urgente: true,
    };
  }

  return {
    texto: `🚨 ${dias} dias sem contato`,
    classe: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold animate-urgent',
    urgente: true,
  };
}
