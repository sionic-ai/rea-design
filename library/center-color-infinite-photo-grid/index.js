/* First page — lays an infinite horizontal photo grid as DOM and overlays a WebGL plate on each cell.
   Panel: monochrome, .2 opacity ↔ color (hoverN), color bleeds through a noise circle around the mouse, the panel bends in z by scroll force.
   Post-processing: the screen bends along a tan curve by the scroll force (.15), and in full mode the edges darken 80%. Values are exactly as in the original bundle. */
(() => {
  const PY = window.PY;

  const VERT = `
    varying vec2 vUv;
    uniform float pw;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.z = pw * 5.0 * p.x;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FRAG = `
    varying vec2 vUv;
    uniform sampler2D tA;
    uniform sampler2D noise;
    uniform float hoverN;
    uniform float opacityN;
    uniform float uTime;
    uniform float radius;
    uniform float mode;
    uniform vec2 vUvScale;
    uniform vec2 uMouse;
    uniform vec2 uRes;
    void main() {
      vec2 uv = (vUv - 0.5) * vUvScale + 0.5;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
      vec2 wob = uv + vec2(sin(uv.y * 50.0 + uTime), cos(uv.x * 50.0 + uTime)) * 0.001;
      vec4 base = texture2D(tA, uv);
      float g = (base.r + base.g + base.b) / 3.0;
      vec4 lit = texture2D(tA, wob);
      vec4 inFull = vec4(lit.rgb + 0.01, lit.a);
      vec4 inGrid = vec4(lit.rgb + 0.05, lit.a);
      vec2 st = gl_FragCoord.xy / uRes - 0.5;
      st.y *= uRes.y / uRes.x;
      vec2 m = uMouse - 0.5;
      m.y *= uRes.y / uRes.x;
      vec2 d = st - m;
      float far = smoothstep(radius, radius * (40.0 + hoverN * 40.0 + mode * 300.0 * hoverN), length(d));
      float n = texture2D(noise, vUv + d * (1.0 - far * 0.5) * 0.2).r;
      float near = step(far, n);
      vec4 rest = mix(vec4(g, g, g, opacityN), base, hoverN);
      gl_FragColor = mix(rest, mix(inGrid, inFull, mode), near);
    }`;
  const POST = `
    uniform sampler2D tDiffuse;
    uniform float scrollPow;
    uniform float modeChangePow;
    uniform float mode;
    uniform float device;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      vec2 twist = uv;
      twist.y -= tan((uv.x - 0.5) * 3.14159 * 0.9) * 0.15;
      vec2 twist2 = uv;
      float a2 = (uv.x - 0.5) * 3.14159;
      float b = smoothstep(0.2, 0.8, uv.x);
      twist2.y += tan(a2) * -0.002 * (1.0 - b);
      twist2.y -= tan(a2) * -0.002 * b;
      vec2 depth = uv;
      float e = smoothstep(0.0, 0.2, uv.x) - smoothstep(0.8, 1.0, uv.x);
      depth.y -= (e - 1.0) * 0.025;
      vec2 speedFx = mix(uv, twist, scrollPow * 0.5);
      vec2 modeFx = mix(speedFx, uv, mode);
      vec2 trans = mix(modeFx, mix(depth, twist, 0.5), modeChangePow);
      vec2 dev = mix(modeFx, twist2, device);
      vec2 f = mix(dev, trans, modeChangePow);
      float edge = clamp(smoothstep(0.3, 0.0, uv.x) + smoothstep(0.7, 1.0, uv.x), 0.0, 1.0);
      vec4 c = texture2D(tDiffuse, f);
      gl_FragColor = mix(c, c * (1.0 - edge * 0.8), mode);
    }`;

  let S = null;

  const build = (root) => {
    const data = JSON.parse(root.querySelector("[data-photos]").textContent);
    const keys = Object.keys(data);
    const content = root.querySelector(".py-home__content");
    const probe = document.createElement("div");
    probe.className = "py-col"; probe.style.visibility = "hidden"; probe.style.position = "absolute";
    content.append(probe);
    const cs = getComputedStyle(probe);
    const secW = 2 * (probe.offsetWidth + parseFloat(cs.marginLeft) * 2);
    probe.remove();
    const reps = Math.max(1, Math.ceil((2.5 * innerWidth) / secW / keys.length));
    let n = 0;
    for (let r = 0; r < reps; r++) {
      keys.forEach((k) => {
        const sec = document.createElement("section");
        sec.className = "py-sec";
        sec.dataset.category = k;
        const inner = document.createElement("div");
        inner.className = "py-sec__inner";
        for (let c = 0; c < 2; c++) {
          const col = document.createElement("div");
          col.className = "py-col";
          for (let row = 0; row < 5; row++) {
            const list = data[k].photos;
            const [label, aspect] = list[(r * 10 + c * 5 + row + n) % list.length];
            const cell = document.createElement("div");
            cell.className = "py-cell";
            const img = document.createElement("div");
            img.className = `py-img ${aspect >= 1 ? "is-h" : "is-v"}`;
            img.dataset.category = k;
            img.dataset.kind = data[k].kind;
            img.dataset.aspect = aspect;
            const ph = document.createElement("div");
            ph.className = "wf-img";
            ph.dataset.label = label;
            img.append(ph); cell.append(img); col.append(cell);
          }
          inner.append(col);
        }
        sec.append(inner);
        content.append(sec);
      });
      n += 3;
    }
    return { content, sections: Array.from(content.querySelectorAll(".py-sec")) };
  };

  const glOK = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } };

  PY.pages.home = {
    init(root, { first }) {
      const html = document.documentElement;
      const mobile = PY.isMobile();
      const { content, sections } = build(root);
      const cols = Array.from(root.querySelectorAll(".py-col"));
      const colImgs = cols.map((c) => Array.from(c.querySelectorAll(".py-img")));
      const cells = cols.map((c) => Array.from(c.querySelectorAll(".py-cell")));
      const titles = Array.from(root.querySelectorAll(".py-home__category-item"));
      const grid = () => parseFloat(getComputedStyle(html).getPropertyValue("--py-grid")) / 100 * innerWidth;
      S = { root, scrollCategory: sections[0].dataset.category, selected: null, current: null, pm: 0.1, meshes: [], time: 0 };
      html.dataset.mode = PY.dynamic.home = "grid";
      PY.params.mode = 0; PY.params.modeChangePow = 0;

      /* Center classification — the cell straddling the center line (the cell whose left edge is closest to the center), full mode is where the enlarged photo of every four columns fits entirely within the screen */
      const setCategory = () => {
        const cur = S.selected || S.scrollCategory;
        if (cur === S.current) return;
        S.current = cur;
        titles.forEach((t) => t.classList.toggle("active", t.dataset.category === cur));
        S.meshes.forEach((m) => gsap.to(m.material.uniforms.hoverN, { value: m.userData.category === cur ? 1 : 0, duration: PY.reduce ? 0 : 1, ease: "power2.out", overwrite: true }));
      };
      const onUpdate = (sc) => {
        const vw = innerWidth;
        if (PY.dynamic.home === "full") {
          cols.forEach((c, i) => {
            if (i % 4) return;
            const r = colImgs[i][2].getBoundingClientRect();
            if (mobile ? r.left < vw / 2 && r.right > vw / 2 : r.left > 0 && r.right < vw) S.scrollCategory = colImgs[i][2].dataset.category;
          });
        } else {
          let best = -1, bestD = Infinity;
          sc.rects.forEach((r, i) => {
            const cx = r.screen / vw;
            if (Math.abs(cx) < 0.5) { const d = Math.abs(cx - 0.5); if (d < bestD) { bestD = d; best = i; } }
          });
          if (best >= 0) S.scrollCategory = sections[best].dataset.category;
          const p = sc.power.pow1.value, g = grid();
          cells.forEach((cs) => {
            cs[0].style.transform = `translateY(${p * g * 2}px)`;
            cs[1].style.transform = `translateY(${p * g}px)`;
            cs[3].style.transform = `translateY(${p * g * -1}px)`;
            cs[4].style.transform = `translateY(${p * g * -2}px)`;
          });
        }
        setCategory();
      };

      /* On phone, .5s after release the nearest cell is centered (1s power2.out) */
      const settle = (sc) => {
        if (!mobile || PY.dynamic.home !== "grid") return;
        let best = null, bestD = Infinity;
        sc.rects.forEach((r) => { const d = r.screen + r.width / 2 - innerWidth / 2; if (Math.abs(d) < Math.abs(bestD)) { bestD = d; best = r; } });
        if (best) sc.scrollTo(sc.delta1 + bestD, 1, 0, "power2.out");
      };

      S.scroller = new PY.Scroller({
        wrap: root.querySelector(".py-home__page"), content, sections,
        dir: "hr", infinite: true, speed: mobile ? 200 : 80, ease: 0.125, drag: true, touchRatio: 1.8,
        onUpdate, onSettle: settle,
      });
      S.onWheelDir = (e) => { S.pm = e.deltaY > 0 ? 0.1 : -0.1; };
      addEventListener("wheel", S.onWheelDir, { passive: true });

      /* WebGL */
      /* Like the original, the canvas is set up after 100ms — the Transition starts moving first */
      const host = root.querySelector(".py-canvas");
      const setupGL = () => {
      if (!S) return;
      if (glOK()) {
        const st = (S.stage = PY.stage(host, {
          uniforms: { scrollPow: { value: 0 }, modeChangePow: { value: 0 }, mode: { value: 0 }, device: { value: mobile ? 0.5 : 0 } },
          fragment: POST,
        }));
        const noise = PY.noise();
        const res = new THREE.Vector2(innerWidth * st.dpr, innerHeight * st.dpr);
        const texCache = new Map();
        const texOf = (el) => {
          const key = el.dataset.category + el.querySelector(".wf-img").dataset.label;
          if (!texCache.has(key)) texCache.set(key, PY.paintPhoto(el.dataset.kind, texCache.size + el.dataset.category.charCodeAt(0), +el.dataset.aspect));
          return texCache.get(key);
        };
        root.querySelectorAll(".py-img").forEach((el) => {
          const r = el.getBoundingClientRect();
          const w = Math.max(r.width, 1), h = Math.max(r.height, 1);
          const aspect = +el.dataset.aspect;
          const mat = new THREE.ShaderMaterial({
            uniforms: {
              tA: { value: texOf(el) },
              noise: { value: noise }, hoverN: { value: 0 }, opacityN: { value: 0.2 }, uTime: { value: 0 },
              radius: { value: 0.001 }, mode: { value: 0 }, vUvScale: { value: new THREE.Vector2(1, 1) },
              uMouse: { value: new THREE.Vector2(-10, -10) }, uRes: { value: res }, pw: { value: 0 },
            },
            vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: THREE.DoubleSide, depthTest: false,
          });
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 36, 36), mat);
          mesh.userData = { el, category: el.dataset.category, aspect, gw: w, gh: h };
          st.scene.add(mesh);
          S.meshes.push(mesh);
        });
        st.warm();
        const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
        S.tick = () => {
          const vw = innerWidth, vh = innerHeight;
          res.set(vw * st.dpr, vh * st.dpr);
          S.time += 0.012;
          const pow2 = S.scroller.power.pow2.value;
          const cur = st.mouse.cursor;
          S.meshes.forEach((m) => {
            const el = m.userData.el, r = el.getBoundingClientRect();
            const visible = r.width > 0.5 && r.height > 0.5 && r.right > -vw * 0.2 && r.left < vw * 1.2;
            m.visible = visible;
            if (!visible) return;
            const u = m.material.uniforms;
            m.scale.set(r.width / m.userData.gw, r.height / m.userData.gh, 1);
            m.position.set(r.left + r.width / 2 - vw / 2, vh / 2 - r.top - r.height / 2, 0);
            const box = r.width / r.height, img = m.userData.aspect;
            u.vUvScale.value.set(box > img ? 1 : box / img, box > img ? img / box : 1);
            u.uTime.value = S.time;
            u.mode.value = PY.params.mode;
            u.pw.value = pow2 * S.pm;
            if (!mobile) u.uMouse.value.set(cur.ax, cur.ay);
          });
          const pu = st.post.uniforms;
          pu.scrollPow.value = S.scroller.power.pow1.value;
          pu.modeChangePow.value = PY.params.modeChangePow;
          pu.mode.value = PY.params.mode;
          st.render();
        };
        gsap.ticker.add(S.tick);

        /* Category hover — colors the whole category under the cursor. Turned off when scroll force is .04 or above */
        S.onMove = (e) => {
          if (mobile || PY.drag || PY.transitioning || html.classList.contains("is-load")) return;
          if (e.target.closest("a,button")) return;
          let hit = null;
          if (S.scroller.power.pow0.value <= 0.04) {
            ndc.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1);
            ray.setFromCamera(ndc, st.camera);
            const h = ray.intersectObjects(S.meshes.filter((m) => m.visible), false)[0];
            hit = h ? h.object.userData.category : null;
          }
          S.selected = hit;
          html.classList.toggle("c-cursor", !!hit);
          setCategory();
        };
        addEventListener("mousemove", S.onMove);
      } else html.classList.add("no-gl");
      };
      S.glTimer = setTimeout(setupGL, 100);

      /* Grid ↔ Full */
      const isLand = (el) => +el.dataset.aspect > 1;
      const kill = (list) => list.forEach((t) => gsap.killTweensOf(t));
      const fixed = root.querySelector(".py-home__category-title");
      S.onFull = (t = mobile ? 4.5 : 2.5) => {
        PY.dynamic.home = "full"; html.dataset.mode = "full";
        setTimeout(() => S.scroller.scrollTo(S.scroller.delta1 + innerWidth * t, 2), 50);
        gsap.to(PY.params, { mode: 1, duration: 2, delay: 0.5 });
        gsap.to(fixed, { opacity: 0, duration: 0.3 });
        gsap.to(fixed, { opacity: 1, duration: 0.5, delay: 1.25 });
        colImgs.forEach((t, e) => {
          kill(t);
          if (e % 4 === 0) {
            if (mobile && innerWidth <= innerHeight) {
              gsap.to(t[2], { width: "calc(100vw - var(--py-grid))", duration: 2, ease: "power4.out" });
              gsap.to(t[2], { height: "120vh", duration: 2, ease: "power2.inOut" });
            } else {
              gsap.to(t[2], { width: "49vw", duration: 2, ease: "power3.out" });
              gsap.to(t[2], { height: "150vh", duration: 2, ease: "power3.inOut" });
            }
          } else gsap.to(t[2], { width: 0, duration: 0.6, ease: "power4.out" });
          const vh = innerHeight;
          const r0 = t[0].getBoundingClientRect(), r1 = t[1].getBoundingClientRect(), r3 = t[3].getBoundingClientRect(), r4 = t[4].getBoundingClientRect();
          gsap.to(t[0], { height: 0, y: -0.5 * (r0.top + r0.height), duration: 0.4, ease: "power2.out" });
          gsap.to(t[1], { height: 0, y: -0.5 * (r1.top + r1.height), duration: 0.5, ease: "power2.out", delay: 0.1 });
          gsap.to(t[3], { height: 0, y: -0.5 * (r3.top - vh - r3.height), duration: 0.5, ease: "power2.out", delay: 0.1 });
          gsap.to(t[4], { height: 0, y: -0.5 * (r4.top - vh - r4.height), duration: 0.4, ease: "power2.out" });
        });
        cells.forEach((cs) => cs.forEach((c) => { c.style.transform = ""; }));
        setTimeout(() => { html.classList.remove("l-light"); html.classList.add("l-dark"); }, 500);
        gsap.timeline()
          .to(PY.params, { modeChangePow: 1, duration: 0.75, ease: "power1.out" })
          .to(PY.params, { modeChangePow: 0, duration: 2.5, ease: "power2.out" });
      };
      S.onGrid = (t = mobile ? 4.5 : 2.5) => {
        PY.dynamic.home = "grid"; html.dataset.mode = "grid";
        html.classList.remove("l-dark"); html.classList.add("l-light");
        gsap.to(PY.params, { mode: 0, duration: 1 });
        gsap.to(fixed, { opacity: 0, duration: 0.3 });
        gsap.to(fixed, { opacity: 1, duration: 0.5, delay: 1.25 });
        setTimeout(() => S.scroller.scrollTo(S.scroller.delta1 + innerWidth * t, 3, 0, "expo.out"), 50);
        colImgs.forEach((t) => {
          kill(t);
          t.forEach((n, e) => {
            const land = isLand(n), mid = e === 2;
            gsap.to(n, { width: land ? "100%" : "65%", duration: 1.5, ease: "power4.out", delay: mid ? 0.25 : 0.7 });
            gsap.to(n, { height: land ? "65%" : "100%", duration: mid ? 1.25 : 1.5, ease: "power4.out", delay: mid ? 0.25 : 0.7 });
          });
          gsap.to(t[0], { y: 0, duration: 1.5, ease: "power4.out", delay: 0.6 });
          gsap.to(t[1], { y: 0, duration: 1.5, ease: "power4.out", delay: 0.3 });
          gsap.to(t[3], { y: 0, duration: 1.5, ease: "power4.out", delay: 0.3 });
          gsap.to(t[4], { y: 0, duration: 1.5, ease: "power4.out", delay: 0.6 });
        });
        gsap.timeline()
          .to(PY.params, { modeChangePow: 0.5, duration: 0.5, ease: "power1.in" })
          .to(PY.params, { modeChangePow: 0, duration: 2, ease: "power1.out" });
      };
      S.onModeClick = (e) => {
        const b = e.target.closest("[data-mode-to]");
        if (!b) return;
        if (b.dataset.modeTo === "full" && PY.dynamic.home !== "full") S.onFull();
        if (b.dataset.modeTo === "grid" && PY.dynamic.home !== "grid") S.onGrid();
      };
      root.querySelector(".py-home__mode").addEventListener("click", S.onModeClick);
      root.querySelectorAll(".py-home__category-item").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
      html.classList.add("l-light");

      /* Splash plays only on first load, after 150ms — when arriving via a transition, onArrive flows it into the grid */
      const splash = root.querySelector(".py-splash");
      if (PY.reduce || !first) {
        splash.remove();
        html.classList.remove("is-load__before");
        if (PY.reduce) S.scroller.delta1 = S.scroller.x = innerWidth * (mobile ? 4.48 : 2.125);
        return;
      }
      S.startTimer = setTimeout(() => this.intro(root, splash, colImgs), 150);
    },

    /* First load — the number counts up by 3 every 10ms to 99, after 700ms the text swaps · the photo window opens · the panel lifts, and 1s later the grid settles into place */
    intro(root, splash, colImgs) {
      const html = document.documentElement;
      const mobile = PY.isMobile();
      const num = splash.querySelector(".py-splash__num");
      let n = 0;
      const counter = setInterval(() => {
        if (n < 99) { n += 3; num.textContent = n; } else { clearInterval(counter); num.textContent = "100"; }
      }, 10.1);
      if (S.stage) gsap.set(S.stage.renderer.domElement, { opacity: 0 });
      html.classList.add("is-load"); html.classList.remove("is-load__before");
      gsap.to(splash.querySelector(".py-splash__title"), { opacity: 1, duration: 0.4 });
      gsap.to(splash.querySelector(".py-splash__front"), { opacity: 1, duration: 0.3, delay: 0.1 });
      gsap.to(splash.querySelector(".py-splash__bottom"), { opacity: 1, duration: 0.3, delay: 0.15 });
      if (mobile) gsap.set(splash.querySelector(".py-splash__front-wrap"), { clipPath: "inset(30vh 25vw 30vh 25vw)" });
      const tos = root.querySelectorAll(".to");
      S.introTimer = setTimeout(() => {
        const vh = innerHeight;
        colImgs.forEach((t) => {
          t.forEach((el) => gsap.killTweensOf(el));
          gsap.set(t[2], { width: "187%", height: "20vw" });
          [0, 1].forEach((i) => { const r = t[i].getBoundingClientRect(); gsap.set(t[i], { y: -(r.top + r.height) }); });
          [3, 4].forEach((i) => { const r = t[i].getBoundingClientRect(); gsap.set(t[i], { y: -(r.top - vh - r.height) }); });
        });
        gsap.set(tos, { opacity: 0 });
        const enter = () => {
          if (!S) return;
          if (S.stage) gsap.fromTo(S.stage.renderer.domElement, { opacity: 0 }, { opacity: 1, duration: 1 });
          S.scroller.scrollTo(S.scroller.delta1 + innerWidth * (mobile ? 4.48 : 2.125), 3, 0, "power4.out");
          colImgs.forEach((t) => {
            const land = +t[2].dataset.aspect > 1;
            gsap.to(t[2], { width: land ? "100%" : "65%", duration: 2.3, ease: "power4.out", delay: 0.5 });
            gsap.to(t[2], { height: land ? "65%" : "100%", duration: 1.8, ease: "power4.out" });
            gsap.to(t[0], { y: 0, duration: 1.7, ease: "expo.out", delay: 1 });
            gsap.to(t[1], { y: 0, duration: 1.7, ease: "expo.out", delay: 0.5 });
            gsap.to(t[3], { y: 0, duration: 1.7, ease: "expo.out", delay: 0.5 });
            gsap.to(t[4], { y: 0, duration: 1.7, ease: "expo.out", delay: 1 });
          });
          gsap.fromTo(tos, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 1.5 });
          gsap.fromTo(PY.params, { modeChangePow: 1 }, { modeChangePow: 0, duration: 1.5, ease: "power1.out" });
        };
        const tl = gsap.timeline({ onComplete: () => splash.remove() });
        PY.splashOut(splash, tl, 0);
        tl.call(enter, null, "<1.0");
        S.splashTl = tl;
      }, 700);
      S.loadTimer = setTimeout(() => html.classList.remove("is-load"), 2500);
    },

    /* When returning via barba — cells restore to the current mode and slide in horizontally */
    onArrive(t) {
      if (!S) return;
      gsap.fromTo(S.root.querySelectorAll(".to"), { opacity: 0 }, { opacity: 1, duration: 0.5, delay: t ? 1 : 1.25 });
      if (PY.dynamic.home === "full") S.onFull(t); else S.onGrid(t);
    },

    destroy() {
      if (!S) return;
      const html = document.documentElement;
      clearTimeout(S.introTimer); clearTimeout(S.loadTimer); clearTimeout(S.startTimer); clearTimeout(S.glTimer);
      S.splashTl?.kill();
      if (S.tick) gsap.ticker.remove(S.tick);
      removeEventListener("wheel", S.onWheelDir);
      if (S.onMove) removeEventListener("mousemove", S.onMove);
      S.scroller.destroy();
      S.stage?.destroy();
      gsap.killTweensOf(PY.params);
      html.classList.remove("c-cursor", "l-light", "is-load");
      html.removeAttribute("data-mode");
      S = null;
    },
  };
})();
