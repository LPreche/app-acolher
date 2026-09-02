<?php

namespace App\Enums;

enum PerfilUsuarioEnum: string
{
    case ADMINISTRADOR = 'administrador';
    case LIDER_FAMILIA = 'lider_familia';
    case LIDER_VERTICAL = 'lider_vertical';
    case LIDER_AMBOS = 'lider_ambos';
    case ACOLHER_FAMILIA = 'acolher_familia';
    case ACOLHER_VERTICAL = 'acolher_vertical';
    case AMBOS = 'ambos';

    public function rotulo(): string
    {
        return match ($this) {
            self::ADMINISTRADOR => 'Administrador Geral',
            self::LIDER_FAMILIA => 'Líder - Acolher Família',
            self::LIDER_VERTICAL => 'Líder - Acolher Vertical',
            self::LIDER_AMBOS => 'Líder - Família & Vertical',
            self::ACOLHER_FAMILIA => 'Voluntário - Acolher Família',
            self::ACOLHER_VERTICAL => 'Voluntário - Acolher Vertical',
            self::AMBOS => 'Voluntário - Família & Vertical',
        };
    }
}
