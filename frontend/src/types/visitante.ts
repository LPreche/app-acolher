export type TipoAcolhimento = 'familia' | 'vertical';
export type StatusContato = 'nao_contactado' | 'contactado';
export type TipoMensagem = 'padrao_familia' | 'padrao_vertical' | 'segunda' | 'sexta' | 'personalizada';

export interface MetricasResumo {
  total_visitantes: number;
  total_nao_contactados: number;
  total_contactados: number;
  total_familia: number;
  total_vertical: number;
  total_usuarios?: number | null;
  por_tipo?: {
    familia?: { nao_contactados: number };
    vertical?: { nao_contactados: number };
  };
}

export interface HistoricoContato {
  id: number;
  visitante_id: number;
  usuario_id: number;
  usuario_nome: string;
  tipo_mensagem: TipoMensagem;
  tipo_mensagem_rotulo: string;
  mensagem: string;
  created_at: string;
  created_at_iso?: string;
}

export interface Visitante {
  id: number;
  nome: string;
  whatsapp: string;
  como_chegou: string;
  tipo_acolhimento: TipoAcolhimento;
  tipo_acolhimento_rotulo: string;
  status: StatusContato;
  status_rotulo: string;
  contato_segunda_enviado?: boolean;
  data_contato_segunda?: string | null;
  data_contato_segunda_formatada?: string | null;
  contato_sexta_enviado?: boolean;
  data_contato_sexta?: string | null;
  data_contato_sexta_formatada?: string | null;
  usuario_responsavel_id: number;
  responsavel_nome: string;
  data_visita: string;
  data_visita_formatada?: string;
  data_ultimo_contato?: string | null;
  data_ultimo_contato_formatada?: string | null;
  proxima_acao?: string | null;
  observacoes?: string | null;
  mes_ano: string;
  ativo: boolean;
  dias_sem_contato: number;
  historico_contatos?: HistoricoContato[];
  created_at?: string;
  updated_at?: string;
}

export interface TemplateMensagemItem {
  id?: number;
  titulo: string;
  momento?: 'segunda' | 'sexta' | 'geral';
  texto: string;
  link_whatsapp: string;
  descricao?: string | null;
}

export interface TemplatesContatoResponse {
  visitante: {
    id: number;
    nome: string;
    whatsapp: string;
    tipo_acolhimento: string;
    contato_segunda_enviado: boolean;
    data_contato_segunda: string | null;
    contato_sexta_enviado: boolean;
    data_contato_sexta: string | null;
  };
  telefone_normalizado: string;
  templates_segunda: TemplateMensagemItem[];
  templates_sexta: TemplateMensagemItem[];
  templates_geral: TemplateMensagemItem[];
  fallback_segunda: {
    texto: string;
    link_whatsapp: string;
  };
  fallback_sexta: {
    texto: string;
    link_whatsapp: string;
  };
}
