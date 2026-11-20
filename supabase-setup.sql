-- Bergtage: Datenbank für Konten, persönliche Daten und Gruppen (Supabase)
--
-- Im Supabase-Projekt den SQL-Editor öffnen, diesen ganzen Text einfügen und ausführen.
-- Das Skript lässt sich mehrfach ausführen.
--
-- Schutz: Row Level Security. Jede Person liest und ändert nur ihre eigenen Daten.
-- Name, Farbe und die geteilten Tage (Datum, Gebiet, km, Wert der Tageskarte) sehen nur
-- Personen, die mit ihr in derselben Gruppe sind. Gruppen findet man nur mit dem Code.

-- Alte Tabellen aus der Version ohne Konten entfernen
drop table if exists bt_members;
drop table if exists bt_groups;

-- Private Daten: der ganze App-Zustand (Tage, Favoriten, Preise, TopCard …)
create table if not exists user_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Öffentliches Profil innerhalb von Gruppen
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '' check (char_length(name) <= 40),
  color      text,
  shared     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists groups (
  code       text primary key check (code ~ '^[A-Z0-9]{6}$'),
  name       text not null check (char_length(name) between 1 and 60),
  owner      uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  group_code text not null references groups(code) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (group_code, user_id)
);

alter table user_state    enable row level security;
alter table profiles      enable row level security;
alter table groups        enable row level security;
alter table group_members enable row level security;

-- Hilfsfunktionen (security definer, damit die Regeln sich nicht gegenseitig aufrufen)
create or replace function is_member(p_code text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where group_code = p_code and user_id = auth.uid());
$$;

create or replace function shares_group(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from group_members a join group_members b on a.group_code = b.group_code
    where a.user_id = auth.uid() and b.user_id = p_user);
$$;

create or replace function create_group(p_name text) returns text
language plpgsql security definer set search_path = public as $$
declare c text; chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  loop
    c := '';
    for i in 1..6 loop c := c || substr(chars, 1 + floor(random() * length(chars))::int, 1); end loop;
    exit when not exists (select 1 from groups where code = c);
  end loop;
  insert into groups(code, name, owner) values (c, trim(p_name), auth.uid());
  insert into group_members(group_code, user_id) values (c, auth.uid());
  return c;
end; $$;

create or replace function join_group(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare n text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select name into n from groups where code = upper(trim(p_code));
  if n is null then return null; end if;
  insert into group_members(group_code, user_id) values (upper(trim(p_code)), auth.uid()) on conflict do nothing;
  return n;
end; $$;

-- Regeln
drop policy if exists "eigener Zustand" on user_state;
create policy "eigener Zustand" on user_state for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Profil lesen" on profiles;
drop policy if exists "Profil schreiben" on profiles;
drop policy if exists "Profil ändern" on profiles;
create policy "Profil lesen"     on profiles for select to authenticated using (id = auth.uid() or shares_group(id));
create policy "Profil schreiben" on profiles for insert to authenticated with check (id = auth.uid());
create policy "Profil ändern"    on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Gruppe lesen" on groups;
create policy "Gruppe lesen" on groups for select to authenticated using (is_member(code));

drop policy if exists "Mitglieder lesen" on group_members;
drop policy if exists "Gruppe verlassen" on group_members;
create policy "Mitglieder lesen" on group_members for select to authenticated using (is_member(group_code));
create policy "Gruppe verlassen" on group_members for delete to authenticated using (user_id = auth.uid());

-- Rechte: nur angemeldete Personen, nur über die Regeln oben
revoke all on user_state, profiles, groups, group_members from anon;
grant select, insert, update, delete on user_state to authenticated;
grant select, insert, update on profiles to authenticated;
grant select on groups to authenticated;
grant select, delete on group_members to authenticated;
revoke execute on function is_member(text), shares_group(uuid), create_group(text), join_group(text) from public, anon;
grant execute on function is_member(text), shares_group(uuid), create_group(text), join_group(text) to authenticated;

-- Konto löschen: entfernt das Konto und über "on delete cascade" alle Daten und Mitgliedschaften
create or replace function delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end; $$;
revoke execute on function delete_my_account() from public, anon;
grant execute on function delete_my_account() to authenticated;
