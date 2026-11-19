// Common to all pages: draws header row, footer, first-visit curtain, transition curtain, grid overlay and command palette, and wires theme (light/dark), accent color (blue/orange/lime), grid (⌥G) and command palette (⌘K).
// Showcase page (html[data-motion=showcase]) is Lenis 1.3.26 (duration 1.15, expo), line fill, smooth #link scrolling, FAQ (.7s expo.out / closing .5s power3.inOut) and
// Applies reveal (line 110% → 1.1s expo.out, 48px below → 1.3s power3.out .09), horizontal line drawing (power4.inOut), stagger, blueprint drawing (strokeDashoffset scrub), and the hero order (blueprint layer → title lines → fill-in → generated subtitle → the rest).
// Reading page (data-motion=read) keeps only theme and page turn with no motion, like the original. Page transitions are handled by swup 4, covered by a ‹Plotting /path› curtain (.6s power4.inOut, columns .7s expo.inOut .025) and then lifted (.8s).
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const html = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PG = (window.PG = window.PG || {});
  PG.pages = PG.pages || {};
  html.classList.add("js");
  try { if (sessionStorage.getItem("pg-preloaded")) html.dataset.preloaded = "yes"; } catch {}
  // On a first visit, the hero sequence is pushed to 1.45s after the veil lifts. Options are patched before the parts attach at DOMContentLoaded (the HTML default is .1s on return visits)
  const firstVisit = !html.dataset.preloaded;
  // Reading pages have no crosshair cursor, as in the original — the name is removed before parts attach (on page turn view() decides again)
  const cursorFor = (motion) => { if (motion === "showcase" && !reduced) document.body.dataset.fx = "crosshair-coord-cursor"; else document.body.removeAttribute("data-fx"); };
  cursorFor(html.dataset.motion);
  if (firstVisit && !reduced) document.querySelectorAll('[data-hero][data-fx~="spec-box-intro"]').forEach((h) => { h.dataset.fxSpecBoxIntro = "delay: 1.45; hold: event"; });
  try {
    const t = localStorage.getItem("pg-theme"), a = localStorage.getItem("pg-accent");
    if (t) html.dataset.theme = t;
    if (a && a !== "blue") html.dataset.accent = a;
  } catch {}

  // Instead of the original monogram, a newly drawn two-letter placeholder (two strokes + an accent dot) — shared by the transition curtain, first-visit curtain, and header bar
  const MARK = (cls = "") => `<svg class="monogram ${cls}" viewBox="-6 -8 80 56" aria-hidden="true"><path pathLength="1" d="M6 37V3l20 34V3"/><path class="monogram__g" pathLength="1" d="M62 9a14 14 0 1 0 0 22V20H50"/><circle class="monogram__dot" cx="64" cy="36" r="3.4"/></svg>`;
  PG.mark = MARK;
  const page = () => document.querySelector("[data-page]")?.dataset.page || "home";
  const NAV = [["home#work", "01", "Work"], ["service", "02", "Services"], ["about", "03", "About"], ["news", "04", "Blog"]];
  const href = (k) => (k === "home#work" ? "index.html#work" : `${k}.html`);
  const navCur = (k) => ((k === "service" && /^service/.test(page())) || (k === "news" && page() === "news") || (k === "about" && page() === "about") ? ' aria-current="page"' : "");

  // ───────── Header row ─────────
  const head = document.querySelector('[data-slot="header"]');
  const drawHead = () => {
    if (!head) return;
    head.className = "site-header wrap";
    head.innerHTML = `
      <a href="index.html" class="brand" aria-label="Studio Name, Home">${MARK("is-plotting")}<span class="brand__name note note--ink" data-label="Name / Role">Studio Name<span class="brand__role"> / web &amp; AI dev</span></span></a>
      <nav class="nav" aria-label="Main menu"><ul>${NAV.map(([k, n, l]) => `<li><a href="${href(k)}" class="nav__link"${navCur(k)}><span class="note" aria-hidden="true">${n}</span><span class="nav__label"><span>${l}</span><span aria-hidden="true">${l}</span></span></a></li>`).join("")}</ul></nav>
      <div class="tools">
        <button class="tool" type="button" data-action="theme" aria-label="Toggle light and dark panels"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z"/></svg></button>
        <button class="tool" type="button" data-action="accent" aria-label="Change accent color"><span class="swatch" aria-hidden="true"></span></button>
        <button class="tool tool--kbd note" type="button" data-action="palette" aria-label="Open command palette (⌘K)">⌘K</button>
        <button class="tool tool--menu note" type="button" data-action="palette" aria-label="Open Menu">Menu</button>
        <a href="about.html#contact" class="btn header-cta">Let's talk</a>
      </div>
      <div class="hd-rule" aria-hidden="true"><span class="hd-rule__fill"><span class="hd-rule__tag note"></span></span></div>`;
  };
  drawHead();

  // ───────── Footer ─────────
  const drawFooter = (scope) => scope.querySelectorAll('[data-slot="footer"]').forEach((f) => {
    if (f.dataset.drawn) return;
    f.dataset.drawn = "1";
    f.className = "site-footer wrap";
    f.innerHTML = `
      <div class="grid-12 footer-top">
        <p class="footer-claim h3" data-label="Closing question + accent link">Got a brief that needs to move? <a href="about.html#contact" class="link link--inline accent">Let's talk.</a></p>
        <div class="footer-col"><p class="note">Site</p><ul><li><a href="index.html#work" class="link">Work</a></li><li><a href="service.html" class="link">Services</a></li><li><a href="about.html" class="link">About</a></li><li><a href="news.html" class="link">Blog</a></li></ul></div>
        <div class="footer-col"><p class="note">Elsewhere</p><ul><li><a href="#" class="link">LinkedIn <span aria-hidden="true">↗</span></a></li><li><a href="#" class="link">Brand <span aria-hidden="true">↗</span></a></li><li><a href="#" class="link">RSS</a></li></ul></div>
        <div class="footer-col"><p class="note">Contact</p><ul><li><a href="about.html#contact" class="link">Send a brief</a></li><li><a href="#" class="link">Book a call <span aria-hidden="true">↗</span></a></li></ul></div>
      </div>
      <div class="footer-sign">
        <p class="footer-mark" aria-hidden="true" data-label="Same signature as the hero headline">I make it.</p>
        <div class="tb note"><dl class="tb__cells"><div style="--i: 0"><dt>Cookies</dt><dd class="tb__val"><span>0</span></dd></div><div style="--i: 1"><dt>Banners</dt><dd class="tb__val"><span>0</span></dd></div><div style="--i: 2"><dt>Ads</dt><dd class="tb__val"><span>0</span></dd></div></dl><p class="tb__cap"><span>Privacy spec · rev. 2026</span><a href="#" class="tb__link">Read →</a></p></div>
      </div>
      <div class="footer-bottom note"><p class="copy"><span>© 2026 Studio Name</span><span>Designed and built here</span></p><span class="hint">Press <kbd>⌥G</kbd> for the grid · <kbd>⌘K</kbd> for everything else</span><nav class="legal-links" aria-label="Legal notice"><a href="#" class="link">Privacy</a><a href="#" class="link">Cookies</a><a href="#" class="link">Accessibility</a></nav></div>`;
  });

  // ───────── First-visit curtain · transition curtain · grid layer · command window ─────────
  const cols12 = "<span></span>".repeat(12);
  document.body.insertAdjacentHTML("afterbegin", `<div class="preloader" aria-hidden="true"><div class="preloader__meta note"><span>Plotting studio.com</span><span>rev. 2026</span></div>${MARK()}<div class="preloader__meta note"><span>Human + machine</span><span class="preloader__count"></span></div></div>`);
  document.body.insertAdjacentHTML("beforeend", `
    <div class="pt" aria-hidden="true"><div class="pt__cols grid-12">${cols12}</div><div class="pt__meta note"><span>Plotting <span class="pt__to"></span></span><span>rev. 2026</span></div>
      <div class="pt__stage"><span class="pt__guide pt__guide--h" style="top:0"></span><span class="pt__guide pt__guide--h" style="bottom:0"></span><span class="pt__guide pt__guide--v" style="left:0"></span><span class="pt__guide pt__guide--v" style="right:0"></span><div class="pt__box"><span class="pt__label note" data-text="SN · 68×40"></span></div>${MARK("pt__mark")}</div>
      <div class="pt__meta note"><span>Studio Name · web &amp; AI dev</span><span class="pt__count">0%</span></div></div>
    <div class="grid-overlay" aria-hidden="true"><div class="grid-12">${cols12}</div></div>
    <div class="palette" role="dialog" aria-modal="true" aria-label="Command Window"><div class="palette__box"><input class="palette__input" type="text" placeholder="Search pages, posts, actions…" aria-label="Find command"><div class="palette__list" role="listbox"></div></div></div>`);

  // ───────── Theme · accent color · grid · command palette ─────────
  const ACC = ["blue", "orange", "lime"];
  const setTheme = (t) => { html.dataset.theme = t; try { localStorage.setItem("pg-theme", t); } catch {} };
  const nextAccent = () => {
    const cur = html.dataset.accent || "blue", n = ACC[(ACC.indexOf(cur) + 1) % ACC.length];
    if (n === "blue") delete html.dataset.accent; else html.dataset.accent = n;
    try { localStorage.setItem("pg-accent", n); } catch {}
  };
  const toggleGrid = () => { html.dataset.grid = html.dataset.grid === "on" ? "off" : "on"; };
  const pal = document.querySelector(".palette"), palIn = pal.querySelector(".palette__input"), palList = pal.querySelector(".palette__list");
  const CMDS = [
    ["Home", () => go("index.html"), "/", "Go to"], ["Work", () => go("index.html#work"), "/#work", "Go to"], ["Services", () => go("service.html"), "/services/", "Go to"],
    ["AI in products", () => go("service-detail.html"), "/services/ai/", "Go to"], ["About", () => go("about.html"), "/about/", "Go to"], ["Blog", () => go("news.html"), "/blog/", "Go to"],
    ["Case study", () => go("detail.html"), "/work/", "Go to"], ["Toggle light / dark", () => setTheme(html.dataset.theme === "dark" ? "light" : "dark"), "theme", "Actions"],
    ["Change accent", nextAccent, "accent", "Actions"], ["Toggle grid", toggleGrid, "⌥G", "Actions"],
  ];
  let palIdx = 0;
  const drawPal = () => {
    const q = palIn.value.trim().toLowerCase();
    const list = CMDS.filter(([n]) => n.toLowerCase().includes(q));
    palIdx = Math.min(palIdx, Math.max(0, list.length - 1));
    let group = "";
    palList.innerHTML = list.map(([n, , path, g], i) => `${g !== group ? `<p class="palette__group note">${(group = g)}</p>` : ""}<button type="button" class="palette__item${i === palIdx ? " is-active" : ""}" role="option" data-i="${CMDS.findIndex((c) => c[0] === n)}"><span>${n}</span><span class="note">${path}</span></button>`).join("");
  };
  const openPal = () => { pal.classList.add("is-open"); palIn.value = ""; palIdx = 0; drawPal(); palIn.focus(); };
  const closePal = () => pal.classList.remove("is-open");
  palIn.addEventListener("input", drawPal);
  palIn.addEventListener("keydown", (e) => {
    const items = [...palList.querySelectorAll(".palette__item")];
    if (e.key === "ArrowDown") { palIdx = (palIdx + 1) % Math.max(1, items.length); drawPal(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { palIdx = (palIdx - 1 + items.length) % Math.max(1, items.length); drawPal(); e.preventDefault(); }
    else if (e.key === "Enter") { items[palIdx]?.click(); }
  });
  palList.addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (!b) return; closePal(); CMDS[+b.dataset.i][1](); });
  pal.addEventListener("click", (e) => { if (e.target === pal) closePal(); });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action]");
    if (!t) return;
    const a = t.dataset.action;
    if (a === "theme") setTheme(html.dataset.theme === "dark" ? "light" : "dark");
    else if (a === "accent") nextAccent();
    else if (a === "palette") openPal();
  });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.classList.contains("is-open") ? closePal() : openPal(); }
    else if (e.altKey && !e.metaKey && !e.ctrlKey && e.code === "KeyG") { e.preventDefault(); toggleGrid(); }
    else if (e.key === "Escape") closePal();
  });

  // ───────── Transition curtain — cover and peel ─────────
  const pt = document.querySelector(".pt");
  const ptParts = () => ({
    cols: [...pt.querySelectorAll(".pt__cols span")], meta: [...pt.querySelectorAll(".pt__meta")], stage: pt.querySelector(".pt__stage"),
    gh: [...pt.querySelectorAll(".pt__guide--h")], gv: [...pt.querySelectorAll(".pt__guide--v")], box: pt.querySelector(".pt__box"), label: pt.querySelector(".pt__label"),
    paths: [...pt.querySelectorAll(".pt__mark path")], dot: pt.querySelector(".pt__mark circle"), to: pt.querySelector(".pt__to"), count: pt.querySelector(".pt__count"),
  });
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·×";
  const typeIn = (node, text, dur = 0.5) => {
    const s = { p: 0 };
    return gsap.to(s, { p: 1, duration: dur, ease: "none", onUpdate() {
      const n = Math.floor(s.p * text.length);
      let out = text.slice(0, n);
      for (let i = n; i < Math.min(text.length, n + 3); i++) out += text[i] === " " ? " " : LETTERS[(Math.random() * LETTERS.length) | 0];
      node.textContent = out;
    }, onComplete() { node.textContent = text; } });
  };
  let ptTl = null;
  const cover = (to) => {
    const p = ptParts(), c = { n: 0 };
    ptTl?.kill();
    gsap.set(pt, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(p.stage, { yPercent: 0, opacity: 1 });
    gsap.set(p.cols, { scaleY: 0, transformOrigin: "50% 100%" });
    gsap.set(p.meta, { opacity: 0 });
    gsap.set(p.gh, { scaleX: 0, transformOrigin: "0% 50%" });
    gsap.set(p.gv, { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.set(p.box, { opacity: 0 });
    gsap.set(p.paths, { strokeDashoffset: 1 });
    gsap.set(p.dot, { scale: 0, transformOrigin: "50% 50%" });
    p.label.textContent = ""; p.to.textContent = ""; p.count.textContent = "0%";
    return new Promise((done) => {
      ptTl = gsap.timeline({ onComplete: done })
        .to(pt, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power4.inOut" })
        .to(p.cols, { scaleY: 1, duration: 0.7, ease: "expo.inOut", stagger: 0.025 }, 0.1)
        .to(p.meta, { opacity: 1, duration: 0.3 }, 0.35)
        .add(typeIn(p.to, new URL(to, location.href).pathname.split("/").pop().replace(/\.html$/, "").toUpperCase() || "INDEX", 0.45), 0.4)
        .to(c, { n: 100, duration: 0.75, ease: "power2.inOut", onUpdate: () => { p.count.textContent = `${Math.round(c.n)}%`; } }, 0.35)
        .to(p.gh, { scaleX: 1, duration: 0.6, ease: "expo.inOut", stagger: 0.05 }, 0.3)
        .to(p.gv, { scaleY: 1, duration: 0.6, ease: "expo.inOut", stagger: 0.05 }, 0.36)
        .to(p.box, { opacity: 1, duration: 0.25 }, 0.55)
        .add(typeIn(p.label, p.label.dataset.text || "", 0.35), 0.55)
        .to(p.paths, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut", stagger: 0.08 }, 0.45)
        .to(p.dot, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0.9);
    });
  };
  const reveal = () => {
    if (getComputedStyle(pt).visibility === "hidden") return Promise.resolve();
    const p = ptParts();
    return new Promise((done) => {
      ptTl = gsap.timeline({ onComplete: () => { gsap.set(pt, { visibility: "hidden" }); done(); } })
        .to(p.gh, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.45, ease: "expo.in" }, 0)
        .to(p.gv, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.45, ease: "expo.in" }, 0)
        .to([p.box, ...p.meta], { opacity: 0, duration: 0.2 }, 0.1)
        .to(p.stage, { yPercent: -60, opacity: 0, duration: 0.6, ease: "power3.in" }, 0.1)
        .to(pt, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "power4.inOut" }, 0.2);
    });
  };

  // ───────── Showcase motion ─────────
  let lenis = null;
  const EXPO = (t) => Math.min(1, 1.001 - 2 ** (-10 * t));
  const startLenis = () => {
    if (lenis || reduced || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.15, easing: EXPO, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
    PG.lenis = lenis;
  };
  const stopLenis = () => { if (!lenis) return; lenis.destroy(); lenis = null; window.lenis = null; PG.lenis = null; };

  // Line fill — only when the mouse has actually moved, set data-hot on the line under the hand (so lines passing by on scroll don’t get painted)
  const fills = () => {
    let hot = null;
    const set = (n) => { if (n === hot) return; hot?.removeAttribute("data-hot"); hot = n; hot?.setAttribute("data-hot", ""); };
    const mv = (e) => { if (e.pointerType !== "touch" && (e.movementX || e.movementY)) set(e.target.closest("[data-fill]")); };
    const out = (e) => { if (hot && !hot.contains(e.relatedTarget)) set(null); };
    const sc = () => { if (hot && !hot.matches(":hover")) set(null); };
    html.classList.add("fill-js");
    addEventListener("pointermove", mv, { passive: true });
    addEventListener("pointerout", out, { passive: true });
    addEventListener("scroll", sc, { passive: true });
    return () => { removeEventListener("pointermove", mv); removeEventListener("pointerout", out); removeEventListener("scroll", sc); set(null); html.classList.remove("fill-js"); };
  };
  const hashLinks = () => {
    const on = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href*='#']");
      if (!a || a.target) return;
      const u = new URL(a.href);
      if (!u.hash || u.pathname !== location.pathname) return;
      const t = document.getElementById(decodeURIComponent(u.hash.slice(1)));
      if (!t) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(t) : t.scrollIntoView();
      history.replaceState(history.state, "", u.hash);
    };
    document.addEventListener("click", on, true);
    return () => document.removeEventListener("click", on, true);
  };
  const faqs = (scope) => {
    const offs = [];
    scope.querySelectorAll("details.faq").forEach((d) => {
      const sum = d.querySelector("summary"), body = sum?.nextElementSibling;
      if (!sum || !body) return;
      let tl;
      const tidy = () => { gsap.set(d, { clearProps: "height,overflow" }); gsap.set(body, { clearProps: "opacity,transform" }); ScrollTrigger.refresh(); };
      const click = (e) => {
        e.preventDefault();
        tl?.kill();
        const h0 = d.offsetHeight;
        if (!d.open || d.hasAttribute("data-closing")) {
          d.removeAttribute("data-closing");
          d.open = true;
          gsap.set(d, { height: "auto" });
          const h1 = d.offsetHeight;
          tl = gsap.timeline({ onComplete: tidy })
            .fromTo(d, { height: h0, overflow: "hidden" }, { height: h1, duration: 0.7, ease: "expo.out" }, 0)
            .fromTo(body, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, 0.08);
        } else {
          d.setAttribute("data-closing", "");
          const h1 = sum.offsetHeight + d.offsetHeight - d.clientHeight;
          tl = gsap.timeline({ onComplete: () => { d.open = false; d.removeAttribute("data-closing"); tidy(); } })
            .fromTo(d, { height: h0, overflow: "hidden" }, { height: h1, duration: 0.5, ease: "power3.inOut" }, 0)
            .to(body, { opacity: 0, y: -6, duration: 0.3, ease: "power2.in" }, 0);
        }
      };
      sum.addEventListener("click", click);
      offs.push(() => { sum.removeEventListener("click", click); tl?.kill(); d.removeAttribute("data-closing"); });
    });
    return () => offs.forEach((f) => f());
  };
  const maskPad = (split) => split.masks.forEach((m) => { m.style.paddingBottom = "0.12em"; m.style.marginBottom = "-0.12em"; });
  const reveals = (scope) => {
    const splits = [];
    gsap.utils.toArray("[data-reveal='lines']", scope).forEach((el) => {
      splits.push(SplitText.create(el, { type: "lines", mask: "lines", aria: "none", autoSplit: true, onSplit: (s) => { maskPad(s); return gsap.from(s.lines, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: el, start: "top 85%", once: true } }); } }));
    });
    const ups = gsap.utils.toArray("[data-reveal='up']", scope).filter((el) => el.getBoundingClientRect().top > innerHeight * 0.88);
    if (ups.length) {
      gsap.set(ups, { autoAlpha: 0, y: 48, force3D: true });
      ScrollTrigger.batch(ups, { start: "top 88%", once: true, onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, duration: 1.3, ease: "power3.out", stagger: 0.09, overwrite: true, clearProps: "transform,opacity,visibility" }) });
    }
    gsap.utils.toArray("[data-draw]", scope).forEach((el) => gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", ease: "power4.inOut", scrollTrigger: { trigger: el, start: "top 90%", end: "top 45%", scrub: true } }));
    gsap.utils.toArray("[data-parallax]", scope).forEach((el) => { const n = +el.dataset.parallax || 12; gsap.fromTo(el, { yPercent: -n }, { yPercent: n, force3D: true, ease: "none", scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true } }); });
    gsap.utils.toArray("[data-plot]", scope).forEach((el) => {
      const strokes = el.querySelectorAll('[pathLength="1"]'), dots = el.querySelectorAll("[data-plot-dot]"), bars = el.querySelectorAll("[data-plot-fill]"), texts = el.querySelectorAll("text");
      const share = (n, each, total) => Math.min(each, total / Math.max(n, 1));
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 60%", scrub: true } });
      const st = share(strokes.length, 0.12, 0.9);
      tl.fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: st }, 0);
      strokes.forEach((s, i) => { if (s.hasAttribute("data-plot-solid")) tl.fromTo(s, { fillOpacity: 0 }, { fillOpacity: 1 }, i * st); });
      if (dots.length) tl.fromTo(dots, { scale: 0 }, { scale: 1, transformOrigin: "50% 50%", stagger: share(dots.length, 0.06, 0.6), ease: "back.out(3)" }, 0.3);
      if (bars.length) tl.fromTo(bars, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", stagger: share(bars.length, 0.06, 0.5) }, 0.35);
      if (texts.length) tl.fromTo(texts, { opacity: 0 }, { opacity: 1, stagger: share(texts.length, 0.05, 0.4) }, 0.4);
    });
    return () => splits.forEach((s) => s.revert());
  };
  // Hero — blueprint layers (spec-box-intro) → title lines rise from 110% (1.1s expo.out .08) → outline interiors fill in (--fill .7s) → subtitle generates (token-stream-words) → remaining text (16px up from below, 1s expo.out .08) → blueprint lifts away
  const heroIntro = (scope, delay) => {
    const hero = scope.querySelector("[data-hero]");
    if (!hero) return null;
    const human = hero.querySelector("[data-hero-human]"), gen = hero.querySelector("[data-hero-generate]");
    const bp = hero.matches('[data-fx~="spec-box-intro"]');
    const tl = gsap.timeline({ delay });
    let split = null;
    if (human) {
      split = SplitText.create(human, { type: "lines", mask: "lines", aria: "none" });
      maskPad(split);
      gsap.set(human, { "--fill": 0 });
      tl.from(split.lines, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08 }, bp ? 0.55 : 0)
        .to(human, { "--fill": 1, duration: 0.7, ease: "power2.inOut" }, bp ? 1.35 : 0.8);
    }
    const fades = hero.querySelectorAll("[data-hero-fade]");
    gsap.set(fades, { opacity: 0, y: 16 });
    const finish = (at) => {
      tl.to(fades, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, at);
      if (bp) tl.add(() => hero.dispatchEvent(new CustomEvent("fx:clear")), at + 1 + 0.08 * Math.max(0, fades.length - 1) + 0.2);
    };
    if (gen) {
      const at = bp ? 1.6 : 0.8;
      gen.addEventListener("fx:start", (e) => finish(at + e.detail.duration - 0.6), { once: true });
      tl.add(() => gen.dispatchEvent(new CustomEvent("fx:play", { detail: { delay: 0 } })), at);
    } else finish(bp ? 1.6 : 0.8);
    // As in the original, the contour terrain is attached in the idle gap after the first-screen sequence ends (including 1.3s of the drawing lifting away) — only with a fine pointer and above 900
    let terrainTimer = 0;
    if (hero.hasAttribute("data-terrain") && matchMedia("(pointer: fine) and (min-width: 900px)").matches) {
      tl.eventCallback("onComplete", () => {
        terrainTimer = setTimeout(() => {
          const add = () => { if (hero.isConnected && !/contour-terrain-gl/.test(hero.dataset.fx || "")) hero.dataset.fx = `${hero.dataset.fx || ""} contour-terrain-gl`.trim(); };
          "requestIdleCallback" in window ? requestIdleCallback(add, { timeout: 1500 }) : setTimeout(add, 200);
        }, bp ? 1300 : 0);
      });
    }
    return () => { clearTimeout(terrainTimer); tl.kill(); split?.revert(); gsap.set(human, { clearProps: "--fill" }); gsap.set(fades, { clearProps: "opacity,transform" }); };
  };

  // ───────── Attaching and detaching pages ─────────
  let unmount = null;
  const showcase = () => html.dataset.motion === "showcase";
  const view = (first) => {
    const scope = document.querySelector("[data-page]")?.closest("#swup") || document.body;
    drawFooter(scope);
    drawHead();
    const motion = (document.querySelector("[data-page]")?.dataset.motion) || "showcase";
    html.dataset.motion = motion;
    cursorFor(motion);
    const offs = [];
    if (showcase() && !reduced) {
      startLenis();
      offs.push(fills(), hashLinks(), faqs(scope));
      const delay = first && firstVisit ? 1.45 : 0.1;
      html.classList.add("motion-ready");
      const go = () => { offs.push(heroIntro(scope, delay) || (() => {}), reveals(scope)); ScrollTrigger.refresh(); };
      document.fonts.ready.then(go);
    } else {
      stopLenis();
      html.classList.add("motion-ready");
    }
    const own = PG.pages[document.querySelector("[data-page]")?.dataset.page]?.mount?.(scope);
    if (own) offs.push(own);
    unmount = () => { offs.forEach((f) => f?.()); };
    try { sessionStorage.setItem("pg-preloaded", "1"); } catch {}
  };
  const leave = () => {
    unmount?.();
    unmount = null;
    ScrollTrigger.getAll().forEach((t) => { if (!t.vars?.trigger?.closest?.("[data-fx]")) t.kill(); });
    html.dataset.preloaded = "yes";
  };

  // ───────── Page turn (swup) ─────────
  const go = (url) => (PG.swup ? PG.swup.navigate(url) : (location.href = url));
  PG.go = go;
  const boot = () => {
    view(true);
    if (!/^https?:$/.test(location.protocol) || !window.Swup) return;
    const plugins = [];
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ persistAssets: true }));
    const swup = new Swup({ containers: ["#swup"], animationSelector: false, cache: true, ignoreVisit: (url, { el } = {}) => !!el?.closest("[data-no-swup]") || (el?.getAttribute?.("href") || "").startsWith("#"), plugins });
    PG.swup = swup;
    swup.hooks.before("animation:out:await", async (v) => { if (!reduced) await cover(v.to.url); });
    swup.hooks.before("content:replace", leave);
    swup.hooks.on("content:replace", () => { lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0); });
    swup.hooks.on("page:view", () => {
      view(false);
      const m = head?.querySelector(".monogram");
      if (m && !reduced) { m.classList.remove("is-plotting"); void m.getBoundingClientRect(); m.classList.add("is-plotting"); }
      if (!reduced) reveal();
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot, { once: true }) : boot();
})();
