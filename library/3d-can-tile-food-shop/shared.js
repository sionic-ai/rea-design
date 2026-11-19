// Shared by all pages — original order: loader (1025 and up) → header reveal → page and 3D scene reveal. Transitions use barba 2.10.0 sync:
// The new panel rises from 90vh below (when leaving the first page, from the screen height in px below the header) in 1s expo.inOut, and pressing close or the logo drops the current panel to 90vh.
// Original GSAP legacy curve name: Quad = power1, Cubic = power2, Expo = expo.
(() => {
  const docEl = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rem = () => parseFloat(getComputedStyle(docEl).fontSize) || 10;
  const mobile = () => innerWidth <= 1024;
  const css = (name) => getComputedStyle(docEl).getPropertyValue(name).trim();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  // The original cart passes easing:[.65,.05,.36,1] to Motion, but that build only reads the ease key and runs on the default curve — measured, the panel starts fast and keeps moving a little until the end (initial slope 1.4 · end .45)
  const EASE = window.CustomEase ? CustomEase.create("ljEase", "0.3,0.42,0.6,0.82") : "sine.out";

  const LJ = (window.LJ = { pages: {}, page: null, first: true, lenis: null, rem, mobile, reduce });

  // ── Header ──
  const header = $(".lj-header");
  const headerLogo = $(".lj-header__logo");
  const setCurrent = (ns, instant) => {
    const links = $$(".lj-header__link[data-ns], .lj-menu .lj-header__link[data-ns]");
    const on = links.filter((a) => a.dataset.ns === ns), off = links.filter((a) => a.dataset.ns !== ns);
    const d = instant ? 0 : 0.6;
    gsap.to(off, { color: css("--kf-ink"), duration: d });
    if (on.length) gsap.to(on, { color: css("--kf-accent"), duration: d });
  };
  const setChrome = (ns) => {
    const home = ns === "home";
    document.body.classList.toggle("is-home", home);
    document.body.classList.remove("is-end");
    headerLogo?.classList.toggle("is-light", !home);
    $(".lj-main")?.classList.toggle("no-mask", home);
  };
  const headerIn = () => {
    const e = { duration: 0.6, ease: "power2.out" };
    const tl = gsap.timeline({ onComplete: () => { docEl.classList.add("no-intro"); gsap.set([".lj-header > .lj-header__link", ".lj-header__locale", ".lj-header__cart"], { clearProps: "transform" }); } });
    if (!mobile()) {
      tl.to(".lj-header__shop", { ...e, y: 0 })
        .to(".lj-header__link--about", { ...e, y: 0 }, "<17.5%")
        .to(".lj-header > .lj-header__locale", { ...e, y: 0 }, "<")
        .to(".lj-header__cart", { ...e, y: 0 }, "<17.5%")
        .to(".lj-header__link--contact", { ...e, y: 0 }, "<");
    }
    tl.fromTo(".lj-header__link--shop.is-mobile .lj-split__word", { y: 0, yPercent: 100 }, { ...e, yPercent: 0 }, 0);
    if (reduce) tl.progress(1);
  };

  // ── Mobile Menu ──
  const menu = $(".lj-menu");
  const menuState = { open: false, cached: "" };
  const menuTl = gsap.timeline({ paused: true, defaults: { duration: 0.6, ease: "power2.out" }, onReverseComplete: () => (menu.style.visibility = "hidden") })
    .to(".lj-menu__bg", { scaleY: 1 }, 0)
    .to(".lj-header__bar--top", { rotation: 45, y: "1rem" }, 0)
    .to(".lj-header__bar--bottom", { rotation: -45, y: "-1rem" }, 0)
    .to(".lj-header > .lj-header__link--shop", { opacity: 0, pointerEvents: "none" }, 0)
    .to(".lj-header__home", { opacity: 1, pointerEvents: "auto" }, 0)
    .fromTo(".lj-menu .lj-split__word", { y: 0, yPercent: 100 }, { yPercent: 0, stagger: 0.025 }, 0.15)
    .fromTo(".lj-menu .lj-header__locale", { opacity: 0 }, { opacity: 1 }, 0.15)
    .to(".lj-menu .lj-foot__line", { scaleX: 1 }, 0.15);
  const burger = $(".lj-header__burger");
  const menuBg = (c) => { if (LJ.ns === "home") document.body.style.backgroundColor = c; };
  const menuOpen = () => {
    menuState.open = true;
    menuBg(css("--kf-surface"));
    menu.style.visibility = "visible"; menu.style.pointerEvents = "auto";
    menu.setAttribute("aria-hidden", "false"); burger.setAttribute("aria-expanded", "true");
    menuTl.play();
  };
  const menuClose = () => {
    menuState.open = false;
    menuBg("");
    menu.style.pointerEvents = "none";
    menu.setAttribute("aria-hidden", "true"); burger.setAttribute("aria-expanded", "false");
    menuTl.reverse();
    if (menuTl.progress() === 0) menu.style.visibility = "hidden";
  };
  burger?.addEventListener("click", () => (menuState.open ? menuClose() : menuOpen()));
  LJ.menuOpen = () => menuState.open;

  // ── Cart drawer — overlay goes to .95 in .4s, panel slides in over .6s / overlay leaves in .5s, panel in .4s ──
  const cart = $(".lj-cart");
  const cartOpen = () => {
    cart.classList.add("is-open"); cart.setAttribute("aria-hidden", "false");
    // In the original the panel starts one frame later than the curtain (on all three pages curtain +17ms, 123~150ms after the press) — GSAP moves on the very next tick, so delay it by .03s
    gsap.fromTo(".lj-cart__box", { xPercent: 100, x: 0 }, { xPercent: 0, duration: 0.6, delay: 0.03, ease: EASE, overwrite: true });
  };
  const cartClose = () => {
    cart.classList.remove("is-open"); cart.setAttribute("aria-hidden", "true");
    gsap.to(".lj-cart__box", { xPercent: 100, duration: 0.4, ease: EASE, overwrite: true });
  };
  gsap.set(".lj-cart__box", { xPercent: 100, x: 0 });
  $(".lj-header__cart")?.addEventListener("click", cartOpen);
  $(".lj-cart__close")?.addEventListener("click", cartClose);
  $(".lj-cart__veil")?.addEventListener("click", cartClose);
  addEventListener("keydown", (e) => { if (e.key === "Escape") { if (cart.classList.contains("is-open")) cartClose(); else if (menuState.open) menuClose(); } });

  // Adding to cart — the header cart count circle grows
  let qty = 0;
  document.addEventListener("click", (e) => {
    const add = e.target.closest(".lj-card__add");
    if (!add) return;
    qty += 1;
    const q = $(".lj-header__qty");
    q.textContent = qty;
    q.classList.add("is-full");
  });

  // ── Plate heading text — words rise from below in .75s (0s on first open, .5s later when arrived by transition) ──
  LJ.headerReveal = (root, tl, at = 0) => {
    const n = $("[data-header-reveal]", root);
    if (!n) return tl;
    const r = { duration: 0.75, ease: "power2.out", delay: LJ.first ? 0 : 0.5 };
    tl = tl || gsap.timeline();
    tl.fromTo($$(".lj-split__word", n), { y: 0, yPercent: 100 }, { ...r, y: 0, yPercent: 0 }, at);
    const fade = $("[data-header-fade]", n);
    if (fade) tl.fromTo(fade, { opacity: 0 }, { ...r, opacity: 1, delay: LJ.first ? 0.3 : 0.6 }, at);
    if (reduce) tl.progress(1);
    return tl;
  };

  // ── Footer — on entering the screen, line 1s, words .85s (.05 stagger), second row after 25% ──
  const footReveal = (root) => {
    const offs = [];
    for (const box of $$(".lj-foot", root)) {
      const c = $(mobile() ? ".lj-foot--mobile" : ".lj-foot--desktop", box);
      if (!c) continue;
      const tl = gsap.timeline({ paused: true });
      const rows = $$(".lj-foot__wrap", c).filter((w, i) => mobile() || i < 2);
      rows.forEach((w, i) => {
        tl.to($(".lj-foot__line", w), { scaleX: 1, duration: 1, ease: "power2.out" }, i ? "<25%" : 0)
          .to($$(".lj-split__word", w), { y: 0, yPercent: 0, duration: 0.85, ease: "power2.out", stagger: 0.05 }, "<");
      });
      if (reduce) { tl.progress(1); continue; }
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { tl.play(); io.disconnect(); } });
      io.observe(c);
      offs.push(() => { io.disconnect(); tl.kill(); });
    }
    return () => offs.forEach((f) => f());
  };

  // ── Page ──
  const mountPage = (container) => {
    const ns = container.dataset.barbaNamespace;
    LJ.ns = ns;
    const mod = LJ.pages[ns];
    const page = (mod && mod.mount(container)) || {};
    const offFoot = footReveal(container);
    LJ.page = { ns, ...page, unmount: () => { page.unmount?.(); offFoot(); } };
    return LJ.page;
  };

  // Shop — cards stick to the bottom edge and unfold vertically while the inside is counter-squashed and sits 30px low, then settles into place (.85s Cubic.easeOut, .1s stagger every three columns)
  LJ.pages.product = {
    mount(root) {
      const cards = $$(".lj-card--shop", root);
      const offs = [];
      cards.forEach((card, i) => {
        const box = $(".lj-card__img", card), inner = $(".lj-card__scale", card);
        const s = { v: 0.0001 };
        const draw = () => { box.style.transform = `scaleY(${s.v})`; inner.style.transform = `scaleY(${1 / s.v}) translateY(${Math.abs(s.v * 30 - 30)}px)`; };
        const tl = gsap.timeline({ paused: true, delay: mobile() ? 0 : (i % 3) * 0.1 });
        tl.to(s, { v: 1, duration: 0.85, delay: 0.1, ease: "power2.out", onUpdate: draw });
        if (reduce) { s.v = 1; draw(); return; }
        draw();
        const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { tl.play(); io.disconnect(); } }, { rootMargin: "0% 0% 10% 0%" });
        io.observe(card);
        const v = $("video", card);
        const play = () => v?.play().catch(() => {});
        const pause = () => { if (v && !v.paused) v.pause(); };
        card.addEventListener("pointerenter", play);
        card.addEventListener("pointerleave", pause);
        offs.push(() => { io.disconnect(); tl.kill(); card.removeEventListener("pointerenter", play); card.removeEventListener("pointerleave", pause); });
      });
      return {
        animateIn() {
          const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
          LJ.headerReveal(root, tl, 0);
          tl.fromTo($(".lj-shop__side--right", root), { x: -30 * rem(), visibility: "hidden" }, { x: 0, visibility: "visible", duration: 1 }, 0)
            .fromTo($(".lj-shop__side--left", root), { x: 30 * rem(), visibility: "hidden" }, { x: 0, visibility: "visible", duration: 1 }, 0);
          if (reduce) tl.progress(1);
        },
        unmount() { offs.forEach((f) => f()); },
      };
    },
  };
  LJ.pages.contact = { mount: (root) => ({ animateIn: () => LJ.headerReveal(root) }) };
  LJ.pages.about = { mount: (root) => ({ animateIn: () => LJ.headerReveal(root) }) };

  // ── Loader — rest 1s then letters light up one by one (.85s · .75s Quad.easeOut), then on the first page the logo grows into the hero spot and the side text moves to both ends (.85s Expo.easeInOut) ──
  const loaderRun = (ns, done) => {
    const box = $(".lj-loader");
    if (!box || mobile() || reduce) { box?.remove(); headerIn(); done(); return; }
    const L = (k) => $(`.lj-loader .lj-logo__l[data-l="${k}"]`);
    const logo = $(".lj-loader .lj-logo"), left = $(".lj-loader__side--left"), right = $(".lj-loader__side--right"), bg = $(".lj-loader__bg");
    const home = ns === "home";
    let endW = 0, lb = null, rb = null;
    if (home) {
      gsap.set(logo, { width: "49.9rem" });
      lb = left.getBoundingClientRect(); rb = right.getBoundingClientRect(); endW = logo.getBoundingClientRect().width;
      gsap.set(logo, { width: 118 });
    }
    const t = 0.15;
    const q = { opacity: 1, ease: "power1.out" };
    const tl = gsap.timeline({ delay: 1, onComplete: () => { box.remove(); done(); } });
    tl.fromTo(L("l1"), { opacity: 0 }, { ...q, duration: 0.85 })
      .fromTo(L("l5"), { opacity: 0 }, { ...q, duration: 0.85 }, "<")
      .fromTo(L("a"), { opacity: 0 }, { ...q, duration: 0.75 }, "<95%")
      .fromTo(L("o"), { opacity: 0 }, { ...q, duration: 0.75 }, `<${t}`)
      .fromTo(L("y"), { opacity: 0 }, { ...q, duration: 0.75 }, `<${t}`)
      .fromTo(L("a2"), { opacity: 0 }, { ...q, duration: 0.75 }, `<${t}`);
    if (home) {
      tl.to(left, { opacity: 1, duration: 0.6, ease: "power2.inOut" }, "<95%")
        .to(right, { opacity: 1, duration: 0.6, ease: "power2.inOut" }, "<")
        .to(logo, { width: endW, y: "4.6rem", ease: "expo.inOut", duration: 0.85 })
        .to(left, { x: -(lb.left - rem() * 2.2), y: "4.6rem", ease: "expo.inOut", duration: 0.85 }, "<6.5%")
        .to(right, { x: innerWidth - rb.right - rem() * 2.2, y: "4.6rem", ease: "expo.inOut", duration: 0.85 }, "<")
        .to(bg, { opacity: 0, duration: 0.4, ease: "power2.out", onStart: headerIn }, "<50%");
    } else {
      tl.to(logo, { opacity: 0, duration: 0.6 }, ">-0.2")
        .to(bg, { opacity: 0, duration: 0.4, ease: "power2.out", onStart: headerIn }, ">-0.1");
    }
  };

  // ── Page turn ──
  const isBack = (el) => !!el && (el.classList?.contains("lj-return") || el.classList?.contains("lj-header__logo") || el.classList?.contains("lj-header__home"));
  const lerp = { value: 0 };
  const startBarba = () => {
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    barba.init({
      preventRunning: true,
      prevent: ({ el }) => !el || el.getAttribute("href") === "#" || el.target === "_blank",
      transitions: [{
        name: "lj",
        sync: true,
        before({ current, trigger }) {
          LJ.first = false;
          if (menuState.open) menuClose();
          const scroll = LJ.lenis ? LJ.lenis.scroll : 0;
          LJ.lenis?.scrollTo(0, { immediate: true, force: true });
          LJ.lenis?.stop();
          if (current.namespace !== "home" && !isBack(trigger) && !mobile()) $(".lj-page", current.container).style.transform = `translateY(${-scroll}px)`;
          LJ.page?.unmount();
          LJ.page = null;
        },
        leave({ current, next, trigger }) {
          setChrome(next.namespace);
          setCurrent(next.namespace);
          const leaving = isBack(trigger);
          const H = innerHeight - (header ? header.getBoundingClientRect().height : 0);
          const fromHome = current.namespace === "home";
          const target = leaving ? current.container : next.container;
          if (leaving) target.style.zIndex = 11;
          const unit = fromHome ? "px" : "vh";
          const place = (o) => {
            let y;
            if (leaving) y = 90 * o;
            else if (fromHome) y = H * (1 - o);
            else y = 90 * (1 - o);
            target.style.transform = `translateY(${y}${unit})`;
          };
          place(0);
          document.body.style.pointerEvents = "none";
          window.LJGL?.begin(current.namespace, next.namespace, leaving);
          return new Promise((res) => {
            gsap.fromTo(lerp, { value: 0 }, {
              value: 1, duration: reduce ? 0 : 1, ease: "expo.inOut",
              onUpdate: () => { place(lerp.value); window.LJGL?.progress(lerp.value); },
              onComplete: () => {
                document.body.style.pointerEvents = "";
                target.style.transform = "";
                target.style.zIndex = "";
                window.LJGL?.end(next.namespace);
                res();
              },
            });
          });
        },
        enter({ next }) {
          const p = mountPage(next.container);
          p.animateIn?.();
          window.LJGL?.animateIn(next.namespace);
        },
        afterEnter() { LJ.lenis?.resize(); },
      }],
    });
  };

  // ── Beginning ──
  const boot = () => {
    const container = $('[data-barba="container"]');
    const ns = container.dataset.barbaNamespace;
    LJ.ns = ns;
    setChrome(ns);
    setCurrent(ns, true);
    window.LJGL?.mount(ns);
    const p = mountPage(container);
    loaderRun(ns, () => {
      docEl.classList.add("lj-ready");
      setTimeout(() => {
        p.animateIn?.();
        window.LJGL?.animateIn(ns);
      }, 50);
    });
    startBarba();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
