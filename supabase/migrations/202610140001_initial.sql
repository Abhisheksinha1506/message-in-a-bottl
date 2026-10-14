-- Additive initial migration. Review before applying to a new Supabase project.
-- No application role receives direct INSERT/UPDATE/DELETE privileges.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.bottle_status as enum ('drifting', 'delivered', 'kept', 'discarded');
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  last_active timestamptz not null default now(),
  created_at timestamptz not null default now(),
  receive_limit integer not null default 5 check (receive_limit between 1 and 5),
  last_bottle_at timestamptz
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(btrim(content)) between 1 and 800),
  author_id uuid references public.profiles(id) on delete set null,
  mood text check (mood in ('calm','curious','melancholic','playful','grateful','hopeful')),
  status public.bottle_status not null default 'drifting',
  delay_until timestamptz not null,
  current_holder_id uuid references public.profiles(id) on delete set null,
  previous_holder_id uuid references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  pending_owner_id uuid references public.profiles(id) on delete set null,
  -- Directed replies must never become random bottles after account removal.
  is_reply boolean not null default false,
  reply_to_message_id uuid references public.messages(id) on delete set null,
  replied_at timestamptz,
  hop_count integer not null default 0 check (hop_count >= 0),
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  kept_at timestamptz,
  constraint holder_state check (
    (status in ('delivered','kept') and current_holder_id is not null)
    or (status in ('drifting','discarded') and current_holder_id is null)
  )
);
create table public.message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.messages(id) on delete set null,
  reply_bottle_id uuid unique references public.messages(id) on delete set null,
  from_user_id uuid references public.profiles(id) on delete set null,
  content text not null check (char_length(btrim(content)) between 1 and 800),
  created_at timestamptz not null default now()
);
create table public.message_history (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('released','delivered','replied','kept','discarded')),
  note text check (char_length(note) <= 200),
  hop integer not null default 0,
  created_at timestamptz not null default now()
);
-- Only safe IDs enter Realtime; messages contain private routing metadata.
create table public.inbox_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index profiles_active_idx on public.profiles(last_active);
create index messages_due_idx on public.messages(delay_until, id) where status = 'drifting';
create index messages_holder_idx on public.messages(current_holder_id, status, delivered_at desc);
create index messages_owner_pending_idx on public.messages(pending_owner_id) where status = 'drifting';
create index messages_target_pending_idx on public.messages(target_user_id) where status = 'drifting';
create index replies_message_idx on public.message_replies(message_id);
create index history_message_idx on public.message_history(message_id, created_at);
create index inbox_events_user_idx on public.inbox_events(user_id, created_at);

alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.message_replies enable row level security;
alter table public.message_history enable row level security;
alter table public.inbox_events enable row level security;
revoke all on public.profiles, public.messages, public.message_replies, public.message_history, public.inbox_events from anon, authenticated;
grant select on public.profiles to authenticated;
-- Column grants protect anonymous senders, including from direct REST queries.
grant select (id, content, mood, status, current_holder_id, hop_count, created_at, delivered_at, kept_at, replied_at, is_reply) on public.messages to authenticated;
grant select (id, message_id, action, note, hop, created_at) on public.message_history to authenticated;
grant select on public.inbox_events to authenticated;
grant all on public.profiles, public.messages, public.message_replies, public.message_history, public.inbox_events to service_role;
create policy profiles_self on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy bottles_holder on public.messages for select to authenticated using (current_holder_id = (select auth.uid()) and status in ('delivered','kept'));
-- Replies are exposed only as delivered message envelopes, never as raw rows.
create policy history_holder on public.message_history for select to authenticated using (
  exists (select 1 from public.messages m where m.id = message_id and m.current_holder_id = (select auth.uid()) and m.status in ('delivered','kept'))
);
create policy events_self on public.inbox_events for select to authenticated using (user_id = (select auth.uid()));

create function private.new_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id) values (new.id);
  return new;
end; $$;
create trigger auth_user_profile after insert on auth.users for each row execute function private.new_profile();

create function private.validate_text(value text, maximum integer) returns void language plpgsql set search_path = '' as $$
begin
  if value is null or char_length(btrim(value)) < 1 or char_length(value) > maximum then
    raise exception 'Please write between 1 and % characters.', maximum using errcode = 'P0001';
  end if;
  if lower(value) ~ '\m(fuck|shit|nigger|faggot)\M' then
    raise exception 'Please choose gentler words before releasing this bottle.' using errcode = 'P0001';
  end if;
end; $$;
create function private.random_arrival() returns timestamptz language sql volatile set search_path = '' as $$
  select now() + interval '6 hours' + random() * interval '66 hours';
