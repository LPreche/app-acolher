/**
 * Formata um número de telefone no padrão brasileiro:
 * (99) 99999-9999 ou (99) 9999-9999
 */
export function mascaraTelefone(valor: string): string {
  if (!valor) return '';
  
  // Remove tudo que não for dígito
  const apenasNumeros = valor.replace(/\D/g, '').slice(0, 11);

  if (apenasNumeros.length <= 2) {
    return apenasNumeros.length > 0 ? `(${apenasNumeros}` : '';
  }

  if (apenasNumeros.length <= 6) {
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
  }

  if (apenasNumeros.length <= 10) {
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
  }

  return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
}

/**
 * Remove qualquer caractere que não seja número.
 */
export function limparTelefone(valor: string): string {
  return (valor || '').replace(/\D/g, '');
}
