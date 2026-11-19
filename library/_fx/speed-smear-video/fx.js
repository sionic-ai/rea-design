(() => {
  // Draws the video (child video) onto a three canvas in the same spot and smears it in the direction of travel (angle) by its speed — 12 passes averaged.
  // Speed follows the window scroll speed (default) or the fx:velocity sent by the caller { velocity }(drive: event). If key: true, removes the background by its difference from the corner color
  // Looks like a floating product (kai product ring video). Bottom smear is smear × |speed| (max max)
  kfFx.register("speed-smear-video", (el, { options, reduce }) => {
    const THREE = window.THREE;
    const video = el.querySelector("video");
    if (!video) return;
    // A video on a page opened via file:// cannot be read by WebGL (cross-origin) — in that case, and when three·WebGL is missing, only the video is shown as is
    if (!THREE || location.protocol === "file:") { el.classList.add("is-fx-plain"); return () => el.classList.remove("is-fx-plain"); }
    const smear = +(options.smear ?? 0.012), max = +(options.max ?? 0.14), angle = (+(options.angle ?? 0) * Math.PI) / 180;
    const key = options.key === "true";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    el.append(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
    const tex = new THREE.VideoTexture(video);
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, uDir: { value: new THREE.Vector2(Math.cos(angle), Math.sin(angle)) }, uAmt: { value: 0 }, uKey: { value: key ? 1 : 0 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform sampler2D map; uniform vec2 uDir; uniform float uAmt; uniform float uKey; varying vec2 vUv;
        vec4 tap(vec2 uv){ vec4 c = texture2D(map, clamp(uv, 0.001, 0.999)); vec3 bg = texture2D(map, vec2(0.03, 0.97)).rgb;
          float a = mix(1.0, smoothstep(0.035, 0.14, distance(c.rgb, bg)), uKey); return vec4(c.rgb * a, a); }
        void main(){ vec4 s = vec4(0.0); for (int i = 0; i < 12; i++) { s += tap(vUv + uDir * uAmt * (float(i) / 11.0 - 0.5)); } gl_FragColor = s / 12.0; }`,
      transparent: true, premultipliedAlpha: true, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat));
    const size = () => { const r = el.getBoundingClientRect(); renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false); };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();

    let vel = 0, target = 0, lastY = scrollY, lastT = performance.now(), raf = 0;
    const onVel = (e) => { target = +e.detail?.velocity || 0; };
    if (options.drive === "event") el.addEventListener("fx:velocity", onVel);
    const frame = (now) => {
      const dt = Math.max(1, now - lastT) / 1000;
      lastT = now;
      if (options.drive !== "event") { target = (scrollY - lastY) / dt / 1000; lastY = scrollY; }
      vel += (target - vel) * 0.2;
      mat.uniforms.uAmt.value = reduce ? 0 : Math.min(max, Math.abs(vel) * smear) * (Math.sign(vel) || 1);
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    if (video.paused && video.autoplay !== false) video.play?.().catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("fx:velocity", onVel);
      tex.dispose(); mat.dispose(); renderer.dispose();
      canvas.remove();
    };
  });
})();
