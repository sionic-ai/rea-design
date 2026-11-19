// One column of photo panels stacked alternately vertical and horizontal is drawn in WebGL and spun endlessly with inertia by wheel, drag or arrow keys (the original Hero).
// Panel size follows the original grid cells (vertical panels = 2-column width × 1.5, landscape panel = 3-column width ÷ 1.75, halved if the two overlapped exceed 80% of the screen) and the gap between panels is 0.
// Wheel adds delta × .03 to velocity and cools it by .97 per frame (.92 on phone). .5s after release (1s for drag), the panel nearest the 25% mark of the screen on the side it is heading toward
// Snaps to the center with .8s power2.out. Images inside the plate are pushed up and down the farther they are from the center (distance relative to screen width × .6, horizontal × .4) and are held scaled to .8×.
// At first n panels overlap at the center as 8px dots, then spread into a single row at 32px spacing (from .5s to 1.75s) and fade from black to the image (2s), and from 2s to 2.5s
// Each becomes a pillar at its own size and in place — all power3.inOut. List names take .15~.95 opacity by circular distance from the center panel, and pressing the ”Horizontal” button turns the panel into a horizontal strip twice the size.
(() => {
  const VERT = `varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  // Covers and fills the image to the panel ratio (cover), shows only zoom around the center, shifts by the parallax amount, and covers with black by dim
  const FRAG = `varying vec2 vUv;
uniform sampler2D uMap;
uniform vec2 uImage;
uniform vec2 uPlane;
uniform vec2 uShift;
uniform float uZoom;
uniform float uDim;
uniform float uAlpha;
void main() {
  float pa = uPlane.x / uPlane.y;
  float ia = uImage.x / uImage.y;
  vec2 fit = vec2(min(pa / ia, 1.0), min(ia / pa, 1.0));
  vec2 uv = (vUv - 0.5) * fit + 0.5;
  uv = 0.5 + (uv - 0.5) * uZoom + uShift;
  vec3 c = texture2D(uMap, uv).rgb;
  gl_FragColor = vec4(mix(c, vec3(0.0), uDim), uAlpha);
}`;

  const cssVar = (el, name, fb) => getComputedStyle(el).getPropertyValue(name).trim() || fb;

  // Placeholder describing what goes in place of a photo — keeps the panel ratio, with a diagonal X and a label
  function placeholder(T, el, item, format) {
    const w = format === "portrait" ? 400 : 700, h = format === "portrait" ? 600 : 400;
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const g = cv.getContext("2d");
    // Brightness character of the photo — dark (dark photo)·mid (mid gray)·bright photo (default). Needs light and shade like the original photo for the columns to show
    const tone = item.getAttribute("data-tone");
    const dark = tone === "dark", mid = tone === "mid";
    g.fillStyle = cssVar(el, dark ? "--kf-contrast-bg" : mid ? "--kf-dim" : "--kf-raised", "transparent");
    g.fillRect(0, 0, w, h);
    g.strokeStyle = cssVar(el, dark ? "--kf-dim" : mid ? "--kf-bg" : "--kf-line", "transparent");
    g.globalAlpha = 0.25;
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    g.globalAlpha = 1;
    g.fillStyle = cssVar(el, dark ? "--kf-contrast-ink" : mid ? "--kf-bg" : "--kf-dim", "transparent");
    const fam = cssVar(el, "--kf-font-sans", "sans-serif");
    g.font = `500 20px ${fam}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const words = (item.getAttribute("data-label") || "").split(" · ");
    words.forEach((line, i) => g.fillText(line, w / 2, h / 2 + (i - (words.length - 1) / 2) * 28, w * 0.7));
    const tex = new T.CanvasTexture(cv);
    tex.minFilter = T.LinearFilter;
    return { tex, size: [w, h] };
  }

  // Whether the intro has finished once in this document — the original is a single-page app, so after the images are loaded, re-entering shows the pillars immediately without the dot intro
  let seenOnce = false;
  kfFx.register("pillar-gallery-gl", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!T || !items.length) return;
    const names = [...el.querySelectorAll('[data-fx-part="name"]')];
    const namesBox = el.querySelector('[data-fx-part="names"]');
    const toVert = el.querySelector('[data-fx-part="vertical"]');
    const toHorz = el.querySelector('[data-fx-part="horizontal"]');
    const loader = el.querySelector('[data-fx-part="loader"]');
    const after = [...el.querySelectorAll('[data-fx-part="after"]')];

    const wheelMul = +(options.wheel ?? 0.03), dragMul = +(options.drag ?? 0.1), touchMul = +(options.touch ?? 0.2);
    const snapDelay = +(options["snap-delay"] ?? 0.5) * 1000, dragDelay = +(options["drag-delay"] ?? 1) * 1000;
    const snapDur = +(options.snap ?? 0.8), snapEase = options["snap-ease"] || "power2.out";
    const shiftY = +(options.parallax ?? 0.6), shiftX = +(options["parallax-x"] ?? 0.4), zoomEnd = +(options.zoom ?? 0.8);
    const intro = reduce ? "none" : options.intro === "auto" ? (seenOnce ? "fade" : "dots") : options.intro || "dots";
    const wait = +(options.wait ?? 1.2), crossLabel = options.label || "OPEN PROJECT";
    const pickEase = kfFx.ease(options["pick-ease"] || "0.215,0.61,0.355,1", "power2.out");

    let canvas = el.querySelector('canvas[data-fx-part="canvas"]');
    const madeCanvas = !canvas;
    if (!canvas) { canvas = document.createElement("canvas"); canvas.setAttribute("data-fx-part", "canvas"); el.prepend(canvas); }
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true }); } catch (e) { return; }
    renderer.setClearColor(0, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(50, 1, 100, 1000);
    camera.position.set(0, 0, 500);
    const geo = new T.PlaneGeometry(1, 1, 1, 1);

    let W = 1, H = 1, mobile = false, vertical = true, sizes = null;
    const measure = () => {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
      mobile = W <= 768;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.fov = (360 * Math.atan(H / 2 / 500)) / Math.PI;
      camera.updateProjectionMatrix();
      // Original grid cells: at 1024 and up cell 7.731vw · gap .556vw, at 768~1023 cell 7.205vw · gap 1.042vw, below that cell 14.178vw · gap 2.133vw
      const col = W >= 1024 ? [0.07731, 0.00556] : W >= 768 ? [0.07205, 0.01042] : [0.14178, 0.02133];
      const span = (n) => (n * col[0] + (n - 1) * col[1]) * W;
      const room = 0.8 * H;
      const pw = mobile ? span(4) : span(2), lw = mobile ? W - 16 : span(3);
      const ph = !mobile && 1.5 * pw * 2 > room ? room / 2 : pw * (mobile ? 1.45 : 1.5);
      const lh = (lw / 1.75) * 2 > room ? room / 2 : lw / 1.75;
      sizes = { portrait: [pw, ph], landscape: [lw, lh] };
    };
    measure();

    const ref = Math.min(+(options.ref ?? 5), items.length - 1);
    const n = items.length;
    // Panel order: rotated so the first item sits at the ref spot (center) — the last items go above it, the second item onward below
    const order = items.map((_, e) => (n - ref + e) % n);
    const planes = order.map((idx) => {
      const item = items[idx];
      const format = item.getAttribute("data-format") === "portrait" ? "portrait" : "landscape";
      const img = item.querySelector("img");
      const ph = placeholder(T, el, item, format);
      const mat = new T.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true,
        uniforms: {
          uMap: { value: ph.tex }, uImage: { value: new T.Vector2(...ph.size) }, uPlane: { value: new T.Vector2(1, 1) },
          uShift: { value: new T.Vector2(0, 0) }, uZoom: { value: 0.4 }, uDim: { value: 1 }, uAlpha: { value: 1 },
        },
      });
      if (img) {
        const load = () => { const t = new T.Texture(img); t.needsUpdate = true; mat.uniforms.uMap.value = t; mat.uniforms.uImage.value.set(img.naturalWidth, img.naturalHeight); };
        img.complete && img.naturalWidth ? load() : img.addEventListener("load", load, { once: true });
      }
      const mesh = new T.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.userData = { idx, format, item, base: new T.Vector3() };
      scene.add(mesh);
      return mesh;
    });

    const sizeOf = (p) => sizes[p.userData.format];
    const along = (list, i, horiz) => {
      // Put the reference panel (ref) at 0 and join the panel sizes before and after (no gap)
      const len = (p) => (horiz ? sizeOf(p)[0] * 2 : sizeOf(p)[1]);
      if (i === ref) return 0;
      let d = len(list[ref]) / 2;
      if (i < ref) { for (let k = ref - 1; k > i; k--) d += len(list[k]); d += len(list[i]) / 2; return horiz ? -d : d; }
      for (let k = ref + 1; k < i; k++) d += len(list[k]);
      d += len(list[i]) / 2;
      return horiz ? d : -d;
    };
    let cycle = 0;
    const setBase = () => {
      planes.forEach((p, i) => { const v = along(planes, i, !vertical); p.userData.base.set(vertical ? 0 : v, vertical ? v : 0, 0); });
      cycle = planes.reduce((s, p) => s + (vertical ? sizeOf(p)[1] : sizeOf(p)[0] * 2), 0);
    };
    const axis = () => (vertical ? "y" : "x");
    const sign = () => (vertical ? 1 : -1);
    const apply = (off) => {
      if (cycle <= 0) return;
      const a = axis(), half = cycle / 2;
      for (const p of planes) {
        let v = p.userData.base[a] + sign() * off;
        v -= cycle * Math.floor((v + half) / cycle);
        p.position.copy(p.userData.base);
        p.position[a] = v;
      }
    };
    const toCenter = (p, now) => {
      const b = -sign() * p.userData.base[axis()];
      return b + cycle * Math.round((now - b) / cycle);
    };
    const nearest = (list = planes) => {
      let best = null, d = Infinity;
      for (const p of list) { const v = Math.abs(vertical ? p.position.y : p.position.x); if (v < d) { d = v; best = p; } }
      return best;
    };
    const fitScale = (p, k = vertical ? 1 : 2) => {
      const [w, h] = sizeOf(p);
      p.material.uniforms.uPlane.value.set(w, h);
      p.scale.set(w * k, h * k, 1);
    };

    const st = { offset: 0, delta: 0, ready: false, busy: false, active: null, snap: null, timer: 0, lastName: -1, hoverActive: false };
    const decay = () => (mobile ? 0.92 : 0.97);

    const emit = () => el.dispatchEvent(new CustomEvent("fx:pillar-gallery-gl", { detail: { index: st.active ? st.active.userData.idx : -1, vertical } }));
    const killSnap = () => { st.snap?.kill(); st.snap = null; };
    const clearTimer = () => { clearTimeout(st.timer); st.timer = 0; };
    const snapTo = (p, dur = snapDur, ease = snapEase) => {
      if (!p || st.busy || !st.ready) return;
      killSnap(); clearTimer();
      st.delta = 0;
      st.snap = gsap.to(st, { offset: toCenter(p, st.offset), duration: reduce ? 0 : dur, ease, onComplete: () => { st.snap = null; st.active = p; emit(); } });
    };
    const scheduleSnap = (ms) => {
      clearTimer();
      st.timer = setTimeout(() => {
        st.timer = 0;
        if (st.busy) return;
        const ahead = st.delta > 0;
        const at = vertical ? (ahead ? -0.25 * H : 0.25 * H) : ahead ? 0.25 * W : -0.25 * W;
        let best = null, d = Infinity;
        for (const p of planes) { const v = Math.abs((vertical ? p.position.y : p.position.x) - at); if (v < d) { d = v; best = p; } }
        snapTo(best);
      }, ms);
    };

    // List name weight — fades with the cube of the circular distance between the center plate and the list order, up to 4 steps
    const paintNames = (force) => {
      if (!names.length || !vertical) return;
      const p = nearest();
      if (!p) return;
      const s = p.userData.idx;
      if (s === st.lastName && !force) return;
      st.lastName = s;
      const m = names.length;
      names.forEach((li, i) => {
        if (li.dataset.fxHovered === "1") return;
        const d = Math.abs(i - s);
        const a = 0.15 + 0.8 * Math.pow(1 - Math.min(Math.min(d, m - d) / 4, 1), 3);
        gsap.to(li, { opacity: a, duration: reduce ? 0 : 1, ease: "power3.out", overwrite: "auto" });
      });
    };

    let seen = true;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);

    const ray = new T.Raycaster(), ptr = new T.Vector2(1e4, 1e4);
    const pick = () => { ray.setFromCamera(ptr, camera); const hit = ray.intersectObjects(planes); return hit.length ? hit[0].object : null; };

    const ac = new AbortController(), sig = { signal: ac.signal };
    const drag = { on: false, t0: 0, dist: 0, x: 0, y: 0 };
    const isClick = () => drag.dist <= 5 && Date.now() - drag.t0 < 300;

    // The wheel is taken from the whole window (original) — it turns even when scrolled over the header or list. If the panel is off screen, hand it to the page
    addEventListener("wheel", (e) => {
      if (st.busy || !st.ready || !seen) return;
      e.preventDefault();
      const d = !vertical && Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      killSnap();
      st.delta += d * wheelMul;
      st.active = null;
      scheduleSnap(snapDelay);
    }, { signal: ac.signal, passive: false });
    // Pointer position and dragging are taken from the whole document (original) — if a board sits below the header row, hover and drag work there too
    addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      if (!drag.on || st.busy || e.pointerType === "touch") return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.dist += Math.hypot(dx, dy);
      drag.x = e.clientX; drag.y = e.clientY;
      if (drag.dist <= 5) return;
      killSnap();
      st.delta -= (vertical ? dy : dx) * dragMul;
      st.active = null;
    }, sig);
    el.addEventListener("pointerleave", () => ptr.set(1e4, 1e4), sig);
    addEventListener("pointerdown", (e) => {
      if (st.busy || !seen || e.target.closest('[data-fx-part="name"],[data-fx-part="vertical"],[data-fx-part="horizontal"],a,button')) return;
      drag.on = true; drag.t0 = Date.now(); drag.dist = 0; drag.x = e.clientX; drag.y = e.clientY;
      clearTimer();
    }, sig);
    addEventListener("pointerup", () => { if (!drag.on) return; drag.on = false; if (!isClick()) scheduleSnap(dragDelay); }, sig);
    // Touch devices swipe — vertical swipes on the panel are this part’s job so they don’t go to the page (the panel covers one section)
    el.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      drag.on = true; drag.t0 = Date.now(); drag.dist = 0; drag.x = e.touches[0].clientX; drag.y = e.touches[0].clientY;
      clearTimer();
    }, { signal: ac.signal, passive: true });
    el.addEventListener("touchmove", (e) => {
      if (!drag.on || st.busy) return;
      const t = e.touches[0], dx = t.clientX - drag.x, dy = t.clientY - drag.y;
      drag.dist += Math.hypot(dx, dy); drag.x = t.clientX; drag.y = t.clientY;
      killSnap();
      st.delta -= (vertical ? dy : dx) * touchMul;
      st.active = null;
    }, { signal: ac.signal, passive: true });
    el.addEventListener("touchend", () => { drag.on = false; }, sig);
    addEventListener("click", (e) => {
      if (st.busy || !st.ready || !seen || e.target.closest("a,button,header,[role='dialog'],[data-fx-part='name'],[data-fx-part='vertical'],[data-fx-part='horizontal']") || !isClick()) return;
      const r = el.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      const p = pick();
      if (!p) return;
      if (mobile || st.active === p) {
        const href = p.userData.item.getAttribute("data-href");
        el.dispatchEvent(new CustomEvent("fx:open", { detail: { index: p.userData.idx, href } }));
        if (href) location.href = href;
        return;
      }
      snapTo(p);
    }, sig);
    addEventListener("keydown", (e) => {
      if (st.busy || st.snap || !st.ready || !el.isConnected) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      if (e.key === "Enter" && st.active) { const href = st.active.userData.item.getAttribute("data-href"); el.dispatchEvent(new CustomEvent("fx:open", { detail: { index: st.active.userData.idx, href } })); if (href) location.href = href; return; }
      const keys = vertical ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const cur = nearest();
      const sorted = [...planes].sort((a, b) => (vertical ? b.position.y - a.position.y : a.position.x - b.position.x));
      const k = sorted.indexOf(cur);
      snapTo(e.key === "ArrowDown" || e.key === "ArrowRight" ? sorted[k + 1] : sorted[k - 1]);
    }, sig);

    names.forEach((li) => {
      li.addEventListener("click", (e) => {
        e.preventDefault();
        const i = names.indexOf(li);
        const p = planes.find((q) => q.userData.idx === i);
        const cur = nearest();
        if (!p) return;
        const dur = Math.min(Math.max((cur ? cur.position.distanceTo(p.position) : 0) / 450, 1), 1.5);
        snapTo(p, dur, pickEase);
      }, sig);
      if (!hover) return;
      li.addEventListener("pointerenter", () => { li.dataset.fxHovered = "1"; gsap.to(li, { opacity: 0.75, duration: 0.5, ease: "power2.out" }); }, sig);
      li.addEventListener("pointerleave", () => { li.dataset.fxHovered = "0"; st.lastName = -1; paintNames(true); }, sig);
    });

    // Vertical column ↔ horizontal strip — plates farthest from the center plate move first, in .06s steps, reaching the new position and new size (double for horizontal) in 1.5s power3.inOut
    const toggle = (toVertical) => {
      if (st.busy || !st.ready || vertical === toVertical) return;
      st.busy = true;
      if (toVert) gsap.to(toVert, { opacity: toVertical ? 1 : 0.3, duration: 1, ease: "power3.out" });
      if (toHorz) gsap.to(toHorz, { opacity: toVertical ? 0.3 : 1, duration: 1, ease: "power3.out" });
      if (namesBox) {
        namesBox.style.pointerEvents = toVertical ? "auto" : "none";
        gsap.to(namesBox, { opacity: toVertical ? 1 : 0, duration: toVertical ? 2 : 1, delay: toVertical ? 0.75 : 0 });
      }
      killSnap(); clearTimer();
      const cur = nearest();
      const at = planes.indexOf(cur);
      const shift = at - ref;
      const next = planes.map((_, e) => planes[(e + shift + n) % n]);
      const was = vertical;
      vertical = toVertical;
      const targets = next.map((_, i) => along(next, i, !toVertical));
      vertical = was;
      const k = toVertical ? 1 : 2, half = Math.floor(n / 2);
      const tl = gsap.timeline({
        defaults: { duration: reduce ? 0 : 1.5, ease: "power3.inOut" },
        onComplete: () => {
          planes.splice(0, n, ...next);
          vertical = toVertical;
          planes.forEach((p) => fitScale(p));
          setBase(); st.offset = 0; st.delta = 0; apply(0);
          st.lastName = -1; st.busy = false;
          emit();
        },
      });
      next.forEach((p, i) => {
        const far = Math.abs(i - ref), lag = 0.06 * (half - Math.min(far, n - far));
        tl.to(p.position, { x: toVertical ? 0 : targets[i], y: toVertical ? targets[i] : 0, z: 0 }, lag);
        tl.to(p.scale, { x: sizeOf(p)[0] * k, y: sizeOf(p)[1] * k, z: 1 }, lag);
      });
    };
    toVert?.addEventListener("click", () => toggle(true), sig);
    toHorz?.addEventListener("click", () => toggle(false), sig);

    // Start — n dots spread into a line, then stand up as columns
    planes.forEach((p) => fitScale(p, 1));
    setBase();
    const intros = [];
    const finish = () => { st.ready = true; seenOnce = true; st.active = planes[ref]; emit(); };
    const reveal = (tl, at) => {
      const half = n / 2;
      if (namesBox) tl.to(namesBox, { opacity: 1, pointerEvents: "all", duration: 0.01 }, at + 0.05 * half);
      names.forEach((li, i) => tl.fromTo(li, { y: 5, opacity: 0, filter: "blur(5px)" }, { y: 0, filter: "blur(0px)", opacity: i === 0 ? 1 : 0.3, duration: 2, ease: "power2.inOut" }, at + (i % half) * 0.04));
    };
    const toggles = (tl, at) => {
      if (toVert) tl.fromTo(toVert, { y: 5, opacity: 0, filter: "blur(5px)" }, { y: 0, filter: "blur(0px)", opacity: 1, duration: 2, ease: "power2.inOut" }, at + 2.35);
      if (toHorz) tl.fromTo(toHorz, { y: 5, opacity: 0, filter: "blur(5px)" }, { y: 0, filter: "blur(0px)", opacity: 0.3, duration: 2, ease: "power2.inOut" }, at + 2.35);
    };
    // fade — when re-entering with the image already loaded (original animateInLoaded): the in-place column appears over 2s while stepping back .7 → .8, and the list starts at .75s
    if (intro === "fade") {
      const tl = gsap.timeline({ onComplete: finish });
      intros.push(tl);
      loader?.remove();
      if (namesBox) gsap.set(namesBox, { opacity: 0, pointerEvents: "none" });
      apply(0);
      planes.forEach((p) => {
        tl.fromTo(p.material.uniforms.uAlpha, { value: 0 }, { value: 1, duration: 2, ease: "power3.inOut" }, 0);
        tl.fromTo(p.material.uniforms.uZoom, { value: 0.7 }, { value: zoomEnd, duration: 2, ease: "power3.inOut" }, 0);
        tl.to(p.material.uniforms.uDim, { value: 0, duration: 0.1, ease: "power4.out" }, 0.1);
      });
      reveal(tl, 0.75);
      toggles(tl, 0);
      if (after.length) tl.fromTo(after, { opacity: 0 }, { opacity: 1, duration: 2, ease: "power3.inOut" }, 0);
    } else if (intro === "none") {
      planes.forEach((p) => { p.material.uniforms.uZoom.value = zoomEnd; p.material.uniforms.uDim.value = 0; });
      apply(0);
      if (namesBox) gsap.set(namesBox, { opacity: 1, pointerEvents: "all" });
      names.forEach((li, i) => gsap.set(li, { opacity: i === 0 ? 1 : 0.3 }));
      if (toVert) gsap.set(toVert, { opacity: 1 });
      if (toHorz) gsap.set(toHorz, { opacity: 0.3 });
      if (after.length) gsap.set(after, { opacity: 1 });
      loader?.remove();
      finish();
    } else {
      planes.forEach((p) => { p.scale.set(8, 8, 1); p.position.set(0, 0, 0); });
      if (namesBox) gsap.set(namesBox, { opacity: 0, pointerEvents: "none" });
      if (after.length) gsap.set(after, { opacity: 0 });
      // Loading cell — the original waits 1.2s, then the cell fills from the bottom as images arrive. Once all are loaded the cell vanishes in 1.5s and the plates start moving
      const fillDur = +(options.fill ?? 0.3);
      const run = () => {
        const tl = gsap.timeline({ onComplete: finish });
        intros.push(tl);
        const span = -((n - 1) * 32) / 2;
        planes.forEach((p, i) => {
          tl.fromTo(p.position, { x: 0, y: 0, z: 0 }, { x: span + 32 * i, y: 0, z: 0, duration: 1.75, ease: "power3.inOut" }, 0.5);
          tl.to(p.material.uniforms.uDim, { value: 0, duration: 2, ease: "power3.inOut" }, 0.5);
          tl.to(p.scale, { x: sizeOf(p)[0], y: sizeOf(p)[1], duration: 2.5, ease: "power3.inOut" }, 2);
          tl.to(p.material.uniforms.uZoom, { value: zoomEnd, duration: 2.5, ease: "power3.inOut" }, 2);
          tl.to(p.position, { x: p.userData.base.x, y: p.userData.base.y, z: 0, duration: 2.5, ease: "power3.inOut" }, 2);
        });
        reveal(tl, 2.75);
        toggles(tl, 0.5);
        if (after.length) tl.fromTo(after, { opacity: 0 }, { opacity: 1, duration: 2, ease: "power3.inOut" }, 5);
      };
      const bar = loader?.firstElementChild;
      if (loader && bar) {
        const tl = gsap.timeline({ delay: wait });
        intros.push(tl);
        tl.to(bar, { scaleY: 1, duration: fillDur, ease: `steps(${n})` })
          .add(run)
          .to(loader, { opacity: 0, duration: 1.5, ease: "power3.out", onComplete: () => loader.remove() });
      } else {
        intros.push(gsap.delayedCall(loader ? wait : 0, run));
      }
    }

    const ro = new ResizeObserver(() => {
      const keep = nearest();
      measure();
      if (!st.ready || st.busy) return;
      planes.forEach((p) => fitScale(p));
      setBase();
      killSnap(); clearTimer(); st.delta = 0;
      st.offset = keep ? -sign() * keep.userData.base[axis()] : 0;
      apply(st.offset);
      st.lastName = -1;
    });
    ro.observe(el);


    const tick = (time, dt) => {
      if (!seen) return;
      const f = Math.max(1, dt) / (1000 / 60);
      if (st.ready && !st.busy) {
        st.offset += st.delta * f;
        st.delta *= Math.pow(decay(), f);
        if (Math.abs(st.delta) < 0.001) st.delta = 0;
        apply(st.offset);
      } else if (st.busy) st.delta = 0;
      paintNames(false);
      if (!mobile) {
        for (const p of planes) {
          const u = p.material.uniforms.uShift.value;
          u.set(shiftX * Math.max(-1, Math.min(1, (p.position.x - camera.position.x) / W)), shiftY * Math.max(-1, Math.min(1, (p.position.y - camera.position.y) / W)));
        }
      }
      if (st.ready && !st.busy && hover) {
        const p = pick();
        const onActive = !!p && p === st.active;
        if (onActive !== st.hoverActive) {
          st.hoverActive = onActive;
          document.dispatchEvent(new CustomEvent("fx:crosshair", { detail: { on: onActive, label: p?.userData.item.getAttribute("data-crosshair") || crossLabel } }));
        }
        el.style.cursor = p ? "pointer" : "";
      }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      ac.abort(); ro.disconnect(); io.disconnect();
      gsap.ticker.remove(tick);
      intros.forEach((t) => t.kill());
      killSnap(); clearTimer();
      planes.forEach((p) => { gsap.killTweensOf([p.position, p.scale, ...Object.values(p.material.uniforms)]); p.material.uniforms.uMap.value?.dispose(); p.material.dispose(); });
      geo.dispose(); renderer.dispose();
      if (madeCanvas) canvas.remove();
      gsap.killTweensOf([...names, namesBox, toVert, toHorz, ...after].filter(Boolean));
      el.style.cursor = "";
    };
  });
})();
