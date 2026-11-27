"use strict";
/* ================= Leaderboards and seasons (v1.83.0) =================
   ☰ → Ranks shows the top 50 of every player in four lists, read from the game server (routes/embervale/leaderboard.js):
     Level     highest level (a reborn hero first), all time
     Monsters  monsters defeated this season
     Bosses    bosses and mini-bosses defeated this season
     Richest   gold carried
   A season is a calendar month, Thailand time. Each hero counts its own season (P.ls = {s:'2026-11', k, b}); when a
   month ends the count moves to P.lsPrev, which the server reads for last season's Hall of Fame (top 3 in monsters and
   bosses). A hero in that Hall of Fame claims a gold prize once (1st 50,000 · 2nd 30,000 · 3rd 20,000 for each list).
   Characters are ranked when they are saved to an account; guests can look but are not ranked. */
const RANK={cat:'level',data:null,at:0,busy:false,err:''};
const RANK_PRIZE=[50000,30000,20000];
const rkTh=()=>typeof LANG!=='undefined'&&LANG==='th';
const rkSeason=ms=>new Date(ms+7*3600e3).toISOString().slice(0,7);
if(typeof SAVE_EXTRA!=='undefined')SAVE_EXTRA.push('ls','lsPrev','lsClaim');
// ---- counting this season ----
function rkMine(){if(!P)return null;const s=rkSeason(Date.now());if(!P.ls||typeof P.ls!=='object'||P.ls.s!==s){if(P.ls&&P.ls.s&&P.ls.s<s)P.lsPrev={...P.ls};P.ls={s,k:0,b:0};}return P.ls;}
{const _kmRK=killMob;killMob=function(m){const mine=m&&!m.dead&&(m.myDmg||0)>0,boss=!!(m&&m.d&&(m.d.boss||m.d.world));const r=_kmRK.apply(this,arguments);
  try{if(mine&&P){const l=rkMine();if(boss)l.b++;else l.k++;}}catch(e){}return r;};}
// ---- reading the board ----
async function rkLoad(force){if(RANK.busy)return;if(!force&&RANK.data&&Date.now()-RANK.at<60000)return;RANK.busy=true;RANK.err='';
  try{rkMine();const slot=typeof CS!=='undefined'?CS.slot|0:0;RANK.data=await api('GET','/leaderboard?slot='+slot);RANK.at=Date.now();}
  catch(e){RANK.err=rkTh()?'อ่านอันดับไม่ได้ ต้องเชื่อมต่อเซิร์ฟเวอร์เกม':'The leaderboard needs the game server, which is not reachable right now.';}
  finally{RANK.busy=false;if(typeof panelKind!=='undefined'&&panelKind==='ranks')refreshPanel();}}
const rkCats=()=>[['level','⭐',rkTh()?'เลเวล':'Level'],['kills','⚔',rkTh()?'มอนสเตอร์':'Monsters'],['bosses','☠',rkTh()?'บอส':'Bosses'],['gold','💰',rkTh()?'ร่ำรวย':'Richest']];
const rkVal=(k,v)=>k==='level'?`Lv ${v}`:k==='gold'?`${fmt(v)} gold`:fmt(v);
const rkMonth=s=>{if(!s)return '';const [y,m]=s.split('-').map(Number);const en=['January','February','March','April','May','June','July','August','September','October','November','December'],th=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];return rkTh()?`${th[m-1]} ${y}`:`${en[m-1]} ${y}`;};
const rkMedal=r=>r===1?'🥇':r===2?'🥈':r===3?'🥉':`<b>${r}</b>`;
function rkPrize(){const d=RANK.data;if(!d||!d.hall||!P)return 0;if(P.lsClaim===d.prev)return 0;let g=0;
  for(const k of ['kills','bosses'])for(const r of d.hall[k]||[])if(r.me)g+=RANK_PRIZE[r.rank-1]||0;return g;}
