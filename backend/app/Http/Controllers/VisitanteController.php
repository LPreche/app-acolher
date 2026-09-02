<?php

namespace App\Http\Controllers;

use App\Enums\StatusContatoEnum;
use App\Enums\TipoAcolhimentoEnum;
use App\Http\Requests\SalvarVisitanteRequest;
use App\Http\Resources\VisitanteResource;
use App\Models\Visitante;
use App\Services\AuditoriaService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VisitanteController extends Controller
{
    /**
     * Lista todos os visitantes ativos com filtros e paginação/ordenação.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Visitante::query()->with(['responsavel', 'historicoContatos.usuario']);

        // Filtro por status de atividade (padrão: ativos)
        if ($request->has('ativo')) {
            $query->where('ativo', filter_var($request->ativo, FILTER_VALIDATE_BOOLEAN));
        } else {
            $query->where('ativo', true);
        }

        // Filtro por tipo de acolhimento (família / vertical)
        if ($request->filled('tipo_acolhimento')) {
            $query->where('tipo_acolhimento', $request->tipo_acolhimento);
        }

        // Filtro por status de contato (não contactado / contactado)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por mês/ano (ex: 2026-08)
        if ($request->filled('mes_ano')) {
            $query->where('mes_ano', $request->mes_ano);
        }

        // Busca textual por nome ou whatsapp
        if ($request->filled('busca')) {
            $busca = $request->busca;
            $query->where(function ($q) use ($busca) {
                $q->where('nome', 'ilike', "%{$busca}%")
                  ->orWhere('whatsapp', 'like', "%{$busca}%");
            });
        }

        // Ordenação prioritária
        $ordem = $request->get('ordem', 'prioridade');

        if ($ordem === 'prioridade') {
            $query->orderByRaw("CASE WHEN status = 'nao_contactado' THEN 0 ELSE 1 END ASC")
                  ->orderByRaw('COALESCE(data_ultimo_contato::date, data_visita) ASC')
                  ->orderBy('data_visita', 'desc');
        } elseif ($ordem === 'mais_recentes') {
            $query->orderBy('data_visita', 'desc')->orderBy('id', 'desc');
        } elseif ($ordem === 'dias_sem_contato_desc') {
            $query->orderByRaw('COALESCE(data_ultimo_contato::date, data_visita) ASC');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $visitantes = $query->get();

        return VisitanteResource::collection($visitantes);
    }

    /**
     * Cadastra um novo visitante.
     */
    public function store(SalvarVisitanteRequest $request): JsonResponse
    {
        $dados = $request->validated();
        $dados['data_visita'] = $dados['data_visita'] ?? Carbon::now()->format('Y-m-d');
        $dados['status'] = $dados['status'] ?? StatusContatoEnum::NAO_CONTACTADO->value;
        $dados['usuario_responsavel_id'] = $dados['usuario_responsavel_id'] ?? $request->user()->id;
        $dados['ativo'] = $dados['ativo'] ?? true;

        $visitante = Visitante::create($dados);
        $visitante->load(['responsavel', 'historicoContatos']);

        AuditoriaService::registrar(
            evento: 'visitante_criado',
            descricao: "Cadastrou o visitante '{$visitante->nome}' ({$visitante->tipo_acolhimento?->value})",
            usuario: $request->user(),
            dados: [
                'visitante_id' => $visitante->id,
                'nome' => $visitante->nome,
                'tipo_acolhimento' => $visitante->tipo_acolhimento?->value,
            ],
            request: $request
        );

        return response()->json([
            'mensagem' => 'Visitante cadastrado com sucesso!',
            'visitante' => new VisitanteResource($visitante),
        ], 201);
    }

    /**
     * Exibe os detalhes de um visitante.
     */
    public function show(Visitante $visitante): JsonResponse
    {
        $visitante->load(['responsavel', 'historicoContatos.usuario']);

        return response()->json([
            'visitante' => new VisitanteResource($visitante),
        ]);
    }

    /**
     * Atualiza os dados de um visitante.
     */
    public function update(SalvarVisitanteRequest $request, Visitante $visitante): JsonResponse
    {
        $dados = $request->validated();
        $visitante->update($dados);
        $visitante->load(['responsavel', 'historicoContatos.usuario']);

        AuditoriaService::registrar(
            evento: 'visitante_atualizado',
            descricao: "Atualizou dados do visitante '{$visitante->nome}'",
            usuario: $request->user(),
            dados: ['visitante_id' => $visitante->id],
            request: $request
        );

        return response()->json([
            'mensagem' => 'Dados do visitante atualizados com sucesso!',
            'visitante' => new VisitanteResource($visitante),
        ]);
    }

    /**
     * Inativação lógica / exclusão de visitante.
     */
    public function destroy(Visitante $visitante): JsonResponse
    {
        $visitante->ativo = false;
        $visitante->save();

        AuditoriaService::registrar(
            evento: 'visitante_inativado',
            descricao: "Inativou o registro do visitante '{$visitante->nome}'",
            usuario: request()->user(),
            dados: ['visitante_id' => $visitante->id]
        );

        return response()->json([
            'mensagem' => 'Visitante inativado com sucesso.',
        ]);
    }

    /**
     * Alterna o status de contato (Não Contactado <-> Contactado).
     */
    public function alternarStatus(Visitante $visitante): JsonResponse
    {
        if ($visitante->status === StatusContatoEnum::NAO_CONTACTADO) {
            $visitante->status = StatusContatoEnum::CONTACTADO;
            $visitante->data_ultimo_contato = Carbon::now();
        } else {
            $visitante->status = StatusContatoEnum::NAO_CONTACTADO;
        }

        $visitante->save();
        $visitante->load(['responsavel', 'historicoContatos.usuario']);

        AuditoriaService::registrar(
            evento: 'status_alterado',
            descricao: "Alterou o status de '{$visitante->nome}' para '{$visitante->status?->value}'",
            usuario: request()->user(),
            dados: [
                'visitante_id' => $visitante->id,
                'novo_status' => $visitante->status?->value,
            ]
        );

        return response()->json([
            'mensagem' => 'Status do visitante atualizado com sucesso!',
            'visitante' => new VisitanteResource($visitante),
        ]);
    }

    /**
     * Restaura um visitante inativado.
     */
    public function ativar(Visitante $visitante): JsonResponse
    {
        $visitante->ativo = true;
        $visitante->save();

        AuditoriaService::registrar(
            evento: 'visitante_reativado',
            descricao: "Reativou o visitante '{$visitante->nome}'",
            usuario: request()->user(),
            dados: ['visitante_id' => $visitante->id]
        );

        return response()->json([
            'mensagem' => 'Visitante reativado com sucesso!',
            'visitante' => new VisitanteResource($visitante),
        ]);
    }
}
