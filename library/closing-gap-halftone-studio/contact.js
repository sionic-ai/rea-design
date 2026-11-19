// Contact — only adds an email copy button to the default entrance (original copy-email: press to copy, release to revert)
(() => {
  window.MO && MO.page("contact", {
    init(root) {
      const offs = [];
      root.querySelectorAll("[data-copy-email]").forEach((b) => {
        const copy = (e) => {
          if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          navigator.clipboard?.writeText(b.dataset.copyEmail).catch(() => {});
          b.setAttribute("data-copy-button", "copied");
          b.setAttribute("aria-label", "Email address copied");
        };
        const reset = () => { b.removeAttribute("data-copy-button"); b.setAttribute("aria-label", "Copy email address"); };
        const leave = () => { reset(); b.blur(); };
        b.addEventListener("click", copy); b.addEventListener("keydown", copy); b.addEventListener("mouseleave", leave); b.addEventListener("blur", reset);
        offs.push(() => { b.removeEventListener("click", copy); b.removeEventListener("keydown", copy); b.removeEventListener("mouseleave", leave); b.removeEventListener("blur", reset); });
      });
      return () => offs.forEach((f) => f());
    },
  });
})();
