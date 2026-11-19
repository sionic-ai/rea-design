// Smooth scroll · eye-blink loader · bottom pill button · detail panel · video panel. Motion per section is in index.js, particle stage in stage.js
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const TG = (window.TG = { reduce, onReveal: [] });

  // Lenis 1.3.26 — original settings as-is (1.25s expo out, touch 1.6x, anchor links smooth too)
  const lenis = (TG.lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reduce,
    anchors: true,
    touchMultiplier: 1.6,
    autoRaf: false,
  }));
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  // Paints the Skin’s fill onto a canvas — color-mix is also painted in one cell and read back as rgb
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  const one = document.createElement("canvas"); one.width = one.height = 1;
  const oneCtx = one.getContext("2d", { willReadFrequently: true });
  TG.rgb = (name) => {
    probe.style.color = `var(${name})`;
    oneCtx.clearRect(0, 0, 1, 1); oneCtx.fillStyle = getComputedStyle(probe).color; oneCtx.fillRect(0, 0, 1, 1);
    const d = oneCtx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };

  // Golden arrow cursor — drawn with the skin’s accent fill and background-color border, mouse devices only
  if (matchMedia("(pointer: fine)").matches) {
    const [f, k] = [TG.rgb("--kf-accent-text"), TG.rgb("--kf-surface")].map((c) => `rgb(${c.join(",")})`);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='28' viewBox='0 0 24 28'><path d='M3 2v19.5l5-4.6 3.8 8.6 3.7-1.7-3.8-8.3h7.6Z' fill='${f}' stroke='${k}' stroke-width='1.4' stroke-linejoin='round'/></svg>`;
    root.style.setProperty("--tg-cursor", `url("data:image/svg+xml,${encodeURIComponent(svg)}") 3 2, auto`);
  }

  // Loader: gold, ruby and cream dots float up (.55) and gather into an eye shape (1.15), the eyelid shuts at .12s and opens at .85s as light spreads. Whole thing at 1.65x speed ──
  const pre = document.getElementById("tg-preloader");
  const reveal = () => {
    root.classList.remove("is-loading");
    lenis.start();
    TG.revealed = true;
    TG.onReveal.forEach((fn) => fn());
  };
  if (reduce || !pre) { pre?.remove(); requestAnimationFrame(reveal); }
  else {
    const cv = pre.querySelector("canvas"), ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = () => innerWidth, H = () => innerHeight;
    const N = innerWidth < 768 ? 900 : 2200;
    const tones = ["--kf-accent", "--kf-accent-text", "--site-ruby", "--kf-ink"].map((v) => `rgb(${TG.rgb(v).join(",")})`);
    const eye = () => {
      const cx = W() / 2, cy = H() / 2, rx = Math.min(W() * 0.22, 260), ry = rx * 0.42, out = [], rim = Math.floor(N * 0.62);
      for (let k = 0; k < rim; k++) { const a = (k / rim) * Math.PI * 2; out.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry * (0.72 + 0.28 * Math.abs(Math.cos(a))) }); }
      for (let k = 0; k < N - rim; k++) { const a = (k / (N - rim)) * Math.PI * 2; out.push({ x: cx + Math.cos(a) * rx * 0.07, y: cy + Math.sin(a) * ry * 0.62 }); }
      return out;
    };
    const size = () => { cv.width = W() * dpr; cv.height = H() * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    let target = eye();
    const dots = Array.from({ length: N }, (_, i) => ({ x: Math.random() * W(), y: Math.random() * H(), vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 0.4 + Math.random() * 1.5, c: tones[(Math.random() * tones.length) | 0], a: 0.25 + Math.random() * 0.65, tx: target[i].x, ty: target[i].y, pull: 0 }));
    const SPEED = 1.65;
    let mode = "drift", raf = 0, last = performance.now();
    const draw = () => {
      const now = performance.now(), k = Math.min(3, Math.max(0.1, (now - last) * 0.06)) * SPEED; last = now;
      ctx.clearRect(0, 0, W(), H());
      for (const d of dots) {
        if (mode === "drift") {
          d.x += (d.vx + Math.sin(d.y * 0.01 + now * 4e-4) * 0.18) * k; d.y += (d.vy - 0.08) * k;
          if (d.y < -4) d.y = H() + 4; if (d.x < -4) d.x = W() + 4; if (d.x > W() + 4) d.x = -4;
        } else {
          d.pull += (1 - d.pull) * (1 - Math.pow(0.945, k));
          const m = 1 - Math.pow(1 - 0.075 * d.pull, k);
          d.x += (d.tx - d.x) * m + (Math.random() - 0.5) * 0.5 * d.pull;
          d.y += (d.ty - d.y) * m + (Math.random() - 0.5) * 0.5 * d.pull;
        }
        ctx.globalAlpha = d.a; ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    const onResize = () => { size(); target = eye(); dots.forEach((d, i) => { d.tx = target[i].x; d.ty = target[i].y; }); };
    addEventListener("resize", onResize);
    const lids = pre.querySelectorAll(".tg-preloader__lid"), flash = pre.querySelector(".tg-preloader__flash");
    const tl = gsap.timeline({ onComplete: () => { cancelAnimationFrame(raf); removeEventListener("resize", onResize); pre.remove(); } });
    tl.timeScale(SPEED);
    // Like the original, start scattering and gathering the dots only after everything to be received (here, the fonts) has arrived — so the big Korean title doesn’t visibly change after it opens (max 3s)
    tl.pause();
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]).then(() => { last = performance.now(); draw(); tl.play(); });
    gsap.set(flash, { xPercent: -50, yPercent: -50, scale: 0.08 });
    tl.call(() => { mode = "gather"; }, null, 0.55)
      .to({}, { duration: 1.15 })
      .call(reveal, null, "blink")
      .to(lids, { scaleY: 1, duration: 0.12 }, "blink")
      .to(flash, { opacity: 0.95, scale: 1.5, duration: 0.55, ease: "power2.out" }, "blink+=0.3")
      .to(flash, { opacity: 0, duration: 0.7, ease: "power2.in" }, "blink+=0.85")
      .fromTo(lids, { scaleY: 1 }, { scaleY: 0, duration: 0.85, ease: "power3.inOut" }, "blink+=0.16")
      .to(pre, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, "blink+=0.45")
      .to(".tg-preloader__word", { opacity: 0, y: -14, duration: 0.5 }, "blink");
  }

  // ── Bottom pill: Sound (placeholder only — just toggles on and off) · About this site ──
  const sound = document.querySelector(".tg-pill--sound");
  sound.addEventListener("click", () => {
    const on = sound.getAttribute("aria-pressed") !== "true";
    sound.setAttribute("aria-pressed", String(on));
    sound.textContent = on ? "Sound Off" : "Sound On";
  });
  const studyBtn = document.querySelector(".tg-pill--study"), studyPanel = document.getElementById("tg-study-panel");
  const setStudy = (on) => { studyPanel.hidden = !on; studyBtn.setAttribute("aria-expanded", String(on)); };
  studyBtn.addEventListener("click", () => setStudy(studyPanel.hidden));
  studyPanel.querySelector(".tg-study-panel__close").addEventListener("click", () => { setStudy(false); studyBtn.focus(); });

  // ── Detail panel: the card photo flies from its place to the detail spot over .85s power4.inOut, and the text rises .5s later over .7s ──
  const t = (s) => (reduce ? 0 : s);
  const ov = document.querySelector(".tg-product");
  const back = ov.querySelector(".tg-product__backdrop"), stage = ov.querySelector(".tg-product__stage"), img = ov.querySelector(".tg-product__img");
  const info = ov.querySelector(".tg-product__info"), close = ov.querySelector(".tg-product__close");
  let from = null, open = false, busy = false;
  const fixAt = (r) => gsap.set(img, { position: "fixed", left: r.left, top: r.top, width: r.width, height: r.height, zIndex: 3, margin: 0, opacity: 1 });
  const show = (card) => {
    if (open || busy) return;
    open = true; from = card;
    ov.querySelector(".tg-product__name").textContent = card.querySelector("h3").textContent;
    ov.querySelector(".tg-product__price").textContent = card.dataset.price || "";
    img.dataset.label = card.querySelector(".wf-img").dataset.label;
    ov.classList.add("is-open"); ov.setAttribute("aria-hidden", "false");
    document.querySelector("main").inert = true;
    ov.focus({ preventScroll: true });
    lenis.stop();
    gsap.set([back, close, info], { opacity: 0 });
    gsap.set(img, { opacity: 0 });
    const to = stage.getBoundingClientRect(), src = card.querySelector(".tg-card__media").getBoundingClientRect();
    fixAt(src);
    gsap.to(back, { opacity: 1, duration: t(0.55), ease: "power2.out" });
    gsap.to(img, { left: to.left, top: to.top, width: to.width, height: to.height, duration: t(0.85), ease: "power4.inOut", onComplete: () => gsap.set(img, { clearProps: "position,left,top,width,height,zIndex,margin" }) });
    gsap.fromTo(info, { opacity: 0, y: 34 }, { opacity: 1, y: 0, delay: t(0.5), duration: t(0.7), ease: "power3.out" });
    gsap.to(close, { opacity: 1, delay: t(0.55), duration: t(0.4) });
  };
  const hide = () => {
    if (!open) return;
    open = false; busy = true;
    gsap.killTweensOf([img, back, info, close]);
    fixAt(img.getBoundingClientRect());
    const r = from.querySelector(".tg-card__media").getBoundingClientRect();
    gsap.to(img, { left: r.left, top: r.top, width: r.width, height: r.height, duration: t(0.7), ease: "power4.inOut" });
    gsap.to([back, info, close], { opacity: 0, duration: t(0.4), ease: "power2.in" });
    gsap.delayedCall(t(0.72), () => {
      ov.classList.remove("is-open"); ov.setAttribute("aria-hidden", "true");
      document.querySelector("main").inert = false;
      gsap.set(img, { clearProps: "all" });
      busy = false; from?.focus({ preventScroll: true });
      lenis.start();
    });
  };
  document.querySelectorAll(".tg-card").forEach((c) => c.addEventListener("click", (e) => { e.preventDefault(); show(c); }));
  [back, close, ov.querySelector(".tg-product__return")].forEach((b) => b.addEventListener("click", hide));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) hide(); });

  // ── Video Panel ──
  const film = document.querySelector(".tg-film");
  let filmY = 0;
  document.querySelector(".tg-lookbook__film").addEventListener("click", () => { filmY = scrollY; lenis.stop(); film.showModal(); });
  film.querySelector(".tg-film__close").addEventListener("click", () => film.close());
  film.addEventListener("click", (e) => { if (e.target === film) film.close(); });
  film.addEventListener("close", () => { lenis.scrollTo(filmY, { immediate: true, force: true }); lenis.start(); });
})();
