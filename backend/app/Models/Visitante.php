<?php

namespace App\Models;

use App\Enums\StatusContatoEnum;
use App\Enums\TipoAcolhimentoEnum;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Visitante extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'visitantes';

    /**
     * Atributos atribuíveis em massa.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'whatsapp',
        'como_chegou',
        'tipo_acolhimento',
        'status',
        'contato_segunda_enviado',
        'data_contato_segunda',
        'contato_sexta_enviado',
        'data_contato_sexta',
        'usuario_responsavel_id',
        'data_visita',
        'data_ultimo_contato',
        'proxima_acao',
        'observacoes',
        'mes_ano',
        'ativo',
    ];

    /**
     * Mapeamento de tipos de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tipo_acolhimento' => TipoAcolhimentoEnum::class,
            'status' => StatusContatoEnum::class,
            'contato_segunda_enviado' => 'boolean',
            'data_contato_segunda' => 'date:Y-m-d',
            'contato_sexta_enviado' => 'boolean',
            'data_contato_sexta' => 'date:Y-m-d',
            'data_visita' => 'date:Y-m-d',
            'data_ultimo_contato' => 'datetime',
            'ativo' => 'boolean',
        ];
    }

    /**
     * Atributos adicionais em respostas JSON.
     *
     * @var list<string>
     */
    protected $appends = [
        'dias_sem_contato',
    ];

    /**
     * Auto-preenche 'mes_ano' com base na 'data_visita' se a coluna existir no banco.
     */
    protected static function booted(): void
    {
        static::saving(function (Visitante $visitante) {
            try {
                if ($visitante->data_visita && \Illuminate\Support\Facades\Schema::hasColumn('visitantes', 'mes_ano')) {
                    $visitante->mes_ano = Carbon::parse($visitante->data_visita)->format('m/Y');
                } else {
                    unset($visitante->mes_ano);
                }
            } catch (\Throwable $e) {
                unset($visitante->mes_ano);
            }
        });
    }

    /**
     * Usuário que cadastrou / é responsável pelo visitante.
     */
    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_responsavel_id');
    }

    /**
     * Histórico de mensagens/contatos enviados ao visitante.
     */
    public function historicoContatos(): HasMany
    {
        return $this->hasMany(HistoricoContato::class, 'visitante_id')->orderBy('created_at', 'desc');
    }

    /**
     * Calcula dinamicamente o número de dias sem contato.
     * Considera 'data_ultimo_contato', ou se nulo, a 'data_visita'.
     */
    public function getDiasSemContatoAttribute(): int
    {
        $dataReferencia = $this->data_ultimo_contato
            ? Carbon::parse($this->data_ultimo_contato)->startOfDay()
            : ($this->data_visita ? Carbon::parse($this->data_visita)->startOfDay() : now()->startOfDay());

        $dias = (int) $dataReferencia->diffInDays(now()->startOfDay(), false);

        return max(0, $dias);
    }

    /**
     * Scope para adicionar a coluna virtual SQL calculada 'dias_sem_contato_calc'
     * compatível com PostgreSQL.
     */
    public function scopeComCalculoDiasSemContato(Builder $query): Builder
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            return $query->select('*')->selectRaw(
                'EXTRACT(DAY FROM (CURRENT_DATE - COALESCE(data_ultimo_contato::date, data_visita))) as dias_sem_contato_calc'
            );
        }

        // Fallback SQLite / MySQL
        return $query->select('*')->selectRaw(
            'CAST((julianday(CURRENT_DATE) - julianday(COALESCE(date(data_ultimo_contato), data_visita))) AS INTEGER) as dias_sem_contato_calc'
        );
    }

    /**
     * Scope para filtrar por segmento (família / vertical).
     */
    public function scopeDoSegmento(Builder $query, string|TipoAcolhimentoEnum $segmento): Builder
    {
        $valor = $segmento instanceof TipoAcolhimentoEnum ? $segmento->value : $segmento;
        return $query->where('tipo_acolhimento', $valor);
    }

    /**
     * Scope para visitantes ativos.
     */
    public function scopeAtivos(Builder $query): Builder
    {
        return $query->where('ativo', true);
    }

    /**
     * Scope para visitantes não contactados.
     */
    public function scopeNaoContactados(Builder $query): Builder
    {
        return $query->where('status', StatusContatoEnum::NAO_CONTACTADO->value);
    }
}
