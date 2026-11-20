// Shared across several pages — smooth scroll, loader, header progress bar, link roll, 3D button, square button, clock, press hint, text scramble when a panel flips
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, CustomEase);
  CustomEase.create("aq-loader", "M0,0 C0.104,0.204 0.711,0.986 1,1");
  gsap.registerEffect({
    name: "lineIn",
    effect: (t, c) => gsap.fromTo(t, { clipPath: "inset(-50% 0% 150% 0%)", yPercent: 110 }, { duration: c.duration, ease: c.ease, delay: c.delay, yPercent: 0, clipPath: "inset(-50% 0% 0% 0%)" }),
    defaults: { duration: 1, ease: "none", delay: 0 },
    extendTimeline: true,
  });

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  const CHARS = "studio - / * # @ * _ studio";
  const site = (window.aqSite = { reduce, touch, CHARS, ready: false, mode: 0, mouse: { x: innerWidth / 2, y: innerHeight / 2 }, onReady: [] });

  scrollTo(0, 0);
  const lenis = new Lenis({ smoothWheel: !reduce });
  site.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000), false, true);
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  const expoInOut = (e) => (e === 0 ? 0 : e === 1 ? 1 : e < .5 ? 2 ** (20 * e - 10) / 2 : (2 - 2 ** (-20 * e + 10)) / 2);
  site.scrollTo = (to, duration = 1.5) => lenis.scrollTo(to, { immediate: reduce, duration, easing: expoInOut });

  document.addEventListener("mousemove", (e) => { site.mouse.x = e.clientX; site.mouse.y = e.clientY; }, { passive: true });

  // Split link text into two sets — by line (by: line) or per character (by: char)
  site.roll = (host, by = "line") => {
    const text = host.textContent;
    const a = document.createElement("span"), b = document.createElement("span");
    a.className = "aq-roll__a"; b.className = "aq-roll__b";
    a.setAttribute("aria-hidden", "true"); b.setAttribute("aria-hidden", "true");
    for (const box of [a, b]) {
      if (by === "char") [...text].forEach((ch) => { const s = document.createElement("span"); s.textContent = ch; box.appendChild(s); });
      else { const s = document.createElement("span"); s.textContent = text; box.appendChild(s); }
    }
    const wrap = document.createElement("span");
    wrap.className = "aq-roll";
    wrap.setAttribute("aria-label", text.trim());
    wrap.append(a, b);
    return { wrap, a, b };
  };

  // Written out at each place that uses an arrow — <use> No line drawing inside the shadow
  const arrowSvg = (cls) => {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 18 18");
    svg.setAttribute("class", cls);
    svg.setAttribute("aria-hidden", "true");
    for (const pts of ["4 8 10.2 1.6 16.4 8", "10.2 1.6 10.2 16 0.4 16"]) {
      const p = document.createElementNS(ns, "polyline");
      p.setAttribute("points", pts);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", "currentColor");
      p.setAttribute("stroke-width", "2");
      p.setAttribute("stroke-miterlimit", "10");
      svg.appendChild(p);
    }
    return svg;
  };
  site.arrowSvg = arrowSvg;

  // External link — rolls line by line 1s (.1 interval) + the arrow stops at 45° (.5) and draws the stem to the end from 62.75%, all with expo.out
  const ctaTl = (link) => {
    const old = link.querySelector(".aq-cta__arrow");
    const svg = arrowSvg("aq-cta__arrow");
    old?.replaceWith(svg);
    const label = [...link.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    [...link.childNodes].filter((n) => n.nodeType === 3).forEach((n) => n.remove());
    const span = document.createElement("span");
    span.textContent = label;
    link.prepend(span);
    const { wrap, a, b } = site.roll(span, "line");
    span.replaceWith(wrap);
    a.firstChild.classList.add("aq-glitch");
    const tl = gsap.timeline({ paused: true, defaults: { duration: .5, ease: "none" } })
      .fromTo(svg, { rotate: 45 }, { rotate: 0, yPercent: 15 })
      .from(svg.lastElementChild, { drawSVG: "0% 62.75%" })
      .to(a.firstChild, { yPercent: -110, duration: 1 }, 0)
      .fromTo(b.firstChild, { yPercent: 10 }, { yPercent: -100, duration: 1 }, "<");
    if (!touch) {
      link.addEventListener("mouseenter", () => tl.tweenTo(tl.duration(), { ease: "expo.out" }));
      link.addEventListener("mouseleave", () => tl.tweenTo(0, { ease: "expo.out" }));
    }
    return tl;
  };
  document.querySelectorAll("[data-roll]").forEach(ctaTl);

  // 3D button: the front flips 90° about its bottom-edge axis and leaves upward, the back stands up from −90° and rises (.6 straight → expo.out)
  document.querySelectorAll(".aq-flip").forEach((btn) => {
    const [front, back] = btn.children;
    const tl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: .6 } })
      .to(front, { rotateX: 90, transformOrigin: "50% 100%", yPercent: -100 })
      .fromTo(back, { rotateX: -90, yPercent: 0 }, { rotateX: 0, yPercent: -100, transformOrigin: "50% 0%" }, "<");
    if (touch) return;
    btn.addEventListener("mouseenter", () => tl.tweenTo(tl.duration(), { ease: "expo.out" }));
    btn.addEventListener("mouseleave", () => tl.tweenTo(0, { ease: "expo.out" }));
  });

  // Square button — the arrow inside slides out 175% and the same arrow enters from the opposite side (.67 straight → expo.out)
  site.squares = [...document.querySelectorAll("[data-roll-sq]")].map((btn) => {
    const [a, b] = btn.querySelectorAll("svg");
    const dir = btn.dataset.rollSq === "down" ? 1 : -1;
    gsap.set([a, b], { rotation: dir === 1 ? 135 : -45 });
    gsap.set(b, { yPercent: -175 * dir });
    const tl = gsap.timeline({ paused: true })
      .addLabel("initial")
      .to(a, { yPercent: 175 * dir, duration: .67, ease: "none" })
      .to(b, { yPercent: 0, duration: .67, ease: "none" }, "<")
      .addLabel("hover");
    if (!touch) {
      btn.addEventListener("mouseenter", () => tl.tweenTo("hover", { ease: "expo.out" }));
      btn.addEventListener("mouseleave", () => tl.tweenTo("initial", { ease: "expo.out" }));
    }
    return { btn, a, b, tl };
  });
  document.querySelectorAll("[data-to-top]").forEach((b) => b.addEventListener("click", () => site.scrollTo(0)));

  // On hover the cell fills with white and the drawing flips to black (1s linear → expo.out) — colors are mixed between skin variables by --tint
  document.querySelectorAll("[data-tint]").forEach((btn) => {
    gsap.set(btn, { "--tint": 0 });
    const tl = gsap.timeline({ paused: true }).to(btn, { "--tint": 1, duration: 1, ease: "none" });
    if (touch) return;
    btn.addEventListener("mouseenter", () => tl.tweenTo(1, { ease: "expo.out" }));
    btn.addEventListener("mouseleave", () => tl.tweenTo(0, { ease: "expo.out" }));
  });

  // Clock — the colon blinks and the time is rewritten every tenth blink
  const clockText = () => `${new Date().toLocaleTimeString("ko-KR", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false })} (KST)`;
  document.querySelectorAll("[data-clock]").forEach((el) => (el.textContent = clockText()));
  document.querySelectorAll(".aq-dot").forEach((dot) => {
    let n = 0;
    const clock = dot.parentElement.querySelector("[data-clock]");
    gsap.timeline({ repeat: -1, onRepeat: () => { if (++n === 10) { n = 0; if (clock) clock.textContent = clockText(); } } })
      .to(dot, { visibility: "hidden", duration: .1, ease: "none" }, .49)
      .to(dot, { visibility: "visible", duration: .1, ease: "none" }, .98);
  });

  // Header line — the bar fills following scroll progress (rounded %) at .07s, and the number walks right along the bar’s end
  const pBar = document.querySelector(".aq-progress__bar"), pShift = document.querySelector(".aq-progress__shift"), pNum = document.querySelector(".aq-progress__num");
  const progressTl = gsap.timeline({ paused: true, defaults: { duration: 100, ease: "none" } })
    .to(pShift, { xPercent: 100 })
    .to(pNum, { xPercent: -100 }, "<")
    .fromTo(pBar, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left" }, "<");
  let pct = -1;
  lenis.on("scroll", () => {
    const v = Math.round(lenis.progress * 100);
    if (v === pct) return;
    pct = v;
    pNum.textContent = `${v}% `;
    progressTl.tweenTo(v, { duration: .07, ease: "none" });
  });
  pNum.textContent = "0% ";

  // When the panel flips, all the small text visible scrambles once and returns to its own letters (1s expo.inOut, a different speed per text)
  const SPEEDS = [.6, .4, .5, .6, .2, .3, .6, .2];
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; };
  const glitchAll = () => {
    if (reduce) return;
    document.querySelectorAll(".aq-glitch").forEach((el, i) => {
      if (!inView(el) || el.children.length) return;
      gsap.to(el, { scrambleText: { text: el.textContent, chars: CHARS, speed: SPEEDS[i % SPEEDS.length], tweenLength: false }, duration: 1, ease: "expo.inOut" });
    });
    document.querySelectorAll(".aq-glitch-inner").forEach((el, i) => {
      if (!inView(el)) return;
      gsap.to(el, { scrambleText: { text: el.textContent, chars: CHARS, speed: SPEEDS[i % SPEEDS.length], tweenLength: false }, duration: 1, ease: "expo.inOut" });
    });
  };
  document.body.addEventListener("fx:hold", (e) => root.style.setProperty("--site-hold", e.detail.value.toFixed(3)));
  document.body.addEventListener("fx:mode", (e) => { site.mode = e.detail.mode; glitchAll(); hideHint(); });
  document.body.addEventListener("mousedown", (e) => { if (e.button === 0 && !e.target.closest("a, button, input, textarea, select, label, [role=button]")) root.classList.add("is-holding"); });
  addEventListener("mouseup", () => root.classList.remove("is-holding"));

  // Press hint — when the cursor rests for 1s (not over a button, and the plate not flipped), click / hold shuffle between 0 and 1 across the six surrounding cells and repeat
  const hint = document.querySelector(".aq-hint");
  const cells = [...hint.querySelectorAll("span")];
  const WORDS = ["hold", "click", "click", "hold", "hold", "click"], SEEDS = ["", "", "", "{original}"];
  const TIMES = [{ rv: 1.2, d: 2.6, rp: 0 }, { rv: 1.2, d: 1.2, rp: .8 }, { rv: 1.8, d: 2.6, rp: .4 }];
  let wi = -1;
  const hintTl = gsap.timeline({ paused: true });
  cells.forEach((c, i) => {
    const o = TIMES[i % 3];
    hintTl.set(c, { opacity: 1 }, i * .6).fromTo(c, { scrambleText: { text: () => SEEDS[Math.round(Math.random() * 3)] } }, {
      scrambleText: { text: () => WORDS[++wi % WORDS.length], chars: "01 0 1 */#", speed: .01, revealDelay: o.rv },
      duration: o.d, ease: "expo.out", repeat: -1, repeatDelay: o.rp, repeatRefresh: true,
    }, ">");
  });
  let shown = false, idle = null, moved = false;
  const overPick = () => !!document.elementFromPoint(site.mouse.x, site.mouse.y)?.closest("a, button, [role=button], input, select, textarea, label, summary");
  const showHint = () => {
    if (shown || overPick()) return;
    shown = true;
    hintTl.restart();
    gsap.to(hint, { autoAlpha: 1, duration: .3, ease: "power1.out", overwrite: true });
  };
  function hideHint() {
    idle?.kill();
    if (!shown) return;
    shown = false;
    gsap.to(hint, { autoAlpha: 0, duration: .2, ease: "power1.out", overwrite: true, onComplete: () => hintTl.pause() });
  }
  const hintOn = () => site.ready && site.mode === 0 && !touch;
  const armHint = () => { idle?.kill(); if (hintOn() && moved) idle = gsap.delayedCall(1, showHint); };
  let follow = true;
  document.addEventListener("mousemove", () => { moved = true; follow = true; hideHint(); armHint(); }, { passive: true });
  gsap.ticker.add(() => { if (!follow) return; follow = false; gsap.set(hint, { x: site.mouse.x, y: site.mouse.y }); });
  document.body.addEventListener("fx:mode", armHint);

  // Loader — the bar fills to 10, 35, 70 and 100% in .75, .6, 1 and .9s (same curve), and the curtain turns transparent over the first 2s (the liquid comes in then).
  // When full, the percent and bar peel upward, and the surrounding text scrambles as 0·1 and then resolves. When finished, the hero entrance plays and scrolling is released
  const loader = document.querySelector(".aq-loader");
  const finish = () => {
    loader?.remove();
    root.classList.remove("is-loading");
    lenis.start();
    site.ready = true;
    site.onReady.forEach((f) => f());
    armHint();
  };
  const startEnding = () => {
    root.classList.remove("is-loader-dark");
    document.body.dispatchEvent(new CustomEvent("fx:ready"));
  };
  if (reduce || !loader) {
    root.classList.remove("is-loader-dark");
    startEnding();
    requestAnimationFrame(finish);
    return;
  }
  root.classList.add("is-loader-dark");
  const pctEl = loader.querySelector(".aq-loader__pct"), track = loader.querySelector(".aq-loader__track"), bar = loader.querySelector(".aq-loader__bar");
  const count = { v: 0 };
  const tl = gsap.timeline({ paused: true });
  [[10, .75], [35, .6], [70, 1], [100, .9]].forEach(([v, d]) => {
    tl.to(count, { v, duration: d, ease: "aq-loader", onUpdate: () => (pctEl.textContent = `${Math.round(count.v)}%`) })
      .to(bar, { scaleX: v / 100, duration: d, ease: "aq-loader" }, "<")
      .to(pctEl, { xPercent: -v, x: () => track.clientWidth * v / 100, duration: d, ease: "aq-loader" }, "<");
  });
  tl.fromTo(loader, { "--veil": 1 }, { "--veil": 0, duration: 2, ease: "none", onComplete: startEnding }, 0)
    .fromTo(pctEl, { yPercent: 0, clipPath: "inset(0% 0% 0% 0%)" }, { yPercent: -100, clipPath: "inset(100% 0% 0% 0%)", delay: .2, ease: "expo.out", duration: 1 })
    .fromTo(track, { yPercent: 0, clipPath: "inset(0% 0% 0% 0%)" }, { yPercent: -100, clipPath: "inset(100% 0% 0% 0%)", ease: "expo.out", duration: .3 }, "<+=0.2");
  const n = tl.duration() - .5;
  loader.querySelectorAll("[data-fly]").forEach((el, i) => {
    tl.set(el, { opacity: 1 }, i * .2).from(el, { scrambleText: { text: "", chars: "01 0 1", speed: .3, revealDelay: n * .6 }, duration: n * .6, ease: "expo.out" }, ">");
  });
  tl.addLabel("end");
  loader.querySelectorAll("[data-bin]").forEach((el) => {
    gsap.set(el, { width: el.clientWidth, height: el.clientHeight, opacity: 1 });
    tl.from(el, { scrambleText: { text: "", chars: "01 0 1", speed: .3, revealDelay: n }, duration: n, ease: "power1.out" }, 0);
  });
  const go = () => tl.tweenTo("end", { ease: "none", onComplete: finish });
  go();
})();
