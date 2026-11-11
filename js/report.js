"use strict";
/* ================= Stage 7: reports and admin tools =================
   Any player can report another (Report on the online list, or /report Name). The server keeps the reported
   player's last few lines as evidence. Admins (accounts the server lists in EMBERVALE_ADMINS) get an Admin
   button that shows open reports and everyone online, with mute, kick and ban. */
const MOD={sock:null,admin:false,reports:[],done:[],players:[],tab:'reports',loaded:false,arm:null,newCount:0,muted:0};
const REPORT_REASONS=[['abuse','Rude or abusive'],['spam','Spam'],['cheating','Cheating or bots'],['name','Bad name'],['other','Something else']];
const rpt={peer:null,name:'',reason:'abuse'};

function modAttach(sock){MOD.sock=sock;
  sock.on('modHello',m=>{if(!m||!m.admin)return;MOD.admin=true;adminButton();});
  sock.on('modReport',m=>{if(!MOD.admin||!m)return;MOD.newCount++;adminButton();
    addLog(`New report about ${clean(m.target,16)} (${clean(m.reason,12)}). Open Admin to review it.`,'l-rare');sfx('ping');
    if(panelKind==='admin')sock.emit('modList');});
  sock.on('modList',m=>{if(!m)return;MOD.loaded=true;MOD.reports=Array.isArray(m.reports)?m.reports.slice(0,50):[];MOD.done=Array.isArray(m.done)?m.done.slice(0,10):[];
    MOD.players=Array.isArray(m.players)?m.players.slice(0,200):[];if(panelKind==='admin')refreshPanel();});
  sock.on('modDone',()=>{if(panelKind==='admin')sock.emit('modList');});
  sock.on('modMuted',m=>{const mins=Math.max(0,Math.floor(fin(m&&m.minutes)));MOD.muted=mins?Date.now()+mins*60000:0;
    if(mins)addLog(`An admin muted you for ${mins} minute${mins===1?'':'s'}. Others can't see your chat until then.`,'l-bad');else addLog('You can chat again.','l-good');});
  sock.on('modKicked',m=>{NET.kicked=true;modNotice(m&&m.banned?'Account banned':'Removed from the game',clean(m&&m.reason,100)||'Removed by an admin.');});
  // an admin action changes the lists: fetch them again
  sock.on('socialInfo',()=>{if(MOD.admin&&panelKind==='admin')setTimeout(()=>sock.emit('modList'),150);});
}
// a full-screen notice when kicked or banned (no automatic reconnect)
function modNotice(title,text){let el=document.getElementById('modNotice');
  if(!el){el=document.createElement('div');el.id='modNotice';el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);}
  el.innerHTML=`<div class="card frame"><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="tbtns" style="justify-content:center"><button class="btn" id="modReload">Reload</button></div></div>`;
  el.hidden=false;el.querySelector('#modReload').addEventListener('click',()=>location.reload());}

/* ---- reporting ---- */
function reportOpen(peer,name){if(!SOCK||!SOCK.connected){addLog('Reports need the game server, which is not reachable right now.','l-bad');return;}
  rpt.peer=peer;rpt.name=name;rpt.reason='abuse';openPanel('report');setTimeout(()=>{const n=document.getElementById('rptNote');if(n)n.focus();},30);}
PANELS.report=()=>`<h2>Report ${esc(rpt.name)}</h2><div class="sub">The admins will see your report and ${esc(rpt.name)}'s last few chat lines. ${esc(rpt.name)} is not told who reported them.</div>`+
  `<h3>What happened?</h3><div class="rptreasons" role="radiogroup">`+REPORT_REASONS.map(([k,l])=>`<button class="btn small${rpt.reason===k?' on':''}" role="radio" aria-checked="${rpt.reason===k}" data-act="rptreason" data-arg="${k}">${l}</button>`).join('')+`</div>`+
  `<h3>Anything to add? <span class="muted">(optional)</span></h3><div class="grow2"><input id="rptNote" maxlength="200" autocomplete="off" placeholder="e.g. keeps insulting people in the meadow" aria-label="Note for the admins"></div>`+
  `<div class="tbtns"><button class="btn small" data-act="close">Cancel</button><button class="btn" data-act="rptsend">Send report</button></div>`;
