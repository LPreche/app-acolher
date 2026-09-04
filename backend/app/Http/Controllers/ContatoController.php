<?php

namespace App\Http\Controllers;

use App\Enums\StatusContatoEnum;
use App\Enums\TipoAcolhimentoEnum;
use App\Enums\TipoMensagemEnum;
use App\Http\Requests\RegistrarContatoRequest;
use App\Http\Resources\VisitanteResource;
use App\Models\HistoricoContato;
use App\Models\TemplateMensagem;
use App\Models\Visitante;
use App\Services\AuditoriaService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class ContatoController extends Controller
{
    /**
     * Retorna todos os templates de mensagens disponíveis (Segunda, Sexta, Geral)
     * para que o usuário possa escolher a melhor opção com links prontos para o WhatsApp.
     */
    public function obterTemplates(Request $request, Visitante $visitante): JsonResponse
    {
        $usuario = $request->user();

        // Normalização de telefone para o formato internacional (55...)
        $telefoneLimpo = preg_replace('/[^\d]/', '', (string) $visitante->whatsapp);
        if (strlen($telefoneLimpo) === 10 || strlen($telefoneLimpo) === 11) {
            $telefoneLimpo = '55' . $telefoneLimpo;
        }

        $nomeVisitante = explode(' ', trim($visitante->nome))[0] ?? $visitante->nome;
        $nomeUsuario = $usuario ? $usuario->nome : ($visitante->responsavel?->nome ?? 'Equipe Acolher');

        $textoSegundaPadrao = $visitante->tipo_acolhimento === TipoAcolhimentoEnum::VERTICAL
            ? "Oie, {$nomeVisitante}, tudo bem? 😊 Meu nome é {$nomeUsuario}, sou da IBI Chapecó. Muito legal a tua presença no Culto Vertical!"
            : "Bom dia, {$nomeVisitante}, tudo bem?\nMeu nome é {$nomeUsuario}, sou da IBI Chapecó. Foi um prazer receber você e sua família neste domingo.\nDesejo que Deus abençoe a sua semana!";

        $textoSextaPadrao = "Olá {$nomeVisitante}, tudo bem? Passando para te desejar um abençoado final de semana! Neste domingo teremos nosso culto na IBI Chapecó e seria uma alegria imensa ter você conosco novamente. Posso te esperar?";

        try {
            // Busca estritamente apenas os templates específicos do tipo de acolhimento do visitante ou 'ambos'
            $tipoAcolhimentoStr = $visitante->tipo_acolhimento?->value ?? (is_string($visitante->tipo_acolhimento) ? $visitante->tipo_acolhimento : 'familia');

            $query = TemplateMensagem::where('ativo', true)
                ->where(function ($q) use ($tipoAcolhimentoStr) {
                    $q->where('tipo_acolhimento', $tipoAcolhimentoStr)
                      ->orWhere('tipo_acolhimento', 'ambos');
                });

            if (Schema::hasColumn('templates_mensagens', 'ordem')) {
                $query->orderBy('ordem', 'asc');
            }

            $todosTemplates = $query->orderBy('id', 'asc')->get();

            // Formata cada template com os dados do visitante
            $templatesFormatados = $todosTemplates->map(function ($template) use ($visitante, $usuario, $telefoneLimpo) {
                $texto = $template->formatarMensagem($visitante, $usuario);
                $tipoRotulo = match ($template->tipo_acolhimento) {
                    'vertical' => 'Vertical',
                    'familia' => 'Família',
                    default => 'Geral'
                };

                return [
                    'id' => $template->id,
                    'titulo' => $template->titulo,
                    'momento' => $template->momento,
                    'tipo_acolhimento' => $template->tipo_acolhimento,
                    'tipo_acolhimento_rotulo' => $tipoRotulo,
                    'descricao' => $template->descricao,
                    'texto' => $texto,
                    'link_whatsapp' => 'https://api.whatsapp.com/send?phone=' . $telefoneLimpo . '&text=' . urlencode($texto),
                ];
            });

            $segunda = $templatesFormatados->where('momento', 'segunda')->values();
            $sexta = $templatesFormatados->where('momento', 'sexta')->values();
            $geral = $templatesFormatados->where('momento', 'geral')->values();
        } catch (\Throwable $e) {
            Log::error('Erro ao processar templates no ContatoController: ' . $e->getMessage());
            $segunda = collect([]);
            $sexta = collect([]);
            $geral = collect([]);
        }

        return response()->json([
            'visitante' => [
                'id' => $visitante->id,
                'nome' => $visitante->nome,
                'whatsapp' => $visitante->whatsapp,
                'tipo_acolhimento' => $visitante->tipo_acolhimento?->value,
                'contato_segunda_enviado' => (bool) $visitante->contato_segunda_enviado,
                'data_contato_segunda' => $visitante->data_contato_segunda ? $visitante->data_contato_segunda->format('d/m/Y') : null,
                'contato_sexta_enviado' => (bool) $visitante->contato_sexta_enviado,
                'data_contato_sexta' => $visitante->data_contato_sexta ? $visitante->data_contato_sexta->format('d/m/Y') : null,
            ],
            'telefone_normalizado' => $telefoneLimpo,
            'templates_segunda' => $segunda,
            'templates_sexta' => $sexta,
            'templates_geral' => $geral,
            'fallback_segunda' => [
                'texto' => $textoSegundaPadrao,
                'link_whatsapp' => 'https://api.whatsapp.com/send?phone=' . $telefoneLimpo . '&text=' . urlencode($textoSegundaPadrao),
            ],
            'fallback_sexta' => [
                'texto' => $textoSextaPadrao,
                'link_whatsapp' => 'https://api.whatsapp.com/send?phone=' . $telefoneLimpo . '&text=' . urlencode($textoSextaPadrao),
            ],
        ]);
    }

    /**
     * Registra o disparo de contato (Segunda, Sexta ou Personalizada),
     * atualiza o status de etapa específica e o status global do visitante.
     */
    public function registrar(RegistrarContatoRequest $request, Visitante $visitante): JsonResponse
    {
        try {
            $this->garantirTabelaHistorico();

            $usuario = $request->user();
            $dados = $request->validated();
            $momento = $dados['momento'] ?? null;
            $tipoMensagem = $dados['tipo_mensagem'];

            $statusAnterior = $visitante->status?->value ?? 'nao_contactado';
            $statusNovo = StatusContatoEnum::CONTACTADO->value;

            // 1. Cria o registro no histórico de contatos compatível com qualquer variação de colunas
            $dadosHistorico = [
                'visitante_id' => $visitante->id,
                'usuario_id' => $usuario->id,
                'tipo_mensagem' => $tipoMensagem->value ?? $tipoMensagem,
                'mensagem' => $dados['mensagem'],
                'mensagem_enviada' => $dados['mensagem'],
                'status_anterior' => $statusAnterior,
                'status_novo' => $statusNovo,
                'tipo_contato' => 'whatsapp',
                'data_contato' => Carbon::now(),
            ];

            // Filtra dinamicamente para incluir somente colunas físicas existentes
            $dadosFiltrados = [];
            foreach ($dadosHistorico as $col => $val) {
                if (Schema::hasColumn('historico_contatos', $col)) {
                    $dadosFiltrados[$col] = $val;
                }
            }

            try {
                HistoricoContato::create($dadosFiltrados);
            } catch (\Throwable $eHist) {
                Log::warning('Aviso ao registrar histórico de contato: ' . $eHist->getMessage());
            }

            // 2. Atualiza a etapa específica de Segunda ou Sexta
            if ($momento === 'segunda' || $tipoMensagem === TipoMensagemEnum::SEGUNDA || in_array($tipoMensagem, [TipoMensagemEnum::PADRAO_FAMILIA, TipoMensagemEnum::PADRAO_VERTICAL])) {
                $visitante->contato_segunda_enviado = true;
                $visitante->data_contato_segunda = Carbon::now();
            }

            if ($momento === 'sexta' || $tipoMensagem === TipoMensagemEnum::SEXTA) {
                $visitante->contato_sexta_enviado = true;
                $visitante->data_contato_sexta = Carbon::now();
            }

            // 3. Atualiza o status geral para Contactado
            $visitante->status = StatusContatoEnum::CONTACTADO;
            $visitante->data_ultimo_contato = Carbon::now();
            $visitante->save();

            $visitante->load(['responsavel']);

            // Normalização do telefone para retorno do link
            $telefoneLimpo = preg_replace('/[^\d]/', '', (string) $visitante->whatsapp);
            if (strlen($telefoneLimpo) === 10 || strlen($telefoneLimpo) === 11) {
                $telefoneLimpo = '55' . $telefoneLimpo;
            }
            $linkWhatsApp = 'https://api.whatsapp.com/send?phone=' . $telefoneLimpo . '&text=' . urlencode($dados['mensagem']);

            try {
                AuditoriaService::registrar(
                    evento: 'contato_whatsapp_registrado',
                    descricao: "Registrou contato ({$momento}) com o visitante '{$visitante->nome}'",
                    usuario: $usuario,
                    dados: [
                        'visitante_id' => $visitante->id,
                        'momento' => $momento,
                        'tipo_mensagem' => $tipoMensagem->value ?? $tipoMensagem,
                    ],
                    request: $request
                );
            } catch (\Throwable $eAuditoria) {}

            return response()->json([
                'mensagem' => 'Contato registrado com sucesso!',
                'link_whatsapp' => $linkWhatsApp,
                'visitante' => new VisitanteResource($visitante),
            ]);
        } catch (\Throwable $e) {
            Log::error('Erro ao registrar contato: ' . $e->getMessage());

            return response()->json([
                'mensagem' => 'Erro ao registrar contato: ' . $e->getMessage(),
                'erro' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Auto-migração resiliente para tabela historico_contatos caso falte colunas
     */
    private function garantirTabelaHistorico(): void
    {
        try {
            if (Schema::hasTable('historico_contatos')) {
                if (!Schema::hasColumn('historico_contatos', 'tipo_mensagem')) {
                    Schema::table('historico_contatos', function (Blueprint $table) {
                        $table->string('tipo_mensagem', 30)->default('personalizada')->nullable();
                    });
                }
                if (!Schema::hasColumn('historico_contatos', 'mensagem')) {
                    Schema::table('historico_contatos', function (Blueprint $table) {
                        $table->text('mensagem')->nullable();
                    });
                }
                // Permitir nulo em status_anterior e status_novo se existirem na tabela legada
                try {
                    \Illuminate\Support\Facades\DB::statement('ALTER TABLE historico_contatos ALTER COLUMN status_anterior DROP NOT NULL;');
                    \Illuminate\Support\Facades\DB::statement('ALTER TABLE historico_contatos ALTER COLUMN status_novo DROP NOT NULL;');
                } catch (\Throwable $eAlter) {}
            }
        } catch (\Throwable $e) {
            Log::warning('Aviso em garantirTabelaHistorico: ' . $e->getMessage());
        }
    }
}
