/* Hero: when the aperture opens the strip unfolds, and each time the center cell changes the two bottom corner texts change.
   Click a cell and it flies forward (.75s after .15s), the background darkens and info rows stand up on both sides. Back or Esc returns to the strip */
(() => {
  const app = document.querySelector(".hc-app");
  if (!app || !window.THREE) return;
  const strip = hcStrip.create(app, { mode: "strip", count: 52, photos: 13 });
  /* When arriving from another panel the band is already standing, as in the original — the entrance plays only on first open */
  hc.loader((o) => strip.intro(o && o.arrived));

  const n = document.querySelector(".hc-count__n");
  const pad = (i) => String(i + 1).padStart(2, "0");
  app.addEventListener("hc:center", (e) => { if (n) n.textContent = pad(e.detail.photo); });

  const proj = document.querySelector(".hc-proj"), fon = document.querySelector(".hc-proj__fon");
  const sides = proj.querySelectorAll(".hc-proj__left, .hc-proj__right");
  const d = (s) => (hc.reduce ? 0 : s);
  app.addEventListener("hc:focus", (e) => {
    const open = e.detail.open;
    proj.classList.toggle("is-open", open);
    proj.setAttribute("aria-hidden", String(!open));
    gsap.to(fon, { opacity: open ? 1 : 0, duration: d(0.6), delay: open ? d(0.15) : 0, ease: "power2.out" });
    gsap.to(sides, { opacity: open ? 1 : 0, duration: d(0.5), delay: open ? d(0.6) : 0, ease: "power2.out" });
    if (open) proj.querySelector(".hc-proj__title").textContent = `SAMPLE TITLE ${pad(e.detail.photo)}`;
  });
  const back = () => strip.unfocus();
  proj.querySelector(".hc-proj__back").addEventListener("click", back);
  proj.querySelector(".hc-proj__next").addEventListener("click", back);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && proj.classList.contains("is-open")) back(); });
})();
