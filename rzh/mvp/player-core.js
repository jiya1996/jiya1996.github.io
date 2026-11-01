(function (root) {
  'use strict';
  const CARDS = ['9', '10', 'J', 'Q', 'K', 'A', '小王', '大王'];
  const MERGE = [10, 5, 2, 2, 3, 4, 3, 0];
  const TICKETS = [0, 0, 0, 0, 3, 8, 15, 25];
  const LEVEL_NAMES = ['青铜', '白银', '黄金', '铂金', '钻石', '星耀', '最强王者', '无双王者', '荣耀王者', '传奇王者'];
  const HONORS = [
    ['champion', '冠军', '正式赛事获得第一名，每场累计一次。', 5, 2],
    ['runnerup', '亚军', '正式赛事获得第二名，每场累计一次。', 5, 1],
    ['third', '季军', '正式赛事获得第三名，每场累计一次。', 5, 1],
    ['kill27', '二七击杀', '由荷官登记二七击杀事件。', 5, 1],
    ['climb86', '86上山', '由荷官登记86上山事件。', 5, 1],
    ['pistol47', '47小手枪', '由荷官登记47小手枪事件。', 5, 1],
    ['luckyWin', '幸运手牌获胜', '使用已设置的幸运手牌获胜，由荷官登记。', 5, 1],
    ['doubleKill', '双杀', '由荷官登记单场双杀事件。', 5, 1],
    ['tripleKill', '三杀', '由荷官登记单场三杀事件。', 5, 2],
    ['quadKill', '四杀', '由荷官登记单场四杀事件。', 1, 1],
    ['pentaKill', '五杀', '由荷官登记单场五杀事件。', 1, 2],
    ['multiKill', '五杀以上', '由荷官登记单场五杀以上事件。', 1, 4],
    ['sharkWin', '鲨鱼获胜', '由荷官确认鲨鱼获胜事件。', 1, 1],
    ['sharkEnd', '终结鲨鱼', '由荷官确认终结鲨鱼事件。', 5, 1],
    ['straightFlush', '同花顺', '正式对局中获得同花顺，由荷官登记。', 1, 1],
    ['royalFlush', '皇家同花顺', '正式对局中获得皇家同花顺，由荷官登记。', 1, 4],
    ['quads', '四条', '正式对局中获得四条，由荷官登记。', 5, 1]
  ].map(function (x) { return {id:x[0], name:x[1], description:x[2], first:x[3], reward:x[4]}; });
  const SPECIAL = [
    ['hunterKing','猎杀王者','当前猎人总榜前三名'],
    ['master','德州大师','商家确认的大师荣誉'],
    ['captain','最强队长','商家确认的队长荣誉'],
    ['teammate','最强队友','商家确认的队友荣誉'],
    ['sniper','猎人狙击手','商家确认的猎人荣誉'],
    ['hunter','头号猎人','商家确认的猎人荣誉'],
    ['attendance','满勤玩家','商家确认的到店荣誉'],
    ['grandmaster','荣耀大师','商家确认的高阶大师荣誉'],
    ['deepFear','深渊恐惧','商家确认的特殊荣誉'],
    ['bluff','偷鸡之王','商家确认的特殊荣誉'],
    ['coronation','王之加冕','商家确认的冠军荣誉'],
    ['highRoller','至尊豪客','商家确认的特殊荣誉']
  ].map(function (x) { return {id:x[0], name:x[1], description:x[2], special:true}; });
  const copy = function (x) { return JSON.parse(JSON.stringify(x)); };
  function assert(ok, message) { if (!ok) throw new Error(message); }
  function integer(n, min, max, label) {
    assert(Number.isSafeInteger(n) && n >= min && n <= max, (label || '数量') + '不在有效范围内');
    return n;
  }
  function benefit(id, title, quantity, type, detail) {
    return {id:id, title:title, quantity:quantity, type:type || 'gift', detail:detail || ''};
  }
  function defaultLevels() {
    const rewards = [
      [benefit('drink','注册赠饮',1,'gift','可乐或雪碧任选一份')],
      [benefit('cocktail','鸡尾酒',1,'gift','升级赠饮，额度固定，领完不重置')],
      [benefit('ticket','门票',1,'ticket'),benefit('snack','小吃',1)],
      [benefit('ticket','门票',2,'ticket'),benefit('drink','特调',1),benefit('snack','小吃',1)],
      [benefit('ticket','门票',2,'ticket'),benefit('room','珠海贵宾楼使用权',1,'gift','录屏参考权益，A版可编辑演示')],
      [benefit('ticket','门票',2,'ticket'),benefit('room','深圳贵宾楼使用权',1,'gift','录屏参考权益，A版可编辑演示')],
      [benefit('team','创建战队资格',1,'access','资格说明展示；本次不包含独立战队系统'),benefit('ticket','升级门票',1,'ticket','按已确认规则改为固定总量'),benefit('drink','特调',1),benefit('task','隐藏任务资格',1,'access','达到本等级后解锁资格说明')],
      [benefit('ticket','周卡',2,'ticket'),benefit('drink','特调',1),benefit('snack','小吃',1),benefit('hotel','希尔顿白金卡',1,'gift','录屏参考权益，可在商家模板中修改'),benefit('seat','预约保留座位',1),benefit('ride','港澳往返接送',1)],
      [benefit('ticket','周卡',2,'ticket'),benefit('effect','专属出场特效资格',1,'access'),benefit('podium','前三额外门票',2,'ticket','需存在已结算的前三战绩'),benefit('drink','特调',1),benefit('snack','小吃',1),benefit('flight','全国随心飞',1),benefit('hotel','万豪白金卡',1)],
      [benefit('ticket','月卡',1,'ticket'),benefit('chip','定制专属积分牌',1,'gift','20万分纪念积分牌，到店领取，不计入赛事积分'),benefit('double','冠军奖励双倍资格',1,'access','资格说明展示，具体赛事奖励另行核对'),benefit('effect','定制专属特效资格',1,'access'),benefit('drink','特调',2),benefit('snack','小吃',2)]
    ];
    return LEVEL_NAMES.map(function (name, i) {
      return {level:i+1, name:name, threshold:i ? 700 * Math.pow(2,i-1) : 0, rewards:rewards[i]};
    });
  }
  function createState() {
    const rules = {};
    HONORS.forEach(function (h) {
      rules[h.id] = {thresholds:[h.first,h.first*2,h.first*4,h.first*8,h.first*16], rewards:[h.reward,h.reward*2,h.reward*3,h.reward*4,h.reward*5]};
    });
    return {
      schema:1, revision:0, updatedAt:null, processed:[], accounts:[], claims:[], log:[],
      merchant:{name:'joker', stores:[{id:'main',name:'joker主店 · 演示'},{id:'branch',name:'joker分店 · 演示'}]},
      settings:{
        probabilities:[65.86,30,2,1,0.5,0.6,0.03,0.01], probabilityVersion:1, probabilityHistory:[],
        levels:defaultLevels(), honorRules:rules, honorVersion:1,
        giftPrizes:['','饮品礼遇','小吃礼遇','特调礼遇','门店礼遇礼包','尊享礼遇礼包','荣耀礼遇礼包','传奇礼遇礼包']
      }
    };
  }
  function newAccount(data, memberId, at) {
    return {
      id:data.id, memberId:memberId, phone:data.phone, salt:data.salt, passwordHash:data.passwordHash,
      nickname:data.nickname || ('joker玩家'+memberId), avatar:'', createdAt:at, storeId:data.storeId || 'main',
      authVersion:0, mustChangePassword:false,
      addresses:[], growthCents:0, growthLedger:[], tickets:0, ticketLedger:[],
      gifts:Object.fromEntries(CARDS.map(function(c){return [c,0];})), drawCredits:0, hunterTotal:0, hunterLedger:[],
      draws:[], giftHistory:[], matches:[], honorAdjustments:{}, specials:{}, rewards:{},
      hand:null, handActivity:[], entranceEffect:null
    };
  }
  function account(state, id) {
    const a = state.accounts.find(function(x){return x.id===id;});
    assert(a, '请先登录赛事账号');
    return a;
  }
  function sessionValid(a, session) {
    return !!(a && session && session.accountId===a.id && (session.authVersion||0)===(a.authVersion||0));
  }
  function levelFor(state, cents) {
    return state.settings.levels.filter(function(l){return Math.round(l.threshold*100)<=cents;}).slice(-1)[0];
  }
  function membership(state, a) {
    const current=levelFor(state,a.growthCents), next=state.settings.levels[current.level] || null;
    const floor=Math.round(current.threshold*100), ceiling=next ? Math.round(next.threshold*100) : floor;
    return {current:current,next:next,growth:a.growthCents/100,gap:next ? Math.max(0,(ceiling-a.growthCents)/100) : 0,progress:next ? Math.max(0,Math.min(1,(a.growthCents-floor)/(ceiling-floor))) : 1};
  }
  function settled(a) { return a.matches.filter(function(m){return m.status==='settled';}).sort(function(a,b){return new Date(b.at)-new Date(a.at);}); }
  function stats(a) {
    const all=settled(a), recent=all.slice(0,5), sng=all.filter(function(m){return m.game==='SNG';}), mtt=all.filter(function(m){return m.game==='MTT';});
    const pct=function(rows,predicate){return {count:rows.length, wins:rows.filter(predicate).length, ratio:rows.length ? rows.filter(predicate).length/rows.length : null};};
    const podium=function(m){return m.rank<=3;};
    return {axes:[pct(recent,podium),pct(all,podium),pct(all,function(m){return m.rank===1;}),pct(sng,podium),pct(mtt,podium)],total:all.length,pending:a.matches.length-all.length,recent:recent,points:all.reduce(function(n,m){return n+m.points;},0)};
  }
  function honorCounts(a) {
    const result={};
    HONORS.forEach(function(h){result[h.id]=a.honorAdjustments[h.id] || 0;});
    settled(a).forEach(function(m){if(m.rank===1)result.champion++;if(m.rank===2)result.runnerup++;if(m.rank===3)result.third++;});
    return result;
  }
  function honorProgress(state,a,id) {
    const rule=state.settings.honorRules[id], count=honorCounts(a)[id] || 0;
    const reached=rule.thresholds.filter(function(t){return count>=t;}).length;
    const target=rule.thresholds[reached] || null, floor=reached ? rule.thresholds[reached-1] : 0;
    return {count:count,level:reached,target:target,gap:target ? target-count : 0,progress:target ? (count-floor)/(target-floor) : 1};
  }
  function effectUnlocked(state,a,id) {
    if (!id) return true;
    if (HONORS.some(function(h){return h.id===id;})) return (honorCounts(a)[id]||0)>0;
    return !!a.specials[id];
  }
  // 额度在解锁时留快照。修改模板不会把已领取额度重新生成一遍。
  function syncRewards(state,a,at) {
    const current=membership(state,a).current.level;
    state.settings.levels.filter(function(l){return l.level<=current;}).forEach(function(l){
      l.rewards.forEach(function(b){
        if(b.type==='access')return;
        if(b.id==='podium'&&!settled(a).some(function(m){return m.rank<=3;}))return;
        const key='level:'+l.level+':'+b.id;
        if(!a.rewards[key])a.rewards[key]={key:key,kind:'level',level:l.level,title:b.title,detail:b.detail,type:b.type,total:b.quantity,claimed:0,at:at};
      });
    });
    HONORS.forEach(function(h){
      const p=honorProgress(state,a,h.id),rule=state.settings.honorRules[h.id];
      for(let i=0;i<p.level;i++){
        const key='honor:'+h.id+':'+(i+1);
        if(!a.rewards[key])a.rewards[key]={key:key,kind:'honor',honorId:h.id,level:i+1,title:h.name+' LV'+(i+1)+'门票',type:'ticket',total:rule.rewards[i],claimed:0,at:at};
      }
    });
  }
  function probabilityUnits(values) {
    assert(Array.isArray(values)&&values.length===8,'请设置全部8档概率');
    const units=values.map(function(p){
      assert(Number.isFinite(p)&&p>=0&&p<=100,'概率必须在0%到100%之间');
      assert(Math.abs(p*100-Math.round(p*100))<0.000001,'概率最多保留两位小数');
      return Math.round(p*100);
    });
    assert(units.reduce(function(a,b){return a+b;},0)===10000,'8档概率合计必须为100%');
    return units;
  }
  function pickCard(values,roll) {
    const weights=probabilityUnits(values);
    integer(roll,0,9999,'抽样值');
    let sum=0;
    for(let i=0;i<weights.length;i++){sum+=weights[i];if(roll<sum)return CARDS[i];}
    throw new Error('抽奖配置不完整');
  }
  function rankings(state,kind,period,now) {
    const at=new Date(now || Date.now()), month=new Date(at.getTime()+8*3600000).toISOString().slice(0,7);
    const rows=state.accounts.map(function(a){
      let value;
      if(kind==='hunter')value=period==='month'?(a.hunterLedger||[]).filter(function(e){return new Date(new Date(e.at).getTime()+8*3600000).toISOString().slice(0,7)===month;}).reduce(function(n,e){return n+e.count;},0):a.hunterTotal;
      else value=settled(a).filter(function(m){return period!=='month'||new Date(new Date(m.at).getTime()+8*3600000).toISOString().slice(0,7)===month;}).reduce(function(n,m){return n+m.points;},0);
      return {id:a.id,memberId:a.memberId,nickname:a.nickname,avatar:a.avatar,value:value};
    }).filter(function(a){return a.value>0;}).sort(function(a,b){return b.value-a.value||a.memberId-b.memberId;});
    let last=null,rank=0;
    return rows.map(function(a,i){if(a.value!==last)rank=i+1;last=a.value;return Object.assign(a,{rank:rank});});
  }
  function validateLevels(levels) {
    assert(Array.isArray(levels)&&levels.length===10,'需要完整的10级成长模板');
    let prev=-1;
    levels.forEach(function(l,i){
      assert(l.level===i+1&&String(l.name).trim(),'请填写等级名称');
      assert(Number.isFinite(l.threshold)&&l.threshold>=0&&l.threshold>prev,'累计门槛必须逐级递增');
      if(i===0)assert(l.threshold===0,'LV1的门槛应为0');
      prev=l.threshold;
      l.rewards.forEach(function(b){assert(b.title.trim(),'请填写权益名称');integer(b.quantity,0,100000,'权益总份数');});
    });
  }
  function log(state,a,text,at,extra) {
    state.log.unshift(Object.assign({id:extra && extra.id || (at+'-'+state.log.length),accountId:a ? a.id : null,text:text,at:at},extra || {}));
  }
  function applyAction(input,action) {
    assert(input && input.schema===1,'本地数据格式不兼容');
    assert(action && action.id && action.type,'操作信息不完整');
    if(input.processed.includes(action.id))return copy(input);
    const s=copy(input), at=action.at || new Date().toISOString(), d=action.data || {};
    let a=action.accountId ? account(s,action.accountId) : null;
    if(action.actor==='player'){
      assert(a && action.authVersion===(a.authVersion||0),'登录状态已失效，请重新登录');
      assert(!a.mustChangePassword || action.type==='changePassword','请先设置新密码，再使用赛事功能');
    }
    if(a)syncRewards(s,a,at);
    switch(action.type) {
      case 'register':
        assert(/^1\d{10}$/.test(d.phone),'请填写11位手机号');
        assert(!s.accounts.some(function(x){return x.phone===d.phone;}),'该手机号已有赛事账号，请直接登录');
        assert(d.salt&&d.passwordHash,'密码信息不完整');
        a=newAccount(d,1001+s.accounts.length,at);s.accounts.push(a);
        log(s,a,'注册赛事账号',at);
        break;
      case 'profile':
        assert(d.nickname.trim().length>=1&&d.nickname.trim().length<=24,'昵称需要1至24个字');
        if(d.avatar!==undefined)assert(typeof d.avatar==='string'&&d.avatar.length<900000&&(!d.avatar||/^data:image\/(png|jpeg|webp);base64,/.test(d.avatar)),'头像格式不支持或文件过大');
        a.nickname=d.nickname.trim();if(d.avatar!==undefined)a.avatar=d.avatar;
        log(s,a,'更新个人资料',at);
        break;
      case 'resetPassword':
        assert(d.salt && d.passwordHash,'临时密码信息不完整');
        a.salt=d.salt;a.passwordHash=d.passwordHash;
        a.authVersion=(a.authVersion||0)+1;a.mustChangePassword=true;a.passwordResetAt=at;
        log(s,a,'商家为会员ID '+a.memberId+'重置临时密码',at,{operator:'商家演示操作者'});
        break;
      case 'changePassword':
        assert(a.mustChangePassword,'当前账号无需使用临时密码改密');
        assert(d.expectedAuthVersion===(a.authVersion||0),'密码已被重新重置，请使用最新临时密码登录');
        assert(d.salt && d.passwordHash,'新密码信息不完整');
        a.salt=d.salt;a.passwordHash=d.passwordHash;
        a.authVersion=(a.authVersion||0)+1;a.mustChangePassword=false;a.passwordChangedAt=at;
        log(s,a,'用户设置新密码，临时密码已失效',at);
        break;
      case 'saveAddress': {
        const row={id:d.id || action.id,name:String(d.name||'').trim(),salutation:d.salutation==='女士'?'女士':'先生',phone:String(d.phone||'').trim(),region:String(d.region||'').trim(),detail:String(d.detail||'').trim(),isDefault:!!d.isDefault};
        assert(row.name&&row.region&&row.detail,'请填写联系人、省市和详细地址');
        assert(/^1\d{10}$/.test(row.phone),'请填写正确的收货手机号');
        assert(row.name.length<=30&&row.region.length<=100&&row.detail.length<=200,'地址内容过长');
        const i=a.addresses.findIndex(function(x){return x.id===row.id;});
        if(i>=0)a.addresses[i]=row;else a.addresses.push(row);
        if(row.isDefault)a.addresses.forEach(function(x){x.isDefault=x.id===row.id;});
        if(!a.addresses.some(function(x){return x.isDefault;}))a.addresses[0].isDefault=true;
        log(s,a,'保存收货地址',at);break;
      }
      case 'deleteAddress':
        assert(a.addresses.some(function(x){return x.id===d.id;}),'地址已不存在');
        a.addresses=a.addresses.filter(function(x){return x.id!==d.id;});
        if(a.addresses.length&&!a.addresses.some(function(x){return x.isDefault;}))a.addresses[0].isDefault=true;
        log(s,a,'删除收货地址',at);break;
      case 'defaultAddress':
        assert(a.addresses.some(function(x){return x.id===d.id;}),'地址已不存在');
        a.addresses.forEach(function(x){x.isDefault=x.id===d.id;});break;
      case 'growth':
        integer(d.deltaCents,-100000000,100000000,'成长变动');
        assert(d.deltaCents!==0,'请输入需要登记的金额');
        assert(a.growthCents+d.deltaCents>=0,'退款不能超过累计成长值');
        a.growthCents+=d.deltaCents;
        a.growthLedger.unshift({id:action.id,deltaCents:d.deltaCents,at:at,note:d.note || '商家演示登记',storeId:d.storeId || 'main'});
        log(s,a,'成长值变动 '+(d.deltaCents/100),at);break;
      case 'saveMatch': {
        const m={id:d.id || action.id,game:d.game,status:d.status,rank:Number(d.rank),points:Number(d.points),kills:Number(d.kills||0),at:d.at || at,storeId:d.storeId || 'main'};
        assert(['SNG','MTT'].includes(m.game),'请选择赛事类型');
        assert(['settled','pending','cancelled'].includes(m.status),'请选择有效赛事状态');
        integer(m.rank,1,10000,'名次');integer(m.kills,0,10000,'击杀数');
        assert(Number.isFinite(m.points)&&m.points>=0&&m.points<=100000000,'赛事积分不正确');
        assert(Number.isFinite(new Date(m.at).getTime()),'赛事日期不正确');
        const i=a.matches.findIndex(function(x){return x.id===m.id;});
        if(i>=0)a.matches[i]=m;else a.matches.push(m);
        log(s,a,'保存'+m.game+'赛事记录',at);break;
      }
      case 'deleteMatch':
        a.matches=a.matches.filter(function(m){return m.id!==d.id;});log(s,a,'删除演示战绩',at);break;
      case 'hunter':
        integer(d.count,1,100000,'新增猎人卡');
        a.hunterTotal+=d.count;a.drawCredits+=d.count;
        a.hunterLedger.unshift({id:action.id,count:d.count,at:at});
        a.giftHistory.unshift({id:action.id,text:'荷官登记猎人卡 '+d.count+'张，抽奖机会 +'+d.count,at:at});
        log(s,a,'登记猎人卡 '+d.count+'张',at);break;
      case 'setAssets':
        integer(d.tickets,0,100000000,'门票余额');integer(d.drawCredits,0,100000000,'抽奖机会');
        CARDS.forEach(function(c){integer(d.gifts[c],0,100000000,c+'卡数量');});
        if(a.tickets!==d.tickets)a.ticketLedger.unshift({id:action.id,amount:d.tickets-a.tickets,at:at,text:'A版演示资产调整'});
        a.tickets=d.tickets;a.drawCredits=d.drawCredits;a.gifts=copy(d.gifts);
        a.giftHistory.unshift({id:action.id,text:'商家调整A版演示资产',at:at});log(s,a,'调整演示资产',at);break;
      case 'draw': {
        integer(d.count,1,10,'抽奖次数');assert(d.count===1||d.count===10,'请选择单抽或十连抽');
        assert(!a.draws.some(function(x){return !x.revealed;}),'还有一笔已保存的抽奖结果，请先查看并收下卡片');
        assert(a.drawCredits>=d.count,'抽奖机会不足');
        assert(Array.isArray(d.rolls)&&d.rolls.length===d.count,'抽奖结果信息不完整');
        const results=d.rolls.map(function(n){return pickCard(s.settings.probabilities,n);});
        a.drawCredits-=d.count;results.forEach(function(c){a.gifts[c]++;});
        a.draws.unshift({id:action.id,results:results,at:at,version:s.settings.probabilityVersion,revealed:false});
        a.giftHistory.unshift({id:action.id,text:'抽奖获得 '+results.map(function(c){return c+'卡';}).join('、'),at:at});
        log(s,a,'完成'+(d.count===10?'十连抽':'单次抽奖'),at);break;
      }
      case 'ackDraw': {
        const draw=a.draws.find(function(x){return x.id===d.id;});
        assert(draw,'未找到抽奖结果');draw.revealed=true;break;
      }
      case 'merge': {
        const i=CARDS.indexOf(d.card);assert(i>=0&&i<7,'该卡不能继续合成');
        integer(d.count,1,100000,'合成数量');
        const cost=MERGE[i]*d.count;assert(a.gifts[d.card]>=cost,'卡片数量不足');
        a.gifts[d.card]-=cost;a.gifts[CARDS[i+1]]+=d.count;
        a.giftHistory.unshift({id:action.id,text:cost+'张'+d.card+'卡合成'+d.count+'张'+CARDS[i+1]+'卡',at:at});
        log(s,a,'卡片合成',at);break;
      }
      case 'exchange': {
        const i=CARDS.indexOf(d.card);assert(i>=4,'该卡不支持兑换门票');
        integer(d.count,1,100000,'兑换数量');assert(a.gifts[d.card]>=d.count,'可用卡片不足');
        const amount=TICKETS[i]*d.count;a.gifts[d.card]-=d.count;a.tickets+=amount;
        a.ticketLedger.unshift({id:action.id,amount:amount,at:at,text:d.card+'卡兑换门票'});
        a.giftHistory.unshift({id:action.id,text:d.count+'张'+d.card+'卡兑换'+amount+'张门票',at:at});
        log(s,a,'兑换门票 '+amount+'张',at);break;
      }
      case 'claimGift': {
        const i=CARDS.indexOf(d.card);assert(i>0,'9卡仅用于合成下一档卡片');
        integer(d.count,1,100000,'领取数量');assert(a.gifts[d.card]>=d.count,'可用卡片不足');
        assert(s.settings.giftPrizes[i].trim(),'商家尚未设置这档礼物');
        a.gifts[d.card]-=d.count;
        s.claims.unshift({id:action.id,code:'R'+action.id.replace(/[^a-z0-9]/gi,'').slice(-9).toUpperCase(),accountId:a.id,kind:'card',card:d.card,count:d.count,title:s.settings.giftPrizes[i],status:'pending',at:at,storeId:d.storeId || 'main'});
        a.giftHistory.unshift({id:action.id,text:'申请'+d.count+'份'+s.settings.giftPrizes[i]+'，冻结'+d.count+'张'+d.card+'卡',at:at});
        log(s,a,'申请礼物领取单',at);break;
      }
      case 'claimReward': {
        const reward=a.rewards[d.key];assert(reward,'奖励尚未解锁');
        integer(d.count,1,100000,'领取份数');assert(reward.total-reward.claimed>=d.count,'剩余可领份数不足');
        reward.claimed+=d.count;
        const isTicket=reward.type==='ticket';
        if(isTicket){a.tickets+=d.count;a.ticketLedger.unshift({id:action.id,amount:d.count,at:at,text:reward.title});}
        s.claims.unshift({id:action.id,code:'R'+action.id.replace(/[^a-z0-9]/gi,'').slice(-9).toUpperCase(),accountId:a.id,kind:'reward',rewardKey:d.key,count:d.count,title:reward.title,status:isTicket?'credited':'pending',at:at,storeId:d.storeId || 'main'});
        log(s,a,'领取'+reward.title+' '+d.count+'份',at);break;
      }
      case 'cancelClaim': {
        const claim=s.claims.find(function(c){return c.id===d.id&&c.accountId===a.id;});
        assert(claim&&claim.status==='pending','这张领取单不能取消');
        claim.status='cancelled';claim.cancelledAt=at;
        if(claim.kind==='card')a.gifts[claim.card]+=claim.count;
        else a.rewards[claim.rewardKey].claimed-=claim.count;
        a.giftHistory.unshift({id:action.id,text:'取消'+claim.title+'领取，恢复可用数量',at:at});
        log(s,a,'取消领取单',at);break;
      }
      case 'redeemClaim': {
        const claim=s.claims.find(function(c){return c.id===d.id;});
        assert(claim&&claim.status==='pending','领取单已处理，请勿重复核销');
        claim.status='used';claim.usedAt=at;
        log(s,account(s,claim.accountId),'商家演示核销：'+claim.title,at);break;
      }
      case 'setHonors':
        HONORS.forEach(function(h){integer(d.counts[h.id],0,1000000,'荣誉次数');});
        a.honorAdjustments=copy(d.counts);
        a.specials=Object.fromEntries(SPECIAL.map(function(h){return [h.id,!!d.specials[h.id]];}));
        log(s,a,'商家登记荣誉次数与特殊荣誉',at);break;
      case 'effect':
        assert(effectUnlocked(s,a,d.id),'该荣誉尚未解锁，暂不能设为出场特效');
        a.entranceEffect=d.id || null;log(s,a,'保存出场特效',at);break;
      case 'setHand':
        assert(!a.hand,'手牌已设置，不能再次修改');
        assert(Array.isArray(d.cards)&&d.cards.length===2,'请选择两张手牌');
        d.cards.forEach(function(n){integer(n,2,10,'手牌点数');});
        a.hand={cards:copy(d.cards),at:at};
        a.handActivity.unshift({id:action.id,at:at,text:'设置幸运手牌 '+d.cards.join(' + ')});
        log(s,a,'首次设置并锁定幸运手牌',at);break;
      case 'handWin':
        assert(a.hand,'请先设置幸运手牌');
        a.honorAdjustments.luckyWin=(a.honorAdjustments.luckyWin||0)+1;
        a.handActivity.unshift({id:action.id,at:at,text:'幸运手牌 '+a.hand.cards.join(' + ')+' 获胜，荷官登记1次'});
        log(s,a,'登记幸运手牌获胜',at);break;
      case 'probabilities':
        probabilityUnits(d.values);s.settings.probabilityHistory.unshift({version:s.settings.probabilityVersion,values:copy(s.settings.probabilities),at:at});
        s.settings.probabilities=copy(d.values);s.settings.probabilityVersion++;
        log(s,null,'更新商家共享抽奖模板 v'+s.settings.probabilityVersion,at);break;
      case 'levelTemplate':
        validateLevels(d.levels);s.settings.levels=copy(d.levels);log(s,null,'更新商家共享成长权益模板',at);break;
      case 'honorTemplate':
        HONORS.forEach(function(h){
          const r=d.rules[h.id];assert(r&&Array.isArray(r.thresholds)&&r.thresholds.length===5,'需要完整的五级荣誉规则');
          let prev=0;r.thresholds.forEach(function(t){integer(t,1,1000000,'达成次数');assert(t>prev,'荣誉门槛须逐级递增');prev=t;});
          assert(r.rewards.length===5,'请填写每一级奖励');r.rewards.forEach(function(n){integer(n,0,100000,'奖励门票');});
        });
        s.settings.honorRules=copy(d.rules);s.settings.honorVersion++;log(s,null,'更新商家共享荣誉模板',at);break;
      case 'giftTemplate':
        assert(d.prizes.length===8,'需要完整的8档礼物设置');
        s.settings.giftPrizes=d.prizes.map(function(x){return String(x).trim().slice(0,60);});
        log(s,null,'更新卡片对应礼物',at);break;
      case 'merchant':
        assert(String(d.name).trim(),'请填写商家名称');
        assert(d.stores.length===2&&d.stores.every(function(x){return String(x.name).trim();}),'请填写演示门店名称');
        s.merchant.name=d.name.trim();s.merchant.stores=copy(d.stores);log(s,null,'更新商家与演示门店名称',at);break;
      default: throw new Error('未识别的操作');
    }
    s.accounts.forEach(function(x){syncRewards(s,x,at);if(x.entranceEffect&&!effectUnlocked(s,x,x.entranceEffect))x.entranceEffect=null;});
    s.processed.push(action.id);
    s.revision++;s.updatedAt=at;
    return s;
  }
  const api={CARDS:CARDS,MERGE:MERGE,TICKETS:TICKETS,LEVEL_NAMES:LEVEL_NAMES,HONORS:HONORS,SPECIAL:SPECIAL,copy:copy,createState:createState,newAccount:newAccount,account:account,sessionValid:sessionValid,levelFor:levelFor,membership:membership,stats:stats,settled:settled,honorCounts:honorCounts,honorProgress:honorProgress,effectUnlocked:effectUnlocked,probabilityUnits:probabilityUnits,pickCard:pickCard,rankings:rankings,validateLevels:validateLevels,applyAction:applyAction};
  root.RZHCore=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
