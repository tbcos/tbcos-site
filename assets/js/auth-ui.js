import { requireConfiguredSupabase, getAbsoluteUrl } from "./supabase-client.js";
import { translate, initLanguageControls } from "./auth-i18n.js";

const statusBox = document.getElementById("authStatus");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const kakaoButtons = document.querySelectorAll("[data-auth-provider='kakao']");
const tabButtons = document.querySelectorAll("[data-auth-tab]");
const panels = document.querySelectorAll("[data-auth-panel]");
const tabSwitch = document.querySelector(".tab-switch");
const forgotPasswordButton = document.getElementById("forgotPasswordButton");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const forgotPasswordEmail = document.getElementById("forgotPasswordEmail");
const forgotPasswordCloseButton = document.getElementById("forgotPasswordCloseButton");
const forgotPasswordCancelButton = document.getElementById("forgotPasswordCancelButton");

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

function openForgotPasswordModal() {
  if (!forgotPasswordModal) return;
  forgotPasswordModal.classList.add("open");
  forgotPasswordModal.setAttribute("aria-hidden", "false");
  if (forgotPasswordEmail) {
    forgotPasswordEmail.value = document.getElementById("signInEmail")?.value.trim() || "";
    window.setTimeout(() => forgotPasswordEmail.focus(), 40);
  }
}

function closeForgotPasswordModal() {
  if (!forgotPasswordModal) return;
  forgotPasswordModal.classList.remove("open");
  forgotPasswordModal.setAttribute("aria-hidden", "true");
}

async function sendPasswordReset(event) {
  event?.preventDefault();

  try {
    const supabase = requireConfiguredSupabase();
    const email = forgotPasswordEmail?.value.trim();

    if (!email) {
      showStatus(translate("auth_status_reset_needed"), "error");
      return;
    }

    showStatus(translate("auth_status_reset_sending"));

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAbsoluteUrl("reset-password.html")
    });

    if (error) throw error;

    showStatus(translate("auth_status_reset_sent"), "success");
    closeForgotPasswordModal();
  } catch (error) {
    showStatus(error.message || translate("reset_status_error"), "error");
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

if (forgotPasswordButton) {
  forgotPasswordButton.addEventListener("click", openForgotPasswordModal);
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", sendPasswordReset);
}

if (forgotPasswordCloseButton) {
  forgotPasswordCloseButton.addEventListener("click", closeForgotPasswordModal);
}

if (forgotPasswordCancelButton) {
  forgotPasswordCancelButton.addEventListener("click", closeForgotPasswordModal);
}

if (forgotPasswordModal) {
  forgotPasswordModal.addEventListener("click", (event) => {
    if (event.target === forgotPasswordModal) {
      closeForgotPasswordModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && forgotPasswordModal?.classList.contains("open")) {
    closeForgotPasswordModal();
  }
});

if (window.location.hash === "#forgot-password") {
  openForgotPasswordModal();
}
