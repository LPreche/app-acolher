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
        Schema::create('templates_mensagens', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('momento', 20)->default('segunda'); // 'segunda', 'sexta', 'geral'
            $table->string('tipo_acolhimento', 20)->default('ambos'); // 'familia', 'vertical', 'ambos'
            $table->text('conteudo');
            $table->string('descricao')->nullable();
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates_mensagens');
    }
};
