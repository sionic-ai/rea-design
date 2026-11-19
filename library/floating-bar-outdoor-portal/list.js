// New product list: release-month expand button and category text tabs (only the switched-on categories, all if everything is off).
// Expansion is the original jQuery slideToggle as-is — height and top/bottom padding from 0 over 400ms swing (= sine.inOut).
(() => {
  const m = document.querySelector(".l-month");
  const btn = m.querySelector(".l-month__btn");
  const list = m.querySelector(".l-month__list");
  const SLIDE = { duration: 0.4, ease: "sine.inOut", overwrite: true };
  const set = (open) => {
    if (open === m.classList.contains("is-open")) return;
    m.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open);
    if (open) gsap.fromTo(list, { display: "block", height: 0, paddingBottom: 0, overflow: "hidden" }, { ...SLIDE, height: "auto", paddingBottom: "1rem", clearProps: "height,paddingBottom,overflow" });
    else gsap.to(list, { ...SLIDE, height: 0, paddingBottom: 0, overflow: "hidden", onComplete: () => gsap.set(list, { clearProps: "all" }) });
  };
  btn.addEventListener("click", () => set(!m.classList.contains("is-open")));
  list.addEventListener("click", () => set(false));
  document.addEventListener("click", (e) => { if (!m.contains(e.target)) set(false); });

  const tabs = [...document.querySelectorAll(".l-tabs button")];
  const genres = [...document.querySelectorAll(".l-genre")];
  // Like the original, toggled per tab — if any category is on only those show, if all are off show everything
  tabs.forEach((t) => t.addEventListener("click", () => {
    t.classList.toggle("is-on");
    const on = tabs.filter((x) => x.classList.contains("is-on")).map((x) => x.dataset.f);
    genres.forEach((g) => (g.hidden = on.length > 0 && !on.includes(g.dataset.cat)));
    document.querySelectorAll(".l-month-block").forEach((b) => (b.hidden = !b.querySelector(".l-genre:not([hidden])")));
  }));
})();
