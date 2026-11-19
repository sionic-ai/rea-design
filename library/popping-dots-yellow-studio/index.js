// Home: dot grid canvas (pop text balls to erase dots) · Some Play box fixed zoom · reason tabs · customer pills
(() => {
  const { reduce } = PP;
  const css = (n) => getComputedStyle(document.body).getPropertyValue(n).trim();
  const colorOf = (n) => { const s = document.createElement("i"); s.style.color = `var(${n})`; document.body.append(s); const c = getComputedStyle(s).color; s.remove(); return c; };

  /* ── Hero canvas ── values from original sketch.js: dot spacing 35 · radius 40±8 · ball radius 18 · bounce .007·6.5px · shadow 26px below, height 5, alpha 40
     · 6~9 petals speed 14~20 · erased dots shrink over 1000ms · rest 300ms after a touch · if untouched for 8000ms one bursts on its own · color change proportional to distance 850ms */
  const cvs = document.querySelector(".hero__canvas");
  const ctx = cvs.getContext("2d");
  const SP = 35, R0 = 40, RV = 8, CR = 18, WORD = "PINGPONG";
  let W = 0, H = 0, dpr = 1, grid = [], balls = [], petals = [], last = 0, lastTouch = performance.now(), cool = 0;
  let pal = {};
  let blue = document.body.classList.contains("pp-blue-mode"), switchAt = 0;
  const readPal = () => { pal = { dot: colorOf("--kf-accent"), blue: colorOf("--site-blue"), bg: colorOf("--kf-bg"), ink: colorOf("--kf-ink") }; };
  const rand = (a, b) => a + Math.random() * (b - a);
  const build = () => {
    const b = cvs.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1); W = b.width; H = b.height;
    cvs.width = W * dpr; cvs.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    grid = [];
    // The original lays dots of diameter 40±8 overlapping at 35 spacing — the radius is .78 times the spacing (27px) so erased holes connect with their neighbors
    for (let y = 0; y <= H + SP; y += SP) for (let x = 0; x <= W + SP; x += SP) grid.push({ x, y, r: (R0 + rand(-RV, RV)) * 0.68, gone: 0 });
    balls = [...WORD].map((ch, i) => ({ ch, x: rand(0.06, 0.86) * W, y: rand(0.08, 0.86) * H, ph: rand(0, Math.PI * 2), alive: true }));
  };
  const explode = (b, now) => {
    b.alive = false;
    const n = Math.round(rand(6, 9));
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + rand(-0.2, 0.2), s = rand(14, 20);
      petals.push({ x: b.x, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 });
    }
    setTimeout(() => { b.x = rand(0.06, 0.86) * W; b.y = rand(0.08, 0.86) * H; b.alive = true; }, 2600);
  };
  const dotColor = (d, now) => {
    if (!switchAt) return blue ? pal.blue : pal.dot;
    const el = now - switchAt, max = Math.hypot(W, H) || 1;
    const dist = blue ? Math.hypot(W - d.x, H - d.y) : Math.hypot(d.x, H - d.y);
    const delay = (dist / max) * 850;
    const isBlue = blue ? el >= delay : el < delay;
    return isBlue ? pal.blue : pal.dot;
  };
  const frame = (now) => {
    const dt = Math.min(48, Math.max(1, now - (last || now)));
    last = now;
    ctx.clearRect(0, 0, W, H);
    // Background: dots overlap into a gapless yellow (during a color change each dot changes in proportion to distance)
    const settled = !switchAt || now - switchAt > 900;
    ctx.fillStyle = settled ? (blue ? pal.blue : pal.dot) : (blue ? pal.dot : pal.blue);
    ctx.fillRect(0, 0, W, H);
    const holes = [];
    for (const d of grid) {
      if (d.gone > 0) { d.gone = Math.min(1, d.gone + dt / 1000); holes.push(d); }
      if (!settled) { ctx.fillStyle = dotColor(d, now); ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
    }
    // Only at the erased dot spots, a white panel plus pixel text (our own text) opens over 1000ms
    if (holes.length) {
      ctx.save(); ctx.beginPath();
      for (const d of holes) { ctx.moveTo(d.x + d.r * d.gone, d.y); ctx.arc(d.x, d.y, d.r * d.gone, 0, Math.PI * 2); }
      ctx.clip();
      ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = pal.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const fs = Math.min(W * 0.11, 150);
      ctx.font = `600 ${fs}px ${css("--kf-font-pixel") || "monospace"}`;
      ctx.fillText("finders", W * 0.32, H * 0.4); ctx.fillText("seekers", W * 0.36, H * 0.4 + fs * 0.95);
      ctx.restore();
    }
    for (const p of petals) {
      p.x += p.vx * (dt / 16); p.y += p.vy * (dt / 16); p.vx *= 0.93; p.vy *= 0.93; p.life -= dt / 900;
      for (const d of grid) if (!d.gone && Math.abs(d.x - p.x) < 30 && Math.abs(d.y - p.y) < 30 && Math.hypot(d.x - p.x, d.y - p.y) < 30) d.gone = 0.0001;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = pal.bg; ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath(); ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    petals = petals.filter((p) => p.life > 0);
    for (const b of balls) {
      if (!b.alive) continue;
      const bob = reduce ? 0 : Math.sin(now * 0.007 + b.ph) * 6.5;
      const sw = CR * (0.75 + 0.25 * (1 - (bob + 6.5) / 13));
      ctx.fillStyle = "rgba(0,0,0,0.157)"; /* Not skin: original shadow alpha 40/255 */
      ctx.beginPath(); ctx.ellipse(b.x, b.y + 26, sw, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = pal.bg; ctx.beginPath(); ctx.arc(b.x, b.y + bob, CR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = pal.ink; ctx.font = `600 13px ${css("--kf-font-mono") || "monospace"}`; ctx.fillText(b.ch, b.x, b.y + bob + 1);
    }
    if (!reduce && now - lastTouch > 8000) { const live = balls.filter((b) => b.alive); if (live.length) explode(live[Math.floor(Math.random() * live.length)], now); lastTouch = now; }
    raf = requestAnimationFrame(frame);
  };
  let raf = 0;
  readPal(); build();
  document.fonts?.ready.then(() => {});
  new ResizeObserver(() => build()).observe(cvs);
  const io = new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) { last = 0; raf = requestAnimationFrame(frame); } });
  io.observe(cvs);
  cvs.addEventListener("pointermove", (e) => {
    const r = cvs.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now();
    lastTouch = now;
    if (now < cool) return;
    for (const b of balls) if (b.alive && Math.hypot(b.x - x, b.y - y) < CR + 4) { explode(b, now); cool = now + 300; break; }
  });
  addEventListener("pingpong-colour-change", (e) => { readPal(); blue = !!e.detail.blueMode; switchAt = performance.now(); });
  document.querySelectorAll(".hero__tools button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".hero__tools button").forEach((x) => x.classList.toggle("is-on", x === b));
    build();
  }));

  /* ── One line of handwriting ── stands in for the original Lottie (roar): drawn once when visible */
  const roar = document.querySelector(".hero__roar text");
  if (roar && !reduce) {
    gsap.set(roar, { strokeDasharray: 600, strokeDashoffset: 600, fillOpacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: roar, start: "top 85%", once: true } }).to(roar, { strokeDashoffset: 0, duration: 1.4, ease: "power1.inOut" }).to(roar, { fillOpacity: 1, duration: 0.4 }, "-=0.3");
  }

  /* ── Some Play ── original: above 992px .sp-box scale 0 → 1, top top ~ +=60%, pin, scrub true */
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.set(".play__fill", { scale: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ".play", start: "top top", end: "+=60%", pin: true, scrub: true, pinSpacing: true } })
      .to(".play__fill", { scale: 1, ease: "power2.out", duration: 1 });
  });

  /* ── Reason Tabs ── */
  const tabs = [...document.querySelectorAll(".reasons__tab")];
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => { const on = x === t; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", on); document.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
  }));

  PP.clients(document.querySelector(".pp-clients"));
})();
