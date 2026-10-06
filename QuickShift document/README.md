# QuickShift document

เอกสารสำหรับเขียน test case ของแอป **QuickShift** (แอปใน Bug Hunt workshop)
โครงเดียวกับ `generate-test-cases/projects/daywork_app` ที่ทีมใช้จริง ปรับเมื่อ 2026-10-06

## อ่านไฟล์ไหนก่อน

| ลำดับ | ไฟล์ | ใช้ตอน | มีอะไร |
| --- | --- | --- | --- |
| 1 | `domain.md` | ทุกครั้ง | กฎของระบบที่ยืนยันแล้ว · สถานะของงาน · ตัวนับที่อยู่ใน Expected · **Open questions** |
| 2 | `generate_tc.md` | ตั้งชื่อ Test Case (ระดับ 1) | วิธีแตก Flow + UI เป็น case · ลำดับ case · Recommend Cases · **ตัวอย่าง QS101-SC01** |
| 3 | `prompt_tc.txt` | ตั้งชื่อ Test Case | ไวยากรณ์ชื่อ case ภาษาไทย (FUNCTIONAL / DISPLAY) |
| 4 | `generate_detail.md` | เขียนรายละเอียด (ระดับ 2) | วิธีเขียน Type / Step / Data / Expected · Test Level |
| 5 | `prompt_detail.txt` | เขียนรายละเอียด | template แยกตาม Test Type |
| – | `pre_steps.json` | เขียนรายละเอียด | ขั้นตอนเริ่มต้นของแต่ละ feature tab (`เปิดแอป QuickShift` …) |
| – | `Traceability_Record-QS-101.csv` | ตัวอย่าง | naming tab ที่กรอกแล้ว 27 case (ค้นหางาน 10 · สมัครงาน 17) เปิดด้วย Google Sheets / Excel ได้ |
| – | `F01_Job_Search.csv` · `F02_Apply_Job.csv` | ตัวอย่าง | feature tab ที่เขียน detail แล้ว (Test Type / Level / Step / Data / Expected) ตามชื่อ case ใน Traceability_Record |

## เชื่อมกับ session

- **หัวข้อ 2 · Thrive** ใช้ไฟล์ชุดนี้เป็นตัวอย่างของ "input ที่ดี" และ "กฎที่สอน AI"
- **Test Matrix ในสไลด์** = Worked example ใน `generate_tc.md` (คำค้น 4 × เรียงตาม 2)
- **Open questions** ใน `domain.md` ตรงกับ Req ไม่ชัดในเฉลยของ workshop

> ⚠️ ไฟล์ CSV ทั้ง 3 ไฟล์และ `domain.md` ใบ้คำตอบของ workshop ได้
> (เช่น case อายุ 17/18 และสมัครซ้ำ) อย่าแชร์ให้ผู้เล่นก่อนจบรอบ Workshop
> โฟลเดอร์นี้อยู่นอก `bug-hunt/` จึงไม่ถูก deploy ขึ้นเว็บ

## ถ้าจะใช้กับ skill `generate-test-cases` จริง

ยังไม่ได้ลงทะเบียน QuickShift เป็น project ใน skill ต้องทำเพิ่ม:

1. คัดลอกโฟลเดอร์นี้ไปเป็น `generate-test-cases/projects/quickshift/` (ไม่ต้องเอา README และ CSV ไป)
2. สร้าง Google Sheet ที่มี tab `Traceability_Record` และ `F01_Job_Search`, `F02_Apply_Job`, `F03_My_Applications`
3. เพิ่ม `"quickshift": { "spreadsheet_id": "<id>" }` ใน config ของ skill และแชร์ sheet ให้ service account
