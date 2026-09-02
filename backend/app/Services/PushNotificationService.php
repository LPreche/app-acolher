<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\Usuario;
use App\Models\Visitante;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    /**
     * Calcula os lembretes de visitantes pendentes direcionados para um usuário específico.
     */
    public static function obterResumoLembretesParaUsuario(Usuario $usuario): array
    {
        $hoje = Carbon::now();
        $diaSemana = $hoje->dayOfWeekIso; // 1 = Segunda, 5 = Sexta

        $queryVisitantes = Visitante::query()->where('ativo', true);

        // Se não for admin geral, filtra estritamente os visitantes atribuídos a este usuário
        if (! $usuario->eAdmin()) {
            $queryVisitantes->where('usuario_responsavel_id', $usuario->id);
        }

        $visitantes = $queryVisitantes->get();

        $pendentesSegunda = $visitantes->filter(fn ($v) => ! $v->contato_segunda_enviado);
        $pendentesSexta = $visitantes->filter(fn ($v) => ! $v->contato_sexta_enviado);

        $temLembreteHoje = false;
        $titulo = '';
        $corpo = '';
        $quantidade = 0;

        if ($diaSemana === 1 && $pendentesSegunda->count() > 0) {
            $temLembreteHoje = true;
            $quantidade = $pendentesSegunda->count();
            $titulo = '📅 Lembrete de Segunda - Sistema Acolher';
            $corpo = $usuario->eAdmin()
                ? "Existem {$quantidade} visitante(s) aguardando mensagem de boas-vindas hoje!"
                : "Você tem {$quantidade} visitante(s) sob sua responsabilidade para acolher hoje!";
        } elseif ($diaSemana === 5 && $pendentesSexta->count() > 0) {
            $temLembreteHoje = true;
            $quantidade = $pendentesSexta->count();
            $titulo = '✨ Lembrete de Sexta - Sistema Acolher';
            $corpo = $usuario->eAdmin()
                ? "Existem {$quantidade} visitante(s) para convidar para os cultos deste final de semana!"
                : "Você tem {$quantidade} visitante(s) sob sua responsabilidade para convidar para o culto!";
        }

        return [
            'dia_semana' => $diaSemana,
            'dia_nome' => $diaSemana === 1 ? 'Segunda-feira' : ($diaSemana === 5 ? 'Sexta-feira' : 'Outro'),
            'tem_lembrete_hoje' => $temLembreteHoje,
            'pendentes_segunda_count' => $pendentesSegunda->count(),
            'pendentes_sexta_count' => $pendentesSexta->count(),
            'notificacao' => $temLembreteHoje ? [
                'titulo' => $titulo,
                'corpo' => $corpo,
                'quantidade' => $quantidade,
                'url' => '/painel/' . ($usuario->perfil?->value === 'acolher_vertical' ? 'vertical' : 'familia'),
            ] : null,
        ];
    }
}
