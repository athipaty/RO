"use strict";
/* ================= the Dye & Wardrobe (v1.77.0) =================
   Gemcutter Sela's shop in Aurelmark (Market Row) is now the Dye & Wardrobe, kept by Dyer Celestine. Everything here is
   for looks only and costs gold (prices grow with your level), so it gives rich heroes something to spend on without
   making anyone stronger:
     Dye           recolour your job's outfit (12 colours, Snow and Shadow, or back to the original): every coloured part takes
                   the dye's colour (metal, white and black stay as they are), Snow pales and Shadow darkens everything.
     Costume hat   unlock a hat's look once, then wear it over whatever head gear you have (its stats still count)
     Costume cape  a cape behind your hero in a colour of your choice
   Other players see it (presence field wd: "dye|cape|hat"). Saved as P.ward = {dye, cape, hat, hats:[unlocked]}. */
const WARD_DYES=[['crimson','Crimson','ชาด',0],['ember','Ember','ถ่านไฟ',22],['gold','Gold','ทอง',44],['moss','Moss','มอส',95],['jade','Jade','หยก',150],['teal','Teal','น้ำทะเล',180],
  ['sky','Sky','ฟ้า',205],['royal','Royal','น้ำเงินหลวง',228],['violet','Violet','ม่วง',268],['plum','Plum','พลัม',300],['rose','Rose','กุหลาบ',330],['sand','Sand','ทราย',36],
  ['snow','Snow','หิมะ',-1],['shadow','Shadow','เงา',-2]];
const WARD_COST={dye:lv=>2000+lv*150,cape:25000,capeDye:lv=>1000+lv*60,hat:id=>Math.max(3000,Math.round(((ITEMS[id]||{}).price||2000)*1.5/100)*100)};
const wardTh=()=>typeof LANG!=='undefined'&&LANG==='th';
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('ward');
function wardMine(){if(!P)return {};if(!P.ward||typeof P.ward!=='object')P.ward={dye:'',cape:'',hat:'',hats:[]};if(!Array.isArray(P.ward.hats))P.ward.hats=[];return P.ward;}
const wardCode=w=>w?`${w.dye||''}|${w.cape||''}|${w.hat||''}`:'';
function wardParse(s){if(typeof s!=='string'||s.length>60)return null;const [d,c,h]=s.split('|');const ok=k=>!k||WARD_DYES.some(x=>x[0]===k);
  return {dye:ok(d)?d||'':'',cape:ok(c)?c||'':'',hat:h&&ITEMS[h]&&ITEMS[h].type==='head'?h:''};}
// ---- colours ----
function wHex2Hsl(h){const n=parseInt(h.slice(1),16),r=(n>>16)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let hh=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;hh*=60;}return [hh,s,l];}
function wHsl2Hex(h,s,l){h=((h%360)+360)%360;const f=n=>{const k=(n+h/30)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));};return '#'+[f(0),f(8),f(4)].map(v=>v.toString(16).padStart(2,'0')).join('');}
const WARD_SKIP=new Set(['skin','glow','eye','fam','kit']);
const wardCache=new Map();
function wardDyed(K,dye,key){const ck=key+'|'+dye;if(wardCache.has(ck))return wardCache.get(ck);const d=WARD_DYES.find(x=>x[0]===dye);if(!d)return K;
  // the outfit's main colour: the first colourful field (body, coat, robe...)
  let base=null;for(const k of ['body','coat','robe','vest','sleeve','tunic','cloth','top']){const v=K[k];if(typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)){const [h,s]=wHex2Hsl(v);if(s>.12){base=h;break;}}}
  if(base===null)for(const k in K){const v=K[k];if(typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)&&!WARD_SKIP.has(k)){const [h,s]=wHex2Hsl(v);if(s>.12){base=h;break;}}}
  const out={...K};for(const k in K){const v=K[k];if(WARD_SKIP.has(k)||typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))continue;let [h,s,l]=wHex2Hsl(v);
    if(d[3]===-1){s*=.25;l=Math.min(.94,l*.55+.42);}else if(d[3]===-2){s*=.45;l=Math.max(.08,l*.45);}else if(s>.08){h=d[3];s=Math.max(s,.35);}
    out[k]=wHsl2Hex(h,s,l);}
  wardCache.set(ck,out);return out;}
