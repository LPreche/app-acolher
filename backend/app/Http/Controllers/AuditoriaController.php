<?php

namespace App\Http\Controllers;

use App\Models\AuditoriaLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    /**
     * Lista os logs da Trilha de Auditoria (Restrito para Administrador).
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $query = AuditoriaLog::query()->with('usuario:id,nome,usuario,email');

        if ($request->filled('evento')) {
            $query->where('evento', $request->evento);
        }

        if ($request->filled('usuario_id')) {
            $query->where('usuario_id', $request->usuario_id);
        }

        if ($request->filled('busca')) {
            $busca = $request->busca;
            $query->where(function ($q) use ($busca) {
                $q->where('descricao', 'ilike', "%{$busca}%")
                  ->orWhere('usuario_nome', 'ilike', "%{$busca}%")
                  ->orWhere('ip_address', 'like', "%{$busca}%");
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($request->get('por_pagina', 50));

        return response()->json($logs);
    }
}
