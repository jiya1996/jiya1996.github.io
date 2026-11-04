/* 独立播放页接入原动画；静态预览使用设备朗读，不向不存在的云TTS发送请求。 */
'use strict';
// 独立打开时保留左侧控件与右侧舞台；嵌入电视播放页时才隐藏预览工具。
const receiverQuery=new URLSearchParams(location.search);
const receiverOnly=receiverQuery.get('debug')!=='1'&&(window.parent!==window||receiverQuery.get('screen')==='1');
document.documentElement.dataset.displayMode=receiverOnly?'receiver':'preview';
const receiverStyle=document.createElement('style');receiverStyle.textContent='html,body{margin:0!important;padding:0!important;width:100%;height:100%;overflow:hidden;background:#000}.layout{display:block!important;padding:0!important;margin:0!important}.layout>aside,body>header,.layout>section>.hint,.layout>section>.btns,.under,.stagehead,#resultTag,.slot{display:none!important}.layout>section{padding:0!important;margin:0!important;min-width:0!important}#stageBox{position:fixed!important;left:50%;top:50%;transform:translate(-50%,-50%);width:min(100vw,177.7778vh)!important;aspect-ratio:16/9;border-radius:0;box-shadow:none}';if(receiverOnly)document.head.appendChild(receiverStyle);
// 03保留预览操作，右侧画面仅在显式debug模式显示调试标签。
if(receiverQuery.get('debug')!=='1'){const stageStyle=document.createElement('style');stageStyle.textContent='#resultTag,.slot{display:none!important}';document.head.appendChild(stageStyle)}
HANDS.flush={...HANDS.fh,name:'同花',en:'FLUSH',cards:[['A','♠'],['J','♠'],['8','♠'],['5','♠'],['2','♠']],say:n=>`${n}，打出同花！`};
prepareNarration=()=>Promise.resolve();
say=function(text,ms,item){return new Promise(resolve=>{
 if(!UI.tts){item.tts='仅画面预览';return resolve('off')}
 if(!('speechSynthesis'in window)){item.ttsFailed=true;return resolve('error')}
 let done=false,u,guard;
 const finish=reason=>{if(done)return;done=true;clearTimeout(guard);AU.speechCancels.delete(cancel);duck(false);if(reason!=='end'&&reason!=='abort')item.ttsFailed=true;VOICE_TRACE.push({event:reason,text,id:item.id});resolve(reason)};
 const cancel=()=>{speechSynthesis.cancel();finish('abort')};AU.speechCancels.add(cancel);RUN.waits.push({res:cancel});
 guard=setTimeout(()=>{speechSynthesis.cancel();finish('timeout')},45000);RUN.timers.push(guard);
 at(ms,()=>{if(done)return;u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.onstart=()=>{duck(true);SPOKEN.push(text);VOICE_TRACE.push({event:'start',text,id:item.id})};u.onend=()=>finish('end');u.onerror=()=>finish('error');speechSynthesis.speak(u)});
})};
const baseScene=playScene;playScene=async function(it,...args){parent.postMessage({type:'visual-start',id:it.id},location.origin);return baseScene(it,...args)};
const baseNotice=runNotice;runNotice=async function(it){parent.postMessage({type:'visual-start',id:it.id},location.origin);return baseNotice(it)};
const baseAvatar=avatar;avatar=function(o,p,s,x,y){if(!p.avatar)return baseAvatar(o,p,s,x,y);const w=box(o,'av',x,y,s,s),i=el(w,'avi'),im=document.createElement('img');im.src=p.avatar;im.alt=p.name+'的头像';i.appendChild(im);return w};
const avatarImages=new Map(),originalCanvas=avatarCanvas;
avatarCanvas=function(p,size=320){const c=originalCanvas(p,size),im=avatarImages.get(p.avatar);if(!im?.naturalWidth)return c;const g=c.getContext('2d'),n=Math.min(im.naturalWidth,im.naturalHeight);g.save();g.beginPath();g.arc(size/2,size/2,size*.42,0,Math.PI*2);g.clip();g.drawImage(im,(im.naturalWidth-n)/2,(im.naturalHeight-n)/2,n,n,size*.08,size*.08,size*.84,size*.84);g.restore();return c};
window.Receiver={
 updateTable(snapshot){window.RZHLiveTable?.update(snapshot)},
 unlock(silent=false){ac();UI.tts=!silent;UI.sfx=!silent;return true},
 skin(key){UI.skin=key;if(!PF.state().busy)applySkin(key)},
 async preload(players){await Promise.all(players.map(p=>new Promise(resolve=>{if(!p.avatar||avatarImages.get(p.avatar)?.naturalWidth)return resolve();const im=new Image();im.onload=im.onerror=resolve;im.src=p.avatar;avatarImages.set(p.avatar,im)})))},
 enqueue(it){return PF.enqueue(it)},state(){return PF.state()},stop(){return PF.hardReset()},narration(){return VOICE_TRACE.slice(-20)}
};
addEventListener('load',()=>{fit();parent.postMessage({type:'frame-ready'},location.origin)});

// 公网静态预览沿用设备朗读，界面不宣称已经接入本地云音色服务。
if(!receiverOnly){const oldLoadVoices=loadVoices;loadVoices=function(){oldLoadVoices();document.getElementById('voiceInfo').textContent='当前网页使用本机朗读；云希、晓晓音色需要另行接入配音服务。'};}
