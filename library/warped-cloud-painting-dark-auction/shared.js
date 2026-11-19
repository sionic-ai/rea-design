// Shared by all pages — binding Lenis 1.3.25 (window scroll) with ScrollTrigger, bottom-center menu button (cloud menu · Lenis pause · Esc), sound button (look only),
// Interaction shared by several sections: auction countdown, filter fold · tabs · favorite button · top list (hovering a row swaps the image).
(() => {
  const docEl = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);

  const lenis = (window.__lenis = reduce ? null : new Lenis({ autoRaf: false }));
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Menu — like the original a single html.menu-open switches the X button, cloud menu (.45s) and header pin, and Lenis is paused while open
  const toggle = document.querySelector(".e-toggle"), menu = document.getElementById("e-menu");
  const setMenu = (on) => {
    docEl.classList.toggle("menu-open", on);
    toggle.setAttribute("aria-expanded", String(on));
    toggle.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    menu.setAttribute("aria-hidden", String(!on));
    lenis && (on ? lenis.stop() : lenis.start());
    if (on) menu.querySelector("a")?.focus({ preventScroll: true });
  };
  toggle?.addEventListener("click", () => setMenu(!docEl.classList.contains("menu-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && docEl.classList.contains("menu-open")) { setMenu(false); toggle.focus(); } });

  const sound = document.querySelector(".e-sound");
  sound?.addEventListener("click", () => { const on = !sound.classList.contains("is-on"); sound.classList.toggle("is-on", on); sound.setAttribute("aria-pressed", String(on)); });

  // Auction time left — counts down seconds from when opened
  const t0 = Date.now();
  const timers = $$("[data-ends]");
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const gone = Math.floor((Date.now() - t0) / 1000);
    timers.forEach((el) => { const s = Math.max(0, +el.dataset.ends - gone); el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`; });
  };
  if (timers.length) { tick(); setInterval(tick, 1000); }

  // Filter collapse
  $$(".e-filter__head").forEach((b) => b.addEventListener("click", () => { const f = b.closest(".e-filter"); const on = !f.classList.contains("is-open"); f.classList.toggle("is-open", on); b.setAttribute("aria-expanded", String(on)); }));
  // Tab
  $$(".e-tabs [data-tab]").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest(".e-pd__tabs");
    $$("[data-tab]", box).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    $$("[data-pane]", box).forEach((p) => p.classList.toggle("is-on", p.dataset.pane === b.dataset.tab));
  }));
  // Favorite
  $$(".e-pd__heart").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"))));

  // List above — hovering a row or focusing it darkens that row and changes the right-hand image and number. When visible, the shelf comes down (.is-revealed)
  $$("[data-top-list]").forEach((box) => {
    const rows = $$("[data-i]", box).filter((e) => e.matches("a")), imgs = $$("[data-i]", box).filter((e) => !e.matches("a"));
    const num = box.querySelector(".e-ts__num-big");
    const set = (i) => {
      rows.forEach((r) => r.classList.toggle("is-active", r.dataset.i === i));
      imgs.forEach((m) => m.classList.toggle("is-active", m.dataset.i === i));
      if (num) num.textContent = String(+i + 1).padStart(2, "0");
    };
    rows.forEach((r) => { r.addEventListener("pointerenter", () => set(r.dataset.i)); r.addEventListener("focus", () => set(r.dataset.i)); });
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { box.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(box);
  });
})();
