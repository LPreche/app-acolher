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

        $dataVisitaFormatada = 'no último culto';
        if ($visitante->data_visita) {
            if ($visitante->data_visita instanceof \DateTimeInterface) {
                $dataVisitaFormatada = $visitante->data_visita->format('d/m/Y');
            } else {
                $time = strtotime((string) $visitante->data_visita);
                $dataVisitaFormatada = $time ? date('d/m/Y', $time) : (string) $visitante->data_visita;
            }
        }

        $primeiroNome = explode(' ', trim($visitante->nome))[0] ?? $visitante->nome;

        $substituicoes = [
            '{nome}' => $primeiroNome,
            '{nome_completo}' => $visitante->nome,
            '{responsavel}' => $nomeResponsavel,
            '{como_chegou}' => $visitante->como_chegou ?? 'nossa igreja',
            '{data_visita}' => $dataVisitaFormatada,
        ];

        return str_replace(
            array_keys($substituicoes),
            array_values($substituicoes),
            $this->conteudo
        );
    }
}
