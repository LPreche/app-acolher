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

class ContatoController extends Controller
{
    /**
     * Retorna os templates de mensagens organizados por momento (Segunda, Sexta, Geral)
     * com links prontos para o WhatsApp do visitante.
     */
    public function obterTemplates(Request $request, Visitante $visitante): JsonResponse
    {
        $usuario = $request->user();

        // Normalização de telefone para o formato internacional (55...)
        $telefoneLimpo = preg_replace('/[^\d]/', '', $visitante->whatsapp);
        if (strlen($telefoneLimpo) === 10 || strlen($telefoneLimpo) === 11) {
            $telefoneLimpo = '55' . $telefoneLimpo;
        }

        // Busca templates ativos no banco para o tipo de acolhimento do visitante ou 'ambos'
        $tipoAcolhimentoStr = $visitante->tipo_acolhimento?->value ?? 'familia';
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
            return [
                'id' => $template->id,
                'titulo' => $template->titulo,
                'momento' => $template->momento,
                'tipo_acolhimento' => $template->tipo_acolhimento,
                'descricao' => $template->descricao,
                'texto' => $texto,
                'link_whatsapp' => 'https://api.whatsapp.com/send?phone=' . $telefoneLimpo . '&text=' . urlencode($texto),
            ];
        });

        // Templates fallback caso o banco não tenha templates cadastrados
        $nomeVisitante = $visitante->nome;
        $nomeUsuario = $usuario ? $usuario->nome : 'Equipe Acolher';

        $textoSegundaPadrao = $visitante->tipo_acolhimento === TipoAcolhimentoEnum::VERTICAL
            ? "Oie, {$nomeVisitante}, tudo bem? 😊 Meu nome é {$nomeUsuario}, sou da IBI Chapecó. Muito legal a tua presença no Culto Vertical!"
            : "Bom dia, {$nomeVisitante}, tudo bem?\nMeu nome é {$nomeUsuario}, sou da IBI Chapecó. Foi um prazer receber você e sua família neste domingo.\nDesejo que Deus abençoe a sua semana!";

        $textoSextaPadrao = "Olá {$nomeVisitante}, tudo bem? Passando para te desejar um abençoado final de semana! Neste domingo teremos nosso culto na IBI Chapecó e seria uma alegria imensa ter você conosco novamente. Posso te esperar?";

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
            'templates_segunda' => $templatesFormatados->where('momento', 'segunda')->values(),
            'templates_sexta' => $templatesFormatados->where('momento', 'sexta')->values(),
            'templates_geral' => $templatesFormatados->where('momento', 'geral')->values(),
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
        $usuario = $request->user();
        $dados = $request->validated();
        $momento = $dados['momento'] ?? null;
        $tipoMensagem = $dados['tipo_mensagem'];

        // 1. Cria o registro no histórico de contatos
        $historico = HistoricoContato::create([
            'visitante_id' => $visitante->id,
            'usuario_id' => $usuario->id,
            'tipo_mensagem' => $tipoMensagem->value ?? $tipoMensagem,
            'mensagem' => $dados['mensagem'],
        ]);

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

        $visitante->load(['responsavel', 'historicoContatos.usuario']);

        // Normalização do telefone para retorno do link
        $telefoneLimpo = preg_replace('/[^\d]/', '', $visitante->whatsapp);
        if (strlen($telefoneLimpo) === 10 || strlen($telefoneLimpo) === 11) {
            $telefoneLimpo = '55' . $telefoneLimpo;
        }
        $linkWhatsApp = 'https://api.whatsapp.com/send?phone=' . $telefoneLimpo . '&text=' . urlencode($dados['mensagem']);

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

        return response()->json([
            'mensagem' => 'Contato registrado com sucesso!',
            'link_whatsapp' => $linkWhatsApp,
            'visitante' => new VisitanteResource($visitante),
        ]);
    }
}
