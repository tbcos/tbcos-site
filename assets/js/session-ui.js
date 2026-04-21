import { supabase, isSupabaseConfigured } from "./supabase-client.js";

const desktopTarget = document.getElementById("authNavDesktop");
const mobileTarget = document.getElementById("authNavMobile");
const LANGUAGE_STORAGE_KEY = "tbcos-language";
const AUTH_CLEAR_KEY = "tbcos-clear-auth";

const authCopy = {
  en: {
    signIn: "Sign In",
    createAccount: "Create Account",
    myAccount: "My Account",
    admin: "Admin",
    logOut: "Log Out"
  },
  ko: {
    signIn: "로그인",
    createAccount: "회원가입",
    myAccount: "내 계정",
    admin: "관리자",
    logOut: "로그아웃"
  }
};

function getCurrentLanguage() {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage === "ko" || savedLanguage === "en") return savedLanguage;
  return document.documentElement.lang === "ko" ? "ko" : "en";
}

function getCopy() {
  return authCopy[getCurrentLanguage()] || authCopy.en;
}

function buildLink(label, href, className = "") {
  const classes = `auth-chip ${className}`.trim();
  return `<a class="${classes}" href="${href}">${label}</a>`;
}

function buildButton(label, id, className = "") {
  const classes = `auth-chip ${className}`.trim();
  return `<button type="button" class="${classes}" id="${id}">${label}</button>`;
}

function renderGuest() {
  const copy = getCopy();
  const guestMarkup = [
    buildLink(copy.signIn, "auth.html", "ghost"),
    buildLink(copy.createAccount, "auth.html#signup", "primary")
  ].join("");

  if (desktopTarget) desktopTarget.innerHTML = guestMarkup;
  if (mobileTarget) mobileTarget.innerHTML = guestMarkup;
}

function renderMember(user) {
  const copy = getCopy();
  const displayName = user?.user_metadata?.full_name || user?.email || copy.myAccount;
  const isAdmin = user?.user_metadata?.role === "admin";
  const memberMarkup = [
    buildLink(displayName, "account.html", "ghost"),
    isAdmin ? buildLink(copy.admin, "admin.html", "ghost") : "",
    buildButton(copy.logOut, "logoutButton", "primary")
  ].join("");

  if (desktopTarget) desktopTarget.innerHTML = memberMarkup;
  if (mobileTarget) mobileTarget.innerHTML = memberMarkup;

  document.querySelectorAll("#logoutButton").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!supabase) return;
      window.sessionStorage.setItem(AUTH_CLEAR_KEY, "1");
      await supabase.auth.signOut();
      window.location.href = "index.html";
    });
  });
}

async function renderAuthState() {
  if (!isSupabaseConfigured || !supabase) {
    renderGuest();
    return;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    renderGuest();
    return;
  }

  renderMember(data.session.user);
}

renderAuthState();

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      renderMember(session.user);
      return;
    }

    renderGuest();
  });
}

document.addEventListener("tbcos:languagechange", async () => {
  await renderAuthState();
});
