// Home page motion: quarter-arc opening, mark-piece hero (picture slots, corner text, scroll scatter), quarter-arc pattern, service image swaps, three circles, petals
(() => {
  const { reduced, qring, springEase } = AB;
  const narrow = matchMedia("(max-width: 809px)");
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ── Scroll following (original __framer__spring: stiffness 500 · damping 60 · mass 1) — a target set by scroll is chased by a spring every frame ── */
  const followers = [];
  const follow = (el, apply, spring = true) => {
    const f = { el, apply, spring, x: null, v: null, target: null };
    followers.push(f);
    return f;
  };
  gsap.ticker.add((t, dms) => {
    const dt = Math.min(0.05, Math.max(0.001, dms / 1000));
    for (const f of followers) {
      if (!f.target) continue;
      if (!f.x || !f.spring || reduced) { f.x = f.target.slice(); f.v = f.target.map(() => 0); f.apply(f.x); continue; }
      let moved = false;
      for (let s = 0, n = Math.ceil(dt / (1 / 240)), h = dt / n; s < n; s++)
        f.x.forEach((x, i) => { const a = -500 * (x - f.target[i]) - 60 * f.v[i]; f.v[i] += a * h; f.x[i] += f.v[i] * h; });
      f.x.forEach((x, i) => { if (Math.abs(x - f.target[i]) > 1e-3 || Math.abs(f.v[i]) > 1e-3) moved = true; });
      if (moved) f.apply(f.x); else { f.x = f.target.slice(); f.apply(f.x); }
    }
  });
  // From when the trigger touches the screen bottom (document position − 1 − screen height), 0→1 over that height (original onScrollTarget · threshold 1)
  const trigRange = (el) => {
    const top = el.getBoundingClientRect().top + scrollY - 1 - innerHeight;
    return [Math.max(top, 0), Math.max(top + el.offsetHeight, 0)];
  };
  const prog = ([a, b]) => (b <= a ? (scrollY >= b ? 1 : 0) : Math.min(1, Math.max(0, (scrollY - a) / (b - a))));
  const lerp = (a, b, p) => a + (b - a) * p;

  /* ── Placeholder mark: three slanted rings built from 12 quarter-ring pieces + three word bands (instead of the original logo) ──
     Each piece takes the original piece’s fly-off position (x·y·rotation) as is: left loop = Original left piece, centered = Inside, right side = 右 */
  const ARC = { tl: "M32 100A68 68 0 0 1 100 32", tr: "M0 32A68 68 0 0 1 68 100", br: "M68 0A68 68 0 0 1 0 68", bl: "M100 68A68 68 0 0 1 32 0" };
  const PIECES = [
    // [corner, left, top, x, y, rotation]
    ["tl", 0, 0, -500, -500, 30], ["tr", 40, 0, -800, -400, -30], ["bl", 0, 40, -700, -200, 30], ["br", 40, 40, -700, -100, -60],
    ["tl", 84, 64, -100, -500, 47], ["tr", 124, 64, 120, -600, -53], ["br", 124, 104, 120, 600, 60], ["bl", 84, 104, -60, 400, 60],
    ["tl", 168, 128, 500, -450, -60], ["tr", 208, 128, 500, -600, 75], ["br", 208, 168, 300, 400, 30], ["bl", 168, 168, 600, 300, -42],
  ];
  const WORDS = [
    // [text, top, width %, x, y, rotation] — positions of the original STARTUP·BOOST·STUDIO strips and the values they fly off to
    ["SITE-NAME", 252, 65, -800, 200, 30], ["LABEL", 282, 48, -10, 300, -15], ["HERE", 311, 50, 500, 300, -60],
  ];
  const logo = document.querySelector("[data-logo]");
  const logoPieces = [];
  if (logo) {
    const mk = document.createElement("div");
    mk.className = "ix-hero__mk";
    PIECES.forEach(([c, l, t, ...to]) => {
      const el = document.createElement("div");
      el.className = "ix-hero__pc";
      el.style.left = `${l}px`; el.style.top = `${t}px`;
      el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${ARC[c]}"/></svg>`;
      mk.append(el); logoPieces.push([el, to]);
    });
    WORDS.forEach(([w, t, pct, ...to]) => {
      const el = document.createElement("div");
      el.className = "ix-hero__wd";
      el.style.top = `${t}px`; el.style.width = `${pct}%`;
      el.innerHTML = `<svg viewBox="0 0 ${pct * 2.48} 27" preserveAspectRatio="none" aria-hidden="true"><text x="0" y="25.5" textLength="${pct * 2.48}" lengthAdjust="spacingAndGlyphs">${w}</text></svg>`;
      mk.append(el); logoPieces.push([el, to]);
    });
    logo.append(mk);
    const fit = () => mk.style.setProperty("--logo-s", logo.offsetHeight / 337);
    new ResizeObserver(fit).observe(logo);
  }

  /* ── Picture grid (original 5×5, phone 3×3 · center empty): 7 workers (4 on phone) set off at .2s intervals and pick empty cells
        .8s rising in (out curve), stays 4s, then .8s exiting upward (in curve). Runs only while visible on screen ── */
  const tileSvg = (inner, vb = "0 0 100 100") => `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
  const ring3 = (y0) => [[0, 0], [21, 16], [42, 32]].map(([x, y]) => ["tl", "tr", "br", "bl"].map((c) => {
    const ox = c === "tr" || c === "br" ? 10 : 0, oy = c === "bl" || c === "br" ? 10 : 0;
    return `<path d="${ARC[c]}" transform="translate(${8 + x + ox} ${y0 + y + oy}) scale(.1)" fill="none" stroke="currentColor" stroke-width="64"/>`;
  }).join("")).join("");
  const scribble = (n, seed) => Array.from({ length: n }, (_, i) => {
    const a = (i * 2.399 + seed) % 6.283, x = 30 + 40 * ((i * 0.618 + seed) % 1), y = 38 + 24 * ((i * 0.382 + seed * 2) % 1);
    return `<line x1="${x}" y1="${y}" x2="${(x + 18 * Math.cos(a)).toFixed(1)}" y2="${(y + 18 * Math.sin(a)).toFixed(1)}"/>`;
  }).join("");
  const TILES = [
    { text: "SITE-NAME\nLABEL\nHERE" },
    { svg: tileSvg(`<g transform="translate(0 28)">${ring3(0)}</g>`) },
    { svg: tileSvg(`<g transform="translate(0 28)">${ring3(0)}</g><g stroke="currentColor" stroke-width=".6" opacity=".9">${scribble(14, 0.3)}</g>`) },
    { svg: tileSvg(`<g transform="translate(0 28)" opacity=".85">${ring3(0)}</g><g stroke="currentColor" stroke-width=".5" fill="none"><path d="M18 40 82 62M18 62 82 40M50 30v42"/></g>`) },
    { svg: tileSvg(`<path d="${ARC.tl}" transform="translate(30 30) scale(.4)" fill="none" stroke="currentColor" stroke-width="64"/>`) },
    { svg: tileSvg(`<path d="${ARC.br}" transform="translate(30 30) scale(.4)" fill="none" stroke="currentColor" stroke-width="64"/>`) },
    { svg: tileSvg(`<g transform="translate(14 8) scale(.72)">${ring3(0)}</g><g fill="currentColor" font-family="var(--kf-font-display)" font-weight="700" font-size="7"><text x="36" y="70">SITE-NAME</text><text x="36" y="77">LABEL</text><text x="36" y="84">HERE</text></g>`), side: false },
  ];
  const grid = document.querySelector("[data-grid]");
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function runGrid() {
    if (!grid || reduced) return;
    const n = narrow.matches ? 3 : 5, workers = narrow.matches ? 4 : 7;
    const center = Math.floor((n - 1) / 2) * n + Math.floor((n - 1) / 2);
    const sides = [center - 1, center + 1];
    grid.style.setProperty("--n", n);
    gsap.set(grid, { xPercent: -50, yPercent: -50 });
    grid.innerHTML = Array.from({ length: n * n }, () => '<div class="ix-hero__cell"></div>').join("");
    const cells = [...grid.children];
    const cell = () => cells[0].getBoundingClientRect().width;
    const busy = new Set();
    let ctl = null;
    const wait = (ms, sig) => new Promise((res, rej) => {
      const id = setTimeout(res, ms);
      sig.addEventListener("abort", () => { clearTimeout(id); rej(new DOMException("Aborted", "AbortError")); });
    });
    const worker = async (sig) => {
      for (;;) {
        const free = cells.map((_, i) => i).filter((i) => i !== center && !busy.has(i));
        if (!free.length) { await wait(100, sig); continue; }
        const i = pick(free);
        const pool = sides.includes(i) ? TILES.filter((t) => t.side !== false) : TILES;
        const t = pick(pool);
        busy.add(i);
        const el = document.createElement("div");
        el.className = "ix-hero__tile is-in";
        if (t.text) { el.innerHTML = `<span class="ix-hero__tile-text">${t.text}</span>`; el.style.setProperty("--cell", `${cell()}px`); }
        else el.innerHTML = t.svg;
        cells[i].append(el);
        try {
          await wait(800, sig);
          el.classList.remove("is-in");
          await wait(4000, sig);
          el.classList.add("is-out");
          await wait(800, sig);
        } finally { el.remove(); busy.delete(i); }
      }
    };
    const start = () => {
      if (ctl) return;
      ctl = new AbortController();
      const sig = ctl.signal;
      for (let w = 0; w < workers; w++) wait(w * 200, sig).then(() => worker(sig)).catch((e) => { if (e.name !== "AbortError") throw e; });
    };
    const stop = () => { ctl?.abort(); ctl = null; busy.clear(); };
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(grid);
  }

  /* ── Corner text (original 2 rows × 5 cells, 3 cells on phone): each cell starts .1s apart in shuffled order and settles letter by letter from the first over 1s
        Scrambled letters change every 50ms. When all match, it rests 2s and repeats — letter i/length snaps to its own letter once progress ≥ i+(1−i)×.6 ── */
  const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!<>-_\\/[]{}=+*^?#";
  const LABEL = "SITE-NAME\nLABEL\nHERE";
  const labelsBox = document.querySelector("[data-labels]");
  function runLabels() {
    if (!labelsBox) return;
    const per = narrow.matches ? 3 : innerWidth < 1200 ? 4 : 5;
    labelsBox.innerHTML = Array.from({ length: 2 }, () => `<div class="ix-hero__row">${'<span class="ix-hero__label"></span>'.repeat(per)}</div>`).join("");
    const spans = [...labelsBox.querySelectorAll(".ix-hero__label")];
    spans.forEach((s) => (s.textContent = LABEL));
    if (reduced) return;
    const rndCh = () => POOL[Math.floor(Math.random() * POOL.length)];
    let first = true, raf = 0, rest = 0, run = null, active = false;
    const tick = (now) => {
      raf = 0;
      if (!active || !run) return;
      if (now - run.last >= 50) { run.scr = run.scr.map((a) => a.map(rndCh)); run.last = now; }
      spans.forEach((s, k) => {
        const c = now - run.starts[k];
        let out = "";
        if (c < 0) { out = first ? [...LABEL].map((ch, n) => (ch === " " || ch === "\n" ? ch : run.scr[k][n])).join("") : LABEL; }
        else {
          const l = Math.min(c / 1000, 1);
          for (let n = 0; n < LABEL.length; n++) { const ch = LABEL[n]; const i = n / LABEL.length; out += ch === " " || ch === "\n" || l >= i + (1 - i) * 0.6 ? ch : run.scr[k][n]; }
        }
        if (s.textContent !== out) s.textContent = out;
      });
      if (run.starts.every((s) => now - s >= 1000)) { run = null; first = false; spans.forEach((s) => (s.textContent = LABEL)); rest = setTimeout(go, 2000); return; }
      raf = requestAnimationFrame(tick);
    };
    const go = () => {
      rest = 0;
      if (!active) return;
      const order = spans.map((_, i) => i).sort(() => Math.random() - 0.5), now = performance.now();
      run = { starts: spans.map((_, k) => now + order.indexOf(k) * 100), scr: spans.map(() => [...LABEL].map(rndCh)), last: 0 };
      raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
      if (active) { if (run && !raf) raf = requestAnimationFrame(tick); else if (!run && !rest) go(); }
      else { cancelAnimationFrame(raf); raf = 0; clearTimeout(rest); rest = 0; }
    }, { threshold: 0 }).observe(labelsBox);
  }

  /* ── When the opening hands off to the wipe (55% of 2s), behind the opening the mark plate springs into place from 150px below at size 0 (.4s, bounce .2) — 
        Once the opening lifts, the mark is already standing and the picture slots and corner text begin to turn (original probe: no separate rising motion at the end of the opening) ── */
  function showLogo() {
    logo?.classList.add("is-on");
    if (logo && !reduced) {
      const sp = springEase(0.2, 0.4);
      gsap.fromTo(logo, { opacity: 0.001, scale: 0, y: 150 }, { opacity: 1, scale: 1, y: 0, duration: sp.dur, ease: sp.ease, onComplete: () => gsap.set(logo, { clearProps: "transform,opacity" }) });
    }
  }
  function mountHero() {
    runGrid();
    runLabels();
    hookHeroScroll();
  }
  function preloader() {
    const box = document.querySelector(".ix-pre");
    // The link back from sub-pages is ?ending, as in the original=add yes to skip the opening
    const skip = new URLSearchParams(location.search).get("ending") === "yes";
    if (!box || reduced || skip) { box?.remove(); showLogo(); mountHero(); return; }
    const n = narrow.matches ? 4 : 5, rots = [0, 90, 180, 270];
    let g = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
      g += `<g transform="translate(${c * 100} ${r * 100}) rotate(${pick(rots)} 50 50)"><path d="M31.93 100.14A68.07 68.07 0 0 1 100.14 31.93" pathLength="1"/></g>`;
    box.innerHTML = `<svg viewBox="0 0 ${n * 100} ${n * 100}" preserveAspectRatio="none">${g}</svg>`;
    let done = false;
    const end = () => { if (done) return; done = true; box.remove(); mountHero(); };
    const logoAt = setTimeout(showLogo, 450 + 1100);
    box.querySelector("g:last-child path").addEventListener("animationend", end);
    setTimeout(() => { clearTimeout(logoAt); if (!logo?.classList.contains("is-on")) showLogo(); end(); }, 450 + 2600);
  }

  /* ── Hero scroll (original values): during the trigger (100vh), mark pieces fly to their places and the mark scales 4x · over the top 50vh the ink-colored veil goes 0→1, 
        Picture cells and corner text vanish while scaling 3x · the intro section goes 0→1 over the lower 30vh. Pieces, marks, cells and text chase with springs ── */
  function hookHeroScroll() {
    const t0 = document.querySelector('[data-trig="0"]'), t1 = document.querySelector('[data-trig="1"]'), t2 = document.querySelector('[data-trig="2"]');
    if (!t0) return;
    const dark = document.querySelector(".ix-hero__dark"), about = document.getElementById("about");
    let r0, r1, r2;
    const measure = () => { r0 = trigRange(t0); r1 = trigRange(t1); r2 = trigRange(t2); };
    measure();
    const fs = [];
    logoPieces.forEach(([el, [x, y, rot]]) => fs.push([follow(el, ([p]) => gsap.set(el, { x: x * p, y: y * p, rotation: rot * p })), () => [prog(r0)]]));
    if (logo) fs.push([follow(logo, ([p]) => gsap.set(logo.parentNode, { scale: lerp(1, 4, p) })), () => [prog(r0)]]);
    if (grid) fs.push([follow(grid, ([p]) => gsap.set(grid, { xPercent: -50, yPercent: -50, opacity: 1 - p, scale: lerp(1, 3, p) })), () => [prog(r1)]]);
    if (labelsBox) fs.push([follow(labelsBox, ([p]) => gsap.set(labelsBox, { opacity: 1 - p, scale: lerp(1, 3, p) })), () => [prog(r1)]]);
    if (dark) fs.push([follow(dark, ([p]) => (dark.style.opacity = p), false), () => [prog(r1)]]);
    if (about) fs.push([follow(about, ([p]) => (about.style.opacity = p), false), () => [prog(r2)]]);
    const update = () => fs.forEach(([f, get]) => (f.target = get()));
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", () => { measure(); update(); });
    ScrollTrigger.addEventListener("refresh", () => { measure(); update(); });
  }
  if (document.getElementById("about") && !reduced) document.getElementById("about").style.opacity = 0;
  preloader();

  // The index and mark appear once the About section comes in after the Hero
  ScrollTrigger.create({
    trigger: "#about", start: "top 60%",
    onToggle: (st) => document.querySelectorAll(".ab-toc, .ab-mark").forEach((el) => el.classList.toggle("is-off", !st.isActive && st.direction < 0)),
    onEnter: () => document.querySelectorAll(".ab-toc, .ab-mark").forEach((el) => el.classList.remove("is-off")),
    onLeaveBack: () => document.querySelectorAll(".ab-toc, .ab-mark").forEach((el) => el.classList.add("is-off")),
  });

  /* ── About section quarter-arc pattern (as in the original): 12×12 cells, each cell holds a quarter arc of thickness 20 rotated so that 2×2 cells form one ring,
        Each ring leaves one piece empty. The rings in the two end rows (four rows on phone) have one piece in a pale color. When the section is visible each ring draws for 2s, delayed 0~2s. ── */
  (function rings() {
    const box = document.querySelector(".ix-about__rings");
    if (!box) return;
    const n = 12, gap = 0.1, sw = 20, pitch = 100 * (1 + gap), H = n * pitch, accentCols = narrow.matches || innerWidth < 1200 ? 4 : 2;
    const rr = 100 - sw / 2 + 0.07, d = `M ${(100 - rr).toFixed(2)} 100.14 A ${rr} ${rr} 0 0 1 100.14 ${(100 - rr).toFixed(2)}`;
    const groups = {};
    for (let gy = 0; gy < n / 2; gy++) for (let gx = 0; gx < n / 2; gx++) {
      const cells = [0, 1].flatMap((i) => [0, 1].map((k) => (gy * 2 + i) * n + gx * 2 + k));
      const hidden = pick(cells);
      const acc = cells.filter((c) => { const col = c % n; return (col < accentCols || col >= n - accentCols) && c !== hidden; });
      groups[`${gx}_${gy}`] = { delay: Math.random() * 2, hidden, accent: acc.length ? pick(acc) : -1 };
    }
    let g = "";
    for (let i = 0; i < n * n; i++) {
      const col = i % n, row = Math.floor(i / n), grp = groups[`${col >> 1}_${row >> 1}`];
      const rot = col % 2 === 0 && row % 2 === 0 ? 0 : col % 2 === 1 && row % 2 === 0 ? 90 : col % 2 === 0 ? 270 : 180;
      const cls = i === grp.hidden ? "is-hidden" : i === grp.accent ? "is-accent" : "";
      g += `<g transform="translate(${col * pitch} ${row * pitch}) rotate(${rot} 50 50)"><path d="${d}" pathLength="1" class="${cls}" style="animation-delay:${grp.delay.toFixed(3)}s"/></g>`;
    }
    box.innerHTML = `<svg viewBox="0 0 ${H} ${H}" preserveAspectRatio="none" aria-hidden="true">${g}</svg>`;
    if (reduced) { box.classList.add("is-in"); box.querySelectorAll("path").forEach((p) => (p.style.animation = "none", p.style.strokeDashoffset = 2)); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { box.classList.add("is-in"); io.disconnect(); } }, { threshold: 0 });
    io.observe(box);
  })();

  /* ── Service graphic: four quarter rings shift from ring (01) → net (02) → two-ring S (03) ── */
  const VARIANTS = [
    [[0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1]],
    [[6, 6, 45, 1], [-6, 6, 45, 1], [-6, -6, 45, 1], [6, -6, 45, 1]],
    [[0, 34, 0, 0.6], [0, -34, 0, 0.6], [0, -34, 0, 0.6], [0, 34, 0, 0.6]],
  ];
  const piece = (q) => `<g class="ix-q"><path d="${qring(100, 100, 46, 80, q)}" transform="translate(${q === 0 || q === 3 ? 4 : -4} ${q < 2 ? 4 : -4})"/></g>`;
  const netLines = () => Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2, b = a + rnd(2, 3.6);
    return `<line x1="${100 + 70 * Math.cos(a)}" y1="${100 + 70 * Math.sin(a)}" x2="${100 + 70 * Math.cos(b)}" y2="${100 + 70 * Math.sin(b)}"/>`;
  }).join("");
  const graphic = document.querySelector("[data-graphic]");
  if (graphic) graphic.innerHTML = `<g fill="currentColor">${[0, 1, 2, 3].map(piece).join("")}</g><g class="ix-net" stroke="currentColor" stroke-width="1.4" opacity="0">${netLines()}</g>`;
  // The change is a spring just like the original transform transition (.4s, bounce .2)
  const svcSpring = springEase(0.2, 0.4);
  const setVariant = (svg, v, on) => {
    const dur = on ? svcSpring.dur : 0;
    svg.querySelectorAll(".ix-q").forEach((g, i) => {
      const [x, y, rot, s] = VARIANTS[v][i];
      gsap.to(g, { x, y, rotation: rot, scale: s, svgOrigin: "100 100", duration: dur, ease: svcSpring.ease, overwrite: true });
    });
    gsap.to(svg.querySelector(".ix-net"), { opacity: v === 1 ? 1 : 0, duration: dur, ease: svcSpring.ease, overwrite: true });
  };
  document.querySelectorAll("[data-graphic-mini]").forEach((svg) => {
    svg.innerHTML = `<g fill="currentColor">${[0, 1, 2, 3].map(piece).join("")}</g><g class="ix-net" stroke="currentColor" stroke-width="1.4" opacity="0">${netLines()}</g>`;
    setVariant(svg, Number(svg.dataset.graphicMini), false);
  });
  if (graphic) {
    let scrollActive = 0, hover = -1, shown = -1;
    const apply = () => {
      const v = hover >= 0 ? hover : scrollActive;
      if (v === shown) return;
      shown = v;
      setVariant(graphic, v, !reduced);
    };
    document.querySelectorAll(".ix-svc").forEach((li, i) => {
      ScrollTrigger.create({ trigger: li, start: "top 60%", end: "bottom 60%", onToggle: (st) => { if (st.isActive) { scrollActive = i; apply(); } } });
      li.addEventListener("mouseenter", () => { hover = i; apply(); });
      li.addEventListener("mouseleave", () => { hover = -1; apply(); });
    });
    apply();
  }

  /* ── Why here: pins the section (360vh), fills circles with white one by one, then flips to a white background at the end (the original trigger spot) ── */
  const why = document.querySelector(".ix-why");
  const reasons = [...document.querySelectorAll(".ix-reason")];
  const lines = document.querySelector(".ix-why__lines");
  function drawLines() {
    if (!lines) return;
    const box = lines.getBoundingClientRect();
    const c = reasons.map((r) => { const b = r.getBoundingClientRect(); return [b.left + b.width / 2 - box.left, b.top + b.height / 2 - box.top, b.width / 2]; });
    const W = box.width, H = box.height;
    const seg = (a, b, dot) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"${dot ? ' class="is-dot"' : ""}/>`;
    const edge = (p, ang) => { const L = Math.max(W, H) * 1.5; return [p[0] + L * Math.cos(ang), p[1] + L * Math.sin(ang)]; };
    lines.setAttribute("viewBox", `0 0 ${W} ${H}`);
    lines.innerHTML = seg(c[0], c[1]) + seg(c[0], c[2]) + seg(c[1], c[2], true)
      + seg(c[0], edge(c[0], -2.4)) + seg(c[1], edge(c[1], 2.7), true) + seg(c[2], edge(c[2], 0.5)) + seg(c[0], edge(c[0], -0.6), true);
  }
  function setStep(p) {
    if (narrow.matches) {
      // Phone (original): triggers at 40 · 60 · 100vh, then a 300vh section — of the 200vh held, the next circle comes at 40 and 100vh. Each is a bordered circle holding a description
      const idx = p >= 100 / 200 ? 2 : p >= 40 / 200 ? 1 : 0;
      why.classList.remove("is-light");
      reasons.forEach((r, i) => { r.classList.toggle("is-current", i === idx); r.classList.remove("is-on"); r.classList.toggle("is-desc", i === idx); });
      return;
    }
    reasons.forEach((r) => r.classList.remove("is-desc"));
    // The spot where the original trigger (inside a 360vh section: 100·40·60·60·100vh) touches the bottom of the screen — 40·100·160vh of the 260vh hold
    const light = p >= 160 / 260;
    const step = light ? -1 : p >= 100 / 260 ? 2 : p >= 40 / 260 ? 1 : 0;
    why.classList.toggle("is-light", light);
    reasons.forEach((r, i) => { r.classList.toggle("is-on", i === step); r.classList.toggle("is-current", i === Math.max(0, step)); });
    AB.paintChrome();
  }
  if (why) {
    why.dataset.theme = "dark";
    ScrollTrigger.create({
      trigger: why, start: "top top", end: "bottom bottom",
      onUpdate: (st) => { setStep(st.progress); why.dataset.theme = st.progress >= 160 / 260 && !narrow.matches ? "light" : "dark"; },
      onRefresh: (st) => setStep(st.progress),
    });
    drawLines();
    addEventListener("resize", drawLines);
  }

  /* ── Petals (the original’s three joined pieces): two thick quarter arcs joined by a 1px line, and a drift of three overlapping sines sways the position (±8.5~10%) and angle (±50°).
        On black it blurs 4px, when flipped to a white background it has no blur and turns pale gray. Runs only while visible ── */
  (function petals() {
    const box = document.querySelector(".ix-why__petals");
    if (!box) return;
    const SETS = [
      { a: [60, 20, -54], b: [90, 90, -27], drift: 8.5 },
      { a: [11, 7, -32], b: [95, 35, 137], drift: 10 },
      { a: [11, 78, 176], b: [71, 20, -198], drift: 10 },
    ];
    const arc = '<svg viewBox="0 0 72.02 72.02"><path d="M23.26,72.02c0-26.93,21.83-48.75,48.75-48.75" fill="none" stroke-width="46.53"/></svg>';
    box.innerHTML = SETS.map(() => `<div class="ix-petals"><svg class="ix-petals__line"><line/></svg><div class="ix-petal">${arc}</div><div class="ix-petal">${arc}</div></div>`).join("");
    const noise = (t, k, d, r) => ({
      x: (Math.sin(t * 0.72 + k * 1.37) * 0.5 + Math.sin(t * 0.31 + k * 2.91) * 0.35 + Math.cos(t * 0.19 + k * 4.13) * 0.15) * d,
      y: (Math.cos(t * 0.66 + k * 1.89) * 0.5 + Math.sin(t * 0.27 + k * 3.47) * 0.3 + Math.cos(t * 0.21 + k * 5.71) * 0.2) * d,
      rot: (Math.sin(t * 0.52 + k * 2.17) * 0.55 + Math.cos(t * 0.24 + k * 4.83) * 0.45) * r,
    });
    const groups = [...box.querySelectorAll(".ix-petals")].map((g, i) => ({ g, set: SETS[i], line: g.querySelector("line"), items: g.querySelectorAll(".ix-petal") }));
    const draw = (t) => groups.forEach(({ set, line, items }) => {
      const p = [[set.a, 11], [set.b, 97]].map(([[top, left, rot], k]) => { const n = noise(t, k, set.drift, 50); return [top + n.y, left + n.x, rot + n.rot]; });
      line.setAttribute("x1", `${p[0][1]}%`); line.setAttribute("y1", `${p[0][0]}%`); line.setAttribute("x2", `${p[1][1]}%`); line.setAttribute("y2", `${p[1][0]}%`);
      items.forEach((el, i) => { el.style.top = `${p[i][0]}%`; el.style.left = `${p[i][1]}%`; el.firstChild.style.transform = `rotate(${p[i][2]}deg)`; });
    });
    draw(0);
    if (reduced) return;
    let raf = 0, start = 0, acc = 0;
    const loop = (now) => { draw(((acc + now - start) / 1000) * 1.1); raf = requestAnimationFrame(loop); };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) { start = performance.now(); raf = requestAnimationFrame(loop); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; acc += performance.now() - start; }
    }, { threshold: 0 }).observe(box);
  })();

  /* ── Contact form panel (original probe): .37s after press (.27s excluding press handling time) the panel is placed at once with no motion, and the panel title floats up after .12s with a spring (bounce 0 · .4s) (original 485ms).
        For closing, the original panel’s close button was not visible on screen, so it was decided to close in one go via a top-right close button, a dark scrim or Esc ── */
  (function form() {
    const box = document.getElementById("contact-form");
    const btn = document.querySelector("[data-open-form]");
    if (!box || !btn) return;
    const title = box.querySelector(".ab-brk");
    const sp = springEase(0, 0.4);
    let timer = 0;
    const open = (e) => {
      e?.preventDefault();
      clearTimeout(timer);
      box.style.willChange = "transform";
      timer = setTimeout(() => {
        box.classList.add("is-open");
        box.inert = false;
        box.setAttribute("aria-hidden", "false");
        btn.setAttribute("aria-expanded", "true");
        AB.lenis?.stop();
        if (!reduced && title) gsap.fromTo(title, { opacity: 0.001, y: 10 }, { opacity: 1, y: 0, duration: sp.dur, ease: sp.ease, delay: 0.116 });
        box.querySelector(".ix-form__close")?.focus({ preventScroll: true });
      }, reduced ? 0 : 270);
    };
    const close = () => {
      clearTimeout(timer);
      if (!box.classList.contains("is-open")) return;
      box.classList.remove("is-open");
      box.inert = true;
      box.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false");
      AB.lenis?.start();
      btn.focus({ preventScroll: true });
    };
    box.inert = true;
    btn.addEventListener("click", open);
    btn.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && open(e));
    box.querySelectorAll("[data-close-form]").forEach((el) => el.addEventListener("click", close));
    addEventListener("keydown", (e) => e.key === "Escape" && close());
  })();

  /* ── Contact circle: when visible, springs in from .5x and transparent with the bottom as pivot (.4s, bounce .2, .3s late) ── */
  (function contactCircle() {
    const circle = document.querySelector("[data-circle]");
    if (!circle || reduced) return;
    const sp = springEase(0.2, 0.4);
    gsap.set(circle, { scale: 0.5, opacity: 0.001 });
    ScrollTrigger.create({ trigger: circle, start: "top bottom", once: true, onEnter: () => gsap.to(circle, { scale: 1, opacity: 1, duration: sp.dur, ease: sp.ease, delay: 0.3 }) });
  })();

  addEventListener("load", () => { drawLines(); ScrollTrigger.refresh(); });
})();
