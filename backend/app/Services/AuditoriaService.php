<?php

namespace App\Services;

use App\Models\AuditoriaLog;
use App\Models\Usuario;
use Illuminate\Http\Request;

class AuditoriaService
{
    /**
     * Registra uma entrada genérica na trilha de auditoria.
     */
    public static function registrar(
        string $evento,
        string $descricao,
        ?Usuario $usuario = null,
        ?array $dados = null,
        ?Request $request = null
    ): ?AuditoriaLog {
        try {
            $req = $request ?? request();

            return AuditoriaLog::create([
                'usuario_id' => $usuario?->id ?? auth('sanctum')->id(),
                'usuario_nome' => $usuario?->nome ?? auth('sanctum')->user()?->nome,
                'evento' => $evento,
                'descricao' => $descricao,
                'ip_address' => $req?->ip(),
                'user_agent' => $req ? substr($req->userAgent() ?? '', 0, 500) : null,
                'dados' => $dados,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('AuditoriaLog falhou silenciosamente: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Registra sucesso no login.
     */
    public static function registrarLoginSucesso(Usuario $usuario, Request $request): void
    {
        static::registrar(
            evento: 'login_sucesso',
            descricao: "Usuário '{$usuario->usuario}' autenticou-se com sucesso.",
            usuario: $usuario,
            dados: [
                'perfil' => $usuario->perfil?->value ?? $usuario->perfil,
                'email' => $usuario->email,
            ],
            request: $request
        );
    }

    /**
     * Registra falha de autenticação (tentativa de login inválida).
     */
    public static function registrarLoginFalha(string $identificador, Request $request, string $motivo): void
    {
        static::registrar(
            evento: 'login_falha',
            descricao: "Tentativa de login falhou para '{$identificador}'. Motivo: {$motivo}",
            dados: [
                'identificador_tentado' => $identificador,
                'motivo' => $motivo,
            ],
            request: $request
        );
    }

    /**
     * Registra encerramento de sessão (logout).
     */
    public static function registrarLogout(?Usuario $usuario, Request $request): void
    {
        if ($usuario) {
            static::registrar(
                evento: 'logout',
                descricao: "Usuário '{$usuario->usuario}' encerrou sua sessão.",
                usuario: $usuario,
                request: $request
            );
        }
    }
}
