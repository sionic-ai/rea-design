// Spanning several pages: ScrollSmoother (1024↑ smooth 1·effects), header bar (cart drawer · phone menu), endless text band, newsletter curtain after 3s,
// Page transition (body, footer and ribbon fade out at .3s power1.out, only the body is swapped, then it fades in at the top at .3s power1.in — original page-transition).
// Page scripts register with PV.page(name, enable), and enable runs inside gsap.context so everything is cleaned up at once on navigation.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
  CustomEase.create("pv", "M0,0 C0.25,0.1 0.25,1 1,1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DESK = 1024;
  const pages = {};
  let current = null;
  const PV = (window.PV = { reduce, DESK, page(name, init) { pages[name] = init; }, smoother: null });
  const root = document.documentElement;

  // ── Smooth scroll: only at 1024 and up (original createSmoothScroller) ──
  const smooth = () => {
    if (innerWidth >= DESK && !PV.smoother && !reduce) {
      PV.smoother = ScrollSmoother.create({ wrapper: "#pv-smooth", content: "#pv-content", smooth: 1, smoothTouch: 1, effects: true });
    } else if (innerWidth < DESK && PV.smoother) {
      PV.smoother.kill();
      PV.smoother = null;
    }
  };
  smooth();
  addEventListener("resize", smooth);
  PV.toTop = () => (PV.smoother ? PV.smoother.scrollTo(0) : scrollTo(0, 0));

  // ── Header row: cart drawer · phone menu ──
  document.querySelector("[data-bag]").addEventListener("click", (e) => {
    e.preventDefault();
    root.classList.remove("pv-menu-open");
    root.classList.toggle("pv-bag-open");
  });
  document.querySelector("[data-menu]").addEventListener("click", (e) => {
    e.preventDefault();
    root.classList.remove("pv-bag-open");
    root.classList.toggle("pv-menu-open");
  });

  // ── Phrase strip: one loop per one-copy width, 45s on desktop · 30s on phone ──
  const marquee = document.querySelector("[data-marquee]");
  let mq = null;
  const runMarquee = () => {
    if (!marquee || reduce) return;
    if (mq) mq.kill();
    const text = marquee.querySelector(".pv-marquee__text");
    mq = gsap.fromTo(marquee, { x: 0 }, { x: -text.offsetWidth, duration: innerWidth < DESK ? 30 : 45, ease: "none", repeat: -1 });
  };
  runMarquee();
  addEventListener("resize", () => { clearTimeout(runMarquee.t); runMarquee.t = setTimeout(runMarquee, 200); });

  // ── Newsletter curtain: on first visit, or if not subscribed and 5 days (432e6ms) have passed, after 3 seconds ──
  const news = document.querySelector("[data-news]");
  if (news) {
    const KEY = "pv-news-shown";
    const last = +localStorage.getItem(KEY) || 0;
    const close = () => { news.classList.remove("is-on"); localStorage.setItem(KEY, Date.now()); };
    if (!last || Date.now() - last > 432e6) setTimeout(() => news.classList.add("is-on"), 3000);
    news.querySelector("[data-news-close]").addEventListener("click", close);
    news.addEventListener("click", (e) => { if (e.target === news) close(); });
  }

  // ── Photo transitions (original image-scroll): keep the big copy stuck until the end of the section, and for each photo while it passes from the bottom to the top of the screen .8→1 (power1.out)→.8 (power1.in),
  // The last photo stops at 1 when it reaches the center ──
  PV.imageScroll = (sec) => {
    if (!sec) return null;
    const text = sec.querySelector("[data-iscroll-text]"), imgs = [...sec.querySelectorAll("[data-iscroll-img]")];
    sec.querySelector(".pv-iscroll__imgs").style.opacity = "1";
    if (reduce) { gsap.set(imgs, { scale: 1 }); return null; }
    const made = [ScrollTrigger.create({ trigger: sec, start: "top top", end: () => `bottom top+=${text.offsetHeight}`, pin: text })];
    imgs.forEach((im, i) => {
      const last = i === imgs.length - 1;
      const tl = gsap.timeline({ scrollTrigger: { trigger: im, start: "top bottom", end: last ? "center center" : "bottom top", scrub: true } }).to(im, { ease: "power1.out", scale: 1 });
      if (!last) tl.to(im, { ease: "power1.in", scale: 0.8 });
      made.push(tl.scrollTrigger, tl);
    });
    return () => made.forEach((m) => m.kill());
  };

  // ── Page Turn ──
  const view = () => document.querySelector("[data-view]");
  const fades = () => [view(), ...document.querySelectorAll("[data-pv-fade]")];
  const setNav = (name) => {
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === name));
  };
  const run = (el) => {
    const name = el.dataset.page;
    setNav(name);
    const ctx = gsap.context(() => { if (pages[name]) current = { name, off: pages[name](el) }; }, el);
    current = { ...(current || {}), ctx };
    ScrollTrigger.refresh();
  };
  const here = (href) => new URL(href, location.href);
  const sameSite = (u) => u.origin === location.origin && /\.html$/.test(u.pathname) && u.pathname.replace(/[^/]*$/, "") === location.pathname.replace(/[^/]*$/, "");
  const loadAssets = async (doc) => {
    const have = new Set([...document.querySelectorAll("link[rel=stylesheet], script[src]")].map((n) => n.href || n.src));
    await Promise.all([...doc.querySelectorAll("link[rel=stylesheet]")].map((l) => here(l.getAttribute("href")).href).filter((h) => !have.has(h))
      .map((h) => new Promise((r) => { const n = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h }); n.onload = n.onerror = r; document.head.append(n); })));
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = here(s.getAttribute("src")).href;
      if (have.has(src)) continue;
      await new Promise((r) => { const n = Object.assign(document.createElement("script"), { src }); n.onload = n.onerror = r; document.body.append(n); });
    }
  };
  let busy = false;
  const go = async (url, push) => {
    if (busy) return;
    if (location.protocol === "file:") { location.href = url.href; return; }
    busy = true;
    root.classList.remove("pv-bag-open", "pv-menu-open");
    const out = new Promise((r) => (reduce ? r() : gsap.fromTo(fades(), { opacity: 1 }, { duration: 0.3, ease: "power1.out", opacity: 0, onComplete: r })));
    let doc;
    try { doc = new DOMParser().parseFromString(await (await fetch(url.href)).text(), "text/html"); } catch (e) { location.href = url.href; return; }
    const next = doc.querySelector("[data-view]");
    if (!next) { location.href = url.href; return; }
    await Promise.all([out, loadAssets(doc)]);
    if (current) { current.off && current.off(); current.ctx && current.ctx.revert(); }
    if (push) history.pushState({ pv: 1 }, "", url.href);
    document.title = doc.title;
    const fresh = document.importNode(next, true);
    view().replaceWith(fresh);
    PV.toTop();
    run(fresh);
    if (reduce) { busy = false; return; }
    gsap.fromTo(fades(), { opacity: 0 }, { duration: 0.3, ease: "power1.in", opacity: 1, onComplete: () => { busy = false; } });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank" || a.hasAttribute("data-no-swap")) return;
    const url = here(a.getAttribute("href"));
    if (!sameSite(url) || url.pathname === location.pathname) return;
    e.preventDefault();
    go(url, true);
  });
  addEventListener("popstate", () => go(here(location.href), false));

  const start = () => run(view());
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else queueMicrotask(start);
})();
