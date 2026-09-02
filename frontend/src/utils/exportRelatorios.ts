import { Visitante } from '@/types/visitante';
import { formatarDataBR } from './formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

export interface LinhaRelatorio {
  dataVisita: string;
  nome: string;
  whatsapp: string;
  comoChegou: string;
  status: string;
  responsavel: string;
  proximaAcao: string;
  dataContato: string;
  observacoes: string;
  mes: string;
  diasSemContato: string | number;
}

export function mapearVisitanteParaRelatorio(v: Visitante): LinhaRelatorio {
  const dataVisitaFormatada = formatarDataBR(v.data_visita);
  const dataContatoFormatada = v.data_ultimo_contato ? formatarDataBR(v.data_ultimo_contato) : '-';
  const statusFormatado = v.status === 'contactado' ? 'Contato realizado' : 'Não contatado';
  const responsavel = v.responsavel_nome || 'A definir';
  const proximaAcao = v.proxima_acao || 'Enviar mensagem';
  const observacoes = v.observacoes || (v.historico_contatos && v.historico_contatos.length > 0 ? v.historico_contatos[0].mensagem : '-');
  const mesFormatado = v.mes_ano || '-';
  const diasSemContato = v.status === 'nao_contactado' ? v.dias_sem_contato : '-';

  return {
    dataVisita: dataVisitaFormatada,
    nome: v.nome,
    whatsapp: v.whatsapp,
    comoChegou: v.como_chegou || '-',
    status: statusFormatado,
    responsavel: responsavel,
    proximaAcao: proximaAcao,
    dataContato: dataContatoFormatada,
    observacoes: observacoes,
    mes: mesFormatado,
    diasSemContato: diasSemContato,
  };
}

/**
 * 1. Exporta para CSV compatível com Excel (UTF-8 com BOM e delimitador ponto e vírgula)
 */
export function exportarParaCSV(visitantes: Visitante[], nomeArquivo = 'relatorio_visitantes_acolher'): void {
  const linhas = visitantes.map(mapearVisitanteParaRelatorio);

  const cabecalhos = [
    'Data da visita',
    'Nome',
    'WhatsApp',
    'Como chegou',
    'Status',
    'Responsável',
    'Próxima ação',
    'Data do contato',
    'Observações',
    'Mês',
    'Dias sem contato',
  ];

  const conteudoLinhas = linhas.map((l) => [
    `"${l.dataVisita}"`,
    `"${l.nome.replace(/"/g, '""')}"`,
    `"${l.whatsapp}"`,
    `"${l.comoChegou.replace(/"/g, '""')}"`,
    `"${l.status}"`,
    `"${l.responsavel.replace(/"/g, '""')}"`,
    `"${l.proximaAcao.replace(/"/g, '""')}"`,
    `"${l.dataContato}"`,
    `"${l.observacoes.replace(/"/g, '""')}"`,
    `"${l.mes}"`,
    `"${l.diasSemContato}"`,
  ].join(';'));

  const csvCompleto = '\uFEFF' + [cabecalhos.join(';'), ...conteudoLinhas].join('\r\n');
  const blob = new Blob([csvCompleto], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 2. Exporta para XLSX (Excel com formatação nativa, cabeçalhos azuis e colunas auto-ajustadas)
 */
export async function exportarParaXLSX(visitantes: Visitante[], nomeArquivo = 'relatorio_visitantes_acolher'): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Visitantes');

  worksheet.columns = [
    { header: 'Data da visita', key: 'dataVisita', width: 14 },
    { header: 'Nome', key: 'nome', width: 26 },
    { header: 'WhatsApp', key: 'whatsapp', width: 18 },
    { header: 'Como chegou', key: 'comoChegou', width: 24 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Responsável', key: 'responsavel', width: 18 },
    { header: 'Próxima ação', key: 'proximaAcao', width: 20 },
    { header: 'Data do contato', key: 'dataContato', width: 16 },
    { header: 'Observações', key: 'observacoes', width: 30 },
    { header: 'Mês', key: 'mes', width: 15 },
    { header: 'Dias sem contato', key: 'diasSemContato', width: 16 },
  ];

  // Estilização do cabeçalho
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3370' }, // Azul Acolher
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;

  const linhas = visitantes.map(mapearVisitanteParaRelatorio);

  linhas.forEach((item, index) => {
    const row = worksheet.addRow(item);
    row.alignment = { vertical: 'middle' };
    
    // Zebra striping suave
    if (index % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' },
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 3. Exporta para PDF profissional em orientação paisagem (Landscape)
 */
export function exportarParaPDF(visitantes: Visitante[], filtroTitulo = 'Geral', nomeArquivo = 'relatorio_visitantes_acolher'): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Cabeçalho institucional do relatório
  doc.setFillColor(30, 51, 112); // #1E3370
  doc.rect(0, 0, 297, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('IBI Chapecó - Sistema Acolher', 14, 11);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Relatório de Visitantes • ${filtroTitulo}`, 180, 11);

  // Subcabeçalho de Metadados
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  const dataGeracao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Gerado em: ${dataGeracao} | Total de registros: ${visitantes.length}`, 14, 25);

  const linhas = visitantes.map(mapearVisitanteParaRelatorio);

  const tableBody = linhas.map((l) => [
    l.dataVisita,
    l.nome,
    l.whatsapp,
    l.comoChegou,
    l.status,
    l.responsavel,
    l.proximaAcao,
    l.dataContato,
    l.observacoes,
    l.mes,
    l.diasSemContato,
  ]);

  autoTable(doc, {
    startY: 29,
    head: [[
      'Data Visita',
      'Nome',
      'WhatsApp',
      'Como Chegou',
      'Status',
      'Responsável',
      'Próxima Ação',
      'Data Contato',
      'Observações',
      'Mês',
      'Dias s/ Contato',
    ]],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 51, 112],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 32 },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 24 },
      6: { cellWidth: 26 },
      7: { cellWidth: 20, halign: 'center' },
      8: { cellWidth: 38 },
      9: { cellWidth: 18, halign: 'center' },
      10: { cellWidth: 16, halign: 'center' },
    },
    margin: { left: 10, right: 10, bottom: 12 },
    didDrawPage: (data) => {
      // Rodapé em todas as páginas
      const pageNumber = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${data.pageNumber} de ${pageNumber} - Igreja Batista Independente em Chapecó`,
        14,
        205
      );
    },
  });

  doc.save(`${nomeArquivo}_${new Date().toISOString().split('T')[0]}.pdf`);
}
