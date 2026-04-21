import { supabase, isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-client.js";

const LANGUAGE_STORAGE_KEY = "tbcos-language";

const translations = {
  en: {
    common_back_home: "Back to Home",
    common_sign_out: "Log Out",
    admin_badge: "Admin Panel",
    admin_nav_overview: "Overview",
    admin_nav_inquiries: "Inquiries",
    admin_nav_members: "Members",
    admin_loading_title: "Loading admin access",
    admin_loading_desc: "Checking your session and administrator permissions.",
    admin_not_configured_title: "Supabase is not configured yet.",
    admin_not_configured_desc: "Add your Supabase URL and publishable key first.",
    admin_access_denied_title: "Administrator access required",
    admin_access_denied_desc: "This page is only available to accounts with the admin role.",
    admin_access_denied_hint: "Set user_metadata.role to admin in Supabase before using this page.",
    admin_retry: "Reload",
    admin_dashboard_title: "TBcos Admin",
    admin_dashboard_eyebrow: "Operations",
    admin_dashboard_heading: "Manage inquiries and members from one place.",
    admin_dashboard_intro: "Use this panel to review incoming inquiries, update handling status, and maintain buyer account states without opening the Supabase dashboard each time.",
    admin_dashboard_card_inquiries_title: "Inquiry management",
    admin_dashboard_card_inquiries_desc: "Review recent submissions, update status, and save internal notes.",
    admin_dashboard_card_members_title: "Member management",
    admin_dashboard_card_members_desc: "Review signups, approve buyer access, and update partner metadata.",
    admin_dashboard_card_setup_title: "Recommended setup",
    admin_dashboard_card_setup_desc: "Make sure your own account has user_metadata.role = admin before using these pages in production.",
    admin_open_inquiries: "Open Inquiry Manager",
    admin_open_members: "Open Member Manager",
    admin_inquiries_title: "Admin Inquiries",
    admin_inquiries_eyebrow: "Inquiry Management",
    admin_inquiries_heading: "Track incoming inquiries and internal handling notes.",
    admin_inquiries_search: "Search by company, name, email, or message",
    admin_inquiries_filter_all: "All statuses",
    admin_inquiries_list_title: "Inquiry list",
    admin_inquiries_empty: "No inquiries matched the current filter.",
    admin_inquiry_detail_title: "Inquiry detail",
    admin_inquiry_status: "Status",
    admin_inquiry_note: "Internal note",
    admin_inquiry_note_placeholder: "Add internal handling notes here.",
    admin_inquiry_save: "Save Changes",
    admin_inquiry_saved: "Inquiry updated successfully.",
    admin_inquiry_source: "Source page",
    admin_inquiry_email: "Email",
    admin_inquiry_company: "Company",
    admin_inquiry_contact: "Contact",
    admin_inquiry_type: "Type",
    admin_inquiry_message: "Message",
    admin_members_title: "Admin Members",
    admin_members_eyebrow: "Member Management",
    admin_members_heading: "Review partner accounts and update approval status.",
    admin_members_search: "Search by name, company, or email",
    admin_members_filter_all: "All member statuses",
    admin_members_list_title: "Member list",
    admin_members_empty: "No members matched the current filter.",
    admin_member_detail_title: "Member detail",
    admin_member_name: "Full Name",
    admin_member_company: "Company",
    admin_member_email: "Email",
    admin_member_provider: "Provider",
    admin_member_status: "Status",
    admin_member_role: "Role",
    admin_member_created: "Created",
    admin_member_last_sign_in: "Last sign-in",
    admin_member_save: "Save Member",
    admin_member_saved: "Member updated successfully.",
    admin_unknown: "Not available",
    status_new: "New",
    status_in_progress: "In Progress",
    status_replied: "Replied",
    status_closed: "Closed",
    status_pending: "Awaiting approval",
    status_approved: "Approved",
    status_rejected: "Rejected",
    role_admin: "Admin",
    role_buyer: "Buyer"
  },
  ko: {
    common_back_home: "홈으로 돌아가기",
    common_sign_out: "로그아웃",
    admin_badge: "관리자 패널",
    admin_nav_overview: "개요",
    admin_nav_inquiries: "문의",
    admin_nav_members: "회원",
    admin_loading_title: "관리자 권한 확인 중",
    admin_loading_desc: "세션과 관리자 권한을 확인하고 있습니다.",
    admin_not_configured_title: "Supabase가 아직 설정되지 않았습니다.",
    admin_not_configured_desc: "먼저 Supabase URL과 게시 가능한 키를 연결해 주세요.",
    admin_access_denied_title: "관리자 권한이 필요합니다",
    admin_access_denied_desc: "이 페이지는 admin 역할이 있는 계정만 사용할 수 있습니다.",
    admin_access_denied_hint: "운영 전에는 Supabase에서 user_metadata.role 값을 admin으로 설정해 주세요.",
    admin_retry: "새로고침",
    admin_dashboard_title: "TBcos 관리자",
    admin_dashboard_eyebrow: "운영",
    admin_dashboard_heading: "문의와 회원을 한 화면에서 관리합니다.",
    admin_dashboard_intro: "이 패널에서 새 문의를 확인하고, 처리 상태를 변경하고, 바이어 계정 상태를 관리할 수 있습니다.",
    admin_dashboard_card_inquiries_title: "문의 관리",
    admin_dashboard_card_inquiries_desc: "최근 문의를 확인하고 상태와 내부 메모를 업데이트합니다.",
    admin_dashboard_card_members_title: "회원 관리",
    admin_dashboard_card_members_desc: "가입 회원을 검토하고 바이어 접근 상태를 변경합니다.",
    admin_dashboard_card_setup_title: "권장 설정",
    admin_dashboard_card_setup_desc: "실사용 전에는 본인 계정의 user_metadata.role 값을 admin으로 지정해 두는 것이 좋습니다.",
    admin_open_inquiries: "문의 관리 열기",
    admin_open_members: "회원 관리 열기",
    admin_inquiries_title: "관리자 문의",
    admin_inquiries_eyebrow: "문의 관리",
    admin_inquiries_heading: "들어온 문의와 내부 처리 메모를 관리합니다.",
    admin_inquiries_search: "회사명, 이름, 이메일, 문의 내용으로 검색",
    admin_inquiries_filter_all: "모든 상태",
    admin_inquiries_list_title: "문의 목록",
    admin_inquiries_empty: "현재 필터에 맞는 문의가 없습니다.",
    admin_inquiry_detail_title: "문의 상세",
    admin_inquiry_status: "상태",
    admin_inquiry_note: "내부 메모",
    admin_inquiry_note_placeholder: "처리 메모를 남겨 주세요.",
    admin_inquiry_save: "변경 저장",
    admin_inquiry_saved: "문의 정보가 저장되었습니다.",
    admin_inquiry_source: "유입 페이지",
    admin_inquiry_email: "이메일",
    admin_inquiry_company: "회사명",
    admin_inquiry_contact: "담당자명",
    admin_inquiry_type: "문의 유형",
    admin_inquiry_message: "문의 내용",
    admin_members_title: "관리자 회원",
    admin_members_eyebrow: "회원 관리",
    admin_members_heading: "파트너 계정을 검토하고 승인 상태를 관리합니다.",
    admin_members_search: "이름, 회사명, 이메일로 검색",
    admin_members_filter_all: "모든 회원 상태",
    admin_members_list_title: "회원 목록",
    admin_members_empty: "현재 필터에 맞는 회원이 없습니다.",
    admin_member_detail_title: "회원 상세",
    admin_member_name: "이름",
    admin_member_company: "회사명",
    admin_member_email: "이메일",
    admin_member_provider: "로그인 방식",
    admin_member_status: "상태",
    admin_member_role: "역할",
    admin_member_created: "가입일",
    admin_member_last_sign_in: "최근 로그인",
    admin_member_save: "회원 정보 저장",
    admin_member_saved: "회원 정보가 저장되었습니다.",
    admin_unknown: "기록 없음",
    status_new: "신규",
    status_in_progress: "처리 중",
    status_replied: "회신 완료",
    status_closed: "종료",
    status_pending: "승인 대기 중",
    status_approved: "승인 완료",
    status_rejected: "반려",
    role_admin: "관리자",
    role_buyer: "바이어"
  }
};

export function getCurrentLanguage() {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage === "ko" || savedLanguage === "en") return savedLanguage;
  return document.documentElement.lang === "ko" ? "ko" : "en";
}

