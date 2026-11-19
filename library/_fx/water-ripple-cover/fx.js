// Water-height shader (three.js) covering the panel — draws two half-resolution height fields alternately to spread ripples (damping .96), and splashes water where the mouse passes (radius .06 · strength .35).
// Refracts the video underneath (object-fit: cover) by the wave gradient (.07) and blends the video into the background color by only .09 for a faint reflection. Adds a glint reflected from above (Brand hero).
(() => {
  const VS = "varying vec2 v_uv; void main(){ v_uv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const SIM = `precision highp float;
  uniform sampler2D u_prev; uniform vec2 u_res, u_mouse; uniform float u_radius, u_strength, u_damping; uniform int u_add; varying vec2 v_uv;
  void main(){
    vec2 t = 1.0 / u_res;
    float c = texture2D(u_prev, v_uv).r;
    float n = (texture2D(u_prev, v_uv + vec2(-t.x, 0.0)).r + texture2D(u_prev, v_uv + vec2(t.x, 0.0)).r + texture2D(u_prev, v_uv + vec2(0.0, t.y)).r + texture2D(u_prev, v_uv + vec2(0.0, -t.y)).r) / 2.0;
    float next = (n - texture2D(u_prev, v_uv).g) * u_damping;
    if (u_add == 1) next += u_strength * smoothstep(u_radius, 0.0, length(v_uv - u_mouse));
    gl_FragColor = vec4(next, c, 0.0, 1.0);
  }`;
  const OUT = `precision highp float;
  uniform sampler2D u_height, u_video; uniform vec2 u_res, u_scale, u_offset; uniform vec3 u_base, u_spec; uniform float u_refract, u_mix, u_hasVideo; varying vec2 v_uv;
  void main(){
    vec2 t = 1.0 / u_res;
    vec2 nrm = vec2(texture2D(u_height, v_uv + vec2(-t.x, 0.0)).r - texture2D(u_height, v_uv + vec2(t.x, 0.0)).r,
                    texture2D(u_height, v_uv + vec2(0.0, -t.y)).r - texture2D(u_height, v_uv + vec2(0.0, t.y)).r);
    vec2 uv = clamp(v_uv * u_scale + u_offset + nrm * u_refract, 0.0, 1.0);
    vec3 col = u_base;
    if (u_hasVideo > 0.5) col = mix(u_base, texture2D(u_video, vec2(uv.x, 1.0 - uv.y)).rgb, u_mix);
    float s = pow(max(0.0, dot(normalize(vec3(nrm, 0.8)), normalize(vec3(0.3, 0.5, 1.0)))), 24.0);
    gl_FragColor = vec4(col + s * u_spec * 0.25, 1.0);
  }`;

  kfFx.register("water-ripple-cover", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T || reduce) return;
    const opt = {
      damping: +(options.damping ?? 0.96),
      radius: +(options.radius ?? 0.06),
      strength: +(options.strength ?? 0.35),
      refract: +(options.refract ?? 0.07),
      mix: +(options.mix ?? 0.09),
      scale: +(options.scale ?? 0.5) || 0.5,
    };
    const video = el.querySelector('[data-fx-part="video"]');
    const canvas = document.createElement("canvas");
    canvas.className = "fx-water-ripple";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: false }); } catch (e) { canvas.remove(); return; }
    renderer.setPixelRatio(1);
    renderer.autoClear = false;
    const readColor = (name, fb) => {
      const v = getComputedStyle(el).getPropertyValue(name).trim() || fb;
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = v; c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data;
      return new T.Vector3(d[0] / 255, d[1] / 255, d[2] / 255);
    };
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new T.PlaneGeometry(2, 2);
    const pass = (frag, uniforms) => { const material = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: frag, uniforms }); const scene = new T.Scene(); scene.add(new T.Mesh(quad, material)); return { material, scene }; };
    const tex = video ? new T.VideoTexture(video) : null;
    if (tex) { tex.flipY = false; tex.colorSpace = T.SRGBColorSpace; tex.minFilter = tex.magFilter = T.LinearFilter; }
    const rt = (w, h) => new T.WebGLRenderTarget(w, h, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat, type: T.HalfFloatType });
    let a, b, W = 1, H = 1;
    const sim = pass(SIM, { u_prev: { value: null }, u_res: { value: new T.Vector2() }, u_mouse: { value: new T.Vector2(-1, -1) }, u_radius: { value: opt.radius }, u_strength: { value: opt.strength }, u_damping: { value: opt.damping }, u_add: { value: 0 } });
    const out = pass(OUT, { u_height: { value: null }, u_video: { value: null }, u_res: { value: new T.Vector2() }, u_scale: { value: new T.Vector2(1, 1) }, u_offset: { value: new T.Vector2() }, u_base: { value: readColor("--kf-contrast-bg", "black") }, u_spec: { value: readColor("--kf-accent", "white") }, u_refract: { value: opt.refract }, u_mix: { value: opt.mix }, u_hasVideo: { value: 0 } });
    // Video is cropped to cover the panel
    const cover = () => {
      if (!video?.videoWidth) return;
      const r = W / H, v = video.videoWidth / video.videoHeight;
      const sx = r > v ? 1 : r / v, sy = r > v ? v / r : 1;
      out.material.uniforms.u_scale.value.set(sx, sy);
      out.material.uniforms.u_offset.value.set((1 - sx) / 2, (1 - sy) / 2);
    };
    const size = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width)); H = Math.max(1, Math.floor(r.height));
      renderer.setSize(W, H, false);
      a?.dispose(); b?.dispose();
      const sw = Math.max(2, Math.floor(W * opt.scale)), sh = Math.max(2, Math.floor(H * opt.scale));
      a = rt(sw, sh); b = rt(sw, sh);
      for (const t of [a, b]) { renderer.setRenderTarget(t); renderer.clear(); }
      renderer.setRenderTarget(null);
      sim.material.uniforms.u_res.value.set(sw, sh);
      out.material.uniforms.u_res.value.set(W, H);
      cover();
    };
    size();
    video?.addEventListener("loadedmetadata", cover);
    // If the video comes from another origin (opened via file:// or no CORS), WebGL can’t upload it — draw one frame to test and attach it only if it works
    const tryVideo = () => {
      if (!tex || !video.videoWidth) return;
      try {
        const c = document.createElement("canvas").getContext("2d");
        c.drawImage(video, 0, 0, 1, 1);
        c.getImageData(0, 0, 1, 1);
      } catch (e) { return; }
      out.material.uniforms.u_video.value = tex;
      out.material.uniforms.u_hasVideo.value = 1;
    };
    if (video?.readyState >= 2) tryVideo();
    else video?.addEventListener("loadeddata", tryVideo, { once: true });
    const frame = () => {
      sim.material.uniforms.u_prev.value = a.texture;
      renderer.setRenderTarget(b);
      renderer.render(sim.scene, cam);
      sim.material.uniforms.u_add.value = 0;
      out.material.uniforms.u_height.value = b.texture;
      renderer.setRenderTarget(null);
      renderer.render(out.scene, cam);
      [a, b] = [b, a];
    };
    let visible = true;
    const tick = () => { if (visible) frame(); };
    gsap.ticker.add(tick);
    const move = (e) => {
      const r = el.getBoundingClientRect(), p = e.touches ? e.touches[0] : e;
      sim.material.uniforms.u_mouse.value.set((p.clientX - r.left) / r.width, 1 - (p.clientY - r.top) / r.height);
      sim.material.uniforms.u_add.value = 1;
    };
    const host = (options.host && el.closest(options.host)) || el.parentElement || el;
    host.addEventListener("mousemove", move, { passive: true });
    host.addEventListener("touchmove", move, { passive: true });
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect(); io.disconnect();
      host.removeEventListener("mousemove", move);
      host.removeEventListener("touchmove", move);
      video?.removeEventListener("loadedmetadata", cover);
      video?.removeEventListener("loadeddata", tryVideo);
      a.dispose(); b.dispose(); tex?.dispose(); quad.dispose();
      sim.material.dispose(); out.material.dispose(); renderer.dispose();
      canvas.remove();
    };
  });
})();
