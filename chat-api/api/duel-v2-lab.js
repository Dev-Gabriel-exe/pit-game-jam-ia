'use strict';
/*
 * D.1a opt-in laboratory route ONLY. Default OFF; refuses production
 * even if the developer explicitly enables the feature flag.
 * Does not modify /api/classroom, /api/arena, grades or XP.
 */
const {createDuelHandler}=require('../lib/v5-duel-d1a-handler.js');
let handler=null;
module.exports=async function(req,res){
 if(process.env.VERCEL_ENV==='production'||process.env.PIT_V5_DUEL_D1A_ENABLED!=='true')
  return createDuelHandler({enabled:false})(req,res);
 if(!process.env.DATABASE_URL)
  return res.status(503).json({ok:false,error:'Banco fictício de homologação não configurado.'});
 if(!handler){
  const {Pool}=require('pg');
  const pool=new Pool({connectionString:process.env.DATABASE_URL,max:3,
   connectionTimeoutMillis:7000,idleTimeoutMillis:12000});
  handler=createDuelHandler({pool,enabled:true,roomCode:'PITGAME26'});
 }
 return handler(req,res);
};
