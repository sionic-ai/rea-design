// Motion shared across several pages — lenis (lerp .165·wheel 1.25), header hiding·white background, mega menu·phone drawer, dot-pattern light, strip title word fade, FAQ, year·wordmark fit.
// Values are read from the original bundle modules (nav · nav-reveal-animation · glow-mask-reveal · scroll-words-fadein · accordions).
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  gsap.defaults({ duration: 0.6, ease: "osmo" });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // ---------- Smooth scroll ----------
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- Header: white background after 80px, hides upward after scrolling down more than 6px below 120px, reappears on scroll up ----------
  const bar = $(".bp-nav");
  if (bar) {
    let prev = scrollY, pivot = prev, course = 0, queued = false;
    const read = () => {
      queued = false;
      const y = scrollY, dir = y > prev ? 1 : y < prev ? -1 : course;
      prev = y;
      bar.setAttribute("data-bar-tint", y >= 80 ? "on" : "off");
      if (dir !== course) { course = dir; pivot = y; }
      if (y <= 120) { pivot = y; bar.setAttribute("data-bar-lift", "down"); return; }
      if (Math.abs(y - pivot) < 6) return;
      bar.setAttribute("data-bar-lift", dir === 1 ? "up" : "down");
    };
    addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(read); } }, { passive: true });
    read();
  }

  // ---------- Mega menu — on desktop it opens when you hover an item and closes when you leave the plate. On phone it is a drawer + accordion ----------
  if (bar) {
    const items = $$(".bp-nav__item", bar);
    const plain = $$(".bp-nav__link:not([data-dropdown-toggle])", bar);
    const burger = $(".bp-burger", bar);
    const phone = matchMedia("(max-width: 767px)");
    const setOpen = (item, on) => {
      item.classList.toggle("is-open", on);
      $("[data-dropdown-toggle]", item)?.setAttribute("aria-expanded", String(on));
      if (!phone.matches) bar.toggleAttribute("data-open", items.some((i) => i.classList.contains("is-open")));
    };
    const closeAll = () => items.forEach((i) => setOpen(i, false));
    items.forEach((item) => {
      const t = $("[data-dropdown-toggle]", item), drop = $(".bp-drop", item);
      if (!t || !drop) return;
      t.addEventListener("mouseenter", () => {
        if (phone.matches) return;
        const any = items.some((i) => i.classList.contains("is-open") && i !== item);
        items.forEach((i) => i !== item && setOpen(i, false));
        if (any) setTimeout(() => setOpen(item, true), 20); else setOpen(item, true);
      });
      drop.addEventListener("mouseleave", () => !phone.matches && setOpen(item, false));
      t.addEventListener("click", (e) => {
        e.preventDefault();
        if (phone.matches) { const on = !item.classList.contains("is-open"); items.forEach((i) => setOpen(i, false)); setOpen(item, on); return; }
        items.forEach((i) => i !== item && setOpen(i, false));
        // In the original, clicking an item in an open panel makes the tiles slide back in from 4em outside while still visible (.09s after the click, .022s per tile) — run once more along the same path.
        const tiles = $$(".bp-tile", item);
        tiles.forEach((tl) => { tl.style.transition = "none"; tl.style.transform = "translate(4em, 0)"; });
        void item.offsetWidth;
        tiles.forEach((tl, i) => { tl.style.transition = `transform 0.45s var(--ease-nav) ${0.09 + i * 0.022}s`; tl.style.transform = ""; });
        setTimeout(() => tiles.forEach((tl) => (tl.style.transition = "")), 1000);
        setOpen(item, true);
      });
    });
    // Closes if you leave an item without going to the panel and exit the header row (the original opens the panel with CSS :hover)
    bar.addEventListener("mouseleave", () => !phone.matches && closeAll());
    plain.forEach((l) => l.addEventListener("mouseenter", () => !phone.matches && closeAll()));
    document.addEventListener("click", (e) => { if (!phone.matches && !e.target.closest(".bp-nav__item")) closeAll(); });
    addEventListener("keydown", (e) => e.key === "Escape" && closeAll());
    burger?.addEventListener("click", () => {
      const open = bar.getAttribute("data-menu-status") === "open";
      bar.setAttribute("data-menu-status", open ? "closed" : "open");
      burger.setAttribute("aria-expanded", String(!open));
      if (open) closeAll();
      if (lenis) open ? lenis.start() : lenis.stop();
    });
  }

  // ---------- Dotted light — when interaction enters, a circle grows to 280px in place (.1 per frame) and follows the cursor by .18 ----------
  if (fine) $$("[data-glow-bg]").forEach((el) => {
    const layer = $(".bp-glow__layer.is-hover", el);
    if (!layer) return;
    const max = parseFloat(el.getAttribute("data-glow-size")) || 280;
    let x = 0, y = 0, s = 0, tx = 0, ty = 0, ts = 0, raf = null;
    const render = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18; s += (ts - s) * 0.1;
      layer.style.setProperty("--glow-x", `${x.toFixed(1)}px`);
      layer.style.setProperty("--glow-y", `${y.toFixed(1)}px`);
      layer.style.setProperty("--glow-size", `${Math.max(0, s).toFixed(1)}px`);
      raf = Math.abs(tx - x) < 0.3 && Math.abs(ty - y) < 0.3 && Math.abs(ts - s) < 0.3 ? null : requestAnimationFrame(render);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(render); };
    const aim = (e) => { const r = layer.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; };
    el.addEventListener("mouseenter", (e) => { aim(e); x = tx; y = ty; ts = max; kick(); });
    el.addEventListener("mousemove", (e) => { aim(e); kick(); });
    el.addEventListener("mouseleave", () => { ts = 0; kick(); });
  });

  // ---------- Word fade (band title) — while the title head passes from 80% to 20% of screen, words darken in sequence from .4 to 1 ----------
  // The original bundle’s scroll-reveal module has no parent flag on each page and does not actually run, so it was not included
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    $$("[data-words-fade]").forEach((el) => {
      if (!window.SplitType) return;
      const split = new SplitType(el, { types: "words" });
      gsap.from(split.words, { opacity: 0.4, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "top 20%", scrub: true, refreshPriority: -1 } });
    });
  });

  // ---------- FAQ ----------
  $$("[data-accordion]").forEach((acc) => {
    const closeSib = acc.dataset.accordion === "close-siblings";
    acc.addEventListener("click", (e) => {
      const t = e.target.closest("[data-accordion-toggle]");
      if (!t) return;
      const item = t.closest("[data-accordion-status]");
      const on = item.getAttribute("data-accordion-status") === "active";
      item.setAttribute("data-accordion-status", on ? "not-active" : "active");
      t.setAttribute("aria-expanded", String(!on));
      if (closeSib && !on) $$("[data-accordion-status='active']", acc).forEach((s) => s !== item && s.setAttribute("data-accordion-status", "not-active"));
    });
  });

  // ---------- This year ----------
  $$("[data-current-year]").forEach((el) => (el.textContent = String(new Date().getFullYear())));

  // ---------- Fit footer wordmark width ----------
  const mark = $(".bp-footer__mark");
  const fit = () => {
    if (!mark) return;
    mark.style.fontSize = "100px";
    const cs = getComputedStyle(mark.parentElement);
    const avail = mark.parentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    mark.style.fontSize = `${(100 * avail) / mark.getBoundingClientRect().width}px`;
  };
  fit();
  document.fonts?.ready.then(() => { fit(); ScrollTrigger.refresh(); });
  addEventListener("resize", fit);
})();
