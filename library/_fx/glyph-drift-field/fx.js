(() => {
  // Over a tilted board, a swarm of letters flows upward, each letter cycling a few sheets before stopping. It speeds up with the scroll amount and slows by a decay factor each tick, and
  // After hold seconds the panel disappears over fade seconds (PixiJS 6). The text panel is drawn then in the skin font — first half in color a, second half in color b.
  const colorOf = (el, prop) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;color:var(${prop})`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };

  kfFx.register("glyph-drift-field", (el, { options, reduce, scroller }) => {
    if (!window.PIXI || !window.gsap || reduce) return;
    const glyphs = [...(options.glyphs || "ACGT")].filter((c) => c.trim());
    if (!glyphs.length) return;
    const angle = +(options.angle ?? -10);
    const cellW = +options.w || 11, cellH = +options.h || 22;
    const ttl = +options.ttl || 50;
    const each = +(options.each ?? 50);
    const flip = +(options.flip ?? 0.2);
    const decay = +(options.decay ?? 0.95);
    const boost = +options.boost || 100;
    const hold = options.hold === "off" ? null : +(options.hold ?? 5.5);
    const fadeDur = +(options.fade ?? 2);
    const gap = +options.rows || 2;
    const wide = matchMedia("(min-width: 960px)");
    const span = () => (wide.matches ? [+options.min || 20, +options.max || 50] : [+options["min-sp"] || 10, +options["max-sp"] || 30]);

    const cs = getComputedStyle(el);
    if (cs.position === "static") el.style.position = "relative";
    PIXI.utils.skipHello?.();
    let W = el.clientWidth || 1, H = el.clientHeight || 1;
    const app = new PIXI.Application({ width: W, height: H, backgroundAlpha: 0 });
    app.view.setAttribute("aria-hidden", "true");
    app.view.style.display = "block";
    el.append(app.view);
    app.stage.rotation = (Math.PI / 180) * angle;
    let cntW = Math.ceil(W / cellW), cntH = Math.ceil(H / cellH);

    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const S = { speed: 1, groups: [], next: 0, framesA: [], framesB: [], dead: false };

    // Letter board — one letter per 64px cell, front row in color a, back row in color b
    const sheet = document.createElement("canvas");
    const n = glyphs.length;
    sheet.width = 64 * n * 2; sheet.height = 64;
    const fam = getComputedStyle(el).getPropertyValue("--fx-glyph-font").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display").trim() || "sans-serif";
    const paint = () => {
      const ctx = sheet.getContext("2d");
      ctx.clearRect(0, 0, sheet.width, 64);
      ctx.font = `300 74px ${fam}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      const cols = [colorOf(el, "--fx-glyph-a"), colorOf(el, "--fx-glyph-b")];
      for (let k = 0; k < n * 2; k++) { ctx.fillStyle = cols[k < n ? 0 : 1]; ctx.fillText(glyphs[k % n], 64 * k + 32, 61); }
    };

    const restart = (box) => box.children.forEach((s, k) => {
      s.visible = false; s.ttl = ttl; s.stop();
      later(() => { if (!s.destroyed) { s.visible = true; s.gotoAndPlay(Math.floor(Math.random() * s.totalFrames)); } }, each * k);
    });
    const makeGroup = (i, j) => {
      const box = new PIXI.Container();
      box.x = cellW * i; box.y = cellH * j; box.clock = 0;
      app.stage.addChild(box);
      const [lo, hi] = span();
      const num = lo + Math.floor(Math.random() * (hi - lo));
      for (let l = 0; l < num; l++) {
        const s = new PIXI.AnimatedSprite(Math.random() > 0.5 ? S.framesA : S.framesB);
        s.animationSpeed = flip;
        s.x = cellW * l;
        s.width = s.height = cellH * 0.9;
        s.visible = false;
        s.ttl = ttl;
        box.addChild(s);
      }
      return box;
    };
    const fill = () => {
      while (S.next < cntH) { S.groups.push(makeGroup(Math.floor(-cntW / 4 + Math.random() * cntW * 5 / 4), S.next)); S.next += gap; }
      S.groups.forEach((g, k) => later(() => !g.destroyed && restart(g), each * k));
    };
    const clear = () => {
      timers.forEach(clearTimeout); timers.clear();
      S.groups.forEach((g) => g.destroy({ children: true }));
      S.groups.length = 0; S.next = 0;
    };
    const tick = () => {
      for (const box of S.groups) {
        box.y -= S.speed;
        if (box.y < -cellH * 2) {
          box.x = cellW * Math.floor(-cntW / 4 + Math.random() * cntW * 5 / 4);
          box.y = cellH * cntH;
          restart(box);
        }
        if (S.speed > 1 && box.clock % 10 === 0 && Math.random() < 0.1) {
          const len = box.children.length;
          box.children.forEach((s) => later(() => { if (!s.destroyed) { s.ttl = ttl; s.gotoAndPlay(Math.floor(Math.random() * s.totalFrames)); } }, Math.floor(each * len * Math.random())));
        }
        for (const s of box.children) { if (s.ttl <= 0) s.stop(); if (s.visible) s.ttl--; }
        box.clock++;
      }
      S.speed = Math.max(1, S.speed * decay);
    };

    let fadeTween = null, holdTimer = 0;
    const ready = document.fonts ? document.fonts.load(`300 74px ${fam}`, glyphs.join("")).catch(() => {}) : Promise.resolve();
    ready.then(() => {
      if (S.dead) return;
      paint();
      const base = PIXI.BaseTexture.from(sheet);
      for (let k = 0; k < n * 2; k++) (k < n ? S.framesA : S.framesB).push(new PIXI.Texture(base, new PIXI.Rectangle(64 * k, 0, 64, 64)));
      fill();
      app.ticker.add(tick);
      if (hold !== null) holdTimer = setTimeout(() => { fadeTween = gsap.to(el, { opacity: 0, display: "none", duration: fadeDur, onComplete: () => app.ticker.stop() }); }, hold * 1000);
    });

    const src = scroller || window;
    let lastY = scroller ? scroller.scrollTop : scrollY;
    const onScroll = () => {
      const y = scroller ? scroller.scrollTop : scrollY;
      S.speed += Math.abs(y - lastY) / boost;
      lastY = y;
    };
    src.addEventListener("scroll", onScroll, { passive: true });
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      if (w === W) return;
      W = w; H = h; cntW = Math.ceil(W / cellW); cntH = Math.ceil(H / cellH);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (S.dead) return; app.renderer.resize(W, H); clear(); fill(); }, 500);
    });
    ro.observe(el);

    return () => {
      S.dead = true;
      clearTimeout(holdTimer); clearTimeout(resizeTimer);
      timers.forEach(clearTimeout); timers.clear();
      fadeTween?.kill();
      ro.disconnect();
      src.removeEventListener("scroll", onScroll);
      app.destroy(true, { children: true, texture: true, baseTexture: true });
      gsap.set(el, { clearProps: "opacity,display" });
    };
  });
})();
