"use strict";
/* ================= first-job stories: every calling is earned through a short story =================
   At Job Level 10 a Novice no longer just picks a job at Guildmaster Corvin: Corvin offers five stories (Warden,
   Arcanist, Ranger, Cleric, Shade), three chapters each, about 10-15 minutes. They are ordinary quests (js/quests.js:
   dialogue, quest log, tracker, goal arrow) with three new kinds of step:
     {talk:'npc', line}        talk to someone (they tell you something; service NPCs too)
     {spot:'id', zone, ...}    a marked place on the map: tap it and walk there (look, mend a fence, wake a rune stone
                               in order, follow tracks one by one, tend a wounded farmer for 8 SP)
     {duel:'id', zone, ...}    a timing duel at a marked place: stop the marker in the zone 3 times before 3 misses
   Places are given as an offset in tiles from the region's arrival point, from a person (near:'npc') or from a gate
   (near:'gate:meadow'), and land on the nearest open ground. Progress is saved on the quest (QS().active[id].s).
   Since v1.17.0 they take place on Windwhistle Heights (north gate) and Willowmere Farms (south gate), with Shepherd
   Alda, Farmer Tamsin and Odo the Ferryman. Only one story can be in progress at a time; abandoning it lets you pick another. Finishing the last chapter makes
   you that job (becomeJob in js/ui.js). Loaded after js/callings.js. */
const TH_ON=typeof LANG!=='undefined'&&LANG==='th';
const JS_L=(en,th)=>TH_ON&&th?th:en;

/* ---- the people of the stories ---- */
Object.assign(QNPC,{
  brega:{name:'Captain Brega',zone:'town',tx:35.5,ty:6,col:'#8a3a2a',hair:'#c8b8a0'},
  ondine:{name:'Magister Ondine',zone:'town',tx:15,ty:25,col:'#4a5ab0',hair:'#e8e0f0'},
  nyx:{name:'Nyx of the Veil',zone:'town',tx:3.6,ty:26.3,col:'#3a3450',hair:'#1e1a28'},
  // v1.17.0 the regions by the north and south gates
  alda:{name:'Shepherd Alda',zone:'heights',dx:4,dy:-3,col:'#8a7a5a',hair:'#d8d0c0'},
  tamsin:{name:'Farmer Tamsin',zone:'farms',dx:-4,dy:3,col:'#6a8a3a',hair:'#c8783a'},
  odo:{name:'Odo the Ferryman',zone:'farms',dx:-2,dy:16,col:'#4a6a8a',hair:'#5a4a3a'}});
for(const k of ['brega','ondine','nyx','alda','tamsin','odo'])NPC_KEY[QNPC[k].name]=k;
if(typeof NPC_TH!=='undefined'){Object.assign(NPC_TH,{'Captain Brega':'กัปตันเบรกา','Magister Ondine':'จอมเวทออนดีน','Nyx of the Veil':'นิกซ์แห่งม่านเงา','Shepherd Alda':'คนเลี้ยงแกะอัลดา','Farmer Tamsin':'ชาวไร่แทมซิน','Odo the Ferryman':'โอโด คนแจวเรือ'});
  if(typeof TH!=='undefined')Object.assign(TH,{'Captain Brega':'กัปตันเบรกา','Magister Ondine':'จอมเวทออนดีน','Nyx of the Veil':'นิกซ์แห่งม่านเงา','Shepherd Alda':'คนเลี้ยงแกะอัลดา','Farmer Tamsin':'ชาวไร่แทมซิน','Odo the Ferryman':'โอโด คนแจวเรือ'});}
if(typeof NPC_SHORT_TH!=='undefined')NPC_SHORT_TH.unshift(['Captain Brega','กัปตันเบรกา'],['Magister Ondine','จอมเวทออนดีน'],['Nyx of the Veil','นิกซ์แห่งม่านเงา'],
  ['Shepherd Alda','คนเลี้ยงแกะอัลดา'],['Farmer Tamsin','ชาวไร่แทมซิน'],['Odo the Ferryman','โอโด คนแจวเรือ'],['Alda','อัลดา'],['Tamsin','แทมซิน'],['Odo','โอโด'],['Brega','เบรกา'],['Ondine','ออนดีน'],['Nyx','นิกซ์'],['Vesk','เวสก์'],['Bram','แบรม']);
{const _gr=greeting;greeting=function(k){const g={brega:JS_L('Feet apart, shield up. Always.','ยืนให้มั่น ยกโล่ขึ้น เสมอ'),ondine:JS_L('Mind the books. Some of them bite.','ระวังหนังสือด้วย บางเล่มกัดได้'),
  nyx:JS_L('You didn\'t see me. Nobody does.','เจ้าไม่เห็นข้าหรอก ไม่มีใครเห็น'),
  alda:JS_L('Mind the rams. They don\'t mean harm, but they don\'t look where they\'re going.','ระวังพวกแกะเขาด้วย มันไม่ได้คิดร้าย แต่มันไม่ดูทางเลย'),
  tamsin:JS_L('Turnips this big, and they get up and walk off. Farming used to be easier.','หัวผักกาดใหญ่ขนาดนี้ แล้วมันก็ลุกเดินหนีไปเอง ทำไร่สมัยก่อนง่ายกว่านี้'),
  odo:JS_L('Across the river? Not today, the reeds are snapping.','ข้ามแม่น้ำงั้นรึ? วันนี้ไม่ไหว พวกในดงกกกำลังงับ')}[k];return g||_gr.apply(this,arguments);};}

