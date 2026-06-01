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
const forgotPasswordCancelButton = document.getElementById("forgotPasswordCancelButton");
const signInPasswordInput = document.getElementById("signInPassword");
const signUpPasswordInput = document.getElementById("signUpPassword");
const signUpPasswordStrength = document.getElementById("signUpPasswordStrength");
const signUpPasswordGenerate = document.getElementById("signUpPasswordGenerate");
const passwordToggleButtons = document.querySelectorAll("[data-password-toggle]");
const AUTH_CLEAR_KEY = "tbcos-clear-auth";

initLanguageControls("auth_title");

function showStatus(message, tone = "neutral") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.tone = tone;
}

function getLocalizedAuthError(error) {
  const message = (error?.message || "").toLowerCase();
  const code = (error?.code || "").toLowerCase();

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid_credentials") ||
    code.includes("invalid_credentials")
  ) {
    return translate("auth_error_invalid_credentials");
  }

  if (message.includes("email not confirmed")) {
    return translate("auth_error_email_not_confirmed");
  }

  if (
    message.includes("user already registered") ||
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return translate("auth_error_user_exists");
  }

  if (message.includes("signups not allowed") || message.includes("signup is disabled")) {
    return translate("auth_error_signup_disabled");
  }

  if (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("over_email_send_rate_limit")
  ) {
    return translate("auth_error_rate_limit");
  }

  if (message.includes("invalid email")) {
    return translate("auth_error_invalid_email");
  }

  if (message.includes("password should be at least") || message.includes("password is too weak")) {
    return translate("auth_error_weak_password");
  }

  return translate("auth_error_generic");
}

function updatePasswordToggleLabel(button, isVisible) {
  const icon = button.querySelector(".material-symbols-outlined");
  const label = translate(isVisible ? "auth_password_hide" : "auth_password_show");
  if (icon) {
    icon.textContent = isVisible ? "visibility_off" : "visibility";
  }
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
}

function evaluatePassword(password) {
  if (!password) return "empty";

  let score = 0;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 5) return "strong";
  if (score >= 3) return "medium";
  return "weak";
}

function updatePasswordStrength(input, output) {
  if (!output) return;
  const level = evaluatePassword(input?.value || "");
  output.textContent = translate(`auth_password_strength_${level}`);
  output.className = `text-[13px] font-medium ${
    level === "strong" ? "text-[#4f6b4d]" : level === "weak" ? "text-[#b34b4b]" : "text-muted"
  }`;
}

function generateStrongPassword(length = 14) {
  const lowers = "abcdefghjkmnpqrstuvwxyz";
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const symbols = "!@#$%^&*_-+=?";
  const all = lowers + uppers + numbers + symbols;
  const picks = [
    lowers[Math.floor(Math.random() * lowers.length)],
    uppers[Math.floor(Math.random() * uppers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  while (picks.length < length) {
    picks.push(all[Math.floor(Math.random() * all.length)]);
  }

  for (let i = picks.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [picks[i], picks[j]] = [picks[j], picks[i]];
  }

  return picks.join("");
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

function clearSensitiveAuthState() {
  signInForm?.reset();
  signUpForm?.reset();
  forgotPasswordForm?.reset();
  if (signInPasswordInput) signInPasswordInput.type = "password";
  if (signUpPasswordInput) signUpPasswordInput.type = "password";
  passwordToggleButtons.forEach((button) => {
    const target = document.getElementById(button.dataset.passwordToggle);
    if (!target) return;
    target.type = "password";
    updatePasswordToggleLabel(button, false);
  });
  closeForgotPasswordModal();
  updatePasswordStrength(signUpPasswordInput, signUpPasswordStrength);
  showStatus("");
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.authTab);
  });
});

if (window.location.hash === "#signup") {
  setActiveTab("signup");
}

if (window.sessionStorage.getItem(AUTH_CLEAR_KEY) === "1") {
  window.sessionStorage.removeItem(AUTH_CLEAR_KEY);
  window.setTimeout(() => clearSensitiveAuthState(), 0);
}

window.addEventListener("pageshow", () => {
  if (window.sessionStorage.getItem(AUTH_CLEAR_KEY) === "1") {
    window.sessionStorage.removeItem(AUTH_CLEAR_KEY);
    clearSensitiveAuthState();
  }
});

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
    showStatus(getLocalizedAuthError(error), "error");
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
    showStatus(getLocalizedAuthError(error), "error");
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
    showStatus(getLocalizedAuthError(error), "error");
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
    showStatus(getLocalizedAuthError(error), "error");
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

if (signUpPasswordInput) {
  signUpPasswordInput.addEventListener("input", () => {
    updatePasswordStrength(signUpPasswordInput, signUpPasswordStrength);
  });
  updatePasswordStrength(signUpPasswordInput, signUpPasswordStrength);
}

if (signUpPasswordGenerate) {
  signUpPasswordGenerate.addEventListener("click", () => {
    if (!signUpPasswordInput) return;
    signUpPasswordInput.value = generateStrongPassword();
    updatePasswordStrength(signUpPasswordInput, signUpPasswordStrength);
    signUpPasswordInput.focus();
    signUpPasswordInput.select();
  });
}

passwordToggleButtons.forEach((button) => {
  const targetId = button.dataset.passwordToggle;
  const target = document.getElementById(targetId);
  if (!target) return;

  updatePasswordToggleLabel(button, target.type === "text");

  button.addEventListener("click", () => {
    const isVisible = target.type === "text";
    target.type = isVisible ? "password" : "text";
    updatePasswordToggleLabel(button, !isVisible);
    target.focus();
  });
});

document.addEventListener("tbcos:languagechange", () => {
  passwordToggleButtons.forEach((button) => {
    const target = document.getElementById(button.dataset.passwordToggle);
    if (!target) return;
    updatePasswordToggleLabel(button, target.type === "text");
  });
});
