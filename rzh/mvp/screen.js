'use strict';
const B=RZHBridge,Q=new URLSearchParams(location.search),table=Number(Q.get('table'))||1,role=Q.get('role')==='timer'?'timer':'live';
const $=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const POS={1:[74,14],2:[89,37],3:[89,63],4:[76,86],5:[50,92],6:[24,86],7:[11,63],8:[11,37],9:[26,14]};
let themes={},ready=false,enabled=false,owner=false,boot=true,current=null,run=0,busy=false,lastPresentation='',lastResult='',lastSignature='',lastSkin='';
const receiver=()=>$('#frame').contentWindow?.Receiver;
function read(){return B.read(B.dealerKey,null)}
function update(mutator){const d=read();if(!d)return;mutator(d);localStorage.setItem(B.dealerKey,JSON.stringify(d));}
function projected(g){if(!g)return null;g=structuredClone(g);const c=g.clock;if(g.status==='active'&&!c.paused&&c.mode!=='sustain'){while(c.deadline<=Date.now()){if(c.index+1>=g.stages.length){c.mode='sustain';break}c.index++;c.deadline+=g.stages[c.index].duration*1000;c.remaining=g.stages[c.index].duration}}return g}
function player(d,id){const p=d.players.find(p=>p.id===id);return{id:p.id,name:p.name,avatar:p.avatar||'',glyph:p.name.slice(-1),suit:'♠',def:!p.avatar}}
function skin(){const key=B.theme(),t=themes[key];if(!t)return;if(lastSkin!==key){lastSkin=key;for(const[k,v]of Object.entries({bg:['flame','neon'].includes(key)?t.bg:t.materials.well,card:t.card,ink:t.text,metal:t.materials.metal,accent:t.accent}))document.documentElement.style.setProperty('--'+k,v);$('#themeName').textContent=t.name}if(ready)receiver()?.skin?.(key)}
function seatMap(d,seats){return `<div class="table-map"><div class="felt"></div><div class="felt-label">joker</div>${Object.entries(POS).map(([n,[x,y]])=>{const p=d?.players.find(p=>p.id===seats[n]);return `<div class="seat" style="left:${x}%;top:${y}%">${p?.avatar?`<img src="${esc(p.avatar)}" alt="${esc(p.name)}的头像">`:`<i>${p?esc(p.name.slice(-1)):'＋'}</i>`}<b>${p?esc(p.name):'待入座'}</b><small>${n}号位</small></div>`}).join('')}<div class="dealer">右手 ← 👤 → 左手<br>荷官面向桌内 ↓</div></div>`}
function render(){
 const d=read(),pres=d?.presentations[table],g=projected(d?.games.find(g=>g.id===pres?.game));skin();$('#title').textContent=`· ${table}号桌 · ${role==='timer'?'倒计时':'直播与播报'}`;
 $('#sound').hidden=role==='timer'||enabled;$('#silent').hidden=role==='timer'||enabled;
 if(role==='timer'){if(ready)receiver()?.update(g,B.theme());$('#frame').hidden=false;$('#layer').hidden=true;return}
 const nextSignature=JSON.stringify([pres,d?.drafts[pres?.account]?.seats,d?.players.map(p=>[p.id,p.name,p.avatar]),g?.result,g?.status,lastResult]);
 if(nextSignature!==lastSignature){lastSignature=nextSignature;const seating=!g||pres?.mode==='seating';
  if(seating){$('#frame').hidden=true;$('#layer').hidden=false;$('#layer').innerHTML=`<h1>${table}号桌 · 等待开局</h1>${seatMap(d,d?.drafts[pres?.account]?.seats||{})}`}
  else if(g.result&&['done','failed'].includes(g.resultPlayback?.status)&&lastResult!==g.resultPlayback.id&&!current){$('#frame').hidden=true;$('#layer').hidden=false;$('#layer').innerHTML=`<h1>本场正式前三名</h1><div class="podium">${[2,0,1].map(i=>{const p=player(d,g.result.pids[i]);return `<div class="rank"><strong>${['冠军','亚军','季军'][i]}</strong>${p.avatar?`<p><img src="${esc(p.avatar)}" alt=""></p>`:''}<b>${esc(p.name)}</b></div>`}).join('')}</div><p>结果版本 ${g.result.version} · 等待下一场准备</p>`}
  else{$('#frame').hidden=false;$('#layer').hidden=true}
 }
}
function itemFor(d,b,g){const base={id:'broadcast:'+b.id+':'+b.completed,tpl:'dyn',skin:B.theme(),label:b.title,status:'pending',t:new Date().toLocaleTimeString('zh-CN',{hour12:false})};
 if(b.type==='text')return {...base,scene:'notice',d:{text:b.body,times:1}};
 if(b.type==='hand')return {...base,scene:'hand',d:{A:player(d,b.a),hand:({'皇家同花顺':'rf','同花顺':'sf','四条':'quads','葫芦':'fh','同花':'flush'})[b.hand]}};
 return {...base,scene:b.b?'killAB':'killA',d:{A:player(d,b.a),...(b.b?{B:player(d,b.b)}:{})}};
}
async function stopCurrent(){run++;await receiver()?.stop?.();current=null;busy=false;}
async function pump(){
 if(!owner||!enabled||!ready||busy)return;
 const d=read();if(!d)return;const pres=d.presentations[table],g=d.games.find(g=>g.id===pres?.game);
 if(boot){boot=false;update(x=>{for(const b of x.broadcasts){if(b.table===table&&b.status==='playing'){b.status='failed';b.error='前端播放页中断，请核对后手动补播'}}for(const game of x.games){if(game.table===table&&game.resultPlayback?.status==='playing')game.resultPlayback.status='failed'}});return}
 if(!g||pres.mode==='seating')return;
 let b=g.status==='active'?d.broadcasts.filter(b=>b.table===table&&b.game===g.id&&['waiting','queued'].includes(b.status)&&b.readyAt<=Date.now()).sort((a,b)=>a.created-b.created)[0]:null;
 const finale=!b&&g.status==='finished'&&g.resultPlayback?.status==='ready';if(!b&&!finale)return;
 const token=++run;busy=true;
 const id=finale?g.resultPlayback.id:b.id;current={id,game:g.id,finale};
 update(x=>{if(finale)x.games.find(x=>x.id===g.id).resultPlayback.status='playing';else x.broadcasts.find(x=>x.id===id).status='playing'});
 $('#status').textContent=finale?'正在展示正式赛果':'正在播放 · '+b.title;
 try{
  const count=finale?1:b.repeats-b.completed;
  for(let i=0;i<count;i++){
   if(token!==run)return;const latest=read(),bg=latest.games.find(x=>x.id===g.id),bb=latest.broadcasts.find(x=>x.id===id);
   const item=finale?{id:'result:'+id,tpl:'dyn',skin:B.theme(),scene:'finale',label:'先冠军后前三',status:'pending',t:'',d:{A:player(latest,g.result.pids[0]),P1:player(latest,g.result.pids[0]),P2:player(latest,g.result.pids[1]),P3:player(latest,g.result.pids[2])}}:itemFor(latest,bb,bg);
   await receiver().preload(Object.values(item.d).filter(p=>p&&typeof p==='object'&&p.id));
   if(token!==run)return;lastSignature='';render();receiver().enqueue(item);
   let status;
   do{await new Promise(r=>setTimeout(r,100));if(token!==run)return;status=receiver().state().log.find(x=>x.id===item.id)?.status}while(!['done','error','aborted'].includes(status));
   if(token!==run)return;
   if(status!=='done')throw Error('音画未完整完成，请核对现场后手动补播');
   update(x=>{if(finale){const p=x.games.find(x=>x.id===g.id).resultPlayback;if(p.id===id){p.status='done';lastResult=id}}else{const bb=x.broadcasts.find(x=>x.id===id);if(bb.status==='playing'){bb.completed++;if(bb.completed>=bb.repeats)bb.status='completed'}}});
  }
  $('#status').textContent=finale?'正式赛果展示完成':'本条已完成';
 }catch(e){if(token===run){update(x=>{if(finale)x.games.find(x=>x.id===g.id).resultPlayback.status='failed';else{const bb=x.broadcasts.find(x=>x.id===id);bb.status='failed';bb.error=e.message}});$('#status').textContent=e.message}}
 finally{if(token===run){current=null;busy=false;lastSignature='';render()}}
}
async function check(){
 const d=read(),pres=d?.presentations[table],signature=pres?.game||('seating:'+pres?.account);
 if(ready&&lastPresentation&&lastPresentation!==signature){await stopCurrent();lastSignature='';lastResult=''}lastPresentation=signature;
 if(current){const b=d?.broadcasts.find(b=>b.id===current.id);if(!current.finale&&(!b||b.status!=='playing'))await stopCurrent()}
 render();pump();
}
$('#sound').onclick=()=>{if(!ready)return;receiver().unlock(false);enabled=true;$('#note').textContent='设备朗读与程序音效已启用 · 实际声音须在本播放设备核对';check()};
$('#silent').onclick=()=>{if(!ready)return;receiver().unlock(true);enabled=true;$('#note').textContent='仅画面预览 · 此模式的完成不代表语音已播放';check()};
$('#full').onclick=()=>document.documentElement.requestFullscreen?.();
addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==$('#frame').contentWindow)return;if(e.data.type==='frame-ready'){ready=true;check()}});
addEventListener('storage',e=>{if([B.dealerKey,B.playerKey].includes(e.key))check()});addEventListener('rzh-theme',()=>{lastSkin='';check()});
fetch('themes.json').then(r=>r.json()).then(x=>{themes=x;$('#frame').src=role==='timer'?'timer.html?screen=1':'animation.html';render()});
if(role==='live'){
 if(navigator.locks)navigator.locks.request(B.prefix+':live:'+table,async()=>{owner=true;$('#status').textContent='本桌播放页已就绪';await new Promise(()=>{})});
 else{owner=true;$('#status').textContent='此浏览器不支持播放页互斥，请只打开一块直播屏'}
}
setInterval(check,400);
