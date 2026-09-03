<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContatoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\TemplateMensagemController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\VisitanteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Sistema Acolher
|--------------------------------------------------------------------------
*/

// Rotas públicas
Route::get('/login', function () {
    return response()->json([
        'status' => 'info',
        'mensagem' => 'Este é o endpoint de autenticação da API. Para fazer login, envie uma requisição POST com usuario e password.',
    ]);
});
Route::post('/login', [AuthController::class, 'login']);

// Rotas autenticadas via Laravel Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // Sessão e Usuário Atual
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Métricas do Dashboard
    Route::get('/dashboard/metricas', [DashboardController::class, 'metricas']);

    // Gestão de Visitantes
    Route::get('/visitantes', [VisitanteController::class, 'index']);
    Route::post('/visitantes', [VisitanteController::class, 'store']);
    Route::get('/visitantes/{visitante}', [VisitanteController::class, 'show']);
    Route::put('/visitantes/{visitante}', [VisitanteController::class, 'update']);
    Route::delete('/visitantes/{visitante}', [VisitanteController::class, 'destroy']);
    Route::patch('/visitantes/{visitante}/alternar-status', [VisitanteController::class, 'alternarStatus']);
    Route::patch('/visitantes/{visitante}/ativar', [VisitanteController::class, 'ativar']);

    // Fluxo de Contato WhatsApp
    Route::get('/visitantes/{visitante}/templates-contato', [ContatoController::class, 'obterTemplates']);
    Route::post('/visitantes/{visitante}/registrar-contato', [ContatoController::class, 'registrar']);

    // Gestão de Templates de Mensagens (Segunda / Sexta / Geral)
    Route::get('/templates-mensagens', [TemplateMensagemController::class, 'index']);
    Route::post('/templates-mensagens', [TemplateMensagemController::class, 'store']);
    Route::get('/templates-mensagens/{templateMensagem}', [TemplateMensagemController::class, 'show']);
    Route::put('/templates-mensagens/{templateMensagem}', [TemplateMensagemController::class, 'update']);
    Route::delete('/templates-mensagens/{templateMensagem}', [TemplateMensagemController::class, 'destroy']);

    // Notificações Push por Dispositivo e Lembretes Direcionados
    Route::post('/push-subscriptions', [PushSubscriptionController::class, 'salvar']);
    Route::delete('/push-subscriptions', [PushSubscriptionController::class, 'remover']);
    Route::get('/push/lembretes-usuario', [PushSubscriptionController::class, 'obterLembretes']);

    // Gestão de Usuários (Administrador)
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::get('/usuarios/{usuario}', [UsuarioController::class, 'show']);
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update']);
    Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy']);

    // Trilha de Auditoria (Administrador)
    Route::get('/auditoria', [\App\Http\Controllers\AuditoriaController::class, 'index']);
});
