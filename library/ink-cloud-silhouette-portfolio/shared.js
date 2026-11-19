/* Used by all pages: loader (first page), menu panel, Locomotive smooth scroll, Barba page transition, line reveal.
   DG.page( on every page"<namespace>", { mount(container) { …; Detach return } }), registers its own motion. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Shown once web fonts have all arrived — the large text entrance waits for this to hide the reflow when the font swaps (1.5 seconds at most)
  const fontsIn = () => document.documentElement.classList.add("dg-fonts");
  document.fonts?.ready.then(fontsIn); setTimeout(fontsIn, 1500);
  const desktop = () => innerWidth > 1024;
  if (window.CustomEase) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("easeOutSmooth", "0.17, 0.67, 0.1, 0.99");
    CustomEase.create("easeInOutStrong", "0.76, 0, 0.24, 1");
    CustomEase.create("easeInOutMax", "0.8, 0, 0.02, 1");
  }
  const E = (name, fallback) => (window.CustomEase ? name : fallback);
  const pages = {};
  const DG = (window.DG = { reduce, desktop, pages, page: (ns, api) => (pages[ns] = api), scroll: null, E });

  // ── Text-line reveal: [data-rv="line"] text inside the mask rises from below (.7s, 80ms per line) ──
  DG.reveal = (root, { delay = 0 } = {}) => {
    const lines = [...root.querySelectorAll('[data-rv="line"] > *, [data-editorial-reveal]')];
    if (!lines.length) return;
    if (reduce) return gsap.set(lines, { yPercent: 0, autoAlpha: 1 });
    gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: E("easeOutSmooth", "power3.out"), stagger: 0.08, delay });
  };

  // Current scroll position — Locomotive’s value if it is running, otherwise the window scroll
  DG.y = () => DG.scroll?.scroll?.instance?.scroll?.y ?? scrollY;
  // Document position of an element (Locomotive moves sections with transform, so measure by adding offsetTop)
  DG.top = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };

  // ── Smooth scroll: like the original, Locomotive only above 1025px (lerp .085, multiplier .85) ──
  DG.startScroll = (container) => {
    DG.scroll?.destroy(); DG.scroll = null;
    const el = container.closest("[data-scroll-container]") || document.querySelector("[data-scroll-container]");
    if (!el || !window.LocomotiveScroll || reduce || !desktop()) return;
    DG.scroll = new LocomotiveScroll({ el, smooth: true, lerp: 0.085, multiplier: 0.85, scrollFromAnywhere: true, tablet: { smooth: false }, smartphone: { smooth: false } });
    new ResizeObserver(() => DG.scroll?.update()).observe(container);
  };

  // ── Loader: silhouette pieces slip out of place then align, the progress bar fills in at least 1.2s, the strip opens from a 3px line to full screen ──
  const B = { minDuration: 1.2, maxWait: 6, progressIn: 0.3, hold: 0.7, titleIn: 0.85, titleDur: 2.1, contentOut: 0.22, squashDelay: 0.04, squash: 0.38, bandAt: 0.34, bandLine: 0.08, bandOpen: 0.5 };
  const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));
  DG.preload = async (ready) => {
    const pre = document.querySelector("[data-preloader]");
    if (!pre) return;
    if (reduce) { pre.remove(); return; }
    const bar = pre.querySelector("[data-preloader-bar]"), pct = pre.querySelector("[data-preloader-percent]"), title = pre.querySelector("[data-preloader-title]");
    const art = pre.querySelector(".preloader__artwork"), content = pre.querySelector(".preloader__content"), prog = pre.querySelector(".preloader__progress"), band = pre.querySelector(".preloader__transition-band");
    const f = [...pre.querySelectorAll(".preloader__fragment")], u = (v) => (v * art.offsetWidth) / 465;
    gsap.set(f, { x: 0, autoAlpha: 0, scale: 1.06, transformOrigin: "50% 50%" });
    [[-2, -1], [1, -2], [-1, 1], [2, 1], [-1, -1], [1, 2]].forEach(([x, y], i) => f[i] && gsap.set(f[i], { xPercent: x, yPercent: y }));
    gsap.to(f, { autoAlpha: 0.16, xPercent: 0, yPercent: 0, scale: 1, duration: 0.26, ease: "power4.out", delay: 0.03 });
    gsap.to(prog, { y: 0, autoAlpha: 1, duration: 0.55, ease: "power2.out", delay: B.progressIn });
    // While waiting, pieces slide sideways and glitch (original order and distance, start after 0.3 seconds, rest .25 seconds, repeat)
    const [a, b, c, d, e, g] = f;
    const jit = gsap.timeline({ delay: 0.3, repeat: -1, repeatDelay: 0.25 })
      .set(c, { x: u(-46), autoAlpha: 1 }, 0.06).set(e, { x: u(31), autoAlpha: 1 }, 0.13)
      .to(c, { x: u(24), scaleX: 1.07, duration: 0.11, ease: "power1.in" }, 0.18).set(b, { x: u(54), autoAlpha: 1 }, 0.26)
      .set(c, { x: u(-28), scaleX: 0.985 }, 0.3).to(c, { x: u(-11), scaleX: 1, duration: 0.18, ease: "power3.out" }, 0.31)
      .to(e, { x: u(-34), scaleX: 1.045, duration: 0.13, ease: "power1.in" }, 0.31).set(g, { x: u(-41), autoAlpha: 1 }, 0.43).set(e, { x: u(18), scaleX: 1 }, 0.45)
      .add("slip", 0.78).set(a, { x: u(37), autoAlpha: 1 }, "slip").set(d, { x: u(-52), autoAlpha: 1 }, "slip+=0.07")
      .to(a, { x: u(-29), scaleX: 1.055, duration: 0.14, ease: "power2.in" }, "slip+=0.08").to(d, { x: u(43), scaleX: 1.08, duration: 0.12, ease: "power2.in" }, "slip+=0.15")
      .set(a, { x: u(14), scaleX: 1 }, "slip+=0.23").set(d, { x: u(-17), scaleX: 0.99 }, "slip+=0.28").to(d, { x: u(27), scaleX: 1, duration: 0.17, ease: "power3.out" }, "slip+=0.29")
      .set(b, { x: u(-19) }, "slip+=0.31").set(g, { x: u(26) }, "slip+=0.37").set(c, { x: u(17) }, "slip+=0.43")
      .add("resolve", "slip+=0.5").set(b, { x: u(13) }, "resolve+=0.08").to(b, { x: 0, duration: 0.13, ease: "power3.out" }, "resolve+=0.09")
      .set(d, { x: u(-11) }, "resolve+=0.15").to(d, { x: 0, duration: 0.14, ease: "power3.out" }, "resolve+=0.16")
      .set(a, { x: u(-16) }, "resolve+=0.21").to(a, { x: 0, duration: 0.16, ease: "power3.out" }, "resolve+=0.22")
      .to(c, { x: 0, duration: 0.14, ease: "power3.out" }, "resolve+=0.30").to(e, { x: 0, duration: 0.16, ease: "power3.out" }, "resolve+=0.36").to(g, { x: 0, duration: 0.14, ease: "power3.out" }, "resolve+=0.42");
    gsap.fromTo(title, { yPercent: 115, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: B.titleDur, ease: E("easeOutSmooth", "power3.out"), delay: B.titleIn });
    // Progress: follows at a .14 rate the smaller of the prepared share and a minimum of 1.2 seconds
    await new Promise((res) => {
      let have = 0; const list = [document.fonts?.ready, ...(ready || [])], n = Math.max(list.length, 1);
      list.forEach((p) => Promise.resolve(p).catch(() => {}).finally(() => (have += 1 / n)));
      const cap = setTimeout(() => (have = 1), B.maxWait * 1000), t0 = performance.now();
      let v = 0;
      const step = () => {
        const target = Math.min(have, Math.min(1, (performance.now() - t0) / 1000 / B.minDuration));
        v += (target - v) * 0.14; if (target - v < 0.002) v = target;
        bar.style.transform = `scaleX(${v})`; pct.textContent = `${Math.round(v * 100)}%`;
        if (v >= 1) { clearTimeout(cap); res(); return; }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    jit.kill();
    await new Promise((res) => {
      const tl = gsap.timeline({ onComplete: res }).to(f, { autoAlpha: 1, scaleX: 1, duration: 0.12, ease: "power1.out" }, 0);
      [[7, 0.34, 0], [-4, 0.36, 0.025], [3, 0.34, 0.045], [-9, 0.38, 0.06], [4, 0.34, 0.08], [-3, 0.36, 0.1]].forEach(([x, duration, at], i) => f[i] && tl.to(f[i], { x, duration, ease: E("easeInOutStrong", "power3.inOut") }, at));
    });
    await wait(B.hold);
    const ex = "cubic-bezier(0.87, 0, 0.13, 1)";
    content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: B.contentOut * 1000, easing: "ease-in", fill: "forwards" });
    art.animate([{ transform: "translate(-50%, -50%) scaleY(1)", opacity: 1 }, { transform: "translate(-50%, -50%) scaleY(0.025)", opacity: 1, offset: 0.97 }, { transform: "translate(-50%, -50%) scaleY(0.025)", opacity: 0 }], { delay: B.squashDelay * 1000, duration: B.squash * 1000, easing: ex, fill: "forwards" });
    const line = 3 / Math.max(innerHeight, 1), k = B.bandLine / (B.bandLine + B.bandOpen);
    await band.animate([{ transform: "scaleY(0)", easing: "linear" }, { transform: `scaleY(${line})`, offset: k, easing: ex }, { transform: "scaleY(1)" }], { delay: B.bandAt * 1000, duration: (B.bandLine + B.bandOpen) * 1000, fill: "forwards" }).finished;
    pre.remove();
  };

  // ── Header entrance ──
  DG.headerIn = (delay = 0) => {
    const items = [".site-header__availability", ".site-header__menu", ".site-header__archive"].map((s) => document.querySelector(s)).filter(Boolean);
    if (reduce) return gsap.set(items, { autoAlpha: 1, y: 0 });
    gsap.fromTo(items, { y: -10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: E("easeOutSmooth", "power3.out"), stagger: 0.06, delay, onComplete: () => gsap.set(items, { clearProps: "transform,opacity,visibility" }) });
  };

  // ── Menu panel: original order — the whole panel (ink 90%) enters in .6s, .08s later the right panel opens to the left (1s, menuGlide),
  //    After .28s links rise from 35% below at .05s intervals (.95s) and the blur clears (.52s), the current dot grows, at .4s the preview image · word appear, at .55s the bottom line ──
  const menu = document.querySelector("[data-menu]"), btn = document.querySelector("[data-menu-open]");
  let open = false, menuTl = null;
  if (menu && btn) {
    const glide = E("menuGlide", "power3.out");
    if (window.CustomEase) CustomEase.create("menuGlide", "0.33,0.85,0.25,1");
    const M = { veil: 0.6, panelAt: 0.08, panel: 1, linksAt: 0.28, links: 0.95, linkStagger: 0.05, artAt: 0.4, art: 0.9, footerAt: 0.55, footer: 0.7, closeVeil: 0.5, closeLeaveAt: 0.06, closeLeave: 0.55, closeDrop: 28 };
    const panel = menu.querySelector(".menu-overlay__panel"), foot = menu.querySelector(".menu-overlay__panel-footer");
    const links = [...menu.querySelectorAll(".menu-overlay__link")], items = [...menu.querySelectorAll("[data-menu-preview-item]")];
    const texts = links.map((l) => l.querySelector(".menu-overlay__link-text")), dots = links.map((l) => l.querySelector(".menu-overlay__indicator"));
    const mapActive = menu.querySelector("[data-menu-map-active]");
    const vars = (el, o) => Object.entries(o).forEach(([k, v]) => el.style.setProperty(k, v));
    const snap = (el, fn) => { el.classList.add("no-tr"); fn(); el.offsetWidth; el.classList.remove("no-tr"); };
    // Bringing in and out one preview cell — with css variables and is-in/is-out/is-leave types, like the original
    const enter = (it, { delay = 0, duration = 0.6, dir = 1 } = {}) => {
      vars(it, { "--pv-d": `${duration}s`, "--pv-appear": "0.3s", "--pv-dl": `${delay}s`, "--pv-w-d": "0.55s", "--pv-w-at": `${Math.max(0.08, duration * 0.14)}s`, "--pv-w-step": "0.04s", "--pv-dir": dir });
      it.classList.remove("is-out", "is-leave"); it.classList.add("is-in");
    };
    const leave = (it, dir = 1) => { if (!it.classList.contains("is-in")) return; vars(it, { "--pv-d": "0.35s", "--pv-dir": dir, "--pv-w-out": "0.35s" }); it.classList.remove("is-in"); it.classList.add("is-out"); };
    let cur = null;
    const keyOf = () => links.find((l) => l.classList.contains("is-active"))?.dataset.menuItem || "home";
    const show = (key, { first = false, duration = 0.6 } = {}) => {
      const next = items.find((it) => it.dataset.menuPreviewItem === key);
      mapActive?.style.setProperty("--n", Math.max(0, links.findIndex((l) => l.dataset.menuItem === key)));
      if (!next || next === cur) return;
      const dir = cur && items.indexOf(next) < items.indexOf(cur) ? -1 : 1;
      if (first) items.forEach((it) => snap(it, () => it.classList.remove("is-in", "is-out", "is-leave")));
      else items.forEach((it) => it !== next && leave(it, dir));
      items.forEach((it) => it.classList.toggle("is-active", it === next));
      cur = next; enter(next, { duration, dir });
    };
    const current = () => document.querySelector('[data-barba="container"]')?.dataset.barbaNamespace || "home";
    const setActive = () => { const ns = current(); links.forEach((l) => l.classList.toggle("is-active", l.dataset.menuItem === ns || (ns === "playground" && l.dataset.menuItem === "lab"))); };
    links.forEach((l) => l.addEventListener("pointerenter", () => open && innerWidth >= 1024 && show(l.dataset.menuItem)));
    menu.querySelector(".menu-overlay__nav").addEventListener("pointerleave", () => open && show(keyOf()));
    DG.setMenu = (want) => {
      if (want === open) return Promise.resolve();
      open = want; menuTl?.kill();
      btn.setAttribute("aria-expanded", String(open)); btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      document.body.classList.toggle("menu-open", open);
      const k = reduce ? 0 : 1;
      if (open) {
        setActive(); cur = null;
        menu.classList.add("is-open"); menu.inert = false; menu.removeAttribute("aria-hidden"); DG.scroll?.stop();
        gsap.set(menu, { clearProps: "backgroundColor" }); gsap.set(panel, { y: 0, opacity: 1 });
        menuTl = gsap.timeline()
          .fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: M.veil * k, ease: "power1.out" }, 0)
          .fromTo(panel, { clipPath: innerWidth <= 1024 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: M.panel * k, ease: glide }, M.panelAt * k)
          .fromTo(texts, { yPercent: 35 }, { yPercent: 0, duration: M.links * k, stagger: M.linkStagger * k, ease: glide }, M.linksAt * k)
          .fromTo(texts, { opacity: 0 }, { opacity: 1, duration: M.links * 0.55 * k, stagger: M.linkStagger * k, ease: "power1.out" }, M.linksAt * k)
          .fromTo(dots, { scale: 0 }, { scale: 1, duration: M.links * 0.6 * k, stagger: M.linkStagger * k, ease: glide }, (M.linksAt + M.links * 0.3) * k)
          .call(() => show(keyOf(), { first: true, duration: M.art }), null, M.artAt * k)
          .fromTo(foot, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: M.footer * k, ease: glide }, M.footerAt * k);
      } else {
        menuTl = gsap.timeline({ onComplete: () => { menu.classList.remove("is-open"); menu.inert = true; menu.setAttribute("aria-hidden", "true"); gsap.set(menu, { clearProps: "opacity,visibility,backgroundColor" }); DG.scroll?.start(); } })
          .to(menu, { backgroundColor: "transparent", duration: M.closeVeil * k, ease: "power1.out" }, 0)
          .call(() => cur && (vars(cur, { "--pv-d": `${M.closeLeave}s`, "--pv-leave-y": `${M.closeDrop}px` }), cur.classList.remove("is-in"), cur.classList.add("is-leave")), null, M.closeLeaveAt * k)
          .to(panel, { y: M.closeDrop, opacity: 0, duration: M.closeLeave * k, ease: "power1.inOut" }, M.closeLeaveAt * k);
      }
      return menuTl.then();
    };
    // If the pointer left quickly (within .45s), hold until the sweep ends (1s after entry + .05s) — the original is-hover-hold
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let enteredAt = -Infinity, hold = 0;
      const release = () => { clearTimeout(hold); btn.classList.remove("is-hover-hold"); };
      btn.addEventListener("pointerenter", () => { if (btn.classList.contains("is-hover-hold")) { release(); return; } enteredAt = performance.now(); });
      btn.addEventListener("pointerleave", () => { const t = performance.now() - enteredAt; if (t >= 450) return; btn.classList.add("is-hover-hold"); clearTimeout(hold); hold = setTimeout(release, 1000 - t + 50); });
    }
    btn.addEventListener("click", () => DG.setMenu(!open));
    addEventListener("keydown", (e) => e.key === "Escape" && open && DG.setMenu(false));
    menu.inert = true;
  }

  // ── Page register · attach ──
  let unmount = null;
  const mount = (container, opts = {}) => {
    unmount?.(); unmount = null;
    const api = pages[container.dataset.barbaNamespace];
    unmount = api?.mount?.(container, opts) || null;
    DG.startScroll(container);
  };

  // Bring in the next page’s css · js (the page-transition library swaps only the body)
  const abs = (h) => new URL(h, location.href).href;
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.title) document.title = doc.title;
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((href) => new Promise((r) => {
      document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r }));
      setTimeout(r, 800);
    })));
    const loaded = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (loaded.includes(src)) continue;
      await new Promise((r) => document.body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
  };

  // Original paging values (above 1025px / below it)
  const T = { desktop: { outScale: 0.985, out: 0.55, veil: 0.46, veilDuration: 0.42, handoff: 0.25, revealDelay: 0.2, fade: 0.9, inY: "10vh", inScale: 0.8, in: 1.2, inEase: "power1.in" },
    compact: { outScale: 1, out: 0.45, veil: 1, veilDuration: 0.35, handoff: 0.35, revealDelay: 0.1, fade: 0.45, inY: 0, inScale: 1, in: 0.8, inEase: "power3.out" } };

  const start = async () => {
    const first = document.querySelector('[data-barba="container"]');
    const api = pages[first.dataset.barbaNamespace];
    const wantsLoader = !!document.querySelector("[data-preloader]");
    await api?.prepare?.(first);
    if (wantsLoader) await DG.preload(api?.ready?.(first));
    document.documentElement.classList.remove("is-booting");
    mount(first, { initial: true, afterLoader: wantsLoader });
    DG.headerIn(wantsLoader ? 1.1 : 0.2);
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    let busy = false;
    barba.init({
      timeout: 4000,
      preventRunning: true,
      prevent: ({ el, event, href }) => {
        if (busy) { if (event?.type === "click") event.preventDefault(); return true; }
        if (!el || el.closest(".wf-ui") || el.target === "_blank") return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw.startsWith("#") || /^(mailto|tel):/.test(raw)) return true;
        try { if (new URL(href, location.href).origin !== location.origin) return true; } catch { return true; }
        return false;
      },
      transitions: [{
        name: "default-page-transition",
        sync: true,
        beforeLeave() { busy = true; DG.scroll?.stop(); },
        async beforeEnter({ next }) { await bring(next.html); },
        leave({ current }) {
          const c = T[desktop() ? "desktop" : "compact"], el = current.container, veil = el.querySelector(".page-transition-veil");
          const under = open, r = el.getBoundingClientRect();
          gsap.set(el, { transformOrigin: `50% ${innerHeight / 2 - r.top}px` });
          const tl = gsap.timeline();
          if (veil) gsap.set(veil, { autoAlpha: under ? c.veil : 0 });
          tl.to(el, { scale: c.outScale, duration: reduce ? 0 : c.out, ease: "power2.inOut" }, 0);
          if (veil && !under) tl.to(veil, { autoAlpha: c.veil, duration: c.veilDuration, ease: "power2.out" }, 0);
          if (under) DG.setMenu(false);
          tl.to(el, { opacity: 0, duration: reduce ? 0 : c.fade, ease: "power1.in" }, c.handoff + c.revealDelay + 0.01);
          return tl.then();
        },
        enter({ next }) {
          const c = T[desktop() ? "desktop" : "compact"], el = next.container;
          gsap.set(el, { position: "fixed", inset: 0, zIndex: 2, overflow: "hidden" });
          return gsap.timeline({ delay: c.handoff + c.revealDelay })
            .fromTo(el, { y: c.inY, scale: c.inScale, autoAlpha: 1 }, { y: 0, scale: 1, duration: reduce ? 0 : c.in, ease: c.inEase }).then();
        },
        afterEnter({ next }) {
          gsap.set(next.container, { clearProps: "position,inset,zIndex,overflow,transform" });
          scrollTo(0, 0);
          mount(next.container, { initial: false });
          busy = false;
        },
      }],
    });
  };
  const boot = () => requestAnimationFrame(start);
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
})();

/* Footer mail: text split into letters, the letter the pointer passes over briefly pops up */
(() => {
  const split = (root) => root.querySelectorAll("[data-footer] .ft__mail").forEach((a) => {
    if (a.dataset.split) return; a.dataset.split = "1";
    const t = a.textContent; a.innerHTML = [...t].map((c) => `<span aria-hidden="true">${c}</span>`).join("");
    a.querySelectorAll("span").forEach((s) => s.addEventListener("pointerenter", () => { s.classList.add("is-up"); setTimeout(() => s.classList.remove("is-up"), 220); }));
  });
  window.DG.footer = split;
})();

