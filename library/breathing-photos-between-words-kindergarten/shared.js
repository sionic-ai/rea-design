// Shared by all pages — smooth scroll (Lenis 1.2), line rise-in, photo parallax, header line pill and hide, menu panel, page transition (barba 2.10.3 blur swap), first-open curtain.
// Interaction, strips, shapes and photo swaps are attached by the motion part (_fx) through data-fx — here we only attach and release them per section (container).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const narrow = () => innerWidth <= 1023;
  const root = document.documentElement;
  const ENTERED = "pk-entered";

  // ── Smooth scroll: original duration 1.2 · 1 − 2^(−10t)
  const lenis = !reduce && window.Lenis ? new Lenis({ duration: 1.2, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 2 }) : null;
  if (lenis) { const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  const scrollTo = (target, immediate) => (lenis ? lenis.scrollTo(target, { immediate }) : (typeof target === "number" ? window.scrollTo(0, target) : target.scrollIntoView()));

  // When moving down, the header row hides (direction flips only when movement exceeds 1px)
  let lastY = scrollY;
  const direction = () => {
    const d = scrollY - lastY;
    if (Math.abs(d) > 1) root.setAttribute("data-direction", d > 0 ? "down" : "up");
    lastY = scrollY;
  };

  // ── Line rise-in: each chunk gets a staggered piece (.d — original js-visible__d) with .08s stagger + data-delay set as a delay — the inner chunk overwrites later so it keeps its own turn
  let io = null;
  const reveals = (box) => {
    const vs = [...box.querySelectorAll(".pk-v")];
    vs.forEach((v) => [...v.querySelectorAll(".d")].forEach((d, i) => (d.style.transitionDelay = `${i * 0.08 + Number(d.dataset.delay ?? 0)}s`)));
    io?.disconnect();
    io = new IntersectionObserver((es) => es.forEach((e) => { e.target.dataset.visible = e.isIntersecting ? 1 : 0; if (e.isIntersecting) e.target.dataset.shown = 1; }), { threshold: 0.1 });
    vs.forEach((v) => { v.dataset.shown = v.dataset.shown || 0; io.observe(v); });
  };

  // ── Photo reveal: adds is-loaded to placeholders that enter the screen and turns them on in 1s (the original adds it when the image has fully arrived)
  let imgIo = null;
  const images = (box) => {
    imgIo?.disconnect();
    imgIo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-loaded"); imgIo.unobserve(e.target); } }), { threshold: 0 });
    box.querySelectorAll(".pk-ph:not(.is-loaded)").forEach((p) => imgIo.observe(p));
  };

  // ── Photo parallax: original koalaParallax as is — shift is set by cell top edge (s) and height (a), and with data-scale 1 it is scaled 1.2× and shifted around the screen center
  let pars = [];
  const parallax = (box) => { pars = [...box.querySelectorAll(".pk-p-wrap")].map((w) => ({ w, item: w.querySelector(".pk-p-item") })).filter((p) => p.item); };
  const updateParallax = () => {
    if (reduce) return;
    const e = innerHeight;
    for (const { w, item } of pars) {
      const r = w.getBoundingClientRect(), s = r.top, a = r.height;
      if (!(e > s && s + a > 0)) continue;
      let u = Number(item.dataset.pow ?? -0.3);
      const d = Number(item.dataset.scale ?? 0);
      if (touch) u = 0.8 * u * 0.7;
      const h = Math.max(0, Math.min(100, (-s / (s + 2 * a)) * 100));
      const t = d === 1 ? `translateY(${Math.floor((s - e / 2) * u * 1.1)}px) scale(1.2)` : `translateY(${Math.floor(s * u)}px) scale(${1 - ((100 - h) / 1000) * (-0.5 + d)})`;
      if (item.style.transform !== t) item.style.transform = t;
    }
  };
  let ticking = false;
  addEventListener("scroll", () => {
    direction();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; updateParallax(); });
  }, { passive: true });
  addEventListener("resize", () => setTimeout(updateParallax, 200));

  // ── Header-row pill: appears .3s later under the current page item, and slides in .5s under the item the pointer hovers
  const pill = document.querySelector(".pk-header__pill");
  const navItems = [...document.querySelectorAll(".pk-header__nav li")];
  let current = null, transitioning = false;
  const pillTo = (li) => {
    if (!pill) return;
    if (!li) { pill.style.bottom = "-10px"; return; }
    pill.style.width = `${li.querySelector("a").clientWidth}px`;
    pill.style.left = `${li.getBoundingClientRect().left}px`;
    pill.style.bottom = "-4px";
  };
  const setPage = (ns, first) => {
    current = navItems.find((li) => li.querySelector("a").dataset.to === ns) || null;
    document.querySelectorAll("a[data-to]").forEach((a) => a.classList.toggle("is-nav", a.dataset.to === ns));
    if (first) {
      if (current) { pill.style.width = `${current.querySelector("a").clientWidth}px`; pill.style.left = `${current.getBoundingClientRect().left}px`; }
      else pill.style.bottom = "-10px";
      setTimeout(() => { pill.style.opacity = 1; if (current) pill.style.bottom = "-4px"; }, 300);
    } else pillTo(current);
  };
  // If the font arrives late, the pill width first measured no longer fits the text width, once everything is loaded, refit to the current item
  document.fonts?.ready.then(() => !transitioning && current && pillTo(current));
  navItems.forEach((li) => {
    li.addEventListener("mouseenter", () => !transitioning && pillTo(li));
    li.addEventListener("mouseleave", () => !transitioning && pillTo(current));
  });

  // ── Menu plate: clip inset opens top to bottom in .5s, on wide screens the header row fades in .3s (on narrow ones the plate background turns on in .3s) ──
  const menu = document.querySelector(".pk-menu"), wrap = menu?.querySelector(".pk-menu__wrap"), btn = menu?.querySelector(".pk-menu__button");
  const header = document.querySelector(".pk-header"), menuBg = menu?.querySelector(".pk-menu__bg");
  const flag = { open: false, busy: false };
  const openMenu = () => {
    if (flag.open || flag.busy) return;
    flag.open = flag.busy = true;
    root.classList.add("is-menu-open"); menu.classList.add("is-open"); btn.classList.add("is-open"); wrap.classList.add("is-open"); wrap.classList.remove("is-hidden");
    btn.setAttribute("aria-expanded", "true");
    gsap.killTweensOf([wrap, header]);
    gsap.fromTo(wrap, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, onComplete: () => (flag.busy = false) });
    // The original header bar starts fading about .1s after the panel begins opening and is fully faded around .43s — measured the overlap of GSAP .3s and the header CSS transition .3s, matched with delay .05s · length .26s
    if (!narrow()) gsap.fromTo(header, { opacity: 1 }, { opacity: 0, duration: 0.26, delay: 0.05 });
    else gsap.fromTo(menuBg, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  };
  const closeMenu = () => {
    if (!flag.open || flag.busy) return;
    flag.open = false; flag.busy = true;
    root.classList.remove("is-menu-open"); menu.classList.remove("is-open"); btn.classList.remove("is-open"); wrap.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    gsap.killTweensOf([wrap, header]);
    gsap.fromTo(wrap, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.5, onComplete: () => (flag.busy = false) });
    if (!narrow()) gsap.fromTo(header, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    setTimeout(() => !flag.open && wrap.classList.add("is-hidden"), 500);
  };
  btn?.addEventListener("click", () => (flag.open ? closeMenu() : openMenu()));
  menu?.querySelector(".pk-menu__close")?.addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  // Word button — on touch screens you must press to unfold another word. There is no other word board, so the page stays the same
  const lang = document.querySelector(".pk-lang");
  if (lang && touch) lang.addEventListener("touchstart", () => lang.classList.toggle("is-langopen"), { passive: true });
  lang?.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  // Same-page # links glide there via Lenis
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const el = id && document.getElementById(id);
    if (a.dataset.top !== undefined) scrollTo(0);
    else if (el) scrollTo(el);
  });
  // A link to the current page does nothing (the original sameLink) — it is blocked first so barba doesn’t take it and reopen the whole page
  const bare = (u) => u.replace(/#.*$/, "").replace(/\/(index\.html)?$/, "");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.getAttribute("href").startsWith("#") || a.hash) return;
    if (bare(a.href) === bare(location.href)) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // ── Down · up pill: on hover the hidden arrow above rolls down one cell in .5s and the visible arrow in 1s, on release those two roll down again (1s · .5s) back into place
  const scrollRolls = (box) => {
    if (touch || reduce) return;
    box.querySelectorAll(".pk-scroll").forEach((a) => {
      const o = a.querySelector(".pk-scroll__o"), t = a.querySelector(".pk-scroll__t");
      if (!o || !t) return;
      a.addEventListener("mouseenter", () => { if (narrow()) return; gsap.killTweensOf([o, t]); gsap.fromTo(o, { yPercent: 0 }, { yPercent: 100, duration: 0.5 }); gsap.fromTo(t, { yPercent: 0 }, { yPercent: 100, duration: 1 }); });
      a.addEventListener("mouseleave", () => { if (narrow()) return; gsap.killTweensOf([o, t]); gsap.fromTo(o, { yPercent: 100 }, { yPercent: 200, duration: 1 }); gsap.fromTo(t, { yPercent: -100 }, { yPercent: 0, duration: 0.5 }); });
    });
  };

  // ── Job fold: pressing the head opens the panel to its own height (--h) in .3s, .1s later the button turns gray in .4s and the + vertical bar folds away
  const accordions = (box) => box.querySelectorAll("[data-acc]").forEach((acc) => {
    const head = acc.querySelector(".pk-acc__head"), content = acc.querySelector(".pk-acc__content"), item = acc.querySelector(".pk-acc__item");
    const measure = () => content.style.setProperty("--h", `${item.clientHeight}px`);
    measure();
    new ResizeObserver(measure).observe(item);
    let open = false;
    const toggle = () => {
      open = !open;
      head.setAttribute("aria-expanded", String(open));
      content.classList.toggle("is-hidden", !open);
      setTimeout(() => acc.classList.toggle("is-open", open), 100);
    };
    head.addEventListener("click", toggle);
    head.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle()));
  });

  // ── Attach section (container)
  const mount = (box, firstOpen) => {
    images(box);
    accordions(box);
    scrollRolls(box);
    parallax(box);
    setTimeout(updateParallax, 50);
    // On first open, hang the line rise 1 second later while the curtain lifts (original _DETECT.once)
    if (firstOpen) setTimeout(() => reveals(box), 1000); else reveals(box);
    setPage(box.dataset.barbaNamespace, firstOpen);
    const hash = location.hash.slice(1), at = hash && box.querySelector(`#${CSS.escape(hash)}`);
    if (at) setTimeout(() => scrollTo(at, true), 60);
  };

  // ── First-open curtain: pages arriving from within the site (when opened via file://) skip the curtain and fade in
  const loader = document.querySelector(".pk-loader");
  const cameIn = sessionStorage.getItem(ENTERED) === "1";
  sessionStorage.removeItem(ENTERED);
  if (cameIn && loader) loader.remove();
  // At the end of the curtain (fx:reveal) the Hero photo settles from 1.05x scale and brightness 1.5 over 2·3s expo.out
  document.addEventListener("fx:reveal", () => {
    const ph = document.querySelectorAll("[data-barba='container'] .pk-bg .pk-ph");
    if (!ph.length) return;
    gsap.from(ph, { scale: 1.05, duration: 2, ease: "expo.out" });
    gsap.from(ph, { scale: 1.05, filter: "brightness(1.5)", duration: 3, ease: "expo.out" });
  });

  // ── Page transition (original barba 2.10.3 + prefetch 2.2.0): the old section blurs out in .4s, and .2s later the new one turns on in 1s. The old section is removed at 2.2s when everything ends
  // The old section starts blurring the moment it is pressed — the original starts after the next page is received (tens of ms), so the copy must not be later than that while it checks the skin
  let leftAt = 0;
  const fadeOld = (oldBox) => { leftAt = performance.now(); if (oldBox) gsap.fromTo(oldBox, { opacity: 1 }, { opacity: 0, duration: 0.4 }); };
  const crossfade = (newBox) => new Promise((done) => {
    if (flag.open) { flag.busy = false; closeMenu(); }
    const since = leftAt ? (performance.now() - leftAt) / 1000 : 0;
    gsap.fromTo(newBox, { opacity: 0 }, { opacity: 1, duration: 1, delay: Math.max(0, 0.2 - since) });
    gsap.delayedCall(Math.max(0, 2.2 - since), () => { root.classList.remove("is-transition"); done(); });
  });
  const parse = (html) => new DOMParser().parseFromString(html, "text/html");
  const bringSheets = async (doc) => {
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    await Promise.all(want.filter((h) => !have.includes(h)).map((href) => new Promise((r) => { const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r }); document.head.append(l); })));
  };

  const plainNav = (box) => {
    // On file:// Barba cannot fetch the next page — fade the old section out in .4s, then navigate normally, and the new page turns on in 1s without a curtain
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(#[\w-]+)?$/.test(href)) return;
      e.preventDefault();
      if (a.pathname === location.pathname) { const id = href.split("#")[1]; const el = id && document.getElementById(id); el ? scrollTo(el) : scrollTo(0); return; }
      transitioning = true;
      root.classList.add("is-transition");
      lenis?.stop();
      if (flag.open) { flag.busy = false; closeMenu(); }
      gsap.to(box, { opacity: 0, duration: 0.4, onComplete: () => { sessionStorage.setItem(ENTERED, "1"); location.href = href; } });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { gsap.set(box, { opacity: 1 }); root.classList.remove("is-transition"); lenis?.start(); transitioning = false; } });
  };

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    if (!first) return;
    if (cameIn && !reduce) gsap.fromTo(first, { opacity: 0 }, { opacity: 1, duration: 1 });
    mount(first, !cameIn);
    if (!window.barba || !/^https?:$/.test(location.protocol)) return plainNav(first);
    history.scrollRestoration = "manual";
    barba.use(barbaPrefetch);
    barba.hooks.before(({ current }) => { transitioning = true; root.classList.add("is-transition"); fadeOld(current?.container); });
    barba.hooks.after(() => { transitioning = false; root.classList.remove("is-transition"); });
    barba.init({
      timeout: 5000,
      prevent: ({ el }) => !!el.closest(".wf-ui") || el.getAttribute("href")?.startsWith("#"),
      transitions: [{
        name: "fade",
        beforeEnter: async ({ current, next }) => {
          await bringSheets(parse(next.html));
          document.title = parse(next.html).title;
          if (current?.container) gsap.set(current.container, { position: "fixed", top: -scrollY, left: 0, right: 0, zIndex: 200 });
          gsap.set(next.container, { opacity: 0 });
          lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
          lastY = 0;
          mount(next.container, false);
        },
        enter: ({ next }) => crossfade(next.container),
      }],
    });
  };
  const boot = () => requestAnimationFrame(start);
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
})();
