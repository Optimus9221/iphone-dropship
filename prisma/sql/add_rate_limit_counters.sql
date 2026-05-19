-- Run once on production (Neon SQL editor) if db push is not used:
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_end TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limit_counters_window_end_idx ON rate_limit_counters(window_end);
