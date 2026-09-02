<?php

namespace App\Http\Requests;

use App\Enums\TipoMensagemEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class RegistrarContatoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Regras de validação para registro de contato via WhatsApp.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tipo_mensagem' => ['required', new Enum(TipoMensagemEnum::class)],
            'momento' => ['nullable', 'string', 'in:segunda,sexta,geral'],
            'mensagem' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo_mensagem.required' => 'O tipo de mensagem é obrigatório.',
            'mensagem.required' => 'O conteúdo da mensagem é obrigatório.',
        ];
    }
}
