-- ============================================================================
-- HackData V2 Supabase Schema Migration
-- ============================================================================
-- Matches docs/Differentiator-Add-ons.md section A7 & Supabase rules:
-- Durable application-record/tracking layer.
-- Service-role backend-only access, safe fallbacks, zero raw PII storage.
-- ============================================================================

-- 1. datasets
CREATE TABLE IF NOT EXISTS public.datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    modality TEXT NOT NULL DEFAULT 'tabular',
    source_fingerprint TEXT,
    row_count INTEGER NOT NULL DEFAULT 0,
    column_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ingested',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. dataset_profiles
CREATE TABLE IF NOT EXISTS public.dataset_profiles (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    profile_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. generation_runs
CREATE TABLE IF NOT EXISTS public.generation_runs (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    requested_rows INTEGER NOT NULL DEFAULT 100,
    seed INTEGER,
    status TEXT NOT NULL DEFAULT 'queued',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    metrics_json JSONB,
    error_message TEXT
);

-- 4. generation_results
CREATE TABLE IF NOT EXISTS public.generation_results (
    id TEXT PRIMARY KEY,
    generation_run_id TEXT NOT NULL REFERENCES public.generation_runs(id) ON DELETE CASCADE,
    row_count INTEGER NOT NULL DEFAULT 0,
    schema_json JSONB,
    preview_json JSONB,
    export_metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. evaluation_results
CREATE TABLE IF NOT EXISTS public.evaluation_results (
    id TEXT PRIMARY KEY,
    generation_run_id TEXT NOT NULL REFERENCES public.generation_runs(id) ON DELETE CASCADE,
    evaluation_type TEXT NOT NULL DEFAULT 'tabular',
    metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. regeneration_runs
CREATE TABLE IF NOT EXISTS public.regeneration_runs (
    id TEXT PRIMARY KEY,
    parent_generation_id TEXT NOT NULL REFERENCES public.generation_runs(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    strategy_json JSONB,
    previous_metrics_json JSONB,
    new_metrics_json JSONB,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. assistant_sessions
CREATE TABLE IF NOT EXISTS public.assistant_sessions (
    id TEXT PRIMARY KEY,
    dataset_id TEXT REFERENCES public.datasets(id) ON DELETE SET NULL,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. assistant_messages
CREATE TABLE IF NOT EXISTS public.assistant_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES public.assistant_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    structured_action_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dataset_profiles_dataset_id ON public.dataset_profiles(dataset_id);
CREATE INDEX IF NOT EXISTS idx_generation_runs_dataset_id ON public.generation_runs(dataset_id);
CREATE INDEX IF NOT EXISTS idx_generation_results_run_id ON public.generation_results(generation_run_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_run_id ON public.evaluation_results(generation_run_id);
CREATE INDEX IF NOT EXISTS idx_regeneration_runs_parent ON public.regeneration_runs(parent_generation_id);
CREATE INDEX IF NOT EXISTS idx_assistant_messages_session ON public.assistant_messages(session_id);

-- Enable Row Level Security (RLS) on all tables for defense-in-depth
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regeneration_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
