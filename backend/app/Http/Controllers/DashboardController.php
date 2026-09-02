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

        $totalVisitantes = (clone $queryVisitantes)->count();
        $totalNaoContactados = (clone $queryVisitantes)->where('status', StatusContatoEnum::NAO_CONTACTADO->value)->count();
        $totalContactados = (clone $queryVisitantes)->where('status', StatusContatoEnum::CONTACTADO->value)->count();

        // Totais por segmento
        $totalFamilia = Visitante::where('ativo', true)->where('tipo_acolhimento', TipoAcolhimentoEnum::FAMILIA->value)->count();
        $totalVertical = Visitante::where('ativo', true)->where('tipo_acolhimento', TipoAcolhimentoEnum::VERTICAL->value)->count();

        // Visitantes prioritários não contactados (top 5 para o dashboard)
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
                'total_visitantes' => $totalVisitantes,
                'total_nao_contactados' => $totalNaoContactados,
                'total_contactados' => $totalContactados,
                'total_familia' => $totalFamilia,
                'total_vertical' => $totalVertical,
                'total_usuarios' => $totalUsuarios,
            ],
            'prioritarios' => VisitanteResource::collection($prioritariosNaoContactados),
        ]);
    }
}
