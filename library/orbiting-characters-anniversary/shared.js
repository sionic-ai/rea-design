// Spans several pages: illustration drawing, text-slide copies, appear, landing Menu drawer, main-site phone menu.
(() => {
  /* ---------- Illustration: in place of the original five school characters, redraw people shapes with the same colors and a similar pose feel ---------- */
  const PALETTES = [
    ["var(--site-green)", "var(--site-green-2)", "var(--site-yellow)", "var(--site-yellow-2)"], // Car maintenance
    ["var(--site-pink)", "var(--site-teal-4)", "var(--site-yellow-2)", "var(--site-pink-3)"], // Beauty
    ["var(--site-orange)", "var(--kf-accent)", "var(--site-yellow)", "var(--site-orange-2)"], // Business · Hotel
    ["var(--site-blue)", "var(--site-purple)", "var(--site-lime-3)", "var(--site-teal-4)"], // Digital
    ["var(--kf-accent-soft)", "var(--site-teal-4)", "var(--site-pink)", "var(--site-sky-1)"], // Nursing
  ];
  const TOOLS = [
    (c) => `<path d="M128 150l38-30 10 10-36 32z" style="fill:${c}"/><circle cx="176" cy="122" r="12" fill="none" style="stroke:${c}" stroke-width="7"/>`,
    (c) => `<path d="M140 128l34-34M140 98l34 34" style="stroke:${c}" stroke-width="6" stroke-linecap="round"/><circle cx="138" cy="96" r="7" fill="none" style="stroke:${c}" stroke-width="4"/>`,
    (c) => `<rect x="132" y="138" width="44" height="32" rx="4" style="fill:${c}"/><path d="M144 138v-8h20v8" fill="none" style="stroke:${c}" stroke-width="4"/>`,
    (c) => `<rect x="134" y="104" width="46" height="34" rx="4" style="fill:${c}"/><rect x="140" y="110" width="34" height="22" style="fill:var(--site-white)" opacity=".6"/>`,
    (c) => `<path d="M126 120c0 26 40 26 40 0" fill="none" style="stroke:${c}" stroke-width="5"/><circle cx="146" cy="152" r="9" style="fill:${c}"/>`,
  ];
  function figure(i, seed = 0) {
    const [a, b, c, d] = PALETTES[i % 5];
    const r = (n) => Math.sin(seed * 12.9898 + n * 78.233) * 0.5 + 0.5;
    const arm = 20 + r(1) * 40;
    const leg = 10 + r(2) * 30;
    return `<svg viewBox="0 0 200 240" aria-hidden="true">
      <circle cx="${70 + r(3) * 60}" cy="${60 + r(4) * 40}" r="${26 + r(5) * 14}" style="fill:${d}" opacity=".7"/>
      <path d="M40 200c20-14 34-10 48-4" style="stroke:${c}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M86 150l${-leg} 62" style="stroke:${b}" stroke-width="16" stroke-linecap="round"/>
      <path d="M112 150l${leg * 0.7} 64" style="stroke:${b}" stroke-width="16" stroke-linecap="round"/>
      <path d="M70 96c4-22 52-22 60 0l10 62H62z" style="fill:${a}"/>
      <path d="M74 104l${-arm} ${30 - arm * 0.3}" style="stroke:${a}" stroke-width="14" stroke-linecap="round"/>
      <path d="M126 104l${arm * 0.8} ${36 - arm * 0.6}" style="stroke:${a}" stroke-width="14" stroke-linecap="round"/>
      <circle cx="100" cy="66" r="22" style="fill:var(--site-orange-1)"/>
      <path d="M76 64c0-26 48-30 50-4-10-8-28-12-50 4z" style="fill:${b}"/>
      <path d="M62 158h78l-6 10H68z" style="fill:${b}" opacity=".5"/>
      ${TOOLS[i % 5](c)}
    </svg>`;
  }
  const paint = (root = document) =>
    root.querySelectorAll("[data-figure]").forEach((el) => {
      if (el.dataset.painted) return;
      el.innerHTML = figure(Number(el.dataset.figure), Number(el.dataset.seed || el.dataset.figure));
      el.dataset.painted = "1";
    });
  paint();
  // When baking the art to an image file (three texture), skin variables don’t resolve, so they are swapped for computed colors
  const probe = document.createElement("i");
  const resolve = (svg) => svg.replace(/var\((--[\w-]+)\)/g, (m, name) => {
    probe.style.color = `var(${name})`;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  window.MT = { figure, paint, resolve };

  /* ---------- Text slide: the text inside [data-hover-text] as two copies, top and bottom ---------- */
  document.querySelectorAll("[data-hover-text]").forEach((el) => {
    const text = el.innerHTML;
    el.innerHTML = `<span>${text}</span><span aria-hidden="true"><span>${text}</span></span>`;
  });

  /* ---------- Appear ---------- */
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("show");
      io.unobserve(e.target);
    }),
    { rootMargin: "0px 0px -10% 0px" }
  );
  document.querySelectorAll(".js-up").forEach((el) => io.observe(el));

  /* ---------- Landing Menu drawer ---------- */
  const drawer = document.querySelector(".lp-drawer");
  const dim = document.querySelector(".lp-dim");
  const menuBtn = document.querySelector(".lp-menu-btn");
  const setMenu = (open) => {
    drawer?.classList.toggle("is-open", open);
    dim?.classList.toggle("is-open", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
  };
  menuBtn?.addEventListener("click", () => setMenu(true));
  drawer?.querySelector(".lp-drawer__close")?.addEventListener("click", () => setMenu(false));
  dim?.addEventListener("click", () => setMenu(false));
  drawer?.querySelectorAll("a[href^='#']").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Main site phone menu ---------- */
  const cp = document.querySelector(".cp-header");
  cp?.querySelector(".cp-burger")?.addEventListener("click", () => cp.classList.toggle("is-open"));
})();