PANELS.ranks=()=>{const th=rkTh(),d=RANK.data,k=RANK.cat;if(!d&&!RANK.busy&&!RANK.err)rkLoad();
  let h=`<h2>${th?'อันดับ':'Ranks'}</h2><div class="sub">${d?(th?`ฤดูกาล ${rkMonth(d.season)} · อันดับจากตัวละครที่บันทึกในบัญชี`:`Season: ${rkMonth(d.season)} · ranked from characters saved to an account`):(th?'กำลังโหลด...':'Loading...')}</div>`;
  if(typeof ACC!=='undefined'&&!ACC.token)h+=`<div class="rknote">${th?'เข้าสู่ระบบเพื่อให้ตัวละครของคุณติดอันดับ':'Log in to an account to be ranked: guests can look but are not counted.'}</div>`;
  h+=`<div class="rktabs" role="tablist">`+rkCats().map(([c,i,l])=>`<button class="rktab${k===c?' on':''}" data-act="rkcat" data-arg="${c}" role="tab" aria-selected="${k===c}"><i>${i}</i><span>${l}</span></button>`).join('')+`</div>`;
  if(RANK.err)return h+`<p class="muted">${esc(RANK.err)}</p><button class="btn small" data-act="rkreload">${th?'ลองอีกครั้ง':'Try again'}</button>`;
  if(!d)return h+`<p class="muted">${th?'กำลังโหลดอันดับ...':'Loading the leaderboard...'}</p>`;
  // the prize
  const prize=rkPrize();if(prize)h+=`<div class="rkprize"><b>🏆</b><div class="grow">${th?`คุณติดหอเกียรติยศเดือน${rkMonth(d.prev)}! รับรางวัล ${fmt(prize)} gold`:`You made the Hall of Fame for ${rkMonth(d.prev)}! Your prize: ${fmt(prize)} gold.`}</div><button class="btn" data-act="rkclaim">${th?'รับ':'Claim'}</button></div>`;
  // your place
  const me=d.me&&d.me[k];h+=`<div class="rkme">${me?(th?`อันดับของคุณ: <b>${me.rank}</b> จาก ${fmt(me.of)} · ${rkVal(k,me.v)}`:`Your place: <b>${me.rank}</b> of ${fmt(me.of)} · ${rkVal(k,me.v)}`):(th?'คุณยังไม่ติดอันดับในรายการนี้':'You are not on this list yet.')}${k==='kills'||k==='bosses'?(th?` · เดือนนี้คุณ: ${fmt((rkMine()||{})[k==='kills'?'k':'b']||0)}`:` · you this season: ${fmt((rkMine()||{})[k==='kills'?'k':'b']||0)}`):''}</div>`;
  const list=d.lists[k]||[];if(!list.length)h+=`<p class="muted">${th?'ยังไม่มีใครในรายการนี้เดือนนี้':'Nobody on this list yet this season.'}</p>`;
  h+=`<div class="rklist">`+list.map(r=>`<div class="rkrow${r.me?' me':''}${r.rank<=3?' top':''}"><span class="rkn">${rkMedal(r.rank)}</span><div class="grow"><div class="nm">${esc(r.name)}${r.me?` <span class="rkyou">${th?'คุณ':'you'}</span>`:''}</div><div class="ds">${esc(CLASSES[r.cls]?CLASSES[r.cls].name:r.cls)} · Lv ${r.lv}${r.reborn?(th?' · เกิดใหม่':' · reborn'):''}</div></div><b class="rkv">${rkVal(k,r.v)}</b></div>`).join('')+`</div>`;
  // Hall of Fame
  h+=`<h3>${th?`หอเกียรติยศ · ${rkMonth(d.prev)}`:`Hall of Fame · ${rkMonth(d.prev)}`}</h3>`;
  for(const hk of ['kills','bosses']){const L=d.hall[hk]||[];h+=`<div class="ds">${hk==='kills'?(th?'⚔ มอนสเตอร์มากที่สุด':'⚔ Most monsters'):(th?'☠ บอสมากที่สุด':'☠ Most bosses')}</div>`+
    (L.length?L.map(r=>`<div class="rkrow hall${r.me?' me':''}"><span class="rkn">${rkMedal(r.rank)}</span><div class="grow"><div class="nm">${esc(r.name)}</div></div><b class="rkv">${fmt(r.v)}</b></div>`).join(''):`<div class="muted" style="margin:2px 0 8px">${th?'ยังไม่มี':'Nobody yet.'}</div>`);}
  h+=`<div class="ds" style="margin-top:8px">${th?'3 อันดับแรกของเดือนในรายการมอนสเตอร์และบอสได้รับทอง 50,000 / 30,000 / 20,000':'The top 3 of each month in Monsters and Bosses win 50,000 / 30,000 / 20,000 gold, claimed here the next month.'}</div><button class="btn small" data-act="rkreload">${th?'รีเฟรช':'Refresh'}</button>`;
  return h;};
