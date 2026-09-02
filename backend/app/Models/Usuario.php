<?php

namespace App\Models;

use App\Enums\PerfilUsuarioEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'usuarios';

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'usuario',
        'email',
        'password',
        'perfil',
        'whatsapp',
        'ativo',
    ];

    /**
     * Os atributos que devem ficar ocultos para serialização.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Mapeamento de tipos de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'perfil' => PerfilUsuarioEnum::class,
            'ativo' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * Gera o identificador de usuário no padrão: primeironome.ultimonome em minúsculo.
     * Exemplo: "Luiz Paulo Rec" -> "luiz.rec" | "Luiz Paulo Reche" -> "luiz.reche"
     */
    public static function gerarUsuarioDeAcesso(string $nome): string
    {
        $nomeSemAcentos = Str::ascii($nome);
        $nomeLimpo = preg_replace('/[^a-zA-Z0-9\s]/', '', $nomeSemAcentos);
        $partes = array_values(array_filter(explode(' ', strtolower(trim($nomeLimpo)))));

        if (empty($partes)) {
            return 'usuario';
        }

        if (count($partes) === 1) {
            return $partes[0];
        }

        $primeiroNome = $partes[0];
        $ultimoNome = end($partes);

        return "{$primeiroNome}.{$ultimoNome}";
    }

    /**
     * Booted do Eloquent para gerar automaticamente o usuario se não informado.
     */
    protected static function booted(): void
    {
        static::saving(function (Usuario $usuario) {
            if (empty($usuario->usuario) && !empty($usuario->nome)) {
                $usuario->usuario = static::gerarUsuarioDeAcesso($usuario->nome);
            }
            if (empty($usuario->email)) {
                $usuario->email = null;
            }
        });
    }

    /**
     * Visitantes cadastrados pelo usuário.
     */
    public function visitantesCadastrados(): HasMany
    {
        return $this->hasMany(Visitante::class, 'usuario_responsavel_id');
    }

    /**
     * Histórico de contatos feitos pelo usuário.
     */
    public function historicoContatos(): HasMany
    {
        return $this->hasMany(HistoricoContato::class, 'usuario_id');
    }

    /**
     * Verifica se o usuário é Administrador.
     */
    public function eAdmin(): bool
    {
        return $this->perfil === PerfilUsuarioEnum::ADMINISTRADOR;
    }

    /**
     * Verifica se o usuário possui perfil de Líder.
     */
    public function eLider(): bool
    {
        return in_array($this->perfil, [
            PerfilUsuarioEnum::LIDER_FAMILIA,
            PerfilUsuarioEnum::LIDER_VERTICAL,
            PerfilUsuarioEnum::LIDER_AMBOS,
        ]);
    }

    /**
     * Verifica se o usuário tem permissão de acesso à central de relatórios (Admin ou Líder).
     */
    public function temAcessoRelatorios(): bool
    {
        return $this->eAdmin() || $this->eLider();
    }

    /**
     * Verifica se o usuário pode acessar o Acolher Família.
     */
    public function temAcessoFamilia(): bool
    {
        return $this->eAdmin() ||
               in_array($this->perfil, [
                   PerfilUsuarioEnum::ACOLHER_FAMILIA,
                   PerfilUsuarioEnum::AMBOS,
                   PerfilUsuarioEnum::LIDER_FAMILIA,
                   PerfilUsuarioEnum::LIDER_AMBOS,
               ]);
    }

    /**
     * Verifica se o usuário pode acessar o Acolher Vertical.
     */
    public function temAcessoVertical(): bool
    {
        return $this->eAdmin() ||
               in_array($this->perfil, [
                   PerfilUsuarioEnum::ACOLHER_VERTICAL,
                   PerfilUsuarioEnum::AMBOS,
                   PerfilUsuarioEnum::LIDER_VERTICAL,
                   PerfilUsuarioEnum::LIDER_AMBOS,
               ]);
    }
}