/* Ink board (WebGL) — shared by the hero and the playground. The original lays one ink photo over the board and runs a water height field over it only in the hero — 
   Instead of a photo, our shader draws ink blobs (domain-warped noise clumps, watercolor bleed with darkening edges, grain).
   Ink is baked onto the plate only when it changes, and water runs separately at the original values (WATER below). The playground words are seen beneath it, dodging the ink and flipped, so they look like glass letters */
(() => {
  const toVec = (name) => {
    const p = document.createElement("i"); p.style.color = `var(${name})`; document.body.append(p);
    const c = getComputedStyle(p).color; p.remove();
    const x = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
    x.fillStyle = c; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  const VERT = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uRes; uniform float uReveal, uCompact, uLayout, uHasWord;
    uniform sampler2D uWord;
    uniform vec3 uPaper, uInk, uDeep, uMist;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 6; i++){ v += a*noise(p); p = p*2.02 + 7.3; a *= 0.5; } return v; }
    float blob(vec2 p, vec2 c, vec2 r){ vec2 q = (p - c) / r; return 1.0 - dot(q, q); }
    void main(){
      vec2 uv = vUv;
      float asp = uRes.x / uRes.y;
      vec2 p = vec2(uv.x * asp, uv.y);
      vec2 w = vec2(fbm(p * 2.2), fbm(p * 2.2 + 3.1));
      float edge = fbm(p * 3.4 + w * 1.6);
      // Three clumps: a large cloud at upper right, a dark cloud at lower left, a small tail at bottom center (on phones, top and bottom)
      vec2 c1 = uCompact > 0.5 ? vec2(asp * 0.92, 0.95) : vec2(asp * 0.8, 0.86);
      vec2 c2 = uCompact > 0.5 ? vec2(asp * 0.05, 0.15) : vec2(asp * 0.17, 0.08);
      vec2 c3 = uCompact > 0.5 ? vec2(asp * 0.7, 0.05) : vec2(asp * 0.62, -0.06);
      vec2 r1 = vec2(0.48, 0.3), r2 = vec2(0.52, 0.42), r3 = vec2(0.22, 0.24);
      if (uCompact > 0.5 && uLayout < 0.5) { // Phone hero: small cloud at top right, cloud at bottom left — more paper shows
        c1 = vec2(asp * 1.0, 0.98); r1 = vec2(0.34, 0.2); c2 = vec2(asp * -0.05, 0.12); r2 = vec2(0.36, 0.3); c3 = vec2(asp * 0.85, -0.02); r3 = vec2(0.16, 0.14);
      }
      if (uLayout > 0.5) { // Playground: ink flows down from the top left and pools at the bottom left
        c1 = vec2(asp * 0.12, 1.02); r1 = vec2(asp * 0.62, 0.34); c2 = vec2(asp * 0.02, 0.3); r2 = vec2(0.5, 0.45); c3 = vec2(asp * 0.38, 0.02); r3 = vec2(0.42, 0.22);
      }
      float f = max(max(blob(p, c1, r1), blob(p, c2, r2)), blob(p, c3, r3));
      f += (edge - 0.5) * 0.9;
      float th = mix(1.25, 0.12, uReveal);
      float ink = smoothstep(th - 0.08, th + 0.04, f);
      // Watercolor: the edge band is dark, the inside has layered thin washes
      float rim = smoothstep(th - 0.02, th + 0.06, f) * (1.0 - smoothstep(th + 0.06, th + 0.28, f));
      float body = fbm(p * 5.0 + w * 2.0 + 11.0);
      vec3 col = mix(uInk, uDeep, smoothstep(0.35, 0.75, body) * 0.75 + rim * 0.35);
      // The cloud at bottom left is darker
      col = mix(col, uDeep * 0.82, smoothstep(0.4, -0.2, uv.y + uv.x * 0.2) * 0.6);
      float gran = (hash(floor(vUv * uRes / 1.5)) - 0.5) * 0.06;
      col += gran;
      // Faint outer water mark of the blur
      float halo = smoothstep(th - 0.2, th - 0.05, f) * (1.0 - ink);
      vec3 paper = mix(uPaper, uMist, halo * 0.35);
      vec3 base = mix(paper, col, ink);
      // Word glass: inside the glyphs, the ink viewed offset by the glyph slant appears inverted (ink color on paper, pinkish tint on ink)
      if (uHasWord > 0.5) {
        float m = texture2D(uWord, vUv).a;
        if (m > 0.01) {
          vec2 px = 1.0 / uRes;
          vec2 g = vec2(texture2D(uWord, vUv + vec2(px.x * 3.0, 0.0)).a - texture2D(uWord, vUv - vec2(px.x * 3.0, 0.0)).a, texture2D(uWord, vUv + vec2(0.0, px.y * 3.0)).a - texture2D(uWord, vUv - vec2(0.0, px.y * 3.0)).a);
          vec2 q = vUv + g * 0.03;
          vec2 pq = vec2(q.x * asp, q.y);
          float fq = max(max(blob(pq, c1, r1), blob(pq, c2, r2)), blob(pq, c3, r3)) + (edge - 0.5) * 0.9;
          vec3 through = mix(paper, col, smoothstep(th - 0.08, th + 0.04, fq));
          through = vec3(1.0) - through * vec3(0.94, 0.97, 1.0);
          through += vec3(1.0) * pow(max(0.0, g.y * 0.6 + g.x * 0.3), 2.0) * 0.4;
          base = mix(base, through, m);
        }
      }
      // Alpha holds the share covered by ink — water sparkle sits only on the ink, as in the original
      gl_FragColor = vec4(base, ink);
    }`;

  /* Hero water — original values: 256-cell-high sheet, 120 steps per second (up to 4 steps per frame), spring 2 pulling toward the neighbor average, damping .985 (.85 for the 6% at the edges), height relaxation .998. 
     For every hand movement, presses a raindrop of radius .018 (ratio of screen height) downward by the distance from the last position (px) × .0006 (max .012).
     When visible, ink is offset by tilt × 2 (red and blue get ±25% more or less), sparkle .55, and where tilt × 75 is between .15 and .9 the color is inverted by .6
     3 seconds after the last drop, drains the water and goes to sleep */
  const WATER = { simH: 256, steps: 120, maxSteps: 4, sleep: 3000, spring: 2, damp: 0.985, edgeDamp: 0.85, edgeW: 0.06, relax: 0.998,
    refract: 2, disperse: 0.25, normal: 75, spec: 0.55, invert: 0.6, dropR: 0.018, perPx: 6e-4, dropMax: 0.012, dropMin: 5e-4,
    wheelR: 0.035, perWheel: 1e-4, wheelMax: 0.04 };
  const SIM_STEP = `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uS; uniform vec2 uPx; uniform float uSpring, uDamp, uEdgeDamp, uEdgeW, uRelax;
    float at(vec2 o){ return texture2D(uS, vUv + o).r; }
    void main(){
      vec2 s = texture2D(uS, vUv).rg;
      float around = (at(vec2(uPx.x, 0.0)) + at(vec2(-uPx.x, 0.0)) + at(vec2(0.0, uPx.y)) + at(vec2(0.0, -uPx.y))) * 0.25;
      float rim = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
      s.y = (s.y + (around - s.x) * uSpring) * mix(uEdgeDamp, uDamp, smoothstep(0.0, uEdgeW, rim));
      s.x = (s.x + s.y) * uRelax;
      if (max(abs(s.x), abs(s.y)) < 5e-5) s = vec2(0.0);
      gl_FragColor = vec4(s, 0.0, 1.0);
    }`;
  const SIM_DROP = `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uS; uniform vec2 uAt; uniform float uR, uAmt, uAsp;
    void main(){
      vec2 s = texture2D(uS, vUv).rg;
      float k = clamp(1.0 - length((vUv - uAt) * vec2(uAsp, 1.0)) / uR, 0.0, 1.0);
      s.x += (0.5 - 0.5 * cos(k * 3.14159265)) * uAmt;
      gl_FragColor = vec4(s, 0.0, 1.0);
    }`;
  const SIM_SHOW = `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uInkT, uS; uniform vec2 uPx; uniform float uRefract, uDisperse, uNormal, uSpec, uInvert;
    float at(vec2 o){ return texture2D(uS, vUv + o).r; }
    void main(){
      vec2 slope = vec2(at(vec2(uPx.x, 0.0)) - at(vec2(-uPx.x, 0.0)), at(vec2(0.0, uPx.y)) - at(vec2(0.0, -uPx.y)));
      vec2 off = slope * uRefract;
      vec4 c = texture2D(uInkT, vUv + off);
      c.r = texture2D(uInkT, vUv + off * (1.0 + uDisperse)).r;
      c.b = texture2D(uInkT, vUv + off * (1.0 - uDisperse)).b;
      vec3 n = normalize(vec3(-slope * uNormal, 1.0)), l = normalize(vec3(-0.4, 0.6, 1.0));
      vec3 col = c.rgb + pow(max(reflect(-l, n).z, 0.0), 60.0) * uSpec * c.a;
      col = mix(col, 1.0 - col, smoothstep(0.15, 0.9, length(slope * uNormal)) * uInvert);
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }`;

  function inkStage(host, { layout = 0, word = null, water = false } = {}) {
    const cv = host.querySelector("canvas");
    const gl = cv.getContext("webgl2", { antialias: false, alpha: false }) || cv.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const program = (frag, names) => {
      const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag));
      gl.bindAttribLocation(p, 0, "p"); gl.linkProgram(p);
      return { p, u: Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)])) };
    };
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const inkP = program(FRAG, ["uRes", "uReveal", "uCompact", "uPaper", "uInk", "uDeep", "uMist", "uLayout", "uHasWord", "uWord"]);
    const prog = inkP.p; gl.useProgram(prog);
    const u = { res: inkP.u.uRes, reveal: inkP.u.uReveal, compact: inkP.u.uCompact, paper: inkP.u.uPaper, ink: inkP.u.uInk, deep: inkP.u.uDeep, mist: inkP.u.uMist, layout: inkP.u.uLayout, hasWord: inkP.u.uHasWord, word: inkP.u.uWord };
    gl.uniform1f(u.layout, layout); gl.uniform1f(u.hasWord, word ? 1 : 0);
    // Word: paints the text at that element’s position on a screen-size plane, used as a glass-shaped plane
    const wordTex = gl.createTexture();
    const paintWord = () => {
      if (!word) return;
      const c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height;
      const g = c.getContext("2d"), hr = host.getBoundingClientRect(), k = cv.width / Math.max(1, hr.width);
      word.querySelectorAll("[data-glass-line]").forEach((ln) => {
        const r = ln.getBoundingClientRect(), cs = getComputedStyle(ln);
        g.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * k}px ${cs.fontFamily}`; g.textBaseline = "alphabetic";
        if ("letterSpacing" in g) g.letterSpacing = `${parseFloat(cs.letterSpacing || 0) * k}px`;
        let x = (r.left - hr.left) * k;
        [...ln.childNodes].forEach((n) => {
          const txt = n.textContent; if (!txt) return;
          const ncs = n.nodeType === 1 ? getComputedStyle(n) : cs;
          g.font = `${ncs.fontWeight} ${parseFloat(ncs.fontSize) * k}px ${ncs.fontFamily}`;
          g.fillText(txt, x, (r.top - hr.top) * k + parseFloat(cs.fontSize) * k * 0.86);
          x += g.measureText(txt).width;
        });
      });
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, wordTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.useProgram(prog); gl.uniform1i(u.word, 0);
      st.dirty = true;
    };
    const setColors = () => { gl.useProgram(prog); gl.uniform3fv(u.paper, toVec("--kf-bg")); gl.uniform3fv(u.ink, toVec("--kf-accent")); gl.uniform3fv(u.deep, toVec("--site-deep")); gl.uniform3fv(u.mist, toVec("--site-mist")); };
    setColors();
    const st = { reveal: 0, lastReveal: -1, dirty: true, raf: 0, last: 0 };
    const sim = water && !DG.reduce && DG.desktop() ? waterSim(gl, program, host) : null;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, innerWidth <= 1024 ? 1.5 : 2) * 0.75;
      cv.width = Math.max(1, host.clientWidth * dpr | 0); cv.height = Math.max(1, host.clientHeight * dpr | 0);
      sim?.resize(cv.width, cv.height); st.dirty = true;
    };
    size(); const ro = new ResizeObserver(() => { size(); paintWord(); }); ro.observe(host);
    document.fonts.ready.then(paintWord); paintWord();
    const frame = (now) => {
      st.raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, Math.max(0.001, (now - (st.last || now)) / 1000)); st.last = now;
      // Ink is re-baked only while blooming, on size change, or when the word changes
      const inkDirty = st.dirty || st.reveal !== st.lastReveal;
      if (inkDirty) {
        st.dirty = false; st.lastReveal = st.reveal;
        gl.useProgram(prog);
        gl.uniform2f(u.res, cv.width, cv.height);
        gl.uniform1f(u.reveal, st.reveal); gl.uniform1f(u.compact, innerWidth / innerHeight < 0.8 ? 1 : 0);
        sim ? sim.bakeInk(() => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)) : (gl.bindFramebuffer(gl.FRAMEBUFFER, null), gl.viewport(0, 0, cv.width, cv.height), gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4));
      }
      if (sim) sim.frame(now, dt, inkDirty);
    };
    st.raf = requestAnimationFrame(frame);
    return { st, destroy: () => { cancelAnimationFrame(st.raf); ro.disconnect(); sim?.destroy(); gl.getExtension("WEBGL_lose_context")?.loseContext(); } };
  }

  // Water height field: uses two buffers alternately and rolls (height, velocity). When the pointer moves, drops are queued and dropped on the next frame
  function waterSim(gl, program, host) {
    const W = WATER, gl2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
    let fmt = null;
    if (gl2) { if (gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float")) fmt = { inner: gl.RGBA16F, type: gl.HALF_FLOAT }; }
    else { const h = gl.getExtension("OES_texture_half_float"); gl.getExtension("OES_texture_half_float_linear"); gl.getExtension("EXT_color_buffer_half_float"); if (h) fmt = { inner: gl.RGBA, type: h.HALF_FLOAT_OES }; }
    if (!fmt) return null;
    const step = program(SIM_STEP, ["uS", "uPx", "uSpring", "uDamp", "uEdgeDamp", "uEdgeW", "uRelax"]);
    const drop = program(SIM_DROP, ["uS", "uAt", "uR", "uAmt", "uAsp"]);
    const show = program(SIM_SHOW, ["uInkT", "uS", "uPx", "uRefract", "uDisperse", "uNormal", "uSpec", "uInvert"]);
    gl.useProgram(step.p); gl.uniform1i(step.u.uS, 3); gl.uniform1f(step.u.uSpring, W.spring); gl.uniform1f(step.u.uDamp, W.damp); gl.uniform1f(step.u.uEdgeDamp, W.edgeDamp); gl.uniform1f(step.u.uEdgeW, W.edgeW); gl.uniform1f(step.u.uRelax, W.relax);
    gl.useProgram(drop.p); gl.uniform1i(drop.u.uS, 3);
    gl.useProgram(show.p); gl.uniform1i(show.u.uInkT, 1); gl.uniform1i(show.u.uS, 2); gl.uniform1f(show.u.uRefract, W.refract); gl.uniform1f(show.u.uDisperse, W.disperse); gl.uniform1f(show.u.uNormal, W.normal); gl.uniform1f(show.u.uSpec, W.spec); gl.uniform1f(show.u.uInvert, W.invert);

    const target = (inner, type) => {
      const tex = gl.createTexture(), fb = gl.createFramebuffer();
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, tex);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fb, w: 0, h: 0, alloc(w, h) { this.w = w; this.h = h; gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, inner, w, h, 0, gl.RGBA, type, null); } };
    };
    const ink = target(gl.RGBA, gl.UNSIGNED_BYTE);
    let a = target(fmt.inner, fmt.type), b = target(fmt.inner, fmt.type);
    a.alloc(4, 4); gl.bindFramebuffer(gl.FRAMEBUFFER, a.fb);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { gl.bindFramebuffer(gl.FRAMEBUFFER, null); return null; }

    let cw = 1, ch = 1, aspect = 1, awake = false, lastDrop = 0, acc = 0, prev = null, pending = [];
    const quad = () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const into = (t) => { gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fb : null); gl.viewport(0, 0, t ? t.w : cw, t ? t.h : ch); };
    const clear = () => { for (const t of [a, b]) { into(t); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); } };
    const source = () => { gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, a.tex); };
    const swap = () => { const t = a; a = b; b = t; };
    const pass = (p) => { gl.useProgram(p); source(); into(b); quad(); swap(); };
    const applyDrop = (d) => { gl.useProgram(drop.p); gl.uniform2f(drop.u.uAt, d.x, d.y); gl.uniform1f(drop.u.uR, d.r); gl.uniform1f(drop.u.uAmt, d.amt); gl.uniform1f(drop.u.uAsp, aspect); pass(drop.p); };
    const stepOnce = () => { gl.useProgram(step.p); gl.uniform2f(step.u.uPx, 1 / a.w, 1 / a.h); pass(step.p); };
    const present = () => {
      gl.useProgram(show.p); gl.uniform2f(show.u.uPx, 1 / a.w, 1 / a.h);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, ink.tex);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, a.tex);
      into(null); quad();
    };
    const queue = (x, y, r, amt) => { pending.push({ x, y, r, amt }); lastDrop = performance.now(); awake = true; };

    const hero = host.closest("[data-home-hero]");
    const live = () => !hero?.classList.contains("is-bold") && !document.hidden;
    const onMove = (e) => {
      if (!live()) { prev = null; return; }
      const r = host.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (prev) {
        const amt = Math.min(Math.hypot(x - prev.x, y - prev.y) * W.perPx, W.dropMax);
        if (amt > W.dropMin) queue(x / r.width, 1 - y / r.height, W.dropR, -amt);
      }
      prev = { x, y, u: x / r.width, v: 1 - y / r.height };
    };
    // Wheel: from the pointer position (center, lower .62 if none) lines up three droplets in the rolled direction — original values (clamp at ±240, spacing .008~.035, strength ×1·.72·.42)
    const onWheel = (e) => {
      if (!live()) return;
      const d = Math.max(-240, Math.min(240, e.deltaY));
      if (Math.abs(d) < 1) return;
      const x = prev ? prev.u : 0.5, y = prev ? prev.v : 0.62, s = Math.sign(d), gap = 0.008 + (0.035 - 0.008) * Math.abs(d) / 240;
      [[0, 1], [0.5, 0.72], [1, 0.42]].forEach(([k, f]) => {
        const amt = Math.min(Math.abs(d * f) * W.perWheel, W.wheelMax);
        if (amt > 0) queue(x, Math.max(0, Math.min(1, y - s * gap * k)), W.wheelR, -amt);
      });
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("wheel", onWheel, { passive: true });

    return {
      resize(w, h) {
        cw = w; ch = h; aspect = w / h;
        const sh2 = W.simH, sw = Math.max(1, Math.round(sh2 * aspect));
        ink.alloc(w, h); a.alloc(sw, sh2); b.alloc(sw, sh2); clear();
        // The shader gets compiled for the first time on the first gesture and stalls, so when setting up the board run the three once each
        applyDrop({ x: -1, y: -1, r: W.dropR, amt: 0 }); stepOnce(); clear();
      },
      bakeInk(draw) { into(ink); draw(); },
      frame(now, dt, inkDirty) {
        if (awake) {
          for (const d of pending) applyDrop(d);
          pending.length = 0;
          acc += Math.min(dt, 0.1) * W.steps;
          const n = Math.min(Math.floor(acc), W.maxSteps); acc -= Math.floor(acc);
          for (let i = 0; i < n; i++) stepOnce();
          if (now - lastDrop > W.sleep) { awake = false; acc = 0; clear(); }
          present();
        } else if (inkDirty) present();
      },
      destroy() { removeEventListener("pointermove", onMove); removeEventListener("wheel", onWheel); },
    };
  }

  window.DG.ink = inkStage;
})();
