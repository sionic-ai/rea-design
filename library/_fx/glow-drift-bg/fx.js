(() => {
  // With the same values as the original (two canvases · simplex): circles 150 · speed .1+0~1 · life 150+0~200 · radius 100+0~200 · noise step .0015 · hue angle ±60
  kfFx.register("glow-drift-bg", (el, { options, reduce }) => {
    const cv = document.createElement("canvas");
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    el.append(cv);
    const fixed = options.fixed !== "0";
    cv.style.opacity = String(+(options.opacity ?? 0.1));
    cv.style.filter = `blur(${+(options.blur ?? 25)}px)`;
    const css = getComputedStyle(el);
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = (v) => { probe.clearRect(0, 0, 1, 1); probe.fillStyle = v || "transparent"; probe.fillRect(0, 0, 1, 1); return [...probe.getImageData(0, 0, 1, 1).data.slice(0, 3)]; };
    const hue = ([r, g, b]) => {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      if (!d) return 0;
      return ((mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360;
    };
    const back = rgb(css.getPropertyValue("--kf-contrast-bg").trim());
    const base = hue(rgb(css.getPropertyValue("--kf-accent").trim()));
    const grid = new Map();
    const at = (x, y, z) => { const k = x + "," + y + "," + z; if (!grid.has(k)) grid.set(k, Math.random() * 2 - 1); return grid.get(k); };
    const sm = (t) => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;
    const noise = (x, y, z) => {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), u = sm(x - xi), v = sm(y - yi), w = sm(z - zi);
      const c = (dz) => lerp(lerp(at(xi, yi, zi + dz), at(xi + 1, yi, zi + dz), u), lerp(at(xi, yi + 1, zi + dz), at(xi + 1, yi + 1, zi + dz), u), v);
      return lerp(c(0), c(1), w);
    };
    const N = Math.max(1, Math.round(+(options.count ?? 150))), OFF = 0.0015;
    let drift = 0, raf = 0, last = 0;
    const size = () => {
      const r = fixed ? { width: innerWidth, height: innerHeight } : el.getBoundingClientRect();
      cv.width = Math.max(1, Math.round(r.width));
      cv.height = Math.max(1, Math.round(r.height));
    };
    size();
    const born = (c) => {
      c.x = Math.random() * cv.width; c.y = Math.random() * cv.height;
      const t = Math.random() * Math.PI * 2, sp = 0.1 + Math.random();
      c.vx = sp * Math.cos(t); c.vy = sp * Math.sin(t);
      c.life = 0; c.ttl = 150 + Math.random() * 200; c.r = 100 + Math.random() * 200;
      c.h = base + drift + noise(c.x * OFF, c.y * OFF, (220 + drift) * OFF) * 60;
      return c;
    };
    const circles = Array.from({ length: N }, () => born({}));
    const fade = (t, m) => { const hm = 0.5 * m; return Math.abs(((t + hm) % m) - hm) / hm; };
    const frame = () => {
      ctx.fillStyle = `rgb(${back.join(",")})`;
      ctx.fillRect(0, 0, cv.width, cv.height);
      drift++;
      for (const c of circles) {
        ctx.fillStyle = `hsla(${c.h % 360},60%,30%,${fade(c.life, c.ttl)})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        c.x += c.vx; c.y += c.vy; c.life++;
        if (c.x < -c.r || c.x > cv.width + c.r || c.y < -c.r || c.y > cv.height + c.r || c.life > c.ttl) born(c);
      }
    };
    // Like the original, one step per frame, but every 16ms so it does not speed up on screens faster than 60Hz
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!last) last = now;
      if (now - last < 16) return;
      last = now;
      frame();
    };
    frame();
    if (!reduce) raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(size);
    ro.observe(fixed ? document.documentElement : el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); cv.remove(); };
  });
})();
