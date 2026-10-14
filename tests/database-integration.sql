-- Synthetic users only. No DELETE, DROP, TRUNCATE, or existing-database access.
insert into auth.users(id) values
 ('10000000-0000-4000-8000-000000000001'),
 ('10000000-0000-4000-8000-000000000002'),
 ('10000000-0000-4000-8000-000000000003');

set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
select set_config('test.bottle', public.release_bottle('A moment of kindness.', 'calm')::text, false);
do $$ begin
  begin
    perform public.release_bottle('Another thought.','calm');
    raise exception 'FAIL: rate limit did not reject a second release';
  exception when sqlstate 'P0001' then
    if sqlerrm not like 'One new bottle%' then raise; end if;
  end;
  if (select count(*) from public.messages) <> 0 then raise exception 'FAIL: author can read drifting content'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'FAIL: profile RLS'; end if;
  if has_column_privilege('authenticated','public.messages','author_id','SELECT') then raise exception 'FAIL: sender identity exposed'; end if;
  if has_table_privilege('authenticated','public.messages','INSERT') then raise exception 'FAIL: direct insertion allowed'; end if;
  if has_function_privilege('authenticated','public.deliver_due_bottles(integer)','EXECUTE') then raise exception 'FAIL: delivery callable by user'; end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',false);
do $$ begin
  begin
    perform public.release_bottle('This is shit.','calm');
    raise exception 'FAIL: moderation did not reject';
  exception when sqlstate 'P0001' then
    if sqlerrm not like 'Please choose gentler%' then raise; end if;
  end;
  begin
    perform public.release_bottle(repeat('a',801),'calm');
    raise exception 'FAIL: length check did not reject';
  exception when sqlstate 'P0001' then
    if sqlerrm not like 'Please write between%' then raise; end if;
  end;
end $$;
reset role;
do $$ begin
  if not exists (select 1 from public.messages where id=current_setting('test.bottle')::uuid and delay_until between now()+interval '6 hours' and now()+interval '72 hours') then raise exception 'FAIL: delay outside 6–72h'; end if;
end $$;
-- Only the second user is eligible for the first delivery.
update public.profiles set last_active=now()-interval '15 days' where id='10000000-0000-4000-8000-000000000003';
update public.messages set delay_until=now()-interval '1 minute' where id=current_setting('test.bottle')::uuid;
set role service_role;
select public.deliver_due_bottles(100);
select public.deliver_due_bottles(100);
reset role;
do $$ begin
  if not exists(select 1 from public.messages where id=current_setting('test.bottle')::uuid and status='delivered' and current_holder_id='10000000-0000-4000-8000-000000000002') then raise exception 'FAIL: eligible recipient assignment'; end if;
  if (select count(*) from public.inbox_events) <> 1 then raise exception 'FAIL: duplicate delivery events'; end if;
end $$;
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
do $$ begin
  begin
    perform public.act_on_bottle(current_setting('test.bottle')::uuid,'keep',null);
    raise exception 'FAIL: non-holder mutation allowed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
do $$ begin
  if (select count(*) from public.messages) <> 1 then raise exception 'FAIL: recipient cannot read'; end if;
  if (select count(*) from public.inbox_events) <> 1 then raise exception 'FAIL: arrival-event visibility'; end if;
end $$;
select set_config('test.reply',public.act_on_bottle(current_setting('test.bottle')::uuid,'reply','Your thought found me.')::text,false);
do $$ begin
  begin
    perform public.act_on_bottle(current_setting('test.bottle')::uuid,'reply','Another reply.');
    raise exception 'FAIL: duplicate reply allowed';
  exception when sqlstate 'P0001' then
    if sqlerrm not like 'Your reply is already%' then raise; end if;
  end;
end $$;
select public.act_on_bottle(current_setting('test.bottle')::uuid,'keep',null);
reset role;
update public.messages set delay_until=now()-interval '1 minute' where id=current_setting('test.reply')::uuid;
set role service_role;
select public.deliver_due_bottles(100);
reset role;
do $$ begin
  if not exists(select 1 from public.messages where id=current_setting('test.reply')::uuid and current_holder_id='10000000-0000-4000-8000-000000000001' and status='delivered') then raise exception 'FAIL: reply did not return to previous holder'; end if;
end $$;
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
select public.act_on_bottle(current_setting('test.reply')::uuid,'release','A note for the next shore.');
reset role;
do $$ begin
  if not exists(select 1 from public.messages where id=current_setting('test.reply')::uuid and status='drifting' and hop_count=1 and previous_holder_id='10000000-0000-4000-8000-000000000001' and target_user_id is null) then raise exception 'FAIL: multi-hop release'; end if;
end $$;
-- Fill user 2's shore; user 3 remains inactive. Delivery must defer.
insert into public.messages(content,author_id,previous_holder_id,current_holder_id,status,delay_until,delivered_at)
select 'A synthetic capacity bottle.', '10000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000001'::uuid,
 '10000000-0000-4000-8000-000000000002'::uuid, 'delivered'::public.bottle_status, now(), now() from generate_series(1,5);
update public.messages set delay_until=now()-interval '1 minute' where id=current_setting('test.reply')::uuid;
set role service_role;
select public.deliver_due_bottles(100);
reset role;
do $$ begin
  if not exists(select 1 from public.messages where id=current_setting('test.reply')::uuid and status='drifting' and delay_until>now()) then raise exception 'FAIL: full/inactive shore backoff'; end if;
  if private.pending_count('10000000-0000-4000-8000-000000000002') <> 5 then
    -- Passing someone else's bottle on must never consume its author's quota.
    raise exception 'FAIL: pending accounting';
  end if;
end $$;
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
do $$ begin
  begin
    perform public.release_bottle('Over capacity.','calm');
    raise exception 'FAIL: capacity limit allowed a new bottle';
  exception when sqlstate 'P0001' then
    if sqlerrm not like 'Your shore is full%' then raise; end if;
  end;
end $$;
reset role;
select 'PASS: database RLS, ownership, moderation, rate limit, random delay, delivery retry, reply routing, and multi-hop invariants' as result;
