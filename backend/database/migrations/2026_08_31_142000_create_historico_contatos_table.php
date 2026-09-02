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
        Schema::create('historico_contatos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visitante_id')->constrained('visitantes')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('restrict');
            $table->string('tipo_mensagem', 30)->default('personalizada'); // 'padrao_familia', 'padrao_vertical', 'personalizada'
            $table->text('mensagem');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historico_contatos');
    }
};
