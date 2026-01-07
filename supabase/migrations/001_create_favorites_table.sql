-- Create favorites table for client-side persisted favorites
CREATE TABLE IF NOT EXISTS favorites (
  client_id text NOT NULL,
  channel_id text NOT NULL,
  channel_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, channel_id)
);

-- Optional index for created_at
CREATE INDEX IF NOT EXISTS favorites_created_at_idx ON favorites (created_at DESC);
