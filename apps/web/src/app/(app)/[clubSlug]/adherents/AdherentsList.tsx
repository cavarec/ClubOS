"use client";

import { useState } from "react";
import { Avatar, Badge, Button } from "@clubos/ui";
import { certificateStatus as getCertificateStatus } from "@/lib/certificate";

const roleLabel: Record<string, string> = {
  player: "Joueur",
  parent: "Parent",
  coach: "Entraîneur",
  director: "Dirigeant",
  club_admin: "Admin club",
  committee_admin: "Admin comité",
  league_admin: "Admin ligue",
  federation_admin: "Admin fédération",
};

const certificateBadge = {
  ok: { label: "Certificat à jour", variant: "success" as const },
  expiring: { label: "Certificat expire bientôt", variant: "warning" as const },
  expired: { label: "Certificat expiré", variant: "danger" as const },
  none: { label: "Pas de certificat enregistré", variant: "neutral" as const },
};

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  birthDate: string | null;
  licenseNumber: string;
  medicalCertificateExp: string;
  certificateStatus: keyof typeof certificateBadge;
}

const inputClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

export function AdherentsList({ clubSlug, members: initialMembers }: { clubSlug: string; members: Member[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = members.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <AddAdherentForm
        clubSlug={clubSlug}
        onCreated={(m) =>
          setMembers((prev) => [
            {
              id: m.id,
              firstName: m.firstName,
              lastName: m.lastName,
              role: m.role,
              phone: null,
              birthDate: null,
              licenseNumber: "",
              medicalCertificateExp: "",
              certificateStatus: "none",
            },
            ...prev,
          ])
        }
      />

      <input
        type="search"
        placeholder="Rechercher un adhérent…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`w-full max-w-sm ${inputClass}`}
      />

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {filtered.map((m) => {
          const cert = certificateBadge[m.certificateStatus];
          const isEditing = editingId === m.id;
          return (
            <div key={m.id} className="p-4">
              <button
                onClick={() => setEditingId(isEditing ? null : m.id)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <Avatar firstName={m.firstName} lastName={m.lastName} size="md" />
                  <div>
                    <p className="font-medium text-ink">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{roleLabel[m.role] ?? m.role}</p>
                  </div>
                </div>
                <Badge variant={cert.variant}>{cert.label}</Badge>
              </button>

              {isEditing && (
                <EditAdherentForm
                  clubSlug={clubSlug}
                  member={m}
                  onSaved={(updated) => {
                    setMembers((prev) => prev.map((mm) => (mm.id === m.id ? { ...mm, ...updated } : mm)));
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="p-4 text-sm text-slate-500">Aucun adhérent trouvé.</p>}
      </div>
    </>
  );
}

function AddAdherentForm({
  clubSlug,
  onCreated,
}: {
  clubSlug: string;
  onCreated: (m: { id: string; firstName: string; lastName: string; role: string }) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("player");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const res = await fetch("/api/adherents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubSlug, firstName, lastName, email, role, birthDate, phone }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(typeof body.error === "string" ? body.error : "Impossible d'ajouter cet adhérent.");
      setStatus("idle");
      return;
    }

    const { member } = await res.json();
    onCreated(member);
    setFirstName("");
    setLastName("");
    setEmail("");
    setBirthDate("");
    setPhone("");
    setStatus("idle");
  }

  return (
    <details className="rounded-lg border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-medium text-ink">Ajouter un adhérent</summary>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input required placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
          <input required placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
          <input
            type="email"
            placeholder="Email (optionnel pour un mineur)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
            {Object.entries(roleLabel)
              .filter(([v]) => ["player", "parent", "coach", "director", "club_admin"].includes(v))
              .map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
          </select>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
          <input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <p className="text-xs text-slate-400">
          Sans email, un compte sera créé pour le suivi du club mais ne sera pas utilisable pour se connecter.
        </p>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={status === "saving"}>
            {status === "saving" ? "Ajout…" : "Ajouter"}
          </Button>
          {status === "error" && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </details>
  );
}

function EditAdherentForm({
  clubSlug,
  member,
  onSaved,
  onCancel,
}: {
  clubSlug: string;
  member: Member;
  onSaved: (m: Partial<Member>) => void;
  onCancel: () => void;
}) {
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [phone, setPhone] = useState(member.phone ?? "");
  const [birthDate, setBirthDate] = useState(member.birthDate ?? "");
  const [licenseNumber, setLicenseNumber] = useState(member.licenseNumber);
  const [medicalCertificateExp, setMedicalCertificateExp] = useState(member.medicalCertificateExp);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");

    const res = await fetch(`/api/adherents/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubSlug, firstName, lastName, phone, birthDate, licenseNumber, medicalCertificateExp }),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }

    onSaved({
      firstName,
      lastName,
      phone,
      birthDate,
      licenseNumber,
      medicalCertificateExp,
      certificateStatus: getCertificateStatus(medicalCertificateExp || null),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
        <input required placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
        <input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
        <input
          placeholder="N° de licence"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className={inputClass}
        />
        <div>
          <label className="mb-1 block text-xs text-slate-500">Certificat médical valide jusqu&apos;au</label>
          <input
            type="date"
            value={medicalCertificateExp}
            onChange={(e) => setMedicalCertificateExp(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={status === "saving"}>
          {status === "saving" ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        {status === "error" && <span className="text-sm text-red-600">Vous n&apos;avez pas les droits pour modifier cet adhérent.</span>}
      </div>
    </form>
  );
}
