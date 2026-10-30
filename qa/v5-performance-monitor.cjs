'use strict';
// G.1 diagnostics are passive. No rendering quality, life, or combat writes.
const assert=require('node:assert/strict');
const {createMonitor}=require('../v5/performance-monitor.js');
const m=createMonitor({windowSize:4});
assert.equal(m.current(),null);
const r0=m.sample({fps:60,drawCalls:410,triangles:285000,geometries:400,textures:67,
 frameMs:17.2,modelsLoaded:30,modelsExpected:30,active:30});
assert.equal(r0.status,'measured');assert.equal(r0.p10Fps,60);
assert.equal(r0.peakFrameMs,17.2);assert.equal(r0.samples,1);
const readings=[42,29,16,55,30].map((fps,i)=>m.sample({
 fps,drawCalls:410-i*20,triangles:280000,geometries:400,textures:67,
 frameMs:[21,51,78,24,31][i],modelsLoaded:30,modelsExpected:30,active:26-i*5
}));
assert.equal(readings[1].status,'review');
assert.equal(readings[2].status,'critical');
assert.equal(readings.at(-1).status,'measured');
assert.equal(m.current().p10Fps,16,'P10 uses bounded frame window');
assert.equal(m.current().peakFrameMs,78);
assert.equal(m.current().longFrameWindows,2);
assert.equal(m.current().samples,6);
const gpuLost=m.sample({fps:0,drawCalls:0,contextLost:true});
assert.equal(gpuLost.status,'context-lost');
const report=m.report({seed:4175863657,players:30,quality:'auto',userAgent:'Lab Linux Chromium'});
assert.equal(report.kind,'pit-v5-perf-g1');
assert.equal(report.scope,'local-browser');
assert.equal(report.players,30);
assert.equal(report.sample.status,'context-lost');
assert(!JSON.stringify(report).includes('nome do aluno'));
assert.equal(Object.isFrozen(report),true);
m.reset();assert.equal(m.current(),null);
const invalid=m.sample({fps:NaN,drawCalls:-900,triangles:Infinity,frameMs:-4});
assert.equal(invalid.fps,0);assert.equal(invalid.drawCalls,0);assert.equal(invalid.frameMs,0);
assert.equal(invalid.status,'measuring');
assert.equal(Object.isFrozen(invalid),true);
console.log('PASS G.1: bounded FPS P10, GPU resource counts, long-frame telemetry, context loss and privacy-safe report.');
