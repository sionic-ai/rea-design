// Shared across pages: the artwork slots (brush-lettering logo, clouds, grass, silhouette, dragon) are redrawn fresh in SVG and canvas,
// Handles page transitions (swup 4.8.2 + JS plugin — same setup as the original), smooth scroll (Lenis 1.3.17), sound (WebAudio), the bottom filter panel, and the work detail cover.
// As in the original, the header, filter bar and sound button stay outside the transition, and only the body inside #swup is swapped, then that page’s part (OU.page) is hooked up again.
(() => {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = () => innerWidth <= 750;
  const touchOnly = () => matchMedia("(hover: none)").matches;
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  // Skin variables (oklch from … · color-mix) can’t be read directly by canvas · GSAP, so paint one cell and use it as rgb
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const paint = (css) => {
    const el = document.createElement("i");
    el.style.cssText = `position:absolute;visibility:hidden;color:${css}`;
    document.body.appendChild(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
  };
  const html = document.documentElement;
  const NS = "http://www.w3.org/2000/svg";

  // Brush-lettering logo slot: a small top line + four large, jagged slanted characters (only the composition of the original logo)
  const LOGO = `<svg viewBox="0 0 300 190" aria-hidden="true" style="font-family: var(--kf-font-brush, var(--kf-font-display))" fill="currentColor">
    <text x="128" y="44" font-size="52" transform="rotate(-4 160 40)">Here</text>
    <text x="62" y="70" font-size="18" transform="rotate(-6 70 64)">Logo</text>
    <text x="6" y="150" font-size="104" transform="rotate(-12 40 120)">Toward</text>
    <text x="78" y="176" font-size="122" transform="rotate(5 120 140)">High</text>
    <text x="160" y="146" font-size="96" transform="rotate(-6 190 118)">Ruler</text>
    <text x="226" y="178" font-size="110" transform="rotate(10 250 140)">Ri</text>
  </svg>`;

  // ===== Clouds: the original is a 20-frame 10fps animation (2s loop) — edge peaks breathe and the swirl drifts sideways. The path is redrawn at the same Tempo
  const cloudPath = (k, seed) => {
    const ph = (k / 20) * Math.PI * 2;
    const bumps = [[18, 86, 0], [40, 62, 16], [84, 46, 22], [140, 38, 26], [192, 44, 22], [238, 52, 20], [282, 50, 22], [326, 56, 18], [370, 60, 16], [412, 70, 14], [446, 82, 10]];
    let d = "M14 92";
    bumps.forEach(([x, y, r], i) => {
      const w = r * (1 + 0.08 * Math.sin(ph + i * 0.9 + seed));
      d += `Q${x - w * 0.2} ${y - w * 1.05} ${x + w} ${y + 2 * Math.sin(ph + i)}`;
    });
    d += "Q462 98 440 98H24Q8 98 14 92Z";
    const sx = Math.sin(ph + seed) * 6;
    const swirl = [[70, 72], [190, 66], [312, 70]].map(([x, y], i) => {
      const cx = x + sx * (i % 2 ? -1 : 1);
      return `M${cx - 22} ${y}c0-12 22-14 26-4c3 7-6 12-12 8`;
    }).join("");
    return { d, swirl };
  };
  const clouds = (root) => {
    const parts = [];
    $$(".ou-clouds", root).forEach((wrap) => {
      const n = wrap.classList.contains("ou-clouds--c") ? 4 : 6;
      for (let i = 0; i < n; i++) {
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("viewBox", "0 0 460 100");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.classList.add("ou-cloud");
        svg.innerHTML = `<path class="ou-cloud__body"/><path class="ou-cloud__swirl"/>`;
        wrap.appendChild(svg);
        parts.push({ body: svg.firstChild, swirl: svg.lastChild, seed: i * 1.7 });
      }
    });
    const draw = (k) => parts.forEach((p) => { const c = cloudPath(k, p.seed); p.body.setAttribute("d", c.d); p.swirl.setAttribute("d", c.swirl); });
    draw(0);
    if (reduce || !parts.length) return () => {};
    let k = 0;
    const id = setInterval(() => draw((k = (k + 1) % 20)), 100);
    return () => clearInterval(id);
  };

  // ===== Grass strip and silhouette row: the original silhouettes are 6-frame 12fps walking animations — legs step alternately and the body bobs up and down
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const grass = () => {
    seed = 7;
    let tufts = "";
    for (let i = 0; i < 140; i++) {
      const x = rnd() * 1440, y = 30 + rnd() * 350, h = 8 + rnd() * 14, w = 4 + rnd() * 6;
      tufts += `<path d="M${x} ${y}l${-w} ${-h}M${x} ${y}l${w * 0.3} ${-h * 1.2}M${x} ${y}l${w} ${-h * 0.8}" />`;
    }
    return `<svg class="ou-footer__grass" viewBox="0 0 1440 385" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="ou-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--site-grass-top)"/><stop offset="1" style="stop-color: var(--site-grass-bottom)"/></linearGradient></defs>
      <rect width="1440" height="385" fill="url(#ou-g)"/>
      <g fill="none" style="stroke: var(--site-grass-blade)" stroke-width="2" stroke-linecap="round" opacity=".55">${tufts}</g></svg>`;
  };
  const KINDS = ["rabbit", "kid", "bear", "kid", "big", "kid", "rabbit", "bear", "fox"];
  const walkers = (f) => {
    let g = "";
    const ph = (f / 6) * Math.PI * 2;
    KINDS.forEach((k, i) => {
      const s = k === "big" ? 1.35 : k === "kid" ? 1 : 0.9, step = ph + i * 1.3;
      const x = 30 + i * 66, base = 150 - Math.abs(Math.sin(step)) * 4, head = 20 * s, body = 46 * s;
      const swing = Math.sin(step) * 9;
      g += `<circle cx="${x}" cy="${base - body - head * 1.6}" r="${head}"/>`;
      g += `<path d="M${x - 11 * s} ${base - body - 4} q${11 * s} -8 ${22 * s} 0 l4 ${body - 8} h${-30 * s} z"/>`;
      g += `<path d="M${x - 6} ${base - 12} l${-swing * 0.6} 14 M${x + 6} ${base - 12} l${swing * 0.6} 14" stroke-width="6" fill="none"/>`;
      if (k === "bear") g += `<circle cx="${x - 11}" cy="${base - body - head * 2.4}" r="6"/><circle cx="${x + 11}" cy="${base - body - head * 2.4}" r="6"/>`;
      if (k === "rabbit") g += `<path d="M${x - 6} ${base - body - head * 2.2} l-4 -26 l6 0 z M${x + 6} ${base - body - head * 2.2} l4 -26 l-6 0 z"/>`;
      if (k === "fox") g += `<path d="M${x - 12} ${base - body - head * 2} l-2 -16 l10 8 z M${x + 12} ${base - body - head * 2} l2 -16 l-10 8 z"/>`;
    });
    return g;
  };
  const meadow = (root) => {
    $$("[data-grass]", root).forEach((el) => (el.outerHTML = grass()));
    const kvs = $$("[data-silhouettes]", root).map((el) => {
      el.innerHTML = `<svg viewBox="0 0 595 160" aria-hidden="true"><g style="fill: var(--site-silhouette); stroke: var(--site-silhouette)" stroke-linecap="round">${walkers(0)}</g></svg>`;
      return $("g", el);
    });
    if (reduce || !kvs.length) return () => {};
    let f = 0;
    const id = setInterval(() => { f = (f + 1) % 6; kvs.forEach((g) => (g.innerHTML = walkers(f))); }, 1000 / 11.99);
    return () => clearInterval(id);
  };

  // ===== Dragon: as in the original, 26 segments travel in a line at 220 units/sec along a hidden square rail larger than the screen (1920 units).
  // The head, body, child, leg and tail illustrations are newly drawn vectors in the same box size (243×117 · 136.8×67.2 …). Rail coordinates are the original orbit values
  const RAIL = "M2220.9,706.4c-114.4-135.4-318.3-162.4-490.1-118.6-171.8,43.8-325.2,139.6-476.1,232.6-225,138.7-552.2,246.3-750.2,261.9-194.2,15.3-547.2-40.2-749-215,5.7-171-13.4-342.7-7.7-513.7,3-90.9,13.6-196,89.5-246,63.1-41.6,150.8-26.1,212.9,17s104.4,108.5,145.3,172.1c148.9,231.7,300.7,463,484.8,667.8,184.1,204.8,403,383.5,657.4,488.9,254.4,105.4,547,132.7,806.8,41.4-23.3-407.5,143-654,81.5-654-165.9,0-449.8-26.3-670.3,172.9-691.9,625.4-815,1125.8-815,1125.8,0,0-535.3-272-280.8-574.8,235.5-280.2,476.7-623.1,544.1-1000.4,53.2-297.8,35.1-583.6-21.9-748.8-225.2-2.1-200.5,2.4-425.7.4,187.7,558.7,475.9,994.6,1043.6,1153.1,119,33.2,242,54.5,356.1,102,114.1,47.5,221.7,126.6,269.9,240.4-213.7,145.3-495.1,180.5-737.3,90.2-244.4-91.1-430.1-292.7-658.4-418.8-237.6-131.2-536-174.3-782.3-60.2-141.2,65.4-262.1,179.2-414.6,210,134.3,172.3,351.9,258.9,569.9,243.9,218-15,423.1-114,599.3-243.2,176.1-129.3,327.5-288.7,482.1-443.1,78.8-78.6,159.3-156.7,252.7-217.2,171.5-111.1,376.8-157,579.3-184";
  const PART = {
    head: { w: 243, h: 117, ox: 0.7, oy: 0.5, rot: 0 },
    body: { w: 136.8, h: 67.2, ox: 0.5, oy: 0.5, rot: 0 },
    kid: { w: 136.8, h: 67.2, ox: 0.5, oy: 0.5, rot: 0, add: { w: 135.6, h: 90, oy: -0.9 } },
    limb: { w: 136.8, h: 67.2, ox: 0.5, oy: 0.5, rot: 0, add: { w: 90, h: 60, oy: 0.5 } },
    tail: { w: 193.2, h: 162, ox: 0.15, oy: 0.47, rot: (18 * Math.PI) / 180 },
  };
  const PATTERN = ["head", "body", "kid", "body", "body", "body", "limb", ...Array(15).fill("body"), "limb", "body", "body", "tail"];
  const makeDragon = (wrap) => {
    if (!wrap) return null;
    const canvas = document.createElement("canvas");
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 1920 1920");
    svg.classList.add("ou-dragon__rail");
    svg.innerHTML = `<path d="${RAIL}"/>`;
    wrap.append(canvas, svg);
    const ctx = canvas.getContext("2d");
    const path = svg.firstChild;
    const C = {};
    ["line", "body", "belly", "fin", "mane"].forEach((k) => (C[k] = paint(`var(--site-dragon-${k})`)));
    ["coat", "skin", "hair"].forEach((k) => (C[k] = paint(`var(--site-kid-${k})`)));
    C.white = paint("var(--kf-surface)"); C.dark = paint("var(--site-shade)");
    C.limbDark = paint("color-mix(in srgb, var(--site-dragon-body) 60%, var(--site-shade))");
    const SPACING = isSp() ? 45 : 96, SPEED = 220, SIZE = 1.15, RADIUS = 0.13;
    const len = path.getTotalLength();
    const lut = [];
    for (let i = 0; i <= 1000; i++) {
      const d = (i / 1000) * len, p = path.getPointAtLength(d), q = path.getPointAtLength(Math.min(d + 1, len));
      const a = Math.atan2(q.y - p.y, q.x - p.x);
      lut.push({ x: p.x, y: p.y, rot: a + Math.PI, flip: Math.abs(a) < Math.PI / 2 });
    }
    const at = (t) => {
      t = Math.max(0, Math.min(1, t));
      const f = t * 1000, lo = Math.floor(f), hi = Math.min(lo + 1, 1000), k = f - lo, A = lut[lo], B = lut[hi];
      let dr = B.rot - A.rot;
      if (dr > Math.PI) dr -= 2 * Math.PI;
      if (dr < -Math.PI) dr += 2 * Math.PI;
      return { x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k, rot: A.rot + dr * k, flip: k < 0.5 ? A.flip : B.flip };
    };
    let scale = 1, off = { x: 0, y: 0 }, size = { w: 0, h: 0 };
    const dpr = devicePixelRatio || 1;
    const resize = () => {
      const r = wrap.getBoundingClientRect(), s = svg.getBoundingClientRect();
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = s.width / 1920; off = { x: s.left - r.left, y: s.top - r.top }; size = { w: r.width, h: r.height };
    };
    resize();
    // Drawing pieces: the head has its snout on the left (-x), body segments are rounded-square scales, legs have three claws, the tail has a mane tuft
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
    const segment = (w, h) => {
      const r = Math.min(w, h) * RADIUS;
      ctx.save(); rr(-w / 2, -h / 2, w, h, r); ctx.clip();
      ctx.fillStyle = C.body; ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = C.belly; ctx.fillRect(-w / 2, h * 0.12, w, h * 0.38);
      ctx.strokeStyle = C.line; ctx.lineWidth = Math.max(1, h * 0.04);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-w / 2 + w * (0.15 + i * 0.25), -h * 0.12, h * 0.16, 0, Math.PI); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = C.fin; ctx.beginPath(); ctx.moveTo(-w * 0.3, -h / 2); ctx.lineTo(-w * 0.05, -h * 0.95); ctx.lineTo(w * 0.15, -h / 2); ctx.fill();
    };
    const head = (w, h, ox, oy) => {
      ctx.save(); ctx.translate(-ox + w / 2, -oy + h / 2);
      ctx.fillStyle = C.mane;
      for (let m = 0; m < 4; m++) { ctx.beginPath(); ctx.ellipse(w * (0.22 + m * 0.06), -h * (0.3 - m * 0.04), w * 0.12, h * 0.08, -0.5 - m * 0.15, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = C.body; ctx.strokeStyle = C.line; ctx.lineWidth = h * 0.03;
      ctx.beginPath(); ctx.ellipse(w * 0.05, -h * 0.02, w * 0.36, h * 0.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-w * 0.18, h * 0.14, w * 0.24, h * 0.13, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(-w * 0.04, -h * 0.1, h * 0.09, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.dark; ctx.beginPath(); ctx.arc(-w * 0.06, -h * 0.1, h * 0.045, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.mane; ctx.lineWidth = h * 0.025;
      ctx.beginPath(); ctx.moveTo(-w * 0.32, h * 0.02); ctx.quadraticCurveTo(-w * 0.45, -h * 0.2, -w * 0.5, -h * 0.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w * 0.32, h * 0.08); ctx.quadraticCurveTo(-w * 0.45, h * 0.3, -w * 0.5, h * 0.2); ctx.stroke();
      ctx.restore();
    };
    const kid = (w, h) => {
      ctx.fillStyle = C.coat; ctx.beginPath(); ctx.ellipse(0, h * 0.1, w * 0.18, h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, -h * 0.28, h * 0.18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.hair; ctx.beginPath(); ctx.arc(0, -h * 0.34, h * 0.17, Math.PI, Math.PI * 2); ctx.fill();
    };
    const limb = (w, h, dark) => {
      ctx.fillStyle = dark ? C.limbDark : C.body;
      ctx.strokeStyle = C.line; ctx.lineWidth = h * 0.04;
      ctx.beginPath(); ctx.ellipse(0, 0, w * 0.42, h * 0.22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.belly;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.42, -h * 0.12 + i * h * 0.12); ctx.lineTo(-w * 0.55, -h * 0.08 + i * h * 0.14); ctx.lineTo(-w * 0.42, -h * 0.02 + i * h * 0.12); ctx.fill(); }
    };
    const tail = (w, h, ox, oy) => {
      ctx.save(); ctx.translate(-ox, -oy);
      ctx.fillStyle = C.body; ctx.strokeStyle = C.line; ctx.lineWidth = h * 0.02;
      ctx.beginPath(); ctx.moveTo(0, h * 0.35); ctx.quadraticCurveTo(w * 0.5, h * 0.45, w * 0.78, h * 0.5); ctx.quadraticCurveTo(w * 0.5, h * 0.6, 0, h * 0.62); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.mane;
      for (let m = 0; m < 5; m++) { ctx.beginPath(); ctx.ellipse(w * (0.72 + m * 0.04), h * (0.36 + m * 0.07), w * 0.16, h * 0.06, -0.6 + m * 0.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    };
    const state = { progress: 0 };
    let entered = false;
    const flips = new Array(PATTERN.length).fill(false);
    const per = SPACING / len;
    const draw = () => {
      ctx.clearRect(0, 0, size.w, size.h);
      for (let i = PATTERN.length - 1; i >= 0; i--) {
        const key = PATTERN[i], part = PART[key];
        let t = entered ? (state.progress - i * per + 1) % 1 : state.progress - i * per;
        if (t < 0) continue;
        const p = at(t), x = p.x * scale + off.x, y = p.y * scale + off.y;
        if (!(x > -100 && x < size.w + 100 && y > -100 && y < size.h + 100)) flips[i] = p.flip;
        const flip = flips[i];
        const w = part.w * scale * SIZE, h = part.h * scale * SIZE, ox = part.ox * w, oy = part.oy * h;
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot + (flip ? -part.rot : part.rot)); if (flip) ctx.scale(1, -1);
        if (key === "head") head(w, h, ox, oy);
        else if (key === "tail") { ctx.translate(w * -0.09, h * 0.04); ctx.rotate((3.91 * Math.PI) / 180); ctx.scale(1.12, 1.12); tail(w, h, ox, oy); }
        else {
          if (key === "limb") { const aw = part.add.w * scale * SIZE, ah = part.add.h * scale * SIZE; ctx.save(); ctx.translate(aw * -0.09, h * 0.52); ctx.rotate((-58.7 * Math.PI) / 180); limb(aw * 1.2, ah * 1.2, true); ctx.restore(); }
          segment(w, h);
          if (key === "kid") { const aw = part.add.w * scale * SIZE, ah = part.add.h * scale * SIZE; ctx.save(); ctx.translate(aw * 0.07, h * (part.add.oy - 0.07)); kid(aw * 1.28, ah * 1.28); ctx.restore(); }
          if (key === "limb") { const aw = part.add.w * scale * SIZE, ah = part.add.h * scale * SIZE; ctx.save(); ctx.translate(aw * 0.48, h * 0.54); ctx.rotate((-13.7 * Math.PI) / 180); limb(aw * 1.2, ah * 1.2, false); ctx.restore(); }
        }
        ctx.restore();
      }
    };
    const duration = len / SPEED, entry = PATTERN.length * per;
    const tl = gsap.timeline({ paused: true })
      .to(state, { progress: entry, duration: entry * duration, ease: "none", onUpdate: draw, onComplete: () => (entered = true) })
      .to(state, { progress: entry + 1, duration, ease: "none", onUpdate: draw, repeat: -1 });
    addEventListener("resize", resize);
    tl.cleanup = () => { tl.kill(); removeEventListener("resize", resize); };
    return tl;
  };

  // ===== Sound: like the original, six sounds are pre-decoded with WebAudio, and when turned on the first page loops bgm and subpages loop under-page with a 0.5s fade.
  // Sound files are placeholders made with ffmpeg (media/sounds)
  const FADE = 0.5;
  const sound = {
    ctx: null, buffers: {}, sources: {}, gain: null, ready: false, loading: null, muted: false,
    init() {
      if (this.ready) return Promise.resolve();
      if (this.loading) return this.loading;
      this.loading = (async () => {
        try {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
          this.gain = this.ctx.createGain(); this.gain.connect(this.ctx.destination);
          if (this.ctx.state === "suspended") await this.ctx.resume();
          await Promise.all(["bgm", "opening-to", "pop", "works-hover", "open-work", "under-page"].map(async (n) => {
            try { this.buffers[n] = await this.ctx.decodeAudioData(await (await fetch(`media/sounds/${n}.mp3`)).arrayBuffer()); } catch {}
          }));
          this.ready = true;
        } catch {}
      })();
      return this.loading;
    },
    play(name, { loop = false, volume = 1, fadeIn = 0 } = {}) {
      if (!this.ready || !this.buffers[name] || this.muted) return null;
      const src = this.ctx.createBufferSource(), g = this.ctx.createGain();
      src.buffer = this.buffers[name]; src.loop = loop;
      if (fadeIn > 0) { g.gain.setValueAtTime(0, this.ctx.currentTime); g.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + fadeIn); } else g.gain.value = volume;
      src.connect(g); g.connect(this.gain);
      this.sources[name] = { src, g };
      src.start(0);
      src.onended = () => { if (this.sources[name]?.src === src) delete this.sources[name]; };
      return src;
    },
    fadeOut(name, d = FADE) {
      const e = this.sources[name];
      if (!e) return;
      e.g.gain.setValueAtTime(e.g.gain.value, this.ctx.currentTime);
      e.g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + d);
      setTimeout(() => { try { e.src.stop(); } catch {} if (this.sources[name]?.src === e.src) delete this.sources[name]; }, d * 1000);
    },
    setMuted(m) { this.muted = m; if (this.gain) this.gain.gain.value = m ? 0 : 1; },
    playing(name) { return !!this.sources[name]; },
  };
  const isTop = () => !!$('.ou-container[data-page="index"], .ou-container[data-page="list"]');
  const syncSound = (v) => { sessionStorage.setItem("ou-sound", v); $$(".ou-nav__sounds, .ou-sounds").forEach((el) => (el.dataset.sound = v)); };
  syncSound(sessionStorage.getItem("ou-sound") === "on" ? "on" : "off");
  document.addEventListener("click", async (e) => {
    const on = e.target.closest('.ou-opening__toggle[data-sound-toggle="on"]');
    if (on) {
      syncSound("on");
      await sound.init();
      const s = sound.play("opening-to");
      if (s) s.onended = () => sound.play("bgm", { loop: true });
      return;
    }
    const btn = e.target.closest(".ou-nav__sounds, .ou-sounds");
    if (!btn) return;
    if (btn.dataset.sound === "off") {
      syncSound("on");
      await sound.init();
      sound.setMuted(false);
      if (!sound.playing("bgm") && !sound.playing("under-page")) sound.play(isTop() ? "bgm" : "under-page", { loop: true, fadeIn: FADE });
    } else {
      syncSound("off");
      ["bgm", "under-page", "opening-to"].forEach((n) => sound.fadeOut(n));
      setTimeout(() => sound.setMuted(true), FADE * 1000);
    }
  });
  document.addEventListener("click", (e) => { if (e.target.closest(".ou-grid__item, .ou-works__item")) sound.play("pop", { volume: 3 }); });
  document.addEventListener("click", (e) => { if (e.target.closest(".ou-opening__circle")) sound.play("open-work"); });
  if (!isSp()) document.addEventListener("mouseenter", (e) => { if (e.target.closest?.(".ou-grid__item, .ou-works__item")) sound.play("works-hover"); }, true);
  const switchBgm = () => {
    if (!sound.ready) return;
    if (isTop()) { sound.fadeOut("under-page"); if (!sound.playing("bgm")) sound.play("bgm", { loop: true, fadeIn: FADE }); }
    else { sound.fadeOut("bgm"); if (!sound.playing("under-page")) sound.play("under-page", { loop: true, fadeIn: FADE }); }
  };

  // A hover released before it is even half open is folded after opening fully (original mouseOverReverseTl — threshold .5, .1s before the end)
  const reverseLater = (tl, threshold = 0.5) => {
    if (!tl || tl.reversed()) return;
    const delay = tl.progress() < threshold ? tl.totalDuration() * 1000 - 100 : 0;
    setTimeout(() => tl.reverse(), delay);
  };

  // ===== Bottom filter bar (outside the transition, so attached only once): clicking a group opens a panel, and while it is open, another group only clears and swaps the list over .4s
  const nav = $(".ou-nav");
  let lenis = null;
  if (nav) {
    const inner = $(".ou-nav__form-inner", nav);
    const open = (g) => { nav.dataset.status = "open"; nav.dataset.openCategory = g; };
    const close = () => { delete nav.dataset.status; delete nav.dataset.openCategory; };
    $$(".ou-nav__group", nav).forEach((b) => {
      b.addEventListener("click", () => {
        if (nav.dataset.status === "open" && !reduce) gsap.timeline().to(inner, { opacity: 0, duration: 0.4 }).call(() => open(b.dataset.group)).to(inner, { opacity: 1, duration: 0.4 });
        else open(b.dataset.group);
      });
      // Grouped text turns translucent (.5) at .5s — original baseNavDirection
      const tl = gsap.timeline({ paused: true }).to($("span", b), { opacity: 0.5 });
      b.addEventListener("mouseenter", () => tl.restart());
      b.addEventListener("mouseleave", () => tl.reverse());
    });
    $(".ou-nav__cover", nav).addEventListener("click", close);
    $(".ou-nav__close", nav).addEventListener("click", close);
    $(".ou-nav__reset", nav).addEventListener("click", () => $$(".ou-nav__item", nav).forEach((i) => i.setAttribute("aria-pressed", "false")));
    $$(".ou-nav__item", nav).forEach((i) => i.addEventListener("click", () => i.setAttribute("aria-pressed", i.getAttribute("aria-pressed") === "true" ? "false" : "true")));
    // ”Apply”: the original carries the chosen tags in the URL to the list view (the server filters). Here, the chosen names go in the URL to the list
    $(".ou-nav__apply", nav).addEventListener("click", () => {
      const picked = $$('.ou-nav__item[aria-pressed="true"] span', nav).map((s) => s.textContent.trim());
      close();
      const url = picked.length ? `list.html?tag=${picked.map(encodeURIComponent).join(",")}` : "list.html";
      go(url);
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.dataset.status === "open") close(); });
  }

  // ===== Work detail cover (inside the body, so attached per page): panel and backdrop rise in .6s power2.out, content follows at .4s and the big English title at 1s
  const coverOn = (root) => {
    const cover = $(".ou-cover", root);
    if (!cover) return () => {};
    const q = (s) => $(s, cover);
    const openCover = (src) => {
      const title = $("[data-cover-title]", src)?.textContent.trim() || "Work Title";
      const en = $("[data-cover-title-en]", src)?.textContent.trim() || "Story Title";
      q(".ou-cover__title").textContent = title;
      q(".ou-cover__title-en").textContent = en;
      q(".ou-cover__big-title").textContent = en;
      const tags = $$("[data-cover-tag]", src).map((t) => t.textContent.trim());
      $$(".ou-cover__tax-list", cover).forEach((list, i) => list.replaceChildren(...tags.slice(i * 2, i * 2 + 3).map((t) => Object.assign(document.createElement("span"), { textContent: t }))));
      cover.setAttribute("data-open-cover", "");
      gsap.set(q(".ou-cover__inner"), { opacity: 0 });
      gsap.timeline().to(q(".ou-cover__modal"), { y: 0, duration: 0.6, ease: "power2.out" })
        .to(q(".ou-cover__back"), { opacity: 1, duration: 0.6, pointerEvents: "auto", ease: "power2.out" }, "<");
      gsap.set(q(".ou-cover__thumb"), { opacity: 0 });
      gsap.timeline().to(q(".ou-cover__inner"), { opacity: 1, duration: 0.4, ease: "power2.out" })
        .to(q(".ou-cover__big-title"), { y: 0, duration: 1, ease: "power2.out" }, "<")
        .to(q(".ou-cover__thumb"), { opacity: 1, duration: 0.4, ease: "power2.out" }, "<");
      lenis?.stop();
    };
    const closeCover = () => {
      if (!cover.hasAttribute("data-open-cover")) return;
      cover.removeAttribute("data-open-cover");
      gsap.timeline().to(q(".ou-cover__inner"), { opacity: 0, duration: 0.3, ease: "power2.out" })
        .to(q(".ou-cover__big-title"), { y: "101%", duration: 0.6, ease: "power2.out" }, "<")
        .to(q(".ou-cover__modal"), { y: "101%", duration: 0.6, ease: "power2.out" }, "<")
        .to(q(".ou-cover__back"), { opacity: 0, duration: 0.6, ease: "power2.out", pointerEvents: "none" }, "<");
      lenis?.start();
    };
    gsap.set([q(".ou-cover__modal"), q(".ou-cover__big-title")], { y: "101%" });
    q(".ou-cover__close").addEventListener("click", closeCover);
    q(".ou-cover__back").addEventListener("click", closeCover);
    const esc = (e) => e.key === "Escape" && closeCover();
    addEventListener("keydown", esc);
    api.openCover = openCover;
    return () => removeEventListener("keydown", esc);
  };

  // ===== Per page: like the original allInit, each time the body is swapped, that page’s motion is attached. Attached motion stops when the transition starts
  const pages = {};
  let ctx = null, cleanups = [];
  const api = { $, $$, reduce, isSp, rem, cssVar, paint, makeDragon, reverseLater, sound, html, openCover: () => {}, get lenis() { return lenis; } };
  const runPage = () => {
    const root = $(".ou-container");
    if (!root) return;
    $$("[data-logo]", root).forEach((el) => (el.innerHTML = LOGO));
    ctx = gsap.context(() => {
      cleanups = [clouds(root), meadow(root), coverOn(root)];
      // Smooth scroll: original Lenis (duration .7, 1-(1-t)^5). Off on phone and touch-only devices
      if (!reduce && !isSp() && !touchOnly() && window.Lenis) {
        lenis = new Lenis({ duration: 0.7, easing: (t) => 1 - Math.pow(1 - t, 5), autoRaf: true });
        lenis.on("scroll", ScrollTrigger.update);
      }
      const init = pages[root.dataset.page];
      if (init) cleanups.push(init(root, api) || (() => {}));
    });
    switchBgm();
  };
  const stopPage = () => {
    cleanups.forEach((fn) => fn());
    cleanups = [];
    ctx?.kill(false);
    ScrollTrigger.getAll().forEach((t) => t.kill());
    lenis?.destroy();
    lenis = null;
  };

  // ===== Page transition: original swup 4.8.2 + JS plugin — on exit the body fades out in .5s, on enter it waits 1s then fades in over 1s.
  // Links containing # go as normal navigation without a transition (original linkSelector). When opened as a file, swup can’t fetch pages, so after the same .5s it navigates normally
  let swup = null;
  const go = (url) => {
    if (swup) return swup.navigate(url);
    if (reduce) return (location.href = url);
    gsap.to(".ou-main", { opacity: 0, duration: 0.5, onComplete: () => (location.href = url) });
  };
  if (/^https?:$/.test(location.protocol) && window.Swup && window.SwupJsPlugin) {
    swup = new Swup({
      animateHistoryBrowsing: true,
      linkSelector: 'a[href]:not([href*="#"])',
      plugins: [new SwupJsPlugin({
        animations: [{
          from: "(.*)", to: "(.*)",
          out: (done) => gsap.timeline().to(".ou-main", { opacity: 0, duration: reduce ? 0 : 0.5 }).call(done),
          in: (done) => {
            runPage();
            const main = $(".ou-main"), tl = gsap.timeline();
            if (main.getAttribute("data-transition-status") === null) {
              tl.call(() => main.setAttribute("data-transition-status", "in"));
              tl.fromTo(main, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 1, delay: reduce ? 0 : 1 });
            }
            tl.call(done);
          },
        }],
      })],
    });
    swup.hooks.on("visit:start", stopPage);
  } else {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.defaultPrevented) return;
      const href = a.getAttribute("href");
      if (!/^[a-z-]+\.html(\?[^#]*)?$/.test(href)) return;
      e.preventDefault();
      go(href);
    });
  }

  // Original breakpointReload: crossing the phone↔PC boundary (767px) changes grid and rail values, so reload
  let lastW = innerWidth;
  addEventListener("resize", () => { const w = innerWidth; if ((w < 767) !== (lastW < 767)) location.reload(); lastW = w; });

  window.OU = { ...api, page: (name, init) => (pages[name] = init), go };
  // Original: when loading finishes, the body turns on in .5s
  const boot = () => {
    $$("[data-logo]").forEach((el) => (el.innerHTML = LOGO));
    runPage();
    gsap.to("body", { opacity: 1, duration: reduce ? 0 : 0.5 });
  };
  addEventListener("pageshow", (e) => e.persisted && gsap.set(".ou-main", { opacity: 1 }));
  document.readyState === "complete" ? setTimeout(boot) : addEventListener("load", boot);
})();
