import { supabase, isSupabaseConfigured } from "./supabase-client.js";
import { translate, initLanguageControls } from "./auth-i18n.js";

const statusBox = document.getElementById("resetStatus");
const form = document.getElementById("resetPasswordForm");
const passwordInput = document.getElementById("resetPassword");
const confirmInput = document.getElementById("resetPasswordConfirm");
const passwordStrength = document.getElementById("resetPasswordStrength");
const passwordGenerateButton = document.getElementById("resetPasswordGenerate");
const passwordToggleButtons = document.querySelectorAll("[data-password-toggle]");

initLanguageControls("reset_title");

function setStatus(message, tone = "neutral") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.tone = tone;
  statusBox.className = `min-h-6 pt-4 text-sm ${tone === "error" ? "text-[#b34b4b]" : tone === "success" ? "text-[#4f6b4d]" : "text-muted"}`;
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

function updatePasswordStrength() {
  if (!passwordStrength) return;
  const level = evaluatePassword(passwordInput?.value || "");
  passwordStrength.textContent = translate(`auth_password_strength_${level}`);
  passwordStrength.className = `text-[13px] font-medium ${
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

async function validateRecoverySession() {
  if (!isSupabaseConfigured || !supabase) {
    setStatus(translate("callback_not_configured"), "error");
    if (form) form.hidden = true;
    return false;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    setStatus(translate("reset_status_invalid"), "error");
    if (form) form.hidden = true;
    return false;
  }

  setStatus("");
  return true;
}

async function handleResetPassword(event) {
  event.preventDefault();

  const password = passwordInput?.value || "";
  const confirmPassword = confirmInput?.value || "";

  if (password.length < 6) {
    setStatus(translate("reset_status_short"), "error");
    return;
  }

  if (password !== confirmPassword) {
    setStatus(translate("reset_status_mismatch"), "error");
    return;
  }

  try {
    setStatus(translate("reset_status_saving"));

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;

    setStatus(translate("reset_status_saved"), "success");

    window.setTimeout(() => {
      window.location.href = "auth.html";
    }, 1600);
  } catch (error) {
    setStatus(error.message || translate("reset_status_error"), "error");
  }
}

validateRecoverySession();

if (form) {
  form.addEventListener("submit", handleResetPassword);
}

if (passwordInput) {
  passwordInput.addEventListener("input", updatePasswordStrength);
  updatePasswordStrength();
}

if (passwordGenerateButton) {
  passwordGenerateButton.addEventListener("click", () => {
    if (!passwordInput || !confirmInput) return;
    const generated = generateStrongPassword();
    passwordInput.value = generated;
    confirmInput.value = generated;
    updatePasswordStrength();
    confirmInput.focus();
    confirmInput.select();
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
