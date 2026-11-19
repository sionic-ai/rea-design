(() => {
  // Per-cell direction (even rows: even cells up-right, odd cells down-right / odd rows: up-left, down-left) and the number of cells shifted per revolution
  const DIRS = { rt: [1, -1], rb: [1, 1], lt: [-1, -1], lb: [-1, 1] };
  const STEP = { rt: [2, -2], rb: [0, 2], lt: [0, -2], lb: [-2, 2] };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  kfFx.register("stamp-weave-grid", (el, { options, reduce, hover }) => {
    const num = (k, d) => (options[k] === undefined || options[k] === "" ? d : +options[k]);
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    const ctx = cv.getContext("2d");
    if (!ctx) { cv.remove(); return; }
    const faces = [...el.querySelectorAll('[data-fx-part="face"]')].map((n) => n.textContent.trim()).filter(Boolean);
    const FACES = faces.length ? faces : ["印"];
    const stepDur = num("step", 1.199), hopDur = num("hop", 1.999), spin = num("spin", 270);
    const flips = num("flips", 10), hold = num("hold", 0.599), hoverScale = num("hover-scale", 1.15);

    let W = 0, H = 0, A = 0, S = 0, cols = 0, rows = 0, ox = 0, oy = 0, dpr = 1, cells = [], col = {};
    const st = { px: 0, py: 0, hop: 0, flip: 1 };
    let picked = new Set();
    const scales = new Map();
    let over = -1;

    const readColors = () => {
      const cs = getComputedStyle(el);
      col = {
        red: cs.getPropertyValue("--kf-accent").trim() || cs.color,
        blue: cs.getPropertyValue("--kf-ink").trim() || cs.color,
        font: cs.getPropertyValue("--kf-font-sans").trim() || cs.fontFamily,
      };
    };

    const layout = () => {
      const r = el.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) return false;
      const sp = innerWidth < 768;
      cols = Math.max(2, Math.round(num(sp ? "mobile-cols" : "cols", sp ? 12 : 14) / 2) * 2);
      A = W * num(sp ? "mobile-area" : "area", sp ? 0.23 : 0.1);
      S = W * num(sp ? "mobile-stamp" : "stamp", sp ? 0.135 : 0.06);
      if (!A || !S) return false;
      rows = Math.floor(H / A) + 8;
      if (rows % 2) rows += 1;
      // Original stage position: one column to the left horizontally (1.35 columns on phones), 2.5 columns up vertically, with the remaining screen height split in half and centered
      if (sp) { let k = Math.floor(H / (2 * A)); k = (H - 2 * A * k) / 2; ox = -1.35 * A; oy = -2.5 * A + k; }
      else { let k = Math.floor(H / A); k = k % 2 === 0 ? (H - A * k) / 2 + A / 2 : (H - A * k) / 2; ox = -A; oy = -2.5 * A + k; }
      dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const n = cols * rows, mix = num("mix", 0.07), kinds = [];
      for (let i = 0; i < Math.floor(n * mix); i++) kinds.push("triangle", "square", "bars");
      while (kinds.length < n) kinds.push("circle");
      shuffle(kinds);
      cells = [];
      for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) {
        const dir = row % 2 === 0 ? (c % 2 === 0 ? "rt" : "rb") : (c % 2 === 0 ? "lt" : "lb");
        const i = cells.length;
        cells.push({ kind: kinds[i], dir, dx: DIRS[dir][0], dy: DIRS[dir][1], bx: c * A, by: row * A, turns: 0, face: FACES[i % FACES.length] });
      }
      readColors();
      return true;
    };

    // Hop: an arc rising half a cell (n) while travelling 2n along the cell axis (diagonal) — axis rotated 135° for rows walking down, 315° for rows walking up
    const hopAt = (c, p) => {
      if (!p) return [0, 0];
      const n = (Math.SQRT2 * A) / 2;
      const lx = 2 * (1 - p) * p * n + p * p * 2 * n, ly = 2 * (1 - p) * p * (-2 * n);
      const th = ((c.dy === 1 ? 135 : 315) * Math.PI) / 180;
      return [lx * Math.cos(th) - ly * Math.sin(th), lx * Math.sin(th) + ly * Math.cos(th)];
    };
    const posOf = (c) => {
      const [hx, hy] = hopAt(c, st.hop);
      return [ox + c.bx + A * st.px * c.dx + hx, oy + c.by + A * st.py * c.dy + hy];
    };

    const back = (c) => {
      const h = S / 2;
      ctx.fillStyle = c.kind === "circle" ? col.red : col.blue;
      ctx.beginPath();
      if (c.kind === "circle") ctx.arc(0, 0, h, 0, Math.PI * 2);
      else if (c.kind === "triangle") { ctx.moveTo(h, 0); ctx.lineTo(-h, h); ctx.lineTo(-h, -h); ctx.closePath(); }
      else if (c.kind === "square") ctx.rect(-h * 0.95, -h * 0.95, S * 0.95, S * 0.95);
      else [7, 31, 55].forEach((x) => ctx.rect((x / 80 - 0.5) * S, -h, (18 / 80) * S, S));
      ctx.fill();
    };
    const front = (c) => {
      ctx.strokeStyle = col.red; ctx.fillStyle = col.red;
      ctx.lineWidth = S * 0.026;
      ctx.beginPath(); ctx.arc(0, 0, S * 0.47, 0, Math.PI * 2); ctx.stroke();
      const ch = [...c.face].slice(0, 3), size = ch.length === 1 ? S * 0.5 : ch.length === 2 ? S * 0.34 : S * 0.25;
      ctx.font = `700 ${size}px ${col.font}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ch.forEach((t, i) => ctx.fillText(t, 0, (i - (ch.length - 1) / 2) * size * 1.02));
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const turn = st.hop * spin;
      cells.forEach((c, i) => {
        const [x, y] = posOf(c);
        if (x < -S || y < -S || x > W + S || y > H + S) return;
        const s = scales.get(i)?.s ?? 1;
        const f = picked.has(i) ? st.flip : 1;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(Math.abs(f) * s, s);
        if (f < 0) front(c);
        else { ctx.rotate(((c.turns * spin + turn) * Math.PI) / 180); back(c); }
        ctx.restore();
      });
    };

    // When a lap ends, fix the position, and stamps that left the board wrap to the invisible cell on the opposite side
    const commit = () => {
      const GW = cols * A, GH = rows * A;
      cells.forEach((c) => {
        const [sx, sy] = STEP[c.dir];
        c.bx += sx * A; c.by += sy * A; c.turns += 1;
        if (c.bx < -0.5 * A) c.bx += GW; else if (c.bx >= GW - 0.5 * A) c.bx -= GW;
        if (c.by < -0.5 * A) c.by += GH; else if (c.by >= GH - 0.5 * A) c.by -= GH;
      });
      st.px = 0; st.py = 0; st.hop = 0;
    };

    const pick = () => {
      const pool = shuffle(cells.map((_, i) => i).slice(cols, cols * Math.max(1, rows - 5) + 1));
      picked = new Set(pool.slice(0, flips));
    };
    const addFlips = (tl) => {
      if (flips <= 0) return;
      tl.fromTo(st, { flip: 1 }, { flip: -1, duration: 0.1, ease: "power1.out", immediateRender: false, onStart: pick }, "-=0.199");
      tl.fromTo(st, { flip: -1 }, { flip: 1, duration: 0.1, ease: "power1.out", immediateRender: false, onComplete: () => picked.clear() }, `+=${hold}`);
    };

    let tl = null;
    const start = () => {
      tl?.kill();
      if (reduce) return;
      tl = gsap.timeline({ repeat: -1 });
      tl.fromTo(st, { px: 0 }, { px: 1, duration: stepDur, ease: "power3.inOut", immediateRender: false });
      addFlips(tl);
      tl.fromTo(st, { py: 0 }, { py: 1, duration: stepDur, ease: "power3.inOut", immediateRender: false });
      addFlips(tl);
      tl.fromTo(st, { hop: 0 }, { hop: 1, duration: hopDur, ease: "power4.inOut", immediateRender: false, onComplete: commit });
      addFlips(tl);
    };

    const hit = (e) => {
      const r = el.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      let best = -1, bd = (S / 2) ** 2;
      cells.forEach((c, i) => { const [x, y] = posOf(c), d = (x - mx) ** 2 + (y - my) ** 2; if (d <= bd) { bd = d; best = i; } });
      return best;
    };
    const scaleTo = (i, to, dur, ease) => {
      if (i < 0) return;
      const o = scales.get(i) || { s: 1 };
      scales.set(i, o);
      gsap.to(o, { s: to, duration: dur, ease, overwrite: true, onComplete: () => to === 1 && scales.delete(i) });
    };
    const onMove = (e) => {
      const i = hit(e);
      if (i === over) return;
      if (!reduce) { scaleTo(over, 1, 0.15, "power2.out"); scaleTo(i, hoverScale, 0.2, "back.out(2)"); }
      over = i;
      el.classList.toggle("is-over", i >= 0);
    };
    const onLeave = () => { if (!reduce) scaleTo(over, 1, 0.15, "power2.out"); over = -1; el.classList.remove("is-over"); };
    const onDown = (e) => {
      const i = hit(e);
      if (i < 0) return;
      const r = el.getBoundingClientRect(), [x, y] = posOf(cells[i]);
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true, detail: { kind: cells[i].kind, x: r.left + x, y: r.top + y, index: i } }));
    };
    if (hover) { el.addEventListener("pointermove", onMove); el.addEventListener("pointerleave", onLeave); }
    el.addEventListener("pointerdown", onDown);

    let seen = true;
    const io = new IntersectionObserver(([en]) => (seen = en.isIntersecting));
    io.observe(el);
    const tick = () => seen && cells.length && draw();
    const ro = new ResizeObserver(() => { if (layout()) { draw(); start(); } });
    ro.observe(el);
    if (layout()) { draw(); start(); }
    gsap.ticker.add(tick);

    return () => {
      tl?.kill();
      gsap.ticker.remove(tick);
      io.disconnect(); ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.classList.remove("is-over");
      cv.remove();
    };
  });
})();
