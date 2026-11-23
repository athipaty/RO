"use strict";
/* ================= every sigil its own ability (v1.51.0) =================
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
  hopperchief:{agi:3,luk:2,dbl:5,lowhp:17},hornback:{vit:3,str:3,maxhp:100,bossdmg:10},woolhorn:{vit:3,maxhp:200,dmgred:2,firstdmg:24},
  grandscarecrow:{atk:20,luk:3,crit:3,lowhp:19},lupealpha:{atk:18,crit:3,aspd:6,bossdmg:11},thornmother:{vit:4,maxhp:300,healpct:10,firstdmg:26},
  scarabqueen:{def:8,vit:3,dmgred:5,lowhp:21},antlerking:{str:3,agi:3,aspd:5,bossdmg:12},dunetyrant:{atk:30,str:3,atkpct:6,firstdmg:29},
  fallenpaladin:{def:12,vit:3,dmgred:5,healpct:10,lowhp:22},gloomking:{int:4,matk:30,maxsp:60,cast:8,bossdmg:13},
  warlord:{str:5,vit:5,hppct:15,atkpct:5,firstdmg:31},orchidra:{int:5,maxsp:80,cast:8,healpct:8,lowhp:25},
  frostmatron:{int:5,maxsp:80,matkpct:6,bossdmg:15},rimeheart:{int:5,matk:60,dmgred:6,firstdmg:34},geodecolossus:{def:16,maxhp:500,dmgred:4,lowhp:27},
  mirematriarch:{agi:5,crit:7,critdmg:12,bossdmg:17},hrimfang:{matk:90,int:5,matkpct:6,firstdmg:40},
  hollowking:{str:5,int:5,atkpct:5,matkpct:5,lowhp:31},krakenmatron:{int:5,dex:5,maxsp:100,cast:8,bossdmg:18},
  cinderwyrm:{atk:65,str:5,atkpct:6,firstdmg:43},voltaris:{agi:6,dex:6,aspd:8,dbl:5,lowhp:34},ignarok:{maxhp:1500,str:5,vit:5,dmgred:6,bossdmg:20},
  sproutling:{maxhp:80,killhp:2},fluffwool:{maxhp:40,killhp:2},hopper:{agi:2,move:3},puffcap:{maxsp:25,exp:2},pebblet:{def:3,res_earth:9},
  mossbug:{def:4,res_earth:9},burrowmole:{atk:6,vs_beast:7},dewdrop:{int:2,vs_plant:7},gustwisp:{agi:1,spleech:1},turnipsprite:{maxhp:60,spleech:1},
  ridgeram:{atk:10,stun:4},bumblewing:{agi:2,move:3},thornling:{atk:15,stun:4},mudpuddle:{vit:2,res_water:10},screebeetle:{def:6,thorns:10},
  cropweevil:{dex:2,gold:5},thistlehog:{maxhp:60,res_earth:10},greylupe:{flee:10,move:4},barkling:{vit:1,res_earth:11},reedsnapper:{atk:12,vs_beast:8},
  mushcap:{vit:3,killhp:3},webspinner:{dex:2,slow:4},pinesprite:{maxhp:120,res_earth:11},glowworm:{int:2,vs_insect:8},shriekcap:{int:2,res_earth:12},
  scarab:{def:10,thorns:12},cavebat:{agi:3,leech:2},timberboar:{atk:12,leech:2},relicrat:{luk:2,gold:6},dunejackal:{agi:2,gold:6},
  hollowowl:{dex:2,exp:3},ivycreeper:{maxhp:180,thorns:13},wraith:{flee:20,vs_undead:9},stonecrab:{vit:2,thorns:13},crystalmite:{def:8,res_water:13},
  gloomcap:{int:2,ailres:17},ridgebruin:{vit:2,thorns:14},miragewisp:{matk:30,spleech:2},stonesentry:{vit:2,res_earth:13},cactoid:{atk:10,vs_plant:10},
  deepshade:{matk:25,vs_spirit:10},relicmimic:{luk:3,gold:7},bonearcher:{dex:3,vs_undead:10},cavetroll:{str:2,res_earth:14},vineviper:{atk:18,slow:5},
  emberimp:{matk:35,spleech:2},gravehound:{str:3,move:5},howlerape:{str:3,exp:4},ashgolem:{maxhp:300,thorns:16},bloomtrap:{matk:40,killhp:4},
  rimestalker:{crit:5,move:5},iceimp:{matk:45,freeze:6},jadetoad:{maxhp:300,res_water:16},shardling:{dmgred:3,res_earth:16},
  frostwisp:{matk:50,freeze:6},glacierbeetle:{dmgred:4,thorns:18},snowhulk:{vit:4,res_water:16},prismmoth:{matk:55,vs_insect:12},
  bogling:{maxhp:350,res_water:17},geodetortoise:{def:10,ailres:24},fenlurker:{str:4,vs_beast:13},glasslynx:{crit:4,move:5},
  marshwisp:{matk:55,vs_spirit:13},rotcap:{int:3,ailres:25},rimedrake:{matk:58,vs_beast:14},miregolem:{def:10,ailres:26},
  frostyeti:{maxhp:450,ailres:26},gloamstag:{atk:34,leech:4},bogmantis:{atk:32,slow:7},tidecrab:{def:12,res_water:19},duskweaver:{flee:12,ailres:27},
  tuskwalrus:{vit:3,res_water:20},saltwing:{flee:8,move:6},driftgolem:{maxhp:500,ailres:28},frostbeak:{atk:36,freeze:8},nightdryad:{matk:64,killhp:6},
  coralsiren:{matk:66,killsp:15},reefstalker:{atk:40,spleech:4},duskpanther:{agi:4,ailres:29},barnaclebrute:{vit:4,res_water:21},
  cinderling:{maxhp:600,res_fire:21},magmahound:{str:4,move:6},thunderhawk:{agi:4,vs_beast:16},obsidiangolem:{def:16,killhp:6},
  flamewraith:{matk:76,leech:4},stormelemental:{matk:78,killsp:17},emberbat:{agi:5,vs_beast:17},salamander:{atk:48,spleech:5},
  lavaslug:{maxhp:800,res_fire:23},skygriffin:{atk:50,freeze:9},pyretitan:{str:4,res_fire:23},basaltcrawler:{def:20,killhp:6},
  peakgiant:{def:18,killsp:18},magmaelemental:{atk:58,vs_construct:17},moltenknight:{str:5,ailres:33},ashrevenant:{matk:88,leech:5},
  hellimp:{int:5,spleech:5}};
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
{const NM={maxhp:'Max HP',maxsp:'Max SP'};
  const lab=(k,v)=>(typeof bonusLabel==='function'&&bonusLabel(k,v))||`+${v} ${NM[k]||k.toUpperCase()}`;
  for(const id in SIG3){const m=MOBS[id],it=ITEMS[id+'_sig'];if(!m||!m.sig||!it)continue;
    m.sig.b={...SIG3[id]};it.b=m.sig.b;m.sig.txt=Object.entries(m.sig.b).map(([k,v])=>lab(k,v)).join(', ');
    it.desc=`Socket into ${/^[aeiou]/.test(m.sig.kind)?'an':'a'} ${m.sig.kind}: ${m.sig.txt}.`;}}
