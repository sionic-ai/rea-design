// News article — copy link button. In the original, once copied a notification box appears in .4s, stays for 2s, then disappears in .4s
(() => {
  const toast = document.querySelector("[data-toast]");
  const say = (text) => {
    if (!toast) return;
    toast.textContent = text;
    gsap.killTweensOf(toast);
    gsap.timeline().to(toast, { opacity: 1, duration: 0.4, ease: "none" }).to(toast, { opacity: 0, duration: 0.4, ease: "none", delay: 2 });
  };
  document.querySelectorAll("[data-copy-url]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.copyUrl || location.href;
      (navigator.clipboard?.writeText(url) || Promise.reject()).then(() => say("Address copied."), () => say("Could not copy."));
    });
  });
})();
