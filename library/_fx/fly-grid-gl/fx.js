// Lays photo/video panels out in a cols × rows grid and wraps endlessly in all directions by wheel and drag (reference playground), and pressing one flies the camera into that panel.
// Panel width is one cell of the original grid (7.731vw at 1024 and above), gap between panels is cell width plus two gaps. Height 1.33 for portrait, 1 for square, .66 for landscape panels.
// At first monochrome, transparent and 1.5x scaled, overlapping, then they appear at random between .5~1.25s over 2s (power3.out), and from 1.25s the scale relaxes over 2.25s (power3.inOut)
// color returns over 2s from 2.25s. Meanwhile from 1.5s the gap opens from 8 to its own spacing in 2s power4.inOut, and the camera comes down from +200 over 2s starting at 1.3s.
// The wheel adds pixel delta × .05 to velocity, drag × .1 (finger × .3), and it cools by .95 each frame. While dragging, the camera moves closer from 500 → 475 (1 − .975 per frame).
(() => {
  const VERT = `varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const FRAG = `varying vec2 vUv;
uniform sampler2D uMap;
uniform vec2 uImage;
uniform vec2 uPlane;
uniform float uAlpha;
uniform float uGray;
uniform float uZoom;
void main() {
  vec2 uv = 0.5 + (vUv - 0.5) / uZoom;
  float pa = uPlane.x / uPlane.y, ia = uImage.x / uImage.y;
  if (ia > pa) uv.x = (uv.x - 0.5) * (pa / ia) + 0.5; else uv.y = (uv.y - 0.5) * (ia / pa) + 0.5;
  vec4 c = texture2D(uMap, uv);
  float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  c.rgb = mix(c.rgb, vec3(l), uGray);
  c.a *= uAlpha;
  gl_FragColor = c;
}`;
  const RATIO = { portrait: 1.33, square: 1, landscape: 0.66 };
  const cssVar = (el, name, fb) => getComputedStyle(el).getPropertyValue(name).trim() || fb;

  // Placeholder noting the photo or video to go there — for video slots the bar below fills once every 4s, looping endlessly (autoplay · loop)
  function slate(T, el, item) {
    const fmt = RATIO[item.getAttribute("data-format")] ? item.getAttribute("data-format") : "square";
    const w = 300, h = Math.round(300 * RATIO[fmt]);
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const g = cv.getContext("2d");
    const tone = item.getAttribute("data-tone"), dark = tone === "dark", mid = tone === "mid";
    const video = item.hasAttribute("data-video");
    const bg = cssVar(el, dark ? "--kf-contrast-bg" : mid ? "--kf-dim" : "--kf-raised", "transparent");
    const ink = cssVar(el, dark ? "--kf-contrast-ink" : mid ? "--kf-bg" : "--kf-dim", "transparent");
    const line = cssVar(el, dark ? "--kf-dim" : mid ? "--kf-bg" : "--kf-line", "transparent");
    const fam = cssVar(el, "--kf-font-sans", "sans-serif");
    const words = (item.getAttribute("data-label") || "").split(" · ");
    const draw = (t) => {
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.strokeStyle = line; g.globalAlpha = 0.25; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
      g.globalAlpha = 1; g.fillStyle = ink;
      g.font = `500 14px ${fam}`; g.textAlign = "center"; g.textBaseline = "middle";
      words.forEach((s, i) => g.fillText(s, w / 2, h / 2 + (i - (words.length - 1) / 2) * 20, w * 0.8));
      if (video) { g.fillRect(12, h - 14, (w - 24) * ((t % 4) / 4), 2); g.globalAlpha = 0.3; g.fillRect(12, h - 14, w - 24, 2); g.globalAlpha = 1; }
    };
    draw(0);
    const tex = new T.CanvasTexture(cv);
    tex.minFilter = T.LinearFilter;
    return { tex, size: [w, h], fmt, draw: video ? draw : null };
  }

  kfFx.register("fly-grid-gl", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!T || !items.length) return;
    const loader = el.querySelector('[data-fx-part="loader"]');
    const hint = el.querySelector('[data-fx-part="hint"]');
    const cols = Math.max(2, +(options.cols ?? 20) || 20), rows = Math.max(2, +(options.rows ?? 8) || 8);
    const wheelMul = +(options.wheel ?? 0.05), dragMul = +(options.drag ?? 0.1), touchMul = +(options.touch ?? 0.3), decay = +(options.decay ?? 0.95);
    const near = +(options.near ?? 475), far = +(options.far ?? 500), fly = +(options.fly ?? 166.66667);
    const wait = reduce ? 0 : +(options.wait ?? 1.2), fillDur = +(options.fill ?? 0.3);
    const flyDur = reduce ? 0 : +(options["fly-dur"] ?? 1.75);

    let canvas = el.querySelector('canvas[data-fx-part="canvas"]');
    const madeCanvas = !canvas;
    if (!canvas) { canvas = document.createElement("canvas"); canvas.setAttribute("data-fx-part", "canvas"); el.prepend(canvas); }
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true }); } catch (e) { return; }
    renderer.setClearColor(0, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(50, 1, 100, 1000);
    camera.position.set(0, 0, far);

    let W = 1, H = 1, size = 100, gap = 0;
    const measure = () => {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.fov = (360 * Math.atan(H / 2 / 500)) / Math.PI;
      camera.updateProjectionMatrix();
      const col = W >= 1024 ? [0.07731, 0.00556] : W >= 768 ? [0.07205, 0.01042] : [0.14178, 0.02133];
      const span = (k) => (k * col[0] + (k - 1) * col[1]) * W;
      size = W > 768 && W <= 1024 ? span(2) : span(1);
      return 2 * col[1] * W + size;
    };
    let target = measure();
    gap = target;

    // So the same picture never lands on an adjacent cell (diagonals included) — offset by 5 per column and 7 per row
    const slates = items.map((it) => slate(T, el, it));
    const planes = [];
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const k = (c * 5 + r * 7) % items.length;
      const s = slates[k];
      const mat = new T.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true,
        uniforms: { uMap: { value: s.tex }, uImage: { value: new T.Vector2(...s.size) }, uPlane: { value: new T.Vector2(1, 1) }, uAlpha: { value: 0 }, uGray: { value: 1 }, uZoom: { value: 1.5 } },
      });
      const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat);
      mesh.userData = { c, r, k, fmt: s.fmt, item: items[k] };
      scene.add(mesh);
      planes.push(mesh);
    }
    let limits = { x: 1, y: 1 };
    const layout = (g) => {
      gap = g;
      const pw = size + gap, ph = size * 1.33 + gap, mw = cols * pw, mh = rows * ph;
      for (const p of planes) {
        const h = size * RATIO[p.userData.fmt];
        p.scale.set(size, h, 1);
        p.material.uniforms.uPlane.value.set(size, h);
        p.position.x = p.userData.c * pw + pw / 2 - mw / 2;
        p.position.y = -(p.userData.r * ph + ph / 1.5 - mh / 2) + (ph - h) / 2;
      }
      limits = { x: mw / 2, y: mh / 2 };
    };

    const st = { ready: false, active: null, opened: false, moving: false, hovered: null, onActive: false, hoverTimer: 0 };
    const vel = { x: 0, y: 0 };
    const drag = { on: false, moved: false, x: 0, y: 0, vx: 0, vy: 0, dist: 0, t0: 0, block: 0 };
    const tweens = [];
    const cross = (on, label) => document.dispatchEvent(new CustomEvent("fx:crosshair", { detail: { on, label } }));

    const reset = (soft) => {
      if (!st.active) return;
      const delay = soft ? 0 : 0.2, ease = soft ? "power2.out" : "power3.inOut";
      if (hint) gsap.to(hint, { opacity: 0, duration: 1.75, ease });
      planes.forEach((p) => gsap.to(p.material.uniforms.uAlpha, { value: 1, duration: 1.7, delay, ease }));
      gsap.to(camera.position, { z: far, duration: 2, ease, onComplete: () => { st.opened = false; } });
      st.active = null;
      el.dispatchEvent(new CustomEvent("fx:fly-grid-gl", { detail: { open: false } }));
    };
    const softReset = () => { if (!st.active) return; reset(true); planes.forEach((p) => gsap.killTweensOf(p.position)); };
    const flyTo = (p, dur, fade) => {
      st.moving = true;
      cross(false);
      const dx = -p.position.x, dy = -p.position.y;
      planes.forEach((q) => {
        gsap.to(q.position, { x: q.position.x + dx, y: q.position.y + dy, duration: dur, ease: "power3.inOut", onComplete: () => { st.active = p; st.moving = false; } });
        gsap.to(q.material.uniforms.uAlpha, { value: q === p ? 1 : 0, duration: fade, ease: "power3.inOut" });
      });
      el.dispatchEvent(new CustomEvent("fx:fly-grid-gl", { detail: { open: true, index: p.userData.k, href: p.userData.item.getAttribute("data-href") } }));
    };

    let seen = true;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);
    const ray = new T.Raycaster(), ptr = new T.Vector2(1e4, 1e4);
    const pick = () => { ray.setFromCamera(ptr, camera); const h = ray.intersectObjects(planes); return h.length ? h[0].object : null; };
    const setPtr = (e) => { const r = el.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };

    const ac = new AbortController(), sig = { signal: ac.signal };
    addEventListener("wheel", (e) => {
      if (!seen) return;
      e.preventDefault();
      const k = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1;
      if (st.active) softReset();
      vel.x += e.deltaX * k * wheelMul;
      vel.y += e.deltaY * k * wheelMul;
    }, { signal: ac.signal, passive: false });
    // Pointer position, drag and press are taken from the whole document (original) — hover also applies to the board below the header line
    addEventListener("pointerdown", (e) => {
      if (!st.ready || !seen || e.pointerType === "touch" || e.target.closest("a,button")) return;
      Object.assign(drag, { on: true, moved: false, x: e.clientX, y: e.clientY, dist: 0, t0: Date.now() });
    }, sig);
    addEventListener("pointermove", (e) => {
      setPtr(e);
      if (!drag.on || e.pointerType === "touch") return;
      if (st.active) softReset();
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.dist += Math.hypot(dx, dy);
      if (drag.dist > 5) drag.moved = true;
      drag.vx = dx; drag.vy = dy;
      vel.x -= dx * dragMul; vel.y -= dy * dragMul;
      drag.x = e.clientX; drag.y = e.clientY;
    }, sig);
    el.addEventListener("pointerleave", () => ptr.set(1e4, 1e4), sig);
    const release = (mul) => {
      if (!drag.on) return;
      drag.on = false;
      if (drag.moved) { drag.block = Date.now() + 100; vel.x -= drag.vx * mul * 2; vel.y -= drag.vy * mul * 2; }
      drag.vx = drag.vy = 0; drag.moved = false;
    };
    addEventListener("pointerup", (e) => { if (e.pointerType !== "touch") release(dragMul); }, sig);
    el.addEventListener("touchstart", (e) => {
      if (!st.ready || e.touches.length !== 1) return;
      Object.assign(drag, { on: true, moved: false, x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0, t0: Date.now() });
    }, { signal: ac.signal, passive: true });
    el.addEventListener("touchmove", (e) => {
      if (!drag.on || e.touches.length !== 1) return;
      const t = e.touches[0], dx = t.clientX - drag.x, dy = t.clientY - drag.y;
      drag.dist += Math.hypot(dx, dy);
      if (drag.dist > 5) drag.moved = true;
      drag.vx = dx; drag.vy = dy;
      vel.x -= dx * touchMul; vel.y -= dy * touchMul;
      drag.x = t.clientX; drag.y = t.clientY;
    }, { signal: ac.signal, passive: true });
    el.addEventListener("touchend", () => release(touchMul), { signal: ac.signal, passive: true });
    addEventListener("click", (e) => {
      if (!st.ready || !seen || e.target.closest("a,button,header,[role='dialog']") || drag.moved || Date.now() < drag.block) return;
      setPtr(e);
      const p = pick();
      if (!p) { if (st.active) reset(false); return; }
      const href = p.userData.item.getAttribute("data-href");
      if (st.active === p) { if (href) { cross(false); open(href, "_blank", "noopener,noreferrer"); } return; }
      if (st.opened) { reset(false); return; }
      st.opened = true;
      flyTo(p, flyDur, reduce ? 0 : 1.7);
      if (hint) gsap.to(hint, { opacity: 1, duration: flyDur, ease: "power3.inOut" });
      gsap.killTweensOf(camera.position);
      gsap.to(camera.position, { z: fly, duration: flyDur, ease: "power3.inOut" });
    }, sig);
    addEventListener("keydown", (e) => {
      if (!el.isConnected) return;
      if (e.key === "Escape") { reset(false); return; }
      if (!st.active || st.moving) return;
      const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d) return;
      e.preventDefault();
      if (hint) gsap.to(hint, { opacity: 0, duration: 1.75, ease: "power3.inOut" });
      const c = (st.active.userData.c + d[0] + cols) % cols, r = (st.active.userData.r + d[1] + rows) % rows;
      const p = planes.find((q) => q.userData.c === c && q.userData.r === r);
      if (p) flyTo(p, reduce ? 0 : 1, reduce ? 0 : 0.9);
    }, sig);

    const begin = () => {
      if (reduce) {
        layout(target);
        planes.forEach((p) => { const u = p.material.uniforms; u.uAlpha.value = 1; u.uGray.value = 0; u.uZoom.value = 1; });
        st.ready = true;
        return;
      }
      layout(8);
      planes.forEach((p) => {
        tweens.push(gsap.to(p.material.uniforms.uAlpha, { value: 1, duration: 2, ease: "power3.out", delay: 0.75 * Math.random() + 0.5 }));
        tweens.push(gsap.to(p.material.uniforms.uGray, { value: 0, duration: 2, ease: "power3.out", delay: 2.25 }));
        tweens.push(gsap.to(p.material.uniforms.uZoom, { value: 1, duration: 2.25, ease: "power3.inOut", delay: 1.25 }));
      });
      const g = { v: 8 };
      tweens.push(gsap.to(g, { v: target, duration: 2, delay: 1.5, ease: "power4.inOut", onUpdate: () => layout(g.v), onComplete: () => { st.ready = true; } }));
      tweens.push(gsap.fromTo(camera.position, { z: far + 200 }, { z: far, duration: 2, delay: 1.3, ease: "power4.inOut" }));
    };
    layout(8);
    // Loading cell — after waiting 1.2s it fills from below, and when full the panel starts to enter, while the cell shrinks upward over 1s after 1s and disappears
    const bar = loader?.firstElementChild;
    if (loader && bar && !reduce) {
      const tl = gsap.timeline({ delay: wait });
      tweens.push(tl);
      tl.to(bar, { scaleY: 1, duration: fillDur, ease: `steps(${items.length})` })
        .add(begin)
        .set(bar, { transformOrigin: "top" })
        .to(bar, { scaleY: 0, duration: 1, delay: 1, ease: "power2.out", onComplete: () => loader.remove() });
    } else { loader?.remove(); tweens.push(gsap.delayedCall(wait, begin)); }

    const ro = new ResizeObserver(() => { target = measure(); if (st.ready) layout(target); });
    ro.observe(el);
    const lerp = (a, b, k) => (Math.abs(a - b) < 0.001 ? b : (1 - k) * a + k * b);

    const tick = (time, dt) => {
      if (!seen) return;
      const f = Math.max(1, dt) / (1000 / 60);
      if (st.ready) {
        if (!st.opened) camera.position.z = lerp(camera.position.z, drag.on ? near : far, 1 - Math.pow(0.975, f));
        const k = Math.pow(decay, f);
        vel.x *= k; vel.y *= k;
        for (const p of planes) {
          p.position.x -= vel.x * f;
          p.position.y += vel.y * f;
          if (p.position.x > limits.x) p.position.x -= 2 * limits.x;
          if (p.position.x < -limits.x) p.position.x += 2 * limits.x;
          if (p.position.y > limits.y) p.position.y -= 2 * limits.y;
          if (p.position.y < -limits.y) p.position.y += 2 * limits.y;
        }
        if (hover) {
          const p = pick();
          if (p) {
            const isActive = st.active === p, href = p.userData.item.getAttribute("data-href");
            if (!isActive && st.hovered !== p) {
              st.hovered = p;
              clearTimeout(st.hoverTimer);
              st.hoverTimer = setTimeout(() => { if (st.hovered === p) cross(true, options.label || "VIEW"); }, 200);
            }
            if (isActive !== st.onActive) {
              st.onActive = isActive;
              if (isActive) { clearTimeout(st.hoverTimer); href ? cross(true, options.open || "OPEN URL") : cross(false); }
            }
            el.style.cursor = href || !isActive ? "pointer" : "";
          } else {
            if (st.onActive || st.hovered) { clearTimeout(st.hoverTimer); cross(false, ""); }
            st.onActive = false; st.hovered = null; el.style.cursor = "";
          }
        }
      }
      for (const s of slates) if (s.draw) { s.draw(time); s.tex.needsUpdate = true; }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      ac.abort(); ro.disconnect(); io.disconnect();
      gsap.ticker.remove(tick);
      clearTimeout(st.hoverTimer);
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(camera.position);
      planes.forEach((p) => { gsap.killTweensOf([p.position, ...Object.values(p.material.uniforms)]); p.geometry.dispose(); p.material.dispose(); });
      slates.forEach((s) => s.tex.dispose());
      renderer.dispose();
      if (madeCanvas) canvas.remove();
      if (hint) gsap.killTweensOf(hint);
      el.style.cursor = "";
    };
  });
})();
