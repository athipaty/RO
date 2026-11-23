"use strict";
/* ================= every sigil its own ability (v1.51.0) =================
   (v1.52.4) every sigil now has a pair of bonuses no other sigil has (before, up to two shared one: two weapon sigils
   were "MATK + Freeze chance"), and each slot gets abilities that fit it: weapons hit (life steal, SP per hit, stun /
   freeze / slow, crit, attack speed, race damage...), armour and headgear guard (reflect, element and ailment resist,
   regen, healing, damage cut...), accessories help (move speed, gold, EXP, attack speed, cast time...).
   Before, 57 of the 120 sigils shared their bonuses with two or more others (nine weapon sigils were all "INT + MATK",
   eight armour sigils all "DEF + Max HP"): only the numbers changed with the monster's level. Now each ordinary sigil
   has one stat line that fits its level plus one signature ability that fits its monster, and no pair of bonuses is
   used by more than two sigils:
     Life steal  · SP per hit · HP back on a kill · SP back on a kill
     chance to stun / freeze / slow on hit · reflect melee damage · resist an element (fire, water, wind, earth, shadow)
     resist ailments · more damage to a race · EXP % · gold % · move speed
   Boss sigils keep their whole line and add an ability only bosses give:
     Last Stand (more damage below 35% HP) · Giant Slayer (more damage to bosses) · Ambush (more damage to unhurt foes)
   The abilities are run by js/sigfx.js. Loaded after js/sigils2.js and before js/awaken.js (the Radiant twins are made
   from these numbers) and js/hpscale.js (which triples Max HP). */
