import { createClient } from "@/lib/supabase/server";
import { ClubSetupForm } from "./ClubSetupForm";

export default async function ClubSetupPage() {
  const supabase = await createClient();
  const { data: sports } = await supabase.from("sports").select("id, name").order("name");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-ink">Créer votre club</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vous deviendrez administrateur de ce club. Vous pourrez inviter les autres membres ensuite.
        </p>
        <ClubSetupForm sports={sports ?? []} />
      </div>
    </main>
  );
}
