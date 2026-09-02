<?php

namespace Tests\Feature;

use App\Enums\PerfilUsuarioEnum;
use App\Enums\StatusContatoEnum;
use App\Enums\TipoAcolhimentoEnum;
use App\Models\Usuario;
use App\Models\Visitante;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AcolherApiTest extends TestCase
{
    use DatabaseTransactions;

    protected Usuario $admin;
    protected Usuario $usuarioFamilia;
    protected Usuario $usuarioVertical;
    protected Usuario $usuarioAmbos;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = Usuario::create([
            'nome' => 'Admin Teste',
            'email' => 'admin@teste.com',
            'password' => Hash::make('senha123'),
            'perfil' => PerfilUsuarioEnum::ADMINISTRADOR,
            'whatsapp' => '(49) 99999-1111',
            'ativo' => true,
        ]);

        $this->usuarioFamilia = Usuario::create([
            'nome' => 'Operador Familia',
            'email' => 'familia@teste.com',
            'password' => Hash::make('senha123'),
            'perfil' => PerfilUsuarioEnum::ACOLHER_FAMILIA,
            'whatsapp' => '(49) 99999-2222',
            'ativo' => true,
        ]);

        $this->usuarioVertical = Usuario::create([
            'nome' => 'Operador Vertical',
            'email' => 'vertical@teste.com',
            'password' => Hash::make('senha123'),
            'perfil' => PerfilUsuarioEnum::ACOLHER_VERTICAL,
            'whatsapp' => '(49) 99999-3333',
            'ativo' => true,
        ]);

        $this->usuarioAmbos = Usuario::create([
            'nome' => 'Operador Ambos',
            'email' => 'ambos@teste.com',
            'password' => Hash::make('senha123'),
            'perfil' => PerfilUsuarioEnum::AMBOS,
            'whatsapp' => '(49) 99999-4444',
            'ativo' => true,
        ]);
    }

    public function test_login_com_credenciais_corretas(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@teste.com',
            'password' => 'senha123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'mensagem',
                'token',
                'usuario' => ['id', 'nome', 'email', 'perfil', 'pode_acessar_familia', 'pode_acessar_vertical'],
            ]);
    }

    public function test_login_rejeita_senha_invalida(): void
    {
        $response = $this->postJson('/api/login', [
            'usuario' => 'admin.teste',
            'password' => 'senha_errada',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['usuario']);
    }

    public function test_cadastro_de_visitante_com_calculo_de_mes_ano_e_prioridade(): void
    {
        $response = $this->actingAs($this->usuarioFamilia)->postJson('/api/visitantes', [
            'nome' => 'Visitante Exemplo',
            'whatsapp' => '(49) 98888-7777',
            'como_chegou' => 'Instagram',
            'tipo_acolhimento' => 'familia',
            'data_visita' => Carbon::now()->subDays(4)->format('Y-m-d'),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('visitante.nome', 'Visitante Exemplo')
            ->assertJsonPath('visitante.status', 'nao_contactado')
            ->assertJsonPath('visitante.dias_sem_contato', 4)
            ->assertJsonPath('visitante.mes_ano', Carbon::now()->subDays(4)->format('m/Y'));
    }

    public function test_ordenacao_prioritaria_coloca_mais_dias_sem_contato_primeiro(): void
    {
        // Visitante com 2 dias sem contato
        Visitante::create([
            'nome' => 'Visitante Recente',
            'whatsapp' => '(49) 91111-1111',
            'como_chegou' => 'Amigos',
            'tipo_acolhimento' => TipoAcolhimentoEnum::FAMILIA,
            'status' => StatusContatoEnum::NAO_CONTACTADO,
            'usuario_responsavel_id' => $this->usuarioFamilia->id,
            'data_visita' => Carbon::now()->subDays(2)->format('Y-m-d'),
        ]);

        // Visitante com 7 dias sem contato (deve vir primeiro)
        Visitante::create([
            'nome' => 'Visitante Antigo',
            'whatsapp' => '(49) 92222-2222',
            'como_chegou' => 'Culto',
            'tipo_acolhimento' => TipoAcolhimentoEnum::FAMILIA,
            'status' => StatusContatoEnum::NAO_CONTACTADO,
            'usuario_responsavel_id' => $this->usuarioFamilia->id,
            'data_visita' => Carbon::now()->subDays(7)->format('Y-m-d'),
        ]);

        $response = $this->actingAs($this->usuarioFamilia)->getJson('/api/visitantes?tipo_acolhimento=familia&busca=Visitante');

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertEquals('Visitante Antigo', $data[0]['nome']);
        $this->assertEquals('Visitante Recente', $data[1]['nome']);
    }

    public function test_fluxo_de_templates_e_registro_de_contato_whatsapp(): void
    {
        $visitante = Visitante::create([
            'nome' => 'Lucas Santos',
            'whatsapp' => '(49) 99123-4567',
            'como_chegou' => 'Convite',
            'tipo_acolhimento' => TipoAcolhimentoEnum::VERTICAL,
            'status' => StatusContatoEnum::NAO_CONTACTADO,
            'usuario_responsavel_id' => $this->usuarioVertical->id,
            'data_visita' => Carbon::now()->subDays(3)->format('Y-m-d'),
        ]);

        // Obter templates
        $respTemplates = $this->actingAs($this->usuarioVertical)->getJson("/api/visitantes/{$visitante->id}/templates-contato");
        $respTemplates->assertStatus(200)
            ->assertJsonStructure([
                'templates_segunda',
                'templates_sexta',
                'fallback_segunda',
                'fallback_sexta',
            ]);

        // Registrar envio de contato de Segunda
        $respRegistrarSegunda = $this->actingAs($this->usuarioVertical)->postJson("/api/visitantes/{$visitante->id}/registrar-contato", [
            'tipo_mensagem' => 'segunda',
            'momento' => 'segunda',
            'mensagem' => 'Olá Lucas Santos, Deus abençoe sua semana!',
        ]);

        $respRegistrarSegunda->assertStatus(200)
            ->assertJsonPath('visitante.status', 'contactado')
            ->assertJsonPath('visitante.contato_segunda_enviado', true);

        $visitante->refresh();
        $this->assertEquals(StatusContatoEnum::CONTACTADO, $visitante->status);
        $this->assertTrue($visitante->contato_segunda_enviado);
        $this->assertNotNull($visitante->data_contato_segunda);
        $this->assertFalse($visitante->contato_sexta_enviado);

        // Registrar envio de contato de Sexta
        $respRegistrarSexta = $this->actingAs($this->usuarioVertical)->postJson("/api/visitantes/{$visitante->id}/registrar-contato", [
            'tipo_mensagem' => 'sexta',
            'momento' => 'sexta',
            'mensagem' => 'Fala Lucas! Te esperamos no Culto Vertical amanhã!',
        ]);

        $respRegistrarSexta->assertStatus(200)
            ->assertJsonPath('visitante.contato_sexta_enviado', true);

        $visitante->refresh();
        $this->assertTrue($visitante->contato_sexta_enviado);
        $this->assertNotNull($visitante->data_contato_sexta);
        $this->assertCount(2, $visitante->historicoContatos);
    }

    public function test_crud_de_templates_de_mensagem_por_admin(): void
    {
        // 1. Não admin não pode criar template
        $respNaoAdmin = $this->actingAs($this->usuarioFamilia)->postJson('/api/templates-mensagens', [
            'titulo' => 'Template Não Autorizado',
            'momento' => 'segunda',
            'tipo_acolhimento' => 'familia',
            'conteudo' => 'Olá {nome}',
        ]);
        $respNaoAdmin->assertStatus(403);

        // 2. Admin pode criar template
        $respCriar = $this->actingAs($this->admin)->postJson('/api/templates-mensagens', [
            'titulo' => 'Template Especial Domingo',
            'momento' => 'sexta',
            'tipo_acolhimento' => 'familia',
            'conteudo' => 'Olá {nome}, nosso culto especial de domingo te aguarda!',
            'descricao' => 'Para eventos especiais',
            'ativo' => true,
        ]);

        $respCriar->assertStatus(201)
            ->assertJsonPath('data.titulo', 'Template Especial Domingo');

        $templateId = $respCriar->json('data.id');

        // 3. Listar templates
        $respListar = $this->actingAs($this->usuarioFamilia)->getJson('/api/templates-mensagens?momento=sexta');
        $respListar->assertStatus(200);

        // 4. Atualizar template
        $respAtualizar = $this->actingAs($this->admin)->putJson("/api/templates-mensagens/{$templateId}", [
            'titulo' => 'Template Especial Atualizado',
        ]);
        $respAtualizar->assertStatus(200)
            ->assertJsonPath('data.titulo', 'Template Especial Atualizado');

        // 5. Excluir template
        $respExcluir = $this->actingAs($this->admin)->deleteJson("/api/templates-mensagens/{$templateId}");
        $respExcluir->assertStatus(200);
    }

    public function test_registro_de_push_subscription_e_calculo_de_lembretes_direcionados(): void
    {
        // 1. Salvar subscription
        $respSub = $this->actingAs($this->usuarioFamilia)->postJson('/api/push-subscriptions', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/exemplo_token_123',
            'keys_p256dh' => 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9Ac',
            'keys_auth' => 'tBHItJI5svbpez7KI4CCXg',
            'device_name' => 'Chrome Mobile Android',
        ]);

        $respSub->assertStatus(200)
            ->assertJsonPath('data.endpoint', 'https://fcm.googleapis.com/fcm/send/exemplo_token_123');

        $this->assertDatabaseHas('push_subscriptions', [
            'usuario_id' => $this->usuarioFamilia->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/exemplo_token_123',
        ]);

        // 2. Obter lembretes direcionados para o usuário
        $respLembretes = $this->actingAs($this->usuarioFamilia)->getJson('/api/push/lembretes-usuario');
        $respLembretes->assertStatus(200)
            ->assertJsonStructure([
                'dia_semana',
                'tem_lembrete_hoje',
                'pendentes_segunda_count',
                'pendentes_sexta_count',
            ]);

        // 3. Remover subscription ao desativar
        $respDel = $this->actingAs($this->usuarioFamilia)->deleteJson('/api/push-subscriptions', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/exemplo_token_123',
        ]);
        $respDel->assertStatus(200);

        $this->assertDatabaseMissing('push_subscriptions', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/exemplo_token_123',
        ]);
    }

    public function test_perfis_de_lider_e_permissao_de_relatorios(): void
    {
        // 1. Criar usuário Líder de Família
        $respCriarLider = $this->actingAs($this->admin)->postJson('/api/usuarios', [
            'nome' => 'Líder Marcos Paulo',
            'email' => 'marcos.lider@teste.com',
            'password' => 'senha123',
            'perfil' => 'lider_familia',
            'whatsapp' => '(49) 99999-5555',
            'ativo' => true,
        ]);

        $respCriarLider->assertStatus(201)
            ->assertJsonPath('usuario.perfil', 'lider_familia')
            ->assertJsonPath('usuario.pode_acessar_relatorios', true)
            ->assertJsonPath('usuario.pode_acessar_familia', true)
            ->assertJsonPath('usuario.pode_acessar_vertical', false);

        // 2. Criar usuário Líder de Ambos os cultos
        $respCriarLiderAmbos = $this->actingAs($this->admin)->postJson('/api/usuarios', [
            'nome' => 'Líder Mariana Costa',
            'email' => 'mariana.lider@teste.com',
            'password' => 'senha123',
            'perfil' => 'lider_ambos',
            'whatsapp' => '(49) 99999-6666',
            'ativo' => true,
        ]);

        $respCriarLiderAmbos->assertStatus(201)
            ->assertJsonPath('usuario.perfil', 'lider_ambos')
            ->assertJsonPath('usuario.pode_acessar_relatorios', true)
            ->assertJsonPath('usuario.pode_acessar_familia', true)
            ->assertJsonPath('usuario.pode_acessar_vertical', true);

        // 3. Usuário voluntário comum NÃO deve ter acesso a relatórios
        $respMeVoluntario = $this->actingAs($this->usuarioFamilia)->getJson('/api/me');
        $respMeVoluntario->assertStatus(200)
            ->assertJsonPath('usuario.pode_acessar_relatorios', false);

        // 4. Criar usuário sem email (gera @usuario automático)
        $respSemEmail = $this->actingAs($this->admin)->postJson('/api/usuarios', [
            'nome' => 'Lucas Ferreira Silva',
            'password' => 'senha123',
            'perfil' => 'acolher_vertical',
        ]);
        $respSemEmail->assertStatus(201)
            ->assertJsonPath('usuario.usuario', 'lucas.silva');
    }
}
