"use strict";
/* ================= error log: tell the game server when something breaks in a player's game =================
   Loaded first, so it catches errors in every later script. Each different error is sent once per visit, and at
   most 10 per visit. Only our own scripts are reported (not browser extensions); no personal data is sent beyond
   the account name the server already knows from the login token. Admins read the list in Admin → Errors. */
(()=>{
  const sent=new Set();let n=0;
  const server=()=>{const s=new URLSearchParams(location.search).get('server');return /^https?:\/\/[\w.:-]+$/.test(s||'')?s:'https://center-kitchen-backend.onrender.com';};
  const ours=src=>!src||src.startsWith(location.origin)||src.startsWith('file:')||/\/js\/[\w-]+\.js/.test(src);
  function report(msg,src,line,col,stack){
    try{msg=String(msg||'').slice(0,300);if(!msg||n>=10)return;src=String(src||'');
      if(!ours(src)||/^Script error\.?$/.test(msg))return;
      const key=msg+'|'+src+'|'+line;if(sent.has(key))return;sent.add(key);n++;
      const headers={'content-type':'application/json'};
      try{if(typeof ACC!=='undefined'&&ACC.token)headers.authorization='Bearer '+ACC.token;}catch(e){}
      const body=JSON.stringify({msg,src:src.split('?')[0],line:line|0,col:col|0,stack:String(stack||'').slice(0,1500),v:typeof VERSION!=='undefined'?VERSION:''});
      fetch(server()+'/api/embervale/errors',{method:'POST',headers,body,keepalive:true}).catch(()=>{});
    }catch(e){}}
  window.addEventListener('error',ev=>{if(ev.error||ev.message)report(ev.message,ev.filename,ev.lineno,ev.colno,ev.error&&ev.error.stack);});
  window.addEventListener('unhandledrejection',ev=>{const r=ev.reason;report('Unhandled promise: '+(r&&r.message||String(r)),r&&r.fileName||'',0,0,r&&r.stack);});
  window.__errlog={report,sent};
})();
