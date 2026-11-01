/* 当前赛事单独展示，不写入旧版统计模型，避免自动触发其中的勋章和奖励算法。 */
(function(){
 'use strict';const B=RZHBridge,esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let themes={};
 function skin(){const t=themes[B.theme()];if(!t)return;const s=document.documentElement.style;for(const [k,v]of Object.entries({bg:t.bg,card:t.card,ink:t.text,muted:t.materials.muted,soft:t.text,border:t.border,line:t.border,accent:t.accent,metal:t.materials.metal,well:t.materials.well,raised:t.materials.raised,'metal-light':t.materials.metal,on:t.onAccent})){s.setProperty('--'+k,v)}document.documentElement.dataset.theme=B.theme();document.documentElement.style.colorScheme=['flame','neon'].includes(B.theme())?'dark':'light'}
 function update(){
   B.mountNavigation();
   const old=document.getElementById('currentTournament');
   if(location.hash!=='#/events'){old?.remove();return}
   const astate=B.read(B.playerKey,null),session=B.read(B.playerKey+':session',null)||JSON.parse(sessionStorage.getItem(B.playerKey+':session')||'null');
   const account=astate?.accounts.find(a=>a.id===session?.accountId);if(!account)return;
   const d=B.read(B.dealerKey,null),p=d?.players.find(p=>p.accountId===account.id),games=d?.games.filter(g=>g.entries.some(e=>e.pid===p?.id&&e.status!=='void'))||[];
   const g=games.findLast(g=>g.status==='active')||games.at(-1),rank=g?.result?.pids.indexOf(p?.id);
   const entry=g?.entries.findLast(e=>e.pid===p?.id&&e.status!=='void');
   const rows=`<h2>本店参赛</h2><p style="margin-top:10px">可用参赛次数 <b>${p?.credits??0}</b></p><p class="hint">${g?`${g.table}号桌 · ${esc(g.label)} · ${g.status==='active'?(entry?.status==='eliminated'?'本次已淘汰':'比赛进行中'):g.status==='finished'?'已正式结束':'已撤销'}`:'尚未参加本店赛事'}</p>${g?.result?`<p style="margin-top:8px">${rank>=0?'本场名次：'+['冠军','亚军','季军'][rank]:'本场只登记前三名'} · 结果版本 ${g.result.version}</p>`:''}<p class="hint" style="margin-top:8px">参赛次数与门票分别记录。当前赛果尚不计入下方历史统计或自动授勋。</p>`;
   if(old){if(old.innerHTML!==rows)old.innerHTML=rows;return}
   const host=document.querySelector('.identity')||document.querySelector('.page');if(!host)return;
   const panel=document.createElement('section');panel.id='currentTournament';panel.className='card space-top space-bottom';panel.innerHTML=rows;host.after(panel);
 }
 fetch('themes.json').then(r=>r.json()).then(x=>{themes=x;skin()});
 addEventListener('rzh-theme',skin);addEventListener('storage',e=>{if([B.dealerKey,B.playerKey].includes(e.key))update()});addEventListener('hashchange',()=>setTimeout(update,0));
 new MutationObserver(()=>update()).observe(document.getElementById('app'),{childList:true});update();
})();
