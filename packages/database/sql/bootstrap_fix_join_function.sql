-- ===========================================================================
-- ClubOS — corrige join_via_invite_code (used_count comptait aussi les
-- rejointes deja faites, la ou seul un nouveau membership doit compter)
-- ===========================================================================

create or replace function public.join_via_invite_code(p_code text) returns public.tenants as $$
declare
  v_invitation public.invitations;
  v_tenant public.tenants;
  v_rows int;
begin
  select * into v_invitation
  from public.invitations
  where code = p_code
    and (expires_at is null or expires_at > now())
    and (max_uses is null or used_count < max_uses)
  limit 1;

  if v_invitation.id is null then
    raise exception 'Code d''invitation invalide ou expiré';
  end if;

  insert into public.memberships (tenant_id, user_id, role)
  values (v_invitation.tenant_id, auth.uid(), v_invitation.role)
  on conflict (tenant_id, user_id, role) do nothing;

  get diagnostics v_rows = row_count;
  if v_rows > 0 then
    update public.invitations set used_count = used_count + 1 where id = v_invitation.id;
  end if;

  select * into v_tenant from public.tenants where id = v_invitation.tenant_id;
  return v_tenant;
end;
$$ language plpgsql security definer set search_path = public, extensions;
