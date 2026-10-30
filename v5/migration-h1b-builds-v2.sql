-- PIT Game Jam IA V5 — H.1b additive schema v2 (DRY-RUN ARTIFACT).
-- DO NOT APPLY to the production Neon database without explicit authorization,
-- a backup, G.2 hardware acceptance and schema review.
-- Never modify pit_hero_builds (legacy six-class/four-attribute V5).
-- Only the authenticated backend may access this table.
BEGIN;
CREATE TABLE IF NOT EXISTS pit_hero_builds_v2 (
  student_id uuid PRIMARY KEY REFERENCES pit_students(id) ON DELETE CASCADE,
  room_code text NOT NULL CHECK (length(room_code) BETWEEN 1 AND 80),
  schema_version smallint NOT NULL DEFAULT 2 CHECK (schema_version = 2),
  klass text NOT NULL CHECK (klass IN ('warrior','mage','hunter','guardian')),
  attributes jsonb NOT NULL CHECK (
    jsonb_typeof(attributes) = 'object'
    AND attributes ?& ARRAY['FOR','DES','INT','VIT','DEF']
  ),
  talents jsonb NOT NULL CHECK (jsonb_typeof(talents) = 'array'),
  revision integer NOT NULL DEFAULT 1 CHECK (revision >= 1),
  m5_snapshot jsonb NULL CHECK (
    m5_snapshot IS NULL OR jsonb_typeof(m5_snapshot) = 'object'
  ),
  m5_entered_at timestamptz NULL,
  m10_snapshot jsonb NULL CHECK (
    m10_snapshot IS NULL OR jsonb_typeof(m10_snapshot) = 'object'
  ),
  m10_locked_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT pit_hero_builds_v2_m5_pair CHECK (
    (m5_snapshot IS NULL) = (m5_entered_at IS NULL)
  ),
  CONSTRAINT pit_hero_builds_v2_m10_pair CHECK (
    (m10_snapshot IS NULL) = (m10_locked_at IS NULL)
  ),
  CONSTRAINT pit_hero_builds_v2_m10_requires_m5 CHECK (
    m10_snapshot IS NULL OR m5_snapshot IS NOT NULL
  )
);
CREATE INDEX IF NOT EXISTS pit_hero_builds_v2_room_idx
  ON pit_hero_builds_v2(room_code);
COMMIT;

-- Rollback only if this table was created for this migration and reviewed:
-- DROP TABLE pit_hero_builds_v2;  -- destructive: NOT AUTOMATED