const SIG3={
  hopperchief:{agi:3,luk:2,dbl:5,lowhp:4},hornback:{vit:3,str:3,maxhp:100,bossdmg:4},woolhorn:{vit:3,maxhp:200,dmgred:2,firstdmg:4},
  grandscarecrow:{atk:20,luk:3,crit:3,lowhp:4},lupealpha:{atk:18,crit:3,aspd:6,bossdmg:4},thornmother:{vit:4,maxhp:300,healpct:8,firstdmg:4},
  scarabqueen:{def:8,vit:3,dmgred:5,lowhp:5},antlerking:{str:3,agi:3,aspd:5,bossdmg:5},dunetyrant:{atk:30,str:3,atkpct:6,firstdmg:5},
  fallenpaladin:{def:12,vit:3,dmgred:5,healpct:8,lowhp:5},gloomking:{int:4,matk:30,maxsp:60,cast:8,bossdmg:5},
  warlord:{str:5,vit:5,hppct:8,atkpct:5,firstdmg:5},orchidra:{int:5,maxsp:80,cast:8,healpct:8,lowhp:6},frostmatron:{int:5,maxsp:80,matkpct:6,bossdmg:6},
  rimeheart:{int:5,matk:60,dmgred:6,firstdmg:6},geodecolossus:{def:16,maxhp:500,dmgred:4,lowhp:6},mirematriarch:{agi:5,crit:7,critdmg:8,bossdmg:7},
  hrimfang:{matk:90,int:5,matkpct:6,firstdmg:7},hollowking:{str:5,int:5,atkpct:5,matkpct:5,lowhp:7},
  krakenmatron:{int:5,dex:5,maxsp:100,cast:8,bossdmg:7},cinderwyrm:{atk:65,str:5,atkpct:6,lowhp:8},voltaris:{agi:6,dex:6,aspd:8,dbl:5,lowhp:8},
  ignarok:{maxhp:1500,str:5,vit:5,dmgred:6,bossdmg:8},sproutling:{maxhp:80,killhp:2},fluffwool:{maxhp:40,regen:1},hopper:{agi:2,move:3},
  puffcap:{maxsp:25,exp:2},pebblet:{def:3,res_earth:2},mossbug:{maxhp:75,res_earth:2},burrowmole:{atk:6,critdmg:2},dewdrop:{int:2,vs_plant:2},
  gustwisp:{agi:1,spleech:1},turnipsprite:{maxhp:60,spleech:1},ridgeram:{atk:10,stun:4},bumblewing:{dex:1,move:3},thornling:{atk:15,slow:4},
  mudpuddle:{vit:2,res_water:3},screebeetle:{def:6,thorns:3},cropweevil:{dex:2,gold:3},thistlehog:{vit:2,res_earth:3},greylupe:{flee:10,move:4},
  barkling:{vit:1,dmgred:3},reedsnapper:{atk:12,vs_beast:3},mushcap:{vit:3,killhp:3},webspinner:{atk:16,hit:6},pinesprite:{maxhp:120,thorns:3},
  glowworm:{int:2,vs_insect:3},shriekcap:{int:2,res_earth:3},scarab:{vit:2,thorns:3},cavebat:{atk:18,leech:2},timberboar:{atk:12,spleech:2},
  relicrat:{luk:2,gold:3},dunejackal:{agi:2,gold:3},hollowowl:{dex:2,exp:3},ivycreeper:{def:7,killhp:3},wraith:{flee:20,vs_undead:4},
  stonecrab:{vit:2,ailres:4},crystalmite:{def:8,res_water:4},gloomcap:{int:2,ailres:4},ridgebruin:{def:8,dmgred:4},miragewisp:{matk:30,spleech:2},
  stonesentry:{maxhp:185,dmgred:4},cactoid:{atk:10,vs_plant:4},deepshade:{matk:25,vs_spirit:4},relicmimic:{str:2,gold:4},
  bonearcher:{atk:25,vs_undead:4},cavetroll:{str:2,res_earth:4},vineviper:{atk:18,freeze:5},emberimp:{matk:35,cast:4},gravehound:{str:3,move:5},
  howlerape:{str:3,exp:4},ashgolem:{maxhp:300,res_fire:5},bloomtrap:{matk:40,killhp:4},rimestalker:{crit:5,move:5},iceimp:{matk:45,freeze:6},
  jadetoad:{maxhp:300,res_water:5},shardling:{dmgred:3,res_earth:5},frostwisp:{matk:50,leech:3},glacierbeetle:{dmgred:4,thorns:5},
  snowhulk:{def:12,ailres:5},prismmoth:{matk:55,vs_insect:5},bogling:{def:13,regen:3},geodetortoise:{maxhp:310,ailres:5},fenlurker:{str:4,vs_beast:5},
  glasslynx:{luk:3,move:5},marshwisp:{matk:55,stun:7},rotcap:{maxsp:69,res_earth:6},rimedrake:{matk:58,vs_beast:6},miregolem:{def:10,killsp:14},
  frostyeti:{maxhp:450,killsp:14},gloamstag:{atk:34,killsp:14},bogmantis:{atk:32,vs_insect:6},tidecrab:{vit:4,killsp:14},duskweaver:{flee:12,ailres:6},
  tuskwalrus:{int:4,res_water:6},saltwing:{int:4,move:6},driftgolem:{vit:4,regen:4},frostbeak:{atk:36,vs_fiend:6},nightdryad:{matk:64,slow:8},
  coralsiren:{matk:66,killsp:15},reefstalker:{atk:40,aspd:7},duskpanther:{agi:4,ailres:7},barnaclebrute:{str:4,res_water:7},
  cinderling:{def:18,res_fire:7},magmahound:{str:4,aspd:7},thunderhawk:{agi:4,hit:17},obsidiangolem:{def:16,healpct:7},flamewraith:{matk:76,critdmg:7},
  stormelemental:{matk:78,aspd:7},emberbat:{agi:5,aspd:7},salamander:{atk:48,killhp:6},lavaslug:{vit:4,res_fire:7},skygriffin:{atk:50,dbl:6},
  pyretitan:{str:4,res_fire:7},basaltcrawler:{maxhp:485,healpct:7},peakgiant:{vit:5,healpct:7},magmaelemental:{atk:58,vs_construct:8},
  moltenknight:{str:5,ailres:8},ashrevenant:{matk:88,vs_undead:8},hellimp:{int:5,spleech:5}
};
// the words for the new abilities (also used by the library filter and item cards)
// written as "Name value" like the other bonuses, so lists of them read (and translate) the same way
const SIG3_NAME={leech:'Life steal',spleech:'SP per hit',killhp:'HP on a kill',killsp:'SP on a kill',stun:'Stun chance',freeze:'Freeze chance',
  slow:'Slow chance',thorns:'Reflect melee damage',res_fire:'Fire damage taken',res_water:'Water damage taken',res_wind:'Wind damage taken',
  res_earth:'Earth damage taken',res_shadow:'Shadow damage taken',ailres:'Ailment resist',exp:'EXP',gold:'Gold',move:'Move speed',
  lowhp:'Last Stand (HP below 35%)',bossdmg:'Giant Slayer (vs bosses)',firstdmg:'Ambush (unhurt foes)'};
const SIG3_LABEL={};
for(const k in SIG3_NAME)SIG3_LABEL[k]=k.startsWith('res_')?v=>`${SIG3_NAME[k]} −${v}%`:k==='spleech'||k==='killsp'?v=>`${SIG3_NAME[k]} +${v}`:
  k==='leech'||k==='stun'||k==='freeze'||k==='slow'||k==='thorns'||k==='ailres'?v=>`${SIG3_NAME[k]} ${v}%`:v=>`${SIG3_NAME[k]} +${v}%`;
