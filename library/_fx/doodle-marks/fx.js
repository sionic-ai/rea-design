(() => {
  // Hand-drawn lines over photos — for each spot, one of three accent lines, two cheek wrinkles, or a head outline is baked as Lottie (svg). The board keeps the attached element’s size,
  // At 30fps·150 frames (5s), each line draws in its own window (.55,.06 → .36,1), pauses, then erases from the front
  const WIN = [[0, 30, 60, 90], [18, 39, 57, 78], [11, 26, 61, 75], [12, 42, 48, 84], [0, 24, 66, 90], [19, 22, 68, 71], [1, 22, 71, 90], [24, 36, 50, 64], [24, 36, 67, 81]];
  const EASE = { o: { x: 0.55, y: 0.06 }, i: { x: 0.36, y: 1 } };

  const rgbOf = (el, name) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name})`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255, 1];
  };
  const shape = (pts) => {
    const t = pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6];
    });
    return { a: 0, k: { c: false, v: pts, o: t, i: t.map(([x, y]) => [-x, -y]) } };
  };
  const strokes = (x, y, kind, dir, k, rnd) => {
    const rad = (d) => (d * Math.PI) / 180;
    if (kind === "effect") {
      return [-28, 0, 28].map((d) => {
        const a = rad(dir + d + (rnd() - 0.5) * 8), r0 = k * 0.03, r1 = k * (0.075 + rnd() * 0.02), m = (r0 + r1) / 2;
        return [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a + 0.06) * m, y + Math.sin(a + 0.06) * m], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]];
      });
    }
    if (kind === "wrinkle") {
      return [0, 1].map((n) => {
        const ox = x + n * k * 0.035, s = k * 0.03;
        return [[ox - s * 0.3, y - s], [ox + s * 0.35, y], [ox - s * 0.3, y + s]];
      });
    }
    const rx = k * 0.1, ry = k * 0.12, pts = [];
    for (let d = 200; d <= 500; d += 25) {
      const j = 1 + (rnd() - 0.5) * 0.08;
      pts.push([x + Math.cos(rad(d)) * rx * j, y + Math.sin(rad(d)) * ry * j]);
    }
    return [pts];
  };

  kfFx.register("doodle-marks", (el, { options, reduce }) => {
    const spots = [...el.querySelectorAll('[data-fx-part="spot"]')];
    if (!window.lottie || !spots.length) return;
    const loop = options.loop !== "false";
    const width = +(options.width || 2);
    let anim = null, st = null, aspect = 0;
    const build = () => {
      const w = Math.round(el.clientWidth), h = Math.round(el.clientHeight);
      if (!w || !h) return;
      aspect = w / h;
      const k = Math.min(w, h);
      let seed = spots.length * 97 + w;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const layers = [];
      spots.forEach((s, n) => {
        const [t0, t1, t2, t3] = WIN[n % WIN.length];
        const color = rgbOf(el, s.dataset.key === "surface" ? "--kf-surface" : "--kf-accent");
        const x = (parseFloat(s.style.left) / 100 || 0.5) * w, y = (parseFloat(s.style.top) / 100 || 0.5) * h;
        strokes(x, y, s.dataset.kind || "effect", +(s.dataset.dir ?? -60), k, rnd).forEach((pts) => {
          layers.push({
            ddd: 0, ind: layers.length + 1, ty: 4, nm: "mark", sr: 1, ao: 0, ip: 0, op: 150, st: 0, bm: 0,
            ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [0, 0, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
            shapes: [{ ty: "gr", it: [
              { ty: "sh", ks: shape(pts) },
              { ty: "st", c: { a: 0, k: color }, o: { a: 0, k: 100 }, w: { a: 0, k: width }, lc: 2, lj: 2, ml: 4 },
              { ty: "tm", m: 1, o: { a: 0, k: 0 }, e: { a: 1, k: [{ t: t0, s: [0], ...EASE }, { t: t1, s: [100] }] }, s: { a: 1, k: [{ t: t2, s: [0], ...EASE }, { t: t3, s: [100] }] } },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
            ] }],
          });
        });
      });
      const playing = anim && !anim.isPaused;
      anim?.destroy();
      anim = lottie.loadAnimation({ container: el, renderer: "svg", loop, autoplay: false, animationData: { v: "5.12.0", fr: 30, ip: 0, op: 150, w, h, ddd: 0, assets: [], layers } });
      if (reduce) anim.goToAndStop(45, true);
      else if (playing) anim.play();
    };
    const play = () => {
      if (!anim || reduce) return;
      anim.goToAndStop(0, true);
      anim.play();
    };
    build();
    // If the photo ratio changes (late-loading image, window resize), rebake the board
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w && h && Math.abs(w / h - aspect) > 0.02) build();
    });
    ro.observe(el);
    if (options.when === "event") el.addEventListener("fx:play", play);
    else if (!reduce && window.ScrollTrigger) st = ScrollTrigger.create({ trigger: el, start: options.start || "top bottom-=20%", once: true, onEnter: play });
    return () => {
      ro.disconnect();
      st?.kill();
      el.removeEventListener("fx:play", play);
      anim?.destroy();
    };
  });
})();