/* ---- the stories ---- */
const R1={exp:200,jexp:0,gold:100},R2={exp:500,jexp:0,gold:200,items:[['red',5]]},R3={exp:800,jexp:0,gold:300,items:[['orange',3]]};
const JOB_STORY={
  // ---------------- Warden ----------------
  ws1:{job:'warden',name:'The Shield Oath',th:'คำสาบานแห่งโล่',from:'corvin',to:'brega',lv:1,obj:[],reward:R1,
    offer:['So you would stand in front when everyone else steps back?','Then Captain Brega is the one to see. She trains every Warden in Hearthvale. You\'ll find her near the east side of town.'],
    offerTh:['เจ้าอยากยืนอยู่หน้าสุด ตอนที่คนอื่นถอยหลังงั้นรึ?','ถ้าอย่างนั้นไปหากัปตันเบรกา นางฝึกผู้พิทักษ์ทุกคนในเฮิร์ธเวล หานางได้ทางฝั่งตะวันออกของเมือง'],
    wait:'Captain Brega stands on the east side of Hearthvale.',waitTh:'กัปตันเบรกายืนอยู่ฝั่งตะวันออกของเฮิร์ธเวล',
    done:['Corvin sent you? Hm. You\'re smaller than I hoped.','But size isn\'t what makes a Warden. Let\'s see what you\'re made of.'],
    doneTh:['คอร์วินส่งเจ้ามางั้นรึ? หืม ตัวเล็กกว่าที่คิดไว้','แต่ขนาดตัวไม่ได้ทำให้ใครเป็นผู้พิทักษ์ มาดูกันว่าเจ้าทำจากอะไร']},
  ws2:{job:'warden',name:'The Broken Fence',th:'รั้วที่พังทลาย',from:'brega',to:'brega',lv:1,after:'ws1',reward:R2,
    obj:[{talk:'tamsin',text:'Ask Farmer Tamsin where the fence broke',th:'ถามชาวไร่แทมซินว่ารั้วพังตรงไหน',line:'Two posts, down by my turnip rows. And the turnips… well, you\'ll see. They walk now.',lineTh:'เสาสองต้น ข้างแปลงหัวผักกาดของข้า แล้วพวกหัวผักกาด… เดี๋ยวก็เห็น ตอนนี้มันเดินได้แล้ว'},
      {kill:'turnipsprite',n:6},
      {spot:'fenceA',zone:'farms',dx:-7,dy:5,art:'fence',text:'Mend the north fence post',th:'ซ่อมเสารั้วด้านเหนือ',say:'You drive the post back into the ground. It holds.',sayTh:'คุณตอกเสากลับลงดิน มันตั้งมั่นแล้ว'},
      {spot:'fenceB',zone:'farms',dx:-10,dy:9,art:'fence',text:'Mend the south fence post',th:'ซ่อมเสารั้วด้านใต้',say:'You lash the rail back in place. The fence is whole again.',sayTh:'คุณมัดราวรั้วกลับเข้าที่ รั้วกลับมาสมบูรณ์อีกครั้ง'}],
    offer:['Farmer Tamsin\'s fence at Willowmere Farms, out the south gate, keeps the field monsters off her crops. Last night they smashed right through it.','Talk to Tamsin, drive the Turnip Sprites back, then mend the two broken posts. A Warden protects first and fights second.'],
    offerTh:['รั้วของชาวไร่แทมซินที่ไร่วิลโลว์เมียร์ ออกประตูใต้ไป ใช้กันมอนสเตอร์ไม่ให้เข้าไร่ เมื่อคืนพวกมันพังทะลุเข้ามา','คุยกับแทมซิน ไล่เทอร์นิปสไปรต์ออกไป แล้วซ่อมเสารั้วที่พังทั้งสองต้น ผู้พิทักษ์ต้องปกป้องก่อน แล้วค่อยสู้'],
    wait:'Talk to Tamsin, drive back 6 Turnip Sprites and mend both fence posts at Willowmere Farms (south gate).',waitTh:'คุยกับแทมซิน ไล่เทอร์นิปสไปรต์ 6 ตัว และซ่อมเสารั้วทั้งสองต้นที่ไร่วิลโลว์เมียร์ (ประตูใต้)',
    done:['Tamsin came running to tell me. Not one turnip got through after you.','Good. There\'s one thing left.'],
    doneTh:['แทมซินวิ่งมาบอกข้า หลังจากเจ้าไป ไม่มีหัวผักกาดตัวไหนผ่านเข้ามาได้เลย','ดีมาก เหลืออีกอย่างเดียว']},
  ws3:{job:'warden',name:'Hold the Line',th:'ยืนหยัดไม่ถอย',from:'brega',to:'brega',lv:1,after:'ws2',reward:R3,grant:'warden',
    obj:[{duel:'bregaduel',zone:'town',near:'brega',dx:1,dy:1,art:'dummy',hits:3,text:'Block Brega\'s strikes at the training post',th:'รับดาบของเบรกาที่หลักฝึก',
      name:'Hold the shield',nameTh:'ยกโล่รับไว้',win:'Brega lowers her sword and nods.',winTh:'เบรกาลดดาบลงแล้วพยักหน้า'}],
    offer:['A Warden\'s shield doesn\'t move. Not for a Hopper, not for a troll, not for me.','Stand at the training post and hold your shield while I strike. Three clean blocks and we\'re done.'],
    offerTh:['โล่ของผู้พิทักษ์ไม่ขยับ ไม่ว่าจะเป็นฮอปเปอร์ โทรลล์ หรือข้าเองก็ตาม','ไปยืนที่หลักฝึกแล้วยกโล่รับดาบข้า รับให้ได้สามครั้งแล้วเราจะจบกัน'],
    wait:'Block three of Brega\'s strikes at the training post next to her.',waitTh:'รับดาบของเบรกาให้ได้สามครั้งที่หลักฝึกข้างนาง',
    done:['Good. Kneel.','By the steel of Hearthvale, rise a Warden. Your shield belongs to the people behind you now.'],
    doneTh:['ดี คุกเข่าลง','ด้วยเหล็กกล้าแห่งเฮิร์ธเวล จงลุกขึ้นในฐานะผู้พิทักษ์ โล่ของเจ้าเป็นของผู้คนที่อยู่ข้างหลังเจ้าแล้ว']},
  // ---------------- Arcanist ----------------
  as1:{job:'arcanist',name:'The Spark Within',th:'ประกายในตัวเจ้า',from:'corvin',to:'ondine',lv:1,obj:[],reward:R1,
    offer:['Magic, is it? It chose you, then, not the other way round.','Magister Ondine keeps the old books on the west side of town. Tell her I sent you.'],
    offerTh:['เวทมนตร์งั้นรึ? มันเลือกเจ้าเองสินะ ไม่ใช่เจ้าเลือกมัน','จอมเวทออนดีนเก็บตำราเก่าไว้ทางฝั่งตะวันตกของเมือง บอกนางว่าข้าส่งมา'],
    wait:'Magister Ondine lives on the west side of Hearthvale.',waitTh:'จอมเวทออนดีนอยู่ฝั่งตะวันตกของเฮิร์ธเวล',
    done:['A spark, Corvin says? Let me see.','Mm. Faint, but there. Sparks grow when they\'re fed.'],
    doneTh:['คอร์วินบอกว่ามีประกายงั้นรึ? ขอดูหน่อย','อืม จาง ๆ แต่มีอยู่ ประกายจะโตขึ้นเมื่อได้รับการหล่อเลี้ยง']},
  as2:{job:'arcanist',name:'The Three Stones',th:'ศิลาทั้งสาม',from:'ondine',to:'ondine',lv:1,after:'as1',reward:R2,
    obj:[{talk:'alda',text:'Ask Shepherd Alda about the old stones',th:'ถามคนเลี้ยงแกะอัลดาเรื่องศิลาโบราณ',line:'Ember, Frost and Storm, my gran called them. Ember sits by the path; the others are further up the hill.',lineTh:'เพลิง น้ำแข็ง และพายุ ยายข้าเรียกแบบนั้น ศิลาเพลิงอยู่ข้างทาง อีกสองก้อนอยู่สูงขึ้นไปบนเนิน'},
      {spot:'rEmber',zone:'heights',dx:-6,dy:-6,art:'rune',rune:'#ff8a4a',glyph:'ᚲ',act:'rune',seq:1,text:'Wake the Ember stone',th:'ปลุกศิลาเพลิง',say:'The Ember stone glows warm.',sayTh:'ศิลาเพลิงเรืองแสงอุ่น ๆ'},
      {spot:'rFrost',zone:'heights',dx:7,dy:-12,art:'rune',rune:'#8fd0f0',glyph:'ᛁ',act:'rune',seq:2,text:'Wake the Frost stone',th:'ปลุกศิลาน้ำแข็ง',say:'The Frost stone hums, cold and blue.',sayTh:'ศิลาน้ำแข็งส่งเสียงหึ่ง เย็นเฉียบสีฟ้า'},
      {spot:'rStorm',zone:'heights',dx:-3,dy:-19,art:'rune',rune:'#ffe066',glyph:'ᛊ',act:'rune',seq:3,text:'Wake the Storm stone',th:'ปลุกศิลาพายุ',say:'The Storm stone crackles. All three are awake.',sayTh:'ศิลาพายุเกิดประกายไฟ ทั้งสามตื่นแล้ว'}],
    offer:['Three rune stones stand on Windwhistle Heights, out the north gate. They have slept for a hundred years. Shepherd Alda knows where.','Wake them in the right order: Ember first, then Frost, then Storm. Get it wrong and they all go dark again.'],
    offerTh:['ศิลาอักขระสามก้อนตั้งอยู่บนเนินวินด์วิสเซิล ออกประตูเหนือไป พวกมันหลับมาร้อยปีแล้ว คนเลี้ยงแกะอัลดารู้ว่าอยู่ตรงไหน','ปลุกพวกมันให้ถูกลำดับ: เพลิงก่อน แล้วน้ำแข็ง แล้วพายุ ถ้าผิดลำดับ พวกมันจะดับลงทั้งหมด'],
    wait:'Ask Shepherd Alda, then wake the Ember, Frost and Storm stones on Windwhistle Heights (north gate), in that order.',waitTh:'ถามคนเลี้ยงแกะอัลดา แล้วปลุกศิลาเพลิง น้ำแข็ง และพายุบนเนินวินด์วิสเซิล (ประตูเหนือ) ตามลำดับ',
    done:['I felt them wake from here. All three, in order.','Your spark answered theirs. Now let\'s make it a flame.'],
    doneTh:['ข้ารู้สึกได้ตั้งแต่ตรงนี้ว่ามันตื่น ทั้งสามก้อน ตามลำดับ','ประกายของเจ้าตอบรับพวกมันแล้ว ทีนี้มาทำให้มันเป็นเปลวไฟกัน']},
  as3:{job:'arcanist',name:'Kindle the Flame',th:'จุดเปลวไฟ',from:'ondine',to:'ondine',lv:1,after:'as2',reward:R3,grant:'arcanist',
    obj:[{duel:'spark',zone:'town',near:'ondine',dx:1,dy:1,art:'crystal',hits:3,text:'Draw the light out of the spark crystal',th:'ดึงแสงออกจากผลึกประกาย',
      name:'Draw the spark',nameTh:'ดึงประกาย',win:'The crystal flares and the light settles in your hands.',winTh:'ผลึกลุกโชน แล้วแสงก็มาสถิตในมือคุณ'}],
    offer:['This crystal holds a little of each stone\'s power. Draw it out, gently.','Catch the light at its brightest, three times. Too early or too late and it slips away.'],
    offerTh:['ผลึกนี้เก็บพลังของศิลาแต่ละก้อนไว้เล็กน้อย ค่อย ๆ ดึงมันออกมา','จับแสงตอนที่สว่างที่สุดให้ได้สามครั้ง เร็วไปหรือช้าไป มันจะหลุดมือ'],
    wait:'Draw the light out of the spark crystal next to Ondine.',waitTh:'ดึงแสงออกจากผลึกประกายข้างออนดีน',
    done:['There. Feel that warmth? That is yours now.','Welcome, Arcanist. Never stop feeding the flame.'],
    doneTh:['นั่นแหละ รู้สึกถึงความอุ่นนั่นไหม? ตอนนี้มันเป็นของเจ้าแล้ว','ยินดีต้อนรับ อาร์คานิสต์ อย่าหยุดหล่อเลี้ยงเปลวไฟ']},
  // ---------------- Ranger ----------------
  rs1:{job:'ranger',name:'The Hunter\'s Call',th:'เสียงเรียกของนักล่า',from:'corvin',to:'ysolde',lv:1,obj:[],reward:R1,
    offer:['You have sharp eyes. I noticed. So will Ysolde the Tracker.','She waits at the edge of the Whispering Woods, past Greenmoss Meadow. Be quiet when you get close. She hates noise.'],
    offerTh:['เจ้าตาไว ข้าสังเกตเห็น อิโซลด์ นักแกะรอยก็จะเห็นเหมือนกัน','นางรออยู่ที่ชายป่ากระซิบ เลยทุ่งกรีนมอสไป เข้าไปใกล้ ๆ ให้เงียบ นางเกลียดเสียงดัง'],
    wait:'Ysolde the Tracker stands at the entrance of the Whispering Woods.',waitTh:'อิโซลด์ นักแกะรอยยืนอยู่ที่ทางเข้าป่ากระซิบ',
    done:['Corvin\'s pick? You walked in loud. We\'ll work on that.','But your timing is good. And I need someone right now, actually.'],
    doneTh:['คนที่คอร์วินเลือกงั้นรึ? เดินเข้ามาเสียงดังเชียว เดี๋ยวค่อยฝึกกัน','แต่จังหวะของเจ้าดี และตอนนี้ข้าต้องการคนช่วยพอดี']},
  rs2:{job:'ranger',name:'The Lost Hunter',th:'นักล่าที่หายไป',from:'ysolde',to:'ysolde',lv:1,after:'rs1',reward:R2,
    obj:[{spot:'tr1',zone:'heights',dx:2,dy:-6,art:'tracks',act:'track',seq:1,text:'Follow the footprints',th:'ตามรอยเท้า',say:'Boot prints, heading deeper into the trees.',sayTh:'รอยรองเท้า มุ่งลึกเข้าไปในป่า'},
      {spot:'tr2',zone:'heights',dx:8,dy:-11,art:'arrow',act:'track',seq:2,text:'Look at what he dropped',th:'ดูสิ่งที่เขาทำตกไว้',say:'A broken arrow with Bram\'s green fletching.',sayTh:'ลูกธนูหัก ขนหางสีเขียวของแบรม'},
      {spot:'tr3',zone:'heights',dx:3,dy:-16,art:'cloth',act:'track',seq:3,text:'Check the thorn bush',th:'ตรวจดูพุ่มหนาม',say:'A strip of green cloak caught on a thorn. He went this way in a hurry.',sayTh:'เศษผ้าคลุมสีเขียวติดอยู่บนหนาม เขารีบไปทางนี้'},
      {spot:'bram',zone:'heights',dx:10,dy:-21,art:'person',col:'#3f7a4c',hair:'#6b4a2a',act:'track',seq:4,text:'Find Bram',th:'ตามหาแบรม',say:'Bram! Hurt, but alive. "The rams chased me up a rock. Tell Ysolde I\'m fine… mostly."',sayTh:'แบรม! บาดเจ็บแต่ยังมีชีวิต "พวกแกะเขาไล่ข้าขึ้นไปบนหิน บอกอิโซลด์ว่าข้าสบายดี… ก็ประมาณนั้น"'}],
    offer:['My partner Bram went hunting up on Windwhistle Heights two days ago. He hasn\'t come back.','Go out the north gate and find his trail. Footprints first, then whatever he left behind. Follow it to him.'],
    offerTh:['แบรม คู่หูของข้า ขึ้นไปล่าบนเนินวินด์วิสเซิลเมื่อสองวันก่อน แล้วไม่กลับมาอีกเลย','ออกประตูเหนือไปหารอยของเขา รอยเท้าก่อน แล้วก็ของที่เขาทิ้งไว้ ตามไปจนเจอตัว'],
    wait:'Follow Bram\'s trail up Windwhistle Heights (north gate).',waitTh:'ตามรอยแบรมขึ้นไปบนเนินวินด์วิสเซิล (ประตูเหนือ)',
    done:['You found him? Alive? Thank the forest.','You read that trail like you\'d been doing it for years.'],
    doneTh:['เจ้าเจอเขา? ยังมีชีวิต? ขอบคุณผืนป่า','เจ้าอ่านรอยนั่นได้ราวกับทำมาหลายปี']},
  rs3:{job:'ranger',name:'Thin the Pack',th:'ลดจำนวนฝูง',from:'ysolde',to:'ysolde',lv:1,after:'rs2',reward:R3,grant:'ranger',
    obj:[{kill:'ridgeram',n:5},
      {duel:'stump',zone:'heights',near:'alda',dx:2,dy:1,art:'stump',hits:3,text:'Hit the target stump',th:'ยิงตอไม้เป้า',name:'Aim true',nameTh:'เล็งให้แม่น',win:'Three shots, three hits. Ysolde whistles.',winTh:'สามดอก โดนสามดอก อิโซลด์ผิวปาก'}],
    offer:['The Ridge Rams are still circling Bram on the heights. Thin the herd so he can walk home.','Then show me your aim: Alda keeps a target stump by her camp.'],
    offerTh:['พวกแกะเขายังวนอยู่รอบแบรมบนเนิน ลดจำนวนฝูงลงหน่อย เขาจะได้เดินกลับบ้านได้','แล้วโชว์ฝีมือการเล็งให้ข้าดู อัลดามีตอไม้เป้าอยู่ข้างแคมป์'],
    wait:'Defeat 5 Ridge Rams, then hit the target stump at Alda\'s camp on Windwhistle Heights.',waitTh:'ปราบริดจ์แรม 5 ตัว แล้วยิงตอไม้เป้าที่แคมป์ของอัลดาบนเนินวินด์วิสเซิล',
    done:['Bram\'s home, and you can shoot. That\'s all I ask of a Ranger.','The woods are yours to walk now. Quietly.'],
    doneTh:['แบรมกลับบ้านแล้ว และเจ้าก็ยิงเป็น นั่นคือทั้งหมดที่ข้าขอจากเรนเจอร์','ป่าเป็นของเจ้าแล้ว เดินให้เงียบล่ะ']},
  // ---------------- Cleric ----------------
  cs1:{job:'cleric',name:'A Quiet Light',th:'แสงสว่างอันเงียบสงบ',from:'corvin',to:'maren',lv:1,obj:[],reward:R1,
    offer:['You patch people up after every fight. I\'ve seen it.','Sister Maren at the chapel could use hands like yours. Go and see her.'],
    offerTh:['เจ้าคอยรักษาคนอื่นหลังทุกการต่อสู้ ข้าเห็นนะ','ซิสเตอร์มาเรนที่โบสถ์ต้องการมือแบบเจ้า ไปหานางเถอะ'],
    wait:'Sister Maren is at the chapel in Hearthvale.',waitTh:'ซิสเตอร์มาเรนอยู่ที่โบสถ์ในเฮิร์ธเวล',
    done:['Corvin is always sending me the stubborn ones.','Bless you for coming. We have work today.'],
    doneTh:['คอร์วินส่งแต่คนดื้อมาให้ข้าเสมอ','ขอพรให้เจ้าที่มา วันนี้เรามีงานต้องทำ']},
  cs2:{job:'cleric',name:'Wounded in the Fields',th:'ผู้บาดเจ็บในไร่',from:'maren',to:'maren',lv:1,after:'cs1',reward:R2,
    obj:[{spot:'farm1',zone:'farms',dx:6,dy:6,art:'hurt',col:'#a0703a',hair:'#3b2b20',act:'heal',text:'Tend the farmer by the path',th:'ดูแลชาวไร่ข้างทาง',say:'You bind the cut. "Thank you… it already hurts less."',sayTh:'คุณพันแผลให้ "ขอบคุณ… เจ็บน้อยลงแล้ว"'},
      {spot:'farm2',zone:'farms',dx:11,dy:10,art:'hurt',col:'#6a8a4a',hair:'#c8783a',act:'heal',text:'Tend the farmer by the trees',th:'ดูแลชาวไร่ข้างต้นไม้',say:'You set the sprained ankle. She can stand again.',sayTh:'คุณจัดข้อเท้าที่แพลงให้ นางยืนได้อีกครั้ง'},
      {spot:'farm3',zone:'farms',dx:3,dy:12,art:'hurt',col:'#8a6a9a',hair:'#e8e4dc',act:'heal',text:'Tend the old farmer',th:'ดูแลชาวไร่ชรา',say:'You calm his breathing. "Bless you, child."',sayTh:'คุณช่วยให้เขาหายใจสงบลง "ขอพรให้เจ้า ลูกเอ๋ย"'}],
    offer:['Field monsters tore through Willowmere Farms this morning, out the south gate. Three farmers are hurt.','Go to them. You don\'t need a prayer yet, just a steady hand and a little of your strength.'],
    offerTh:['เมื่อเช้ามอนสเตอร์บุกพังไร่วิลโลว์เมียร์ ออกประตูใต้ไป ชาวไร่บาดเจ็บสามคน','ไปหาพวกเขา ยังไม่ต้องสวดหรอก แค่มือที่มั่นคงกับพลังของเจ้าสักหน่อย'],
    wait:'Tend the three wounded farmers at Willowmere Farms, south gate (8 SP each).',waitTh:'ดูแลชาวไร่บาดเจ็บสามคนที่ไร่วิลโลว์เมียร์ ประตูใต้ (คนละ 8 SP)',
    done:['All three are home and resting. They asked your name.','Kindness is the first prayer. Now the second.'],
    doneTh:['ทั้งสามกลับบ้านไปพักแล้ว พวกเขาถามชื่อเจ้าด้วย','ความเมตตาคือคำภาวนาแรก ทีนี้คำภาวนาที่สอง']},
  cs3:{job:'cleric',name:'The Weeping Spirit',th:'วิญญาณผู้ร่ำไห้',from:'maren',to:'maren',lv:1,after:'cs2',reward:R3,grant:'cleric',
    obj:[{duel:'spirit',zone:'farms',near:'odo',dx:3,dy:2,art:'spirit',hits:3,text:'Pray with the weeping spirit',th:'ภาวนากับวิญญาณผู้ร่ำไห้',name:'Steady prayer',nameTh:'ภาวนาอย่างมั่นคง',
      win:'The spirit stops weeping, smiles, and fades into soft light.',winTh:'วิญญาณหยุดร้องไห้ ยิ้ม แล้วจางหายเป็นแสงนวล'}],
    offer:['Down by the river at Willowmere, near Odo\'s ferry, a spirit weeps every night. It isn\'t evil, only lost.','Pray with it. Keep your prayer steady and it will find its way.'],
    offerTh:['ริมแม่น้ำที่วิลโลว์เมียร์ ใกล้ท่าเรือของโอโด มีวิญญาณร้องไห้ทุกคืน มันไม่ได้ชั่วร้าย แค่หลงทาง','ภาวนาไปพร้อมกับมัน ภาวนาให้มั่นคงแล้วมันจะหาทางไปเจอ'],
    wait:'Pray with the weeping spirit by Odo\'s ferry at Willowmere Farms.',waitTh:'ภาวนากับวิญญาณผู้ร่ำไห้ข้างท่าเรือของโอโดที่ไร่วิลโลว์เมียร์',
    done:['I felt it pass. It\'s at peace, thanks to you.','Rise, Cleric of Hearthvale. May your light never go out.'],
    doneTh:['ข้ารู้สึกได้ว่ามันจากไปแล้ว มันสงบแล้ว เพราะเจ้า','จงลุกขึ้น นักบวชแห่งเฮิร์ธเวล ขอให้แสงของเจ้าไม่มีวันดับ']},
  // ---------------- Shade ----------------
  ss1:{job:'shade',name:'Light Fingers',th:'มือไว',from:'corvin',to:'ilsa',lv:1,obj:[],reward:R1,
    offer:['Ilsa the Merchant came to me in a state this morning. Someone has been stealing from the market at night.','You notice things other people miss. Go and hear her out.'],
    offerTh:['เช้านี้แม่ค้าอิลซามาหาข้าอย่างร้อนรน มีคนขโมยของในตลาดตอนกลางคืน','เจ้าสังเกตเห็นสิ่งที่คนอื่นมองข้าม ไปฟังนางเล่าเถอะ'],
    wait:'Ilsa runs the General Store in Hearthvale.',waitTh:'อิลซาดูแลร้านค้าทั่วไปในเฮิร์ธเวล',
    done:['Three nights, three things gone! A silver ring, a bag of coin, a whole crate of tonics!','Nobody saw a thing. Will you ask around for me?'],
    doneTh:['สามคืน ของหายสามอย่าง! แหวนเงิน ถุงเหรียญ แล้วก็ยาทั้งลัง!','ไม่มีใครเห็นอะไรเลย ช่วยถามไถ่ให้หน่อยได้ไหม?']},
  ss2:{job:'shade',name:'Asking Around',th:'สืบถาม',from:'ilsa',to:'ilsa',lv:1,after:'ss1',reward:R2,
    obj:[{talk:'brannoc',text:'Ask Brannoc the Smith',th:'ถามแบรนน็อค ช่างตีเหล็ก',line:'A shadow went over the smithy roof last night. Fast. A grey scarf, I think.',lineTh:'เมื่อคืนมีเงาวิ่งผ่านหลังคาโรงตีเหล็ก เร็วมาก ผ้าพันคอสีเทา ข้าว่านะ'},
      {talk:'wenna',text:'Ask Wenna the Keeper',th:'ถามเวนนา ผู้ดูแลคลัง',line:'Someone tried my back door, love. Left muddy prints going to the south gate.',lineTh:'มีคนพยายามงัดประตูหลังของข้า ทิ้งรอยเท้าเปื้อนโคลนไว้ ไปทางประตูใต้'},
      {talk:'odo',text:'Ask Odo the Ferryman',th:'ถามโอโด คนแจวเรือ',line:'I rowed someone across last night. Grey scarf, paid in silver… a silver ring, come to think of it.',lineTh:'เมื่อคืนข้าพายเรือส่งคนข้ามไป ผ้าพันคอสีเทา จ่ายเป็นเงิน… เป็นแหวนเงินด้วยสิ ถ้าคิดดูดี ๆ'},
      {spot:'prints',zone:'town',near:'gate:farms',dx:2,dy:-2,art:'tracks',text:'Look at the muddy prints by the south gate',th:'ดูรอยเท้าเปื้อนโคลนข้างประตูใต้',say:'Small, light steps. Whoever it is barely touches the ground.',sayTh:'ก้าวเล็ก ๆ เบา ๆ ใครก็ตามแทบไม่แตะพื้นเลย'}],
    offer:['Ask Brannoc and Wenna, they keep late hours. And Odo the Ferryman at Willowmere Farms sees everyone who crosses the river.','Look around the south gate too. Somebody must have left something behind.'],
    offerTh:['ไปถามแบรนน็อคกับเวนนา พวกเขานอนดึก แล้วโอโด คนแจวเรือที่ไร่วิลโลว์เมียร์ เห็นทุกคนที่ข้ามแม่น้ำ','ดูรอบ ๆ ประตูใต้ด้วย ต้องมีใครทิ้งร่องรอยไว้บ้าง'],
    wait:'Ask Brannoc, Wenna and Odo the Ferryman (Willowmere Farms), and look by the south gate.',waitTh:'ถามแบรนน็อค เวนนา และโอโด คนแจวเรือ (ไร่วิลโลว์เมียร์) แล้วดูแถวประตูใต้',
    done:['A grey scarf, light feet, a boat across the river… You did better than the town guard has all week.','Be careful out there.'],
    doneTh:['ผ้าพันคอสีเทา ฝีเท้าเบา เรือข้ามแม่น้ำ… เจ้าทำได้ดีกว่ายามทั้งสัปดาห์อีก','ระวังตัวด้วยนะ']},
  ss3:{job:'shade',name:'The Quickhand',th:'มือไวแห่งเงา',from:'ilsa',to:'nyx',lv:1,after:'ss2',reward:R3,grant:'shade',
    obj:[{spot:'camp',zone:'farms',dx:12,dy:24,art:'camp',seq:1,act:'track',text:'Find the hidden camp across the river',th:'หาแคมป์ลับฝั่งตรงข้ามแม่น้ำ',
        say:'A cold camp under the trees. The stolen goods are here, and so is someone in a grey scarf.',sayTh:'แคมป์ไร้ไฟใต้ต้นไม้ ของที่ถูกขโมยอยู่ที่นี่ และมีใครบางคนพันผ้าพันคอสีเทาอยู่ด้วย'},
      {duel:'vesk',zone:'farms',dx:14,dy:26,art:'thief',seq:2,hits:3,text:'Outfight Vesk the Quickhand',th:'เอาชนะเวสก์ จอมมือไว',name:'Duel: Vesk the Quickhand',nameTh:'ดวล: เวสก์ จอมมือไว',
        win:'Vesk drops his blade and laughs. "Faster than me. Go and see Nyx in town. Tell her Vesk lost."',winTh:'เวสก์ทิ้งมีดแล้วหัวเราะ "เร็วกว่าข้าอีก ไปหานิกซ์ในเมืองซะ บอกนางว่าเวสก์แพ้"'}],
    offer:['If the thief crossed the river at Willowmere, that\'s where my things are.','Bring them back… and if you can, find out who they are.'],
    offerTh:['ถ้าโจรข้ามแม่น้ำที่วิลโลว์เมียร์ ของของข้าก็อยู่ที่นั่น','เอาของคืนมา… แล้วถ้าทำได้ ก็หาให้รู้ว่าเป็นใคร'],
    wait:'Find the thief\'s camp across the river at Willowmere Farms, then speak to Nyx of the Veil in Hearthvale.',waitTh:'หาแคมป์ของโจรฝั่งตรงข้ามแม่น้ำที่ไร่วิลโลว์เมียร์ แล้วไปคุยกับนิกซ์แห่งม่านเงาในเฮิร์ธเวล',
    done:['So Vesk lost. To a Novice. He\'ll never live that down.','He was testing the town, and you passed a test he didn\'t know he was giving.','The Veiled Guild walks where the light doesn\'t. Welcome, Shade.'],
    doneTh:['เวสก์แพ้งั้นรึ ให้โนวิส เขาคงไม่มีวันลืมเรื่องนี้','เขากำลังทดสอบเมืองนี้ และเจ้าก็ผ่านบททดสอบที่เขาไม่รู้ตัวว่ากำลังให้','สมาคมม่านเงาเดินในที่ที่แสงส่องไม่ถึง ยินดีต้อนรับ เชด']}};
