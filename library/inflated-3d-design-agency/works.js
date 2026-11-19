// Results list and shared company parts: social strip fill, card lens, category pill selected state.
(() => {
  document.querySelectorAll(".gp-social-slot").forEach((s) => (s.outerHTML = GP.social));
  document.querySelectorAll(".wk__img").forEach((w) => GP.lens(w, w.querySelector(".wk__lens")));
  document.querySelectorAll(".wl-chips button").forEach((b) => b.addEventListener("click", () => b.classList.toggle("is-on")));
})();
