-- Bergtage: gemeinsamer Speicher für Gruppen (Supabase)
--
-- Einrichtung:
--   1. Auf supabase.com ein kostenloses Projekt anlegen.
--   2. Im Projekt den SQL-Editor öffnen, diesen ganzen Text einfügen und ausführen.
--   3. Unter "Project Settings > API" die Projekt-Adresse (https://….supabase.co) und den
--      öffentlichen Schlüssel ("anon" bzw. "publishable") kopieren.
--   4. Beides in der App unter Einstellungen > Online-Speicher eintragen
--      oder fest in die Datei config.js schreiben.
--
-- Sicherheit: Wer den Einladungscode einer Gruppe kennt, kann deren Einträge lesen und ändern.
-- Es werden nur Name, Farbe und die Tage (Datum, Gebiet, Kilometer, Wert der Tageskarte) gespeichert.
-- Das passt für Freunde und Familie, nicht für vertrauliche Daten.

create table if not exists bt_groups (
  code       text primary key check (code ~ '^[A-Z0-9]{6}$'),
  name       text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now()
);

create table if not exists bt_members (
  group_code text not null references bt_groups(code) on delete cascade,
  member_id  text not null check (char_length(member_id) between 6 and 40),
  name       text not null check (char_length(name) between 1 and 40),
  color      text,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (group_code, member_id)
);

alter table bt_groups  enable row level security;
alter table bt_members enable row level security;

drop policy if exists "bt_groups lesen"      on bt_groups;
drop policy if exists "bt_groups anlegen"    on bt_groups;
drop policy if exists "bt_members lesen"     on bt_members;
drop policy if exists "bt_members anlegen"   on bt_members;
drop policy if exists "bt_members ändern"    on bt_members;
drop policy if exists "bt_members entfernen" on bt_members;

create policy "bt_groups lesen"      on bt_groups  for select to anon using (true);
create policy "bt_groups anlegen"    on bt_groups  for insert to anon with check (true);
create policy "bt_members lesen"     on bt_members for select to anon using (true);
create policy "bt_members anlegen"   on bt_members for insert to anon with check (true);
create policy "bt_members ändern"    on bt_members for update to anon using (true) with check (true);
create policy "bt_members entfernen" on bt_members for delete to anon using (true);

grant select, insert on bt_groups to anon;
grant select, insert, update, delete on bt_members to anon;
