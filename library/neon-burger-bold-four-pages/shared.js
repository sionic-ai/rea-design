// What one whole site shares — Lenis (lerp .165 · wheel 1.25), barba 2.10.3 transitions, loader, flowing band, menu drawer, reveals (title · paragraph · button), sticker pop, inertia hover, press lightning.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const TB = (window.TB = { reduce, fine, pages: window.TBP || {}, cleanups: [] });
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  if (window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin);
  const E = (TB.ease = {
    quart: CustomEase.create("quartOut", "0.26, 1.00, 0.48, 1.00"),
    expoOut: CustomEase.create("expoOut", "0.14, 1.00, 0.34, 1.00"),
    nav: CustomEase.create("nav", "0.33, 1.00, 0.68, 1.00"),
    osmo: CustomEase.create("osmo", "0.625, 0.05, 0, 1"),
    cubic: CustomEase.create("cubic", "0.66, 0.00, 0.34, 1.00"),
    expo: CustomEase.create("expo", "0.90, 0.00, 0.10, 1.00"),
    pop: CustomEase.create("popIn", "M0,0 C0.14,1 0.34,1 1,1"),
    shard: CustomEase.create("iconShard", "M0,0 C0.34,1.56 0.64,1 1,1"),
    quick: CustomEase.create("quick", "M0,0 C0.34,1.56 0.64,1 1,1"),
  });
  gsap.defaults({ ease: E.osmo, duration: 0.6 });

  // Smooth scroll
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const lerp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--kf-scroll-lerp")) || 0.165;
  const lenis = (TB.lenis = reduce ? null : new Lenis({ lerp, wheelMultiplier: 1.25 }));
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    // Same-page anchor — 1.5s custom curve, 110px margin below the header line
    const osmo = (t) => gsap.parseEase("osmo")(t);
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      const el = a && a.getAttribute("href").length > 1 && document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      e.preventDefault(); lenis.scrollTo(el, { duration: 1.5, easing: osmo, offset: -110 });
    });
  }

  // Flowing band — duplicates the group 8 times and loops xPercent −100 over 25 × (group width / screen width) seconds, moving left when scrolling down and right when scrolling up, while the band itself shifts 3vw → −3vw across the whole page
  const marquee = document.querySelector(".t-marquee");
  if (marquee && !reduce) {
    const scroll = marquee.querySelector(".t-marquee__scroll"), set = marquee.querySelector(".t-marquee__set");
    for (let k = 0; k < 8; k++) scroll.append(set.cloneNode(true));
    const sets = marquee.querySelectorAll(".t-marquee__set");
    const h = innerWidth < 479 ? 0.25 : innerWidth < 991 ? 0.5 : 1;
    const tw = gsap.to(sets, { xPercent: -100, repeat: -1, duration: 25 * (set.offsetWidth / innerWidth) * h, ease: "none" }).totalProgress(0.5);
    gsap.set(sets, { xPercent: -100 });
    tw.timeScale(-1).play();
    ScrollTrigger.create({ id: "persistent-marquee-dir", trigger: document.body, start: "top top", end: "bottom bottom", onUpdate: (s) => tw.timeScale(s.direction === 1 ? 1 : -1) });
    gsap.fromTo(scroll, { x: "3vw" }, { x: "-3vw", ease: "none", scrollTrigger: { id: "persistent-marquee-scroll", trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0 } });
  }

  // Menu drawer — drops from the top with the default osmo curve in .6s and the backdrop darkens
  const drawer = document.querySelector(".t-drawer"), backdrop = document.querySelector(".t-backdrop"), toggle = document.querySelector(".t-menu-toggle");
  const openTl = gsap.timeline({ paused: true }).to(drawer, { y: 0 }).to(backdrop, { autoAlpha: 1 }, "<");
  const closeTl = gsap.timeline({ paused: true }).to(drawer, { y: "-100%" }).to(backdrop, { autoAlpha: 0 }, "<");
  TB.closeMenu = () => {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("is-menu-open");
    openTl.pause(); closeTl.restart(); lenis && lenis.start();
  };
  toggle.addEventListener("click", () => {
    if (toggle.getAttribute("aria-expanded") === "true") return TB.closeMenu();
    toggle.setAttribute("aria-expanded", "true"); document.body.classList.add("is-menu-open");
    closeTl.pause(); openTl.restart(); lenis && lenis.stop();
  });
  backdrop.addEventListener("click", TB.closeMenu);
  addEventListener("keydown", (e) => e.key === "Escape" && TB.closeMenu());

  // Language pill — on hover or press the pill grows to the list size in .45s back.out(1.4), the flag button disappears in .15s and the list appears in .25s (after .05s),
  // Other items rise from 40% below at .05s intervals. Lime marker after the current item
  const lang = document.querySelector(".t-lang");
  if (lang) {
    const pill = lang.querySelector(".t-lang__pill"), btn = lang.querySelector(".t-lang__btn"), list = lang.querySelector(".t-lang__list");
    const links = [...list.querySelectorAll("a")], ind = list.querySelector(".t-lang__ind"), act = Math.max(0, links.findIndex((a) => a.hasAttribute("data-active")));
    let open = false, tl = null;
    const place = (a) => gsap.set(ind, { x: a.offsetLeft, y: a.offsetTop + a.parentElement.offsetTop, width: a.offsetWidth, height: a.offsetHeight });
    const show = () => {
      if (open) return; open = true; btn.setAttribute("aria-expanded", "true");
      const w = pill.offsetWidth, h = pill.offsetHeight;
      tl && tl.kill(); gsap.set(list, { visibility: "inherit" }); place(links[act]);
      gsap.set(pill, { width: w, height: h });
      tl = gsap.timeline().to(pill, { width: list.offsetWidth, height: list.offsetHeight, duration: reduce ? 0 : 0.45, ease: "back.out(1.4)" }, 0)
        .to(btn, { autoAlpha: 0, duration: reduce ? 0 : 0.15, ease: "power1.out" }, 0)
        .to(list, { opacity: 1, duration: reduce ? 0 : 0.25, ease: "power1.out" }, 0.05)
        .fromTo(links.filter((_, k) => k !== act), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: reduce ? 0 : 0.25, ease: "power2.out", stagger: 0.05 }, 0.05);
    };
    const hide = () => {
      if (!open) return; open = false; btn.setAttribute("aria-expanded", "false");
      tl && tl.kill();
      tl = gsap.timeline({ onComplete: () => { gsap.set(pill, { clearProps: "width,height" }); gsap.set(list, { visibility: "hidden" }); } })
        .to(pill, { width: btn.offsetWidth, height: btn.offsetHeight, duration: reduce ? 0 : 0.3, ease: "power3.out" }, 0)
        .to(list, { opacity: 0, duration: reduce ? 0 : 0.15, ease: "power1.out" }, 0)
        .to(btn, { autoAlpha: 1, duration: reduce ? 0 : 0.25, ease: "power1.out" }, reduce ? 0 : 0.1);
    };
    if (fine) { lang.addEventListener("pointerenter", show); lang.addEventListener("pointerleave", hide); }
    btn.addEventListener("click", () => (open ? hide() : show()));
    document.addEventListener("pointerdown", (e) => { if (open && !lang.contains(e.target)) hide(); });
    links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); hide(); }));
    links.forEach((a) => a.addEventListener("pointerenter", () => gsap.to(ind, { x: a.offsetLeft, y: a.offsetTop + a.parentElement.offsetTop, width: a.offsetWidth, duration: 0.3, ease: E.nav })));
  }

  // Scroll direction — while scrolling down past 50px, the logo hides to the left (direction changes only on moves over 10px)
  let lastY = 0, dir = "up", started = "false";
  const onDir = () => {
    const y = Math.max(lenis ? lenis.scroll : scrollY, 0);
    if (toggle.getAttribute("aria-expanded") === "true") { lastY = y; return; }
    if (Math.abs(lastY - y) < 10) return;
    const d = y > lastY ? "down" : "up", s = y > 50 ? "true" : "false";
    if (d !== dir) { document.body.dataset.scrollingDirection = d; dir = d; }
    if (s !== started) { document.body.dataset.scrollingStarted = s; started = s; }
    lastY = y;
  };
  lenis ? lenis.on("scroll", onDir) : addEventListener("scroll", onDir, { passive: true });

  // Hero entrance (after the loader, and every time after a transition): title lines 150%→0 .6s at .1 intervals (after .2s), subtitle lines after .45s, lightning bolt turns on at .15s and settles over .4s expoOut, strip .46s, button 1.3x→1
  let heroSplit = null, heroTl = null;
  TB.heroPrep = (root) => {
    heroSplit && heroSplit.revert(); heroSplit = null;
    const h1 = root.querySelector(".t-hero h1");
    if (!h1 || reduce) return;
    gsap.set(root.querySelectorAll(".t-hero .t-bolt"), { opacity: 0 });
    gsap.set(root.querySelectorAll(".t-hero .t-btn"), { opacity: 0, "--btn-intro-scale": 1.3 });
    heroSplit = SplitText.create(h1, { type: "lines", mask: "lines", linesClass: "t-line" });
    heroSplit.masks && heroSplit.masks.forEach((m) => m.classList.add("t-line-mask"));
    heroTl = gsap.timeline({ paused: true }).from(heroSplit.lines, { duration: 0.6, yPercent: 150, stagger: 0.1, ease: E.quart, delay: 0.2 }, 0);
    const sub = root.querySelectorAll(".t-hero__sub");
    if (sub.length) { const s2 = SplitText.create(sub, { type: "lines" }); heroTl.from(s2.lines, { autoAlpha: 0, yPercent: 100, duration: 0.6, stagger: 0.05, ease: E.quart, delay: 0.45 }, 0); }
  };
  TB.heroIn = (root) => {
    document.body.classList.add("nav-in");
    if (reduce) return;
    const bolts = root.querySelectorAll(".t-hero .t-bolt");
    if (bolts.length) gsap.timeline().to(bolts, { opacity: 1, duration: 0.15, stagger: 0.05, delay: 0.2 }).to(bolts, { x: 0, y: 0, duration: 0.4, ease: E.expoOut, stagger: 0.05 }, "<");
    const tl = gsap.timeline();
    tl.to(".t-marquee", { y: 0, duration: 0.46, ease: E.nav });
    const btn = root.querySelector(".t-hero .t-btn");
    if (btn) tl.fromTo(btn, { "--btn-intro-scale": 1.3 }, { "--btn-intro-scale": 1, opacity: 1, duration: 0.33, delay: 0.04, ease: E.quart });
    heroTl && heroTl.play();
  };

  // Section reveal — titles: masked lines rise from 150% below in .6s (.1 stagger), paragraphs: each line from 100% below and transparent in .6s (.05), buttons: from 1.12× and transparent in .33s. Triggered at 80% of the screen (buttons 90%)
  const R = {
    title: { sel: "h1, h2, h3", ex: ".t-hero h1", split: true, mask: true, from: { yPercent: 150 }, to: { yPercent: 0, duration: 0.6, ease: E.quart }, stagger: 0.1, start: "top 80%" },
    text: { sel: "p", ex: ".t-hero p, p:has(.t-btn)", split: true, from: { autoAlpha: 0, yPercent: 100 }, to: { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: E.quart }, stagger: 0.05, start: "top 80%" },
    btn: { sel: ".t-btn", ex: ".t-hero .t-btn, .t-map .t-btn", split: false, from: { opacity: 0, "--btn-intro-scale": 1.12 }, to: { opacity: 1, "--btn-intro-scale": 1, duration: 0.33, ease: E.quart }, stagger: 0.05, start: "top 90%" },
  };
  TB.reveals = (root) => {
    if (reduce) return;
    Object.entries(R).forEach(([key, cfg]) => {
      const set = new Set();
      root.querySelectorAll(`[data-${key}-reveal]`).forEach((el) => (el.matches(cfg.sel) ? set.add(el) : el.querySelectorAll(cfg.sel).forEach((x) => set.add(x))));
      [...set].filter((el) => !el.matches(cfg.ex)).forEach((el) => {
        let targets = [el];
        if (cfg.split) {
          const sp = SplitText.create(el, cfg.mask ? { type: "lines", mask: "lines", linesClass: "t-line" } : { type: "lines", linesClass: "t-line" });
          if (sp.masks) sp.masks.forEach((m) => m.classList.add("t-line-mask"));
          targets = sp.lines;
          TB.cleanups.push(() => sp.revert());
        }
        gsap.set(targets, cfg.from);
        ScrollTrigger.create({ trigger: el, start: el.closest("[data-reveal-start]")?.dataset.revealStart || cfg.start, once: true, onEnter: () => gsap.to(targets, { ...cfg.to, stagger: cfg.stagger }) });
      });
    });
    // Sticker: from −20° and 0x, popIn(.14,1,.34,1) in .5s, at 95% of the screen
    root.querySelectorAll("[data-pop-in]").forEach((el) => gsap.from(el, { rotate: -20, scale: 0, duration: 0.5, ease: E.pop, transformOrigin: "50% 50%", scrollTrigger: { trigger: el, start: "top 95%", once: true } }));
    // Sparkle shards: from 0 scale with iconShard in .35s, .06s per shard, .08s later per sibling order
    root.querySelectorAll("[data-icon-reveal]").forEach((el, k) => gsap.from(el.querySelectorAll("path, polygon"), { scale: 0, transformOrigin: "50% 50%", duration: 0.35, ease: E.shard, stagger: 0.06, delay: 0.08 * (k % 4), scrollTrigger: { trigger: el, start: "top 85%", once: true } }));
    // Slides in from off-screen right 1.4s expo.out
    root.querySelectorAll("[data-slide-in]").forEach((el) => gsap.from(el, { x: () => innerWidth - el.getBoundingClientRect().left + gsap.getProperty(el, "x"), duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: el, start: el.dataset.slideInStart || "top 85%", once: true, invalidateOnRefresh: true } }));
    // Parallax: default 20 → −20(%) while the section passes through the screen
    root.querySelectorAll('[data-parallax="trigger"]').forEach((t) => {
      const target = t.querySelector('[data-parallax="target"]') || t;
      gsap.fromTo(target, { yPercent: parseFloat(t.dataset.parallaxStart ?? 20) }, { yPercent: parseFloat(t.dataset.parallaxEnd ?? -20), ease: "none", scrollTrigger: { trigger: t, start: `clamp(${t.dataset.parallaxScrollStart || "top bottom"})`, end: "clamp(bottom top)", scrub: true } });
    });
  };

  // Inertia hover — strike the photo with the speed and position the cursor came in at (speed ×30 · rotation ×20, limits 1080 · 60) and settle back in place with resistance 200
  const vel = { px: 0, py: 0, vx: 0, vy: 0, last: 0, raf: 0 };
  addEventListener("mousemove", (e) => {
    if (vel.raf) return;
    vel.raf = requestAnimationFrame(() => {
      const now = performance.now();
      if (now - vel.last > 100) { vel.px = e.clientX; vel.py = e.clientY; }
      vel.last = now; vel.vx = e.clientX - vel.px; vel.vy = e.clientY - vel.py; vel.px = e.clientX; vel.py = e.clientY; vel.raf = 0;
    });
  }, { passive: true });
  const c1080 = gsap.utils.clamp(-1080, 1080), c60 = gsap.utils.clamp(-60, 60);
  TB.momentum = (root) => {
    if (!fine || reduce || !window.InertiaPlugin) return;
    root.querySelectorAll("[data-momentum-hover-element]").forEach((el) => el.addEventListener("mouseenter", (e) => {
      const t = el.querySelector("[data-momentum-hover-target]");
      if (!t) return;
      const idle = performance.now() - vel.last > 100, vx = idle ? 0 : vel.vx, vy = idle ? 0 : vel.vy;
      const r = t.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const torque = (dx * vy - dy * vx) / (Math.hypot(dx, dy) || 1);
      const m = new DOMMatrix(getComputedStyle(el).transform), a = Math.atan2(m.b, m.a), c = Math.cos(a), s = Math.sin(a);
      gsap.to(t, { inertia: { x: { velocity: c1080(30 * (vx * c + vy * s)), end: 0 }, y: { velocity: c1080(30 * (-vx * s + vy * c)), end: 0 }, rotation: { velocity: c60(20 * torque), end: 0 }, resistance: 200 } });
    }));
  };

  // Press lightning — from the pressed spot four pieces stretch out starting at −172.5° at 35° intervals (.16s quick), then vanish from the tail (.18s), up to 14 at a time
  const shardHost = document.createElement("div"); shardHost.className = "t-shards"; shardHost.setAttribute("aria-hidden", "true"); document.body.append(shardHost);
  const SHAPES = [["0 0 22 6", "0,3 22,0 22,6"], ["0 0 26 8", "0,4 26,0 20,4 26,8"], ["0 0 18 6", "0,3 18,0 18,6"], ["0 0 24 7", "0,3.5 24,0 16,3.5 24,7"]];
  const bursts = [];
  const burst = (x, y) => {
    if (bursts.length >= 14) bursts.shift().progress(1);
    const b = document.createElement("div"); b.className = "t-shards__burst"; b.style.transform = `translate(${x}px, ${y}px)`; shardHost.append(b);
    const base = -172.5 + gsap.utils.random(-8, 8);
    const tl = gsap.timeline({ onComplete: () => { b.remove(); const i = bursts.indexOf(tl); i > -1 && bursts.splice(i, 1); } });
    for (let k = 0; k < 4; k++) {
      const [vb, pts] = SHAPES[k], [, , w, h] = vb.split(" ").map(Number);
      const arm = document.createElement("div"); arm.className = "t-shards__arm";
      arm.innerHTML = `<svg viewBox="${vb}"><polygon points="${pts}"/></svg>`; b.append(arm);
      const svg = arm.firstChild, sc = gsap.utils.random(0.7, 0.9), gap = gsap.utils.random(8, 11), run = gsap.utils.random(5, 8), d0 = 0.03 * Math.random();
      gsap.set(arm, { rotation: base + 35 * k + gsap.utils.random(-6, 6) });
      gsap.set(svg, { width: w * sc, height: h * sc, x: gap, yPercent: -50, scaleX: 0, transformOrigin: "0% 50%" });
      tl.to(svg, { scaleX: 1, x: gap + 0.5 * run, duration: 0.16, ease: E.quick }, d0).set(svg, { transformOrigin: "100% 50%" }, d0 + 0.16).to(svg, { scaleX: 0, x: gap + run, duration: 0.18, ease: "power2.out" }, d0 + 0.16);
    }
    bursts.push(tl);
  };
  if (!reduce) document.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" && e.button === 0 && !e.target.closest("input, textarea, select")) burst(e.clientX, e.clientY); }, { passive: true });

  // Per-page setup and teardown
  const enterPage = (container) => {
    const ns = container.dataset.barbaNamespace;
    document.querySelectorAll(".t-drawer a").forEach((a) => (a.getAttribute("href") === `${ns}.html` ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    TB.reveals(container);
    TB.momentum(container);
    const f = TB.pages[ns];
    if (f) { const c = f(container); if (typeof c === "function") TB.cleanups.push(c); }
  };
  const leavePage = () => {
    TB.cleanups.splice(0).forEach((f) => f());
    ScrollTrigger.getAll().forEach((t) => { if (!String(t.vars.id || "").startsWith("persistent")) t.kill(); });
  };

  // Loader — the logo appears on a lime curtain in .25s and grows with .5s expoOut, lightning pieces gather from outside their places (original distance) in .583s, flicker from .38s (.03s ×8) and wiggle in shape (every .035s),
  // The curtain shakes (±12px) in .65s, .416s later the pieces scatter again (.5s cubic), and the logo grows 1.5x and vanishes in .33s
  const loader = document.querySelector(".t-loader");
  const runLoader = () => new Promise((done) => {
    if (!loader || reduce) { done(); return; }
    const shapes = [...loader.querySelectorAll(".t-loader__shapes polygon")];
    const svg = loader.querySelector(".t-loader__shapes");
    const unit = parseFloat(getComputedStyle(loader).fontSize);
    const OFF = [[-2.4, 0], [-7.7, 0], [-1.5, -19.6], [2.6, -4.5], [1.8, -18.3], [16.8, -31.4], [10.2, 0], [-4.5, -29], [-27.8, 8.1], [-21, -12.2], [-21.3, -75.5], [6, -43.2], [55.2, -52.4], [63.5, 54.3], [23.6, -34.3], [-69.8, 19.1], [-13.4, 77.8], [14.4, 52.6], [-42.8, 17.7], [-42.7, -16.2]];
    gsap.set(shapes, { transformOrigin: "50% 50%" });
    const tl = gsap.timeline({ onComplete: () => { document.documentElement.classList.add("is-loaded"); done(); } });
    tl.to(".t-loader__logo", { opacity: 1, duration: 0.25 }).to(".t-loader__logo", { scale: 1, duration: 0.5, ease: E.expoOut }, "<")
      .to(loader, { backgroundColor: "transparent", duration: 0.5, ease: "none", delay: 0.25 }, "<");
    shapes.forEach((s, k) => {
      const [ox, oy] = OFF[k % OFF.length].map((v) => v * unit), d = 0.05 * Math.random();
      const pts = s.getAttribute("points"), jitter = (amt) => pts.split(" ").map((p) => p.split(",").map((v) => (+v + (Math.random() - 0.5) * amt).toFixed(1)).join(",")).join(" ");
      tl.from(s, { x: ox, y: oy, ease: E.expoOut, duration: 0.583, delay: d }, 0)
        .fromTo(s, { opacity: 0, scale: 1.4 }, { scale: 1, duration: 0.583, ease: E.expoOut, delay: d }, 0)
        .fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.03, repeat: 8, yoyo: true, ease: "none" }, 0.38);
      [16, 27.2, 9.6, 20.8].forEach((a, j) => tl.set(s, { attr: { points: jitter(a) } }, 0.38 + j * 0.035));
      tl.set(s, { attr: { points: pts } }, 0.38 + 4 * 0.035);
    });
    tl.addLabel("shapesIn", 0.65)
      .to(svg, { x: -12, y: 6, duration: 0.02 }, "shapesIn").to(svg, { x: 10, y: -8, duration: 0.02 }).to(svg, { x: -7, y: 4, duration: 0.02 }).to(svg, { x: 5, y: -3, duration: 0.02 }).to(svg, { x: -2, y: 1, duration: 0.02 }).to(svg, { x: 0, y: 0, duration: 0.05 });
    shapes.forEach((s, k) => { const [ox, oy] = OFF[k % OFF.length].map((v) => v * unit); tl.to(s, { x: ox, y: oy, ease: E.cubic, duration: 0.5, delay: 0.05 * Math.random() }, "shapesIn+=.416").to(s, { opacity: 0, ease: "none", duration: 0.33 }, "<"); });
    tl.to(".t-loader__logo", { scale: 1.5, ease: E.expo, duration: 0.5 }, "shapesIn+=.4").to(".t-loader__logo", { opacity: 0, ease: "none", duration: 0.33 }, "<")
      .call(() => TB.heroIn(document.querySelector('[data-barba="container"]')), null, ">-.15");
  });

  const first = document.querySelector('[data-barba="container"]');

  document.fonts.ready.then(() => {
    TB.heroPrep(first);
    enterPage(first);
    runLoader().then(() => { if (!loader || reduce) TB.heroIn(first); });
  });

  // Page transition (barba 2.10.3, running together) — current page blurs for .4s, after .35s the new page appears at osmo .6s and replays the Hero sequence
  if (window.barba && !reduce && location.protocol.startsWith("http")) {
    barba.hooks.beforeLeave(() => TB.closeMenu());
    barba.hooks.beforeEnter(({ next }) => { gsap.set(next.container, { position: "fixed", top: 0, left: 0, right: 0 }); lenis && lenis.stop(); });
    barba.hooks.afterLeave(leavePage);
    barba.init({
      timeout: 7000, preventRunning: true,
      transitions: [{
        name: "default", sync: true,
        leave: ({ current }) => gsap.timeline({ onComplete: () => current.container.remove() }).to(current.container, { autoAlpha: 0, duration: 0.4 }),
        enter: ({ next }) => new Promise((res) => {
          TB.heroPrep(next.container);
          gsap.timeline().add("startEnter", 0.35).fromTo(next.container, { autoAlpha: 0 }, { autoAlpha: 1 }, "startEnter")
            .call(() => TB.heroIn(next.container), null, "startEnter").add("pageReady")
            .call(() => { scrollTo(0, 0); gsap.set(next.container, { clearProps: "position,top,left,right" }); lenis && (lenis.resize(), lenis.start()); enterPage(next.container); ScrollTrigger.refresh(); res(); }, null, "pageReady");
        }),
      }],
    });
  }
})();
