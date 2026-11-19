/* Shared across pages — fixed photo strip on the right (slick fade), edge hover drawer, page title curtain wipe, page transitions (barba 2.9.7 + prefetch 2.1.10).
   The original motion uses Velocity 1.2.2 — the same bezier is made as a CustomEase and used in GSAP. */
(() => {
  const BP = 768;
  const isPc = () => innerWidth > BP;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(CustomEase);
  const E = {};
  [["outQuad", "0.25,0.46,0.45,0.94"], ["outCubic", "0.215,0.61,0.355,1"], ["inOutCubic", "0.645,0.045,0.355,1"],
    ["outQuart", "0.165,0.84,0.44,1"], ["inOutQuart", "0.76,0,0.24,1"], ["outQuint", "0.23,1,0.32,1"], ["inOutQuint", "0.86,0,0.07,1"]]
    .forEach(([k, v]) => (E[k] = CustomEase.create("mi-" + k, v)));
  const views = {};
  const MI = (window.MI = { E, isPc, reduce, views, view: (ns, v) => (views[ns] = v) });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nsOf = (c) => c?.dataset.barbaNamespace || "page";
  const fade = (t, opacity, duration, delay = 0, ease = "none", extra = {}) => { t = [].concat(t).filter(Boolean); if (t.length) gsap.to(t, { opacity, duration, delay, ease, overwrite: "auto", ...extra }); };

  /* Right Photo Strip */
  const $fix = window.jQuery && jQuery(".slider-fix");
  if ($fix?.length && !reduce) {
    $fix.slick({ fade: true, speed: 2000, responsive: [{ breakpoint: 768, settings: { speed: 1200 } }], autoplay: true, autoplaySpeed: 6000, pauseOnHover: false, pauseOnFocus: false, infinite: true, arrows: false, dots: false, centerMode: true, centerPadding: "0px", draggable: false, accessibility: false, swipe: false, swipeToSlide: false, touchMove: false });
    $fix.slick("slickGoTo", 0);
  }

  /* Drawer */
  const wrap = () => $(".btn-nav-wrap"), nav = () => $(".nav-fix"), top = () => $(".btn-nav-top");
  let navRight = -280;
  const navOpen = () => {
    gsap.killTweensOf([nav(), $(".inner", nav())]);
    top().classList.add("active");
    navRight = isPc() ? -280 : -innerWidth;
    gsap.set(nav(), { right: navRight });
    gsap.to(nav(), { right: 0, duration: 0.3, ease: E.outQuart });
    gsap.to($(".inner", nav()), { opacity: 1, duration: 0.25, delay: 0.1, ease: "none" });
    if (!isPc()) { wrap().classList.add("open"); MI.lockY = scrollY; document.body.classList.add("noscroll"); document.body.style.top = -MI.lockY + "px"; }
  };
  const navClose = () => {
    top().classList.remove("active");
    gsap.killTweensOf([nav(), $(".inner", nav())]);
    gsap.to($(".inner", nav()), { opacity: 0, duration: 0.1, ease: "none", onComplete: () => { $(".inner", nav()).scrollTop = 0; } });
    gsap.to(nav(), { right: navRight, duration: 0.3, ease: E.inOutCubic });
    if (!isPc() && document.body.classList.contains("noscroll")) { document.body.classList.remove("noscroll"); document.body.style.top = ""; scrollTo(0, MI.lockY || 0); }
    wrap().classList.remove("open");
  };
  MI.navClose = navClose;
  const w = wrap();
  w?.addEventListener("mouseenter", () => { if (isPc()) navOpen(); });
  w?.addEventListener("mouseleave", () => { if (isPc()) navClose(); });
  // The original flips the open state on press even on wide screens — a drawer opened by hover collapses when pressed
  top()?.addEventListener("click", () => { top().classList.contains("active") ? navClose() : navOpen(); });
  $(".btn-nav-btm")?.addEventListener("click", () => { gsap.to(top(), { opacity: 1, duration: 0.1 }); navOpen(); });

  /* Same-page section move .6s easeInOutCubic, accordion .3s */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a) {
      const t = a.getAttribute("href") === "#" ? document.documentElement : $(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      const y = t === document.documentElement ? 0 : t.getBoundingClientRect().top + scrollY;
      const o = { y: scrollY };
      gsap.to(o, { y, duration: reduce ? 0 : 0.6, ease: E.inOutCubic, onUpdate: () => scrollTo(0, o.y) });
      return;
    }
    const b = e.target.closest(".btn-ac");
    if (!b) return;
    const p = b.nextElementSibling; if (!p) return;
    const open = getComputedStyle(p).display === "none";
    gsap.killTweensOf(p);
    if (open) { gsap.set(p, { display: "block" }); gsap.from(p, { height: 0, duration: 0.3, ease: E.inOutCubic, overflow: "hidden", clearProps: "height,overflow" }); b.classList.add("active"); }
    else { gsap.to(p, { height: 0, duration: 0.3, ease: E.inOutCubic, overflow: "hidden", onComplete: () => gsap.set(p, { display: "none", clearProps: "height,overflow" }) }); b.classList.remove("active"); }
  });

  const wrapCls = () => { const el = $("#wrap"); el?.classList.toggle("pc", isPc()); el?.classList.toggle("sp", !isPc()); };
  addEventListener("resize", wrapCls);

  /* Original pageReady */
  const pageReady = (c) => {
    const ns = nsOf(c), head = $("header"), fix = $(".img-fix");
    document.body.className = ns === "top" ? "top" : ns;
    gsap.killTweensOf([head, ...$$(".btn-nav")]);
    if (ns === "top") {
      if (getComputedStyle(head).opacity !== "0") fade([head, top()], 0, 0.1);
      $$(".btn-nav").forEach((b) => b.classList.remove("on"));
    } else if (getComputedStyle(head).opacity === "0") {
      fade(head, 1, 0.2);
      if (top().classList.contains("not-first") || !isPc()) fade(top(), 1, 0.2);
      $$(".btn-nav").forEach((b) => b.classList.add("on"));
    }
    if (ns !== "top" && getComputedStyle(fix).opacity === "0") fade(fix, 1, 0.3, 0.3);
    else if (ns === "top" && getComputedStyle(fix).opacity === "1") fade(fix, 0, 0.1);
    fade($("#loading"), 0, 0.15, 0, "none", { onComplete: () => gsap.set($("#loading"), { display: "none" }) });
    const body = [$(".contents", c), $("footer", c)];
    if (reduce) gsap.set(body, { opacity: 1 }); else fade(body, 1, 0.3, 0.3);
    if (!reduce) {
      gsap.to($$(".title-page h1 .mask", c), { height: 0, duration: 0.45, delay: 0.6, ease: E.inOutCubic });
      gsap.to($$(".title-page em .mask", c), { height: 0, duration: 0.35, delay: 0.85, ease: E.outCubic });
    } else gsap.set($$(".title-page .mask", c), { height: 0 });
    // On wide screens, when a subpage first opens the drawer peeks out halfway (-135px), then slides in over .4s after 1.3s
    if (isPc()) {
      if (ns !== "top" && !top().classList.contains("not-first")) {
        top().classList.add("not-first", "peek");
        gsap.set([top(), nav()], { opacity: 0 }); gsap.set(nav(), { right: -135 });
        fade([top(), nav()], 1, 0.2, 0, E.outCubic);
        gsap.delayedCall(reduce ? 0 : 1.3, () => {
          top().classList.remove("peek");
          gsap.to(nav(), { right: -280, duration: 0.4, ease: E.inOutQuart, onComplete: () => wrap().classList.add("on") });
        });
      } else wrap().classList.toggle("on", ns !== "top");
    }
    views[ns]?.load?.(c);
  };

  // slick must have the shape (first page full width) in place before measuring width, so attach the body label first
  const enter = (c) => { document.body.className = nsOf(c) === "top" ? "top" : nsOf(c); views[nsOf(c)]?.enter?.(c); };

  const loadAssets = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const have = (sel, attr, v) => $$(sel).some((n) => n.getAttribute(attr) === v);
    const css = $$('link[rel="stylesheet"]', doc).map((l) => l.getAttribute("href")).filter((h) => !have('link[rel="stylesheet"]', "href", h));
    const js = $$("script[src]", doc).map((s) => s.getAttribute("src")).filter((s) => !have("script[src]", "src", s));
    await Promise.all(css.map((h) => new Promise((r) => { const n = document.createElement("link"); n.rel = "stylesheet"; n.href = h; n.onload = n.onerror = r; document.head.append(n); })));
    for (const s of js) await new Promise((r) => { const n = document.createElement("script"); n.src = s; n.onload = n.onerror = r; document.body.append(n); });
  };

  const boot = () => {
    wrapCls();
    const c = $('[data-barba="container"]');
    gsap.set([$(".contents", c), $("footer", c)].filter(Boolean), { opacity: 0 });
    enter(c);
    const ready = () => pageReady(c);
    if (document.readyState === "complete") ready(); else addEventListener("load", ready, { once: true });
    if (!window.barba || location.protocol === "file:") return;
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.init({
      timeout: 10000,
      transitions: [{
        name: "default-transition",
        // barba 2.9 does not count a transition without leave·enter as a page transition and refreshes instead
        leave() {},
        async beforeEnter(data) {
          const c2 = data.next.container;
          gsap.set([$(".contents", c2), $("footer", c2)].filter(Boolean), { opacity: 0 });
          await loadAssets(data.next.html);
        },
        enter() {},
        async afterLeave(data) {
          $("#wrap").classList.add("transition");
          if (top().classList.contains("active")) navClose();
          views[nsOf(data.current.container)]?.leave?.(data.current.container);
          const toTop = /index\.html$|\/$/.test(data.next.url.path || "");
          fade([$(".contents", data.current.container), $("footer", data.current.container)], 0, 0.3, 0, "none", { onComplete: () => scrollTo(0, 0) });
          if (toTop) { $("#loading").classList.remove("left"); fade($(".img-fix"), 0, 0.3); }
          else {
            $("#loading").classList.add("left");
            gsap.set($("#loading"), { display: "block" }); fade($("#loading"), 1, 0.15, 0.2);
            if (scrollY > 105) fade($("header"), 0, 0.1);
          }
          await Promise.all([new Promise((r) => setTimeout(r, 600)), loadAssets(data.next.html)]);
        },
        after(data) {
          const c2 = data.next.container;
          gsap.set([$(".contents", c2), $("footer", c2)].filter(Boolean), { opacity: 0 });
          enter(c2);
          pageReady(c2);
          $("#wrap").classList.remove("transition");
          const anchor = location.hash && $(location.hash);
          if (anchor) { const o = { y: scrollY }; gsap.to(o, { y: anchor.getBoundingClientRect().top + scrollY, duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 1.2, ease: E.inOutQuint, onUpdate: () => scrollTo(0, o.y) }); }
        },
      }],
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
