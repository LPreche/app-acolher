<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditoriaLog extends Model
{
    use HasFactory;

    protected $table = 'auditoria_logs';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'usuario_nome',
        'evento',
        'descricao',
        'ip_address',
        'user_agent',
        'dados',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'dados' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Usuário que realizou a ação auditada.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
