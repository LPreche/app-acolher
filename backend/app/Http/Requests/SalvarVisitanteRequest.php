<?php

namespace App\Http\Requests;

use App\Enums\StatusContatoEnum;
use App\Enums\TipoAcolhimentoEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class SalvarVisitanteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Prepara os dados antes da validação para evitar inconsistências.
     */
    protected function prepareForValidation(): void
    {
        $mergeData = [];

        // Higieniza usuario_responsavel_id: se for vazio, 0, ou inválido, usa o id do usuário logado
        $respId = $this->input('usuario_responsavel_id');
        if (empty($respId) || !is_numeric($respId) || (int) $respId <= 0) {
            $mergeData['usuario_responsavel_id'] = $this->user()?->id;
        }

        // Se data_visita não for informada, usa a data atual
        if (!$this->filled('data_visita')) {
            $mergeData['data_visita'] = date('Y-m-d');
        }

        // Se status não for informado, usa nao_contactado
        if (!$this->filled('status')) {
            $mergeData['status'] = 'nao_contactado';
        }

        if (!empty($mergeData)) {
            $this->merge($mergeData);
        }
    }

    /**
     * Regras de validação para criação ou edição de visitante.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:150'],
            'whatsapp' => ['required', 'string', 'max:20'],
            'como_chegou' => ['required', 'string', 'max:255'],
            'tipo_acolhimento' => ['required', new Enum(TipoAcolhimentoEnum::class)],
            'status' => ['nullable', new Enum(StatusContatoEnum::class)],
            'data_visita' => ['nullable', 'date'],
            'data_ultimo_contato' => ['nullable', 'date'],
            'proxima_acao' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
            'usuario_responsavel_id' => ['nullable', 'exists:usuarios,id'],
            'ativo' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do visitante é obrigatório.',
            'whatsapp.required' => 'O WhatsApp do visitante é obrigatório.',
            'como_chegou.required' => 'Informe como o visitante chegou até a igreja.',
            'tipo_acolhimento.required' => 'O tipo de acolhimento (Família ou Vertical) é obrigatório.',
            'data_visita.date' => 'A data da visita deve ser uma data válida.',
        ];
    }
}
