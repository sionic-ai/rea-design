// Printing press twin wheels — the left wheel holds 16:9 photo cards, the right wheel has a square plate in each slot (9 slots by default, 40°), mounted and rotating in mesh (three.js).
// Wheel: 1px moves .0011 slot and drag: 1px moves .0034 slot forward. Each frame it follows by .08 of the remaining distance, and on release it settles on the nearest slot.
// The front cell scales up 1.6× and the card bends like paper. When the front cell changes, fx:select(detail.index) fires — the consuming side changes the center text
(() => {
  kfFx.register("twin-wheel-cards", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!T || !items.length) return;
    const N = items.length;
    // Measured from the original screen — card wheel radius .93, side slot 60°, panel wheel radius .79, side slot 83°, and slots tilt by only .55 of their slot angle
    const rad = (v) => (v * Math.PI) / 180;
    const pitch = rad(+(options.pitch ?? 60)), pitchR = rad(+(options["pitch-r"] ?? 83));
    const R = +(options.radius ?? 0.93), RR = +(options["radius-r"] ?? 0.79), spin = +(options.spin ?? 0.55);
    const cardW = +(options.card ?? 0.64), plateW = +(options.plate ?? 0.28), focus = +(options.focus ?? 1.9), focusR = +(options["plate-focus"] ?? 1.1);
    const perWheel = +(options.wheel ?? 0.0011), perDrag = +(options.drag ?? 0.0034), damp = +(options.damp ?? 0.08) || 0.08;
    const bend = +(options.bend ?? 0.07), camZ = +(options.cam ?? 3.2), fov = +(options.fov ?? 36);
    const tiltX = (+(options["tilt-x"] ?? -5) * Math.PI) / 180, tiltY = (+(options["tilt-y"] ?? 14) * Math.PI) / 180;

    const canvas = document.createElement("canvas");
    canvas.dataset.fxPart = "canvas";
    el.prepend(canvas);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(fov, 1, 0.1, 50);
    camera.position.z = camZ;

    // Read skin colors via canvas — color-mix works too once it is a computed color
    const probe = document.createElement("i");
    probe.style.display = "none";
    el.append(probe);
    const cssColor = (v) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };

    // Card image — inside <img> If an image is present, draw it. Otherwise a skin-color placeholder (diagonal X + what to put in)
    const paint = (item, w, h, kind) => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const g = c.getContext("2d");
      const img = item.querySelector(kind === "plate" ? "img[data-plate]" : "img:not([data-plate])");
      const bg = cssColor("--kf-raised"), ink = cssColor("--kf-ink"), dim = cssColor("--kf-dim"), acc = cssColor("--kf-accent");
      if (kind === "plate") {
        const rim = g.createLinearGradient(0, 0, w, h);
        rim.addColorStop(0, dim); rim.addColorStop(0.3, acc); rim.addColorStop(0.55, ink); rim.addColorStop(0.8, dim); rim.addColorStop(1, acc);
        g.fillStyle = rim; g.fillRect(0, 0, w, h);
        g.fillStyle = cssColor("--kf-bg"); g.fillRect(w * 0.035, h * 0.035, w * 0.93, h * 0.93);
        g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle";
        g.font = `500 ${h * 0.34}px ${getComputedStyle(el).fontFamily}`;
        g.fillText(item.dataset.glyph || "A", w / 2, h / 2);
      } else {
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        g.strokeStyle = dim; g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
        g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle";
        g.font = `400 ${h * 0.06}px ${getComputedStyle(el).fontFamily}`;
        g.fillText(item.dataset.label || "", w / 2, h / 2);
      }
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      if (img) {
        const draw = () => { g.drawImage(img, 0, 0, w, h); t.needsUpdate = true; };
        img.complete && img.naturalWidth ? draw() : img.addEventListener("load", draw, { once: true });
      }
      return t;
    };

    // Card plate — split finely across the width so the edge curves back in the front cells
    const cardGeo = new T.PlaneGeometry(cardW, cardW / (16 / 9), 32, 1);
    const plateGeo = new T.PlaneGeometry(plateW, plateW, 1, 1);
    const flat = cardGeo.attributes.position.array.slice();
    const left = new T.Group(), right = new T.Group();
    scene.add(left, right);
    const cards = items.map((it) => {
      const m = new T.Mesh(cardGeo.clone(), new T.MeshBasicMaterial({ map: paint(it, 768, 432, "card"), transparent: true }));
      left.add(m);
      return m;
    });
    const plates = items.map((it) => {
      const m = new T.Mesh(plateGeo, new T.MeshBasicMaterial({ map: paint(it, 384, 384, "plate"), transparent: true }));
      right.add(m);
      return m;
    });
    const repaint = () => items.forEach((it, i) => {
      cards[i].material.map.dispose(); cards[i].material.map = paint(it, 768, 432, "card");
      plates[i].material.map.dispose(); plates[i].material.map = paint(it, 384, 384, "plate");
    });

    let pos = 0, target = 0, vel = 0, active = -1, idleAt = 0, drag = null, last = 0, raf = 0;
    let baseL = 0, baseR = Math.PI;
    const lean = +(options.lean ?? 1.6), rock = +(options.rock ?? 1.2), side = +(options.side ?? 1.4);
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPtr = (e) => { const r = el.getBoundingClientRect(); ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1; };
    const wrap = (d) => ((((d + N / 2) % N) + N) % N) - N / 2;
    const layout = () => {
      const w = el.clientWidth, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const halfH = Math.tan((fov * Math.PI) / 360) * camZ, halfW = halfH * camera.aspect;
      // Wide screens: the wheel center sits outside the left or right of the screen and the front slot faces the center / narrow screens: rotated upright beyond the top or bottom
      if (w < 768) {
        baseL = -Math.PI / 2; baseR = Math.PI / 2;
        const s = Math.min(1, (halfW * 2) / (cardW * focus * 1.08));
        left.scale.setScalar(s); right.scale.setScalar(s);
        const big = 1.7;
        left.position.set(0, halfH * 0.52 + R * s * big, 0); right.position.set(0, -halfH * 0.86 - RR * s * big, 0);
        left.userData.big = right.userData.big = big;
      } else {
        baseL = 0; baseR = Math.PI;
        left.scale.setScalar(1); right.scale.setScalar(1);
        left.position.set(-halfW * 0.555 - R, 0, 0); right.position.set(halfW * 0.31 + RR, 0, 0);
        left.userData.big = right.userData.big = 1;
      }
      const flat = w < 768 ? 0 : 1;
      left.rotation.set(tiltX, tiltY * flat, 0);
      right.rotation.set(tiltX, -tiltY * 0.6 * flat, 0);
    };
    const place = () => {
      cards.forEach((m, i) => {
        const d = wrap(i - pos), a = baseL + d * pitch, near = Math.max(0, 1 - Math.abs(d)), r = R * (left.userData.big || 1);
        const s = 1 + (focus - 1) * near * near * (3 - 2 * near);
        m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
        m.rotation.set(ptr.y * rock * 0.1 * near, ptr.x * lean * 0.1 * near, d * pitch * spin + ptr.x * side * 0.02 * near);
        m.scale.setScalar(s);
        m.material.opacity = Math.abs(d) > 2.6 ? 0 : 1;
        // Curves more toward the front — edges pulled back
        const p = m.geometry.attributes.position;
        for (let k = 0; k < p.count; k++) {
          const x = flat[k * 3] / (cardW / 2);
          p.setZ(k, -bend * near * x * x);
        }
        p.needsUpdate = true;
        m.renderOrder = Math.round(near * 10);
      });
      plates.forEach((m, i) => {
        const d = wrap(i - pos), a = baseR - d * pitchR, near = Math.max(0, 1 - Math.abs(d));
        const rr = RR * (right.userData.big || 1);
        m.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 0);
        m.rotation.set(ptr.y * rock * 0.1 * near, ptr.x * lean * 0.1 * near, -d * pitchR * spin - ptr.x * side * 0.02 * near);
        m.scale.setScalar(1 + (focusR - 1) * near * near * (3 - 2 * near));
        m.material.opacity = Math.abs(d) > 2.6 ? 0 : 1;
      });
    };
    const select = () => {
      const i = ((Math.round(pos) % N) + N) % N;
      if (i === active) return;
      active = i;
      items.forEach((it, k) => it.toggleAttribute("data-active", k === i));
      el.dispatchEvent(new CustomEvent("fx:select", { detail: { index: i, item: items[i] } }));
    };
    const frame = (t) => {
      const dt = Math.min(4, Math.max(1, (t - (last || t)) / 16.667));
      last = t;
      if (!drag && t - idleAt > 160) target = Math.round(target + vel * 6), vel = 0;
      pos += (target - pos) * (1 - Math.pow(1 - damp, dt));
      const k = 1 - Math.pow(1 - damp, dt);
      ptr.x += (ptr.tx - ptr.x) * k; ptr.y += (ptr.ty - ptr.y) * k;
      place();
      select();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    const onWheel = (e) => {
      e.preventDefault();
      target += (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * perWheel;
      idleAt = performance.now();
    };
    const onDown = (e) => {
      if (e.button > 0) return;
      drag = { x: e.clientX, y: e.clientY, t0: target, lastX: e.clientX, lastT: performance.now() };
      el.setPointerCapture?.(e.pointerId);
      el.classList.add("is-grabbing");
    };
    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      target = drag.t0 - (Math.abs(dy) > Math.abs(dx) ? dy : dx) * perDrag;
      const now = performance.now();
      vel = (-(e.clientX - drag.lastX) * perDrag) / Math.max(1, (now - drag.lastT) / 16.667);
      drag.lastX = e.clientX; drag.lastT = now;
      idleAt = now;
    };
    const onUp = () => { if (!drag) return; drag = null; el.classList.remove("is-grabbing"); idleAt = performance.now(); };
    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { target = Math.round(target) + 1; idleAt = 0; }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { target = Math.round(target) - 1; idleAt = 0; }
    };
    const onGo = (e) => { target = Math.round(target) + (e.detail?.step || 1); idleAt = 0; };
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    layout();
    place();
    renderer.compile(scene, camera);
    if (reduce) {
      select();
      renderer.render(scene, camera);
      const step = (e) => { if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.type === "fx:go") { pos = target = Math.round(pos) + 1; } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { pos = target = Math.round(pos) - 1; } else return; place(); select(); renderer.render(scene, camera); };
      el.addEventListener("keydown", step);
      el.addEventListener("fx:go", step);
      return () => { ro.disconnect(); el.removeEventListener("keydown", step); el.removeEventListener("fx:go", step); renderer.dispose(); canvas.remove(); probe.remove(); };
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    if (hover) addEventListener("pointermove", onPtr, { passive: true });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("keydown", onKey);
    el.addEventListener("fx:go", onGo);
    el.addEventListener("fx:repaint", repaint);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      removeEventListener("pointermove", onPtr);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("fx:go", onGo);
      el.removeEventListener("fx:repaint", repaint);
      [...cards, ...plates].forEach((m) => { m.material.map?.dispose(); m.material.dispose(); });
      renderer.dispose();
      canvas.remove();
      probe.remove();
    };
  });
})();