// into the quest list (in Thai the lines and names are swapped now; the objective texts are picked when shown)
for(const id in JOB_STORY){const q=JOB_STORY[id];if(TH_ON){q.name=q.th||q.name;q.offer=q.offerTh||q.offer;q.wait=q.waitTh||q.wait;q.done=q.doneTh||q.done;if(typeof TH_QNAMES!=='undefined')TH_QNAMES.add(q.name);}
  q.obj.forEach((o,i)=>{if(o.spot||o.duel||o.talk){o.n=1;o.key=o.spot||o.duel||('talk:'+o.talk);}});QUESTS[id]=q;}
const JS_FIRST=Object.keys(JOB_STORY).filter(id=>!JOB_STORY[id].after);
const jsOt=o=>JS_L(o.text,o.th);

/* ---- who can take them ---- */
const jsActiveJob=()=>{const s=QS();for(const id in s.active)if(QUESTS[id]&&QUESTS[id].job)return QUESTS[id].job;return null;};
{const _qa=qAvailable;qAvailable=function(id){const q=QUESTS[id];if(!q||!q.job)return _qa.apply(this,arguments);
  if(!P||P.cls!=='novice'||P.jl<10)return false;const cur=jsActiveJob();if(cur&&cur!==q.job)return false;return _qa.apply(this,arguments);};}

