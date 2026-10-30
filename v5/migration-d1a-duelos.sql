-- PIT Game Jam IA V5 — D.1a staging-only duel invitation schema.
-- Additive, independent of legacy V3, H1b character tables and teacher grades.
-- NOT APPROVED FOR REAL NEON / PRODUCTION EXECUTION.
BEGIN;
CREATE TABLE IF NOT EXISTS pit_duel_room_settings (
 room_code text PRIMARY KEY,
 enabled boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS pit_duel_presence (
 student_id uuid PRIMARY KEY REFERENCES pit_students(id) ON DELETE CASCADE,
 room_code text NOT NULL,
 stage smallint NOT NULL CHECK(stage BETWEEN 1 AND 10),
 opt_in boolean NOT NULL DEFAULT false,
 last_seen_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS pit_duel_invites (
 id uuid PRIMARY KEY,
 room_code text NOT NULL,
 stage smallint NOT NULL CHECK(stage BETWEEN 1 AND 10),
 challenger_id uuid NOT NULL REFERENCES pit_students(id) ON DELETE CASCADE,
 invited_id uuid NOT NULL REFERENCES pit_students(id) ON DELETE CASCADE,
 status text NOT NULL CHECK(status IN ('pending','accepted','declined','expired','cancelled')),
 created_at timestamptz NOT NULL DEFAULT NOW(),
 expires_at timestamptz NOT NULL,
 decided_at timestamptz NULL,
 match_seed integer NULL CHECK(match_seed BETWEEN 1 AND 2147483646),
 CONSTRAINT pit_duel_invites_self CHECK(challenger_id<>invited_id),
 CONSTRAINT pit_duel_invites_seed CHECK((status='accepted')=(match_seed IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS pit_duel_slots (
 student_id uuid PRIMARY KEY REFERENCES pit_students(id) ON DELETE CASCADE,
 invite_id uuid NOT NULL REFERENCES pit_duel_invites(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pit_duel_invites_expiry_idx
 ON pit_duel_invites(expires_at) WHERE status='pending';
CREATE INDEX IF NOT EXISTS pit_duel_invites_challenger_idx
 ON pit_duel_invites(challenger_id,created_at DESC);
CREATE INDEX IF NOT EXISTS pit_duel_invites_invited_idx
 ON pit_duel_invites(invited_id,created_at DESC);
CREATE INDEX IF NOT EXISTS pit_duel_presence_active_idx
 ON pit_duel_presence(room_code,stage,last_seen_at DESC) WHERE opt_in;
COMMIT;
