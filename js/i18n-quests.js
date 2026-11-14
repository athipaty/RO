"use strict";
/* ================= Thai: quests and NPC conversations =================
   When Thai is on, the quest texts (name, offer, progress, completion), greetings, trial speeches,
   service choices and the shop/trainer lines are swapped for Thai versions. Names stay as they are. */
const QUESTS_TH={
  letter:{name:'จดหมายถึงช่างตีเหล็ก',offer:['อ้าว หน้าใหม่ใน Hearthvale! ยินดีต้อนรับ ยินดีต้อนรับ','ช่วยตาแก่คนนี้หน่อยได้ไหม เอาจดหมายนี้ไปให้ Brannoc ที่โรงตีเหล็ก อยู่ถัดไปตามถนนนี่เอง'],
    wait:'โรงตีเหล็กคืออาคารหลังคาสีเข้มทางเหนือของน้ำพุ',done:['จดหมายจาก Hollis เหรอ? เขาเขียนมาเฉพาะตอนอยากได้อะไรเท่านั้นแหละ','…ฮ่ะ เขาอยากให้ข้าดูแลเจ้า ก็ได้ เอานี่ไป เจ้าต้องได้ใช้แน่']},
  sprouts:{name:'ต้นอ่อนกับยางไม้',offer:['ถังชุบเหล็กของข้าต้องใช้หยดยางไม้ พวก Sproutling ใน Greenmoss Meadow มีเยอะเลย','กำจัดมันสัก 8 ตัว แล้วเอาหยดยางไม้มาให้ข้า 5 หยด ทุ่งหญ้าอยู่หลังประตูฝั่งตะวันออก'],
    wait:'Sproutling 8 ตัว หยดยางไม้ 5 หยด ทุ่งหญ้าอยู่ทางตะวันออกของเมือง',done:['ยางไม้ดี เหนียวกำลังดี เอาไว้ชุบใบมีดได้เยี่ยม','เอาแร่นี่ไป เมื่อไหร่มีอาวุธที่น่าตีบวกก็เอามาที่นี่']},
  watch:{name:'หน่วยเฝ้าทุ่งหญ้า',offer:['Brannoc บอกข้าว่าเจ้าเอาตัวรอดข้างนอกได้ดี','กิลด์มีจุดเฝ้ายามในทุ่งหญ้า Warden Pell เป็นคนดูแล ไปเสนอตัวช่วยเขาสิ'],
    wait:'Warden Pell ยืนอยู่ใกล้ขอบด้านตะวันตกของ Greenmoss Meadow',done:['Hollis ส่งเจ้ามาเหรอ? งั้นยินดีต้อนรับ','ข้าต้องการคนช่วยพอดี พวก Mossbug ชักจะได้ใจ']},
  mossbugs:{name:'เปลือกบนทางเดิน',offer:['พวก Mossbug แทะสัมภาระของนักเดินทาง ลดจำนวนมันหน่อย สัก 10 ตัวก็พอ','แล้วเอาเปลือกตะไคร่มาให้ข้า 5 ชิ้น เอาไว้ทำหน้าโล่ได้ดี'],
    wait:'Mossbug 10 ตัว และเปลือกตะไคร่ 5 ชิ้น',done:['ถนนเงียบลงแล้ว เจ้ามีพรสวรรค์นะ','สวมนี่ไว้ ไม่ได้มีค่ามากหรอก แต่กิลด์ดูแลคนของตัวเองเสมอ']},
  woods:{name:'สู่ป่าลึก',offer:['มีบางอย่างไล่พวกหมาป่าออกจาก Whispering Woods ปกติพวกมันไม่เคยมาใกล้ขนาดนี้','Ysolde นักแกะรอยตั้งแคมป์อยู่ที่ขอบป่าทางตะวันออก ไปหาเธอ'],
    wait:'Whispering Woods อยู่ทางตะวันออกของทุ่งหญ้า Ysolde รออยู่ใกล้ทางเข้า',done:['ทหารใหม่ของ Pell สินะ เงียบหน่อย พวก Lupe กำลังล่าเหยื่อแถวนี้']},
  lupes:{name:'ฝูงที่กระวนกระวาย',offer:['ฝูงหมาป่าคลั่งไปหมดแล้ว พวกมันหนีอะไรบางอย่างจากทางตะวันออก และกัดทุกอย่างที่ขวางทาง','ล้ม Grey Lupe 12 ตัว แล้วเอาหนังมา 5 ผืน ข้าอยากรู้ว่าพวกมันไปคลุกอะไรมา'],
    wait:'Grey Lupe 12 ตัว และหนัง Lupe 5 ผืน',done:['เถ้าถ่าน หนังพวกนี้เต็มไปด้วยเถ้า และมันยังอุ่นอยู่','มีบางอย่างกำลังลุกไหม้ใต้เนินทราย เอานี่ไป สวมหูนี้ไว้ ฝูงหมาป่าจะคิดว่าเจ้าเป็นพวกเดียวกัน']},
  dunes:{name:'เถ้าในสายลม',offer:['เอาหนังผืนนี้ไปให้ Scout Kade ใน Ashen Dunes เขาเฝ้าถนนเก่าที่นั่นอยู่','ถ้ามีใครรู้ว่าเถ้ามาจากไหน ก็ต้องเป็นเขา'],
    wait:'เดินไปทางตะวันออกผ่านป่าสู่ Ashen Dunes แล้วหา Scout Kade',done:['เถ้าอุ่นเหรอ? งั้นไม่ใช่แค่ข้าที่สังเกต พวกวิญญาณทรายดุร้ายขึ้นทุกคืน']},
  wraiths:{name:'ฝุ่นและเงา',offer:['พวก Dust Wraith ลอยมาจากทางตะวันออก มุ่งไปยังสุสานเก่า ข้าต้องการหลักฐานให้กิลด์','กำจัดมัน 12 ตัว แล้วเอาฝุ่นวิญญาณมาให้ข้า 6 กำ'],
    wait:'Dust Wraith 12 ตัว และฝุ่นวิญญาณ 6 กำ',done:['ฝุ่นเรืองแสงเมื่อยื่นไปทางสุสาน สิ่งที่ตื่นขึ้นอยู่ข้างล่างนั่น','เอา Glintstone พวกนี้ไป เจ้าต้องการเกราะที่แข็งแรงสำหรับสิ่งที่จะมาถึง']},
  crypt:{name:'ประตูเถ้าถ่าน',offer:['ประตูสุสานเปิดออกแล้ว และพวก Ember Imp ก็ทะลักออกมา','บุกเข้าไป ทำลาย Imp 15 ตัว แล้วนำแกนเถ้าถ่าน 3 ชิ้นกลับมาให้ Elder Hollis เขาจะรู้ว่ามันหมายถึงอะไร'],
    wait:'Ember Imp 15 ตัว และแกนเถ้าถ่าน 3 ชิ้น แล้วกลับไปหา Elder Hollis ใน Hearthvale',done:['แกนเถ้าถ่าน… ยังเต้นอยู่ ตำนานเก่าเป็นเรื่องจริง','นานมาแล้ว ขุนศึกตนหนึ่งถูกผนึกไว้ในสุสานนั้น ผนึกกำลังอ่อนลง ข้าขอโทษที่ต้องขอให้เจ้าทำเรื่องนี้']},
  warlord:{name:'หัวใจแห่งเถ้า',offer:['Ashen Warlord กำลังตื่นขึ้นในส่วนลึกของ Cinder Crypt','ไม่มีใครใน Hearthvale ต้านเขาได้ ไม่มีใครนอกจากเจ้า และคนที่เจ้าไว้ใจให้อยู่เคียงข้าง พาเพื่อนไปด้วย'],
    wait:'ปราบ Ashen Warlord ใน Cinder Crypt พาปาร์ตี้ไปด้วย',done:['พื้นดินเย็นลงแล้ว เจ้าทำได้','Hearthvale เป็นหนี้เจ้าทุกอย่าง รับนี่ไป และจงรู้ว่าชื่อของเจ้าจะถูกเล่าขานที่น้ำพุนี้ไปอีกนาน']},
  d_patrol:{name:'ประจำวัน: ลาดตระเวนทุ่งหญ้า',offer:['พวก Hopper เหยียบย่ำพืชผลทุกวัน ช่วยลดจำนวนอีกครั้ง 15 ตัวก็พอ'],wait:'Hopper 15 ตัวใน Greenmoss Meadow',done:['เยี่ยมมาก พรุ่งนี้เวลาเดิมนะ?']},
  d_restock:{name:'ประจำวัน: เติมของในร้าน',offer:['ลูกค้าถามหาหนามแหลมตลอด แต่ของหมดอยู่เรื่อย','เอามาให้ข้า 8 อัน ข้าจะจ่ายดีกว่าที่เคาน์เตอร์รับซื้อ'],wait:'หนามแหลม 8 อัน จาก Thornling ใน Whispering Woods',done:['สวยเลย คมกริบ นี่ค่าจ้าง กับของติดมือไว้ใช้ระหว่างทาง']},
  d_deep:{name:'ประจำวัน: ราชาเห็ดมืด',offer:['ในลานโล่งทางใต้ของถนนมีบันไดลงไปยัง Mossdeep Caverns','ลึกลงไปสามชั้น มีราชาแห่งความมืดเติบโตอ้วนพีในความมืด โค่นมันก่อนสปอร์จะลามถึงป่า'],
    wait:'ลงบันไดใน Whispering Woods ไปยัง Mossdeep Caverns B3 แล้วปราบ Gloomcap King',done:['สปอร์สงบลงแล้ว คืนนี้ป่าหายใจได้โล่งขึ้น มันจะงอกขึ้นมาอีก มันเป็นแบบนี้เสมอ']},
  d_sweep:{name:'ประจำวัน: กวาดล้างเนินทราย',offer:['พวก Scarab ขุดถนนพังทุกคืน กำจัดมัน 15 ตัว กองคาราวานจะได้เดินทางต่อ'],wait:'Dune Scarab 15 ตัวใน Ashen Dunes',done:['ถนนโล่งแล้ว พรุ่งนี้มาใหม่นะ พวกมันกลับมาเสมอ']},
};
const GREET_TH={hollis:'น้ำพุนี้เห็นวีรบุรุษมามากมาย นั่งพักก่อนสิ',pell:'จับตาดูพงหญ้าไว้ พวก Hopper กัดนะ',ysolde:'ก้าวเบา ๆ ป่ากำลังฟังอยู่',kade:'ทรายเข้าไปได้ทุกที่ ระวังฝีเท้าด้วย',
  brannoc:'ระวังสะเก็ดไฟ',ilsa:'ยินดีต้อนรับกลับมา เพื่อน!',_:'สวัสดี นักเดินทาง'};
