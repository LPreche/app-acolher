<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('visitantes', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            $table->string('whatsapp', 20);
            $table->string('como_chegou', 255)->default('Outro');
            $table->string('tipo_acolhimento', 30)->index(); // 'familia', 'vertical'
            $table->string('status', 30)->default('nao_contactado')->index(); // 'nao_contactado', 'contactado'
            $table->foreignId('usuario_responsavel_id')->constrained('usuarios')->onDelete('restrict');
            $table->date('data_visita')->index();
            $table->timestamp('data_ultimo_contato')->nullable()->index();
            $table->text('proxima_acao')->nullable();
            $table->text('observacoes')->nullable();
            $table->string('mes_ano', 7)->index(); // Ex: '08/2026'
            $table->boolean('ativo')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitantes');
    }
};
