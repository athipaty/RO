"use strict";
/* ================= the Dye & Wardrobe (v1.77.0; easier and bigger in v1.78.0) =================
   Gemcutter Sela's shop in Aurelmark (Market Row) is now the Dye & Wardrobe, kept by Dyer Celestine. Everything here is
   for looks only and costs gold (prices grow with your level), so it gives rich heroes something to spend on without
   making anyone stronger:
     Dye           recolour your job's outfit (12 colours, Snow and Shadow, or the original): every coloured part takes the
                   dye's colour (metal, white and black stay as they are), Snow pales and Shadow darkens everything
     Costume hat   unlock a hat's look once, then wear it over whatever head gear you have (its stats still count)
     Costume cape  a cape behind your hero in a colour of your choice
     Aura          (v1.78.0; masters only since v1.80.0) recolours a master's own aura and rune circle (it used to add a
                   second glow, which doubled the masters' own)
     Saved looks   (v1.78.0) keep up to 3 whole looks and change between them for free
   (v1.78.0) Easier: try anything on and the preview shows it at once; the bar at the bottom adds up what is new and one
   button buys and wears it all (or Reset). A colour you have bought is yours: changing back to it later is free. The
   preview turns with ◀ ▶, and Before shows your look as it is now.
   Other players see it (presence field wd: "dye|cape|hat|aura"). Saved as P.ward = {dye, cape, hat, aura, hats, dyes,
   capes, auras, capeOwned, auraOwned, looks}. The stylist's preview (js/stylist.js) shows it too. */
const WARD_DYES=[['crimson','Crimson','ชาด',0],['ember','Ember','ถ่านไฟ',22],['gold','Gold','ทอง',44],['moss','Moss','มอส',95],['jade','Jade','หยก',150],['teal','Teal','น้ำทะเล',180],
  ['sky','Sky','ฟ้า',205],['royal','Royal','น้ำเงินหลวง',228],['violet','Violet','ม่วง',268],['plum','Plum','พลัม',300],['rose','Rose','กุหลาบ',330],['sand','Sand','ทราย',36],
  ['snow','Snow','หิมะ',-1],['shadow','Shadow','เงา',-2]];
const WARD_COST={dye:lv=>2000+lv*150,cape:25000,capeDye:lv=>1000+lv*60,aura:15000,auraDye:lv=>1000+lv*60,hat:id=>Math.max(3000,Math.round(((ITEMS[id]||{}).price||2000)*1.5/100)*100)};
const WARD_PARTS=['dye','cape','hat','aura'];
const wardTh=()=>typeof LANG!=='undefined'&&LANG==='th';
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('ward');
function wardMine(){if(!P)return {};if(!P.ward||typeof P.ward!=='object')P.ward={};const w=P.ward;
  for(const k of WARD_PARTS)if(typeof w[k]!=='string')w[k]='';for(const k of ['hats','dyes','capes','auras','looks'])if(!Array.isArray(w[k]))w[k]=[];
  // (v1.78.0) colours bought before are owned
  if(w.dye&&!w.dyes.includes(w.dye))w.dyes.push(w.dye);if(w.cape&&!w.capes.includes(w.cape))w.capes.push(w.cape);return w;}
const wardCode=w=>w?`${w.dye||''}|${w.cape||''}|${w.hat||''}|${w.aura||''}`:'';
function wardParse(s){if(typeof s!=='string'||s.length>80)return null;const [d,c,h,a]=s.split('|');const ok=k=>!k||WARD_DYES.some(x=>x[0]===k);
  return {dye:ok(d)?d||'':'',cape:ok(c)?c||'':'',hat:h&&ITEMS[h]&&ITEMS[h].type==='head'?h:'',aura:ok(a)?a||'':''};}
