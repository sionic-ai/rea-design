// Home page — hero dot mesh (canvas), five fixed dot illustrations (the original uses a video per cell — redrawn on canvas in the same place with the same playback behaviour), progress bar, solution photo swap
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (k) => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  const rand = (a, b) => a + Math.random() * (b - a);
  const fit = (cv) => {
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(1, r.width * d);
    cv.height = Math.max(1, r.height * d);
    const ctx = cv.getContext("2d");
    ctx.setTransform(d, 0, 0, d, 0, 0);
    return { ctx, w: r.width, h: r.height };
  };

  // ───── Hero: square dots scattered over the right half and a few short connecting lines (still image) ─────
  function heroNet() {
    const cv = document.querySelector("[data-net]");
    if (!cv) return;
    const draw = () => {
      const { ctx, w, h } = fit(cv);
      const ink = css("--kf-accent");
      ctx.clearRect(0, 0, w, h);
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const pts = [];
      for (let i = 0; i < 260; i++) {
        const x = w * (0.42 + Math.pow(rnd(), 0.7) * 0.58), y = h * rnd();
        const fade = Math.min(1, (x / w - 0.4) * 3);
        pts.push([x, y, rnd() * 2.6 + 1, fade]);
      }
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      for (const [x, y, s, f] of pts) { ctx.globalAlpha = 0.35 + f * 0.6; ctx.fillRect(x, y, s, s); }
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const [x, y] = pts[(i * 17) % pts.length];
        ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rnd() * 50 - 10, y + rnd() * 40 - 20); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    draw();
    addEventListener("resize", draw);
  }

  // Five-cell dot art — each time a cell turns on it plays from the start (0s), and stops when it turns off (original video.currentTime = 0, play/pause) ─────
  const SCENES = {
    // Scattered dots drift freely within the top and bottom bands
    scatter: (w, h) => Array.from({ length: 420 }, () => { const top = Math.random() < 0.5; return { x: rand(0, w), y: top ? rand(0, h * 0.28) : rand(h * 0.7, h), s: rand(2, 7), vx: rand(-8, 8), vy: rand(-4, 4), ph: rand(0, 6) }; }),
    // A dot flows to the right along three wave bands
    network: (w, h) => Array.from({ length: 520 }, () => ({ band: Math.floor(rand(0, 3)), x: rand(0, w), off: rand(-26, 26), s: rand(2, 6), v: rand(18, 40), ph: rand(0, 6) })),
    // A cluster of dots gathers up and down and breathes around the name tag
    labels: (w, h) => Array.from({ length: 460 }, () => { const top = Math.random() < 0.45; const cx = rand(0, w); return { x: cx, y: top ? rand(0, h * 0.18) : rand(h * 0.8, h), s: rand(2, 6), ph: rand(0, 6), a: rand(2, 6) }; }),
    // Dots flow toward the center along five light rays from all sides
    rays: (w, h) => Array.from({ length: 560 }, () => { const k = Math.floor(rand(0, 6)); return { k, t: rand(0, 1), off: rand(-14, 14), s: rand(1.5, 5), v: rand(0.05, 0.12) }; }),
    // Dots run along lines over a faint grid (center left empty)
    grid: (w, h) => Array.from({ length: 240 }, () => { const hz = Math.random() < 0.5; return { hz, line: Math.floor(rand(0, 40)), p: rand(0, 1), v: rand(0.02, 0.08) * (Math.random() < 0.5 ? -1 : 1), s: rand(2, 6) }; }),
  };
  function drawScene(kind, ctx, w, h, P, t) {
    const ink = css("--kf-accent"), line = css("--kf-line");
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ink;
    if (kind === "scatter") {
      for (const p of P) { ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * 1.3 + p.ph); ctx.fillRect(p.x + p.vx * t, p.y + p.vy * t + Math.sin(t + p.ph) * 4, p.s, p.s); }
    } else if (kind === "network") {
      for (const p of P) {
        const x = ((p.x + p.v * t) % (w + 20)) - 10;
        const base = [0.16, 0.5, 0.86][p.band] * h;
        const y = base + Math.sin(x / w * Math.PI * 2 + p.band * 1.7 + t * 0.4) * h * 0.07 + p.off;
        if (p.band === 1 && Math.abs(x - w / 2) < w * 0.33) continue;
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + p.ph);
        ctx.fillRect(x, y, p.s, p.s);
      }
    } else if (kind === "labels") {
      for (const p of P) { ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.9 + p.ph)); ctx.fillRect(p.x + Math.sin(t * 0.7 + p.ph) * p.a, p.y + Math.cos(t * 0.6 + p.ph) * p.a, p.s, p.s); }
    } else if (kind === "rays") {
      const cx = w / 2, cy = h / 2;
      const ends = [[0.08, 0.02], [0.45, 0.0], [0.82, 0.05], [1.02, 0.5], [0.85, 1.0], [0.1, 0.96]];
      for (const p of P) {
        const [ex, ey] = ends[p.k];
        const q = (p.t + t * p.v) % 1;
        const sx = ex * w, sy = ey * h;
        const x = sx + (cx - sx) * q * 0.62, y = sy + (cy - sy) * q * 0.62;
        const nx = -(cy - sy), ny = cx - sx, nl = Math.hypot(nx, ny) || 1;
        ctx.globalAlpha = Math.min(1, (1 - q) * 1.6);
        ctx.fillRect(x + (nx / nl) * p.off, y + (ny / nl) * p.off, p.s, p.s);
      }
    } else if (kind === "grid") {
      const g = 64;
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += g) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
      for (let y = 0; y < h; y += g) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
      ctx.stroke();
      for (const p of P) {
        const q = (((p.p + t * p.v) % 1) + 1) % 1;
        const x = p.hz ? q * w : (p.line % Math.ceil(w / g)) * g;
        const y = p.hz ? (p.line % Math.ceil(h / g)) * g : q * h;
        if (Math.abs(x - w / 2) < w * 0.3 && Math.abs(y - h / 2) < h * 0.3) continue;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x - p.s / 2, y - p.s / 2, p.s, p.s);
      }
    }
    ctx.globalAlpha = 1;
  }

  function steps() {
    const wrap = document.querySelector("[data-steps]");
    if (!wrap) return;
    const items = [...wrap.querySelectorAll("[data-step]")];
    const num = wrap.querySelector("[data-step-num]"), fill = wrap.querySelector("[data-step-fill]");
    const players = items.map((el) => {
      const cv = el.querySelector("canvas"), kind = el.dataset.step;
      let P = [], dims, start = 0, raf = 0, on = false;
      const size = () => { dims = fit(cv); P = SCENES[kind](dims.w, dims.h); };
      const frame = (now) => { if (!on) return; drawScene(kind, dims.ctx, dims.w, dims.h, P, (now - start) / 1000); raf = requestAnimationFrame(frame); };
      return {
        play() { size(); on = true; start = performance.now(); cancelAnimationFrame(raf); if (reduce) drawScene(kind, dims.ctx, dims.w, dims.h, P, 0); else raf = requestAnimationFrame(frame); },
        stop() { on = false; cancelAnimationFrame(raf); },
        resize() { if (on) { size(); if (reduce) drawScene(kind, dims.ctx, dims.w, dims.h, P, 0); } },
      };
    });
    // Original: when a cell turns on, that cell’s title words go 0 → 1 (.4s power1.out, spread across .8s total)
    const words = items.map((el) => {
      const h = el.querySelector("[data-step-title]");
      return h ? SplitText.create(h, { type: "lines,words", linesClass: "zh-ln", wordsClass: "zh-word" }).words : [];
    });
    let cur = -1;
    function go(n) {
      items.forEach((el, i) => {
        if (i === n) {
          el.classList.add("is-active");
          players[i].play();
          if (words[i].length && !reduce) { gsap.killTweensOf(words[i]); gsap.fromTo(words[i], { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out", stagger: { amount: 0.8 } }); }
        } else if (el.classList.contains("is-active")) {
          el.classList.remove("is-active");
          players[i].stop();
        }
      });
      cur = n;
    }
    function onScroll() {
      const r = wrap.getBoundingClientRect();
      const p = -r.top / (r.height - innerHeight);
      const k = Math.floor(Math.max(0, Math.min(0.999, p)) * items.length);
      if (k !== cur) go(k);
      const prog = Math.max(0, Math.min(1, p));
      num.textContent = "0" + Math.max(1, Math.ceil(prog * items.length));
      fill.style.width = prog * 100 + "%";
    }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", () => players[cur]?.resize());
    onScroll();
  }

  // Solution: swap in the photo of the open row
  function solImages() {
    const g = document.querySelector('[data-slot="solutions-accordion"] [data-acc-group]');
    const imgs = [...document.querySelectorAll("[data-sol-imgs] .zh-ph")];
    g?.addEventListener("zh:acc", (e) => { const i = e.detail.index; if (i < 0) return; imgs.forEach((x, k) => x.classList.toggle("is-on", k === i)); });
  }

  heroNet();
  solImages();
  addEventListener("zh:ready", steps, { once: true });
})();
