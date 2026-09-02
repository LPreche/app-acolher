<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisitanteResource extends JsonResource
{
    /**
     * Transforma o recurso em array para a API.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'whatsapp' => $this->whatsapp,
            'como_chegou' => $this->como_chegou,
            'tipo_acolhimento' => $this->tipo_acolhimento?->value ?? $this->tipo_acolhimento,
            'tipo_acolhimento_rotulo' => $this->tipo_acolhimento?->rotulo() ?? $this->tipo_acolhimento,
            'status' => $this->status?->value ?? $this->status,
            'status_rotulo' => $this->status?->rotulo() ?? $this->status,
            'contato_segunda_enviado' => (bool) $this->contato_segunda_enviado,
            'data_contato_segunda' => $this->data_contato_segunda ? $this->data_contato_segunda->format('Y-m-d') : null,
            'data_contato_segunda_formatada' => $this->data_contato_segunda ? $this->data_contato_segunda->format('d/m/Y') : null,
            'contato_sexta_enviado' => (bool) $this->contato_sexta_enviado,
            'data_contato_sexta' => $this->data_contato_sexta ? $this->data_contato_sexta->format('Y-m-d') : null,
            'data_contato_sexta_formatada' => $this->data_contato_sexta ? $this->data_contato_sexta->format('d/m/Y') : null,
            'usuario_responsavel_id' => $this->usuario_responsavel_id,
            'responsavel_nome' => $this->responsavel?->nome ?? 'Não atribuído',
            'data_visita' => $this->data_visita ? $this->data_visita->format('Y-m-d') : null,
            'data_visita_formatada' => $this->data_visita ? $this->data_visita->format('d/m/Y') : null,
            'data_ultimo_contato' => $this->data_ultimo_contato?->toISOString(),
            'data_ultimo_contato_formatada' => $this->data_ultimo_contato?->format('d/m/Y H:i'),
            'proxima_acao' => $this->proxima_acao,
            'observacoes' => $this->observacoes,
            'mes_ano' => $this->mes_ano,
            'ativo' => (bool) $this->ativo,
            'dias_sem_contato' => $this->dias_sem_contato,
            'historico_contatos' => HistoricoContatoResource::collection($this->whenLoaded('historicoContatos')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
