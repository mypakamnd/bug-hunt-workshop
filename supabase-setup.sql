-- Bug Hunt: ตารางเก็บคำตอบ (รันครั้งเดียวใน Supabase → SQL Editor)

create table if not exists public.findings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  session     text not null check (char_length(session) between 1 and 80),
  round       text not null check (round in ('icebreak', 'full')),
  team        text not null check (char_length(team) between 1 and 40),
  kind        text check (kind in ('bug', 'req')),
  req         text check (char_length(req) <= 40),
  detail      text not null check (char_length(detail) between 1 and 600)
);

create index if not exists findings_session_created_idx on public.findings (session, created_at desc);

-- ผู้เล่น (anon) ส่งคำตอบและอ่านได้ แต่แก้ไขหรือลบไม่ได้
alter table public.findings enable row level security;

drop policy if exists "players can insert" on public.findings;
create policy "players can insert" on public.findings
  for insert to anon with check (true);

drop policy if exists "anyone can read" on public.findings;
create policy "anyone can read" on public.findings
  for select to anon using (true);

grant select, insert on public.findings to anon;

-- ล้างคำตอบของรอบซ้อม (แก้ชื่อ session ให้ตรงก่อนรัน):
-- delete from public.findings where session = 'level-up-2026-10-10';
