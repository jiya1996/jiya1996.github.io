/* 各端只读门店统一配置；参赛次数、门票和成长仍各自记录。 */
(function () {
  'use strict';
  const prefix='rzh-triad-20261101-v1';
  const playerKey=prefix+':player',dealerKey=prefix+':dealer';
  const validThemes=['flame','neon','grass','warm','cute','pop','energy','star'];
  let storeTheme='flame';
  function read(key,fallback){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}
  function theme(){return storeTheme}
  // 此文件是门店后台下发配置的静态演示，不读取玩家或荷官自己的旧换肤设置。
  const themeReady=fetch('store-config.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('无法读取门店配置');return r.json()}).then(config=>{if(validThemes.includes(config.theme))storeTheme=config.theme;dispatchEvent(new CustomEvent('rzh-theme'))}).catch(()=>null);
  function businessCutoff(){return read(dealerKey,null)?.store?.close||'03:00'}
  function businessDay(t){const [h,m]=businessCutoff().split(':').map(Number);return new Date(new Date(t).getTime()+8*3600000-(h*60+m)*60000).toISOString().slice(0,10)}
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
  function mountNavigation(){document.getElementById('reviewNav')?.remove()}
  window.RZHBridge={prefix,playerKey,dealerKey,read,theme,themeReady,mergeProfiles,mountNavigation,businessDay,businessCutoff};
})();
