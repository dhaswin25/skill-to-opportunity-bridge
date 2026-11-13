CREATE OR REPLACE FUNCTION public.admin_manage(_action text, _target uuid DEFAULT NULL::uuid, _payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ declare before_row jsonb; next_role public.app_role; new_id uuid; begin
 if not public.has_role(auth.uid(),'admin') then raise exception 'Super Admin access required' using errcode='42501'; end if;
 if _action in ('suspend','reactivate','employer_review','role') then if not exists(select 1 from auth.users where id=_target) then raise exception 'Account not found'; end if; if exists(select 1 from public.user_roles where user_id=_target and role='admin') then raise exception 'Super Admin accounts cannot be modified here'; end if; end if;
 if _action in ('suspend','reactivate') then
 if length(coalesce(_payload->>'reason',''))<3 then raise exception 'A reason is required'; end if;
 insert into public.account_controls(user_id,suspended,reason) values(_target,_action='suspend',left(_payload->>'reason',1000)) on conflict(user_id) do update set suspended=excluded.suspended,reason=excluded.reason,updated_at=now();
 elsif _action='employer_review' then
 if _payload->>'status' not in ('pending','approved','rejected') then raise exception 'Invalid review status'; end if; if not exists(select 1 from public.user_roles where user_id=_target and role='employer') then raise exception 'Not an employer'; end if;
 insert into public.account_controls(user_id,employer_status,reason) values(_target,_payload->>'status',left(_payload->>'reason',1000)) on conflict(user_id) do update set employer_status=excluded.employer_status,reason=excluded.reason,updated_at=now();
 elsif _action='role' then
 if _payload->>'role' not in ('candidate','employer') then raise exception 'Administrators can only be provisioned by the backend owner'; end if; next_role:=(_payload->>'role')::public.app_role;
 delete from public.user_roles where user_id=_target and role in ('candidate','employer'); insert into public.user_roles(user_id,role) values(_target,next_role) on conflict do nothing;
 if next_role='employer' then insert into public.account_controls(user_id,employer_status) values(_target,'pending') on conflict(user_id) do update set employer_status='pending',updated_at=now(); end if;
 elsif _action='job_visibility' then
 select to_jsonb(j) into before_row from public.jobs j where id=_target for update; if before_row is null then raise exception 'Job not found'; end if;
 update public.jobs set published=coalesce((_payload->>'published')::boolean,false) where id=_target;
 insert into public.admin_audit_logs(actor_id,action,target_id,details) values(auth.uid(),_action,_target::text,jsonb_build_object('before',before_row,'published',_payload->'published','reason',_payload->>'reason'));
 elsif _action='report_review' then
 if _payload->>'status' not in ('reviewed','dismissed') then raise exception 'Invalid report status'; end if; update public.profile_reports set status=_payload->>'status' where id=_target; if not found then raise exception 'Report not found'; end if;
 elsif _action='content_save' then
 if length(coalesce(_payload->>'title','')) not between 1 and 150 or length(coalesce(_payload->>'slug','')) not between 1 and 100 or jsonb_typeof(_payload->'body')<>'object' then raise exception 'Invalid content'; end if;
 insert into public.platform_content(id,kind,slug,title,body,published) values(coalesce(_target,gen_random_uuid()),_payload->>'kind',_payload->>'slug',_payload->>'title',_payload->'body',coalesce((_payload->>'published')::boolean,false)) on conflict(id) do update set kind=excluded.kind,slug=excluded.slug,title=excluded.title,body=excluded.body,published=excluded.published,updated_at=now();
 elsif _action='content_archive' then update public.platform_content set published=false,updated_at=now() where id=_target;
 elsif _action='ai_save' then
 if _payload->>'provider'<>'lovable' or length(coalesce(_payload->>'system_prompt','')) not between 10 and 10000 or _payload->>'model' not like 'openai/%' then raise exception 'Invalid AI configuration'; end if;
 insert into public.ai_configuration(id,enabled,demo_mode,provider,model,system_prompt,daily_limit,paused_reason) values(1,(_payload->>'enabled')::boolean,(_payload->>'demo_mode')::boolean,'lovable',_payload->>'model',_payload->>'system_prompt',(_payload->>'daily_limit')::integer,null) on conflict(id) do update set enabled=excluded.enabled,demo_mode=excluded.demo_mode,model=excluded.model,system_prompt=excluded.system_prompt,daily_limit=excluded.daily_limit,paused_reason=null,updated_at=now();
 elsif _action='job_create' then
  if length(trim(coalesce(_payload->>'title',''))) not between 3 and 150 or length(trim(coalesce(_payload->>'company_name',''))) not between 2 and 120
     or length(trim(coalesce(_payload->>'description',''))) not between 20 and 5000 or length(trim(coalesce(_payload->>'category',''))) not between 1 and 60
     or length(trim(coalesce(_payload->>'location',''))) not between 2 and 120
     or _payload->>'experience_level' not in ('entry','mid','senior') or _payload->>'job_type' not in ('internship','full_time','part_time','contract')
     or jsonb_typeof(coalesce(_payload->'skills','[]'::jsonb))<>'array' or jsonb_array_length(coalesce(_payload->'skills','[]'::jsonb))>20 then raise exception 'Invalid job listing'; end if;
  if coalesce((_payload->>'is_external')::boolean,false) and (coalesce(_payload->>'apply_url','') !~ '^https://[^\s]+$' or length(_payload->>'apply_url') not between 12 and 500) then raise exception 'External listings need an https apply link'; end if;
  if coalesce(_payload->>'apply_url','')<>'' and (_payload->>'apply_url' !~ '^https://[^\s]+$' or length(_payload->>'apply_url') not between 12 and 500) then raise exception 'Apply link must start with https://'; end if;
  insert into public.jobs(posted_by,company_name,title,description,skills,category,experience_level,job_type,location,apply_url,is_sample,is_external,published)
  values(auth.uid(),trim(_payload->>'company_name'),trim(_payload->>'title'),trim(_payload->>'description'),
    coalesce((select array_agg(left(trim(s),40)) from jsonb_array_elements_text(coalesce(_payload->'skills','[]'::jsonb)) s where trim(s)<>''),'{}'),
    trim(_payload->>'category'),_payload->>'experience_level',_payload->>'job_type',trim(_payload->>'location'),nullif(_payload->>'apply_url',''),false,
    coalesce((_payload->>'is_external')::boolean,false),true) returning id into new_id;
  insert into public.admin_audit_logs(actor_id,action,target_id,details) values(auth.uid(),_action,new_id::text,jsonb_build_object('title',_payload->>'title','company',_payload->>'company_name','apply_url',_payload->>'apply_url','external',_payload->'is_external'));
  return jsonb_build_object('ok',true,'id',new_id);
 else raise exception 'Unknown operation'; end if; return jsonb_build_object('ok',true); end $function$;