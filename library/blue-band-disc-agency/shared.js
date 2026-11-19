// Shared across several pages: Lenis 1.3.23 (original lerp .065 · wheelMultiplier .9) · loader · page transition · header row · menu drawer · blur reveal · word light-up ·
// Testimonial physics (matter-js 0.20.0, original values), logo marquee, footer cursor, line graph (stretches toward the cursor), placeholder video playback
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const root = document.documentElement;
  root.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = () => matchMedia("(min-width: 961px)").matches;
  const G = (window.G = { reduce, desktop, ready: false });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.065, wheelMultiplier: 0.9, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  G.lenis = lenis;
  // GSAP can’t blend between var() strings, so read the skin variable as an actual color and pass that in
  const swatch = document.createElement("i");
  G.color = (v) => { swatch.style.color = `var(${v})`; document.body.append(swatch); const c = getComputedStyle(swatch).color; swatch.remove(); return c; };
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // ── Blur reveal (original blurReveal): 15px blur · transparent → .8 power2.out, .08 stagger / scale reveal (scaleReveal) 0 → .6 power3.out ──
  G.blurIn = (els, o = {}) => { if (reduce) return gsap.set(els, { opacity: 1 }); gsap.set(els, { opacity: 0, filter: `blur(${o.blur ?? 15}px)`, y: o.y ?? 0 }); return gsap.to(els, { opacity: 1, filter: "blur(0px)", y: 0, duration: o.duration ?? 0.8, ease: o.ease ?? "power2.out", stagger: o.stagger ?? 0.08, delay: o.delay ?? 0, overwrite: true }); };
  G.scaleIn = (els, o = {}) => { if (reduce) return gsap.set(els, { opacity: 1, scale: 1 }); gsap.set(els, { opacity: 0, scale: o.scale ?? 0 }); return gsap.to(els, { opacity: 1, scale: 1, duration: o.duration ?? 0.6, ease: o.ease ?? "power3.out", stagger: o.stagger ?? 0.08, delay: o.delay ?? 0, overwrite: true }); };
  // data-reveal="blur|up|scale" — Once when it comes near the screen center (original start top center … once)
  const bootReveals = () => {
    const groups = new Map();
    $$("[data-reveal]").forEach((el) => { const g = el.closest("[data-reveal-group]") || el; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(el); });
    groups.forEach((els, g) => {
      const kind = els[0].dataset.reveal;
      const go = () => kind === "scale" ? G.scaleIn(els) : kind === "up" ? G.blurIn(els, { blur: 0, y: 40, duration: 1.2, ease: "power3.out", stagger: 0.07 }) : G.blurIn(els);
      if (reduce) { gsap.set(els, { opacity: 1 }); return; }
      ScrollTrigger.create({ trigger: g, start: g.dataset.revealStart || "top bottom-=20%", once: true, onEnter: go });
    });
  };

  // ── Words lighting up (original TextSection): word .1 → 1, length .18 · gap .16, scrub 1.2, top center+20% → bottom-25% center (wide screens only) ──
  const splitWords = (el) => {
    const out = [];
    const walk = (n) => [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) { frag.append(p); return; } const w = document.createElement("span"); w.className = "g-word"; w.textContent = p; frag.append(w); out.push(w); });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
    });
    walk(el);
    return out;
  };
  G.splitWords = splitWords;
  const bootWordLight = () => {
    $$("[data-words-light]").forEach((el) => {
      const words = splitWords(el);
      if (reduce || !desktop()) return;
      gsap.set(words, { opacity: 0.1 });
      gsap.to(words, { opacity: 1, duration: 0.18, ease: "none", stagger: { each: 0.16 }, scrollTrigger: { trigger: el, start: "top center+=20%", end: "bottom-=25% center", scrub: 1.2, invalidateOnRefresh: true } });
    });
  };

  // ── Header row: hides after scrolling down past 100px and shows again on scroll up. Blue section (data-head="light") under the head gets white text ──
  const head = $(".g-head");
  if (head) {
    let last = 0;
    addEventListener("scroll", () => { const y = scrollY; head.classList.toggle("is-hide", y > 100 && y > last && !menuOpen); last = y; }, { passive: true });
    $$("[data-head='light']").forEach((sec) => ScrollTrigger.create({ trigger: sec, start: () => `top ${head.offsetHeight / 2}px`, end: () => `bottom ${head.offsetHeight / 2}px`, onToggle: (s) => head.classList.toggle("is-light", s.isActive) }));
  }
  // Menu drawer (narrow screen): the blue curtain opens from top to bottom (.8 power4.inOut)
  const burger = $(".g-burger"), menu = $(".g-menu");
  let menuOpen = false;
  if (burger && menu) {
    gsap.set(menu, { clipPath: "inset(0 0 100% 0)", autoAlpha: 1 });
    menu.inert = true;
    burger.addEventListener("click", () => {
      menuOpen = !menuOpen;
      burger.setAttribute("aria-expanded", String(menuOpen));
      menu.inert = !menuOpen;
      head.classList.toggle("is-light", menuOpen);
      gsap.to(menu, { clipPath: menuOpen ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", duration: 0.8, ease: "power4.inOut" });
      if (menuOpen) gsap.fromTo($$("nav a", menu), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: "power3.out", stagger: 0.07, delay: 0.3 });
      menuOpen ? lenis?.stop() : lenis?.start();
    });
  }

  // ── Logo hover (original logo--hovered, measured values): from .14 on, each piece blinks off to .02 at .1s intervals and comes back on at .43s ──
  // The re-lighting curve is cubic-bezier(.3,0,.1,.8), fit to measured values
  const LOGO_EASE = CustomEase.create("g-logo-in", "M0,0 C0.3,0 0.1,0.8 1,1");
  $$(".g-head .g-logo").forEach((logo) => {
    const parts = $$(".lg-part", logo);
    if (!parts.length || reduce) return;
    logo.addEventListener("mouseenter", () => {
      gsap.killTweensOf(parts);
      const tl = gsap.timeline();
      parts.forEach((p, i) => tl.set(p, { opacity: 0.02 }, 0.14 + i * 0.1).to(p, { opacity: 1, duration: 0.43, ease: LOGO_EASE }, 0.14 + i * 0.1));
    });
  });

  // ── Video: placeholder video loops silently like the original, only while visible ──
  $$("video[data-autoplay]").forEach((v) => {
    v.muted = true; v.loop = true; v.playsInline = true;
    if (reduce) return;
    new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }).observe(v);
  });

  // ── Logo marquee: one loop in 24s, straight (original duration 24 ease none repeat -1) ──
  $$(".g-marquee__track").forEach((t) => {
    t.innerHTML += t.innerHTML;
    if (reduce) return;
    gsap.fromTo(t, { xPercent: 0 }, { xPercent: -50, duration: +(t.dataset.dur || 24), ease: "none", repeat: -1 });
  });

  // ── Footer: over the video area, the cursor spot shows ”Let's talk” letters follow right along (original measured value: no lag) ──
  const area = $(".g-footer__cursor-area"), cur = $(".g-footer__cursor");
  if (area && cur) {
    // As in the original, on entering, the letter marker goes 0 → full size and is moved straight there — with translate, no delay
    const put = (e) => { cur.classList.add("is-on"); const r = area.getBoundingClientRect(); cur.style.translate = `${e.clientX - r.left - cur.offsetWidth / 2}px ${e.clientY - r.top - cur.offsetHeight / 2}px`; };
    const off = () => { cur.classList.remove("is-on"); cur.style.translate = "0px 0px"; };
    area.addEventListener("pointermove", put);
    area.addEventListener("pointerenter", put);
    area.addEventListener("pointerleave", off);
    // Hides on scroll and reappears on the next movement (the original doesn’t carry the stopped cursor’s position)
    addEventListener("scroll", off, { passive: true });
  }

  // ── Line graph (original home-stat): line height goes 12→100% up to the top n (sin^3.85), and 55→100% going back (cos^1.35).
  //    Lines within 50 lines left and right of the cursor stretch by cosine up to the cursor height (74px above the bottom) — quickTo scaleY .35 power2.out, back to 1 on leave ──
  G.graph = (box) => {
    if (!box) return;
    const n = desktop() ? +(box.dataset.lines || 220) : 90, peak = +(box.dataset.peak || 0.62);
    const H = [];
    for (let i = 0; i < n; i++) { const t = i / (n - 1); H.push(t <= peak ? 12 + 88 * Math.sin((t / peak) * Math.PI / 2) ** 3.85 : 55 + 45 * Math.cos(((t - peak) / (1 - peak)) * Math.PI / 2) ** 1.35); }
    box.innerHTML = H.map((h, i) => `<i class="g-graph__line${Math.abs(i / (n - 1) - peak) < 0.004 ? " is-hot" : ""}" style="height:${h.toFixed(2)}%"></i>`).join("");
    const lines = [...box.children];
    if (reduce || !desktop()) return;
    gsap.set(lines, { transformOrigin: "50% 100%", scaleY: 1 });
    const q = lines.map((l) => gsap.quickTo(l, "scaleY", { duration: 0.35, ease: "power2.out" }));
    const span = 50, pad = 74;
    box.addEventListener("pointermove", (e) => {
      const r = box.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, w = r.width / lines.length;
      const c = Math.max(0, Math.min(lines.length - 1, Math.round(x / w))), lo = Math.max(0, c - span), hi = Math.min(lines.length - 1, c + span), target = Math.max(1, r.height - (y + pad));
      for (let d = 0; d < lines.length; d++) {
        if (d < lo || d > hi) { q[d](1); continue; }
        const base = r.height * (H[d] / 100); if (!base) continue;
        const k = 0.5 + 0.5 * Math.cos((Math.abs(d - c) / span) * Math.PI);
        q[d](Math.max(0.01, (base + (target - base) * k) / base));
      }
    });
    box.addEventListener("pointerleave", () => q.forEach((f) => f(1)));
  };

  // ── Review physics (original HomeReviews): when the section reaches the screen center, circles drop from above (diameter/2 + index×70px above) and pile up.
  //    gravity 2.8, restitution .08, friction .85 · rest .9 · air .035, density .01. A hovered circle bounces sideways and up (mass×.02 · .025, 700ms rest),
  // Flip past a review and the circles within 380px around that numbered circle pop ──
  G.reviews = (sec) => {
    if (!sec) return;
    const scene = $(".g-reviews__scene", sec), quotes = $$(".g-reviews__item", sec), circles = $$(".g-reviews__circle", scene || sec);
    let cur = 0, bodies = [], BodyM = null;
    const show = (i) => {
      cur = (i + quotes.length) % quotes.length;
      quotes.forEach((q, k) => { q.hidden = k !== cur; });
      G.blurIn(quotes[cur].children, { blur: 10, duration: 0.6 });
      circles.forEach((c, k) => c.classList.toggle("is-active", k === cur % circles.length));
      burst(cur % Math.max(1, bodies.length));
    };
    const burst = (c) => {
      const a = bodies[c]; if (!a || !BodyM) return;
      const m = a.body, dir = c % 2 === 0 ? 1 : -1, R = 380;
      bodies.forEach(({ body: b }, t) => { const dx = b.position.x - m.position.x, dy = b.position.y - m.position.y, d = Math.max(Math.hypot(dx, dy), 1); if (d > R) return; const k = 1 - d / R, s = t === c ? dir : dx / d || dir; BodyM.setVelocity(b, { x: b.velocity.x + s * (t === c ? 20 : 12) * k, y: b.velocity.y - (t === c ? 30 : 18) * k }); BodyM.setAngularVelocity(b, s * 0.16 * k); });
    };
    $(".g-reviews__prev", sec)?.addEventListener("click", () => show(cur - 1));
    $(".g-reviews__next", sec)?.addEventListener("click", () => show(cur + 1));
    if (!scene || !window.Matter || reduce || !desktop()) return;
    const start = () => {
      const { Engine, Runner, Bodies, Body, Composite } = Matter;
      BodyM = Body;
      const r = scene.getBoundingClientRect(), eng = Engine.create(); eng.gravity.y = 2.8;
      const run = Runner.create();
      Composite.add(eng.world, [Bodies.rectangle(r.width / 2, r.height + 60, r.width, 120, { isStatic: true }), Bodies.rectangle(-60, r.height / 2, 120, r.height * 2, { isStatic: true }), Bodies.rectangle(r.width + 60, r.height / 2, 120, r.height * 2, { isStatic: true })]);
      bodies = circles.map((el, i) => { const rad = el.offsetWidth / 2, x = Math.max(rad + 20, Math.min(r.width - rad - 20, el.offsetLeft + rad)), b = Bodies.circle(x, -rad - i * 70, rad, { restitution: 0.08, friction: 0.85, frictionStatic: 0.9, frictionAir: 0.035, density: 0.01 }); Composite.add(eng.world, b); el.style.left = "0px"; el.style.bottom = "auto"; el.style.top = "0px"; return { el, body: b, rad }; });
      bodies.forEach(({ el, body }, i) => { let cool = false; el.addEventListener("pointerenter", () => { if (cool) return; cool = true; const s = i % 2 === 0 ? 1 : -1; Body.applyForce(body, body.position, { x: s * body.mass * 0.02, y: -body.mass * 0.025 }); setTimeout(() => { cool = false; }, 700); }); });
      Runner.run(run, eng);
      const draw = () => { bodies.forEach(({ el, body, rad }) => { el.style.transform = `translate(${body.position.x - rad}px, ${body.position.y - rad}px) rotate(${body.angle}rad)`; }); requestAnimationFrame(draw); };
      requestAnimationFrame(draw);
    };
    ScrollTrigger.create({ trigger: scene, start: "top center", once: true, onEnter: start });
  };

  // ── Loader (original preloader): the logo stands and holds .6s (logo-exit, in the original this spot waits for network load so it is long), rests .08, then the logo fades out in .25 → the number 0→90 (.75 none)→100 (.12 none) climbs along the line,
  // Word columns lift away upward (inset bottom 100%, .42 power3.inOut, .07 stagger) and .18 later the curtain lifts up (.82 power4.inOut) ──
  const PT_KEY = "gpg-pt";
  const done = () => { G.ready = true; root.classList.remove("is-loading"); lenis?.start(); document.dispatchEvent(new CustomEvent("g:ready")); };
  const loader = $(".g-loader");
  const fromNav = sessionStorage.getItem(PT_KEY) === "1";
  sessionStorage.removeItem(PT_KEY);
  const pt = $(".g-pt");
  if (fromNav && pt && !reduce) {
    // Page arrived by transition: starts covered by a white plate and lifts away with .68 power2.inOut
    loader?.remove();
    gsap.set(pt, { autoAlpha: 1 }); gsap.set($(".g-pt__white", pt), { xPercent: 0 });
    root.classList.add("is-loading"); lenis?.stop();
    gsap.to(pt, { autoAlpha: 0, duration: 0.43, ease: "power2.inOut", onComplete: () => { gsap.set([".g-pt__blue", ".g-pt__blue2", ".g-pt__white"], { xPercent: 100 }); done(); } });
  } else if (loader && !reduce) {
    root.classList.add("is-loading"); lenis?.stop();
    const val = { v: 0 }, num = $(".g-loader__value", loader), track = $(".g-loader__progress", loader);
    const paint = () => { num.textContent = Math.round(val.v); gsap.set(num, { y: -Math.max(0, track.offsetHeight - num.offsetHeight) * (val.v / 100) }); };
    const words = $$(".g-loader__word", loader);
    gsap.timeline({ onComplete: () => { loader.remove(); done(); } })
      .fromTo(".g-loader__logo", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" })
      .to({}, { duration: +(loader.dataset.hold || 2.4) })
      .to({}, { duration: 0.08 })
      .to(".g-loader__logo", { autoAlpha: 0, duration: 0.25, ease: "power2.out" })
      .to(val, { v: 90, duration: 0.75, ease: "none", onUpdate: paint })
      .to(val, { v: 100, duration: 0.12, ease: "none", onUpdate: paint })
      .addLabel("site-reveal")
      .to(words, { clipPath: "inset(0 0 100% 0)", duration: 0.42, stagger: 0.07, ease: "power3.inOut" }, "site-reveal")
      .to(".g-loader__progress", { autoAlpha: 0, duration: 0.22, ease: "power2.out" }, "site-reveal+=0.08")
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 0.82, ease: "power4.inOut" }, "site-reveal+=0.18");
  } else { loader?.remove(); requestAnimationFrame(done); }

  // ── Page transition: the original loader panels (blue panel .92 power4.inOut → title opens → white panel .8) are for the first-open transition, and a link transition switches the screen .06 later within .62s (measured)
  //    — two blue panels cover in .17 power2.out and go to the next document, on the new document a white panel lifts at .43 (measured: exit 167ms · enter 433ms) ──
  if (pt && !reduce) {
    const ttl = $(".g-pt__ttl", pt);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(#.*)?$/.test(href) || href.split("#")[0] === location.pathname.split("/").pop()) return;
      e.preventDefault();
      ttl.textContent = a.dataset.ptTitle || a.textContent.trim() || "Page";
      lenis?.stop();
      gsap.set(pt, { autoAlpha: 1 });
      gsap.timeline({ onComplete: () => { sessionStorage.setItem(PT_KEY, "1"); location.href = href; } })
        .to(".g-pt__blue2", { xPercent: 0, duration: 0.17, ease: "power2.out" }, 0)
        .to(".g-pt__blue", { xPercent: 0, duration: 0.17, ease: "power2.out" }, 0.02);
    });
  }

  // ── Line-art Lottie (original LottieIcon: lottie-web svg, on enter it plays [0, stop frame] at 4x speed and stops).
  //    The art is ours — rings · tunnels · grids · globe built in JS on a 60fps · 240-frame version, line color read from the Skin ──
  const st = (v) => ({ a: 0, k: v });
  const K = (fr) => ({ a: 1, k: fr.map(([t, v], i) => (i < fr.length - 1 ? { t, s: [].concat(v), i: { x: [0.22], y: [1] }, o: { x: [0.36], y: [0] } } : { t, s: [].concat(v) })) });
  const ring = (ind, w, h, from, to, t0, t1, col, sw = 1.5, op = 100) => ({
    ddd: 0, ind, ty: 4, sr: 1, ao: 0, ip: 0, op: 240, st: 0, bm: 0,
    ks: { o: K([[t0, 0], [t0 + 20, op]]), r: st(0), p: K([[t0, from.concat(0)], [t1, to.concat(0)]]), a: st([0, 0, 0]), s: st([100, 100, 100]) },
    shapes: [{ ty: "gr", it: [{ ty: "el", d: 1, s: K([[t0, [w * 0.6, h * 0.6]], [t1, [w, h]]]), p: st([0, 0]) }, { ty: "st", c: st(col), o: st(100), w: st(sw), lc: 2, lj: 2 }, { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) }] }],
  });
  const rgb01 = (v) => { const m = G.color(v).match(/[\d.]+/g).map(Number); return [m[0] / 255, m[1] / 255, m[2] / 255, 1]; };
  const ICONS = {
    rings: (c, a) => [0, 1, 2, 3, 4].map((i) => ring(i + 1, 150, 150, [200, 200], [200, 140 + i * 30], i * 12, 120 + i * 12, i === 2 ? a : c, i === 2 ? 3 : 1.5)),
    tunnel: (c, a) => [...Array(11)].map((_, i) => { const k = i - 5; return ring(i + 1, 180, 180 + Math.abs(k) * 2, [200, 200], [200 + k * 9, 200], Math.abs(k) * 10, 140 + Math.abs(k) * 10, k === 0 ? a : c, k === 0 ? 4 : 1); }),
    grid: (c) => [...Array(12)].map((_, i) => ring(i + 1, 92, 92, [200, 200], [130 + (i % 3) * 70, 95 + Math.floor(i / 3) * 70], i * 8, 120 + i * 8, c)),
    globe: (c) => [...Array(9)].map((_, i) => { const k = i / 8; return ring(i + 1, 300 * Math.abs(Math.cos(k * Math.PI)) + 4, 300, [200, 200], [200, 200], i * 10, 150 + i * 10, c, 1); }).concat([ring(10, 300, 120, [200, 200], [200, 200], 0, 120, c, 1)]),
  };
  G.icons = () => {
    if (!window.lottie) return;
    $$("[data-icon]").forEach((host) => {
      const make = ICONS[host.dataset.icon];
      if (!make) return;
      const data = { v: "5.7.4", fr: 60, ip: 0, op: 240, w: 400, h: 400, ddd: 0, assets: [], layers: make(rgb01("--site-blue-7"), rgb01("--kf-accent")) };
      const anim = lottie.loadAnimation({ container: host, renderer: "svg", loop: false, autoplay: false, animationData: data, rendererSettings: { preserveAspectRatio: "xMidYMid meet" } });
      const STOP = 200;
      if (reduce) { anim.goToAndStop(STOP, true); return; }
      anim.addEventListener("DOMLoaded", () => anim.goToAndStop(0, true));
      new IntersectionObserver(([e]) => { if (e.isIntersecting) { anim.setSpeed(4); anim.playSegments([0, STOP], true); } }, { threshold: 0.4 }).observe(host);
    });
  };

  G.boot = (fn) => {
    const run = () => { bootWordLight(); G.icons(); fn?.(); bootReveals(); G.reviews($(".g-reviews")); $$(".g-graph").forEach(G.graph); ScrollTrigger.sort(); ScrollTrigger.refresh(); };
    const fam = getComputedStyle(root).getPropertyValue("--kf-font-sans").split(",")[0].trim();
    const loads = document.fonts && fam ? [document.fonts.load(`400 64px ${fam}`), document.fonts.load(`600 64px ${fam}`)] : [];
    Promise.race([Promise.allSettled(loads), new Promise((r) => setTimeout(r, 2500))]).then(run);
    document.fonts?.addEventListener("loadingdone", () => ScrollTrigger.refresh());
  };
})();
