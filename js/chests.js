"use strict";
/* ================= treasure chests: removed in v1.14.4 =================
   The field regions no longer hide treasure chests (plain or locked). Only the Rusty Key item stays defined, so keys
   already in a bag or storage still show and can be sold. */
ITEMS.rustykey={name:'Rusty Key',type:'etc',price:50,col:'#b07a42',g:'⚷',w:1,desc:'An old key. The chests it opened are gone; sell it to a shop.'};
if(typeof LANG!=='undefined'&&LANG==='th')ITEMS.rustykey.desc='กุญแจเก่า หีบที่ใช้เปิดไม่มีแล้ว ขายให้ร้านค้าได้';
