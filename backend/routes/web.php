<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'sistema' => 'Sistema Acolher API',
        'versao' => '1.0.0',
    ]);
});