/* ---- the new kinds of step ---- */
const jsDone=(id,o)=>{const a=QS().active[id];return !!(a&&a.s&&a.s[o.key]);};
const jsMark=(id,o)=>{const a=QS().active[id];if(!a)return;a.s=a.s||{};a.s[o.key]=1;};
{const _oh=objHave;objHave=function(id,o){if(o&&o.key)return jsDone(id,o)?1:0;return _oh.apply(this,arguments);};}
{const _ot=objText;objText=function(id,o){if(o&&o.key)return jsOt(o);return _ot.apply(this,arguments);};}
if(typeof objLineHTML==='function'){const _ol=objLineHTML;objLineHTML=function(id,o,on){if(!o||!o.key)return _ol.apply(this,arguments);
  const mark=on&&jsDone(id,o)?'✓':'·',pic=o.talk&&typeof npcPicURL==='function'?qimg(npcPicURL(o.talk),npcName(o.talk)):'';
  return `<span class="qo"><span class="qm">${mark}</span>${pic}<span>${esc(jsOt(o))}</span></span>`;};}
// a step in order (rune stones, a trail) is open once the ones before it are done
const jsSeqOpen=(id,o)=>!o.seq||QUESTS[id].obj.every(p=>!p.seq||p.seq>=o.seq||jsDone(id,p));
// the places to show right now: unfinished spots and duels of active quests in this region (a trail shows one at a time,
// rune stones all at once since choosing the order is the puzzle)
function jsPlaces(){if(!P||!Z)return [];const s=QS(),out=[];
  for(const id in s.active){const q=QUESTS[id];if(!q||!q.job)continue;
    for(const o of q.obj){if(!(o.spot||o.duel)||o.zone!==zoneId||jsDone(id,o))continue;if(o.act!=='rune'&&!jsSeqOpen(id,o))continue;out.push({id,o});}}
  return out;}
