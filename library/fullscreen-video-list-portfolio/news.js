/* Journal: card placement · background rippling at the cursor (three 0.160 — one shader across the full screen).
   Original values: displacement .024 · color split .014 · parallax .042 · grain .014 · vignette .1 · mouse lerp .075 · speed = (new position − following position) × .11, × .9 per frame · dpr cap 1.75 · appear 450ms. */
(() => {
  const { playVideo, reduce } = window.AL;
  const html = document.documentElement;
  const grid = document.querySelector(".nw__grid"), items = [...grid.children];

  // Seven-slot repeat: col 1 · col 2 · col 3 · col 1 (width 54.825%) · cols 2~3 · center pair left · center pair right
  const SLOTS = [{ col: "1 / 2" }, { col: "2 / 3" }, { col: "3 / 4" }, { col: "1 / 2", width: "54.825%" }, { col: "2 / 4" }, { pair: "l" }, { pair: "r" }];
  const wide = matchMedia("(min-width: 992px)");
  function place() {
    items.forEach((el, i) => {
      const s = SLOTS[i % SLOTS.length];
      el.classList.remove("is-pair-l", "is-pair-r");
      el.style.gridColumn = el.style.width = "";
      if (!wide.matches) return;
      if (s.pair) el.classList.add("is-pair-" + s.pair);
      else { el.style.gridColumn = s.col; el.style.width = s.width || ""; }
    });
  }
  place();
  wide.addEventListener("change", place);

  const root = document.querySelector(".nw-bg"), media = root.querySelector(".nw-bg__media"), video = media.querySelector("video");
  playVideo(video);
  const ok = matchMedia("(min-width: 992px) and (hover: hover) and (pointer: fine)");
  if (!window.THREE || reduce || !ok.matches) return;

  const VERT = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  /* What the fragment shader does: ① fits screen coordinates to image coordinates by cover ratio and shifts them toward the cursor by the parallax amount ② measures influence from the distance to the cursor (0 beyond 0.82 → 1 at the cursor)
     ③ Two slow-moving noise values form the flow direction and push by the influence amount, and the cursor speed is added at 1.35× ④ Red and blue are read at the (1 ± color split)× position of the displacement
     ⑤ Gamma .97 · grain · vignette */
  const FRAG = `
    precision highp float;
    uniform sampler2D uMap; uniform vec2 uCover; uniform vec2 uMouse; uniform vec2 uVel; uniform float uTime;
    uniform float uDisp; uniform float uChroma; uniform float uShift; uniform float uGrain; uniform float uVig;
    varying vec2 vUv;
    float rnd(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float vnoise(vec2 p) {
      vec2 c = floor(p), f = fract(p), s = f * f * (3.0 - 2.0 * f);
      return mix(mix(rnd(c), rnd(c + vec2(1.0, 0.0)), s.x), mix(rnd(c + vec2(0.0, 1.0)), rnd(c + vec2(1.0, 1.0)), s.x), s.y);
    }
    void main() {
      vec2 uv = (vUv - 0.5) / uCover + 0.5 + (uMouse - 0.5) * uShift;
      float reach = pow(smoothstep(0.82, 0.0, distance(uMouse, vUv)), 1.05);
      vec2 flow = (vec2(vnoise(uv * 3.4 + uTime * 0.07), vnoise(uv * 4.8 - uTime * 0.05 + 3.0)) - 0.5) * 2.0;
      vec2 push = (flow + uVel * 1.35) * uDisp * reach;
      vec3 col = vec3(texture2D(uMap, uv + push * (1.0 + uChroma)).r, texture2D(uMap, uv + push).g, texture2D(uMap, uv + push * (1.0 - uChroma)).b);
      col = pow(max(col, 0.0), vec3(0.97));
      col += (rnd(gl_FragCoord.xy + uTime * 60.0) - 0.5) * uGrain;
      vec2 e = vUv * (1.0 - vUv.yx);
      col *= mix(1.0 - uVig, 1.0, pow(clamp(e.x * e.y * 16.0, 0.0, 1.0), 0.28));
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`;

  // Background art: draws directly a gray panel with black blobs slowly flowing (the original is a video of the same look). Blob edges must be crisp so the push and color split around the cursor show —
  // The placeholder video is only a blur, so shifting isn’t noticeable. Video(<video>) stays as the background shown as-is at widths and under reduced-motion where shaders can’t be used
  const css = (n) => getComputedStyle(html).getPropertyValue(n).trim();
  function blobTexture() {
    const c = document.createElement("canvas");
    c.width = 640; c.height = 360;
    const x = c.getContext("2d"), tex = new THREE.CanvasTexture(c), mid = css("--kf-dim"), dark = css("--kf-bg");
    // [x, y, radius] — image ratio. As in the original video, two black blobs sit at the right of the band visible above the card (where you can see them pushed by the cursor), and the other two lie behind the menu card and the big card
    const blobs = [[0.824, 0.167, 0.04], [0.767, 0.284, 0.035], [0.217, 0.158, 0.07], [0.257, 0.68, 0.08]]
      .map(([bx, by, r], i) => ({ x: bx * 640, y: by * 360, r: r * 640, p: i * 1.7 }));
    tex.draw = (t) => {
      x.globalAlpha = 1; x.fillStyle = dark; x.fillRect(0, 0, 640, 360);
      x.globalAlpha = 0.8; x.fillStyle = mid; x.fillRect(0, 0, 640, 360);
      blobs.forEach((b) => {
        const bx = b.x + Math.sin(t * 0.05 + b.p) * 5, by = b.y + Math.cos(t * 0.04 + b.p) * 4, g = x.createRadialGradient(bx, by, b.r * 0.86, bx, by, b.r);
        g.addColorStop(0, dark); g.addColorStop(1, "transparent");
        x.globalAlpha = 1; x.fillStyle = g; x.beginPath(); x.arc(bx, by, b.r, 0, 7); x.fill();
      });
      tex.needsUpdate = true;
    };
    tex.draw(0);
    return tex;
  }
  const map = blobTexture();
  map.colorSpace = THREE.SRGBColorSpace; map.minFilter = map.magFilter = THREE.LinearFilter;
  const host = document.createElement("div");
  host.className = "nw-bg__gl";
  media.append(host);
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.append(renderer.domElement);
  const U = { uMap: { value: map }, uCover: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uVel: { value: new THREE.Vector2() }, uTime: { value: 0 },
    uDisp: { value: 0.024 }, uChroma: { value: 0.014 }, uShift: { value: 0.042 }, uGrain: { value: 0.014 }, uVig: { value: 0.1 } };
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, depthTest: false })));
  function fit() {
    const w = media.clientWidth || innerWidth, h = media.clientHeight || innerHeight, va = w / h, ma = 16 / 9;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    // Scaled up 1.11x so no edge gaps appear even when parallax pushes it
    U.uCover.value.set((va > ma ? 1 : ma / va) * 1.11, (va > ma ? va / ma : 1) * 1.11);
  }
  fit();
  addEventListener("resize", fit);
  renderer.compile(scene, camera); // Compiling on the first cursor move freezes the screen
  const m = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, vx: 0, vy: 0 };
  addEventListener("mousemove", (e) => {
    const nx = e.clientX / Math.max(innerWidth, 1), ny = e.clientY / Math.max(innerHeight, 1);
    m.vx = (nx - m.px) * 0.11; m.vy = (ny - m.py) * 0.11;
    m.x = nx; m.y = ny;
  }, { passive: true });
  let time = 0, frames = 0;
  (function tick() {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    time += 0.016;
    m.px += (m.x - m.px) * 0.075; m.py += (m.y - m.py) * 0.075;
    m.vx *= 0.9; m.vy *= 0.9;
    U.uMouse.value.set(m.px, 1 - m.py);
    U.uVel.value.set(m.vx, -m.vy);
    U.uTime.value = time;
    if (map.draw) map.draw(time);
    renderer.render(scene, camera);
    if (++frames === 4) { root.classList.add("is-shader"); host.classList.add("is-ready"); }
  })();
})();
