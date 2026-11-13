"use strict";
/* ================= the master callings of the new advanced callings (js/newjobs2.js) =================
   Made the same way as js/jobs3.js makes the others, so Seer Valen's Trial of Ascension offers them. */
const NJ3={
  runelord:{from:'runeguard',name:'Runelord',hp:2,sp:1.35,aspd:.86,col:'#2e3a5a',acc:'#bfefff',
    desc:'Writes the runes of the world itself. Every swing is a storm of fire, frost and wind.',skills:['runeburst','elementalavatar','runemastery','worldrune']},
  timeweaver:{from:'chronomancer',name:'Timeweaver',hp:1.05,sp:2.6,aspd:1,col:'#3a2e18',acc:'#fff0a0',
    desc:'Holds the hours in one hand. Stops the world for a heartbeat and strikes in every moment at once.',skills:['timestop','paradox','eternity','moments']},
  skywarden:{from:'falconer',name:'Skywarden',hp:1.4,sp:1.35,aspd:.74,col:'#4a3018',acc:'#ffe08a',
    desc:'Rules the open sky. A storm of talons, and a falcon that never lets a target go.',skills:['talonstorm','skydominion','apexhunter','skyfall']},
  lotussage:{from:'ascetic',name:'Lotus Sage',hp:1.75,sp:1.7,aspd:.76,col:'#6a3a1a',acc:'#ffd0a0',
    desc:'The still centre of the storm. Hundred-palm strikes, and a lotus that heals the whole body.',skills:['hundredpalms','lotusbloom','stillmind','heavenfist']}};
for(const id in NJ3){const j=NJ3[id],p=CLASSES[j.from],b=CLASSES[p.base];JOB3[id]=j;
  CLASSES[id]={name:j.name,hp:j.hp,sp:j.sp,aspd:j.aspd,weapons:b.weapons,col:j.col,hair:b.hair,magic:b.magic,base:p.base,parent:j.from,tier:3,acc:j.acc,
    desc:j.desc,own:j.skills,skills:[...p.skills.filter(s=>s!=='firstaid'),...j.skills,'firstaid']};}
