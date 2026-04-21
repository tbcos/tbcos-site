import { ensureAdminAccess, initAdminLanguage, wireCommonAdminUi } from "./admin-common.js";

initAdminLanguage("admin_dashboard_title");
wireCommonAdminUi();

const loadingSection = document.getElementById("adminLoading");
const deniedSection = document.getElementById("adminDenied");
const contentSection = document.getElementById("adminContent");
const reloadButton = document.getElementById("adminReload");

reloadButton?.addEventListener("click", () => window.location.reload());

async function boot() {
  const access = await ensureAdminAccess();

  if (!access.configured) {
    loadingSection.querySelector("[data-i18n='admin_loading_title']").textContent = "Supabase is not configured yet.";
    loadingSection.querySelector("[data-i18n='admin_loading_desc']").textContent = "Add your Supabase URL and publishable key first.";
    return;
  }

  if (!access.session?.user) {
    window.location.href = "auth.html";
    return;
  }

  if (!access.isAdmin) {
    loadingSection.classList.add("hidden");
    deniedSection.classList.remove("hidden");
    return;
  }

  loadingSection.classList.add("hidden");
  contentSection.classList.remove("hidden");
}

boot();
