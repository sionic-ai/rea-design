// Home city — PIXI (legacy 5.2.0, same version as the original). The 2560×1744 map is fit to cover the screen and runs at 30fps.
// Values (position · speed · period) match the original scene: four cars (path · stop · respawn), two boats (5px bobbing), water glint (20px circle), three kids (hopping), worker (1.1px nodding), lights (blinking), signal (cycling 3 panels).
(() => {
  const MAP = { width: 2560, height: 1744 };
  const CAR = { x: 53, y: 34 };
  const BASE = "media/town/";
  let app = null, scene = null, view = null, started = false, onResize = null;

  const sinT = (t, period) => Math.sin((2 * Math.PI / period) * t);

  // A car following a path — when it gets near the next point (5px) it moves on to the next point, at a stop point it slows 200px before and halts for 1s, and at the end it restarts from the beginning after easing off
  class Car {
    constructor(sprites, start, points, maxV, delay) {
      this.node = new PIXI.Container();
      this.sprites = sprites;
      sprites.forEach((s) => { s.anchor.set(0.5); s.visible = false; this.node.addChild(s); });
      this.start = start; this.points = points; this.maxV = maxV; this.delay = delay;
      this.reset();
    }
    reset() {
      this.node.position.set(this.start.x, this.start.y);
      this.i = 0; this.v = this.maxV; this.wait = false; this.respawn = false; this.stopped = false;
      this.points.forEach((p, k) => {
        const prev = k ? this.points[k - 1] : this.start;
        const dx = p.x - prev.x, dy = p.y - prev.y, len = Math.hypot(dx, dy) || 1;
        p.dir = { x: dx / len, y: dy / len };
      });
      this.show(this.points[0].tex || 0);
    }
    show(k) { this.sprites.forEach((s, j) => { s.visible = j === k; }); this.node.visible = this.moved === true; }
    next() {
      this.i += 1;
      if (this.i >= this.points.length) { this.i = 0; this.backToStart(); }
      this.show(this.points[this.i].tex || 0);
    }
    backToStart() {
      this.respawn = true;
      this.node.position.set(this.start.x, this.start.y);
      setTimeout(() => { this.respawn = false; this.v = this.maxV; }, this.delay);
    }
    move(dt) {
      if (!this.moved) { this.moved = true; this.node.visible = true; }
      const p = this.points[this.i];
      const d = Math.hypot(p.x - this.node.x, p.y - this.node.y);
      if (!this.respawn) {
        if (p.stop) {
          if (d <= 200 && !this.wait) {
            this.v *= d / (d + 0.8 * dt);
            if (this.v < 0.1 && !this.stopped) {
              this.v = 0; this.stopped = true; this.wait = true;
              setTimeout(() => { this.wait = false; this.stopped = false; this.next(); }, 1000);
            }
          }
        } else if (d <= 5 || (p.dir.x * (p.x - this.node.x) + p.dir.y * (p.y - this.node.y)) < 0) this.next();
      }
      if (this.v < this.maxV && !this.wait && !this.stopped) this.v += 0.01 * dt;
      if (this.respawn) this.v = 0;
      const dir = this.points[this.i].dir;
      if (this.node.x > MAP.width || this.node.y > MAP.width || this.node.x < 0 || this.node.y < 0) this.backToStart();
      this.node.x += dir.x * this.v * dt;
      this.node.y += dir.y * this.v * dt;
    }
  }

  // PIXI 5.2 loads SVG URLs over XHR, which is blocked on file:// — <img> Loads it and passes it to the image texture (same image, same size)
  const cache = new Map();
  const fromUrl = (u) => {
    if (cache.has(u)) return cache.get(u);
    const im = new Image();
    im.src = u;
    const t = PIXI.Texture.from(im);
    cache.set(u, t);
    return t;
  };
  const tex = (n) => fromUrl(BASE + n);
  const sprite = (n, x, y) => { const s = new PIXI.Sprite(tex(n)); s.anchor.set(0.5); s.position.set(x, y); return s; };

  function build() {
    const c = new PIXI.Container();
    const map = new PIXI.Sprite(fromUrl("media/town.svg"));
    map.alpha = 0;
    c.addChild(map);
    const items = [];
    const add = (s, move) => { c.addChild(s.node || s); items.push(move); };

    // Water light — a 20px circle around (1930,1280)
    const field = sprite("water.svg", 1930, 1280); let ft = -5;
    add(field, (dt) => { ft += 0.25 * dt; field.y = 1280 + 20 * sinT(ft, 60); field.x = 1930 - 20 * sinT(ft, 60); });
    // Two boats — 5px bobbing
    [["boat.svg", 2150, 990, -10], ["ship.svg", 1280, 1523, 0]].forEach(([n, x, y, t0]) => {
      const s = sprite(n, x, y); let t = t0;
      add(s, (dt) => { t += 0.25 * dt; s.y = y + 5 * sinT(t, 60); });
    });
    // Three kids — hop with 1.5 force at set intervals (.7~.9 + 0~1)
    [["child-1.svg", 1075, 1130, 0.9], ["child-2.svg", 1110, 1100, 0.7], ["child-3.svg", 1300, 995, 0.8]].forEach(([n, x, y, delay]) => {
      const s = sprite(n, x, y); let time = 0, pow = 2, jumping = false, rnd = Math.random();
      add(s, (dt) => {
        time += 0.01; pow -= 0.1 * dt;
        if (jumping) { if (y >= s.y) s.y -= pow * dt; else { jumping = false; s.y = y; } }
        if (time > delay + rnd) { rnd = Math.random(); time = 0; pow = 1.5; jumping = true; }
      });
    });
    // Worker — 1.1px nod (period 20)
    const w1 = sprite("worker.svg", 300, 600); let wt = 1;
    add(w1, (dt) => { wt += 3 * dt; w1.y = 600 + 1.1 * sinT(wt, 20); });
    // Three lights — switch on and off with sine rounding
    [[1730, 422, -10], [746, 1262, 10], [653, 1299, -1]].forEach(([x, y, o]) => {
      const s = sprite("electric.svg", x, y); s.alpha = 0; let off = o;
      add(s, (dt) => { off += 0.75 * dt; s.alpha = Math.round(sinT(off, 60)); });
    });
    // Image swap for worker (section 2) and signal (section 3)
    const anim = (names, x, y, speed) => {
      const a = new PIXI.AnimatedSprite(names.map((n) => tex(n)));
      a.anchor.set(0.5); a.position.set(x, y); a.animationSpeed = speed; a.play();
      add(a, () => {});
    };
    anim(["worker-1.svg", "worker-2.svg"], 500, 1257, 0.01);
    anim(["light-1.svg", "light-2.svg", "light-3.svg"], 1422, 738, 0.025);
    anim(["light-1.svg", "light-2.svg", "light-3.svg"], 505, 835, 0.025);
    // Four cars — original path
    const cars = [
      new Car([sprite("car-dl.svg", 0, 0)], { x: MAP.width - CAR.x, y: 415 + CAR.y }, [{ x: 266 + CAR.x, y: MAP.height - CAR.y }], 3, 2000),
      new Car([sprite("car-dr.svg", 0, 0), sprite("car-dl2.svg", 0, 0)], { x: CAR.x, y: 677 + CAR.y }, [{ x: 267, y: 839, stop: true }, { x: 334, y: 879 }, { x: CAR.x, y: 1074 - CAR.y, tex: 1 }], 2, 3000),
      new Car([sprite("car-ur.svg", 0, 0)], { x: 2203 - CAR.x, y: CAR.y }, [{ x: CAR.x, y: 1288 - CAR.y }], 2, 2000),
      new Car([sprite("car-dl2.svg", 0, 0)], { x: CAR.x, y: 556 - CAR.y }, [{ x: 970 - CAR.x, y: CAR.y }], 2, 1000),
    ];
    cars.forEach((car) => add(car, (dt) => car.move(dt)));
    return { c, map, items, sceneEnd: false };
  }

  // Cover the screen while keeping the map aspect ratio, centered (original resizeStage)
  function fit() {
    const w = view.clientWidth, h = view.clientHeight;
    app.renderer.resize(w, h);
    let cw, ch;
    if (h / w > MAP.height / MAP.width) { ch = Math.floor(h); cw = Math.floor(h * (MAP.width / MAP.height)); }
    else { cw = Math.floor(w); ch = Math.floor(w * (MAP.height / MAP.width)); }
    scene.c.scale.set(cw / MAP.width, ch / MAP.height);
    scene.c.x = cw > w ? Math.floor(-(cw - w) / 2) : 0;
    scene.c.y = ch > h ? Math.floor(-(ch - h) / 2) : 0;
  }

  const loop = (dt) => {
    // At first only the map lights up, .05 per frame, and once fully on the rest starts moving
    if (!scene.sceneEnd) {
      if (scene.map.alpha <= 1) scene.map.alpha += 0.05 * dt;
      else scene.sceneEnd = true;
      return;
    }
    scene.items.forEach((m) => m(dt));
  };

  window.tkPages = window.tkPages || {};
  window.tkPages.home = {
    init(container) {
      view = container.querySelector("#tk-appview");
      if (!view || !window.PIXI) return;
      const loader = view.querySelector(".tk-town-loader");
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Like the original, shows a loader (yellow circle) until all images are loaded, then removes the loader and starts turning on the map
      const go = () => {
        if (!started) return;
        loader?.classList.remove("is-loading");
        loader?.classList.add("is-complete");
        if (reduce) { scene.map.alpha = 1; scene.sceneEnd = true; app.ticker.update(); app.ticker.stop(); }
        else app.ticker.start();
      };
      if (!app) {
        PIXI.utils.skipHello();
        PIXI.settings.ROUND_PIXELS = false;
        // Opened via file://, Chrome cannot upload local images to WebGL (treats them as another origin) — only then the same scene is drawn with the legacy canvas renderer
        app = new PIXI.Application({ transparent: true, resolution: window.devicePixelRatio || 1, autoDensity: true, forceCanvas: location.protocol === "file:", autoStart: false });
        app.renderer.plugins.interaction.autoPreventDefault = false;
        app.ticker.maxFPS = 30;
        app.ticker.stop();
        scene = build();
        app.stage.addChild(scene.c);
        app.ticker.add(loop);
        const waits = [...cache.values()].map((t) => new Promise((res) => {
          const b = t.baseTexture;
          if (b.valid) return res();
          b.once("loaded", res);
          b.once("error", res);
        }));
        Promise.all(waits).then(go);
      } else {
        scene.map.alpha = 0; scene.sceneEnd = false;
        requestAnimationFrame(go);
      }
      view.appendChild(app.view);
      fit();
      started = true;
      let t = 0;
      onResize = () => { clearTimeout(t); t = setTimeout(fit, 300); };
      addEventListener("resize", onResize);
    },
    off() {
      if (!started) return;
      removeEventListener("resize", onResize);
      app.ticker.stop();
      started = false;
    },
  };
})();
