-- Add per-facility provenance fields needed for external imports (GRID3, HUMDATA, etc.)
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS external_id VARCHAR(100);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS external_code VARCHAR(80);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS metadata JSONB;
CREATE INDEX IF NOT EXISTS facilities_external_idx ON facilities(external_id);