const wardAny=w=>!!(w&&(w.dye||w.cape||w.hat||w.aura));
// ---- colours ----
function wHex2Hsl(h){const n=parseInt(h.slice(1),16),r=(n>>16)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let hh=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;hh*=60;}return [hh,s,l];}
function wHsl2Hex(h,s,l){h=((h%360)+360)%360;const f=n=>{const k=(n+h/30)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));};return '#'+[f(0),f(8),f(4)].map(v=>v.toString(16).padStart(2,'0')).join('');}
const WARD_SKIP=new Set(['skin','glow','eye','fam','kit']);
const wardCache=new Map();
function wardDyed(K,dye,key){const ck=key+'|'+dye;if(wardCache.has(ck))return wardCache.get(ck);const d=WARD_DYES.find(x=>x[0]===dye);if(!d)return K;
  const out={...K};for(const k in K){const v=K[k];if(WARD_SKIP.has(k)||typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))continue;let [h,s,l]=wHex2Hsl(v);
    if(d[3]===-1){s*=.25;l=Math.min(.94,l*.55+.42);}else if(d[3]===-2){s*=.45;l=Math.max(.08,l*.45);}else if(s>.08){h=d[3];s=Math.max(s,.35);}
    out[k]=wHsl2Hex(h,s,l);}
  wardCache.set(ck,out);return out;}
const wardSwatch=k=>{const d=WARD_DYES.find(x=>x[0]===k);return !d?null:d[3]===-1?'#eef2f6':d[3]===-2?'#26242c':wHsl2Hex(d[3],.62,.5);};
function wardCapeCol(k){const d=WARD_DYES.find(x=>x[0]===k)||WARD_DYES[0];if(d[3]===-1)return ['#e8ecf0','#ffffff'];if(d[3]===-2)return ['#1e1c24','#5a5468'];return [wHsl2Hex(d[3],.55,.38),wHsl2Hex(d[3]+15,.7,.62)];}
function wardAuraCol(k){const d=WARD_DYES.find(x=>x[0]===k);if(!d)return null;return d[3]===-1?'#ffffff':d[3]===-2?'#6a4a9a':wHsl2Hex(d[3],.8,.6);}
// ---- drawing: put a look on while one hero is drawn (dye, cape, costume hat), then take it off again ----
const wardMaster=cls=>!!(CLASSES[cls]&&CLASSES[cls].tier===3);
function wardWear(cls,w,fn,hatSet){const fam=typeof baseOf==='function'?baseOf(cls):cls,undo=[];
  try{if(w.dye){const tb=typeof OUTFITS!=='undefined'&&OUTFITS[fam];if(tb&&tb[cls]){const o=tb[cls];undo.push(()=>{tb[cls]=o;});tb[cls]=wardDyed(o,w.dye,'o'+fam+cls);}
      if(typeof WARDEN_LOOKS!=='undefined'&&fam==='warden'&&WARDEN_LOOKS[cls]){const o=WARDEN_LOOKS[cls];undo.push(()=>{WARDEN_LOOKS[cls]=o;});WARDEN_LOOKS[cls]=wardDyed(o,w.dye,'w'+cls);}}
    const master=wardMaster(cls);
    if((w.cape||(w.aura&&master))&&typeof JOB_LOOK!=='undefined'){const o=JOB_LOOK[cls],had=Object.prototype.hasOwnProperty.call(JOB_LOOK,cls);let L={...(o||{}),b:[...((o&&o.b)||[])]};
      if(w.cape&&!L.b.some(x=>x[0]==='cape')){const [c,t]=wardCapeCol(w.cape);L.b.unshift(['cape',{c,t,long:1}]);}
      // (v1.80.0) a master's aura and rune circle take the colour (only masters have one: the Aura tab opens with the master calling)
      if(w.aura&&master){const c=wardAuraCol(w.aura),t=wHsl2Hex(wHex2Hsl(c)[0],.6,.85);L.aura=c;L.b=L.b.map(x=>x[0]==='sigil'?['sigil',{...x[1],c,t}]:x);}
      undo.push(()=>{if(had)JOB_LOOK[cls]=o;else delete JOB_LOOK[cls];});JOB_LOOK[cls]=L;}
    if(w.hat&&hatSet)undo.push(hatSet(w.hat));
    return fn();}
  finally{for(let i=undo.length-1;i>=0;i--)try{undo[i]();}catch(e){}}}
