import { supabase, isSupabaseConfigured } from "./supabase-client.js";
import { translate, initLanguageControls } from "./auth-i18n.js";

const emptyState = document.getElementById("accountEmpty");
const accountContent = document.getElementById("accountContent");
const signOutButtons = document.querySelectorAll("[data-signout]");
const adminLink = document.getElementById("accountAdminLink");
const AUTH_CLEAR_KEY = "tbcos-clear-auth";

initLanguageControls("account_title");

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

async function renderAccount() {
  if (!isSupabaseConfigured || !supabase) {
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.innerHTML = `<h2>${translate("account_not_configured_title")}</h2><p>${translate("account_not_configured_desc")}</p>`;
    }
    return;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    window.location.href = "auth.html";
    return;
  }

  const user = data.session.user;
  const meta = user.user_metadata || {};
  const displayName = meta.full_name || translate("account_default_name");
  const companyName = meta.company_name || translate("account_default_company");
  const status = meta.status || "pending";
  const provider = user.app_metadata?.provider || "email";
  const isAdmin = meta.role === "admin";

  if (emptyState) emptyState.hidden = true;
  if (accountContent) accountContent.hidden = false;
  if (adminLink) adminLink.classList.toggle("hidden", !isAdmin);

  setText("accountName", displayName);
  setText("accountEmail", user.email || "");
  setText("accountCompany", companyName);
  setText("accountProvider", translate(`provider_${provider}`));
  setText("accountStatus", translate(`status_${status}`));
}

signOutButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (!supabase) return;
    window.sessionStorage.setItem(AUTH_CLEAR_KEY, "1");
    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
});

renderAccount();

document.addEventListener("tbcos:languagechange", () => {
  renderAccount();
});
