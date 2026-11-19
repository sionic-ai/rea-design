// Home: adds the taxi exhaust ribbon (hero) · section title band (SERVICE·ABOUT) shaders to the shared canvas, and hooks up entrance order, pinning and slider.
// Original values (PC/phone): taxi 125vw→0 1.7s/1s sine.inOut (opacity .6/.4) · ribbon 2.5s/1.75s sine.out after 1s/.3s (straight length 1→.2/.4 · spread 0→1/.55) ·
// Slogan 3s/1.5s (.5 power1.out + 50%→0 .7 power2.out) · vertical title 4s/2.25s circ.out 1.3s/1s (line gap .77×length/line count, bar is 1.54×length with .5×length) ·
// After the first scroll the taxi moves 0→-50vw 2s power1.inOut · ribbon line thickness 14/900 · gap 5/900 of screen height · tilt blue -.55/-.6 red -.2/-.3 yellow .07/.2 rad ·
// Wave frequency 3.9/5.3 strength .18/.3 · section title taxi 0→150vw 1.7s/1s sine.out (at 75% of the screen), after .7s the line becomes three bands (height 30%, -25%·0·+25%) over 1.5s sine.out.
(() => {
  const SW = window.SW;
  const { reduced, isPc } = SW;
  const kv = document.querySelector("[data-kv]");
  const kvTaxi = kv.querySelector("[data-taxi]");
  const kvTitle = kv.querySelector("[data-kv-title]");
  const copies = [...kv.querySelectorAll("[data-kv-copy]")];
  const head = [...document.querySelectorAll("[data-head], .sw-logo, .sw-menu-top")];

  const KV_FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uSize;
    uniform float uTime, uLeft, uLineY, uXOff, uProg, uFreq, uAmount, uTiltB, uTiltR, uTiltY, uGradEnd, uStretch;
    uniform vec4 uStops;
    uniform vec3 cBlue, cPurple, cRed, cOrange, cYellow;
    ${SW.NOISE}
    vec2 rot(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
    // One line: past the straight length behind the taxi (uXOff) it tilts and undulates with noise, thickening by power the farther it goes — units are screen width
    float ribbon(vec2 p, float y, float seed, float tilt) {
      float W = uSize.x;
      float lw = 7.0 / 900.0 * uSize.y;
      float x = (p.x - uLeft) / W - uXOff;
      float s = smoothstep(0.0, 0.3, x);
      float a = tilt * s * step(0.0, x);
      vec2 o = vec2(uLeft + uXOff * W, y);
      vec2 q = rot(p - o, a) + o;
      float x2 = (q.x - o.x) / W;
      float wave = swNoise(vec3(1.0 + x2 * uFreq - uTime * 0.5, uTime * 0.1, seed + tilt)) * smoothstep(0.0, 0.5, x2) * 0.5 * uAmount;
      float grow = pow(max(x2 * 1.5, 0.0), 2.5) * 0.25 * (1.0 + s * abs(tilt / 1.5707963) * 1.5);
      float d = abs(y + wave * uProg * W - q.y) - grow * uProg * W * uStretch;
      return smoothstep(lw, lw - 1.0, d);
    }
    vec3 grad5(float t) {
      vec3 c = mix(cYellow, cOrange, smoothstep(uStops.x * 0.0, uStops.x, t));
      c = mix(c, cRed, smoothstep(uStops.x, uStops.y, t));
      c = mix(c, cPurple, smoothstep(uStops.y, uStops.z, t));
      return mix(c, cBlue, smoothstep(uStops.z, uStops.w, t));
    }
    void main() {
      vec2 p = vUv * uSize;
      float W = uSize.x, step_ = 19.0 / 900.0 * uSize.y;
      float y0 = uLineY, y1 = y0 + step_, y2 = y1 + step_;
      float a0 = uTiltY * uProg, a1 = uTiltR * uProg, a2 = uTiltB * uProg;
      float m0 = ribbon(p, y0, 0.0, a0);
      float m1 = ribbon(p, y1, 1234.5, a1);
      float m2 = ribbon(p, y2, 9012.3, a2);
      vec3 col = vec3(1.0);
      col = mix(col, cBlue, m2); col = mix(col, cRed, m1); col = mix(col, cYellow, m0);
      col = mix(col, cPurple, m1 * m2); col = mix(col, cOrange, m0 * m1);
      // The further it goes, the line color shifts via an angular gradient (yellow → blue)
      vec2 c = vec2(uLeft + uXOff * W, y0);
      vec2 d = p - c;
      float ang = atan(d.y, d.x);
      float t = smoothstep(a0 * -6.0, a2 * -2.0, ang);
      float gm = smoothstep(0.3 * W, uGradEnd * W, length(d)) * smoothstep(c.x, c.x + 0.2 * W, p.x);
      col = mix(col, grad5(t), gm);
      float alpha = min(m0 + m1 + m2, 1.0) * smoothstep(uLeft, uLeft + 0.2 * W, p.x);
      gl_FragColor = vec4(col, alpha);
    }`;

  const TITLE_FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uSize;
    uniform float uTime, uRear, uXOff, uProg, uMorph, uSeed;
    uniform vec3 cBlue, cPurple, cRed, cOrange, cYellow;
    ${SW.NOISE}
    // The line trailing behind the taxi swells into a 30%-height band according to uMorph, and the band’s top and bottom edges wobble with the same noise as the wave panel
    float band(vec2 p, float yFrom, float yTo, float seed, float tilt) {
      float W = uSize.x, H = uSize.y;
      float back = (uRear - p.x) / W;
      float tp = clamp(uMorph + pow(clamp(back, 0.0, 1.0), 1.5) * uMorph * 0.75, 0.0, 1.0);
      float lw = mix(14.0 / 900.0 * H, 0.3 * H, tp) * 0.5;
      float y = mix(yFrom, yTo, tp) * H;
      float x = back - uXOff;
      float s = smoothstep(0.0, 0.3, x);
      float lineWave = swNoise(vec3(1.0 + x * 3.9 - uTime * 0.5, uTime * 0.1, seed)) * smoothstep(0.0, 0.5, x) * 0.09 * uProg * W;
      float lineTilt = tan(tilt * uProg * s) * max(x, 0.0) * W;
      float a = 0.01 * W * tp;
      float xn = p.x / W * 3.0 - uTime * 0.4;
      float top = y + lw - a + swNoise(vec3(xn, uTime * 0.2, seed + 7.0)) * a;
      float bot = y - lw + a - swNoise(vec3(xn, uTime * 0.2, seed + 77.0)) * a;
      float cy = p.y - (lineWave + lineTilt) * (1.0 - tp);
      return smoothstep(top + 0.5, top - 0.5, cy) * smoothstep(bot - 0.5, bot + 0.5, cy);
    }
    void main() {
      vec2 p = (vUv - vec2(0.0, 0.5)) * uSize;
      float H = uSize.y, gap = (14.0 + 5.0) / 900.0;
      float m0 = band(p, 0.0, -0.25, uSeed, 0.07);
      float m1 = band(p, gap, 0.0, uSeed + 1234.5, -0.2);
      float m2 = band(p, gap * 2.0, 0.25, uSeed + 5678.9, -0.55);
      vec3 col = vec3(1.0);
      col = mix(col, cBlue, m2); col = mix(col, cRed, m1); col = mix(col, cYellow, m0);
      col = mix(col, cPurple, m1 * m2); col = mix(col, cOrange, m0 * m1);
      float behind = smoothstep(0.0, 0.1, (uRear - p.x) / uSize.x);
      gl_FragColor = vec4(col, min(m0 + m1 + m2, 1.0) * behind);
    }`;

  const colorUniforms = () => {
    const [b, pu, r, o, y] = SW.palette();
    return { cBlue: { value: new THREE.Color(...b) }, cPurple: { value: new THREE.Color(...pu) }, cRed: { value: new THREE.Color(...r) }, cOrange: { value: new THREE.Color(...o) }, cYellow: { value: new THREE.Color(...y) } };
  };
  const recolorOf = (u) => () => { const [b, pu, r, o, y] = SW.palette(); u.cBlue.value.setRGB(...b); u.cPurple.value.setRGB(...pu); u.cRed.value.setRGB(...r); u.cOrange.value.setRGB(...o); u.cYellow.value.setRGB(...y); };

  let kvU = null;
  const titles = [...document.querySelectorAll("[data-sec-title]")].map((el) => ({ el, bg: el.querySelector("[data-sec-bg]"), taxi: el.querySelector("[data-sec-taxi]"), u: null, tween: null }));

  SW.ready.push(() => {
    const gl = SW.gl;
    if (!gl.ok) return;
    // ── Hero ribbon layer: covers the whole screen, and when the vertical title releases from pinned it rises by the same amount ──
    kvU = Object.assign({
      uSize: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uLeft: { value: -9999 }, uLineY: { value: 0 },
      uXOff: { value: 1 }, uProg: { value: 0 }, uFreq: { value: 3.9 }, uAmount: { value: 0.18 },
      uTiltB: { value: -0.55 }, uTiltR: { value: -0.2 }, uTiltY: { value: 0.07 }, uGradEnd: { value: 0.7 }, uStretch: { value: 1 },
      uStops: { value: new THREE.Vector4(0.25, 0.5, 0.75, 1) }
    }, colorUniforms());
    const tuneKv = () => {
      const pc = isPc();
      kvU.uFreq.value = pc ? 3.9 : 5.3; kvU.uAmount.value = pc ? 0.18 : 0.3;
      kvU.uTiltB.value = pc ? -0.55 : -0.6; kvU.uTiltR.value = pc ? -0.2 : -0.3; kvU.uTiltY.value = pc ? 0.07 : 0.2;
      kvU.uGradEnd.value = pc ? 0.7 : 1; kvU.uStretch.value = pc ? 1 : 3.2; kvU.uStops.value.set(pc ? 0.25 : 0.17, pc ? 0.5 : 0.42, pc ? 0.75 : 0.7, 1);
    };
    tuneKv();
    const kvMesh = new THREE.Mesh(gl.geo, new THREE.ShaderMaterial({ transparent: true, depthTest: false, uniforms: kvU, vertexShader: SW.VERT, fragmentShader: KV_FRAG }));
    kvMesh.renderOrder = 50;
    gl.add({
      mesh: kvMesh,
      update(t) {
        const W = innerWidth, H = innerHeight;
        let shift;
        if (isPc()) {
          const top = kvTitle.getBoundingClientRect().top, hold = Math.floor((269 / 900) * H);
          shift = Math.max(0, hold - top);
        } else shift = scrollY;
        kvMesh.visible = shift < H * 2;
        kvMesh.scale.set(W, H, 1);
        kvMesh.position.set(0, shift, 0);
        kvU.uSize.value.set(W, H);
        kvU.uTime.value = t;
        const tr = kvTaxi.getBoundingClientRect();
        kvU.uLeft.value = tr.left;
        // On PC, 160/900 of the height up from the screen bottom, on phone, the taxi bottom (add the scroll since it is based on the fixed layer)
        kvU.uLineY.value = isPc() ? (160 / 900) * H : H - (tr.bottom + shift) + 0;
      },
      recolor: recolorOf(kvU)
    });
    SW.isPcChange = tuneKv;
    matchMedia("(min-width: 768px)").addEventListener("change", tuneKv);

    // ── Section title band ──
    titles.forEach((ti, i) => {
      ti.u = Object.assign({ uSize: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uRear: { value: -9999 }, uXOff: { value: 0.5 }, uProg: { value: 0.3 }, uMorph: { value: 0 }, uSeed: { value: Math.random() * 99 } }, colorUniforms());
      const mesh = new THREE.Mesh(gl.geo, new THREE.ShaderMaterial({ transparent: true, depthTest: false, uniforms: ti.u, vertexShader: SW.VERT, fragmentShader: TITLE_FRAG }));
      mesh.renderOrder = 40 + i;
      gl.add({
        mesh,
        update(t) {
          const r = gl.place(mesh, ti.bg);
          if (!r) return;
          ti.u.uSize.value.set(r.width, r.height);
          ti.u.uTime.value = t;
          ti.u.uRear.value = ti.taxi.getBoundingClientRect().left - r.left;
        },
        recolor: recolorOf(ti.u)
      });
    });
  });

  // ── Entrance order ──
  const titleRows = [...kvTitle.querySelectorAll("[data-row]")];
  const titleBars = [...kvTitle.querySelectorAll("[data-bar]")];
  const copyLines = copies.flatMap((c) => [...c.querySelectorAll("[data-copy-line]")]);
  let intro = null, scrolled = false, frameout = null;
  const enterTaxi = (dur) => {
    const tl = gsap.timeline();
    tl.fromTo(kvTaxi, { opacity: 0 }, { opacity: 1, duration: isPc() ? 0.6 : 0.4, ease: "sine.inOut" }, 0);
    tl.fromTo(kvTaxi, { x: isPc() ? "125vw" : "120vw" }, { x: "0vw", duration: dur, ease: "sine.inOut" }, 0);
    return tl;
  };
  const enterWave = (dur) => {
    const tl = gsap.timeline();
    if (!kvU) return tl;
    tl.fromTo(kvU.uXOff, { value: 1 }, { value: isPc() ? 0.2 : 0.4, duration: 0.8 * dur, ease: "sine.out" }, 0);
    tl.fromTo(kvU.uProg, { value: 0 }, { value: isPc() ? 1 : 0.55, duration: dur, ease: "sine.out" }, 0);
    return tl;
  };
  const enterCopy = () => {
    const tl = gsap.timeline();
    copies.forEach((c) => tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, 0));
    if (isPc()) tl.fromTo(copyLines, { yPercent: 50 }, { yPercent: 0, duration: 0.7, ease: "power2.out" }, 0);
    return tl;
  };
  const enterTitle = (dur) => {
    const tl = gsap.timeline();
    const h = kvTitle.clientHeight;
    tl.fromTo(titleRows, { autoAlpha: 0, y: 0.2 * h }, { autoAlpha: 1, y: 0, duration: dur, ease: "circ.out", stagger: (0.77 * dur) / titleRows.length }, 0);
    tl.fromTo(titleBars, { scaleY: 0 }, { scaleY: 1, duration: 0.5 * dur, ease: "circ.out" }, 1.54 * dur);
    return tl;
  };
  const enterHead = () => gsap.to(head, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
  const doFrameout = () => {
    if (frameout || !isPc() || reduced) return;
    gsap.killTweensOf(kvTaxi);
    frameout = gsap.fromTo(kvTaxi, { x: "0vw" }, { x: "-50vw", duration: 2, ease: "power1.inOut", onComplete: () => gsap.set(kvTaxi, { opacity: 0 }) });
  };

  const finalState = () => {
    gsap.set(kvTaxi, { x: 0, opacity: 1 });
    if (kvU) { kvU.uXOff.value = isPc() ? 0.2 : 0.4; kvU.uProg.value = isPc() ? 1 : 0.55; }
    gsap.set(copies, { autoAlpha: 1 });
    gsap.set([...titleRows, ...head], { autoAlpha: 1 });
  };

  const setDefaults = () => {
    gsap.set(kvTaxi, { x: "120vw", opacity: 0 });
    gsap.set(copies, { autoAlpha: 0 });
    gsap.set(copyLines, { yPercent: 50 });
    gsap.set(titleRows, { autoAlpha: 0 });
    gsap.set(titleBars, { transformOrigin: "top center", scaleY: 0 });
    gsap.set(head, { autoAlpha: 0 });
  };

  addEventListener("scroll", () => {
    if (scrolled) return;
    scrolled = true;
    if (intro && intro.isActive() && intro.time() > 3.5) doFrameout();
  }, { passive: true });

  setDefaults();
  document.addEventListener("sw:loaded", () => {
    if (reduced) { finalState(); return; }
    const tl = (intro = gsap.timeline());
    if (isPc()) {
      tl.add(enterTaxi(1.7), 0).add(enterWave(2.5), 1).add(() => { if (scrolled) doFrameout(); }, 3.5)
        .add(enterCopy(), 3).add(enterTitle(1.3), 4).add(enterHead(), 4);
    } else {
      tl.add(enterTaxi(1), 0).add(enterWave(1.75), 0.3).add(enterCopy(), 1.5).add(enterTitle(1), 2.25).add(enterHead(), 2.25);
    }
  });

  // ── Vertical title and taxi pinned (PC): while the three intro lines scroll past ──
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px)", () => {
    const pinArea = document.querySelector("[data-intro-pin]");
    const end = () => "bottom " + (kvTitle.offsetTop + kvTitle.offsetHeight) + "px";
    ScrollTrigger.create({ trigger: pinArea, pin: kvTitle, pinSpacing: false, start: "top top", end });
    ScrollTrigger.create({ trigger: pinArea, pin: kvTaxi, pinSpacing: false, start: "top top", end });
  });

  // ── Section title taxi: crosses once when it reaches 75% of the screen, and .7s later the row becomes a band ──
  titles.forEach((ti) => {
    const run = () => {
      const pc = isPc();
      const tl = gsap.timeline();
      tl.fromTo(ti.taxi, { x: "0vw" }, { x: "150vw", duration: pc ? 1.7 : 1, ease: "sine.out" }, 0);
      if (ti.u) {
        tl.fromTo(ti.u.uXOff, { value: 0.5 }, { value: -0.5, duration: 1.5, ease: "sine.out" }, 0.7);
        tl.fromTo(ti.u.uProg, { value: 0.3 }, { value: 0, duration: 1.5, ease: "sine.out" }, 0.7);
        tl.fromTo(ti.u.uMorph, { value: 0 }, { value: 1, duration: 1.5, ease: "sine.out" }, 0.7);
      }
      return tl;
    };
    if (reduced) {
      SW.ready.push(() => { gsap.set(ti.taxi, { x: "150vw" }); if (ti.u) { ti.u.uXOff.value = -0.5; ti.u.uProg.value = 0; ti.u.uMorph.value = 1; } });
      return;
    }
    ScrollTrigger.create({ trigger: ti.el, start: "top 75%", once: true, onEnter: () => { ti.tween = run(); } });
  });

  // ── Card slider (splide 4.1): fixed 20rem width, one at a time, dismantled on phones into a two-column grid ──
  document.querySelectorAll("[data-slider]").forEach((root) => {
    const bar = root.querySelector("[data-progress]");
    const s = new Splide(root, {
      fixedWidth: "20rem", perPage: 3, perMove: 1, arrows: true, pagination: false,
      padding: { left: "calc((100% - 80rem) / 2)", right: "calc((100% - 80rem) / 2)" },
      breakpoints: { 767: { destroy: "completely" } }
    });
    const move = () => {
      if (!bar || !s.Components.Controller) return;
      const end = s.Components.Controller.getEnd() + 1;
      gsap.to(bar, { x: Math.min((s.index + 1) / end, 1) * 100 + "%", duration: 0.2, ease: "power2.out" });
    };
    s.on("mounted move", move);
    s.mount();
  });
})();
