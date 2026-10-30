-- H.1d: disposable CI schema only. Never use against Neon or a real classroom.
CREATE TABLE pit_students (
 id uuid PRIMARY KEY,
 room_code text NOT NULL,
 token_hash text NOT NULL UNIQUE
);
CREATE TABLE pit_classroom_state (
 room_code text PRIMARY KEY,
 current_stage integer NOT NULL CHECK(current_stage BETWEEN 1 AND 10)
);
CREATE TABLE pit_student_stages (
 student_id uuid NOT NULL REFERENCES pit_students(id),
 stage integer NOT NULL CHECK(stage BETWEEN 1 AND 10),
 status text NOT NULL CHECK(status IN ('working','submitted','revision','approved')),
 PRIMARY KEY(student_id,stage)
);
INSERT INTO pit_classroom_state(room_code,current_stage) VALUES ('PITGAME26',3);
