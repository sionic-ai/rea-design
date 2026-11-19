// The original recruit.js handles application form validation (required fields · katakana · email · phone format) and tabs — the copy only adds an empty-field warning in the same place (nothing is actually sent).
(() => {
  const form = document.querySelector(".entry__form");
  if (!form) return;
  form.querySelector(".entry__submit")?.addEventListener("click", () => {
    form.querySelectorAll(".field").forEach((f) => {
      const input = f.querySelector("input, textarea");
      let err = f.querySelector(".err");
      if (!input) return;
      if (!input.value.trim()) {
        if (!err) { err = document.createElement("b"); err.className = "err"; f.append(err); }
        err.textContent = "This field is required";
      } else err?.remove();
    });
    const first = form.querySelector(".err");
    if (first) scrollTo({ top: first.getBoundingClientRect().top + scrollY - 200, behavior: "smooth" });
  });
})();