const SERVICE_TH={shop:'ดูสินค้าในร้าน',job:'ธุระของกิลด์',heal:'ขอพร',warp:'เดินทางหรือพักผ่อน',smith:'ตีเหล็ก',storage:'เปิดคลังเก็บของ'};
const TRIALS_TH={warden:'โล่ไม่มีค่าอะไรถ้าไร้ความกล้าที่อยู่เบื้องหลัง Cinder Crypt เต็มไปด้วยนักธนู จงเดินฝ่าห่าลูกศรของพวกมัน',
  arcanist:'เวทมนตร์ตอบสนองผู้ที่เข้าใจความตาย จงทำลาย Dust Wraith แห่งเนินทราย แล้วนำสิ่งที่เหลือมาให้ข้า',
  ranger:'นักล่าต้องอ่านผืนดินออก พวก Cactoid ซ่อนตัวอยู่กลางที่โล่งในเนินทราย จงหาพวกมันให้เจอ แล้วนำหนามกลับมา',
  cleric:'แสงต้องลุกโชนกว่าไฟ จงชำระล้าง Ember Imp ในสุสาน แล้วนำแกนของพวกมันมาให้ข้า'};
// shopkeepers' and trainers' lines (exact, and with numbers or names in them)
const TH_QNAMES=new Set();
Object.assign(TH,{
  'Accept':'ยอมรับ','Complete quest':'ส่งเควส','Talk':'คุย','Not now':'ไว้ทีหลัง','Next ▸':'ถัดไป ▸','Back':'กลับ',
  '“Rest a moment, traveller. The light asks nothing of you.” — Sister Maren':'“พักสักครู่เถิด นักเดินทาง แสงสว่างไม่ขอสิ่งใดจากเจ้า” — Sister Maren',
  '“Tonics, steel and sturdy cloth. And I\'ll buy whatever you dragged out of the wilds.” — Ilsa':'“ยา เหล็ก และผ้าเนื้อดี แล้วข้าก็รับซื้อทุกอย่างที่เจ้าลากกลับมาจากป่า” — Ilsa',
  '“I can send you to any road you\'ve already walked. The fare depends on how far you go. And if your feet are sore, the bunks upstairs are clean.” — Tobin':'“ข้าส่งเจ้าไปยังเส้นทางที่เจ้าเคยเดินแล้วได้ทุกที่ ค่าเดินทางขึ้นกับระยะทาง และถ้าเท้าเจ้าเมื่อย เตียงชั้นบนก็สะอาดดี” — Tobin',
  '"Leave it with me, love. It\'ll be right here when you come back."':'"ฝากไว้กับข้าได้เลยจ้ะ กลับมาเมื่อไหร่ก็อยู่ตรงนี้"',
  '"Bring me ore and gold and I\'ll make that blade sing. Up to +4 never fails. Past that, a bad strike shatters the piece for good."':'"เอาแร่กับโกลด์มา แล้วข้าจะทำให้ใบมีดนั่นร้องเพลง ถึง +4 ไม่มีวันพลาด เกินกว่านั้น ถ้าตีพลาดของจะแตกไปตลอดกาล"',
  '"Every creature you defeat, I write down. Defeat ten of a kind and I\'ll share all I know: drops, weaknesses, the lot." — Oren':'"ทุกสิ่งมีชีวิตที่เจ้าปราบ ข้าจดไว้หมด ปราบชนิดเดียวกันครบสิบตัว แล้วข้าจะบอกทุกอย่างที่รู้ ทั้งของดรอป จุดอ่อน ทุกอย่าง" — Oren',
  '"Every piece of gear can hold up to four sigils, if you trust my hand. I cut one new slot at a time. The deeper I go, the likelier the stone resists, but I never break your gear, only my fee."':'"อุปกรณ์ทุกชิ้นใส่ซิจิลได้ถึงสี่ช่อง ถ้าเจ้าไว้ใจฝีมือข้า ข้าเจียระไนเพิ่มทีละช่อง ยิ่งลึกยิ่งมีโอกาสที่หินจะต้านทาน แต่ข้าไม่เคยทำของเจ้าพัง เสียแค่ค่าจ้างเท่านั้น"',
  '"No festival right now, friend. Come back when the town is dressed up! Here\'s when they are:"':'"ตอนนี้ยังไม่มีเทศกาลนะเพื่อน กลับมาตอนเมืองประดับประดาสิ! นี่คือกำหนดการ:"',
  '"Some heroes walk the long road twice, and walk it stronger. Give up your years of experience and I will give you a second beginning."':'"วีรบุรุษบางคนเดินเส้นทางอันยาวไกลถึงสองครั้ง และแข็งแกร่งกว่าเดิม สละประสบการณ์ทั้งหมดของเจ้า แล้วข้าจะมอบจุดเริ่มต้นใหม่ให้"',
  '“You\'ve earned it. Choose your calling. The choice is for life, so choose with care.” — Corvin':'“เจ้าสมควรได้รับมัน เลือกอาชีพของเจ้า ทางเลือกนี้ติดตัวไปตลอดชีวิต จงเลือกอย่างรอบคอบ” — Corvin',
  'Embervale is a click-to-move action RPG. Hunt monsters for experience, gold, loot and rare sigils.':'Embervale คือเกมแอ็กชัน RPG แบบคลิกเพื่อเดิน ล่ามอนสเตอร์เพื่อรับค่าประสบการณ์ ไอเทม และซิจิลหายาก',
  'Rewards: ':'รางวัล: ','Then talk to':'แล้วไปคุยกับ','Talk to':'คุยกับ','Return to':'กลับไปหา',
});
TH_PAT.push(
  [/^"A new look for a new adventure\? Sit down, sit down\. ([\d,]+) gold and you'll walk out a new person\."$/,'"ลุคใหม่สำหรับการผจญภัยครั้งใหม่? นั่งลงเลย นั่งลงเลย $1 โกลด์ แล้วเจ้าจะเดินออกไปเป็นคนใหม่"'],
  [/^"The (.+) is on! Bring me (.+)s from the monsters you defeat and I'll make it worth your while\."$/,'"$1 เริ่มแล้ว! นำ $2 จากมอนสเตอร์ที่เจ้าปราบมาให้ข้า แล้วข้าจะตอบแทนให้คุ้มค่า"'],
  [/^“Every calling starts in the meadow\. Reach Job Level 10 and come see me\. You're at (\d+) now\.” — Corvin$/,'“ทุกอาชีพเริ่มต้นที่ทุ่งหญ้า ถึงเลเวลอาชีพ 10 แล้วมาหาข้า ตอนนี้เจ้าอยู่ที่ $1” — Corvin'],
  [/^“A (.+), and a fine one\. At Job Level (\d+) I can test you for an advanced calling\. You're at (\d+) now\.” — Corvin$/,'“$1 ที่ยอดเยี่ยม เมื่อถึงเลเวลอาชีพ $2 ข้าจะทดสอบเจ้าเพื่ออาชีพขั้นสูง ตอนนี้เจ้าอยู่ที่ $3” — Corvin'],
  [/^“(.+)\. I remember when you couldn't hold a club straight\. The guild is proud of you\.” — Corvin$/,'“$1 ข้ายังจำได้ตอนที่เจ้าถือกระบองยังไม่ตรงเลย กิลด์ภูมิใจในตัวเจ้า” — Corvin'],
  [/^“You did it\. Now choose\. Like the first time, this is for life\.” — Corvin$/,'“เจ้าทำได้ ทีนี้เลือกเถิด เหมือนครั้งแรก นี่คือทางเลือกตลอดชีวิต” — Corvin'],
  [/^“Not finished yet\. Keep at it\.” — Corvin$/,'“ยังไม่เสร็จ พยายามต่อไป” — Corvin'],
  [/^“You're ready for the next step\. (.+)” — Corvin$/,(m,a)=>`“เจ้าพร้อมสำหรับขั้นต่อไปแล้ว ${thText(a)}” — Corvin`],
  [/^Rewards: ([\d,]+) EXP · ([\d,]+) job EXP · ([\d,]+) gold(.*)$/,'รางวัล: $1 EXP · $2 EXP อาชีพ · $3 โกลด์$4'],
  [/^Defeat ([\d]+) (.+)$/,'ปราบ $2 $1 ตัว'],[/^Defeat (.+) (\d+)\/(\d+)$/,'ปราบ $1 $2/$3'],[/^Bring (\d+) (.+)$/,'นำ $2 $1 ชิ้นมา'],[/^Reach (.+)$/,'ไปให้ถึง $1'],
  [/^Quest accepted: (.+)\.$/,(m,a)=>`รับเควสแล้ว: ${thText(a)}`],
  [/^Quest complete: (.+?)! ([\d,]+) EXP, ([\d,]+) gold(.*)$/,(m,a,b,c,d)=>`เควสสำเร็จ: ${thText(a)}! ${b} EXP, ${c} โกลด์${d}`],
  [/^Quest abandoned: (.+)\. You can pick it up again from (.+)\.$/,(m,a,b)=>`ยกเลิกเควส: ${thText(a)} รับใหม่ได้จาก ${b}`],
  [/^(.+) is ready\. Return to (.+)\.$/,(m,a,b)=>`${thText(a)} พร้อมแล้ว กลับไปหา ${b}`],
  [/^(Return to|Then talk to|Talk to) (.+?)\.?$/,(m,a,b)=>`${{'Return to':'กลับไปหา','Then talk to':'แล้วไปคุยกับ','Talk to':'คุยกับ'}[a]} ${b}`],
  [/^(.+): (\d+)\/(\d+) (.+)\.$/,(m,a,b,c,d)=>TH_QNAMES.has(a)?`${thText(a)}: ${b}/${c} ${d}`:m],
);
// when Thai is on, swap the quest data itself (names, offers, progress and completion lines)
document.addEventListener('DOMContentLoaded',()=>{if(LANG!=='th')return;
  if(typeof QUESTS!=='undefined')for(const id in QUESTS_TH){const q=QUESTS[id],t=QUESTS_TH[id];if(!q)continue;
    TH[q.name]=t.name;TH_QNAMES.add(t.name);q.name=t.name;if(t.offer)q.offer=t.offer;if(t.wait)q.wait=t.wait;if(t.done)q.done=t.done;}
  if(typeof greeting==='function'){const g=greeting;greeting=function(k){return GREET_TH[k]||GREET_TH._||g(k);};}
  if(typeof SERVICE!=='undefined')Object.assign(SERVICE,SERVICE_TH);
  if(typeof TRIALS!=='undefined')for(const k in TRIALS_TH)if(TRIALS[k])TRIALS[k].say=TRIALS_TH[k];},{once:true});

/* ---- NPC and building names in Thai (display only: the game still uses the English names inside) ---- */
const NPC_TH={'Elder Hollis':'ผู้เฒ่าฮอลลิส','Ilsa the Merchant':'แม่ค้าอิลซา','Guildmaster Corvin':'หัวหน้ากิลด์คอร์วิน','Sister Maren':'ซิสเตอร์มาเรน','Tobin the Wayfarer':'โทบิน นักเดินทาง',
  'Brannoc the Smith':'ช่างตีเหล็กแบรนน็อค','Wenna the Keeper':'เวนนา ผู้ดูแลคลัง','Arena Master Vexa':'นายสนามประลองเว็กซา','Lune the Stylist':'ช่างทำผมลูน','Festival Keeper Pim':'ผู้ดูแลเทศกาลพิม',
  'Keep Herald Orrin':'ผู้ประกาศปราการออร์ริน','Warden Pell':'ผู้พิทักษ์เพลล์','Ysolde the Tracker':'อิโซลด์ นักแกะรอย','Scout Kade':'หน่วยสอดแนมเคด','Merchant Tavi':'พ่อค้าทาวี',
  'Gemcutter Sela':'ช่างเจียระไนเซลา','Librarian Oren':'บรรณารักษ์โอเรน','Mentor Ansel':'อาจารย์แอนเซล','Banker Ivo':'นายธนาคารไอโว','Sister Ada':'ซิสเตอร์เอดา','Wayfarer Mira':'นักเดินทางมีรา',
  'Smith Garrow':'ช่างตีเหล็กแกร์โรว์','Seer Valen':'ผู้หยั่งรู้วาเลน',
  // buildings
  'General Store':'ร้านค้าทั่วไป','Guild Hall':'หอกิลด์','Chapel':'โบสถ์','Waystation':'สถานีเดินทาง','Smithy':'โรงตีเหล็ก','Warehouse':'โกดัง','Aurel Market':'ตลาดออเรล','Gemcutter':'ร้านเจียระไน',
  'Grand Library':'หอสมุดใหญ่','Hall of Callings':'หออาชีพ','Royal Bank':'ธนาคารหลวง','Chapel of Dawn':'โบสถ์แห่งรุ่งอรุณ','Grand Waystation':'สถานีเดินทางใหญ่','Forge Royal':'โรงตีเหล็กหลวง','The Grand Library':'หอสมุดใหญ่'};
// short names that appear inside sentences and quest lines (longest first so "Elder Hollis" wins over "Hollis")
const NPC_SHORT_TH=[['Elder Hollis','ผู้เฒ่าฮอลลิส'],['Warden Pell','ผู้พิทักษ์เพลล์'],['Scout Kade','หน่วยสอดแนมเคด'],['Sister Maren','ซิสเตอร์มาเรน'],['Hollis','ฮอลลิส'],['Brannoc','แบรนน็อค'],['Pell','เพลล์'],['Ysolde','อิโซลด์'],
  ['Kade','เคด'],['Corvin','คอร์วิน'],['Ilsa','อิลซา'],['Maren','มาเรน'],['Tobin','โทบิน'],['Wenna','เวนนา'],['Vexa','เว็กซา'],['Lune','ลูน'],['Pim','พิม'],['Orrin','ออร์ริน'],['Valen','วาเลน'],['Oren','โอเรน'],['Sela','เซลา'],['Tavi','ทาวี'],['Garrow','แกร์โรว์'],['Ansel','แอนเซล'],['Ivo','ไอโว']];
Object.assign(TH,NPC_TH);
// once a sentence has been put into Thai, swap the English NPC names inside it too
function thNames(s){if(!/[A-Z]/.test(s)||!/[฀-๿]/.test(s))return s;for(const [en,th] of NPC_SHORT_TH)if(s.includes(en))s=s.split(en).join(th);return s;}
if(LANG==='th'){const _t0=thText0;thText0=function(s){const r=_t0(s);return r===s?r:thNames(r);};
  // quest data was swapped to Thai already; give its names the same treatment
  document.addEventListener('DOMContentLoaded',()=>{if(typeof QUESTS==='undefined')return;for(const id in QUESTS){const q=QUESTS[id];if(!/[฀-๿]/.test(q.name))continue;
      q.offer=(q.offer||[]).map(thNames);if(q.wait)q.wait=thNames(q.wait);q.done=(q.done||[]).map(thNames);}
    for(const k in TRIALS_TH)if(typeof TRIALS!=='undefined'&&TRIALS[k])TRIALS[k].say=thNames(TRIALS[k].say);
    // building signs are drawn on the game itself: show their Thai name while drawing
    if(typeof drawBuilding==='function'){const _db=drawBuilding;drawBuilding=function(b){const en=b.name,th=NPC_TH[en];if(!th)return _db.apply(this,arguments);b.name=th;try{return _db.apply(this,arguments);}finally{b.name=en;}};}});}
// "Return to / Talk to <name>" lines and "X is ready. Return to <name>." keep the name pattern above; translate the name part
TH_PAT.unshift([/^(Return to|Then talk to|Talk to) (.+?)\.?$/,(m,a,b)=>`${{'Return to':'กลับไปหา','Then talk to':'แล้วไปคุยกับ','Talk to':'คุยกับ'}[a]} ${NPC_TH[b]||b}`]);

/* ---- the Guild Hall (Corvin): trials, hunting contracts, retraining and the calling descriptions ---- */
Object.assign(TH,{
  'Tap a picture to see it.':'แตะรูปเพื่อดูรายละเอียด','Advanced callings:':'อาชีพขั้นสูง:',
  'Take one contract at a time. It completes automatically wherever you are.':'รับสัญญาได้ทีละงาน งานจะสำเร็จเองไม่ว่าคุณจะอยู่ที่ไหน',
  'Contract abandoned.':'ยกเลิกสัญญาแล้ว','CONTRACT DONE':'สัญญาสำเร็จ','GUILD FOUNDED':'ก่อตั้งกิลด์แล้ว',
  'Retraining':'ฝึกใหม่','Reset stat points':'รีเซ็ตแต้มสถานะ','Reset skill points':'รีเซ็ตแต้มสกิล','Reset':'รีเซ็ต','Confirm':'ยืนยัน','click again to confirm':'กดอีกครั้งเพื่อยืนยัน',
  'Corvin undoes your training for free while Embervale is being tested, so try every build you like. You get every point back to spend again.':'ระหว่างที่ Embervale ยังอยู่ในช่วงทดสอบ คอร์วินล้างการฝึกให้ฟรี ลองทุกสายที่ชอบได้เลย คุณจะได้แต้มคืนทั้งหมดเพื่อลงใหม่',
  'Corvin can undo your training for a fee. You get every point back to spend again.':'คอร์วินล้างการฝึกให้ได้โดยเสียค่าธรรมเนียม คุณจะได้แต้มคืนทั้งหมดเพื่อลงใหม่',
  // first callings
  'Shield-wall fighter. The most HP, heavy melee hits and a spinning area attack.':'นักสู้กำแพงโล่ HP มากที่สุด ตีระยะประชิดหนัก และมีท่าหมุนโจมตีรอบตัว',
  'Ranged spellcaster. Fragile, but casts fire, frost and lightning from a distance.':'นักเวทระยะไกล ตัวบาง แต่ร่ายไฟ น้ำแข็ง และสายฟ้าได้จากที่ไกล',
  'Archer. Fast attacks from long range, scaling with DEX.':'นักธนู โจมตีเร็วจากระยะไกล แรงขึ้นตาม DEX',
  'Battle healer. Heals and buffs itself, and its holy Smite hits undead for double.':'นักบวชสายต่อสู้ รักษาและบัฟตัวเองได้ และ Smite ศักดิ์สิทธิ์ทำความเสียหายสองเท่าต่ออันเดด',
  // advanced callings
  'An immovable shield-bearer. Huge HP and DEF, stuns with the shield and draws every monster to itself.':'ผู้ถือโล่ที่ไม่มีวันขยับ HP และ DEF มหาศาล ใช้โล่ทำให้มึน และดึงมอนสเตอร์ทุกตัวเข้าหาตัว',
  'A reckless berserker. Trades defence for raw damage and shatters the ground around it.':'นักรบคลั่งไม่กลัวตาย แลกการป้องกันกับพลังทำลายล้าง และทุบพื้นรอบตัวให้แตก',
  'A master of the elements. Slow, devastating spells that hit whole packs at once.':'ปรมาจารย์แห่งธาตุ เวทช้าแต่ทำลายล้าง โจมตีมอนสเตอร์ทั้งฝูงพร้อมกัน',
  'A shadow mage. Curses foes, slows them to a crawl and drains their life to stay standing.':'จอมเวทเงา สาปศัตรู ทำให้ช้าลงจนแทบคลาน และดูดพลังชีวิตเพื่อยืนหยัดต่อ',
  'A patient marksman. Enormous single shots and the widest arrow storms.':'มือแม่นธนูผู้อดทน ยิงนัดเดียวแรงมหาศาล และพายุลูกธนูที่กว้างที่สุด',
  'A hunter of the deep woods. Venom, snares and speed keep monsters from ever reaching it.':'นักล่าแห่งป่าลึก พิษ กับดัก และความเร็ว ทำให้มอนสเตอร์เข้าไม่ถึงตัว',
  'A holy warrior. Fights up close with sacred strikes and a shield of light.':'นักรบศักดิ์สิทธิ์ สู้ระยะประชิดด้วยการโจมตีศักดิ์สิทธิ์และโล่แห่งแสง',
  'A seer of the light. The strongest healing and holy magic that scours undead.':'ผู้หยั่งรู้แห่งแสง การรักษาที่แรงที่สุด และเวทศักดิ์สิทธิ์ที่ชำระล้างอันเดด',
  'A rune-scribed knight. Fire, frost and storm ride along with every blow; INT makes the runes burn hotter.':'อัศวินผู้สลักรูน ไฟ น้ำแข็ง และพายุติดไปกับทุกการโจมตี INT ทำให้รูนลุกโชนยิ่งขึ้น',
  'A keeper of moments. Hastens itself, freezes foes in time and strikes twice in the same instant.':'ผู้เฝ้าห้วงเวลา เร่งตัวเอง หยุดเวลาของศัตรู และโจมตีสองครั้งในชั่วพริบตาเดียว',
  'Hunts with a falcon. The bird strikes on its own, dives on whole packs and joins your arrows.':'ล่าพร้อมเหยี่ยว นกโจมตีเองได้ โฉบลงใส่ทั้งฝูง และร่วมยิงไปกับลูกธนูของคุณ',
  'A fighting monk. Fast flurries up close, chi that burns and heals, and a body like iron.':'พระนักสู้ รัวหมัดเร็วในระยะประชิด ลมปราณที่ทั้งเผาและรักษา และร่างกายแกร่งดั่งเหล็ก',
  // master callings
  'The last wall. Shakes the earth to stun whole packs and shields the party behind a fortress of steel.':'กำแพงด่านสุดท้าย เขย่าแผ่นดินให้ทั้งฝูงมึน และปกป้องปาร์ตี้หลังป้อมเหล็ก',
  'War given a body. Blood-fuelled fury and blows that split the ground for a whole area.':'สงครามที่มีร่างกาย ความคลั่งจากเลือด และการโจมตีที่ผ่าแผ่นดินทั้งบริเวณ',
  'Commands the sky. Lances of thunder and meteors that wipe out entire packs.':'บัญชาท้องฟ้า หอกสายฟ้าและอุกกาบาตที่กวาดล้างทั้งฝูง',
  'Opens rifts into nothing. Drains life to stay standing and drags whole groups into the void.':'เปิดรอยแยกสู่ความว่างเปล่า ดูดพลังชีวิตเพื่อยืนหยัด และลากทั้งกลุ่มลงสู่ห้วงสุญญตา',
  'Never misses twice, because never misses. The strongest single shot and a sky full of arrows.':'ไม่เคยพลาดซ้ำ เพราะไม่เคยพลาดเลย ยิงนัดเดียวแรงที่สุด และฝนลูกธนูเต็มฟ้า',
  'Runs with the pack. A howl that speeds up the whole party and volleys that pin monsters down.':'วิ่งไปกับฝูง เสียงหอนที่เร่งทั้งปาร์ตี้ และห่าธนูที่ตรึงมอนสเตอร์ไว้กับที่',
  'Carries the sunrise into battle. Holy blows around it and a ward that guards every friend nearby.':'นำแสงอรุณเข้าสู่สนามรบ การโจมตีศักดิ์สิทธิ์รอบตัว และม่านปกป้องเพื่อนทุกคนที่อยู่ใกล้',
  'Reads the stars and calls them down. The greatest healing in Embervale, and falling stars for enemies.':'อ่านดวงดาวแล้วเรียกลงมา การรักษาที่ยิ่งใหญ่ที่สุดใน Embervale และดาวตกใส่ศัตรู',
  'Writes the runes of the world itself. Every swing is a storm of fire, frost and wind.':'จารึกรูนของโลกเอง ทุกการฟันคือพายุแห่งไฟ น้ำแข็ง และลม',
  'Holds the hours in one hand. Stops the world for a heartbeat and strikes in every moment at once.':'กุมกาลเวลาไว้ในมือเดียว หยุดโลกชั่วจังหวะหัวใจ และโจมตีในทุกห้วงขณะพร้อมกัน',
  'Rules the open sky. A storm of talons, and a falcon that never lets a target go.':'ครองท้องฟ้ากว้าง พายุกรงเล็บ และเหยี่ยวที่ไม่เคยปล่อยเป้าหมาย',
  'The still centre of the storm. Hundred-palm strikes, and a lotus that heals the whole body.':'ใจกลางที่สงบนิ่งของพายุ ฝ่ามือร้อยครั้ง และดอกบัวที่รักษาทั้งร่าง',
});
TH_PAT.unshift(
  [/^Trial of the (.+)$/,'บททดสอบ $1'],
  [/^Defeat (\d+) (.+), bring (\d+) (.+), pay ([\d,]+) gold\.$/,'ปราบ $2 $1 ตัว นำ $4 $3 ชิ้นมา และจ่าย $5 โกลด์'],
  [/^Progress (\d+)\/(\d+)$/,'ความคืบหน้า $1/$2'],
  [/^Reward ([\d,]+) EXP, ([\d,]+) job EXP, ([\d,]+) gold$/,'รางวัล $1 EXP, $2 EXP อาชีพ, $3 โกลด์'],
  [/^Reward ([\d,]+) EXP, ([\d,]+) gold$/,'รางวัล $1 EXP, $2 โกลด์'],
  [/^Starts with: (.+)$/,'เริ่มต้นพร้อม: $1'],[/^New skills: (.+)$/,'สกิลใหม่: $1'],[/^Become a (.+)$/,'เป็น $1'],
  [/^Gives back (\d+) points?( ·)?$/,'คืนให้ $1 แต้ม$2'],
  [/^Trial accepted: defeat (\d+) (.+) and bring (\d+) (.+)\.$/,'รับบททดสอบแล้ว: ปราบ $2 $1 ตัว และนำ $4 $3 ชิ้นมา'],
  [/^Trial: all (\d+) (.+) defeated\. Bring (\d+) (.+) back to Guildmaster Corvin\.$/,'บททดสอบ: ปราบ $2 ครบ $1 ตัวแล้ว นำ $4 $3 ชิ้นกลับไปให้หัวหน้ากิลด์คอร์วิน'],
  [/^Trial: (\d+)\/(\d+) (.+)\.$/,'บททดสอบ: $3 $1/$2'],
  [/^Ascension trial accepted: defeat (\d+) (.+) and bring (\d+) (.+) to Seer Valen\.$/,'รับบททดสอบแห่งการเลื่อนขั้นแล้ว: ปราบ $2 $1 ตัว และนำ $4 $3 ชิ้นไปให้ผู้หยั่งรู้วาเลน'],
  [/^You are a (.+)\. The stars remember your name\.$/,'คุณคือ $1 ดวงดาวจดจำชื่อของคุณ'],
  [/^Contract accepted: defeat (\d+) (.+)\.$/,'รับสัญญาแล้ว: ปราบ $2 $1 ตัว'],
  [/^Contract complete: (\d+) (.+)\. Reward: ([\d,]+) EXP, ([\d,]+) gold\.$/,'สัญญาสำเร็จ: $2 $1 ตัว รางวัล: $3 EXP, $4 โกลด์'],
  [/^You are now a (.+)! You keep all your skills\. New ones are waiting in the skill tree \(K\): (.+)\.$/,'ตอนนี้คุณเป็น $1 แล้ว! สกิลเดิมยังอยู่ครบ สกิลใหม่รออยู่ในต้นไม้สกิล (K): $2'],
  [/^Your stats are reset\. (\d+) stat points to spend again \(C\)\.$/,'รีเซ็ตสถานะแล้ว ได้แต้มสถานะคืน $1 แต้ม (C)'],
  [/^Your skills are reset\. (\d+) skill points to spend again \(K\)\.$/,'รีเซ็ตสกิลแล้ว ได้แต้มสกิลคืน $1 แต้ม (K)'],
);

/* ---- every other building: store, smithy, warehouse, waystation (bunks, stable), arena, stylist, festival, Emberkeep,
   gemcutter, library and the Hall of Callings ---- */
Object.assign(TH,{
  // store and gear lines
  'Sell all monster loot':'ขายของจากมอนสเตอร์ทั้งหมด','Slots: empty':'ช่อง: ว่าง','Uncommon':'ไม่ธรรมดา','Rare':'หายาก','Epic':'มหากาพย์','Legendary':'ตำนาน',
  'You have:':'คุณมี:','Refine gear with Brannoc the Smith in Hearthvale.':'ตีบวกอุปกรณ์ได้ที่ช่างตีเหล็กแบรนน็อคใน Hearthvale','head':'หัว','face':'หน้า','mouth':'ปาก','weapon':'อาวุธ','armor':'ชุดเกราะ','accessory':'เครื่องประดับ','Empty':'ว่าง','Sigil slots':'ช่องซิกิล','Use':'ใช้','Etc':'อื่นๆ',
  // smithy
  '⚒ Forge gear from monster materials':'⚒ ตีอุปกรณ์จากวัตถุดิบมอนสเตอร์','Refine':'ตีบวก','Sure?':'แน่ใจ?','Fully refined.':'ตีบวกเต็มแล้ว','breaks on failure':'พังถ้าล้มเหลว',
  'You have no gear to refine.':'คุณไม่มีอุปกรณ์ให้ตีบวก','equipped':'สวมอยู่','in bag':'ในกระเป๋า',
  // warehouse and pushcart
  'Nothing stored yet.':'ยังไม่มีของในคลัง','Take':'เอาออก','Empty.':'ว่าง',
  // waystation: bunks and stable
  'Bunk room':'ห้องพัก','Rent a bunk':'เช่าเตียง','Rest':'พัก','Travel':'เดินทาง','Stable':'คอกสัตว์','Well rested':'พักผ่อนเต็มที่',
  'Full HP and SP, and you wake':'HP และ SP เต็ม และตื่นมาแบบ',
  '“A good mount saves a lot of boot leather. Press R to ride; you\'ll hop off when you fight.”':'“สัตว์พาหนะดีๆ ช่วยประหยัดพื้นรองเท้าได้เยอะ กด R เพื่อขี่ แล้วจะลงเองเมื่อต่อสู้”',
  'You are riding it.':'คุณกำลังขี่อยู่','Yours.':'ของคุณ','Buy':'ซื้อ','Ride':'ขี่','Get off':'ลง',
  // arena
  'Ranked fights against other players. Fall to 1 HP and you\'re out; the last team standing wins. Nobody dies or loses EXP. Leaving the arena during a match counts as a loss.':'การต่อสู้จัดอันดับกับผู้เล่นคนอื่น เหลือ 1 HP ก็ตกรอบ ทีมสุดท้ายที่ยังยืนอยู่ชนะ ไม่มีใครตายหรือเสีย EXP ออกจากสนามระหว่างแมตช์นับเป็นแพ้',
  'Ranked matches need an account so your rating is kept. Log in or sign up from the title screen. You can still visit the arena and watch.':'แมตช์จัดอันดับต้องมีบัญชีเพื่อเก็บคะแนน เข้าสู่ระบบหรือสมัครจากหน้าแรก แต่ยังเข้าไปดูในสนามได้',
  'Visit the arena':'ไปที่สนามประลอง','Back to Hearthvale':'กลับ Hearthvale','Find a match':'หาแมตช์','Join queue':'เข้าคิว','Leave queue':'ออกจากคิว','Top 20':'20 อันดับแรก',
  'rating':'คะแนน','wins':'ชนะ','losses':'แพ้','draws':'เสมอ','Name':'ชื่อ','Rating':'คะแนน','Loading…':'กำลังโหลด…',
  'Just you against one opponent.':'คุณคนเดียวกับคู่ต่อสู้หนึ่งคน','You will queue alone; your party stays as it is.':'คุณจะเข้าคิวคนเดียว ปาร์ตี้ยังอยู่เหมือนเดิม',
  'You and your partner against another pair.':'คุณกับคู่หูเจออีกคู่หนึ่ง','Needs a party of exactly two; the leader joins for both.':'ต้องมีปาร์ตี้สองคนพอดี หัวหน้าปาร์ตี้เข้าคิวให้ทั้งคู่',
  'No ranked matches yet. Be the first!':'ยังไม่มีแมตช์จัดอันดับ มาเป็นคนแรกสิ!',
  // stylist
  'Pick something new first':'เลือกอะไรใหม่ก่อน','Back to my current look':'กลับไปลุคปัจจุบัน','Hairstyle':'ทรงผม','Hair colour':'สีผม','Eye colour':'สีตา','Skin tone':'สีผิว','Preview of your new look':'ตัวอย่างลุคใหม่ของคุณ',
  // festival
  'Monsters drop them 12% of the time during the festival; bosses always drop 3.':'ช่วงเทศกาลมอนสเตอร์ดรอป 12% และบอสดรอป 3 ชิ้นเสมอ',
  'all of February':'ตลอดเดือนกุมภาพันธ์','April 10 – 20':'10 – 20 เมษายน','all of October':'ตลอดเดือนตุลาคม','all of November':'ตลอดเดือนพฤศจิกายน','all of December':'ตลอดเดือนธันวาคม',
  // Emberkeep
  'Nobody holds Emberkeep yet.':'ยังไม่มีใครครอง Emberkeep','Go to Emberkeep':'ไปที่ Emberkeep','No guild has reached the ring yet.':'ยังไม่มีกิลด์ไหนเข้าถึงวงแหวน',
  'Only guild members can capture the crystal or fight in the war. You can still go and watch.':'เฉพาะสมาชิกกิลด์เท่านั้นที่ยึดคริสตัลหรือร่วมสงครามได้ แต่ยังไปดูได้',
  'Guild':'กิลด์','Points':'แต้ม','(your guild!)':'(กิลด์ของคุณ!)','Held by':'ครองโดย',
  // gemcutter
  '"Every blade has a voice it hasn\'t used yet. Let me wake it. If you don\'t like what it says, I\'ll put it back to sleep and you keep the old one."':'"อาวุธทุกชิ้นมีเสียงที่ยังไม่เคยเปล่ง ให้ข้าปลุกมัน ถ้าเจ้าไม่ชอบสิ่งที่มันพูด ข้าจะให้มันหลับต่อ แล้วเจ้าเก็บอันเดิมไว้"',
  '"Three sigils into one. The stone decides what it becomes, but now and then it comes out Radiant, and nobody else in Embervale can make those."':'"ซิกิลสามอันรวมเป็นหนึ่ง หินเป็นผู้ตัดสินว่ามันจะกลายเป็นอะไร แต่บางครั้งก็ออกมาเป็นเรเดียนต์ ซึ่งไม่มีใครใน Embervale ทำได้นอกจากที่นี่"',
  'Cut':'เจาะ','You have no gear that can take a slot.':'คุณไม่มีอุปกรณ์ที่เจาะช่องได้',
  // library
  '"Every sigil ever pressed from a monster\'s essence is catalogued here: what it grants, which gear it suits and who drops it." — Oren':'"ซิกิลทุกอันที่เคยกลั่นจากแก่นของมอนสเตอร์ถูกบันทึกไว้ที่นี่: ให้อะไร เหมาะกับอุปกรณ์แบบไหน และใครดรอป" — Oren',
  '"Every blade, robe and trinket worth owning, and where to find it: which creatures carry it and how often, what Ilsa sells, what Brannoc can forge." — Oren':'"อาวุธ เสื้อคลุม และเครื่องประดับทุกชิ้นที่ควรมี และหาได้จากที่ไหน: สัตว์ตัวไหนพกมาและบ่อยแค่ไหน Ilsa ขายอะไร Brannoc ตีอะไรได้" — Oren',
  'No sigil slots':'ไม่มีช่องซิกิล','Bestiary':'สารานุกรมมอนสเตอร์','Sigils':'ซิกิล','Equipment':'อุปกรณ์','Ability':'ความสามารถ','Sort':'เรียง','Source':'แหล่งที่มา','Slot':'ช่อง','All':'ทั้งหมด',
  'Max HP':'HP สูงสุด','Max SP':'SP สูงสุด','Max HP %':'HP สูงสุด %',
  // Hall of Callings: rebirth
  'The rite of rebirth':'พิธีเกิดใหม่','You go back to':'คุณจะกลับไปที่','base level 1, stats reset':'เลเวลฐาน 1 รีเซ็ตสถานะ','You keep':'สิ่งที่เก็บไว้',
  'calling, skills, job level, gear, gold left':'อาชีพ สกิล เลเวลอาชีพ อุปกรณ์ และโกลด์ที่เหลือ','You start with':'เริ่มต้นด้วย','Every level':'ทุกเลเวล','+1 extra stat point':'แต้มสถานะเพิ่ม +1',
  'For good':'ถาวร','+25% Max HP and SP, a golden aura':'HP และ SP สูงสุด +25% และออร่าสีทอง','Earn an advanced calling first.':'ได้อาชีพขั้นสูงก่อน',
  'You have already been reborn.':'คุณเกิดใหม่แล้ว','Be reborn':'เกิดใหม่','You are Reborn. Valen bows to you.':'คุณเป็นผู้เกิดใหม่แล้ว วาเลนโค้งให้คุณ',
});
TH_PAT.unshift(
  [/^(Lv \d+(?:–\d+|\+)) · (.+)$/,(m,a,b)=>{const t=b.split(' · ').map(x=>({'not visited yet':'ยังไม่เคยไป','boss':'บอส'}[x]||x.replace(/^World boss: /,'บอสโลก: '))).join(' · ');return t===b?m:`${a} · ${t}`;}],
  [/^Capital city · not visited yet$/,'เมืองหลวง · ยังไม่เคยไป'],[/^Capital city$/,'เมืองหลวง'],
  [/^: \+(\d+)% EXP and job EXP for (\d+) minutes$/,': EXP และ EXP อาชีพ +$1% เป็นเวลา $2 นาที'],[/^([\dhms: ]+) left$/,'เหลือ $1'],
  [/^Needs base level (\d+)$/,'ต้องมีเลเวลฐาน $1'],[/^· Lv (\d+)\+ · \+(\d+)% speed$/,'· Lv $1+ · ความเร็ว +$2%'],
  [/^To \+(\d+): (\d+)%( ·)?$/,'ตีบวกเป็น +$1: $2%$3'],
  [/^(equipped|in bag) · (\d+) slots? → (\d+) · (\d+)%$/,(m,w,a,b,c)=>`${w==='equipped'?'สวมอยู่':'ในกระเป๋า'} · ${a} ช่อง → ${b} · ${c}%`],
  [/^(equipped|in bag) · already has 4 slots$/,(m,w)=>`${w==='equipped'?'สวมอยู่':'ในกระเป๋า'} · มีครบ 4 ช่องแล้ว`],
  [/^(equipped|in bag) ·$/,(m,w)=>`${w==='equipped'?'สวมอยู่':'ในกระเป๋า'} ·`],[/^(equipped|in bag) · not awakened$/,(m,w)=>`${w==='equipped'?'สวมอยู่':'ในกระเป๋า'} · ยังไม่ปลุกพลัง`],
  [/^Fuse \(([\d,]+) gold\)$/,'หลอม ($1 โกลด์)'],
  [/^([\d,]+) gold · lines: Faint, Bright, Radiant \(rare, the top value\)$/,'$1 โกลด์ · ระดับ: จาง สว่าง เรเดียนต์ (หายาก ค่าสูงสุด)'],
  [/^Storage (\d+)\/(\d+) · Weight ([\d,]+)\/([\d,]+)$/,'คลัง $1/$2 · น้ำหนัก $3/$4'],
  [/^A second load that rolls along behind you: (\d+) stacks, ([\d,]+) weight, usable anywhere\. Yours to keep\.$/,'สัมภาระชุดที่สองที่เข็นตามหลังคุณ: $1 ช่อง น้ำหนัก $2 ใช้ได้ทุกที่ เป็นของคุณตลอดไป'],
  [/^(\d+)\/(\d+) stacks · ([\d,]+)\/([\d,]+) weight$/,'$1/$2 ช่อง · น้ำหนัก $3/$4'],
  [/^Cart (\d+)\/(\d+) · cart weight ([\d,]+)\/([\d,]+) · bag ([\d,]+)\/([\d,]+)$/,'รถเข็น $1/$2 · น้ำหนักรถเข็น $3/$4 · กระเป๋า $5/$6'],
  [/^You don't have a pushcart\. (.+) rent them out for ([\d,]+) gold\.$/,'คุณยังไม่มีรถเข็น เช่าได้จาก Wenna ใน Hearthvale หรือ Ivo ใน Aurelmark ราคา $2 โกลด์'],
  [/^You are in a (.+) match\.$/,'คุณอยู่ในแมตช์ $1'],[/^Waiting for a (.+) opponent…$/,'กำลังรอคู่ต่อสู้ $1…'],
  [/^Every evening at 20:00 \(Thailand time\) guilds fight for the Ember Crystal for (\d+) minutes\. A guild that stands alone in the golden ring for (\d+) seconds takes the crystal, and the guild holding it scores a point every second\. Rival guilds in the ring stop a capture\. The guild with the most points owns Emberkeep until the next war, and its members get \+10% EXP\.$/,
    'ทุกเย็นเวลา 20:00 (เวลาไทย) กิลด์ต่างๆ จะชิง Ember Crystal กันเป็นเวลา $1 นาที กิลด์ที่ยืนอยู่ในวงแหวนทองลำพังครบ $2 วินาทีจะยึดคริสตัลได้ และกิลด์ที่ครองอยู่ได้แต้มทุกวินาที กิลด์คู่แข่งในวงแหวนจะหยุดการยึด กิลด์ที่ได้แต้มมากที่สุดครอง Emberkeep จนถึงสงครามครั้งถัดไป และสมาชิกได้ EXP +10%'],
  [/^The next war starts (.+)\.$/,(m,a)=>`สงครามครั้งถัดไปเริ่ม${a==='every evening at 20:00 (Thailand time)'?'ทุกเย็นเวลา 20:00 (เวลาไทย)':a==='starting now'?'แล้ว':a.replace(/^in (\d+) minutes?$/,'ในอีก $1 นาที').replace(/^at (.+?)( tomorrow)?$/,(x,t,tm)=>`เวลา ${t}${tm?' พรุ่งนี้':''}`)}`],
  [/^The war is on · (.+) left$/,'สงครามกำลังดำเนินอยู่ · เหลือ $1'],
  [/^You fight for (.+?)\. During the war, .+$/,(m,a)=>`คุณสู้ในนาม ${a} ระหว่างสงคราม สมาชิกกิลด์อื่นใน keep โจมตีคุณได้และคุณก็โจมตีเขาได้ ถ้าเหลือ 1 HP คุณจะถูกส่งกลับไปที่ประตู`],
  [/^You fight for$/,'คุณสู้ในนาม'],[/^\. During the war, members of other guilds in the keep can attack you and you them; if you fall to 1 HP you are sent back to the gate\.$/,' ระหว่างสงคราม สมาชิกกิลด์อื่นใน keep โจมตีคุณได้และคุณก็โจมตีเขาได้ ถ้าเหลือ 1 HP คุณจะถูกส่งกลับไปที่ประตู'],
  [/^Prize: (.+)$/,'รางวัล: $1'],[/^(.+) · on now$/,(m,a)=>`${a} · กำลังจัดอยู่`],
  [/^(\d+) sigils known · you have (\d+) of them\.$/,'รู้จักซิกิล $1 แบบ · คุณมี $2 แบบ'],
  [/^Bestiary: (\d+) of (\d+) monsters recorded\.$/,'สารานุกรม: บันทึกมอนสเตอร์แล้ว $1 จาก $2 ชนิด'],
  [/^(\d+) pieces of equipment · (\d+) drop from monsters\.$/,'อุปกรณ์ $1 ชิ้น · ดรอปจากมอนสเตอร์ $2 ชิ้น'],
  [/^From monsters: (\d+)–(\d+) slots \(usually (\d+)\)$/,'จากมอนสเตอร์: $1–$2 ช่อง (ปกติ $3)'],[/^(\d+) sigil slots?$/,'ช่องซิกิล $1 ช่อง'],
  [/^You have (\d+)$/,'คุณมี $1'],
  [/^From (.+?) · Lv (\d+)(.*) · ([\d.]+%) drop(?: · ([\d,]+) defeated)?$/,(m,a,b,c,d,e)=>`จาก ${a} · Lv ${b}${c.replace(' · boss',' · บอส')} · ดรอป ${d}${e?` · ปราบแล้ว ${e}`:''}`],
  [/^Needs base level (\d+)\+, an advanced calling at job level 50, and ([\d,]+) gold\.$/,'ต้องมีเลเวลฐาน $1+ อาชีพขั้นสูงเลเวลอาชีพ 50 และ $2 โกลด์'],
  [/^(\d+) stat points$/,'แต้มสถานะ $1 แต้ม'],
  [/^Reach base level (\d+)( again)? first \(you are (\d+)\)\.$/,(m,a,g,b)=>`ไปให้ถึงเลเวลฐาน ${a}${g?' อีกครั้ง':''} ก่อน (ตอนนี้ ${b})`],
  [/^Reach job level (\d+) first \(you are (\d+)\)\.$/,'ไปให้ถึงเลเวลอาชีพ $1 ก่อน (ตอนนี้ $2)'],
  [/^A (.+) cannot use (.+)s\.$/,'$1 ใช้ $2 ไม่ได้'],[/^base level (\d+)\.$/,'ต้องมีเลเวลฐาน $1'],[/^Requires base level (\d+)\.$/,'ต้องมีเลเวลฐาน $1'],
);
// gear lines are built from parts ("ATK 22 · Lv 6+ · club · Slots: empty"): put each part into Thai, but only when every part is known
const TH_WT={sword:'ดาบ',club:'กระบอง',axe:'ขวาน',wand:'คทา',bow:'ธนู',mace:'ตะบอง',dagger:'มีดสั้น',staff:'ไม้เท้า',spear:'หอก',fist:'สนับมือ',knuckle:'สนับมือ',book:'หนังสือ',instrument:'เครื่องดนตรี'};
const TH_STATK=/^(ATK|MATK|DEF|STR|AGI|VIT|INT|DEX|LUK|CRIT|FLEE|HIT|ASPD|Max HP|Max SP|HP regen|SP regen|MDEF)( [+-]?\d+%?)$/;
function thGearPart(p){if(!p)return '';if(TH_STATK.test(p))return p.replace('Max HP','HP สูงสุด').replace('Max SP','SP สูงสุด').replace('HP regen','ฟื้น HP').replace('SP regen','ฟื้น SP');
  if(/^Lv \d+\+$/.test(p))return p;if(TH_WT[p])return TH_WT[p];if(TH[p]&&/[฀-๿]/.test(TH[p]))return TH[p];
  if(/^Slots: /.test(p))return 'ช่อง: '+p.slice(7).split(', ').map(x=>x==='empty'?'ว่าง':x).join(', ');
  if(/ \(refine\)$/.test(p))return p.replace(' (refine)',' (ตีบวก)');return null;}
TH_PAT.push([/^.+ · .+$/,m=>{const parts=m.replace(/ ·$/,'').split(' · '),out=parts.map(thGearPart);return out.every(x=>x!==null)?out.join(' · ')+(/ ·$/.test(m)?' ·':''):m;}]);
// stat bonus lists ("+80 Max HP, Healing +5%", "Attack speed +3%"): each part into Thai when every part is known
const TH_BONUS={'Attack speed':'ความเร็วโจมตี','Cast time':'เวลาร่าย','Crit damage':'ความเสียหายคริติคอล','Double attack':'โจมตีสองครั้ง','Damage taken':'ความเสียหายที่ได้รับ','Healing':'การรักษา','SP regen':'ฟื้น SP','HP regen':'ฟื้น HP','Max HP':'HP สูงสุด','Max SP':'SP สูงสุด'};
const thStatName=n=>TH_BONUS[n]||(/^[A-Z]{2,5}$/.test(n)?n:null);
function thBonusPart(p){let m=p.match(/^\+(\d+%?) (.+)$/);if(m){const n=thStatName(m[2]);return n?`+${m[1]} ${n}`:null;}
  m=p.match(/^(.+?) ([+−-]?\d[\d.]*%?(?:\/s)?)$/);if(m){const n=thStatName(m[1]);return n?`${n} ${m[2]}`:null;}return null;}
TH_PAT.push([/^[^,]+(?:, [^,]+)*,?$/,m=>{const end=/,$/.test(m),parts=m.replace(/,$/,'').split(', '),out=parts.map(thBonusPart);return out.every(x=>x)?out.join(', ')+(end?',':''):m;}]);
