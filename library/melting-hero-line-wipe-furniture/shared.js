/* Things spanning multiple pages — Lenis 1.0.29 (lerp .1), loading curtain, barba 2.9.7 + prefetch 2.1.10 transitions (default: line curtain / to detail: a panel filling up from below),
   Menu panel, in-view marker (data-shown), header band line, large photo parallax, label cursor. Per-page motion is received through EDI.view(namespace, fn) */
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pc = matchMedia("(min-width: 1025px) and (hover: hover)");
  const views = {};
  const EDI = (window.EDI = { $, $$, reduce, pc, views, view: (ns, fn) => (views[ns] = fn), lenis: null });
  gsap.registerPlugin(ScrollTrigger);
  if (window.CustomEase) gsap.registerPlugin(CustomEase);

  /* Smooth scrolling — original uses lerp .4 only in Safari and Edge */
  const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (window.Lenis && !reduce) {
    const lenis = (EDI.lenis = new Lenis({ lerp: safari ? 0.4 : 0.1 }));
    lenis.on("scroll", ({ velocity }) => {
      ScrollTrigger.update();
      html.classList.toggle("use-cursor", Math.abs(velocity) <= 2);
    });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  html.classList.add("use-cursor");
  const stopScroll = () => EDI.lenis?.stop();
  const startScroll = () => EDI.lenis?.start();
  const toTop = () => (EDI.lenis ? EDI.lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0));
  // Hold scrolling while the sticky scene plays (original videoStep)
  document.addEventListener("fx:play", stopScroll);
  document.addEventListener("fx:done", () => { if (!html.classList.contains("is-transition")) startScroll(); });

  /* In-view flag — once it enters the view, data-shown=1, whether it is visible now is in data-visible */
  let io;
  const inView = (root) => {
    io?.disconnect();
    io = new IntersectionObserver((es) => es.forEach((e) => {
      e.target.dataset.visible = e.isIntersecting ? 1 : 0;
      if (e.isIntersecting) e.target.dataset.shown = 1;
    }), { threshold: 0 });
    $$(".js-iv", root).forEach((n) => io.observe(n));
  };

  /* Menu Panel */
  const menuBtn = $(".e-drawer-btn");
  const menu = {
    open: false,
    toggle() { menu.open ? menu.close() : menu.show(); },
    show() { menu.open = true; html.classList.add("is-menu-open"); menuBtn?.setAttribute("aria-expanded", "true"); },
    close() {
      if (!menu.open) return;
      menu.open = false;
      html.classList.remove("is-menu-open");
      html.classList.add("is-menu-closing");
      menuBtn?.setAttribute("aria-expanded", "false");
      setTimeout(() => html.classList.remove("is-menu-closing"), 800);
    },
  };
  menuBtn?.addEventListener("click", menu.toggle);
  $(".e-overlay")?.addEventListener("click", menu.close);
  addEventListener("keydown", (e) => e.key === "Escape" && menu.close());
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-scroll-top], [data-scroll-to]");
    if (!a) return;
    e.preventDefault();
    const to = a.hasAttribute("data-scroll-top") ? 0 : $(a.dataset.scrollTo);
    if (to === null) return;
    const offset = -($(".e-header")?.clientHeight || 0);
    if (EDI.lenis) EDI.lenis.scrollTo(to, { offset });
    else scrollTo({ top: to === 0 ? 0 : to.getBoundingClientRect().top + scrollY + offset, behavior: "smooth" });
  });

  /* Dim the current page link */
  const markCurrent = () => {
    const here = location.pathname.split("/").pop() || "index.html";
    $$("[data-nav]").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === here));
  };

  /* Label cursor — follows by .2 each frame */
  const cur = $(".e-cursor__inner");
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 }, last = { x: 0, y: 0 };
  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  if (cur && !reduce) gsap.ticker.add(() => {
    last.x += (mouse.x - last.x) * 0.2;
    last.y += (mouse.y - last.y) * 0.2;
    cur.style.transform = `translate(${last.x}px, ${last.y}px)`;
  });

  /* Shared page scroll effects — line under the header band, large photo parallax */
  const common = (c) => {
    const hr = $(".e-header__hr");
    $$(".js-hide-border", c).forEach((t) => ScrollTrigger.create({ trigger: t, start: "top 52px", onEnter: () => gsap.to(hr, { duration: 0.2, opacity: 0 }), onEnterBack: () => gsap.to(hr, { duration: 0.2, opacity: 0 }) }));
    $$(".js-show-border", c).forEach((t) => ScrollTrigger.create({ trigger: t, start: "top 52px", onEnter: () => gsap.to(hr, { duration: 0.2, opacity: 1 }), onEnterBack: () => gsap.to(hr, { duration: 0.2, opacity: 1 }) }));
    // When the interaction is over a product card, the label cursor shows DETAIL (original mouseOnChecker)
    $$(".e-pcard", c).forEach((a) => {
      a.addEventListener("mouseenter", () => html.classList.add("is-product-focus"));
      a.addEventListener("mouseleave", () => html.classList.remove("is-product-focus"));
    });
    if (!pc.matches || reduce || safari) return;
    $$(".e-large", c).forEach((box) => {
      const img = $(".e-large__img", box);
      const y = (p) => p * (img.clientHeight - box.clientHeight) * 2 + 1.5 * (box.clientHeight - img.clientHeight);
      gsap.set(img, { y: y(0) });
      ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", onUpdate: (st) => gsap.set(img, { y: y(st.progress) }) });
    });
  };

  /* Turning one page on and off — page effects are built inside gsap.context and all reverted at once when turned off */
  let ctx = null;
  const nsOf = (c) => c?.dataset.barbaNamespace || "page";
  const init = (c) => {
    ctx?.revert();
    ctx = gsap.context(() => {
      common(c);
      return views[nsOf(c)]?.(c);
    }, c);
    inView(c);
    markCurrent();
    $$(".e-btn[data-fx]", c).forEach((b) => b.closest(".js-iv") || b.classList.add("is-in"));
  };
  const pre = (c) => gsap.set([$(".e-header"), ...$$(".js-enter", c)], { opacity: 0, y: innerHeight });
  const start = (c) => {
    const t = [$(".e-header"), ...$$(".js-enter", c)];
    gsap.set(t, { y: 0 });
    gsap.to(t, { duration: 0.4, opacity: 1, onComplete: () => gsap.set(t, { clearProps: "transform,opacity" }) });
    $$(".e-reveal:not(.js-iv)", c).forEach((n) => setTimeout(() => n.classList.add("is-in"), 0));
    ScrollTrigger.refresh();
    startScroll();
  };

  /* Loading curtain — letters rise from below at .02s intervals (.5s delay, .5s), and once fully read they exit upward after .5s (.4s delay, .6s) and the curtain lifts in 1.2s.
     When entering the detail page directly, the product header panel lifts away instead of the curtain */
  const splash = $(".e-splash");
  const first = () => {
    const c = $('[data-barba="container"]');
    const item = nsOf(c) === "item";
    pre(c);
    init(c);
    if (reduce) { splash?.remove(); html.classList.add("is-ready"); gsap.set(c, { "--p2": 100 }); start(c); return; }
    const letters = splash ? $$(".e-splash__logo span", splash) : [];
    if (item) splash?.remove();
    else gsap.to(letters, { delay: 0.5, duration: 0.5, y: "0%", stagger: 0.02, ease: "power2.out" });
    // The original lifts the cover once it has received that page’s 6 photos (preloadCount(6)) — the copy has no photos to load, so it holds for as long as that wait lasted in the original
    // Set per page type, with values matched to when the curtain starts lifting in the original measurement (Hero 2.15s · list 1.75s · FAQ 1.52s · detail 1.9s)
    const hold = { item: 2000, page: 500 }[nsOf(c)] ?? 1100;
    const t0 = performance.now();
    const leave = () => setTimeout(() => {
      toTop();
      const done = () => { html.classList.add("is-ready"); start(c); };
      if (item) gsap.to(c, { duration: 1.2, "--p2": 100, ease: "circ.inOut", onComplete: done });
      else {
        gsap.to(letters, { delay: 0.4, duration: 0.6, y: "-120%", stagger: 0.02, ease: "power2.out" });
        gsap.to(splash, { duration: 1.2, clipPath: "inset(0% 0% 100% 0%)", ease: "power2.inOut", onComplete: done });
      }
    }, 500 + Math.max(0, hold - (performance.now() - t0)));
    if (document.readyState === "complete") leave(); else addEventListener("load", leave, { once: true });
  };

  /* Attach the next page’s css·js — only files used separately per page */
  const loadAssets = async (markup) => {
    const doc = new DOMParser().parseFromString(markup, "text/html");
    const have = (sel, attr, v) => $$(sel).some((n) => n.getAttribute(attr) === v);
    const css = $$('link[rel="stylesheet"]', doc).map((l) => l.getAttribute("href")).filter((h) => !have('link[rel="stylesheet"]', "href", h));
    const js = $$("script[src]", doc).map((s) => s.getAttribute("src")).filter((s) => !have("script[src]", "src", s));
    await Promise.all(css.map((h) => new Promise((r) => { const n = document.createElement("link"); n.rel = "stylesheet"; n.href = h; n.onload = n.onerror = r; document.head.append(n); })));
    for (const s of js) await new Promise((r) => { const n = document.createElement("script"); n.src = s; n.onload = n.onerror = r; document.body.append(n); });
    document.title = doc.title;
  };

  const mask = $('[data-fx~="row-mask-page"]');
  const shade = (c) => {
    const o = $(".e-pageshade", c);
    if (!o) return;
    gsap.set(o, { display: "block" });
    gsap.to(o, { duration: 0.8, opacity: 1 });
  };
  const boot = () => {
    first();
    if (!window.barba || location.protocol === "file:") return;
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.hooks.beforeLeave((d) => {
      html.classList.add("is-transition");
      menu.close();
      html.classList.remove("is-product-focus", "is-zoom-hover");
      stopScroll();
      if (d.trigger === "back") gsap.set(d.current.container, { position: "fixed", width: "100%", y: -scrollY });
    });
    // barba also calls beforeEnter on the first open (once), and resetting then undoes all the effects of the page just turned on. Only on a transition
    barba.hooks.beforeEnter(async (d) => {
      if (d.trigger === "barba" || !d.current?.container || d.current.container === d.next.container) return;
      ctx?.revert();
      ctx = null;
      await loadAssets(d.next.html);
      pre(d.next.container);
    });
    barba.hooks.after((d) => {
      html.classList.remove("is-transition");
      const c = d.next.container;
      startScroll();
      toTop();
      init(c);
      setTimeout(() => start(c), nsOf(c) === "item" ? 1000 : 800);
    });
    barba.init({
      timeout: 50000,
      preventRunning: true,
      transitions: [
        {
          name: "item-transition",
          to: { namespace: ["item"] },
          async leave(d) { shade(d.current.container); },
          async enter(d) {
            const c = d.next.container;
            gsap.set(c, { position: "fixed", top: 0, left: 0, width: "100%", zIndex: 100, "--p1": 100, "--p2": 0 });
            gsap.set(d.current.container, { display: "none" });
            await new Promise((r) => gsap.to(c, { duration: 1, "--p1": 0, ease: "circ.inOut", onComplete: r }));
            gsap.set(c, { clearProps: "position,top,left,width,zIndex" });
            gsap.to(c, { duration: 2, "--p2": 100, ease: "circ.inOut" });
          },
        },
        {
          name: "default-transition",
          async leave(d) { shade(d.current.container); await mask?.fxCover?.(); },
          enter(d) {
            gsap.set(d.current.container, { display: "none" });
            mask?.fxReveal?.();
          },
        },
      ],
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
