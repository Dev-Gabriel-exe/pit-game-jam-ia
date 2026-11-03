'use strict';
/* Two independent PIT Game Jam cohorts. Never trust a student-provided
 * room to choose the database context; derive it from the hashed token.
 * A teacher can switch rooms only with the verified private PIN.
 */
const ROOMS=Object.freeze(['PITGAME26','PITGAME26B']);
const DEFAULT_ROOM=ROOMS[0];
const roomCode=x=>String(x||'').trim().toUpperCase();
const allowed=x=>ROOMS.includes(roomCode(x));
function teacherRoom(req){
 const code=roomCode(req.headers?.['x-pit-room']||DEFAULT_ROOM);
 return ROOMS.includes(code)?code:null;
}
module.exports={ROOMS,DEFAULT_ROOM,roomCode,allowed,teacherRoom};