if(typeof BONUS_LABEL!=='undefined')Object.assign(BONUS_LABEL,SIG3_LABEL);
// Thai: the names (lists of bonuses are put into Thai name by name)
if(typeof TH_BONUS!=='undefined')Object.assign(TH_BONUS,{'Life steal':'ดูดเลือด','SP per hit':'SP ต่อการโจมตี','HP on a kill':'ฟื้น HP เมื่อล้มศัตรู','SP on a kill':'ฟื้น SP เมื่อล้มศัตรู',
  'Stun chance':'โอกาสทำให้มึน','Freeze chance':'โอกาสแช่แข็ง','Slow chance':'โอกาสทำให้ช้า','Reflect melee damage':'สะท้อนความเสียหายระยะประชิด',
  'Fire damage taken':'ความเสียหายไฟที่ได้รับ','Water damage taken':'ความเสียหายน้ำที่ได้รับ','Wind damage taken':'ความเสียหายลมที่ได้รับ',
  'Earth damage taken':'ความเสียหายดินที่ได้รับ','Shadow damage taken':'ความเสียหายเงามืดที่ได้รับ','Ailment resist':'ต้านทานสถานะผิดปกติ','Gold':'ทอง',
  'Move speed':'ความเร็วเดิน','Last Stand (HP below 35%)':'ยืนหยัด (HP ต่ำกว่า 35%)','Giant Slayer (vs bosses)':'นักล่ายักษ์ (ต่อบอส)','Ambush (unhurt foes)':'ซุ่มโจมตี (ศัตรูที่ยังไม่บาดเจ็บ)'});
if(typeof TH!=='undefined')Object.assign(TH,{'Life steal':'ดูดเลือด','SP per hit':'SP ต่อการโจมตี','HP on a kill':'ฟื้น HP เมื่อล้มศัตรู','SP on a kill':'ฟื้น SP เมื่อล้มศัตรู',
  'Stun chance':'โอกาสทำให้มึน','Freeze chance':'โอกาสแช่แข็ง','Slow chance':'โอกาสทำให้ช้า','Reflect melee damage':'สะท้อนความเสียหาย','Fire damage taken':'ความเสียหายไฟที่ได้รับ',
  'Water damage taken':'ความเสียหายน้ำที่ได้รับ','Wind damage taken':'ความเสียหายลมที่ได้รับ','Earth damage taken':'ความเสียหายดินที่ได้รับ','Shadow damage taken':'ความเสียหายเงามืดที่ได้รับ',
  'Ailment resist':'ต้านทานสถานะผิดปกติ','Gold':'ทอง','Move speed':'ความเร็วเดิน','Last Stand':'ยืนหยัด','Giant Slayer':'นักล่ายักษ์','Ambush':'ซุ่มโจมตี',
  'vs Fiend':'ต่อปีศาจ','vs Construct':'ต่อสิ่งประดิษฐ์','vs Beast':'ต่อสัตว์','vs Insect':'ต่อแมลง','vs Plant':'ต่อพืช','vs Spirit':'ต่อวิญญาณ','vs Undead':'ต่ออันเดด'});
/* (v1.51.2) no sigil gives more than 10%: a sigil's percentages grow with its monster's level from about 2% to 8% at
   Lv 99 (boss-only abilities from 3%), any other % bonus on a sigil stops at 8%, and a Radiant twin (fusion only) at 10%
   (js/sigfx.js). Before, Ambush reached 43%, Last Stand 34%, ailment resist 33% and Radiant twins half again more. */
const SIG_PCT_MAX=8,SIG_PCT_RADIANT=10;
const SIG_PCT_KEYS=['leech','stun','freeze','slow','thorns','res_fire','res_water','res_wind','res_earth','res_shadow','ailres','exp','gold','move',
  'lowhp','bossdmg','firstdmg','vs_beast','vs_insect','vs_plant','vs_spirit','vs_undead','vs_fiend','vs_construct',
  'critdmg','hppct','healpct','aspd','cast','dbl','atkpct','matkpct','dmgred','sppct','crit'];
{const grow=(lv,lo)=>Math.max(lo,Math.min(SIG_PCT_MAX,Math.round(lo+(SIG_PCT_MAX-lo)*lv/99)));
  const LEVELED=/^(res_|vs_)|^(thorns|ailres|gold)$/,BOSSONLY=/^(lowhp|bossdmg|firstdmg)$/;
  for(const id in SIG3){const b=SIG3[id],lv=(MOBS[id]&&MOBS[id].lv)||1;
    for(const k in b){if(BOSSONLY.test(k))b[k]=grow(lv,3);else if(LEVELED.test(k))b[k]=grow(lv,2);else if(SIG_PCT_KEYS.includes(k))b[k]=Math.min(SIG_PCT_MAX,b[k]);}}}
{const NM={maxhp:'Max HP',maxsp:'Max SP'};
  const lab=(k,v)=>(typeof bonusLabel==='function'&&bonusLabel(k,v))||`+${v} ${NM[k]||k.toUpperCase()}`;
  for(const id in SIG3){const m=MOBS[id],it=ITEMS[id+'_sig'];if(!m||!m.sig||!it)continue;
    m.sig.b={...SIG3[id]};it.b=m.sig.b;m.sig.txt=Object.entries(m.sig.b).map(([k,v])=>lab(k,v)).join(', ');
    it.desc=`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`;}}
