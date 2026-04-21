import {
  ensureAdminAccess,
  initAdminLanguage,
  wireCommonAdminUi,
  callAdminFunction,
  t,
  formatDate
} from "./admin-common.js";

initAdminLanguage("admin_inquiries_title");
wireCommonAdminUi();

const loadingSection = document.getElementById("adminLoading");
const deniedSection = document.getElementById("adminDenied");
const contentSection = document.getElementById("adminContent");
const inquiryList = document.getElementById("inquiryList");
const inquiryListEmpty = document.getElementById("inquiryListEmpty");
const inquirySearch = document.getElementById("inquirySearch");
const inquiryStatusFilter = document.getElementById("inquiryStatusFilter");
const saveStatus = document.getElementById("inquirySaveStatus");
const saveButton = document.getElementById("inquirySaveButton");
const detailStatus = document.getElementById("detailStatus");
const detailNote = document.getElementById("detailNote");

let inquiries = [];
let selectedInquiryId = null;

function inquiryStatusLabel(status) {
  return t(`status_${status}`) || status;
}

function renderInquiryList() {
  const keyword = inquirySearch.value.trim().toLowerCase();
  const statusValue = inquiryStatusFilter.value;
  const filtered = inquiries.filter((inquiry) => {
    const haystack = [
      inquiry.company_name,
      inquiry.contact_person,
      inquiry.email,
      inquiry.message
    ].join(" ").toLowerCase();

    const matchesKeyword = !keyword || haystack.includes(keyword);
    const matchesStatus = !statusValue || inquiry.status === statusValue;
    return matchesKeyword && matchesStatus;
  });

  inquiryList.innerHTML = "";
  inquiryListEmpty.classList.toggle("hidden", filtered.length !== 0);

  filtered.forEach((inquiry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `rounded-[22px] border px-4 py-4 text-left transition ${
      inquiry.id === selectedInquiryId
        ? "border-black/20 bg-white shadow-sm"
        : "border-line bg-white/55 hover:border-black/15 hover:bg-white/75"
    }`;

    button.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-ink">${inquiry.company_name || inquiry.contact_person}</p>
          <p class="mt-1 text-sm text-muted">${inquiry.contact_person} · ${inquiry.email}</p>
        </div>
        <span class="rounded-full border border-line bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55">${inquiryStatusLabel(inquiry.status)}</span>
      </div>
      <p class="mt-3 line-clamp-2 text-sm leading-7 text-muted">${inquiry.message || ""}</p>
      <p class="mt-3 text-xs text-black/45">${formatDate(inquiry.created_at)}</p>
    `;

    button.addEventListener("click", () => {
      selectedInquiryId = inquiry.id;
      renderInquiryList();
      renderInquiryDetail();
    });

    inquiryList.appendChild(button);
  });

  if (!selectedInquiryId && filtered.length) {
    selectedInquiryId = filtered[0].id;
    renderInquiryList();
    renderInquiryDetail();
  }
}

function renderInquiryDetail() {
  const inquiry = inquiries.find((item) => item.id === selectedInquiryId) || inquiries[0];
  if (!inquiry) return;

  selectedInquiryId = inquiry.id;
  document.getElementById("detailCompany").textContent = inquiry.company_name || t("admin_unknown");
  document.getElementById("detailContact").textContent = inquiry.contact_person || t("admin_unknown");
  document.getElementById("detailEmail").textContent = inquiry.email || t("admin_unknown");
  document.getElementById("detailType").textContent = inquiry.inquiry_type || t("admin_unknown");
  document.getElementById("detailSource").textContent = inquiry.source_page || t("admin_unknown");
  document.getElementById("detailMessage").textContent = inquiry.message || t("admin_unknown");
  detailStatus.value = inquiry.status || "new";
  detailNote.value = inquiry.admin_note || "";
  saveStatus.textContent = "";
}

async function loadInquiries() {
  const result = await callAdminFunction("admin-inquiries");
  inquiries = result.inquiries || [];
  selectedInquiryId = inquiries[0]?.id || null;
  renderInquiryList();
  renderInquiryDetail();
}

async function saveInquiry() {
  if (!selectedInquiryId) return;

  saveButton.disabled = true;
  saveStatus.textContent = "";

  try {
    const result = await callAdminFunction("admin-inquiries", {
      method: "PATCH",
      body: {
        id: selectedInquiryId,
        status: detailStatus.value,
        admin_note: detailNote.value
      }
    });

    inquiries = inquiries.map((item) =>
      item.id === selectedInquiryId
        ? { ...item, status: result.inquiry.status, admin_note: result.inquiry.admin_note }
        : item
    );

    saveStatus.textContent = t("admin_inquiry_saved");
    renderInquiryList();
    renderInquiryDetail();
  } catch (error) {
    saveStatus.textContent = error.message || t("auth_error_generic");
  } finally {
    saveButton.disabled = false;
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
  await loadInquiries();
}

saveButton.addEventListener("click", saveInquiry);
inquirySearch.addEventListener("input", renderInquiryList);
inquiryStatusFilter.addEventListener("change", renderInquiryList);
document.addEventListener("tbcos:languagechange", () => {
  renderInquiryList();
  renderInquiryDetail();
});

boot();
