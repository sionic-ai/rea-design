/* Home — background video board (revealed from the center with noise · covered by color per section · darkens with scroll), handwritten ribbon (drawn in · wave · pulled by drifting dots · tilts toward the cursor),
   Work process video window (small window → full screen), three drawn job shapes, and a section-jump menu. Values are as in the original bundle. */
(() => {
  const OD = (window.OD = window.OD || {});
  OD.pages = OD.pages || {};

  const BG_FRAG = `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec2 uRepeat, uOffset;
    uniform vec3 uTint, uFrom, uTo;
    uniform float uTintStrength, uFromMix, uProgress, uReveal, uAspect, uNoiseScale, uNoiseStrength, uEdge;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
    float cover(float v, float n, float p) {
      float shifted = v + (n - 0.5) * uNoiseStrength;
      float th = mix(-uEdge - uNoiseStrength * 0.5, 1.0 + uEdge + uNoiseStrength * 0.5, p);
      return 1.0 - smoothstep(th - uEdge, th + uEdge, shifted);
    }
    void main() {
      vec3 video = texture2D(uTexture, vUv * uRepeat + uOffset).rgb;
      video = mix(video, uTint, uTintStrength);
      vec3 base = mix(video, uFrom, uFromMix);
      float n = vnoise(vec2(vUv.x * uAspect, vUv.y) * uNoiseScale);
      float c = cover(vUv.y, n, uProgress);
      float d = length((vUv - 0.5) * vec2(uAspect, 1.0)) / length(vec2(uAspect, 1.0) * 0.5);
      float r = cover(d, n, uReveal);
      gl_FragColor = vec4(mix(base, uTo, c) * r, r);
    }`;
  const LINE_VERT = `
    attribute float aDist; attribute float aSide; attribute vec2 aNormal; attribute float aWidth;
    uniform float uTime, uWave, uField; uniform vec2 uPull, uRest; uniform float uPullR, uPullS, uPullDrag;
    varying float vDist; varying float vSide;
    void main() {
      vec3 p = position;
      vec2 f = p.xy * uField;
      vec2 w = vec2(sin(f.x * 0.9 + f.y * 0.5 + uTime * 1.35), sin(f.x * -0.6 + f.y * 1.1 - uTime * 0.95)) * uWave;
      float g = exp(-dot(p.xy - uRest, p.xy - uRest) / (uPullR * uPullR));
      vec2 pull = (uPull - uRest) * uPullS * mix(uPullDrag, 1.0, g);
      p.xy += w + pull + aNormal * aSide * aWidth * 0.5;
      vDist = aDist; vSide = aSide;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const LINE_FRAG = `
    uniform vec3 uColor; uniform float uOpacity, uDraw, uFadeIn, uFadeOut, uBand;
    varying float vDist; varying float vSide;
    void main() {
      if (vDist > uDraw) discard;
      float tip = smoothstep(uDraw, uDraw - 0.04, vDist);
      float out1 = clamp((vDist - uFadeOut * (1.0 + uBand) + uBand) / uBand, 0.0, 1.0);
      float a = uOpacity * uFadeIn * tip * out1 * (1.0 - smoothstep(0.7, 1.0, abs(vSide)));
      gl_FragColor = vec4(uColor * a, a);
    }`;

  /* Handwriting type — three cursive strokes (trochoid, loop size changing along the length) flowing past the 8.6 × 4.8 box to the screen edge, 260 points per stroke */
  const strokes = () => {
    const out = [];
    const specs = [[-6.5, 1.2, 0.5, 0.72, 13, 0.2], [-6.2, -0.8, 0.46, 0.62, 12, 1.4], [-1.8, -2.0, 0.4, 0.58, 6, 2.6]];
    specs.forEach(([x0, y0, R, r0, len, ph]) => {
      const pts = [];
      for (let i = 0; i < 260; i++) {
        const t = (i / 259) * len * Math.PI, r = r0 * (0.55 + 0.55 * Math.sin(t * 0.37 + ph));
        pts.push([x0 + (R * t - r * Math.sin(t + ph)) * 0.55, y0 + r * Math.cos(t + ph) * 0.9 + Math.sin(t * 0.13 + ph) * 0.8]);
      }
      out.push(pts);
    });
    return out;
  };
  const ribbonGeo = (pts, k) => {
    const n = pts.length, pos = [], nor = [], dist = [], side = [], wid = [], idx = [];
    let L = 0; const cum = [0];
    for (let i = 1; i < n; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(L); }
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const u = cum[i] / L, taper = Math.min(1, Math.min(cum[i], L - cum[i]) / (L * 0.12)) * 0.88 + 0.12;
      const press = 0.35 + 0.9 * (0.5 + 0.5 * Math.sin(i * 0.11 + k * 2.3));
      for (const s of [-1, 1]) { pos.push(pts[i][0], pts[i][1], 0); nor.push(-ty, tx); dist.push(u); side.push(s); wid.push(0.022 * press * taper); }
      if (i < n - 1) { const j = i * 2; idx.push(j, j + 1, j + 2, j + 1, j + 3, j + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aNormal", new THREE.Float32BufferAttribute(nor, 2));
    g.setAttribute("aDist", new THREE.Float32BufferAttribute(dist, 1));
    g.setAttribute("aSide", new THREE.Float32BufferAttribute(side, 1));
    g.setAttribute("aWidth", new THREE.Float32BufferAttribute(wid, 1));
    g.setIndex(idx);
    return g;
  };
  const glOK = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } };

  let S = null;
  OD.pages.home = {
    init(root, { first }) {
      S = { kill: [] };
      const later = (f) => S.kill.push(f);
      const mobile = OD.mobile();
      const v3 = (name) => { const [r, g, b] = OD.rgb(name); return new THREE.Color(r / 255, g / 255, b / 255); };
      const mv = root.querySelector(".od-mv");
      const symbol = root.querySelector(".od-mv__symbol"), contents = root.querySelector(".od-mv__contents");

      /* Background video panel */
      const bgHost = root.querySelector(".od-home__bg"), src = bgHost.querySelector(".od-home__src");
      const video = OD.fakeVideo(src, 7);
      let bg = null, lines = null;
      if (glOK()) {
        const r = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        r.setPixelRatio(Math.min(devicePixelRatio, 2));
        bgHost.prepend(r.domElement);
        const tex = new THREE.CanvasTexture(src);
        const onFrame = () => (tex.needsUpdate = true);
        src.addEventListener("frame", onFrame);
        const u = {
          uTexture: { value: tex }, uRepeat: { value: new THREE.Vector2(1, 1) }, uOffset: { value: new THREE.Vector2(0, 0) },
          uTint: { value: v3("--kf-ink-soft") }, uTintStrength: { value: 0 }, uFrom: { value: v3("--kf-contrast-bg") }, uFromMix: { value: 0 },
          uTo: { value: v3("--kf-contrast-bg") }, uProgress: { value: 0 }, uReveal: { value: 0 }, uAspect: { value: 1 },
          uNoiseScale: { value: 2.2 }, uNoiseStrength: { value: 0.48 }, uEdge: { value: 0.4 },
        };
        const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ uniforms: u, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy*2.0,0.,1.);}", fragmentShader: BG_FRAG, transparent: true })));
        /* Video covers at 1.03x to fill (based on a .9 aspect ratio panel) */
        const fit = () => {
          const w = bgHost.clientWidth, h = bgHost.clientHeight; r.setSize(w, h);
          const a = w / h, va = src.width / src.height, z = 1.03;
          u.uAspect.value = a;
          if (a > va) { u.uRepeat.value.set(1 / z, va / a / z); } else { u.uRepeat.value.set(a / va / z, 1 / z); }
          u.uOffset.value.set((1 - u.uRepeat.value.x) / 2, (1 - u.uRepeat.value.y) / 2);
        };
        fit(); addEventListener("resize", fit);
        r.compile(scene, cam);
        const tick = () => r.render(scene, cam);
        gsap.ticker.add(tick);
        bg = { u };
        later(() => { gsap.ticker.remove(tick); removeEventListener("resize", fit); src.removeEventListener("frame", onFrame); r.dispose(); r.forceContextLoss(); r.domElement.remove(); });

        /* Handwritten Ribbon */
        const host = root.querySelector(".od-mv__lines");
        const lr = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        lr.setPixelRatio(Math.min(devicePixelRatio, 2));
        host.append(lr.domElement);
        const ls = new THREE.Scene(), lc = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        const group = new THREE.Group(); ls.add(group);
        const lu = {
          uTime: { value: 0 }, uWave: { value: 0.04 }, uField: { value: 4.6 }, uPull: { value: new THREE.Vector2() }, uRest: { value: new THREE.Vector2() },
          uPullR: { value: 1 }, uPullS: { value: 1.6 }, uPullDrag: { value: 0.05 }, uColor: { value: v3("--kf-contrast-ink") },
          uOpacity: { value: 1 }, uDraw: { value: 0 }, uFadeIn: { value: 0 }, uFadeOut: { value: 0 }, uBand: { value: 0.35 },
        };
        const mat = new THREE.ShaderMaterial({ uniforms: lu, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
        const all = strokes();
        all.forEach((p, k) => group.add(new THREE.Mesh(ribbonGeo(p, k), mat)));
        const dots = all.map((p) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.012 * 4, 24), new THREE.MeshBasicMaterial({ color: lu.uColor.value, transparent: true, opacity: 0, depthWrite: false })); m.userData.to = new THREE.Vector2(p[0][0], p[0][1]); group.add(m); return m; });
        const fitL = () => {
          const w = host.clientWidth, h = host.clientHeight; lr.setSize(w, h); lc.aspect = w / h;
          const need = 8.6 / 2 / Math.tan((35 * Math.PI) / 360) / lc.aspect;
          lc.position.set(0, 0, Math.max(need, 4.8 / 2 / Math.tan((35 * Math.PI) / 360)) * 1.15); lc.lookAt(0, 0, 0); lc.updateProjectionMatrix();
        };
        fitL(); addEventListener("resize", fitL);
        lr.compile(ls, lc);
        const L = (lines = { lu, dots, dotOpacity: 0, spread: 0, pullOn: false, pullT: 0, pull: new THREE.Vector2(), wander: [0, 1, 2, 3].map((i) => new THREE.Vector2(i === 1 ? 0 : (Math.random() * 2 - 1) * 0.6, i === 1 ? 0 : (Math.random() * 2 - 1) * 0.6)), wp: 0, pointer: { x: 0, y: 0 }, rot: { x: 0, y: 0 } });
        const cr = (t, a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
        const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
        let last = performance.now();
        const tickL = (time) => {
          const now = performance.now(), dt = Math.max(1, now - last); last = now;
          lu.uTime.value = time;
          /* Drifting dots — a new dot every 3s (±.6), connected by Catmull-Rom, the pull starts with 3s power2.inOut and follows .08 per frame */
          if (L.pullOn) {
            L.wp += dt / 1000 / 3;
            while (L.wp >= 1) { L.wp -= 1; L.wander.shift(); L.wander.push(new THREE.Vector2((Math.random() * 2 - 1) * 0.6, (Math.random() * 2 - 1) * 0.6)); }
            const [a, b, c, d] = L.wander, t = L.wp;
            ray.setFromCamera(new THREE.Vector2(cr(t, a.x, b.x, c.x, d.x), cr(t, a.y, b.y, c.y, d.y)), lc);
            if (ray.ray.intersectPlane(plane, hit)) {
              L.pullT = Math.min(1, L.pullT + dt / 3000);
              const e = gsap.parseEase("power2.inOut")(L.pullT);
              L.pull.lerp(new THREE.Vector2(hit.x * e, hit.y * e), 0.08);
              lu.uPull.value.copy(L.pull);
            }
          }
          /* Cursor — the group tilts toward the cursor (follow .05) */
          L.rot.x += (L.pointer.y * 0.6 * (Math.PI / 180) * 5 - L.rot.x) * 0.05;
          L.rot.y += (L.pointer.x * 1.2 * (Math.PI / 180) * 5 - L.rot.y) * 0.05;
          group.rotation.set(L.rot.x, L.rot.y, 0);
          dots.forEach((m) => { const p = m.userData.to.clone().multiplyScalar(L.spread); m.position.set(p.x, p.y, 0); m.material.opacity = L.dotOpacity * (1 - lu.uFadeOut.value); m.visible = m.material.opacity > 0.001; });
          lr.render(ls, lc);
        };
        gsap.ticker.add(tickL);
        const onPointer = (e) => { L.pointer.x = (e.clientX / innerWidth) * 2 - 1; L.pointer.y = (e.clientY / innerHeight) * 2 - 1; };
        if (matchMedia("(hover: hover)").matches) addEventListener("pointermove", onPointer);
        later(() => { gsap.ticker.remove(tickL); removeEventListener("resize", fitL); removeEventListener("pointermove", onPointer); lr.dispose(); lr.forceContextLoss(); lr.domElement.remove(); });
      } else document.documentElement.classList.add("no-gl");

      /* Opening sequence — symbol and copy 1.3s (mask), dot 1.4s after .5s, ribbon 2.8s after 1s power2.out (dragging starts when half drawn), video plays 1.72s, background reveals over 2s after 2s */
      const setReveal = (v) => bg && (bg.u.uReveal.value = v);
      const tl = gsap.timeline();
      const val = (at, dur, ease, fn) => { const o = { v: 0 }; fn(0); tl.to(o, { v: 1, duration: dur, ease, onUpdate: () => fn(o.v) }, at); };
      if (OD.reduce || !first) {
        setReveal(1);
        if (!OD.reduce && !first) val(0, 1, "none", setReveal);
        if (lines) { lines.dotOpacity = 1; lines.spread = 1; lines.lu.uDraw.value = 1.01; lines.lu.uFadeIn.value = 1; lines.pullOn = !OD.reduce; }
        gsap.set([symbol, contents], { maskPosition: "50% 50%", webkitMaskPosition: "50% 50%" });
        video.play();
      } else {
        val(2, 2, "none", setReveal);
        tl.call(() => video.play(), null, 1.72);
        if (lines) {
          val(0.5, 1.4, "power3.out", (v) => (lines.dotOpacity = v));
          val(0, 1.4, "power3.out", (v) => (lines.spread = v));
          val(1, 2.8, "power2.out", (v) => (lines.lu.uDraw.value = v * 1.01));
          val(1, 1.2, "power2.out", (v) => (lines.lu.uFadeIn.value = v));
          tl.call(() => (lines.pullOn = true), null, 1 + 2.8 * 0.5);
        }
        [symbol, contents].forEach((el) => tl.fromTo(el, { maskPosition: "100% 0%", webkitMaskPosition: "100% 0%" }, { maskPosition: "50% 50%", webkitMaskPosition: "50% 50%", duration: 1.3, ease: "none" }, 0));
      }
      later(() => { tl.kill(); video.destroy(); });

      /* Hero scroll — symbol and copy clear away 0% to 100%, the ribbon vanishes at band .35, and the video darkens up to .25 */
      const mvSt = gsap.fromTo([symbol, contents], { maskPosition: "50% 50%", webkitMaskPosition: "50% 50%" }, {
        maskPosition: "0% 100%", webkitMaskPosition: "0% 100%", ease: "none", immediateRender: false,
        scrollTrigger: { trigger: mv, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true,
          onUpdate: (s) => { if (bg) bg.u.uTintStrength.value = 0.25 * s.progress; if (lines) lines.lu.uFadeOut.value = s.progress; } },
      });
      later(() => { mvSt.scrollTrigger?.kill(); mvSt.kill(); });
      /* Color overlay per section — entering About the video turns green, and entering Work process the green becomes the background color */
      if (bg) {
        const intro = root.querySelector("#introduction"), proc = root.querySelector("#process");
        const st1 = ScrollTrigger.create({ trigger: intro, start: "top bottom", end: "top top", onUpdate: (s) => { if (proc.getBoundingClientRect().top > innerHeight) { bg.u.uFromMix.value = 0; bg.u.uTo.value.copy(v3("--kf-contrast-bg")); bg.u.uProgress.value = s.progress; } } });
        const st2 = ScrollTrigger.create({ trigger: proc, start: "top bottom", end: "top top", onUpdate: (s) => { bg.u.uFromMix.value = 1; bg.u.uFrom.value.copy(v3("--kf-contrast-bg")); bg.u.uTo.value.copy(v3("--kf-bg")); bg.u.uProgress.value = s.progress; }, onLeaveBack: () => { bg.u.uFromMix.value = 0; bg.u.uTo.value.copy(v3("--kf-contrast-bg")); bg.u.uProgress.value = 1; } });
        later(() => { st1.kill(); st2.kill(); });
      }

      /* Work approach — on entry the window goes .4x → window, while pinned window → screen edge (1), the header text fades out at .5, and the next phrase starts at .6 and runs 1.15 with a mask */
      const proc = root.querySelector(".od-proc"), inner = proc.querySelector(".od-proc__in"), pv = proc.querySelector(".od-proc__video"), win = proc.querySelector(".od-proc__window"), after = proc.querySelector(".od-proc__after"), fades = proc.querySelectorAll("[data-fade]");
      const clip = (k = 1) => { const a = inner.getBoundingClientRect(), b = win.getBoundingClientRect(), dx = (b.width * (1 - k)) / 2, dy = (b.height * (1 - k)) / 2; return `inset(${b.top - a.top + dy}px ${a.right - b.right + dx}px ${a.bottom - b.bottom + dy}px ${b.left - a.left + dx}px)`; };
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pin = gsap.timeline({ scrollTrigger: { trigger: proc, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } })
          .fromTo(pv, { clipPath: () => clip() }, { clipPath: "inset(0px 0px 0px 0px)", ease: "none", duration: 1 })
          .to(fades, { autoAlpha: 0, ease: "none", duration: 0.5 }, 0)
          .fromTo(after, { maskPosition: "100% 0%", webkitMaskPosition: "100% 0%" }, { maskPosition: "0% 100%", webkitMaskPosition: "0% 100%", ease: "none", duration: 1.15 }, 0.6);
        gsap.fromTo(pv, { clipPath: () => clip(0.4) }, { clipPath: () => clip(), ease: "none", scrollTrigger: { trigger: proc, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true, onRefresh: (s) => s.progress === 1 && pin.render(pin.totalTime(), true, true) } });
        gsap.to(pv.querySelector("canvas"), { yPercent: 30, ease: "none", scrollTrigger: { trigger: proc, start: "bottom bottom", end: "bottom top", scrub: true } });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(pv, { clipPath: "inset(0px 0px 0px 0px)" }); gsap.set(fades, { autoAlpha: 0 }); gsap.set(after, { maskPosition: "0% 100%", webkitMaskPosition: "0% 100%" }); });
      later(() => mm.revert());

      /* Three jobs diagram — once at 96% down the screen: center .5s back.out(1.2) → rings·curves .5s expo.out(gap .08) → lines .7s power3.out(gap .03) → dots .35s back.out(1.2)(gap .02) */
      root.querySelectorAll("[data-svg-motion]").forEach((fig) => {
        const q = (s) => [...fig.querySelectorAll(s)];
        const center = fig.querySelector('[data-motion="center"]'), lns = q('[data-motion="line"]'), dts = q('[data-motion="dot"]');
        const draw = (els) => els.forEach((e) => { const l = e.getTotalLength(); gsap.set(e, { strokeDasharray: l, strokeDashoffset: OD.reduce ? 0 : l }); });
        if (OD.reduce) return;
        const tl2 = gsap.timeline({ scrollTrigger: { trigger: fig, start: "top 96%", once: true } });
        gsap.set(center, { transformOrigin: "50% 50%", scale: 0, autoAlpha: 0 });
        if (fig.dataset.svgMotion === "identity-design") {
          const guides = q('[data-motion="circle"], [data-motion="cross"]');
          draw([...guides, ...lns]);
          tl2.to(center, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(1.2)" }).to(guides, { strokeDashoffset: 0, duration: 0.7, ease: "power3.out" }, "-=0.35").to(lns, { strokeDashoffset: 0, duration: 1, ease: "power3.out" }, "-=0.45");
        } else {
          const items = q(fig.dataset.svgMotion === "experience" ? '[data-motion="curve"]' : '[data-motion="ring"]').reverse();
          const k = fig.dataset.svgMotion === "experience" ? 0.8 : 0.6;
          gsap.set([...items, ...dts], { transformOrigin: "50% 50%" });
          gsap.set(dts, { scale: 0, autoAlpha: 0 });
          gsap.set(items, { scale: k, autoAlpha: 0 });
          draw(lns);
          tl2.to(center, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(1.2)" })
            .to(items, { scale: 1, autoAlpha: (i, el) => Number(el.getAttribute("opacity") ?? 1), duration: 0.5, stagger: 0.08, ease: "expo.out" }, "-=0.4")
            .to(lns, { strokeDashoffset: 0, duration: 0.7, stagger: 0.03, ease: "power3.out" }, "-=0.45")
            .to(dts, { scale: 1, autoAlpha: 1, duration: 0.35, stagger: 0.02, ease: "back.out(1.2)" }, "-=0.4");
        }
        later(() => { tl2.scrollTrigger?.kill(); tl2.kill(); });
      });

      /* Section nav — appears when the top of Philosophy reaches the top of the screen, the section crossing the center line becomes the current one · the dot moves to that line in .6s */
      const nav = root.querySelector(".od-secnav"), tog = nav.querySelector(".od-secnav__toggle"), dot = nav.querySelector(".od-secnav__dot"), links = [...nav.querySelectorAll(".od-secnav__link")];
      const open = (v) => { nav.dataset.open = String(v); tog.setAttribute("aria-expanded", String(v)); };
      tog.addEventListener("click", () => open(nav.dataset.open !== "true"));
      links.forEach((a) => a.addEventListener("click", () => open(false)));
      const place = (a) => { let x = 0, y = 0; for (let e = a; e && e !== nav; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; } dot.style.setProperty("--x", `${x}px`); dot.style.setProperty("--y", `${y + (a.offsetHeight - dot.offsetHeight) / 2}px`); };
      const current = (a) => { links.forEach((l) => (l.dataset.current = String(l === a))); dot.dataset.active = String(!!a); if (a) place(a); };
      const sts = links.map((a) => {
        const sec = root.querySelector(a.getAttribute("href"));
        if (!sec) return null;
        const end = a.dataset.currentEnd && root.querySelector(`#${a.dataset.currentEnd}`);
        return ScrollTrigger.create({ trigger: sec, endTrigger: end || sec, start: "top center", end: "bottom center", onToggle: ({ isActive }) => (isActive ? current(a) : a.dataset.current === "true" && current(null)) });
      }).filter(Boolean);
      sts.push(ScrollTrigger.create({ trigger: root.querySelector("#philosophy"), start: "top top", onEnter: () => (nav.dataset.visible = "true"), onLeaveBack: () => { nav.dataset.visible = "false"; open(false); } }));
      const colorSts = [];
      const pick = () => { const a = colorSts.find((s) => s.isActive); nav.dataset.color = a ? a.trigger.dataset.headerColor : "green"; };
      root.querySelectorAll("[data-header-color]").forEach((el) => colorSts.push(ScrollTrigger.create({ trigger: el, start: "top bottom-=30", end: "bottom bottom-=30", onToggle: pick })));
      pick();
      later(() => [...sts, ...colorSts].forEach((s) => s.kill()));
    },
    destroy() {
      if (!S) return;
      S.kill.splice(0).reverse().forEach((f) => f());
      S = null;
    },
  };
})();
