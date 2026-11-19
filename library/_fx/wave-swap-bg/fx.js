(() => {
  const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  // Blends two images by pushing them in opposite directions with the same sine wave displacement — progress 0 shows the front image, 1 the back image
  const FRAG = `
    varying vec2 vUv;
    uniform sampler2D u_from; uniform sampler2D u_to; uniform sampler2D u_disp;
    uniform float u_progress; uniform float u_effect; uniform vec3 u_solid; uniform float u_fromSolid;
    void main() {
      vec2 uv = vUv;
      vec4 d = texture2D(u_disp, uv);
      vec2 p1 = vec2(uv.x - u_progress * (d.r * u_effect), uv.y + u_progress * (d.r * u_effect));
      vec2 p2 = vec2(uv.x + (1.0 - u_progress) * (d.r * u_effect), uv.y - (1.0 - u_progress) * (d.r * u_effect));
      vec4 a = u_fromSolid > .5 ? vec4(u_solid, 1.0) : texture2D(u_from, p1);
      gl_FragColor = mix(a, texture2D(u_to, p2), u_progress);
      #include <colorspace_fragment>
    }`;

  function waveTexture(T) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d"), img = ctx.createImageData(256, 256), px = img.data;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const u = x / 256, v = y / 256;
      const w = Math.sin(u * Math.PI * 10 + v * Math.PI * 4) * 0.5 + Math.sin(v * Math.PI * 8 - u * Math.PI * 5) * 0.3 + Math.sin((u + v) * Math.PI * 16) * 0.2;
      const g = Math.floor((w * 0.5 + 0.5) * 255), i = (y * 256 + x) * 4;
      px[i] = px[i + 1] = px[i + 2] = g; px[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    return t;
  }

  // One scene = One img, canvas or svg inside the panel. An svg is baked onto the canvas at its own size
  function toSource(node) {
    return new Promise((resolve) => {
      const media = node.matches("img, canvas, svg") ? node : node.querySelector("img, canvas, svg");
      if (!media) return resolve(null);
      if (media.tagName === "CANVAS") return resolve(media);
      if (media.tagName === "IMG") {
        if (media.complete && media.naturalWidth) return resolve(media);
        media.addEventListener("load", () => resolve(media), { once: true });
        media.addEventListener("error", () => resolve(null), { once: true });
        return;
      }
      const vb = media.viewBox.baseVal, w = vb?.width || 1600, h = vb?.height || 1000;
      // Baked into an image, the document’s variables can’t reach it, so skin variables are resolved to current values
      const root = getComputedStyle(media);
      const unvar = (v) => v.replace(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g, (_, name, fb) => root.getPropertyValue(name).trim() || (fb || "").trim());
      const copy = media.cloneNode(true);
      copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      [copy, ...copy.querySelectorAll("*")].forEach((n) => [...n.attributes].forEach((a) => { if (a.value.includes("var(")) n.setAttribute(a.name, unvar(a.value)); }));
      const xml = new XMLSerializer().serializeToString(copy);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c);
      };
      img.onerror = () => resolve(null);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    });
  }

  kfFx.register("wave-swap-bg", (el, { options, reduce, scroller }) => {
    const T = window.THREE;
    const scenes = [...el.querySelectorAll('[data-fx-part="scene"]')];
    const sections = [...document.querySelectorAll(options.sections || "[data-bg-section]")];
    if (!T || !scenes.length) return;
    const dur = +(options.dur ?? 1.6), effect = +(options.effect ?? 0.45), ease = options.ease || "power2.inOut";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true }); } catch (e) { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const bg = getComputedStyle(el).backgroundColor;
    const scene = new T.Scene(), camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    camera.position.z = 1;
    const uniforms = { u_from: { value: null }, u_to: { value: null }, u_disp: { value: waveTexture(T) }, u_progress: { value: 0 }, u_effect: { value: effect }, u_solid: { value: new T.Color() }, u_fromSolid: { value: 0 } };
    const mat = new T.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true });
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 1), mat);
    scene.add(mesh);
    const textures = [];
    let current = -1, wanted = -1, tween = null, queued = false, aspect = 16 / 10, killed = false;
    // After detaching, stop a leftover draw request from re-uploading the discarded texture
    const render = () => { if (queued || killed) return; queued = true; requestAnimationFrame(() => { queued = false; if (!killed) renderer.render(scene, camera); }); };
    const fit = () => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight, r = w / h;
      let pw, ph;
      if (aspect > r) { ph = h; pw = h * aspect; } else { pw = w; ph = w / aspect; }
      mesh.scale.set(pw, ph, 1);
      mesh.position.set((pw - w) / 2, 0, 0);
      renderer.setSize(w, h, false);
      camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      render();
    };
    const load = (i) => {
      if (textures[i]) return textures[i];
      textures[i] = toSource(scenes[i]).then((src) => {
        if (!src) return null;
        const t = new T.Texture(src);
        t.colorSpace = T.SRGBColorSpace; t.minFilter = t.magFilter = T.LinearFilter; t.needsUpdate = true;
        if (i === 0) aspect = (src.naturalWidth || src.width) / (src.naturalHeight || src.height);
        return t;
      });
      return textures[i];
    };
    async function go(i) {
      i = Math.max(0, Math.min(scenes.length - 1, i));
      if (i === current || i === wanted) return;
      wanted = i;
      const tex = await load(i);
      if (killed || !tex || wanted !== i) return;
      wanted = -1;
      if (current === -1 || reduce) {
        uniforms.u_from.value = uniforms.u_to.value = tex; uniforms.u_progress.value = 0; current = i; render();
        return;
      }
      const from = (await load(current));
      tween?.kill();
      uniforms.u_fromSolid.value = 0;
      uniforms.u_from.value = from; uniforms.u_to.value = tex; uniforms.u_progress.value = 0;
      tween = gsap.to(uniforms.u_progress, { value: 1, duration: dur, ease, onUpdate: render, onComplete: () => { current = i; tween = null; render(); } });
    }
    const triggers = [];
    const ro = new ResizeObserver(fit);
    (async () => {
      const first = await load(0);
      if (killed || !first) return;
      fit();
      // At first it enters from the panel background color to the first image with the same wave
      uniforms.u_solid.value.setStyle(bg && !bg.endsWith(", 0)") ? bg : getComputedStyle(document.documentElement).getPropertyValue("--kf-contrast-bg").trim() || "black", T.SRGBColorSpace);
      if (reduce || scrollY > 8) { uniforms.u_from.value = uniforms.u_to.value = first; current = 0; render(); }
      else {
        uniforms.u_from.value = uniforms.u_to.value = first; uniforms.u_fromSolid.value = 1; uniforms.u_progress.value = 0; render();
        tween = gsap.to(uniforms.u_progress, { value: 1, duration: dur, ease, onUpdate: render, onComplete: () => { uniforms.u_fromSolid.value = 0; uniforms.u_progress.value = 0; current = 0; tween = null; render(); } });
      }
      el.classList.add("is-fx-ready");
      scenes.forEach((_, i) => i && load(i));
      if (window.ScrollTrigger) sections.forEach((sec, i) => {
        triggers.push(ScrollTrigger.create({ trigger: sec, scroller, start: i === 0 ? "top top" : options.start || "top 75%", onEnter: () => go(i), onEnterBack: () => go(i), onLeaveBack: i === 1 ? () => go(0) : undefined }));
      });
      ro.observe(el);
    })();
    return () => {
      killed = true;
      tween?.kill(); triggers.forEach((t) => t.kill()); ro.disconnect();
      Promise.all(textures).then((ts) => ts.forEach((t) => t?.dispose()));
      mat.dispose(); mesh.geometry.dispose(); uniforms.u_disp.value.dispose(); renderer.dispose();
      canvas.remove(); el.classList.remove("is-fx-ready");
    };
  });
})();
