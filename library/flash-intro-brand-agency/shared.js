// Shared by the whole site: original libraries as they are — page transitions barba 2.10.3 · smooth scroll Lenis 1.3.27 · news dragging smooothy(MIT).
// Original curves main(.44,.01,0,1), reveal(.53,.02,0,.99) and slow-out(.19,1,.22,1) are kept as CustomEase under the same names.
(() => {
  const BP = (window.BP = window.BP || {});
  gsap.registerPlugin(ScrollTrigger, CustomEase, ...(window.Flip ? [Flip] : []));
  CustomEase.create("main", "0.44, 0.01, 0, 1");
  CustomEase.create("reveal", "0.53, 0.02, 0, 0.99");
  CustomEase.create("slow-out", "0.19, 1, 0.22, 1");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  BP.reduced = reduced;
  BP.isMobile = () => innerWidth <= 767;

  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis();
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);
  }
  BP.lenis = lenis;
  BP.lock = () => lenis && lenis.stop();
  BP.unlock = () => lenis && lenis.start();
  BP.scrollTo = (y, o = {}) => (lenis ? lenis.scrollTo(y, { force: true, ...o }) : scrollTo(0, typeof y === "number" ? y : 0));

  // Page script registration: BP.page(ns, { intro(box, first) → timeline, ready(box, first) → release })
  const parts = [];
  BP.page = (ns, part) => parts.push({ ns, ...part });
  const run = (box, k, ...a) => parts.filter((p) => p[k] && (p.ns === "*" || p.ns === box.dataset.barbaNamespace)).map((p) => p[k](box, ...a));
  const container = () => document.querySelector('[data-barba="container"]');
  let cleanups = [];

  const navOf = { home: "home", works: "work", detail: "work", news: "news", article: "news" };
  function setCurrent(ns) {
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("is-current", a.dataset.nav === navOf[ns]));
  }

  // Original data-reveal-line: when it reaches 45% of the screen, the line rises from 120% below over .8s power4.out (.1 stagger), and reverses when scrolled back up
  function lines(box) {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      box.querySelectorAll("[data-reveal-group]").forEach((g) => {
        const items = g.querySelectorAll("[data-reveal-line]");
        gsap.set(items, { yPercent: 120 });
        ScrollTrigger.create({ trigger: g, start: "top 45%", onEnter: () => gsap.to(items, { yPercent: 0, stagger: 0.1, duration: 0.8, ease: "power4.out", overwrite: true }) });
        ScrollTrigger.create({ trigger: g, start: "top 80%", onLeaveBack: () => gsap.set(items, { yPercent: 120, overwrite: true }) });
      });
    });
    return () => mm.revert();
  }

  // Original Footer.footerScroll: while passing the Footer, the two halves of the wordmark spread to -51% · +50%, the center panel rises from below, and the big B goes -2vw→-25.5vw
  function footer() {
    const f = document.querySelector(".bp-footer");
    if (!f || reduced) return () => {};
    const tl = gsap.timeline({ scrollTrigger: { trigger: f, start: "top bottom", end: "bottom bottom", scrub: true } });
    tl.fromTo(f.querySelector(".bp-footer__half.--l"), { xPercent: 0 }, { xPercent: -51, duration: 5, ease: "power1.out" }, 0);
    tl.fromTo(f.querySelector(".bp-footer__half.--r"), { xPercent: 0 }, { xPercent: 50, duration: 5, ease: "power1.out" }, 0);
    tl.fromTo(f.querySelector(".bp-footer__grid"), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 2, ease: "linear" }, 0.5);
    const b = gsap.fromTo(f.querySelector(".bp-footer__shape"), { y: "-2vw" }, { y: "-25.5vw", ease: "linear", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom bottom", scrub: true } });
    return () => { tl.scrollTrigger.kill(); tl.revert(); b.scrollTrigger.kill(); b.revert(); };
  }

  function mount(box, first) {
    document.body.dataset.page = box.dataset.barbaNamespace;
    setCurrent(box.dataset.barbaNamespace);
    cleanups = [lines(box), footer(), ...run(box, "ready", first)].filter((f) => typeof f === "function");
    ScrollTrigger.refresh();
  }
  const unmount = () => cleanups.splice(0).forEach((f) => f());

  const curtain = document.querySelector(".bp-curtain");
  function enter(box, first) {
    const tl = gsap.timeline();
    if (!first && curtain && !reduced) tl.fromTo(curtain, { yPercent: 0 }, { yPercent: -100, duration: 1, ease: "reveal" }, 0);
    const got = reduced ? [] : run(box, "intro", first).filter(Boolean);
    if (got[0]) tl.add(got[0], first ? 0 : 0.2);
    else if (!reduced) tl.from(box, { opacity: 0, duration: 0.6, ease: "slow-out" }, first ? 0 : 0.3);
    return tl;
  }
  function leave() {
    BP.lock();
    if (reduced || !curtain) return gsap.timeline();
    return gsap.timeline().fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "main" });
  }

  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    have.forEach((l) => want.includes(l.href) || l.remove());
    return Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
      const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
      l.onload = l.onerror = res;
      document.head.append(l);
    })));
  };
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "");

  function start() {
    const box = container();
    const first = () => {
      mount(box, true);
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
        document.documentElement.classList.add("bp-loaded");
        enter(box, true);
      });
    };
    document.readyState === "complete" ? first() : addEventListener("load", first);
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        preventRunning: true,
        prevent: ({ el }) => !el || el.tagName !== "A" || !own(el.getAttribute("href")),
        transitions: [{
          name: "default",
          leave: () => leave(),
          beforeEnter: async ({ current, next }) => {
            unmount();
            current.container.style.display = "none";
            await sheets(next.html);
            BP.scrollTo(0, { immediate: true });
            scrollTo(0, 0);
            mount(next.container, false);
          },
          enter: ({ next }) => enter(next.container, false).eventCallback("onComplete", () => BP.unlock()),
        }],
      });
      return;
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank" || !own(a.getAttribute("href"))) return;
      e.preventDefault();
      leave().eventCallback("onComplete", () => (location.href = a.getAttribute("href")));
    });
    addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
