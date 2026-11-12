"use strict";
/* ================= Thai version (ภาษาไทย) =================
   A translation layer: the game keeps writing its English text, and when Thai is chosen this file swaps
   what appears on screen: window text, buttons, tooltips and log messages (exact phrases, plus patterns for
   messages with numbers in them). Names of people, monsters, items and places stay as they are for now.
   The choice is remembered in this browser; switching reloads the page. */
const LANG=(()=>{try{const q=new URLSearchParams(location.search).get('lang');if(q==='th'||q==='en')return q;return localStorage.getItem('embervale.lang')==='th'?'th':'en';}catch(e){return 'en';}})();
document.documentElement.lang=LANG;
const TH={
  // title screen and creator
  'New adventure':'เริ่มการผจญภัยใหม่','Continue':'เล่นต่อ','Name your adventurer':'ตั้งชื่อนักผจญภัย','Adventurer name':'ชื่อนักผจญภัย','Your adventurer':'นักผจญภัยของคุณ',
  'Appearance':'รูปลักษณ์','Build':'รูปร่าง','Hair':'ทรงผม','Color':'สี','Eyes':'ดวงตา','Skin':'สีผิว','Surprise me':'สุ่มให้หน่อย','Standard':'มาตรฐาน','Broad':'บึกบึน','Slender':'เพรียว',
  'Spiky':'ผมตั้ง','Long':'ผมยาว','Ponytail':'หางม้า','Twin tails':'แกละคู่','Bob':'บ็อบ','Curly':'หยิก',
  'Account':'บัญชี','Log in':'เข้าสู่ระบบ','Log out':'ออกจากระบบ','Create account':'สร้างบัญชี','Username':'ชื่อผู้ใช้','Password':'รหัสผ่าน','Signed in as':'เข้าสู่ระบบในชื่อ',
  'Move my guest character to this account':'ย้ายตัวละครแขกมาที่บัญชีนี้','Erase and start':'ลบแล้วเริ่มใหม่','Keep my save':'เก็บเซฟไว้','Start a new adventure?':'เริ่มการผจญภัยใหม่?',
  'Start a new adventure? Your saved character will be erased.':'เริ่มการผจญภัยใหม่? ตัวละครที่บันทึกไว้จะถูกลบ','About Embervale':'เกี่ยวกับ Embervale','Controls':'การควบคุม',
  'On a phone: tap to walk and attack, and use the round buttons on the right.':'บนมือถือ: แตะเพื่อเดินและโจมตี และใช้ปุ่มกลมด้านขวา','Preview of your adventurer':'ตัวอย่างนักผจญภัยของคุณ',
  'Next build':'รูปร่างถัดไป','Previous build':'รูปร่างก่อนหน้า','Next hairstyle':'ทรงผมถัดไป','Previous hairstyle':'ทรงผมก่อนหน้า','Wanderer':'นักพเนจร','Novice':'มือใหม่',
  // HUD, buttons, dock
  'Attack':'โจมตี','Auto':'อัตโนมัติ','Loot':'เก็บของ','Best':'ของดี','Chat':'แชท','Sit':'นั่ง','Emote':'อีโมต','Menu':'เมนู','Map':'แผนที่','Info':'ข้อมูล','Send':'ส่ง','Join':'เข้าร่วม','Leave':'ออก','Trade':'แลกเปลี่ยน',
  'Stats':'สถานะ','Items':'ไอเทม','Skills':'สกิล','Equip':'สวมใส่','Quests':'เควส','Guild':'กิลด์','Emotes':'อีโมต','Settings':'ตั้งค่า','Sound':'เสียง','Solo':'คนเดียว',
  'Stats (C)':'สถานะ (C)','Items (I)':'ไอเทม (I)','Skills (K)':'สกิล (K)','Equipment (Alt+Q)':'อุปกรณ์ (Alt+Q)','Quest log (J)':'บันทึกเควส (J)','Guild (G)':'กิลด์ (G)','World map (M)':'แผนที่โลก (M)','Emotes (E)':'อีโมต (E)',
  'Settings (O) · help is H':'ตั้งค่า (O) · ช่วยเหลือกด H','Music and sound':'เพลงและเสียง','Music and sound on or off':'เปิด/ปิดเพลงและเสียง','Auto-hunt':'ล่าอัตโนมัติ','Auto-hunt on or off':'เปิด/ปิดการล่าอัตโนมัติ',
  'Auto-hunt collects drops':'ล่าอัตโนมัติเก็บของดรอป','Auto-hunt collects every drop':'ล่าอัตโนมัติเก็บของดรอปทุกชิ้น','Auto-hunt collects only equipment, sigils and boss drops':'ล่าอัตโนมัติเก็บเฉพาะอุปกรณ์ ซิจิล และของจากบอส',
  'Chat (Enter)':'แชท (Enter)','Sit to rest (X)':'นั่งพัก (X)','Attack nearest (Tab)':'โจมตีตัวที่ใกล้ที่สุด (Tab)','Attack the nearest monster (Tab)':'โจมตีมอนสเตอร์ที่ใกล้ที่สุด (Tab)',
  'Collapse the status box':'ย่อกล่องสถานะ','Collapse the status box (B)':'ย่อกล่องสถานะ (B)','Expand the status box (B)':'ขยายกล่องสถานะ (B)','Players online':'ผู้เล่นออนไลน์','Who is online':'ใครออนไลน์อยู่',
  'Game menu':'เมนูเกม','Monster info (right-click a monster)':'ข้อมูลมอนสเตอร์ (คลิกขวาที่มอนสเตอร์)','Show monster details':'แสดงรายละเอียดมอนสเตอร์','Say something to everyone online':'พูดกับทุกคนที่ออนไลน์',
  'Chat message':'ข้อความแชท','Safe town':'เมืองปลอดภัย','Capital city':'เมืองหลวง','Make the chat box bigger':'ขยายกล่องแชท','Make the chat box smaller':'ย่อกล่องแชท','New messages ↓':'ข้อความใหม่ ↓',
  'Only what players say: no system messages':'เฉพาะข้อความผู้เล่น ไม่มีข้อความระบบ','Bigger minimap':'ขยายแผนที่ย่อ','Smaller minimap':'ย่อแผนที่ย่อ','Tap to walk there · M for the world map':'แตะเพื่อเดินไปที่นั่น · M เปิดแผนที่โลก',
  'Edit the hotbar':'แก้ไขแถบลัด','More or fewer hotbar rows':'เพิ่ม/ลดแถวแถบลัด','Photo':'ถ่ายภาพ',
  // chat tabs
  'All':'ทั้งหมด','Party':'ปาร์ตี้','Whisper':'กระซิบ','Room':'ห้อง',
  // death, party, trade
  'You have fallen':'คุณพ่ายแพ้','You lost some experience.':'คุณเสียค่าประสบการณ์บางส่วน','Return to Hearthvale':'กลับสู่ Hearthvale','Party invitation':'คำเชิญเข้าปาร์ตี้','invites you to their party.':'เชิญคุณเข้าปาร์ตี้',
  'No thanks':'ไม่เป็นไร','Trade request':'คำขอแลกเปลี่ยน','wants to trade with you.':'ต้องการแลกเปลี่ยนกับคุณ','Party loot rule':'กติกาแบ่งของในปาร์ตี้','Each keeps own':'ต่างคนต่างเก็บ','Take turns':'ผลัดกันเก็บ',
  'Fold the party box':'ย่อกล่องปาร์ตี้',
  // panels
  'Equipment':'อุปกรณ์','Your bag':'กระเป๋าของคุณ','Combat':'การต่อสู้','Quest log':'บันทึกเควส','World map':'แผนที่โลก','Hotbar':'แถบลัด','Skill tree':'ต้นไม้สกิล','Achievements':'ความสำเร็จ',
  'Remove':'ถอด','Wear':'สวมใส่','Buy':'ซื้อ','Sell':'ขาย','Sell 1':'ขาย 1','Sell all':'ขายทั้งหมด','Store':'ร้านค้า','Take':'หยิบ','Cancel':'ยกเลิก','Back':'กลับ','Done':'เสร็จ','Close':'ปิด','close':'ปิด',
  'Accept':'ตกลง','Abandon':'ยกเลิกเควส','Go':'ไป','Ride':'ขี่','Heal':'รักษา','Refine':'ตีบวก','Cut':'เจียระไน','Notes':'บันทึก','Fight':'สู้','Goodbye':'ลาก่อน','Not now':'ไว้ทีหลัง','Next ▸':'ถัดไป ▸',
  'Drops':'ของดรอป','Element':'ธาตุ','Found in':'พบได้ที่','Inflicts':'ทำให้ติดสถานะ','Behaviour':'พฤติกรรม','Size and race':'ขนาดและเผ่าพันธุ์','Base EXP':'EXP ฐาน','Job EXP':'EXP อาชีพ',
  'Your hit chance':'โอกาสโจมตีโดน','You dodge':'โอกาสหลบ','Weight':'น้ำหนัก','Range':'ระยะ','Attacks/sec':'การโจมตี/วินาที','Attacks/s':'การโจมตี/วิ','Vs size S/M/L':'ต่อขนาด เล็ก/กลาง/ใหญ่',
  'Materials':'วัตถุดิบ','In storage':'ในคลัง','Stable':'คอกสัตว์','Festival calendar':'ปฏิทินเทศกาล','Hunting contracts':'สัญญาล่า','Members':'สมาชิก','Top 20':'อันดับ 20',
  'Display':'การแสดงผล','Mouse':'เมาส์','Keys':'ปุ่ม','Music':'เพลง','Sound effects':'เอฟเฟกต์เสียง','Ambient sounds':'เสียงบรรยากาศ','Interface size':'ขนาดหน้าจอ','Weather and seasons':'สภาพอากาศและฤดูกาล',
  'Performance mode':'โหมดประสิทธิภาพ','Monster card':'การ์ดมอนสเตอร์','Saved in this browser.':'บันทึกไว้ในเบราว์เซอร์นี้','Open help':'เปิดคำช่วยเหลือ','Boxes, buttons and windows':'กล่อง ปุ่ม และหน้าต่าง',
  'Rain, snow, fog, embers, festival lanterns':'ฝน หิมะ หมอก ประกายไฟ โคมเทศกาล','Footsteps, birds, wind, drips and crowds':'เสียงเดิน นก ลม น้ำหยด และฝูงชน','Reset to default keys':'คืนค่าปุ่มเริ่มต้น',
  'Press Change, then the new key. A key already in use swaps with it. Esc cancels.':'กดเปลี่ยน แล้วกดปุ่มใหม่ ปุ่มที่ใช้อยู่แล้วจะสลับกัน กด Esc เพื่อยกเลิก','Language':'ภาษา',
  'How to play':'วิธีเล่น','Elements':'ธาตุ','Ailments':'สถานะผิดปกติ','Name colours':'สีของชื่อ','Chat commands':'คำสั่งแชท','Playing together':'เล่นด้วยกัน',
  'Clear slot':'ล้างช่อง','Reset to the usual layout':'คืนค่าการจัดเรียงปกติ','Back to my current look':'กลับไปลุคเดิม','Hair colour':'สีผม','Hairstyle':'ทรงผม',
  'Pin':'ปักหมุด','Pinned':'ปักหมุดแล้ว','Story: The Ember Below':'เนื้อเรื่อง: เถ้าถ่านใต้พิภพ','Open shop':'เปิดร้าน','Open a shop':'เปิดร้าน','Lock offer':'ล็อกข้อเสนอ','Set gold':'ใส่โกลด์',
  'You are here':'คุณอยู่ที่นี่','Not yet recorded':'ยังไม่มีบันทึก','The rite of rebirth':'พิธีเกิดใหม่','Seer Valen':'ผู้หยั่งรู้ Valen','Festival Keeper Pim':'ผู้ดูแลเทศกาล Pim',
  // common log and floating messages
  'Miss':'พลาด','Lucky!':'โชคดี!','Dodge':'หลบ','Cured!':'หายแล้ว!','Steady!':'มั่นคง!','Snatched!':'ถูกขโมย!','Weak!':'อ่อนแอ!','Interrupted!':'ถูกขัดจังหวะ!','Cast cancelled':'ยกเลิกร่าย',
  'Not enough SP':'SP ไม่พอ','Not in town':'ใช้ในเมืองไม่ได้','Too heavy!':'หนักเกินไป!','Out of reach':'ไกลเกินไป','Not yet!':'ยังไม่ได้!','Not yet…':'ยังก่อน…','Shattered!':'แตกแล้ว!','Fully refined.':'ตีบวกเต็มแล้ว',
  'You climb onto your mount.':'คุณขึ้นขี่สัตว์พาหนะ','You hop off.':'คุณลงจากสัตว์พาหนะ','You were knocked out of the saddle!':'คุณถูกกระแทกตกจากอาน!','You leave your mount at the entrance.':'คุณฝากสัตว์พาหนะไว้ที่ทางเข้า',
  'Storage is full.':'คลังเต็มแล้ว','Too heavy to carry that.':'หนักเกินกว่าจะถือได้','The scroll carries you home.':'ม้วนคัมภีร์พาคุณกลับบ้าน','Your ailments are cured.':'สถานะผิดปกติหายแล้ว',
  'You have no ailments to cure.':'คุณไม่มีสถานะผิดปกติ','You feel refreshed.':'คุณรู้สึกสดชื่น','You are connected.':'เชื่อมต่อแล้ว','The game server is not reachable right now.':'ตอนนี้เชื่อมต่อเซิร์ฟเวอร์เกมไม่ได้',
  'Then head east through the glowing gate to Greenmoss Meadow.':'แล้วเดินไปทางตะวันออกผ่านประตูเรืองแสงสู่ Greenmoss Meadow','Auto-hunt off.':'ปิดการล่าอัตโนมัติ',
  'Auto-hunt paused: you are out of tonics. Rest with Sit or buy more in town.':'หยุดล่าอัตโนมัติ: ยาหมดแล้ว นั่งพักหรือซื้อเพิ่มในเมือง',
  'Auto-hunt collects every drop.':'ล่าอัตโนมัติจะเก็บของดรอปทุกชิ้น','Monsters live outside town. Head through the glowing gate to the east.':'มอนสเตอร์อยู่นอกเมือง เดินผ่านประตูเรืองแสงทางตะวันออก',
  'You are not in a party.':'คุณไม่ได้อยู่ในปาร์ตี้','You are no longer in a party.':'คุณออกจากปาร์ตี้แล้ว','You are not in a guild. Press G to found or manage one.':'คุณไม่ได้อยู่ในกิลด์ กด G เพื่อตั้งหรือจัดการกิลด์',
  'You are not in a chat room.':'คุณไม่ได้อยู่ในห้องแชท','Join a chat room first: /join name.':'เข้าห้องแชทก่อน: /join ชื่อห้อง','You are no longer in a guild.':'คุณออกจากกิลด์แล้ว',
  'The game was running slowly, so Performance mode is now on for smoother play. You can change it in Settings.':'เกมทำงานช้า จึงเปิดโหมดประสิทธิภาพให้เล่นลื่นขึ้น เปลี่ยนได้ในตั้งค่า',
  'Your game froze for a moment, so those hits could not knock you out. Get to safety!':'เกมค้างไปชั่วครู่ การโจมตีเหล่านั้นจึงทำให้คุณล้มไม่ได้ รีบไปที่ปลอดภัย!',
  'A new version of Embervale is out with new monsters. Reload the page when you can to see them.':'Embervale มีเวอร์ชันใหม่พร้อมมอนสเตอร์ใหม่ รีโหลดหน้าเมื่อสะดวกเพื่อพบพวกมัน',
  'No skills learned yet. Learn them in the Skills window (K).':'ยังไม่ได้เรียนสกิล เรียนได้ในหน้าต่างสกิล (K)','You can now choose a calling. Talk to Guildmaster Corvin in Hearthvale.':'ตอนนี้คุณเลือกอาชีพได้แล้ว คุยกับ Guildmaster Corvin ใน Hearthvale',
  'Spend your 24 stat points first: open Stats (C).':'ใช้แต้มสถานะ 24 แต้มก่อน: เปิดสถานะ (C)','You can chat again.':'คุณแชทได้อีกครั้งแล้ว','Screenshot shared.':'แชร์ภาพหน้าจอแล้ว',
  'Leave Hearthvale with a club and a cotton tunic. Hunt across five regions, take up a calling, and go after the Ashen Warlord in the Cinder Crypt.':'ออกจาก Hearthvale พร้อมกระบองและเสื้อผ้าฝ้าย ล่ามอนสเตอร์ทั่วห้าภูมิภาค เลือกอาชีพ แล้วออกตามล่า Ashen Warlord ใน Cinder Crypt',
  'Log in to keep your character on the server and play from any device, or just play as a guest (saved on this device only).':'เข้าสู่ระบบเพื่อเก็บตัวละครไว้บนเซิร์ฟเวอร์และเล่นได้ทุกเครื่อง หรือเล่นเป็นแขก (บันทึกเฉพาะเครื่องนี้)',
  'Name':'ชื่อ','Lv 1–10':'Lv 1–10','Capital city':'เมืองหลวง','Ranked PvP':'จัดอันดับ PvP','Guild war':'สงครามกิลด์','Small':'เล็ก','Normal':'ปกติ','Large':'ใหญ่','ภาษา · the game reloads to switch':'ภาษา · เกมจะรีโหลดเพื่อเปลี่ยน',
  "The box with your target's name and HP in the middle (monsters also show HP over their heads)":'กล่องชื่อและ HP ของเป้าหมายกลางจอ (มอนสเตอร์มีแถบ HP เหนือหัวอยู่แล้ว)',
  'Off: only equipment, sigils and boss drops are collected; materials, tonics and gold are left (also the Loot button)':'ปิด: เก็บเฉพาะอุปกรณ์ ซิจิล และของจากบอส ทิ้งวัตถุดิบ ยา และโกลด์ไว้ (หรือใช้ปุ่มเก็บของ)',
  'Draws at lower resolution: smoother on slower phones. Switches on by itself if the game runs slowly':'วาดภาพที่ความละเอียดต่ำลง ลื่นขึ้นบนมือถือรุ่นช้า และจะเปิดเองถ้าเกมทำงานช้า',
  'Ride your mount (R)':'ขี่สัตว์พาหนะ (R)','Ride (R)':'ขี่ (R)',  'Auto-hunt: what should I pick up?':'ล่าอัตโนมัติ: จะให้เก็บอะไร?','Auto-hunt: what should it pick up?':'ล่าอัตโนมัติ: จะให้เก็บอะไร?','Everything':'ทุกอย่าง','Only valuable':'เฉพาะของมีค่า',
  'Materials, tonics, gold and gear':'วัตถุดิบ ยา โกลด์ และอุปกรณ์','Equipment, sigils, coloured items and boss drops':'อุปกรณ์ ซิจิล ไอเทมชื่อสี และของจากบอส',
  'Stand up (X)':'ลุกขึ้น (X)','Stand':'ลุกขึ้น',  'Write a message':'เขียนข้อความ','Write a message (Enter)':'เขียนข้อความ (Enter)',  'No mount yet':'ยังไม่มีสัตว์พาหนะ',"You don't have a mount yet. Tobin at the Waystation in Hearthvale keeps a stable (from Lv 10).":'คุณยังไม่มีสัตว์พาหนะ โทบินที่สถานีเดินทางใน Hearthvale มีคอกสัตว์ (ตั้งแต่ Lv 10)',  'Change':'เปลี่ยน','Move up':'เดินขึ้น','Move down':'เดินลง','Move left':'เดินซ้าย','Move right':'เดินขวา',
};
// messages with numbers or names in them
const TH_PAT=[
  [/^Lv (\d+)$/,'Lv $1'],[/^Job (\d+)$/,'อาชีพ $1'],[/^Job (max)$/,'อาชีพ สูงสุด'],[/^Weight ([\d,]+) \/ ([\d,]+)(.*)$/,(m,a,b,c)=>`น้ำหนัก ${a} / ${b}${c.replace(' · too heavy to fight',' · หนักเกินกว่าจะสู้').replace(' · no regen',' · ไม่ฟื้นพลัง')}`],
  [/^([\d,]+) gold(.*)$/,(m,a,b)=>`${a} โกลด์${b.replace(/ · (\d+) stat pts/,' · แต้มสถานะ $1').replace(/ · (\d+) skill pts/,' · แต้มสกิล $1')}`],
  [/^Base ([\d.]+)% · Job (.*)$/,(m,a,b)=>`ฐาน ${a}% · อาชีพ ${b.replace('max','สูงสุด')}`],
  [/^Base level (\d+)! You have (\d+) stat points to spend \(C\)\.(.*)$/,'เลเวลฐาน $1! คุณมีแต้มสถานะ $2 แต้มให้ใช้ (C)$3'],[/^Job level (\d+)! You have (\d+) skill points \(K\)\.$/,'เลเวลอาชีพ $1! คุณมีแต้มสกิล $2 แต้ม (K)'],
  [/^You got (.+?)( ×\d+)?\.$/,'คุณได้รับ $1$2'],[/^Equipped (.+)\.$/,'สวมใส่ $1 แล้ว'],[/^You enter (.+) \((.+)\)\.$/,(m,a,b)=>`คุณเข้าสู่ ${a} (${thText(b)})`],[/^Welcome to (.+), (.+)\.$/,'ยินดีต้อนรับสู่ $1, $2'],
  [/^Sold your loot for ([\d,]+) gold\.$/,'ขายของได้ $1 โกลด์'],[/^Sold (\d+) (.+) for ([\d,]+) gold\.$/,'ขาย $2 $1 ชิ้น ได้ $3 โกลด์'],[/^(.+) is active for (\d+)s\.$/,'$1 ทำงาน $2 วินาที'],
  [/^You have no (.+)\.$/,'คุณไม่มี $1'],[/^Requires base level (\d+)\.$/,'ต้องการเลเวลฐาน $1'],[/^Not enough gold\.?$/,'โกลด์ไม่พอ'],[/^(.+) is not online\.$/,'$1 ไม่ได้ออนไลน์'],
  [/^Auto-hunt on: .*Picking up: (.+)\.$/,(m,a)=>`เปิดล่าอัตโนมัติ: สู้กับมอนสเตอร์ที่ใกล้ที่สุด และดื่มยาเมื่อเลือดน้อย เก็บของ: ${a==='everything'?'ทุกอย่าง':'เฉพาะของมีค่า'}`],
  [/^Auto-hunt on: .*Collecting drops: (.+) \(the Loot button\)\.$/,(m,a)=>`เปิดล่าอัตโนมัติ: สู้กับมอนสเตอร์ที่ใกล้ที่สุด และดื่มยาเมื่อเลือดน้อย เก็บของ: ${a==='everything'?'ทุกอย่าง':'เฉพาะอุปกรณ์ ซิจิล และของจากบอส'} (ปุ่มเก็บของ)`],
  [/^Lv (\d+) · (.+)$/,'Lv $1 · $2'],[/^Party: (.+)$/,'ปาร์ตี้: $1'],[/^Contract: (.+)$/,'สัญญา: $1'],
  [/^✿ (.+) is on! Monsters drop (.+)s: trade them with Festival Keeper Pim by the fountain for a (.+)\.$/,'✿ $1 เริ่มแล้ว! มอนสเตอร์ดรอป $2: นำไปแลกกับผู้ดูแลเทศกาล Pim ที่น้ำพุเพื่อรับ $3'],
  [/^Event on now: (.+)$/,'กิจกรรมตอนนี้: $1'],[/^A (.+) snatched your (.+)! Defeat it to get it back\.$/,'$1 ขโมย $2 ของคุณ! ปราบมันเพื่อเอาคืน'],
  [/^(\d+) online$/,'ออนไลน์ $1'],[/^● (\d+) online$/,'● ออนไลน์ $1'],[/^Online · nobody else here yet$/,'ออนไลน์ · ยังไม่มีใครอยู่ที่นี่'],[/^(.+) · ☾ Night(.*)$/,(m,a,b)=>`${thText(a)} · ☾ กลางคืน${b.replace('Rain','ฝน').replace('Snow','หิมะ').replace('Fog','หมอก').replace('Blizzard','พายุหิมะ').replace('Sandstorm','พายุทราย').replace('Embers','ประกายไฟ')}`],[/^(.+) · ☀ Day(.*)$/,(m,a,b)=>`${thText(a)} · ☀ กลางวัน${b.replace('Rain','ฝน').replace('Snow','หิมะ').replace('Fog','หมอก').replace('Blizzard','พายุหิมะ').replace('Sandstorm','พายุทราย').replace('Embers','ประกายไฟ')}`],[/^(.+) · ◐ Dusk(.*)$/,(m,a,b)=>`${thText(a)} · ◐ พลบค่ำ${b.replace('Rain','ฝน').replace('Snow','หิมะ').replace('Fog','หมอก').replace('Blizzard','พายุหิมะ').replace('Sandstorm','พายุทราย').replace('Embers','ประกายไฟ')}`],[/^(.+) · ◑ Dawn(.*)$/,(m,a,b)=>`${thText(a)} · ◑ รุ่งเช้า${b.replace('Rain','ฝน').replace('Snow','หิมะ').replace('Fog','หมอก').replace('Blizzard','พายุหิมะ').replace('Sandstorm','พายุทราย').replace('Embers','ประกายไฟ')}`],
];
const TH_MEMO=new Map();
function thText(s){if(LANG!=='th'||!s)return s;const hit=TH_MEMO.get(s);if(hit!==undefined)return hit;const r=thText0(s);if(TH_MEMO.size>4000)TH_MEMO.clear();TH_MEMO.set(s,r);return r;}
function thText0(s){const k=s.trim();if(!k)return s;let t=TH[k];
  if(t===undefined){for(const [re,to] of TH_PAT)if(re.test(k)){t=k.replace(re,to);break;}}
  if(t===undefined||t===k)return s;const lead=s.match(/^\s*/)[0],trail=s.match(/\s*$/)[0];return lead+t+trail;}
