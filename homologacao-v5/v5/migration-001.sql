-- PIT Game Jam IA V5 — opt-in, safe PostgreSQL migration (Neon)
-- Run ONCE in the same DB as pit_students/pit_student_stages, after review.
-- IMPORTANT: the V5 branch does NOT execute migrations in production.
BEGIN;
CREATE TABLE IF NOT EXISTS pit_hero_builds (
 student_id uuid PRIMARY KEY REFERENCES pit_students(id) ON DELETE CASCADE,
 build jsonb NOT NULL CHECK (jsonb_typeof(build) = 'object'),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS pit_peer_reviews (
 evaluator_id uuid PRIMARY KEY REFERENCES pit_students(id) ON DELETE CASCADE,
 target_id uuid NOT NULL REFERENCES pit_students(id) ON DELETE CASCADE,
 score integer NOT NULL CHECK(score BETWEEN 0 AND 10),
 comment varchar(500) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (evaluator_id <> target_id)
);
CREATE INDEX IF NOT EXISTS pit_peer_reviews_target_idx ON pit_peer_reviews (target_id);
COMMIT;