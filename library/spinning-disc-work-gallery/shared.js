// Shared by three pages — Lenis (lerp .165 · wheel 1.25x), letter-roll hover wrapping, nav (current page dot · list drawer · scroll bar · text change),
// Changes nav text color by section, and handles the barba 2.10.3 transition (Work ↔ TV disc flip · press a disc to open detail · return from detail · default opacity).
// Page scripts are registered with A24.page(name, attach), attach when the box enters and detach when it leaves.
(() => {
  const A = (window.A24 ||= {});
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("main", "0.625, 0.05, 0, 1");
  CustomEase.create("energy", "M0,0 C0.32,0.72 0,1 1,1");
  CustomEase.create("discGlide", "0.32, 0.72, 0, 1");
  gsap.defaults({ ease: "main", duration: 0.6 });
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  A.q = q; A.qa = qa;
  A.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  A.coarse = matchMedia("(pointer: coarse)").matches;
  A.pages = {};
  A.page = (name, fn) => { A.pages[name] = fn; };

  // ── Smooth Scroll
  if (window.Lenis && !A.reduce) {
    A.lenis = new Lenis({ lerp: A.coarse ? 1 : 0.165, wheelMultiplier: A.coarse ? 1 : 1.25, touchMultiplier: 1, allowNestedScroll: true });
    A.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => A.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  history.scrollRestoration = "manual";

  // ── Letter roll hover: wraps each letter inside [data-hover] in two layers (current letter · same letter dropping in from below)
  A.hoverWrap = (root = document) => {
    qa("[data-hover]", root).forEach((n) => {
      if (n.dataset.hoverReady) return;
      n.dataset.hoverReady = "1";
      // The displayed text box becomes the outer (inner) of the two layers — same depth as the original (link > Outside > Characters)
      const t = q("[data-hover-target]", n);
      if (!t) return;
      const text = document.createElement("span");
      text.setAttribute("data-hover-text", "");
      while (t.firstChild) text.append(t.firstChild);
      t.setAttribute("data-hover-inner", "");
      t.setAttribute("data-text", text.textContent.trim());
      t.append(text);
    });
  };

  // ── Line reveal: put letters in a line box and raise them with yPercent (original data-reveal)
  A.lineWrap = (el) => {
    if (!el || el.dataset.lined) return el ? qa(":scope > [data-line-mask] > span", el) : [];
    el.dataset.lined = "1";
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map((l) => `<span data-line-mask><span>${l}</span></span>`).join("");
    return qa(":scope > [data-line-mask] > span", el);
  };
  A.setText = (el, html) => {
    if (!el) return [];
    el.dataset.lined = "";
    el.innerHTML = html;
    return A.lineWrap(el);
  };

  // ── Nav
  const nav = q("[data-nav]");
  const list = q(".a-nav__list", nav);
  const dot = q(".a-nav__dot", nav);
  const dropdown = q(".a-nav__dropdown", nav);
  const scroller = q(".a-nav__scroll", nav);
  const bar = q(".a-nav__bar", nav);
  const thumb = q(".a-nav__bar-thumb", nav);
  const rows = qa(".a-nav__row", nav);
  const moveDot = (instant) => {
    const cur = q('.a-nav__link[data-nav-page="current"]', nav);
    if (!cur || !dot) { dot?.classList.remove("is-on"); return; }
    const lr = list.getBoundingClientRect(), r = cur.getBoundingClientRect();
    gsap.to(dot, { x: r.left - lr.left + r.width / 2, y: r.bottom - lr.top - 2, duration: instant ? 0 : 0.62, ease: "energy" });
    dot.classList.add("is-on");
  };
  A.navPage = (ns) => {
    const key = ns === "television" ? "television" : ns === "films" ? "films" : "";
    qa(".a-nav__link[data-nav-key]", nav).forEach((a) => a.setAttribute("data-nav-page", key ? (a.dataset.navKey === key ? "current" : "other") : "none"));
    q(".a-nav__index-li", nav)?.toggleAttribute("hidden", ns === "production");
    moveDot(!A.navReady);
    A.navReady = true;
  };
  // Phone dock width fits the text width
  const dockWidth = () => {
    if (!nav) return;
    const w = list.scrollWidth + 16;
    nav.style.setProperty("--nav-dock-width", `${Math.ceil(w)}px`);
  };
  const thumbSync = () => {
    if (!scroller || !thumb) return;
    const max = scroller.scrollHeight - scroller.clientHeight;
    const ratio = Math.max(0.2, scroller.clientHeight / scroller.scrollHeight);
    const h = bar.clientHeight * ratio;
    thumb.style.height = `${h}px`;
    thumb.style.transform = `translateY(${max > 0 ? (scroller.scrollTop / max) * (bar.clientHeight - h) : 0}px)`;
    bar.classList.toggle("is-disabled", max <= 0);
  };
  scroller?.addEventListener("scroll", thumbSync, { passive: true });
  // Original: on open, line text rises from 130% below in .55s, the line background in .34s, and the year from 125% below in .26s
  const openDrop = (open) => {
    if (!nav) return;
    const was = nav.dataset.navDropdown === "open";
    if (open === was) return;
    nav.dataset.navDropdown = open ? "open" : "closed";
    q(".a-nav__index", nav)?.setAttribute("aria-expanded", String(open));
    if (open) {
      A.lenis?.stop();
      const labels = rows.map((r) => q(".a-nav__row-in > span:first-child", r));
      const years = rows.map((r) => q(".a-nav__row-in > span:last-child", r));
      if (!A.reduce) {
        gsap.fromTo(labels, { yPercent: 130 }, { yPercent: 0, duration: 0.55, ease: "energy", stagger: 0.02, overwrite: true });
        gsap.fromTo(years, { yPercent: 125 }, { yPercent: 0, duration: 0.26, ease: "energy", stagger: 0.02, delay: 0.1, overwrite: true });
      }
      requestAnimationFrame(thumbSync);
    } else {
      A.lenis?.start();
    }
  };
  A.navClose = () => openDrop(false);
  q(".a-nav__index", nav)?.addEventListener("click", (e) => { e.stopPropagation(); openDrop(nav.dataset.navDropdown !== "open"); });
  document.addEventListener("click", (e) => { if (nav && !nav.contains(e.target)) openDrop(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") openDrop(false); });
  A.navActive = (i) => rows.forEach((r, n) => r.setAttribute("data-film-status", n === i ? "active" : ""));
  // Inside the home page, pressing a list row doesn’t navigate but spins to that disc (original data-film-scroll).
  rows.forEach((r, i) => r.addEventListener("click", (e) => {
    if (A.gallery?.films === "films" && A.gallery.go) {
      e.preventDefault();
      openDrop(false);
      A.gallery.go(i, "click");
    }
  }));

  // Skin for the section where the nav sits — bright text over dark photos (original data-theme-change)
  let themeST = null;
  A.navTheme = (root) => {
    themeST?.kill();
    const secs = qa("[data-theme-change]", root);
    if (!nav || !secs.length) { nav?.removeAttribute("data-nav-theme"); return; }
    const pick = () => {
      const y = nav.getBoundingClientRect().bottom - (matchMedia("(max-width: 991px)").matches ? 0 : 0);
      const at = innerWidth <= 991 ? innerHeight - 30 : 40;
      const s = secs.find((s) => { const r = s.getBoundingClientRect(); return r.top <= at && r.bottom > at; });
      nav.setAttribute("data-nav-theme", s ? s.dataset.themeChange : "dark");
      return y;
    };
    themeST = ScrollTrigger.create({ start: 0, end: "max", onUpdate: pick, onRefresh: pick });
    pick();
  };

  // ── Page attach · detach
  let api = null;
  const mount = (root) => {
    A.hoverWrap(root);
    const ns = root.dataset.barbaNamespace;
    A.navPage(ns);
    api = A.pages[ns]?.(root) || {};
    A.navTheme(root);
    dockWidth();
    return api;
  };
  const unmount = () => { try { api?.destroy?.(); } catch (e) {} api = null; };

  // Bring the next page’s css and js into the current document (the original shared one css, so this wasn’t needed)
  const abs = (h) => new URL(h, location.href).href;
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    await Promise.all(want.filter((h) => !have.includes(h)).map((href) => new Promise((r) => {
      const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r });
      document.head.append(l);
    })));
    const loaded = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (loaded.includes(src)) continue;
      await new Promise((r) => document.body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
    return () => [...document.querySelectorAll('link[rel="stylesheet"]')].forEach((l) => want.includes(l.href) || l.remove());
  };

  const toTop = () => { A.lenis ? A.lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0); };
  const gal = (c) => c?.__gallery || null;
  // Original transition lengths — disc flip out .5 · in 1.05, detail open out .55 · disc exit .8 · detail brightens in .35, default darkens .4 → brightens .6 after .4
  const T = { flipOut: 0.5, flipIn: 1.05, detailOut: 0.55, detailExit: 0.8, detailFade: 0.35, fade: 0.4 };
  A.T = T;

  const start = () => {
    A.hoverWrap(document);
    const first = q('[data-barba="container"]');
    mount(first);
    ScrollTrigger.refresh();
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    let dropOld = null;
    const common = {
      async beforeEnter({ next }) { dropOld = await bring(next.html); },
      afterLeave() { unmount(); ScrollTrigger.getAll().forEach((t) => t.kill()); },
      afterEnter({ next }) {
        dropOld?.();
        toTop();
        mount(next.container);
        A.nextIntro = null;
        A.lenis?.resize();
        A.lenis?.start();
        ScrollTrigger.refresh();
      },
    };
    barba.init({
      timeout: 7000,
      preventRunning: true,
      prevent: ({ el, href }) => {
        if (!el || el.target === "_blank" || el.hasAttribute("data-barba-prevent")) return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw.startsWith("#")) return true;
        try { if (new URL(href, location.href).origin !== location.origin) return true; } catch (e) { return true; }
        return false;
      },
      transitions: [
        {
          ...common,
          name: "disc-flip",
          from: { namespace: ["films", "television"] }, to: { namespace: ["films", "television"] },
          async leave({ current }) {
            A.navClose();
            A.nextIntro = "flip";
            const g = gal(current.container);
            if (A.reduce || !g) return gsap.to(current.container, { autoAlpha: 0, duration: T.fade });
            await g.out("flip");
            gsap.set(current.container, { autoAlpha: 0 });
          },
          enter() {},
        },
        {
          ...common,
          name: "disc-detail-open",
          from: { namespace: ["films", "television"] }, to: { namespace: ["production"] },
          async leave({ current }) {
            A.navClose();
            const g = gal(current.container);
            if (A.reduce || !g) return gsap.to(current.container, { autoAlpha: 0, duration: T.fade });
            A.nextIntro = "detail";
            await g.out("detail");
            gsap.set(current.container, { autoAlpha: 0 });
          },
          enter({ next }) { return gsap.fromTo(next.container, { autoAlpha: 0 }, { autoAlpha: 1, duration: T.detailFade, ease: "main" }); },
        },
        {
          ...common,
          name: "disc-detail-close",
          from: { namespace: ["production"] }, to: { namespace: ["films", "television"] },
          leave({ current }) { A.nextIntro = "flip"; return gsap.to(current.container, { autoAlpha: 0, duration: T.fade }); },
          enter() {},
        },
        {
          ...common,
          name: "default",
          leave({ current }) { A.nextIntro = "fade"; return gsap.to(current.container, { autoAlpha: 0, duration: T.fade }); },
          enter({ next }) { return gsap.fromTo(next.container, { autoAlpha: 0 }, { autoAlpha: 1, delay: 0.4 }); },
        },
      ],
    });
  };
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  const boot = () => fontsReady.then(() => requestAnimationFrame(start));
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
  A.navRefresh = () => { dockWidth(); moveDot(false); };
  addEventListener("resize", () => { dockWidth(); moveDot(true); thumbSync(); });
})();
