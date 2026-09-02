<?php

namespace App\Http\Requests;

use App\Enums\PerfilUsuarioEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class SalvarUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->eAdmin();
    }

    /**
     * Regras de validação para criação ou edição de usuário.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $usuarioId = $this->route('usuario') ? $this->route('usuario')->id : null;

        return [
            'nome' => ['required', 'string', 'max:120'],
            'usuario' => [
                'nullable',
                'string',
                'max:60',
                Rule::unique('usuarios', 'usuario')->ignore($usuarioId),
            ],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:150',
                Rule::unique('usuarios', 'email')->ignore($usuarioId),
            ],
            'password' => [$usuarioId ? 'nullable' : 'required', 'string', 'min:6'],
            'perfil' => ['required', new Enum(PerfilUsuarioEnum::class)],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'ativo' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do usuário é obrigatório.',
            'usuario.unique' => 'Este identificador de usuário já está em uso.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já está cadastrado no sistema.',
            'password.required' => 'A senha é obrigatória para novos usuários.',
            'password.min' => 'A senha deve ter no mínimo 6 caracteres.',
            'perfil.required' => 'O perfil de acesso é obrigatório.',
        ];
    }
}
