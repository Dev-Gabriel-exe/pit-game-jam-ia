'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../v5/teacher-arena-lab.html'),'utf8');
const script=fs.readFileSync(path.join(__dirname,'../v5/teacher-arena-lab.js'),'utf8');
const core=fs.readFileSync(path.join(__dirname,'../v5/teacher-arena-release-lab.js'),'utf8');
for(const id of ['teacherEnabled','mission','count','roster','release','prepare','start','pause','abort',
 'reset','arenaStage','arenaStatus','stagePlaceholder','eligibleCount','excludedCount',
 'totalCount','models','alive','result','battleLog'])assert(html.includes('id="'+id+'"'),'missing '+id);
for(const snippet of ['teacher-arena-release-lab.js','progression-contract-h0.js','character-assets.js',
 'teacher-arena-lab.js','type="importmap"','30 heróis','Missão 10'])
 assert(html.includes(snippet),'missing '+snippet);
for(const snippet of ["import {createStage} from './arena-three.js'","gate.eligible(state,policy)",
 "gate.createRoster(engine","gate.createState(","mutate('release'","mutate('start'","mutate('abort'",
 "stage.fighters(roster","stage.enableAutoCamera(true)","loaded===roster.length","stage.resume()",
 "stage.dispose()","stage.simulation.result()","policy=h0.createPolicy(engine.TALENTS)"])
 assert(script.includes(snippet),'missing '+snippet);
for(const danger of [/\bfetch\s*\(/,/localStorage/,/sessionStorage/,/\bWebSocket\b/,/\/api\//])
 assert(!danger.test(script)&&!danger.test(core),'no production read/write');
assert(core.includes("m10ArenaAdapter(candidate)")&&core.includes("m5ArenaAdapter(candidate)"));
console.log('PASS fictional collective UI static: teacher release, H0 locks, GLB ready, 30 KayKit stage, dispose; no real accounts');
