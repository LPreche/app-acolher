<?php

namespace App\Models;

use App\Enums\TipoMensagemEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoricoContato extends Model
{
    use HasFactory;

    protected $table = 'historico_contatos';

    protected $fillable = [
        'visitante_id',
        'usuario_id',
        'tipo_mensagem',
        'mensagem',
        'mensagem_enviada',
        'status_anterior',
        'status_novo',
        'tipo_contato',
        'data_contato',
    ];

    protected function casts(): array
    {
        return [
            'tipo_mensagem' => TipoMensagemEnum::class,
        ];
    }

    public function visitante(): BelongsTo
    {
        return $this->belongsTo(Visitante::class, 'visitante_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
