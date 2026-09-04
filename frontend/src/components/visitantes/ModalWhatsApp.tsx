'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Visitante, TemplatesContatoResponse, TemplateMensagemItem } from '@/types/visitante';
import { visitanteService } from '@/services/visitanteService';
import { MessageCircle, Calendar, Sparkles, Edit3, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { IconeVertical } from '@/components/ui/IconeVertical';
import confetti from 'canvas-confetti';
import { clsx } from 'clsx';

interface ModalWhatsAppProps {
  aberto: boolean;
  onClose: () => void;
  visitante: Visitante | null;
  onSucesso: (visitanteAtualizado: Visitante) => void;
}

export function ModalWhatsApp({
  aberto,
  onClose,
  visitante,
  onSucesso,
}: ModalWhatsAppProps) {
  const [carregandoTemplates, setCarregandoTemplates] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [templatesData, setTemplatesData] = useState<TemplatesContatoResponse | null>(null);

  // Momento selecionado: 'segunda' | 'sexta' | 'personalizada'
  const [momentoSelecionado, setMomentoSelecionado] = useState<'segunda' | 'sexta' | 'personalizada'>('segunda');
  const [templateAtivoId, setTemplateAtivoId] = useState<number | string | null>(null);
  const [mensagemTexto, setMensagemTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (aberto && visitante) {
      // Sugere automaticamente o momento: se segunda já foi enviada, sugere sexta
      if (visitante.contato_segunda_enviado && !visitante.contato_sexta_enviado) {
        setMomentoSelecionado('sexta');
      } else {
        setMomentoSelecionado('segunda');
      }
      carregarTemplates(visitante.id);
    }
  }, [aberto, visitante]);

  const carregarTemplates = async (visitanteId: number) => {
    setCarregandoTemplates(true);
    setErro(null);
    try {
      const res = await visitanteService.obterTemplatesContato(visitanteId);
      setTemplatesData(res);

      // Define o texto inicial baseado no momento
      const isSexta = visitante?.contato_segunda_enviado && !visitante?.contato_sexta_enviado;
      if (isSexta && res.templates_sexta.length > 0) {
        setTemplateAtivoId(res.templates_sexta[0].id || 'sexta_0');
        setMensagemTexto(res.templates_sexta[0].texto);
      } else if (res.templates_segunda.length > 0) {
        setTemplateAtivoId(res.templates_segunda[0].id || 'segunda_0');
        setMensagemTexto(res.templates_segunda[0].texto);
      } else {
        setMensagemTexto(res.fallback_segunda.texto);
      }
    } catch (err: any) {
      setErro('Não foi possível carregar os templates de mensagem.');
    } finally {
      setCarregandoTemplates(false);
    }
  };

  // Alterna momento (Segunda vs Sexta vs Personalizada)
  const trocarMomento = (momento: 'segunda' | 'sexta' | 'personalizada') => {
    setMomentoSelecionado(momento);
    if (!templatesData) return;

    if (momento === 'segunda') {
      const primeiro = templatesData.templates_segunda[0];
      if (primeiro) {
        setTemplateAtivoId(primeiro.id || 'segunda_0');
        setMensagemTexto(primeiro.texto);
      } else {
        setMensagemTexto(templatesData.fallback_segunda.texto);
      }
    } else if (momento === 'sexta') {
      const primeiro = templatesData.templates_sexta[0];
      if (primeiro) {
        setTemplateAtivoId(primeiro.id || 'sexta_0');
        setMensagemTexto(primeiro.texto);
      } else {
        setMensagemTexto(templatesData.fallback_sexta.texto);
      }
    }
  };

  const selecionarTemplateItem = (item: TemplateMensagemItem) => {
    setTemplateAtivoId(item.id || item.titulo);
    setMensagemTexto(item.texto);
  };

  const handleEnviar = async () => {
    if (!visitante || !mensagemTexto.trim()) return;

    setEnviando(true);
    setErro(null);

    try {
      const tipoMensagem = momentoSelecionado === 'segunda'
        ? 'segunda'
        : momentoSelecionado === 'sexta'
        ? 'sexta'
        : 'personalizada';

      const res = await visitanteService.registrarContato(
        visitante.id,
        tipoMensagem,
        mensagemTexto.trim(),
        momentoSelecionado === 'personalizada' ? 'geral' : momentoSelecionado
      );

      // Abre o WhatsApp com a mensagem
      window.open(res.link_whatsapp, '_blank');

      // Efeito de celebração
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      onSucesso(res.visitante);
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao registrar contato.');
    } finally {
      setEnviando(false);
    }
  };

  if (!visitante) return null;

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Enviar Mensagem via WhatsApp"
      subtitulo={`Contato para ${visitante.nome} (${visitante.whatsapp})`}
      tamanho="lg"
    >
      <div className="space-y-4 text-left">
        {erro && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200">
            {erro}
          </div>
        )}

        {/* Status de Acompanhamento: Segunda e Sexta */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Status de Segunda:</span>
            {visitante.contato_segunda_enviado ? (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Enviada {visitante.data_contato_segunda_formatada ? `(${visitante.data_contato_segunda_formatada})` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                Pendente
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Status de Sexta:</span>
            {visitante.contato_sexta_enviado ? (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Enviada {visitante.data_contato_sexta_formatada ? `(${visitante.data_contato_sexta_formatada})` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-slate-200/70 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                Pendente
              </span>
            )}
          </div>
        </div>

        {/* Escolha do Momento (Segunda / Sexta / Personalizada) */}
        <div className="space-y-1.5 w-full box-border">
          <label className="block text-[clamp(0.68rem,2.2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
            Momento do Contato:
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
            {/* Botão Segunda */}
            <button
              type="button"
              onClick={() => trocarMomento('segunda')}
              className={clsx(
                'p-2 sm:p-2.5 min-h-[52px] rounded-xl border text-[clamp(0.65rem,2vw,0.75rem)] font-bold flex flex-col items-center justify-center gap-1 transition-smooth text-center box-border',
                momentoSelecionado === 'segunda'
                  ? 'border-[#1E3370] bg-indigo-50 text-[#1E3370] ring-2 ring-[#1E3370] shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <Calendar className="w-3.5 h-3.5 text-[#1E3370] flex-shrink-0" />
              <span>Segunda</span>
            </button>

            {/* Botão Sexta */}
            <button
              type="button"
              onClick={() => trocarMomento('sexta')}
              className={clsx(
                'p-2 sm:p-2.5 min-h-[52px] rounded-xl border text-[clamp(0.65rem,2vw,0.75rem)] font-bold flex flex-col items-center justify-center gap-1 transition-smooth text-center box-border',
                momentoSelecionado === 'sexta'
                  ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] ring-2 ring-[#2563EB] shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
              <span>Sexta</span>
            </button>

            {/* Botão Personalizada */}
            <button
              type="button"
              onClick={() => trocarMomento('personalizada')}
              className={clsx(
                'p-2 sm:p-2.5 min-h-[52px] rounded-xl border text-[clamp(0.65rem,2vw,0.75rem)] font-bold flex flex-col items-center justify-center gap-1 transition-smooth text-center box-border',
                momentoSelecionado === 'personalizada'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Personalizada</span>
            </button>
          </div>
        </div>

        {/* Lista de Opções de Modelos Disponíveis para o Momento */}
        {templatesData && momentoSelecionado !== 'personalizada' && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-[clamp(0.68rem,2vw,0.75rem)] font-bold text-slate-700 uppercase tracking-wider">
                Selecione o Modelo de Mensagem:
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {momentoSelecionado === 'segunda'
                  ? `${templatesData.templates_segunda.length} opções disponíveis`
                  : `${templatesData.templates_sexta.length} opções disponíveis`}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {(momentoSelecionado === 'segunda'
                ? templatesData.templates_segunda
                : templatesData.templates_sexta
              ).map((t) => {
                const isSelected = templateAtivoId === t.id;
                return (
                  <button
                    key={t.id || t.titulo}
                    type="button"
                    onClick={() => selecionarTemplateItem(t)}
                    className={clsx(
                      'p-3 rounded-2xl border text-left transition-smooth flex items-start justify-between gap-2.5 box-border cursor-pointer',
                      isSelected
                        ? 'border-[#1E3370] bg-blue-50/70 ring-2 ring-[#1E3370] shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {t.titulo}
                        </span>
                        {t.tipo_acolhimento === 'vertical' ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            Vertical
                          </span>
                        ) : t.tipo_acolhimento === 'familia' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            Família
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                            Ambos
                          </span>
                        )}
                      </div>
                      {t.descricao && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mb-1">
                          {t.descricao}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50/90 p-1.5 rounded-lg border border-slate-100/80 italic">
                        "{t.texto}"
                      </p>
                    </div>

                    <div className="flex-shrink-0 pt-0.5">
                      <div
                        className={clsx(
                          'w-5 h-5 rounded-full flex items-center justify-center border transition-all',
                          isSelected
                            ? 'bg-[#1E3370] border-[#1E3370] text-white shadow-xs'
                            : 'border-slate-300 bg-white'
                        )}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pré-visualização e Edição da Mensagem */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Mensagem que será enviada:
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={mensagemTexto}
              onChange={(e) => {
                setMensagemTexto(e.target.value);
                setMomentoSelecionado('personalizada');
              }}
              placeholder="Digite ou personalize a mensagem..."
              className="block w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-slate-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Você pode editar o texto livremente antes de abrir o WhatsApp.
          </p>
        </div>

        {/* Histórico Anterior */}
        {visitante.historico_contatos && visitante.historico_contatos.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Contatos Anteriores:</h4>
            <div className="space-y-2 max-h-28 overflow-y-auto">
              {visitante.historico_contatos.map((item) => (
                <div key={item.id} className="p-2 bg-slate-50 rounded-xl text-xs border border-slate-100">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span className="font-semibold text-slate-600">{item.usuario_nome} ({item.tipo_mensagem_rotulo || item.tipo_mensagem})</span>
                    <span>{item.created_at}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] line-clamp-2">{item.mensagem}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão de Disparo */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleEnviar}
            carregando={enviando || carregandoTemplates}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 py-3.5 text-sm font-bold gap-2"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>
              Abrir WhatsApp e Registrar {momentoSelecionado === 'segunda' ? 'Contato de Segunda' : momentoSelecionado === 'sexta' ? 'Contato de Sexta' : 'Contato'}
            </span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
