'use strict';
/* FUN-10: offline, read-only security and release safety assertions.
 * Does not claim penetration testing, production backup or live DB validation.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(f,'utf8');
const classroom=read('chat-api/api/classroom.js'),chat=read('chat-api/api/chat.js'),app=read('v3/app.js');
for(const [name,src] of [['classroom',classroom],['chat',chat]]){
 assert(src.includes('timingSafeEqual'),'constant-time PIN comparison '+name);
 assert(src.includes('ORIGINS'),'explicit CORS origin allowlist '+name);
 assert(src.includes('Cache-Control'),'no-cache response '+name);
 assert(src.includes('X-Content-Type-Options'),'nosniff '+name);
 assert(src.includes('token_hash'),'hashed student token lookup '+name);
 assert(src.includes('process.env.PIT_TEACHER_PIN'),'teacher PIN from environment '+name);
 assert(src.includes('process.env.DATABASE_URL'),'database from environment '+name);
}
assert(classroom.includes("if(n>state.current_stage)")&&classroom.includes("if(n>released.current_stage)"),'server rejects locked submissions and forged heartbeat');
assert(classroom.includes("AND status='submitted'"),'approval only after submitted evidence');
assert(classroom.includes("NOT IN ('submitted','approved')"),'pending/approved evidence cannot be overwritten');
assert(classroom.includes("clean(req.body?.evidence,750)"),'evidence length bound');
assert(chat.includes("const MAX_BODY = 1200"),'chat body bound');
assert(chat.includes("if(count.rows[0].n>=12)"),'chat rate limit');
assert(chat.includes("if(recently.rows[0].n>=15)"),'join rate limit');
assert(chat.includes("if(count.rows[0].n>=160)"),'classroom capacity bound');
assert(/\\besc\\s*=\\s*s\\s*=>/.test(app)||app.includes('function esc('),'HTML escaping helper');
assert(app.includes('sessionStorage.setItem(\'pit_teacher_pin\''),'PIN uses sessionStorage rather than persistent localStorage');
assert(!app.includes("localStorage.setItem('pit_teacher_pin'"),'teacher PIN never written to persistent localStorage');
for(const f of ['index.html','aluno-v3.html','professor-v3.html']){
 const html=read(f);
 assert(/lang="pt-BR"/i.test(html),'Portuguese lang attribute '+f);
 assert(/<meta[^>]+viewport/i.test(html),'responsive viewport '+f);
}
assert(read('index.html').includes('skip-link'),'keyboard skip link');
assert(read('v3/diablo-theme.css').includes('prefers-reduced-motion')||read('v3/style.css').includes('prefers-reduced-motion'),'reduced motion preference');
const kits=read('v3/quick-kits.js');
assert(kits.includes('procedurais originais'),'original asset provenance');
assert(kits.includes('Não é um projeto GDevelop pronto'),'no false editable project claim');
const filenames=fs.readdirSync('v3/assets/missions').filter(n=>/^missao-\d\d\.webp$/.test(n));
assert.equal(filenames.length,10,'all 10 cinematic posters exist');
for(const name of filenames){
 const bytes=fs.statSync(path.join('v3/assets/missions',name)).size;
 assert(bytes>500&&bytes<3*1024*1024,'poster size budget '+name);
}
for(const dir of ['.','chat-api','v3']){
 const suspicious=fs.readdirSync(dir).filter(n=>/^\.env$|\.pem$|^id_rsa$|^credentials\.json$/i.test(n));
 assert.deepEqual(suspicious,[],'no obvious secret file in '+dir);
}
console.log('PASS FUN-10 static: auth/CORS, locked stage, review guards, bounds, accessible shell, reduced motion, provenance, 10 optimized posters and no obvious credential files');
console.log('LIMIT: static checks only; no pentest, live dependency scan, database backup or production rollback executed');
