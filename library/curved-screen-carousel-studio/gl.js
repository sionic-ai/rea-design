/* Shared 3D stage — sand dunes rebuilt with our shader (ripple pattern·screen-light tint), curved screen (moving placeholder video), eclipse portal (light rays at the black disc edge).
   Uses the same build of three as the original (three r182 + hand-written shaders), and reads colors from the Skin variables. */
(() => {
  const MR = (window.MR = window.MR || {});
  const T = window.THREE;
  if (!T) return;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const color = (v) => new T.Color(css(v) || undefined);

  const NOISE = `
    vec2 hash2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(dot(hash2(i), f), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                 mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0)), f - vec2(1.0)), u.x), u.y); }
    float fbm(vec2 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }`;

  MR.renderer = (canvas) => {
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.setClearColor(color("--kf-bg"), 1);
    r.outputColorSpace = T.SRGBColorSpace;
    return r;
  };

  // Sand dune: height = Two layers of large waves plus fbm, the surface uses a wind-pattern (ripple) normal. Light is directional (uSun) + point light (uLamp, at the screen/portal position)
  MR.sand = ({ size = 260, seg = 256, dune = 1, flat = [0, 0, 0] } = {}) => {
    const geo = new T.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const mat = new T.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDune: { value: dune },
        uFlat: { value: new T.Vector3(...flat) },
        uBase: { value: color("--kf-ink-soft").multiplyScalar(0.12) },
        uSunDir: { value: new T.Vector3(-0.3, 0.35, -1).normalize() },
        uSun: { value: color("--kf-ink").multiplyScalar(0.14) },
        uLampPos: { value: new T.Vector3(0, 6, -30) },
        uLamp: { value: color("--kf-ink") },
        uLampPower: { value: 1.2 },
        uFog: { value: color("--kf-bg") },
        uFogDist: { value: new T.Vector2(30, 140) },
      },
      vertexShader: `
        uniform float uDune; uniform vec3 uFlat;
        varying vec3 vPos; varying vec3 vNormal;
        ${NOISE}
        float h(vec2 p){
          float d = sin(p.x * 0.045 + sin(p.y * 0.031) * 2.2) * 2.6 + sin(p.y * 0.07 + p.x * 0.018) * 1.4 + fbm(p * 0.03) * 5.0;
          float keep = smoothstep(uFlat.z, uFlat.z * 2.2 + 0.001, length(p - uFlat.xy));
          return d * uDune * mix(0.25, 1.0, keep);
        }
        void main(){
          vec3 p = position;
          p.y += h(p.xz);
          float e = 0.6;
          vec3 n = normalize(vec3(h(p.xz - vec2(e, 0.0)) - h(p.xz + vec2(e, 0.0)), 2.0 * e, h(p.xz - vec2(0.0, e)) - h(p.xz + vec2(0.0, e))));
          vNormal = n; vPos = (modelMatrix * vec4(p, 1.0)).xyz;
          gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0);
        }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uBase, uSunDir, uSun, uLampPos, uLamp, uFog; uniform float uLampPower; uniform vec2 uFogDist;
        varying vec3 vPos; varying vec3 vNormal;
        ${NOISE}
        void main(){
          vec2 q = vPos.xz;
          float warp = fbm(q * 0.12) * 2.5;
          float ph = (q.x * 0.35 + q.y * 0.9 + warp) * 5.0;
          float rip = sin(ph);
          vec3 n = normalize(vNormal + vec3(0.0, 0.0, cos(ph) * 0.16));
          float grain = noise(q * 9.0) * 0.06;
          vec3 L = normalize(uLampPos - vPos);
          float dist = length(uLampPos - vPos);
          float lamp = max(dot(n, L), 0.0) * uLampPower * 9.0 / (dist * dist * 0.02 + 18.0);
          float sun = max(dot(n, normalize(uSunDir)), 0.0);
          vec3 col = uBase * (0.35 + rip * 0.08 + grain) + uSun * sun * 0.35 + uLamp * lamp * (0.85 + rip * 0.15);
          float fog = smoothstep(uFogDist.x, uFogDist.y, length(vPos - cameraPosition));
          gl_FragColor = vec4(mix(col, uFog, fog), 1.0);
          #include <colorspace_fragment>
        }`,
    });
    return new T.Mesh(geo, mat);
  };

  // Curved-screen placeholder video: a shader where color bands flow over a canvas text plate (the spot of the original video texture)
  MR.screenTexture = (label, sub) => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 576;
    const g = c.getContext("2d");
    const fam = css("--kf-font-sans");
    g.fillStyle = css("--kf-raised");
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = css("--kf-line");
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c.width, c.height); g.moveTo(c.width, 0); g.lineTo(0, c.height); g.stroke();
    g.fillStyle = css("--kf-ink");
    g.textAlign = "left";
    g.font = `700 26px ${fam}`;
    g.fillText(label, 40, c.height - 66);
    g.font = `500 18px ${fam}`;
    g.fillStyle = css("--kf-dim");
    g.fillText(sub || "Placeholder video · landscape 16:9 · auto loop", 40, c.height - 36);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  };
  MR.screenMaterial = (tex, tint) => new T.ShaderMaterial({
    side: T.DoubleSide,
    uniforms: { uMap: { value: tex }, uTint: { value: tint }, uTime: { value: 0 }, uFade: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = vec2(1.0 - uv.x, uv.y); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D uMap; uniform vec3 uTint; uniform float uTime, uFade; varying vec2 vUv;
      void main(){
        vec3 base = texture2D(uMap, vUv).rgb;
        float band = 0.5 + 0.5 * sin(vUv.x * 6.0 - uTime * 0.6 + sin(vUv.y * 3.0 + uTime * 0.4));
        vec3 col = mix(base, uTint, 0.45 + band * 0.25);
        float edge = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x);
        gl_FragColor = vec4(col * (0.75 + edge * 0.35) * uFade, 1.0);
        #include <colorspace_fragment>
      }`,
  });

  // Eclipse portal: from a single plate, the inside is the background color (disc), and the edge is a polygon jagged per cell like the backs of ten screens, with angle-noised light rays and fog leaking through the gaps
  MR.portal = (radius = 9) => {
    const size = radius * 5;
    const mat = new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uR: { value: radius / size }, uCol: { value: color("--kf-ink") }, uBg: { value: color("--kf-bg") }, uFade: { value: 1 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uTime, uR, uFade; uniform vec3 uCol, uBg; varying vec2 vUv;
        ${NOISE}
        float h1(float n){ return fract(sin(n * 91.345) * 47453.5453); }
        void main(){
          vec2 p = (vUv - 0.5) * 2.0;
          float d = length(p) * 0.5;
          float a = atan(p.y, p.x) + 3.14159265;
          float seg = floor(a / 0.6283185);
          float f = fract(a / 0.6283185);
          float edge = uR * (1.0 + (h1(seg) - 0.5) * 0.14 + step(0.86, f) * -0.06 + (h1(seg + 7.0) - 0.5) * 0.05 * f);
          float streak = pow(max(noise(vec2(a * 3.2, uTime * 0.05)) * 0.5 + 0.5, 0.0), 3.0) * 1.6 + 0.15;
          float gap = smoothstep(0.8, 0.97, f) * 0.9 + 0.35;
          float rim = exp(-abs(d - edge) * 140.0) * (0.5 + streak) * gap;
          float haze = smoothstep(edge, edge + 0.003, d) * exp(-(d - edge) * 6.0) * streak * 0.75;
          float light = (rim + haze) * uFade;
          float inside = (1.0 - smoothstep(edge - 0.002, edge + 0.002, d)) * uFade;
          gl_FragColor = vec4(mix(uCol * light, uBg, inside), clamp(max(light, inside), 0.0, 1.0));
          #include <colorspace_fragment>
        }`,
    });
    const plane = new T.Mesh(new T.PlaneGeometry(size, size), mat);
    const group = new T.Group();
    group.add(plane);
    group.userData = { mat };
    return group;
  };

  // Screen color — rotates only the hue of the skin accent like oklch to give each project a different video glow (color of the placeholder video).
  MR.projectColors = (n) => {
    const base = color("--kf-accent");
    const hsl = {};
    base.getHSL(hsl);
    return Array.from({ length: n }, (_, i) => new T.Color().setHSL((hsl.h + i * 0.137) % 1, 0.45, 0.42));
  };

  // ── Cursor ink: the original places a low-resolution fluid (velocity · ink) over the whole stage, pushing the screen where ink passed toward the velocity, scattering it and adding grain.
  //    Values read from the original bundle — 256 rows vertically, cursor force of per-frame movement ×8, force radius .0025 · ink radius .0025→.0005 (square of the ratio to the screen’s short side, narrower the paler the stage),
  //    ink .03/frame, speed ×.96 · ink ×.955/frame, pressure once, if still for 2.25s the sim stops. push ×.1, scatter radius ink×.4, grain ±ink×.4.
  //    Like the original, off on touch devices and off under reduced motion.
  const SIM = 256, FORCE = 8, SPLAT = 0.0025, INK = 0.03, INK_WIDE = 0.0025, INK_NARROW = 0.0005, KEEP_V = 0.96, KEEP_I = 0.955;
  const IDLE = Math.log(0.002) / Math.log(KEEP_I) / 60;
  const hover = matchMedia("(hover: hover)").matches;
  MR.post = (renderer) => {
    if (MR.reduce || !hover) return { render: (scene, camera) => renderer.render(scene, camera), fade() {} };
    const opt = { type: T.HalfFloatType, depthBuffer: false, minFilter: T.LinearFilter, magFilter: T.LinearFilter, wrapS: T.ClampToEdgeWrapping, wrapT: T.ClampToEdgeWrapping };
    const pair = () => { const p = { r: new T.WebGLRenderTarget(1, 1, opt), w: new T.WebGLRenderTarget(1, 1, opt) }; p.swap = () => ([p.r, p.w] = [p.w, p.r]); return p; };
    const vel = pair(), prs = pair(), div = new T.WebGLRenderTarget(1, 1, opt);
    const shot = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, samples: 4 });
    const texel = new T.Vector2(), iso = new T.Vector2(1, 1), buf = new T.Vector2();
    const quad = new T.Mesh(new T.PlaneGeometry(2, 2)), quadScene = new T.Scene(), quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    quad.frustumCulled = false;
    quadScene.add(quad);
    const mat = (uniforms, body) => new T.ShaderMaterial({
      uniforms: { uTexel: { value: texel }, ...uniforms }, depthTest: false, depthWrite: false,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `uniform vec2 uTexel; varying vec2 vUv; ${body}`,
    });
    const splat = mat({ uSrc: { value: null }, uAt: { value: new T.Vector2(0.5, 0.5) }, uPush: { value: new T.Vector2() }, uIso: { value: iso }, uR: { value: SPLAT }, uInk: { value: INK }, uInkR: { value: INK_WIDE } }, `
      uniform sampler2D uSrc; uniform vec2 uAt, uPush, uIso; uniform float uR, uInk, uInkR;
      void main(){
        vec2 d = (vUv - uAt) * uIso; float d2 = dot(d, d);
        vec3 s = texture2D(uSrc, vUv).xyz;
        gl_FragColor = vec4(s.xy + uPush * exp2(-d2 / uR), min(s.z + uInk * exp2(-d2 / uInkR), 1.0), 1.0);
      }`);
    const spread = mat({ uVel: { value: null } }, `
      uniform sampler2D uVel;
      void main(){
        vec2 dx = vec2(uTexel.x, 0.0), dy = vec2(0.0, uTexel.y);
        float d = texture2D(uVel, vUv + dx).x - texture2D(uVel, vUv - dx).x + texture2D(uVel, vUv + dy).y - texture2D(uVel, vUv - dy).y;
        gl_FragColor = vec4(d * 0.6, 0.0, 0.0, 1.0);
      }`);
    const press = mat({ uP: { value: null }, uDiv: { value: null } }, `
      uniform sampler2D uP, uDiv;
      void main(){
        vec2 dx = vec2(uTexel.x, 0.0), dy = vec2(0.0, uTexel.y);
        float around = texture2D(uP, vUv - dx).x + texture2D(uP, vUv + dx).x + texture2D(uP, vUv - dy).x + texture2D(uP, vUv + dy).x;
        gl_FragColor = vec4((around - texture2D(uDiv, vUv).x) * 0.25, 0.0, 0.0, 1.0);
      }`);
    const settle = mat({ uP: { value: null }, uVel: { value: null } }, `
      uniform sampler2D uP, uVel;
      void main(){
        vec2 dx = vec2(uTexel.x, 0.0), dy = vec2(0.0, uTexel.y);
        vec2 grad = vec2(texture2D(uP, vUv + dx).x - texture2D(uP, vUv - dx).x, texture2D(uP, vUv + dy).x - texture2D(uP, vUv - dy).x);
        vec3 s = texture2D(uVel, vUv).xyz;
        gl_FragColor = vec4(s.xy - grad, s.z, 1.0);
      }`);
    const carry = mat({ uVel: { value: null }, uDt: { value: 1 / 60 }, uIso: { value: iso } }, `
      uniform sampler2D uVel; uniform float uDt; uniform vec2 uIso;
      void main(){
        vec3 s = texture2D(uVel, vUv - uDt * texture2D(uVel, vUv).xy * uIso).xyz;
        gl_FragColor = vec4(s.xy * ${KEEP_V.toFixed(3)}, s.z * ${KEEP_I.toFixed(3)}, 1.0);
      }`);
    const show = mat({ uScene: { value: null }, uFlow: { value: null } }, `
      uniform sampler2D uScene, uFlow;
      float rnd(vec2 p){ uvec2 q = uvec2(ivec2(p)) * uvec2(1597334677u, 3812015801u); return float((q.x ^ q.y) * 1597334677u) / 4294967295.0; }
      void main(){
        vec3 f = texture2D(uFlow, vUv).xyz;
        vec4 c;
        if (length(f.xy) < 0.001 && f.z < 0.001) c = texture2D(uScene, vUv);
        else {
          float r = rnd(gl_FragCoord.xy) * 0.85, a = r * 6.2831853;
          c = texture2D(uScene, vUv - f.xy * f.z * 0.1 + vec2(cos(a), sin(a)) * f.z * 0.4 * r);
          c.rgb = max(c.rgb + (rnd(gl_FragCoord.xy + 211.0) - 0.5) * f.z * 0.8, 0.0);
        }
        gl_FragColor = c;
        #include <colorspace_fragment>
      }`);
    const blit = (m, to) => { quad.material = m; renderer.setRenderTarget(to); renderer.render(quadScene, quadCam); };
    const solve = (dt) => {
      spread.uniforms.uVel.value = vel.r.texture; blit(spread, div);
      press.uniforms.uDiv.value = div.texture; press.uniforms.uP.value = prs.r.texture; blit(press, prs.w); prs.swap();
      settle.uniforms.uP.value = prs.r.texture; settle.uniforms.uVel.value = vel.r.texture; blit(settle, vel.w); vel.swap();
      carry.uniforms.uVel.value = vel.r.texture; carry.uniforms.uDt.value = dt; blit(carry, vel.w); vel.swap();
    };
    let mx = 0.5, my = 0.5, px = 0.5, py = 0.5, idle = 0, warm = false, aspect = 0;
    const fit = () => {
      renderer.getDrawingBufferSize(buf);
      if (buf.x !== shot.width || buf.y !== shot.height) shot.setSize(buf.x, buf.y);
      const a = buf.x / Math.max(buf.y, 1);
      if (a === aspect) return;
      aspect = a;
      const w = a >= 1 ? Math.round(SIM / a) : SIM, h = a >= 1 ? SIM : Math.round(SIM * a);
      [vel.r, vel.w, prs.r, prs.w, div].forEach((t) => t.setSize(w, h));
      texel.set(1 / w, 1 / h);
      iso.set(a >= 1 ? a : 1, a >= 1 ? 1 : 1 / a);
    };
    return {
      fade(v) { splat.uniforms.uInkR.value = INK_WIDE - (INK_WIDE - INK_NARROW) * Math.min(1, Math.max(0, v)); },
      render(scene, camera, dt) {
        fit();
        const n = Math.min(dt > 0 ? dt : 1 / 60, 1 / 30);
        // Wiring the shader on the first cursor move freezes the screen — so at setup, run one loop with zero force to pre-compile it
        if (!warm) { warm = true; splat.uniforms.uSrc.value = vel.r.texture; splat.uniforms.uPush.value.set(0, 0); splat.uniforms.uInk.value = 0; blit(splat, vel.w); vel.swap(); solve(n); splat.uniforms.uInk.value = INK; }
        const m = MR.mouse;
        if (m?.on) { mx = m.x / innerWidth; my = 1 - m.y / innerHeight; }
        const dx = mx - px, dy = my - py;
        px = mx; py = my;
        let run = true;
        if (dx * dx + dy * dy > 1e-9) {
          idle = 0;
          const u = splat.uniforms;
          u.uSrc.value = vel.r.texture; u.uAt.value.set(mx, my); u.uPush.value.set(dx * FORCE, dy * FORCE);
          blit(splat, vel.w); vel.swap();
        } else if (idle >= IDLE) run = false;
        else idle += n;
        if (run) solve(n);
        renderer.setRenderTarget(shot);
        renderer.render(scene, camera);
        show.uniforms.uScene.value = shot.texture;
        show.uniforms.uFlow.value = vel.r.texture;
        blit(show, null);
      },
    };
  };

  // The original camera turns toward the cursor by azimuth (x/width)×.02 and polar angle (y/height)×.02 rad (0 on phone). To keep the measured screen composition, horizontal uses the center as 0
  const UP = new T.Vector3(0, 1, 0), off = new T.Vector3(), side = new T.Vector3();
  MR.leanTarget = () => {
    const m = MR.mouse;
    if (MR.reduce || !hover || !m?.on) return [0, 0, 0];
    const x = m.x / innerWidth - 0.5;
    return [x * 0.02, (m.y / innerHeight) * 0.02, x];
  };
  MR.lean = (camera, target, yaw, pitch) => {
    if (!yaw && !pitch) return;
    off.subVectors(camera.position, target).applyAxisAngle(UP, yaw);
    side.crossVectors(UP, off);
    if (side.lengthSq() > 1e-8) off.applyAxisAngle(side.normalize(), pitch);
    camera.position.copy(target).add(off);
    camera.lookAt(target);
  };

  MR.fit = (renderer, camera, canvas) => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
})();
