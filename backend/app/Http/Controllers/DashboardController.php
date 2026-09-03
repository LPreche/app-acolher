<?php

namespace App\Http\Controllers;

use App\Enums\StatusContatoEnum;
use App\Enums\TipoAcolhimentoEnum;
use App\Http\Resources\VisitanteResource;
use App\Models\Usuario;
use App\Models\Visitante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Retorna métricas consolidadas para os painéis de controle.
     */
    public function metricas(Request $request): JsonResponse
    {
        $segmento = $request->get('tipo_acolhimento'); // 'familia', 'vertical' ou null (todos)

        $queryVisitantes = Visitante::query()->where('ativo', true);

        if ($segmento && $segmento !== 'todos') {
            $queryVisitantes->where('tipo_acolhimento', $segmento);
        }

        // 1. Agregação em UMA ÚNICA consulta SQL para evitar múltiplos round-trips de rede
        $agregados = (clone $queryVisitantes)
            ->selectRaw("
                COUNT(*) as total_visitantes,
                COUNT(*) FILTER (WHERE status = 'nao_contactado') as total_nao_contactados,
                COUNT(*) FILTER (WHERE status = 'contactado') as total_contactados
            ")
            ->first();

        // 2. Totais por segmento em uma única consulta agregada
        $totaisSegmentos = Visitante::where('ativo', true)
            ->selectRaw("
                COUNT(*) FILTER (WHERE tipo_acolhimento = 'familia') as total_familia,
                COUNT(*) FILTER (WHERE tipo_acolhimento = 'vertical') as total_vertical
            ")
            ->first();

        // 3. Visitantes prioritários não contactados (top 5 para o dashboard)
        $prioritariosNaoContactados = (clone $queryVisitantes)
            ->where('status', StatusContatoEnum::NAO_CONTACTADO->value)
            ->orderByRaw('COALESCE(data_ultimo_contato::date, data_visita) ASC')
            ->limit(5)
            ->with(['responsavel'])
            ->get();

        // Total de usuários se admin
        $totalUsuarios = $request->user()->eAdmin() ? Usuario::count() : null;

        return response()->json([
            'resumo' => [
                'total_visitantes' => (int) ($agregados->total_visitantes ?? 0),
                'total_nao_contactados' => (int) ($agregados->total_nao_contactados ?? 0),
                'total_contactados' => (int) ($agregados->total_contactados ?? 0),
                'total_familia' => (int) ($totaisSegmentos->total_familia ?? 0),
                'total_vertical' => (int) ($totaisSegmentos->total_vertical ?? 0),
                'total_usuarios' => $totalUsuarios,
            ],
            'prioritarios' => VisitanteResource::collection($prioritariosNaoContactados),
        ]);
    }
}
