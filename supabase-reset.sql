-- Bug Hunt: ล้างข้อมูลทดสอบทั้งหมด (รันใน Supabase → SQL Editor)
-- ⚠️ ลบคำตอบทุกข้อและชื่อทีมทุกทีมของทุก session ย้อนกลับไม่ได้
-- ตารางและสิทธิ์ (RLS) ยังอยู่ครบ ไม่ต้องรัน supabase-setup.sql ใหม่

begin;
truncate table public.findings, public.teams;
commit;

-- ตรวจผล: ทั้งสองค่าควรเป็น 0
select
  (select count(*) from public.findings) as findings_left,
  (select count(*) from public.teams)    as teams_left;

-- ถ้าอยากลบเฉพาะบาง session ให้ใช้แทนบรรทัด truncate ด้านบน:
-- delete from public.findings where session = 'level-up-2026-10-10';
-- delete from public.teams    where session = 'level-up-2026-10-10';
