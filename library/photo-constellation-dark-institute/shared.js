// Site-wide: Lenis (lerp .08) · header bar expanding menu (drops down on hover) · logo hidden during the hero · header band · section header line drawing ·
// On leave: body blur (.5s) · login window · phone menu · back to top. Line rise, letter roll, cursor circle and number counting are handled by _fx motion parts
(() => {
  gsap.registerPlugin(ScrollTrigger, ...(window.SplitText ? [SplitText] : []), ...(window.CustomEase ? [CustomEase] : []));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.08, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.glLenis = lenis;
  }
  const scrollTo = (y) => (lenis ? lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }));

  // Header row expansion: hovering a menu item brings its panel down in 1s, and it goes back up when leaving the header row
  const nav = document.querySelector(".gl-nav");
  if (nav) {
    const items = [...nav.querySelectorAll(".gl-menu [data-drop]")];
    const drops = new Map(items.map((b) => [b, nav.querySelector(`#${b.dataset.drop}`)]));
    const open = (btn) => drops.forEach((d, b) => { const on = b === btn; d?.classList.toggle("is-open", on); b.closest("li").classList.toggle("open", on); root.classList.toggle("nav-dropdown-open", !!btn); });
    items.forEach((b) => { b.addEventListener("mouseenter", () => open(b)); b.addEventListener("click", (e) => { e.preventDefault(); open(drops.get(b)?.classList.contains("is-open") ? null : b); }); });
    nav.querySelectorAll(".gl-menu > li:not(:has([data-drop]))").forEach((li) => li.addEventListener("mouseenter", () => open(null)));
    nav.addEventListener("mouseleave", () => open(null));
    addEventListener("keydown", (e) => e.key === "Escape" && open(null));

    // Phone menu
    const toggle = nav.querySelector(".gl-toggle"), panel = document.querySelector(".gl-mobile");
    if (toggle && panel) {
      const set = (on) => { toggle.setAttribute("aria-expanded", String(on)); panel.classList.toggle("is-open", on); root.classList.toggle("nav-dropdown-open", on); on ? lenis?.stop() : lenis?.start(); };
      toggle.addEventListener("click", () => set(!panel.classList.contains("is-open")));
      panel.querySelector(".gl-mobile-close")?.addEventListener("click", () => set(false));
    }
  }

  // Section header thin line: when it enters the screen it is drawn from the left in 2s
  const rules = document.querySelectorAll(".gl-rule");
  if (reduce) rules.forEach((r) => r.classList.add("show"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } }), { rootMargin: "-20px" });
    rules.forEach((r) => io.observe(r));
  }

  // On leaving: clicking a same-site link blurs the body over .5s, then navigates
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]");
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || reduce) return;
    e.preventDefault();
    root.classList.add("is-leaving");
    setTimeout(() => (location.href = url.href), 500);
  });
  addEventListener("pageshow", (e) => e.persisted && root.classList.remove("is-leaving"));

  // Login window
  const modal = document.querySelector(".gl-modal");
  if (modal) {
    const set = (on) => { modal.classList.toggle("is-open", on); on ? lenis?.stop() : lenis?.start(); };
    document.querySelectorAll("[data-open-login]").forEach((b) => b.addEventListener("click", () => set(true)));
    // Like the original, pops up on its own after scrolling past twice the screen height, and once closed does not reappear for three days
    const KEY = "gl-popup-closed";
    let can = !(Date.now() - (+localStorage.getItem(KEY) || 0) < 3 * 864e5);
    addEventListener("scroll", () => { if (can && scrollY > innerHeight * 2 && !modal.classList.contains("is-open")) { can = false; set(true); } }, { passive: true });
    modal.querySelector(".gl-modal-close")?.addEventListener("click", () => { localStorage.setItem(KEY, String(Date.now())); set(false); });
    modal.addEventListener("click", (e) => e.target === modal && set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  document.querySelectorAll(".gl-top-btn").forEach((b) => b.addEventListener("click", () => scrollTo(0)));
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
