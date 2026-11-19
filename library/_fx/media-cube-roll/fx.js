// Work box: an open cuboid with work videos and photos on four faces — front, top, back, bottom (both sides open so the inner faces show through) — rolling 90° on the x axis per cell.
// There are only four faces, so if there are more than four works, the image on the face hidden during the roll is swapped to the next work — the face directly above always shows the next work.
// Press to rotate to the front and grow to fill the screen (fx:pick), and only while Space is held is physics (cannon-es) on so you can drag and throw.
(() => {
  const HALF_PI = Math.PI / 2;
  const REST = 1.5555555555555556;
  const mod = (a, n) => ((a % n) + n) % n;
  // The job that face f shows in cell s — the current cell’s face is job number s, the next face is s+1, handed over every four cells
  const itemFor = (face, step, n) => mod(face + 4 * Math.max(0, Math.floor((step - face + 1) / 4)), n);

  const colorOf = (el, v, fb) => {
    const p = document.createElement("i");
    p.style.cssText = `position:absolute;visibility:hidden;color:var(${v}, var(${fb}))`;
    el.append(p);
    const c = getComputedStyle(p).color;
    p.remove();
    return c;
  };

  kfFx.register("media-cube-roll", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll('[data-fx-part="face"]')];
    if (!T || !window.gsap || !items.length) return;

    const dur = +(options.dur ?? 0.9);
    const extra = +(options.extra ?? 0.25);
    const maxDur = +(options.max ?? 2.5);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const narrowAt = +(options.narrow ?? 768);
    const lockMs = +(options.lock ?? 350);
    const wantEntry = options.entry === "true";
    const wantZoom = options.zoom !== "false";
    const wantPhysics = options.physics !== "false" && !!window.CANNON && hover;
    const wheelHost = options.wheel === "self" ? el : options.wheel ? el.closest(options.wheel) : null;
    const N = items.length;

    const stage = document.createElement("div");
    stage.className = "fx-media-cube-roll__stage";
    el.append(stage);

    let scene = null;
    let step = 0;
    let lastFace = 0;
    const emit = (name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    // Request to release zoom: to send fx:zoom-out while closing the detail panel, the caller uses preventDefault. If nobody handles it, zoom releases immediately
    const askOut = () => { if (el.dispatchEvent(new CustomEvent("fx:zoom-out-ask", { bubbles: true, cancelable: true }))) zoomOut(); };

    // One canvas per surface for each work — redrawn every frame during playback if it is a video, drawn once if it is an image or placeholder. The label hides together with the wire annotations (N) when they are turned off
    function makeSurfaces(fw, fh) {
      const W = 1024, H = Math.round((W * fh) / fw);
      const bg = colorOf(el, "--fx-face-bg", "--kf-contrast-bg");
      const ink = colorOf(el, "--fx-face-ink", "--kf-contrast-ink");
      const mono = getComputedStyle(el).getPropertyValue("--kf-font-mono").trim() || "monospace";
      return items.map((item, i) => {
        const canvas = document.createElement("canvas");
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d");
        const video = item.matches("video") ? item : item.querySelector("video");
        const img = item.matches("img") ? item : item.querySelector("img");
        const media = video || img;
        const label = item.getAttribute("data-label") || "";
        // On a page opened via file://, videos and images come from another origin, so drawing them to the canvas taints it and WebGL refuses — test first with a 1px probe canvas,
        // If unavailable, draw a placeholder of the same type — a screen recording (scrolling page) — synced to the video’s playback time. Play·pause·loop follow the video as is
        let usable = null;
        // If the video hasn’t received a frame yet (readyState < 2) drawImage draws nothing, so the test canvas stays clean —
        // If we lock it in as ”usable” at that point, frames arriving later would dirty the main canvas, so defer the judgment
        const ready = () => (video ? video.readyState >= 2 : !!img && img.complete && img.naturalWidth > 0);
        const canUse = () => {
          if (usable !== null) return usable;
          if (!ready()) return false;
          const t = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
          try { t.drawImage(media, 0, 0, 1, 1); t.getImageData(0, 0, 1, 1); usable = true; } catch { usable = false; }
          return usable;
        };
        // A page mixed with light gray areas like a screen recording — matched to the original’s average brightness (mid gray)
        const page = (off) => {
          const u = W / 24;
          const box = (x, y, w, h, a) => { ctx.globalAlpha = a; ctx.fillRect(x, y - off, w, h); };
          ctx.fillStyle = ink;
          box(0, 0, W, H * 2.6, 0.08);
          box(u, u * 1.4, W - u * 2, 2, 0.3);
          box(u, u * 2.6, u * (6 + (i % 4) * 2), u * 1.4, 0.85);
          box(u, u * 4.6, u * 5, u * 0.4, 0.45);
          box(u, H * 0.42, W - u * 2, H * 0.62, 0.32);
          box(W * 0.36, H * 0.56, W * 0.28, H * 0.34, 0.6);
          for (let k = 0; k < 3; k++) box(u + k * ((W - u * 2) / 3 + u / 3), H * 1.12, (W - u * 2) / 3 - u / 1.5, H * 0.5, 0.22 + 0.12 * ((i + k) % 3));
          box(u, H * 1.74, u * 10, u * 0.9, 0.7);
          box(u, H * 1.9, W - u * 2, H * 0.6, 0.18);
          ctx.globalAlpha = 1;
        };
        const draw = () => {
          ctx.fillStyle = bg;
          ctx.globalAlpha = 1;
          ctx.fillRect(0, 0, W, H);
          const mw = video ? video.videoWidth : img ? img.naturalWidth : 0;
          const mh = video ? video.videoHeight : img ? img.naturalHeight : 0;
          if (media && mw && mh && canUse()) {
            const s = Math.max(W / mw, H / mh);
            ctx.drawImage(media, (W - mw * s) / 2, (H - mh * s) / 2, mw * s, mh * s);
          } else if (video && video.duration) {
            page(H * 1.6 * (0.5 - 0.5 * Math.cos((2 * Math.PI * video.currentTime) / video.duration)));
          } else {
            page(0);
          }
          if (label && !document.documentElement.classList.contains("wf-hide-notes")) {
            const fs = Math.round(W / 48);
            ctx.font = `${fs}px ${mono}`;
            const tw = ctx.measureText(label).width;
            ctx.fillStyle = ink;
            ctx.globalAlpha = 0.86;
            ctx.fillRect(fs, H - fs * 3, tw + fs * 1.6, fs * 2);
            ctx.globalAlpha = 1;
            ctx.fillStyle = bg;
            ctx.fillText(label, fs * 1.8, H - fs * 1.65);
          }
          tex.needsUpdate = true;
        };
        const tex = new T.CanvasTexture(canvas);
        tex.colorSpace = T.SRGBColorSpace;
        if (video) {
          video.muted = true; video.loop = true; video.playsInline = true;
          video.addEventListener("loadeddata", draw);
          video.addEventListener("seeked", draw);
        }
        if (img && !img.complete) img.addEventListener("load", draw, { once: true });
        draw();
        return { tex, video, draw };
      });
    }

    function build() {
      const narrow = innerWidth <= narrowAt;
      const fw = narrow ? 3.5 : 6.4, fh = narrow ? 6 : 4;
      const G = narrow ? 0 : -0.5;
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      const cam = new T.PerspectiveCamera(45, w / h, 0.1, 100);
      cam.position.set(0, narrow ? 0 : 2.5, 9);
      cam.lookAt(0, 0, 0);
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(w, h);
      stage.append(renderer.domElement);
      const s3 = new T.Scene();
      const outer = new T.Group(), body = new T.Group(), roll = new T.Group();
      body.add(roll); outer.add(body); s3.add(outer);
      const restRot = { x: narrow ? 0 : 0.25, y: narrow ? 0 : -Math.PI / 6, z: 0 };
      body.rotation.set(restRot.x, restRot.y, 0);
      body.position.set(0, G, -5);
      body.scale.setScalar(REST);
      const entryOn = wantEntry && !narrow && !reduce;
      if (entryOn) { outer.position.x = 19; outer.rotation.z = -2 * Math.PI; }

      const surfaces = makeSurfaces(fw, fh);
      const r = fh / 2;
      const faces = [
        [[0, 0, r], [0, 0, 0]], [[0, r, 0], [-HALF_PI, 0, 0]], [[0, 0, -r], [Math.PI, 0, 0]], [[0, -r, 0], [HALF_PI, 0, 0]],
      ].map(([p, rot], f) => {
        const m = new T.Mesh(new T.PlaneGeometry(fw, fh), new T.MeshBasicMaterial({ map: surfaces[f % N].tex, side: T.DoubleSide }));
        m.position.set(...p); m.rotation.set(...rot);
        roll.add(m);
        return m;
      });
      const shown = [0, 1, 2, 3].map((f) => f % N);
      const hit = new T.Mesh(new T.BoxGeometry(fw, fh, fh), new T.MeshBasicMaterial({ transparent: true, opacity: 0 }));
      roll.add(hit);
      const dragPlane = new T.Mesh(new T.PlaneGeometry(100, 100), new T.MeshBasicMaterial({ transparent: true, opacity: 0, side: T.DoubleSide }));
      s3.add(dragPlane);

      const st = { narrow, cam, renderer, s3, outer, body, roll, faces, hit, dragPlane, surfaces, shown, G, fw, fh, restRot,
        tl: null, zoomed: false, physics: false, returning: false, locked: entryOn, entered: !entryOn, fill: REST, intro: narrow ? 0.5 : 1, active: 0 };

      // Scale that fills the screen — with half the 45° field of view (22.5°), the box front touches the tighter of window width·height, with 1.08x margin
      st.fillScale = () => {
        const t = Math.tan((Math.PI / 180) * 22.5), a = (el.clientWidth || innerWidth) / (el.clientHeight || innerHeight);
        return 1.08 * Math.max((28 * t) / (fh + fh * t), (28 * t * a) / (fw + fh * t * a));
      };
      st.swap = (face, item) => {
        if (st.shown[face] === item) return;
        faces[face].material.map = surfaces[item].tex;
        faces[face].material.needsUpdate = true;
        st.shown[face] = item;
      };
      st.play = () => surfaces.forEach((s, i) => { if (!s.video) return; if (i === st.active && !reduce) s.video.play().catch(() => {}); else s.video.pause(); });

      if (wantPhysics) {
        const C = window.CANNON;
        const world = new C.World({ gravity: new C.Vec3(0, -18, 0) });
        world.broadphase = new C.SAPBroadphase(world);
        world.allowSleep = true;
        const cubeMat = new C.Material("cube"), floorMat = new C.Material("floor");
        world.addContactMaterial(new C.ContactMaterial(cubeMat, floorMat, { friction: 0.6, restitution: 0.08 }));
        const cube = new C.Body({ mass: 1, shape: new C.Box(new C.Vec3(1, 1, 1)), material: cubeMat, linearDamping: 0.3, angularDamping: 0.25, allowSleep: true });
        cube.linearFactor.set(1, 1, 0);
        world.addBody(cube);
        const hand = new C.Body({ mass: 0, shape: new C.Sphere(0.1), collisionFilterGroup: 0, collisionFilterMask: 0 });
        world.addBody(hand);
        const floor = new C.Body({ mass: 0, shape: new C.Plane(), material: floorMat, position: new C.Vec3(0, -1.5, 0) });
        floor.quaternion.setFromEuler(-HALF_PI, 0, 0);
        world.addBody(floor);
        world.addEventListener("postStep", () => {
          const p = cube.position, v = cube.velocity;
          if (p.x < -3.5) { p.x = -3.5; v.x = 0.45 * Math.abs(v.x); }
          if (p.x > 3.5) { p.x = 3.5; v.x = -0.45 * Math.abs(v.x); }
          p.z = 0; v.z = 0;
        });
        st.world = { C, world, cube, hand, joint: null };
      }
      return st;
    }

    const killAll = (st) => {
      st.tl?.kill();
      gsap.killTweensOf([st.body.rotation, st.body.scale, st.body.position, st.roll.rotation]);
    };

    function settle() {
      emit("fx:settled", { step, index: mod(step, N) });
      if (!wheelHost) return;
      setTimeout(() => { if (scene) scene.locked = false; }, lockMs);
    }

    // Whether one box or many — 0.9 seconds plus 0.25 seconds per box, up to 2.5 seconds. The face image is swapped at half the rolling length
    function go(target, forced) {
      const st = scene;
      if (!st || st.physics) return;
      if (st.narrow) return goNarrow(target, forced ?? 1.25);
      if (st.zoomed) { st.zoomed = false; killAll(st); gsap.set(st.body.rotation, st.restRot); gsap.set(st.body.scale, { x: REST, y: REST, z: REST }); gsap.set(st.body.position, { y: st.G }); }
      const n = Math.abs(target - step);
      step = target;
      st.active = itemFor(mod(target, 4), target, N);
      st.play();
      if (!n) return settle();
      const d = forced ?? (n <= 1 ? dur : Math.min(dur + (n - 1) * extra, maxDur));
      emit("fx:step", { step: target, index: st.active, dur: d });
      killAll(st);
      if (reduce) {
        st.roll.rotation.x = HALF_PI * target;
        for (let f = 0; f < 4; f++) st.swap(f, itemFor(f, target, N));
        return settle();
      }
      st.tl = gsap.timeline({ onComplete: settle }).to(st.roll.rotation, { x: HALF_PI * target, duration: d, ease }, 0);
      for (let f = 0; f < 4; f++) {
        const it = itemFor(f, target, N);
        if (st.shown[f] !== it) st.tl.call(() => st.swap(f, it), null, d * 0.5);
      }
    }

    // Phone: the box shrinks to half (first 20%), rolls (60%), and grows back (last 20%)
    function goNarrow(target, total) {
      const st = scene;
      if (step === target) return settle();
      killAll(st);
      const a = 0.2 * total, b = 0.6 * total;
      st.tl = gsap.timeline({ onComplete: () => { step = target; st.active = itemFor(mod(target, 4), target, N); st.play(); settle(); } })
        .to(st.body.scale, { x: 0.5 * st.fill, y: 0.5 * st.fill, z: 0.5 * st.fill, duration: a, ease: "power2.in" }, 0)
        .to(st.roll.rotation, { x: HALF_PI * target, duration: b, ease }, a)
        .to(st.body.scale, { x: st.fill, y: st.fill, z: st.fill, duration: a, ease: "power2.out" }, a + b);
      for (let f = 0; f < 4; f++) {
        const it = itemFor(f, target, N);
        if (st.shown[f] !== it) st.tl.call(() => st.swap(f, it), null, a + 0.5 * b);
      }
      emit("fx:step", { step: target, index: itemFor(mod(target, 4), target, N), dur: total });
    }

    // Phone scroll progress p (in cells, fractional) — the first half of a cell stays as is, .5~.6 shrinks, .6~.9 rolls, .9~1 grows again
    function progress(p) {
      const st = scene;
      if (!st || !st.narrow) return;
      st.fill = st.fillScale();
      st.body.rotation.set(0, 0, 0);
      const k = Math.floor(p), a = p - k;
      let size, turn;
      if (a < 0.5) { size = 1; turn = 0; } else if (a < 0.6) { size = 1 - ((a - 0.5) / 0.1) * 0.5; turn = 0; } else if (a < 0.9) { size = 0.5; turn = (a - 0.6) / 0.3; } else { size = 0.5 + ((a - 0.9) / 0.1) * 0.5; turn = 1; }
      st.roll.rotation.x = HALF_PI * (k + turn);
      st.body.scale.setScalar(st.fill * size * st.intro);
      const s = Math.floor(p + 0.25);
      if (s !== lastFace) {
        lastFace = s; step = s;
        st.active = itemFor(mod(s, 4), s, N);
        for (let f = 0; f < 4; f++) st.swap(f, itemFor(f, s, N));
        st.play();
      }
    }

    function zoomIn() {
      const st = scene;
      if (st.zoomed || st.physics) return;
      st.zoomed = true;
      el.style.cursor = "zoom-out";
      emit("fx:zoom-start", { index: st.active });
      st.fill = st.fillScale();
      killAll(st);
      const d = reduce ? 0 : 0.65;
      st.tl = gsap.timeline()
        .to(st.body.rotation, { x: -0.278, y: 0, z: 0, duration: d, ease: "power3.inOut" }, 0)
        .to(st.body.scale, { x: st.fill, y: st.fill, z: st.fill, duration: d, ease: "power3.inOut" }, 0)
        .to(st.body.position, { y: st.G - 0.6, duration: d, ease: "power3.inOut" }, 0)
        .call(() => emit("fx:pick", { index: st.active, time: st.surfaces[st.active].video?.currentTime ?? 0 }));
    }

    function zoomOut() {
      const st = scene;
      if (!st || !st.zoomed) return;
      st.zoomed = false;
      el.style.cursor = "";
      killAll(st);
      const d = reduce ? 0 : 0.5;
      st.tl = gsap.timeline()
        .to(st.body.rotation, { ...st.restRot, duration: d, ease: "power2.inOut" }, 0)
        .to(st.body.scale, { x: REST, y: REST, z: REST, duration: d, ease: "power2.inOut" }, 0)
        .to(st.body.position, { y: st.G, duration: d, ease: "power2.inOut" }, 0);
    }

    // Moving on to the next work while zoomed — shrink by .35 to its own size, roll .9 after .25, and refill to .35 starting .2 before the end
    function rollNext() {
      const st = scene;
      if (!st || !st.zoomed || st.narrow) return;
      const t = step + 1, face = mod(t, 4), it = itemFor(face, t, N);
      st.active = it;
      st.play();
      killAll(st);
      emit("fx:step", { step: t, index: it, dur, delay: 0.25 });
      st.tl = gsap.timeline({ onComplete: () => { step = t; emit("fx:pick", { index: it, time: 0, next: true }); } })
        .to(st.body.scale, { x: REST, y: REST, z: REST, duration: 0.35, ease: "power2.in" }, 0)
        .to(st.roll.rotation, { x: HALF_PI * t, duration: dur, ease }, 0.25)
        .to(st.body.scale, { x: st.fill, y: st.fill, z: st.fill, duration: 0.35, ease: "power2.out" }, ">-0.2");
      st.tl.call(() => st.swap(face, it), null, 0.7);
      const f2 = mod(t + 1, 4), i2 = itemFor(f2, t, N);
      st.tl.call(() => st.swap(f2, i2), null, 0.7);
    }

    function enter() {
      const st = scene;
      if (!st) return;
      st.play();
      if (st.entered) return emit("fx:entered", {});
      st.entered = true;
      st.tl = gsap.timeline({ onComplete: () => { st.locked = false; emit("fx:entered", {}); settle(); } })
        .to(st.outer.position, { x: 0, duration: 2.2, ease: "power2.inOut" }, 0)
        .to(st.outer.rotation, { z: 0, duration: 2.2, ease: "power2.inOut" }, 0);
    }

    // Hand: aim, press, drag
    const ray = new T.Raycaster();
    const ndc = (e) => {
      const b = el.getBoundingClientRect();
      return new T.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    };
    let hovered = "";
    const onMove = (e) => {
      const st = scene;
      if (!st) return;
      if (st.physics && st.world?.joint) {
        ray.setFromCamera(ndc(e), st.cam);
        const p = ray.intersectObject(st.dragPlane)[0]?.point;
        if (!p) return;
        st.world.hand.position.set(Math.max(-3.5, Math.min(3.5, p.x)), p.y, 0);
        st.world.joint.update();
        return;
      }
      if (st.physics || st.zoomed || !st.entered) return;
      ray.setFromCamera(ndc(e), st.cam);
      const over = ray.intersectObject(st.hit).length > 0;
      const front = over && ray.intersectObject(st.faces[mod(step, 4)]).length > 0;
      if (wantZoom) el.style.cursor = over ? "pointer" : "";
      const key = `${over}${front}`;
      if (key !== hovered) { hovered = key; emit("fx:hover", { over, front }); }
    };
    const onLeave = () => { onUp(); if (hovered !== "falsefalse") { hovered = "falsefalse"; emit("fx:hover", { over: false, front: false }); } };
    const onClick = (e) => {
      const st = scene;
      if (!st || !wantZoom || st.physics || st.returning || !st.entered || st.narrow) return;
      if (st.zoomed) return askOut();
      ray.setFromCamera(ndc(e), st.cam);
      if (ray.intersectObject(st.hit).length) { hovered = ""; emit("fx:hover", { over: false, front: false }); zoomIn(); }
    };
    const onDown = (e) => {
      const st = scene, w = st?.world;
      if (!st?.physics || !w) return;
      ray.setFromCamera(ndc(e), st.cam);
      const p = ray.intersectObject(st.hit)[0]?.point;
      if (!p) return;
      const sc = st.body.scale.x;
      const local = w.cube.quaternion.inverse().vmult(new w.C.Vec3((p.x - w.cube.position.x) / sc, (p.y - w.cube.position.y) / sc, 0));
      local.x = Math.max(-1, Math.min(1, local.x)); local.y = Math.max(-1, Math.min(1, local.y)); local.z = 0;
      w.hand.position.set(p.x, p.y, 0);
      w.joint = new w.C.PointToPointConstraint(w.cube, local, w.hand, new w.C.Vec3(0, 0, 0));
      w.world.addConstraint(w.joint);
      w.cube.wakeUp();
      st.dragPlane.position.copy(p);
      st.dragPlane.quaternion.copy(st.cam.quaternion);
      el.style.cursor = "grabbing";
    };
    const onUp = () => {
      const w = scene?.world;
      if (!w?.joint) return;
      w.world.removeConstraint(w.joint);
      w.joint = null;
      el.style.cursor = scene.physics ? "grab" : "";
    };
    const onKeyDown = (e) => {
      const st = scene, w = st?.world;
      if (e.code === "Escape" && st?.zoomed) return askOut();
      if (e.code !== "Space" || !w || st.narrow || !st.entered || e.target.closest?.("input, textarea, [contenteditable]")) return;
      e.preventDefault();
      if (st.physics) return;
      if (st.zoomed) askOut();
      st.physics = true;
      killAll(st);
      el.style.cursor = "grab";
      emit("fx:hover", { over: false, front: false });
      emit("fx:physics", { on: true });
      w.cube.position.set(0, 2, 0);
      w.cube.velocity.set(0, 0, 0);
      w.cube.angularVelocity.set(0, 0, 0);
      w.cube.quaternion.setFromEuler(st.roll.rotation.x, st.roll.rotation.y, st.roll.rotation.z);
      w.cube.wakeUp();
    };
    const onKeyUp = (e) => {
      const st = scene, w = st?.world;
      if (e.code !== "Space" || !st?.physics) return;
      st.physics = false;
      st.returning = true;
      onUp();
      el.style.cursor = "";
      w.cube.sleep();
      emit("fx:physics", { on: false });
      const o = { duration: 0.7, ease: "power2.out" };
      gsap.to(st.body.position, { x: 0, y: st.G, z: -5, ...o });
      gsap.to(st.body.rotation, { ...st.restRot, ...o });
      gsap.to(st.body.scale, { x: REST, y: REST, z: REST, ...o });
      gsap.to(st.roll.rotation, { x: HALF_PI * step, y: 0, z: 0, ...o, onComplete: () => { st.returning = false; settle(); } });
    };
    const onWheel = (e) => {
      const st = scene;
      if (!st || st.narrow || st.zoomed) return;
      e.preventDefault();
      if (st.locked || st.physics || st.returning || Math.abs(e.deltaY) < 5) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      if (dir < 0 && step <= 0) return;
      st.locked = true;
      go(step + dir);
    };

    // One physics frame: the original puts an ms frame interval into a seconds slot so it always advances .05s (three times 1/60), making the visible fall three times faster — that feel is kept as is
    const tick = (time, dtMs) => {
      const st = scene;
      if (!st) return;
      if (st.physics && st.world) {
        const { world, cube } = st.world;
        world.step(1 / 60, Math.min(dtMs, 0.05), 3);
        st.body.position.set(cube.position.x, cube.position.y, -5);
        st.body.quaternion.set(cube.quaternion.x, cube.quaternion.y, cube.quaternion.z, cube.quaternion.w);
        st.roll.quaternion.set(0, 0, 0, 1);
      }
      const live = st.surfaces[st.active];
      if (live?.video && !live.video.paused) live.draw();
      st.renderer.render(st.s3, st.cam);
    };

    const teardown = () => {
      const st = scene;
      if (!st) return;
      killAll(st);
      st.surfaces.forEach((s) => { s.video?.pause(); s.tex.dispose(); });
      st.s3.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      st.renderer.dispose();
      st.renderer.domElement.remove();
      scene = null;
    };
    const setup = () => {
      teardown();
      scene = build();
      lastFace = NaN;
      if (scene.narrow) {
        scene.fill = scene.fillScale();
        progress(step);
      } else {
        scene.roll.rotation.x = HALF_PI * step;
        for (let f = 0; f < 4; f++) scene.swap(f, itemFor(f, step, N));
        scene.active = itemFor(mod(step, 4), step, N);
      }
      if (!wantEntry) scene.play();
      emit("fx:ready", { narrow: scene.narrow });
    };
    setup();

    const narrowQ = matchMedia(`(max-width: ${narrowAt}px)`);
    const onMode = () => setup();
    narrowQ.addEventListener("change", onMode);
    const ro = new ResizeObserver(() => {
      const st = scene;
      if (!st) return;
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      st.cam.aspect = w / h;
      st.cam.updateProjectionMatrix();
      st.renderer.setSize(w, h);
    });
    ro.observe(el);
    const notes = new MutationObserver(() => scene?.surfaces.forEach((s) => s.draw()));
    notes.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const onGo = (e) => go(Math.max(0, Math.round(+e.detail?.step || 0)), e.detail?.dur);
    const onProgress = (e) => {
      if (!scene?.narrow) return;
      if (e.detail?.intro != null) scene.intro = 0.5 + 0.5 * Math.max(0, Math.min(1, +e.detail.intro));
      if (e.detail?.p != null) progress(+e.detail.p);
    };
    const on = [["fx:go", onGo], ["fx:enter", enter], ["fx:zoom-out", zoomOut], ["fx:next", rollNext], ["fx:progress", onProgress],
      ["click", onClick], ["pointerdown", onDown], ["pointermove", onMove], ["pointerup", onUp], ["pointerleave", onLeave]];
    on.forEach(([n, f]) => el.addEventListener(n, f));
    addEventListener("keydown", onKeyDown);
    addEventListener("keyup", onKeyUp);
    wheelHost?.addEventListener("wheel", onWheel, { passive: false });
    gsap.ticker.add(tick);

    return () => {
      on.forEach(([n, f]) => el.removeEventListener(n, f));
      removeEventListener("keydown", onKeyDown);
      removeEventListener("keyup", onKeyUp);
      wheelHost?.removeEventListener("wheel", onWheel);
      narrowQ.removeEventListener("change", onMode);
      gsap.ticker.remove(tick);
      ro.disconnect();
      notes.disconnect();
      teardown();
      stage.remove();
      el.style.cursor = "";
    };
  });
})();