function wardCapeCol(k){const d=WARD_DYES.find(x=>x[0]===k)||WARD_DYES[0];if(d[3]===-1)return ['#e8ecf0','#ffffff'];if(d[3]===-2)return ['#1e1c24','#5a5468'];return [wHsl2Hex(d[3],.55,.38),wHsl2Hex(d[3]+15,.7,.62)];}
// ---- drawing: the hero being drawn wears its own dye, cape and hat ----
const WD={cur:null};
if(typeof drawOther==='function'){const _doW=drawOther;drawOther=function(o){const k=WD.cur;WD.cur=o&&o.wd?o.wd:null;try{return _doW.apply(this,arguments);}finally{WD.cur=k;}};}
if(typeof drawPlayerBody==='function'){const _dpbW=drawPlayerBody;drawPlayerBody=function(p){
  const w=p&&p.__wd?p.__wd:p===P?(P.ward||null):WD.cur;if(!w||!(w.dye||w.cape||w.hat))return _dpbW.apply(this,arguments);
  const cls=p.cls,fam=typeof baseOf==='function'?baseOf(cls):cls,undo=[];
  try{if(w.dye){const tb=typeof OUTFITS!=='undefined'&&OUTFITS[fam];if(tb&&tb[cls]){const o=tb[cls];undo.push(()=>{tb[cls]=o;});tb[cls]=wardDyed(o,w.dye,'o'+fam+cls);}
      if(typeof WARDEN_LOOKS!=='undefined'&&fam==='warden'&&WARDEN_LOOKS[cls]){const o=WARDEN_LOOKS[cls];undo.push(()=>{WARDEN_LOOKS[cls]=o;});WARDEN_LOOKS[cls]=wardDyed(o,w.dye,'w'+cls);}}
    if(w.cape&&typeof JOB_LOOK!=='undefined'){const o=JOB_LOOK[cls],had=Object.prototype.hasOwnProperty.call(JOB_LOOK,cls),bk=(o&&o.b)||[];
      if(!bk.some(x=>x[0]==='cape')){const [c,t]=wardCapeCol(w.cape);undo.push(()=>{if(had)JOB_LOOK[cls]=o;else delete JOB_LOOK[cls];});JOB_LOOK[cls]={...(o||{}),b:[['cape',{c,t,long:1}],...bk]};}}
    if(w.hat){const h0=p.hat,hadH=Object.prototype.hasOwnProperty.call(p,'hat');undo.push(()=>{if(hadH)p.hat=h0;else delete p.hat;});p.hat=w.hat;}
    return _dpbW.apply(this,arguments);}
  finally{for(let i=undo.length-1;i>=0;i--)try{undo[i]();}catch(e){}}};}
// ---- the window (Dyer Celestine) ----
const WARDUI={tab:'dye',pick:null};
const wardHats=()=>{const shop=new Set([...(typeof SHOP!=='undefined'?SHOP:[]),...(typeof ROYAL_SHOP!=='undefined'?ROYAL_SHOP:[]),...(typeof FORGES!=='undefined'?FORGES.map(f=>f[0]):[])]);
  return Object.keys(ITEMS).filter(id=>ITEMS[id].type==='head'&&shop.has(id)).sort((a,b)=>(ITEMS[a].lv||0)-(ITEMS[b].lv||0));};
function wardPreview(){const cv=document.getElementById('wardCv');if(!cv||!P)return;const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
  const w={...wardMine(),...(WARDUI.pick||{})},main=ctx;ctx=g;g.setTransform(2.4,0,0,2.4,0,0);const face=Math.floor(now/1.6)%4,f=face===1||face===2?-1:1,bk=face>=2;
  try{drawPlayer({name:P.name,look:P.look,cls:P.cls,eq:{...P.eq,weapon:null},x:30,y:56,face:f,back:bk,moving:false,sitting:false,held:true,__wd:w},null);}catch(e){}finally{ctx=main;}}
setInterval(()=>{try{if(typeof panelKind!=='undefined'&&panelKind==='gemcut')wardPreview();}catch(e){}},80);
const wardSw=(k,on,act)=>{const d=WARD_DYES.find(x=>x[0]===k),col=d?(d[3]<0?(d[3]===-1?'#e8ecf0':'#26242c'):wHsl2Hex(d[3],.6,.5)):'transparent';
  return `<button class="btn small wsw${on?' on':''}" data-act="${act}" data-arg="${k}" title="${d?(wardTh()?d[2]:d[1]):(wardTh()?'สีเดิม':'Original')}"><i style="background:${col}"></i>${d?(wardTh()?d[2]:d[1]):(wardTh()?'สีเดิม':'Original')}</button>`;};