// the aura: a soft glow and a slowly turning ring on the ground under the hero
function wardAura(x,y,k){const c=wardAuraCol(k);if(!c)return;const p=.6+.4*Math.sin(now*2.4);ctx.save();ctx.translate(x,y);ctx.scale(1,.38);
  const g=ctx.createRadialGradient(0,0,2,0,0,26);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=.32*p+.12;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,26,0,7);ctx.fill();
  ctx.globalAlpha=.55;ctx.strokeStyle=c;ctx.lineWidth=1.6;ctx.setLineDash([6,5]);ctx.lineDashOffset=-now*10;ctx.beginPath();ctx.arc(0,0,21,0,7);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
const WD={cur:null};
if(typeof drawOther==='function'){const _doW=drawOther;drawOther=function(o){const k=WD.cur;WD.cur=o&&o.wd?o.wd:null;try{return _doW.apply(this,arguments);}finally{WD.cur=k;}};}
if(typeof drawPlayerBody==='function'){const _dpbW=drawPlayerBody;drawPlayerBody=function(p){
  const w=p&&p.__wd?p.__wd:(p===P||(P&&p&&!WD.cur&&p.name===P.name))?(P.ward||null):WD.cur;if(!wardAny(w))return _dpbW.apply(this,arguments);
  const args=arguments;
  return wardWear(p.cls,w,()=>_dpbW.apply(this,args),h=>{const h0=p.hat,had=Object.prototype.hasOwnProperty.call(p,'hat');p.hat=h;return ()=>{if(had)p.hat=h0;else delete p.hat;};});};}
// the stylist's preview (Lune, js/stylist.js) shows your look too
if(typeof styDraw==='function'){const _sdW=styDraw;styDraw=function(){const w=P&&P.ward;if(!wardAny(w))return _sdW.apply(this,arguments);
  const args=arguments;return wardWear(P.cls,w,()=>{if(!w.hat)return _sdW.apply(this,args);const _dh=drawHuman;drawHuman=function(x,y,b,h,f,wk,opt){return _dh.call(this,x,y,b,h,f,wk,{...(opt||{}),hat:w.hat});};try{return _sdW.apply(this,args);}finally{drawHuman=_dh;}});};}
// the start screen: the chosen character wears its look (its slot summary carries P.ward, js/ui.js slotSum)
WD.stance=null;
if(typeof drawLookPreview==='function'){const _dlpW=drawLookPreview;drawLookPreview=function(){const sv=typeof CS!=='undefined'&&CS.sum&&CS.sum[CS.slot];WD.stance=sv&&sv.ward||null;try{return _dlpW.apply(this,arguments);}finally{WD.stance=null;}};}
if(typeof drawStance==='function'){const _dsW=drawStance;drawStance=function(cls){const w=WD.stance;if(!wardAny(w))return _dsW.apply(this,arguments);const args=arguments;
  return wardWear(cls,w,()=>{if(!w.hat)return _dsW.apply(this,args);const _dh=drawHuman;drawHuman=function(x,y,b,h,f,wk,opt){return _dh.call(this,x,y,b,h,f,wk,{...(opt||{}),hat:w.hat});};try{return _dsW.apply(this,args);}finally{drawHuman=_dh;}});};}
// ---- the window (Dyer Celestine) ----
const WARDUI={tab:'dye',pick:{},turn:0,before:false};
const wardHats=()=>{const shop=new Set([...(typeof SHOP!=='undefined'?SHOP:[]),...(typeof ROYAL_SHOP!=='undefined'?ROYAL_SHOP:[]),...(typeof FORGES!=='undefined'?FORGES.map(f=>f[0]):[])]);
  return Object.keys(ITEMS).filter(id=>ITEMS[id].type==='head'&&shop.has(id)).sort((a,b)=>(ITEMS[a].lv||0)-(ITEMS[b].lv||0));};
