import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Traite les webhooks Stripe Connect — cf. docs/06-PAIEMENTS-NOTIFICATIONS.md §20.
// Le compte club étant un compte connecté (destination charge), ces événements
// arrivent sur le compte plateforme avec `event.account` renseigné.
export async function POST(req: NextRequest) {
  // Instancié à l'appel (pas au chargement du module) : la clé n'est
  // disponible qu'à l'exécution, pas au moment du build.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Signature invalide: ${(err as Error).message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("stripe_checkout_session_id", session.id);
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await supabase.from("orders").update({ status: "failed" }).eq("stripe_payment_intent_id", intent.id);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent) {
        await supabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", charge.payment_intent as string);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
