// Shared across the whole site — smooth scroll (Lenis 1.3.25, default lerp .1 like the original), skin color reading, book loader, floating pill, footer section mail field.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const G = (window.G = { root, reduce, fine, listeners: [] });

  G.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  G.smooth = (e0, e1, x) => { const r = G.clamp((x - e0) / (e1 - e0)); return r * r * (3 - 2 * r); };
  G.ease = (bez, fallback) => (window.CustomEase ? CustomEase.create("g" + bez.replace(/[^\d]/g, ""), `M0,0 C${bez} 1,1`) : fallback);
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  G.out = G.ease("0.22,1,0.36,1", "expo.out");

  // Reads skin variables (including oklch and color-mix) as 0~1 rgb for shaders and canvas — painted onto a 1px canvas and read back
  const px = document.createElement("canvas"); px.width = px.height = 1;
  const pctx = px.getContext("2d", { willReadFrequently: true });
  const probe = document.createElement("i"); probe.style.display = "none"; document.body.append(probe);
  G.css = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };
  G.rgb = (name) => {
    pctx.clearRect(0, 0, 1, 1); pctx.fillStyle = G.css(name); pctx.fillRect(0, 0, 1, 1);
    const d = pctx.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  // Smooth scrolling — kept paused while the loader runs
  const lerp = parseFloat(getComputedStyle(root).getPropertyValue("--kf-scroll-lerp")) || 0.1;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
  const lenis = (G.lenis = reduce ? null : new Lenis({ lerp, syncTouch: false }));
  if (lenis) {
    lenis.on("scroll", () => { ScrollTrigger.update(); G.listeners.forEach((f) => f()); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    addEventListener("scroll", () => G.listeners.forEach((f) => f()), { passive: true });
  }
  G.scroll = () => (lenis ? lenis.scroll : scrollY);
  G.onScroll = (f) => { G.listeners.push(f); f(); };
  addEventListener("resize", () => G.listeners.forEach((f) => f()));
  // Original: waitlist signup scrolls to the document end in 1.8s, logo to the top in 1.4s (Lenis duration, default curve)
  G.scrollTo = (y, duration) => (lenis ? lenis.scrollTo(y, { duration }) : scrollTo({ top: y, behavior: "smooth" }));
  document.querySelectorAll(".g-nav__logo, .g-foot__brand").forEach((b) => b.addEventListener("click", () => G.scrollTo(0, 1.4)));
  document.querySelectorAll(".g-cta, .g-pill").forEach((b) => b.addEventListener("click", () => G.scrollTo(document.documentElement.scrollHeight, 1.8)));

  // Book loader — the number fills to 100 and stays .35s, then the cover opens 165° and the right page becomes a window that grows until it covers the screen.
  // Original values: minimum 1.2s, hold .35, open 1.1 inOutCubic, push .32×width (after .35s, .9s), reveal after .55s for .7s, grow after .7s for 1.5s inOutSine ×1.06,
  // Tilt X12 Y22 Z-8, rise 17.5px·1.6, spiral start .9s (2.2s), title 1.5s
  const loader = document.querySelector(".g-loader");
  G.timeline = { spiral: null, title: null };
  const fire = (k, t) => { const f = G.timeline[k]; if (f) f(t); };
  const done = () => { root.classList.add("is-loaded"); lenis && lenis.start(); fire("end"); };
  if (!loader || reduce) {
    root.classList.add("is-title");
    done();
    G.timeline.ready = true;
    return;
  }
  lenis && lenis.stop();
  const P = { minLoad: 1.2, holdAt100: 0.35, openDur: 1.1, openDeg: 165, tiltX: 12, tiltY: 22, tiltZ: -8, shiftX: 0.32, shiftDelay: 0.35, shiftDur: 0.9, revealDelay: 0.55, revealDur: 0.7, expandDelay: 0.7, expandDur: 1.5, expandMargin: 1.06, floatAmp: 17.5, floatSpeed: 1.6, spiralDelay: 0.9, titleDelay: 1.5 };
  const group = loader.querySelector(".g-loader__group");
  const book = loader.querySelector(".g-loader__book");
  const hole = loader.querySelector(".g-loader__hole");
  const page = loader.querySelector(".g-loader__page");
  const cover = loader.querySelector(".g-loader__cover");
  const edge = loader.querySelector(".g-loader__edge");
  const veil = loader.querySelector(".g-loader__veil");
  const pct = loader.querySelector(".g-loader__pct");
  const st = { float: 0, x: 0, rx: P.tiltX, ry: P.tiltY, rz: P.tiltZ, scale: 1, open: 0 };
  const t0 = performance.now();
  const draw = () => {
    const t = (performance.now() - t0) / 1000;
    const y = Math.sin(t * P.floatSpeed) * P.floatAmp * st.float;
    gsap.set(group, { x: st.x, y, rotateX: st.rx, rotateY: st.ry, rotateZ: st.rz });
    gsap.set(cover, { rotateY: -P.openDeg * st.open });
    const bw = book.offsetWidth;
    gsap.set(hole, { scale: st.scale });
    hole.style.boxShadow = `0 0 0 ${Math.ceil(Math.max(innerWidth, innerHeight) * 2 / st.scale)}px var(--site-loader-bg)`;
    return bw;
  };
  st.float = 1;
  gsap.ticker.add(draw);
  const count = { v: 0 };
  gsap.to(count, { v: 100, duration: P.minLoad, ease: "power1.inOut", onUpdate: () => (pct.textContent = Math.round(count.v)) });
  const tl = gsap.timeline({ delay: P.minLoad + P.holdAt100, onComplete: () => { gsap.ticker.remove(draw); done(); } });
  const bw = book.offsetWidth, bh = book.offsetHeight;
  const cover2 = () => Math.max(innerWidth * P.expandMargin / bw, innerHeight * P.expandMargin / bh);
  tl.to(st, { open: 1, duration: P.openDur, ease: "power2.inOut" }, 0)
    .to(st, { x: bw * P.shiftX, duration: P.shiftDur, ease: "power2.inOut" }, P.shiftDelay)
    .set(veil, { autoAlpha: 0 }, P.revealDelay)
    .to(page, { autoAlpha: 0, duration: P.revealDur, ease: "power1.inOut" }, P.revealDelay)
    .to([cover, edge], { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, P.expandDelay - 0.1)
    .to(st, { scale: () => cover2(), x: 0, rx: 0, ry: 0, rz: 0, float: 0, duration: P.expandDur, ease: "sine.inOut" }, P.expandDelay)
    .call(() => fire("spiral"), null, P.spiralDelay)
    .call(() => root.classList.add("is-title"), null, P.titleDelay);
})();

// Footer section — on entry words rise in turn, the mail field placeholder gets a different delay per letter, and the mouse moves the tile light
(() => {
  const G = window.G;
  const foot = document.querySelector(".g-foot-wrap");
  if (!foot) return;
  const pin = foot.querySelector(".g-foot-pin");
  const tile = foot.querySelector(".g-foot__tile");
  const ph = foot.querySelector(".g-foot__ph");
  const field = foot.querySelector(".g-foot__field");
  const input = foot.querySelector(".g-foot__input");
  const word = "Your Email";
  const mid = (word.length - 1) / 2;
  ph.innerHTML = [...word].map((ch, i) => ch === " " ? "<span>&nbsp;</span>" : `<span class="g-w" style="animation-delay:${(0.94 + Math.abs(i - mid) * 0.07).toFixed(2)}s">${ch}</span>`).join("");
  input.addEventListener("input", () => field.classList.toggle("has-value", input.value.length > 0));
  foot.querySelectorAll("[data-hl]").forEach((el) => {
    const t = el.textContent; el.textContent = "";
    [...t].forEach((ch, i) => { const s = document.createElement("span"); s.className = "g-hl"; s.style.setProperty("--i", i); s.textContent = ch === " " ? " " : ch; el.append(s); });
  });
  G.onScroll(() => {
    const guild = document.querySelector(".g-guilds-wrap");
    if (!guild || pin.classList.contains("foot-live")) return;
    const i = innerHeight, n = (i - (guild.offsetTop - G.scroll())) / i;
    if (n > 0.995 || G.reduce) pin.classList.add("foot-live");
  });
  if (G.fine) addEventListener("pointermove", (e) => {
    const r = tile.getBoundingClientRect();
    tile.style.setProperty("--lx", `${G.clamp((e.clientX - r.left) / r.width, -0.5, 1.5) * 100}%`);
    tile.style.setProperty("--ly", `${G.clamp((e.clientY - r.top) / r.height, -0.5, 1.5) * 100}%`);
  });
})();
