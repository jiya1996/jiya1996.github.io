/* 预览只驻留内存，避免用示例名单覆盖已有玩家、分座和比赛。 */
(function(){
  'use strict';
  const mode=new URLSearchParams(location.search).get('preview');
  if(!['seating','live','cards'].includes(mode))return;
  const names=['林小满','周一鸣','许宁','江远','宋雨','陆可','沈川','何安','苏禾'];
  const colors=['#8e5665','#3e737c','#8270a1','#506a93','#a1714b','#557b67','#8b6d50','#7b6384','#5c7592'];
  const avatar=(name,color)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="${color}"/><circle cx="60" cy="43" r="22" fill="#f5e6d2"/><path d="M13 120c0-38 20-53 47-53s47 15 47 53" fill="#f5e6d2"/></svg>`);
  const players=names.map((name,i)=>({id:'preview-'+i,name,avatar:avatar(name,colors[i]),memberId:'J'+String(1001+i)}));
  const seats=Object.fromEntries(players.map((p,i)=>[i+1,p.id]));
  const table=Number(new URLSearchParams(location.search).get('table'))||1;
  const game={id:'display-preview',table,status:'active',entries:players.map((p,i)=>({pid:p.id,seat:i+1,status:'active'})),stages:[{kind:'level',level:1,sb:25,bb:50,duration:1200}],clock:{index:0,mode:'countdown',paused:false,remaining:1200,deadline:Date.now()+1200000}};
  window.RZHDisplayPreview={mode,hands:mode==='cards'?{1:[['A','♠'],['K','♠']],3:[['10','♥'],['10','♣']],6:[['7','♦'],['2','♣']],9:[['Q','♥'],['J','♥']]}:null,
    data:{players,games:mode==='seating'?[]:[game],broadcasts:[],drafts:{preview:{table,seats}},presentations:{[table]:mode==='seating'?{mode:'seating',account:'preview'}:{mode:'game',game:game.id}}}};
})();
