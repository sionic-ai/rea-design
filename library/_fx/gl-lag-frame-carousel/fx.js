// Carousel drawing a row of photo panels with a three.js orthographic camera — each frame follows its target position with damping (25 per second, faster for frames ahead in the moving direction — rear frames 30% slower),
// The photo inside the panel follows .267 later than the panel, so the photo enlarged 1.1× slides sideways within the window that is the panel (parallax .02 added, clamped with tanh).
// Paging takes 600ms 1-(1-t)³, and pressing on the last section rewinds through every section back to the first (600 + 35×section count ms). Dragging is handled by Swiper touch — dragging more than 15% of the panel width advances it
(() => {
  const VS = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  const FS = [
    "precision highp float;uniform sampler2D uTex;uniform vec2 uScale;uniform vec2 uOffset;uniform float uZoom;uniform float uShift;varying vec2 vUv;",
    "void main(){vec2 f=(vUv-.5)/uZoom+.5;f.x+=uShift;vec2 uv=clamp(f*uScale+uOffset,vec2(0.),vec2(1.));gl_FragColor=texture2D(uTex,uv);}",
  ].join("\n");

  const drawPlaceholder = (el, label) => {
    const cs = getComputedStyle(el);
    const v = (n, d) => cs.getPropertyValue(n).trim() || d;
    const c = document.createElement("canvas");
    c.width = 1904; c.height = 1164;
    const g = c.getContext("2d");
    g.fillStyle = v("--kf-raised", v("--kf-bg", "gray"));
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = v("--kf-line", "silver");
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c.width, c.height); g.moveTo(c.width, 0); g.lineTo(0, c.height); g.stroke();
    if (label) {
      g.font = `500 30px ${v("--kf-font-mono", "monospace")}`;
      const w = g.measureText(label).width + 48;
      g.fillRect((c.width - w) / 2, c.height / 2 - 30, w, 60);
      g.fillStyle = v("--kf-dim", "dimgray");
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(label, c.width / 2, c.height / 2);
    }
    return c;
  };

  kfFx.register("gl-lag-frame-carousel", (el, { options, reduce }) => {
    const T = window.THREE;
    const stage = el.querySelector('[data-fx-part="stage"]');
    const frame = el.querySelector('[data-fx-part="frame"]');
    const swEl = el.querySelector('[data-fx-part="swiper"]');
    const bar = el.querySelector('[data-fx-part="bar"]');
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!T || !stage || !frame || !slides.length) return;
    const n = slides.length;
    const DUR = +(options.dur ?? 0.6) * 1000, PER = +(options["loop-per"] ?? 0.035) * 1000, POW = +(options.power ?? 3);
    const RATE = +(options.damp ?? 25), STAG = +(options.stagger ?? 0.3), LAG = +(options.lag ?? 0.267);
    const ZOOM = reduce ? 1 : +(options.zoom ?? 1.1), PAR = +(options.parallax ?? 0.02), TH = +(options.threshold ?? 0.15);
    const gapAt = () => (innerWidth >= 1200 ? +(options.gap ?? 30) : +(options["gap-narrow"] ?? 16));

    let canvas = stage.querySelector("canvas");
    if (!canvas) { canvas = document.createElement("canvas"); stage.append(canvas); }
    canvas.classList.add("fx-lfc-canvas");
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new T.Scene();
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    cam.position.z = 5;
    const geo = new T.PlaneGeometry(1, 1);
    const meshes = slides.map((s) => {
      const src = s.querySelector("img, canvas") || drawPlaceholder(el, s.dataset.label || "");
      const tex = src instanceof HTMLImageElement ? new T.Texture(src) : new T.CanvasTexture(src);
      if (src instanceof HTMLImageElement) { if (src.complete) tex.needsUpdate = true; else src.addEventListener("load", () => { tex.needsUpdate = true; dirty = true; }, { once: true }); }
      tex.minFilter = T.LinearFilter;
      const mat = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: true, uniforms: {
        uTex: { value: tex }, uScale: { value: new T.Vector2(1, 1) }, uOffset: { value: new T.Vector2(0, 0) }, uZoom: { value: ZOOM }, uShift: { value: 0 },
      } });
      const m = new T.Mesh(geo, mat);
      m.userData = { src, frameX: 0, imageX: 0, targetX: 0, tracking: false };
      scene.add(m);
      return m;
    });
    // Precompile when setting up the shader — so the first drag doesn’t stall
    renderer.compile(scene, cam);

    const dim = { w: 0, h: 0, gap: 0, base: 0, y: 0 };
    let index = 0, ref = 0, offset = 0, dragging = false, dragRatio = 0, lastDir = -1, lock = 0;
    let tr = null; // { from, to, t0, dur, ref, target, loop, back }
    const coverUv = (m) => {
      const [iw, ih] = [m.userData.src.naturalWidth || m.userData.src.width, m.userData.src.naturalHeight || m.userData.src.height];
      const fa = dim.w / dim.h, ia = iw / ih, u = m.material.uniforms;
      if (ia > fa) { u.uScale.value.set(fa / ia, 1); u.uOffset.value.set((1 - fa / ia) / 2, 0); }
      else { u.uScale.value.set(1, ia / fa); u.uOffset.value.set(0, (1 - ia / fa) / 2); }
    };
    const layout = () => {
      // One slide slot is a Swiper panel (frame if absent) — the progress bar is not counted in the height
      const s = stage.getBoundingClientRect(), f = (swEl || frame).getBoundingClientRect();
      const W = Math.max(1, s.width), H = Math.max(1, f.height || s.height);
      stage.style.height = `${H}px`;
      renderer.setSize(W, H, false);
      cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2;
      cam.updateProjectionMatrix();
      dim.w = f.width; dim.h = H; dim.gap = gapAt();
      dim.base = f.left - s.left + f.width / 2 - W / 2;
      meshes.forEach((m) => { m.scale.set(dim.w, dim.h, 1); coverUv(m); });
      place(true);
      dirty = true;
    };
    const place = (snap) => meshes.forEach((m, i) => {
      const d = m.userData;
      d.targetX = dim.base + (i - ref) * (dim.w + dim.gap) + offset;
      if (snap || reduce || !d.tracking) { d.frameX = d.imageX = d.targetX; d.tracking = true; }
    });
    const shiftOf = (d) => {
      if (reduce || dim.w <= 0) return 0;
      const step = dim.w + dim.gap, c = (1 - 1 / ZOOM) / 2;
      const o = -(d.imageX - d.frameX) / (dim.w * ZOOM), s = (d.frameX - dim.base) / step * PAR;
      return c * Math.tanh((o + s) / c);
    };
    // Progress bar — width of the fill cell over the 1px line up to the current section (grows with the transition curve while paging)
    let fill = null;
    if (bar) { fill = bar.querySelector(".fx-lfc-fill") || document.createElement("i"); fill.className = "fx-lfc-fill"; bar.append(fill); }
    const progress = (v) => { if (fill) fill.style.width = `${(Math.max(0, Math.min(1, v)) * 100).toFixed(3)}%`; };
    const ease = (t) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), POW);

    const start = (target, dur, toIndex, loop) => {
      tr = { from: offset, target, t0: performance.now(), dur, toIndex, loop, p0: (index + 1) / n };
      lock = performance.now() + dur;
    };

    // Swiper — like the original, as many transparent cells as there are sheets, and Swiper actually advances (drag physics·grab hand·sheet change). The canvas plate row follows that paging
    let sw = null, swiping = false;
    if (window.Swiper && swEl) {
      const wrap = swEl.querySelector(".swiper-wrapper");
      if (wrap && wrap.children.length !== n) wrap.innerHTML = Array.from({ length: n }, () => '<div class="swiper-slide"></div>').join("");
      sw = new Swiper(swEl, {
        slidesPerView: 1, speed: DUR, spaceBetween: +(options["gap-narrow"] ?? 16), resistanceRatio: 0.01, longSwipesRatio: 0.3,
        grabCursor: true, simulateTouch: true, roundLengths: true, observer: true, observeParents: true, watchSlidesProgress: true,
        breakpoints: { 1200: { spaceBetween: +(options.gap ?? 30) } },
      });
      sw.on("touchStart", () => { if (tr) return; dragging = true; swiping = false; ref = index; offset = 0; dragRatio = 0; });
      sw.on("sliderMove", (s) => {
        if (!dragging) return;
        const diff = s.touches.diff || 0;
        let o = Math.max(-1, Math.min(1, diff / Math.max(1, s.width))) * dim.w;
        o = Math.max(-dim.w, Math.min(dim.w, o));
        offset = o; dragRatio = o / dim.w;
        place(false);
      });
      // When Swiper changes slides (drag release · button · arrow), it moves from the spot being dragged to that slide in 600ms 1-(1-t)³
      sw.on("slideChangeTransitionStart", (s) => {
        const to = s.activeIndex;
        if (to === index && !dragging) return;
        dragging = false; swiping = true;
        if (tr && tr.loop) return;
        const step = dim.w + dim.gap;
        start(-(to - index) * step, DUR, to, false);
      });
      sw.on("touchEnd", () => {
        if (!dragging) return;
        dragging = false;
        // The threshold for changing sections is 15% of the panel width like the original, not Swiper (30%) — if Swiper did not advance, advance manually,
        // If it falls short, it returns in place in 250~300ms in proportion to the drag distance (original SWIPE_RETURN)
        requestAnimationFrame(() => {
          if (swiping || tr) return;
          if (dragRatio <= -TH && index < n - 1) return sw.slideTo(index + 1, DUR);
          if (dragRatio >= TH && index > 0) return sw.slideTo(index - 1, DUR);
          if (Math.abs(offset) > 0.001) start(0, Math.max(250, Math.min(DUR * Math.abs(offset) / dim.w * 0.7, DUR * 0.5)), index, false);
        });
      });
    }
    const go = (dir) => {
      if (tr || dragging) return;
      const step = dim.w + dim.gap;
      // Pressing at the last section runs back through all sections to the first (600 + 35×section count ms)
      if (dir > 0 && index === n - 1) {
        start(step * (n - 1), DUR + PER * n, 0, true);
        sw?.slideTo(0, DUR + PER * n);
        return;
      }
      const to = index + dir;
      if (to < 0 || to >= n) return;
      if (sw) sw.slideTo(to, DUR);
      else start(-dir * step, DUR, to, false);
    };
    // Tap (without dragging) to go to the next slide
    let downX = 0;
    const down = (e) => { downX = e.clientX; };
    const click = (e) => { if (Math.abs(e.clientX - downX) < 6 && performance.now() >= lock) go(1); };
    frame.addEventListener("pointerdown", down);
    frame.addEventListener("click", click);
    const key = (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      e.preventDefault();
      if (performance.now() >= lock) go(e.key === "ArrowRight" ? 1 : -1);
    };
    addEventListener("keydown", key);

    let raf = 0, last = 0, dirty = true;
    const loop = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - (last || now)) / 1000));
      last = now;
      if (tr) {
        const t = Math.min(1, (now - tr.t0) / tr.dur), k = ease(t);
        offset = tr.from + (tr.target - tr.from) * k;
        const p1 = (tr.toIndex + 1) / n;
        progress(tr.p0 + (p1 - tr.p0) * k);
        if (t >= 1) { index = ref = tr.toIndex; offset = 0; tr = null; progress((index + 1) / n); }
        place(false);
      }
      // Front panel first, fast — the front panel in the moving direction goes 25 per second, the rearmost 25×(1-.3)
      const moving = meshes.filter((m) => Math.abs(m.userData.targetX - m.userData.frameX) > 0.05);
      const sum = moving.reduce((a, m) => a + (m.userData.targetX - m.userData.frameX), 0);
      if (Math.abs(sum) > 0.05) lastDir = Math.sign(sum);
      const order = [...meshes].sort((a, b) => (b.userData.frameX - a.userData.frameX) * lastDir);
      const span = Math.max(order.length - 1, 1);
      order.forEach((m, r) => {
        const d = m.userData;
        if (reduce) { d.frameX = d.imageX = d.targetX; }
        else {
          const rate = RATE * (1 - STAG * (r / span));
          d.frameX += (d.targetX - d.frameX) * (1 - Math.exp(-rate * dt));
          d.imageX = d.frameX - (d.targetX - d.frameX) * LAG;
          if (Math.abs(d.targetX - d.frameX) <= 0.05) d.frameX = d.imageX = d.targetX;
        }
        m.position.set(d.frameX, 0, 0);
        m.material.uniforms.uShift.value = shiftOf(d);
        m.material.uniforms.uZoom.value = ZOOM;
        m.visible = Math.abs(d.frameX - dim.base) < (dim.w + dim.gap) * 3 + innerWidth;
      });
      // When the panel has fully stopped and there is no swipe or drag, do not draw — keep the GPU and main thread free while resting so the first drag response is not late
      if (moving.length || tr || dragging || dirty) { renderer.render(scene, cam); dirty = false; }
      raf = requestAnimationFrame(loop);
    };
    const ro = new ResizeObserver(layout);
    ro.observe(frame); ro.observe(stage);
    layout();
    progress(1 / n);
    raf = requestAnimationFrame(loop);
    requestAnimationFrame(() => el.classList.add("fx-lfc-ready"));

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      removeEventListener("keydown", key);
      frame.removeEventListener("pointerdown", down);
      frame.removeEventListener("click", click);
      sw?.destroy(true, true);
      meshes.forEach((m) => { m.material.uniforms.uTex.value.dispose(); m.material.dispose(); });
      geo.dispose(); renderer.dispose();
      el.classList.remove("fx-lfc-ready");
      stage.style.height = "";
      fill?.remove();
    };
  });
})();
