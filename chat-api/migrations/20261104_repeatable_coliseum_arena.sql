-- Allow repeatable M5/M10 collective arenas without deleting historic matches.
-- Existing match IDs, results, student progress and XP remain untouched.
DROP INDEX IF EXISTS public.pit_coliseum_one_arena_per_mission;

-- One active waiting room per cohort; old started rows are safely reused on re-open.
CREATE UNIQUE INDEX IF NOT EXISTS pit_coliseum_one_waiting_lobby_per_room
 ON public.pit_coliseum_arena_lobbies(room_code)
 WHERE status='waiting';
