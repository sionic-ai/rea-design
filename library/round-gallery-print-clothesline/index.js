// Round gallery room — walk the floor ring between the outer wall (radius 12) and the inner wall (7.4) at radius 9.7 at human eye height (1.55)
// One slot is 2.5/12 rad. For each vowel, one nameplate plus five engravings on the outer wall, and one engraving each on the inner wall opposite the even slots.
// Wheel 9e-4/px · drag .0022/px · release velocity ×220 moves the target, and the position follows at 2.4 per second. With no input it drifts by itself at .0075 rad per second.
// Gaze is 0.32 rad ahead plus the cursor (horizontal .25 rad, vertical .25). Click a picture to move in to 2.2 in front of it (close look), click once more to open it.
// On the first visit of a session it starts from the center (radius 3.07), walks 5 rad over 5 seconds out into the corridor, and at the 80% mark the header row and text come in.
(() => {
  const SB = window.SB;
  const STEP = 2.5 / 12, INNER_W = STEP * 14.8 - 0.7, LABEL_H = 0.5 * (256 / 512);
  const RATIOS = [5 / 7, 4 / 5, 1.25, 3 / 4, 1, 1.4, 2 / 3, 4 / 3];
  const SUBJECTS = ["Crowd of people · bright daytime", "Person, half-length · Red outfit", "Street view · blue sky", "People dancing · pink background", "Playground · green grass", "Inside the kitchen · warm light", "Portrait face · Profile", "Market · busy evening"];
  const ratioOf = (r) => Math.min(1.5, Math.max(0.55, r || 5 / 7));
  const wrap = (i, n) => ((i % n) + n) % n;
  const smooth = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function paint(canvas, draw) { const c = canvas.getContext("2d"); draw(c, canvas.width, canvas.height); const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  const fontOf = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "serif";

  // Print slot — instead of images, each cell is a slightly different gray board labeled with what the picture is
  function printTexture(n, ratio, subject) {
    const cv = document.createElement("canvas");
    cv.width = 320; cv.height = Math.round(320 / ratio);
    return paint(cv, (c, w, h) => {
      const tone = 0.08 + (n % 5) * 0.035;
      c.fillStyle = SB.css(`color-mix(in srgb, var(--kf-ink) ${(tone * 100).toFixed(0)}%, var(--kf-surface))`);
      c.fillRect(0, 0, w, h);
      c.strokeStyle = SB.css("color-mix(in srgb, var(--kf-ink) 22%, var(--kf-surface))");
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h); c.moveTo(w, 0); c.lineTo(0, h); c.stroke();
      c.fillStyle = SB.css("var(--kf-surface)");
      c.fillRect(w / 2 - 120, h / 2 - 34, 240, 68);
      c.fillStyle = SB.css("var(--kf-dim)");
      c.font = `500 22px ${fontOf("--kf-font-mono")}`;
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(`Print ${String(n + 1).padStart(2, "0")}`, w / 2, h / 2 - 12);
      c.font = `400 17px ${fontOf("--kf-font-mono")}`;
      c.fillText(subject, w / 2, h / 2 + 14);
    });
  }
  // Collection nameplate — big title (uppercase, wraps at 412px width) and print count
  function plaqueTexture(title, count) {
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 640;
    return paint(cv, (c) => {
      c.fillStyle = SB.css("color-mix(in srgb, var(--kf-surface) 40%, var(--kf-bg))");
      c.fillRect(0, 0, 512, 640);
      c.fillStyle = SB.css("var(--kf-ink)");
      c.font = `400 64px ${fontOf("--kf-font-display")}`;
      c.textBaseline = "top";
      let line = "", y = 70;
      for (const word of title.toUpperCase().split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (c.measureText(next).width > 412 && line) { c.fillText(line, 50, y); y += 70; line = word; } else line = next;
      }
      if (line) c.fillText(line, 50, y);
      c.font = `400 26px ${fontOf("--kf-font-mono")}`;
      c.globalAlpha = 0.6;
      c.fillText(count.toUpperCase(), 50, y + 100);
    });
  }
  // Small caption beside the image — artist, title (italic), collection
  function labelTexture(title, coll) {
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 256;
    return paint(cv, (c) => {
      c.fillStyle = SB.css("color-mix(in srgb, var(--kf-surface) 60%, var(--kf-bg))");
      c.fillRect(0, 0, 512, 256);
      c.fillStyle = SB.css("var(--kf-ink)");
      c.textBaseline = "top";
      c.font = `600 54px ${fontOf("--kf-font-sans")}`;
      c.fillText("Artist Name", 30, 30);
      c.font = `italic 400 52px ${fontOf("--kf-font-sans")}`;
      c.fillText(title, 30, 104);
      c.font = `400 26px ${fontOf("--kf-font-mono")}`;
      c.globalAlpha = 0.6;
      c.fillText(coll.toUpperCase(), 30, 200);
    });
  }
  let glowMap = null;
  const glow = () => {
    if (glowMap) return glowMap;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d"), g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,0.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: alpha band of the light pattern (white = fully see-through) only, the color comes from the material color (--site-room-lamp) */
    c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    return (glowMap = new THREE.CanvasTexture(cv));
  };

  function rotunda(host) {
    const wrapEl = host.closest(".immersive");
    const titles = [...wrapEl.querySelectorAll(".scene-index a")].map((a) => a.textContent.trim());
    const hrefs = [...wrapEl.querySelectorAll(".scene-index a")].map((a) => a.getAttribute("href"));
    const colls = titles.map((t, ci) => ({ title: t, href: hrefs[ci], prints: Array.from({ length: 8 }, (_, k) => ({ n: ci * 8 + k, ratio: RATIOS[(ci * 3 + k) % RATIOS.length], title: `Artwork Title ${String(k + 1).padStart(2, "0")}`, subject: SUBJECTS[(ci + k) % SUBJECTS.length] })) }));
    const places = [];
    colls.forEach((c, ci) => {
      const outer = c.prints.slice(0, 5), inner = c.prints.slice(5);
      [{ kind: "plaque" }, ...outer.map((p) => ({ kind: "print", print: p }))].forEach((o, n) => places.push({ coll: ci, outer: o, inner: n % 2 === 0 ? inner[n / 2] ?? null : null }));
    });
    const P = places.length;
    const reduce = SB.reduce();
    let seen = false;
    try { seen = !!sessionStorage.getItem("sb-home-reveal"); sessionStorage.setItem("sb-home-reveal", "1"); } catch {}
    const play = !reduce && !seen;
    const root = document.documentElement;
    const unboot = () => root.removeAttribute("data-booting");
    if (!play) unboot();

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { unboot(); return () => {}; }
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.toneMapping = THREE.NoToneMapping;
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(62, 1, 0.1, 60);
    cam.position.set(0, 1.55, 9.7);
    scene.fog = new THREE.Fog(0, 8, 24);
    scene.background = new THREE.Color();

    const basic = (o = {}) => new THREE.MeshBasicMaterial({ toneMapped: false, ...o });
    const lampMat = () => basic({ map: glow(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.22 });
    const M = {
      floor: basic(), outerWall: basic({ side: THREE.BackSide }), innerWall: basic({ side: THREE.FrontSide }),
      lamp: lampMat(), innerLamp: lampMat(), pool: lampMat(),
      outer: Array.from({ length: 15 }, () => basic()), inner: Array.from({ length: 15 }, () => basic()),
      outerLabel: Array.from({ length: 15 }, () => basic()), innerLabel: Array.from({ length: 15 }, () => basic()),
    };
    const floor = new THREE.Mesh(new THREE.RingGeometry(7.2, 12.2, 160), M.floor);
    floor.rotation.x = -Math.PI / 2;
    const outerWall = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 3.6, 160, 1, true), M.outerWall);
    outerWall.position.y = 1.8;
    const innerWall = new THREE.Mesh(new THREE.CylinderGeometry(7.4, 7.4, 3.6, 120, 1, true), M.innerWall);
    innerWall.position.y = 1.8;
    scene.add(floor, outerWall, innerWall);
    const plane = new THREE.PlaneGeometry(1, 1);
    const outerG = [], innerG = [];
    for (let i = 0; i < 15; i++) {
      const g = new THREE.Group();
      const lamp = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3), M.lamp); lamp.position.set(0, 1.8, 0.01);
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2), M.pool); pool.position.set(0, 0.02, 1.1); pool.rotation.x = -Math.PI / 2;
      const art = new THREE.Mesh(plane, M.outer[i]); art.position.set(0, 1.6, 0.03); art.userData = { side: "outer", slot: i };
      const label = new THREE.Mesh(new THREE.PlaneGeometry(0.5, LABEL_H), M.outerLabel[i]); label.visible = false;
      g.add(lamp, pool, art, label);
      g.userData = { art, label };
      outerG.push(g); scene.add(g);
      const h = new THREE.Group();
      const ilamp = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.8), M.innerLamp); ilamp.position.set(0, 1.8, 0.01); ilamp.renderOrder = 1;
      const iart = new THREE.Mesh(plane, M.inner[i]); iart.position.set(0, 1.6, 0.03); iart.renderOrder = 2; iart.userData = { side: "inner", slot: i };
      const ilabel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, LABEL_H), M.innerLabel[i]); ilabel.renderOrder = 2; ilabel.visible = false;
      h.add(ilamp, iart, ilabel);
      h.userData = { art: iart, label: ilabel };
      innerG.push(h); scene.add(h);
    }
    const arts = [...outerG.map((g) => g.userData.art), ...innerG.map((g) => g.userData.art)];

    // When the Skin changes, repaint the room color and plate image
    const tex = new Map();
    const texOf = (key, make) => { if (!tex.has(key)) tex.set(key, make()); return tex.get(key); };
    let lampFull = 0.22;
    const recolor = () => {
      tex.forEach((t) => t.dispose()); tex.clear();
      const dark = root.dataset.theme === "dark";
      scene.background.setRGB(...SB.rgb("var(--site-room-bg)"), THREE.SRGBColorSpace);
      scene.fog.color.copy(scene.background);
      M.floor.color.setRGB(...SB.rgb("var(--site-room-floor)"), THREE.SRGBColorSpace);
      M.outerWall.color.setRGB(...SB.rgb("var(--site-room-outer)"), THREE.SRGBColorSpace);
      M.innerWall.color.setRGB(...SB.rgb("var(--site-room-inner)"), THREE.SRGBColorSpace);
      [M.lamp, M.innerLamp, M.pool].forEach((m) => m.color.setRGB(...SB.rgb("var(--site-room-lamp)"), THREE.SRGBColorSpace));
      lampFull = dark ? 0.55 : 0.22;
      M.lamp.opacity = lampFull;
      M.pool.opacity = dark ? 0.16 : 0.05;
      [...M.outer, ...M.inner, ...M.outerLabel, ...M.innerLabel].forEach((m) => { m.map = null; m.needsUpdate = true; });
    };
    recolor();
    const onTheme = () => recolor();
    addEventListener("theme-change", onTheme);
    const setOpacity = (m, v) => { m.opacity = v; const t = v < 1; if (m.transparent !== t) { m.transparent = t; m.needsUpdate = true; } };
    const placeLabel = (mesh, mat, map, w, h) => {
      mesh.visible = !!map;
      mesh.position.set(-w / 2 + 0.25, 1.6 - h / 2 - 0.1 - LABEL_H / 2, 0.03);
      if (mat.map !== map) { mat.map = map; mat.needsUpdate = true; }
    };

    // ── Walking ──
    const walk = { at: -0.2, target: -0.2, moved: 0 };
    const caption = wrapEl.querySelector(".room-caption"), nav = wrapEl.querySelector(".room-nav"), hint = wrapEl.querySelector(".walk-hint");
    const tip = wrapEl.querySelector(".cursor-tip"), tipPill = tip?.querySelector(".cursor-tip-pill");
    const sceneEl = host;
    let landed = false;
    const shown = () => sceneEl.classList.add("scene-shown");
    const landing = () => {
      if (landed) return;
      landed = true;
      [caption, nav, hint].forEach((n) => n?.removeAttribute("hidden"));
      unboot();
    };
    let curColl = -1;
    const setColl = (ci) => {
      curColl = ci;
      if (!caption) return;
      const t = caption.querySelector(".room-title"), a = caption.querySelector(".room-more");
      if (t) t.textContent = colls[ci].title;
      if (a) a.setAttribute("href", colls[ci].href);
      caption.style.animation = "none"; void caption.offsetWidth; caption.style.animation = "";
    };
    let focus = null, focusAt = 0, hovered = null, dragged = false, tipText = null;
    const setFocusUI = (on) => {
      caption?.toggleAttribute("data-lit", on);
      hint?.toggleAttribute("data-lit", on);
      if (hint) hint.innerHTML = on ? "<span>Click image to open</span><span>Press Esc or an empty area to step back</span>" : "<span>Scroll or drag to walk a full circle</span><span>Click the image to zoom in</span>";
    };
    let focusOn = false;

    const pointer = new THREE.Vector2(), ray = new THREE.Raycaster();
    const drag = { on: false, id: -1, t: 0, v: 0, x: 0, y: 0 };
    const onDown = (e) => { if (drag.on) return; Object.assign(drag, { on: true, id: e.pointerId, t: e.timeStamp, v: 0, x: e.clientX, y: e.clientY }); dragged = false; };
    // Over text and buttons the scene takes no input — as in the original, the picture pill turns off there. If the pointer has never entered, nothing is picked.
    let overUi = true;
    const onMove = (e) => {
      const r = wrapEl.getBoundingClientRect();
      if (tip) tip.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`;
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      overUi = e.target instanceof Element && !!e.target.closest("a, button, .room-caption, .room-nav, .walk-hint");
      if (!drag.on || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y, d = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      if (Math.abs(d) > 3) dragged = true;
      walk.target -= 0.0022 * d;
      if (Math.abs(d) > 3) walk.moved = performance.now();
      const span = Math.max(1, e.timeStamp - drag.t);
      drag.v = 0.6 * drag.v + (d / span) * 0.4;
      Object.assign(drag, { t: e.timeStamp, x: e.clientX, y: e.clientY });
      wrapEl.classList.toggle("dragging", dragged);
    };
    const onUp = (e) => {
      if (!drag.on || drag.id !== e.pointerId) return;
      drag.on = false;
      wrapEl.classList.remove("dragging");
      if (dragged && !(e.timeStamp - drag.t > 80)) { walk.target -= 220 * Math.max(-3, Math.min(3, drag.v)) * 0.0022; walk.moved = performance.now(); }
    };
    const onLeave = (e) => { if (e.pointerType === "mouse") drag.on = false; hovered = null; overUi = true; };
    const onWheel = (e) => {
      e.preventDefault();
      const d = e.deltaMode === 1 ? (e.deltaY + e.deltaX) * 16 : e.deltaY + e.deltaX;
      walk.target += 9e-4 * Math.max(-120, Math.min(120, d));
      walk.moved = performance.now();
    };
    const onKey = (e) => {
      if (e.key === "Escape") { focus = null; return; }
      if (e.target instanceof Element && e.target.closest("input,select,textarea")) return;
      if (["ArrowRight", "ArrowDown", "ArrowUp"].includes(e.key)) walk.target += 2 * STEP;
      if (e.key === "ArrowLeft") walk.target -= 2 * STEP;
      walk.moved = performance.now();
    };
    // Prev·next group: skips to the slide where the current group ends (or the previous group starts) and stops .3 before it
    const hop = (dir) => {
      let r = Math.round(walk.target / STEP);
      const c = places[wrap(r, P)].coll;
      if (dir > 0) while (places[wrap(r, P)].coll === c) r += 1;
      else {
        while (places[wrap(r, P)].coll === c) r -= 1;
        const prev = places[wrap(r, P)].coll;
        while (places[wrap(r - 1, P)].coll === prev) r -= 1;
      }
      walk.target = r * STEP - 0.3;
      walk.moved = performance.now();
    };
    const onNav = (e) => { const b = e.target.closest("[data-step]"); if (b) hop(+b.dataset.step); };
    const slotIndex = new Array(15).fill(0);
    const onClick = (e) => {
      if (e.target.closest("a,button,.room-caption")) return;
      if (dragged) return;
      const r = wrapEl.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), cam);
      const hit = ray.intersectObjects(arts.filter((a) => a.parent.visible && a.visible), false)[0]?.object;
      if (!hit) { focus = null; return; }
      if (focus !== hit) { focus = hit; focusAt = performance.now(); return; }
      const pl = places[wrap(slotIndex[hit.userData.slot], P)];
      location.href = hit.userData.side === "outer" && pl.outer.kind === "plaque" ? colls[pl.coll].href : "product.html";
    };
    wrapEl.addEventListener("pointerdown", onDown);
    wrapEl.addEventListener("pointermove", onMove);
    wrapEl.addEventListener("pointerup", onUp);
    wrapEl.addEventListener("pointerleave", onLeave);
    wrapEl.addEventListener("wheel", onWheel, { passive: false });
    wrapEl.addEventListener("click", onClick);
    nav?.addEventListener("click", onNav);
    addEventListener("keydown", onKey);

    const fit = () => { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
    fit();
    addEventListener("resize", fit);

    const intro = { at: 0, from: 0, to: 0, phase: "wait" };
    const camGoal = new THREE.Vector3(), lookGoal = new THREE.Vector3(), fpos = new THREE.Vector3(), fdir = new THREE.Vector3();
    let camPos = null, lookPos = null, last = performance.now(), raf = 0;
    const R0 = 9.7 / Math.sqrt(10), A0 = Math.atan(3);
    const frame = (now) => {
      const dt = Math.min(Math.max(0, (now - last) / 1000), 1 / 30);
      last = now;
      const t = now / 1000;
      if (focus && walk.moved > focusAt) focus = null;
      const L = intro;
      if (L.phase === "wait" && !L.at) { L.at = now; L.to = walk.target; L.from = L.to - 5; }
      if (L.phase !== "done" && (reduce || !play || walk.moved > L.at)) {
        if (!reduce && play) walk.target = walk.at + (walk.target - L.to);
        if (L.phase === "wait") shown();
        L.phase = "done";
        landing();
      }
      if (L.phase === "wait") {
        // Start walking the frame after the board drawing is fully painted — the first frame is drawn standing in the center
        walk.at = L.from;
        if (L.armed) { L.phase = "run"; L.at = now; shown(); }
        L.armed = true;
      } else if (L.phase === "run") {
        const e = Math.min(1, (now - L.at) / 5000);
        walk.at = L.from + (L.to - L.from) * (1 - (1 - e) ** 3);
        if (e >= 0.8) landing();
        if (e >= 1) { L.phase = "done"; walk.target = L.to; }
      } else {
        if (!focus) walk.target += reduce ? 0 : 0.03 * dt * 0.25;
        walk.at += (walk.target - walk.at) * Math.min(1, 2.4 * dt);
      }
      const a = walk.at;
      camGoal.set(9.7 * Math.sin(a), 1.55 + (reduce ? 0 : 0.012 * Math.sin(1.4 * t)), 9.7 * Math.cos(a));
      // In the original the gaze follows the cursor even under reduced motion but snaps right on (follow ×20) — per the library rule, we turn cursor gaze off then
      const look = reduce ? 0 : 1, c = a + 0.32 + 0.25 * pointer.x * look;
      lookGoal.set(9.7 * Math.sin(c), 1.5 + 0.25 * pointer.y * look, 9.7 * Math.cos(c));
      let eye = camGoal, at = lookGoal;
      if (focus) {
        focus.getWorldPosition(fpos); focus.getWorldDirection(fdir);
        eye = fpos.clone().addScaledVector(fdir, 2.2);
        at = fpos.clone(); at.y -= 0.3;
      }
      camPos ||= eye.clone();
      lookPos ||= at.clone();
      if (L.phase === "wait") {
        camPos.set(Math.sin(a - A0) * R0, 1.55, Math.cos(a - A0) * R0);
        lookPos.set(Math.sin(c - A0) * R0, lookGoal.y, Math.cos(c - A0) * R0);
      } else {
        const e = L.phase === "run" ? Math.min(1, (now - L.at) / 5000) : 1;
        const k = Math.min(1, dt * (reduce ? 20 : 1 + 1.8 * e * e));
        camPos.lerp(eye, k); lookPos.lerp(at, k);
      }
      cam.position.copy(camPos);
      cam.lookAt(lookPos);
      // The inner wall is visible only as much as you have entered the corridor (radius 7.6–9.2) — starting from the center, the whole outer wall is in view at once
      const u = smooth(Math.hypot(camPos.x, camPos.z), 7.6, 9.2);
      setOpacity(M.innerWall, u);
      M.inner.forEach((m) => setOpacity(m, u));
      M.innerLabel.forEach((m) => setOpacity(m, u));
      M.innerLamp.opacity = lampFull * u;
      const base = Math.floor(a / STEP);
      for (let e = -3; e <= 11; e++) {
        const s = e + 3, idx = base + e, pl = places[wrap(idx, P)], ang = idx * STEP;
        slotIndex[s] = idx;
        const g = outerG[s], art = g.userData.art, mat = M.outer[s];
        g.position.set(11.97 * Math.sin(ang), 0, 11.97 * Math.cos(ang));
        g.rotation.y = ang + Math.PI;
        if (pl.outer.kind === "plaque") {
          g.userData.label.visible = false;
          art.scale.set(1.15, 1.44, 1);
          art.position.y = 1.55;
          const map = texOf(`plaque-${pl.coll}`, () => plaqueTexture(colls[pl.coll].title, `${colls[pl.coll].prints.length}Dot`));
          if (mat.map !== map) { mat.map = map; mat.needsUpdate = true; }
        } else {
          const p = pl.outer.print, r = ratioOf(p.ratio);
          art.scale.set(1.45 * r, 1.45, 1);
          art.position.y = 1.6;
          placeLabel(g.userData.label, M.outerLabel[s], texOf(`label-${p.n}`, () => labelTexture(p.title, colls[pl.coll].title)), 1.45 * r, 1.45);
          const map = texOf(`print-${p.n}`, () => printTexture(p.n, r, p.subject));
          if (mat.map !== map) { mat.map = map; mat.needsUpdate = true; }
        }
        const h = innerG[s];
        h.visible = !!pl.inner;
        if (pl.inner) {
          const ia = ang + 0.04, r = ratioOf(pl.inner.ratio), k = Math.min(1.305, INNER_W / r);
          h.position.set(Math.sin(ia) * (7.4 + 0.03), 0, Math.cos(ia) * (7.4 + 0.03));
          h.rotation.y = ia;
          h.userData.art.scale.set(k * r, k, 1);
          placeLabel(h.userData.label, M.innerLabel[s], texOf(`label-${pl.inner.n}`, () => labelTexture(pl.inner.title, colls[pl.coll].title)), k * r, k);
          const map = texOf(`print-${pl.inner.n}`, () => printTexture(pl.inner.n, r, pl.inner.subject));
          const im = M.inner[s];
          if (im.map !== map) { im.map = map; im.needsUpdate = true; }
        }
      }
      const ci = places[wrap(Math.round((a + 0.25) / STEP), P)].coll;
      if (ci !== curColl) setColl(ci);
      if (!!focus !== focusOn) { focusOn = !!focus; setFocusUI(focusOn); }
      // Image under the cursor — swap the pill text and show the hand cursor
      ray.setFromCamera(pointer, cam);
      hovered = drag.on || overUi ? null : ray.intersectObjects(arts.filter((m) => m.parent.visible), false)[0]?.object ?? null;
      const pl = hovered ? places[wrap(slotIndex[hovered.userData.slot], P)] : null;
      const text = hovered ? (hovered === focus ? (hovered.userData.side === "outer" && pl.outer.kind === "plaque" ? "Open collection" : "Open image") : "Close-up view") : null;
      if (text !== tipText) {
        tipText = text;
        if (text && tipPill) tipPill.textContent = text;
        tip?.toggleAttribute("data-on", !!text && landed);
        wrapEl.style.cursor = text ? "pointer" : "";
      }
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", fit); removeEventListener("keydown", onKey); removeEventListener("theme-change", onTheme);
      tex.forEach((t) => t.dispose());
      renderer.dispose(); renderer.domElement.remove();
    };
  }

  // Gallery ↔ List
  function views() {
    const sw = document.querySelector(".switch"), list = document.querySelector(".list-view"), imm = document.querySelector(".immersive");
    if (!sw || !list) return;
    sw.addEventListener("click", (e) => {
      const b = e.target.closest("[data-view]");
      if (!b) return;
      const isList = b.dataset.view === "list";
      sw.querySelectorAll("[data-view]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      list.hidden = !isList;
      if (imm) imm.hidden = isList;
      document.documentElement.toggleAttribute("data-scene", !isList);
      document.documentElement.dataset.view = isList ? "list" : "gallery";
    });
  }

  const boot = () => {
    views();
    const host = document.querySelector(".immersive-scene");
    if (host && window.THREE) rotunda(host);
    else document.documentElement.removeAttribute("data-booting");
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
