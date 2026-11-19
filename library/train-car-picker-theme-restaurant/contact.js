// Contact form: the confirm button turns on only when the required fields and consent are all filled. Nothing is actually sent.
(() => {
  const form = document.querySelector(".kp-form");
  const btn = form.querySelector(".kp-submit");
  const check = () => (btn.disabled = ![...form.querySelectorAll("[required]")].every((el) => (el.type === "checkbox" ? el.checked : el.value.trim())));
  form.addEventListener("input", check);
  form.addEventListener("change", check);
  form.addEventListener("submit", (e) => e.preventDefault());
})();
