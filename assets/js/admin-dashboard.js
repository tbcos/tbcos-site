import { ensureAdminAccess, initAdminLanguage, wireCommonAdminUi, callAdminFunction, t, formatDate } from "./admin-common.js";

initAdminLanguage("admin_dashboard_title");
wireCommonAdminUi();

const loadingSection = document.getElementById("adminLoading");
const deniedSection = document.getElementById("adminDenied");
const contentSection = document.getElementById("adminContent");
const reloadButton = document.getElementById("adminReload");
const metricInquiries = document.getElementById("adminMetricInquiries");
const metricPendingMembers = document.getElementById("adminMetricPendingMembers");
const metricApprovedMembers = document.getElementById("adminMetricApprovedMembers");
const metricAdmins = document.getElementById("adminMetricAdmins");
const recentInquiries = document.getElementById("adminRecentInquiries");
const recentMembers = document.getElementById("adminRecentMembers");
const dashboardStatus = document.getElementById("adminDashboardStatus");

reloadButton?.addEventListener("click", () => window.location.reload());

function renderRecentItems(target, items, formatter) {
  if (!target) return;
  target.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.textContent = t("admin_dashboard_empty_recent");
    target.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "rounded-[18px] border border-line bg-white/70 px-4 py-3";
    row.innerHTML = formatter(item);
    target.appendChild(row);
  });
}

async function loadDashboardData() {
  dashboardStatus.textContent = "";

  const [inquiryResult, memberResult] = await Promise.all([
    callAdminFunction("admin-inquiries"),
    callAdminFunction("admin-members")
  ]);

  const inquiries = inquiryResult.inquiries || [];
  const members = memberResult.members || [];
  const pendingMembers = members.filter((member) => member.status === "pending");
  const approvedMembers = members.filter((member) => member.status === "approved");
  const adminMembers = members.filter((member) => member.role === "admin");

  if (metricInquiries) metricInquiries.textContent = String(inquiries.length);
  if (metricPendingMembers) metricPendingMembers.textContent = String(pendingMembers.length);
  if (metricApprovedMembers) metricApprovedMembers.textContent = String(approvedMembers.length);
  if (metricAdmins) metricAdmins.textContent = String(adminMembers.length);

  renderRecentItems(recentInquiries, inquiries.slice(0, 3), (inquiry) => `
    <p class="font-semibold text-ink">${inquiry.company_name || inquiry.contact_person || inquiry.email}</p>
    <p class="mt-1 text-sm text-muted">${inquiry.contact_person || t("admin_unknown")} · ${formatDate(inquiry.created_at)}</p>
  `);

  renderRecentItems(recentMembers, members.slice(0, 3), (member) => `
    <p class="font-semibold text-ink">${member.full_name || member.email}</p>
    <p class="mt-1 text-sm text-muted">${member.company_name || t("admin_unknown")} · ${formatDate(member.created_at)}</p>
  `);
}

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
  try {
    await loadDashboardData();
  } catch (error) {
    dashboardStatus.textContent = error.message || t("admin_dashboard_load_error");
    if (metricInquiries) metricInquiries.textContent = "!";
    if (metricPendingMembers) metricPendingMembers.textContent = "!";
    if (metricApprovedMembers) metricApprovedMembers.textContent = "!";
    if (metricAdmins) metricAdmins.textContent = "!";
  }
}

boot();