// where a place is: an offset in tiles from the arrival point, a person or a gate, on the nearest open ground
const JS_POS=new Map();
function jsPos(o){const k=zoneId+'|'+o.key;if(JS_POS.has(k))return JS_POS.get(k);if(!Z)return null;
  let bx=Z.spawn.x,by=Z.spawn.y;
  if(o.near&&o.near.startsWith('gate:')){const pt=Z.portals.find(p=>p.to===o.near.slice(5));if(pt){bx=pt.x;by=pt.y;}}
  else if(o.near){const n=Z.npcs.find(n=>n.name===npcName(o.near));if(n){bx=n.x;by=n.y;}}
  const tx0=Math.floor(bx/TILE)+(o.dx||0),ty0=Math.floor(by/TILE)+(o.dy||0),ok=(x,y)=>x>1&&y>1&&x<Z.w-2&&y<Z.h-2&&!BLOCK[Z.t[y*Z.w+x]]&&(!Z.reach||Z.reach[y*Z.w+x])&&
    // in the open: no tree, rock or person right next to it (they would hide it or stand on it)
    !Z.objs.some(o=>{if(o.kind==='qspot'||o.kind==='gather')return false;const ddx=o.x-(x+.5)*TILE,ddy=o.y-(y+.5)*TILE;
      return (Math.abs(ddx)<TILE*1.7&&Math.abs(ddy)<TILE*1.7)||(ddx+ddy>0&&ddx+ddy<TILE*4.5&&Math.abs(ddx-ddy)<TILE*2.6);})&&!Z.npcs.some(n=>Math.hypot(n.x-(x+.5)*TILE,n.y-(y+.5)*TILE)<TILE*1.6);
  let pos=null;for(let r=0;r<12&&!pos;r++)for(let yy=-r;yy<=r&&!pos;yy++)for(let xx=-r;xx<=r&&!pos;xx++){if(Math.max(Math.abs(xx),Math.abs(yy))!==r)continue;
    const x=tx0+xx,y=ty0+yy;if(ok(x,y))pos={x:(x+.5)*TILE,y:(y+.5)*TILE};}
  if(!pos)pos={x:bx,y:by+TILE};JS_POS.set(k,pos);return pos;}
// keep them on the map as objects (drawn depth-sorted with everything else)
function jsSync(){if(!Z||!P)return;const want=jsPlaces(),keys=new Set(want.map(w=>w.id+'|'+w.o.key));
  Z.objs=Z.objs.filter(o=>o.kind!=='qspot'||keys.has(o.qk));
  for(const w of want){const qk=w.id+'|'+w.o.key;if(Z.objs.some(o=>o.qk===qk))continue;const p=jsPos(w.o);if(!p)continue;Z.objs.push({kind:'qspot',qk,qid:w.id,qo:w.o,x:p.x,y:p.y,v:0,sc:1});}}
setInterval(()=>{try{if(running)jsSync();}catch(e){}},400);

