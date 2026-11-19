// Shared by the whole brand site — Lenis 1.3.20, header bar hides on scroll down and returns on scroll up (.3s ease-in-out), Latest News dialog (backdrop · card .06 apart),
// Transition curtain (a white curtain below the header row covers in 350ms ease and lifts 80ms after the new page arrives — original PageSail), line-by-line rising text (.85s power3.out · .09 stagger · screen 85%), photo parallax (1.21× · −10%→)
(() => {
  const TW = (window.TW = window.TW || {});
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  TW.q = q; TW.qa = qa;
  TW.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  TW.mobile = matchMedia("(max-width: 767px)").matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  if (!TW.reduce && window.Lenis) {
    TW.lenis = new Lenis({ lerp: 0.1 });
    TW.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => TW.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Header bar — hides after scrolling down over 80px, returns on scrolling up
  const header = q(".tw-header");
  let lastY = 0;
  const onScroll = () => {
    const y = TW.lenis ? TW.lenis.scroll : scrollY;
    if (header && !isOpen()) header.classList.toggle("is-hidden", y > 80 && y > lastY);
    lastY = y;
  };
  TW.lenis ? TW.lenis.on("scroll", onScroll) : addEventListener("scroll", onScroll, { passive: true });

  // Recent News window — the original News dialog starts closed on every page. Pressing the button locks the body, draws the window on the next frame, and builds the timeline on the frame after that
  // (the original calls GSAP in rAF after React draws the window). Open: back panel .35 power2.out, cards .4s power2.out after .1 (.06 apart · 30px below · from .95x),
  // Close button: .4 power3.out after .15 (from 16px above), ”View all”: .3 after .1 once all cards are out. Closing: cards .35 power2.out, ”View all” .15 power2.in, close button .4 power3.inOut, backdrop .3 power2.in after .1
  const winsBtn = q(".tw-wins-btn"), wins = q(".tw-wins");
  const cBtn = q(".tw-contact-btn"), cBox = q(".tw-contact");
  let winsOpen = false, winsTl = null, lockY = 0;
  const isOpen = () => winsOpen;
  const lockBody = (on) => {
    const b = document.body.style;
    if (on) {
      lockY = scrollY;
      TW.lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      Object.assign(b, { overflow: "hidden", position: "fixed", top: `-${lockY}px`, width: "100%" });
    } else {
      document.documentElement.style.overflow = "";
      Object.assign(b, { overflow: "", position: "", top: "", width: "" });
      scrollTo(0, lockY);
      TW.lenis?.start();
    }
  };
  const openWins = () => {
    if (!wins || winsOpen) return;
    winsOpen = true;
    q(".tw-wins-dot", winsBtn)?.remove();
    lockBody(true);
    requestAnimationFrame(() => {
      wins.classList.toggle("is-dark", !!header?.classList.contains("is-dark"));
      wins.hidden = false;
      if (TW.reduce) return;
      requestAnimationFrame(() => {
        winsTl?.kill();
        const cards = qa(".tw-win", wins);
        winsTl = gsap.timeline()
          .fromTo(q(".tw-wins-back", wins), { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" }, 0)
          .fromTo(q(".tw-wins-close", wins), { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.15)
          .fromTo(cards, { autoAlpha: 0, y: 30, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out", stagger: 0.06 }, 0.1)
          .fromTo(q(".tw-wins-all", wins), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.1 + 0.06 * cards.length + 0.1);
      });
    });
  };
  const closeWins = () => {
    if (!winsOpen) return;
    const done = () => { winsOpen = false; wins.hidden = true; lockBody(false); };
    winsTl?.kill();
    if (TW.reduce) { done(); return; }
    winsTl = gsap.timeline({ onComplete: done })
      .to(qa(".tw-win", wins), { autoAlpha: 0, duration: 0.35, ease: "power2.out" }, 0)
      .to(q(".tw-wins-all", wins), { autoAlpha: 0, duration: 0.15, ease: "power2.in" }, 0)
      .to(q(".tw-wins-close", wins), { autoAlpha: 0, y: -16, duration: 0.4, ease: "power3.inOut" }, 0)
      .to(q(".tw-wins-back", wins), { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.1);
  };
  winsBtn?.addEventListener("click", (e) => { e.preventDefault(); if (cBox) cBox.hidden = true; openWins(); });
  qa(".tw-wins-back, .tw-wins-close", wins || document).forEach((b) => b.addEventListener("click", closeWins));
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeWins(); });

  // Did we arrive from within the same site — the original is an app router, so on arrival the header row · body entrance and first-page loader are skipped and only the transition veil clears (in-section entrances run again)
  TW.internal = (() => { try { return !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) { return false; } })();

  // Transition curtain — original PageSail: clicking an internal link to another page (left button, no modifier keys) covers the screen with the curtain and navigates after 350ms.
  // The arrived section is drawn with the curtain covering it (head snippet) and the curtain lifts after 80ms. The header line sits above the curtain so it stays visible
  const root = document.documentElement.classList;
  document.addEventListener("click", (e) => {
    if (TW.reduce || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;
    const a = e.target.closest?.("a"), href = a?.getAttribute("href");
    if (!a || !href || (a.target && a.target !== "_self") || href.startsWith("#") || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return;
    const u = new URL(href, location.href);
    if (u.pathname === location.pathname) return;
    e.preventDefault();
    root.add("tw-sail");
    clearTimeout(TW.sailGo);
    TW.sailGo = setTimeout(() => { location.href = u.href; }, 350);
  }, true);
  if (root.contains("tw-sail")) setTimeout(() => root.remove("tw-sail"), 80);
  // When the saved page returns via back, lift the covering curtain
  addEventListener("pageshow", (e) => { if (e.persisted) root.remove("tw-sail"); });

  // Contact panel — pressing ”Menu 6” opens a small panel under the header row (original Contact: opacity .17s, position and size .22s)
  cBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = cBox.hidden;
    cBox.hidden = !open;
    if (open && !TW.reduce) gsap.timeline().fromTo(cBox, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0).fromTo(cBox, { y: -8, scale: 0.96 }, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" }, 0);
  });
  document.addEventListener("click", (e) => { if (cBox && !cBox.hidden && !e.target.closest(".tw-contact")) cBox.hidden = true; });
  const mm = q(".tw-mmenu");
  q(".tw-burger")?.addEventListener("click", () => { mm.hidden = !mm.hidden; if (!mm.hidden && !TW.reduce) gsap.fromTo(mm, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }); });


  // Text rising line by line
  TW.lines = (el, opts = {}) => {
    if (!el) return null;
    const s = new SplitText(el, { type: "lines", linesClass: "tw-line-in", mask: "lines" });
    if (TW.reduce) return s;
    gsap.set(s.lines, { yPercent: 110 });
    gsap.to(s.lines, { yPercent: 0, duration: opts.duration ?? 0.85, stagger: opts.stagger ?? 0.09, delay: opts.delay ?? 0, ease: "power3.out", scrollTrigger: opts.scroll === false ? undefined : { trigger: el, start: "top 85%", once: true } });
    return s;
  };
  // Block inside the mask panel (.tw-mask > span·.tw-word > Raise span) from below
  TW.rise = (els, opts = {}) => {
    if (!els.length || TW.reduce) return null;
    gsap.set(els, { yPercent: opts.from ?? 110 });
    return gsap.to(els, { yPercent: 0, duration: opts.duration ?? 0.9, stagger: opts.stagger ?? 0.12, delay: opts.delay ?? 0, ease: "power3.out", scrollTrigger: opts.trigger ? { trigger: opts.trigger, start: opts.start || "top 80%", once: true } : undefined });
  };

  // Photo that appears once received — adds is-loaded on the frame after attaching (two frames later so the CSS transition runs from the attached state)
  TW.loaded = (els = qa(".tw-fade-img:not(.is-loaded)")) => requestAnimationFrame(() => requestAnimationFrame(() => els.forEach((m) => m.classList.add("is-loaded"))));

  // Photo parallax — rises upward during scroll from 1.21x · −10% (original parallax image)
  TW.parallax = (root = document) => {
    if (TW.reduce) return;
    qa("[data-par]", root).forEach((el) => {
      gsap.set(el, { scale: 1.21, yPercent: -10 });
      gsap.to(el, { yPercent: 10, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
  };

  TW.start = (page) => {
    qa(".tw-page-t .tw-word").forEach((w) => { w.innerHTML = `<span>${w.textContent}</span>`; });
    // Opening a non-home section directly, as in the original the header row appears from 40px above (.6s power3.out) and the wrapper around body and Footer from 10px below (.05 later, .5s power3.out) — the header itself has a CSS transition for hiding, so the inner row is what moves
    // When arriving from the same site, this intro is skipped and the transition curtain lifts instead (the original app router doesn’t redraw the header row or body)
    if (!TW.reduce && !TW.internal && document.body.dataset.page !== "index") {
      gsap.timeline()
        .fromTo(q(".tw-header-row"), { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", clearProps: "opacity,transform" }, 0)
        .fromTo(q(".tw-shell"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", clearProps: "opacity,transform" }, 0.05);
    }
    root.remove("tw-pre", "tw-pre-head");
    TW.loaded();
    // Original title entrance: Work section settles within ~.42s, News section ~.6s. The original text reveal re-runs on every section change, so it rises again even when you come back.
    TW.rise(qa(".tw-page-t .tw-word > span"), { duration: document.body.dataset.page === "news" ? 0.95 : 0.52, stagger: 0.06 });
    page?.();
    // Over a dark Hero, the header bar becomes white glass
    const darkHero = q("[data-header-dark]");
    if (darkHero && header) header.classList.add("is-dark");
    if (darkHero && header) ScrollTrigger.create({ trigger: darkHero, start: "top top", end: "bottom top+=60", onToggle: (st) => header.classList.toggle("is-dark", st.isActive) });
    // Current page link is bold
    const here = location.pathname.split("/").pop() || "index.html";
    qa(".tw-nav-link[href]").forEach((a) => { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });
    qa(".tw-split").forEach((el) => { if (!el.dataset.twDone) TW.lines(el); });
    TW.parallax();
    addEventListener("load", () => ScrollTrigger.refresh());
  };
})();
