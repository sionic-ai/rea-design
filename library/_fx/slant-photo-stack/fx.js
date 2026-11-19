(() => {
  // Original Brand: dozens of photo panels (.0175-thick boxes) stand in a row at .375 spacing, rotated −30°, with larger x pushed further back in z (−x × aspect ratio × 1.5, −x × 6 on portrait screens)
  // Sends them and overlaps in a diagonal staircase. A camera with 5° field of view looks down from (0, 13.3, 35). Follows wheel ÷ 20 at .15 per step and drag at .1, spinning endlessly.
  // Only the hovered panel slides out of the row to the right .667 and down .1 over .5s expo.out, and the scene shrinks to .825x while dragging. The panel’s edge 15% melts into a blurred panel.
  const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const FS = `precision mediump float; varying vec2 vUv;
    uniform vec2 uMesh, uImage; uniform sampler2D uImg, uBlur; uniform float uEdge, uBlurAlpha;
    void main(){
      vec2 r = vec2(min((uMesh.x / uMesh.y) / (uImage.x / uImage.y), 1.0), min((uMesh.y / uMesh.x) / (uImage.y / uImage.x), 1.0));
      vec2 uv = vUv * r + (1.0 - r) * 0.5;
      float k = smoothstep(0.0, uEdge, vUv.x) * smoothstep(1.0, 1.0 - uEdge, vUv.x) * smoothstep(0.0, uEdge, vUv.y) * smoothstep(1.0, 1.0 - uEdge, vUv.y);
      vec4 blur = texture2D(uBlur, uv); blur.a *= uBlurAlpha;
      gl_FragColor = mix(texture2D(uImg, uv), blur, 1.0 - k);
    }`;

  function cssColor(el, prop) {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${prop})`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }

  // With no photo, the placeholder panel becomes a canvas — base tone, diagonal X, and a label saying what the photo is
  function placeholder(el, data, i) {
    const w = 512, h = Math.round(512 * data.ratio);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = cssColor(el, `--fx-tile-${(i % 4) + 1}`);
    g.fillRect(0, 0, w, h);
    g.strokeStyle = cssColor(el, "--fx-tile-line");
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    if (data.label) {
      g.font = `500 22px ${getComputedStyle(el).fontFamily}`;
      g.textAlign = "center"; g.textBaseline = "middle";
      const tw = Math.min(w - 40, g.measureText(data.label).width + 28);
      g.fillStyle = cssColor(el, "--fx-tile-1");
      g.fillRect((w - tw) / 2, h / 2 - 20, tw, 40);
      g.fillStyle = cssColor(el, "--fx-tile-ink");
      g.fillText(data.label, w / 2, h / 2, w - 60);
    }
    return c;
  }
  function blurOf(src) {
    const c = document.createElement("canvas");
    c.width = 24; c.height = Math.max(2, Math.round((24 * src.height) / src.width));
    const g = c.getContext("2d");
    g.filter = "blur(2px)";
    g.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }

  kfFx.register("slant-photo-stack", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    const parts = [...el.querySelectorAll('[data-fx-part="tile"]')];
    if (!parts.length) return;
    const gap = +(options.gap ?? 0.375);
    const turn = T.MathUtils.degToRad(+(options.turn ?? -30));
    const fov = +(options.fov ?? 5);
    const introDur = +(options.intro ?? 2);
    const from = +(options.from ?? -20);
    const shrink = +(options.shrink ?? 0.825);
    const slide = +(options.slide ?? 2 / 3);
    const wheelDiv = +options.wheel || 20;
    const follow = reduce ? 1 : +(options.follow ?? 0.15);
    const minCount = +options.min || 20;
    const hold = +(options.hold ?? 1.2);
    const waitStart = options.start === "wait";
    const canvas = document.createElement("canvas");
    canvas.className = "fx-slant-canvas";
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch (e) { return; }
    el.prepend(canvas);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(new T.Color(cssColor(el, "--kf-bg")), 1);

    let label = el.querySelector('[data-fx-part="label"]');
    const ownLabel = !label;
    if (!label) { label = document.createElement("span"); label.className = "fx-slant-label"; label.setAttribute("aria-hidden", "true"); el.append(label); }

    const data = parts.map((p) => {
      const img = p.querySelector("img");
      return { title: p.dataset.title || p.textContent.trim(), label: p.dataset.label || "", href: p.dataset.href || p.getAttribute("href") || "", ratio: +p.dataset.ratio || 0.75, img };
    });
    let list = data.slice();
    while (list.length < minCount) list = list.concat(data);

    const scene = new T.Scene();
    const root = new T.Group();
    scene.add(root);
    const camera = new T.PerspectiveCamera(fov, 1, 0.1, 1000);
    const camHome = new T.Vector3(0, 100 / 7.5, 35);
    const loader = new T.TextureLoader();
    const tiles = list.map((d, i) => {
      // Original plate size: width 1.5, height 1.5 × ratio, and the further the ratio is from 1, both scale by (1 − (ratio − 1) / 2)
      let w = 1.5, h = 1.5 * d.ratio;
      const fe = 1 - (d.ratio - 1) * 0.5;
      w *= fe; h *= fe;
      const mat = new T.ShaderMaterial({
        vertexShader: VS, fragmentShader: FS, transparent: true,
        uniforms: { uMesh: { value: new T.Vector2(w, h) }, uImage: { value: new T.Vector2(1, d.ratio) }, uImg: { value: null }, uBlur: { value: null }, uEdge: { value: 0.15 }, uBlurAlpha: { value: 0.75 } },
      });
      const setTex = (src) => {
        const t = new T.CanvasTexture(src); t.colorSpace = T.SRGBColorSpace;
        const b = new T.CanvasTexture(blurOf(src)); b.colorSpace = T.SRGBColorSpace;
        mat.uniforms.uImg.value = t; mat.uniforms.uBlur.value = b;
        mat.uniforms.uImage.value.set(src.width, src.height);
      };
      if (d.img && d.img.getAttribute("src")) {
        const im = new Image();
        im.onload = () => setTex(im);
        im.src = d.img.currentSrc || d.img.src;
        setTex(placeholder(el, { ratio: d.ratio, label: d.label }, i));
      } else setTex(placeholder(el, d, i));
      const geo = new T.BoxGeometry(w, h, 0.0175);
      const mesh = new T.Mesh(geo, mat);
      mesh.position.x = -(w - 1.5) / 2;
      const hit = new T.Mesh(geo, new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
      hit.scale.x = 1.5;
      hit.userData.index = i;
      const inner = new T.Group(); inner.add(mesh);
      const mover = new T.Group(); mover.add(inner, hit);
      root.add(mover);
      return { d, mesh, hit, inner, mover, w };
    });
    const span = (tiles.length * gap) / 2;
    const wrapX = gsap.utils.wrap(-span, span);

    const intro = { x: waitStart ? from : 0 };
    const scroll = { current: 0, previous: 0 };
    const ptr = { x: 0, y: 0, nx: 1000, ny: -1000, moved: false, active: false };
    const drag = { x: 0, y: 0, onX: 0, onY: 0, down: false, active: false, timer: 0, stamp: 0 };
    const lab = { x: 0, y: 0 };
    let M = 0, W = 1, H = 1, hovered = -1, lastHover = -2, opened = -1, dragShown = false, started = !waitStart;
    const ray = new T.Raycaster();
    const v2 = new T.Vector2();

    function resize() {
      W = Math.max(1, el.clientWidth); H = Math.max(1, el.clientHeight);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      if (opened < 0) { camera.position.set(0, camHome.y, W / H < 1 ? 55 : camHome.z); camera.lookAt(0, 0, 0); }
    }
    const slideTo = (t, on) => {
      const x = hover ? (on ? slide : 0) : on ? 0.325 : -0.325;
      gsap.to(t.inner.position, { x, y: on ? -0.1 : 0, ease: "expo.out", duration: reduce ? 0 : 0.5, overwrite: "auto" });
    };
    function pick(force) {
      if (!force && (!ptr.active || !ptr.moved || drag.active || opened >= 0)) return -1;
      v2.set(ptr.nx, ptr.ny);
      ray.setFromCamera(v2, camera);
      const hits = ray.intersectObjects(tiles.filter((t) => t.mover.visible).map((t) => t.hit));
      return hits.length ? hits[0].object.userData.index : -1;
    }

    function frame() {
      M += (drag.x - drag.y - M) * 0.1;
      scroll.previous += (scroll.current - scroll.previous) * follow;
      const aspect = W / H, q = hover ? 100 : 50;
      const J = scroll.previous / 25 - M / q + intro.x;
      if (opened < 0) {
        for (let i = 0; i < tiles.length; i++) {
          const t = tiles[i], m = t.mover;
          m.position.x = wrapX((i - J) * gap);
          m.position.y = 0;
          m.position.z = aspect < 1 ? -m.position.x * 6 : -m.position.x * aspect * 1.5;
          m.rotation.y = turn;
          m.visible = Math.abs(m.position.z) < 12.5;
        }
      }
      if (hover) {
        hovered = pick();
      } else if (opened < 0) {
        let best = -1, bz = Infinity;
        tiles.forEach((t, i) => { if (t.mover.visible && Math.abs(t.mover.position.z) < bz) { bz = Math.abs(t.mover.position.z); best = i; } });
        hovered = best;
      }
      if (hovered !== lastHover) {
        tiles.forEach((t, i) => slideTo(t, i === hovered && opened < 0));
        lastHover = hovered;
      }
      const showDrag = drag.active && ptr.active;
      if (showDrag !== dragShown && started) {
        dragShown = showDrag;
        gsap.to(root.scale, { x: showDrag ? shrink : 1, y: showDrag ? shrink : 1, z: showDrag ? shrink : 1, duration: reduce ? 0 : 0.75, ease: "expo.out", overwrite: "auto" });
      }
      // The tag moves 10% of the remaining distance each frame — once it has caught up (within .5px) snap it on and stop
      const lx = ptr.x - lab.x, ly = ptr.y - lab.y;
      if (Math.abs(lx) < 0.5 && Math.abs(ly) < 0.5) { lab.x = ptr.x; lab.y = ptr.y; } else { lab.x += lx * 0.1; lab.y += ly * 0.1; }
      const showLabel = hover && hovered >= 0 && opened < 0;
      const text = showLabel ? tiles[hovered].d.title : label.textContent;
      if (label.textContent !== text) label.textContent = text;
      // In the original the tag appears only while the board is being touched — while hidden it just follows the position and isn’t drawn
      const tf = `translate(${lab.x}px, ${lab.y}px)`, op = showLabel ? "1" : "0";
      if (showLabel && label.style.transform !== tf) label.style.transform = tf;
      if (label.style.opacity !== op) label.style.opacity = op;
      const cur = opened >= 0 ? "default" : hovered >= 0 && hover ? "pointer" : drag.active ? "grabbing" : "grab";
      if (el.style.cursor !== cur) el.style.cursor = cur;
      renderer.render(scene, camera);
    }

    // If grow is false (returning to an already seen scene) only the board lines flow in and the scene growth is skipped — the original grows the scene only on first creation
    function start(grow = true) {
      if (started) return;
      started = true;
      intro.x = from;
      gsap.to(intro, { x: 0, duration: reduce ? 0 : introDur, ease: "expo.out" });
      if (!grow) return;
      gsap.set(root.scale, { x: shrink, y: shrink, z: shrink });
      gsap.to(root.scale, { x: 1, y: 1, z: 1, duration: reduce ? 0 : 1, delay: reduce ? 0 : 1.25, ease: "expo.out" });
    }

    // Pressing a panel leaves only that one and turns it to face front (1.25s expo.inOut) while the camera moves right in front (30, 35 on phone)
    function open(i) {
      const t = tiles[i];
      opened = i;
      tiles.forEach((o, k) => { o.mover.visible = k === i; });
      label.style.opacity = 0;
      const aspect = W / H, d = reduce ? 0 : 1;
      gsap.to(t.mesh.position, { x: 0, ease: "expo.out", duration: (1.25 / 3) * 2 * d });
      gsap.to(t.mover.position, { x: 0, ease: "expo.out", duration: (1.25 / 3) * 2 * d, onUpdate: () => { t.mover.position.z = -t.mover.position.x * aspect * 1.5; } });
      gsap.to(t.inner.position, { x: 0, y: 0, ease: "expo.out", duration: 0.5 * d });
      gsap.to(camera.position, { x: 0, y: 0, z: W < 640 ? 35 : 30, ease: "expo.inOut", duration: 1.25 * d, onUpdate: () => camera.lookAt(0, 0, 0) });
      gsap.to(t.mover.rotation, { y: 0, ease: "expo.inOut", duration: 1.25 * d, onComplete: () => {
        const go = el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true, cancelable: true, detail: { index: i % data.length, title: t.d.title, href: t.d.href } }));
        if (go && t.d.href) window.location.href = t.d.href;
        else if (!t.d.href) gsap.delayedCall(hold, close);
      } });
    }
    function close() {
      const i = opened;
      if (i < 0) return;
      const t = tiles[i], d = reduce ? 0 : 1;
      gsap.to(t.mesh.position, { x: -(t.w - 1.5) / 2, ease: "expo.out", duration: 0.833 * d });
      gsap.to(camera.position, { x: 0, y: camHome.y, z: W / H < 1 ? 55 : camHome.z, ease: "expo.inOut", duration: 1.25 * d, onUpdate: () => camera.lookAt(0, 0, 0) });
      gsap.to(t.mover.rotation, { y: turn, ease: "expo.inOut", duration: 1.25 * d, onComplete: () => { opened = -1; lastHover = -2; } });
    }

    // Even when the panel doesn’t fill the screen (demo or inside a section), measure by the position within the panel
    const setNdc = (e) => {
      const r = el.getBoundingClientRect();
      ptr.nx = ((e.clientX - r.left) / W - 0.5) * 2; ptr.ny = -((e.clientY - r.top) / H - 0.5) * 2;
    };
    const onMove = (e) => {
      if (e.target.closest && e.target.closest("nav, header, a, button") && !el.contains(e.target)) { ptr.active = false; return; }
      ptr.x = e.clientX; ptr.y = e.clientY;
      setNdc(e);
      ptr.moved = true; ptr.active = true;
      if (drag.down) { drag.x = drag.onX + e.clientX; drag.y = drag.onY + e.clientY; }
    };
    const onDown = (e) => {
      if (opened >= 0 || (e.pointerType === "mouse" && e.button !== 0)) return;
      drag.stamp = e.timeStamp;
      drag.onX = drag.x - e.clientX; drag.onY = drag.y - e.clientY;
      drag.down = true;
      clearTimeout(drag.timer);
      drag.timer = setTimeout(() => { drag.active = true; }, 150);
    };
    const onUp = () => {
      clearTimeout(drag.timer);
      drag.down = false; drag.active = false;
    };
    const onLeave = () => { ptr.active = false; ptr.nx = 1000; ptr.ny = -1000; };
    // Only a short press opens (to tell it from a drag) — for touch, picks the board under the pressed spot
    const onClick = (e) => {
      if (opened >= 0 || e.timeStamp - drag.stamp > 200) return;
      let i = hovered;
      if (!hover) {
        setNdc(e);
        i = pick(true);
      }
      if (i >= 0) open(i);
    };
    // If the same virtual-scroll as the original is loaded, use it (wheel · arrow keys · space, touch ×20) — otherwise take the wheel directly. Flows only on mouse devices
    const Scroller = window.virtualScroll;
    const vs = Scroller ? new Scroller({ el, touchMultiplier: 20, passive: true }) : null;
    vs?.on((e) => { if (hover && opened < 0) scroll.current -= (e.deltaY + e.deltaX) / wheelDiv; });
    const onWheel = (e) => { if (!vs && hover && opened < 0) scroll.current += (e.deltaY + e.deltaX) / wheelDiv; };
    const onStart = (e) => start(e.detail?.grow !== false);

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    label.style.left = "0px"; label.style.top = "0px";
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick);
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("fx:start", onStart);
    gsap.ticker.add(frame);
    if (!waitStart) { started = false; start(); }

    return () => {
      gsap.ticker.remove(frame);
      ro.disconnect();
      clearTimeout(drag.timer);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick);
      el.removeEventListener("wheel", onWheel);
      vs?.destroy();
      el.removeEventListener("fx:start", onStart);
      gsap.killTweensOf([intro, root.scale, camera.position, ...tiles.flatMap((t) => [t.inner.position, t.mover.position, t.mover.rotation, t.mesh.position])]);
      gsap.killTweensOf(close);
      tiles.forEach((t) => { t.mesh.geometry.dispose(); t.mesh.material.uniforms.uImg.value?.dispose(); t.mesh.material.uniforms.uBlur.value?.dispose(); t.mesh.material.dispose(); t.hit.material.dispose(); });
      renderer.dispose();
      renderer.forceContextLoss?.();
      canvas.remove();
      if (ownLabel) label.remove(); else { label.style.transform = ""; label.style.opacity = ""; }
      el.style.cursor = "";
    };
  });
})();
