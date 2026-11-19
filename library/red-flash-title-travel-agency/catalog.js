(() => {
  const { reduce } = window.dhSite;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Header crosshair — follows the cursor with .3s power3.out and returns to center when it leaves the panel (same device as the first page)
  const rules = $(".ct-hero .dh-rules");
  gsap.matchMedia().add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
    if (!rules) return;
    const v = $(".dh-rules__v", rules), h = $(".dh-rules__h", rules), mk = $(".dh-rules__mark", rules), host = rules.parentElement;
    const qx = gsap.quickTo([v, mk], "x", { duration: .3, ease: "power3.out" }), qy = gsap.quickTo([h, mk], "y", { duration: .3, ease: "power3.out" });
    let px = -1, py = -1, inside = false;
    const move = (e) => { px = e.clientX; py = e.clientY; };
    const tick = () => {
      if (px < 0) return;
      const r = host.getBoundingClientRect();
      if (px < r.left || px > r.right || py < r.top || py > r.bottom) { if (inside) { inside = false; qx(0); qy(0); } return; }
      inside = true;
      qx(px - r.left - v.offsetLeft);
      qy(py - r.top - h.offsetTop);
    };
    addEventListener("pointermove", move, { passive: true });
    gsap.ticker.add(tick);
    return () => { removeEventListener("pointermove", move); gsap.ticker.remove(tick); };
  });

  // White plate — once below the header, the filter bar rises from below in .6s, and goes back down on reaching the FAQ section
  const filter = $(".ct-filter"), sheet = $(".ct-sheet");
  if (filter && sheet) ScrollTrigger.create({ trigger: sheet, start: "top 60%", end: "bottom 80%", onToggle: (s) => filter.classList.toggle("is-on", s.isActive) });
  $$(".ct-filter__toggle").forEach((t) => t.addEventListener("click", () => t.setAttribute("aria-pressed", t.getAttribute("aria-pressed") !== "true")));

  // Questions — only one open at a time. The answer goes from height 0 → its own height in .6s (standard curve), and + rotates 45° into ×.
  const qs = $$(".ct-q");
  qs.forEach((q) => {
    const a = $(".ct-q__a", q), btn = $(".ct-q__btn", q);
    btn.addEventListener("click", () => {
      const open = !q.hasAttribute("data-open");
      qs.forEach((o) => { if (o !== q && o.hasAttribute("data-open")) { o.removeAttribute("data-open"); $(".ct-q__btn", o).setAttribute("aria-expanded", "false"); gsap.to($(".ct-q__a", o), { height: 0, duration: reduce ? 0 : .6, ease: "power3.out" }); } });
      q.toggleAttribute("data-open", open);
      btn.setAttribute("aria-expanded", open);
      gsap.to(a, { height: open ? "auto" : 0, duration: reduce ? 0 : .6, ease: "power3.out", onComplete: () => ScrollTrigger.refresh() });
    });
  });

  // City list — the name passing through the screen center (or hovered) turns bold and the pinned photo switches to that city’s photo
  const cities = $$(".ct-city"), shots = $$(".ct-cities__media .dh-ph");
  if (cities.length && shots.length) {
    let cur = -1;
    const pick = (i) => {
      if (i === cur) return;
      cur = i;
      cities.forEach((c, k) => c.classList.toggle("is-on", k === i));
      shots.forEach((s, k) => (s.style.opacity = k === i % shots.length ? 1 : 0));
    };
    cities.forEach((c, i) => {
      ScrollTrigger.create({ trigger: c, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && pick(i) });
      c.addEventListener("mouseenter", () => pick(i));
    });
    pick(0);
  }
})();