const wardTry=()=>{const w=wardMine(),o={};for(const k of WARD_PARTS)o[k]=WARDUI.pick[k]!==undefined?WARDUI.pick[k]:w[k];if(P&&!wardMaster(P.cls))o.aura=w.aura;return o;};
// what the new look costs: only what you do not own yet
function wardBill(t){const w=wardMine(),lines=[];t=t||wardTry();
  if(t.dye&&t.dye!==w.dye&&!w.dyes.includes(t.dye))lines.push(['dye',WARD_COST.dye(P.lv)]);
  if(t.cape&&t.cape!==w.cape){if(!w.capeOwned)lines.push(['cape',WARD_COST.cape]);else if(!w.capes.includes(t.cape))lines.push(['cape',WARD_COST.capeDye(P.lv)]);}
  if(t.aura&&t.aura!==w.aura&&wardMaster(P.cls)){if(!w.auraOwned)lines.push(['aura',WARD_COST.aura]);else if(!w.auras.includes(t.aura))lines.push(['aura',WARD_COST.auraDye(P.lv)]);}
  if(t.hat&&t.hat!==w.hat&&!w.hats.includes(t.hat))lines.push(['hat',WARD_COST.hat(t.hat)]);
  return {lines,total:lines.reduce((a,l)=>a+l[1],0),changed:WARD_PARTS.some(k=>t[k]!==w[k])};}
function wardPreview(){const cv=document.getElementById('wardCv');if(!cv||!P)return;const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
  const w=WARDUI.before?{...wardMine()}:wardTry(),main=ctx;ctx=g;g.setTransform(2.6,0,0,2.6,0,0);const ph=((WARDUI.turn%4)+4)%4,f=ph===1||ph===2?-1:1,bk=ph>=2;
  try{drawPlayer({name:P.name,look:P.look,cls:P.cls,eq:{...P.eq,weapon:null},x:31,y:58,face:f,back:bk,moving:false,sitting:false,held:true,__wd:w},null);}catch(e){}finally{ctx=main;}}
setInterval(()=>{try{if(typeof panelKind!=='undefined'&&panelKind==='gemcut')wardPreview();}catch(e){}},80);
const wName=k=>{const d=WARD_DYES.find(x=>x[0]===k);return d?(wardTh()?d[2]:d[1]):(wardTh()?'ไม่มี':'None');};
const wOwnTag=own=>own?`<b class="wown" title="${wardTh()?'เป็นของคุณแล้ว':'Yours'}">✓</b>`:'';
function wardSwatches(part,cur,owned,noneLabel){return `<div class="wsws">`+[['',null],...WARD_DYES.map(d=>[d[0],wardSwatch(d[0])])].map(([k,c])=>
  `<button class="wsw${cur===k?' on':''}" data-act="wardset" data-arg="${part}:${k}" aria-label="${k?wName(k):noneLabel}"><i style="${c?`background:${c}`:''}" class="${c?'':'none'}"></i><span>${k?wName(k):noneLabel}</span>${k&&owned.includes(k)?wOwnTag(1):''}</button>`).join('')+`</div>`;}
