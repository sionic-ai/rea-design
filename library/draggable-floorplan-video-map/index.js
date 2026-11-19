// Map stage: instead of document scroll, moves virtual coordinates (panel px) by wheel·drag·two fingers, and translates+scales the whole panel each tick.
// Video tiles are redrawn with a three orthographic camera in the same spot as the DOM tiles, like the original — the camera follows map coordinates and scale, and the tile zoom value is applied to the panel as well.
(() => {
  const site = window.hdSite;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const MQ = "(max-width: 768px)";
  const MQ_TOUCH = "not all and (hover: hover) and (pointer: fine)";
  const INERTIA_WHEEL = 0.2, INERTIA_TOUCH = 0.6, SWIPE_RELEASE = 0.1;
  const ZOOM_MAX_PC = 2.5, ZOOM_MIN_PC = 1, ZOOM_MAX_SP = 1.5, ZOOM_MIN_SP = 0.5, ZOOM_SP = 0.8;
  const MAP_DEPTH = 0.9;
  let isSp = matchMedia(MQ).matches;
  let isTouch = matchMedia(MQ_TOUCH).matches;
  matchMedia(MQ_TOUCH).addEventListener("change", (e) => (isTouch = e.matches));

  const scroll = $("[data-js=scroll]");
  const list = $("[data-js=list]");
  const map = $("[data-js=map]");
  const items = $$("[data-js=item]");
  const hint = $("[data-js=hint]");
  const miniMap = $("[data-js=mini-map]");
  const miniFrame = $("[data-js=mini-frame]");
  const zoomBtn = $("[data-js=zoom]");

  const restZoom = () => (isSp ? ZOOM_SP : ZOOM_MAX_PC);
  const zoom = { value: restZoom() * 0.5 };
  const target = { x: 0, y: 0 }, current = { x: 0, y: 0 };
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 }, last = { x: 0, y: 0 };
  const swipe = { x: 0, y: 0 }, velocity = { x: 0, y: 0 };
  const min = { x: 0, y: 0 }, max = { x: 0, y: 0 }, mapAt = { x: 0, y: 0 };
  let dragging = false, pinchDist = 0, pinchZoom = 0;
  const pinchAt = { x: 0, y: 0 };

  // Starting position: 40% across and 64% down the panel (phone 48% · 66%)
  target.x = current.x = scroll.clientWidth * (isSp ? 0.48 : 0.4);
  target.y = current.y = scroll.clientHeight * (isSp ? 0.66 : 0.64);

  const rectOf = (el) => {
    const cs = getComputedStyle(el);
    const top = parseFloat(cs.top), left = parseFloat(cs.left), w = parseFloat(cs.width), h = parseFloat(cs.height);
    return { top, left, right: left + w, bottom: top + h, cx: left + w / 2, cy: top + h / 2 };
  };
  const tiles = items.map((el) => ({ el, ...rectOf(el), scale: 1 }));
  addEventListener("resize", () => tiles.forEach((t) => Object.assign(t, rectOf(t.el))));

  // ── Video tile board (three r173): each tile uses a placeholder video as a texture (a 3:2 plate with its label drawn, a light band passing every 8 seconds on loop — the original vertex goes up to 7.1 seconds) —
  // Plays only tiles on screen or near the mouse and pauses the rest (original playScene·pauseScene) ──
  // The panel is built on first appearance — before that the map panel is transparent and invisible, so the WebGL context does not hold screen compositing during loading
  let gl = null;
  const makeGL = () => {
    const wrap = $("[data-js=gl-wrapper]");
    if (!window.THREE || !wrap) return null;
    const view = { w: wrap.clientWidth, h: wrap.clientHeight };
    const renderer = new THREE.WebGLRenderer({ canvas: $("canvas", wrap), alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(view.w, view.h, false);
    const camera = new THREE.OrthographicCamera();
    const fit = () => {
      Object.assign(camera, { left: -view.w / 2, right: view.w / 2, top: view.h / 2, bottom: -view.h / 2, near: 0.1, far: 1000 });
      camera.position.z = 500;
      camera.updateProjectionMatrix();
    };
    fit();
    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    const W = 480, H = 320, LOOP = 8;
    const paint = (el) => {
      const ph = $(".wf-img", el), cs = getComputedStyle(ph), ink = getComputedStyle(ph, "::after");
      const cv = Object.assign(document.createElement("canvas"), { width: W, height: H });
      const ctx = cv.getContext("2d");
      const words = (ph.dataset.label || "").split(" ");
      const lines = words.reduce((acc, w) => { const l = acc[acc.length - 1]; (l && (l + " " + w).length < 22) ? (acc[acc.length - 1] = l + " " + w) : acc.push(w); return acc; }, []);
      const draw = (t) => {
        ctx.fillStyle = cs.backgroundColor;
        ctx.fillRect(0, 0, W, H);
        const x = ((t % LOOP) / LOOP) * (W * 1.6) - W * 0.3;
        const g = ctx.createLinearGradient(x - 80, 0, x + 80, 0);
        g.addColorStop(0, "transparent");
        g.addColorStop(0.5, ink.color);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        ctx.fillStyle = ink.color;
        ctx.beginPath(); ctx.moveTo(W / 2 - 9, H / 2 - 52); ctx.lineTo(W / 2 + 11, H / 2 - 40); ctx.lineTo(W / 2 - 9, H / 2 - 28); ctx.fill();
        ctx.font = `500 17px ${cs.fontFamily}`;
        ctx.textAlign = "center";
        lines.forEach((l, i) => ctx.fillText(l, W / 2, H / 2 + 4 + i * 24));
      };
      draw(0);
      const texture = new THREE.CanvasTexture(cv);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      return { texture, draw, playing: false, clock: 0, frame: -1 };
    };
    const meshes = items.map((el) => {
      const media = paint(el);
      const m = material.clone();
      m.map = media.texture;
      const mesh = new THREE.Mesh(geometry, m), group = new THREE.Group();
      group.add(mesh);
      scene.add(group);
      return { group, mesh, media };
    });
    // Tile position: the center of the computed top·left inside the panel as coordinates relative to screen center (original setMeshTransform)
    const place = () => items.forEach((el, i) => {
      const cs = getComputedStyle(el), top = parseFloat(cs.top), left = parseFloat(cs.left);
      meshes[i].mesh.scale.set(el.clientWidth || 1, el.clientHeight || 1, 1);
      meshes[i].group.position.set(left + parseFloat(cs.width) / 2 - view.w / 2, view.h / 2 - (top + parseFloat(cs.height) / 2), 0);
    });
    place();
    // Wiring the shader for the first time on the first cursor-swell frame freezes the screen — wire it ahead when building the panel
    renderer.compile(scene, camera);
    addEventListener("resize", () => {
      view.w = wrap.clientWidth; view.h = wrap.clientHeight;
      renderer.setSize(view.w, view.h, false);
      fit();
      place();
    });
    let last = performance.now();
    return {
      scale: (i, k) => meshes[i].group.scale.set(k, k, 1),
      play: (i, on) => (meshes[i].media.playing = on),
      time: (i) => meshes[i].media.clock % LOOP,
      draw: (x, y, z) => {
        const now = performance.now(), dt = Math.max(0, now - last) / 1000;
        last = now;
        // Repainted and uploaded only when a new frame arrives like video (24 frames per second) — the original VideoTexture also updates only on new video frames
        if (!site.reduced) meshes.forEach(({ media }) => {
          if (!media.playing) return;
          media.clock += dt;
          const f = Math.floor(media.clock * 24);
          if (f === media.frame) return;
          media.frame = f;
          media.draw(media.clock);
          media.texture.needsUpdate = true;
        });
        camera.position.x = x; camera.position.y = y; camera.zoom = z;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      },
    };
  };

  const update = () => {
    const dt = gsap.ticker.deltaRatio();
    if (dragging) { velocity.x = swipe.x; velocity.y = swipe.y; }
    else { velocity.x += (swipe.x - velocity.x) * SWIPE_RELEASE; velocity.y += (swipe.y - velocity.y) * SWIPE_RELEASE; }
    target.x += velocity.x;
    target.y += velocity.y;
    swipe.x = swipe.y = 0;

    const z = zoom.value;
    const hw = innerWidth / 2 / z, hh = innerHeight / 2 / z;
    min.x = hw; max.x = scroll.clientWidth - hw;
    min.y = hh; max.y = scroll.clientHeight - hh;
    if (z < 1) { max.y += (1 - z) * innerHeight; min.y -= (1 - z) * innerHeight; }
    target.x = Math.min(Math.max(target.x, min.x), Math.max(min.x, max.x));
    target.y = Math.min(Math.max(target.y, min.y), Math.max(min.y, max.y));
    const ease = site.reduced ? 1 : (isTouch ? INERTIA_TOUCH : INERTIA_WHEEL) * dt;
    current.x += (target.x - current.x) * Math.min(1, ease);
    current.y += (target.y - current.y) * Math.min(1, ease);

    list.style.transform = `translate3d(${-current.x * z + innerWidth / 2}px, ${-current.y * z + innerHeight / 2}px, 0) scale(${z})`;
    // The floor map follows the panel center at only 0.9x, flowing slower than the tiles
    const cx = (min.x + max.x) / 2, cy = (min.y + max.y) / 2;
    mapAt.x = -(cx + (current.x - cx) * MAP_DEPTH) * z + innerWidth / 2;
    mapAt.y = -(cy + (current.y - cy) * MAP_DEPTH) * z + innerHeight / 2;
    map.style.transform = `translate3d(${mapAt.x}px, ${mapAt.y}px, 0) scale(${z})`;

    // Tiles within 20% of the screen width from the mouse (phone: 100% from the screen center) grow up to 1.3x, more the closer they are
    const px = (isTouch ? innerWidth / 2 : mouse.x) / z + current.x - hw;
    const py = (isTouch ? innerHeight / 2 : mouse.y) / z + current.y - hh;
    const reach = innerWidth * (isSp ? 1 : 0.2);
    const g = sound.on && sound.graph;
    tiles.forEach((t, i) => {
      const inView = t.right > current.x - hw && t.left < current.x + hw && t.bottom > current.y - hh && t.top < current.y + hh;
      const d = Math.hypot(px - t.cx, py - t.cy);
      const near = clamp(1 - d / reach, 0, 1);
      gl?.play(i, inView || d < reach);
      // Sound: volume by distance from the cursor, left-right pan by horizontal offset (±.8). If a scene panel is open, only that scene is fully heard from the center
      if (g) {
        const sc = g.scenes[i];
        sc.gain.gain.value = sound.opened ? (sound.opened === t.el.dataset.id ? 1 : 0) : near;
        sc.panner.pan.value = sound.opened ? 0 : -clamp(((px - t.cx) / reach) * 0.8, -0.8, 0.8);
        const now = gl ? gl.time(i) : 0, prev = sound.last[i];
        if (peaksOf[i].some((pk) => (prev < pk && now >= pk) || (prev > now && pk <= now))) sc.synth.triggerAttackRelease(NOTES[i % NOTES.length], 0.3);
        sound.last[i] = now;
      }
      if (!inView && d >= reach) return;
      // Reduced motion turns off the swelling and only follows sound distance
      t.scale = site.reduced ? 1 : t.scale + (1 + near * 0.3 - t.scale) * Math.min(1, 0.08 * dt);
      t.el.style.transform = `scale(${t.scale})`;
      gl?.scale(i, t.scale);
      // When a near scene (.6 radius) hits its peak (±.05s), the wordmark word bounces
      if (g && d < reach * 0.6 && gl && peaksOf[i].some((pk) => Math.abs(gl.time(i) - pk) <= 0.05)) site.jumpMark?.();
    });
    // Background sound: if the scene nearest the cursor is outdoors, move toward the outdoor sound over .5s
    if (g) {
      let best = -1, bd = Infinity;
      tiles.forEach((t, i) => { const dd = Math.hypot(px - t.cx, py - t.cy); if (dd < bd) { bd = dd; best = i; } });
      if (best >= 0 && outdoorOf[best] !== sound.outdoor) { sound.outdoor = outdoorOf[best]; g.cross.fade.rampTo(sound.outdoor ? 1 : 0, 0.5); }
    }

    // Minimap frame: draws the currently visible range at a ratio fitting the full plate width to the minimap width (on phones the plate is 8x, so divide by 8 more)
    const ratio = miniMap.clientWidth / innerWidth;
    const k = isSp ? 8 : 1;
    miniFrame.style.transform = `scale(${1 / z / k}) translate3d(${-mapAt.x * ratio}px, ${-mapAt.y * ratio}px, 0)`;
    miniFrame.style.borderWidth = `${z * k * 2}px`;
    miniFrame.style.aspectRatio = innerWidth / innerHeight;
    // The camera looks at the point offset from its current position by half the screen width and height, using scale as zoom (original glScroll)
    gl?.draw(current.x - innerWidth / 2, -current.y + innerHeight / 2, z);
  };
  gsap.ticker.add(update);

  // ── Sound (Tone.js 15.0.4): same graph as the original — scene sound → Panner → Gain → master Gain → Volume, indoor·outdoor ambient sound moves via CrossFade over .5s.
  // Original sound files are assets, so scene sounds are short notes (Synth) that ring at each vertex of the placeholder video, and the background sound is brown and pink noise ──
  const peaksOf = items.map((el) => (el.dataset.peaks || "").split(" ").filter(Boolean).map(Number));
  const outdoorOf = items.map((el) => el.hasAttribute("data-outdoor"));
  const NOTES = ["C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6"];
  const sound = { on: false, graph: null, outdoor: false, opened: null, last: items.map(() => 0) };
  const graph = () => {
    if (sound.graph || !window.Tone) return sound.graph;
    const volume = new Tone.Volume(0).toDestination();
    const master = new Tone.Gain(1).connect(volume);
    const cross = new Tone.CrossFade().connect(master);
    cross.fade.value = 0;
    const scenes = items.map(() => {
      const gain = new Tone.Gain(1).connect(master);
      const panner = new Tone.Panner(0).connect(gain);
      const synth = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.4 } }).connect(panner);
      return { gain, panner, synth };
    });
    const indoor = new Tone.Noise("brown").connect(new Tone.Filter(400, "lowpass").connect(cross.a));
    const outdoor = new Tone.Noise("pink").connect(new Tone.Filter(1200, "lowpass").connect(cross.b));
    indoor.volume.value = outdoor.volume.value = -10;
    return (sound.graph = { volume, cross, scenes, indoor, outdoor });
  };
  site.on("sound", async (mode) => {
    const g = graph();
    if (!g) return;
    if (mode === "off") {
      g.indoor.stop(); g.outdoor.stop();
      g.volume.volume.rampTo(0, 0.5);
      sound.on = false;
      return;
    }
    if (sound.on) return;
    await Tone.start();
    g.indoor.start(); g.outdoor.start();
    g.volume.volume.rampTo(10, 0.5);
    sound.on = true;
  });
  document.addEventListener("visibilitychange", () => { if (sound.graph) Tone.getDestination().mute = document.hidden; });
  site.on("detail:open", (id) => (sound.opened = id));
  site.on("detail:close", () => (sound.opened = null));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ── Input ──
  const point = (e) => (e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY });
  const onWheel = (e) => {
    e.preventDefault();
    target.x += e.deltaX / zoom.value;
    target.y += e.deltaY / zoom.value;
  };
  const onPinch = (e) => {
    if (!pinchDist) return;
    const [a, b] = e.touches;
    const lo = isSp ? ZOOM_MIN_SP : ZOOM_MIN_PC, hi = isSp ? ZOOM_MAX_SP : ZOOM_MAX_PC;
    const next = Math.min(hi, Math.max(lo, pinchZoom * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinchDist));
    const ox = pinchAt.x - innerWidth / 2, oy = pinchAt.y - innerHeight / 2;
    target.x = target.x + ox / zoom.value - ox / next;
    target.y = target.y + oy / zoom.value - oy / next;
    zoom.value = next;
  };
  const onMove = (e) => {
    if (e.cancelable && e.touches) e.preventDefault();
    if (e.touches?.length === 2) return onPinch(e);
    const p = point(e);
    mouse.x = p.x; mouse.y = p.y;
    if (dragging) {
      const dx = p.x - last.x, dy = p.y - last.y;
      swipe.x -= dx / zoom.value;
      swipe.y -= dy / zoom.value;
      if (Math.hypot(dx, dy) > 2) site.isDragMoved = true;
    }
    last.x = p.x; last.y = p.y;
  };
  const onDown = (e) => {
    const p = point(e);
    if (e.touches?.length === 2) {
      const [a, b] = e.touches;
      pinchAt.x = (a.clientX + b.clientX) / 2;
      pinchAt.y = (a.clientY + b.clientY) / 2;
      pinchDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchZoom = zoom.value;
    }
    dragging = true;
    site.isDragMoved = false;
    last.x = p.x; last.y = p.y;
  };
  const onUp = () => { dragging = false; pinchDist = 0; };
  let listening = false;
  const listen = (on) => {
    if (on === listening) return;
    listening = on;
    const m = on ? "addEventListener" : "removeEventListener";
    document[m]("wheel", onWheel, { passive: false });
    document[m]("mousedown", onDown);
    document[m]("mousemove", onMove, { passive: true });
    document[m]("mouseup", onUp);
    scroll[m]("touchstart", onDown, { passive: false });
    scroll[m]("touchmove", onMove, { passive: false });
    document[m]("touchend", onUp);
  };
  // Mouse position and drag are listened to only after the first appearance ends, as in the original, and not while the About or scene plates are open (original addScrollEvents)

  // ── Zoom button (PC): 2.5 ↔ 1, in the zoomed-out state the card title text grows ──
  let zoomedIn = true;
  const zoomTo = (value, duration = 1, onComplete) => gsap.to(zoom, { value, duration: site.reduced ? 0 : duration, ease: "power3.inOut", overwrite: true, onComplete });
  zoomBtn.addEventListener("click", () => {
    zoomedIn = !zoomedIn;
    zoomTo(zoomedIn ? ZOOM_MAX_PC : ZOOM_MIN_PC, 1, () => items.forEach((el) => (el.dataset.text = zoomedIn ? "s" : "l")));
    zoomBtn.dataset.zoom = zoomedIn ? "in" : "out";
  });
  matchMedia(MQ).addEventListener("change", (e) => {
    isSp = e.matches;
    zoomTo(isSp ? ZOOM_SP : ZOOM_MAX_PC, 0.2);
  });

  site.on("detail:open", () => { scroll.inert = true; listen(false); });
  site.on("detail:close", () => { scroll.inert = false; listen(true); });
  site.on("about:open", () => { scroll.inert = true; listen(false); });
  site.on("about:close", () => { scroll.inert = false; listen(true); });

  // ── First appearance: after the wordmark has all popped out, the map and about buttons appear over 1.6s, the logo from 1.5x and the map from half scale into place ──
  const opened = () => {
    hint.setAttribute("aria-hidden", "false");
    root.dataset.opEnd = "true";
    listen(true);
    const startX = current.x;
    let armed = false;
    setTimeout(() => (armed = true), 2000);
    const watch = () => {
      if (!armed || Math.abs(current.x - startX) <= 100) return;
      hint.setAttribute("aria-hidden", "true");
      gsap.ticker.remove(watch);
    };
    gsap.ticker.add(watch);
  };
  site.on("opening", () => { gl = makeGL(); });
  site.on("opening", () => {
    if (site.reduced) {
      gsap.set([".hd-main", ".hd-about", "[data-js=logo-static]"], { opacity: 1 });
      zoom.value = restZoom();
      return opened();
    }
    const D = 1.6, EASE = "power2.inOut";
    gsap.timeline({ onStart: () => zoomTo(restZoom(), 2), onComplete: opened })
      .to(".hd-main", { opacity: 1, duration: D, ease: EASE })
      .to(".hd-about", { opacity: 1, duration: D, ease: EASE }, "<")
      // Once the animated wordmark finishes, swap it for the still wordmark in the same spot
      .to("[data-js=logo-lottie]", { opacity: 0, duration: D, ease: EASE }, "<")
      .to("[data-js=logo-static]", { opacity: 1, duration: D, ease: EASE }, "<")
      .from("[data-js=logo]", { scale: isSp ? 1.2 : 1.5, duration: 2, ease: "power3.inOut" }, "<");
  });
  root.style.cursor = "wait";
  site.on("opening", () => (root.style.cursor = ""));
})();
