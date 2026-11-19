// Home only: vision text flicker · three feature line drawings · data visualization drawing
(() => {
  const { gsap, isPC, reduce } = window.SDB;
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── Vision: each letter lights blue (0) → red (+.01) → white (+.05), then blue and red are cleared at the end. Line .08s · letter .03s ──
  function splitChars(root) {
    $$("p", root).forEach((p) => {
      if (p.classList.contains("sp")) return;
      const t = p.textContent;
      p.setAttribute("aria-label", t);
      p.innerHTML = [...t].map((c) => `<span class="cw" aria-hidden="true"><span class="b">${c}</span><span class="r">${c}</span><span class="w">${c}</span></span>`).join("");
    });
  }
  function flicker(root, tl, at) {
    let line = 0;
    $$("p", root).forEach((p) => {
      const cws = $$(".cw", p);
      if (!cws.length) return;
      const L = at + line * 0.08;
      cws.forEach((cw, k) => {
        const w = L + k * 0.03;
        tl.set($(".b", cw), { opacity: 1 }, w).set($(".r", cw), { opacity: 1 }, w + 0.01).set($(".w", cw), { opacity: 1 }, w + 0.05);
      });
      line++;
    });
    return tl.duration();
  }
  // Subtitle: small line .03s per letter, large line starts after half the small line’s length. Turn on blue → red (+.01) and at the end remove only blue so red remains
  function subFlicker(root, tl, at) {
    const [small, large] = $$("p", root).map((p) => $$(".cw", p));
    const y0 = small.length * 0.03 * 0.5;
    [[small, 0], [large, y0]].forEach(([cws, base]) => cws.forEach((cw, k) => {
      const w = at + base + k * 0.03;
      tl.set($(".b", cw), { opacity: 1 }, w).set($(".r", cw), { opacity: 1 }, w + 0.01).set({}, {}, w + 0.05);
    }));
    tl.set($$(".cw .b", root), { display: "none" });
  }

  // ── Vision title: original Lottie (29.97fps · 60 frames) — the first word is written stroke by stroke at the second-line position and moves 20px left (0→11f),
  //    jumps to the first line at 20f, from 19f the second word is written in from 90px to the right and settles at 25→32f. Strokes are spaced 0.6f (second word 0.9f) apart every 4f,
  //    The blue shadow is drawn 1f ahead. Since letter counts differ, instead of strokes each letter is wiped evenly over the same interval ──
  const VF = (f) => f / 29.97;
  function buildTitle(title) {
    const lines = title.innerHTML.split(/<br\s*\/?>/i).map((t) => { const d = document.createElement("div"); d.innerHTML = t; return d.textContent.trim(); });
    title.setAttribute("aria-label", lines.join(" "));
    const ch = (c) => `<span class="vt-c"><span class="vt-cy">${c}</span><span class="vt-in">${c}</span></span>`;
    title.innerHTML = lines.map((t) => `<span class="vt-line" aria-hidden="true">${t.split(" ").map((w) => `<span class="vt-w">${[...w].map(ch).join("")}</span>`).join(" ")}</span>`).join("");
  }
  function writeLine(tl, line, from, to) {
    const cs = $$(".vt-c", line), n = cs.length, D = Math.min(to - from, 4 + (to - from - 4) / Math.max(n, 1));
    cs.forEach((c, i) => {
      const s = from + (n > 1 ? (i * (to - from - D)) / (n - 1) : 0);
      tl.fromTo($(".vt-cy", c), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: VF(D), ease: "sdbStroke" }, VF(s));
      tl.fromTo($(".vt-in", c), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: VF(D), ease: "sdbStroke" }, VF(s + 1));
    });
  }
  function titleTimeline(title) {
    const tl = gsap.timeline();
    const [l1, l2] = $$(".vt-line", title);
    const k = title.offsetWidth / 400;
    CustomEase.create("sdbStroke", "0.001,0,0.999,1");
    tl.fromTo(l1, { x: 20 * k, y: l1.offsetHeight }, { x: 0, duration: VF(11), ease: CustomEase.create("sdbVt1", "0.4,0.8,0.74,1") }, 0).set(l1, { y: 0 }, VF(20));
    writeLine(tl, l1, 0.3, 13.1);
    if (l2) {
      tl.set(l2, { autoAlpha: 0, x: 90 * k }, 0).set(l2, { autoAlpha: 1 }, VF(18.8));
      tl.to(l2, { x: 0, duration: VF(7), ease: CustomEase.create("sdbVt2", "0.76,0,0.24,1") }, VF(25));
      writeLine(tl, l2, 18.8, 39.9);
    }
    tl.set({}, {}, VF(60) + 0.05);
    return tl;
  }
  function initVision() {
    const lead = $("[data-vision-lead]"), sub = $("[data-vision-sub]"), title = $("[data-vision-title]");
    if (!lead) return;
    splitChars(lead); splitChars(sub);
    const finish = () => $$(".cw .b, .cw .r", lead).forEach((e) => (e.style.display = "none"));
    const final = () => {
      $$(".cw .w", lead).forEach((e) => (e.style.opacity = 1)); finish();
      $$(".cw .r", sub).forEach((e) => (e.style.opacity = 1));
    };
    // The original is an SPA, so returning home from a subpage leaves the already seen vision fully written and only wipes the panel in from the right — we do the same with a mark left at transition
    const ready = () => $(".vision")?.classList.add("is-ready");
    const back = sessionStorage.getItem("sdb:return") === "1";
    sessionStorage.removeItem("sdb:return");
    if (reduce || !window.CustomEase) { final(); return ready(); }
    if (back) { final(); ready(); $(".vision__inner")?.classList.add("is-wipe"); return; }
    buildTitle(title);
    gsap.set($$(".vt-cy, .vt-in", title), { clipPath: "inset(0 100% 0 0)" });
    ready();
    const play = () => {
      const tl = gsap.timeline();
      tl.add(titleTimeline(title));
      const t2 = gsap.timeline({ onComplete: finish });
      flicker(lead, t2, 0);
      tl.add(t2);
      subFlicker(sub, tl, tl.duration());
    };
    if (isPC()) {
      if (doc.classList.contains("hero-info-started")) play();
      else document.addEventListener("sdb:hero-info", play, { once: true });
    } else ScrollTrigger.create({ trigger: ".vision", start: "top 80%", once: true, onEnter: play });
  }

  // ── Feature visuals: the original is three(r182) scenes, three of them — 1 overlapping rings (Circles) · 2 spiral funnel (Spiral) · 3 line sphere (LineBall).
  //    Scene values (radius, line width, camera, length, curve, blend) are the original defaults as is, and the shader is rewritten in our own words with the same formula.
  //    As in the original, the renderer is raised only when near the screen (100px margin · 5%) and removed when it leaves ──
  const T = window.THREE;
  const { cssRGB } = window.SDB;
  const toLinear = (c) => c.map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const v3 = (c) => new T.Vector3(...c);
  const ease = {
    inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    outQuad: (t) => 1 - (1 - t) * (1 - t),
  };
  const ring = (r, seg, tube, radial, plane = "xy") => {
    const pts = [];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(plane === "xy" ? new T.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0) : new T.Vector3(Math.sin(a) * r, Math.cos(a) * r, 0));
    }
    return new T.TubeGeometry(new T.CatmullRomCurve3(pts, true, "catmullrom", 0.5), seg, tube, radial, true);
  };

  const scenes = {
    // Three circles overlap inward from the left and right edges, each staggered by .57s, entering over 0.88s (sine in) · holding .5s · leaving over .88s (quad out) · resting .91s, moving inward by 0.1 in the meantime
    rings(make) {
      const P = { tube: 0.034, base: 0.572, r2: 1.478, r3: 1.87, edge: 1.87, stagger: 0.57, keep: 0.5, fin: 0.88, fout: 0.88, wait: 0.91, move: 0.1, lag: 0.3 };
      const { scene, camera } = make({ z: 2 });
      const red = cssRGB("--kf-accent"), blue = cssRGB("--site-accent-3");
      const frag = (right) => `
        uniform vec3 uRed; uniform vec3 uBlue; uniform float uFade; uniform float uCx; uniform float uR;
        varying vec3 vW;
        void main() {
          float t = clamp((vW.x - (uCx - uR)) / (2.0 * uR), 0.0, 1.0);
          ${right
            ? "float m = clamp((t - 0.1) / 0.7, 0.0, 1.0); vec3 c = mix(uRed, uBlue, m); float a = t < 0.1 ? 1.0 : (t < 0.8 ? 1.0 - m : 0.0);"
            : "float m = clamp((t - 0.4) / 0.4, 0.0, 1.0); vec3 c = mix(uRed, uBlue, m); float a = t < 0.4 ? 0.0 : (t < 0.8 ? m : 1.0);"}
          gl_FragColor = vec4(c, a * uFade);
        }`;
      const vert = "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }";
      const radii = [P.base, P.base * P.r2, P.base * P.r3];
      const order = { left: [1, 2, 4], right: [0, 5, 3] };
      const items = [];
      ["left", "right"].forEach((side) => radii.forEach((r, i) => {
        const right = side === "right";
        const mat = new T.ShaderMaterial({ uniforms: { uRed: { value: v3(red) }, uBlue: { value: v3(blue) }, uFade: { value: 0 }, uCx: { value: 0 }, uR: { value: r } },
          vertexShader: vert, fragmentShader: frag(right), transparent: true, side: T.DoubleSide, depthWrite: false });
        const mesh = new T.Mesh(ring(r, 80, P.tube, 3), mat);
        mesh.renderOrder = order[side][i];
        const base = right ? P.edge - r : -P.edge + r;
        mesh.position.x = base;
        scene.add(mesh);
        items.push({ mesh, mat, base, i, right });
      }));
      const D = P.fin + P.keep + P.fout + P.wait;
      let time = 0;
      return (dt) => {
        time += dt;
        items.forEach(({ mesh, mat, base, i, right }) => {
          const g = ((((time - i * P.stagger - (right ? 0 : P.lag)) % D) + D) % D);
          const k1 = P.fin, k2 = k1 + P.keep, k3 = k2 + P.fout;
          const f = g < k1 ? ease.inSine(g / P.fin) : g < k2 ? 1 : g < k3 ? 1 - ease.outQuad((g - k2) / P.fout) : 0;
          const m = f > 0 ? Math.min(g / k3, 1) : 0;
          mesh.position.x = base + (right ? -1 : 1) * P.move * m;
          mat.uniforms.uFade.value = f;
          mat.uniforms.uCx.value = mesh.position.x;
        });
      };
    },
    // A spiral opening upward from the floor over 9.5 turns (height 4.815 · radius .226→2.092 · thickness .0286), three colors that break at 30% height, and two gaps flowing upward at .08 per second
    funnel(make) {
      const P = { rb: 0.22609, rt: 2.09239, rev: 9.5, h: 4.81522, tube: 0.02859, taper: 0.84136, spacing: 0.35, mid: 0.3, persp: 0.2,
        angle: 91.59563, elev: 30.90231, dist: 3.55413, tx: 0.11267, tz: -1.31474, rotY: -105.65, masks: 2, mSize: 0.1, mFade: 0.02, mSpeed: 0.08 };
      const { scene, camera } = make({ z: 4 });
      const pts = [];
      for (let u = 0; u <= 200; u++) {
        const o = u / 200, a = Math.pow(o, 1 + P.spacing * 1.5) * P.rev * Math.PI * 2;
        if (a < Math.PI * 2) continue;
        const r = P.rb + (P.rt - P.rb) * Math.pow(o, 1 + P.taper * 2);
        pts.push(new T.Vector3(Math.cos(a) * r, o * P.h, Math.sin(a) * r));
      }
      const geo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 400, P.tube, 6, false);
      const pos = geo.attributes.position, at = new Float32Array(pos.count);
      for (let i = 0; i < pos.count; i++) at[i] = Math.max(0, Math.min(1, pos.getY(i) / P.h));
      geo.setAttribute("aT", new T.BufferAttribute(at, 1));
      // Original passes these three colors as hex strings, so the linear-converted values are painted as is — to get the same screen we feed linear values too
      const mat = new T.ShaderMaterial({
        uniforms: { uA: { value: v3(toLinear(cssRGB("--site-spiral-a"))) }, uB: { value: v3(toLinear(cssRGB("--site-spiral-b"))) }, uC: { value: v3(toLinear(cssRGB("--site-spiral-c"))) }, uBase: { value: 0 } },
        vertexShader: "attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: `
          uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform float uBase; varying float vT;
          void main() {
            vec3 c = vT < ${P.mid.toFixed(2)} ? mix(uA, uB, vT / ${P.mid.toFixed(2)}) : mix(uB, uC, (vT - ${P.mid.toFixed(2)}) / ${(1 - P.mid).toFixed(2)});
            float a = 1.0, half_ = ${(P.mSize / 2).toFixed(3)}, fl = ${P.mFade.toFixed(3)};
            for (int i = 0; i < ${P.masks + 2}; i++) {
              float d = abs(vT - (uBase + (float(i) - 1.0) / ${P.masks.toFixed(1)}));
              if (d < half_) discard;
              if (d < half_ + fl) a *= (d - half_) / fl;
            }
            gl_FragColor = vec4(c, a);
          }`,
        transparent: true, depthWrite: false,
      });
      const mesh = new T.Mesh(geo, mat);
      mesh.position.set(0, -0.1, 0);
      mesh.rotation.y = (P.rotY * Math.PI) / 180;
      scene.add(mesh);
      camera.fov = 10 + P.persp * 80;
      const N = P.dist * (1 + (1 - P.persp) * 2), J = (P.angle * Math.PI) / 180, H = (P.elev * Math.PI) / 180, ty = P.h / 2;
      camera.position.set(P.tx + Math.cos(J) * Math.cos(H) * N, ty + Math.sin(H) * N, P.tz + Math.sin(J) * Math.cos(H) * N);
      camera.lookAt(P.tx, ty, P.tz);
      camera.updateProjectionMatrix();
      let q = 0;
      return (dt) => { q += P.mSpeed * dt; if (q > 1 / P.masks) q -= 1 / P.masks; mat.uniforms.uBase.value = q; };
    },
    // A sphere woven from 17 meridian lines (radius 1.91 · thickness .025) slowly spins on three axes, each line slides in reverse, and light runs along the meridians. Additive blending
    sphere(make) {
      const P = { tube: 0.025, R: 1.91, lines: 17, speed: 0.005, lSize: 0.07, lInt: 0.65, lGlow: 0.4, lSpeed: 0.005, rot: [-74.35, 0, -23.48], auto: [0.03, 0.1, 0.02], blue: 0.71, red: 0 };
      const { scene } = make({ z: 4 });
      const group = new T.Group();
      scene.add(group);
      const inv = new T.Matrix4();
      const uniforms = () => ({ uEdge: { value: v3(cssRGB("--kf-accent")) }, uCenter: { value: v3(cssRGB("--site-ball-center")) }, uLight: { value: v3(cssRGB("--site-ball-light")) }, uPos: { value: 0 }, uInv: { value: inv } });
      const vert = `
        uniform mat4 uInv; varying float vT; varying float vY;
        void main() {
          vT = atan(length(position.xz), position.y) / 3.14159265;
          vY = (uInv * modelMatrix * vec4(position, 1.0)).y / ${P.R.toFixed(2)};
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`;
      const frag = `
        uniform vec3 uEdge; uniform vec3 uCenter; uniform vec3 uLight; uniform float uPos; varying float vT; varying float vY;
        float glow(float d, float s) { return exp(-d * d / (s * s)); }
        void main() {
          float g = abs(vY), lo = ${P.blue.toFixed(2)}, hi = ${(1 - P.red).toFixed(2)};
          vec3 c = g <= lo ? uCenter : (g >= hi ? uEdge : mix(uCenter, uEdge, (g - lo) / (hi - lo)));
          float d = abs(vT - uPos); d = min(d, 1.0 - d);
          float s = ${P.lSize.toFixed(3)}, I = ${P.lInt.toFixed(3)}, G = ${P.lGlow.toFixed(3)};
          float light = glow(d, s) * I + glow(d, s * 3.0) * I * G + glow(d, s * 6.0) * I * G * 0.375;
          gl_FragColor = vec4(c + uLight * light * (1.0 - g * g), 1.0);
        }`;
      const lines = [];
      for (let i = 0; i < P.lines; i++) {
        const mat = new T.ShaderMaterial({ uniforms: uniforms(), vertexShader: vert, fragmentShader: frag, blending: T.AdditiveBlending, depthWrite: false });
        const mesh = new T.Mesh(ring(P.R, 80, P.tube, 6, "yx"), mat);
        mesh.renderOrder = i;
        const holder = new T.Group();
        holder.rotation.y = (i / P.lines) * Math.PI * 2;
        holder.add(mesh);
        group.add(holder);
        lines.push({ mesh, mat, dir: i % 2 ? -1 : 1, sp: 0.5 + Math.random(), pos: 0 });
      }
      const acc = new T.Quaternion(), step = new T.Quaternion(), tilt = new T.Quaternion().setFromEuler(new T.Euler(...P.rot.map((d) => (d * Math.PI) / 180)));
      const axes = [new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0), new T.Vector3(0, 0, 1)];
      // The original adds the same amount every frame — one frame at 60fps counts as 1
      return (dt) => {
        const k = dt * 60;
        axes.forEach((ax, i) => acc.premultiply(step.setFromAxisAngle(ax, P.auto[i] * 0.01 * k)));
        group.quaternion.copy(acc).multiply(tilt);
        group.updateMatrixWorld();
        inv.copy(group.matrixWorld).invert();
        lines.forEach((l) => {
          l.mesh.rotation.z += P.speed * l.dir * l.sp * k;
          l.pos = (((l.pos + P.lSpeed * l.dir * k) % 1) + 1) % 1;
          l.mat.uniforms.uPos.value = l.pos;
        });
      };
    },
  };

  // Data visualization slot: the original draws a ballpark model and batted-ball data with three (gaps). Here it is a flat stadium painted with skin variables and player dot trails
  const rgba = (name, a = 1) => `rgba(${cssRGB(name).map((v) => Math.round(v * 255)).join(",")},${a})`;
  function pitch(ctx, w, h, t, st) {
    st.c ||= { bg: rgba("--site-pitch"), line: rgba("--kf-contrast-ink", 0.22), a: rgba("--kf-accent"), b: rgba("--site-accent-2"), a5: rgba("--kf-accent", 0.55), b5: rgba("--site-accent-2", 0.55) };
    const C = st.c;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    const Pp = (x, y) => { const d = 0.55 + y * 0.45; return [w / 2 + (x - 0.5) * w * 0.95 * d, h * 0.16 + y * h * 0.72]; };
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    const line = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => { const [a, b] = Pp(x, y); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); ctx.stroke(); };
    line([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]); line([[0.5, 0], [0.5, 1]]);
    line([[0, 0.3], [0.14, 0.3], [0.14, 0.7], [0, 0.7]]); line([[1, 0.3], [0.86, 0.3], [0.86, 0.7], [1, 0.7]]);
    if (!st.players) st.players = Array.from({ length: 14 }, (_, i) => ({ team: i % 2, sx: Math.random(), sy: Math.random(), ph: Math.random() * 6, trail: [] }));
    st.players.forEach((p) => {
      const x = 0.08 + 0.84 * (0.5 + 0.42 * Math.sin(t * 0.35 + p.ph) * (p.team ? 1 : -1) * p.sx + 0.08 * Math.sin(t + p.ph * 2));
      const y = 0.08 + 0.84 * (0.5 + 0.42 * Math.cos(t * 0.27 + p.ph) * p.sy);
      p.trail.push(Pp(x, y)); if (p.trail.length > 24) p.trail.shift();
      ctx.strokeStyle = p.team ? C.b5 : C.a5; ctx.lineWidth = 1.5;
      ctx.beginPath(); p.trail.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke();
      const [a, b] = Pp(x, y);
      ctx.fillStyle = p.team ? C.b : C.a;
      ctx.beginPath(); ctx.arc(a, b, 4, 0, Math.PI * 2); ctx.fill();
    });
  }

  function mountScene(cv, build) {
    let st = null;
    const start = () => {
      if (st) return;
      let renderer;
      try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true }); } catch (e) { return; }
      const w = cv.clientWidth || 278, h = cv.clientHeight || 209;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      renderer.setClearColor(new T.Color().setRGB(...cssRGB("--kf-ink"), T.SRGBColorSpace));
      const scene = new T.Scene(), camera = new T.PerspectiveCamera(60, w / h, 0.1, 1000);
      const step = build(({ z }) => { camera.position.set(0, 0, z); return { scene, camera }; });
      const ro = new ResizeObserver(() => {
        const W = cv.clientWidth, H = cv.clientHeight;
        if (!W || !H) return;
        renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
      });
      ro.observe(cv);
      let last = 0, raf = 0;
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        const dt = last ? Math.min(0.1, Math.max(0.001, (now - last) / 1000)) : 1 / 60;
        last = now;
        if (!reduce) step(dt);
        renderer.render(scene, camera);
        if (reduce) cancelAnimationFrame(raf);
      };
      raf = requestAnimationFrame(loop);
      st = { stop: () => { cancelAnimationFrame(raf); ro.disconnect(); scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); }); renderer.dispose(); renderer.forceContextLoss(); } };
    };
    const stop = () => { st?.stop(); st = null; };
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? start() : stop())), { threshold: 0.05, rootMargin: "100px" }).observe(cv);
  }
  function initVisuals() {
    if (T) $$("canvas[data-visual]").forEach((cv) => scenes[cv.dataset.visual] && mountScene(cv, scenes[cv.dataset.visual]));
    const flat = $$('canvas[data-visual="pitch"]').map((cv) => ({ cv, ctx: cv.getContext("2d"), on: false, st: {} }));
    flat.forEach((v) => new IntersectionObserver((es) => (v.on = es[0].isIntersecting)).observe(v.cv));
    let last = 0;
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (now - last < 33) return;
      last = now;
      const t = reduce ? 0 : now / 1000;
      flat.forEach((v) => {
        if (!v.on && v.drawn) return;
        const w = v.cv.clientWidth, h = v.cv.clientHeight;
        if (!w) return;
        if (v.cv.width !== w) { v.cv.width = w; v.cv.height = h; }
        pitch(v.ctx, w, h, t, v.st);
        v.drawn = true;
      });
    };
    if (flat.length) requestAnimationFrame(loop);
  }

  initVision();
  initVisuals();
})();
