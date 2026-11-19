/* Used by all pages — scroll lock, menu panel open/close (text becomes ”Close”), text reveal (is-in after data-delay once it enters above the bottom 15% of the screen),
   On scroll the header logo text hides, a back-to-top button appears, and the illustration layer changes per section. On subpages the curtain lifts at .1s and the page is usable right away.
   Values are kept exactly as in the original bundle.js·index.js. */
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const TN = (window.TN = {});
  const root = document.documentElement, body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  TN.isSp = () => matchMedia("(max-width: 767px)").matches;
  TN.reduce = reduce;
  const wrap = document.querySelector(".tn-wrap");

  // ── Scroll lock: pins the body in place, and releasing returns to the same spot ──
  let locked = false, prevTop = 0;
  TN.lock = () => { if (locked) return; locked = true; prevTop = scrollY; Object.assign(body.style, { position: "fixed", top: `${-prevTop}px`, left: "0", width: "100%", overflow: "hidden" }); };
  TN.release = () => { if (!locked) return; locked = false; body.removeAttribute("style"); scrollTo(0, prevTop); };

  // ── Scroll state: SCROLL past 10px, ZERO at the top ──
  const subs = { scroll: [], zero: [] };
  TN.on = (k, f) => subs[k].push(f);
  let isDown = null;
  const onScroll = () => { if (locked) return; const d = scrollY > 10; if (d === isDown) return; isDown = d; (d ? subs.scroll : root.classList.contains("is-menu") ? [] : subs.zero).forEach((f) => f()); };
  addEventListener("scroll", onScroll, { passive: true });
  const logo = document.querySelector(".tn-h__logo");
  TN.on("scroll", () => logo?.classList.add("is-hide"));
  TN.on("zero", () => logo?.classList.remove("is-hide"));

  // Menu panel: pressing the bar covers the screen with the panel in .5s and the vertical text becomes Close, pressing again peels it back
  const menuBtn = document.querySelector(".tn-h__menu"), menuTxt = document.querySelector(".tn-h__txt");
  const txtHtml = menuTxt?.innerHTML;
  const setMenu = (open) => {
    root.classList.toggle("is-menu", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
    if (menuTxt) menuTxt.innerHTML = open ? '<span class="txt">Close it</span>' : txtHtml;
    open ? TN.lock() : TN.release();
  };
  menuBtn?.addEventListener("click", () => setMenu(!root.classList.contains("is-menu")));
  addEventListener("keydown", (e) => e.key === "Escape" && root.classList.contains("is-menu") && setMenu(false));
  // Phone menu group accordion: opens with .4s power1.out and closes with power1.in
  document.querySelectorAll(".tn-nav__group").forEach((g) => {
    const t = g.querySelector(".tn-toggle"), dd = g.querySelector(".tn-nav__items");
    if (!t || !dd) return;
    t.addEventListener("click", () => {
      const open = !g.classList.contains("is-open");
      g.classList.toggle("is-open", open);
      if (!TN.isSp()) return;
      gsap.fromTo(dd, { height: open ? 0 : dd.scrollHeight }, { height: open ? dd.scrollHeight : 0, duration: 0.4, ease: open ? "power1.out" : "power1.in", onComplete: () => open && gsap.set(dd, { height: "auto" }) });
    });
  });

  // Text entrance: when it comes in above the bottom 15% of the screen, is-in is added after data-delay seconds (once)
  TN.reveal = (scope = document) => {
    const els = scope.querySelectorAll(".tn-up, .tn-ttl-en, .tn-sec, [data-delay]:not(.tn-up):not(.tn-ttl-en), .tn-sec__link, .tn-news__link, .tn-hours__link, .tn-access__link, .tn-item__link, .tn-reserved__link, .tn-link-wrap");
    if (reduce) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      setTimeout(() => e.target.classList.add("is-in"), (+e.target.dataset.delay || 0) * 1000);
    }), { rootMargin: "0% 0% -15% 0%" });
    els.forEach((e) => io.observe(e));
    // Text pieces go in .1s order (original transition-delay)
    scope.querySelectorAll(".tn-ttl-en").forEach((t) => [...t.children].forEach((s, i) => (s.style.transitionDelay = `${(i + 1) * 0.1}s, ${(i + 1) * 0.1}s`)));
  };

  // ── Per-section image layer: once a section crosses the 80% line of the screen, the layer named for that section shows (default if none) — desktop only ──
  TN.layerSwap = () => {
    const layers = [...document.querySelectorAll(".tn-fix__layer")];
    if (!layers.length || TN.isSp()) return;
    const show = (key) => { const hit = layers.find((l) => l.dataset.key === key) || layers[0]; layers.forEach((l) => l.classList.toggle("is-show", l === hit)); };
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && show(e.target.id)), { rootMargin: "-80% 0% -20% 0%" });
    ["office-hours", "obstetrics", "gynecology", "support", "access"].forEach((id) => { const s = document.getElementById(id); s && io.observe(s); });
  };

  // ── Scroll to top and same-page anchors: window scroll over .8s power1.inOut ──
  document.querySelectorAll("a[href^='#']").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const t = id === "#tn-top" ? 0 : document.querySelector(id);
    if (t === null) return;
    e.preventDefault();
    if (locked) return;
    gsap.to(window, { duration: reduce ? 0 : 0.8, ease: "power1.inOut", scrollTo: { y: t, autoKill: false } });
  }));

  // ── Subpage: the curtain lifts at .1s and the entrance attaches right away (the first page is the opening in index.js) ──
  TN.lower = () => {
    gsap.to(wrap, { opacity: 1, duration: reduce ? 0 : 0.1 });
    wrap.classList.add("is-ended");
    TN.reveal();
  };
  if (body.dataset.page !== "home") addEventListener("load", () => TN.lower());
})();
