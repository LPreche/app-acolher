<?php

namespace App\Enums;

enum StatusContatoEnum: string
{
    case NAO_CONTACTADO = 'nao_contactado';
    case CONTACTADO = 'contactado';

    public function rotulo(): string
    {
        return match ($this) {
            self::NAO_CONTACTADO => 'Não Contactado',
            self::CONTACTADO => 'Contactado',
        };
    }
}
