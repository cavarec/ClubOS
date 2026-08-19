-- ClubOS — invitations : table, RLS, fonction de jonction par code.

create table if not exists "public"."invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "role" "public"."MemberRole" NOT NULL DEFAULT 'player',
    "created_by" UUID NOT NULL,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

create unique index if not exists "invitations_code_key" on "public"."invitations"("code");

alter table "public"."invitations"
  add constraint "invitations_tenant_id_fkey" foreign key ("tenant_id") references "public"."tenants"("id") on delete cascade on update cascade;

alter table "public"."invitations"
  add constraint "invitations_created_by_fkey" foreign key ("created_by") references "public"."profiles"("id") on delete restrict on update cascade;

-- ---------------------------------------------------------------------------
-- RLS : seuls les admins/dirigeants du tenant voient/gerent les invitations.
-- Le code lui-meme n'est jamais lisible via une policy SELECT generale (pas
-- d'enumeration possible) : la jonction passe par la fonction ci-dessous,
-- qui contourne la RLS pour aller chercher exactement le code fourni.
-- ---------------------------------------------------------------------------

alter table "public"."invitations" enable row level security;

create policy "invitations_select_admin" on "public"."invitations"
  for select using (
    exists (
      select 1 from public.memberships m
      where m.tenant_id = invitations.tenant_id
        and m.user_id = auth.uid()
        and m.role in ('director', 'club_admin')
    )
  );

create policy "invitations_write_admin" on "public"."invitations"
  for all using (
    exists (
      select 1 from public.memberships m
      where m.tenant_id = invitations.tenant_id
        and m.user_id = auth.uid()
        and m.role in ('director', 'club_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- Jonction par code : valide le code, cree le membership, incremente le
-- compteur d'usage. SECURITY DEFINER pour pouvoir lire un code sans policy
-- SELECT publique dessus.
-- ---------------------------------------------------------------------------

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

  -- N'incremente le compteur d'usage que si un nouveau membership a
  -- vraiment ete cree (evite de gonfler used_count quand un membre deja
  -- rejoint revisite le meme lien).
  get diagnostics v_rows = row_count;
  if v_rows > 0 then
    update public.invitations set used_count = used_count + 1 where id = v_invitation.id;
  end if;

  select * into v_tenant from public.tenants where id = v_invitation.tenant_id;
  return v_tenant;
end;
$$ language plpgsql security definer set search_path = public, extensions;

grant execute on function public.join_via_invite_code(text) to authenticated;
