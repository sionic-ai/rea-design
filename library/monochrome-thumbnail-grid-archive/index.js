// First page — 18 thumbnail cells appearing, WebGL preview on the right face (folds and unfolds diagonally), 14 falling leaves, Grid ↔ Slider (Flip + horizontal scrub)
(() => {
  const BEND_VS = `
    uniform float uAmount;
    varying vec2 vUv;
    vec2 spin(vec2 v, float a){ float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
    void main(){
      vUv = uv;
      vec3 p = position;
      // Rotates the plate −45° so the diagonal stands as the vertical axis, then rolls along that axis and back. It is orthographic, so it shrinks along the diagonal by the rolled amount
      p.xy = spin(p.xy, -0.7853982);
      float a = p.y * uAmount;
      p = vec3(p.x, p.y * cos(a) - p.z * sin(a), p.y * sin(a) + p.z * cos(a));
      p.xy = spin(p.xy, 0.7853982);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const PHOTO_FS = `
    uniform sampler2D uTex; uniform float uAlpha; varying vec2 vUv;
    void main(){ gl_FragColor = vec4(texture2D(uTex, vUv).rgb, uAlpha); }`;

  // Photo slot — the original uses color photo textures, here a placeholder painted in Skin color (diagonal X + what photo it is)
  const paint = (ref) => {
    const r = ref.getBoundingClientRect();
    const h = 640, w = Math.round(h * (r.width / Math.max(1, r.height) || 1.5));
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    const g = c.getContext("2d");
    g.fillStyle = FF.color("--site-photo");
    g.fillRect(0, 0, w, h);
    g.strokeStyle = FF.color("--site-photo-ink");
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const label = ref.dataset.label || "";
    g.font = `500 ${Math.round(h * 0.034)}px ${getComputedStyle(document.body).getPropertyValue("--wf-mono") || "monospace"}`;
    const tw = g.measureText(label).width + 40;
    g.fillStyle = FF.color("--site-photo");
    g.fillRect((w - tw) / 2, h / 2 - 26, tw, 52);
    g.fillStyle = FF.color("--site-photo-ink");
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(label, w / 2, h / 2);
    return c;
  };

  const stageFor = (root, refs) => {
    const host = root.querySelector(".ff-canvas");
    if (!host || !window.THREE || !refs.length) return null;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-innerWidth / 2, innerWidth / 2, innerHeight / 2, -innerHeight / 2, 0.1, 1e4);
    camera.position.z = 100;
    const geo = new THREE.PlaneGeometry(1, 1, 20, 20);
    const meshes = refs.map((ref) => {
      const tex = new THREE.CanvasTexture(paint(ref));
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTex: { value: tex }, uAlpha: { value: 0 }, uAmount: { value: 0 } },
        vertexShader: BEND_VS,
        fragmentShader: PHOTO_FS,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const m = new THREE.Mesh(geo, mat);
      scene.add(m);
      return m;
    });
    meshes[0].material.uniforms.uAlpha.value = 1;
    // The board follows the screen position and size of the per-frame anchor (.ff-ref) — when the anchor shrinks from 1.3x, the board shrinks with it.
    const place = () => refs.forEach((ref, i) => {
      const r = ref.getBoundingClientRect(), m = meshes[i];
      m.scale.set(r.width, r.height, 1);
      m.position.set(-innerWidth / 2 + r.left + r.width / 2, innerHeight / 2 - r.top - r.height / 2, 0);
    });
    place();
    renderer.compile(scene, camera);
    const tick = () => { place(); renderer.render(scene, camera); };
    gsap.ticker.add(tick);
    const resize = () => {
      renderer.setSize(innerWidth, innerHeight);
      Object.assign(camera, { left: -innerWidth / 2, right: innerWidth / 2, top: innerHeight / 2, bottom: -innerHeight / 2 });
      camera.updateProjectionMatrix();
    };
    addEventListener("resize", resize);
    return {
      meshes,
      u: (i) => meshes[i].material.uniforms,
      destroy() {
        gsap.ticker.remove(tick);
        removeEventListener("resize", resize);
        meshes.forEach((m) => { m.material.uniforms.uTex.value.dispose(); m.material.dispose(); });
        geo.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  };

  // Leaf. It starts from −800~500px horizontally and −2 screens~0 vertically relative to the surface center, falls straight down 2.6 screens over 20±10s, and sways ±120px · ±180° every 1.5s.
  const leafRain = (area, n) => {
    const fall = innerHeight * 2;
    return Array.from({ length: n }, () => {
      const el = document.createElement("div");
      el.className = "ff-leaf";
      el.innerHTML = FF.leaf;
      area.append(el);
      gsap.set(el, { x: gsap.utils.random(-800, 500), y: gsap.utils.random(-fall, 0), rotation: gsap.utils.random(0, 360) });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(0.5, 1.5) })
        .to(el, { duration: 20 + gsap.utils.random(-10, 10), y: `+=${fall * 1.3}`, ease: "none" }, 0)
        .to(el, { x: `+=${gsap.utils.random(-120, 120)}`, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(20 / 1.5), duration: 1.5 }, 0)
        .to(el, { rotation: `+=${gsap.utils.random(-180, 180)}`, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(20 / 1.5), duration: 1.5 }, 0);
      return { el, tl };
    });
  };

  FF.pages.home = (root) => {
    const q = (s) => root.querySelector(s), qa = (s) => [...root.querySelectorAll(s)];
    const timers = [], offs = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const on = (el, type, fn) => { el.addEventListener(type, fn); offs.push(() => el.removeEventListener(type, fn)); };
    if (!FF.wide) qa("[data-mobile-hide]").forEach((e) => e.remove());
    const grid = q(".ff-grid"), contents = q(".ff-grid__contents");
    const items = qa(".ff-grid__item"), thumbs = qa(".ff-grid__thumb"), refs = qa("[data-image-item] .ff-ref"), full = qa(".ff-grid__full > *");
    const btnGrid = q("[data-grid-view]"), btnList = q("[data-list-view]"), pillBg = q(".ff-view__bg"), view = q(".ff-view"), home = q(".ff-home");
    let mode = "grid", stage = null, leaves = [], row = null;
    // On first open, 2.6s after the loader lifts, when arriving via a page transition, .34s after
    const vo = FF.loaded ? 0.34 : 2.6;

    if (FF.reduce) {
      gsap.set(items, { opacity: 1 });
      return { destroy() {} };
    }

    items.forEach((a) => on(a, "click", (e) => e.preventDefault()));

    const reveal = () => {
      gsap.fromTo(items, { opacity: 0 }, { opacity: 1, duration: 3.2, ease: "power4.out", delay: vo, stagger: { from: "start", each: 0.04 } });
      gsap.fromTo(thumbs.map((t) => t.firstElementChild), { scale: 1.4 }, { scale: 1, duration: 2.4, ease: "power4.out", delay: vo, stagger: { from: "start", each: 0.03 } });
    };
    const intro = () => later(() => {
      gsap.fromTo(refs[0], { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "power4.out", delay: vo - 0.2 });
      gsap.fromTo(stage.u(0).uAlpha, { value: 0 }, { value: 1, duration: 2, delay: vo - 0.2 });
      gsap.fromTo(stage.u(0).uAmount, { value: 2.2 }, { value: 0, duration: 1, delay: vo - 0.2 });
    }, 200);

    // Interaction on thumbnail — Grid: the front panel fades out in .4s while the new panel forms in 2s and spreads in 1s (warp 2.2→0), placement 1.3→1 · Slider: full-screen photo .4s
    const hover = () => {
      let last = stage.meshes[0];
      thumbs.forEach((t, i) => {
        on(t, "mouseenter", () => {
          if (mode === "grid") {
            if (last) gsap.to(last.material.uniforms.uAlpha, { value: 0, duration: 0.4, overwrite: true });
            gsap.fromTo(refs[i], { scale: 1.3 }, { scale: 1, duration: 1, overwrite: true });
            gsap.to(stage.u(i).uAlpha, { value: 1, duration: 2, overwrite: true });
            gsap.fromTo(stage.u(i).uAmount, { value: 2.2 }, { value: 0, duration: 1, overwrite: true });
          } else if (full[i]) gsap.to(full[i], { opacity: 1, duration: 0.4, overwrite: true });
        });
        on(t, "mouseleave", () => {
          if (mode === "grid") last = stage.meshes[i];
          else if (full[i]) gsap.to(full[i], { opacity: 0, duration: 0.4, overwrite: true });
        });
      });
    };

    const lock = (v) => gsap.set([view, home], { pointerEvents: v ? "none" : "auto" });
    const toSlider = () => {
      mode = "slider";
      lock(true);
      FF.toTop(root);
      const state = Flip.getState(items);
      contents.classList.add("is-row");
      grid.classList.add("is-row");
      btnList.classList.add("is-current");
      btnGrid.classList.remove("is-current");
      Flip.from(state, {
        duration: 1.4, ease: "power2.inOut", delay: 0.3, stagger: { from: "start", each: 0.03 }, absolute: true,
        onComplete: () => {
          lock(false);
          gsap.to(q(".ff-scroll"), { opacity: 1, duration: 0.6 });
          const w = items[0].getBoundingClientRect().width;
          // Binds 10000px vertical scroll to the strip’s horizontal travel (cell width × cell count + .4 cell width)
          row = gsap.to(contents, { x: `-${w * items.length + w * 0.4}px`, scrollTrigger: { trigger: root, scroller: root, start: "top top", end: "+=10000px", scrub: true } });
        },
      });
      gsap.to(pillBg, { x: "80px", duration: 1.2, ease: "power4.inOut" });
      if (FF.wide) {
        gsap.to([q(".ff-grid__area"), q(".ff-grid__area-image")], { clipPath: "inset(0% 0% 0% 100%)", duration: 1.4, ease: "power4.out" });
        gsap.to(q(".ff-canvas"), { opacity: 0, duration: 0.4, ease: "power4.out" });
      }
    };
    const toGrid = () => {
      mode = "grid";
      lock(true);
      FF.toTop(root, () => {
        const state = Flip.getState(items);
        gsap.to(q(".ff-scroll"), { opacity: 0, duration: 0.4 });
        contents.classList.remove("is-row");
        grid.classList.remove("is-row");
        btnList.classList.remove("is-current");
        btnGrid.classList.add("is-current");
        Flip.from(state, {
          duration: 1.4, ease: "power2.inOut", stagger: { from: "start", each: 0.03 }, absolute: true,
          onComplete: () => { row?.scrollTrigger?.kill(); row?.kill(); row = null; gsap.set(contents, { x: 0 }); lock(false); },
        });
        if (FF.wide) {
          gsap.to([q(".ff-grid__area"), q(".ff-grid__area-image")], { clipPath: "inset(0% 0% 0% 0%)", delay: 1.45, duration: 1.4, ease: "power4.out" });
          gsap.to(q(".ff-canvas"), { opacity: 1, delay: 1.45, duration: 1.6, ease: "power4.out" });
        }
        gsap.to(pillBg, { x: "0px", duration: 1.2, ease: "power4.inOut" });
      });
    };

    later(() => {
      if (FF.wide) {
        stage = stageFor(root, refs);
        const area = q(".ff-grid__area");
        if (area) leaves = leafRain(area, 14);
        if (stage) { intro(); later(hover, 200); }
      }
      reveal();
      on(btnList, "click", toSlider);
      on(btnGrid, "click", toGrid);
    }, 200);

    return {
      destroy() {
        timers.forEach(clearTimeout);
        offs.forEach((f) => f());
        leaves.forEach(({ el, tl }) => { tl.kill(); el.remove(); });
        row?.scrollTrigger?.kill();
        row?.kill();
        stage?.destroy();
      },
    };
  };
})();
