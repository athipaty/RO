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