PANELS.gemcut=()=>{const th=wardTh(),w=wardMine(),pk=WARDUI.pick||{};
  let h=`<h2>${th?'ร้านย้อมและตู้เสื้อผ้า':'Dye & Wardrobe'}</h2><div class="say">${th?'"ชุดของเจ้าดีแล้ว แต่ข้าทำให้มันเป็นของเจ้าได้มากกว่านี้ ทุกอย่างที่นี่เพื่อความสวยงามเท่านั้น"':'"Your outfit is fine. I can make it yours. Everything here is for looks only."'}</div>`;
  h+=`<div class="wardtop"><canvas id="wardCv" width="144" height="160" aria-hidden="true"></canvas><div class="grow"><div class="sub">${fmt(P.gold)} gold</div><div class="tabs itabs" role="tablist">`+
    [['dye',th?'ย้อมสี':'Dye'],['hat',th?'หมวกแฟชั่น':'Costume hat'],['cape',th?'ผ้าคลุมแฟชั่น':'Costume cape']].map(([k,l])=>`<button class="btn small ${WARDUI.tab===k?'on':''}" data-act="wardtab" data-arg="${k}">${l}</button>`).join('')+`</div></div></div>`;
  if(WARDUI.tab==='dye'){const cur=pk.dye!==undefined?pk.dye:w.dye;
    h+=`<div class="ds">${th?'ย้อมส่วนที่มีสีของชุดอาชีพ (โลหะ สีขาว สีดำ คงเดิม หิมะและเงาเปลี่ยนทั้งชุด)':'Recolours the coloured parts of your job outfit (metal, white and black stay; Snow and Shadow change everything).'}</div><div class="wsws">`+wardSw('',!cur,'wardpick')+WARD_DYES.map(d=>wardSw(d[0],cur===d[0],'wardpick')).join('')+`</div>`;
    const c=WARD_COST.dye(P.lv),chg=cur!==w.dye;h+=`<div class="row"><div class="grow">${chg?`<div class="cms">${goldChip(c)}</div>`:`<div class="ds">${th?'นี่คือสีที่ใส่อยู่':'This is what you wear now.'}</div>`}</div><button class="btn" data-act="wardbuy" data-arg="dye" ${chg&&P.gold>=c?'':'disabled'}>${th?'ย้อม':'Dye it'}</button></div>`;}
  else if(WARDUI.tab==='cape'){const cur=pk.cape!==undefined?pk.cape:w.cape,owned=!!w.capeOwned,c=owned?WARD_COST.capeDye(P.lv):WARD_COST.cape;
    h+=`<div class="ds">${th?'ผ้าคลุมด้านหลัง (เพื่อความสวยงาม) เลือกสีได้':'A cape behind your hero, for looks; pick its colour.'}${owned?'':(th?' ซื้อครั้งแรกครั้งเดียว':' Bought once, then recoloured for less.')}</div><div class="wsws">`+wardSw('',!cur,'wardcape')+WARD_DYES.map(d=>wardSw(d[0],cur===d[0],'wardcape')).join('')+`</div>`;
    const chg=cur!==w.cape;h+=`<div class="row"><div class="grow">${chg&&cur?`<div class="cms">${goldChip(c)}</div>`:`<div class="ds">${chg?(th?'ถอดผ้าคลุม (ฟรี)':'Take the cape off (free).'):(th?'นี่คือที่ใส่อยู่':'This is what you wear now.')}</div>`}</div><button class="btn" data-act="wardbuy" data-arg="cape" ${chg&&(!cur||P.gold>=c)?'':'disabled'}>${cur?(th?'ใส่':'Wear it'):(th?'ถอด':'Take off')}</button></div>`;}
  else{const cur=pk.hat!==undefined?pk.hat:w.hat;h+=`<div class="ds">${th?'ปลดล็อกทรงหมวกครั้งเดียว แล้วใส่ทับหมวกจริงได้ (ค่าสถานะยังคงอยู่)':'Unlock a hat look once, then wear it over your real head gear (its stats still count).'}</div>`;
    h+=`<div class="row"><div class="grow"><div class="nm">${th?'ไม่ใส่หมวกแฟชั่น':'No costume hat'}</div></div><button class="btn small${!cur?' on':''}" data-act="wardhat" data-arg="">${th?'เลือก':'Pick'}</button></div>`;
    for(const id of wardHats()){const own=w.hats.includes(id),c=WARD_COST.hat(id);
      h+=`<div class="row">${icon({id})}<div class="grow"><div class="nm">${esc(ITEMS[id].name)}</div><div class="ds">${own?(th?'ปลดล็อกแล้ว':'Unlocked'):`<span class="cms">${goldChip(c)}</span>`}</div></div><button class="btn small${cur===id?' on':''}" data-act="wardhat" data-arg="${id}">${th?'ลอง':'Try'}</button></div>`;}
    const chg=cur!==w.hat,own=!cur||w.hats.includes(cur),c=cur?WARD_COST.hat(cur):0;
    h+=`<div class="row wardfoot"><div class="grow">${chg&&!own?`<div class="cms">${goldChip(c)}</div>`:''}</div><button class="btn" data-act="wardbuy" data-arg="hat" ${chg&&(own||P.gold>=c)?'':'disabled'}>${!own?(th?'ปลดล็อกและใส่':'Unlock and wear'):(th?'ใส่':'Wear it')}</button></div>`;}
  return h;};
