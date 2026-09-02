<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistoricoContatoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'visitante_id' => $this->visitante_id,
            'usuario_id' => $this->usuario_id,
            'usuario_nome' => $this->usuario?->nome ?? 'Usuário',
            'tipo_mensagem' => $this->tipo_mensagem?->value ?? $this->tipo_mensagem,
            'tipo_mensagem_rotulo' => $this->tipo_mensagem?->rotulo() ?? $this->tipo_mensagem,
            'mensagem' => $this->mensagem,
            'created_at' => $this->created_at?->format('d/m/Y H:i'),
            'created_at_iso' => $this->created_at?->toISOString(),
        ];
    }
}
