/* A mechanism both pages share.
   1. Clock — the document does not move (everything is fixed). Wheel and finger push a single value p: wheel 700px = p 1, overwrites the single GSAP 0.9s power2.out that goes to p on each push.
      Keys (↓·PageDown·Space / ↑·PageUp / Home·End) move between sections with power3.inOut (length = distance×0.9, 0.9–2.4s). Each page passes its Section and speed via window.NF_PAGE.
   /  2. Text scramble — hovering links or buttons swaps random capitals 25 times a second for 0.55s, settling in place from the left (all scrambled for the first 25%).
   /  3. Body line rise — each line moves 150% → 0 inside a masking box, power3.out 1.2s, 0.12s between lines. Plays when visible, rewinds when gone.
   4. Tear transition 0.8s, 5. Phone gate, 6. Grain, 7. Footer (light pillar + skeleton). */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = matchMedia("(max-width: 720px)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const NF = (window.NF = window.NF || {});
  NF.reduce = reduce; NF.phone = phone;
  NF.seg = (a, b, p) => clamp((p - a) / (b - a));
  NF.mix = (a, b, t) => a + (b - a) * t;
  NF.sm = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  NF.band = (a, b, c, d, p) => NF.sm(NF.seg(a, b, p)) * (1 - NF.sm(NF.seg(c, d, p)));
  NF.ease = (n) => (window.gsap && gsap.parseEase(n)) || ((t) => t);

  /* ---- 1. Clock ---- */
  const PAGE = window.NF_PAGE || {};
  const CH = PAGE.chapters || [0, 1];
  const END = CH[CH.length - 1];
  const rate = PAGE.rate || (() => 1);
  const CONFIG = { pxPerStep: 700, glide: 0.9, ease: "power2.out", touch: 1.6 };
  const Q = new URLSearchParams(location.search);
  const p0 = Q.has("p") ? +Q.get("p") : 0;
  const S = (NF.S = { p: p0, target: p0 });
  try { history.scrollRestoration = "manual"; } catch (e) { /* Old Browsers */ }
  const UI = ".nf-nav, .thumbs, .scan, [data-own-wheel]";
  const isUI = (el) => !!(el && el.closest && el.closest(UI));
  function glideTo(to) {
    S.target = clamp(to, 0, END);
    if (reduce) { S.p = S.target; return; }
    gsap.to(S, { p: S.target, duration: CONFIG.glide, ease: CONFIG.ease, overwrite: true });
  }
  NF.push = (px) => glideTo(S.target + (px / CONFIG.pxPerStep) * rate(S.target));
  NF.go = (to) => {
    S.target = clamp(to, 0, END);
    if (reduce) { S.p = S.target; return; }
    gsap.to(S, { p: S.target, duration: Math.min(2.4, Math.max(0.9, Math.abs(S.target - S.p) * 0.9)), ease: "power3.inOut", overwrite: true });
  };
  const chapter = (dir) => dir > 0 ? (CH.find((c) => c > S.p + 0.05) ?? END) : ([...CH].reverse().find((c) => c < S.p - 0.05) ?? 0);
  if (!phone) {
    addEventListener("wheel", (e) => { if (isUI(e.target)) return; e.preventDefault(); NF.push(e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY); }, { passive: false });
    let ty = null;
    addEventListener("touchstart", (e) => { ty = isUI(e.target) ? null : e.touches[0].clientY; }, { passive: true });
    addEventListener("touchmove", (e) => { if (ty == null) return; const y = e.touches[0].clientY; NF.push((ty - y) * CONFIG.touch); ty = y; }, { passive: true });
    addEventListener("keydown", (e) => {
      if (e.target.closest && e.target.closest("input, textarea")) return;
      const k = e.key;
      if (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.target.closest("button, a"))) { e.preventDefault(); NF.go(chapter(1)); }
      else if (k === "ArrowUp" || k === "PageUp") { e.preventDefault(); NF.go(chapter(-1)); }
      else if (k === "Home") { e.preventDefault(); NF.go(0); }
      else if (k === "End") { e.preventDefault(); NF.go(END); }
    });
  }
  const frames = [];
  NF.onFrame = (fn) => frames.push(fn);
  let last = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    frames.forEach((fn) => fn(S.p, dt, now / 1000));
  });

  /* ---- 2. Text scramble ---- */
  const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  /* Only swaps text nodes — children inside the title like icons · dots are left as is */
  function scramble(label) {
    if (label._scr || reduce) return;
    const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    if (!nodes.length) return;
    const reals = nodes.map((n) => n.nodeValue), total = reals.join("").length;
    const lockW = label.children.length === 0, w = label.getBoundingClientRect().width;
    if (!label.hasAttribute("aria-label")) label.setAttribute("aria-label", label.textContent.trim());
    if (lockW) { if (getComputedStyle(label).display === "inline") label.style.display = "inline-block"; label.style.width = w + "px"; }
    const D = 550, LEAD = 0.25, t0 = performance.now();
    let lastRoll = 0;
    label._scr = true;
    (function tick(now) {
      const u = (now - t0) / D;
      if (u >= 1) { nodes.forEach((n, k) => { n.nodeValue = reals[k]; }); if (lockW) label.style.width = ""; label._scr = false; return; }
      if (now - lastRoll > 40) {
        lastRoll = now;
        const locked = u < LEAD ? 0 : Math.floor(((u - LEAD) / (1 - LEAD)) * total);
        let i = 0;
        nodes.forEach((n, k) => { n.nodeValue = [...reals[k]].map((c) => (i++ < locked || !c.trim() ? c : POOL[(Math.random() * POOL.length) | 0])).join(""); });
      }
      requestAnimationFrame(tick);
    })(t0);
  }
  if (!reduce) {
    document.addEventListener("pointerover", (e) => {
      const a = e.target.closest && e.target.closest("a, button");
      if (!a || a.contains(e.relatedTarget)) return;
      const label = a.querySelector(".t") || a;
      if (label.children.length || !label.textContent.trim()) return;
      scramble(label);
    });
  }
  NF.scramble = scramble;

  /* ---- 3. Body line rise ---- */
  const LN = { dur: 1.2, stagger: 0.12, rise: 150 };
  const eo = NF.ease("power3.out");
  function split(el) {
    if (el._lines) return el._lines;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="nf-w" style="display:inline-block">${w}</span>`).join(" ");
    const rows = [];
    let top = null;
    el.querySelectorAll(".nf-w").forEach((s) => { const t = s.offsetTop; if (top === null || Math.abs(t - top) > 2) { rows.push([]); top = t; } rows[rows.length - 1].push(s.textContent); });
    el.innerHTML = rows.map((r) => `<span class="nf-ln" style="display:block;overflow:hidden;padding-bottom:.12em;margin-bottom:-.12em"><span style="display:block">${r.join(" ")}</span></span>`).join("");
    el._lines = [...el.querySelectorAll(".nf-ln > span")];
    return el._lines;
  }
  const lineEls = new Set();
  NF.lines = {
    show(el, delay = 0) { if (el._lt0 != null) return; split(el); el._lt0 = performance.now() / 1000 + delay; lineEls.add(el); NF.lines.paint(el); },
    hide(el) { if (el._lt0 == null) return; el._lt0 = null; lineEls.delete(el); if (el._lines) el._lines.forEach((l) => { l.style.transform = `translate3d(0,${LN.rise}%,0)`; }); },
    set(el, on, delay) { on ? NF.lines.show(el, delay) : NF.lines.hide(el); },
    prime(el) { split(el).forEach((l) => { l.style.transform = `translate3d(0,${LN.rise}%,0)`; }); },
    paint(el) {
      const t = performance.now() / 1000 - el._lt0;
      let done = true;
      el._lines.forEach((l, i) => {
        const k = reduce ? 1 : t < 0 ? 0 : eo(clamp((t - i * LN.stagger) / LN.dur));
        if (k < 1) done = false;
        l.style.transform = k >= 1 ? "none" : `translate3d(0,${(1 - k) * LN.rise}%,0)`;
      });
      if (done) lineEls.delete(el);
    },
  };
  gsap.ticker.add(() => lineEls.forEach((el) => NF.lines.paint(el)));

  /* ---- 4. Tear transition — the original tears the browser’s page-transition image. Here the panel covering the new page is torn open along the same curve ---- */
  const KEY = "nf-tear";
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/\.html(\?|#|$)/.test(href) || href.startsWith("http")) return;
    try { sessionStorage.setItem(KEY, "1"); } catch (err) { /* No saving */ }
  });
  function tear() {
    const W = innerWidth, H = innerHeight, R = Math.random, N = 70, K = 12;
    const lean = (R() - 0.5) * W * 0.06;
    const wob = [0, 1, 2].map((i) => ({ k: ((i + 1.3) * Math.PI) / H * (1 + R()), a: (W * 0.012) / (i + 1), p: R() * 7 }));
    const xs = [], ys = [];
    for (let i = 0; i < N; i++) {
      const y = -20 + ((H + 40) * i) / (N - 1);
      let x = W / 2 + lean * (y / H - 0.5);
      wob.forEach((w) => { x += Math.sin(y * w.k + w.p) * w.a; });
      x += (R() - 0.5) * 9 + (R() < 0.15 ? (R() - 0.5) * 18 : 0);
      xs.push(x); ys.push(y);
    }
    const easeC = (t) => 1 - Math.pow(1 - t, 3);
    const frame = (t, E) => {
      const front = -40 + H * 1.9 * easeC(Math.min(1, t * 1.7));
      const G = W * 1.4 * Math.pow(t, 1.6);
      const gap = (y) => G * Math.pow(clamp((front - y) / (H * 0.55)), 0.8) + (y < front ? 2 : 0) - E;
      const L = [[-20, -40]], Rr = [[W + 20, -40]];
      for (let i = 0; i < N; i++) { const g = Math.max(0, gap(ys[i])) / 2; L.push([xs[i] - g, ys[i]]); Rr.push([xs[i] + g, ys[i]]); }
      L.push([-20, H + 60]); Rr.push([W + 20, H + 60]);
      const poly = (pts) => "polygon(" + pts.map(([x, y]) => x.toFixed(1) + "px " + y.toFixed(1) + "px").join(",") + ")";
      return [poly(L), poly(Rr)];
    };
    const box = document.createElement("div");
    box.className = "nf-tear";
    box.innerHTML = '<i class="is-edge"></i><i class="is-edge"></i><i></i><i></i>';
    document.body.appendChild(box);
    const [eL, eR, hL, hR] = box.children;
    const t0 = performance.now(), DUR = 800;
    (function step(now) {
      const t = clamp((now - t0) / DUR);
      const [a, b] = frame(t, 0), [c, d] = frame(t, 4);
      eL.style.clipPath = a; eR.style.clipPath = b; hL.style.clipPath = c; hR.style.clipPath = d;
      if (t < 1) requestAnimationFrame(step); else box.remove();
    })(t0);
  }
  let torn = false;
  try { torn = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch (e) { /* No saving */ }
  if (torn && !reduce) tear();
  NF.tear = tear;

  /* ---- 6. Particles: one 192px cream speck (particles over the screen) + one background-color speck (big-letter concrete) ---- */
  (() => {
    const specks = (name, density) => {
      const T = 192, c = document.createElement("canvas"); c.width = c.height = T;
      const cx = c.getContext("2d"), img = cx.createImageData(T, T), d = img.data;
      cx.fillStyle = getComputedStyle(root).getPropertyValue(name).trim(); cx.fillRect(0, 0, 1, 1);
      const [r, g, b] = cx.getImageData(0, 0, 1, 1).data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() < density ? 0.35 + Math.random() * 0.65 : 0; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255 * v; }
      cx.putImageData(img, 0, 0);
      return `url(${c.toDataURL()})`;
    };
    root.style.setProperty("--nf-grain", specks("--kf-ink", 0.06));
    root.style.setProperty("--nf-specks", specks("--kf-bg", 0.12));
    const n = document.createElement("i"); n.className = "nf-grain"; n.setAttribute("aria-hidden", "true");
    document.body.appendChild(n);
  })();

  /* ---- 5. Phone gate: a single screen instead of the document — a checker halftone skull spins in place. The frame is drawn (0.6s, 0.05s stagger), title lines come into focus from blur (0.8s, 0.28s stagger), and labels and buttons rise up ---- */
  NF.gate = () => {
    root.classList.add("nf-gate-on");
    const g = document.createElement("div");
    g.className = "nf-gate"; g.setAttribute("data-slot", "phone-gate");
    g.innerHTML = `<canvas aria-hidden="true"></canvas>
      <i class="nf-gate__rule nf-gate__rule--v"></i><i class="nf-gate__rule nf-gate__rule--h"></i>
      <i class="nf-gate__brk nf-gate__brk--tl"></i><i class="nf-gate__brk nf-gate__brk--tr"></i><i class="nf-gate__brk nf-gate__brk--bl"></i><i class="nf-gate__brk nf-gate__brk--br"></i>
      <h1 class="nf-gate__title" data-label="Three lines telling users to view on desktop (English uppercase)"><span>The experience is</span><span>best viewed on</span><span>desktop</span></h1>
      <p class="t nf-gate__l" data-label="Product Category Label">Product Line</p><p class="t nf-gate__r" data-label="Product Category Label">Field Series</p>
      <a class="nf-gate__cta" href="#contact"><span class="t">Get in touch</span></a>`;
    document.body.appendChild(g);
    const E = "cubic-bezier(.215,.61,.355,1)";
    if (!reduce) {
      g.querySelectorAll(".nf-gate__rule, .nf-gate__brk").forEach((el, i) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 200 + i * 50, easing: E, fill: "backwards" }));
      g.querySelectorAll(".nf-gate__title span").forEach((el, i) => el.animate([{ opacity: 0, filter: "blur(12px)" }, { opacity: 1, filter: "blur(0px)" }], { duration: 800, delay: 700 + i * 280, easing: E, fill: "backwards" }));
      g.querySelectorAll(".t, .nf-gate__cta").forEach((el, i) => el.animate([{ opacity: 0, transform: "translate3d(0,10px,0)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: 1700 + i * 100, easing: E, fill: "backwards" }));
    }
    const W = window.NFWorld;
    if (!W) return;
    const w = W.create(g.querySelector("canvas"));
    const sk = W.skull(); w.scene.add(sk); sk.scale.setScalar(0.62);
    w.U.uHalf.value = 0.85; w.U.uCell.value = 3; w.U.uAberr.value = 3;
    w.warm();
    NF.onFrame((p, dt, t) => { if (!reduce) sk.rotation.y = t * 0.55; w.render(t); });
  };

  /* ---- 7. Footer: big closing sentence · links · three orbits · X-ray skeleton spinning inside a faint ”/” light pillar ---- */
  NF.footer = (host) => {
    const f = document.createElement("div");
    f.className = "nf-fin"; f.setAttribute("data-slot", "footer-beam");
    f.innerHTML = `
      <div class="nf-fin__beam"><svg viewBox="73 -9 118 153" aria-hidden="true"><path fill="currentColor" d="M116.182 114H103V92.7429L147.818 37.4743V21H161V42.2571L116.182 97.5257V114Z"/></svg></div>
      <canvas aria-hidden="true"></canvas>
      <svg class="nf-fin__orbits" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g class="nf-orb" style="transform-origin:720px 450px"><ellipse cx="720" cy="450" rx="455" ry="200" transform="rotate(-28 720 450)"/><ellipse cx="720" cy="450" rx="455" ry="160" transform="rotate(32 720 450)"/><ellipse cx="720" cy="450" rx="150" ry="450" transform="rotate(-12 720 450)"/></g>
        <rect x="806" y="568" width="11" height="11"/><rect x="681" y="655" width="11" height="11"/><rect x="811" y="692" width="11" height="11"/>
      </svg>
      <h2 class="nf-fin__title" data-label="Closing sentence in three lines (English capitals) — red scribble over the second word">
        <span>The&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Brandname</span><span>Made to be</span><span>Worn.<i class="nf-fin__pie"></i></span>
        <svg class="nf-fin__scribble" viewBox="0 0 96 72" aria-hidden="true"><path d="M14 40c6-22 36-30 52-18 14 11-4 30-22 28-17-2-12-22 6-26 18-4 38 4 34 18-3 11-22 10-30 4M40 44l-2 22M60 46l2 18"/></svg>
      </h2>
      <div class="nf-fin__sub"><p class="t" data-lines>Built in solitude</p><p class="t" data-lines>Made in the name of your health</p></div>
      <nav class="nf-fin__links" aria-label="Footer"><a class="t" href="about.html">About</a><span class="t">I</span><a class="t" href="index.html">Index</a><span class="t">II</span></nav>
      <p class="t nf-fin__by" data-label="Maker">Website by Studio</p><p class="t nf-fin__year">2026</p>
      <i class="nf-fin__tick nf-fin__tick--bl"></i><i class="nf-fin__tick nf-fin__tick--br"></i>`;
    host.appendChild(f);
    const beam = f.querySelector(".nf-fin__beam"), title = f.querySelector(".nf-fin__title"), orb = f.querySelector(".nf-orb");
    const subs = [...f.querySelectorAll("[data-lines]")];
    const ui = [...f.querySelectorAll(".nf-fin__links, .nf-fin__by, .nf-fin__year, .nf-fin__tick, .nf-fin__orbits rect")];
    subs.forEach((s) => NF.lines.prime(s));
    let world = null, skel = null;
    const W = window.NFWorld;
    if (W) {
      world = W.create(f.querySelector("canvas"));
      skel = W.skeleton(W.xrayMat(W.color("--kf-line", 0.35), 1.2, 1, W.T.NormalBlending));
      skel.scale.setScalar(1.15); world.scene.add(skel); world.cam.position.z = 9;
      world.U.uAberr.value = 2.5;
      world.warm();
    }
    let titled = false;
    /* k: 0 → 1 is the path where ”/” blurs into a light beam, ui: 0 → 1 is the path where the letters come in */
    return (on, k, u, t) => {
      f.style.visibility = on ? "visible" : "hidden";
      if (!on) { titled = false; subs.forEach((s) => NF.lines.hide(s)); return; }
      beam.style.setProperty("--beam-blur", (NF.sm(k) * 40).toFixed(1) + "px");
      beam.style.setProperty("--beam-s", NF.mix(3.2, 1, NF.ease("expo.out")(k)).toFixed(3));
      title.style.opacity = u > 0 ? 1 : 0;
      if (u > 0 && !titled) { titled = true; title.querySelectorAll("span:not(.nf-fin__pie)").forEach((s, i) => setTimeout(() => s.isConnected && scramble(s), i * 120)); subs.forEach((s, i) => NF.lines.show(s, 0.3 + i * 0.12)); }
      if (u <= 0 && titled) { titled = false; subs.forEach((s) => NF.lines.hide(s)); }
      ui.forEach((el) => { el.style.opacity = NF.sm(NF.seg(0.3, 1, u)); });
      orb.style.transform = `rotate(${(t * 2) % 360}deg)`;
      orb.style.opacity = NF.sm(NF.seg(0.2, 1, u));
      if (world) {
        skel.rotation.y = NF.mix(-Math.PI * 0.9, 0.25, NF.ease("power3.out")(k)) + (reduce ? 0 : Math.sin(t * 0.4) * 0.08);
        skel.rotation.z = -0.62;
        world.U.uFade.value = NF.sm(NF.seg(0.35, 1, k));
        world.render(t);
      }
    };
  };

  if (phone) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", NF.gate, { once: true }); else NF.gate();
  }
})();
