/* 只接收公开展示字段；按屏幕阅读顺序排座，不改变参赛者的实际座位身份。 */
(function(){
  'use strict';
  const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fallback='<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="11" r="6"/><path d="M4 32c0-9 5-14 12-14s12 5 12 14"/></svg>';
  let signature='';
  function cards(hand){
    return `<div class="lt-cards" aria-label="${hand?'示例底牌':'底牌待接入'}">${[0,1].map(i=>{
      const c=hand?.[i];return c?`<span class="lt-card face ${['♥','♦'].includes(c[1])?'red':''}"><b>${safe(c[0])}</b><span>${safe(c[1])}</span></span>`:'<span class="lt-card back" aria-hidden="true"><span>♠</span></span>';
    }).join('')}</div>`;
  }
  function seat(n,players,hands){
    const p=players.find(p=>p.seat===n),hand=p&&hands?.[n];
    return `<section class="lt-player ${p?'occupied':'empty'}" data-seat="${n}" aria-label="${n}号位 ${p?safe(p.name):'待入座'}"><span class="lt-avatar">${p?`${fallback}${p.avatar?`<img src="${safe(p.avatar)}" alt="${safe(p.name)}的头像">`:''}`:n}</span>${p?`<b class="lt-name">${safe(p.name)}</b>${cards(hand)}`:''}</section>`;
  }
  window.RZHLiveTable={update({table,players,hands=null,preview=false,colors={}}){
    const next=JSON.stringify([table,players,hands,preview,colors]);if(next===signature)return;signature=next;
    const live=document.getElementById('live');if(!live)return;
    live.classList.add('table-broadcast');live.setAttribute('aria-label',`${table}号桌直播`);
    for(const [key,value]of Object.entries(colors))live.style.setProperty('--lt-'+key,value);
    // 视频底图覆盖完整16:9舞台，玩家与二维码叠在两侧，避免中央画面被拉成竖框。
    live.innerHTML=`<time id="liveClock" hidden></time><div class="lt-camera"><div class="lt-camera-placeholder"><svg viewBox="0 0 64 48" aria-hidden="true"><rect x="2" y="8" width="40" height="32" rx="6"/><path d="m42 18 18-9v30l-18-9"/></svg><strong>等待接入现场摄像头</strong></div></div><div class="lt-brand">joker</div><div class="lt-main"><aside class="lt-side lt-left">${[1,2,3,4,5].map(n=>seat(n,players,hands)).join('')}</aside><aside class="lt-side lt-right">${[6,7,8,9].map(n=>seat(n,players,hands)).join('')}<div class="lt-qr" role="group" aria-label="赛事规则二维码示意"><img src="assets/rules-qr-placeholder.png" width="144" height="144" alt="规则说明二维码示意，尚未配置跳转链接"><strong>赛事规则</strong></div></aside></div>`;
    live.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>im.hidden=true,{once:true}));
  }};
})();
