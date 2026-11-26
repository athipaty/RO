"use strict";
/* ================= master regalia (v1.68.0) =================
   A master calling should look worth the long climb. Its outfit is its own (js/outfits_warden.js for the Warden family);
   on top of that every master gets a turning rune circle under the feet, and a few touches drawn around the body,
   never on or above the head (hats, masks and mouth gear stay clear): no wings, no capes.
     Aegis Lord   three small gold shields circling at the waist (the Bulwark carries one tower shield instead), gold motes
     Warbringer   embers drifting up beside the shoulder plates */
{const glowOn=(c,b)=>{ctx.shadowColor=c;ctx.shadowBlur=b;},glowOff=()=>{ctx.shadowBlur=0;};
  // the turning rune circle under a master's feet
  JBACK.sigil=function(x,y,by,f,o){const a=now*.5;ctx.save();ctx.translate(x,y+1);ctx.scale(1,.36);
    ctx.globalAlpha=.5;ctx.strokeStyle=o.c;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,0,21,0,7);ctx.stroke();
    ctx.globalAlpha=.85;ctx.fillStyle=o.t||o.c;for(let i=0;i<4;i++){const t=a+i*Math.PI/2;ctx.save();ctx.translate(Math.cos(t)*21,Math.sin(t)*21);ctx.rotate(t);ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(2,0);ctx.lineTo(0,3);ctx.lineTo(-2,0);ctx.closePath();ctx.fill();ctx.restore();}
    ctx.restore();};
  // sparks rising beside the body: from the shoulders up, fading before the head's height, always outside the face
  const motes=(x,by,c,n)=>{ctx.save();for(let i=0;i<n;i++){const q=(now*.45+i/n)%1,side=i%2?1:-1,px=x+side*(17.5+Math.sin(i*2.3+now*1.3)*2),py=by-4-q*20;
      ctx.globalAlpha=.9*(1-q);ctx.fillStyle=c;glowOn(c,4);ctx.fillRect(px-1,py-1,2.2,2.2);}glowOff();ctx.restore();};
  // three small gold shields circling at the waist: dimmed on the far side
  JSIDE.aegisorbit=function(x,y,by,f,o){for(let i=0;i<3;i++){const a=now*1.1+i*Math.PI*2/3,ox=x+Math.cos(a)*19,oy=by+1+Math.sin(a)*5,front=Math.sin(a)>0;
      ctx.save();ctx.globalAlpha=front?1:.45;ctx.translate(ox,oy);ctx.scale(.75+.25*Math.abs(Math.cos(a)),1);
      ctx.fillStyle=o.gold;ctx.strokeStyle='#2a1c14';ctx.lineWidth=1;glowOn('#fff0a0',front?5:0);ctx.beginPath();ctx.moveTo(-3.4,-3.6);ctx.lineTo(3.4,-3.6);ctx.lineTo(3.2,.6);ctx.quadraticCurveTo(0,4.6,-3.2,.6);ctx.closePath();ctx.fill();ctx.stroke();glowOff();
      ctx.fillStyle=o.gem;ctx.beginPath();ctx.arc(0,-.8,1.2,0,7);ctx.fill();ctx.restore();}
    motes(x,by,o.glow,6);};
  JSIDE.embers=function(x,y,by,f,o){motes(x,by,o.c,8);};
  /* the Aegis Lord's sun shield: big and round (the Bulwark's is a grey upright slab), a thick gold rim, a white face,
     gold rays to the rim, a glowing sky gem at the boss and a slow shine. Carried on the far side, behind the body and
     head, so it never covers the face. */
  JBACK.sunshield=function(x,y,by,f,o){const cx=x-f*20,cy=by-4,R=15;ctx.save();ctx.translate(cx,cy);ctx.scale(.86,1);
    ctx.fillStyle=o.rim;ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle=o.face;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,R-3.2,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle=o.rim;for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(-1.6,-4.4);ctx.lineTo(0,-(R-3.4));ctx.lineTo(1.6,-4.4);ctx.closePath();ctx.fill();ctx.restore();}
    ctx.fillStyle=o.rim;ctx.strokeStyle='#2a1c14';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,0,4.6,0,7);ctx.fill();ctx.stroke();
    glowOn(o.gem,7);ctx.fillStyle=o.gem;ctx.beginPath();ctx.arc(0,0,2.4,0,7);ctx.fill();glowOff();
    ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(-.8,-.8,.8,0,7);ctx.fill();
    // a slow shine sweeping across the face
    ctx.save();ctx.beginPath();ctx.arc(0,0,R-3.2,0,7);ctx.clip();const s=((now*.35)%1)*2-1;ctx.globalAlpha=.35*(1-Math.abs(s));ctx.fillStyle='#ffffff';ctx.rotate(-.6);ctx.fillRect(s*R*1.4-2.5,-R,5,R*2);ctx.restore();
    ctx.restore();};
  // the Warden masters: their own outfits, a soft aura and the rune circle (simple reads better on a phone); the Aegis Lord's sun shield
  JOB_LOOK.aegislord={aura:'#ffd76a',b:[['sigil',{c:'#ffd76a',t:'#fff3c0'}]]}; // the sun shield is held in the hand (js/outfits_warden.js)
  // (swapped) the Warbringer wears the barbarian look with spikes and a cape, plus the master's rune circle; the Ravager the plain black iron
  JOB_LOOK.warbringer={aura:'#ff2a3a',s:[['spikes',{c:'#4a2a24',t:'#d8d0c0'}]],b:[['sigil',{c:'#ff2a3a',t:'#ff8a8a'}],['cape',{c:'#7a1e18',t:'#2a1410'}]]};
  JOB_LOOK.ravager={};}
