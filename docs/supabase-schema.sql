-- HackData V2 — Supabase Production Schema
-- Run this in Supabase SQL Editor to set up durable job persistence.
--
-- This enables the production deployment to store job records durably
-- so they survive API/worker restarts.

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    job_id      TEXT PRIMARY KEY,
    dataset_id  TEXT NOT NULL,
    state       TEXT NOT NULL DEFAULT 'queued',
    progress    INTEGER NOT NULL DEFAULT 0,
    message     TEXT DEFAULT '',
    error       TEXT,
    created_at  BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    updated_at  BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    completed_at BIGINT
);

-- Index for listing jobs by dataset
CREATE INDEX IF NOT EXISTS jobs_dataset_id_idx ON jobs(dataset_id);
CREATE INDEX IF NOT EXISTS jobs_state_idx ON jobs(state);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON jobs(created_at DESC);

-- Enable Row Level Security (required for Supabase)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend/worker only — never expose to browser)
CREATE POLICY "Service role full access" ON jobs
    FOR ALL USING (auth.role() = 'service_role');

-- Optional: clean up old completed/failed jobs after 7 days
-- Run this periodically via pg_cron or a Supabase scheduled function:
-- DELETE FROM jobs WHERE state IN ('completed','failed','cancelled')
--   AND completed_at < EXTRACT(EPOCH FROM (NOW() - INTERVAL '7 days'))::BIGINT;
