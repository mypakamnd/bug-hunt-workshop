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

-- ชื่อทีม: จองได้ทีมละครั้งต่อ session + รอบ (ไม่สนตัวพิมพ์เล็กใหญ่และช่องว่างหัวท้าย)
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  session     text not null check (char_length(session) between 1 and 80),
  round       text not null check (round in ('icebreak', 'full')),
  team        text not null check (char_length(btrim(team)) between 1 and 40),
  team_key    text generated always as (lower(btrim(team))) stored,
  unique (session, round, team_key)
);

alter table public.teams enable row level security;

drop policy if exists "players can claim a team" on public.teams;
create policy "players can claim a team" on public.teams
  for insert to anon with check (true);

drop policy if exists "anyone can read teams" on public.teams;
create policy "anyone can read teams" on public.teams
  for select to anon using (true);

grant select, insert on public.teams to anon;

-- ล้างคำตอบของรอบซ้อม (แก้ชื่อ session ให้ตรงก่อนรัน):
-- delete from public.findings where session = 'level-up-2026-10-10';
-- delete from public.teams    where session = 'level-up-2026-10-10';
