# Bug Hunt: QuickShift

เกมหาบั๊กสำหรับ session **Level Up!: Becoming Your Team's MVQ(A)**

## หน้าเว็บ (โฟลเดอร์ `bug-hunt/` คือสิ่งที่ deploy)

| URL | ไฟล์ | ใช้เมื่อไร | ผู้เล่นบันทึกอะไร |
|---|---|---|---|
| `/` | `index.html` | Ice breaking ก่อนเริ่ม session | ชื่อทีม + "เจออะไร" |
| `/full` | `full.html` | หลังจบ session | ชื่อทีม + Bug / Req ไม่ชัด + REQ ข้อไหน + รายละเอียด |
| `/dashboard` | `dashboard.html` | ผู้จัดเปิดดูหรือฉายขึ้นจอ | ดูว่าใครส่งอะไร แยกรอบ กรองตามทีม/ประเภท คัดลอก CSV |

ทั้งสองเกมใช้แอปและ requirement ชุดเดียวกัน (`assets/quickshift.js`) ผู้เล่นจึงเจอบั๊กเดิมได้อีกครั้งด้วยมุมมองใหม่หลัง session

## Deploy บน Vercel
```
cd bug-hunt
vercel --prod
```
`vercel.json` เปิด `cleanUrls` ไว้ จึงเข้า `/full` และ `/dashboard` ได้โดยไม่ต้องพิมพ์ `.html`

## เชื่อมฐานข้อมูล (Supabase) เพื่อให้ dashboard เห็นคำตอบ
1. สร้างโปรเจกต์ฟรีที่ supabase.com
2. SQL Editor → รัน `supabase-setup.sql`
3. Project Settings → API → คัดลอก **Project URL** และ **anon / publishable key**
4. ใส่ใน `bug-hunt/config.js` แล้ว deploy ใหม่
5. จัดรอบใหม่ให้เปลี่ยน `session` ใน `config.js` คำตอบแต่ละรอบจะแยกกัน

ถ้ายังไม่ได้ตั้งค่า เกมยังเล่นได้ตามปกติ คำตอบเก็บในเครื่องผู้เล่น ตอนจบให้กด "คัดลอกทั้งหมด" แล้ววางในแชท

**เรื่องความปลอดภัย:** anon key ถูกออกแบบให้อยู่ในหน้าเว็บได้ ตารางนี้เปิดให้ทุกคนที่มี key ส่งและอ่านคำตอบได้ แต่แก้หรือลบไม่ได้ อย่าใส่ `service_role` key ใน `config.js` เด็ดขาด ใครรู้ URL `/dashboard` ก็เปิดดูคำตอบได้ อย่าแชร์ลิงก์นี้ระหว่างเกม

## ไฟล์ที่ไม่ deploy
- `bug-hunt-answer-key.md` เฉลยสำหรับผู้จัด
- `supabase-setup.sql` สคริปต์สร้างตาราง
