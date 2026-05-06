// No JWT verification needed - webhook uses signature verification
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SIGNING_SECRET = "whsec_rsRgodyOYqtiGmyXFSClN92XxPcmwRAu";

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

async function verifySignature(req: Request, body: string): Promise<boolean> {
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.log("[dodo-webhook] Missing svix headers");
    return false;
  }
  const signedContent = `${svix_id}.${svix_timestamp}.${body}`;
  const secret = SIGNING_SECRET.replace("whsec_", "");
  // Svix uses standard base64 — pad it correctly
  const paddedSecret = secret + "=".repeat((4 - secret.length % 4) % 4);
  const keyData = Uint8Array.from(atob(paddedSecret), c => c.charCodeAt(0));
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedContent)
  );
  const computedSig = `v1,${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
  console.log("[dodo-webhook] Computed:", computedSig);
  console.log("[dodo-webhook] Expected:", svix_signature);
  const expectedSignatures = svix_signature.split(" ");
  return expectedSignatures.some(sig => sig === computedSig);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const isValid = await verifySignature(req, rawBody);

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventType = payload.type;

  if (eventType !== "payment.succeeded" && eventType !== "subscription.active") {
    return new Response("Ignored event type", { status: 200 });
  }

  const data = payload.data;
  const email = data.customer?.email || data.billing?.email || data.email;
  
  const productId =
    data?.product_cart?.[0]?.product_id ||
    data?.product_id ||
    data?.items?.[0]?.product_id ||
    null;

  if (!email || !productId) {
    console.log("[dodo-webhook] Missing email or product_id", data);
    return new Response("Missing data", { status: 400 });
  }

  const plan = PRODUCT_TO_PLAN[productId];
  const amount = PRODUCT_TO_AMOUNT[productId];

  if (!plan) {
    console.log("[dodo-webhook] Unknown product_id", productId);
    return new Response("Unknown product", { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SERVICE_ROLE_KEY") || ""
  );

  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("[dodo-webhook] Error listing users", listError);
    return new Response("Internal error", { status: 500 });
  }

  const matchedUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (!matchedUser) {
    console.log("[dodo-webhook] User not found for email", email);
    return new Response("User not found", { status: 200 });
  }

  const { error: upsertError } = await supabase
    .from("user_payments")
    .upsert({
      user_id: matchedUser.id,
      email: email,
      plan: plan,
      status: "active",
      payment_status: "TRUE",
      amount: amount,
      created_at: new Date().toISOString()
    }, {
      onConflict: "user_id"
    });

  if (upsertError) {
    console.error("[dodo-webhook] Error upserting payment", upsertError);
    return new Response("Database error", { status: 500 });
  }

  return new Response("Success", { status: 200 });
});