"use strict";
/* ================= #66 screenshots =================
   P (remappable in Settings) saves a clean picture of the game world: the canvas only, so names, emotes and
   effects are in it but windows and buttons are not, with a small Embervale mark in the corner. On phones the
   ☰ menu has a Photo button, which offers the share sheet where the phone supports sharing pictures. */
if(typeof KEY_ACTIONS!=='undefined'&&!KEY_ACTIONS.some(a=>a[0]==='shot')){KEY_ACTIONS.splice(KEY_ACTIONS.findIndex(a=>a[0]==='fold')+1,0,['shot','p','Screenshot']);if(typeof rebuildKeys==='function')rebuildKeys();}
const shotName=()=>{const d=new Date(),z=n=>String(n).padStart(2,'0');return `embervale-${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}.png`;};
function shotCanvas(){const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const g=c.getContext('2d');g.drawImage(cv,0,0);
  // the mark: a small diamond and the game's name, bottom right
  const s=Math.max(1,cv.width/1200),pad=14*s,txt='Embervale';g.font=`700 ${Math.round(15*s)}px Inter, sans-serif`;const w=g.measureText(txt).width;
  const x=c.width-pad-w,y=c.height-pad;g.fillStyle='rgba(10,12,18,.55)';g.beginPath();g.roundRect(x-26*s,y-20*s,w+36*s,28*s,8*s);g.fill();
  g.save();g.translate(x-13*s,y-6*s);g.rotate(Math.PI/4);const gr=g.createLinearGradient(-6*s,-6*s,6*s,6*s);gr.addColorStop(0,'#f0b54a');gr.addColorStop(1,'#ff7a45');g.fillStyle=gr;g.fillRect(-5*s,-5*s,10*s,10*s);g.restore();
  g.fillStyle='#fff';g.textBaseline='middle';g.fillText(txt,x,y-6*s);return c;}
let shotBusy=false;
async function takeShot(){if(!running||!P||shotBusy)return;shotBusy=true;
  try{const c=shotCanvas(),name=shotName();
    // a quick camera flash
    const f=document.createElement('div');f.className='shotflash';document.body.appendChild(f);setTimeout(()=>f.remove(),450);sfx('click');
    const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob){addLog('The screenshot could not be made.','l-bad');return;}
    const file=typeof File==='function'?new File([blob],name,{type:'image/png'}):null;
    if(document.body.classList.contains('touchui')&&file&&navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file],title:'Embervale'});addLog('Screenshot shared.','l-good');return;}catch(e){if(e&&e.name==='AbortError')return;}}
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},3000);
    addLog(`Screenshot saved as ${name}.`,'l-good');
  }finally{shotBusy=false;}}
window.addEventListener('keydown',ev=>{if(!running||ev.target.tagName==='INPUT'||ev.target.tagName==='TEXTAREA'||ev.ctrlKey||ev.metaKey||ev.altKey)return;if(ev.key.toLowerCase()==='p'){ev.preventDefault();takeShot();}});
// the phone menu's Photo button
(()=>{const m=document.getElementById('menu');if(!m||document.getElementById('mShot'))return;const b=document.createElement('button');b.className='dk only-touch';b.id='mShot';b.type='button';b.title='Take a screenshot (P)';
  b.innerHTML='<i>📷</i><span>Photo</span>';b.addEventListener('click',()=>{$('#dock').classList.remove('open');setTimeout(takeShot,250);});m.appendChild(b);})();
const _chatCommandShot=chatCommand;
chatCommand=function(k,arg){if(k==='screenshot'||k==='shot'||k==='photo'){takeShot();return true;}return _chatCommandShot(k,arg);};
CMD_HELP.push(['/shot, or P','save a screenshot']);
