// Ring seen from inside: a three.js camera (fov 26) sits 280 inside the ring’s front edge, and N cards (600×600, corner 44) stand around a radius of 2800 facing inward (name strip below).
// Spins by itself .00035rad per frame, dragging moves the target .0015rad per 1px and the actual rotation follows by .05 per frame. While an arrow is held it turns ±.007rad per frame.
// Hovering a card near the center brings it to 1.06x over .35s and shows its name in the caption below the board — Brand roadmap
(() => {
  kfFx.register("inside-ring-orbit", (host, { options, reduce }) => {
    if (!window.THREE) return;
    const T = window.THREE;
    const stage = host.querySelector('[data-fx-part="stage"]') || host;
    const items = [...host.querySelectorAll('[data-fx-part="card"]')];
    if (!items.length) return;
    const caption = host.querySelector('[data-fx-part="caption"]');
    const R = +(options.radius ?? 2800), auto = reduce ? 0 : +(options.auto ?? 0.00035), drag = +(options.drag ?? 0.0015), cruise = +(options.cruise ?? 0.007), follow = +(options.follow ?? 0.05);
    const css = getComputedStyle(document.documentElement);
    const v = (n, d) => css.getPropertyValue(n).trim() || d;
    let W = stage.clientWidth || innerWidth, H = stage.clientHeight || 600;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(+(options.fov ?? 26), W / H, 10, 8000);
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.domElement.className = "fx-iro-canvas";
    stage.append(renderer.domElement);

    const round = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
    const cardTex = (el) => {
      const c = document.createElement("canvas"); c.width = c.height = 600;
      const g = c.getContext("2d"), cs = getComputedStyle(el);
      round(g, 6, 6, 588, 588, 44);
      g.fillStyle = cs.getPropertyValue("--fx-card").trim() || v("--kf-raised", "gray"); g.fill();
      g.lineWidth = 6; g.strokeStyle = cs.getPropertyValue("--fx-rim").trim() || cs.color; g.globalAlpha = 0.55; g.stroke();
      g.globalAlpha = 0.25; g.strokeStyle = cs.color; g.lineWidth = 3;
      g.beginPath(); g.moveTo(80, 80); g.lineTo(520, 520); g.moveTo(520, 80); g.lineTo(80, 520); g.stroke();
      g.globalAlpha = 1;
      return new T.CanvasTexture(c);
    };
    const labelTex = (el) => {
      const c = document.createElement("canvas"); c.width = 680; c.height = 130;
      const g = c.getContext("2d");
      g.fillStyle = getComputedStyle(el).color; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `700 54px ${v("--kf-font-display", "sans-serif")}`;
      g.fillText((el.textContent || "").trim(), 340, 65);
      return new T.CanvasTexture(c);
    };
    const ring = new T.Group();
    scene.add(ring);
    // The camera stands inset inside the front edge of the ring looking at the opposite arc — far cards look small on screen, seen as a concavely curved row (phone pulls back 1750 more)
    const inset = +(options.inset ?? 280), lift = +(options.lift ?? 50);
    const place = () => { const m = innerWidth <= 768; ring.position.set(0, m ? lift / 2 : lift, -(R - inset) + (m ? 1750 : 0)); };
    place();
    const geo = new T.PlaneGeometry(600, 600), lgeo = new T.PlaneGeometry(680, 130), N = items.length, step = (Math.PI * 2) / N, holders = [];
    items.forEach((el, i) => {
      const h = new T.Group();
      const card = new T.Mesh(geo, new T.MeshBasicMaterial({ map: cardTex(el), transparent: true, side: T.DoubleSide, depthWrite: false }));
      const label = new T.Mesh(lgeo, new T.MeshBasicMaterial({ map: labelTex(el), transparent: true, side: T.DoubleSide, depthWrite: false, depthTest: false }));
      label.position.y = -(300 + 65);
      h.add(card, label);
      const th = i * step;
      h.position.set(Math.sin(th) * R, 0, Math.cos(th) * R);
      h.rotation.y = th + Math.PI;
      h.userData = { card, name: (el.textContent || "").trim() };
      ring.add(h);
      holders.push(h);
    });
    renderer.compile(scene, camera);

    let cur = 0, target = 0, dragging = false, x0 = 0, r0 = 0, spin = 0, hovered = null, alive = true, raf = 0;
    const mouse = new T.Vector2(-9, -9), ray = new T.Raycaster();
    const ac = new AbortController(), on = { signal: ac.signal };
    stage.addEventListener("pointerdown", (e) => { dragging = true; x0 = e.clientX; r0 = target; stage.classList.add("is-fx-grabbing"); }, on);
    addEventListener("pointermove", (e) => {
      if (dragging) target = r0 + (e.clientX - x0) * drag;
      const r = stage.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    }, on);
    addEventListener("pointerup", () => { dragging = false; stage.classList.remove("is-fx-grabbing"); }, on);
    stage.addEventListener("pointerleave", () => mouse.set(-9, -9), on);
    const hold = (sel, dir) => {
      const b = host.querySelector(sel);
      if (!b) return;
      b.addEventListener("pointerdown", (e) => { e.stopPropagation(); spin = dir * cruise; }, on);
      ["pointerup", "pointerleave", "pointercancel"].forEach((t) => b.addEventListener(t, () => { spin = 0; }, on));
    };
    hold('[data-fx-part="prev"]', 1);
    hold('[data-fx-part="next"]', -1);
    const frame = () => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (spin) target += spin; else if (!dragging) target += auto;
      cur += (target - cur) * (reduce ? 1 : follow);
      ring.rotation.y = cur;
      if (innerWidth > 600) {
        ray.setFromCamera(mouse, camera);
        const hit = ray.intersectObjects(holders.map((h) => h.userData.card))[0]?.object?.parent || null;
        if (hit !== hovered) {
          if (hovered) gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.45, ease: "power2.out" });
          hovered = hit;
          if (hit) gsap.to(hit.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.35, ease: "power2.out" });
          if (caption) { caption.textContent = hit ? hit.userData.name : ""; caption.classList.toggle("is-fx-on", !!hit); }
        }
      }
      renderer.render(scene, camera);
    };
    frame();
    const ro = new ResizeObserver(() => { W = stage.clientWidth || innerWidth; H = stage.clientHeight || 600; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H); place(); });
    ro.observe(stage);
    return () => {
      alive = false; cancelAnimationFrame(raf); ac.abort(); ro.disconnect();
      holders.forEach((h) => { gsap.killTweensOf(h.scale); h.children.forEach((m) => { m.material.map?.dispose(); m.material.dispose(); }); });
      geo.dispose(); lgeo.dispose(); renderer.dispose(); renderer.domElement.remove();
      if (caption) { caption.textContent = ""; caption.classList.remove("is-fx-on"); }
    };
  });
})();
