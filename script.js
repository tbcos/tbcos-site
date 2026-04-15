const revealTargets = document.querySelectorAll(".section, .hero-copy, .hero-panel");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealTargets.forEach((target) => {
  target.classList.add("reveal");
  observer.observe(target);
});

const inquiryButton = document.getElementById("inquiryButton");
const formNote = document.getElementById("formNote");

if (inquiryButton && formNote) {
  inquiryButton.addEventListener("click", () => {
    formNote.textContent =
      "데모 버튼입니다. 실제 문의 접수를 원하시면 이메일 전송, Google Form, 또는 서버 API 연동을 추가하면 됩니다.";
  });
}