PANELS.gemcut=()=>{const th=wardTh(),w=wardMine(),t=wardTry(),bill=wardBill(t);
  let h=`<h2>${th?'ร้านย้อมและตู้เสื้อผ้า':'Dye & Wardrobe'}</h2><div class="say">${th?'"ลองได้ทุกอย่าง จ่ายเฉพาะสิ่งที่ยังไม่มี สีที่ซื้อแล้วเป็นของเจ้าตลอดไป"':'"Try anything on. You only pay for what is new, and a colour you buy is yours for good."'}</div>`;
  h+=`<div class="wardtop"><div class="wcv"><canvas id="wardCv" width="160" height="176" aria-hidden="true"></canvas>
    <div class="wturn"><button class="btn small" data-act="wardturn" data-arg="-1" aria-label="${th?'หมุนซ้าย':'Turn left'}">◀</button><button class="btn small${WARDUI.before?' on':''}" data-act="wardbefore">${th?'ก่อน':'Before'}</button><button class="btn small" data-act="wardturn" data-arg="1" aria-label="${th?'หมุนขวา':'Turn right'}">▶</button></div></div>
    <div class="grow wtabs" role="tablist">`+[['dye','🎨',th?'ย้อมสี':'Dye'],['hat','🎩',th?'หมวก':'Hat'],['cape','🧣',th?'ผ้าคลุม':'Cape'],['aura','✨',th?'ออร่า':'Aura'],['looks','💾',th?'ชุดที่บันทึก':'Saved looks']]
      .map(([k,i,l])=>`<button class="wtab${WARDUI.tab===k?' on':''}" data-act="wardtab" data-arg="${k}" role="tab" aria-selected="${WARDUI.tab===k}"><i>${i}</i><span>${l}</span></button>`).join('')+`</div></div>`;
  const tab=WARDUI.tab;
  if(tab==='dye')h+=`<div class="ds">${th?'ย้อมส่วนที่มีสีของชุดอาชีพ (โลหะ สีขาว สีดำ คงเดิม หิมะและเงาเปลี่ยนทั้งชุด)':'Colours the coloured parts of your job outfit (metal, white and black stay; Snow and Shadow change everything)'} · ${fmt(WARD_COST.dye(P.lv))} gold</div>`+wardSwatches('dye',t.dye,w.dyes,th?'สีเดิม':'Original');
  else if(tab==='cape')h+=`<div class="ds">${th?'ผ้าคลุมด้านหลัง':'A cape behind your hero.'} ${w.capeOwned?`${th?'สีใหม่':'A new colour'} ${fmt(WARD_COST.capeDye(P.lv))} gold`:`${th?'ครั้งแรก':'First cape'} ${fmt(WARD_COST.cape)} gold`}</div>`+wardSwatches('cape',t.cape,w.capes,th?'ไม่ใส่':'None');
  else if(tab==='aura'&&!wardMaster(P.cls))h+=`<div class="wlock"><b>✨</b><div>${th?'ออร่าเปิดเมื่อคุณเป็นอาชีพขั้นสูงสุด (มาสเตอร์) แล้วจะเปลี่ยนสีออร่าและวงเวทใต้เท้าของคุณได้':'The Aura opens with your master calling: it recolours the master aura and rune circle under your feet.'}</div></div>`;
  else if(tab==='aura')h+=`<div class="ds">${th?'เปลี่ยนสีออร่าและวงเวทของมาสเตอร์':'Recolours your master aura and rune circle.'} ${w.auraOwned?`${th?'สีใหม่':'A new colour'} ${fmt(WARD_COST.auraDye(P.lv))} gold`:`${th?'ครั้งแรก':'First aura'} ${fmt(WARD_COST.aura)} gold`}</div>`+wardSwatches('aura',t.aura,w.auras,th?'ไม่มี':'None');
  else if(tab==='hat'){h+=`<div class="ds">${th?'ใส่ทับหมวกจริงได้ ค่าสถานะยังคงอยู่':'Worn over your real head gear; its stats still count.'}</div><div class="whats">`+
      `<button class="what${!t.hat?' on':''}" data-act="wardset" data-arg="hat:"><span class="wnone"></span><span>${th?'ไม่ใส่':'None'}</span></button>`+
      wardHats().map(id=>{const own=w.hats.includes(id);return `<button class="what${t.hat===id?' on':''}" data-act="wardset" data-arg="hat:${id}" title="${esc(ITEMS[id].name)}">${icon({id})}<span class="whn">${esc(ITEMS[id].name)}</span><span>${own?(th?'มีแล้ว':'Yours'):fmt(WARD_COST.hat(id))}</span>${wOwnTag(own)}</button>`;}).join('')+`</div>`;}
  else{h+=`<div class="ds">${th?'บันทึกลุคไว้ได้ 3 ชุด เปลี่ยนไปมาได้ฟรี':'Keep up to 3 looks and change between them for free.'}</div>`;
    for(let i=0;i<3;i++){const L=w.looks[i];h+=`<div class="row"><span class="wlook">${L?[L.dye,L.cape,L.aura].map(k=>k?`<i style="background:${wardSwatch(k)}"></i>`:'').join(''):''}</span><div class="grow"><div class="nm">${th?'ลุค':'Look'} ${i+1}</div><div class="ds">${L?[L.dye&&wName(L.dye),L.hat&&ITEMS[L.hat]&&ITEMS[L.hat].name,L.cape&&(th?'ผ้าคลุม':'cape'),L.aura&&(th?'ออร่า':'aura')].filter(Boolean).join(' · ')||(th?'ชุดเดิม':'Original'):(th?'ว่าง':'Empty')}</div></div>`+
      `${L?`<button class="btn small" data-act="wardlook" data-arg="wear:${i}">${th?'ใส่':'Wear'}</button>`:''}<button class="btn small" data-act="wardlook" data-arg="save:${i}">${th?'บันทึกลุคนี้':'Save current'}</button></div>`;}}
  // the bar: what is new, what it costs, one button
  if(tab!=='looks')h+=`<div class="wbar"><div class="grow">${bill.changed?(bill.total?`${th?'ของใหม่':'New'}: ${bill.lines.map(l=>({dye:th?'สีย้อม':'dye',cape:th?'ผ้าคลุม':'cape',aura:th?'ออร่า':'aura',hat:th?'หมวก':'hat'})[l[0]]).join(', ')} · <b class="gold">${fmt(bill.total)} gold</b>`:(th?'เป็นของคุณแล้วทั้งหมด: เปลี่ยนฟรี':'All yours already: free to change')):(th?'ลองเลือกดู แล้วดูตัวอย่างทางซ้าย':'Pick something to try it on')}</div>
    <button class="btn small" data-act="wardreset" ${bill.changed?'':'disabled'}>${th?'รีเซ็ต':'Reset'}</button><button class="btn" data-act="wardbuy" ${bill.changed&&P.gold>=bill.total?'':'disabled'}>${bill.total?(th?'ซื้อและใส่':'Buy & wear'):(th?'ใส่':'Wear')}</button></div>`;
  return h;};
