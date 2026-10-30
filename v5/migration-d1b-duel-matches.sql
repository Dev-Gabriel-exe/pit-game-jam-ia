-- PIT Game Jam IA V5 D.1b — AUTHORITY-ONLY, DISPOSABLE STAGING MIGRATION.
-- Apply AFTER migration-d1a-duelos.sql + migration-h1b-builds-v2.sql,
-- ONLY to a throwaway PostgreSQL instance. NOT AUTHORIZED FOR PRODUCTION.
BEGIN;
ALTER TABLE pit_duel_invites DROP CONSTRAINT IF EXISTS pit_duel_invites_status_check;
ALTER TABLE pit_duel_invites ADD CONSTRAINT pit_duel_invites_status_check
 CHECK(status IN ('pending','accepted','declined','expired','cancelled','finished'));
ALTER TABLE pit_duel_invites DROP CONSTRAINT IF EXISTS pit_duel_invites_seed;
ALTER TABLE pit_duel_invites ADD CONSTRAINT pit_duel_invites_seed
 CHECK ((status IN ('accepted','finished')) = (match_seed IS NOT NULL));
CREATE TABLE IF NOT EXISTS pit_duel_matches (
 invite_id uuid PRIMARY KEY REFERENCES pit_duel_invites(id) ON DELETE CASCADE,
 room_code text NOT NULL,
 stage smallint NOT NULL CHECK(stage BETWEEN 1 AND 10),
 replay_version smallint NOT NULL DEFAULT 1 CHECK(replay_version=1),
 replay jsonb NOT NULL CHECK(jsonb_typeof(replay)='object'),
 replay_sha256 char(64) NOT NULL CHECK(replay_sha256 ~ '^[0-9a-f]{64}$'),
 winner_side text NOT NULL CHECK(winner_side IN ('left','right')),
 started_at timestamptz NOT NULL DEFAULT NOW(),
 ends_at timestamptz NOT NULL,
 finished_at timestamptz NULL,
 CONSTRAINT pit_duel_matches_order CHECK (ends_at>started_at),
 CONSTRAINT pit_duel_matches_finished CHECK (finished_at IS NULL OR finished_at>=started_at)
);
CREATE INDEX IF NOT EXISTS pit_duel_matches_expiring_idx
 ON pit_duel_matches(ends_at) WHERE finished_at IS NULL;
COMMIT;
