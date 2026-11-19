// Home only: Hero clock, fake cursor demo, service pill expansion, showreel window opening and text weight, work card parallax, pricing mascot, comparison bars.
// Original values: fake cursor 8-point Catmull-Rom 4.4s (cosine progress), every 7s, turns off at the last 10% · showreel window width 30% (300~580px, phone 72%) · 1.6:1,
// s = power2.inOut(min(progress/.72, 1)), corner 6(1−s)px · font weight 400+160s, within 420px of the cursor it moves toward 700, .12 share per frame ·
// Case card y60→0 .9s power3.out top 92%, yPercent −speed scrub .6
(() => {
  const { reduced, fine } = window.SQ;

  /* Clock */
  const clock = document.querySelector("[data-clock]");
  const tick = () => { const d = new Date(); clock.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
  tick();
  setInterval(tick, 30000);

  /* Fake cursor — sweeps through the window along curves and fires pointermove to show the island reacting. It stops once a real pointer enters the window */
  const zone = document.querySelector(".sq-portal"), fake = document.querySelector(".sq-portal__fake");
  const P = [[0.16, 0.98], [0.29, 0.72], [0.4, 0.5], [0.52, 0.42], [0.64, 0.55], [0.72, 0.4], [0.8, 0.26], [0.97, 0.12]];
  if (fine && !reduced && zone && fake) {
    let raf = 0, wait = 0, stop = false;
    const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    const quit = () => { stop = true; cancelAnimationFrame(raf); clearTimeout(wait); fake.classList.remove("is-on"); };
    const run = () => {
      if (stop) return;
      const t0 = performance.now();
      fake.classList.add("is-on");
      const step = (now) => {
        if (stop) return;
        const v = Math.min((now - t0) / 4400, 1), e = 0.5 - 0.5 * Math.cos(v * Math.PI);
        const n = P.length - 1, u = Math.min(e * n, n - 1e-6), i = Math.floor(u), f = u - i;
        const a = P[Math.max(i - 1, 0)], b = P[i], c = P[i + 1], d = P[Math.min(i + 2, n)];
        const r = zone.getBoundingClientRect();
        const x = r.left + cr(a[0], b[0], c[0], d[0], f) * r.width, y = r.top + cr(a[1], b[1], c[1], d[1], f) * r.height;
        fake.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, pointerType: "mouse" }));
        if (v > 0.9) fake.classList.remove("is-on");
        if (v < 1) raf = requestAnimationFrame(step); else wait = setTimeout(run, 7000);
      };
      raf = requestAnimationFrame(step);
    };
    const real = (e) => {
      if (!e.isTrusted) return;
      const r = zone.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { quit(); removeEventListener("pointermove", real); }
    };
    addEventListener("pointermove", real, { passive: true });
    const begin = () => { wait = setTimeout(run, 1400); };
    if (window.SQ.introDone) begin(); else addEventListener("sq:intro-done", begin, { once: true });
  }

  /* Sky layer in the window — horizontally ±13.94px opposite the cursor, vertically ±4.97px on the same side, .77s decelerating (original measurement: +11.7 at x40 · −9.4 at x1182 · (−13.94, −4.97) at the top right corner) */
  const sky = document.querySelector(".sq-portal__sky");
  if (fine && !reduced && sky) {
    // Only the position is set, and motion is left to the CSS transition (.767s). Like the original, styles are not rewritten while at rest.
    // Real mouse only — the demo fake cursor fires only pointermove, so listen to mousemove (the original sky also doesn’t move during the demo)
    const portal = sky.closest(".sq-portal");
    // Horizontally 27.88px per 1 screen width from the window’s left edge as 0 (stops at ±13.94), vertically minimum at the top of the screen and maximum ±4.97px from half screen down (formula fitted to original measurements)
    addEventListener("mousemove", (e) => {
      const r = portal.getBoundingClientRect();
      const x = gsap.utils.clamp(-13.94, 13.94, -((e.clientX - r.left) / innerWidth) * 27.88);
      const y = gsap.utils.clamp(-0.5, 0.5, (e.clientY - innerHeight / 4) / (innerHeight / 2)) * 9.94;
      sky.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
    }, { passive: true });
  }

  /* Service pills — press one and only that one expands */
  document.querySelectorAll(".sq-feat").forEach((g) => g.addEventListener("click", (e) => {
    const head = e.target.closest(".sq-feat__head");
    if (!head) return;
    g.querySelectorAll(".sq-feat__item").forEach((it) => it.classList.toggle("is-open", it === head.parentElement));
  }));

  /* Showreel — small center window fills the screen */
  const reel = document.querySelector(".sq-reel"), clip = reel.querySelector(".sq-reel__clip"), hint = reel.querySelector(".sq-reel__hint");
  const io = gsap.parseEase("power2.inOut");
  let open = 0;
  const shape = (p) => {
    const w = clip.parentElement.clientWidth, h = clip.parentElement.clientHeight;
    const bw = w < 768 ? 0.72 * w : Math.min(Math.max(0.3 * w, 300), 580), bh = bw / 1.6;
    const s = io(Math.min(p / 0.72, 1)), cw = bw + (w - bw) * s, ch = bh + (h - bh) * s, l = (w - cw) / 2, t = (h - ch) / 2;
    clip.style.clipPath = `inset(${t}px ${w - l - cw}px ${h - t - ch}px ${l}px round ${6 * (1 - s)}px)`;
    hint.style.transform = `translateY(${t + ch}px)`;
    hint.style.opacity = String(Math.max(0, 1 - 4 * s));
    open = s;
  };
  if (reduced) { shape(0); addEventListener("resize", () => shape(0)); }
  else {
    const st = ScrollTrigger.create({ trigger: reel, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => shape(s.progress), onRefresh: (s) => shape(s.progress) });
    shape(st.progress);
  }
  // Split the strip text into single letters and embolden only those near the cursor (Space Grotesk weight axis)
  const track = reel.querySelector(".sq-reel__track");
  track.querySelectorAll(".sq-display").forEach((s) => { s.innerHTML = [...s.textContent].map((c) => (c === " " ? " " : `<span data-char>${c}</span>`)).join(""); });
  if (!reduced) {
    const chars = [...track.querySelectorAll("[data-char]")], wt = chars.map(() => 400);
    const mouse = { x: -1e4, y: -1e4 };
    let seen = false, pts = [];
    const measure = () => { const b = track.getBoundingClientRect(); pts = chars.map((c) => { const r = c.getBoundingClientRect(); return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 }; }); };
    measure();
    document.fonts.ready.then(measure);
    new ResizeObserver(measure).observe(track);
    new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(reel);
    if (fine) addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      if (!seen) return;
      const base = 400 + 160 * open, b = track.getBoundingClientRect();
      for (let i = 0; i < chars.length; i++) {
        let goal = base;
        if (fine && pts[i]) { const d = Math.hypot(mouse.x - (b.left + pts[i].x), mouse.y - (b.top + pts[i].y)); if (d < 420) goal = base + (700 - base) * (1 - d / 420); }
        const v = wt[i] + (goal - wt[i]) * 0.12;
        if (Math.abs(v - wt[i]) < 0.5) continue;
        wt[i] = v;
        chars[i].style.fontVariationSettings = `"wght" ${v.toFixed(0)}`;
      }
    });
  }

  /* Work card — entrance + moves up at a different speed for each */
  const board = document.querySelector(".sq-board");
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    board.querySelectorAll(".sq-case").forEach((card) => {
      gsap.fromTo(card, { y: 60 }, { y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 92%", once: true } });
      gsap.to(card, { yPercent: -(+card.dataset.speed || 8), ease: "none", scrollTrigger: { trigger: board, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
  });

  /* Square of the pricing card — pops up when 35% visible */
  document.querySelectorAll(".sq-plan__sq").forEach((s) => {
    s.innerHTML = s.classList.contains("is-many") ? window.SQ.square("idle") + window.SQ.square("wave") + window.SQ.square("idle") : window.SQ.square("wave");
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { s.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.35 }).observe(s.closest(".sq-plan"));
  });
  const bars = document.querySelector(".sq-bars");
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { bars.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.4 }).observe(bars);
})();
