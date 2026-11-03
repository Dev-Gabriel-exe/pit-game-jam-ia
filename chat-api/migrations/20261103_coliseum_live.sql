-- V5 live duels and teacher-controlled M5/M10 arenas.
-- Additive only: no edits to student progress, XP, grading or existing hero builds.
CREATE TABLE IF NOT EXISTS public.pit_coliseum_rooms (
 room_code text PRIMARY KEY REFERENCES public.pit_classroom_state(room_code) ON DELETE CASCADE,
 duels_enabled boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.pit_coliseum_rooms(room_code) SELECT room_code FROM public.pit_classroom_state
 ON CONFLICT(room_code) DO NOTHING;
CREATE TABLE IF NOT EXISTS public.pit_coliseum_presence (
 student_id uuid PRIMARY KEY REFERENCES public.pit_students(id) ON DELETE CASCADE,
 room_code text NOT NULL REFERENCES public.pit_classroom_state(room_code) ON DELETE CASCADE,
 available boolean NOT NULL DEFAULT false,
 seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pit_coliseum_presence_room_idx
 ON public.pit_coliseum_presence(room_code,available,seen_at DESC);
CREATE TABLE IF NOT EXISTS public.pit_coliseum_matches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 room_code text NOT NULL REFERENCES public.pit_classroom_state(room_code) ON DELETE CASCADE,
 kind text NOT NULL CHECK (kind IN ('duel','arena')),
 mission smallint NOT NULL CHECK (mission BETWEEN 1 AND 10),
 seed integer NOT NULL CHECK (seed > 0),
 roster jsonb NOT NULL CHECK (jsonb_typeof(roster)='array'),
 engine_options jsonb NOT NULL CHECK (jsonb_typeof(engine_options)='object'),
 result jsonb NOT NULL CHECK (jsonb_typeof(result)='object'),
 result_sha256 text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pit_coliseum_matches_room_idx
 ON public.pit_coliseum_matches(room_code,created_at DESC);
CREATE TABLE IF NOT EXISTS public.pit_coliseum_invites (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 room_code text NOT NULL REFERENCES public.pit_classroom_state(room_code) ON DELETE CASCADE,
 sender_id uuid NOT NULL REFERENCES public.pit_students(id) ON DELETE CASCADE,
 receiver_id uuid NOT NULL REFERENCES public.pit_students(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'pending'
  CHECK(status IN ('pending','accepted','declined','cancelled','expired')),
 match_id uuid NULL REFERENCES public.pit_coliseum_matches(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT (now()+interval '60 seconds'),
 responded_at timestamptz,
 CONSTRAINT pit_coliseum_invites_pair_check CHECK(sender_id<>receiver_id)
);
CREATE INDEX IF NOT EXISTS pit_coliseum_invites_room_idx
 ON public.pit_coliseum_invites(room_code,status,created_at DESC);
CREATE INDEX IF NOT EXISTS pit_coliseum_invites_sender_idx ON public.pit_coliseum_invites(sender_id,created_at DESC);
CREATE INDEX IF NOT EXISTS pit_coliseum_invites_receiver_idx ON public.pit_coliseum_invites(receiver_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS pit_coliseum_one_arena_per_mission
 ON public.pit_coliseum_matches(room_code,mission) WHERE kind='arena';
