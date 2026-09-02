<?php

namespace App\Http\Controllers;

use App\Models\TemplateMensagem;
use App\Services\AuditoriaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateMensagemController extends Controller
{
    /**
     * Lista os templates de mensagens cadastrados.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TemplateMensagem::query();

        if ($request->filled('momento')) {
            $query->where('momento', $request->momento);
        }

        if ($request->filled('tipo_acolhimento')) {
            $query->where(function ($q) use ($request) {
                $q->where('tipo_acolhimento', $request->tipo_acolhimento)
                  ->orWhere('tipo_acolhimento', 'ambos');
            });
        }

        if ($request->has('ativo')) {
            $query->where('ativo', filter_var($request->ativo, FILTER_VALIDATE_BOOLEAN));
        }

        $templates = $query->orderBy('ordem', 'asc')->orderBy('id', 'asc')->get();

        return response()->json([
            'data' => $templates,
        ]);
    }

    /**
     * Cadastra um novo template de mensagem (Apenas Admin).
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $dados = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'momento' => ['required', 'string', 'in:segunda,sexta,geral'],
            'tipo_acolhimento' => ['required', 'string', 'in:familia,vertical,ambos'],
            'conteudo' => ['required', 'string'],
            'descricao' => ['nullable', 'string', 'max:255'],
            'ativo' => ['nullable', 'boolean'],
            'ordem' => ['nullable', 'integer'],
        ]);

        $dados['ativo'] = $dados['ativo'] ?? true;
        $dados['ordem'] = $dados['ordem'] ?? 0;

        $template = TemplateMensagem::create($dados);

        AuditoriaService::registrar(
            evento: 'template_criado',
            descricao: "Criou o template de mensagem '{$template->titulo}' ({$template->momento})",
            usuario: $request->user(),
            dados: ['template_id' => $template->id, 'titulo' => $template->titulo]
        );

        return response()->json([
            'mensagem' => 'Template de mensagem criado com sucesso!',
            'data' => $template,
        ], 201);
    }

    /**
     * Exibe um template específico.
     */
    public function show(TemplateMensagem $templateMensagem): JsonResponse
    {
        return response()->json([
            'data' => $templateMensagem,
        ]);
    }

    /**
     * Atualiza um template de mensagem existente (Apenas Admin).
     */
    public function update(Request $request, TemplateMensagem $templateMensagem): JsonResponse
    {
        $this->authorizeAdmin($request);

        $dados = $request->validate([
            'titulo' => ['sometimes', 'required', 'string', 'max:255'],
            'momento' => ['sometimes', 'required', 'string', 'in:segunda,sexta,geral'],
            'tipo_acolhimento' => ['sometimes', 'required', 'string', 'in:familia,vertical,ambos'],
            'conteudo' => ['sometimes', 'required', 'string'],
            'descricao' => ['nullable', 'string', 'max:255'],
            'ativo' => ['nullable', 'boolean'],
            'ordem' => ['nullable', 'integer'],
        ]);

        $templateMensagem->update($dados);

        AuditoriaService::registrar(
            evento: 'template_atualizado',
            descricao: "Atualizou o template de mensagem '{$templateMensagem->titulo}'",
            usuario: $request->user(),
            dados: ['template_id' => $templateMensagem->id, 'titulo' => $templateMensagem->titulo]
        );

        return response()->json([
            'mensagem' => 'Template de mensagem atualizado com sucesso!',
            'data' => $templateMensagem,
        ]);
    }

    /**
     * Exclui ou inativa um template de mensagem (Apenas Admin).
     */
    public function destroy(Request $request, TemplateMensagem $templateMensagem): JsonResponse
    {
        $this->authorizeAdmin($request);

        $titulo = $templateMensagem->titulo;
        $templateMensagem->delete();

        AuditoriaService::registrar(
            evento: 'template_excluido',
            descricao: "Excluiu o template de mensagem '{$titulo}'",
            usuario: $request->user()
        );

        return response()->json([
            'mensagem' => 'Template excluído com sucesso!',
        ]);
    }

    private function authorizeAdmin(Request $request): void
    {
        if (! $request->user() || ! $request->user()->eAdmin()) {
            abort(403, 'Acesso não autorizado para esta funcionalidade.');
        }
    }
}
