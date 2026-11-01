'use strict';
let remote=null;
readState=function(){return remote?{...remote}:{...initial(),index:0,running:false,remaining:1200000,deadline:null}};
writeState=function(){};control=function(){};
project=function(s){return {...s,remaining:s.running?Math.max(0,s.deadline-Date.now()):s.remaining}};
const originalRender=render;
render=function(){originalRender();if(remote?.sustain){$('#statusBadge').textContent='最后级持续';$('#countdown').textContent='持续进行';$('#clockNote').textContent='保持本级盲注，等待正式结赛'}else if(remote?.finished){$('#statusBadge').textContent='本场已结束';$('#clockNote').textContent='正式结果已保存'}else if(remote?.waiting){$('#statusBadge').textContent='等待开局';$('#clockNote').textContent='等待荷官正式确认开局'}};
window.Receiver={update(g,skin){
 const steps=g?.stages||[{kind:'level',level:1,sb:25,bb:50,duration:1200}];
 STAGES.splice(0,STAGES.length,...steps.map(s=>({level:s.level,small:s.sb,big:s.bb,rest:s.kind==='break',minutes:s.duration/60})));
 const c=g?.clock;remote={version:1,index:c?.index||0,running:!!c&&!c.paused&&c.mode!=='sustain'&&g.status==='active',remaining:c?.remaining*1000||0,deadline:c?.deadline,done:false,skin,sustain:c?.mode==='sustain',waiting:!g,finished:g?.status==='finished'};lastStage='';render();
}};
addEventListener('load',()=>parent.postMessage({type:'frame-ready'},location.origin));
