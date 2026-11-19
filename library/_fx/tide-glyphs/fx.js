(() => {
  // Draws letters like islands submerged in water — bold letters always stay above water, thin letters are clipped at the crests of noise waves and fully submerge when the water level (thin) rises.
  // Text positions come from the DOM’s [data-fx-part=glyph] read from the box — if the writer moves the box with GSAP, the canvas redraws to follow.
  const VERT = "varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FRAG = `
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uTime, uPos, uAspect, uThin, uRise, uWave;
uniform vec3 uInk, uShade;

vec3 grad(vec3 c) {
  vec3 s = vec3(dot(c, vec3(41.3, 289.1, 97.7)), dot(c, vec3(157.9, 23.3, 211.1)), dot(c, vec3(73.1, 181.7, 13.9)));
  return fract(sin(s) * 24634.6345) * 2.0 - 1.0;
}
float corner(vec3 cell, vec3 f, vec3 o) { return dot(grad(cell + o), f - o); }
float waves(vec3 p) {
  vec3 cell = floor(p), f = fract(p);
  vec3 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float x00 = mix(corner(cell, f, vec3(0, 0, 0)), corner(cell, f, vec3(1, 0, 0)), w.x);
  float x10 = mix(corner(cell, f, vec3(0, 1, 0)), corner(cell, f, vec3(1, 1, 0)), w.x);
  float x01 = mix(corner(cell, f, vec3(0, 0, 1)), corner(cell, f, vec3(1, 0, 1)), w.x);
  float x11 = mix(corner(cell, f, vec3(0, 1, 1)), corner(cell, f, vec3(1, 1, 1)), w.x);
  // 2.12x — scale that matches the original classic Perlin ×2.2 and its value spread (std dev .405)
  return clamp(2.12 * mix(mix(x00, x10, w.y), mix(x01, x11, w.y), w.z), -1.0, 1.0);
}

void main() {
  // Wave: horizontally stretched to the screen ratio, vertically flows with time and runs against the scroll amount
  float sea = waves(vec3(vUv.x * 0.5 * uAspect, (vUv.y + uTime * 0.00012 - uPos * 0.001) * 0.5, uTime * 0.0003)) * 0.5 + 0.5;
  float crest = max(sea - 0.5, 0.0) * 2.0;
  crest *= (waves(vec3(vUv * 2.0, uTime * 0.0005)) + 1.0) * 0.9;
  float tide = crest + (uThin + uRise) * 0.28;

  vec4 tex = texture2D(uMap, vUv);
  float depth = (tex.a - 0.01) / 1.99;
  float land = smoothstep(tide, tide + 0.125, depth) * smoothstep(0.05, 0.3, tex.a);
  // Bold text (white cells) doesn’t get submerged by the water and stays as painted
  float a = mix(land, tex.a, tex.r);

  float shade = sea * sea * uWave;
  float outA = a + shade * (1.0 - a);
  vec3 rgb = outA > 0.0 ? (uInk * a + uShade * shade * (1.0 - a)) / outA : vec3(0.0);
  gl_FragColor = vec4(rgb, outA);
}`;

  // Turn skin variables (including color-mix and oklch) into real rgb — paint one dot on a canvas and read it
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (css, fallback) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = fallback;
    probe.fillStyle = css || fallback;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("tide-glyphs", (el, { options, reduce }) => {
    const THREE = window.THREE;
    const glyphs = [...el.querySelectorAll('[data-fx-part="glyph"]')];
    if (!THREE || !glyphs.length) return;
    const delay = +(options.delay ?? 1.5), dur = +(options.dur ?? 1);
    const depth = +(options.depth ?? 0.58);

    const gl = document.createElement("canvas");
    gl.setAttribute("aria-hidden", "true");
    gl.className = "fx-tide-canvas";
    el.prepend(gl);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: gl, alpha: true, antialias: false });
    } catch (e) {
      gl.remove();
      return;
    }
    el.classList.add("fx-tide-live");

    const paper = document.createElement("canvas");
    const pen = paper.getContext("2d");
    const thinPaper = document.createElement("canvas");
    const thinPen = thinPaper.getContext("2d");
    const map = new THREE.CanvasTexture(paper);
    map.minFilter = THREE.LinearFilter;
    map.generateMipmaps = false;
    const uniforms = {
      uMap: { value: map }, uTime: { value: 0 }, uPos: { value: scrollY }, uAspect: { value: 1 },
      uThin: { value: 0 }, uRise: { value: reduce ? 0 : 1 }, uWave: { value: 0 },
      uInk: { value: new THREE.Vector3() }, uShade: { value: new THREE.Vector3() },
    };
    const paint = () => {
      const st = getComputedStyle(el), ink = st.color;
      // If no wave shade is set separately, it is the text color lowered to brightness 0 (black)
      const shade = st.getPropertyValue("--fx-tide-shade").trim() || "oklch(from " + ink + " 0 0 h)";
      uniforms.uInk.value.fromArray(rgbOf(ink, "white"));
      uniforms.uShade.value.fromArray(rgbOf(shade, "black"));
    };
    paint();
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false });
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    let w = 0, h = 0, dpr = 1, last = "";
    const size = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      paper.width = thinPaper.width = w * dpr;
      paper.height = thinPaper.height = h * dpr;
      uniforms.uAspect.value = w / h;
      last = "";
    };

    // Repaint the text panel only when the box position changes — raising the screen-size panel every frame is heavy.
    const draw = () => {
      const box = el.getBoundingClientRect();
      const rects = glyphs.map((g) => g.getBoundingClientRect());
      const sign = rects.map((r) => `${(r.left - box.left) | 0},${(r.top - box.top) | 0},${r.width | 0}`).join(";");
      if (sign === last) return;
      last = sign;
      // Thin text is all painted separately and then laid once, faded by depth — painting each faintly makes only overlapped spots dark so it doesn’t sink into the water
      const write = (ctx, bold) => {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = bold ? "white" : "black"; /* Not Skin: bold/thin flag of the text plate (color is painted by the shader from the Skin) */
        glyphs.forEach((g, i) => {
          if ((g.dataset.key === "bold") !== bold) return;
          const r = rects[i], st = getComputedStyle(g);
          ctx.font = `${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
          const cap = ctx.measureText("H").actualBoundingBoxAscent;
          const x = r.left - box.left + r.width / 2, y = r.top - box.top + r.height / 2 + cap / 2;
          ctx.fillText(g.textContent.trim(), x, y);
          // Hairline strokes only half-cover pixels so depth is thin and waves carve them first — thin letters get a .6px outline to fill more than one pixel
          if (!bold) { ctx.lineWidth = 0.6; ctx.strokeStyle = ctx.fillStyle; ctx.strokeText(g.textContent.trim(), x, y); }
        });
      };
      write(thinPen, false);
      write(pen, true);
      pen.setTransform(1, 0, 0, 1, 0, 0);
      pen.globalAlpha = depth;
      pen.globalCompositeOperation = "destination-over";
      pen.drawImage(thinPaper, 0, 0);
      pen.globalAlpha = 1;
      pen.globalCompositeOperation = "source-over";
      map.needsUpdate = true;
    };

    const thinOf = () => {
      const s = getComputedStyle(el);
      return [+s.getPropertyValue("--fx-tide-thin") || 0, +s.getPropertyValue("--fx-tide-wave") || 0];
    };

    let raf = 0, prev = 0;
    const tick = (now) => {
      const dt = prev ? Math.max(1, now - prev) : 16;
      prev = now;
      const [thin, wave] = thinOf();
      uniforms.uThin.value = thin;
      uniforms.uWave.value = wave;
      if (!reduce) {
        uniforms.uTime.value += dt;
        // Follows the scroll by .1 per 1/60 second (corrected for frame length)
        uniforms.uPos.value += (scrollY - uniforms.uPos.value) * (1 - Math.pow(0.9, (60 * dt) / 1000));
      }
      draw();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => { size(); });
    ro.observe(el);
    size();
    // Float-up starts its clock as soon as it attaches (as in the original, delay counted from when the script runs). If the font arrives late, only the text panel is redrawn then
    const rise = reduce ? null : gsap.to(uniforms.uRise, { value: 0, delay, duration: dur });
    raf = requestAnimationFrame(tick);
    const refont = () => { last = ""; };
    document.fonts?.addEventListener("loadingdone", refont);
    document.fonts?.ready.then(refont);

    return () => {
      document.fonts?.removeEventListener("loadingdone", refont);
      cancelAnimationFrame(raf);
      rise?.kill();
      ro.disconnect();
      material.dispose();
      quad.geometry.dispose();
      map.dispose();
      renderer.dispose();
      gl.remove();
      el.classList.remove("fx-tide-live");
    };
  });
})();
