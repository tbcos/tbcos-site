import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type InquiryPayload = {
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  inquiry_type?: string;
  message?: string;
  privacy_consent?: string | boolean;
  source_page?: string;
  user_agent?: string;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function normalizeBoolean(value: string | boolean | undefined) {
  if (typeof value === "boolean") return value;
  return value === "agreed" || value === "true";
}

function validate(payload: InquiryPayload) {
  if (!payload.contact_person?.trim()) return "contact_person is required";
  if (!payload.email?.trim()) return "email is required";
  if (!payload.privacy_consent || !normalizeBoolean(payload.privacy_consent)) {
    return "privacy_consent must be agreed";
  }

  return null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: "Supabase environment variables are missing" });
  }

  const authHeader = request.headers.get("Authorization");
  const apikey = request.headers.get("apikey");

  if (!authHeader && !apikey) {
    return json(401, { ok: false, error: "Missing authorization headers" });
  }

  if (apikey && anonKey && apikey !== anonKey) {
    return json(401, { ok: false, error: "Invalid API key" });
  }

  let payload: InquiryPayload;

  try {
    payload = await request.json();
  } catch (_error) {
    return json(400, { ok: false, error: "Invalid JSON body" });
  }

  const validationError = validate(payload);
  if (validationError) {
    return json(400, { ok: false, error: validationError });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { error } = await supabase.from("inquiries").insert({
    company_name: payload.company_name?.trim() || null,
    contact_person: payload.contact_person?.trim() || null,
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim() || null,
    inquiry_type: payload.inquiry_type?.trim() || "other",
    message: payload.message?.trim() || null,
    privacy_consent: normalizeBoolean(payload.privacy_consent),
    source_page: payload.source_page?.trim() || null,
    user_agent: payload.user_agent?.trim() || null,
    status: "new"
  });

  if (error) {
    console.error("Failed to store inquiry", error);
    return json(500, { ok: false, error: "Failed to store inquiry" });
  }

  return json(200, { ok: true });
});
