export type MomentoMensagem = 'segunda' | 'sexta' | 'geral';
export type TipoAcolhimentoTemplate = 'familia' | 'vertical' | 'ambos';

export interface TemplateMensagem {
  id: number;
  titulo: string;
  momento: MomentoMensagem;
  tipo_acolhimento: TipoAcolhimentoTemplate;
  conteudo: string;
  descricao?: string | null;
  ativo: boolean;
  ordem: number;
  created_at?: string;
  updated_at?: string;
  // Campos formatados dinamicamente no endpoint do visitante
  texto?: string;
  link_whatsapp?: string;
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
  templates_segunda: TemplateMensagem[];
  templates_sexta: TemplateMensagem[];
  templates_geral: TemplateMensagem[];
  fallback_segunda: {
    texto: string;
    link_whatsapp: string;
  };
  fallback_sexta: {
    texto: string;
    link_whatsapp: string;
  };
}
