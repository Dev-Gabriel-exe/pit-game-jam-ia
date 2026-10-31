'use strict';
/* D1c teacher feature: isolated test server only, NEVER production or V3.
 * No V3 PIN, no browser-stored secrets and no real school database access.
 */
const {createTeacherDuelHandler}=require('../lib/v5-duel-d1c-teacher.js');
let handler=null;
module.exports=async function(req,res){
 if(process.env.VERCEL_ENV==='production'||
  process.env.PIT_V5_DUEL_D1C_ENABLED!=='true')
  return createTeacherDuelHandler({enabled:false})(req,res);
 if(!process.env.DATABASE_URL||!process.env.PIT_V5_D1C_TEACHER_KEY)
  return res.status(503).json({ok:false,error:'Homologação docente não configurada.'});
 if(!handler){
  const {Pool}=require('pg');
  const pool=new Pool({connectionString:process.env.DATABASE_URL,
   max:3,connectionTimeoutMillis:7000,idleTimeoutMillis:12000});
  handler=createTeacherDuelHandler({pool,enabled:true,
   teacherKey:process.env.PIT_V5_D1C_TEACHER_KEY,
   roomCode:'PITGAME26'});
 }
 return handler(req,res);
};
