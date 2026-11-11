"use strict";
/* ================= #52 more emotes and an emote bar =================
   Twelve more emotes, and a quick bar of your 8 favourites: E (or the Emotes button) pops it up, one tap to
   emote, "More…" opens the full list where ☆ picks the favourites (kept in P.emofav). */
EMOTES.push(['hi','Hello'],['ok','Thumbs up'],['no','No'],['lol','LOL'],['cool','Cool'],['idea','Idea!'],['sos','Help!'],['fire','On fire'],['flower','Flower'],['party','Party'],['coin','Gold'],['sry','Sorry']);
EMOTE_KEYS.length=0;EMOTE_KEYS.push(...EMOTES.map(e=>e[0]));
const EMO_DEFAULT=['hi','heart','gg','thx','ok','lol','wow','sry'];
const emoFav=()=>{const f=Array.isArray(P&&P.emofav)?P.emofav.filter(k=>EMOTE_KEYS.includes(k)).slice(0,8):null;return f&&f.length?f:EMO_DEFAULT.slice();};

// pictures for the new ones
const _drawEmoteIconBar=drawEmoteIcon;
drawEmoteIcon=function(g,k,x,y,s){
  const NEW=['hi','ok','no','lol','cool','idea','sos','fire','flower','party','coin','sry'];if(!NEW.includes(k))return _drawEmoteIconBar(g,k,x,y,s);
  g.save();g.translate(x,y);g.scale(s/20,s/20);g.lineCap='round';g.lineJoin='round';
  const txt=(t,c,sz)=>{g.font=`800 ${sz}px "Alegreya Sans",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=c;g.fillText(t,0,1);};
  const face=()=>{g.fillStyle='#ffd24a';g.beginPath();g.arc(0,0,10,0,7);g.fill();};
  switch(k){
    case 'hi':{g.fillStyle='#f6d6b8';g.strokeStyle='#5a3a10';g.lineWidth=1.4;g.rotate(Math.sin(now*10)*.25);
      g.beginPath();g.roundRect(-6,-2,12,11,4);g.fill();g.stroke();for(let i=0;i<4;i++){g.beginPath();g.roundRect(-6+i*3.2,-10,2.8,10,1.4);g.fill();g.stroke();}
      g.beginPath();g.roundRect(5,0,3,7,1.5);g.fill();g.stroke();break;}
    case 'ok':{g.fillStyle='#f6d6b8';g.strokeStyle='#5a3a10';g.lineWidth=1.4;g.beginPath();g.roundRect(-7,-1,11,10,3);g.fill();g.stroke();
      g.beginPath();g.roundRect(-4,-11,5,12,2.5);g.fill();g.stroke();g.fillStyle='#3f8a4c';g.fillRect(4,-1,4,10);break;}
    case 'no':{g.strokeStyle='#d9483f';g.lineWidth=4;g.beginPath();g.moveTo(-7,-7);g.lineTo(7,7);g.moveTo(7,-7);g.lineTo(-7,7);g.stroke();break;}
    case 'lol':txt('LOL','#e0802a',13);break;
    case 'cool':{face();g.fillStyle='#1f2430';g.beginPath();g.roundRect(-9,-4,8,5,2);g.roundRect(1,-4,8,5,2);g.fill();g.fillRect(-1,-3,2,1.5);
      g.strokeStyle='#5a3a10';g.lineWidth=1.8;g.beginPath();g.arc(1,3,4,.2,Math.PI*.8);g.stroke();break;}
    case 'idea':{g.fillStyle='#ffe066';g.shadowColor='#ffe066';g.shadowBlur=6;g.beginPath();g.arc(0,-3,7,0,7);g.fill();g.shadowBlur=0;
      g.fillStyle='#9aa0aa';g.fillRect(-3.5,4,7,5);g.strokeStyle='#6a707a';g.lineWidth=1;g.beginPath();g.moveTo(-3.5,6);g.lineTo(3.5,6);g.stroke();break;}
    case 'sos':txt('SOS','#d9483f',13);break;
    case 'fire':{g.fillStyle='#ff7a2a';g.beginPath();g.moveTo(0,10);g.quadraticCurveTo(-10,4,-4,-6);g.quadraticCurveTo(-3,0,0,-2);g.quadraticCurveTo(-1,-8,3,-11);g.quadraticCurveTo(10,0,0,10);g.fill();
      g.fillStyle='#ffd24a';g.beginPath();g.moveTo(0,9);g.quadraticCurveTo(-5,4,-1,-1);g.quadraticCurveTo(5,3,0,9);g.fill();break;}
    case 'flower':{g.fillStyle='#f07ca0';for(let i=0;i<5;i++){const a=i*Math.PI*2/5;g.beginPath();g.arc(Math.cos(a)*5.5,Math.sin(a)*5.5,4.5,0,7);g.fill();}g.fillStyle='#ffd24a';g.beginPath();g.arc(0,0,3.5,0,7);g.fill();break;}
    case 'party':{g.fillStyle='#8a5ad0';g.beginPath();g.moveTo(-9,9);g.lineTo(-2,-6);g.lineTo(6,2);g.closePath();g.fill();
      const cols=['#e8435a','#ffcf3a','#5ab0f0','#3f8a4c'];for(let i=0;i<7;i++){g.fillStyle=cols[i%4];const a=-1.4+i*.35,r=8+(i%2)*3;g.fillRect(3+Math.cos(a)*r,-4+Math.sin(a)*r,2.4,2.4);}break;}
    case 'coin':{g.fillStyle='#f0c040';g.strokeStyle='#a8781a';g.lineWidth=1.6;g.beginPath();g.arc(0,0,9,0,7);g.fill();g.stroke();txt('G','#a8781a',12);break;}
    case 'sry':txt('SRY','#7a5ab0',12);break;
  }
  g.restore();};

/* ---- the bar ---- */
function emoteBar(show){let el=document.getElementById('emoteBar');
  if(!el){el=document.createElement('div');el.id='emoteBar';el.className='frame';el.setAttribute('role','toolbar');el.setAttribute('aria-label','Emotes');el.hidden=true;document.body.appendChild(el);
    el.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;sfx('click');
      if(b.dataset.more){emoteBar(false);openPanel('emote');return;}if(b.dataset.k){doEmote(b.dataset.k);emoteBar(false);}});}
  if(show===undefined)show=el.hidden;
  if(show){el.innerHTML=emoFav().map((k,i)=>{const l=(EMOTES.find(e=>e[0]===k)||[k,k])[1];return `<button type="button" data-k="${k}" title="${esc(l)}" aria-label="${esc(l)}"><img alt="" src="${emoteThumb(k)}"></button>`;}).join('')+
    `<button type="button" class="more" data-more="1" title="All emotes" aria-label="All emotes">More…</button>`;}
  el.hidden=!show;return show;}
// E and the Emotes button pop up the bar instead of the full window
const _togglePanelEmo=togglePanel;
togglePanel=function(kind){if(kind==='emote'&&panelKind!=='emote'){emoteBar();return;}return _togglePanelEmo(kind);};
document.addEventListener('pointerdown',ev=>{const el=document.getElementById('emoteBar');if(!el||el.hidden)return;
  if(el.contains(ev.target)||ev.target.closest('[data-open="emote"],#emoteBtn'))return;emoteBar(false);},true);
window.addEventListener('keydown',ev=>{if(ev.key==='Escape'){const el=document.getElementById('emoteBar');if(el&&!el.hidden)emoteBar(false);}});

/* ---- favourites in the full list ---- */
const _emotePanelPatch=()=>{if(panelKind!=='emote')return;const fav=emoFav();
  panel.querySelectorAll('.emb').forEach(b=>{if(b.querySelector('.fav'))return;const k=b.dataset.arg,s=document.createElement('span');s.className='fav'+(fav.includes(k)?' on':'');
    s.setAttribute('role','button');s.tabIndex=0;s.dataset.k=k;s.title=fav.includes(k)?'On your emote bar (tap to remove)':'Add to your emote bar';s.setAttribute('aria-label',s.title);s.textContent=fav.includes(k)?'★':'☆';b.appendChild(s);});
  if(!panel.querySelector('.emhint')){const d=document.createElement('div');d.className='sub emhint';d.textContent=`☆ puts an emote on your quick bar (E). ${fav.length}/8 chosen.`;panel.querySelector('.emgrid').before(d);}};
const _refreshPanelEmo=refreshPanel;
refreshPanel=function(){const r=_refreshPanelEmo.apply(this,arguments);_emotePanelPatch();return r;};
panel.addEventListener('click',ev=>{const s=ev.target.closest('.fav');if(!s)return;ev.stopPropagation();ev.preventDefault();
  const k=s.dataset.k;let f=emoFav();if(f.includes(k))f=f.filter(x=>x!==k);else{if(f.length>=8){addLog('Your emote bar is full (8). Remove one first.','l-bad');return;}f.push(k);}
  P.emofav=f;save();refreshPanel();},true);
