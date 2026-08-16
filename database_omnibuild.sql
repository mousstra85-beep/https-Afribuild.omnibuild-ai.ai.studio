-- ==============================================================================
-- OMNIBUILD AI STUDIO - SCHÉMA DE BASE DE DONNÉES PRINCIPALE (PostgreSQL / Cloud SQL)
-- Ce fichier permet de stocker les projets, utilisateurs, configurations APK/AAB, 
-- clés d'API et journaux de diagnostic du studio Omnibuild AI.
-- ==============================================================================

-- 1. Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table des Utilisateurs & Propriétaires de Comptes Studio
CREATE TABLE IF NOT EXISTS studio_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'developer' CHECK (role IN ('developer', 'admin', 'tester', 'viewer')),
    github_username VARCHAR(100),
    github_access_token_encrypted TEXT,
    preferences JSONB DEFAULT '{"theme": "dark", "locale": "fr", "autoSave": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des Projets Créés dans Omnibuild AI Studio
CREATE TABLE IF NOT EXISTS studio_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES studio_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'Autre',
    target_type VARCHAR(50) DEFAULT 'both' CHECK (target_type IN ('mobile', 'web', 'both')),
    slug VARCHAR(255) UNIQUE,
    current_version VARCHAR(20) DEFAULT '1.0.0',
    icon_url TEXT,
    theme_colors JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#1E293B", "accent": "#10B981"}'::jsonb,
    is_published BOOLEAN DEFAULT FALSE,
    published_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des Fichiers et Arborescence de Projets (Virtual File System)
CREATE TABLE IF NOT EXISTS project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES studio_projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    language VARCHAR(50) DEFAULT 'html',
    content TEXT NOT NULL,
    description TEXT,
    size_bytes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_file_path UNIQUE (project_id, file_path)
);

-- 5. Table des Configurations & Builds Mobile (APK, AAB, Capacitor, Keystore)
CREATE TABLE IF NOT EXISTS project_mobile_builds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES studio_projects(id) ON DELETE CASCADE,
    package_name VARCHAR(200) NOT NULL,
    version_code INT DEFAULT 1,
    version_name VARCHAR(50) DEFAULT '1.0.0',
    keystore_alias VARCHAR(100),
    build_type VARCHAR(50) DEFAULT 'apk_debug' CHECK (build_type IN ('apk_debug', 'apk_release', 'aab_bundle')),
    build_status VARCHAR(50) DEFAULT 'ready' CHECK (build_status IN ('pending', 'building', 'ready', 'failed')),
    download_url TEXT,
    file_size_mb NUMERIC(8, 2),
    manifest_xml TEXT,
    capacitor_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table des Intégrations de Paiement Mobile Money & Passerelles
CREATE TABLE IF NOT EXISTS project_payment_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES studio_projects(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL CHECK (provider_name IN ('wave', 'orange_money', 'mtn_momo', 'moov_money', 'stripe', 'paypal')),
    is_active BOOLEAN DEFAULT TRUE,
    api_key_encrypted TEXT,
    merchant_id VARCHAR(150),
    webhook_secret_encrypted TEXT,
    currency VARCHAR(10) DEFAULT 'XOF',
    test_mode BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des Logs de Diagnostics, Tests Santé et Auto-Réparations (Self-Healing)
CREATE TABLE IF NOT EXISTS studio_diagnostic_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES studio_projects(id) ON DELETE SET NULL,
    log_level VARCHAR(20) NOT NULL CHECK (log_level IN ('info', 'success', 'warning', 'error')),
    category VARCHAR(50) NOT NULL, -- 'storage_read', 'json_parse', 'file_explorer', 'state_retry', 'integrity_check', 'gemini_api'
    message TEXT NOT NULL,
    context_data JSONB,
    resolved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table des Sessions de Collaboration IA (Gemini 3.7 Flash, Recherche, Sécurité)
CREATE TABLE IF NOT EXISTS ai_generation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES studio_projects(id) ON DELETE CASCADE,
    user_prompt TEXT NOT NULL,
    ai_agent_type VARCHAR(50) DEFAULT 'dev' CHECK (ai_agent_type IN ('dev', 'research', 'security', 'optimizer')),
    model_name VARCHAR(100) DEFAULT 'gemini-3.7-flash',
    tokens_used INT DEFAULT 0,
    generated_code TEXT,
    review_status VARCHAR(50) DEFAULT 'accepted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEX D'OPTIMISATION DES PERFORMANCES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_studio_projects_user ON studio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_path ON project_files(file_path);
CREATE INDEX IF NOT EXISTS idx_project_mobile_project ON project_mobile_builds(project_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_logs_project ON studio_diagnostic_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_logs_level ON studio_diagnostic_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_project ON ai_generation_sessions(project_id);

-- ==============================================================================
-- DONNÉES INITIALES DU STUDIO OMNIBUILD
-- ==============================================================================
INSERT INTO studio_users (id, email, full_name, role, preferences)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@omnibuild.ai',
    'OmniBuild SuperAdmin',
    'admin',
    '{"theme": "dark", "locale": "fr", "autoSave": true, "aiAssistance": "high"}'::jsonb
) ON CONFLICT (email) DO NOTHING;
