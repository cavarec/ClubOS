import { createClient } from "@/lib/supabase/server";
import { JoinLoginForm } from "./JoinLoginForm";
import { JoinClient } from "./JoinClient";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-ink">Rejoindre un club</h1>
          <p className="mt-1 text-sm text-slate-500">
            Connectez-vous pour rejoindre le club avec le code <code className="font-semibold">{code}</code>.
          </p>
          <JoinLoginForm code={code} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <JoinClient code={code} />
    </main>
  );
}
