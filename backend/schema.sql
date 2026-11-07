CREATE SCHEMA IF NOT EXISTS dictionary_original;
CREATE TABLE IF NOT EXISTS dictionary_original.items (
  owner_hash text NOT NULL CHECK (owner_hash ~ '^[a-f0-9]{64}$'),
  id text NOT NULL CHECK (length(id) BETWEEN 1 AND 128),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_hash, id)
);
REVOKE ALL ON SCHEMA dictionary_original FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA dictionary_original FROM PUBLIC;
