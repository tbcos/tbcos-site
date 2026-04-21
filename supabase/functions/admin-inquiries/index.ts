import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS"
};

const allowedStatuses = new Set(["new", "in_progress", "replied", "closed"]);

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function getEnv() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables are missing");
  }

  return { supabaseUrl, serviceRoleKey, anonKey };
}

async function requireAdmin(request: Request) {
  const { supabaseUrl, serviceRoleKey, anonKey } = getEnv();
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { error: json(401, { ok: false, error: "Missing authorization header" }) };
  }

  const authClient = createClient(supabaseUrl, anonKey || serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    return { error: json(401, { ok: false, error: "Invalid session" }) };
  }

  if (data.user.user_metadata?.role !== "admin") {
    return { error: json(403, { ok: false, error: "Admin access required" }) };
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return { user: data.user, adminClient };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { adminClient } = auth;

  if (request.method === "GET") {
    const { data, error } = await adminClient
      .from("inquiries")
      .select("id, created_at, company_name, contact_person, email, phone, inquiry_type, message, privacy_consent, source_page, user_agent, member_id, status, admin_note")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Failed to fetch inquiries", error);
      return json(500, { ok: false, error: "Failed to fetch inquiries" });
    }

    return json(200, { ok: true, inquiries: data });
  }

  if (request.method === "PATCH") {
    let body: { id?: string; status?: string; admin_note?: string };

    try {
      body = await request.json();
    } catch (_error) {
      return json(400, { ok: false, error: "Invalid JSON body" });
    }

    if (!body.id) {
      return json(400, { ok: false, error: "Inquiry id is required" });
    }

    const updatePayload: Record<string, string | null> = {};

    if (typeof body.status === "string") {
      if (!allowedStatuses.has(body.status)) {
        return json(400, { ok: false, error: "Invalid inquiry status" });
      }
      updatePayload.status = body.status;
    }

    if (typeof body.admin_note === "string") {
      updatePayload.admin_note = body.admin_note.trim() || null;
    }

    if (!Object.keys(updatePayload).length) {
      return json(400, { ok: false, error: "No valid fields to update" });
    }

    const { data, error } = await adminClient
      .from("inquiries")
      .update(updatePayload)
      .eq("id", body.id)
      .select("id, status, admin_note")
      .single();

    if (error) {
      console.error("Failed to update inquiry", error);
      return json(500, { ok: false, error: "Failed to update inquiry" });
    }

    return json(200, { ok: true, inquiry: data });
  }

  return json(405, { ok: false, error: "Method not allowed" });
});
