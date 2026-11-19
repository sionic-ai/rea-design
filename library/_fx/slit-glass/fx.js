// Using the same pixi DisplacementFilter as the original, the photo warps as if seen through vertically grooved glass — desktop uses cursor distance, touch uses the on-screen position as strength
(() => {
  // Displacement map: a horizontal ramp where red fills 0→255 per row (push distance). It’s a number, not a color, so pixel values are used directly
  const maps = {};
  const slitMap = (n) => {
    if (maps[n]) return maps[n];
    const W = n * 64, cv = document.createElement("canvas");
    cv.width = W; cv.height = 4;
    const g = cv.getContext("2d"), img = g.createImageData(W, 4);
    for (let i = 0; i < W * 4; i++) {
      img.data[i * 4] = Math.round((((i % W) % 64) / 63) * 255); img.data[i * 4 + 1] = 128; img.data[i * 4 + 2] = 128; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return (maps[n] = cv);
  };
  const ready = (src) => new Promise((ok) => {
    if (src instanceof HTMLVideoElement) return src.readyState >= 2 ? ok() : src.addEventListener("loadeddata", ok, { once: true });
    if (src instanceof HTMLImageElement) return src.complete && src.naturalWidth ? ok() : src.addEventListener("load", ok, { once: true });
    ok();
  });

  kfFx.register("slit-glass", (el, { options, reduce, hover }) => {
    const src = el.querySelector('[data-fx-part="source"]');
    if (!src || reduce || !window.PIXI) return;
    const amount = +(options.amount ?? 60), touch = +(options.touch ?? 130), follow = +(options.follow ?? 0.25);
    const band = +(options.band ?? 0.4), slits = Math.max(1, Math.round(+options.slits || 8)), stretch = +(options.stretch ?? 0.05);
    const ac = new AbortController(), signal = ac.signal;
    let app, io, ro, alive = true;
    const mouse = { x: -1e5, y: -1e5 };
    (async () => {
      await ready(src);
      if (!alive) return;
      app = new PIXI.Application();
      let rect = el.getBoundingClientRect();
      await app.init({ width: Math.max(1, rect.width), height: Math.max(1, rect.height), autoStart: false, resolution: 1, antialias: false, backgroundAlpha: 0 });
      if (!alive) { app.destroy(true); return; }
      app.stage.eventMode = "none";
      app.canvas.className = "fx-slit-canvas";
      app.canvas.setAttribute("aria-hidden", "true");
      el.append(app.canvas);
      el.classList.add("is-slit-on");
      const box = new PIXI.Container();
      app.stage.addChild(box);
      const sprite = new PIXI.Sprite(PIXI.Texture.from(src));
      sprite.anchor.set(0.5);
      box.addChild(sprite);
      const map = new PIXI.Sprite(PIXI.Texture.from(slitMap(slits)));
      map.texture.source.addressMode = "repeat";
      const filter = new PIXI.DisplacementFilter({ sprite: map, scale: { x: 100, y: 0.5 } });
      app.stage.addChild(map);
      sprite.filters = [filter];
      // Like the original, fill the cell fully with the photo plate (the ratio is matched on the photo slot side)
      const fit = () => {
        rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        app.renderer.resize(rect.width, rect.height);
        sprite.scale.set(1);
        sprite.x = sprite.texture.width / 2; sprite.y = sprite.texture.height / 2;
        box.scale.set((rect.width + 1) / sprite.texture.width, (rect.height + 1) / sprite.texture.height);
        map.height = rect.height;
      };
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(el);
      const m = { v: 0 };
      const to = gsap.quickTo(m, "v", { duration: follow, ease: "power1.out" });
      if (hover) addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { signal, passive: true });
      app.ticker.add((tk) => {
        rect = el.getBoundingClientRect();
        const W = rect.width;
        if (!hover) {
          const per = Math.min(1, Math.max(0, (rect.height + rect.top) / (innerHeight + rect.height)));
          map.width = W * 0.5 + Math.abs(Math.min(1, (per - 0.5) * 10)) * 10;
          map.x = W * 0.5;
          filter.scale.x = touch * (per - 0.5);
          return;
        }
        const inX = mouse.x >= rect.left && mouse.x <= rect.right, inY = mouse.y >= rect.top && mouse.y <= rect.bottom;
        to(inX && inY ? 0 : inX ? -0.5 : (mouse.x - (rect.left + W / 2)) / W);
        filter.scale.x = m.v * amount;
        sprite.scale.x = Math.abs(m.v * stretch) + 1;
        map.x += m.v * 0.1;
        map.width = W * band + Math.sin(tk.lastTime * 3e-4) * W * 0.01;
      });
      io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? app.ticker.start() : app.ticker.stop())), { rootMargin: "20% 0% 20% 0%", threshold: 0 });
      io.observe(el);
      app.render();
    })();
    return () => {
      alive = false;
      ac.abort(); io?.disconnect(); ro?.disconnect();
      if (app?.renderer) app.destroy({ removeView: true }, { children: true });
      el.classList.remove("is-slit-on");
    };
  });
})();
