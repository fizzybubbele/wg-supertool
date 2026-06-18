-- Household invite links for deep-link / WhatsApp sharing

create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_by uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index household_invites_household_id_idx on public.household_invites (household_id);
create index household_invites_token_idx on public.household_invites (token);

alter table public.household_invites enable row level security;

create policy "household_invites_select_owner"
  on public.household_invites for select
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_invites.household_id
        and hm.user_id = auth.uid()
        and hm.role = 'owner'
    )
  );

grant select on public.household_invites to authenticated;

create or replace function public.create_household_invite(p_household_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet';
  end if;

  if not exists (
    select 1 from public.household_members hm
    where hm.household_id = p_household_id
      and hm.user_id = auth.uid()
      and hm.role = 'owner'
  ) then
    raise exception 'Nur Haushalts-Inhaber können einladen';
  end if;

  insert into public.household_invites (household_id, created_by)
  values (p_household_id, auth.uid())
  returning token into v_token;

  return v_token;
end;
$$;

create or replace function public.get_household_invite_preview(p_token text)
returns table (household_id uuid, household_name text, expires_at timestamptz, is_valid boolean)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    h.id,
    h.name,
    i.expires_at,
    (i.accepted_at is null and i.expires_at > now()) as is_valid
  from public.household_invites i
  join public.households h on h.id = i.household_id
  where i.token = p_token;
end;
$$;

create or replace function public.accept_household_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.household_invites%rowtype;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Nicht angemeldet';
  end if;

  select * into v_invite
  from public.household_invites
  where token = p_token
    and accepted_at is null
    and expires_at > now();

  if not found then
    raise exception 'Einladung ungültig oder abgelaufen';
  end if;

  if exists (
    select 1 from public.household_members hm
    where hm.household_id = v_invite.household_id and hm.user_id = v_user_id
  ) then
    return v_invite.household_id;
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (v_invite.household_id, v_user_id, 'member');

  update public.household_invites
  set accepted_at = now()
  where id = v_invite.id;

  return v_invite.household_id;
end;
$$;

grant execute on function public.create_household_invite(uuid) to authenticated;
grant execute on function public.get_household_invite_preview(text) to authenticated;
grant execute on function public.accept_household_invite(text) to authenticated;
