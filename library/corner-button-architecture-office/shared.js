// Shared across the whole site — wide screens use ScrollSmoother (smooth 1.05, data-speed/lag effects), Barba page transition (transparent .3s → after .8s, .4s),
// Green dot cursor that follows, orange panel opened by a corner button, first-page loader, per-section pinning, color change and big text rise, three city clocks.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  const WIDE = "(min-width: 769px)";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => matchMedia(WIDE).matches;
  const served = /^https?:$/.test(location.protocol);
  document.documentElement.classList.add("is-js");
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (history.scrollRestoration) history.scrollRestoration = "manual";

  const toTop = () => {
    scrollTo(0, 0);
    const s = ScrollSmoother.get();
    if (s) s.scrollTo(0, false);
  };
  const smoother = () => {
    const old = ScrollSmoother.get();
    if (old) { old.scrollTo(0, false); old.kill(); }
    if (!wide() || reduce) return null;
    return ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.05, effects: true });
  };
  const pause = (on) => {
    const s = ScrollSmoother.get();
    if (s) s.paused(on);
    else document.body.style.overflow = on ? "hidden" : "";
  };

  // ── Cursor dot: position .15s · size .6s power3 — 15 → 30px over links and buttons
  const dot = document.querySelector(".th-dot");
  if (dot && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    gsap.set(dot, { xPercent: -50, yPercent: -50, width: 15, height: 15 });
    const qx = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3" }), qy = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3" });
    const qw = gsap.quickTo(dot, "width", { duration: 0.6, ease: "power3" }), qh = gsap.quickTo(dot, "height", { duration: 0.6, ease: "power3" });
    addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); });
    const hot = "a, button, .th-hot";
    document.addEventListener("mouseover", (e) => { if (e.target.closest(hot)) { qw(30); qh(30); dot.classList.remove("is-prompt"); } });
    document.addEventListener("mouseout", (e) => { const a = e.target.closest(hot); if (a && !a.contains(e.relatedTarget)) { qw(15); qh(15); if (dot.dataset.prompt) dot.classList.add("is-prompt"); } });
  }

  // ── Orange panel (corner-slide-panel part): stops scrolling while open, and pressing the scrim outside the panel closes it
  const panels = [...document.querySelectorAll(".th-panel")];
  const veil = document.querySelector(".th-veil");
  const closeAll = () => panels.forEach((p) => p.dispatchEvent(new CustomEvent("fx:shut")));
  document.addEventListener("fx:open", (e) => { if (!e.target.matches?.(".th-panel")) return; pause(true); veil?.classList.add("is-on"); });
  document.addEventListener("fx:close", (e) => { if (!e.target.matches?.(".th-panel")) return; if (!panels.some((p) => p.classList.contains("is-open"))) { pause(false); veil?.classList.remove("is-on"); } });
  veil?.addEventListener("click", closeAll);

  // ── Three city times (every minute)
  const zones = { dk: ["Europe/Copenhagen", "CET"], uk: ["Europe/City", "GMT"], usa: ["America/Los_Angeles", "PDT"] };
  const clock = () => {
    const now = new Date();
    for (const [k, [tz]] of Object.entries(zones)) {
      const t = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
      const d = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short", year: "numeric" }).format(now);
      const z = new Intl.DateTimeFormat(k === "usa" ? "en-US" : "en-GB", { timeZone: tz, timeZoneName: "short" }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value || "";
      document.querySelectorAll(`[data-clock="${k}"]`).forEach((el) => (el.textContent = `${z} ${t}/${d}`));
    }
  };
  clock();
  setInterval(clock, 60000);

  // ── Motion applied per section: pinned on wide screens (no pinSpacing, the next row covers it and passes over), color change, big text rising
  const offTop = (el, wrap) => el.getBoundingClientRect().top - (wrap ? wrap.getBoundingClientRect().top : 0);
  const setup = (root) => {
    const wrap = document.querySelector("#smooth-wrapper");
    const sm = ScrollSmoother.get() ? wrap : undefined;
    const st = () => (sm ? ScrollSmoother.get().scrollTop() : scrollY);
    const mm = gsap.matchMedia();
    mm.add({ wide: WIDE, narrow: "(max-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (c) => {
      if (c.conditions.reduce) { gsap.set(root.querySelectorAll(".th-big__text"), { opacity: 1, y: 0 }); return; }
      const pin = (o) => ScrollTrigger.create({ scroller: sm, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true, ...o });
      if (c.conditions.wide) {
        // First section: the large text stays in place until the second photo rises, the small text stays until the end of the section
        root.querySelectorAll(".th-l1").forEach((sec) => {
          const head = sec.querySelector(".th-l1__head"), sub = sec.querySelector(".th-l1__sub"), two = sec.querySelector(".th-l1__two");
          if (head && two) pin({ trigger: head, pin: head, start: () => `top top+=${offTop(head, sm)}`, end: () => st() + (offTop(two, sm) - (offTop(head, sm) + head.offsetHeight)) });
          if (sub) pin({ trigger: sub, pin: sub, start: () => `top top+=${offTop(sub, sm)}`, end: () => st() + (sec.getBoundingClientRect().bottom - (sm ? sm.getBoundingClientRect().top : 0) - (offTop(sub, sm) + sub.offsetHeight)) });
        });
        // Second section: the square photo sits at the very top, the text sticks 130px above it, and both get pushed together when the wide photo rises
        root.querySelectorAll(".th-l2").forEach((sec) => {
          const one = sec.querySelector(".th-l2__one"), text = sec.querySelector(".th-l2__text"), two = sec.querySelector(".th-l2__two");
          if (!one || !text || !two) return;
          const end = (self) => { let e = st() + (offTop(two, sm) - one.offsetHeight); if (typeof self?.start === "number" && e <= self.start) e = self.start + 800; return e; };
          pin({ trigger: one, pin: one, start: "top top", end });
          pin({ trigger: text, pin: text, start: "top top+=130", end });
        });
        // Third section: a square photo sticks for half the height of the first row
        root.querySelectorAll(".th-l3").forEach((sec) => {
          const row = sec.querySelector(".th-l3__row");
          sec.querySelectorAll(".th-l3__pin").forEach((p) => pin({ trigger: row, pin: p, start: "top top", end: () => `+=${Math.max(0, row.offsetHeight / 2)}` }));
        });
        // Sticky cell (About and Access pages): sticks 130px from the top until the section ends
        root.querySelectorAll("[data-stick]").forEach((el) => {
          const sec = el.closest(".th-section");
          const last = [...sec.querySelectorAll(".th-row")].pop();
          pin({ trigger: el, pin: el, start: el.dataset.stick === "top" ? "top top" : "top 130px", endTrigger: last, end: () => (el.dataset.stick === "top" ? `bottom ${el.offsetHeight}px` : `bottom ${130 + el.offsetHeight}px`) });
        });
        // Stair section (access page): name row → center text row → right cell row rise in turn and stick 130px from the top, and when the right cell row reaches 130px they all release together
        root.querySelectorAll(".th-stair").forEach((sec) => {
          const [l, m, r] = ["left", "centre", "right"].map((k) => sec.querySelector(`.th-stair__${k}`));
          if (!l || !m || !r) return;
          const at = (row) => { const col = row.querySelector(".th-col:last-child"); const d = Math.round(130 - (col ? col.getBoundingClientRect().top - row.getBoundingClientRect().top : 0)); return d < 0 ? `top top-=${-d}` : `top top+=${d}`; };
          [l, m].forEach((row) => pin({ trigger: row, pin: row, start: () => at(row), endTrigger: r, end: () => at(r) }));
        });
        // List page: the right-hand intro text stays pinned while the photo staircase passes beside it — it releases when the fourth-row photo reaches the top
        root.querySelectorAll(".th-cat").forEach((sec) => {
          const text = sec.querySelector(".th-cat__text"), until = sec.querySelector(".th-cat__tile--3");
          if (text && until) pin({ trigger: text, pin: text, start: () => `top top+=${Math.max(0, Math.round(offTop(text, sm)))}`, endTrigger: until, end: "top top" });
        });
      } else {
        // Phone: only the big text on the first section sticks 115px from the top
        root.querySelectorAll(".th-l1").forEach((sec) => {
          const head = sec.querySelector(".th-l1__head"), two = sec.querySelector(".th-l1__two");
          if (head && two) pin({ trigger: head, pin: head, start: "top top+=115", endTrigger: two, end: "top 60%" });
        });
      }
      // Color-switch section (last section of the list): body color changes when the top edge passes 40% of the screen and returns when the bottom edge leaves the top of the screen (original bg-colour-switcher)
      root.querySelectorAll("[data-bg-switch]").forEach((el) => {
        const cls = `is-${el.dataset.bgSwitch}`, on = () => document.body.classList.add(cls), off = () => document.body.classList.remove(cls);
        ScrollTrigger.create({ scroller: sm, trigger: el, start: "top 40%", end: "bottom top", onEnter: on, onEnterBack: on, onLeave: off, onLeaveBack: off });
      });
      // Big text line: past 50% (60% on phone) the body color changes and the text rises from 5em below with .8s power2.out (once)
      const at = c.conditions.wide ? "top 50%" : "top 60%";
      root.querySelectorAll("[data-bg]").forEach((row) => {
        const cls = `is-${row.dataset.bg}`, sec = row.closest(".th-section"), rows = sec.querySelectorAll("[data-bg]"), last = rows[rows.length - 1];
        ScrollTrigger.create({ scroller: sm, trigger: row, start: at, endTrigger: last, end: "1% top",
          onEnter: () => document.body.classList.add(cls), onEnterBack: () => document.body.classList.add(cls), onLeave: () => document.body.classList.remove(cls) });
        if (row === rows[0]) ScrollTrigger.create({ scroller: sm, trigger: row, start: at, onLeaveBack: () => document.body.classList.remove(cls) });
        const t = row.querySelector(".th-big__text");
        if (t) gsap.to(t, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", overwrite: "auto", scrollTrigger: { scroller: sm, trigger: row, start: at, once: true } });
      });
    });
    // Contact guide dot (end of list etc., data-prompt): the dot turns into the text Scroll
    if (dot) { dot.dataset.prompt = root.querySelector("[data-scroll-prompt]") ? "1" : ""; dot.classList.toggle("is-prompt", !!dot.dataset.prompt); }
    setTimeout(() => { dispatchEvent(new Event("resize")); ScrollTrigger.refresh(); }, 500);
    return () => { mm.revert(); document.body.classList.remove("is-blue", "is-green"); };
  };

  // ── First page loader (logo-spread-loader part): stops scroll while running and releases it when fully lifted (fx:done)
  const loader = () => {
    const el = document.querySelector(".th-loader");
    if (!el || reduce) return;
    pause(true);
    el.addEventListener("fx:done", () => pause(false), { once: true });
  };

  let teardown = null;
  const start = (container) => {
    teardown?.();
    smoother();
    teardown = setup(container);
  };
  const first = document.querySelector('[data-barba="container"]');
  const show = (c, delay) => gsap.fromTo(c, { opacity: 0 }, { opacity: 1, delay, duration: reduce ? 0 : 0.4, ease: "power1.in" });

  if (served && window.barba) {
    barba.init({
      timeout: 5000, cacheIgnore: true,
      prevent: ({ el }) => el.closest(".no-barba") !== null,
      transitions: [{
        name: "opacity-transition",
        once({ next }) { start(next.container); loader(); return show(next.container, 0.5); },
        leave({ current }) { closeAll(); return gsap.to(current.container, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "power1.out", onComplete: () => { current.container.style.display = "none"; toTop(); } }); },
        enter({ next }) { toTop(); start(next.container); return show(next.container, 0.8); },
      }],
    });
    barba.hooks.beforeEnter(({ next }) => {
      const cls = next.container.dataset.bodyClass;
      if (cls) document.body.className = cls;
    });
  } else {
    // When opened as a file, Barba can’t read the next page — fade to transparent for the same length, then go, and turn on .8s after the new page.
    const back = sessionStorage.getItem("th-nav") === "1";
    sessionStorage.removeItem("th-nav");
    start(first);
    loader();
    show(first, back ? 0.8 : 0.5);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || a.target || a.closest(".no-barba")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto|tel|https?):/.test(href)) return;
      e.preventDefault();
      closeAll();
      sessionStorage.setItem("th-nav", "1");
      gsap.to(first, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "power1.out", onComplete: () => (location.href = a.href) });
    });
  }
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(first, { opacity: 1 }); });
})();
