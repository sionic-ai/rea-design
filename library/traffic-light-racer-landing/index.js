// One-page motion — traffic-light loader and hero handover, helmet, quote photo saturation, pinned career, article panel, race schedule, finish flag, growing video, wheel gallery
(() => {
  const NH = window.NH;
  const reduce = NH.reduce;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  CustomEase.create("nh-card", "0.16,1,0.3,1");

  // Hero text rises when the loader ends — hidden beforehand
  const heroTexts = $$("[data-hero-text]");
  const heroSplits = heroTexts.map((el) => SplitText.create(el, { type: el.tagName === "H1" ? "words" : "lines", mask: el.tagName === "H1" ? "words" : "lines" }));
  const heroLines = heroSplits.flatMap((s) => (s.words.length && !s.lines.length ? s.words : s.lines.length ? s.lines : s.words));
  const fluid = NH.heroFluid($(".nh-hero__fluid"), $(".nh-hero__ph"));

  // Loader — while the number 0→98 rolls with 2s expo.out, five traffic lights turn yellow in turn (.35s), and .05s later a giant white 98 (×100) shrinks into place over 1.2s expo.inOut, taking over the hero (yellow panel .025s later)
  function loader() {
    const wrap = $(".nh-loader"), count = $("[data-loader-count]"), lights = $$(".nh-loader__lights i");
    const white = $('[data-take="white"]'), yellow = $('[data-take="yellow"]');
    const img = $(".nh-hero__ph"), lines = $$(".nh-lines--hero i"), stats = $$(".nh-hero [data-odo]");
    if (reduce) {
      wrap.remove();
      stats.forEach((s) => (s.textContent = s.dataset.odo));
      return;
    }
    NH.lock("loader");
    gsap.set(lines, { scaleY: 0 });
    gsap.set(heroLines, { yPercent: 110 });
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    gsap.set([white, yellow], { x: 95 * rem, scale: 100 });
    gsap.set(img, { scale: 1.2, filter: "grayscale(1) brightness(0.4)" });
    // The fluid plate’s photo shapes also start dark and brighten like photos (the plate follows the photo position for size)
    const fl = $(".nh-hero__fluid");
    gsap.set(fl, { opacity: 0.4 / 0.92 });
    const C = { count: 2, ease: "expo.out" }, L = { dur: 0.35, endOffset: 0.3 };
    const tl = gsap.timeline({ onComplete: () => { NH.unlock("loader"); wrap.remove(); } });
    tl.add(NH.odometer(count, 98, { duration: C.count, ease: C.ease }), 0);
    const span = Math.max(L.dur, C.count - L.endOffset), gap = (span - L.dur) / (lights.length - 1);
    tl.to(lights, { backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim(), duration: L.dur, stagger: gap, ease: "power2.out" }, 0);
    const at = C.count + 0.05;
    tl.set(wrap, { backgroundColor: "transparent" }, at);
    tl.to(white, { scale: 1, x: 0, duration: 1.2, ease: "expo.inOut" }, at);
    tl.to(yellow, { scale: 1, x: 0, duration: 1.2, ease: "expo.inOut" }, at + 0.025);
    tl.to(count, { scale: 0, duration: 1, ease: "expo.inOut" }, at);
    tl.to(lights, { opacity: 0, duration: 0.2, stagger: 0.08, ease: "power1.out" }, at);
    tl.to(img, { scale: 1, duration: 1.6, ease: "expo.inOut" }, at);
    tl.to(img, { filter: "grayscale(1) brightness(0.92)", duration: 1.6, ease: "expo.inOut" }, at);
    tl.to(fl, { opacity: 1, duration: 1.6, ease: "expo.inOut" }, at);
    tl.to(lines, { scaleY: 1, duration: 1.6, stagger: { each: 0.06, from: "random" }, ease: "power3.inOut" }, at + 0.2);
    stats.forEach((s, i) => tl.add(NH.odometer(s, +s.dataset.odo, { duration: 1.2, ease: "expo.out" }), at + 0.4 + i * 0.08));
    tl.to(heroLines, { yPercent: 0, duration: 0.8, stagger: 0.08, ease: "expo.out" }, at + 0.4 + 0.15);
  }

  // Days until the next race — shows ”TBA” if the schedule has passed
  function countdown() {
    const el = $("[data-countdown]");
    const next = $$("[data-race-time]").map((x) => new Date(x.dataset.raceTime)).filter((d) => d > new Date()).sort((a, b) => a - b)[0];
    if (!el || !next) return;
    const days = Math.min(99, Math.ceil((next - new Date()) / 864e5));
    el.textContent = `${String(days).padStart(2, "0")} days`;
  }

  // Helmet — an image that rotates with scroll (the original flips a photo set on a canvas), and tilts late toward cursor x by 52px·11° (rotationY) with ±12px floating
  function helmet() {
    const stage = $("[data-helmet-stage]"), cv = $(".nh-helmet__cv");
    if (!stage || !cv) return;
    const ctx = cv.getContext("2d");
    const css = getComputedStyle(document.documentElement);
    const v = (n) => css.getPropertyValue(n).trim();
    const col = { ink: v("--kf-ink"), acc: v("--kf-accent"), bg: v("--kf-bg"), dim: v("--kf-dim") };
    const draw = (a) => {
      const w = (cv.width = cv.clientWidth * 2), h = (cv.height = cv.clientHeight * 2);
      ctx.clearRect(0, 0, w, h);
      ctx.save(); ctx.translate(w / 2, h / 2);
      const s = Math.min(w, h) * 0.3, k = Math.cos(a), side = Math.sin(a);
      ctx.fillStyle = col.acc; ctx.beginPath(); ctx.ellipse(0, 0, s * (0.78 + 0.12 * Math.abs(side)), s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col.ink; ctx.beginPath(); ctx.ellipse(side * s * 0.25, -s * 0.05, s * 0.62 * Math.max(0.15, Math.abs(k)), s * 0.28, 0, 0, Math.PI * 2); ctx.globalAlpha = k > -0.2 ? 1 : 0; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = col.bg; ctx.lineWidth = s * 0.08; ctx.beginPath(); ctx.ellipse(side * s * 0.1, s * 0.05, s * 0.82, s * 0.98, 0, Math.PI * 0.95, Math.PI * 1.55); ctx.stroke();
      ctx.fillStyle = col.dim; ctx.fillRect(-s * 0.9, s * 0.62, s * 1.8, s * 0.22);
      ctx.restore();
    };
    const st = { a: -0.6 };
    draw(st.a);
    if (reduce) return;
    gsap.to(st, { a: 0.9, ease: "none", onUpdate: () => draw(st.a), scrollTrigger: { trigger: ".nh-wall", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.matchMedia().add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      gsap.set(stage, { transformPerspective: 900, transformOrigin: "50% 50%", force3D: true });
      const bob = gsap.fromTo(stage, { y: 12 }, { y: -12, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      // The original only reads horizontal movement (no vertical tilt), back to 0 when outside the window
      const xTo = gsap.quickTo(stage, "x", { duration: 1.4, ease: "power3.out" });
      const ry = gsap.quickTo(stage, "rotationY", { duration: 1.9, ease: "power3.out" });
      const mv = (e) => { const nx = e.clientX / innerWidth * 2 - 1; xTo(nx * 52); ry(nx * 11); };
      const out = () => { xTo(0); ry(0); };
      addEventListener("mousemove", mv, { passive: true });
      document.documentElement.addEventListener("mouseleave", out);
      return () => { bob.kill(); removeEventListener("mousemove", mv); document.documentElement.removeEventListener("mouseleave", out); };
    });
  }

  // Photo beside the quote — when 25% of the panel reaches the screen center, saturation goes 0→1 (.6s power2.out), scrolling back up returns it to black and white
  function quote() {
    $$("[data-quote-image] .nh-ph").forEach((ph) => {
      if (reduce) { ph.style.filter = "none"; return; }
      ScrollTrigger.create({ trigger: ".nh-quote", start: "25% center", onEnter: () => gsap.to(ph, { filter: "saturate(1)", duration: 0.6, ease: "power2.out" }), onLeaveBack: () => gsap.to(ph, { filter: "saturate(0)", duration: 0.6, ease: "power2.out" }) });
    });
  }

  // Pinned career — as the photo strip passes, only the photo at screen center is sharp and in color, and the title, text and number switch to that step’s
  function about() {
    const imgs = $$("[data-about-image]"), titles = $$("[data-about-title] h3"), items = $$("[data-about-item]"), now = $("[data-about-now]");
    let cur = -1;
    const set = (i, inst) => {
      if (i === cur) return;
      const prev = cur; cur = i;
      imgs.forEach((im, k) => { im.classList.toggle("is-active", k === i); gsap.to(im.querySelector(".nh-ph"), { filter: k === i ? "saturate(1)" : "saturate(0)", duration: inst ? 0 : 0.6, ease: "power2.out", overwrite: "auto" }); });
      titles.forEach((t, k) => gsap.to(t, { yPercent: k === i ? 0 : (k < i ? -110 : 110), duration: inst ? 0 : 0.6, ease: "expo.out", overwrite: "auto" }));
      items.forEach((t, k) => gsap.to(t, { autoAlpha: k === i ? 1 : 0, y: k === i ? 0 : (k < i ? -20 : 20), duration: inst ? 0 : 0.6, ease: "expo.out", overwrite: "auto" }));
      if (now) now.textContent = i + 1;
      return prev;
    };
    set(0, true);
    const pick = () => {
      const mid = innerHeight / 2;
      let best = 0, bd = Infinity;
      imgs.forEach((im, k) => { const r = im.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = k; } });
      set(best);
    };
    ScrollTrigger.create({ trigger: ".nh-about", start: "top bottom", end: "bottom top", onUpdate: pick });
  }

  // Article panel — the same Swiper panel as the original, mouse devices 1.2s cubic-bezier(.16,1,.3,1), drag .8, touch .3s
  function media() {
    const el = $(".nh-media__slider");
    if (!el) return;
    const desk = NH.fine;
    new Swiper(el, {
      slidesPerView: "auto", spaceBetween: 24, speed: desk ? 1200 : 300, grabCursor: true,
      touchRatio: desk ? 0.8 : 1, resistanceRatio: desk ? 0.65 : 0.85, longSwipesRatio: desk ? 0.1 : 0.5, longSwipesMs: desk ? 120 : 300,
      navigation: { prevEl: "[data-media-prev]", nextEl: "[data-media-next]" },
      on: { init(s) { if (desk) s.wrapperEl.style.transitionTimingFunction = "cubic-bezier(0.16, 1, 0.3, 1)"; } },
    });
  }

  // Race schedule — the car slides to the current row height in .8s expo.out, and that row name turns yellow in .2s
  function agenda() {
    const car = $("[data-agenda-car]"), items = $$("[data-agenda-item]");
    items.forEach((it) => ScrollTrigger.create({
      trigger: it, start: "top center", end: "bottom center",
      onToggle: (self) => {
        it.classList.toggle("is-active", self.isActive);
        if (self.isActive && car && !reduce) {
          const r = it.getBoundingClientRect();
          gsap.to(car, { y: Math.max(-innerHeight * 0.3, Math.min(innerHeight * 0.3, r.top + r.height / 2 - innerHeight / 2)), duration: 0.8, ease: "expo.out", overwrite: true });
        }
      },
    }));
  }

  // Finish flag — the checker cells fade and return at different depths (.45~.65, 22% at .25~.4), rippling (up to 16 cells at once)
  function finish() {
    const svg = $(".nh-finish");
    if (!svg) return;
    const NS = "http://www.w3.org/2000/svg", size = 28, cols = Math.ceil(innerWidth / size) + 1, rows = 8;
    svg.setAttribute("viewBox", `0 0 ${cols * size} ${rows * size}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMin slice");
    const cells = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if ((x + y) % 2) continue;
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", x * size); r.setAttribute("y", y * size); r.setAttribute("width", size); r.setAttribute("height", size); r.setAttribute("fill", "currentColor");
      svg.append(r); cells.push(r);
    }
    if (reduce) return;
    let live = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const spawn = () => {
      if (live < 16) {
        const c = cells[(Math.random() * cells.length) | 0];
        if (!c._busy) {
          c._busy = true; live++;
          const dip = Math.random() < 0.22 ? rnd(0.25, 0.4) : rnd(0.45, 0.65);
          const down = rnd(600, 1400), hold = rnd(0, 300), up = rnd(600, 1400);
          c.style.transition = `fill-opacity ${down}ms cubic-bezier(0.4, 0, 0.2, 1)`; c.style.fillOpacity = dip;
          setTimeout(() => { c.style.transition = `fill-opacity ${up}ms cubic-bezier(0.4, 0, 0.2, 1)`; c.style.fillOpacity = 1; setTimeout(() => { c._busy = false; live--; }, up); }, down + hold);
        }
      }
      setTimeout(spawn, rnd(80, 140));
    };
    spawn();
  }

  // Growing video — when the board top reaches 80% of the screen, it starts at 70vw×70vh and fills fully when touching the screen top
  function video() {
    const box = $(".nh-video__box"), sec = $(".nh-video");
    if (!box) return;
    box.addEventListener("click", () => { box.dataset.muted = box.dataset.muted === "false" ? "true" : "false"; });
    if (reduce) return;
    gsap.matchMedia().add("(min-width: 768px)", () => {
      gsap.fromTo(box, { width: "70vw", height: "70vh" }, { width: "100vw", height: "100vh", borderRadius: 0, ease: "none", scrollTrigger: { trigger: sec, start: "top 80%", end: "top top", scrub: true } });
    });
  }

  // Overlapping bands — a data-overlap band sags down 40vh while its bottom passes from the screen bottom upward, and the next band covers over it (original overlap, 992px and up)
  function overlap() {
    gsap.matchMedia().add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      $$("[data-overlap]").forEach((s, i) => {
        const amt = +s.dataset.overlap || 30;
        gsap.set(s, { position: "relative", zIndex: 2 + i });
        if (s.nextElementSibling) gsap.set(s.nextElementSibling, { position: "relative", zIndex: 3 + i });
        gsap.to(s, { y: () => (amt / 100) * innerHeight, ease: "none", scrollTrigger: { trigger: s, start: "bottom bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      });
    });
  }

  // Wheel gallery — cards stand around a circle of radius 100rem at intervals of card width + gap (10em), and roll one step in 1.2s by dragging or buttons
  function radial() {
    const box = $("[data-radial]"), track = $(".nh-radial__track"), cards = $$("[data-radial-card]");
    if (!box || !cards.length) return;
    const ticks = $(".nh-radial__ticks");
    let step = 10, rot = 0, idx = 0;
    const layout = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const R = 100 * rem, gapEm = parseFloat(getComputedStyle(box).getPropertyValue("--card-gap")) || (innerWidth < 480 ? 2 : innerWidth < 992 ? 4 : 10);
      const cw = cards[0].offsetWidth;
      step = ((cw + gapEm * rem) / R) * (180 / Math.PI);
      track.style.top = `${R + cards[0].offsetHeight / 2 + 2 * rem}px`;
      cards.forEach((c, i) => {
        const a = (i - (cards.length - 1) / 2) * step;
        c.style.transform = `rotate(${a}deg) translateY(${-R}px)`;
      });
    };
    layout();
    new ResizeObserver(layout).observe(box);
    const max = ((cards.length - 1) / 2) * step;
    const go = (to, dur = 1.2) => { rot = Math.max(-max, Math.min(max, to)); gsap.to(track, { rotation: -rot, duration: reduce ? 0 : dur, ease: "expo.out", overwrite: true }); idx = Math.round(rot / step); };
    if (ticks) for (let i = 0; i < 9; i++) { const t = document.createElement("i"); t.style.transform = `translateX(-50%) rotate(${(i - 4) * 9}deg)`; ticks.prepend(t); }
    $("[data-radial-prev]")?.addEventListener("click", () => go((idx - 1) * step));
    $("[data-radial-next]")?.addEventListener("click", () => go((idx + 1) * step));
    let sx = 0, sr = 0, dragging = false;
    box.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; dragging = true; sx = e.clientX; sr = rot; box.setPointerCapture(e.pointerId); });
    box.addEventListener("pointermove", (e) => { if (!dragging) return; const d = (sx - e.clientX) / innerWidth * step * 4; rot = Math.max(-max, Math.min(max, sr + d)); gsap.to(track, { rotation: -rot, duration: 0.6, ease: "power3.out", overwrite: true }); });
    const end = () => { if (!dragging) return; dragging = false; go(Math.round(rot / step) * step); };
    box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
  }

  countdown();
  helmet();
  quote();
  about();
  media();
  agenda();
  finish();
  video();
  overlap();
  radial();
  ScrollTrigger.refresh();
  window.NH.fluid = fluid;
  // The loader counts after the fonts have all loaded (waits for the original’s loaderNumbersReady)
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(loader);
})();
