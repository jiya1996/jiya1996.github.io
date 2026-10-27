// 只切换实际界面的配色；预览里的业务控件不执行操作。
addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='rzh-design-theme')return;
 const {id,theme}=event.data;if(!['flame','neon','grass','warm','cute','pop','energy','star'].includes(id)||!theme)return;
 const root=document.documentElement;root.dataset.rzhTheme=id;for(const key of['bg','card','text','muted','border','accent','onAccent'])root.style.setProperty('--rzh-'+key,theme[key]);for(const[key,value]of Object.entries(theme.materials))root.style.setProperty('--sport-'+key,value);
 root.style.colorScheme=['flame','neon'].includes(id)?'dark':'light';parent.postMessage({type:'rzh-design-ready',theme:id},location.origin);
});
parent.postMessage({type:'rzh-design-loaded'},location.origin);
