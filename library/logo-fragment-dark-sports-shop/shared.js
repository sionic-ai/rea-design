// Shared by the whole site — like the original app.js, one bundle finds and attaches the parts that are on screen. Detached and reattached on every Taxi screen change.
// Lenis 1.3.23 (default lerp) · ScrollTrigger bundle · lagSmoothing(0), first-open logo pieces, mega menu, emphasized-word scrub, reveal groups, parallax, review line mask, footer logo.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqMobile = matchMedia("(max-width: 959px)");
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.ticker.lagSmoothing(0);

  /* Smooth scroll */
  const lenis = !reduce && window.Lenis ? new Lenis() : null;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
  }
  const CO = (window.CO = { reduce, lenis, mqMobile });

  /* ───── Things attached to one screen — bundled with gsap.context and reverted on leave ───── */
  const mounts = [];
  CO.onMount = (fn) => mounts.push(fn);

  function mountView(view) {
    const offs = [];
    const ctx = gsap.context(() => {
      offs.push(initNav(view));
      initHero(view);
      initHighlights(view);
      initReveals(view);
      initParallax(view);
      offs.push(initReviews(view));
      initFooterLogo(view);
      offs.push(initModal(view));
      mounts.forEach((fn) => offs.push(fn(view)));
    }, view);
    view.coUnmount = () => { offs.forEach((f) => typeof f === "function" && f()); ctx.revert(); };
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  /* ───── Header — close the notice bar, sticks on scroll, hides when going further down, mega menu ───── */
  function initNav(view) {
    const nav = view.querySelector(".co-nav");
    if (!nav) return;
    const offs = [];
    const promo = nav.querySelector(".co-promo");
    if (promo && sessionStorage.getItem("co-promo")) promo.remove();
    promo?.querySelector(".co-promo__close")?.addEventListener("click", () => {
      sessionStorage.setItem("co-promo", "1");
      promo.classList.add("is-gone");
      promo.addEventListener("transitionend", () => { promo.remove(); measure(); }, { once: true });
    });
    const measure = () => document.body.style.setProperty("--header-height", `${nav.offsetHeight}px`);
    measure();
    let hiding = false;
    ScrollTrigger.create({
      trigger: document.body, start: "top+=40px top", end: "bottom bottom-=100px",
      toggleClass: { targets: nav, className: "is-fixed" },
      onUpdate: (st) => { if (!hiding) document.body.setAttribute("data-scroll-direction", st.direction === -1 ? "up" : "down"); },
    });
    const hide = view.querySelector("[data-hide-header]");
    if (hide) ScrollTrigger.create({ trigger: hide, start: "top bottom", end: "bottom top", onToggle: (st) => { hiding = st.isActive; if (hiding) document.body.setAttribute("data-scroll-direction", "down"); } });

    // Original values: open — curtain .3 power2.out · panel height .35 power3.out · cell y 8→0 .3 (all staggered within .25) power3.out .1 later, close — cell .14 power2.in · panel .25 power2.in · curtain .2
    const box = nav.querySelector(".co-drop__box"), backdrop = nav.querySelector(".co-nav__backdrop");
    const toggles = [...nav.querySelectorAll("[data-drop]")];
    const panelOf = (k) => nav.querySelector(`[data-drop-panel="${k}"]`);
    const fades = (p) => p.querySelectorAll("[data-menu-fade]");
    const st = { open: false, panel: null, hover: 0, leave: 0, tl: null };
    const stag = (n) => (n <= 1 ? 0 : { amount: 0.25 });
    const open = (k) => {
      if (st.open && st.panel === k) return;
      const p = panelOf(k);
      if (!p) return;
      st.tl?.kill();
      nav.querySelectorAll("[data-drop-panel]").forEach((q) => gsap.set(q, { autoAlpha: 0, pointerEvents: "none" }));
      gsap.set(p, { visibility: "visible", opacity: 0 });
      const h = p.getBoundingClientRect().height;
      st.open = true; st.panel = k;
      nav.setAttribute("data-menu-open", "true");
      toggles.forEach((t) => t.setAttribute("aria-expanded", String(t.dataset.drop === k)));
      const f = fades(p);
      st.tl = gsap.timeline()
        .to(backdrop, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0)
        .to(box, { height: h, duration: 0.35, ease: "power3.out" }, 0)
        .set(p, { autoAlpha: 1, pointerEvents: "auto" }, 0.05)
        .fromTo(f, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: stag(f.length), ease: "power3.out" }, 0.1);
    };
    const close = () => {
      if (!st.open) return;
      const p = panelOf(st.panel);
      st.tl?.kill();
      st.tl = gsap.timeline({ onComplete: () => { st.open = false; st.panel = null; nav.setAttribute("data-menu-open", "false"); gsap.set(p, { autoAlpha: 0, pointerEvents: "none" }); gsap.set(fades(p), { x: 0, y: 0 }); } })
        .to(fades(p), { autoAlpha: 0, y: -4, duration: 0.14, ease: "power2.in" }, 0)
        .to(box, { height: 0, duration: 0.25, ease: "power2.in" }, 0.05)
        .to(backdrop, { autoAlpha: 0, duration: 0.2, ease: "power2.out" }, 0);
      toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
    };
    toggles.forEach((t) => {
      t.addEventListener("mouseenter", () => { if (mqMobile.matches) return; clearTimeout(st.leave); clearTimeout(st.hover); st.hover = setTimeout(() => open(t.dataset.drop), st.open ? 0 : 120); });
      t.addEventListener("mouseleave", () => { if (mqMobile.matches) return; clearTimeout(st.hover); st.leave = setTimeout(close, 150); });
      // The original does not take presses on desktop (it opens on hover, and the keyboard uses Enter, Space, ↓)
      t.addEventListener("keydown", (e) => { if (mqMobile.matches) return; if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); st.open && st.panel === t.dataset.drop && e.key !== "ArrowDown" ? close() : open(t.dataset.drop); } });
    });
    const drop = nav.querySelector(".co-drop");
    drop?.addEventListener("mouseenter", () => clearTimeout(st.leave));
    drop?.addEventListener("mouseleave", () => { if (!mqMobile.matches) st.leave = setTimeout(close, 150); });
    backdrop?.addEventListener("click", close);
    const key = (e) => { if (e.key === "Escape") { close(); closeMobile(); } };
    const outside = (e) => { if (st.open && !e.target.closest(".co-nav")) close(); };
    document.addEventListener("keydown", key);
    document.addEventListener("click", outside);
    offs.push(() => { document.removeEventListener("keydown", key); document.removeEventListener("click", outside); });

    // Phone — panel .3 power2.out, rows y 12→0 .3 · .04 stagger power3.out .15 later
    const burger = nav.querySelector(".co-nav__burger"), mnav = nav.querySelector(".co-mnav");
    let mOpen = false, mtl = null;
    const closeMobile = () => {
      if (!mOpen) return;
      mOpen = false; burger?.setAttribute("aria-expanded", "false"); nav.setAttribute("data-menu-open", "false");
      mtl?.kill(); mtl = gsap.to(mnav, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut", delay: 0.05 });
      lenis?.start();
    };
    burger?.addEventListener("click", () => {
      if (mOpen) return closeMobile();
      mOpen = true; burger.setAttribute("aria-expanded", "true"); nav.setAttribute("data-menu-open", "true");
      lenis?.stop();
      const items = mnav.querySelectorAll("li");
      mtl?.kill();
      mtl = gsap.timeline().to(mnav, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0).fromTo(items, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" }, 0.15);
    });
    // Currency picker — the small panel drops in from 8px above in .15s (original css transition)
    const cur = nav.querySelector("[data-currency]"), curDrop = nav.querySelector("[data-currency-drop]");
    let curOn = false;
    const setCur = (on) => { curOn = on; cur?.setAttribute("aria-expanded", String(on)); curDrop?.classList.toggle("is-open", on); };
    cur?.addEventListener("click", (e) => { e.stopPropagation(); setCur(!curOn); });
    curDrop?.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { cur.textContent = b.textContent; setCur(false); }));
    const curOut = (e) => { if (curOn && !e.target.closest(".co-cur")) setCur(false); };
    document.addEventListener("click", curOut);
    offs.push(() => document.removeEventListener("click", curOut));
    // Cart drawer — stops scrolling while open
    const cart = view.querySelector("[data-cart]");
    const setCart = (on) => { if (!cart) return; cart.classList.toggle("is-open", on); cart.setAttribute("aria-hidden", String(!on)); on ? lenis?.stop() : lenis?.start(); };
    nav.querySelector("[data-cart-open]")?.addEventListener("click", () => { close(); setCart(true); });
    cart?.querySelectorAll("[data-cart-close]").forEach((b) => b.addEventListener("click", () => setCart(false)));
    const cartKey = (e) => e.key === "Escape" && cart?.classList.contains("is-open") && setCart(false);
    document.addEventListener("keydown", cartKey);
    offs.push(() => document.removeEventListener("keydown", cartKey));
    CO.closeMenus = () => { close(); closeMobile(); setCart(false); };
    return () => offs.forEach((f) => f());
  }

  /* Hero section — the backdrop moves down 25% on scroll. In portrait view, use the portrait video */
  function initHero(view) {
    const hero = view.querySelector(".co-hero");
    if (!hero) return;
    const bg = hero.querySelector(".co-hero__bg");
    if (bg && !reduce) gsap.to(bg, { yPercent: 25, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    const v = hero.querySelector("video[data-src-portrait]");
    if (v) {
      const pick = () => { const want = matchMedia("(orientation: portrait)").matches ? v.dataset.srcPortrait : v.dataset.srcLandscape; if (v.getAttribute("src") !== want) { v.src = want; v.play().catch(() => {}); } };
      pick();
      matchMedia("(orientation: portrait)").addEventListener("change", pick);
    }
  }

  /* Emphasis paragraph — word by word, each lights up in turn from .1 opacity (.1). scrub from section top at 90% → center at 50% */
  function initHighlights(view) {
    view.querySelectorAll("[data-highlight-text]").forEach((el) => {
      if (reduce) return;
      SplitText.create(el, {
        type: "words", autoSplit: true,
        onSplit: (s) => gsap.timeline({ scrollTrigger: { scrub: true, trigger: el, start: el.dataset.highlightStart || "top 90%", end: el.dataset.highlightEnd || "center 50%" } })
          .from(s.words, { autoAlpha: +(el.dataset.highlightFade || 0.1), stagger: +(el.dataset.highlightStagger || 0.1), ease: "linear" }),
      });
    });
  }

  /* Reveal group — each child comes from −30px left and transparent over .8s power4.out with a .1s stagger, once when the section top reaches 80% */
  function initReveals(view) {
    view.querySelectorAll("[data-reveal-group]").forEach((g) => {
      const kids = [...g.children].filter((n) => n.nodeType === 1);
      if (reduce) return gsap.set(g, { clearProps: "all" });
      const dist = g.dataset.distance || "-30px", step = (parseFloat(g.dataset.stagger) || 100) / 1000;
      const targets = kids.length ? kids : [g];
      gsap.set(targets, { x: dist, autoAlpha: 0 });
      ScrollTrigger.create({ trigger: g, start: g.dataset.start || "top 80%", once: true, onEnter: () => targets.forEach((t, i) => gsap.to(t, { x: 0, autoAlpha: 1, duration: 0.8, ease: "power4.out", delay: i * step, onComplete: () => gsap.set(t, { clearProps: "all" }) })) });
    });
  }

  /* Parallax — photo inside the frame moves down 20% with scroll */
  function initParallax(view) {
    if (reduce) return;
    view.querySelectorAll("[data-parallax-container]").forEach((c) => {
      const img = c.querySelector("[data-parallax-image]");
      if (img) gsap.to(img, { yPercent: 20, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  /* Testimonials — every 5s (only when visible). Stars shrink and grow at .5s power4.inOut in .05 sequence, the text line slides out inside the mask at −110% (.6 · sequenced within .25) and the new line rises from 110% in .7 (sequenced within .4) */
  function initReviews(view) {
    const wrap = view.querySelector("[data-review-wrap]");
    if (!wrap) return;
    const items = [...wrap.querySelectorAll("[data-review-item]")];
    if (!items.length) return;
    const auto = wrap.dataset.autoplay === "true", every = (parseInt(wrap.dataset.autoplayDuration, 10) || 4000) / 1000;
    let cur = 0, busy = false, inView = true, timer = null;
    const R = items.map((it) => ({ it, stars: it.querySelectorAll("[data-review-rating]"), splits: [] }));
    const show = (i, on) => { R[i].it.classList.toggle("is-active", on); R[i].it.setAttribute("aria-hidden", String(!on)); gsap.set(R[i].it, { autoAlpha: on ? 1 : 0, pointerEvents: on ? "auto" : "none" }); };
    R.forEach((r, i) => show(i, i === cur));
    R.forEach((r, i) => {
      r.splits = [...r.it.querySelectorAll("[data-review-text], [data-review-split]")].map((n) => SplitText.create(n, {
        type: "lines", mask: "lines", linesClass: "text-line", autoSplit: true,
        onSplit: (s) => { if (reduce) return; gsap.set(s.lines, { yPercent: i === cur ? 0 : 110 }); gsap.set(r.stars, { scale: i === cur ? 1 : 0, autoAlpha: i === cur ? 1 : 0 }); },
      }));
    });
    const lines = (r) => r.splits.flatMap((s) => s.lines);
    const go = (n) => {
      if (busy || n === cur) return;
      busy = true;
      const a = R[cur], b = R[n];
      const tl = gsap.timeline({ onComplete: () => { show(cur, false); show(n, true); cur = n; busy = false; } });
      if (reduce) { tl.to(a.it, { autoAlpha: 0, duration: 0.4, ease: "power2" }, 0).fromTo(b.it, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2" }, 0); return; }
      gsap.set(b.it, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(lines(b), { yPercent: 110 });
      tl.to(a.stars, { scale: 0, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: "power4.inOut" }, 0)
        .to(lines(a), { yPercent: -110, duration: 0.6, ease: "power4.inOut", stagger: { amount: 0.25 } }, 0)
        .to(b.stars, { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "power4.inOut" }, ">-=0.3")
        .to(lines(b), { yPercent: 0, duration: 0.7, ease: "power4.inOut", stagger: { amount: 0.4 } }, "<")
        .set(a.it, { autoAlpha: 0 }, ">");
    };
    const loop = () => { if (!auto) return; timer?.kill(); timer = gsap.delayedCall(every, () => { if (inView && !busy) go((cur + 1) % R.length); loop(); }); };
    const restart = () => auto && loop();
    wrap.querySelector("[data-next]")?.addEventListener("click", () => { restart(); go((cur + 1) % R.length); });
    wrap.querySelector("[data-prev]")?.addEventListener("click", () => { restart(); go((cur - 1 + R.length) % R.length); });
    const key = (e) => {
      const t = e.target;
      if (!inView || (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))) return;
      if (e.key === "ArrowRight") { e.preventDefault(); restart(); go((cur + 1) % R.length); }
      if (e.key === "ArrowLeft") { e.preventDefault(); restart(); go((cur - 1 + R.length) % R.length); }
    };
    addEventListener("keydown", key);
    ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: "bottom top", onToggle: (st) => { inView = st.isActive; if (inView) timer ? timer.resume() : loop(); else timer?.pause(); } });
    loop();
    return () => { timer?.kill(); removeEventListener("keydown", key); R.forEach((r) => r.splits.forEach((s) => s.revert())); };
  }

  /* Footer big logo — four pieces start at left 100% with .6s power4.out in .12 stagger, trigger at bottom 80%, and reverse when scrolled back up */
  function initFooterLogo(view) {
    const parts = view.querySelectorAll(".co-footer__logo .co-logo-part svg");
    if (!parts.length || reduce) return;
    const tl = gsap.timeline({ paused: true }).from(parts, { xPercent: -100, opacity: 0, duration: 0.6, ease: "power4.out", stagger: 0.12 });
    ScrollTrigger.create({ trigger: view.querySelector(".co-footer"), start: "top 80%", onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() });
  }

  /* Comparison table window — open button, close, Esc. Scrolling is paused while open */
  function initModal(view) {
    const group = view.querySelector("[data-modal-group-status]");
    if (!group) return;
    const shut = () => { group.setAttribute("data-modal-group-status", "not-active"); view.querySelectorAll("[data-modal-name]").forEach((m) => m.setAttribute("data-modal-status", "not-active")); setTimeout(() => lenis?.start(), 600); };
    view.querySelectorAll("[data-modal-target]").forEach((b) => b.addEventListener("click", () => {
      const m = view.querySelector(`[data-modal-name="${b.dataset.modalTarget}"]`);
      if (!m) return;
      CO.closeMenus?.();
      m.setAttribute("data-modal-status", "active");
      group.setAttribute("data-modal-group-status", "active");
      lenis?.stop();
    }));
    view.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", shut));
    const key = (e) => e.key === "Escape" && shut();
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }

  /* First open — rest 1s, four logo pieces come in from −100% over 1s power4.out (.12 stagger), copy words 1s power4.inOut (.1), after holding .5s they exit to 100% and the curtain moves right over 1.5s expo.inOut */
  function intro() {
    const el = document.querySelector(".co-intro");
    if (!el) return;
    // The original spins on every fresh open (first fetch, not a Taxi handoff)
    if (reduce) { el.classList.add("is-gone"); return; }
    lenis?.stop();
    const words = new SplitText(el.querySelector(".co-intro__msg"), { type: "words" }).words;
    gsap.timeline({ delay: 1, onStart: () => document.body.classList.add("is-transitioning"), onComplete: () => { document.body.classList.remove("is-transitioning"); el.classList.add("is-gone"); lenis?.start(); } })
      .set(".co-veil", { autoAlpha: 0 })
      .set([el.querySelector(".co-intro__logo"), el.querySelector(".co-intro__msg")], { autoAlpha: 1 })
      .fromTo(el.querySelectorAll(".co-logo-part svg"), { autoAlpha: 0, xPercent: -100 }, { autoAlpha: 1, xPercent: 0, stagger: 0.12, duration: 1, ease: "power4.out" })
      .fromTo(words, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.1, duration: 1, ease: "power4.inOut" }, "<")
      .to(el.querySelectorAll(".co-logo-part svg"), { autoAlpha: 0, xPercent: 100, stagger: 0.12, duration: 1, ease: "power4.in" }, ">+=0.5")
      .to(words, { autoAlpha: 0, stagger: 0.1, duration: 1, ease: "power4.inOut" }, "<")
      .to(el, { clipPath: "inset(0% 0% 0% 100%)", duration: 1.5, ease: "expo.inOut" }, "<+=0.4")
      .set(el, { autoAlpha: 0 });
  }

  /* ───── Page transition — Taxi 1.9.1, a black curtain covers and then lifts in .6s sine.inOut. On file:// it goes curtain → navigate → lift with the same values ───── */
  const veil = document.querySelector(".co-veil");
  function bindTaxi() {
    const T = window.taxi;
    if (!T || !/^https?:$/.test(location.protocol)) return false;
    class Veil extends T.Transition {
      onLeave({ done }) { CO.closeMenus?.(); document.body.classList.add("is-transitioning"); gsap.to(veil, { autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: "sine.inOut", onComplete: done }); }
      onEnter({ done }) { gsap.to(veil, { autoAlpha: 0, duration: reduce ? 0 : 0.6, ease: "sine.inOut", onComplete: () => { document.body.classList.remove("is-transitioning"); done(); } }); }
    }
    const core = new T.Core({
      links: 'a[href$=".html"]:not([target]):not([href*="/"]):not([data-taxi-ignore])',
      removeOldContent: true,
      allowInterruption: false,
      transitions: { default: Veil },
    });
    core.on("NAVIGATE_IN", ({ from, to }) => {
      from?.renderer?.content?.coUnmount?.();
      lenis?.scrollTo(0, { immediate: true });
      scrollTo(0, 0);
      document.body.removeAttribute("data-scroll-direction");
      mountView(to.renderer.content);
    });
    return true;
  }
  function bindFileNav() {
    if (sessionStorage.getItem("co-nav") === "1" && !reduce) gsap.fromTo(veil, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.6, ease: "sine.inOut" });
    sessionStorage.removeItem("co-nav");
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || a.hasAttribute("data-taxi-ignore") || e.metaKey || e.ctrlKey || e.button) return;
      if (!/^[\w-]+\.html(\?[^#]*)?$/.test(a.getAttribute("href"))) return;
      e.preventDefault();
      CO.closeMenus?.();
      gsap.to(veil, { autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: "sine.inOut", onComplete: () => { sessionStorage.setItem("co-nav", "1"); location.href = a.getAttribute("href"); } });
    });
  }

  /* Cookie panel */
  const cookie = document.querySelector(".co-cookie");
  if (cookie && sessionStorage.getItem("co-cookie")) cookie.classList.add("is-gone");
  // The original consent tool removes the panel immediately on press
  cookie?.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { sessionStorage.setItem("co-cookie", "1"); cookie.classList.add("is-gone"); }));

  let taxiOn = false;
  try { taxiOn = bindTaxi(); } catch (err) { console.warn("Can’t hail a Taxi, so it falls back to regular travel", err); }
  if (!taxiOn) bindFileNav();
  CO.start = () => { mountView(document.querySelector("[data-taxi-view]")); intro(); };
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener("load", () => ScrollTrigger.refresh());
})();
