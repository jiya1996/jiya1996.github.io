/* 全屏休息／暂停展示层，只读现有赛事钟，不另开一只倒计时。 */
(function(){
 'use strict';
 const clock=document.getElementById('clockScreen');if(!clock)return;
 const overlay=document.createElement('section');overlay.id='timerIntermission';overlay.className='timer-intermission';overlay.hidden=true;overlay.setAttribute('aria-label','休息与暂停状态');
 overlay.innerHTML=`<div class="intermission-brand">JOKER · TOURNAMENT CLOCK</div><svg class="intermission-hourglass" viewBox="0 0 220 260" aria-hidden="true"><defs><linearGradient id="intermissionMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--m-hi)"/><stop offset=".5" style="stop-color:var(--m-mid)"/><stop offset="1" style="stop-color:var(--m-lo)"/></linearGradient><linearGradient id="intermissionGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".2"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".025"/><stop offset="1" stop-color="#ffffff" stop-opacity=".15"/></linearGradient><clipPath id="intermissionInside"><path d="M55 35h110c0 46-15 68-44 91v8c29 23 44 45 44 91H55c0-46 15-68 44-91v-8C70 103 55 81 55 35Z"/></clipPath></defs><path d="M45 29v202M175 29v202" fill="none" stroke="url(#intermissionMetal)" stroke-width="8" stroke-linecap="round"/><path d="M55 35h110c0 46-15 68-44 91v8c29 23 44 45 44 91H55c0-46 15-68 44-91v-8C70 103 55 81 55 35Z" fill="url(#intermissionGlass)" stroke="url(#intermissionMetal)" stroke-width="3"/><g clip-path="url(#intermissionInside)"><path d="M52 69h116c-7 23-22 42-58 62C74 111 59 92 52 69Z" fill="var(--m-mid)" opacity=".88"/><path d="m110 174 65 57H45Z" fill="var(--m-mid)"/><path class="sand-stream" d="M110 130v48" stroke="var(--m-hi)" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/><path d="M67 42c0 27 4 41 12 56M67 181c-5 12-7 24-7 36" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="3" stroke-linecap="round"/></g><rect x="29" y="17" width="162" height="19" rx="8" fill="url(#intermissionMetal)"/><rect x="29" y="224" width="162" height="19" rx="8" fill="url(#intermissionMetal)"/></svg><h2 class="intermission-title">休息中</h2><div class="intermission-time" role="timer" aria-live="off"></div><div class="intermission-state" role="status" aria-live="polite"></div><p class="intermission-note"></p>`;
 clock.appendChild(overlay);
 const time=overlay.querySelector('.intermission-time'),state=overlay.querySelector('.intermission-state'),note=overlay.querySelector('.intermission-note');
 const text=(el,value)=>{if(el.textContent!==value)el.textContent=value};
 function sync(){
  // 直接读取赛事钟的语义状态，不再由瞬时DOM文案推断是否暂停。
  const s=project(readState()),phase=STAGES[s.index];
  const excluded=!!(s.waiting||s.finished||s.sustain||s.done);
  const rest=!!phase?.rest,paused=!s.running&&!excluded;
  const hidden=excluded||(!rest&&!paused);
  if(overlay.hidden!==hidden)overlay.hidden=hidden;
  if(hidden)return;
  const pausedValue=String(paused),kind=rest?'break':'pause';
  if(overlay.dataset.paused!==pausedValue)overlay.dataset.paused=pausedValue;
  if(overlay.dataset.kind!==kind)overlay.dataset.kind=kind;
  text(time,format(s.remaining));
  text(state,rest?(paused?'休息已暂停':'赛事休息倒计时'):'比赛已暂停');
  const next=STAGES[s.index+1];
  const title=next&&!next.rest?'LV'+next.level+' · '+zh(next.small)+' / '+zh(next.big):'';
  text(note,paused?'剩余时间已冻结，等待荷官继续':title?'休息结束后进入 '+title:'休息结束后自动进入下一盲注级');
 }
 let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;sync()})};
 // 原稿的周期回调保存了旧render引用；同时监听原时钟节点，独立页也能逐秒更新。
 const observer=new MutationObserver(schedule);
 for(const id of ['countdown','statusBadge']){const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,characterData:true,subtree:true})}
 observer.observe(clock,{attributes:true,attributeFilter:['data-rest','data-paused','data-done']});
 const original=window.render;if(typeof original==='function')window.render=function(...args){const result=original.apply(this,args);schedule();return result};
 window.TimerIntermission={sync};schedule();
})();