// sweep the page: text nodes and the attributes people read (titles, labels, placeholders, quick tooltips)
const TH_ATTR=['title','aria-label','placeholder','data-tip'];
function thNode(n){if(n.nodeType===3){const p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)||p.closest&&p.closest('.l-chat,.l-whisper,.l-party,.l-guild,.l-room,#chatIn'))return;
    const v=n.nodeValue;if(n.__th===v)return;const t=thText(v);if(t!==v){n.__th=t;n.nodeValue=t;}else n.__th=v;return;}
  if(n.nodeType!==1)return;for(const a of TH_ATTR){const v=n.getAttribute&&n.getAttribute(a);if(v){const t=thText(v);if(t!==v)n.setAttribute(a,t);}}
  if(n.nodeName==='SCRIPT'||n.nodeName==='STYLE')return;for(const c of n.childNodes)thNode(c);}
if(LANG==='th'){
  const go=()=>{thNode(document.body);new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')thNode(m.target);else if(m.type==='attributes')thNode(m.target);else for(const n of m.addedNodes)thNode(n);}})
    .observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:TH_ATTR});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();}
// switching language (title screen and Settings): remember it and reload
function setLang(l){try{localStorage.setItem('embervale.lang',l);}catch(e){}if(typeof save==='function'&&typeof P!=='undefined'&&P)try{save(true);}catch(e){}location.reload();}
// words drawn on the game canvas (Miss, Lucky!, Not enough SP…) and the language buttons
document.addEventListener('DOMContentLoaded',()=>{
  if(LANG==='th'){if(typeof floatT==='function'){const _f=floatT;floatT=function(x,y,txt,...r){return _f(x,y,thText(String(txt)),...r);};}
    if(typeof label==='function'){const _l=label;label=function(txt,...r){return _l(thText(String(txt)),...r);};}}
  // a small switch on the title screen
  const t=document.getElementById('title');if(t&&!document.getElementById('langBtn')){const b=document.createElement('button');b.id='langBtn';b.type='button';b.className='btn small ghost';
    b.textContent=LANG==='th'?'English':'ภาษาไทย';b.setAttribute('aria-label',LANG==='th'?'Switch to English':'เปลี่ยนเป็นภาษาไทย');b.addEventListener('click',()=>setLang(LANG==='th'?'en':'th'));
    // in the title bar, next to About Embervale (so it never sits on top of anything)
    const about=t.querySelector('.aboutLink');if(about)about.insertAdjacentElement('afterend',b);else t.appendChild(b);}
},{once:true});