PANEL_ACTS.wardtab=k=>{WARDUI.tab=k;WARDUI.pick=null;refreshPanel();};
PANEL_ACTS.wardpick=k=>{WARDUI.pick={...(WARDUI.pick||{}),dye:k};refreshPanel();};
PANEL_ACTS.wardcape=k=>{WARDUI.pick={...(WARDUI.pick||{}),cape:k};refreshPanel();};
PANEL_ACTS.wardhat=k=>{WARDUI.pick={...(WARDUI.pick||{}),hat:k};refreshPanel();};
PANEL_ACTS.wardbuy=what=>{const w=wardMine(),pk=WARDUI.pick||{},th=wardTh();let cost=0;
  if(what==='dye'){if(pk.dye===undefined||pk.dye===w.dye)return;cost=WARD_COST.dye(P.lv);if(P.gold<cost)return;w.dye=pk.dye;}
  else if(what==='cape'){if(pk.cape===undefined||pk.cape===w.cape)return;if(pk.cape){cost=w.capeOwned?WARD_COST.capeDye(P.lv):WARD_COST.cape;if(P.gold<cost)return;w.capeOwned=1;}w.cape=pk.cape;}
  else if(what==='hat'){if(pk.hat===undefined||pk.hat===w.hat)return;if(pk.hat&&!w.hats.includes(pk.hat)){cost=WARD_COST.hat(pk.hat);if(P.gold<cost)return;w.hats.push(pk.hat);}w.hat=pk.hat;}
  P.gold-=cost;WARDUI.pick=null;if(typeof sfx==='function')sfx(cost?'coin':'click');fx.push({k:'ring',x:P.x,y:P.y,r:34,col:'#e8a8ff',t0:now,dur:.6});
  addLog(th?`เซเลสทีนจัดการให้แล้ว${cost?` (−${fmt(cost)} gold)`:''}`:`Celestine works her craft. You look new.${cost?` (−${fmt(cost)} gold)`:''}`,'l-good');NET.lastSent='';if(typeof save==='function')save();refreshPanel();};
{const st=document.createElement('style');st.textContent=`
.wardtop{display:flex;gap:12px;align-items:center;margin:6px 0}#wardCv{width:144px;height:160px;border-radius:12px;background:radial-gradient(circle at 50% 40%,rgba(232,168,255,.18),rgba(0,0,0,.25));flex:none}
.wsws{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.wsw{display:flex;align-items:center;gap:6px}.wsw i{width:14px;height:14px;border-radius:50%;border:1px solid rgba(255,255,255,.5);display:inline-block}
.wsw i[style*="transparent"]{background:repeating-linear-gradient(45deg,#888 0 2px,transparent 2px 5px)!important}`;document.head.appendChild(st);}
if(typeof TH!=='undefined')Object.assign(TH,{'Dye & Wardrobe':'ร้านย้อมและตู้เสื้อผ้า','Dyer Celestine':'ช่างย้อมเซเลสทีน'});
