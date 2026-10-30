'use strict';
/* Strictly experimental replay API; do not enable in production. */
const {createMatchHandler}=require('../lib/v5-duel-d1b-handler.js');
let handler=null;
module.exports=async function(req,res){
 if(process.env.VERCEL_ENV==='production'||
    process.env.PIT_V5_DUEL_D1B_ENABLED!=='true')
  return createMatchHandler({enabled:false})(req,res);
 if(!process.env.DATABASE_URL)
  return res.status(503).json({ok:false,error:'Banco de homologação não configurado.'});
 if(!handler){
  const {Pool}=require('pg');
  const pool=new Pool({
   connectionString:process.env.DATABASE_URL,max:3,
   connectionTimeoutMillis:7000,idleTimeoutMillis:12000
  });
  handler=createMatchHandler({pool,enabled:true,roomCode:'PITGAME26'});
 }
 return handler(req,res);
};
