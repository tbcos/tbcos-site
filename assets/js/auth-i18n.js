export const LANGUAGE_STORAGE_KEY = "tbcos-language";

const translations = {
  en: {
    common_back_to_tbcos: "Back to Home",
    common_my_account: "My Account",
    common_log_out: "Log Out",
    auth_title: "THREE BODY Auth",
    auth_eyebrow: "Buyer Access",
    auth_heading: "Log in for partner access and materials.",
    auth_intro: "This entry point is designed for brand partners, distributors, and buyers who want continued access to THREE BODY materials, account-based inquiries, and future partner-only content.",
    auth_feature_1_title: "Email and Kakao sign-in",
    auth_feature_1_desc: "Support Korean buyer behavior with email and Kakao as the primary access routes.",
    auth_feature_2_title: "Partner-ready account structure",
    auth_feature_2_desc: "Every new account can later map to approval status, buyer role, and company information.",
    auth_feature_3_title: "Flexible for gated pages",
    auth_feature_3_desc: "Ideal for future sample requests, brand decks, inquiry history, and distributor-only documents.",
    auth_note: "Note: Supabase OAuth callbacks do not work well from file URLs. For Kakao or email callback testing, use a local server such as http://localhost:8000 or your deployed domain.",
    auth_panel_eyebrow: "Supabase Auth",
    auth_panel_heading: "Sign in or create your account.",
    auth_panel_desc: "Start with a partner account so we can later connect buyers to gated materials and account-based workflows.",
    auth_tab_signin: "Sign In",
    auth_tab_signup: "Create Account",
    auth_kakao: "Continue with Kakao",
    auth_or: "or",
    auth_work_email: "Work Email",
    auth_work_email_placeholder: "you@company.com",
    auth_password: "Password",
    auth_password_placeholder: "Enter password",
    auth_forgot_password: "Find My Password",
    auth_signin_button: "Sign In",
    auth_full_name: "Full Name",
    auth_full_name_placeholder: "Your name",
    auth_company: "Company",
    auth_company_placeholder: "Company name",
    auth_signup_button: "Create Account",
    auth_status_signing_in: "Signing you in...",
    auth_status_creating: "Creating your account...",
    auth_status_created: "Account created. Please check your email to confirm the account.",
    auth_status_kakao: "Redirecting to Kakao...",
    auth_status_reset_needed: "Enter your work email first so we can send a reset link.",
    auth_status_reset_sending: "Sending a password reset email...",
    auth_status_reset_sent: "Password reset email sent. Please check your inbox.",
    auth_reset_modal_title: "Find your password",
    auth_reset_modal_desc: "Enter your work email and we will send you a password reset link.",
    auth_reset_send_button: "Send Reset Email",
    auth_reset_close: "Close",
    account_title: "THREE BODY Account",
    account_loading_title: "Loading account",
    account_loading_desc: "Checking your session and account details.",
    account_eyebrow: "Partner Account",
    account_intro: "This account area is the starting point for gated documents, inquiry history, sample requests, and partner-specific resources.",
    account_email_label: "Email",
    account_company_label: "Company",
    account_provider_label: "Provider",
    account_status_label: "Status",
    account_next_eyebrow: "Next Steps",
    account_next_heading: "Recommended partner flow",
    account_step_1_title: "1. Approve buyer access",
    account_step_1_desc: "Store a buyer profile in your database and move new members from pending to approved.",
    account_step_2_title: "2. Gate internal materials",
    account_step_2_desc: "Add protected pages for decks, brand kits, product catalogs, or distributor documents.",
    account_step_3_title: "3. Connect inquiries",
    account_step_3_desc: "Link inquiry history to the signed-in partner so repeat conversations stay organized.",
    account_not_configured_title: "Supabase is not configured yet.",
    account_not_configured_desc: "Add your Supabase URL and publishable key in assets/js/supabase-client.js to activate this page.",
    account_default_name: "THREE BODY Partner",
    account_default_company: "No company information registered",
    status_pending: "Awaiting approval",
    status_approved: "approved",
    status_rejected: "rejected",
    provider_email: "email",
    provider_kakao: "kakao",
    callback_title: "THREE BODY Auth Callback",
    callback_heading: "Completing sign-in",
    callback_waiting: "Waiting for your THREE BODY account session.",
    callback_not_configured: "Supabase is not configured yet. Add your project keys first.",
    callback_finishing: "Finishing sign-in...",
    callback_error: "Unable to finish sign-in.",
    callback_missing_session: "No session found yet. If you just confirmed your email, try opening the link again or return to the login page.",
    reset_title: "Reset Password | THREE BODY",
    reset_heading: "Create a new password",
    reset_intro: "Enter a new password to finish recovering your partner account.",
    reset_new_password: "New Password",
    reset_new_password_placeholder: "Enter a new password",
    reset_confirm_password: "Confirm Password",
    reset_confirm_password_placeholder: "Re-enter your new password",
    reset_submit: "Save New Password",
    reset_to_login: "Back to Sign In",
    reset_status_invalid: "This recovery link is invalid or has expired. Please request a new reset email.",
    reset_status_mismatch: "The passwords do not match.",
    reset_status_short: "Please use a password with at least 6 characters.",
    reset_status_saving: "Saving your new password...",
    reset_status_saved: "Your password has been updated. Please sign in again.",
    reset_status_error: "Unable to update your password."
  },
  ko: {
    common_back_to_tbcos: "홈으로 돌아가기",
    common_my_account: "내 계정",
    common_log_out: "로그아웃",
    auth_title: "THREE BODY 인증",
    auth_eyebrow: "파트너 전용 접근",
    auth_heading: "파트너 자료와 계정 기능을 위해 로그인하세요.",
    auth_intro: "이 페이지는 THREE BODY 자료, 계정 기반 문의, 향후 파트너 전용 콘텐츠에 지속적으로 접근하려는 브랜드 파트너, 유통사, 바이어를 위한 진입점입니다.",
    auth_feature_1_title: "이메일 및 Kakao 로그인",
    auth_feature_1_desc: "한국 바이어 환경에 맞춰 이메일과 Kakao를 주요 로그인 경로로 제공합니다.",
    auth_feature_2_title: "파트너 중심 계정 구조",
    auth_feature_2_desc: "새 계정은 이후 승인 상태, 바이어 역할, 회사 정보와 연결할 수 있습니다.",
    auth_feature_3_title: "비공개 페이지 확장에 유연함",
    auth_feature_3_desc: "향후 샘플 요청, 브랜드 소개서, 문의 이력, 유통사 전용 문서에 적합합니다.",
    auth_note: "참고: Supabase OAuth callback은 file 주소에서 안정적으로 동작하지 않습니다. Kakao 로그인이나 이메일 인증 테스트는 http://localhost:8000 또는 실제 배포 주소에서 진행하세요.",
    auth_panel_eyebrow: "Supabase 인증",
    auth_panel_heading: "로그인하거나 계정을 만드세요.",
    auth_panel_desc: "먼저 파트너 계정을 만들면 이후 바이어를 비공개 자료와 계정 기반 워크플로우에 연결할 수 있습니다.",
    auth_tab_signin: "로그인",
    auth_tab_signup: "회원가입",
    auth_kakao: "Kakao로 계속하기",
    auth_or: "또는",
    auth_work_email: "업무용 이메일",
    auth_work_email_placeholder: "you@company.com",
    auth_password: "비밀번호",
    auth_password_placeholder: "비밀번호를 입력하세요",
    auth_forgot_password: "내 비밀번호 찾기",
    auth_signin_button: "로그인",
    auth_full_name: "이름",
    auth_full_name_placeholder: "이름을 입력하세요",
    auth_company: "회사명",
    auth_company_placeholder: "회사명을 입력하세요",
    auth_signup_button: "회원가입",
    auth_status_signing_in: "로그인 중입니다...",
    auth_status_creating: "계정을 만드는 중입니다...",
    auth_status_created: "계정이 생성되었습니다. 이메일에서 인증을 완료해 주세요.",
    auth_status_kakao: "Kakao로 이동하는 중입니다...",
    auth_status_reset_needed: "재설정 메일을 보내려면 먼저 업무용 이메일을 입력해 주세요.",
    auth_status_reset_sending: "비밀번호 재설정 메일을 보내는 중입니다...",
    auth_status_reset_sent: "비밀번호 재설정 메일을 보냈습니다. 받은 편지함을 확인해 주세요.",
    auth_reset_modal_title: "내 비밀번호 찾기",
    auth_reset_modal_desc: "업무용 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.",
    auth_reset_send_button: "재설정 메일 보내기",
    auth_reset_close: "닫기",
    account_title: "THREE BODY 계정",
    account_loading_title: "계정을 불러오는 중",
    account_loading_desc: "세션과 계정 정보를 확인하고 있습니다.",
    account_eyebrow: "파트너 계정",
    account_intro: "이 계정 영역은 비공개 문서, 문의 이력, 샘플 요청, 파트너 전용 자료의 시작점입니다.",
    account_email_label: "이메일",
    account_company_label: "회사명",
    account_provider_label: "로그인 방식",
    account_status_label: "상태",
    account_next_eyebrow: "다음 단계",
    account_next_heading: "권장 파트너 흐름",
    account_step_1_title: "1. 바이어 접근 승인",
    account_step_1_desc: "DB에 바이어 프로필을 저장하고 신규 회원의 상태를 pending에서 approved로 변경합니다.",
    account_step_2_title: "2. 내부 자료 보호",
    account_step_2_desc: "소개서, 브랜드 키트, 제품 카탈로그, 유통사 문서용 보호 페이지를 추가합니다.",
    account_step_3_title: "3. 문의 이력 연결",
    account_step_3_desc: "로그인한 파트너와 문의 이력을 연결해 반복 커뮤니케이션을 정리합니다.",
    account_not_configured_title: "Supabase가 아직 설정되지 않았습니다.",
    account_not_configured_desc: "assets/js/supabase-client.js에 Supabase URL과 게시 가능한 키를 넣으면 이 페이지가 활성화됩니다.",
    account_default_name: "THREE BODY 파트너",
    account_default_company: "등록된 회사 정보 없음",
    status_pending: "승인 대기 중",
    status_approved: "승인 완료",
    status_rejected: "반려",
    provider_email: "이메일",
    provider_kakao: "카카오",
    callback_title: "THREE BODY 인증 콜백",
    callback_heading: "로그인을 마무리하는 중",
    callback_waiting: "THREE BODY 계정 세션을 기다리고 있습니다.",
    callback_not_configured: "Supabase가 아직 설정되지 않았습니다. 먼저 프로젝트 키를 입력해 주세요.",
    callback_finishing: "로그인을 마무리하는 중입니다...",
    callback_error: "로그인을 완료할 수 없습니다.",
    callback_missing_session: "아직 세션이 확인되지 않습니다. 이메일 인증을 막 마쳤다면 링크를 다시 열거나 로그인 페이지로 돌아가 주세요.",
    reset_title: "비밀번호 재설정 | THREE BODY",
    reset_heading: "새 비밀번호를 설정하세요",
    reset_intro: "파트너 계정 복구를 마무리하려면 새 비밀번호를 입력해 주세요.",
    reset_new_password: "새 비밀번호",
    reset_new_password_placeholder: "새 비밀번호를 입력하세요",
    reset_confirm_password: "새 비밀번호 확인",
    reset_confirm_password_placeholder: "새 비밀번호를 다시 입력하세요",
    reset_submit: "새 비밀번호 저장",
    reset_to_login: "로그인으로 돌아가기",
    reset_status_invalid: "이 복구 링크는 유효하지 않거나 만료되었습니다. 새 재설정 메일을 다시 요청해 주세요.",
    reset_status_mismatch: "비밀번호가 서로 일치하지 않습니다.",
    reset_status_short: "비밀번호는 6자 이상으로 입력해 주세요.",
    reset_status_saving: "새 비밀번호를 저장하는 중입니다...",
    reset_status_saved: "비밀번호가 변경되었습니다. 다시 로그인해 주세요.",
    reset_status_error: "비밀번호를 변경할 수 없습니다."
  }
};

export function getCurrentLanguage() {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage === "ko" || savedLanguage === "en") return savedLanguage;
  return document.documentElement.lang === "ko" ? "ko" : "en";
}

export function translate(key, language = getCurrentLanguage()) {
  const copy = translations[language] || translations.en;
  return copy[key] || translations.en[key] || key;
}

export function applyLanguage(language = getCurrentLanguage()) {
  document.documentElement.lang = language === "ko" ? "ko" : "en";
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = translate(key, language);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    element.placeholder = translate(key, language);
  });

  document.title = translate(document.body.dataset.titleKey || "auth_title", language);

  document.querySelectorAll(".lang-switch").forEach((switcher) => {
    switcher.dataset.active = language;
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.dispatchEvent(new CustomEvent("tbcos:languagechange", {
    detail: { language }
  }));
}

export function initLanguageControls(defaultTitleKey = "auth_title") {
  document.body.dataset.titleKey = defaultTitleKey;

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.lang);
    });
  });

  const language = getCurrentLanguage() || (navigator.language && navigator.language.startsWith("ko") ? "ko" : "en");
  applyLanguage(language);
}
