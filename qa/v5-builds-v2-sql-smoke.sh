#!/usr/bin/env bash
# H1b — ephemeral PostgreSQL only. NEVER use this script with production credentials.
set -euo pipefail
export PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres PGDATABASE=pit_v5_h1b_test
export PGPASSWORD=ci_only_password
psql -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE pit_students (id uuid PRIMARY KEY, room_code text NOT NULL);
CREATE TABLE pit_hero_builds (student_id uuid PRIMARY KEY, build jsonb NOT NULL);
INSERT INTO pit_students (id,room_code)
VALUES ('11111111-1111-4111-8111-111111111111','CI-ROOM');
INSERT INTO pit_hero_builds (student_id,build)
VALUES ('11111111-1111-4111-8111-111111111111',
        '{"klass":"necromancer","attributes":{"power":2},"talents":{"old":1}}');
SQL
psql -v ON_ERROR_STOP=1 -f v5/migration-h1b-builds-v2.sql
psql -v ON_ERROR_STOP=1 -f v5/migration-h1b-builds-v2.sql
psql -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO pit_hero_builds_v2
 (student_id,room_code,klass,attributes,talents)
VALUES
 ('11111111-1111-4111-8111-111111111111','CI-ROOM','warrior',
  '{"FOR":0,"DES":0,"INT":0,"VIT":0,"DEF":0}','[]');
DO $$
DECLARE legacy jsonb;
BEGIN
 SELECT build INTO legacy FROM pit_hero_builds
 WHERE student_id='11111111-1111-4111-8111-111111111111';
 IF legacy->>'klass'<>'necromancer' THEN
  RAISE EXCEPTION 'Legacy build was touched by V2 migration';
 END IF;
 BEGIN
  UPDATE pit_hero_builds_v2 SET m10_snapshot='{}'::jsonb,
   m10_locked_at=NOW()
   WHERE student_id='11111111-1111-4111-8111-111111111111';
  RAISE EXCEPTION 'M10 without M5 was accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
 BEGIN
  UPDATE pit_hero_builds_v2 SET m5_snapshot='{}'::jsonb
   WHERE student_id='11111111-1111-4111-8111-111111111111';
  RAISE EXCEPTION 'M5 snapshot without timestamp was accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
 BEGIN
  UPDATE pit_hero_builds_v2 SET schema_version=1
   WHERE student_id='11111111-1111-4111-8111-111111111111';
  RAISE EXCEPTION 'Legacy schema was accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
 BEGIN
  UPDATE pit_hero_builds_v2 SET klass='necromancer'
   WHERE student_id='11111111-1111-4111-8111-111111111111';
  RAISE EXCEPTION 'Legacy class was accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
END $$;
SELECT 'PASS V5 H1b ephemeral Postgres: additive twice, isolated legacy, valid locks' AS result;
SQL
