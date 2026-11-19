// Common to all pages — smooth scroll (lenis 1.3.26, original values), text splitting that resolves from blur, face and pinwheel graphics, scroll loops,
// Footer appearance and dock hiding, intro video curtain, and a 3D robot that looks at the cursor (three r179, our basic shapes instead of the original model).
(() => {
  const A = (window.A = {});
  const reduce = (A.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches);
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  addEventListener("pageshow", (e) => e.persisted && ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // Original: caps one wheel tick at 9% of the screen and follows with a 1.3s exponential curve
  if (!reduce && window.Lenis) {
    const cap = () => innerHeight * 0.09;
    const clamp = (v) => Math.sign(v) * Math.min(Math.abs(v), cap());
    A.lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.75,
      touchMultiplier: 0.9,
      virtualScroll(d) { d.deltaX = clamp(d.deltaX); d.deltaY = clamp(d.deltaY); },
    });
    A.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => A.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Text that resolves from 8px blur, 15px below and transparent — original SplitText values
  A.split = (el, type = "words") => {
    if (!el) return null;
    const s = new SplitText(el, { type: type === "chars" ? "words, chars" : type, charsClass: "sr-char", wordsClass: "sr-word", linesClass: "sr-line" });
    const parts = type === "chars" ? s.chars : type === "lines" ? s.lines : s.words;
    gsap.set(parts, reduce ? { opacity: 1, filter: "none", y: 0 } : { opacity: 0, filter: "blur(8px)", y: 15 });
    return { split: s, parts };
  };
  A.rise = (extra) => Object.assign({ opacity: 1, filter: "blur(0px)", y: 0, stagger: 0.03, ease: "power2.out", duration: 0.9, onComplete() { gsap.set(this.targets(), { clearProps: "filter" }); } }, extra);
  A.sink = { opacity: 0, filter: "blur(8px)", y: 15, duration: 0.2, overwrite: true };

  A.css = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();
  A.rgb = (() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const g = cv.getContext("2d", { willReadFrequently: true });
    return (v) => { g.clearRect(0, 0, 1, 1); g.fillStyle = v; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; };
  })();

  // Face icon (spot for the original’s blinking status avatar)
  const FACE = '<svg class="a-face" viewBox="0 0 30 26" aria-hidden="true"><rect x="1" y="1" width="28" height="24" rx="9"/><rect class="eye" x="9" y="8" width="3.2" height="7" rx="1.6"/><rect class="eye" x="17.8" y="8" width="3.2" height="7" rx="1.6"/><path d="M11 18.5q4 2.6 8 0"/></svg>';
  document.querySelectorAll("[data-face]").forEach((n) => (n.innerHTML = FACE));

  // Pinwheel core — five petals (one orange), one turn in 7s (original .shared-spinner)
  const PETALS = [0, 1, 2, 3, 4].map((i) => `<ellipse class="petal${i === 1 ? " is-warm" : ""}" cx="50" cy="29" rx="15" ry="24" transform="rotate(${i * 72} 50 50) rotate(28 50 29)"/>`).join("");
  const WHEEL = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="glow" cx="50" cy="50" r="34"/><g class="spin">${PETALS}<circle class="core" cx="50" cy="50" r="3.2"/></g></svg>`;
  document.querySelectorAll("[data-wheel]").forEach((n) => {
    n.innerHTML = WHEEL;
    if (!reduce) gsap.to(n.querySelector(".spin"), { rotation: 360, svgOrigin: "50 50", duration: 7, ease: "none", repeat: -1 });
  });

  // Contact window — opened by the dock CTA and footer button. Closes via the close button, backdrop or Esc, and scroll is paused while it is open
  const form = document.createElement("div");
  form.className = "a-form";
  form.setAttribute("aria-hidden", "true");
  form.dataset.slot = "contact-modal";
  form.innerHTML = `<div class="a-form-panel" role="dialog" aria-modal="true" aria-labelledby="a-form-title">
    <div class="a-form-head"><h2 id="a-form-title" data-label="English window title">Form title.</h2><button class="a-form-close" type="button" aria-label="Close"><svg viewBox="0 0 16 16"><path d="M1 1l14 14M15 1L1 15"/></svg></button></div>
    <form onsubmit="return false">
      <div class="a-form-row"><label>NAME<input id="a-form-name" type="text" placeholder="Name"></label><label>EMAIL<input type="email" placeholder="name@example.com"></label></div>
      <div class="a-form-row"><label>COMPANY<input type="text" placeholder="Company name"></label><label>ROLE<input type="text" placeholder="Assigned role"></label></div>
      <label>MESSAGE<textarea rows="4" placeholder="Write the story you want to tell here"></textarea></label>
      <button class="a-form-send" type="submit">SEND</button>
      <p class="a-form-legal">Your small two-line notice on how submitted content is handled goes here.</p>
    </form>
  </div>`;
  document.body.append(form);
  let formOpen = false;
  const openForm = (e) => { e?.preventDefault(); if (formOpen) return; formOpen = true; A.lenis?.stop(); form.setAttribute("aria-hidden", "false"); requestAnimationFrame(() => { form.classList.add("is-open"); form.querySelector("#a-form-name").focus({ preventScroll: true }); }); };
  const closeForm = () => { if (!formOpen) return; formOpen = false; form.classList.remove("is-open"); form.setAttribute("aria-hidden", "true"); A.lenis?.start(); };
  document.querySelectorAll(".a-dock-cta, .a-connect, [data-form-open]").forEach((b) => b.addEventListener("click", openForm));
  form.querySelector(".a-form-close").addEventListener("click", closeForm);
  form.addEventListener("click", (e) => e.target === form && closeForm());
  addEventListener("keydown", (e) => e.key === "Escape" && closeForm());

  // Scroll ring at bottom right
  const arc = document.querySelector(".a-progress .arc");
  if (arc) {
    const len = 2 * Math.PI * arc.r.baseVal.value;
    arc.style.strokeDasharray = len.toFixed(2);
    let q = 0;
    const draw = () => { q = 0; const max = document.documentElement.scrollHeight - innerHeight; arc.style.strokeDashoffset = (len * (1 - (max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0))).toFixed(2); };
    addEventListener("scroll", () => q || (q = requestAnimationFrame(draw)), { passive: true });
    addEventListener("resize", draw);
    draw();
  }

  // Footer — top corners spread from 64 → 42px while dropping in from 28px above, and the dock and ring slide out 130px down
  A.footer = ({ main = true } = {}) => {
    const foot = document.querySelector(".a-foot");
    if (!foot) return;
    gsap.fromTo(foot, { y: -28, borderRadius: "64px 64px 0 0" }, { y: 0, borderRadius: "42px 42px 0 0", ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "top 68%", scrub: 1.1 } });
    gsap.to([".a-dock", ".a-progress"], { y: 130, autoAlpha: 0, ease: "power2.in", scrollTrigger: { trigger: foot, start: "top 82%", end: "top 58%", scrub: 1 } });
    if (!main) return;
    const box = foot.querySelector(".a-foot-main"), h = A.split(box?.querySelector("h2"), "chars");
    if (reduce) return;
    gsap.set(box, { autoAlpha: 0, y: 44 });
    let shown = false;
    gsap.timeline({ scrollTrigger: { trigger: foot, start: "top 72%", end: "top 30%", scrub: 0.8, invalidateOnRefresh: true, onUpdate(st) {
      if (!h) return;
      if (st.progress >= 0.5 && !shown) { shown = true; gsap.to(h.parts, A.rise({ stagger: 0.025 })); }
      else if (st.progress < 0.5 && shown) { shown = false; gsap.to(h.parts, A.sink); }
    } } }).to(box, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0);
  };

  // Intro video curtain — the original plays the video to the end (or SKIP) only on the first visit and remembers it. Our placeholder video runs the same length on a canvas
  A.preload = ({ key, seconds = 11.9, onDone } = {}) => {
    const pre = document.querySelector(".a-pre");
    const root = document.documentElement;
    let seen = false;
    try { seen = key && localStorage.getItem(key) === "1"; } catch {}
    if (!pre || seen || root.classList.contains("intro-seen")) {
      pre?.remove();
      root.classList.remove("is-preloading");
      onDone?.();
      return;
    }
    const pct = pre.querySelector(".a-pre-percent"), bar = pre.querySelector(".a-pre-bar i"), skip = pre.querySelector(".a-pre-skip");
    const film = A.film(pre.querySelector("canvas"));
    let done = false, got = 0;
    const remember = () => { try { localStorage.setItem(key, "1"); } catch {} };
    const show = (v) => { got = Math.max(got, Math.min(100, v)); pct.textContent = Math.round(got) + "%"; bar.style.width = got + "%"; };
    const finish = () => {
      if (done) return;
      done = true;
      film?.stop();
      const brand = document.querySelector(".a-brand"), a = brand?.getBoundingClientRect();
      root.classList.remove("is-preloading");
      A.lenis?.start();
      A.lenis?.scrollTo(0, { immediate: true });
      if (brand && !reduce) {
        const b = brand.getBoundingClientRect();
        gsap.fromTo(brand, { x: a.left - b.left, y: a.top - b.top }, { x: 0, y: 0, duration: 0.9, ease: "power3.inOut", overwrite: "auto", clearProps: "transform" });
      }
      gsap.to(pre, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut", onComplete: () => pre.remove() });
      onDone?.();
    };
    if (reduce) return finish();
    A.lenis?.stop();
    const t0 = performance.now();
    const tick = () => {
      if (done) return;
      const p = (performance.now() - t0) / 1000 / seconds;
      show(p * 100);
      if (p >= 1) { show(100); remember(); finish(); } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    skip?.addEventListener("click", () => { remember(); finish(); });
  };

  // Placeholder video — a dark field with flowing stars (only the light tone of the original intro video). Canvas 2D
  A.film = (cv) => {
    if (!cv) return null;
    const g = cv.getContext("2d");
    const ink = A.rgb(A.css("--kf-ink")), acc = A.rgb(A.css("--kf-accent")), warm = A.rgb(A.css("--site-orange"));
    let seed = 4211;
    const r = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
    const dots = Array.from({ length: 220 }, () => ({ x: r(), y: 0.55 + r() * 0.45, s: 0.6 + r() * 2.4, w: r() < 0.12, p: r() * 6.28 }));
    let raf = 0, live = true;
    const draw = (now) => {
      const w = (cv.width = cv.clientWidth), h = (cv.height = cv.clientHeight);
      const t = now / 1000;
      g.clearRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) {
        const x = ((i / 9 + t * 0.006) % 1) * w, a = 0.05 + 0.04 * Math.sin(t * 0.7 + i);
        const gr = g.createLinearGradient(x, 0, x, h * 0.6);
        gr.addColorStop(0, `rgba(${acc},${a})`); gr.addColorStop(1, `rgba(${acc},0)`);
        g.fillStyle = gr; g.fillRect(x - w * 0.03, 0, w * 0.06, h * 0.6);
      }
      for (const d of dots) {
        const c = d.w ? warm : ink, a = 0.35 + 0.35 * Math.sin(t * 1.3 + d.p);
        g.fillStyle = `rgba(${c},${a})`;
        g.beginPath(); g.arc(d.x * w, d.y * h, d.s * (1 + t * 0.02), 0, 6.283); g.fill();
      }
      if (live) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return { stop() { live = false; cancelAnimationFrame(raf); } };
  };

  const snap = (to) => (reduce ? undefined : { snapTo: to, inertia: false, delay: 0.3, duration: { min: 0.4, max: 0.8 }, ease: "power1.inOut" });
  A.snap = snap;

  // Robot workbench — on entry the title, robot (64px down, 1.08x scale, 22px blur) and ticks resolve in (top 45% → top), and while pinned the section texts flip one by one.
  // Original: exit .12 · enter .26, length = (sections − 2 + .12 + .26 + .35 + .3) × 1.148 screens, scrub .5, snap per section
  A.bench = (sec) => {
    if (!sec) return;
    const stage = sec.querySelector(".a-bench-stage"), h2 = sec.querySelector(".a-bench-h2"), robot = sec.querySelector(".a-bench-robot"), rule = sec.querySelector(".a-rule");
    const arts = gsap.utils.toArray(sec.querySelectorAll(".a-bench-copy article")), f = arts.length;
    if (f < 2) return;
    gsap.set(arts, { yPercent: -50, autoAlpha: 0, y: 20 });
    gsap.set(arts[0], { autoAlpha: 1, y: 0 });
    const heads = arts.map((a, i) => (i ? A.split(a.querySelector("h3"), "lines") : null));
    const first = A.split(arts[0].querySelector("h3"), "lines"), firstP = gsap.utils.toArray(arts[0].querySelectorAll("p, .a-link"));
    if (rule) gsap.set(rule, { yPercent: -50 });
    const show = [h2, robot, rule, ...firstP].filter(Boolean);
    if (reduce) gsap.set(show, { autoAlpha: 1 });
    else {
      gsap.set(show, { autoAlpha: 0 });
      const t = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 45%", end: "top top", scrub: 0.35, invalidateOnRefresh: true } });
      if (h2) t.fromTo(h2, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);
      if (robot) t.fromTo(robot, { autoAlpha: 0, y: 64, scale: 1.08, filter: "blur(22px)" }, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.62, ease: "power2.out" }, 0);
      if (rule) t.fromTo(rule, { autoAlpha: 0, scaleY: 0, transformOrigin: "50% 0%" }, { autoAlpha: 1, scaleY: 1, duration: 0.38, ease: "power2.out" }, 0.34);
      if (firstP.length) t.fromTo(firstP, { autoAlpha: 0, x: -26 }, { autoAlpha: 1, x: 0, duration: 0.44, stagger: 0.07, ease: "power2.out" }, 0.56);
      if (first) { gsap.set(first.parts, { x: -26 }); t.to(first.parts, A.rise({ x: 0, duration: 0.38, stagger: 0.07 }), 0.6); }
    }
    const out = 0.12, inn = 0.26, fadeAt = f - 2 + out + inn + 0.35, fade = 0.3, len = fadeAt + fade, scale = 1.148;
    const stops = [0];
    for (let w = 2; w <= f; w++) stops.push(Math.min(1, (w - 2 + out + inn) / len));
    stops.push(1);
    const prog = { value: 0 };
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + innerHeight * len * scale, pin: stage, scrub: 0.5, invalidateOnRefresh: true, snap: snap(stops) } });
    for (let w = 1; w < f; w++) {
      const at = w - 1;
      tl.fromTo(arts[w - 1], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -20, duration: out }, at)
        .fromTo(arts[w], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: inn }, at + out)
        .to(prog, { value: w / (f - 1), duration: 0.4, onUpdate: () => rule?.style.setProperty("--progress", prog.value.toFixed(4)) }, at);
      if (heads[w]) tl.to(heads[w].parts, A.rise({ duration: 0.4, stagger: 0.06 }), at + out);
    }
    tl.fromTo([h2, robot, rule].filter(Boolean), { opacity: 1 }, { opacity: 0, duration: fade, ease: "power2.in", immediateRender: false }, fadeAt)
      .fromTo(arts[f - 1], { autoAlpha: 1 }, { autoAlpha: 0, duration: fade, ease: "power2.in", immediateRender: false }, fadeAt);
    if (robot) A.robot(robot, { below: 0.17, top: 0.03 });
  };

  // Ring story — the ring forms from 130px below · .86x · −9° · blur 16px (top 88% → top), and during the 3.6-screen pin it passes three sections while the ring fills by 1/3 each.
  A.story = (sec) => {
    if (!sec) return;
    const stage = sec.querySelector(".a-story-stage"), orbit = sec.querySelector(".a-orbit"), fillSvg = orbit?.querySelector(".fill"), step = orbit?.querySelector(".a-step");
    const arts = gsap.utils.toArray(sec.querySelectorAll(".a-story-copy article"));
    if (!orbit || arts.length < 2) return;
    const size = () => {
      const r = stage.getBoundingClientRect(), w = r.width < 700 ? Math.min(r.width * 0.523, r.height * 0.242) : r.width < 1024 ? Math.min(r.width * 0.82, r.height * 0.62) : Math.min(r.width * 0.452, r.height * 0.72);
      orbit.style.width = orbit.style.height = w + "px";
      orbit.style.setProperty("--ring", (Math.PI * w * 0.485 * 2).toFixed(2) + "px");
    };
    size();
    ScrollTrigger.addEventListener("refresh", size);
    gsap.set(orbit, { xPercent: -50, yPercent: -50 });
    if (step) gsap.set(step, { xPercent: -50, yPercent: -50 });
    gsap.set(arts, { yPercent: innerWidth < 700 ? 0 : -50, autoAlpha: 0, y: 20 });
    gsap.set(arts[0], { autoAlpha: 1, y: 0 });
    const heads = arts.map((a, i) => (i ? A.split(a.querySelector("h3"), "words") : null));
    const first = A.split(arts[0].querySelector("h3"), "words"), bits = gsap.utils.toArray(arts[0].querySelectorAll(".a-pill, p, b"));
    const fill = { value: 0 }, put = () => sec.style.setProperty("--fill", fill.value.toFixed(2));
    put();
    if (reduce) gsap.set([orbit, fillSvg, step, ...bits], { autoAlpha: 1 });
    else {
      gsap.set([orbit, fillSvg, step, ...bits], { autoAlpha: 0 });
      const t = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 88%", end: "top top", scrub: 0.6, invalidateOnRefresh: true } });
      t.fromTo(orbit, { autoAlpha: 0, y: 130, scale: 0.86, rotation: -9, filter: "blur(16px)" }, { autoAlpha: 1, y: 0, scale: 1, rotation: 0, filter: "blur(0px)", duration: 0.58, ease: "power2.out" }, 0)
        .fromTo(fillSvg, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" }, 0.4)
        .fromTo(step, { autoAlpha: 0, scale: 0.35 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" }, 0.46)
        .fromTo(bits, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.06, ease: "power2.out" }, 0.58);
      if (first) t.to(first.parts, A.rise({ duration: 0.34, stagger: 0.03 }), 0.62);
    }
    const n = arts.length, tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + innerHeight * 3.6, pin: stage, scrub: 0.5, invalidateOnRefresh: true, snap: snap([0, 1 / 6, 1 / 2, 5 / 6, 1]) } });
    tl.to(fill, { value: 100 / n, duration: 0.4, onUpdate: put }, 0);
    for (let u = 1; u < n; u++) {
      tl.to(arts[u - 1], { autoAlpha: 0, y: -20, duration: 0.3 }, u).to(arts[u], { autoAlpha: 1, y: 0, duration: 0.3 }, u).to(fill, { value: ((u + 1) * 100) / n, duration: 0.4, onUpdate: put }, u);
      if (heads[u]) tl.to(heads[u].parts, A.rise({ duration: 0.5, stagger: 0.025 }), u);
    }
    tl.fromTo([orbit, fillSvg, step].filter(Boolean), { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power2.in", immediateRender: false }, 2.7)
      .fromTo(arts[n - 1], { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, ease: "power2.in", immediateRender: false }, 2.7)
      .to({}, { duration: 0.001 }, 3);
  };

  // Short header section — title letters resolve over 40% after the section top reaches the top of the screen, and the text rises over 70% at .12s intervals (the original Zt)
  A.plain = (sec, sel = "p") => {
    if (!sec) return;
    const h = A.split(sec.querySelector("h2"), "chars"), ps = gsap.utils.toArray(sec.querySelectorAll(`:scope > ${sel}`));
    if (reduce) return gsap.set(ps, { opacity: 1, y: 0 });
    gsap.set(ps, { opacity: 0, y: 20 });
    if (h) gsap.to(h.parts, A.rise({ stagger: 0.03, duration: 0.9, scrollTrigger: { trigger: sec, start: "top 60%", end: "+=40%", scrub: 0.3, invalidateOnRefresh: true } }));
    gsap.to(ps, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: sec, start: "top 60%", end: "+=70%", scrub: 0.5, invalidateOnRefresh: true } });
  };

  // Row list with blinking dots — each row comes into focus from a 10px blur and 34px below, and the underline is drawn from the left
  A.rows = (box) => {
    const rows = gsap.utils.toArray(box?.querySelectorAll(".a-row") || []);
    if (!rows.length || reduce) return;
    gsap.set(rows, { autoAlpha: 0, y: 34, filter: "blur(10px)" });
    gsap.to(rows, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.11, ease: "power3.out", scrollTrigger: { trigger: box, start: "top 85%", end: "bottom 60%", scrub: 0.6, invalidateOnRefresh: true } });
  };

  // 3D robot — stands in for the original GLB. Basic shapes with the same silhouette proportions (round helmet · screen face · chest ring · arms), same lighting (two bluish-white 2.6 · two teal 1.2), field of view 28°.
  // Following the cursor, body 1.98, neck 1.98, head 3.5, eyes 1 times 8° rotation (1 − e^(−11dt)), and blinks every 4 seconds or so.
  const cursor = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => { cursor.x = (e.clientX / innerWidth) * 2 - 1; cursor.y = (e.clientY / innerHeight) * 2 - 1; });
  addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) { cursor.x = (t.clientX / innerWidth) * 2 - 1; cursor.y = (t.clientY / innerHeight) * 2 - 1; } }, { passive: true });
  A.robot = (stage, { below = 0.08, top = 0.02 } = {}) => {
    const T = window.THREE, canvas = stage?.querySelector("canvas");
    if (!T || !canvas) return;
    const col = (n) => new T.Color(`rgb(${A.rgb(A.css(n))})`);
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(28, 1, 0.1, 100);
    const cool = col("--kf-accent-soft").lerp(col("--kf-ink"), 0.55), tint = col("--kf-accent");
    [[cool, 2.6, [0.5, 0.5, 0.3]], [cool, 2.6, [-0.8, 1.2, -4.5]], [tint, 1.2, [-1.5, 1.2, -0.5]], [tint, 1.2, [0.2, -0.5, 0.5]]].forEach(([c, i, p]) => { const l = new T.DirectionalLight(c, i); l.position.set(...p); scene.add(l); });
    scene.add(new T.AmbientLight(tint, 0.15));
    const shell = new T.MeshStandardMaterial({ color: col("--kf-raised"), metalness: 0.55, roughness: 0.32 });
    const glass = new T.MeshPhysicalMaterial({ color: col("--kf-surface"), metalness: 0.2, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.3 });
    const glow = new T.MeshBasicMaterial({ color: tint });
    const eyeMat = new T.MeshBasicMaterial({ color: col("--kf-accent").lerp(col("--kf-ink"), 0.25) });
    const body = new T.Group(), neck = new T.Group(), head = new T.Group(), eyes = new T.Group();
    scene.add(body);
    const torso = new T.Mesh(new T.CapsuleGeometry(0.34, 0.42, 8, 24), shell);
    torso.scale.set(1, 1, 0.78); torso.position.y = 0.62; body.add(torso);
    const ring = new T.Mesh(new T.TorusGeometry(0.075, 0.012, 12, 40), glow);
    ring.position.set(0, 0.78, 0.27); body.add(ring);
    [-1, 1].forEach((s) => {
      const sh = new T.Mesh(new T.SphereGeometry(0.13, 20, 16), shell); sh.position.set(s * 0.44, 0.92, 0); body.add(sh);
      const arm = new T.Mesh(new T.CapsuleGeometry(0.075, 0.48, 6, 16), shell); arm.position.set(s * 0.5, 0.58, 0.02); arm.rotation.z = s * 0.12; body.add(arm);
      const band = new T.Mesh(new T.TorusGeometry(0.08, 0.006, 8, 32), glow); band.rotation.x = Math.PI / 2; band.position.set(s * 0.5, 0.66, 0.02); body.add(band);
    });
    neck.position.y = 1.02; body.add(neck);
    const stem = new T.Mesh(new T.CylinderGeometry(0.08, 0.1, 0.12, 20), shell);
    stem.position.y = 0.03; neck.add(stem);
    head.position.y = 0.36; neck.add(head);
    const helmet = new T.Mesh(new T.SphereGeometry(0.36, 40, 32), glass);
    helmet.scale.set(1.06, 0.92, 0.95); head.add(helmet);
    const screenShape = new T.Shape();
    const rr = (s, w, h, r) => { s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h); s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h); };
    rr(screenShape, 0.27, 0.2, 0.1);
    const screen = new T.Mesh(new T.ShapeGeometry(screenShape), new T.MeshStandardMaterial({ color: col("--kf-bg"), roughness: 0.5 }));
    screen.position.z = 0.33; head.add(screen);
    eyes.position.z = 0.335; head.add(eyes);
    [-1, 1].forEach((s) => { const e = new T.Mesh(new T.CapsuleGeometry(0.028, 0.06, 4, 10), eyeMat); e.position.set(s * 0.1, 0.03, 0); eyes.add(e); });
    const mouth = new T.Mesh(new T.TorusGeometry(0.06, 0.012, 8, 24, Math.PI * 0.8), eyeMat);
    mouth.rotation.z = Math.PI * 1.1; mouth.position.set(0, -0.08, 0); eyes.add(mouth);
    [-1, 1].forEach((s) => { const ear = new T.Mesh(new T.TorusGeometry(0.08, 0.012, 10, 32), glow); ear.rotation.y = Math.PI / 2; ear.position.set(s * 0.375, 0, 0); head.add(ear); });
    const rest = [body, neck, head, eyes].map((o) => o.quaternion.clone());
    // Framing — from the body center, starting below by the body height × below, up to the top of the head is visible (original bust)
    const box = new T.Box3().setFromObject(body), sz = box.getSize(new T.Vector3());
    const low = 0.62 - sz.y * below, high = box.max.y + sz.y * top;
    const fit = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      cam.aspect = w / h;
      const k = cam.aspect < 0.9 ? 0.9 / cam.aspect : 1, tan = Math.tan(T.MathUtils.degToRad(cam.fov) / 2);
      cam.position.set(0, (low + high) / 2, ((high - low) / 2 / tan) * k);
      cam.lookAt(0, (low + high) / 2, 0);
      cam.updateProjectionMatrix();
      renderer.setSize(w, h, true);
    };
    new ResizeObserver(fit).observe(stage);
    fit();
    renderer.compile(scene, cam);
    let seen = true;
    new IntersectionObserver((es) => (seen = es.some((e) => e.isIntersecting)), { rootMargin: "20% 0px" }).observe(stage);
    const e8 = T.MathUtils.degToRad(8), eu = new T.Euler(), q = new T.Quaternion();
    const parts = [[body, 1.98], [neck, 1.98], [head, 3.5], [eyes, 1]];
    let last = performance.now(), nextBlink = last + 4200;
    const loop = (now) => {
      requestAnimationFrame(loop);
      const dt = Math.min(0.1, Math.max(0, now - last) / 1000);
      last = now;
      if (!seen || document.hidden) return;
      if (!reduce) {
        const k = 1 - Math.exp(-11 * dt);
        parts.forEach(([o, m], i) => { eu.set(cursor.y * e8 * m, cursor.x * e8 * m, 0, "XYZ"); q.setFromEuler(eu).premultiply(rest[i]); o.quaternion.slerp(q, k); });
        const b = now > nextBlink ? Math.min(1, (now - nextBlink) / 140) : 0;
        eyes.children[0].scale.y = eyes.children[1].scale.y = b > 0 && b < 1 ? 0.15 : 1;
        if (b >= 1) nextBlink = now + 3400 + Math.random() * 2400;
      }
      renderer.render(scene, cam);
    };
    requestAnimationFrame(loop);
  };
})();