PANEL_ACTS.wardtab=k=>{WARDUI.tab=k;refreshPanel();};
PANEL_ACTS.wardset=a=>{const [part,k]=String(a).split(':');if(!WARD_PARTS.includes(part))return;WARDUI.pick[part]=k||'';WARDUI.before=false;refreshPanel();};
PANEL_ACTS.wardturn=d=>{WARDUI.turn+=(+d||1);wardPreview();};
PANEL_ACTS.wardbefore=()=>{WARDUI.before=!WARDUI.before;refreshPanel();};
PANEL_ACTS.wardreset=()=>{WARDUI.pick={};WARDUI.before=false;refreshPanel();};
PANEL_ACTS.wardbuy=()=>{const w=wardMine(),t=wardTry(),bill=wardBill(t),th=wardTh();if(!bill.changed||P.gold<bill.total)return;
  P.gold-=bill.total;
  if(t.dye&&!w.dyes.includes(t.dye))w.dyes.push(t.dye);
  if(t.cape){w.capeOwned=1;if(!w.capes.includes(t.cape))w.capes.push(t.cape);}
  if(t.aura){w.auraOwned=1;if(!w.auras.includes(t.aura))w.auras.push(t.aura);}
  if(t.hat&&!w.hats.includes(t.hat))w.hats.push(t.hat);
  for(const k of WARD_PARTS)w[k]=t[k];WARDUI.pick={};WARDUI.before=false;
  if(typeof sfx==='function')sfx(bill.total?'coin':'click');fx.push({k:'ring',x:P.x,y:P.y,r:34,col:'#e8a8ff',t0:now,dur:.6});
  addLog(th?`เซเลสทีนจัดการให้แล้ว${bill.total?` (−${fmt(bill.total)} gold)`:''}`:`Celestine works her craft. You look new.${bill.total?` (−${fmt(bill.total)} gold)`:''}`,'l-good');
  if(typeof NET!=='undefined')NET.lastSent='';if(typeof save==='function')save();refreshPanel();};
