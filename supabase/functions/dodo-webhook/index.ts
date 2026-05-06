// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PRODUCT_TO_PLAN = {
  "pdt_0NeC9rFODkRRQYNQOlHlH": "starter",
  "pdt_0Ne1moGR0X9lBvhgme2rO": "pro",
  "pdt_0NeCAkzcVSNwW1PqKCAjA": "founder"
};

const PRODUCT_TO_AMOUNT = {
  "pdt_0NeC9rFODkRRQYNQOlHlH": "19",
  "pdt_0Ne1moGR0X9lBvhgme2rO": "49",
  "pdt_0NeCAkzcVSNwW1PqKCAjA": "99"
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload;
  try {
    const rawBody = await req.text();
    console.log("[dodo-webhook] Raw body received, length:", rawBody.length);
    payload = JSON.parse(rawBody);
  } catch (e) {
    console.error("[dodo-webhook] Failed to parse body:", e);
    return new Response("Bad request", { status: 400 });
  }

  const eventType = payload?.type;
  console.log("[dodo-webhook] Event type:", eventType);

  if (
    eventType !== "payment.succeeded" &&
    eventType !== "subscription.active"
  ) {
    console.log("[dodo-webhook] Ignored event:", eventType);
    return new Response("Ignored", { status: 200 });
  }

  const data = payload.data;
  const email = data?.customer?.email || data?.billing?.email || data?.email || null;
  const productId = data?.product_cart?.[0]?.product_id || data?.product_id || data?.items?.[0]?.product_id || null;

  console.log("[dodo-webhook] Email:", email);
  console.log("[dodo-webhook] ProductId:", productId);

  if (!email || !productId) {
    console.error("[dodo-webhook] Missing email or productId");
    console.log("[dodo-webhook] Full data:", JSON.stringify(data));
    return new Response("Missing data", { status: 400 });
  }

  const plan = PRODUCT_TO_PLAN[productId];
  const amount = PRODUCT_TO_AMOUNT[productId];

  if (!plan) {
    console.log("[dodo-webhook] Unknown productId:", productId);
    return new Response("Unknown product", { status: 200 });
  }

  console.log("[dodo-webhook] Plan resolved:", plan);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY");
  console.log("[dodo-webhook] SUPABASE_URL set:", !!supabaseUrl);
  console.log("[dodo-webhook] SERVICE_ROLE_KEY set:", !!serviceKey);

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("[dodo-webhook] listUsers error:", JSON.stringify(listError));
    return new Response("Internal error", { status: 500 });
  }

  console.log("[dodo-webhook] Total users found:", usersData.users.length);

  const matchedUser = usersData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!matchedUser) {
    console.log("[dodo-webhook] No user found for email:", email);
    return new Response("OK - user not found", { status: 200 });
  }

  console.log("[dodo-webhook] Matched user id:", matchedUser.id);

  const { error: upsertError } = await supabase
    .from("user_payments")
    .upsert(
      {
        user_id: matchedUser.id,
        email: email,
        plan: plan,
        status: "active",
        payment_status: "TRUE",
        amount: amount
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    console.error("[dodo-webhook] upsert error:", JSON.stringify(upsertError));
    return new Response("DB error", { status: 500 });
  }

  console.log("[dodo-webhook] SUCCESS - plan set to:", plan, "for:", email);
  return new Response("Success", { status: 200 });
});