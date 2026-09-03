<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'sistema' => 'Sistema Acolher API',
        'versao' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::get('/diagnostico', function () {
    $dbStatus = 'desconectado';
    $dbError = null;
    $totalTemplates = 0;
    $hasOrdemColumn = false;

    try {
        DB::connection()->getPdo();
        $dbStatus = 'conectado com sucesso ao PostgreSQL';

        if (\Illuminate\Support\Facades\Schema::hasTable('templates_mensagens')) {
            $hasOrdemColumn = \Illuminate\Support\Facades\Schema::hasColumn('templates_mensagens', 'ordem');
            $totalTemplates = \App\Models\TemplateMensagem::count();
        }
    } catch (\Throwable $e) {
        $dbError = $e->getMessage();
    }

    return response()->json([
        'status' => 'online',
        'app_env' => config('app.env'),
        'banco_dados' => [
            'status' => $dbStatus,
            'erro' => $dbError,
            'driver' => config('database.default'),
            'host' => config('database.connections.pgsql.host'),
            'database' => config('database.connections.pgsql.database'),
            'templates_mensagens' => [
                'tabela_existe' => \Illuminate\Support\Facades\Schema::hasTable('templates_mensagens'),
                'coluna_ordem' => $hasOrdemColumn,
                'total_registros' => $totalTemplates,
            ],
        ],
    ]);
});
