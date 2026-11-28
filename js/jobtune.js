"use strict";
/* ================= master jobs that hit with a weapon, evened out (v1.91.0) =================
   Measured with tests/zzbal.test.js: every Lv 99 master job, every build, all of the job's own skills at max (attacks,
   buffs and passives) with each buff recast when ready, the best gear anyone can buy or forge (+0, no sigils, no boss
   relics), 90 s on a training dummy, averaged over a Small, a Medium and a Large one (weapon size matters: axes hit
   Large for 115%, daggers for 65%). One target and a pack of five, against the middle of the weapon damage builds:
     before  Forgemaster 177% / 228% (pack), Deadeye 116-134% / 110-114%, Warbringer 86-99%, Goldlord 98%,
             Skywarden 90-100%, Plaguelord 56%, Soulreaper 45%; tanks and support Aegislord 48%, Dawnknight 33-38%
     after   damage builds 86-119% (Forgemaster 92% / 119%, its axes still sweep packs best), tanks and support 46-53%
   (90 s fights, two browsers at a time: 30 s fights were too noisy, the same build swung by 40% between runs)
   Every hit the job deals is multiplied (normal attacks, skills, poison, the falcon, PvP), so its skills and weapons
   keep their own feel and nothing shared with other jobs changes. Spell casters are left as they are. */
const JOB_DMG={forgemaster:.52,deadeye:.82,soulreaper:2.2,plaguelord:1.75,warbringer:1.05,aegislord:1.05,dawnknight:1.4};
const jobDmgMul=()=>P&&JOB_DMG[P.cls]||1;
{const _hmJT=hurtMob;hurtMob=function(m,dmg,crit,kind){const k=jobDmgMul();if(k!==1&&dmg>0)dmg=Math.max(1,Math.round(dmg*k));return _hmJT.call(this,m,dmg,crit,kind);};}
