<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Services\AuditoriaService;
use App\Services\PushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /**
     * Registra ou atualiza uma subscrição Push para o usuário logado.
     */
    public function salvar(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'endpoint' => ['required', 'string'],
            'keys_p256dh' => ['nullable', 'string'],
            'keys_auth' => ['nullable', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $usuario = $request->user();

        $subscription = PushSubscription::updateOrCreate(
            [
                'endpoint' => $dados['endpoint'],
            ],
            [
                'usuario_id' => $usuario->id,
                'keys_p256dh' => $dados['keys_p256dh'] ?? null,
                'keys_auth' => $dados['keys_auth'] ?? null,
                'device_name' => $dados['device_name'] ?? $request->header('User-Agent'),
            ]
        );

        AuditoriaService::registrar(
            evento: 'push_subscription_registrada',
            descricao: "Registrou celular/dispositivo para notificações push",
            usuario: $usuario,
            dados: ['device' => $subscription->device_name]
        );

        return response()->json([
            'mensagem' => 'Dispositivo registrado com sucesso para notificações!',
            'data' => $subscription,
        ]);
    }

    /**
     * Remove uma subscrição Push (quando o usuário desativa notificações).
     */
    public function remover(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'endpoint' => ['required', 'string'],
        ]);

        PushSubscription::where('endpoint', $dados['endpoint'])->delete();

        return response()->json([
            'mensagem' => 'Dispositivo desvinculado com sucesso.',
        ]);
    }

    /**
     * Retorna os lembretes de visitantes calculados especificamente para o usuário logado.
     */
    public function obterLembretes(Request $request): JsonResponse
    {
        $usuario = $request->user();
        $resumo = PushNotificationService::obterResumoLembretesParaUsuario($usuario);

        return response()->json($resumo);
    }
}
