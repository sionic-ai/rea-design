(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement, body = document.body;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const site = (window.site = { reduce, fine, $, $$ });
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();

  // ── Smooth scroll: original Lenis 1.1.13 — duration 1.35, wheel .88, touch 1.5
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ duration: 1.35, smoothWheel: true, wheelMultiplier: 0.88, touchMultiplier: 1.5 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  site.lenis = lenis;
  let idle = 0;
  addEventListener("scroll", () => { body.classList.add("scrolling"); clearTimeout(idle); idle = setTimeout(() => body.classList.remove("scrolling"), 220); }, { passive: true });

  // ── Jelly button: wobbles once on release (.52s)
  $$(".jb, .reach-soc a, .ft-soc a, .mn-nav a").forEach((b) => {
    b.addEventListener("mouseleave", () => { if (reduce) return; b.classList.remove("jb-out"); void b.offsetWidth; b.classList.add("jb-out"); });
    b.addEventListener("animationend", (e) => { if (e.animationName === "jbLetGo") b.classList.remove("jb-out"); });
  });

  // ── Header bar color: reads data-ink of the section under the header bar
  const inks = $$("[data-ink]");
  const readInk = () => {
    const y = 40;
    let ink = null;
    for (const s of inks) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) ink = s.dataset.ink; }
    body.classList.toggle("ink-paper", ink === "paper");
    body.classList.toggle("ink-brown", ink === "brown");
  };
  site.readInk = readInk;
  addEventListener("scroll", readInk, { passive: true });

  // ── Menu: sky, orange and green sheets at .58s power3.inOut staggered 0·.08·.16s, inner text at .7s, text lines .06s stagger at .7s power3.out. On close, runs in reverse at 1.35x
  (() => {
    const menu = $("#menu"), openBtn = $("#mnOpen"), closeBtn = $("#mnClose"), tint = $("#mnTint");
    if (!menu || !openBtn) return;
    const spans = $$("#mnNav a > span"), foot = $("#mnFoot");
    let isOpen = false, tl = null;
    if (!reduce) {
      tl = gsap.timeline({ paused: true, onReverseComplete: () => { if (!isOpen) menu.classList.remove("open"); } })
        .to(tint, { opacity: 0.78, duration: 0.62, ease: "power2.inOut" }, 0)
        .fromTo(".mn-wipe.a", { x: 0, xPercent: -101 }, { x: 0, xPercent: 0, duration: 0.58, ease: "power3.inOut" }, 0)
        .fromTo(".mn-wipe.b", { x: 0, xPercent: -101 }, { x: 0, xPercent: 0, duration: 0.58, ease: "power3.inOut" }, 0.08)
        .fromTo(".mn-wipe.c", { x: 0, xPercent: -101 }, { x: 0, xPercent: 0, duration: 0.58, ease: "power3.inOut" }, 0.16)
        .to(".mn-in", { opacity: 1, duration: 0.22, ease: "none" }, 0.7)
        .fromTo(spans, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }, 0.72)
        .fromTo(foot, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }, 0.95);
    }
    const setOpen = (v) => {
      if (v === isOpen) return;
      isOpen = v;
      openBtn.setAttribute("aria-expanded", String(v));
      menu.setAttribute("aria-hidden", String(!v));
      root.classList.toggle("is-locked", v);
      if (lenis) v ? lenis.stop() : lenis.start();
      if (v) { menu.classList.add("open"); tl ? tl.timeScale(1).play() : gsap.set([".mn-wipe", ".mn-in", tint], { clearProps: "all" }); if (!tl) menu.classList.add("instant"); closeBtn.focus({ preventScroll: true }); }
      else { tl ? tl.timeScale(1.35).reverse() : menu.classList.remove("open"); openBtn.focus({ preventScroll: true }); }
    };
    openBtn.addEventListener("click", () => setOpen(true));
    closeBtn.addEventListener("click", () => setOpen(false));
    tint.addEventListener("click", () => setOpen(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) setOpen(false); });
    $$("#mnNav a").forEach((a) => a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      e.preventDefault();
      setOpen(false);
      let target = $(href);
      if (href === "#proj" && site.s01ST) target = Math.round(site.s01ST.start + (site.s01ST.end - site.s01ST.start) * (100 / 226));
      setTimeout(() => (lenis ? lenis.scrollTo(target, { duration: 1.2 }) : (typeof target === "number" ? scrollTo(0, target) : target?.scrollIntoView())), 380);
    }));
    $$('a[href^="#"]:not(#mnNav a)').forEach((a) => a.addEventListener("click", (e) => {
      const t = $(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(a.getAttribute("href") === "#top" ? 0 : t, { duration: 1.2 }) : t.scrollIntoView();
    }));
  })();

  // ── Sound: press and a sine wave rises and flows (sound on), press again and it lies flat
  $("#sndBtn")?.addEventListener("click", (e) => { const b = e.currentTarget; b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); });

  // ── Cookie card: once chosen, it drops down in .5s
  (() => {
    const ck = $("#ck");
    if (!ck) return;
    const fit = () => { const w = $(".ck-word", ck); ck.style.setProperty("--ckfs", "52px"); const k = (ck.clientWidth - 52) / w.scrollWidth; if (k < 1) ck.style.setProperty("--ckfs", 52 * k + "px"); };
    (document.fonts?.ready || Promise.resolve()).then(fit);
    const show = () => { ck.hidden = false; gsap.fromTo(ck, { y: 26, opacity: 0, yPercent: 0 }, { y: 0, duration: reduce ? 0 : 0.47, ease: "back.out(1.7)" }); gsap.to(ck, { opacity: 1, duration: reduce ? 0 : 0.2, ease: "power1.out" }); fit(); };
    $$("[data-ck]", ck).forEach((b) => b.addEventListener("click", () => gsap.to(ck, { yPercent: 130, duration: reduce ? 0 : 0.5, ease: "power3.in", onComplete: () => { ck.hidden = true; } })));
    $("#ckOpen")?.addEventListener("click", show);
  })();

  // ── Loader: stars fly in over a green plate (canvas). Number 000→100, when full Loading… tilts and drops out, the stars stretch to light speed, then ten horizontal bars exit staggered
  site.ready = new Promise((resolve) => {
    const pre = $("#pre");
    if (!pre) { body.classList.add("go", "fanned"); resolve(); return; }
    const num = $(".pre-num", pre), bar = $(".pre-bar span", pre), cv = $("#warp", pre), ctx = cv.getContext("2d");
    const done = () => { pre.classList.add("done"); body.classList.add("go"); setTimeout(() => body.classList.add("fanned"), 600); resolve(); };
    if (reduce) { num.textContent = "100"; done(); return; }
    setTimeout(() => body.classList.add("lit"), 80);
    const WP = { speed: 2, target: 2, on: true };
    const stars = [];
    const size = () => { cv.width = innerWidth * Math.min(devicePixelRatio, 2); cv.height = innerHeight * Math.min(devicePixelRatio, 2); };
    size(); addEventListener("resize", size);
    for (let i = 0; i < 260; i++) stars.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() });
    const paper = css("--site-paper") || css("--kf-bg");
    let last = performance.now();
    const loop = (now) => {
      if (!WP.on) return;
      const dt = Math.max(1, now - last) / 16.67; last = now;
      WP.speed += (WP.target - WP.speed) * 0.06 * dt;
      const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = paper;
      for (const s of stars) {
        const pz = s.z;
        s.z -= 0.0025 * WP.speed * dt;
        if (s.z <= 0.02) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; continue; }
        const k = 0.5 / s.z, kp = 0.5 / pz;
        const x = cx + s.x * W * k, y = cy + s.y * H * k, xp = cx + s.x * W * kp, yp = cy + s.y * H * kp;
        ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.4);
        ctx.lineWidth = Math.max(1, (1 - s.z) * 3);
        ctx.beginPath(); ctx.moveTo(xp, yp); ctx.lineTo(x, y); ctx.stroke();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    const p = { v: 0 };
    // Time the bar to start lifting at about 3.17s after the page opened (original) — even if fonts or scripts arrive late, it lifts at the same moment
    gsap.to(p, { v: 100, duration: Math.max(0.8, 2.93 - performance.now() / 1000), ease: "power2.inOut", onUpdate: () => {
      num.textContent = String(Math.round(p.v)).padStart(3, "0");
      bar.style.width = p.v + "%";
      if (p.v >= 55) body.classList.add("pre-lean");
    }, onComplete: () => {
      WP.target = 260;
      body.classList.add("cut");
      setTimeout(() => body.classList.add("striking"), 240);
      setTimeout(() => { WP.on = false; done(); }, 1320);
    } });
  });
  site.ready.then(readInk);
})();
