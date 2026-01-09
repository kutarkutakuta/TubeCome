-- 002_create_youtube_quota_logs.sql
-- Tracks YouTube API usage per day and per endpoint/type

CREATE TABLE IF NOT EXISTS youtube_quota_logs (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 1,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_youtube_quota_logs_date_type ON youtube_quota_logs (date, type);

-- 003_add_client_ip_to_youtube_quota_logs.sql
ALTER TABLE youtube_quota_logs
  ADD COLUMN IF NOT EXISTS client_ip TEXT;

CREATE INDEX IF NOT EXISTS idx_youtube_quota_logs_date_client_ip
  ON youtube_quota_logs (date, client_ip);