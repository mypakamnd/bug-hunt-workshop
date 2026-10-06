# QuickShift app — domain rules & folder map

> **PROJECT: quickshift — แอปหางานพาร์ทไทม์รายวัน (แอปที่ใช้ใน Bug Hunt workshop).**
> Entry point for both skills. Read this before deciding which cases must exist
> (Skill 1) or what an Expected Result should say (Skill 2).
>
> โครงไฟล์ปรับจาก `generate-test-cases/projects/daywork_app` (2026-10-06)

## The two skills in this folder

| Task | Spec | Grammar | Writes |
| ---- | ---- | ------- | ------ |
| **Create Test Case** — the case *names* | `generate_tc.md` | `prompt_tc.txt` | columns **F:G** on a naming tab (`Traceability_Record`) |
| **Generate Detail** — Type / Step / Data / Expected | `generate_detail.md` | `prompt_detail.txt` | columns **E, H, I, J** on an `F##_*` feature tab |

`pre_steps.json` holds the setup prefix per tab / scenario.
`Traceability_Record-QS-101.csv` is a filled example of the naming tab.

## What this file is for

The product rules that reading a flow or a screenshot **cannot** tell you, and
that the QA owner confirmed or corrected: which states a record can sit in, what
a status change forbids afterwards, which counters move, limits that are not
printed on screen.

### What does NOT belong here

- A transcription of a flow chart, a UI screenshot or a requirement document.
  Those are inputs to a run, not decisions. If a rule is only legible by looking
  at the source again, it is not a rule yet — ask, then write the answer here.
- Generation method or naming grammar — those live in the four spec files above.

## Where a correction goes

| The user corrects… | Write it in |
| ------------------ | ----------- |
| how the product behaves | `domain.md` (this file) |
| which cases must exist / how to name them | `generate_tc.md` **and** `prompt_tc.txt` |
| what Steps / Data / Expected look like | `generate_detail.md` **and** `prompt_detail.txt` |

Both files of a pair, in the same turn.

## Known project shape

- It is a **mobile app** with one role, **ผู้หางาน**. `pre_steps` start from
  **`เปิดแอป QuickShift`**. Navigation is by screens and the bottom tabs
  **"หางาน"** and **"งานที่สมัคร"**.
- Screens: หน้ารายการงาน → หน้ารายละเอียดงาน → หน้าใบสมัคร → หน้าสมัครสำเร็จ,
  and หน้างานที่สมัคร.
- Feature tabs:

  | Tab | Feature | Requirement |
  | --- | ------- | ----------- |
  | `F01_Job_Search` | ค้นหาและเรียงงาน | REQ-01 – REQ-06 |
  | `F02_Apply_Job` | รายละเอียดงานและการสมัคร | REQ-07 – REQ-14 |
  | `F03_My_Applications` | งานที่สมัครและการยกเลิก | REQ-15 – REQ-17 |

- Test Level is the **four-value** scale (`Automate` / `Semi-Auto` / `Merged` /
  `Manual`), classified in `generate_detail.md`. No automation suite exists yet.

## Domain rules — how the product behaves

### QS-101 · Job Search & Apply

**States a job can sit in** — each changes what is allowed next, so each earns a case:

| State | How it shows | Apply allowed |
| ----- | ------------ | ------------- |
| เปิดรับ | การ์ดปกติ (มีป้าย "ด่วน" ถ้าใกล้วันเริ่มงาน) | ได้ |
| ปิดรับแล้ว | ป้าย "ปิดรับแล้ว" บนการ์ด | **ไม่ได้** (REQ-07) |

**Counters and badges are Expected Results, never cases of their own:**

- "พบ X งาน" ต้องเท่ากับจำนวนงานที่ตรงกับคำค้น (REQ-04) → อยู่ใน Expected ของทุก case ค้นหา
- ป้าย "ด่วน" / "ปิดรับแล้ว" → อยู่ใน Expected ของ case แสดงผลหน้ารายการ
- ตัวเลขบนแท็บ "งานที่สมัคร" ต้องตรงกับจำนวนใบสมัคร ทั้งตอนสมัครและตอนยกเลิก (REQ-15)
  → อยู่ใน Expected ของ case สมัครสำเร็จ และ case ยกเลิกสำเร็จ

**Confirmed rules:**