/* ---- drawing the places ---- */
const JS_OL='#2a1c14';
function jsArt(o,x,y){const a=o.qo.art;ctx.lineWidth=1.3;ctx.strokeStyle=JS_OL;
  const fs=c=>{ctx.fillStyle=c;ctx.fill();ctx.stroke();};
  if(a==='fence'){for(const dx of [-10,8]){ctx.beginPath();ctx.roundRect(x+dx,y-18,4,18,1);fs('#8a6038');}
    ctx.save();ctx.translate(x,y-10);ctx.rotate(.35);ctx.beginPath();ctx.roundRect(-13,-2,26,3.5,1);fs('#a07040');ctx.restore();
    ctx.beginPath();ctx.roundRect(x-13,y-6,26,3,1);fs('#7a5030');}
  else if(a==='rune'){ctx.beginPath();ctx.moveTo(x-9,y);ctx.lineTo(x-7,y-22);ctx.quadraticCurveTo(x,y-28,x+7,y-22);ctx.lineTo(x+9,y);ctx.closePath();fs('#7a7470');
    ctx.globalAlpha=.55+.45*Math.sin(now*3+x);ctx.fillStyle=o.qo.rune;ctx.font='bold 13px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(o.qo.glyph||'ᚱ',x,y-13);ctx.globalAlpha=1;}
  else if(a==='tracks'){ctx.fillStyle='rgba(60,40,25,.55)';for(let i=0;i<4;i++){const px=x-12+i*7,py=y-2+(i%2?3:-2);ctx.beginPath();ctx.ellipse(px,py,2.4,1.4,.3,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(px+2.2,py-.4,1,1,0,0,7);ctx.fill();}}
  else if(a==='arrow'){ctx.save();ctx.translate(x,y-3);ctx.rotate(-.4);ctx.strokeStyle='#8a6038';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(1,0);ctx.moveTo(3,1.5);ctx.lineTo(10,1);ctx.stroke();
    ctx.fillStyle='#4e8a3a';ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-14,-3);ctx.lineTo(-12,0);ctx.lineTo(-14,3);ctx.closePath();ctx.fill();ctx.restore();}
  else if(a==='cloth'){for(const [dx,r] of [[-6,7],[5,8]]){ctx.beginPath();ctx.ellipse(x+dx,y-6,r,r*.7,0,0,7);fs('#3a6a2a');}
    ctx.beginPath();ctx.moveTo(x-1,y-12);ctx.lineTo(x+7,y-9);ctx.lineTo(x+3,y-4);ctx.closePath();fs('#5aa04a');}
  else if(a==='person'||a==='hurt'){drawHuman(x,y,o.qo.col||'#8a6a4a',o.qo.hair||'#3b2b20',-1,0,{look:{...lookFor(o.qk),hair:o.qo.hair||'#3b2b20'},sit:true});
    if(a==='hurt'){ctx.fillStyle='#fff';ctx.strokeStyle='#c83a3a';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x+12,y-34,6,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#d83a3a';ctx.fillRect(x+11,y-38,2,8);ctx.fillRect(x+8,y-35,8,2);}}
  else if(a==='thief'){drawHuman(x,y,'#5a4e78','#2b2633',-1,0,{look:{...lookFor('Vesk'),hair:'#2b2633'},outfit:'shade',stance:2});}
  else if(a==='dummy'){ctx.beginPath();ctx.roundRect(x-2,y-30,4,30,1);fs('#7a5030');ctx.beginPath();ctx.ellipse(x,y-20,7,9,0,0,7);fs('#d8c080');
    ctx.beginPath();ctx.roundRect(x-11,y-26,22,4,1.5);fs('#7a5030');ctx.beginPath();ctx.arc(x,y-33,5,0,7);fs('#d8c080');}
  else if(a==='crystal'){ctx.beginPath();ctx.roundRect(x-7,y-6,14,6,2);fs('#5a5260');const g=.6+.4*Math.sin(now*4);
    ctx.globalAlpha=.85;ctx.beginPath();ctx.moveTo(x,y-28);ctx.lineTo(x+6,y-14);ctx.lineTo(x,y-6);ctx.lineTo(x-6,y-14);ctx.closePath();fs('#a8c8ff');
    ctx.globalAlpha=g*.5;ctx.fillStyle='#e0f0ff';ctx.beginPath();ctx.arc(x,y-16,12,0,7);ctx.fill();ctx.globalAlpha=1;}
  else if(a==='stump'){ctx.beginPath();ctx.ellipse(x,y-3,10,5,0,0,7);fs('#7a5030');ctx.beginPath();ctx.roundRect(x-10,y-12,20,9,2);fs('#8a6038');
    for(const [r,c] of [[8,'#f4efe2'],[5.5,'#d83a3a'],[3,'#f4efe2'],[1.4,'#d83a3a']]){ctx.beginPath();ctx.ellipse(x,y-12,r,r*.5,0,0,7);ctx.fillStyle=c;ctx.fill();}}
  else if(a==='spirit'){const b=Math.sin(now*2)*3;ctx.globalAlpha=.55+.15*Math.sin(now*3);ctx.fillStyle='#d8e8ff';ctx.strokeStyle='rgba(255,255,255,.8)';
    ctx.beginPath();ctx.arc(x,y-30+b,9,Math.PI,0);ctx.lineTo(x+9,y-12+b);for(let i=0;i<4;i++)ctx.lineTo(x+9-(i+.5)*4.5,y-12+b+(i%2?-3:2));ctx.lineTo(x-9,y-12+b);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.globalAlpha=1;ctx.fillStyle='#4a5a7a';ctx.beginPath();ctx.arc(x-3,y-30+b,1.4,0,7);ctx.arc(x+3,y-30+b,1.4,0,7);ctx.fill();}
  else if(a==='camp'){ctx.beginPath();ctx.moveTo(x-16,y);ctx.lineTo(x-4,y-20);ctx.lineTo(x+8,y);ctx.closePath();fs('#5a5468');ctx.beginPath();ctx.moveTo(x-4,y-20);ctx.lineTo(x-6,y);ctx.lineTo(x-2,y);ctx.closePath();fs('#2a2436');
    ctx.beginPath();ctx.roundRect(x+9,y-7,10,7,1.5);fs('#8a6038');ctx.fillStyle='#e8c25a';ctx.beginPath();ctx.arc(x+14,y-9,2,0,7);ctx.fill();}
  else{ctx.beginPath();ctx.arc(x,y-8,7,0,7);fs('#c8b8ff');}}
{const _doJ=drawObj;drawObj=function(o){if(o.kind!=='qspot')return _doJ.apply(this,arguments);const p=proj(o.x,o.y);ctx.save();
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(p.x,p.y+1,13,4,0,0,7);ctx.fill();
  try{jsArt(o,p.x,p.y);}catch(e){}
  // a bobbing gold marker: something to do here
  const my=p.y-(o.qo.art==='person'||o.qo.art==='hurt'||o.qo.art==='thief'?54:o.qo.art==='dummy'||o.qo.art==='spirit'?50:38)+Math.sin(now*3+o.x)*2.5;
  ctx.fillStyle=o.qo.duel?'#ff9a6a':'#ffcf5a';ctx.strokeStyle=JS_OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(p.x,my,6.5,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle=JS_OL;ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(o.qo.duel?'⚔':'!',p.x,my+.5);ctx.restore();};}

/* ---- tapping a place: walk there, then do it ---- */
const JS={goal:null};
function jsAt(sc){if(!Z)return null;let best=null,bd=34;for(const o of Z.objs){if(o.kind!=='qspot')continue;const p=proj(o.x,o.y),d=Math.hypot(p.x-sc.x,p.y-14-sc.y);if(d<bd){bd=d;best=o;}}return best;}
addEventListener('pointerdown',ev=>{if(ev.target!==cv||!P||P.dead||!running||JD.run)return;if(typeof npcBusy==='function'&&npcBusy())return;const sc=screenAt(ev),o=jsAt(sc);
  if(!o||(typeof objTapSkip==='function'&&objTapSkip(ev,sc,o,14)))return;ev.stopPropagation();ev.preventDefault();
  P.target=null;P.queued=null;P.sitting=false;if(Math.hypot(P.x-o.x,P.y-o.y)<56)jsDo(o);else{JS.goal=o;pathTo(o.x,o.y+12,true);}},true);
setInterval(()=>{const o=JS.goal;if(!o||!P||JD.run)return;if(P.target||P.dead||!Z||!Z.objs.includes(o)){JS.goal=null;return;}if(Math.hypot(P.x-o.x,P.y-o.y)<56){JS.goal=null;P.path=[];jsDo(o);}},150);
const jsSay=o=>JS_L(o.say,o.sayTh);
function jsDo(ob){const id=ob.qid,o=ob.qo,q=QUESTS[id];if(!q||!QS().active[id]||jsDone(id,o))return;P.face=sface(ob.x-P.x,ob.y-P.y);
  if(o.duel){jdStart(ob);return;}
  if(o.act==='heal'){const cost=8;if(P.sp<cost){floatT(ob.x,ob.y-44,JS_L('Not enough SP: sit to rest','SP ไม่พอ: นั่งพักก่อน'),'#9fd3ff',13);sfx('miss');return;}
    P.sp-=cost;fx.push({k:'heal',x:ob.x,y:ob.y,t0:now,dur:.8});}
  if(o.act==='rune'&&!jsSeqOpen(id,o)){ // wrong order: every stone of this quest goes dark again
    const a=QS().active[id];for(const p of q.obj)if(p.act==='rune'&&a.s)delete a.s[p.key];
    floatT(ob.x,ob.y-44,JS_L('Wrong order! The stones go dark.','ผิดลำดับ! ศิลาดับลงทั้งหมด'),'#ff9a8a',14);addLog(JS_L('The stones go dark. Start again with the Ember stone.','ศิลาดับลงทั้งหมด เริ่มใหม่ที่ศิลาเพลิง'),'l-bad');sfx('hurt');
    jsSync();questHud();if(typeof save==='function')save();return;}
  jsMark(id,o);sfx(o.act==='rune'?'jobup':'pickup');fx.push({k:'ring',x:ob.x,y:ob.y,r:30,col:o.rune||'#ffcf5a',t0:now,dur:.5});
  floatT(ob.x,ob.y-46,'✓','#ffcf5a',16);addLog(jsSay(o),'l-good');jsAfter(id);}
// after a step: tell the player when the chapter is ready to hand in
function jsAfter(id){jsSync();if(qReady(id)){addLog(`${QUESTS[id].name} is ready. Return to ${npcName(QUESTS[id].to)}.`,'l-rare');sfx('jobup');}
  questHud();if(typeof refreshPanel==='function'&&panelKind)refreshPanel();if(typeof save==='function')save();}

/* ---- the timing duel: stop the marker in the zone; 3 hits before 3 misses ---- */
const JD={run:null,el:null};
function jdStart(ob){const o=ob.qo;let el=JD.el;
  if(!el){el=JD.el=document.createElement('div');el.id='duelBox';el.setAttribute('role','dialog');document.body.appendChild(el);
    el.addEventListener('pointerdown',ev=>{ev.stopPropagation();ev.preventDefault();jdTap();});}
  JD.run={ob,hits:0,miss:0,need:o.hits||3,lock:0};jdRound();el.hidden=false;sfx('click');
  const tick=()=>{const r=JD.run;if(!r)return;const t=(performance.now()-r.t0)/1000*r.sp,pos=1-Math.abs((t%2)-1);r.pos=pos;const m=el.querySelector('.gbar b');if(m)m.style.left=(pos*100)+'%';requestAnimationFrame(tick);};requestAnimationFrame(tick);}
function jdRound(){const r=JD.run,el=JD.el,o=r.ob.qo;r.zw=.16-r.hits*.025;r.zc=.2+Math.random()*.6;r.t0=performance.now();r.sp=.8+r.hits*.3+Math.random()*.2;
  const dots=n=>'<span class="jdots">'+Array.from({length:r.need},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')+'</span>';
  el.innerHTML=`<div class="gtt">${esc(JS_L(o.name,o.nameTh))}</div><div class="gbar"><i class="gy" style="left:${(r.zc-r.zw/2)*100}%;width:${r.zw*100}%"></i><b></b></div>`+
    `<div class="gts">${dots(r.hits)} <span class="jhearts">${'♥'.repeat(3-r.miss)}<s>${'♥'.repeat(r.miss)}</s></span></div><div class="gts">${esc(JS_L('Tap when the marker is in the gold!','แตะตอนที่ตัวชี้อยู่ในช่องสีทอง!'))}</div>`;}
function jdTap(){const r=JD.run;if(!r||performance.now()<r.lock)return;r.lock=performance.now()+250;const ok=Math.abs((r.pos||0)-r.zc)<=r.zw/2;
  if(ok){r.hits++;sfx('hit');floatT(P.x,P.y-50,JS_L('Hit!','โดน!'),'#ffcf5a',15);fx.push({k:'ring',x:r.ob.x,y:r.ob.y,r:26,col:'#ffcf5a',t0:now,dur:.35});}
  else{r.miss++;sfx('miss');floatT(P.x,P.y-50,JS_L('Miss','พลาด'),'#c8d0dc',14);}
  if(r.hits>=r.need){const ob=r.ob,o=ob.qo;JD.run=null;JD.el.querySelector('.gts').textContent=JS_L('Done!','สำเร็จ!');setTimeout(()=>{if(!JD.run)JD.el.hidden=true;},700);
    sfx('fanfare');fx.push({k:'lvpillar',x:ob.x,y:ob.y,t0:now,dur:1.2});jsMark(ob.qid,o);addLog(JS_L(o.win,o.winTh),'l-rare');jsAfter(ob.qid);return;}
  if(r.miss>=3){JD.run=null;JD.el.querySelector('.gts').textContent=JS_L('Out of breath… try again.','หมดแรง… ลองใหม่อีกครั้ง');setTimeout(()=>{if(!JD.run)JD.el.hidden=true;},900);return;}
  jdRound();}
// walking off or going down stops it (a hit no longer does, since v1.19.1: a passing monster used to ruin the duel)
setInterval(()=>{const r=JD.run;if(r&&P&&(P.dead||Math.hypot(P.x-r.ob.x,P.y-r.ob.y)>110)){JD.run=null;if(JD.el)JD.el.hidden=true;}},200);
addEventListener('keydown',ev=>{if(JD.run&&(ev.code==='Space'||ev.code==='Enter')){ev.preventDefault();jdTap();}});

/* ---- talking to someone as a step (Brannoc, Wenna, Tobin…) ---- */
function jsTalks(key){if(!P)return [];const s=QS(),out=[];for(const id in s.active){const q=QUESTS[id];if(!q||!q.job)continue;for(const o of q.obj)if(o.talk===key&&!jsDone(id,o))out.push({id,o});}return out;}
{const _on=openNpc;openNpc=function(n){const key=npcKeyOf(n);if(key&&jsTalks(key).length){P.face=sface(n.x-P.x,n.y-P.y);talk={npc:key,role:n.role,n,id:null,mode:null,page:0};sfx('click');openPanel('talk');return;}
  return _on.apply(this,arguments);};}
{const _pt=PANELS.talk;PANELS.talk=function(){if(!talk)return _pt.apply(this,arguments);
  if(talk.jsay){const n=npcName(talk.npc);return `<div class="thead"><canvas id="talkCv" width="144" height="144" aria-hidden="true"></canvas><h2>${esc(n)}</h2></div>`+
    `<div class="sub">${esc(talk.jsay.q)}</div><div class="say talk">“${esc(talk.jsay.line)}”</div><div class="tbtns"><button class="btn" data-act="tjback">${esc(JS_L('Thank you','ขอบคุณ'))}</button></div>`;}
  let h=_pt.apply(this,arguments);if(talk.id)return h;const list=jsTalks(talk.npc);if(!list.length)return h;
  const btns=list.map(({id,o})=>`<button class="tq ready" data-act="tjask" data-arg="${id}|${o.key}"><b>?</b> ${esc(jsOt(o))}</button>`).join('');
  const i=h.indexOf('<div class="tlist">');return i<0?h:h.slice(0,i+19)+btns+h.slice(i+19);};}
PANEL_ACTS.tjask=arg=>{const [id,key]=String(arg).split('|'),q=QUESTS[id],o=q&&q.obj.find(o=>o.key===key);if(!o||!talk||o.talk!==talk.npc||!QS().active[id])return;
  jsMark(id,o);talk.jsay={q:q.name,line:JS_L(o.line,o.lineTh)};sfx('click');addLog(`${npcName(o.talk)}: “${JS_L(o.line,o.lineTh)}”`,'l-good');jsAfter(id);};
PANEL_ACTS.tjback=()=>{if(talk)talk.jsay=null;refreshPanel();};
{const _nm=npcMark;npcMark=function(n){const key=npcKeyOf(n);if(key&&jsTalks(key).length)return 'ready';return _nm.apply(this,arguments);};}

/* ---- choosing a calling at Corvin: picture cards with the job's English name (also in Thai), and a confirm card ----
   A Novice sees the five callings as cards (their hero dressed as that job, the job name in English, a short role line)
   instead of plain story titles. Tapping one opens Corvin's offer as before; Accept on a first chapter asks once more
   ("Start the Warden story?") so a stray tap does not start the wrong story. */
const JS_ROLE={warden:['Tank · sword · the most HP','แทงค์ · ดาบ · HP มากที่สุด'],arcanist:['Magic from afar · wand','เวทมนตร์ระยะไกล · คทา'],
  ranger:['Archer · bow · long range','นักธนู · ธนู · ระยะไกล'],cleric:['Healer · mace · holy power','ผู้รักษา · กระบอง · พลังศักดิ์สิทธิ์'],shade:['Fast · dagger · quick strikes','ว่องไว · มีดสั้น · โจมตีรวดเร็ว']};
const jsPic=cls=>typeof jobPicURL==='function'?jobPicURL(cls):'';
const jsRole=cls=>{const r=JS_ROLE[cls];return r?JS_L(r[0],r[1]):'';};
// the job name stays English in every language (translate="no" keeps the page sweep off it)
const jsJobName=cls=>`<b class="jpname" translate="no" style="color:${CLASSES[cls].col}">${esc(CLASSES[cls].name)}</b>`;
function jsJobCard(cls,act,arg){const pic=jsPic(cls);
  return `<button class="jpick" data-act="${act}" data-arg="${arg}">${pic?`<img alt="" src="${pic}">`:''}${jsJobName(cls)}<small>${esc(jsRole(cls))}</small></button>`;}
{const _pt2=PANELS.talk;PANELS.talk=function(){if(!talk)return _pt2.apply(this,arguments);
  // the confirm card
  if(talk.jconfirm){const id=talk.jconfirm,q=QUESTS[id],cls=q&&q.job;if(!cls){talk.jconfirm=null;return _pt2.apply(this,arguments);}
    const nm=CLASSES[cls].name,pic=jsPic(cls);
    return `<div class="thead"><canvas id="talkCv" width="144" height="144" aria-hidden="true"></canvas><h2>${esc(npcName(talk.npc))}</h2></div>`+
      `<div class="jconfirm">${pic?`<img alt="" src="${pic}">`:''}${jsJobName(cls)}<small>${esc(jsRole(cls))}</small>`+
      `<p>${esc(JS_L(`Start the ${nm} story? When you finish it, you become a ${nm}.`,`เริ่มเรื่องราวของ ${nm} ไหม? เมื่อจบเรื่อง คุณจะได้เป็น ${nm}`))}</p>`+
      `<p class="muted">${esc(JS_L('You can follow only one story at a time. Until the last chapter you can still give it up in the quest log and pick another.','ทำได้ทีละเรื่องเท่านั้น ก่อนถึงบทสุดท้าย ยังยกเลิกได้ในสมุดเควสแล้วเลือกเรื่องอื่น'))}</p></div>`+
      `<div class="tbtns"><button class="btn" data-act="jsyes" data-arg="${id}">${esc(JS_L(`Yes, I choose ${nm}`,`ใช่ ฉันเลือก ${nm}`))}</button><button class="btn" data-act="jsno">${esc(JS_L('Go back','ย้อนกลับ'))}</button></div>`;}
  let h=_pt2.apply(this,arguments);
  // an offer of a story: show which job it leads to; the first chapter's Accept asks to confirm
  if(talk.id){const q=QUESTS[talk.id];if(!q||!q.job||talk.jsay)return h;
    const tag=`<div class="jsjob">${jsPic(q.job)?`<img alt="" src="${jsPic(q.job)}">`:''}<span>${esc(JS_L('Calling:','อาชีพ:'))} ${jsJobName(q.job)}<small>${esc(jsRole(q.job))}</small></span></div>`;
    const i=h.indexOf('</div>',h.indexOf('<div class="sub">'));if(i>=0&&h.indexOf('<div class="sub">')>=0)h=h.slice(0,i+6)+tag+h.slice(i+6);
    if(talk.mode==='offer'&&JS_FIRST.includes(talk.id))h=h.replace(`data-act="qaccept" data-arg="${talk.id}"`,`data-act="jspick" data-arg="${talk.id}"`);
    return h;}
  // Corvin's list: the first chapters become picture cards
  const offers=JS_FIRST.filter(id=>h.includes(`data-arg="offer:${id}"`));if(!offers.length)return h;
  for(const id of offers){const a=h.indexOf(`<button class="tq offer" data-act="topen" data-arg="offer:${id}">`),b=a<0?-1:h.indexOf('</button>',a);if(b>=0)h=h.slice(0,a)+h.slice(b+9);}
  const grid=`<div class="sub">${esc(JS_L('Choose your calling. Tap a job to hear its story.','เลือกอาชีพของคุณ แตะที่อาชีพเพื่อฟังเรื่องราว'))}</div><div class="jpgrid">`+offers.map(id=>jsJobCard(QUESTS[id].job,'topen','offer:'+id)).join('')+`</div>`;
  const i=h.indexOf('<div class="tlist">');return i<0?h+grid:h.slice(0,i)+grid+h.slice(i);};}
PANEL_ACTS.jspick=id=>{if(!talk||!qAvailable(id))return;talk.jconfirm=id;sfx('click');refreshPanel();};
PANEL_ACTS.jsno=()=>{if(talk)talk.jconfirm=null;sfx('click');refreshPanel();};
PANEL_ACTS.jsyes=id=>{if(!talk||talk.jconfirm!==id)return;talk.jconfirm=null;PANEL_ACTS.qaccept(id);};

/* ---- the last chapter makes you that job ---- */
{const _qf=PANEL_ACTS.qfinish;PANEL_ACTS.qfinish=function(id){const q=QUESTS[id],grant=q&&q.grant&&qReady(id)&&talk&&q.to===talk.npc?q.grant:null;
  const r=_qf.apply(this,arguments);if(grant&&QS().done.includes(id)&&typeof becomeJob==='function'){becomeJob(grant);if(typeof showBanner==='function')showBanner(CLASSES[grant].name,JS_L('Your story is complete','เรื่องราวของคุณจบสมบูรณ์'));}return r;};}

/* ---- the goal chip and arrow lead to the next place or person ---- */
{const _gw=goalWhat;goalWhat=function(){const w=_gw.apply(this,arguments);if(!P)return w;const s=QS(),act=Object.keys(s.active);const id=P.track&&s.active[P.track]?P.track:act[0];
  const q=id&&QUESTS[id];if(!q||!q.job||qReady(id))return w;
  const o=q.obj.find(o=>objHave(id,o)<objNeed(o)&&(o.act==='rune'||!o.key||jsSeqOpen(id,o)));if(!o||!o.key)return w;
  // rune stones: lead to the next one in order
  const tgt=o.act==='rune'?q.obj.filter(p=>p.act==='rune'&&!jsDone(id,p)).sort((a,b)=>a.seq-b.seq)[0]||o:o;
  if(tgt.talk)return {zone:npcZoneOf(tgt.talk),npc:npcName(tgt.talk),text:jsOt(tgt)};
  return {zone:tgt.zone,place:id+'|'+tgt.key,text:jsOt(tgt)};};}
{const _gp=goalPoint;goalPoint=function(w){if(w&&w.place&&w.zone===zoneId){const ob=Z&&Z.objs.find(o=>o.qk===w.place);if(ob)return {x:ob.x,y:ob.y};}return _gp.apply(this,arguments);};}

/* ---- the calling quest steps aside while a story is under way ---- */
if(typeof callingNow==='function'){const _cn=callingNow;callingNow=function(){if(P&&P.cls==='novice'&&jsActiveJob())return null;const q=_cn.apply(this,arguments);
  if(q&&q.id==='call1')q.steps=[{text:JS_L('Talk to Guildmaster Corvin in Hearthvale and choose a calling\'s story','คุยกับหัวหน้ากิลด์คอร์วินในเฮิร์ธเวล แล้วเลือกเรื่องราวของอาชีพ'),go:CORVIN}];return q;};}

if(typeof TH!=='undefined')Object.assign(TH,{
  '“You\'ve earned it. Every calling has its own story, and you have to live it before the guild gives you the name. Talk to me again and pick the one to begin. You can change your mind before the end.” — Corvin':
    '“เจ้าสมควรได้รับมัน ทุกอาชีพมีเรื่องราวของตัวเอง และเจ้าต้องผ่านมันก่อนที่กิลด์จะมอบชื่อนั้นให้ คุยกับข้าอีกครั้งแล้วเลือกเรื่องที่จะเริ่ม เปลี่ยนใจได้ก่อนเรื่องจะจบ” — Corvin'});
