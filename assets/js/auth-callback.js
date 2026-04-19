import { supabase, isSupabaseConfigured } from "./supabase-client.js";
import { translate, initLanguageControls } from "./auth-i18n.js";

const statusText = document.getElementById("callbackStatus");

initLanguageControls("callback_title");

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

async function handleCallback() {
  if (!isSupabaseConfigured || !supabase) {
    setStatus(translate("callback_not_configured"));
    return;
  }

  setStatus(translate("callback_finishing"));

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setStatus(error.message || translate("callback_error"));
    return;
  }

  if (data.session?.user) {
    window.location.replace("account.html");
    return;
  }

  setStatus(translate("callback_missing_session"));
}

handleCallback();