export function t(key, language = getCurrentLanguage()) {
  return translations[language]?.[key] || translations.en[key] || key;
}

export function formatDate(value, language = getCurrentLanguage()) {
  if (!value) return t("admin_unknown", language);
  try {
    return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch (_error) {
    return value;
  }
}

export function applyAdminLanguage(language = getCurrentLanguage()) {
  document.documentElement.lang = language === "ko" ? "ko" : "en";
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = t(key, language);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    element.placeholder = t(key, language);
  });

  document.querySelectorAll(".lang-switch").forEach((switcher) => {
    switcher.dataset.active = language;
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const titleKey = document.body.dataset.titleKey;
  if (titleKey) document.title = t(titleKey, language);

  document.dispatchEvent(new CustomEvent("tbcos:languagechange", {
    detail: { language }
  }));
}

export function initAdminLanguage(titleKey) {
  document.body.dataset.titleKey = titleKey;
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => applyAdminLanguage(button.dataset.lang));
  });
  applyAdminLanguage(getCurrentLanguage());
}

export async function ensureAdminAccess() {
  if (!isSupabaseConfigured || !supabase) {
    return { configured: false, session: null, user: null, isAdmin: false };
  }

  const { data, error } = await supabase.auth.getSession();
  const session = data?.session || null;
  const user = session?.user || null;

  if (error || !user) {
    return { configured: true, session: null, user: null, isAdmin: false };
  }

  return {
    configured: true,
    session,
    user,
    isAdmin: user.user_metadata?.role === "admin"
  };
}

export async function callAdminFunction(functionName, { method = "GET", body } = {}) {
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("No active admin session");
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${data.session.access_token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || "Admin request failed");
  }

  return result;
}

export function wireCommonAdminUi() {
  document.querySelectorAll("[data-admin-signout]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
      window.location.href = "index.html";
    });
  });
}
