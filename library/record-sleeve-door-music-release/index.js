// First page — chrome title letters (the original is a glyph-mesh three scene). Our version: draw the letters on a canvas to make two plates, a sharp one and a blurred one,
// Normals come from the slope of the blurred panel, and chrome is painted with reflection bands, top light and blue shade. It bends into an arch raised at the center, star glints sparkle at eight top corners, and the light follows the cursor.
// Starlight stays in place like the original hero. Hovering a track name ([data-cue]) brings that track’s preview video panel along, following the cursor late (.35s on).
(() => {
  const A = (window.PG ||= {});
  const wrap = A.q("[data-wordmark]");
  const cv = wrap && A.q("canvas", wrap);
  if (cv && window.THREE) {
    const text = wrap.dataset.text || "ALBUM NAME";
    const W = 2048, H = Math.round(2048 * 1173 / 2496);
    const draw = (blur) => {
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const g = c.getContext("2d");
      g.fillStyle = "black"; /* Not skin: 0 of the height map */
      g.fillRect(0, 0, W, H);
      g.filter = blur ? `blur(${blur}px)` : "none";
      g.fillStyle = "white"; /* Not skin: 1 of the height map */
      let fs = H * 0.62;
      g.font = `700 ${fs}px ${A.css("--kf-font-display")}`;
      const tw = g.measureText(text).width;
      if (tw > W * 0.94) { fs *= (W * 0.94) / tw; g.font = `700 ${fs}px ${A.css("--kf-font-display")}`; }
      g.textAlign = "center"; g.textBaseline = "middle";
      g.save(); g.translate(W / 2, H / 2); g.scale(1, 1.25); g.fillText(text, 0, 0); g.restore();
      return c;
    };
    const sharp = draw(0), soft = draw(22);
    // Sparkle spots — eight places on the top edge of the letters (cells with 8px empty above)
    const px = sharp.getContext("2d").getImageData(0, 0, W, H).data;
    const at = (x, y) => px[(y * W + x) * 4];
    const spots = [];
    for (let k = 0; k < 4000 && spots.length < 8; k++) {
      const x = 40 + Math.floor(Math.random() * (W - 80)), y = 20 + Math.floor(Math.random() * (H - 40));
      if (at(x, y) > 200 && at(x, y - 10) < 30 && spots.every((s) => Math.abs(s[0] - x / W) > 0.08)) spots.push([x / W, 1 - y / H, Math.random() * 6.28]);
    }
    while (spots.length < 8) spots.push([Math.random(), 0.7, Math.random() * 6.28]);
    const tex = (c) => { const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t; };
    const col = (v) => new THREE.Color(A.css(v));
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, premultipliedAlpha: false });
    r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const u = {
      tS: { value: tex(sharp) }, tB: { value: tex(soft) }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0, 0.4) },
      uTexel: { value: new THREE.Vector2(3 / W, 3 / H) }, uAspect: { value: W / H }, uSpots: { value: spots.map((s) => new THREE.Vector3(...s)) },
      cDark: { value: col("--kf-dim") }, cLight: { value: col("--kf-ink") }, cTint: { value: col("--kf-accent-soft") }, uIn: { value: A.reduce ? 1 : 0 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: u, transparent: true,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      fragmentShader: `
        precision highp float;
        uniform sampler2D tS, tB; uniform float uTime, uAspect, uIn; uniform vec2 uMouse, uTexel; uniform vec3 uSpots[8]; uniform vec3 cDark, cLight, cTint;
        varying vec2 vUv;
        vec2 warp(vec2 uv){
          // The canvas is 12%·6% wider than the text panel — converted to text panel coordinates and bent into an arch rising at the center
          uv = (uv - .5) * vec2(1.12, 1.24) + .5;
          float x = uv.x - .5;
          uv.y = (uv.y - .5) * (1. + 1.1 * x * x) + .5 - .16 * (1. - 4. * x * x) + .04;
          return uv;
        }
        void main(){
          vec2 uv = warp(vUv);
          float inside = step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.);
          float a = texture2D(tS, uv).r * inside, h = texture2D(tB, uv).r * inside;
          float hx = texture2D(tB, uv + vec2(uTexel.x, 0.)).r - texture2D(tB, uv - vec2(uTexel.x, 0.)).r;
          float hy = texture2D(tB, uv + vec2(0., uTexel.y)).r - texture2D(tB, uv - vec2(0., uTexel.y)).r;
          vec3 n = normalize(vec3(-hx * 5., -hy * 5., .6));
          vec3 L = normalize(vec3(uMouse * 1.4, 1.));
          float diff = clamp(dot(n, L), 0., 1.);
          vec3 rf = reflect(vec3(0., 0., -1.), n);
          float band = .5 + .5 * sin(rf.y * 7. + rf.x * 2.5);
          float spec = pow(clamp(dot(reflect(-L, n), vec3(0., 0., 1.)), 0., 1.), 36.);
          vec3 chrome = mix(cDark, cLight, clamp(.25 + .9 * band * diff + .35 * (1. - h), 0., 1.)) + spec * .8;
          chrome = mix(chrome, cTint, .28 * (1. - diff));
          float glow = texture2D(tB, uv).r * inside * .45;
          float sp = 0.;
          for (int i = 0; i < 8; i++) {
            vec2 d = (vUv - ((uSpots[i].xy - .5) / vec2(1.12, 1.24) + .5)) * vec2(uAspect, 1.);
            float tw = .75 + .25 * sin(uSpots[i].z);
            sp += tw * (.00045 / (abs(d.x * d.y) + .00004)) * smoothstep(.09, 0., length(d)) + tw * smoothstep(.012, 0., length(d)) * 1.5;
          }
          vec3 c = chrome * a + cLight * (glow + sp) * (1. - a * .6);
          float al = clamp(a + glow * .9 + sp, 0., 1.) * uIn;
          gl_FragColor = vec4(c, al);
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const size = () => { const b = cv.getBoundingClientRect(); r.setSize(b.width, b.height, false); };
    size(); addEventListener("resize", size);
    const target = new THREE.Vector2(0, 0.4);
    addEventListener("pointermove", (e) => target.set(e.clientX / innerWidth * 2 - 1, 0.4 - (e.clientY / innerHeight * 2 - 1)));
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }); let vis = true; io.observe(cv);
    gsap.ticker.add((t) => {
      if (!vis) return;
      u.uTime.value = A.reduce ? 0 : t;
      // The light catches up with the cursor quickly and stops when close — dragging too long keeps the screen changing for seconds after a flick
      if (u.uMouse.value.distanceTo(target) < 0.002) u.uMouse.value.copy(target); else u.uMouse.value.lerp(target, 0.15);
      r.render(scene, cam);
    });
    // After passing a door the text is revealed in .8s expo.out, coming in lying flat (flipped) on the X axis like the original’s burst shot of a door opening, then stands up in .6s
    A.onEnter = () => {
      gsap.to(u.uIn, { value: 1, duration: A.reduce ? 0 : 0.8, ease: "expo.out" });
      if (!A.reduce) gsap.fromTo(wrap, { rotationX: 170, transformPerspective: 1600 }, { rotationX: 0, duration: 0.6, ease: "power3.out" });
    };
  }

  const peek = A.q("[data-cue-peek]");
  if (peek && matchMedia("(hover: hover) and (min-width: 650px)").matches) {
    let x = 0, y = 0, tx = 0, ty = 0, on = false;
    A.qa("[data-cue]").forEach((el) => {
      el.addEventListener("pointerenter", () => { on = true; peek.dataset.label = `Track ${el.dataset.cue} Preview video · performance scene · portrait 4:5`; peek.classList.add("is-on"); });
      el.addEventListener("pointerleave", () => { on = false; peek.classList.remove("is-on"); });
    });
    addEventListener("pointermove", (e) => { tx = e.clientX + 24; ty = e.clientY - 120; if (!on) { x = tx; y = ty; } });
    gsap.ticker.add(() => { x += (tx - x) * 0.15; y += (ty - y) * 0.15; peek.style.transform = `translate3d(${x}px, ${y}px, 0)`; });
  }
})();