$$;
create function private.pending_count(person uuid) returns bigint language sql stable security definer set search_path = '' as $$
  select count(*) from public.messages where
    (status = 'delivered' and current_holder_id = person)
    or (status = 'drifting' and (pending_owner_id = person or target_user_id = person));
$$;
-- A transaction-level advisory lock serializes quota-changing operations.
-- This trades throughput for simple, strong invariants in this small MVP.
create function private.lock_pool() returns void language sql volatile set search_path = '' as $$
  select pg_advisory_xact_lock(140610, 1);
$$;
create function private.require_user() returns uuid language plpgsql security definer set search_path = '' as $$
declare person uuid := auth.uid();
begin
  if person is null then raise exception 'Please sign in again.' using errcode = '42501'; end if;
  update public.profiles set last_active = now() where id = person;
  if not found then raise exception 'Your profile is unavailable.' using errcode = '42501'; end if;
  return person;
end; $$;

create function public.touch_profile() returns void language plpgsql security definer set search_path = '' as $$
begin perform private.require_user(); end; $$;
create function public.update_profile(p_display_name text, p_receive_limit integer) returns void language plpgsql security definer set search_path = '' as $$
declare person uuid;
begin
  perform private.lock_pool(); person := private.require_user();
  if p_receive_limit not between 1 and 5 or p_receive_limit is null then raise exception 'Choose a receive limit from 1 to 5.'; end if;
  if p_receive_limit < private.pending_count(person) then raise exception 'Keep or discard some bottles before lowering your limit.'; end if;
  if nullif(btrim(p_display_name), '') is not null then perform private.validate_text(p_display_name, 40); end if;
  update public.profiles set display_name = nullif(btrim(p_display_name), ''), receive_limit = p_receive_limit where id = person;
end; $$;
create function public.shore_stats() returns jsonb language plpgsql security definer set search_path = '' as $$
declare person uuid := private.require_user();
begin
  return jsonb_build_object(
    'pending', private.pending_count(person),
    'drifting', (select count(*) from public.messages where pending_owner_id = person and status = 'drifting'),
    'next_release_at', (select last_bottle_at + interval '12 hours' from public.profiles where id = person)
  );
end; $$;
create function public.release_bottle(p_content text, p_mood text default null) returns uuid language plpgsql security definer set search_path = '' as $$
declare person uuid; bottle uuid; last_release timestamptz;
begin
  perform private.lock_pool(); person := private.require_user();
  perform private.validate_text(p_content, 800);
  select last_bottle_at into last_release from public.profiles where id = person;
  if last_release > now() - interval '12 hours' then raise exception 'One new bottle every 12 hours. Let your last thought find its way.'; end if;
  if private.pending_count(person) >= (select receive_limit from public.profiles where id = person) then raise exception 'Your shore is full. Keep or discard a bottle, or wait for a delivery to make room.'; end if;
  insert into public.messages(content, author_id, previous_holder_id, pending_owner_id, mood, delay_until)
    values (btrim(p_content), person, person, person, p_mood, private.random_arrival()) returning id into bottle;
  update public.profiles set last_bottle_at = now() where id = person;
  insert into public.message_history(message_id, actor_id, action) values (bottle, person, 'released');
  return bottle;
end; $$;
create function public.act_on_bottle(p_id uuid, p_action text, p_content text default null) returns uuid language plpgsql security definer set search_path = '' as $$
declare person uuid; bottle public.messages%rowtype; result uuid; target uuid;
begin
  perform private.lock_pool(); person := private.require_user();
  select * into bottle from public.messages where id = p_id and current_holder_id = person and status = 'delivered' for update;
  if not found then raise exception 'This bottle is no longer on your shore.' using errcode = '42501'; end if;
  if p_action = 'reply' then
    perform private.validate_text(p_content, 800);
    if bottle.replied_at is not null then raise exception 'Your reply is already drifting.'; end if;
    target := bottle.previous_holder_id;
    if target is null or target = person then raise exception 'The previous shore is no longer reachable.'; end if;
    if private.pending_count(person) >= (select receive_limit from public.profiles where id = person) then raise exception 'Your shore is full. Keep or discard a bottle before replying.'; end if;
    if private.pending_count(target) >= (select receive_limit from public.profiles where id = target) then raise exception 'The other shore is full. Please try replying later.'; end if;
    insert into public.messages(content, author_id, previous_holder_id, pending_owner_id, target_user_id, is_reply, reply_to_message_id, mood, delay_until)
      values (btrim(p_content), person, person, person, target, true, bottle.id, bottle.mood, private.random_arrival()) returning id into result;
    insert into public.message_replies(message_id, reply_bottle_id, from_user_id, content) values (bottle.id, result, person, btrim(p_content));
    update public.messages set replied_at = now() where id = bottle.id;
    insert into public.message_history(message_id, actor_id, action, hop) values (bottle.id, person, 'replied', bottle.hop_count);
    return result;
  elsif p_action = 'keep' then
    update public.messages set status = 'kept', kept_at = now() where id = bottle.id;
  elsif p_action = 'release' then
    if nullif(btrim(p_content), '') is not null then perform private.validate_text(p_content, 200); end if;
    -- Once received, even a reply can begin a new random journey.
    update public.messages set status = 'drifting', current_holder_id = null, previous_holder_id = person, pending_owner_id = person,
      target_user_id = null, is_reply = false, hop_count = hop_count + 1,
      delay_until = private.random_arrival(), delivered_at = null, replied_at = null where id = bottle.id;
  elsif p_action = 'discard' then
    update public.messages set status = 'discarded', current_holder_id = null where id = bottle.id;
  else raise exception 'That action is not available.';
  end if;
  insert into public.message_history(message_id, actor_id, action, note, hop)
    values (bottle.id, person, case when p_action = 'release' then 'released' when p_action = 'keep' then 'kept' else 'discarded' end,
      case when p_action = 'release' then nullif(btrim(p_content),'') end, bottle.hop_count + case when p_action = 'release' then 1 else 0 end);
  return bottle.id;
