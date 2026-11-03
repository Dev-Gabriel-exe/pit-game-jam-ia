-- PIT Game Jam IA: waiting room for teacher-controlled M5/M10 group arenas.
-- Additive migration; no existing match, hero or student rows are changed.
CREATE TABLE IF NOT EXISTS public.pit_coliseum_arena_lobbies (
 room_code text NOT NULL REFERENCES public.pit_classroom_state(room_code) ON DELETE CASCADE,
 mission smallint NOT NULL CHECK (mission IN (5,10)),
 status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','started')),
 match_id uuid REFERENCES public.pit_coliseum_matches(id),
 opened_at timestamptz NOT NULL DEFAULT now(),
 started_at timestamptz,
 PRIMARY KEY (room_code,mission)
);
CREATE TABLE IF NOT EXISTS public.pit_coliseum_arena_joins (
 room_code text NOT NULL,
 mission smallint NOT NULL,
 student_id uuid NOT NULL REFERENCES public.pit_students(id) ON DELETE CASCADE,
 joined_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (room_code,mission,student_id),
 FOREIGN KEY (room_code,mission) REFERENCES public.pit_coliseum_arena_lobbies(room_code,mission) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pit_coliseum_arena_joins_room_idx ON public.pit_coliseum_arena_joins(room_code,mission,joined_at);
