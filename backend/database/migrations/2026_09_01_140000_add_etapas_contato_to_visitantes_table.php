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
        Schema::table('visitantes', function (Blueprint $table) {
            $table->boolean('contato_segunda_enviado')->default(false)->after('status');
            $table->date('data_contato_segunda')->nullable()->after('contato_segunda_enviado');
            $table->boolean('contato_sexta_enviado')->default(false)->after('data_contato_segunda');
            $table->date('data_contato_sexta')->nullable()->after('contato_sexta_enviado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitantes', function (Blueprint $table) {
            $table->dropColumn([
                'contato_segunda_enviado',
                'data_contato_segunda',
                'contato_sexta_enviado',
                'data_contato_sexta',
            ]);
        });
    }
};