end; $$;
-- Invoked only after an explicit in-app confirmation by the current owner.
-- Independent replies remain; their source reference becomes NULL.
create function public.delete_kept_bottle(p_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare person uuid;
begin
  perform private.lock_pool(); person := private.require_user();
  if not exists(select 1 from public.messages where id = p_id and current_holder_id = person and status = 'kept') then
    raise exception 'This bottle is not in your collection.' using errcode = '42501';
  end if;
  delete from public.message_replies where reply_bottle_id = p_id;
  delete from public.messages where id = p_id and current_holder_id = person and status = 'kept';
end; $$;

create function public.deliver_due_bottles(p_batch_size integer default 100) returns jsonb language plpgsql security definer set search_path = '' as $$
declare bottle public.messages%rowtype; recipient uuid; delivered integer := 0; deferred integer := 0;
begin
  -- Serialize retries/overlaps and all capacity changes; updates are atomic.
  if not pg_try_advisory_xact_lock(140610, 1) then return jsonb_build_object('delivered',0,'deferred',0,'busy',true); end if;
  for bottle in select * from public.messages where status = 'drifting' and delay_until <= now()
    order by delay_until, id limit greatest(1, least(coalesce(p_batch_size,100),500)) for update skip locked
  loop
    recipient := null;
    select p.id into recipient from public.profiles p
      where p.last_active > now() - interval '14 days'
      and p.id is distinct from bottle.author_id and p.id is distinct from bottle.previous_holder_id
      and (not bottle.is_reply or p.id = bottle.target_user_id)
      -- A directed reply has already reserved one of the recipient's slots.
      and private.pending_count(p.id) - case when bottle.target_user_id = p.id then 1 else 0 end < p.receive_limit
      order by random() limit 1;
    if recipient is null then
      -- Backoff prevents a full/inactive shore starving later eligible bottles.
      update public.messages set delay_until = now() + interval '30 minutes' where id = bottle.id;
      deferred := deferred + 1; continue;
    end if;
    update public.messages set status = 'delivered', current_holder_id = recipient, pending_owner_id = null, target_user_id = null, delivered_at = now(), replied_at = null where id = bottle.id;
    insert into public.message_history(message_id, action, hop) values (bottle.id,'delivered',bottle.hop_count);
    insert into public.inbox_events(user_id,message_id) values (recipient,bottle.id);
    delivered := delivered + 1;
  end loop;
  return jsonb_build_object('delivered',delivered,'deferred',deferred,'busy',false);
end; $$;

-- SECURITY DEFINER functions default to PUBLIC execution; revoke explicitly.
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.touch_profile(), public.update_profile(text,integer), public.shore_stats(), public.release_bottle(text,text), public.act_on_bottle(uuid,text,text), public.delete_kept_bottle(uuid), public.deliver_due_bottles(integer) from public, anon, authenticated;
grant execute on function public.touch_profile(), public.update_profile(text,integer), public.shore_stats(), public.release_bottle(text,text), public.act_on_bottle(uuid,text,text), public.delete_kept_bottle(uuid) to authenticated;
grant execute on function public.deliver_due_bottles(integer) to service_role;
-- Publish the safe event table only. Do not add messages/replies/history.
alter publication supabase_realtime add table public.inbox_events;
