<?php

namespace App\Http\Controllers;

use App\Models\TemplateMensagem;
use App\Services\AuditoriaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class TemplateMensagemController extends Controller
{
    /**
     * Lista os templates de mensagens cadastrados.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $this->garantirTabelaEColunas();

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

            if (Schema::hasColumn('templates_mensagens', 'ordem')) {
                $query->orderBy('ordem', 'asc');
            }

            $templates = $query->orderBy('id', 'asc')->get();

            return response()->json([
                'data' => $templates,
            ]);
        } catch (\Throwable $e) {
            Log::error('Erro ao listar templates de mensagens: ' . $e->getMessage());

            return response()->json([
                'mensagem' => 'Erro interno ao consultar templates de mensagens.',
                'erro' => config('app.debug') ? $e->getMessage() : null,
                'data' => [],
            ], 500);
        }
    }

    /**
     * Cadastra um novo template de mensagem (Apenas Admin).
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);
        $this->garantirTabelaEColunas();

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

        if (Schema::hasColumn('templates_mensagens', 'ordem')) {
            $dados['ordem'] = $dados['ordem'] ?? 0;
        } else {
            unset($dados['ordem']);
        }

        try {
            $template = TemplateMensagem::create($dados);

            try {
                AuditoriaService::registrar(
                    evento: 'template_criado',
                    descricao: "Criou o template de mensagem '{$template->titulo}' ({$template->momento})",
                    usuario: $request->user(),
                    dados: ['template_id' => $template->id, 'titulo' => $template->titulo]
                );
            } catch (\Throwable $eAuditoria) {
                Log::warning('Auditoria não registrada para template_criado: ' . $eAuditoria->getMessage());
            }

            return response()->json([
                'mensagem' => 'Template de mensagem criado com sucesso!',
                'data' => $template,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Erro ao cadastrar template de mensagem: ' . $e->getMessage());

            return response()->json([
                'mensagem' => 'Erro ao salvar template no banco de dados.',
                'erro' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
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
        $this->garantirTabelaEColunas();

        $dados = $request->validate([
            'titulo' => ['sometimes', 'required', 'string', 'max:255'],
            'momento' => ['sometimes', 'required', 'string', 'in:segunda,sexta,geral'],
            'tipo_acolhimento' => ['sometimes', 'required', 'string', 'in:familia,vertical,ambos'],
            'conteudo' => ['sometimes', 'required', 'string'],
            'descricao' => ['nullable', 'string', 'max:255'],
            'ativo' => ['nullable', 'boolean'],
            'ordem' => ['nullable', 'integer'],
        ]);

        if (!Schema::hasColumn('templates_mensagens', 'ordem')) {
            unset($dados['ordem']);
        }

        try {
            $templateMensagem->update($dados);

            try {
                AuditoriaService::registrar(
                    evento: 'template_atualizado',
                    descricao: "Atualizou o template de mensagem '{$templateMensagem->titulo}'",
                    usuario: $request->user(),
                    dados: ['template_id' => $templateMensagem->id, 'titulo' => $templateMensagem->titulo]
                );
            } catch (\Throwable $eAuditoria) {
                Log::warning('Auditoria não registrada para template_atualizado: ' . $eAuditoria->getMessage());
            }

            return response()->json([
                'mensagem' => 'Template de mensagem atualizado com sucesso!',
                'data' => $templateMensagem,
            ]);
        } catch (\Throwable $e) {
            Log::error('Erro ao atualizar template de mensagem: ' . $e->getMessage());

            return response()->json([
                'mensagem' => 'Erro ao atualizar template no banco de dados.',
                'erro' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Exclui um template de mensagem (Apenas Admin).
     */
    public function destroy(Request $request, TemplateMensagem $templateMensagem): JsonResponse
    {
        $this->authorizeAdmin($request);

        $titulo = $templateMensagem->titulo;
        $templateMensagem->delete();

        try {
            AuditoriaService::registrar(
                evento: 'template_excluido',
                descricao: "Excluiu o template de mensagem '{$titulo}'",
                usuario: $request->user()
            );
        } catch (\Throwable $eAuditoria) {}

        return response()->json([
            'mensagem' => 'Template excluído com sucesso!',
        ]);
    }

    /**
     * Auto-migração resiliente: verifica se a tabela e a coluna ordem existem, criando-as se necessário,
     * e populando com os templates padrão se a tabela estiver vazia.
     */
    private function garantirTabelaEColunas(): void
    {
        try {
            if (!Schema::hasTable('templates_mensagens')) {
                Schema::create('templates_mensagens', function (Blueprint $table) {
                    $table->id();
                    $table->string('titulo', 150);
                    $table->string('momento', 30);
                    $table->string('tipo_acolhimento', 30);
                    $table->string('variacao_resposta', 50)->nullable();
                    $table->text('conteudo');
                    $table->string('descricao', 255)->nullable();
                    $table->boolean('ativo')->default(true);
                    $table->integer('ordem')->default(0);
                    $table->timestamps();
                    $table->softDeletes();
                });
            } elseif (!Schema::hasColumn('templates_mensagens', 'ordem')) {
                Schema::table('templates_mensagens', function (Blueprint $table) {
                    $table->integer('ordem')->default(0);
                });
            }

            // Semeia os 5 templates padrão caso a tabela esteja vazia
            if (TemplateMensagem::count() === 0) {
                $this->semearTemplatesPadrao();
            }
        } catch (\Throwable $e) {
            Log::warning('Aviso em garantirTabelaEColunas: ' . $e->getMessage());
        }
    }

    private function semearTemplatesPadrao(): void
    {
        $templates = [
            [
                'titulo' => 'Boas-Vindas Padrão (Família)',
                'momento' => 'segunda',
                'tipo_acolhimento' => 'familia',
                'descricao' => 'Mensagem de pós-culto enviada na segunda-feira',
                'conteudo' => "Bom dia, {nome}, tudo bem?\nMeu nome é {responsavel}, sou da IBI Chapecó. Foi um prazer receber você e sua família neste domingo.\nDesejo que Deus abençoe muito a sua semana!",
                'ativo' => true,
                'ordem' => 1,
            ],
            [
                'titulo' => 'Boas-Vindas Padrão (Vertical)',
                'momento' => 'segunda',
                'tipo_acolhimento' => 'vertical',
                'descricao' => 'Mensagem jovem de pós-culto enviada na segunda-feira',
                'conteudo' => "Oie, {nome}, tudo bem? 😊 Meu nome é {responsavel}, sou da IBI Chapecó. Muito legal a tua presença com a gente no Culto Vertical!\nTenha uma semana abençoada!",
                'ativo' => true,
                'ordem' => 2,
            ],
            [
                'titulo' => 'Sexta - Visitante que interagiu na segunda',
                'momento' => 'sexta',
                'tipo_acolhimento' => 'familia',
                'descricao' => 'Para visitantes que responderam ao primeiro contato',
                'conteudo' => "Olá {nome}, tudo bem? Passando para te desejar um abençoado final de semana! Neste domingo teremos nosso culto na IBI Chapecó às 19h e seria uma alegria lhe receber novamente!",
                'ativo' => true,
                'ordem' => 3,
            ],
            [
                'titulo' => 'Sexta - Reaproximação suave (sem resposta)',
                'momento' => 'sexta',
                'tipo_acolhimento' => 'ambos',
                'descricao' => 'Para visitantes que não responderam na segunda',
                'conteudo' => "Olá {nome}, tudo bem? Domingo teremos nosso culto da família às 19Hrs, será muito bem vindo!",
                'ativo' => true,
                'ordem' => 4,
            ],
            [
                'titulo' => 'Sexta - Convite Culto Vertical (Jovens)',
                'momento' => 'sexta',
                'tipo_acolhimento' => 'vertical',
                'descricao' => 'Convite especial para o culto de jovens',
                'conteudo' => "Fala {nome}! Passando pra te convidar pro Culto Vertical neste final de semana na IBI Chapecó! A galera tá te esperando, bora colar junto?",
                'ativo' => true,
                'ordem' => 5,
            ],
        ];

        foreach ($templates as $t) {
            try {
                TemplateMensagem::create($t);
            } catch (\Throwable $e) {
                Log::warning('Não foi possível semear template padrão: ' . $e->getMessage());
            }
        }
    }

    private function authorizeAdmin(Request $request): void
    {
        if (! $request->user() || ! $request->user()->eAdmin()) {
            abort(403, 'Acesso não autorizado para esta funcionalidade.');
        }
    }
}
