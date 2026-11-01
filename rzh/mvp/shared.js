/* 仅连接隔离的前端验收数据；门票、成长、参赛次数各自保留，不自动换算或发奖。 */
(function () {
  'use strict';
  const prefix='rzh-triad-20261101-v1';
  const playerKey=prefix+':player',dealerKey=prefix+':dealer',themeKey=prefix+':theme';
  function read(key,fallback){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}
  function theme(){return localStorage.getItem(themeKey)||'flame'}
  function businessCutoff(){return read(dealerKey,null)?.store?.close||'03:00'}
  function businessDay(t){const [h,m]=businessCutoff().split(':').map(Number);return new Date(new Date(t).getTime()+8*3600000-(h*60+m)*60000).toISOString().slice(0,10)}
  function setTheme(key){if(!['flame','neon','grass','warm','cute','pop','energy','star'].includes(key))return;localStorage.setItem(themeKey,key);dispatchEvent(new CustomEvent('rzh-theme'))}
  function mergeProfiles(d){
    const s=read(playerKey,null);if(!s)return d;
    for(const a of s.accounts){
      const id='player:'+a.id,existing=d.players.find(p=>p.id===id);
      const profile={id,accountId:a.id,memberId:a.memberId,name:a.nickname,phone:a.phone,avatar:a.avatar||''};
      const p=existing||{...profile,credits:0};
      if(existing)Object.assign(existing,profile);else d.players.push(p);
      if(localStorage.getItem(prefix+':fixtures')==='ready'&&['fixture-13800001234','fixture-13600001234','fixture-13900002002'].includes(a.id)&&!p.fixtureGranted){p.credits+=3;p.fixtureGranted=true;}
    }
    return d;
  }
  function mountNavigation(){
    if(document.getElementById('reviewNav'))return;
    const n=document.createElement('div');n.id='reviewNav';
    n.style.cssText='padding:7px 12px;text-align:center;font:12px/1.6 sans-serif;background:var(--card,#fff);color:var(--ink,var(--text,#0f172a));border-bottom:1px solid var(--border,#e2e8f0)';
    n.innerHTML='<a href="index.html">← 三端验收导航</a><span style="margin-left:12px">隔离演示数据</span>';
    document.body.prepend(n);
  }
  addEventListener('storage',e=>{if(e.key===themeKey)dispatchEvent(new CustomEvent('rzh-theme'))});
  window.RZHBridge={prefix,playerKey,dealerKey,read,theme,setTheme,mergeProfiles,mountNavigation,businessDay,businessCutoff};
})();
