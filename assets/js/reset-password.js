import { supabase, isSupabaseConfigured } from "./supabase-client.js";
import { translate, initLanguageControls } from "./auth-i18n.js";

const statusBox = document.getElementById("resetStatus");
const form = document.getElementById("resetPasswordForm");
const passwordInput = document.getElementById("resetPassword");
const confirmInput = document.getElementById("resetPasswordConfirm");

initLanguageControls("reset_title");

function setStatus(message, tone = "neutral") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.tone = tone;
  statusBox.className = `min-h-6 pt-4 text-sm ${tone === "error" ? "text-[#b34b4b]" : tone === "success" ? "text-[#4f6b4d]" : "text-muted"}`;
}

async function validateRecoverySession() {
  if (!isSupabaseConfigured || !supabase) {
    setStatus(translate("callback_not_configured"), "error");
    if (form) form.hidden = true;
    return false;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    setStatus(translate("reset_status_invalid"), "error");
    if (form) form.hidden = true;
    return false;
  }

  setStatus("");
  return true;
}

async function handleResetPassword(event) {
  event.preventDefault();

  const password = passwordInput?.value || "";
  const confirmPassword = confirmInput?.value || "";

  if (password.length < 6) {
    setStatus(translate("reset_status_short"), "error");
    return;
  }

  if (password !== confirmPassword) {
    setStatus(translate("reset_status_mismatch"), "error");
    return;
  }

  try {
    setStatus(translate("reset_status_saving"));

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;

    setStatus(translate("reset_status_saved"), "success");

    window.setTimeout(() => {
      window.location.href = "auth.html";
    }, 1600);
  } catch (error) {
    setStatus(error.message || translate("reset_status_error"), "error");
  }
}

validateRecoverySession();

if (form) {
  form.addEventListener("submit", handleResetPassword);
}
