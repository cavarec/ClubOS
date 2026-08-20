import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { certificateStatus as getCertificateStatus } from "@/lib/certificate";
import { AdherentsList } from "./AdherentsList";

export default async function AdherentsPage({ params }: { params: Promise<{ clubSlug: string }> }) {
  const { clubSlug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", clubSlug).maybeSingle();
  if (!tenant) notFound();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, profile:profiles(id, first_name, last_name, avatar_url, phone, birth_date)")
    .eq("tenant_id", tenant.id)
    .eq("status", "active");

  const { data: licenses } = await supabase
    .from("licenses")
    .select("profile_id, license_number, medical_certificate_exp")
    .eq("tenant_id", tenant.id);

  const licenseByProfile = new Map<string, { licenseNumber: string; medicalCertificateExp: string | null }>();
  for (const l of licenses ?? []) {
    if (l.profile_id) licenseByProfile.set(l.profile_id, { licenseNumber: l.license_number, medicalCertificateExp: l.medical_certificate_exp });
  }

  type RawMembership = {
    role: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
      phone: string | null;
      birth_date: string | null;
    } | null;
  };

  const members = ((memberships ?? []) as unknown as RawMembership[])
    .filter((m) => m.profile)
    .map((m) => {
      const license = licenseByProfile.get(m.profile!.id);
      return {
        id: m.profile!.id,
        firstName: m.profile!.first_name,
        lastName: m.profile!.last_name,
        role: m.role,
        phone: m.profile!.phone,
        birthDate: m.profile!.birth_date,
        licenseNumber: license?.licenseNumber ?? "",
        medicalCertificateExp: license?.medicalCertificateExp ?? "",
        certificateStatus: getCertificateStatus(license?.medicalCertificateExp ?? null),
      };
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Adhérents</h1>
        <span className="text-sm text-slate-500">{members.length} licenciés</span>
      </div>
      <AdherentsList clubSlug={clubSlug} members={members} />
    </div>
  );
}
