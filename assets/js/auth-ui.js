import { requireConfiguredSupabase, getAbsoluteUrl } from "./supabase-client.js";
import { translate, initLanguageControls } from "./auth-i18n.js";

const statusBox = document.getElementById("authStatus");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const kakaoButtons = document.querySelectorAll("[data-auth-provider='kakao']");
const tabButtons = document.querySelectorAll("[data-auth-tab]");
const panels = document.querySelectorAll("[data-auth-panel]");
const tabSwitch = document.querySelector(".tab-switch");

initLanguageControls("auth_title");

function showStatus(message, tone = "neutral") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.tone = tone;
}

function setActiveTab(tab) {
  if (tabSwitch) {
    tabSwitch.dataset.active = tab;
  }

  tabButtons.forEach((button) => {
    const isActive = button.dataset.authTab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.authPanel !== tab;
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.authTab);
  });
});

if (window.location.hash === "#signup") {
  setActiveTab("signup");
}

async function signInWithEmail(event) {
  event.preventDefault();

  try {
    const supabase = requireConfiguredSupabase();
    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value;

    showStatus(translate("auth_status_signing_in"));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    window.location.href = "account.html";
  } catch (error) {
    showStatus(error.message || "Unable to sign in.", "error");
  }
}

async function signUpWithEmail(event) {
  event.preventDefault();

  try {
    const supabase = requireConfiguredSupabase();
    const fullName = document.getElementById("signUpName").value.trim();
    const companyName = document.getElementById("signUpCompany").value.trim();
    const email = document.getElementById("signUpEmail").value.trim();
    const password = document.getElementById("signUpPassword").value;

    showStatus(translate("auth_status_creating"));

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAbsoluteUrl("auth-callback.html"),
        data: {
          full_name: fullName,
          company_name: companyName,
          role: "buyer",
          status: "pending"
        }
      }
    });

    if (error) throw error;

    showStatus(translate("auth_status_created"), "success");
    setActiveTab("signin");
  } catch (error) {
    showStatus(error.message || "Unable to create account.", "error");
  }
}

async function signInWithKakao() {
  try {
    const supabase = requireConfiguredSupabase();
    showStatus(translate("auth_status_kakao"));

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: getAbsoluteUrl("auth-callback.html")
      }
    });

    if (error) throw error;
  } catch (error) {
    showStatus(error.message || "Unable to start Kakao login.", "error");
  }
}

if (signInForm) {
  signInForm.addEventListener("submit", signInWithEmail);
}

if (signUpForm) {
  signUpForm.addEventListener("submit", signUpWithEmail);
}

kakaoButtons.forEach((button) => {
  button.addEventListener("click", signInWithKakao);
});
