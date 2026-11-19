"use strict";
/* ================= auto-hunt helps your party (v1.42.4) =================
   With auto-hunt on in a party, a monster that is attacking a party member (chasing them and within striking range,
   or just swung at them) comes first: if your own target is not attacking you, auto-hunt switches to the closest such
   monster and says who it is helping. Something attacking you is still fought first. Every game can see this from
   positions alone, so it works for host and guests alike. */
const AH={next:0,last:null};
const ahReach=(m,x,y)=>Math.hypot(m.x-x,m.y-y)<=(m.d.range||0)+m.d.size+(typeof PR==='number'?PR:12)+46;
const ahOnMe=m=>!!(m&&!m.dead&&P&&ahReach(m,P.x,P.y)&&(m.state==='chase'||now-(m.lunge||-9)<1.5));
function ahAttackers(){if(typeof partyMatesHere!=='function'||!SOC||!SOC.party)return [];const mates=partyMatesHere(),out=[];
  for(const m of mobs){if(m.dead||m.dying)continue;const busy=m.state==='chase'||now-(m.lunge||-9)<1.5;if(!busy)continue;
    for(const o of mates){const x=o.rx!==undefined?o.rx:o.x,y=o.ry!==undefined?o.ry:o.y;if(ahReach(m,x,y)&&Math.hypot(m.x-x,m.y-y)<Math.hypot(m.x-P.x,m.y-P.y)){out.push({m,who:o.n||'your party'});break;}}}
  return out;}
{const _ah=autoHunt;autoHunt=function(){try{if(P&&P.auto&&!P.dead&&!Z.D.safe&&now>=AH.next&&SOC&&SOC.party){AH.next=now+.4;
    const cur=P.target&&!P.target.dead?P.target:null,list=ahAttackers();
    if(list.length&&!ahOnMe(cur)&&!list.some(a=>a.m===cur)){let best=null,bd=650;for(const a of list){const d=dist(a.m,P);if(d<bd){bd=d;best=a;}}
      if(best){P.target=best.m;P.queued=null;P.sitting=false;P.holdPos=false;P.path=[];if(AH.last!==best.m){AH.last=best.m;floatT(P.x,P.y-60,`Helping ${best.who}!`,'#8fe0a8',12);}}}}}catch(e){}
  return _ah.apply(this,arguments);};}
if(typeof TH_PAT!=='undefined')TH_PAT.unshift([/^Helping (.+)!$/,'ช่วย $1!']);
