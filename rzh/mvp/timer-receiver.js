'use strict';
let remote=null;
readState=function(){return remote?{...remote}:{...initial(),index:0,running:false,remaining:1200000,deadline:null,waiting:true,external:true}};
writeState=function(){};control=function(){};
project=function(s){return {...s,remaining:s.running?Math.max(0,s.deadline-Date.now()):s.remaining}};
window.Receiver={update(g,skin){
 const steps=g?.stages||[{kind:'level',level:1,sb:25,bb:50,duration:1200}];
 STAGES.splice(0,STAGES.length,...steps.map(s=>({level:s.level,small:s.sb,big:s.bb,rest:s.kind==='break',minutes:s.duration/60})));
 const c=g?.clock;remote={external:true,version:1,index:c?.index||0,running:!!c&&!c.paused&&c.mode!=='sustain'&&g.status==='active',remaining:c?.remaining*1000||0,deadline:c?.deadline,paused:!!c?.paused,pausedAt:c?.pausedAt??null,pauseDurationSec:c?.pauseDurationSec??null,done:false,skin,sustain:c?.mode==='sustain',waiting:!g,finished:g?.status==='finished'};lastStage='';render();
}};
addEventListener('load',()=>parent.postMessage({type:'frame-ready'},location.origin));
