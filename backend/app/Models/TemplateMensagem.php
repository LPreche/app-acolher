<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateMensagem extends Model
{
    use HasFactory;

    protected $table = 'templates_mensagens';

    protected $fillable = [
        'titulo',
        'momento',
        'tipo_acolhimento',
        'conteudo',
        'descricao',
        'ativo',
        'ordem',
    ];

    protected $casts = [
        'ativo' => 'boolean',
        'ordem' => 'integer',
    ];

    /**
     * Formata o conteúdo do template substituindo as variáveis dinâmicas.
     */
    public function formatarMensagem(Visitante $visitante, ?Usuario $usuario = null): string
    {
        $nomeResponsavel = $usuario?->nome ?? $visitante->responsavel?->nome ?? 'Equipe de Acolhimento';

        $substituicoes = [
            '{nome}' => $visitante->nome,
            '{responsavel}' => $nomeResponsavel,
            '{como_chegou}' => $visitante->como_chegou ?? 'nossa igreja',
            '{data_visita}' => $visitante->data_visita ? date('d/m/Y', strtotime($visitante->data_visita)) : 'no último culto',
        ];

        return str_replace(
            array_keys($substituicoes),
            array_values($substituicoes),
            $this->conteudo
        );
    }
}
