// Shared motion: Lenis (lerp .09, anchor −64px), header row (transparent over the stage → panel, hides on scroll down and returns on scroll up), mobile menu, float-up,
// Page transition (like the original Next.js, it doesn’t reopen the document and swaps only the body and footer — the header stays and changes from transparent over the stage → panel in .3s).
// Glow-lines stage (glow-lines-bend), logo band (marquee) and word highlight (char-highlight-scrub) are attached by the _fx part.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  let lenis = null, stHooked = false;
  if (!reduce.matches && window.Lenis) lenis = new Lenis({ autoRaf: true, lerp: 0.09, anchors: { offset: -64 }, syncTouch: false });
  const hookST = () => {
    if (lenis && window.ScrollTrigger && !stHooked) { lenis.on("scroll", ScrollTrigger.update); stHooked = true; }
  };
  hookST();
  window.exLenis = lenis;

  // Header row — when the bottom of the Hero stage (#hero-region) comes within header height (64px) a panel is laid down, and while it’s on, scrolling down hides it
  const head = document.querySelector(".ex-head");
  let hero = null, heroEnd = -1, lastY = scrollY, queued = false;
  const measure = () => { heroEnd = hero ? hero.getBoundingClientRect().bottom + scrollY : -1; };
  const update = () => {
    queued = false;
    if (!head) return;
    const y = scrollY;
    const solid = (heroEnd === -1 ? -1 : heroEnd - y) <= 64;
    const down = y > lastY;
    lastY = y;
    head.classList.toggle("is-clear", !solid);
    head.classList.toggle("is-hidden", solid && down);
  };
  const heroRO = new ResizeObserver(measure);
  const watchHero = () => {
    heroRO.disconnect();
    hero = document.getElementById("hero-region");
    if (hero) heroRO.observe(hero);
    measure();
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", () => { measure(); update(); });

  // Mobile menu — tap to open a panel under the header, closes on scroll, Esc or a wide screen
  const burger = document.querySelector(".ex-burger");
  const mnav = document.getElementById("ex-mnav");
  const setMenu = (open) => {
    if (!burger || !mnav) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    mnav.hidden = !open;
  };
  if (burger && mnav) {
    burger.addEventListener("click", () => setMenu(mnav.hidden));
    addEventListener("scroll", () => { if (!mnav.hidden) setMenu(false); }, { passive: true });
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    addEventListener("resize", () => { if (innerWidth >= 1024) setMenu(false); });
  }

  // Float-up — plays once when 15% is visible in the area minus the bottom 10% of the screen (delay comes from each element’s own style transition-delay)
  const io = reduce.matches ? null : new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.remove("is-pre"); io.unobserve(e.target); }
  }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
  const reveal = (root) => { if (io) root.querySelectorAll("[data-reveal]").forEach((el) => { el.classList.add("is-pre"); io.observe(el); }); };

  // Sticky column (original StickyColumn) — sticky on wide screens, top = min(96, screen height − column height − 24): if the column is long, its bottom sticks 24px from the bottom of the screen
  const stickRO = new ResizeObserver((es) => es.forEach((e) => place(e.target)));
  const place = (el) => { el.style.top = `${Math.min(96, innerHeight - el.offsetHeight - 24)}px`; };
  const sticky = () => { stickRO.disconnect(); document.querySelectorAll("[data-sticky-col]").forEach((el) => { place(el); stickRO.observe(el); }); };
  addEventListener("resize", () => document.querySelectorAll("[data-sticky-col]").forEach(place));
  const page = () => { watchHero(); update(); reveal(document); sticky(); };
  page();

  // ───── Page transition: .html links in the same folder are fetched and only the body and footer are swapped. Where fetching is impossible (file://) it just opens ─────
  const has = (sel, url) => [...document.querySelectorAll(sel)].some((n) => (n.href || n.src) === url);
  const load = (tag, url, attrs) => new Promise((ok) => {
    const n = document.createElement(tag);
    Object.assign(n, attrs);
    n.onload = n.onerror = ok;
    (tag === "link" ? document.head : document.body).append(n);
  });
  let busy = false, here = location.pathname;
  // Like the original Next.js, links are prefetched — loading starts on hover so it’s already there when pressed
  const cache = new Map();
  const get = (href) => {
    if (!cache.has(href)) cache.set(href, fetch(href).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); }).catch((e) => { cache.delete(href); throw e; }));
    return cache.get(href);
  };
  async function swap(url, push) {
    if (busy) return;
    busy = true;
    try {
      const doc = new DOMParser().parseFromString(await get(url.href.split("#")[0]), "text/html");
      for (const l of doc.querySelectorAll('head link[rel="stylesheet"]')) {
        const href = new URL(l.getAttribute("href"), url).href;
        if (!has('link[rel="stylesheet"]', href)) await load("link", href, { rel: "stylesheet", href });
      }
      document.dispatchEvent(new CustomEvent("ex:leave"));
      setMenu(false);
      document.title = doc.title;
      document.getElementById("main").replaceWith(document.adoptNode(doc.getElementById("main")));
      document.querySelector(".ex-end").replaceWith(document.adoptNode(doc.querySelector(".ex-end")));
      const links = [...doc.querySelectorAll(".ex-head a")];
      document.querySelectorAll(".ex-head a").forEach((a, i) => links[i] && a.setAttribute("href", links[i].getAttribute("href")));
      if (push) history.pushState({}, "", url.href);
      here = url.pathname;
      const target = url.hash && document.querySelector(url.hash);
      if (lenis) lenis.scrollTo(target || 0, { immediate: true, force: true, offset: target ? -64 : 0 });
      else if (target) target.scrollIntoView();
      else scrollTo(0, 0);
      lastY = scrollY;
      for (const s of doc.querySelectorAll("body script[src]")) {
        const src = new URL(s.getAttribute("src"), url).href;
        if (s.hasAttribute("data-page") || !has("script[src]", src)) await load("script", src, { src });
      }
      hookST();
      page();
      window.ScrollTrigger?.refresh();
    } catch {
      location.href = url.href;
    } finally {
      busy = false;
    }
  }
  const inside = (a) => {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return null;
    const url = new URL(a.href, location.href);
    return url.origin === location.origin && /\.html$/.test(url.pathname) && url.pathname !== location.pathname ? url : null;
  };
  if (location.protocol.startsWith("http")) {
    document.addEventListener("pointerover", (e) => { const url = inside(e.target.closest?.("a[href]")); if (url) get(url.href.split("#")[0]).catch(() => {}); }, { passive: true });
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = inside(e.target.closest("a[href]"));
      if (!url) return;
      e.preventDefault();
      swap(url, true);
    });
    addEventListener("popstate", () => { if (location.pathname !== here) swap(new URL(location.href), false); });
  }
})();
