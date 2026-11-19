// Site-wide — hamburger panel (fadeIn · fadeOut 300). The flowing text line (original TextTicker 20px/s) is handled by the marquee part (rate: 20).
// Phone sort board (SORT button only while #magazine is visible, fadeIn 300), speech bubble pop-out (back.out(1.7) .5s), hero float-up (y 30 → 0 · .5s power2.out)
(() => {
  const $ = window.jQuery;
  const root = document.documentElement;
  let reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();
  gsap.registerPlugin(ScrollTrigger);

  // ── Hamburger Panel ──
  const btn = document.querySelector(".yk-burger");
  const hum = document.getElementById("yk-hum");
  let open = false, keep = 0;
  btn?.addEventListener("click", (e) => {
    e.preventDefault();
    open = !open;
    document.body.classList.toggle("is-hum", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (open) {
      keep = scrollY;
      $(hum).fadeIn(reduce ? 0 : 300);
      root.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      $(hum).fadeOut(reduce ? 0 : 300);
      root.style.overflow = "";
      document.body.style.overflow = "";
      scrollTo(0, keep);
    }
  });
  hum?.addEventListener("click", (e) => { if (e.target.closest("a") && open) btn.click(); });

  // ── Phone Layout Panel ──
  const sortBtn = document.querySelector(".yk-sortbtn");
  const sortBox = document.getElementById("yk-sort");
  const board = document.getElementById("magazine");
  if (sortBtn && sortBox && board) {
    new IntersectionObserver((es) => es.forEach((e) => sortBtn.classList.toggle("is-on", e.isIntersecting))).observe(board);
    $(sortBox).hide();
    sortBtn.addEventListener("click", () => $(sortBox).fadeIn(reduce ? 0 : 300));
    sortBox.addEventListener("click", (e) => { if (e.target === sortBox || e.target.closest("a")) $(sortBox).fadeOut(reduce ? 0 : 300); });
  }

  // ── Scroll Reveal ──
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    reduce = ctx.conditions.still;
    const rise = gsap.utils.toArray(".yk-rise");
    if (reduce) { gsap.set(rise, { opacity: 1, y: 0 }); gsap.set("[data-fuki]", { scale: 0.8, transformOrigin: "left bottom" }); return; }
    const trigger = document.querySelector(".yk-mv__slider") || rise[0];
    rise.forEach((el) => gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", scrollTrigger: { trigger, start: "top 80%", end: "bottom 20%", toggleActions: "play none none reverse" } }));
    gsap.utils.toArray("[data-fuki]").forEach((el) => gsap.fromTo(el,
      { opacity: 0, scale: 0, rotate: -20, x: -30, y: 30, transformOrigin: "left bottom" },
      { opacity: 1, scale: 0.8, rotate: 0, x: 0, y: 0, duration: 0.5, ease: "back.out(1.7)", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 15%", toggleActions: "play none none reverse" } }));
  });
})();
