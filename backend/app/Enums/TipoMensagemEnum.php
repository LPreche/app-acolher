<?php

namespace App\Enums;

enum TipoMensagemEnum: string
{
    case PADRAO_FAMILIA = 'padrao_familia';
    case PADRAO_VERTICAL = 'padrao_vertical';
    case SEGUNDA = 'segunda';
    case SEXTA = 'sexta';
    case PERSONALIZADA = 'personalizada';

    public function rotulo(): string
    {
        return match ($this) {
            self::PADRAO_FAMILIA => 'Mensagem Padrão Família',
            self::PADRAO_VERTICAL => 'Mensagem Padrão Vertical',
            self::SEGUNDA => 'Contato de Segunda-feira',
            self::SEXTA => 'Contato de Sexta-feira',
            self::PERSONALIZADA => 'Mensagem Personalizada',
        };
    }
}
