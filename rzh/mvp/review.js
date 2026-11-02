'use strict';
const B=RZHBridge,C=RZHCore;
async function passwordHash(password,salt){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:120000,hash:'SHA-256'},material,256);return Array.from(new Uint8Array(bits),n=>n.toString(16).padStart(2,'0')).join('')}
document.getElementById('prepare').onclick=async function(){
  this.disabled=true;const feedback=document.getElementById('feedback');
  try{
    // 先在内存准备，最终使用原玩家保存锁；不覆盖正在编辑的账号和场次。
    const prepared=await Promise.all([['林小满','13800001234'],['周一鸣','13600001234'],['许宁','13900002002']].map(async([nickname,phone])=>{const salt=crypto.randomUUID();return{id:'fixture-'+phone,nickname,phone,salt,passwordHash:await passwordHash('Rzh2026!',salt)}}));
    const write=()=>{
      let state=B.read(B.playerKey,C.createState());
      for(const p of prepared){if(state.accounts.some(a=>a.phone===p.phone))continue;state=C.applyAction(state,{id:crypto.randomUUID(),type:'register',data:p,at:new Date().toISOString()});const a=state.accounts.find(a=>a.phone===p.phone);a.honorAdjustments.quads=1;}
      localStorage.setItem(B.playerKey,JSON.stringify(state));
      const current=B.read(B.dealerKey,null);
      if(current){B.mergeProfiles(current);for(const p of current.players){if(prepared.some(x=>x.id===p.accountId)&&!p.fixtureGranted){p.credits+=3;p.fixtureGranted=true;}}localStorage.setItem(B.dealerKey,JSON.stringify(current));}
      localStorage.setItem(B.prefix+':fixtures','ready');
    };
    if(navigator.locks)await navigator.locks.request(B.playerKey,write);else write();
    feedback.textContent='三位测试玩家已准备；已有账号不覆盖、已发次数不重复增加。请打开荷官端继续。';
  }catch(e){feedback.textContent='准备未完成：'+e.message}finally{this.disabled=false}
};
