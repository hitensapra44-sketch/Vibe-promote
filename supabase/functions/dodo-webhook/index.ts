// @ts-nocheck
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

function base64UrlToUint8Array(base64url: string): Uint8Array {
  // Convert base64url to standard base64
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function verifySignature(
  svixId: string,
  svixTimestamp: string, 
  svixSignature: string,
  body: string
): Promise<boolean> {
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;

  // Strip whsec_ prefix and decode using base64url converter
  const secret = SIGNING_SECRET.replace("whsec_", "");
  const keyData = base64UrlToUint8Array(secret);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedContent)
  );

  // Encode result as standard base64
  const computedSig = "v1," + btoa(
    String.fromCharCode(...new Uint8Array(signatureBytes))
  );
  
  console.log("[dodo-webhook] computed:", computedSig);
  console.log("[dodo-webhook] expected:", svixSignature);

  // svix-signature header can contain multiple space-separated sigs
  return svixSignature.split(" ").some(sig => sig === computedSig);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.log("[dodo-webhook] Missing svix headers");
    return new Response("Missing headers", { status: 400 });
  }

  const rawBody = await req.text();
  const isValid = await verifySignature(
    svixId,
    svixTimestamp,
    svixSignature,
    rawBody
  );

  if (!isValid) {
    console.log("[dodo-webhook] Signature invalid");
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventType = payload.type;
  console.log("[dodo-webhook] Event type:", eventType);

  if (
    eventType !== "payment.succeeded" && 
    eventType !== "subscription.active"
  ) {
    return new Response("Ignored", { status: 200 });
  }

  const data = payload.data;
  const email = data?.customer?.email || data?.billing?.email || data?.email || null;
  const productId = data?.product_cart?.[0]?.product_id || data?.product_id || data?.items?.[0]?.product_id || null;

  console.log("[dodo-webhook] Email:", email, "ProductId:", productId);

  if (!email || !productId) {
    console.log("[dodo-webhook] Missing email or productId", JSON.stringify(data));
    return new Response("Missing data", { status: 400 });
  }

  const plan = PRODUCT_TO_PLAN[productId];
  const amount = PRODUCT_TO_AMOUNT[productId];

  if (!plan) {
    console.log("[dodo-webhook] Unknown productId:", productId);
    return new Response("Unknown product", { status: 200 });
  }

  console.log("[dodo-webhook] Plan resolved:", plan);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SERVICE_ROLE_KEY") ?? ""
  );

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("[dodo-webhook] listUsers error:", listError);
    return new Response("Internal error", { status: 500 });
  }

  const matchedUser = usersData.users.find(
    u => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!matchedUser) {
    console.log("[dodo-webhook] No user found for email:", email);
    return new Response("OK - user not found", { status: 200 });
  }

  console.log("[dodo-webhook] Matched user:", matchedUser.id);

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
    console.error("[dodo-webhook] upsert error:", upsertError);
    return new Response("DB error", { status: 500 });
  }

  console.log("[dodo-webhook] Success — plan set to:", plan);
  return new Response("Success", { status: 200 });
});