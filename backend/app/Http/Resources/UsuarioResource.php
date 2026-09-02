<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
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
            'usuario' => $this->usuario,
            'email' => $this->email,
            'perfil' => $this->perfil?->value ?? $this->perfil,
            'perfil_rotulo' => $this->perfil?->rotulo() ?? $this->perfil,
            'whatsapp' => $this->whatsapp,
            'ativo' => (bool) $this->ativo,
            'pode_acessar_familia' => $this->temAcessoFamilia(),
            'pode_acessar_vertical' => $this->temAcessoVertical(),
            'pode_acessar_relatorios' => $this->temAcessoRelatorios(),
            'e_admin' => $this->eAdmin(),
            'e_lider' => $this->eLider(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
