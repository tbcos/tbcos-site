import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.10.1";

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

type MailConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  toEmail: string;
  fromEmail: string;
  fromName: string;
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
  if (!payload.message?.trim()) return "message is required";
  if (!payload.privacy_consent || !normalizeBoolean(payload.privacy_consent)) {
    return "privacy_consent must be agreed";
  }

  return null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getMailConfig(): MailConfig | null {
  const host = Deno.env.get("ALERT_SMTP_HOST")?.trim();
  const port = Number(Deno.env.get("ALERT_SMTP_PORT") || "0");
  const username = Deno.env.get("ALERT_SMTP_USERNAME")?.trim();
  const password = Deno.env.get("ALERT_SMTP_PASSWORD")?.trim();
  const toEmail = Deno.env.get("ALERT_TO_EMAIL")?.trim();
  const fromEmail = Deno.env.get("ALERT_FROM_EMAIL")?.trim();
  const fromName = Deno.env.get("ALERT_FROM_NAME")?.trim() || "TBcos";

  if (!host || !port || !username || !password || !toEmail || !fromEmail) {
    return null;
  }

  return {
    host,
    port,
    username,
    password,
    toEmail,
    fromEmail,
    fromName
  };
}

async function sendAdminAlert(payload: InquiryPayload, inquiryId: string) {
  const config = getMailConfig();
  if (!config) {
    return {
      sent: false,
      error: "Alert SMTP secrets are not configured"
    };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.username,
      pass: config.password
    }
  });

  const company = payload.company_name?.trim() || "미입력";
  const contact = payload.contact_person?.trim() || "미입력";
  const email = payload.email?.trim() || "미입력";
  const type = payload.inquiry_type?.trim() || "other";
  const message = payload.message?.trim() || "";
  const sourcePage = payload.source_page?.trim() || "미기록";

  const subject = `[TBcos Inquiry] ${contact} / ${company}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111">
      <h2 style="margin:0 0 16px">새 문의가 접수되었습니다.</h2>
      <p style="margin:0 0 20px">TBcos 웹사이트 문의 폼에서 새 문의가 저장되었습니다.</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:700;background:#f8f8f8">문의 ID</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(inquiryId)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:700;background:#f8f8f8">회사명</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(company)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:700;background:#f8f8f8">담당자명</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(contact)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:700;background:#f8f8f8">이메일</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:700;background:#f8f8f8">문의 유형</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(type)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:700;background:#f8f8f8">접속 페이지</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(sourcePage)}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:700;background:#f8f8f8;vertical-align:top">문의 내용</td><td style="padding:8px 12px;border:1px solid #ddd;white-space:pre-wrap">${escapeHtml(message)}</td></tr>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: config.toEmail,
    replyTo: email !== "미입력" ? email : undefined,
    subject,
    html
  });

  return { sent: true };
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
  const bearerToken = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!apikey && !bearerToken) {
    return json(401, { ok: false, error: "Missing authorization headers" });
  }

  if (anonKey && ((apikey && apikey !== anonKey) || (bearerToken && bearerToken !== anonKey))) {
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

  const { data, error } = await supabase
    .from("inquiries")
    .insert({
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
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to store inquiry", error);
    return json(500, { ok: false, error: "Failed to store inquiry" });
  }

  try {
    const mailResult = await sendAdminAlert(payload, data.id);
    return json(200, {
      ok: true,
      inquiryId: data.id,
      mailSent: mailResult.sent,
      mailError: mailResult.sent ? null : mailResult.error
    });
  } catch (mailError) {
    console.error("Failed to send admin alert", mailError);
    return json(200, {
      ok: true,
      inquiryId: data.id,
      mailSent: false,
      mailError: mailError instanceof Error ? mailError.message : "Unknown mail error"
    });
  }
});
