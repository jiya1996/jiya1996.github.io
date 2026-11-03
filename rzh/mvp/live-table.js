/* 只接收公开展示字段；真实底牌的采集和公开时机确定后再接入。 */
(function(){
  'use strict';
  const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let signature='';
  function cards(hand){
    return `<div class="lt-cards" aria-label="${hand?'示例底牌':'底牌待接入'}">${[0,1].map(i=>{
      const c=hand?.[i];return c?`<span class="lt-card face ${['♥','♦'].includes(c[1])?'red':''}"><b>${safe(c[0])}</b><span>${safe(c[1])}</span></span>`:'<span class="lt-card back" aria-hidden="true"><span>♠</span></span>';
    }).join('')}</div>`;
  }
  function seat(n,players,hands){
    const p=players.find(p=>p.seat===n),hand=p&&hands?.[n];
    return `<section class="lt-player ${p?'occupied':'empty'}" data-seat="${n}" aria-label="${n}号位 ${p?safe(p.name):'待入座'}"><span class="lt-seatno">${n}<small>号位</small></span><span class="lt-avatar">${p?`<span>${safe(p.name.slice(-1))}</span>${p.avatar?`<img src="${safe(p.avatar)}" alt="${safe(p.name)}的头像">`:''}`:'＋'}</span><div class="lt-person"><b>${p?safe(p.name):'待入座'}</b><small>${p?(p.memberId?'编号 '+safe(p.memberId):'本场玩家'):'空座'}</small></div>${p?cards(hand):'<span class="lt-vacant">—</span>'}</section>`;
  }
  window.RZHLiveTable={update({table,players,hands=null,preview=false,colors={}}){
    const next=JSON.stringify([table,players,hands,preview,colors]);if(next===signature)return;signature=next;
    const live=document.getElementById('live');if(!live)return;
    live.classList.add('table-broadcast');
    for(const [key,value]of Object.entries(colors))live.style.setProperty('--lt-'+key,value);
    live.innerHTML=`<time id="liveClock" hidden></time><div class="lt-heading"><div class="lt-brand">joker<span>TOURNAMENT CLUB</span></div><div class="lt-title">${table}号桌 <span>赛事直播</span></div></div><div class="lt-main"><aside class="lt-side lt-left">${[9,8,7,6,5].map(n=>seat(n,players,hands)).join('')}</aside><div class="lt-camera"><div class="lt-camera-label">本桌直播画面</div><div class="lt-camera-placeholder"><svg viewBox="0 0 64 48" aria-hidden="true"><rect x="2" y="8" width="40" height="32" rx="6"/><path d="m42 18 18-9v30l-18-9"/></svg><strong>等待接入现场摄像头</strong></div><div class="lt-camera-footer"><span>TABLE ${String(table).padStart(2,'0')}</span><span>绿色竞技 · 禁止赌博</span></div></div><aside class="lt-side lt-right">${[1,2,3,4].map(n=>seat(n,players,hands)).join('')}<div class="lt-qr" role="group" aria-label="规则说明二维码示意"><div class="lt-qr-copy"><strong>规则说明</strong><span>二维码示意</span></div><img src="assets/rules-qr-placeholder.png" width="150" height="150" alt="规则说明二维码示意，尚未配置跳转链接"></div></aside></div>`;
    live.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>im.hidden=true,{once:true}));
  }};
})();
