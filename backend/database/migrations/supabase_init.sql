-- Sensory Composer — Supabase initialisation SQL
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS scores (
    id          BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(64)  UNIQUE NOT NULL,
    title       VARCHAR(255) NOT NULL,
    poem        TEXT,
    audio_base64    TEXT,
    visual_data_url TEXT,
    captured_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_external_id ON scores (external_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at  ON scores (created_at DESC);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Allow the Laravel service-role key full access (bypasses RLS).
-- Public/anonymous access is intentionally blocked.
CREATE POLICY "service_role_all" ON scores
    USING (auth.role() = 'service_role');

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at
    BEFORE UPDATE ON scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