PANEL_ACTS.rkcat=c=>{RANK.cat=c;refreshPanel();};
PANEL_ACTS.rkreload=()=>{RANK.data=null;rkLoad(true);refreshPanel();};
PANEL_ACTS.rkclaim=()=>{const g=rkPrize(),d=RANK.data;if(!g||!d)return;P.gold+=g;P.lsClaim=d.prev;if(typeof sfx==='function')sfx('fanfare');
  fx.push({k:'lvl',x:P.x,y:P.y-30,t0:now,dur:2,txt:'HALL OF FAME',col:'#ffcf5a'});addLog(rkTh()?`รางวัลหอเกียรติยศ: +${fmt(g)} gold`:`Hall of Fame prize: +${fmt(g)} gold!`,'l-rare');if(typeof save==='function')save(true);refreshPanel();};
// the menu button
{const menu=document.getElementById('menu');if(menu&&!document.getElementById('mRanks')){const b=document.createElement('button');b.className='dk';b.id='mRanks';b.title='Ranks: leaderboards and seasons';b.innerHTML='<i>🏆</i><span>Ranks</span>';
  b.addEventListener('click',()=>{sfx('click');togglePanel('ranks');});const t=document.getElementById('mToday');if(t)t.insertAdjacentElement('afterend',b);else menu.insertBefore(b,menu.firstChild);}}
{const st=document.createElement('style');st.textContent=`
.rktabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}.rktab{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:inherit;font:inherit;font-size:12px;cursor:pointer}
.rktab i{font-style:normal;font-size:18px}.rktab.on{border-color:#ffcf5a;background:rgba(255,207,90,.12)}
.rkme{padding:8px 10px;border-radius:10px;background:rgba(255,207,90,.08);border:1px solid rgba(255,207,90,.3);margin:6px 0;font-size:13px}
.rknote{padding:6px 10px;border-radius:10px;background:rgba(140,180,255,.08);margin:6px 0;font-size:12px}
.rklist{display:flex;flex-direction:column;gap:4px}.rkrow{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:10px;background:rgba(255,255,255,.03)}
.rkrow.top{background:rgba(255,207,90,.07)}.rkrow.me{outline:2px solid #8fd6ff;background:rgba(143,214,255,.1)}.rkn{width:30px;text-align:center;font-size:18px}.rkn b{font-size:13px;opacity:.8}
.rkv{white-space:nowrap;color:#ffd76a}.rkyou{font-size:10px;padding:1px 6px;border-radius:8px;background:#8fd6ff;color:#0e151f}
.rkprize{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:linear-gradient(90deg,rgba(255,207,90,.25),rgba(255,207,90,.08));border:1px solid #ffcf5a;margin:6px 0}.rkprize>b{font-size:24px}`;document.head.appendChild(st);}
if(typeof TH!=='undefined')Object.assign(TH,{'Ranks':'อันดับ','Ranks: leaderboards and seasons':'อันดับ: กระดานผู้นำและฤดูกาล'});
