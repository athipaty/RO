"use strict";
/* ================= tap a healer to be healed =================
   Sister Maren and Sister Ada used to open a window with a single button. Now tapping (or walking up to) them heals
   HP and SP at once, with a glow and a line from her. If she has a quest to offer, hand in or talk about, her
   conversation opens instead, as before. */
const _openNpcQH=openNpc;
openNpc=function(n){
  if(n&&n.role==='heal'&&P&&!P.dead){
    const key=typeof npcKeyOf==='function'?npcKeyOf(n):null,q=key&&typeof questsAt==='function'?questsAt(key):null;
    if(!(q&&(q.ready.length||q.offer.length||q.busy.length))){
      P.face=sface(n.x-P.x,n.y-P.y);S=computeStats();const full=P.hp>=S.maxhp&&P.sp>=S.maxsp;
      P.hp=S.maxhp;P.sp=S.maxsp;fx.push({k:'heal',x:P.x,y:P.y,t0:now,dur:.8});fx.push({k:'ring',x:P.x,y:P.y,r:34,col:'#9fe0c0',t0:now,dur:.5});
      sfx('heal');floatT(P.x,P.y-56,full?'Blessed':'HP / SP full','#9fe0c0',14);
      const th=typeof LANG!=='undefined'&&LANG==='th';
      bubbleSay(n,full?(th?'ไปเถิด ขอให้ปลอดภัย':'Go in peace, traveller.'):(th?'เอาล่ะ แสงสว่างฟื้นฟูเจ้าแล้ว':'There. The light restores you.'));
      addLog(`${n.name}: ${full?(th?'เจ้าสบายดีอยู่แล้ว ไปเถิด':'You are already well. Go in peace.'):(th?'รู้สึกสดชื่น (HP และ SP เต็ม)':'You feel refreshed (HP and SP full).')}`,'l-good');
      if(typeof save==='function')save();return;}}
  return _openNpcQH.apply(this,arguments);};
// a short speech bubble over the healer (uses the NPC bubble if the game has one)
function bubbleSay(n,txt){try{n.bubble={txt,until:now+3};}catch(e){}}
if(typeof TH!=='undefined')Object.assign(TH,{'Blessed':'ได้รับพร','HP / SP full':'HP / SP เต็ม'});
const _renderQH=render;
render=function(){const r=_renderQH.apply(this,arguments);if(!Z||!P)return r;
  for(const n of Z.npcs)if(n.bubble&&now<n.bubble.until){ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.translate(-camX,-camY);at(n.x,n.y,()=>bubble(n.bubble.txt,n.x,n.y-62));ctx.restore();}
  return r;};