PANEL_ACTS.rptreason=k=>{const n=document.getElementById('rptNote'),v=n?n.value:'';rpt.reason=k;refreshPanel();const m=document.getElementById('rptNote');if(m)m.value=v;};
PANEL_ACTS.rptsend=()=>{const n=document.getElementById('rptNote');if(soc('report',{peer:rpt.peer,reason:rpt.reason,note:n?n.value:''}))closePanel();};
const _chatCmdRpt=chatCommand;
chatCommand=function(k,arg){
  if(k==='report'){const name=clean(arg,16);if(!name){addLog('Usage: /report Name');return true;}const peer=findPeerByName(name);
    if(!peer){addLog(`${name} is not in your channel.`,'l-bad');return true;}reportOpen(peer,NET.others.get(peer).n);return true;}
  if(k==='admin'&&MOD.admin){openPanel('admin');return true;}
  return _chatCmdRpt(k,arg);};
// a local warning while an admin mute lasts (the server drops the chat anyway)
const _sendChatRpt=sendChat;
sendChat=function(raw){const t=clean(raw,120);
  if(t&&t[0]!=='/'&&MOD.muted>Date.now()){const m=Math.ceil((MOD.muted-Date.now())/60000);addLog(`You are muted for ${m} more minute${m===1?'':'s'}.`,'l-bad');return;}
  _sendChatRpt(raw);};

/* ---- admin window ---- */
function adminButton(){let b=document.getElementById('adminBtn');
  if(!b){b=document.createElement('button');b.id='adminBtn';b.className='dk';b.type='button';b.title='Admin: reports and players';b.innerHTML='<i>⚑</i><span>Admin</span><em class="badge" hidden></em>';
    b.addEventListener('click',()=>{sfx('click');togglePanel('admin');});const dock=document.querySelector('#dock .dk[data-open="settings"]');if(dock)dock.parentElement.insertBefore(b,dock);else $('#dockExtra').appendChild(b);}
  const badge=b.querySelector('.badge');badge.hidden=!MOD.newCount;badge.textContent=MOD.newCount;}
const ago=t=>{const s=Math.max(0,(Date.now()-new Date(t).getTime())/1000);return s<60?'just now':s<3600?Math.floor(s/60)+' min ago':s<86400?Math.floor(s/3600)+' h ago':Math.floor(s/86400)+' d ago';};
const livePeer=(name,account)=>{for(const p of MOD.players)if((account&&p.account===account)||(!account&&p.name.toLowerCase()===String(name).toLowerCase()))return p;return null;};
const modBtn=(act,arg,label,cls)=>`<button class="btn small${cls?' '+cls:''}" data-act="${act}" data-arg="${esc(arg)}">${label}</button>`;
function modTarget(t){return JSON.stringify(t);}
function modActions(t,live,rid){ // t: {peer?, account?}
  const k=modTarget(t),armed=MOD.arm===k;let h='';
  if(live||t.account){h+=live&&live.muted?modBtn('modmute',JSON.stringify({...t,m:0,r:rid}),'Unmute'):modBtn('modmute',JSON.stringify({...t,m:60,r:rid}),'Mute 1 h')+modBtn('modmute',JSON.stringify({...t,m:1440,r:rid}),'Mute 24 h');}
  if(live)h+=modBtn('modkick',JSON.stringify({...t,r:rid}),'Kick');
  if(t.account)h+=armed?modBtn('modban',JSON.stringify({...t,r:rid}),'Confirm ban 7 days','bad'):modBtn('modarm',k,'Ban 7 days');
  return h;}