PANEL_ACTS.wardlook=a=>{const [op,iS]=String(a).split(':'),i=+iS,w=wardMine(),th=wardTh();if(!(i>=0&&i<3))return;
  if(op==='save'){w.looks[i]={dye:w.dye,cape:w.cape,hat:w.hat,aura:w.aura};addLog(th?`บันทึกลุค ${i+1} แล้ว`:`Saved as Look ${i+1}.`,'l-good');}
  else if(op==='wear'&&w.looks[i]){const L=w.looks[i];
    // only what you own (a look saved before something was sold back stays safe)
    w.dye=L.dye&&w.dyes.includes(L.dye)?L.dye:'';w.cape=L.cape&&w.capeOwned&&w.capes.includes(L.cape)?L.cape:'';w.aura=L.aura&&w.auraOwned&&w.auras.includes(L.aura)?L.aura:'';w.hat=L.hat&&w.hats.includes(L.hat)?L.hat:'';
    WARDUI.pick={};if(typeof sfx==='function')sfx('click');addLog(th?`ใส่ลุค ${i+1}`:`You change into Look ${i+1}.`,'l-good');if(typeof NET!=='undefined')NET.lastSent='';}
  if(typeof save==='function')save();refreshPanel();};
PANEL_CLOSE.gemcut=()=>{WARDUI.pick={};WARDUI.before=false;};
{const st=document.createElement('style');st.textContent=`
.wardtop{display:flex;gap:12px;align-items:flex-start;margin:6px 0 10px}.wcv{flex:none;display:flex;flex-direction:column;align-items:center;gap:6px}
#wardCv{width:160px;height:176px;border-radius:14px;background:radial-gradient(circle at 50% 45%,rgba(232,168,255,.2),rgba(0,0,0,.28))}
.wturn{display:flex;gap:4px}.wtabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;align-content:start}
.wtab{display:flex;align-items:center;gap:8px;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:inherit;font:inherit;cursor:pointer;min-height:46px}
.wtab i{font-style:normal;font-size:20px}.wtab.on{border-color:#e8a8ff;background:rgba(232,168,255,.14)}
.wsws{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px;margin:8px 0}
.wsw,.what{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:12px;border:2px solid transparent;background:rgba(255,255,255,.04);color:inherit;font:inherit;font-size:11.5px;cursor:pointer}
.wsw i{width:34px;height:34px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,255,255,.35),0 2px 6px rgba(0,0,0,.4)}
.wsw i.none,.wnone{width:34px;height:34px;border-radius:50%;background:repeating-linear-gradient(45deg,#777 0 3px,transparent 3px 7px);display:block}
.wsw.on,.what.on{border-color:#e8a8ff;background:rgba(232,168,255,.14)}.wown{position:absolute;top:3px;right:6px;color:#7fd38a;font-size:12px}
.whn{font-size:10.5px;line-height:1.15;text-align:center;opacity:.85}.whats{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px;margin:8px 0}
.wbar{position:sticky;bottom:0;display:flex;align-items:center;gap:8px;padding:10px;margin:10px -4px 0;border-radius:12px;background:rgba(20,16,28,.96);border:1px solid rgba(232,168,255,.35)}
.wlock{display:flex;gap:10px;align-items:center;padding:14px;margin:8px 0;border-radius:12px;background:rgba(255,255,255,.04);border:1px dashed rgba(232,168,255,.4)}.wlock b{font-size:24px}.wlook{display:flex;gap:3px;width:42px}.wlook i{width:12px;height:12px;border-radius:50%;display:block}
@media (max-width:420px){.wardtop{flex-direction:column;align-items:center}.wtabs{grid-template-columns:repeat(5,1fr);width:100%}.wtab{flex-direction:column;gap:2px;padding:6px 2px;font-size:10.5px}}`;document.head.appendChild(st);}
if(typeof TH!=='undefined')Object.assign(TH,{'Dye & Wardrobe':'ร้านย้อมและตู้เสื้อผ้า','Dyer Celestine':'ช่างย้อมเซเลสทีน'});
