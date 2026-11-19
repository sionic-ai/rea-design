// Motion shared by all pages: loader (minimum 4s) · anchor move · current section marker and header inversion · hamburger drawer · modal ·
// Curved text (textPath sliding), three physics-drop pieces (matter.js), an endlessly flowing photo strip, and front-photo parallax.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();

  // Original uses default scroll without smooth scrolling (lenis is commented out). Only anchors are scrolled by hand —
  // Length = Distance (px) × 1ms clamped to 400–1200ms, curve is easeInOutCubic
  const lock = (on) => body.classList.toggle("is-locked", on);
  let anchorRaf = 0;
  const goTo = (hash) => {
    const el = hash.length > 1 && document.querySelector(hash);
    if (!el) return;
    const from = scrollY;
    const to = Math.max(0, Math.min(from + el.getBoundingClientRect().top, root.scrollHeight - innerHeight));
    cancelAnimationFrame(anchorRaf);
    if (reduce || Math.abs(to - from) < 1) { scrollTo(0, to); return; }
    const dur = Math.min(Math.max(Math.abs(to - from), 400), 1200);
    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(Math.max(0, now - t0) / dur, 1);
      scrollTo(0, from + (to - from) * ease(p));
      if (p < 1) anchorRaf = requestAnimationFrame(step);
    };
    anchorRaf = requestAnimationFrame(step);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-modal")) return;
    e.preventDefault();
    closeDrawer();
    goTo(a.getAttribute("href") === "#top" ? "#top" : a.getAttribute("href"));
  });

  // Loader: even if loading is done, if 4 seconds haven’t passed since the start, wait and then lift (same minimum time as the original)
  const loadStart = performance.now();
  const ready = new Promise((resolve) => {
    if (reduce || !document.querySelector(".i-loader")) { body.classList.add("is-loadingEnd"); resolve(); return; }
    body.style.overflow = "hidden";
    setTimeout(() => body.classList.add("is-loadingStart"), 20);
    const end = () => {
      const wait = Math.max(0, 4000 - (performance.now() - loadStart));
      setTimeout(() => {
        body.classList.add("is-loadingEnd");
        body.style.overflow = "";
        resolve();
      }, wait);
    };
    document.readyState === "complete" ? end() : addEventListener("load", end, { once: true });
  });
  window.brand = { ready, lock, reduce, mm };

  // Current section: Start at the very top (curve text and news line visible), otherwise the section crossing the center line of the screen
  const header = document.querySelector(".i-header");
  const hbg = document.querySelector(".i-hbg");
  const marks = [...document.querySelectorAll("main section[id]")];
  const footer = document.querySelector(".i-footer");
  const inverts = [...document.querySelectorAll("[data-invert]")];
  const headerH = () => (header ? header.offsetHeight : 88);
  const sync = () => {
    const vh = innerHeight;
    const y = window.scrollY;
    let cur = "Start";
    if (y > 10) {
      for (const s of marks) {
        const r = s.getBoundingClientRect();
        if (r.top <= vh / 2 && r.bottom > vh / 2) { cur = s.id; break; }
      }
      if (footer && footer.getBoundingClientRect().top <= vh / 2) cur = "End";
    }
    if (root.dataset.current !== cur) root.dataset.current = cur;
    body.classList.toggle("is-end", cur === "End");
    const mid = headerH() / 2;
    const over = cur === "About" || inverts.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= mid && r.bottom >= mid;
    });
    header?.classList.toggle("is-invert", over);
    hbg?.classList.toggle("is-invert", over);
  };
  addEventListener("scroll", sync, { passive: true });
  addEventListener("resize", sync);
  sync();

  // Hamburger drawer: a sage plate drops in over 1s, and the text (CSS) follows .8s later
  function closeDrawer() {
    if (!body.classList.contains("is-hbgOpen")) return;
    body.classList.remove("is-hbgOpen");
    lock(false);
  }
  hbg?.addEventListener("click", () => {
    const open = !body.classList.contains("is-hbgOpen");
    body.classList.toggle("is-hbgOpen", open);
    hbg.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    lock(open);
  });

  // Modal: on open, the curved text inside slides in again from the start
  const openModal = (name) => {
    const m = document.getElementById(`modal-${name}`);
    if (!m) return;
    closeDrawer();
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
    lock(true);
    m.querySelectorAll(".i-ontext[data-manual]").forEach((el) => onText.play(el, true));
  };
  const closeModal = (m) => {
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
    lock(false);
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-modal]");
    if (t) { e.preventDefault(); openModal(t.dataset.modal); return; }
    const m = e.target.closest(".i-modal.is-open");
    if (m && (e.target.closest("[data-close]") || e.target.classList.contains("i-modal__scroll"))) closeModal(m);
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".i-modal.is-open").forEach(closeModal);
    closeDrawer();
  });

  // Curved text: textPath startOffset goes from data-start → data-end (easeOutQuart). Font size is fitted by the viewBox ratio
  const onText = (() => {
    const els = [...document.querySelectorAll(".i-ontext")];
    const measure = () => els.forEach((el) => {
      const svg = el.querySelector("svg");
      const vbw = svg.viewBox.baseVal.width || 100;
      if (el.clientWidth) el.style.setProperty("--ratio", (vbw / el.clientWidth).toFixed(4));
    });
    // Below width 768 the text is relatively larger, so use the separately set slots (data-*-sp) like the original
    const pick = (tp, el, key) => {
      const sp = innerWidth < 768 ? (tp.dataset[`${key}Sp`] ?? el.dataset[`${key}Sp`]) : undefined;
      return parseFloat(sp ?? tp.dataset[key] ?? el.dataset[key]);
    };
    const paths = (el) => [...el.querySelectorAll("textPath")].map((tp) => ({
      tp, from: pick(tp, el, "start"), to: pick(tp, el, "end"),
    }));
    const set = (tp, v) => tp.setAttribute("startOffset", `${v}%`);
    const play = (el, restart) => {
      const list = paths(el);
      if (reduce) { list.forEach(({ tp, to }) => set(tp, to)); el.classList.add("is-active"); return; }
      if (restart) { el.classList.remove("is-active"); list.forEach(({ tp, from }) => set(tp, from)); }
      const dur = (parseFloat(el.dataset.duration) || 1000) / 1000;
      const delay = (parseFloat(el.dataset.delay) || 0) / 1000;
      gsap.delayedCall(delay, () => {
        el.classList.add("is-active");
        list.forEach(({ tp, from, to }) => {
          const o = { v: from };
          gsap.to(o, { v: to, duration: dur, ease: "quart.out", onUpdate: () => set(tp, o.v) });
        });
      });
    };
    measure();
    let wasSp = innerWidth < 768;
    addEventListener("resize", () => {
      measure();
      const sp = innerWidth < 768;
      if (sp === wasSp) return;
      wasSp = sp;
      els.forEach((el) => paths(el).forEach(({ tp, from, to }) => set(tp, el.classList.contains("is-active") ? to : from)));
    });
    document.fonts?.ready.then(measure);
    // Like the original, turn on only while on screen — only text whose top edge has risen past 90% of the screen and hasn’t yet passed above the top.
    // Characters skipped in one go (entirely above the screen) are not turned on but left at the start position
    const waiting = new Set();
    els.forEach((el) => {
      paths(el).forEach(({ tp, from }) => set(tp, from));
      if (el.hasAttribute("data-manual")) return;
      // Hero text counts its delay right after load (4 seconds → starts sliding about when the loader lifts)
      if (el.dataset.delay) { play(el); return; }
      waiting.add(el);
    });
    let checkRaf = 0;
    const check = () => {
      checkRaf = 0;
      for (const el of waiting) {
        const r = el.getBoundingClientRect();
        if (r.top <= innerHeight * 0.9 && r.bottom >= 0 && r.top <= innerHeight) { waiting.delete(el); play(el); }
      }
    };
    const queue = () => { if (!checkRaf && waiting.size) checkRaf = requestAnimationFrame(check); };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    queue();
    return { play, measure };
  })();

  // Falling shapes: run the engine when the section top passes the screen center. Before touching the floor it only collides with the floor and other pieces
  // Can be thrown in from off-screen, and after landing it also bounces off the walls. It can be grabbed and thrown by hand
  const SHAPES = {
    a: { pts: [[0, 3], [86, 0], [100, 101], [2, 98]], color: "--site-shape-1" },
    b: { pts: [[12, 91], [0, 39], [31, 0], [76, 8], [100, 50], [70, 96]], color: "--site-shape-2" },
    c: { pts: [[99, 34], [95, 88], [33, 97], [0, 57], [40, 2]], color: "--site-shape-3" },
  };
  const probe = document.createElement("i");
  probe.hidden = true;
  document.body.append(probe);
  const colorOf = (v) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
  const CAT = { ground: 1, wall: 2, shape: 4 };
  if (window.decomp) Matter.Common.setDecomp(window.decomp);
  class Physics {
    constructor(box) {
      this.box = box;
      this.section = box.parentElement;
      this.canvas = box.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.groundPts = box.dataset.ground.trim().split(/\s+/).map((p) => p.split(",").map(Number));
      this.specs = JSON.parse(box.dataset.shapes);
      this.widthPc = parseFloat(box.dataset.width) || 7.5;
      this.engine = Matter.Engine.create({ positionIterations: 8, velocityIterations: 6, constraintIterations: 4 });
      this.engine.gravity.y = 1;
      this.statics = [];
      this.shapes = [];
      this.landed = new Set();
      this.active = false;
      this.acc = 0;
      this.w = 0;
      this.h = 0;
      Matter.Events.on(this.engine, "collisionStart", (ev) => {
        for (const p of ev.pairs) {
          const a = p.bodyA.parent, b = p.bodyB.parent;
          const shape = a.label === "ground" ? b : b.label === "ground" ? a : null;
          if (!shape || shape.label !== "shape" || this.landed.has(shape.id)) continue;
          this.landed.add(shape.id);
          shape.collisionFilter.mask = 0xffff;
        }
      });
      this.started = false;
      this.layout(true);
      this.bindDrag();
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) this.start();
        else this.stop();
      }, { rootMargin: "0px 0px -50% 0px" }).observe(box);
      this.tick = this.tick.bind(this);
      if (reduce) this.settle();
    }
    sizePc() {
      const w = innerWidth;
      return w < 768 ? 16 : w < 1024 ? 10 : this.widthPc;
    }
    layout(first) {
      const r = this.box.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h || (w === this.w && h === this.h)) return;
      const k = this.w ? w / this.w : 1;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      Matter.Composite.remove(this.engine.world, this.statics);
      this.statics = [];
      // Ridge floor: as in the original, put one concave ground polygon into fromVertices and poly-decomp (0.3.0) splits it into convex pieces.
      // The floor line (y 256) is dropped another 40px below the screen so fast pieces don’t slip out
      const s = w / 1280;
      const top = h - 256 * s;
      const verts = this.groundPts.map(([x, y]) => ({ x: x * s, y: y >= 256 ? h + 40 : top + y * s }));
      const ground = Matter.Bodies.fromVertices(0, 0, [verts], {
        isStatic: true, restitution: 0.3, friction: 0.8, slop: 0, label: "ground",
        collisionFilter: { category: CAT.ground, mask: 0xffff },
      }, true);
      const minX = Math.min(...verts.map((v) => v.x)), minY = Math.min(...verts.map((v) => v.y));
      Matter.Body.setPosition(ground, { x: ground.position.x + minX - ground.bounds.min.x, y: ground.position.y + minY - ground.bounds.min.y });
      ground.parts.forEach((p) => { p.label = "ground"; p.collisionFilter = { category: CAT.ground, mask: 0xffff }; });
      this.statics.push(ground);
      const wall = { isStatic: true, restitution: 0.3, friction: 0.1, slop: 0, label: "wall", collisionFilter: { category: CAT.wall, mask: 0xffff } };
      this.statics.push(
        Matter.Bodies.rectangle(-25, h / 2, 50, h, wall),
        Matter.Bodies.rectangle(w + 25, h / 2, 50, h, wall),
        Matter.Bodies.rectangle(w / 2, -25, w, 50, wall),
      );
      Matter.Composite.add(this.engine.world, this.statics);
      if (first || !this.shapes.length) {
        this.w = w; this.h = h;
        this.makeShapes();
      } else {
        for (const b of this.shapes) {
          Matter.Body.setPosition(b, { x: b.position.x * k, y: b.position.y * (h / this.h) });
          Matter.Body.scale(b, k, k);
        }
        this.w = w; this.h = h;
      }
      this.draw();
    }
    makeShapes() {
      Matter.Composite.remove(this.engine.world, this.shapes);
      this.shapes = [];
      this.landed.clear();
      const size = this.w * this.sizePc() / 100;
      for (const sp of this.specs) {
        const def = SHAPES[sp.s];
        const k = size / 100;
        const verts = def.pts.map(([x, y]) => ({ x: x * k, y: y * k }));
        const b = Matter.Bodies.fromVertices(0, 0, [verts], {
          density: 0.001, restitution: 0.9, friction: 0.1, frictionAir: 0.01, slop: 0, label: "shape",
          collisionFilter: { category: CAT.shape, mask: CAT.ground | CAT.shape },
        });
        b.fill = colorOf(def.color);
        b.size = size;
        Matter.Body.setPosition(b, { x: this.w * sp.x, y: this.h * sp.y });
        if (sp.a) Matter.Body.setAngle(b, sp.a * Math.PI / 180);
        if (sp.vx || sp.vy) Matter.Body.setVelocity(b, { x: (sp.vx || 0) * this.w / 100, y: (sp.vy || 0) * this.h / 100 });
        if (sp.av) Matter.Body.setAngularVelocity(b, sp.av);
        this.shapes.push(b);
      }
      Matter.Composite.add(this.engine.world, this.shapes);
    }
    start() {
      if (this.active || reduce) return;
      this.active = true;
      this.started = true;
      gsap.ticker.add(this.tick);
    }
    stop() {
      if (!this.active) return;
      this.active = false;
      this.release();
      gsap.ticker.remove(this.tick);
    }
    tick(_t, dt) {
      // Runs at a fixed 1/60 second interval regardless of screen refresh rate
      this.acc += Math.min(dt, 100);
      let n = 0;
      while (this.acc >= 1000 / 60 && n < 4) { Matter.Engine.update(this.engine, 1000 / 60); this.acc -= 1000 / 60; n++; }
      this.draw();
    }
    settle() {
      this.started = true;
      for (let i = 0; i < 420; i++) Matter.Engine.update(this.engine, 1000 / 60);
      this.draw();
    }
    draw() {
      const { ctx } = this;
      ctx.clearRect(0, 0, this.w, this.h);
      if (!this.started) return;
      ctx.lineJoin = "round";
      for (const b of this.shapes) {
        const v = b.vertices;
        ctx.beginPath();
        ctx.moveTo(v[0].x, v[0].y);
        for (let i = 1; i < v.length; i++) ctx.lineTo(v[i].x, v[i].y);
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle = b.fill;
        ctx.lineWidth = b.size * 0.07;
        ctx.fill();
        ctx.stroke();
      }
    }
    point(e) {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    bindDrag() {
      const hit = (pt) => Matter.Query.point(this.shapes, pt)[0];
      this.section.addEventListener("pointermove", (e) => {
        if (this.drag) { this.drag.pointA = this.point(e); return; }
        if (e.pointerType === "mouse") this.section.classList.toggle("is-shape-hover", !!hit(this.point(e)));
      });
      this.section.addEventListener("pointerdown", (e) => {
        if (!this.active) return;
        const pt = this.point(e);
        const b = hit(pt);
        if (!b) return;
        e.preventDefault();
        this.drag = Matter.Constraint.create({
          pointA: pt, bodyB: b, pointB: { x: pt.x - b.position.x, y: pt.y - b.position.y }, stiffness: 0.2, damping: 0.1, length: 0,
        });
        // After grabbing, rotate pointB into body coordinates so it follows the rotation
        const c = Math.cos(-b.angle), s = Math.sin(-b.angle), p = this.drag.pointB;
        this.drag.pointB = { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
        this.drag.angleB = b.angle;
        Matter.Composite.add(this.engine.world, this.drag);
        root.classList.add("is-shape-drag");
        this.section.setPointerCapture?.(e.pointerId);
      });
      const up = () => this.release();
      this.section.addEventListener("pointerup", up);
      this.section.addEventListener("pointercancel", up);
      this.section.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        if (this.active && t && hit(this.point(t))) e.preventDefault();
      }, { passive: false });
    }
    release() {
      if (!this.drag) return;
      Matter.Composite.remove(this.engine.world, this.drag);
      this.drag = null;
      root.classList.remove("is-shape-drag");
    }
  }
  const physics = [...document.querySelectorAll(".i-physics")].map((el) => new Physics(el));
  let resizeRaf = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => physics.forEach((p) => p.layout(false)));
  });
  document.fonts?.ready.then(() => physics.forEach((p) => p.layout(false)));

  // Photo strip: the same Splide 4 + AutoScroll as the original. Settings are the original data-splide as is (loop · 3 slides · 10% on both sides · 1px per frame,
  // 1000px and below 2 slides · 680px and below 1 slide with 20% on both sides), and as in the original flows only while visible on screen
  const AutoScroll = window.splide?.Extensions?.AutoScroll;
  document.querySelectorAll(".i-strip").forEach((strip) => {
    const options = JSON.parse(strip.dataset.splide || "{}");
    // If it starts on its own, it moves the band every frame even off screen — the observer below plays it only when visible
    if (reduce) options.autoScroll = false;
    else if (options.autoScroll) options.autoScroll = { ...options.autoScroll, autoStart: false };
    const sp = new Splide(strip, options);
    sp.mount(options.autoScroll && AutoScroll ? { AutoScroll } : {});
    const auto = sp.Components.AutoScroll;
    if (!auto) return;
    new IntersectionObserver(([en]) => { if (en.isIntersecting) auto.play(); else auto.pause(); }).observe(strip);
  });

  // Front photo strip: from scale 1.2, +10% → -10%
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".i-band__img").forEach((band) => {
      gsap.fromTo(band.querySelector(".i-photo"), { "--y": "10%" }, {
        "--y": "-10%", ease: "none",
        scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  });
})();
