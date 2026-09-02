-- ==============================================================================
-- SISTEMA ACOLHER - IBI CHAPECÓ
-- Script de Estrutura do Banco de Dados + Administrador Inicial
-- ==============================================================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    usuario VARCHAR(60) UNIQUE,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255) NOT NULL,
    perfil VARCHAR(30) NOT NULL DEFAULT 'acolher_familia',
    whatsapp VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    remember_token VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- 2. TABELA DE TOKENS DE AUTENTICAÇÃO (LARAVEL SANCTUM)
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pat_tokenable ON personal_access_tokens(tokenable_type, tokenable_id);

-- 3. TABELA DE SESSÕES
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);

-- 4. TABELA DE VISITANTES
CREATE TABLE IF NOT EXISTS visitantes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    como_chegou VARCHAR(255) NOT NULL,
    tipo_acolhimento VARCHAR(30) NOT NULL DEFAULT 'familia',
    status VARCHAR(30) NOT NULL DEFAULT 'nao_contactado',
    data_visita DATE NOT NULL DEFAULT CURRENT_DATE,
    data_ultimo_contato TIMESTAMP WITH TIME ZONE,
    proxima_acao TEXT,
    observacoes TEXT,
    usuario_responsavel_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    contato_segunda_enviado BOOLEAN NOT NULL DEFAULT FALSE,
    data_contato_segunda TIMESTAMP WITH TIME ZONE,
    contato_sexta_enviado BOOLEAN NOT NULL DEFAULT FALSE,
    data_contato_sexta TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_visitantes_tipo_acolhimento ON visitantes(tipo_acolhimento);
CREATE INDEX IF NOT EXISTS idx_visitantes_status ON visitantes(status);
CREATE INDEX IF NOT EXISTS idx_visitantes_data_visita ON visitantes(data_visita);
CREATE INDEX IF NOT EXISTS idx_visitantes_responsavel ON visitantes(usuario_responsavel_id);
CREATE INDEX IF NOT EXISTS idx_visitantes_ativo ON visitantes(ativo);
CREATE INDEX IF NOT EXISTS idx_visitantes_etapas ON visitantes(contato_segunda_enviado, contato_sexta_enviado);

-- 5. TABELA DE HISTÓRICO DE CONTATOS
CREATE TABLE IF NOT EXISTS historico_contatos (
    id BIGSERIAL PRIMARY KEY,
    visitante_id BIGINT NOT NULL REFERENCES visitantes(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    status_anterior VARCHAR(30) NOT NULL,
    status_novo VARCHAR(30) NOT NULL,
    mensagem_enviada TEXT,
    tipo_contato VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    data_contato TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historico_visitante ON historico_contatos(visitante_id);
CREATE INDEX IF NOT EXISTS idx_historico_usuario ON historico_contatos(usuario_id);

-- 6. TABELA DE TEMPLATES DE MENSAGENS (SEGUNDA / SEXTA / GERAL)
CREATE TABLE IF NOT EXISTS templates_mensagens (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    momento VARCHAR(30) NOT NULL,
    tipo_acolhimento VARCHAR(30) NOT NULL,
    variacao_resposta VARCHAR(50),
    conteudo TEXT NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_templates_momento ON templates_mensagens(momento);
CREATE INDEX IF NOT EXISTS idx_templates_tipo ON templates_mensagens(tipo_acolhimento);
CREATE INDEX IF NOT EXISTS idx_templates_ativo ON templates_mensagens(ativo);

-- 7. TABELA DE DISPOSITIVOS PUSH (NOTIFICAÇÕES NO CELULAR)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys_p256dh TEXT,
    keys_auth TEXT,
    device_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_usuario_id ON push_subscriptions(usuario_id);

-- 8. TABELA DE AUDITORIA E LOGS
CREATE TABLE IF NOT EXISTS auditoria_logs (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    evento VARCHAR(80) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    dados JSONB,
    ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_evento ON auditoria_logs(evento);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON auditoria_logs(created_at);

-- ==============================================================================
-- ACESSO INICIAL DO ADMINISTRADOR (LUIZ PAULO RECHE)
-- ==============================================================================
-- Senha de acesso: @colher2026#
INSERT INTO usuarios (
    nome,
    usuario,
    email,
    password,
    perfil,
    whatsapp,
    ativo,
    created_at,
    updated_at
) VALUES (
    'Luiz Paulo Reche',
    'luiz.reche',
    'luiz.reche@acolher.org',
    '$2y$12$e6gUf46v2z2Gf1wT7lJp2O7u1H3n5q1kR6w9P8z7X0v4y2M5k8e9a',
    'administrador',
    '(49) 99920-0335',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (usuario) DO NOTHING;
