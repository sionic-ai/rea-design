// A full-bleed photo panel ripples along a distortion map and melts into the next photo (WebGL). The progress line fills over the hold seconds, and during the change
// Retracts in reverse, pivoting on the opposite end. The title panel exits to the right and a new title enters from the left, and page numbers roll one slot at a time.
// Prev/next buttons finish the running progress faster by the remaining share (10 × remaining share times) and advance right away — the original winds up the waiting line rather than discarding it
(() => {
  // Image slots (placeholders, not real pictures) are filled with the skin color and used as the image — a flat gray panel would not show the ripple
  const paintHolder = (node, w, h, seed) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const css = getComputedStyle(node), v = (n) => css.getPropertyValue(n).trim();
    const tones = [v("--kf-raised"), v("--kf-dim"), v("--kf-ink-soft"), v("--kf-accent"), v("--kf-surface")].filter(Boolean);
    const pick = (k) => tones[(seed * 2 + k) % tones.length] || "gray";
    const sky = g.createLinearGradient(0, 0, w * 0.25, h);
    sky.addColorStop(0, pick(0)); sky.addColorStop(0.55, pick(1)); sky.addColorStop(1, pick(2));
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 7; i++) {
      const x = rnd() * w, y = rnd() * h, r = (0.12 + rnd() * 0.3) * Math.max(w, h);
      const blob = g.createRadialGradient(x, y, 0, x, y, r);
      blob.addColorStop(0, pick(i + 3)); blob.addColorStop(1, "transparent");
      g.globalAlpha = 0.55; g.fillStyle = blob; g.fillRect(0, 0, w, h);
    }
    g.globalAlpha = 0.5; g.strokeStyle = v("--kf-bg") || "white"; g.lineWidth = Math.max(1, w / 900);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const label = node.getAttribute("data-label") || node.getAttribute("alt") || "";
    if (label) {
      g.globalAlpha = 1;
      // The full-bleed panel has the title on its left, so the label goes small in the top right cell
      const fs = Math.round(w / 110), cx = w * 0.72, cy = h * 0.3;
      g.font = `400 ${fs}px ${v("--kf-font-sans") || "sans-serif"}`;
      g.textAlign = "center"; g.textBaseline = "middle";
      const tw = g.measureText(label).width + fs * 1.6;
      g.fillStyle = v("--kf-bg") || "white"; g.fillRect(cx - tw / 2, cy - fs, tw, fs * 2);
      g.fillStyle = v("--kf-ink") || "black"; g.fillText(label, cx, cy);
    }
    return c;
  };

  // Distortion map — draws and uses wavy noise (the original image file is not used)
  const paintNoise = (n = 256) => {
    const c = document.createElement("canvas");
    c.width = c.height = n;
    const g = c.getContext("2d"), img = g.createImageData(n, n);
    const grid = 8, cell = [];
    for (let i = 0; i < (grid + 1) * (grid + 1); i++) cell.push(Math.sin(i * 12.9898) * 43758.5453 % 1);
    const at = (x, y, k) => {
      const gx = (x / n) * grid * k, gy = (y / n) * grid * k, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
      const q = (a, b) => Math.abs(cell[((b % grid) * (grid + 1) + (a % grid)) % cell.length]);
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      return (q(x0, y0) * (1 - sx) + q(x0 + 1, y0) * sx) * (1 - sy) + (q(x0, y0 + 1) * (1 - sx) + q(x0 + 1, y0 + 1) * sx) * sy;
    };
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const f = at(x, y, 1) * 0.6 + at(x, y, 2) * 0.3 + at(x, y, 4) * 0.1;
      const val = 0.5 + 0.5 * Math.sin(f * 14);
      const o = (y * n + x) * 4;
      img.data[o] = img.data[o + 1] = img.data[o + 2] = val * 255;
      img.data[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  };

  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const FRAG = [
    "varying vec2 vUv;",
    "uniform float dispFactor; uniform float intensity; uniform float angle1; uniform float angle2;",
    "uniform sampler2D disp; uniform sampler2D tex1; uniform sampler2D tex2; uniform vec2 cover;",
    "mat2 rot(float a){ float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }",
    "void main(){",
    "  vec2 d = texture2D(disp, vUv).rg;",
    "  vec2 uv = (vUv - 0.5) * cover + 0.5;",
    "  vec4 a = texture2D(tex1, uv + rot(angle1) * d * intensity * dispFactor);",
    "  vec4 b = texture2D(tex2, uv + rot(angle2) * d * intensity * (1.0 - dispFactor));",
    "  gl_FragColor = mix(a, b, dispFactor);",
    "}",
  ].join("\n");

  kfFx.register("displace-swap-slider", (el, { options, reduce }) => {
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const images = [...el.querySelectorAll('[data-fx-part="image"]')];
    if (!images.length || !window.THREE) return;
    const titles = [...el.querySelectorAll('[data-fx-part="title"]')];
    const reelBox = el.querySelector('[data-fx-part="reel"]'), total = el.querySelector('[data-fx-part="total"]');
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const hold = +options.hold || 6, speed = +(options.speed ?? 3), delay = +(options.delay ?? 0), intensity = +(options.intensity ?? -0.07);
    const ease = kfFx.ease(options.ease || "power4.out", "power4.out"), roll = +(options.roll ?? 2);
    const n = images.length;
    let idx = 0, running = false, clock = null, alive = true;

    const T = THREE;
    const renderer = new T.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" });
    stage.append(canvas);
    const scene = new T.Scene(), camera = new T.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);
    camera.position.z = 1;

    const ratioOf = (node) => (node.naturalHeight && node.naturalWidth ? node.naturalHeight / node.naturalWidth : node.height && node.width && node.tagName === "CANVAS" ? node.height / node.width : null);
    const imgRatio = +options.ratio || ratioOf(images[0]) || 0.5;
    const texOf = (node, i) => {
      if (node.tagName === "IMG") {
        const t = new T.TextureLoader().load(node.currentSrc || node.src, () => draw());
        t.minFilter = t.magFilter = T.LinearFilter;
        return t;
      }
      const src = node.tagName === "CANVAS" ? node : paintHolder(node, 1600, Math.round(1600 * imgRatio), i + 1);
      const t = new T.CanvasTexture(src);
      t.minFilter = t.magFilter = T.LinearFilter;
      return t;
    };
    const textures = images.map(texOf);
    const dispTex = new T.CanvasTexture(paintNoise());
    dispTex.wrapS = dispTex.wrapT = T.RepeatWrapping;
    const uniforms = {
      dispFactor: { value: 0 }, intensity: { value: intensity }, angle1: { value: Math.PI * 2 }, angle2: { value: Math.PI },
      disp: { value: dispTex }, tex1: { value: textures[0] }, tex2: { value: textures[1 % n] }, cover: { value: new T.Vector2(1, 1) },
    };
    const material = new T.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true });
    const geometry = new (T.PlaneBufferGeometry || T.PlaneGeometry)(1, 1);
    scene.add(new T.Mesh(geometry, material));
    const draw = () => alive && renderer.render(scene, camera);
    const fit = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      const r = h / w;
      if (r < imgRatio) uniforms.cover.value.set(1, r / imgRatio); else uniforms.cover.value.set((w / h) * imgRatio, 1);
      draw();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    fit();
    images.forEach((node) => (node.style.visibility = "hidden"));

    if (total) total.textContent = String(n).padStart(2, "0");
    const digits = [];
    if (reelBox) {
      reelBox.textContent = "";
      for (let i = 0; i < n; i++) {
        const s = document.createElement("span");
        s.textContent = String(i + 1);
        reelBox.append(s);
        digits.push(s);
        if (i) gsap.set(s, { yPercent: 100 });
      }
    }
    titles.forEach((t, i) => i && gsap.set(t, { display: "none", opacity: 0 }));

    const progress = (from, to, origin, dur, done) => gsap.timeline({ onComplete: done })
      .set(el, { "--fx-origin": origin })
      .fromTo(el, { "--fx-progress": from }, { "--fx-progress": to, delay: 0.1, duration: dur, ease: "power3.out" });
    const primary = () => (clock = progress(0, 1, "0% 0%", hold, () => change(1)));

    const rollTo = (from, to) => {
      if (!digits.length) return;
      const down = from < to || to === 0;
      gsap.timeline()
        .set(digits[to], { yPercent: down ? -100 : 100 })
        .to(digits[from], { yPercent: down ? 100 : -100, duration: roll })
        .to(digits[to], { yPercent: 0, duration: roll }, "<");
    };
    const swapTitle = (from, to) => {
      if (!titles[from] || !titles[to]) return;
      gsap.timeline()
        .to(titles[from], { opacity: 0, x: "3vw", duration: speed / 2 })
        .set(titles[from], { display: "none" })
        .set(titles[to], { display: "flex", x: "-1.5vw" })
        .to(titles[to], { opacity: 1, x: 0, duration: speed / 2, delay: 0.17 });
    };

    function change(dir) {
      if (running || !alive) return;
      running = true;
      el.dataset.state = "change";
      const to = (idx + dir + n) % n;
      uniforms.tex2.value = textures[to];
      rollTo(idx, to);
      clock = progress(1, 0, "100% 0%", speed);
      swapTitle(idx, to);
      gsap.to(uniforms.dispFactor, {
        value: 1, duration: reduce ? 0 : speed, ease, onUpdate: draw,
        onComplete: () => {
          idx = to;
          uniforms.tex1.value = textures[to];
          uniforms.dispFactor.value = 0;
          delete el.dataset.state;
          running = false;
          draw();
          if (!reduce) primary();
        },
      });
    }

    // The button fast-forwards the current run by its remaining share to finish, then advances
    const skip = (dir) => {
      if (reduce || !clock) return change(dir);
      clock.pause();
      clock.eventCallback("onComplete", () => change(dir));
      const left = 10 * (1 - Math.trunc(100 * clock.progress()) / 100);
      clock.timeScale(left || 10).play();
    };
    const onPrev = () => skip(-1), onNext = () => skip(1);
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);

    let starter = null, st = null;
    if (!reduce) {
      starter = gsap.delayedCall(delay, primary);
      if (window.ScrollTrigger) st = ScrollTrigger.create({ trigger: el, onEnterBack: () => clock?.play(), onLeave: () => clock?.pause() });
    }

    return () => {
      alive = false;
      starter?.kill();
      st?.kill();
      clock?.kill();
      gsap.killTweensOf([uniforms.dispFactor, el, ...titles, ...digits]);
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      ro.disconnect();
      textures.forEach((t) => t.dispose());
      dispTex.dispose(); material.dispose(); geometry.dispose(); renderer.dispose();
      canvas.remove();
      images.forEach((node) => (node.style.visibility = ""));
      titles.forEach((t) => gsap.set(t, { clearProps: "all" }));
      if (reelBox) reelBox.textContent = "1";
      el.style.removeProperty("--fx-progress");
      el.style.removeProperty("--fx-origin");
      delete el.dataset.state;
    };
  });
})();
