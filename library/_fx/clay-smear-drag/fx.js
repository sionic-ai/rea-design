(() => {
  // A clay mark piece: an oval dark in the center with soft bleeding edges + finger-grain streaks (destination-out lines) + soil specks, slightly faded
  const rand = (a, b) => a + Math.random() * (b - a);
  function stamp(rx, ry, color, dpr = 1, kind = "lines") {
    const w = Math.ceil(2 * rx + 8), h = Math.ceil(2 * ry + 8), cx = w / 2, cy = h / 2;
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const g = cv.getContext("2d");
    const groove = Math.max(2 * dpr, Math.min(rx, ry) / (kind === "loop" ? 10 : 5));
    g.fillStyle = color; g.globalAlpha = .62;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill();
    for (let i = 0; i < 9; i++) {
      const x = cx + rand(-.7, .7) * rx, y = cy + rand(-.7, .7) * ry, r = rand(.25, .65) * Math.min(rx, ry) * 1.4;
      g.globalAlpha = rand(.2, .45);
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    g.lineCap = "round";
    g.globalCompositeOperation = "destination-out";
    const ph = rand(0, 6), n = kind === "loop" ? Math.ceil(1.4 * Math.max(rx, ry) / groove) : Math.ceil(2 * ry / groove);
    for (let k = 1; k <= n; k++) {
      g.lineWidth = groove * rand(.3, .6);
      g.strokeStyle = `rgba(0,0,0,${rand(.35, .7)})`; // Not skin: uses only the strength of the eraser paint (destination-out)
      g.beginPath();
      let on = false;
      if (kind === "loop") {
        const rr = k * groove;
        for (let a = 0; a <= 6.3; a += .05) {
          if (Math.random() < .07) { on = false; continue; }
          const s = 1 + .05 * Math.sin(3 * a + ph + .4 * k), x = cx + Math.cos(a) * rr * s * (rx / ry), y = cy + Math.sin(a) * rr * s;
          on ? g.lineTo(x, y) : (g.moveTo(x, y), on = true);
        }
      } else {
        const y0 = cy - ry + k * groove;
        for (let x = cx - rx; x <= cx + rx; x += 3 * dpr) {
          if (Math.random() < .05) { on = false; continue; }
          const y = y0 + Math.sin(x / (.35 * rx) + ph + k) * groove * .35;
          on ? g.lineTo(x, y) : (g.moveTo(x, y), on = true);
        }
      }
      g.stroke();
    }
    g.globalCompositeOperation = "source-over";
    g.fillStyle = color;
    for (let i = 0, m = rx * ry / (6 * dpr * dpr); i < m; i++) {
      g.globalAlpha = rand(.08, .4);
      g.fillRect(cx + rand(-rx, rx), cy + rand(-ry, ry), rand(.5, 1.5) * dpr, rand(.5, 1.5) * dpr);
    }
    g.globalAlpha = 1;
    // Cut out with a round gradient so the edges fade into the paper
    g.globalCompositeOperation = "destination-in";
    g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
    const m = g.createRadialGradient(rand(-.1, .1) * rx, rand(-.1, .1) * rx, 0, 0, 0, rx);
    m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(rand(.68, .82), "rgba(0,0,0,.95)"); m.addColorStop(1, "rgba(0,0,0,0)"); // Not a skin: strength of the cut-out (destination-in) mask
    g.fillStyle = m; g.fillRect(-rx, -rx, 2 * rx, 2 * rx); g.restore();
    g.globalCompositeOperation = "source-over";
    return cv;
  }
  window.kfClay = window.kfClay || { stamp };

  kfFx.register("clay-smear-drag", (el, { options, reduce }) => {
    if (reduce) return;
    const hold = +(options.hold ?? 3.5) * 1000, fade = +(options.fade ?? 5.5) * 1000, reach = +(options.reach ?? 700), blur = +(options.blur ?? 4);
    const cv = document.createElement("canvas");
    cv.className = "fx-clay-canvas";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    const g = cv.getContext("2d");
    let dpr = 1, raf = 0, prints = [], cur = null;
    const color = () => getComputedStyle(el).getPropertyValue("--kf-accent").trim() || "currentColor";
    const unit = () => document.documentElement.clientWidth / 1400 * dpr;
    function draw() {
      raf = 0;
      const now = performance.now(), sx = scrollX * dpr, sy = scrollY * dpr;
      g.clearRect(0, 0, cv.width, cv.height);
      prints = prints.filter((p) => p === cur?.p || now - p.born < hold + fade);
      for (const p of prints) {
        const age = now - p.born, k = Math.min(1, Math.max(0, (age - hold) / fade)), e = k * k * (3 - 2 * k);
        const a = Math.min(1, age / 120) * (1 - e), pop = 1 + .04 * Math.max(0, 1 - age / 160);
        g.filter = e > .01 ? `blur(${blur * e * dpr}px)` : "none";
        for (const s of p.pieces) {
          g.globalAlpha = a * s.a;
          g.save(); g.translate(p.x + s.dx - sx, p.y + s.dy - sy); g.rotate(s.rot); g.scale(pop, pop);
          g.drawImage(s.img, -s.img.width / 2, -s.img.height / 2); g.restore();
        }
      }
      g.globalAlpha = 1; g.filter = "none";
      if (prints.length) raf = requestAnimationFrame(draw);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    function size() { dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; kick(); }
    const down = (e) => {
      if (e.button || e.target.closest("a, button, input, textarea, select, [data-fx-part='skip']")) return;
      const x = e.pageX * dpr, y = e.pageY * dpr, u = unit();
      const p = { x, y, born: performance.now(), pieces: [] };
      prints.push(p);
      cur = { p, x, y, run: 0, w: 14 * u * rand(.9, 1.1) };
      p.pieces.push({ img: stamp(cur.w * 1.1, cur.w, color(), dpr, "loop"), dx: 0, dy: 0, rot: rand(0, 6.28), a: 1 });
      kick();
    };
    const move = (e) => {
      if (!cur || !(e.buttons & 1)) return;
      const x = e.pageX * dpr, y = e.pageY * dpr, dx = x - cur.x, dy = y - cur.y, d = Math.hypot(dx, dy), u = unit();
      if (d < 10 * u) return;
      cur.run += d;
      const left = Math.max(0, 1 - cur.run / (reach * u));
      if (left <= 0) return;
      const p = cur.p;
      p.pieces.push({ img: stamp(d / 2 + 14 * u, cur.w * (.75 + .25 * left), color(), dpr), dx: (cur.x + x) / 2 - p.x, dy: (cur.y + y) / 2 - p.y, rot: Math.atan2(dy, dx), a: .25 + .75 * left });
      p.born = performance.now();
      cur.x = x; cur.y = y;
      kick();
    };
    const up = () => { if (cur) { cur.p.born = performance.now(); cur = null; } };
    const noSelect = (e) => { if (!e.target.closest("a, button, input, textarea, select")) e.preventDefault(); };
    size();
    addEventListener("resize", size);
    el.addEventListener("pointerdown", down);
    el.addEventListener("mousedown", noSelect);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    addEventListener("blur", up);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("mousedown", noSelect);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      removeEventListener("blur", up);
      cv.remove();
    };
  });
})();
