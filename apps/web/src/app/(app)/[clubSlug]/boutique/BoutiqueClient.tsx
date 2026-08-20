"use client";

import { useState } from "react";
import { Button, Badge } from "@clubos/ui";
import { createClient } from "@/lib/supabase/client";
import { formatAmount } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  price_cents: number;
  active: boolean;
}

interface Order {
  id: string;
  status: "pending" | "paid" | "failed" | "refunded";
  amount_cents: number;
  created_at: string;
  product: { id: string; name: string } | null;
}

const statusLabel: Record<Order["status"], string> = {
  pending: "En attente de paiement",
  paid: "Payée",
  failed: "Échec",
  refunded: "Remboursée",
};

const statusVariant: Record<Order["status"], "warning" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
};

export function BoutiqueClient({
  tenantId,
  initialProducts,
  initialOrders,
}: {
  tenantId: string;
  initialProducts: Product[];
  initialOrders: Order[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [orderingId, setOrderingId] = useState<string | null>(null);

  // Admin : ajout rapide d'un article au catalogue.
  const [name, setName] = useState("");
  const [priceEuros, setPriceEuros] = useState("");
  const [adminStatus, setAdminStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleOrder(product: Product) {
    setOrderingId(product.id);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });

    if (res.ok) {
      const { order } = await res.json();
      setOrders((prev) => [order as Order, ...prev]);
    }
    setOrderingId(null);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(parseFloat(priceEuros.replace(",", ".")) * 100);
    if (!name || Number.isNaN(cents) || cents < 0) return;

    setAdminStatus("saving");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({ tenant_id: tenantId, type: "boutique", name, price_cents: cents })
      .select("id, name, price_cents, active")
      .single();

    if (error || !data) {
      setAdminStatus("error");
      return;
    }

    setProducts((prev) => [...prev, data as Product]);
    setName("");
    setPriceEuros("");
    setAdminStatus("idle");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">Catalogue</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-medium text-ink">{p.name}</p>
                <p className="text-lg font-semibold text-ink">{formatAmount(p.price_cents)}</p>
                <Button size="sm" onClick={() => handleOrder(p)} disabled={orderingId === p.id || !p.active}>
                  {orderingId === p.id ? "Commande…" : "Commander"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Aucun article disponible pour l&apos;instant.</p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">Mes commandes</h2>
        {orders.length > 0 ? (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink">{o.product?.name ?? "Article supprimé"}</p>
                  <p className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink">{formatAmount(o.amount_cents)}</span>
                  <Badge variant={statusVariant[o.status]}>{statusLabel[o.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Aucune commande pour l&apos;instant.</p>
        )}
      </div>

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium text-ink">Ajouter un article au catalogue (admin)</summary>
        <form onSubmit={handleAddProduct} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            required
            placeholder="Nom de l'article"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            required
            placeholder="Prix (€)"
            inputMode="decimal"
            value={priceEuros}
            onChange={(e) => setPriceEuros(e.target.value)}
            className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <Button size="sm" type="submit" disabled={adminStatus === "saving"}>
            {adminStatus === "saving" ? "Ajout…" : "Ajouter"}
          </Button>
          {adminStatus === "error" && (
            <span className="text-sm text-red-600">Vous n&apos;avez pas les droits pour gérer le catalogue.</span>
          )}
        </form>
      </details>
    </div>
  );
}
