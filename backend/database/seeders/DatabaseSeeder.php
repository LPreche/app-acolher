<?php

namespace Database\Seeders;

use App\Enums\PerfilUsuarioEnum;
use App\Enums\StatusContatoEnum;
use App\Enums\TipoAcolhimentoEnum;
use App\Models\HistoricoContato;
use App\Models\Usuario;
use App\Models\Visitante;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Criar Administrador Geral (Luiz Paulo Reche)
        $adminLuiz = Usuario::create([
            'nome' => 'Luiz Paulo Reche',
            'usuario' => 'luiz.reche',
            'email' => 'luiz.reche@acolher.org',
            'password' => '@colher2026#', // Laravel 'hashed' cast fará o hash
            'perfil' => PerfilUsuarioEnum::ADMINISTRADOR,
            'whatsapp' => '(49) 99920-0335',
            'ativo' => true,
        ]);

        // Usuários de Apoio / Operadores
        $usuarioFamilia = Usuario::create([
            'nome' => 'Marcos Silva',
            'usuario' => 'marcos.silva',
            'email' => 'marcos.silva@acolher.org',
            'password' => '@colher2026#',
            'perfil' => PerfilUsuarioEnum::ACOLHER_FAMILIA,
            'whatsapp' => '(49) 99999-0002',
            'ativo' => true,
        ]);

        $usuarioVertical = Usuario::create([
            'nome' => 'Camila Santos',
            'usuario' => 'camila.santos',
            'email' => 'camila.santos@acolher.org',
            'password' => '@colher2026#',
            'perfil' => PerfilUsuarioEnum::ACOLHER_VERTICAL,
            'whatsapp' => '(49) 99999-0003',
            'ativo' => true,
        ]);

        $usuarioKeila = Usuario::create([
            'nome' => 'Keila Voluntária',
            'usuario' => 'keila.voluntaria',
            'email' => 'keila@acolher.org',
            'password' => '@colher2026#',
            'perfil' => PerfilUsuarioEnum::AMBOS,
            'whatsapp' => '(49) 99999-0004',
            'ativo' => true,
        ]);

        // 2. Dados reais da tabela oficial da igreja
        $visitantesDados = [
            ['data' => '2026-01-03', 'nome' => 'Elenice', 'whatsapp' => '(21) 96613-0060', 'como' => '', 'status' => 'nao_contactado', 'resp' => 'Douglas S.', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-01-03', 'nome' => 'Mariano', 'whatsapp' => '(49) 99970-4792', 'como' => '', 'status' => 'nao_contactado', 'resp' => 'Ana Paula', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-01-03', 'nome' => 'Emilly', 'whatsapp' => '(21) 96642-7729', 'como' => '', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-01-03', 'nome' => 'Fabiane', 'whatsapp' => '(49) 99904-3444', 'como' => 'Instagram', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-01-03', 'nome' => 'Adrieli', 'whatsapp' => '(21) 97565-2380', 'como' => '', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-01-03', 'nome' => 'Felipe Lazzarotti', 'whatsapp' => '(49) 99990-2347', 'como' => '', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-01-03', 'nome' => 'Renato Lazzarotti', 'whatsapp' => '(49) 99981-2615', 'como' => '', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-01-03', 'nome' => 'Denise lazzarotti', 'whatsapp' => '(49) 99975-8045', 'como' => '', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-01-03', 'nome' => 'Daniela', 'whatsapp' => '(49) 99808-1014', 'como' => 'Convite Maikon', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-01-03', 'nome' => 'Ortencia', 'whatsapp' => '(49) 98803-3979', 'como' => 'Convite mãe do Maikon', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-01-03', 'nome' => 'Lurdes', 'whatsapp' => '(49) 98555-3330', 'como' => 'Mae Gabriel', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-01-18', 'nome' => 'Fabio Souza', 'whatsapp' => '(49) 99914-1667', 'como' => 'Vim com a família', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-01-18', 'nome' => 'Guilherme Stobe', 'whatsapp' => '(49) 99803-0198', 'como' => 'Luciane Stobe e Valdecir', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-01-18', 'nome' => 'Kauan Antunes', 'whatsapp' => '(49) 99157-1240', 'como' => 'Passei na frente', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-01-18', 'nome' => 'Bruna de Amorin', 'whatsapp' => '(49) 99132-3232', 'como' => 'Passou na frente', 'status' => 'contactado', 'resp' => 'Keila', 'acao' => 'Enviar mensagem', 'contato' => '2026-01-19', 'obs' => 'Contato 19/01', 'tipo' => 'familia'],
            ['data' => '2026-02-08', 'nome' => 'Francisco Coxoeiro', 'whatsapp' => '(49) 98906-9824', 'como' => 'Sou ligado a Batista', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-02-08', 'nome' => 'Mayza Isadora', 'whatsapp' => '(49) 99908-1586', 'como' => 'Luciane Stobe', 'status' => 'contactado', 'resp' => 'Keila', 'acao' => 'Enviar mensagem', 'contato' => '2026-02-23', 'obs' => 'Contato 13/02', 'tipo' => 'vertical'],
            ['data' => '2026-02-08', 'nome' => 'Eliane Santos', 'whatsapp' => '(48) 99685-8091', 'como' => '', 'status' => 'contactado', 'resp' => 'Keila', 'acao' => 'Enviar mensagem', 'contato' => '2026-02-13', 'obs' => 'Contato 13/02', 'tipo' => 'familia'],
            ['data' => '2026-03-08', 'nome' => 'Maria Eduarda', 'whatsapp' => '(11) 94598-6654', 'como' => 'Passamos na frente da Igreja', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-03-08', 'nome' => 'Gabriel da Maria Eduarda', 'whatsapp' => '(11) 95935-5198', 'como' => 'Passamos na frente da Igreja', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-03-15', 'nome' => 'Luan Correia', 'whatsapp' => '(49) 99830-5347', 'como' => 'Convite namorada e Sogro', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-03-15', 'nome' => 'Jhonder Aguivra', 'whatsapp' => '(95) 99129-9513', 'como' => 'Com meus Vizinhos', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-15', 'nome' => 'Maria Julia de Lima', 'whatsapp' => '(49) 99992-4350', 'como' => 'Instagram', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-03-15', 'nome' => 'Sergio Gilvania', 'whatsapp' => '(49) 98423-8580', 'como' => 'Procurando a presença de Deus', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-22', 'nome' => 'Flavio Mello', 'whatsapp' => '(49) 98875-4483', 'como' => 'Convite Lucas', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-22', 'nome' => 'Rodrigo e Ana Paula', 'whatsapp' => '(49) 98404-6952', 'como' => 'Claudia', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-22', 'nome' => 'Maria Estela da Silva', 'whatsapp' => '(45) 99914-3924', 'como' => 'Google', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-29', 'nome' => 'Michelle', 'whatsapp' => '(22) 99765-8089', 'como' => 'Através da filha', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-29', 'nome' => 'Márcio Chaves', 'whatsapp' => '(22) 99975-0948', 'como' => 'Através da filha', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-29', 'nome' => 'Rogério Ramos', 'whatsapp' => '(49) 98891-4498', 'como' => 'Amiga da esposa', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-29', 'nome' => 'Carolay de Oliveira', 'whatsapp' => '(49) 99820-8294', 'como' => 'Convite', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-03-29', 'nome' => 'Cecilia Madeski', 'whatsapp' => '(49) 98848-3778', 'como' => '', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-29', 'nome' => 'Yora', 'whatsapp' => '(49) 98419-8453', 'como' => 'Batismo Kaue', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-03-29', 'nome' => 'Maridiane Picolli', 'whatsapp' => '(49) 99199-4646', 'como' => 'Henry Rosa da Silva', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-29', 'nome' => 'Milly Moura', 'whatsapp' => '(49) 98419-8453', 'como' => 'Batismo Kaue', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'vertical'],
            ['data' => '2026-03-29', 'nome' => 'Marisa Oliveira', 'whatsapp' => '(49) 99991-9374', 'como' => 'Cheguei cansada mas aqui me alegrei', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
            ['data' => '2026-03-29', 'nome' => 'Marcio Ribeiro', 'whatsapp' => '(49) 99919-1957', 'como' => 'Minha filha e meu Genro me convidaram', 'status' => 'nao_contactado', 'resp' => 'A definir', 'acao' => 'Enviar mensagem', 'contato' => null, 'obs' => '', 'tipo' => 'familia'],
        ];

        foreach ($visitantesDados as $vd) {
            $tipoEnum = $vd['tipo'] === 'vertical' ? TipoAcolhimentoEnum::VERTICAL : TipoAcolhimentoEnum::FAMILIA;
            $statusEnum = $vd['status'] === 'contactado' ? StatusContatoEnum::CONTACTADO : StatusContatoEnum::NAO_CONTACTADO;

            $v = Visitante::create([
                'nome' => $vd['nome'],
                'whatsapp' => $vd['whatsapp'],
                'como_chegou' => $vd['como'] ?: 'Não informado',
                'tipo_acolhimento' => $tipoEnum,
                'status' => $statusEnum,
                'usuario_responsavel_id' => $adminLuiz->id,
                'data_visita' => $vd['data'],
                'data_ultimo_contato' => $vd['contato'],
                'proxima_acao' => $vd['acao'] ?: 'Enviar mensagem',
                'observacoes' => $vd['obs'] ?: null,
                'ativo' => true,
            ]);

            if ($statusEnum === StatusContatoEnum::CONTACTADO && $vd['contato']) {
                HistoricoContato::create([
                    'visitante_id' => $v->id,
                    'usuario_id' => $adminLuiz->id,
                    'tipo_mensagem' => 'personalizada',
                    'mensagem' => $vd['obs'] ?: 'Contato inicial realizado',
                    'created_at' => Carbon::parse($vd['contato']),
                ]);
            }
        }

        // 3. Cadastrar Templates de Mensagens Iniciais (Segunda e Sexta)
        \App\Models\TemplateMensagem::create([
            'titulo' => 'Boas-Vindas Padrão (Família)',
            'momento' => 'segunda',
            'tipo_acolhimento' => 'familia',
            'descricao' => 'Mensagem de pós-culto enviada na segunda-feira',
            'conteudo' => "Bom dia, {nome}, tudo bem?\nMeu nome é {responsavel}, sou da IBI Chapecó. Foi um prazer receber você e sua família neste domingo.\nDesejo que Deus abençoe muito a sua semana!",
            'ativo' => true,
            'ordem' => 1,
        ]);

        \App\Models\TemplateMensagem::create([
            'titulo' => 'Boas-Vindas Padrão (Vertical)',
            'momento' => 'segunda',
            'tipo_acolhimento' => 'vertical',
            'descricao' => 'Mensagem jovem de pós-culto enviada na segunda-feira',
            'conteudo' => "Oie, {nome}, tudo bem? 😊 Meu nome é {responsavel}, sou da IBI Chapecó. Muito legal a tua presença com a gente no Culto Vertical!\nTenha uma semana abençoada!",
            'ativo' => true,
            'ordem' => 2,
        ]);

        \App\Models\TemplateMensagem::create([
            'titulo' => 'Sexta - Visitante que interagiu na segunda',
            'momento' => 'sexta',
            'tipo_acolhimento' => 'ambos',
            'descricao' => 'Para visitantes que responderam ao primeiro contato',
            'conteudo' => "Olá {nome}, tudo bem? Passando para te desejar um abençoado final de semana! Neste domingo teremos nosso culto na IBI Chapecó às 19h e seria uma alegria imensa ter você conosco novamente. Posso te esperar?",
            'ativo' => true,
            'ordem' => 3,
        ]);

        \App\Models\TemplateMensagem::create([
            'titulo' => 'Sexta - Reaproximação suave (sem resposta)',
            'momento' => 'sexta',
            'tipo_acolhimento' => 'ambos',
            'descricao' => 'Para visitantes que não responderam na segunda',
            'conteudo' => "Olá {nome}, tudo bem? Sei que a rotina da semana é corrida, mas passei para lembrar que neste domingo teremos um culto muito especial na IBI Chapecó. Você é nosso convidado de honra!",
            'ativo' => true,
            'ordem' => 4,
        ]);

        \App\Models\TemplateMensagem::create([
            'titulo' => 'Sexta - Convite Culto Vertical (Jovens)',
            'momento' => 'sexta',
            'tipo_acolhimento' => 'vertical',
            'descricao' => 'Convite especial para o culto de jovens',
            'conteudo' => "Fala {nome}! Passando pra te convidar pro Culto Vertical neste final de semana na IBI Chapecó! A galera tá te esperando, bora colar junto?",
            'ativo' => true,
            'ordem' => 5,
        ]);
    }
}
