/* Print · magazine board — over the placeholder box in the DOM ([data-print]), a same-size board is drawn with a screen-pixel coordinate camera.
   Per panel: develop (dev 0 → 1: from washed-out white to a black-and-white print, silver grain settles) · bow (like a print held in the hand, the middle lifts slightly)
   · Page turn (curl 0 → 1: the cover curls around the left spine as it turns, original journal jrSayfaKivir 1.08 · jrKivrim .23 · jrKalk .155)
   · Chromatic aberration (original jrKromatik 5.9px — RGB splits while moving) */
(() => {
  const VERT = `
    uniform vec2 uSize; uniform float uBow; uniform float uCurl; uniform float uLift; uniform float uTwist;
    varying vec2 vUv; varying float vShade;
    void main() {
      vUv = uv;
      vec3 p = vec3(position.xy * uSize, position.z);
      float nx = uv.x, ny = uv.y - 0.5;
      p.z += uBow * uSize.y * (1.0 - 4.0 * ny * ny) * 0.04;
      // Page turn: left spine (x=Rotates by angle a around the axis (…0), curling more the farther from the back
      float a = uCurl * 3.14159 * (0.92 + 0.16 * nx) + uTwist * ny * uCurl * (1.0 - uCurl) * 4.0;
      float r = nx * uSize.x;
      float lift = uLift * uSize.x * sin(uCurl * 3.14159) * nx;
      vec3 q = vec3(-uSize.x * 0.5 + r * cos(a), p.y, r * sin(a) + lift + p.z);
      p = mix(p, q, step(0.0001, uCurl));
      vShade = 1.0 - 0.45 * sin(uCurl * 3.14159) * nx;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FRAG = `
    precision highp float;
    varying vec2 vUv; varying float vShade;
    uniform sampler2D uTex; uniform float uDev; uniform float uChroma; uniform vec2 uSize; uniform float uTime; uniform float uBorder; uniform vec3 uPaper; uniform float uBw;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main() {
      vec2 uv = vUv;
      float bx = uBorder / uSize.x, by = uBorder / uSize.y;
      bool paper = uv.x < bx || uv.x > 1.0 - bx || uv.y < by || uv.y > 1.0 - by;
      vec2 iuv = (uv - vec2(bx, by)) / (1.0 - 2.0 * vec2(bx, by));
      vec2 off = vec2(uChroma / uSize.x, 0.0);
      vec3 c = vec3(texture2D(uTex, iuv + off).r, texture2D(uTex, iuv).g, texture2D(uTex, iuv - off).b);
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      l = mix(l, l * l * (3.0 - 2.0 * l), 0.5);
      c = mix(c, vec3(l), uBw);
      // Develop: starts as almost white paper, dark areas come up first
      float dev = smoothstep(0.0, 1.0, uDev * 1.3 - (1.0 - l) * 0.3);
      float grain = (hash(floor(gl_FragCoord.xy) + floor(uTime * 24.0)) - 0.5) * 0.08 * (1.0 - uDev * 0.7);
      c = mix(vec3(1.0), c, dev) + grain;
      if (paper || !gl_FrontFacing) c = uPaper;
      gl_FragColor = vec4(c * vShade, 1.0);
    }`;

  function create(layer, opts = {}) {
    const reduce = hc.reduce;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    layer.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 1, 10000);
    const paper = new THREE.Color(hc.color("--kf-contrast-ink"));
    const items = [...document.querySelectorAll("[data-print]")].map((el, i) => {
      const src = (opts.canvas && opts.canvas(el, i)) || hc.portrait(+(el.dataset.photo ?? i), 900, 600, el.dataset.caption || "Person upper body · Front · Solid background");
      const t = new THREE.CanvasTexture(src);
      t.colorSpace = THREE.SRGBColorSpace;
      const u = {
        uTex: { value: t }, uSize: { value: new THREE.Vector2(1, 1) }, uDev: { value: el.dataset.develop != null ? 0 : 1 }, uChroma: { value: 0 },
        uBow: { value: +(el.dataset.bow ?? 1) }, uCurl: { value: 0 }, uLift: { value: 0.155 }, uTwist: { value: 0.23 }, uTime: { value: 0 },
        uBorder: { value: +(el.dataset.border ?? 0) }, uPaper: { value: new THREE.Vector3(paper.r, paper.g, paper.b) }, uBw: { value: +(el.dataset.bw ?? 1) },
      };
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 48, 24), new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, side: THREE.DoubleSide }));
      mesh.renderOrder = i;
      scene.add(mesh);
      return { el, mesh, u };
    });
    let W = 0, H = 0;
    function size() {
      W = innerWidth; H = innerHeight;
      renderer.setSize(W, H, false);
      cam.aspect = W / H;
      cam.position.set(0, 0, (H / 2) / Math.tan((cam.fov * Math.PI) / 360));
      cam.updateProjectionMatrix();
    }
    function sync() {
      items.forEach(({ el, mesh, u }) => {
        const r = el.getBoundingClientRect();
        mesh.visible = r.bottom > -200 && r.top < H + 200 && r.width > 0;
        if (!mesh.visible) return;
        u.uSize.value.set(r.width, r.height);
        mesh.position.set(r.left + r.width / 2 - W / 2, H / 2 - (r.top + r.height / 2), 0);
      });
    }
    let lastRects = "";
    const ro = new ResizeObserver(() => { size(); lastRects = ""; });
    ro.observe(document.documentElement);
    size();
    renderer.compile(scene, cam);
    let raf = 0;
    function tick(t) {
      raf = requestAnimationFrame(tick);
      const key = items.map(({ el }) => { const r = el.getBoundingClientRect(); return `${r.left | 0},${r.top | 0},${r.width | 0},${r.height | 0}`; }).join("|");
      if (key !== lastRects) { lastRects = key; sync(); }
      items.forEach(({ u }) => { u.uTime.value = t / 1000; });
      renderer.render(scene, cam);
    }
    raf = requestAnimationFrame(tick);
    return {
      items,
      develop(i, dur = 2.4, delay = 0) { const it = items[i]; if (!it) return; if (reduce) { it.u.uDev.value = 1; return; } gsap.fromTo(it.u.uDev, { value: 0 }, { value: 1, duration: dur, delay, ease: "power1.inOut" }); },
      dispose() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); },
    };
  }
  window.hcPrint = { create };
})();
