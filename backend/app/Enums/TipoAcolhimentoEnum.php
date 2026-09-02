<?php

namespace App\Enums;

enum TipoAcolhimentoEnum: string
{
    case FAMILIA = 'familia';
    case VERTICAL = 'vertical';

    public function rotulo(): string
    {
        return match ($this) {
            self::FAMILIA => 'Acolher Família',
            self::VERTICAL => 'Acolher Vertical',
        };
    }
}
