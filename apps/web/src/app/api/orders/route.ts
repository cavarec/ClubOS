import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ productId: z.string().uuid() });

// Le montant n'est jamais accepté depuis le client : on relit le prix du
// produit côté serveur pour éviter qu'une commande soit créée avec un
// montant falsifié (amount_cents manipulé dans la requête).
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, tenant_id, price_cents, active")
    .eq("id", parsed.data.productId)
    .maybeSingle();

  if (!product || !product.active) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      tenant_id: product.tenant_id,
      user_id: user.id,
      product_id: product.id,
      amount_cents: product.price_cents,
    })
    .select("id, status, amount_cents, created_at, product:products(id, name)")
    .single();

  if (error || !order) {
    return NextResponse.json({ error: error?.message ?? "Impossible de créer la commande" }, { status: 500 });
  }

  return NextResponse.json({ order }, { status: 201 });
}
