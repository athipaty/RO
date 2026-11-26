"use strict";
/* ================= How to play, for phones (v1.66.2) =================
   The help page was written for a keyboard and mouse (WASD, Tab, X, C, K, J, G, B, E, right-click) and still described
   the world of v1.20. Embervale is played on phones, so the page now speaks of drags, taps and buttons, and covers the
   world as it is: the winding roads, the floors below, the island, the forge and refining, elements, party voice.
   English and Thai side by side (ui.js asks for it; the rest of the help window is unchanged). */
const HELP_PHONE=[
  ['Moving and fighting','การเดินและการต่อสู้',
   'Drag anywhere on the screen to walk, or tap the ground to walk there. Tap a monster to attack it until it falls. The big red sword button attacks the nearest monster; your skills sit on the round buttons around it.',
   'ลากนิ้วที่ไหนก็ได้บนจอเพื่อเดิน หรือแตะพื้นเพื่อเดินไปตรงนั้น แตะมอนสเตอร์เพื่อโจมตีจนมันล้ม ปุ่มดาบสีแดงใหญ่จะโจมตีมอนสเตอร์ที่ใกล้ที่สุด สกิลของคุณอยู่บนปุ่มกลมรอบ ๆ'],
  ['Auto-hunt','ล่าอัตโนมัติ',
   'The Auto button fights for you: it picks the nearest monster and drinks a tonic when your HP runs low. Choose Stay here to guard one spot, or Roam to hunt the area.',
   'ปุ่ม Auto จะสู้ให้คุณ: เลือกมอนสเตอร์ที่ใกล้ที่สุดและดื่มยาเมื่อ HP ใกล้หมด เลือก “อยู่ที่นี่” เพื่อเฝ้าจุดเดียว หรือ “เดินล่า” เพื่อล่าทั่วบริเวณ'],
  ['Healing','การฟื้นฟู',
   'The red bottle button drinks a Red Tonic. Out of a fight, tap the sit button to recover HP and SP faster. The store in Hearthvale sells more tonics.',
   'ปุ่มขวดแดงคือดื่ม Red Tonic ตอนไม่ได้สู้ แตะปุ่มนั่งเพื่อฟื้น HP และ SP เร็วขึ้น ร้านค้าในฮาร์ธเวลขายยาเพิ่ม'],
  ['Levels, stats and skills','เลเวล สถานะ และสกิล',
   'Base levels give stat points, job levels give skill points. Open Stats or Skills from the buttons on the left; ✨ Recommended spends the points for your job. At Job Lv 10, Guildmaster Corvin in Hearthvale gives you your first job (Warden, Arcanist, Ranger, Cleric, Shade or Gunslinger); at Job Lv 40 an advanced calling.',
   'เลเวลฐานให้แต้มสถานะ เลเวลอาชีพให้แต้มสกิล เปิดสถานะหรือสกิลจากปุ่มด้านซ้าย ปุ่ม ✨ แนะนำ จะใช้แต้มให้เหมาะกับอาชีพ เมื่อถึง Job Lv 10 หัวหน้ากิลด์คอร์วินในฮาร์ธเวลจะมอบอาชีพแรก และที่ Job Lv 40 อาชีพขั้นสูง'],
  ['Quests','เควส',
   'People with a gold ! have a quest for you; a ? means you can hand one in. The chip at the top of the screen and the gold arrow show where to go next; tap the chip for your quest log. Start with Elder Hollis in Chapel Close.',
   'คนที่มี ! สีทองมีเควสให้คุณ ส่วน ? คือส่งเควสได้ ป้ายด้านบนจอและลูกศรสีทองบอกว่าต้องไปไหนต่อ แตะป้ายเพื่อเปิดสมุดเควส เริ่มจากผู้เฒ่าฮอลลิสที่ย่านโบสถ์'],
  ['The world','โลก',
   'Hearthvale and the capital Aurelmark stand in the middle; four winding roads lead out, and the farther you go the stronger the monsters. The map button opens the world map: drag it to look around, and use the arrows in its corner to step from region to region. A ▼ marks a region with stairs down to a dungeon.',
   'ฮาร์ธเวลและเมืองหลวงออเรลมาร์กอยู่ตรงกลาง มีถนนคดเคี้ยวสี่สายออกไป ยิ่งไกลมอนสเตอร์ยิ่งแข็ง ปุ่มแผนที่เปิดแผนที่โลก: ลากเพื่อเลื่อนดู และใช้ลูกศรที่มุมเพื่อไปทีละดินแดน ▼ คือดินแดนที่มีบันไดลงดันเจี้ยน'],
  ['Travel','การเดินทาง',
   'Tobin at the Waystation in Hearthvale sends you to any place you have walked to, for a fare; a Waystone Shard does the same anywhere, once. Both have a ⇄ toggle between the world map and the floors below.',
   'โทบินที่สถานีเดินทางในฮาร์ธเวลส่งคุณไปที่ไหนก็ได้ที่เคยเดินไป โดยเสียค่าเดินทาง ศิลาเดินทางทำแบบเดียวกันได้ทุกที่หนึ่งครั้ง ทั้งสองมีปุ่ม ⇄ สลับระหว่างแผนที่โลกกับชั้นใต้ดิน'],
  ['Dungeons and the island','ดันเจี้ยนและเกาะ',
   'Stairs in Whispering Woods lead down into the Mossdeep Caverns, and in Cinderpeak Caldera into the Molten Depths: three floors each, a boss at the bottom. The Tidewater Isle lies far out at sea: the boat at the Willowmere Farms pier takes heroes of Lv 38 and up. Everything there is water, so bring wind.',
   'บันไดในป่ากระซิบพาลงถ้ำมอสดีป และในแอ่งภูเขาไฟซินเดอร์พีคพาลงโมลเทนเดปธ์ แห่งละสามชั้น มีบอสที่ชั้นล่างสุด เกาะไทด์วอเตอร์อยู่ไกลกลางทะเล: เรือที่ท่าไร่วิลโลว์เมียร์รับผู้กล้าเลเวล 38 ขึ้นไป ทุกอย่างที่นั่นเป็นธาตุน้ำ จงพกธาตุลมไป'],
  ['Gear, forging and refining','อุปกรณ์ การตีและการตีบวก',
   'Brannoc the Smith in Hearthvale forges gear from monster materials and refines it: Ember Ore for weapons, Glintstone for armour. He sells each hero 3 of each a day; more comes from monsters, ore veins and smelting, and he can re-smelt one ore into the other. From +5 a failed refine breaks the piece.',
   'แบรนน็อคช่างตีเหล็กในฮาร์ธเวลตีอุปกรณ์จากวัตถุดิบมอนสเตอร์และตีบวกให้: แร่เอมเบอร์สำหรับอาวุธ กลินต์สโตนสำหรับชุดเกราะ เขาขายให้คนละ 3 ก้อนต่อวัน หาเพิ่มได้จากมอนสเตอร์ สายแร่ และการหลอม และหลอมแร่ชนิดหนึ่งเป็นอีกชนิดได้ ตั้งแต่ +5 ถ้าตีบวกพลาดของจะแตก'],
  ['Sigils','ซิกิล',
   'Every monster has a small chance to drop its sigil. Tap a sigil in your bag to socket it into gear with a free slot: its bonus stays for good. The Sigil album rewards collecting a whole region.',
   'มอนสเตอร์ทุกตัวมีโอกาสเล็กน้อยที่จะดรอปซิกิล แตะซิกิลในกระเป๋าเพื่อใส่ลงอุปกรณ์ที่มีช่องว่าง โบนัสจะติดถาวร สมุดสะสมซิกิลให้รางวัลเมื่อสะสมครบทั้งดินแดน'],
  ['Party and voice','ปาร์ตี้และเสียง',
   'Hunt near other players for a party bonus. In a party, tap 🎙 in the party box to talk; when someone in your party is talking you start listening by yourself. Follow walks behind a party member, through gates too.',
   'ล่าใกล้ผู้เล่นอื่นเพื่อรับโบนัสปาร์ตี้ ในปาร์ตี้ แตะ 🎙 ในกล่องปาร์ตี้เพื่อพูด เมื่อมีคนในปาร์ตี้พูด คุณจะเริ่มฟังเอง ปุ่มติดตามจะเดินตามเพื่อนในปาร์ตี้ ผ่านประตูได้ด้วย'],
  ['Duels, arena and guilds','ดวล อารีน่า และกิลด์',
   'Challenge someone in the same region with the Duel button in the online list: the first to fall to 1 HP loses, nobody dies. The Arena Master in Hearthvale lets you into the open arena. With an account you can found a guild for 10,000 gold.',
   'ท้าดวลคนในดินแดนเดียวกันด้วยปุ่มดวลในรายชื่อออนไลน์: ใครเหลือ 1 HP ก่อนแพ้ ไม่มีใครตาย ผู้ดูแลอารีน่าในฮาร์ธเวลพาเข้าอารีน่าเปิด ถ้ามีบัญชีสามารถตั้งกิลด์ได้ด้วยเงิน 10,000'],
  ['World bosses','บอสโลก',
   'Every so often a huge boss appears somewhere and everyone online is told where. Whoever deals the most damage is the MVP and wins a rare prize. Bring friends.',
   'นาน ๆ ครั้งจะมีบอสยักษ์ปรากฏที่ไหนสักแห่ง และทุกคนที่ออนไลน์จะได้รับแจ้ง ใครทำดาเมจมากที่สุดคือ MVP และได้รางวัลหายาก ชวนเพื่อนไปด้วย'],
  ['The screen','หน้าจอ',
   'The box at the top left shows your HP and SP; tap − to shrink it. When you fight, the box at the top shows your target; tap its + for its level, element and drops. Days last 24 minutes and nights are dark; regions have their own weather.',
   'กล่องซ้ายบนแสดง HP และ SP แตะ − เพื่อย่อ เวลาสู้ กล่องด้านบนแสดงเป้าหมาย แตะ + เพื่อดูเลเวล ธาตุ และของดรอป หนึ่งวันยาว 24 นาที กลางคืนจะมืด แต่ละดินแดนมีอากาศของตัวเอง'],
  ['Saving','การบันทึก',
   'Your progress saves by itself. Log in with an account to keep it safe and play it on another phone.',
   'ความคืบหน้าบันทึกเอง ล็อกอินด้วยบัญชีเพื่อเก็บไว้อย่างปลอดภัยและเล่นต่อบนโทรศัพท์เครื่องอื่น']];
function helpPhoneHtml(){const th=typeof LANG!=='undefined'&&LANG==='th';
  return `<h2>${th?'วิธีเล่น':'How to play'}</h2><p class="say">${th?'Embervale เป็นเกม RPG แอ็กชันที่เล่นด้วยนิ้วโป้ง ล่ามอนสเตอร์เพื่อรับค่าประสบการณ์ ทอง ของ และซิกิลหายาก':'Embervale is an action RPG you play with your thumbs. Hunt monsters for experience, gold, loot and rare sigils.'}</p>`+
    `<div class="helpph">`+HELP_PHONE.map(([t,tt,e,et])=>`<div class="hph"><b>${th?tt:t}</b><span>${th?et:e}</span></div>`).join('')+`</div>`;}
(()=>{const st=document.createElement('style');st.textContent=`
#panel .helpph{display:flex;flex-direction:column;gap:8px;margin:6px 0 10px}
#panel .hph{padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(232,194,90,.18);line-height:1.5}
#panel .hph b{display:block;color:#ffd77a;font-size:14px;margin-bottom:2px}#panel .hph span{font-size:13px;color:#e8e2d4}`;document.head.appendChild(st);})();
