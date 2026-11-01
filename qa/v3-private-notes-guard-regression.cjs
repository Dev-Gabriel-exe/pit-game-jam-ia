'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('v3/teacher-private-notes-guard.js','utf8');
const listeners = {document:new Map(),window:new Map()};
const notes = [{open:false},{open:false}];
function on(scope,name,fn){if(!listeners[scope].has(name))listeners[scope].set(name,[]);listeners[scope].get(name).push(fn)}
function dispatch(scope,name,event={}){for(const fn of listeners[scope].get(name)||[])fn(event)}
const document = {
 hidden:false,
 addEventListener:(name,fn)=>on('document',name,fn),
 querySelectorAll:(selector)=>{
  assert.equal(selector,'details.pit-private-teacher-notes[open]');
  return notes.filter(note=>note.open);
 }
};
const window={addEventListener:(name,fn)=>on('window',name,fn)};
vm.runInNewContext(source,{document,window},{filename:'teacher-private-notes-guard.js',timeout:1000});
assert.equal(typeof window.PIT_PRIVATE_NOTES_GUARD?.closeAll,'function');
for(const event of ['DOMContentLoaded','pageshow','pagehide']){
 notes[0].open=true;notes[1].open=true;
 dispatch(event==='DOMContentLoaded'?'document':'window',event);
 assert.deepEqual(notes.map(x=>x.open),[false,false],event+' must close both private notes');
}
notes[0].open=true;
dispatch('document','keydown',{key:'Escape'});
assert.equal(notes[0].open,false,'Escape closes private note');
notes[0].open=true;
dispatch('document','click',{target:{closest:selector=>selector.includes('[data-stage]')?{}:null}});
assert.equal(notes[0].open,false,'stage navigation closes private note');
notes[0].open=true;
document.hidden=true;
dispatch('document','visibilitychange');
assert.equal(notes[0].open,false,'hidden tab closes private note');
notes[0].open=true;notes[1].open=true;
notes[1].matches=selector=>selector==='details.pit-private-teacher-notes';
dispatch('document','toggle',{target:notes[1]});
assert.deepEqual(notes.map(x=>x.open),[false,true],'opening a note closes other private notes');
console.log('PASS V3 private notes guard: restore, page exit, keyboard, navigation and tab visibility');
