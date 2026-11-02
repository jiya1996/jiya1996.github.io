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
  const badge=document.getElementById('statusBadge')?.textContent||'',value=document.getElementById('countdown')?.textContent||'';
  const rest=clock.dataset.rest==='true',paused=clock.dataset.paused==='true';
  // 接收端在原render之后补写等待／赛终／末级状态，须在整个调用栈结束后读取。
  const excluded=clock.dataset.done==='true'||/等待|结束|持续/.test(badge)||!/^\d+:\d{2}$/.test(value);
  overlay.hidden=excluded||(!rest&&!paused);if(overlay.hidden)return;
  overlay.dataset.paused=String(paused);overlay.dataset.kind=rest?'break':'pause';text(time,value);
  text(state,rest?(paused?'休息已暂停':'赛事休息倒计时'):'比赛已暂停');
  let next='';if(rest&&!paused){const el=document.getElementById('nextMain'),level=el?.querySelector('.nm-lv')?.textContent?.trim(),raw=el?.textContent?.trim();const title=level?level+' · '+raw.slice(level.length).trim():raw;next=title?'休息结束后进入 '+title:'休息结束后自动进入下一盲注级'}
  text(note,paused?'剩余时间已冻结，等待荷官继续':next);
 }
 const original=window.render;if(typeof original==='function')window.render=function(...args){const result=original.apply(this,args);queueMicrotask(sync);return result};
 window.TimerIntermission={sync};queueMicrotask(sync);
})();
