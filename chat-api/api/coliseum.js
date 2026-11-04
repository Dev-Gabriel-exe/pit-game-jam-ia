'use strict';
/* PIT Game Jam V5: real two-cohort duel invitations and teacher-triggered arenas.
 * Combat replays are deterministic and server-verified. Never writes grades or XP.
 */
const {Pool}=require('pg');
const {createHash,randomInt,timingSafeEqual}=require('node:crypto');
const engine=require('../lib/v5-phase2-engine.js');
const {teacherRoom,ROOMS}=require('../lib/pit-rooms.js');
const {validateProfile}=require('./hero.js');
const ORIGINS=new Set(['https://dev-gabriel-exe.github.io','https://pit-game-jam-chat.vercel.app']);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN=/^[a-f\d]{64}$/i;
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:9000,idleTimeoutMillis:15000});
const reply=(res,status,message)=>res.status(status).json({ok:false,error:message});
const safeBody=req=>req.body&&typeof req.body==='object'&&!Array.isArray(req.body)&&JSON.stringify(req.body).length<=1200;
const validUUID=x=>typeof x==='string'&&UUID.test(x);
function teacherAuth(req){
 const a=Buffer.from(String(req.headers['x-pit-teacher-pin']||'')),b=Buffer.from(String(process.env.PIT_TEACHER_PIN||''));
 return a.length>=16&&a.length===b.length&&timingSafeEqual(a,b);
}
async function authenticate(db,req){
 if(teacherAuth(req))return {role:'teacher',room:teacherRoom(req)};
 const token=String(req.headers['x-pit-student-token']||'');
 if(!TOKEN.test(token))return null;
 const hash=createHash('sha256').update(token).digest('hex');
 const q=await db.query('SELECT id,display_name,room_code FROM public.pit_students WHERE token_hash=$1 LIMIT 1',[hash]);
 const row=q.rows[0];
 return row&&ROOMS.includes(row.room_code)?{role:'student',room:row.room_code,id:row.id,name:row.display_name}:null;
}
async function roomState(db,room){
 const q=await db.query('SELECT c.current_stage,c.phase,s.duels_enabled FROM public.pit_classroom_state c JOIN public.pit_coliseum_rooms s USING(room_code) WHERE c.room_code=$1',[room]);
 return q.rows[0]||null;
}
async function approved(db,id){
 const q=await db.query("SELECT count(*)::int AS n FROM public.pit_student_stages WHERE student_id=$1 AND status='approved'",[id]);
 return Math.min(10,Number(q.rows[0]?.n||0));
}
async function eligible(db,id,stage){
 const q=await db.query('SELECT status FROM public.pit_student_stages WHERE student_id=$1 AND stage=$2',[id,stage]);
 return ['submitted','approved'].includes(q.rows[0]?.status);
}
async function profile(db,id){return (await db.query('SELECT klass,attributes,talents FROM public.pit_student_heroes WHERE student_id=$1',[id])).rows[0]||null}
function battleBuild(raw,actual,mission,name){
 const earned=Math.min(actual,mission);
 const safe=validateProfile(raw,actual);
 const attrs={};let remain=earned*2;
 for(const a of engine.ATTR){
  const n=Math.min(safe.attributes[a],mission===10?20:12,remain);
  attrs[a]=n;remain-=n;
 }
 const choices=safe.talents.slice(0,earned);
 return engine.canonical({klass:safe.klass,attributes:attrs,talents:choices,name},earned,{experimentalFinal:mission===10});
}
async function entrants(db,room,ids,mission){
 const q=await db.query(
  "SELECT s.id,s.display_name,h.klass,h.attributes,h.talents,"+
  " COALESCE((SELECT count(*)::int FROM public.pit_student_stages st WHERE st.student_id=s.id AND st.status='approved'),0) AS approved "+
  " FROM public.pit_students s JOIN public.pit_student_heroes h ON h.student_id=s.id "+
  " WHERE s.room_code=$1 AND s.id=ANY($2::uuid[]) ORDER BY s.joined_at,s.id",
  [room,ids]);
 if(q.rows.length!==ids.length)throw Object.assign(Error('Nem todos os alunos possuem personagem salvo na turma.'),{status:409});
 return q.rows.map(item=>{
  const count=Number(item.approved);
  if(mission===10&&count!==10)throw Object.assign(Error('A Arena M10 exige dez missões aprovadas por participante.'),{status:409});
  const build=battleBuild(item,count,mission,item.display_name);
  return {id:item.id,name:item.display_name,approvedMissions:build.approvedMissions,
   finalTrial:mission===10,build};
 });
}
function simulate(roster,mission){
 if(!Array.isArray(roster)||roster.length<2||roster.length>30)throw Object.assign(Error('A arena exige de 2 a 30 heróis.'),{status:400});
 const seed=randomInt(1,2147483647);
 const options={arenaMission:mission,limit:95,arenaScale:5,damageScale:.5,stormDelay:35,stormRateFactor:.65,
  engagementMode:'spaced',navigationMode:'steer',rangedCommitment:'recovery',balancePreset:'e-hp2'};
 const battle=engine.battle(roster,{...options,seed});
 const result=battle.run(2300);
 if(!result.finished)throw Error('O confronto não atingiu o encerramento calculado.');
 const summary={winner:result.winner,time:result.time,standings:result.standings.map(x=>({
  id:x.id,name:x.name,klass:x.klass,hp:+Number(x.hp).toFixed(2),
  kills:x.kills,damage:+Number(x.damage).toFixed(2)}))};
 const signature=createHash('sha256').update(JSON.stringify({seed,roster,options,summary})).digest('hex');
 return {seed,options,summary,signature};
}
async function insertMatch(db,room,kind,mission,roster){
 const sim=simulate(roster,mission);
 const q=await db.query(
  "INSERT INTO public.pit_coliseum_matches(room_code,kind,mission,seed,roster,engine_options,result,result_sha256) "+
  " VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8) RETURNING id,created_at",
  [room,kind,mission,sim.seed,JSON.stringify(roster),JSON.stringify(sim.options),
   JSON.stringify(sim.summary),sim.signature]);
 return {id:q.rows[0].id,createdAt:q.rows[0].created_at,kind,mission,seed:sim.seed,winner:sim.summary.winner};
}
async function expire(db,room){
 await db.query("UPDATE public.pit_coliseum_invites SET status='expired',responded_at=now() "+
  "WHERE room_code=$1 AND status='pending' AND expires_at<now()",[room]);
}
async function arenaLobby(db,room,viewer=null){
 const q=await db.query("SELECT mission,opened_at FROM public.pit_coliseum_arena_lobbies "+
  "WHERE room_code=$1 AND status='waiting' ORDER BY opened_at DESC LIMIT 1",[room]);
 if(!q.rowCount)return null;
 const mission=q.rows[0].mission;
 const participants=await db.query("SELECT j.student_id,s.display_name FROM public.pit_coliseum_arena_joins j "+
  "JOIN public.pit_students s ON s.id=j.student_id "+
  "WHERE j.room_code=$1 AND j.mission=$2 ORDER BY j.joined_at,j.student_id LIMIT 30",[room,mission]);
 const joined=participants.rows.some(x=>x.student_id===viewer?.id);
 return {mission,openedAt:q.rows[0].opened_at,joinedCount:participants.rows.length,
  ...(viewer?.role==='teacher'?{participants:participants.rows.map(x=>({id:x.student_id,name:x.display_name}))}:{joined})};
}
async function studentState(db,user,state){
 const [status,hasHero,enabled,qpeers,qinvites,qarenas,presence]=await Promise.all([
  eligible(db,user.id,state.current_stage),
  profile(db,user.id),
  Promise.resolve(state.duels_enabled),
  db.query("SELECT s.id,s.display_name FROM public.pit_coliseum_presence p "+
   "JOIN public.pit_students s ON s.id=p.student_id "+
   "JOIN public.pit_student_heroes h ON h.student_id=s.id "+
   "JOIN public.pit_student_stages st ON st.student_id=s.id AND st.stage=$2 AND st.status IN ('submitted','approved') "+
   "WHERE p.room_code=$1 AND p.available=true AND p.seen_at>now()-interval '60 seconds' AND p.student_id<>$3 ORDER BY s.display_name,s.id LIMIT 60",
   [user.room,state.current_stage,user.id]),
  db.query("SELECT i.id,i.status,i.match_id,i.created_at,i.expires_at,i.sender_id,i.receiver_id,"+
   "CASE WHEN i.sender_id=$2 THEN receiver.display_name ELSE sender.display_name END AS peer_name, "+
   "m.result->'winner'->>'id' AS winner_id, (m.id IS NOT NULL) AS has_result "+
   "FROM public.pit_coliseum_invites i "+
   "LEFT JOIN public.pit_coliseum_matches m ON m.id=i.match_id AND m.room_code=i.room_code AND m.kind='duel' "+
   "JOIN public.pit_students sender ON sender.id=i.sender_id "+
   "JOIN public.pit_students receiver ON receiver.id=i.receiver_id "+
   "WHERE i.room_code=$1 AND (i.sender_id=$2 OR i.receiver_id=$2) "+
   "ORDER BY i.created_at DESC LIMIT 12",[user.room,user.id]),
  db.query("SELECT m.id,m.mission,m.created_at,m.result->'winner' AS winner, "+
   "EXISTS(SELECT 1 FROM jsonb_array_elements(m.roster) fighter WHERE fighter->>'id'=$2::text) AS joined "+
   "FROM public.pit_coliseum_matches m WHERE m.room_code=$1 AND m.kind='arena' ORDER BY m.created_at DESC LIMIT 50",[user.room,user.id]),
  db.query("SELECT available AND seen_at>now()-interval '60 seconds' AS online FROM public.pit_coliseum_presence WHERE student_id=$1",[user.id])
 ]);
 const invites=qinvites.rows.map(x=>({id:x.id,status:x.status,matchId:x.match_id,
  outgoing:x.sender_id===user.id,peerName:x.peer_name,createdAt:x.created_at,expiresAt:x.expires_at,
  // Compute the outcome from the official saved match, relative to the authenticated user.
  outcome:x.status==='accepted'&&x.has_result
   ?(x.winner_id===null?'draw':String(x.winner_id)===String(user.id)?'win':'loss'):null}));
 const busy=invites.some(x=>x.status==='pending');
 return {ok:true,role:'student',room:user.room,stage:state.current_stage,duelsEnabled:enabled,
  eligible:status,approved:await approved(db,user.id),heroSaved:!!hasHero,optedIn:presence.rows[0]?.online===true,
  peers:status&&hasHero&&enabled&&!busy?qpeers.rows.map(x=>({id:x.id,name:x.display_name})):[],
  invites,lobby:await arenaLobby(db,user.room,user),
  arena:qarenas.rows.map(x=>({id:x.id,mission:x.mission,createdAt:x.created_at,winner:x.winner,joined:x.joined})),busy};
}
async function teacherState(db,user,state){
 const [heroes,arenas,invitations]=await Promise.all([
  db.query("SELECT s.id,s.display_name,(h.student_id IS NOT NULL) AS hero_saved,"+
   "COALESCE((SELECT count(*)::int FROM public.pit_student_stages st WHERE st.student_id=s.id AND st.status='approved'),0) AS approved "+
   "FROM public.pit_students s LEFT JOIN public.pit_student_heroes h ON h.student_id=s.id "+
   "WHERE s.room_code=$1 ORDER BY s.joined_at,s.id LIMIT 180",[user.room]),
  db.query("SELECT id,mission,created_at,result->'winner' AS winner,jsonb_array_length(roster) AS fighters "+
   "FROM public.pit_coliseum_matches WHERE room_code=$1 AND kind='arena' ORDER BY created_at DESC LIMIT 50",[user.room]),
  db.query("SELECT count(*)::int AS n FROM public.pit_coliseum_invites WHERE room_code=$1 AND status='pending'",[user.room])
 ]);
 return {ok:true,role:'teacher',room:user.room,stage:state.current_stage,duelsEnabled:state.duels_enabled,
  pendingInvites:invitations.rows[0]?.n||0,lobby:await arenaLobby(db,user.room,user),
  students:heroes.rows.map(x=>({id:x.id,name:x.display_name,
   heroSaved:x.hero_saved,approved:Number(x.approved)})),
  arena:arenas.rows.map(x=>({id:x.id,mission:x.mission,createdAt:x.created_at,winner:x.winner,fighters:x.fighters}))};
}
async function callAction(db,user,state,req,res){
 const action=String(req.query?.action||'');
 if(req.method==='GET'&&action==='state'){
  await expire(db,user.room);
  return res.status(200).json(user.role==='teacher'?
   await teacherState(db,user,state):await studentState(db,user,state));
 }
 if(req.method==='GET'&&action==='match'){
  const id=String(req.query?.id||'');
  if(!validUUID(id))return reply(res,400,'Identificador do confronto inválido.');
  const q=await db.query('SELECT id,kind,room_code,mission,seed,roster,engine_options,result,result_sha256,created_at FROM public.pit_coliseum_matches WHERE id=$1 AND room_code=$2',[id,user.room]);
  const row=q.rows[0];
  if(!row)return reply(res,404,'Confronto não encontrado nesta turma.');
  if(user.role==='student'&&row.kind==='duel'&&!row.roster.some(x=>x.id===user.id))
   return reply(res,403,'Este duelo pertence a outros alunos.');
  return res.status(200).json({ok:true,match:{id:row.id,kind:row.kind,room:user.room,
   mission:row.mission,seed:row.seed,roster:row.roster,options:row.engine_options,
   result:row.result,sha256:row.result_sha256,createdAt:row.created_at}});
 }
 if(req.method!=='POST')return reply(res,405,'Método não permitido.');
 if(!safeBody(req))return reply(res,400,'Dados de operação inválidos.');
 await db.query('BEGIN');
 try{
  // Serialize operations within a cohort; changes cannot race across invitations and releases.
  const q=await db.query('SELECT duels_enabled FROM public.pit_coliseum_rooms WHERE room_code=$1 FOR UPDATE',[user.room]);
  if(!q.rowCount)throw Object.assign(Error('Turma não inicializada.'),{status:503});
  const live=await roomState(db,user.room);
  if(!live)throw Object.assign(Error('Turma não inicializada.'),{status:503});
  if(user.role==='teacher'){
   if(action==='duels'){
    if(typeof req.body.enabled!=='boolean')throw Object.assign(Error('Escolha liberar ou pausar duelos.'),{status:400});
    await db.query('UPDATE public.pit_coliseum_rooms SET duels_enabled=$2,updated_at=now() WHERE room_code=$1',[user.room,req.body.enabled]);
    await db.query('COMMIT');return res.status(200).json({ok:true,duelsEnabled:req.body.enabled});
   }
   if(action==='arena-open'){
    const mission=req.body.mission;
    if(![5,10].includes(mission))throw Object.assign(Error('Somente as arenas M5/M10 podem ser abertas.'),{status:400});
    if(live.current_stage<mission)throw Object.assign(Error('Libere a missão '+mission+' antes de abrir a arena.'),{status:403});
    const another=await db.query("SELECT mission FROM public.pit_coliseum_arena_lobbies WHERE room_code=$1 AND status='waiting'",[user.room]);
    if(another.rows.some(x=>Number(x.mission)!==mission))throw Object.assign(Error('Encerre a sala de espera anterior antes de abrir outra arena.'),{status:409});
    const existing=await db.query("SELECT status FROM public.pit_coliseum_arena_lobbies WHERE room_code=$1 AND mission=$2",[user.room,mission]);
    if(existing.rows[0]?.status==='waiting'){
     await db.query('COMMIT');return res.status(200).json({ok:true,mission,lobby:'waiting',alreadyOpen:true});
    }
    // Reusing a finished lobby starts a fresh round; historical matches are immutable.
    await db.query("INSERT INTO public.pit_coliseum_arena_lobbies(room_code,mission,status,match_id,opened_at,started_at) "+
     "VALUES($1,$2,'waiting',NULL,now(),NULL) ON CONFLICT(room_code,mission) "+
     "DO UPDATE SET status='waiting',match_id=NULL,opened_at=now(),started_at=NULL",[user.room,mission]);
    await db.query("DELETE FROM public.pit_coliseum_arena_joins WHERE room_code=$1 AND mission=$2",[user.room,mission]);
    await db.query('COMMIT');return res.status(200).json({ok:true,mission,lobby:'waiting'});
   }
   if(action==='arena-cancel'){
    const mission=req.body.mission;
    if(![5,10].includes(mission))throw Object.assign(Error('Missão inválida.'),{status:400});
    const out=await db.query("DELETE FROM public.pit_coliseum_arena_lobbies WHERE room_code=$1 AND mission=$2 AND status='waiting' RETURNING mission",[user.room,mission]);
    if(!out.rowCount)throw Object.assign(Error('Não há sala de espera aberta para cancelar.'),{status:409});
    await db.query('COMMIT');return res.status(200).json({ok:true,cancelled:true});
   }
   if(action==='arena-start'){
    const mission=req.body.mission;
    if(![5,10].includes(mission))throw Object.assign(Error('Somente as arenas M5 e M10 estão disponíveis.'),{status:400});
    if(live.current_stage<mission)throw Object.assign(Error('O professor deve liberar a missão '+mission+' antes da arena.'),{status:403});
    const lobby=await db.query("SELECT mission,match_id,status FROM public.pit_coliseum_arena_lobbies WHERE room_code=$1 AND mission=$2",[user.room,mission]);
    if(lobby.rows[0]?.status==='started'&&lobby.rows[0].match_id){
     await db.query('COMMIT');return res.status(200).json({ok:true,matchId:lobby.rows[0].match_id,alreadyStarted:true});
    }
    if(!lobby.rowCount||lobby.rows[0].status!=='waiting')throw Object.assign(Error('Abra a sala de espera para os alunos entrarem antes de iniciar.'),{status:409});
    const joined=await db.query("SELECT j.student_id AS id FROM public.pit_coliseum_arena_joins j "+
     "JOIN public.pit_students s ON s.id=j.student_id "+
     "WHERE j.room_code=$1 AND j.mission=$2 ORDER BY j.joined_at,j.student_id",[user.room,mission]);
    if(joined.rows.length<2)throw Object.assign(Error('Aguarde pelo menos dois alunos entrarem na arena.'),{status:409});
    if(joined.rows.length>30)throw Object.assign(Error('O limite é de 30 participantes.'),{status:409});
    const roster=await entrants(db,user.room,joined.rows.map(x=>x.id),mission);
    const match=await insertMatch(db,user.room,'arena',mission,roster);
    await db.query("UPDATE public.pit_coliseum_arena_lobbies SET status='started',match_id=$3,started_at=now() "+
     "WHERE room_code=$1 AND mission=$2 AND status='waiting'",[user.room,mission,match.id]);
    await db.query('COMMIT');return res.status(201).json({ok:true,matchId:match.id,mission,participants:roster.length});
   }
   throw Object.assign(Error('Ação docente desconhecida.'),{status:404});
  }
  if(action==='presence'){
   if(typeof req.body.available!=='boolean')throw Object.assign(Error('Disponibilidade inválida.'),{status:400});
   if(req.body.available&&(!live.duels_enabled||!await eligible(db,user.id,live.current_stage)||!await profile(db,user.id)))
    throw Object.assign(Error('Aguarde liberação do professor, entregue a missão e salve seu personagem.'),{status:403});
   await db.query("INSERT INTO public.pit_coliseum_presence(student_id,room_code,available,seen_at) VALUES($1,$2,$3,now()) "+
    "ON CONFLICT(student_id) DO UPDATE SET available=EXCLUDED.available,seen_at=now()",[user.id,user.room,req.body.available]);
   await db.query('COMMIT');return res.status(200).json({ok:true,available:req.body.available});
  }
  if(action==='arena-join'||action==='arena-leave'){
   const mission=req.body.mission;
   if(![5,10].includes(mission))throw Object.assign(Error('Selecione uma arena válida.'),{status:400});
   const lobby=await db.query("SELECT mission FROM public.pit_coliseum_arena_lobbies WHERE room_code=$1 AND mission=$2 AND status='waiting'",[user.room,mission]);
   if(!lobby.rowCount)throw Object.assign(Error('A sala de espera não está aberta.'),{status:409});
   if(action==='arena-join'){
    if(live.current_stage<mission||!await profile(db,user.id)||
       mission===10&&await approved(db,user.id)!==10)
     throw Object.assign(Error('Salve seu personagem e aguarde a missão da arena ser liberada.'),{status:403});
    const count=await db.query("SELECT count(*)::int AS n FROM public.pit_coliseum_arena_joins WHERE room_code=$1 AND mission=$2",[user.room,mission]);
    const already=await db.query("SELECT 1 FROM public.pit_coliseum_arena_joins WHERE room_code=$1 AND mission=$2 AND student_id=$3",[user.room,mission,user.id]);
    if(!already.rowCount&&Number(count.rows[0].n)>=30)throw Object.assign(Error('A arena atingiu o limite de 30 jogadores.'),{status:409});
    await db.query("INSERT INTO public.pit_coliseum_arena_joins(room_code,mission,student_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",[user.room,mission,user.id]);
   }else{
    await db.query("DELETE FROM public.pit_coliseum_arena_joins WHERE room_code=$1 AND mission=$2 AND student_id=$3",[user.room,mission,user.id]);
   }
   await db.query('COMMIT');return res.status(200).json({ok:true,mission,joined:action==='arena-join'});
  }
  if(!live.duels_enabled)throw Object.assign(Error('Duelos pausados pelo professor.'),{status:403});
  if(!await eligible(db,user.id,live.current_stage)||!await profile(db,user.id))
   throw Object.assign(Error('Entregue sua missão e salve o personagem antes do duelo.'),{status:403});
  await expire(db,user.room);
  if(action==='invite'){
   const target=req.body.targetId;
   if(!validUUID(target)||target===user.id)throw Object.assign(Error('Escolha outro aluno.'),{status:400});
   const own=await db.query("SELECT 1 FROM public.pit_coliseum_presence WHERE student_id=$1 AND room_code=$2 "+
    "AND available=true AND seen_at>now()-interval '60 seconds'",[user.id,user.room]);
   const peer=await db.query(
    "SELECT 1 FROM public.pit_coliseum_presence p JOIN public.pit_students s ON s.id=p.student_id "+
    "JOIN public.pit_student_heroes h ON h.student_id=s.id JOIN public.pit_student_stages st "+
    "ON st.student_id=s.id AND st.stage=$3 AND st.status IN ('submitted','approved') "+
    "WHERE p.student_id=$1 AND p.room_code=$2 AND p.available=true "+
    "AND p.seen_at>now()-interval '60 seconds'",[target,user.room,live.current_stage]);
   if(!own.rowCount||!peer.rowCount)throw Object.assign(Error('O colega não está disponível para duelar.'),{status:409});
   const pending=await db.query("SELECT id FROM public.pit_coliseum_invites WHERE room_code=$1 AND status='pending' "+
    "AND (sender_id=ANY($2::uuid[]) OR receiver_id=ANY($2::uuid[])) LIMIT 1",[user.room,[user.id,target]]);
   if(pending.rowCount)throw Object.assign(Error('Um dos alunos já possui um convite pendente.'),{status:409});
   const rate=await db.query("SELECT 1 FROM public.pit_coliseum_invites WHERE sender_id=$1 AND created_at>now()-interval '8 seconds' LIMIT 1",[user.id]);
   if(rate.rowCount)throw Object.assign(Error('Aguarde alguns segundos antes de enviar outro convite.'),{status:429});
   const insert=await db.query("INSERT INTO public.pit_coliseum_invites(room_code,sender_id,receiver_id) VALUES($1,$2,$3) RETURNING id",[user.room,user.id,target]);
   await db.query('COMMIT');return res.status(201).json({ok:true,inviteId:insert.rows[0].id});
  }
  if(action==='respond'){
   const id=req.body.inviteId,decision=req.body.decision;
   if(!validUUID(id)||!['accept','decline','cancel'].includes(decision))
    throw Object.assign(Error('Resposta inválida.'),{status:400});
   const iq=await db.query('SELECT * FROM public.pit_coliseum_invites WHERE id=$1 AND room_code=$2 FOR UPDATE',[id,user.room]);
   const i=iq.rows[0];
   if(!i||i.status!=='pending'||new Date(i.expires_at).getTime()<Date.now())
    throw Object.assign(Error('Convite indisponível ou expirado.'),{status:409});
   if(decision==='cancel'&&i.sender_id!==user.id||decision!=='cancel'&&i.receiver_id!==user.id)
    throw Object.assign(Error('Você não pode responder a este convite.'),{status:403});
   if(decision!=='accept'){
    const status=decision==='cancel'?'cancelled':'declined';
    await db.query("UPDATE public.pit_coliseum_invites SET status=$2,responded_at=now() WHERE id=$1",[id,status]);
    await db.query('COMMIT');return res.status(200).json({ok:true,status});
   }
   if(!await eligible(db,i.sender_id,live.current_stage))
    throw Object.assign(Error('O outro aluno ainda não está apto para este duelo.'),{status:409});
   const mission=live.current_stage===10?
    (await approved(db,i.sender_id)===10&&await approved(db,i.receiver_id)===10?10:5):5;
   const roster=await entrants(db,user.room,[i.sender_id,i.receiver_id],mission);
   const match=await insertMatch(db,user.room,'duel',mission,roster);
   await db.query("UPDATE public.pit_coliseum_invites SET status='accepted',match_id=$2,responded_at=now() WHERE id=$1",[id,match.id]);
   await db.query('COMMIT');return res.status(200).json({ok:true,status:'accepted',matchId:match.id});
  }
  throw Object.assign(Error('Ação de aluno desconhecida.'),{status:404});
 }catch(e){await db.query('ROLLBACK').catch(()=>{});throw e}
}
function createHandler(database=pool){
 return async function handler(req,res){
  res.setHeader('Cache-Control','private,no-store');res.setHeader('Vary','Origin');
  res.setHeader('X-Content-Type-Options','nosniff');
  const origin=req.headers.origin;
  if(origin&&ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Headers','Content-Type,X-PIT-Student-Token,X-PIT-Teacher-Pin,X-PIT-Room');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  if(origin&&!ORIGINS.has(origin))return reply(res,403,'Origem não autorizada.');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(!['GET','POST'].includes(req.method))return reply(res,405,'Método não permitido.');
  if(!process.env.DATABASE_URL||!process.env.PIT_TEACHER_PIN)return reply(res,503,'Coliseu não configurado.');
  if(req.method==='POST'&&origin!=='https://dev-gabriel-exe.github.io')
   return reply(res,403,'Alterações permitidas somente pelo portal oficial da oficina.');
  let client;
  try{
   client=await database.connect();
   const user=await authenticate(client,req);
   if(!user)return reply(res,401,'Entre com seu cadastro da oficina.');
   if(!user.room||!ROOMS.includes(user.room))return reply(res,400,'Turma inválida.');
   const state=await roomState(client,user.room);
   if(!state)return reply(res,503,'Coliseu não inicializado para esta turma.');
   return await callAction(client,user,state,req,res);
  }catch(e){console.error('coliseum:',e.code||e.name);
   return reply(res,e.status||503,e.status?e.message:'Coliseu temporariamente indisponível.');
  }finally{client?.release()}
 };
}
module.exports=createHandler();
module.exports.createHandler=createHandler;
module.exports.battleBuild=battleBuild;
module.exports.simulate=simulate;
