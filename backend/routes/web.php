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
    $tempoConexaoMs = null;
    $tempoPingQueryMs = null;
    $tempoSelectVisitantesMs = null;

    $inicioTotal = microtime(true);

    try {
        $t0 = microtime(true);
        $pdo = DB::connection()->getPdo();
        $tempoConexaoMs = round((microtime(true) - $t0) * 1000, 2);
        $dbStatus = 'conectado com sucesso ao PostgreSQL';

        // Ping simples (1 ida e volta de rede Render <-> Neon)
        $t1 = microtime(true);
        DB::select('SELECT 1');
        $tempoPingQueryMs = round((microtime(true) - $t1) * 1000, 2);

        // Consulta simples de visitantes
        $t2 = microtime(true);
        $totalVisitantes = DB::table('visitantes')->count();
        $tempoSelectVisitantesMs = round((microtime(true) - $t2) * 1000, 2);

        if (\Illuminate\Support\Facades\Schema::hasTable('templates_mensagens')) {
            $hasOrdemColumn = \Illuminate\Support\Facades\Schema::hasColumn('templates_mensagens', 'ordem');
            $totalTemplates = \App\Models\TemplateMensagem::count();
        }
    } catch (\Throwable $e) {
        $dbError = $e->getMessage();
    }

    $tempoTotalMs = round((microtime(true) - $inicioTotal) * 1000, 2);

    return response()->json([
        'status' => 'online',
        'app_env' => config('app.env'),
        'telemetria_desempenho' => [
            'tempo_conexao_db_ms' => $tempoConexaoMs,
            'tempo_ping_rede_db_ms' => $tempoPingQueryMs,
            'tempo_count_visitantes_ms' => $tempoSelectVisitantesMs,
            'tempo_total_execucao_php_ms' => $tempoTotalMs,
        ],
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