PANELS.admin=()=>{MOD.newCount=0;adminButton();
  let h=`<h2>Admin</h2><div class="sub">Reports from players, and everyone online. Mutes and bans on accounts last across reconnects; a guest can only be muted until they reconnect, or kicked.</div>`;
  h+=`<div class="tabs" role="tablist">`+[['reports',`Reports <span class="muted">${MOD.reports.length}</span>`],['players',`Online <span class="muted">${MOD.players.length}</span>`],['done','Closed']].map(([k,l])=>`<button class="btn small ${MOD.tab===k?'on':''}" role="tab" aria-selected="${MOD.tab===k}" data-act="modtab" data-arg="${k}">${l}</button>`).join('')+modBtn('modrefresh','','↻ Refresh')+`</div>`;
  if(!MOD.loaded)return h+`<div class="sub">Loading…</div>`;
  const reasonName=r=>(REPORT_REASONS.find(x=>x[0]===r)||[0,r])[1];
  const card=(r,open)=>{const live=livePeer(r.target,r.targetAccount),t=live?{peer:live.peer,account:r.targetAccount||undefined}:{account:r.targetAccount||undefined};
    return `<div class="modcard"><div class="mhead"><b>${esc(r.target)}</b> <span class="muted">${r.targetAccount?'account '+esc(r.targetAccount):'guest'} · ${live?'online':'offline'}</span><span class="pill">${esc(reasonName(r.reason))}</span><span class="muted mt">${ago(r.at)}</span></div>`+
      `<div class="ds">Reported by ${esc(r.reporter)}${r.reporterAccount?'':' (guest)'}${r.zone?' in '+esc(ZONES[r.zone]?.name||r.zone):''}</div>`+
      (r.note?`<div class="mnote">“${esc(r.note)}”</div>`:'')+
      (r.chat&&r.chat.length?`<div class="mchat">`+r.chat.slice(-12).map(l=>`<div><span class="muted">${esc(l.kind)}</span> ${esc(l.text)}</div>`).join('')+`</div>`:`<div class="ds muted">No chat lines recorded.</div>`)+
      (open?`<div class="tbtns">${modActions(t,live,r.id)}${modBtn('modclose',r.id,'Close report')}</div>`:`<div class="ds">Closed by ${esc(r.handledBy||'?')}: ${esc(r.action||'closed')}</div>`)+`</div>`;};
  if(MOD.tab==='reports')h+=MOD.reports.length?MOD.reports.map(r=>card(r,true)).join(''):`<div class="sub">No open reports. 🎉</div>`;
  else if(MOD.tab==='done')h+=MOD.done.length?MOD.done.map(r=>card(r,false)).join(''):`<div class="sub">Nothing closed yet.</div>`;
  else h+=`<div class="setlist">`+MOD.players.map(p=>`<div class="setrow"><div class="grow"><div class="nm">${esc(p.name)}${p.admin?' <span class="pill">admin</span>':''}${p.muted?` <span class="pill bad">muted ${p.muted} min</span>`:''}</div><div class="ds">${p.account?'account '+esc(p.account):'guest'} · Lv ${p.lv} · ${esc(ZONES[p.zone]?.name||p.zone||'?')} · ${esc(p.channel)}</div></div>`+
    (p.admin?'':`<div class="tbtns" style="margin:0">${modActions({peer:p.peer,account:p.account||undefined},p)}</div>`)+`</div>`).join('')+`</div>`;
  return h;};
const modSend=(ev,data)=>{if(MOD.sock&&MOD.sock.connected)MOD.sock.emit(ev,data);else addLog('The game server is not reachable right now.','l-bad');};
const modArg=a=>{try{return JSON.parse(a);}catch(e){return {};}};
PANEL_ACTS.modtab=k=>{MOD.tab=k;MOD.arm=null;refreshPanel();};
PANEL_ACTS.modrefresh=()=>modSend('modList');
PANEL_ACTS.modarm=k=>{MOD.arm=k;refreshPanel();};
const closeAfter=(r,action)=>{if(r)modSend('modClose',{id:r,action});};
PANEL_ACTS.modmute=a=>{const t=modArg(a);modSend('modMute',{peer:t.peer,account:t.account,minutes:t.m});if(t.m)closeAfter(t.r,`muted ${t.m>=1440?t.m/1440+' day':t.m/60+' h'}`);};
PANEL_ACTS.modkick=a=>{const t=modArg(a);modSend('modKick',{peer:t.peer,account:t.account});closeAfter(t.r,'kicked');};
PANEL_ACTS.modban=a=>{const t=modArg(a);MOD.arm=null;modSend('modBan',{peer:t.peer,account:t.account,days:7});closeAfter(t.r,'banned 7 days');};
PANEL_ACTS.modclose=id=>modSend('modClose',{id,action:'no action'});
const _openAdmin=openPanel;
openPanel=function(kind,arg){if(kind==='admin'){if(!MOD.admin)return;MOD.arm=null;modSend('modList');}return _openAdmin(kind,arg);};
PANEL_CLOSE.admin=()=>{MOD.arm=null;};
