'use strict';
/*
 * H.1c isolated OPTIONAL Vercel route. OFF unless a developer explicitly sets
 * PIT_V5_H1C_ENABLED=true in a non-production deployment with a migrated
 * disposable/staging database. Never imported by existing V3/V5 routes.
 */
const {createHeroV2Handler}=require('../lib/v5-hero-v2-handler.js');
let handler=null;
module.exports=async function(req,res){
 if(process.env.VERCEL_ENV==='production'||process.env.PIT_V5_H1C_ENABLED!=='true'){
  return createHeroV2Handler({enabled:false})(req,res);
 }
 if(!process.env.DATABASE_URL){
  res.setHeader('Cache-Control','no-store');
  return res.status(503).json({ok:false,error:'Banco H1c de homologação não configurado.'});
 }
 if(!handler){
  const {Pool}=require('pg');
  const pool=new Pool({connectionString:process.env.DATABASE_URL,max:3,
   connectionTimeoutMillis:6000,idleTimeoutMillis:10000});
  handler=createHeroV2Handler({pool,enabled:true,roomCode:'PITGAME26'});
 }
 return handler(req,res);
};
