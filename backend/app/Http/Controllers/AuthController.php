<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use App\Services\AuditoriaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Autentica o usuário pelo usuario_acesso (primeironome.ultimonome) ou e-mail e gera o token Sanctum.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $identificador = strtolower(trim($request->input('usuario') ?? $request->input('login') ?? $request->input('email') ?? ''));

            if (empty($identificador)) {
                throw ValidationException::withMessages([
                    'usuario' => ['Informe seu usuário de acesso (ex: luiz.reche).'],
                ]);
            }

            $usuario = Usuario::where('usuario', $identificador)
                ->orWhere('email', $identificador)
                ->first();

            if (! $usuario || ! Hash::check($request->password, $usuario->password)) {
                AuditoriaService::registrarLoginFalha($identificador, $request, 'Senha inválida ou usuário inexistente');

                throw ValidationException::withMessages([
                    'usuario' => ['Usuário ou senha incorretos.'],
                ]);
            }

            if (! $usuario->ativo) {
                AuditoriaService::registrarLoginFalha($identificador, $request, 'Tentativa de login de usuário inativo');

                throw ValidationException::withMessages([
                    'usuario' => ['Este usuário está inativo no sistema. Contate o administrador.'],
                ]);
            }

            // Remove tokens antigos para manter sessão única e segura
            $usuario->tokens()->delete();

            // Gera novo token Sanctum
            $token = $usuario->createToken('acolher_token')->plainTextToken;

            // Registra sucesso na trilha de auditoria
            AuditoriaService::registrarLoginSucesso($usuario, $request);

            return response()->json([
                'mensagem' => 'Login realizado com sucesso.',
                'token' => $token,
                'usuario' => new UsuarioResource($usuario),
            ]);
        } catch (ValidationException $ve) {
            throw $ve;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Erro ao processar login: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'mensagem' => 'Falha interna ao processar login no servidor.',
                'erro_detalhado' => config('app.debug') ? $e->getMessage() : 'Verifique se as tabelas foram criadas no banco de dados.',
            ], 500);
        }
    }

    /**
     * Retorna os dados do usuário autenticado atual.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'usuario' => new UsuarioResource($request->user()),
        ]);
    }

    /**
     * Revoga o token atual do usuário (Logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $usuario = $request->user();

        AuditoriaService::registrarLogout($usuario, $request);

        $usuario->currentAccessToken()->delete();

        return response()->json([
            'mensagem' => 'Sessão encerrada com sucesso.',
        ]);
    }
}
