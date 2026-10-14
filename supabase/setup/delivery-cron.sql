-- Optional hosted setup for Vercel Hobby, after the initial migration.
-- Review before executing as the database administrator in Supabase SQL Editor.
-- No application data is changed immediately; the job delivers due bottles.
create extension if not exists pg_cron with schema pg_catalog;

do $setup$
begin
  if exists (
    select 1 from cron.job
    where jobname = 'message-in-a-bottle-delivery'
  ) then
    if not exists (
      select 1 from cron.job
      where jobname = 'message-in-a-bottle-delivery'
        and schedule = '*/30 * * * *'
        and command = 'SELECT public.deliver_due_bottles(100);'
        and active
        and username = current_user
        and database = current_database()
    ) then
      raise exception 'Delivery job already exists with different settings; inspect it before making changes.';
    end if;
  else
    perform cron.schedule(
      'message-in-a-bottle-delivery',
      '*/30 * * * *',
      'SELECT public.deliver_due_bottles(100);'
    );
  end if;
end;
$setup$;

-- Read-only verification. Inspect recent runs in Integrations > Cron > History.
select jobid, jobname, schedule, command, active
from cron.job
where jobname = 'message-in-a-bottle-delivery';
