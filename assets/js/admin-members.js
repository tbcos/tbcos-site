import {
  ensureAdminAccess,
  initAdminLanguage,
  wireCommonAdminUi,
  callAdminFunction,
  t,
  formatDate
} from "./admin-common.js";

initAdminLanguage("admin_members_title");
wireCommonAdminUi();

const loadingSection = document.getElementById("adminLoading");
const deniedSection = document.getElementById("adminDenied");
const contentSection = document.getElementById("adminContent");
const memberList = document.getElementById("memberList");
const memberListEmpty = document.getElementById("memberListEmpty");
const memberSearch = document.getElementById("memberSearch");
const memberStatusFilter = document.getElementById("memberStatusFilter");
const memberSaveStatus = document.getElementById("memberSaveStatus");
const memberSaveButton = document.getElementById("memberSaveButton");

let members = [];
let selectedMemberId = null;

function memberStatusLabel(status) {
  return t(`status_${status}`) || status;
}

function memberRoleLabel(role) {
  return t(`role_${role}`) || role;
}

function renderMemberList() {
  const keyword = memberSearch.value.trim().toLowerCase();
  const statusValue = memberStatusFilter.value;
  const filtered = members.filter((member) => {
    const haystack = [
      member.full_name,
      member.company_name,
      member.email
    ].join(" ").toLowerCase();

    const matchesKeyword = !keyword || haystack.includes(keyword);
    const matchesStatus = !statusValue || member.status === statusValue;
    return matchesKeyword && matchesStatus;
  });

  memberList.innerHTML = "";
  memberListEmpty.classList.toggle("hidden", filtered.length !== 0);

  filtered.forEach((member) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `rounded-[22px] border px-4 py-4 text-left transition ${
      member.id === selectedMemberId
        ? "border-black/20 bg-white shadow-sm"
        : "border-line bg-white/55 hover:border-black/15 hover:bg-white/75"
    }`;

    button.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-ink">${member.full_name || member.email}</p>
          <p class="mt-1 text-sm text-muted">${member.company_name || t("admin_unknown")}</p>
        </div>
        <span class="rounded-full border border-line bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55">${memberStatusLabel(member.status)}</span>
      </div>
      <p class="mt-3 text-sm text-muted">${member.email}</p>
      <p class="mt-2 text-xs text-black/45">${formatDate(member.created_at)}</p>
    `;

    button.addEventListener("click", () => {
      selectedMemberId = member.id;
      renderMemberList();
      renderMemberDetail();
    });

    memberList.appendChild(button);
  });

  if (!selectedMemberId && filtered.length) {
    selectedMemberId = filtered[0].id;
    renderMemberList();
    renderMemberDetail();
  }
}

function renderMemberDetail() {
  const member = members.find((item) => item.id === selectedMemberId) || members[0];
  if (!member) return;

  selectedMemberId = member.id;
  document.getElementById("memberName").value = member.full_name || "";
  document.getElementById("memberCompany").value = member.company_name || "";
  document.getElementById("memberEmail").textContent = member.email || t("admin_unknown");
  document.getElementById("memberProvider").textContent = member.provider || t("admin_unknown");
  document.getElementById("memberStatus").value = member.status || "pending";
  document.getElementById("memberRole").value = member.role || "buyer";
  document.getElementById("memberCreated").textContent = formatDate(member.created_at);
  document.getElementById("memberLastSignIn").textContent = member.last_sign_in_at ? formatDate(member.last_sign_in_at) : t("admin_unknown");
  memberSaveStatus.textContent = "";
}

async function loadMembers() {
  const result = await callAdminFunction("admin-members");
  members = result.members || [];
  selectedMemberId = members[0]?.id || null;
  renderMemberList();
  renderMemberDetail();
}

async function saveMember() {
  if (!selectedMemberId) return;

  memberSaveButton.disabled = true;
  memberSaveStatus.textContent = "";

  try {
    const result = await callAdminFunction("admin-members", {
      method: "PATCH",
      body: {
        id: selectedMemberId,
        full_name: document.getElementById("memberName").value,
        company_name: document.getElementById("memberCompany").value,
        status: document.getElementById("memberStatus").value,
        role: document.getElementById("memberRole").value
      }
    });

    members = members.map((item) => (item.id === selectedMemberId ? result.member : item));
    memberSaveStatus.textContent = t("admin_member_saved");
    renderMemberList();
    renderMemberDetail();
  } catch (error) {
    memberSaveStatus.textContent = error.message || t("auth_error_generic");
  } finally {
    memberSaveButton.disabled = false;
  }
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
    await loadMembers();
  } catch (error) {
    memberListEmpty.classList.remove("hidden");
    memberListEmpty.textContent = error.message || t("admin_dashboard_load_error");
  }
}

memberSaveButton.addEventListener("click", saveMember);
memberSearch.addEventListener("input", renderMemberList);
memberStatusFilter.addEventListener("change", renderMemberList);
document.addEventListener("tbcos:languagechange", () => {
  renderMemberList();
  renderMemberDetail();
});

boot();
