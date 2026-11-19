// Two stages the original draws as 3D terrain (GLB) — a foggy daytime beach and an aurora night lakeside — rebuilt with three basic shapes and our shaders.
// Terrain is a plane raised by noise, sea and lakes use a wave shader, sky is a gradient dome, and the aurora is a curtain shader curved across the sky.
// Pages work as before set({ pan, lift, zoom, ring }) only gives — pan·lift moves the camera sideways·up, zoom pulls the lens in, ring draws a gold ring at the logo’s feet.
window.DK = window.DK || {};
(() => {
  const T = window.THREE;
  if (!T) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // Landscape colors: the content measured from the original terrain image (GLB texture) colors and transferred. Only the gold is read from the skin gold (--site-gold-*)
  const DAY = { skyTop: "#7d858b", skyMid: "#a7adb1", skyLow: "#c3c7c9", fog: "#b9bec1", far: "#767e84", ridge: "#8c9398", seaFar: "#8f999f", seaNear: "#4f5b62", foam: "#ebeef0", sand: "#4a4b4b", sandWet: "#222324", stone: "#1c1e20" }; // Not skin: landscape painting color
  const NIGHT = { skyTop: "#03070d", skyLow: "#08121c", ridge: "#0a131c", lakeFar: "#1a4658", lakeNear: "#0b2430", sand: "#0d1114", sandFar: "#08090a", stone: "#121619", aurora: "#3cdca0", auroraLow: "#1e786e", warm: "#785c28" }; // Not skin: landscape painting color
  const goldOf = (n) => {
    const p = document.createElement("i");
    p.style.cssText = `display:none;color:var(${n})`;
    document.body.append(p);
    const c = getComputedStyle(p).color;
    p.remove();
    // The computed value of color-mix takes the color(srgb …) form, which three can’t read — paint one point and take it as 8-bit
    const px = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
    px.fillStyle = c; px.fillRect(0, 0, 1, 1);
    const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
  };

  // Noise — terrain height and rock positions from the same seed
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const noise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x, y) => noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15;

  const FOG_V = "#include <fog_pars_vertex>\n";
  const SKY_FRAG = `
    uniform vec3 uTop, uMid, uLow;
    varying vec3 vDir;
    void main() {
      float h = clamp(normalize(vDir).y, 0.0, 1.0);
      vec3 c = mix(uLow, uMid, smoothstep(0.0, 0.12, h));
      gl_FragColor = vec4(mix(c, uTop, smoothstep(0.12, 0.55, h)), 1.0);
      #include <colorspace_fragment>
    }`;
  const SKY_VERT = "varying vec3 vDir;\nvoid main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";

  // Water: layered sine waves shake the surface, farther means a more distant color, and nearer the shore (uShore line) three foam bands wash in and out
  const WATER_VERT = `
    uniform float uTime, uAmp;
    varying vec3 vWorld;
    varying float vWave;
    ${FOG_V}
    void main() {
      vec3 p = position;
      float w = sin(p.x * 0.35 + uTime * 0.9) * 0.6 + sin(p.y * 0.52 - uTime * 1.3) * 0.4 + sin((p.x + p.y) * 1.1 + uTime * 2.0) * 0.15;
      p.z += w * uAmp;
      vWave = w;
      vec4 world = modelMatrix * vec4(p, 1.0);
      vWorld = world.xyz;
      vec4 mvPosition = viewMatrix * world;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`;
  const WATER_FRAG = `
    uniform vec3 uFar, uNear, uFoam, uGlow;
    uniform float uTime, uFoamOn, uGlowOn;
    uniform vec3 uShore;
    varying vec3 vWorld;
    varying float vWave;
    ${"#include <fog_pars_fragment>"}
    void main() {
      float far = smoothstep(4.0, 40.0, -vWorld.z);
      vec3 c = mix(uNear, uFar, far) + vWave * 0.025;
      float d = dot(vec2(vWorld.x, vWorld.z), uShore.xy) - uShore.z;
      float foam = 0.0;
      for (int k = 0; k < 3; k++) {
        float at = float(k) * 0.55 + sin(uTime * 0.7 + float(k)) * 0.18;
        foam += smoothstep(0.16, 0.0, abs(-d - at)) * (0.6 - float(k) * 0.18);
      }
      c = mix(c, uFoam, clamp(foam, 0.0, 1.0) * uFoamOn);
      float glow = pow(max(0.0, 1.0 - abs(vWorld.x + 4.0) / 18.0), 2.0) * smoothstep(30.0, 6.0, -vWorld.z) * (0.5 + 0.5 * sin(vWorld.x * 0.4 + uTime * 0.3));
      c += uGlow * glow * 0.35 * uGlowOn;
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`;

  // Aurora: a curtain bending across the sky. Horizontally overlapping sine waves ripple the band thickness and brightness over time, and the top and bottom ends fade out softly (additive blending)
  const AURORA_FRAG = `
    uniform float uTime;
    uniform vec3 uHi, uLo;
    varying vec2 vUv;
    void main() {
      float x = vUv.x * 90.0;
      float wave = sin(x * 0.23 + uTime * 0.6) * 0.5 + sin(x * 0.07 - uTime * 0.3) * 0.5;
      float top = 0.04 * sin(x * 0.11 + uTime * 0.4);
      float len = 0.55 + 0.3 * (wave * 0.5 + 0.5);
      float y = (1.0 - vUv.y) - top;
      float band = smoothstep(0.0, 0.35 * len, y) * smoothstep(len, 0.35 * len, y);
      float a = (0.05 + 0.11 * (wave * 0.5 + 0.5)) * band * (0.75 + 0.25 * sin(x * 1.7 + uTime));
      vec3 c = mix(uLo, uHi, smoothstep(len, 0.3 * len, y));
      gl_FragColor = vec4(c * a * 4.0, 1.0);
      #include <colorspace_fragment>
    }`;

  // Cursor ripple: over a daytime beach image, a round ripple spreads wherever the cursor passes and settles within 1/3 s.
  // Original values — cycles through 8 ripples, and adds one only when the panel coordinates move more than .006 horizontally plus vertically. Radius spreads from .03 to .12 (ratio of screen height) at 3.7/s,
  // Ring thickness .014, strength e^(−10.5·age). Pulls the image at that spot by a distance of .09 × ring value, from the direction of value × one-turn angle.
  const RIPPLE_FRAG = `
    uniform sampler2D uScene;
    uniform float uNow, uAspect;
    uniform vec4 uDrops[8];
    varying vec2 vUv;
    void main() {
      float push = 0.0;
      for (int i = 0; i < 8; i++) {
        vec4 d = uDrops[i];
        float age = uNow - d.z;
        float reach = 0.03 + 0.09 * (1.0 - exp(-3.7 * age));
        float off = (length((vUv - d.xy) * vec2(uAspect, 1.0)) - reach) / 0.014;
        push += d.w * exp(-off * off) * exp(-10.5 * age);
      }
      float turn = 6.2831853 * push;
      gl_FragColor = texture2D(uScene, clamp(vUv + 0.09 * push * vec2(sin(turn), cos(turn)), 0.001, 0.999));
      #include <colorspace_fragment>
    }`;
  const ripplePass = (renderer, canvas) => {
    const drops = Array.from({ length: 8 }, () => new T.Vector4(0, 0, -10, 0));
    const last = new T.Vector2(-1, -1);
    const target = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, samples: 4 });
    const uni = { uScene: { value: target.texture }, uNow: { value: 0 }, uAspect: { value: 1 }, uDrops: { value: drops } };
    const post = new T.Scene(), flat = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    post.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
      uniforms: uni, depthTest: false, depthWrite: false,
      vertexShader: "varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: RIPPLE_FRAG,
    })));
    renderer.compile(post, flat);
    let on = false, clock = 0, next = 0;
    const wide = () => innerWidth >= 768;
    addEventListener("pointermove", (e) => {
      if (!on || e.pointerType !== "mouse" || !wide()) return;
      const r = canvas.getBoundingClientRect();
      const u = (e.clientX - r.left) / r.width, v = 1 - (e.clientY - r.top) / r.height;
      if (u < 0 || u > 1 || v < 0 || v > 1 || Math.abs(u - last.x) + Math.abs(v - last.y) < 0.006) return;
      last.set(u, v);
      drops[next].set(u, v, clock, 1);
      next = (next + 1) % drops.length;
    }, { passive: true });
    const px = new T.Vector2();
    return {
      show(v) { on = v; if (!v) { drops.forEach((d) => (d.w = 0)); last.set(-1, -1); } },
      tick(dt) { clock += Math.min(dt, 0.05); },
      busy: () => drops.some((d) => d.w && clock - d.z < 0.8),
      size(w, h) { renderer.getDrawingBufferSize(px); target.setSize(px.x, px.y); uni.uAspect.value = w / h; },
      draw(scene, camera) {
        if (!wide()) return renderer.render(scene, camera);
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        uni.uNow.value = clock;
        renderer.render(post, flat);
      },
    };
  };

  // One stage: renderer, camera, scene and set() — outside usage is the same as the 2D panel version.
  // If the stage gives sway, like the original beach it takes window-wide mousemove as −1..1 and follows by .06 each frame (at 60fps),
  // Rotate the camera by yaw (rad) around the look-at point and raise it by horizontal distance × pitch (up when the cursor is low).
  const stage = (canvas, build) => {
    const renderer = new T.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(38, 1, 0.1, 400);
    const state = { pan: 0, lift: 0, zoom: 1, ring: 0, t: 0 };
    const look = new T.Vector3();
    const api = build(scene, camera, renderer) || {};
    const base = api.camera || { x: 0, y: 2.2, z: 12, lookY: 1.2, panX: 5, liftY: 1.6 };
    const sway = !reduce && api.sway ? api.sway : null;
    const aim = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
    // The original logo stands inside the beach scene, so it appears to turn when the camera turns — the copy’s logo is a separately overlaid canvas, so it passes that angle along while visible
    const view = DK.logoView || (DK.logoView = { rx: 0, ry: 0 });
    if (sway) addEventListener("mousemove", (e) => { aim.x = (e.clientX / innerWidth) * 2 - 1; aim.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    const ripple = !reduce && api.ripple ? ripplePass(renderer, canvas) : null;
    renderer.compile(scene, camera);
    const render = () => {
      camera.position.set(base.x + state.pan * base.panX, base.y + state.lift * base.liftY, base.z);
      look.set(base.x + state.pan * base.panX * 0.6, base.lookY + state.lift * base.liftY * 0.5, 0);
      if (sway) {
        const dx = camera.position.x - look.x, dz = camera.position.z - look.z, a = sway.yaw * eased.x, c = Math.cos(a), s = Math.sin(a);
        camera.position.x = look.x + dx * c + dz * s;
        camera.position.z = look.z - dx * s + dz * c;
        camera.position.y += Math.hypot(dx, dz) * sway.pitch * eased.y;
      }
      camera.lookAt(look);
      camera.zoom = state.zoom;
      camera.updateProjectionMatrix();
      api.update?.(state);
      if (ripple) ripple.draw(scene, camera);
      else renderer.render(scene, camera);
    };
    const size = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      ripple?.size(r.width, r.height);
      render();
    };
    new ResizeObserver(size).observe(canvas);
    size();
    if ((api.animate || sway || ripple) && !reduce) {
      let on = false, prev = 0;
      new IntersectionObserver(([e]) => {
        on = e.isIntersecting;
        ripple?.show(on);
        if (sway && !on) view.rx = view.ry = 0;
      }).observe(canvas);
      const loop = (t) => {
        requestAnimationFrame(loop);
        const dt = prev ? (t - prev) / 1000 : 0;
        prev = t;
        if (!on) return;
        let moved = false;
        if (sway) {
          moved = Math.abs(aim.x - eased.x) + Math.abs(aim.y - eased.y) > 1e-4;
          const k = 1 - Math.pow(0.94, Math.min(dt, 0.1) * 60);
          eased.x += (aim.x - eased.x) * k;
          eased.y += (aim.y - eased.y) * k;
          view.ry = -sway.yaw * eased.x;
          view.rx = sway.pitch * eased.y;
        }
        ripple?.tick(dt);
        if (api.animate) state.t = t / 1000;
        if (api.animate || moved || ripple?.busy()) render();
      };
      requestAnimationFrame(loop);
    }
    return { set(p) { Object.assign(state, p); render(); }, state, render };
  };

  const skyDome = (scene, c) => {
    const m = new T.Mesh(new T.SphereGeometry(300, 32, 16), new T.ShaderMaterial({
      vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: T.BackSide, depthWrite: false, fog: false,
      uniforms: { uTop: { value: new T.Color(c.skyTop) }, uMid: { value: new T.Color(c.skyMid || c.skyLow) }, uLow: { value: new T.Color(c.skyLow) } },
    }));
    scene.add(m);
  };
  const water = (scene, o) => {
    const u = T.UniformsUtils.merge([T.UniformsLib.fog, {
      uTime: { value: 0 }, uAmp: { value: o.amp }, uFar: { value: new T.Color(o.far) }, uNear: { value: new T.Color(o.near) },
      uFoam: { value: new T.Color(o.foam || o.near) }, uFoamOn: { value: o.foam ? 1 : 0 }, uShore: { value: new T.Vector3(...o.shore) },
      uGlow: { value: new T.Color(o.glow || o.far) }, uGlowOn: { value: o.glow ? 1 : 0 },
    }]);
    const m = new T.Mesh(new T.PlaneGeometry(o.w, o.d, 120, 80), new T.ShaderMaterial({ vertexShader: WATER_VERT, fragmentShader: WATER_FRAG, uniforms: u, fog: true }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(o.x || 0, 0, o.z || -20);
    scene.add(m);
    return u;
  };
  // Shoreline land: a noise-raised plane cut by the shore line (front ax + bz > Raised above the water only at c), and the closer to the water, the wetter the color
  const ground = (scene, o) => {
    const g = new T.PlaneGeometry(o.w, o.d, 140, 90);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position, col = [];
    const dry = new T.Color(o.dry), wet = new T.Color(o.wet), tmp = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + (o.x || 0), z = pos.getZ(i) + (o.z || 0);
      const d = x * o.shore[0] + z * o.shore[1] - o.shore[2];
      const rise = Math.max(0, d) * o.slope;
      const h = d > 0 ? rise + (fbm(x * 0.35, z * 0.35) - 0.5) * o.bump * Math.min(1, d) : -0.4;
      pos.setY(i, h);
      tmp.copy(wet).lerp(dry, Math.min(1, Math.max(0, d / o.wetBand)));
      col.push(tmp.r, tmp.g, tmp.b);
    }
    g.setAttribute("color", new T.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new T.Mesh(g, new T.MeshLambertMaterial({ vertexColors: true }));
    m.position.set(o.x || 0, 0, o.z || 0);
    scene.add(m);
    return (x, z) => { const d = x * o.shore[0] + z * o.shore[1] - o.shore[2]; return d > 0 ? Math.max(0, d) * o.slope + (fbm(x * 0.35, z * 0.35) - 0.5) * o.bump * Math.min(1, d) : -1; };
  };
  // Pebbles and gold flakes — flat polyhedra scattered over the ground. Gold flakes glow on their own
  const pebbles = (scene, heightAt, o) => {
    const r = rnd(o.seed);
    const geo = new T.IcosahedronGeometry(1, 1);
    const dark = new T.InstancedMesh(geo, new T.MeshLambertMaterial({ color: o.stone }), o.n);
    const shine = new T.InstancedMesh(geo, new T.MeshBasicMaterial({ color: goldOf("--site-gold-1") }), Math.ceil(o.n * o.gold) + 4);
    const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), s = new T.Vector3(), p = new T.Vector3();
    let nd = 0, ng = 0;
    for (let i = 0; i < o.n * 3 && nd + ng < o.n; i++) {
      const x = o.x0 + r() * (o.x1 - o.x0), z = o.z0 + r() * (o.z1 - o.z0), h = heightAt(x, z);
      if (h < 0.02) continue;
      const k = (0.05 + r() * 0.14) * (1 + (z - o.z0) / (o.z1 - o.z0));
      e.set(r() * 3, r() * 3, r() * 3); q.setFromEuler(e);
      s.set(k, k * 0.5, k * 0.8); p.set(x, h + k * 0.2, z);
      m4.compose(p, q, s);
      if (r() < o.gold && ng < shine.count) shine.setMatrixAt(ng++, m4.scale(new T.Vector3(0.3, 0.3, 0.3)));
      else dark.setMatrixAt(nd++, m4);
    }
    dark.count = nd; shine.count = ng;
    scene.add(dark, shine);
  };
  // Gold ring: a ring lying on the ground beneath the logo is drawn one full turn by ring (0→1). Once complete, one more faint ring at 1.9x appears outside
  const goldRing = (scene, at) => {
    const color = goldOf("--site-gold-1");
    const frag = `
      uniform float uRing, uAlpha; uniform vec3 uColor; varying vec2 vUv;
      void main() {
        float a = atan(vUv.y - 0.5, vUv.x - 0.5);
        float t = fract((1.5707963 - a) / 6.2831853);
        if (t > uRing) discard;
        gl_FragColor = vec4(uColor * 1.4, uAlpha);
        #include <colorspace_fragment>
      }`;
    const mk = (r0, r1, alpha) => {
      const mu = { uRing: { value: 0 }, uColor: { value: color }, uAlpha: { value: alpha } };
      const m = new T.Mesh(new T.RingGeometry(r0, r1, 128, 1), new T.ShaderMaterial({
        vertexShader: "varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: frag, uniforms: mu, transparent: true, depthWrite: false, side: T.DoubleSide,
      }));
      m.rotation.x = -Math.PI / 2;
      m.position.copy(at);
      m.visible = false;
      scene.add(m);
      return m;
    };
    const inner = mk(1.74, 1.8, 1), outer = mk(3.34, 3.37, 0.5);
    outer.material.uniforms.uRing.value = 1;
    return (ring) => {
      inner.material.uniforms.uRing.value = ring;
      inner.visible = ring > 0;
      outer.visible = ring > 0.98;
    };
  };
  const ridge = (scene, o) => {
    const r = rnd(o.seed), pts = [];
    for (let i = 0; i <= 48; i++) {
      const x = -o.w / 2 + (i / 48) * o.w;
      pts.push(new T.Vector2(x, o.h * (o.peak ? Math.max(0.15, 1 - Math.abs(x - o.peak) / o.spread) : (0.35 + 0.65 * Math.abs(Math.sin((i / 48) * 7.3 + 1)) * (r() * 0.5 + 0.6)))));
    }
    const shape = new T.Shape([new T.Vector2(-o.w / 2, -2), ...pts, new T.Vector2(o.w / 2, -2)]);
    const m = new T.Mesh(new T.ShapeGeometry(shape), new T.MeshBasicMaterial({ color: o.color, fog: o.fog !== false }));
    m.position.set(o.x || 0, 0, o.z);
    scene.add(m);
  };

  // ── Misty daytime beach: a slanted shoreline from bottom left to top right, a far volcano and ridge in the mist, low-lying clouds ──
  DK.beach = (canvas) => stage(canvas, (scene) => {
    skyDome(scene, DAY);
    scene.fog = new T.Fog(DAY.fog, 14, 95);
    const sun = new T.DirectionalLight(0xffffff, 0.9);
    sun.position.set(-6, 10, 4);
    scene.add(new T.HemisphereLight(0xdfe4e8, 0x2a2c2e, 1.6), sun); // Not skin: overcast daytime sky color
    ridge(scene, { w: 70, h: 7.5, peak: -8, spread: 11, z: -80, x: -4, color: DAY.far, seed: 3 });
    ridge(scene, { w: 120, h: 2.4, z: -70, x: 30, color: DAY.ridge, seed: 5 });
    const sea = water(scene, { w: 220, d: 160, z: -60, amp: 0.08, far: DAY.seaFar, near: DAY.seaNear, foam: DAY.foam, shore: [0.42, 0.91, -2.2] });
    const heightAt = ground(scene, { w: 60, d: 30, z: 4, dry: DAY.sand, wet: DAY.sandWet, shore: [0.42, 0.91, -2.2], slope: 0.05, bump: 0.35, wetBand: 1.6 });
    pebbles(scene, heightAt, { seed: 7, n: 260, gold: 0.06, stone: DAY.stone, x0: -14, x1: 16, z0: -4, z1: 10 });
    // Low-lying cloud mass — round gradient plates floated in front of the sky and drifted slowly
    const cc = Object.assign(document.createElement("canvas"), { width: 128, height: 128 });
    const cx = cc.getContext("2d"), cg = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
    cg.addColorStop(0, DAY.skyLow); cg.addColorStop(1, `${DAY.skyLow}00`); // Not skin: cloud drawing color
    cx.fillStyle = cg; cx.fillRect(0, 0, 128, 128);
    const cloudTex = new T.CanvasTexture(cc), r = rnd(9), clouds = [];
    cloudTex.colorSpace = T.SRGBColorSpace;
    for (let i = 0; i < 18; i++) {
      const s = new T.Sprite(new T.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.35 + r() * 0.25, depthWrite: false, fog: false }));
      const k = 14 + r() * 26;
      s.scale.set(k * 1.8, k * 0.6, 1);
      s.position.set(-70 + r() * 140, 10 + r() * 22, -110 - r() * 40);
      s.userData.v = 0.2 + r() * 0.4;
      clouds.push(s); scene.add(s);
    }
    const ring = goldRing(scene, new T.Vector3(0, heightAt(0, 2.6) + 0.05, 2.6));
    return {
      camera: { x: 0, y: 2.4, z: 13, lookY: 1.4, panX: 5.5, liftY: 2 },
      animate: true,
      // Original daytime beach: orbit angle +.035·mouse x, camera height +.035·mouse y (at camera distance 3 — .035/3 as an angle)
      sway: { yaw: 0.035, pitch: 0.035 / 3 },
      ripple: true,
      update(st) {
        sea.uTime.value = st.t;
        clouds.forEach((c) => { c.position.x = ((c.position.x + 70 + c.userData.v * 0.016) % 140) - 70; });
        ring(st.ring);
      },
    };
  });

  // Aurora night lakeside: lake on the left and dark sandy field on the right, stars and ridgeline, warm light fallen on the ground in the middle and glowing gold flecks
  DK.night = (canvas, opts = {}) => stage(canvas, (scene) => {
    skyDome(scene, NIGHT);
    scene.fog = new T.Fog(NIGHT.skyLow, 30, 160);
    scene.add(new T.HemisphereLight(0x23384a, 0x050607, 1.2)); // Not skin: night sky color
    const warm = new T.PointLight(new T.Color(NIGHT.warm), 30, 14, 1.6);
    warm.position.set(1, 2.5, 3);
    scene.add(warm);
    const r = rnd(11), star = [];
    for (let i = 0; i < 520; i++) {
      const a = r() * Math.PI * 2, h = 0.05 + r() * 0.9;
      star.push(Math.cos(a) * 250 * Math.cos(h), Math.sin(h) * 250, -Math.abs(Math.sin(a)) * 250 * Math.cos(h));
    }
    const sg = new T.BufferGeometry();
    sg.setAttribute("position", new T.Float32BufferAttribute(star, 3));
    scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.75, fog: false }))); // Not Skin: starlight
    if (opts.mountains !== false) ridge(scene, { w: 260, h: 9, z: -120, color: NIGHT.ridge, seed: 13, fog: false });
    let aurora = null;
    if (opts.aurora) {
      aurora = { uTime: { value: 0 }, uHi: { value: new T.Color(NIGHT.aurora) }, uLo: { value: new T.Color(NIGHT.auroraLow) } };
      const a = new T.Mesh(new T.CylinderGeometry(150, 150, 70, 96, 1, true, -1.25, 2.5), new T.ShaderMaterial({
        vertexShader: "varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: AURORA_FRAG, uniforms: aurora, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false,
      }));
      a.rotation.y = Math.PI;
      a.position.set(0, 52, 40);
      scene.add(a);
    }
    const lake = water(scene, { w: 220, d: 160, z: -60, amp: 0.03, far: NIGHT.lakeFar, near: NIGHT.lakeNear, shore: [0.62, 0.78, -1.5], glow: opts.aurora ? NIGHT.aurora : null });
    const heightAt = ground(scene, { w: 70, d: 34, z: 2, dry: NIGHT.sand, wet: NIGHT.sandFar, shore: [0.62, 0.78, -1.5], slope: 0.04, bump: 0.3, wetBand: 2.5 });
    pebbles(scene, heightAt, { seed: 21, n: 300, gold: 0.22, stone: NIGHT.stone, x0: -6, x1: 20, z0: -6, z1: 10 });
    return {
      camera: { x: 0, y: 2.6, z: 13, lookY: 3.2, panX: 5, liftY: 2 },
      animate: !!opts.aurora,
      // Original night lakeside: orbit angle +.015·mouse x, height +.035·mouse y (at camera distance 5.6 at the closest end). Ripples are turned off at night.
      // The original draws the Work page head with an outside camera so this parallax doesn’t exist — cursor: false
      sway: opts.cursor === false ? null : { yaw: 0.015, pitch: 0.035 / 5.6 },
      update(st) {
        lake.uTime.value = st.t;
        if (aurora) aurora.uTime.value = st.t;
      },
    };
  });

  // Foggy beach step 4: swaps in order three numbers → question, moves the camera, and draws a gold ring during the first step
  DK.whySteps = (root, motion) => {
    const beach = DK.beach(root.querySelector(".hx-why__beach"));
    const steps = [...root.querySelectorAll(".hx-step")], dots = [...root.querySelectorAll(".hx-why__dots span")];
    let cur = 0;
    const go = (i) => {
      if (i === cur) return;
      const dir = i > cur ? 1 : -1;
      gsap.to(steps[cur], { autoAlpha: 0, y: -30 * dir, duration: motion ? 0.5 : 0, ease: "power3.out", overwrite: true });
      gsap.fromTo(steps[i], { autoAlpha: 0, y: 30 * dir }, { autoAlpha: 1, y: 0, duration: motion ? 0.8 : 0, ease: "power3.out", overwrite: true });
      dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
      cur = i;
    };
    beach.set({ pan: -0.6, lift: 0.3 });
    return ScrollTrigger.create({
      trigger: root, start: "top top", end: "bottom bottom",
      onUpdate: (st) => {
        const p = st.progress;
        go(Math.min(3, Math.floor(p * 4)));
        beach.set({ ring: Math.min(1, p / 0.2), pan: -0.6 + p * 1.2, lift: 0.3 - p * 0.5, zoom: 1 + 0.12 * Math.sin(p * Math.PI) });
      },
    });
  };
})();
