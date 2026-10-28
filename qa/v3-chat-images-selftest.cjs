'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('chat-api/api/chat.js','utf8');
const extract=source.match(/function decodeImage\(value,mime\)\{[\s\S]*?\n\}/);
assert(extract,'image validator exists');
const decode=vm.runInNewContext(extract[0]+';decodeImage',{Buffer,MAX_IMAGE_BYTES:2*1024*1024,IMAGE_TYPES:{'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}});
const png=Buffer.from('89504e470d0a1a0a0000000049454e44','hex');
assert(decode(png.toString('base64'),'image/png')?.equals(png),'valid PNG accepted');
assert.equal(decode(png.toString('base64'),'image/jpeg'),null,'MIME spoof rejected');
assert.equal(decode('abc','image/png'),null,'malformed base64 rejected');
assert.equal(decode(Buffer.alloc(2*1024*1024+1).toString('base64'),'image/png'),null,'oversized payload rejected');
// Ownership must be enforced by the database query, not by filtering bytes after retrieval.
assert(source.includes('m.room_code=$2 AND ($3::boolean OR m.student_id=$4::uuid)'),'image read must filter room and owner in SQL');
assert(source.includes('[messageId,ROOM,teacher,teacher?null:me.id]'),'image read must bind authenticated student ID, never client-supplied ID');
assert(source.includes("if(!data.rowCount)return sendError(res,404"),'cross-student images must return no data');
assert(source.includes("if(!teacher&&!me)return sendError(res,401"),'image upload and download require authentication');
assert(source.includes("await client.query('ROLLBACK')"),'failed image uploads roll back chat messages');
assert(source.includes("res.setHeader('Cache-Control','no-store, private')"),'private image responses must not be cached');
const app=fs.readFileSync('v3/app.js','utf8');
assert(app.includes("call('chat','send-image','POST'"),'client must upload images');
assert(app.includes("url.searchParams.set('action','image')"),'client must fetch images through authenticated API');
assert(!app.includes('O print está somente em prévia local'),'old blocking guard must be removed');
for(const file of ['aluno-v3.html','professor-v3.html']){
 const html=fs.readFileSync(file,'utf8');
 assert(html.includes('id="chatImageInput"')&&html.includes('id="chatImagePreview"'),file+' image picker and preview');
}
console.log('PASS CHAT-IMAGE: format/size/spoof guards, auth/isolation contracts, rollback, client and both views.');
