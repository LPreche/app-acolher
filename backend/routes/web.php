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

    try {
        DB::connection()->getPdo();
        $dbStatus = 'conectado com sucesso ao PostgreSQL';
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
        ],
    ]);
});
