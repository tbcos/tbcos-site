import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS"
};

const allowedStatuses = new Set(["pending", "approved", "rejected"]);
const allowedRoles = new Set(["buyer", "admin"]);

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
    const { data, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 200
    });

    if (error) {
      console.error("Failed to list members", error);
      return json(500, { ok: false, error: "Failed to fetch members" });
    }

    const members = (data.users || []).map((user) => ({
      id: user.id,
      email: user.email || "",
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      provider: user.app_metadata?.provider || "email",
      full_name: user.user_metadata?.full_name || "",
      company_name: user.user_metadata?.company_name || "",
      role: user.user_metadata?.role || "buyer",
      status: user.user_metadata?.status || "pending"
    }));

    return json(200, { ok: true, members });
  }

  if (request.method === "PATCH") {
    let body: {
      id?: string;
      status?: string;
      role?: string;
      full_name?: string;
      company_name?: string;
    };

    try {
      body = await request.json();
    } catch (_error) {
      return json(400, { ok: false, error: "Invalid JSON body" });
    }

    if (!body.id) {
      return json(400, { ok: false, error: "Member id is required" });
    }

    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(body.id);
    if (userError || !userData.user) {
      console.error("Failed to load member", userError);
      return json(404, { ok: false, error: "Member not found" });
    }

    const currentMeta = userData.user.user_metadata || {};
    const nextMeta: Record<string, unknown> = { ...currentMeta };

    if (typeof body.status === "string") {
      if (!allowedStatuses.has(body.status)) {
        return json(400, { ok: false, error: "Invalid member status" });
      }
      nextMeta.status = body.status;
    }

    if (typeof body.role === "string") {
      if (!allowedRoles.has(body.role)) {
        return json(400, { ok: false, error: "Invalid member role" });
      }
      nextMeta.role = body.role;
    }

    if (typeof body.full_name === "string") {
      nextMeta.full_name = body.full_name.trim();
    }

    if (typeof body.company_name === "string") {
      nextMeta.company_name = body.company_name.trim();
    }

    const { data: updatedUserData, error: updateError } = await adminClient.auth.admin.updateUserById(body.id, {
      user_metadata: nextMeta
    });

    if (updateError || !updatedUserData.user) {
      console.error("Failed to update member", updateError);
      return json(500, { ok: false, error: "Failed to update member" });
    }

    const updated = updatedUserData.user;
    return json(200, {
      ok: true,
      member: {
        id: updated.id,
        email: updated.email || "",
        created_at: updated.created_at,
        last_sign_in_at: updated.last_sign_in_at,
        provider: updated.app_metadata?.provider || "email",
        full_name: updated.user_metadata?.full_name || "",
        company_name: updated.user_metadata?.company_name || "",
        role: updated.user_metadata?.role || "buyer",
        status: updated.user_metadata?.status || "pending"
      }
    });
  }

  return json(405, { ok: false, error: "Method not allowed" });
});