- ค่าจ้างทุกงานแสดงเป็น **บาทต่อวัน** (REQ-05)
- ค้นหาได้จาก **ชื่องานหรือสถานที่** (REQ-02)
- เรียงตามค่าจ้างต้องเรียงแบบ **ตัวเลข** จากมากไปน้อย (REQ-03)
- อายุผู้สมัคร **18 ปีขึ้นไป** → boundary คือ 17 (ไม่ผ่าน) / 18 (ผ่าน) (REQ-09)
- ชื่อ-นามสกุลต้องกรอก และ **ช่องว่างล้วนนับเป็นไม่กรอก** (REQ-08)
- วันที่เริ่มงานได้ **ต้องไม่เป็นวันในอดีต** (REQ-11)
- **สมัครงานเดิมซ้ำไม่ได้** (REQ-13) → การสมัครครั้งที่ 2 ของงานเดียวกันเป็น case ของตัวเอง
- หน้าสมัครสำเร็จต้องแสดง **ชื่องานที่เพิ่งสมัคร** (REQ-14)
- ยกเลิกใบสมัครหนึ่งใบ **ใบอื่นต้องยังอยู่ครบ** (REQ-16) → case แบบ "ไม่มีอะไรเปลี่ยน"

## Open questions — carry these into the next run

Every run must leave its unanswered questions here rather than in the chat.
These came from reading the QuickShift requirement (PRD v0.3):

- **REQ-01** "งานล่าสุด" เรียงตามวันโพสต์หรือวันเริ่มงาน? "งานทั้งหมด" รวมงานที่ปิดรับไหม?
- **REQ-02** ค้นหาด้วยคำบางส่วนได้ไหม? ค้นภาษาอังกฤษ / ตัวพิมพ์เล็กใหญ่ได้ไหม?
- **REQ-06** "เร็ว ๆ นี้" ของป้าย "ด่วน" คือภายในกี่วัน? นับวันนี้ไหม?
- **REQ-07** "ไม่ควรทำให้ผู้ใช้สับสน" → ซ่อนงานที่ปิดรับ หรือแสดงพร้อมป้ายและปิดปุ่ม? วันสุดท้ายยังสมัครได้ไหม?
- **REQ-08** ชื่อ-นามสกุลช่องเดียวหรือแยก? ภาษาอังกฤษได้ไหม? ยาวได้แค่ไหน?
- **REQ-09** กรอกอายุเองหรือคำนวณจากวันเกิด? มีอายุสูงสุดไหม?
- **REQ-10** เบอร์โทร "ถูกต้อง" คือรูปแบบไหน (10 หลัก ขึ้นต้น 0? มีขีดได้ไหม?)
- **REQ-11** วันนี้นับเป็นอดีตไหม? ต้องไม่เกินวันเริ่มงานไหม?
- **REQ-12** resume "ไม่ใหญ่เกินไป" คือกี่ MB? รับไฟล์ประเภทไหน? บังคับแนบไหม?
- **REQ-14** แจ้งเตือนทางไหน (หน้าจอ / SMS / อีเมล / push)?
- **REQ-16** ยกเลิกได้ถึงเมื่อไร? ต้องยืนยันก่อนไหม? ยกเลิกแล้วสมัครใหม่ได้ไหม?
- **REQ-17** "ใช้งานง่าย" และ "โหลดเร็ว" วัดอย่างไร?

### Assumptions made in the first detail run (2026-10-06) — confirm or correct

- ข้อความ error ของเบอร์โทรศัพท์ใช้ `"กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง"` (requirement ไม่ได้ระบุ copy) — `F02` TC010
- ไม่กรอกอายุ แสดงข้อความเดียวกับอายุต่ำกว่า 18: `"ผู้สมัครต้องมีอายุ 18 ปีขึ้นไป"` — `F02` TC008
- เลือกวันที่ในอดีต ถูก **บล็อก** ไม่ใช่ inline validation — `F02` TC012
- งานที่ปิดรับแล้ว **ยังแสดง** ในรายการ และปุ่ม "สมัครงานนี้" ถูก **disable** (REQ-07 ยังไม่ชัดว่าซ่อนหรือ disable) — `F02` TC016
- สมัครซ้ำ ถูก **บล็อก** ไม่มี copy ข้อความเฉพาะ — `F02` TC015
- "ล่าสุด" = เรียงตาม **วันที่โพสต์** (REQ-01) — `F01` TC001, TC002, TC004, TC008
