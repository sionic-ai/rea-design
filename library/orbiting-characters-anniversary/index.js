// Landing motion. Original values: smooth scroll lerp .1, parallax (p×2-1)×-offset followed with lerp (promise card 100 · .09, building photo 50 · .05),
// The curve above the navy band swells by scroll speed/25 (the curve below the photo by /30) and settles at .1, staff note auto-advances every 5s,
// Each vision card follows its progress o at .08, with translateY((1-o)×screen height×.5) rotate(±30°×(1-o)) scale(1+.2×(1-o)).
(() => {
  gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, MorphSVGPlugin);
  const isSP = () => window.matchMedia("(max-width: 1023px)").matches;
  const clamp = gsap.utils.clamp(0, 1);
  const mm = gsap.matchMedia();

  mm.add({ ok: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { reduce } = ctx.conditions;

    /* ---------- Smooth scroll ---------- */
    let lenis = null;
    let velocity = 0;
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", (e) => {
        velocity = e.velocity;
        ScrollTrigger.update();
      });
      const raf = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }
    document.querySelector(".lp-footer__top").onclick = () => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }));
    document.querySelectorAll(".lp-drawer a[href^='#']").forEach((a) =>
      a.addEventListener("click", (e) => {
        if (!lenis) return;
        e.preventDefault();
        lenis.scrollTo(a.getAttribute("href"));
      })
    );

    /* ---------- Loading ---------- */
    const opening = document.querySelector(".lp-opening");
    if (reduce) opening.remove();
    else {
      setTimeout(() => opening.classList.add("enter"), 100);
      gsap.to(opening, { opacity: 0, duration: 1.5, ease: "power2.inOut", delay: 1.2, onComplete: () => opening.remove() });
    }

    /* ---------- Cursor — original values: follows the cursor position each frame at .1 and maps to -1~1 from screen center (CSS gets --mouse-x·y, three decimals).
       Original is for touch-enabled devices ("ontouchstart"·maxTouchPoints) the cursor is not listened to at all. Also turned off under reduced motion ---------- */
    const mouse = { tx: 0, ty: 0, x: 0, y: 0, nx: 0, ny: 0, cssX: 0, cssY: 0, seen: false };
    const useMouse = !reduce && !("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const onMouse = (e) => {
      mouse.tx = e.clientX; mouse.ty = e.clientY;
      if (!mouse.seen) { mouse.seen = true; mouse.x = e.clientX; mouse.y = e.clientY; }
    };
    const stepMouse = () => {
      if (!mouse.seen) return;
      mouse.x += (mouse.tx - mouse.x) * 0.1;
      mouse.y += (mouse.ty - mouse.y) * 0.1;
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      mouse.nx = (mouse.x - cx) / cx; mouse.ny = (mouse.y - cy) / cy;
      const x = Math.round(mouse.nx * 1e3) / 1e3, y = Math.round(mouse.ny * 1e3) / 1e3;
      if (x !== mouse.cssX) document.body.style.setProperty("--mouse-x", (mouse.cssX = x));
      if (y !== mouse.cssY) document.body.style.setProperty("--mouse-y", (mouse.cssY = y));
    };
    if (useMouse) {
      window.addEventListener("mousemove", onMouse);
      gsap.ticker.add(stepMouse);
    }

    /* ---------- Hero character stage — like the original, five painted panels on a three (r182) orthographic camera ----------
       Original values: advances every 5 seconds, the current panel moves to the front (z 10) with elastic.inOut(.4,1.8) 1.6s (first advance 1.28s), the rest go behind (z 0) blurred with power3.inOut 1.5s (1.2s),
       Between panels a white rounded panel (z 5, corner 50px) turns .6 opaque over .5s, delayed .55s after the first page turn by .5s. At first it spreads out from size 0 at the center with one rotation (1.6s).
       The panel shader is our own: when switching it mixes a wave distortion (strength .03 · frequency 2.5 · two turns) and blur. The picture bakes the person shape from shared.js into a texture */
    const GL = (() => {
      if (!window.THREE) return null;
      const stage = document.querySelector(".lp-stage");
      const canvas = document.createElement("canvas");
      canvas.className = "lp-gl";
      canvas.setAttribute("aria-hidden", "true");
      stage.insertBefore(canvas, stage.querySelector(".lp-hero-main"));
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true }); } catch (e) { canvas.remove(); return null; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);
      const Z = { ACTIVE: 10, BG: 5, INACTIVE: 0 };
      const vert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
      const frag = `
        uniform sampler2D tMap; uniform float uOpacity; uniform float uBlur; uniform float uWave; uniform float uWaveT; uniform float uSeed;
        varying vec2 vUv;
        vec4 tap(vec2 p){ return texture2D(tMap, clamp(p, 0.0, 1.0)); }
        void main(){
          vec2 uv = vUv;
          // Wave that arises only on slide change — vertical sine pushes horizontally, horizontal cosine pushes vertically
          float k = uWave * 0.03, ph = (uSeed + uWaveT * 2.0) * 6.2831;
          uv += vec2(sin(uv.y * 2.5 + ph), cos(uv.x * 2.5 + ph * 0.6)) * k;
          vec4 c = tap(uv);
          if (uBlur > 0.01) {
            // Blur spread over twelve points around a circle in two turns: the radius grows with blur strength and fully blends at 2
            vec4 acc = c; float n = 1.0; float r = uBlur * 0.006;
            for (int i = 0; i < 12; i++) {
              float a = float(i) * 0.5236;
              vec2 d = vec2(cos(a), sin(a));
              acc += tap(uv + d * r) + tap(uv + d * r * 2.0);
              n += 2.0;
            }
            c = mix(c, acc / n, smoothstep(0.0, 2.0, uBlur));
          }
          gl_FragColor = vec4(c.rgb * uOpacity, c.a * uOpacity);
        }`;
      const boxFrag = `
        uniform vec3 uColor; uniform float uOpacity; uniform vec2 uR; varying vec2 vUv;
        void main(){
          vec2 q = abs(vUv - 0.5) - (0.5 - uR);
          if (q.x > 0.0 && q.y > 0.0 && length(q / uR) > 1.0) discard;
          gl_FragColor = vec4(uColor * uOpacity, uOpacity);
        }`;
      const plane = new THREE.PlaneGeometry(1, 1);
      const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      const box = new THREE.Mesh(plane, new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: boxFrag, transparent: true, premultipliedAlpha: true, depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(MT.resolve("var(--kf-surface)")) }, uOpacity: { value: 0 }, uR: { value: new THREE.Vector2(0.1, 0.07) } } }));
      box.position.z = Z.BG;
      scene.add(box);
      const SEEDS = [3, 5, 8, 2, 6];
      const groups = SEEDS.map((seed, i) => {
        const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, transparent: true, premultipliedAlpha: true, depthWrite: false,
          uniforms: { tMap: { value: null }, uOpacity: { value: 1 }, uBlur: { value: 0 }, uWave: { value: 0 }, uWaveT: { value: 0 }, uSeed: { value: i * 0.37 } } });
        const mesh = new THREE.Mesh(plane, mat);
        mesh.position.z = Z.INACTIVE;
        scene.add(mesh);
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = 400; c.height = 480;
          c.getContext("2d").drawImage(img, 0, 0, 400, 480);
          const tex = new THREE.CanvasTexture(c);
          tex.premultiplyAlpha = true;
          tex.colorSpace = THREE.SRGBColorSpace;
          mat.uniforms.tMap.value = tex;
        };
        const svg = MT.resolve(MT.figure(i, seed)).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" ');
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        // x·y are the layer center (px) from the screen top-left, w is the layer width (px) — height is picture ratio 1.2
        return { mesh, mat, p: { x: 0, y: 0, w: 0 } };
      });
      let W = 1, H = 1;
      const resize = () => {
        W = stage.clientWidth; H = stage.clientHeight;
        renderer.setSize(W, H, false);
        camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
        camera.updateProjectionMatrix();
        const g = document.querySelector(".lp-glass").getBoundingClientRect(), s = stage.getBoundingClientRect();
        box.position.x = g.left - s.left + g.width / 2 - W / 2;
        box.position.y = H / 2 - (g.top - s.top + g.height / 2);
        box.scale.set(g.width, g.height, 1);
        box.material.uniforms.uR.value.set(50 / g.width, 50 / g.height);
      };
      const place = (o, x, y, w) => { o.mesh.position.x = x - W / 2; o.mesh.position.y = H / 2 - y; o.mesh.scale.set(w, w * 1.2, 1); };
      return { renderer, scene, camera, groups, box, resize, place, Z, render: () => renderer.render(scene, camera) };
    })();

    /* ---------- Hero character slideshow (five schools) → round orbit on scroll → scatter ---------- */
    const mains = [...document.querySelectorAll(".lp-hero-main__figs .fig")];
    const no = document.querySelector(".lp-hero-main__no");
    const dotNow = document.querySelector(".lp-hero-dots__now");
    const orbit = [...document.querySelectorAll(".lp-orbit-fig")];
    const ring = document.querySelector(".lp-ring");
    const heroSpots = [[0.03, 0.02], [0.84, 0.0], [0.05, 0.52], [0.86, 0.42], [0.3, -0.04]];
    const geo = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const u = isSP() ? w / 400 : w / 1440;
      const size = (isSP() ? 100 : 170) * u;
      return { w, h, u, size, cx: isSP() ? w * 0.5 : w * 0.36, cy: isSP() ? h * 0.36 : h * 0.5, r1: (isSP() ? 110 : 190) * u, r2: (isSP() ? 190 : 430) * u };
    };
    const at = (i, r, turn, g) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2 + turn;
      return { x: g.cx + Math.cos(a) * r - g.size / 2, y: g.cy + Math.sin(a) * r - g.size / 2 };
    };
    let slide = 0;
    const label = () => { no.textContent = String(slide + 1).padStart(2, "0"); dotNow.textContent = slide + 1; };
    const intro = gsap.timeline({
      scrollTrigger: { trigger: ".lp-intro", start: "top top", end: "bottom bottom", scrub: reduce ? false : 1, invalidateOnRefresh: true },
      defaults: { ease: "none" },
    });
    let timer = 0;
    if (GL) {
      document.querySelector(".lp-stage").classList.add("is-gl");
      GL.resize();
      // Paging spots: the current panel sits in the big center spot, the others in small four-corner spots (blurred)
      const mainSpot = () => {
        const r = document.querySelector(".lp-hero-main").getBoundingClientRect(), s = document.querySelector(".lp-stage").getBoundingClientRect();
        return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height * 0.52, w: geo().u * (isSP() ? 320 : 470) };
      };
      const layout = (i, active) => {
        if (i === active) return { ...mainSpot(), blur: 0 };
        const g = geo(), k = (i - active + 5) % 5 - 1;
        return { x: heroSpots[k][0] * g.w + g.size / 2, y: heroSpots[k][1] * g.h + g.size * 0.6, w: g.size, blur: 3 };
      };
      GL.groups.forEach((o, i) => Object.assign(o.p, layout(i, slide)));
      /* Cursor tilt (only on the slideshow stage) — original values: panel strength is 1 for the current panel, the others are .25×.5^(d-1) by ring distance d. Per-panel rotation x = Cursor x×.1, y = Cursor y×.3,
         z = Cursor x ×.05 (×strength), and the position moves by how much it follows cursor x ×-.1 · cursor y ×.05 (ratio of panel size) at .12 per frame (×strength). When advancing, the strength goes from the previous panel’s basis
         Moves over 1s easeOutCubic (from 0 at first), and when scrolling brings it into orbit, returns to 0 over .5s power2.out.
         The original panel (square — on large screens the current panel is 830 · distance 1 is 500~650 · distance 2 is 350~500, on narrow screens 420 · 250~300 · 200~220) is larger than the copy’s panel (470×564 · 170), so,
         The push computes px from the original board size (REACH, average per distance × unit). The original board has four layers (body 1 · parts .6 · .3 · .1) so strength differs per layer, but the copy board is one layer so it uses only the body strength 1 */
      const TILT = { rx: 0.1, ry: 0.3, rz: 0.05, ox: -0.1, oy: 0.05, ease: 0.12, back: 0.25, decay: 0.5, blend: 1000 };
      const REACH_PC = [830, 565, 395], REACH_SP = [420, 275, 210];
      const ringD = (from, i) => Math.min(Math.abs(i - from), 5 - Math.abs(i - from));
      const power = (from, i) => { const d = ringD(from, i); return d === 0 ? 1 : TILT.back * Math.pow(TILT.decay, d - 1); };
      const tilt = { on: false, live: false, snap: -1, t0: 0, from: [], fromD: [], sx: 0, sy: 0 };
      GL.groups.forEach((o) => { o.tilt = { rx: 0, ry: 0, rz: 0, ox: 0, oy: 0 }; });
      const stepTilt = (carousel) => {
        if (!carousel) {
          if (!tilt.live) return;
          tilt.live = false; tilt.sx = tilt.sy = 0;
          GL.groups.forEach((o) => gsap.to(o.tilt, { rx: 0, ry: 0, rz: 0, ox: 0, oy: 0, duration: 0.5, ease: "power2.out" }));
          return;
        }
        if (!tilt.live) { tilt.live = true; GL.groups.forEach((o) => gsap.killTweensOf(o.tilt)); }
        if (tilt.snap !== slide) {
          tilt.from = GL.groups.map((_, i) => (tilt.snap < 0 ? 0 : power(tilt.snap, i)));
          tilt.fromD = GL.groups.map((_, i) => ringD(tilt.snap < 0 ? slide : tilt.snap, i));
          tilt.t0 = performance.now(); tilt.snap = slide;
        }
        const REACH = isSP() ? REACH_SP : REACH_PC;
        const k = Math.min(1, (performance.now() - tilt.t0) / TILT.blend), e = 1 - Math.pow(1 - k, 3);
        tilt.sx += (mouse.nx * TILT.ox - tilt.sx) * TILT.ease;
        tilt.sy += (mouse.ny * TILT.oy - tilt.sy) * TILT.ease;
        GL.groups.forEach((o, i) => {
          const b = tilt.from[i] + e * (power(slide, i) - tilt.from[i]);
          const r = REACH[tilt.fromD[i]] + e * (REACH[ringD(slide, i)] - REACH[tilt.fromD[i]]);
          Object.assign(o.tilt, { rx: mouse.nx * TILT.rx * b, ry: mouse.ny * TILT.ry * b, rz: mouse.nx * TILT.rz * b, ox: tilt.sx * b * r, oy: tilt.sy * b * r });
        });
      };
      const st = { t: 0 };
      intro.to(st, { t: 3.5, duration: 3.5 }, 0);
      const go = (next, first = false) => {
        slide = next;
        label();
        GL.groups.forEach((o, i) => {
          const L = layout(i, slide), on = i === slide;
          o.mesh.position.z = on ? GL.Z.ACTIVE : GL.Z.INACTIVE;
          const dur = on ? (first ? 1.28 : 1.6) : first ? 1.2 : 1.5;
          gsap.to(o.p, { x: L.x, y: L.y, w: L.w, duration: dur, ease: on ? "elastic.inOut(0.4,1.8)" : "power3.inOut", overwrite: "auto" });
          gsap.to(o.p, { blur: L.blur, duration: 1.5, ease: "power3.inOut", overwrite: false });
          gsap.fromTo(o.mat.uniforms.uWaveT, { value: 0 }, { value: 1, duration: dur, ease: "none" });
          gsap.fromTo(o.mat.uniforms.uWave, { value: 0 }, { keyframes: [{ value: 1, duration: dur / 2, ease: "sine.out" }, { value: 0, duration: dur / 2, ease: "sine.in" }] });
        });
      };
      // Advance every 5 seconds — runs only at the top (scroll 0). Stops when scrolled down and restarts the count from the beginning on return
      const tick5 = () => { timer = gsap.delayedCall(5, () => { go((slide + 1) % 5); tick5(); }); };
      const pauseTimer = () => { if (timer) { timer.kill(); timer = 0; } };
      let started = reduce;
      ScrollTrigger.create({ trigger: ".lp-intro", start: "top top-=1", onEnter: pauseTimer, onLeaveBack: () => started && !reduce && !timer && tick5() });
      if (reduce) {
        GL.groups.forEach((o, i) => { o.mesh.position.z = i === slide ? GL.Z.ACTIVE : GL.Z.INACTIVE; });
        GL.box.material.uniforms.uOpacity.value = 0.6;
      } else {
        // First: from 0 size at the center, it spins once and spreads out to the round ring position (elastic.inOut(.4,1.8) 1.6s · size power2.inOut 1.5s),
        // Then the first transition (current panel 1.28s · the rest 1.2s) lands on the transition spot. The white panel starts .5s after the transition, delayed .55s, over .5s to .6
        const c0 = mainSpot(), g0 = geo();
        GL.groups.forEach((o, i) => { const r = at(i, g0.r1 * 1.4, 0, g0); o.home = { x: r.x + g0.size / 2, y: r.y + g0.size * 0.6, w: g0.size * 0.8 }; o.p.w = 0; o.p.x = c0.x; o.p.y = c0.y; o.p.blur = 0; o.spin = { p: 0 }; });
        gsap.delayedCall(1.1, () => {
          GL.groups.forEach((o, i) => {
            o.mesh.position.z = i === slide ? GL.Z.ACTIVE : GL.Z.INACTIVE;
            gsap.to(o.spin, { p: 1, duration: 1.6, ease: "elastic.inOut(0.4,1.8)", onUpdate: () => {
              const a = -Math.PI * 2 * o.spin.p, dx = (o.home.x - c0.x) * o.spin.p, dy = (o.home.y - c0.y) * o.spin.p;
              o.p.x = c0.x + dx * Math.cos(a) - dy * Math.sin(a);
              o.p.y = c0.y + dx * Math.sin(a) + dy * Math.cos(a);
            } });
            gsap.to(o.p, { w: o.home.w, duration: 1.5, ease: "power2.inOut" });
          });
          gsap.delayedCall(1.6, () => {
            gsap.delayedCall(0.5, () => gsap.to(GL.box.material.uniforms.uOpacity, { value: 0.6, duration: 0.5, delay: 0.55, ease: "power2.out" }));
            go(slide, true);
            tilt.on = true;
            gsap.delayedCall(1.28, () => { started = true; if (window.scrollY < 1) tick5(); });
          });
        });
      }
      const lerp = (a, b, k) => a + (b - a) * k;
      const draw = () => {
        const t = st.t, g = geo(), boxO = GL.box.material.uniforms.uOpacity;
        if (useMouse) stepTilt(tilt.on && t < 0.001);
        GL.groups.forEach((o, i) => {
          let { x, y, w, blur } = o.p;
          if (t > 0) {
            const r0 = at(i, g.r1, 0, g), sz = g.size;
            const ring0 = { x: r0.x + sz / 2, y: r0.y + sz * 0.6 };
            if (t <= 1) { x = lerp(x, ring0.x, t); y = lerp(y, ring0.y, t); w = lerp(w, sz * 0.72, t); blur = lerp(blur, 0, t); }
            else if (t <= 2.2) { const r = at(i, g.r1, 0.9 * (t - 1) / 1.2, g); x = r.x + sz / 2; y = r.y + sz * 0.6; w = sz * 0.72; blur = 0; }
            else {
              const k = (t - 2.2) / 1.3, a = at(i, g.r1, 0.9, g), b = at(i, g.r2, 1.4, g);
              x = lerp(a.x, b.x, k) + sz / 2; y = lerp(a.y, b.y - g.h * 0.15, k) + sz * 0.6; w = lerp(sz * 0.72, sz * 0.9, k); blur = 0;
            }
          }
          GL.place(o, x, y, w);
          const T = o.tilt;
          o.mesh.rotation.set(T.rx, T.ry, T.rz);
          o.mesh.position.x += T.ox * g.u;
          o.mesh.position.y += T.oy * g.u;
          o.mat.uniforms.uBlur.value = blur;
        });
        // White slabs are cleared away together while gathering into orbit (until .6)
        GL.box.visible = t < 0.6;
        const keep = boxO.value;
        boxO.value = keep * (1 - gsap.utils.clamp(0, 1, t / 0.6));
        GL.render();
        boxO.value = keep;
      };
      gsap.ticker.add(draw);
      window.addEventListener("resize", GL.resize);
      label();
    } else {
      // Without WebGL, follow the same path with a DOM drawing
      timer = reduce ? 0 : setInterval(() => {
        mains[slide].classList.remove("is-on");
        slide = (slide + 1) % mains.length;
        mains[slide].classList.add("is-on");
        label();
      }, 5000);
      orbit.forEach((el, i) => {
        intro.fromTo(el,
          { x: () => heroSpots[i][0] * geo().w, y: () => heroSpots[i][1] * geo().h, scale: 1 },
          { x: () => at(i, geo().r1, 0, geo()).x, y: () => at(i, geo().r1, 0, geo()).y, scale: 0.72, duration: 1 }, 0)
          .to(el, { x: () => at(i, geo().r1, 0.9, geo()).x, y: () => at(i, geo().r1, 0.9, geo()).y, duration: 1.2 }, 1)
          .to(el, { x: () => at(i, geo().r2, 1.4, geo()).x, y: () => at(i, geo().r2, 1.4, geo()).y - geo().h * 0.15, scale: 0.9, duration: 1.3 }, 2.2);
      });
    }
    intro.fromTo(ring, { x: () => geo().cx - ring.offsetWidth / 2, y: () => geo().cy - ring.offsetHeight / 2, opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.8 }, 0.3)
      .to(ring, { opacity: 0, scale: 1.4, duration: 0.8 }, 2.6)
      .to([".lp-glass", ".lp-hero-main"], { opacity: 0, scale: 0.85, duration: 0.6 }, 0)
      .to([".lp-hero-title", ".lp-hero-caption", ".lp-hero-scroll", ".lp-hero-dots"], { opacity: 0, y: -30, duration: 0.5 }, 0)
      .to(".lp-stage .blob", { y: (i) => (i % 2 ? -1 : 1) * 120, duration: 3.5 }, 0);

    /* ---------- Parallax (follows via lerp) ---------- */
    const parallaxes = [];
    const addParallax = (container, el, lerp, offset) => {
      const st = ScrollTrigger.create({ trigger: container, start: "top bottom", end: "bottom top" });
      parallaxes.push({ st, el, lerp, offset, p: 0.5 });
    };
    addParallax(".lp-mission__card", document.querySelector(".lp-mission__card-in"), 0.09, isSP() ? 50 : 100);
    addParallax(".lp-divimg", document.querySelector(".lp-divimg__img"), 0.05, 50);

    /* ---------- Curve that swells with speed ---------- */
    // Same MorphSVG as the original — holds the two shapes as a paused tween and moves only progress by a velocity share
    const morph = (el, from, to, div) => {
      el.setAttribute("d", from);
      const tw = gsap.fromTo(el, { morphSVG: from }, { morphSVG: to, ease: "none", paused: true });
      return { tw, div, p: 0 };
    };
    const curves = [
      ...[...document.querySelectorAll(".lp-divider path")].map((p) =>
        morph(p, "M725 60C1054 60 1315 110 1440 170V247H0V170C134 110 396 60 725 60Z", "M725 0C1054 0 1315.22 79.5 1440 151.539V247H0V151.539C134 74.17 396 0 725 0Z", 25)),
      morph(document.querySelector(".lp-divimg__curve path"),
        "M715 700C386 700 124.775 660 0 620.461V772L1440 772V620.461C1306 660 1044 700 715 700Z",
        "M715 760C386 760 124.775 700 0 560V772L1440 772V560C1306 700 1044 760 715 760Z", 30),
    ];

    /* ---------- Vision Card ---------- */
    const vin = document.querySelector(".lp-vision__in");
    const cards = [...document.querySelectorAll(".vision-card")];
    const inner = cards.map((c) => c.firstElementChild);
    const vp = new Array(cards.length).fill(0);
    const ind = document.querySelector(".lp-vision__ind i");
    const now = document.querySelector(".lp-vision__now");
    const box = document.querySelector(".lp-vision__cards");
    const vst = ScrollTrigger.create({ trigger: vin, start: "top top", end: "bottom bottom" });

    const tick = () => {
      parallaxes.forEach((o) => {
        o.p += (clamp(o.st.progress) - o.p) * (reduce ? 1 : o.lerp);
        o.el.style.transform = `translate3d(0, ${(o.p * 2 - 1) * -o.offset}px, 0)`;
      });
      const v = Math.abs(velocity);
      velocity *= 0.9;
      curves.forEach((c) => {
        c.p += (clamp(v / c.div) - c.p) * 0.1;
        c.tw.progress(c.p);
      });
      const P = vst.progress;
      const half = window.innerHeight * 0.5;
      let n = 0;
      cards.forEach((c, i) => {
        const target = clamp((P * 1.15 - i / cards.length) * cards.length);
        vp[i] += (target - vp[i]) * (reduce ? 1 : 0.08);
        const o = vp[i];
        n += o;
        inner[i].style.transform = `translate3d(0, ${(1 - o) * half}px, 0) rotate(${(i % 2 ? -1 : 1) * 30 * (1 - o)}deg) scale(${1 + 0.2 * (1 - o)})`;
        c.style.opacity = o < 0.01 ? 0 : 1;
      });
      n = clamp(n / cards.length);
      ind.style.transform = `scaleY(${n})`;
      if (!isSP()) box.style.transform = `translate3d(0, ${n * -200}px, 0)`;
      now.textContent = Math.min(Math.floor(n * cards.length) + 1, cards.length);
    };
    gsap.ticker.add(tick);

    /* ---------- Timeline drag ---------- */
    const track = document.querySelector(".lp-tl__track");
    const drag = Draggable.create(track, {
      type: "x",
      bounds: { minX: () => Math.min(0, window.innerWidth - track.scrollWidth), maxX: 0 },
      edgeResistance: 0.85,
      inertia: true,
    })[0];
    const fitBounds = () => drag.applyBounds({ minX: Math.min(0, window.innerWidth - track.scrollWidth), maxX: 0 });
    window.addEventListener("resize", fitBounds);

    /* ---------- Staff notes: 6 per sheet (phone 2), flips every 5s, a bar fills with the elapsed time ---------- */
    const grid = document.querySelector(".lp-voices__grid");
    [...grid.children].forEach((n, i) => {
      const c = n.cloneNode(true);
      c.querySelector("p").textContent = String(i + 7).padStart(2, "0");
      c.style.setProperty("--r", `${-parseFloat(n.style.getPropertyValue("--r"))}deg`);
      grid.appendChild(c);
    });
    const notes = [...grid.children];
    const bar = document.querySelector(".lp-voices__bar");
    const vNow = document.querySelector(".lp-voices__now");
    const vTotal = document.querySelector(".lp-voices__total");
    let page = 0;
    let touched = false;
    const per = () => (isSP() ? 2 : 6);
    const pages = () => Math.ceil(notes.length / per());
    // Overlaps in the same cell on each page — 3 columns 2 rows on large screens, 2 columns 1 row on phones
    notes.forEach((n, i) => {
      n.style.setProperty("--pc-col", (i % 6) % 3 + 1);
      n.style.setProperty("--pc-row", Math.floor((i % 6) / 3) + 1);
      n.style.setProperty("--sp-col", (i % 2) + 1);
      n.style.setProperty("--sp-row", 1);
    });
    const show = () => {
      const s = page * per();
      notes.forEach((n, i) => {
        const on = i >= s && i < s + per();
        if (on) n.removeAttribute("aria-hidden");
        else n.setAttribute("aria-hidden", "true");
      });
      vNow.textContent = page + 1;
      vTotal.textContent = pages();
    };
    const auto = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 5, ease: "none", repeat: -1, paused: true, onRepeat: () => { page = (page + 1) % pages(); show(); } });
    ScrollTrigger.create({ trigger: ".lp-voices", start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive && !touched && !reduce ? auto.play() : auto.pause()) });
    document.querySelectorAll(".lp-voices__btn").forEach((b) =>
      b.addEventListener("click", () => {
        touched = true;
        auto.pause();
        page = (page + Number(b.dataset.dir) + pages()) % pages();
        show();
      })
    );
    show();

    /* ---------- Menu button is white over the navy band ---------- */
    const menuBtn = document.querySelector(".lp-menu-btn");
    const navy = new Set();
    document.querySelectorAll(".lp-history__in, .lp-vision__in, .lp-closing, .lp-footer").forEach((el) =>
      ScrollTrigger.create({
        trigger: el, start: "top 60px", end: "bottom 60px",
        onToggle: (st) => { st.isActive ? navy.add(el) : navy.delete(el); menuBtn.classList.toggle("is-white", navy.size > 0); },
      })
    );

    return () => {
      if (timer && timer.kill) timer.kill(); else clearInterval(timer);
      gsap.ticker.remove(tick);
      gsap.ticker.remove(stepMouse);
      window.removeEventListener("mousemove", onMouse);
      document.body.style.removeProperty("--mouse-x");
      document.body.style.removeProperty("--mouse-y");
      window.removeEventListener("resize", fitBounds);
      lenis?.destroy();
    };
  });
})();
