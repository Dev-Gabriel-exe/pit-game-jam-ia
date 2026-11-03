-- PIT Game Jam IA — retorno seguro na segunda aula (aditivo e reversível).
-- Projeto Neon: pit-game-jam-chat. Preserva todos os alunos, progresso, entregas e mensagens.
ALTER TABLE pit_students ADD COLUMN IF NOT EXISTS recovery_hash text;
CREATE INDEX IF NOT EXISTS pit_students_room_recovery_idx
 ON pit_students(room_code,recovery_hash) WHERE recovery_hash IS NOT NULL;
-- Os 3 alunos anteriores podem gerar chave usando seu token ou com ajuda do professor.
-- Não impor UNIQUE(room_code,lower(display_name)) pois nomes antigos podem repetir.
