/* About — vertical self-scroll (wheel 150 · lerp .125). In the final 300vh margin the panel is peeled away with clip-path and the splash grows 0→100, going to the first page at 98.
   Photo panel: on entry ttP goes 0 to 1 (2.5s), sharpening from the bottom center along a noise edge, and around the cursor (.08) it ripples with refraction (strength = Mouse speed, min .1). */
(() => {
  const PY = window.PY;

  const VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
  const FRAG = `
    varying vec2 vUv;
    uniform sampler2D tA;
    uniform sampler2D noise;
    uniform vec2 vUvScale;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float radius;
    uniform float ttP;
    uniform vec2 uRes;
    uniform float device;
    uniform float mousePow;
    float ease(float a, float b, float x) {
      float t = clamp((x - a) / max(b - a, 1e-6), 0.0, 1.0);
      return b <= a ? 0.0 : t * t * (3.0 - 2.0 * t);
    }
    void main() {
      vec2 uv = (vUv - 0.5) * vUvScale + 0.5;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
      vec2 cp = uv - vec2(0.5, ttP * 0.5);
      float far = ease(radius, radius * 2200.0 * ttP * (1.0 - device), length(cp));
      float n = texture2D(noise, uv + cp * (1.0 - far * 0.5) * 0.02).r;
      float crisp = step(far, n);
      vec2 ref = uv + vec2(sin(uv.y * 50.0 + uTime), cos(uv.x * 50.0 + uTime)) * 0.003;
      vec4 wavy = vec4(texture2D(tA, ref).rgb * 1.05, 1.0);
      vec2 st = gl_FragCoord.xy / uRes - 0.5;
      st.y *= uRes.y / uRes.x;
      vec2 m = uMouse - 0.5;
      m.y *= uRes.y / uRes.x;
      float far2 = ease(radius, radius * 80.5 * (1.0 - device), length(st - m));
      float near = step(far2, texture2D(noise, ref).r);
      vec4 base = mix(wavy, vec4(texture2D(tA, uv).rgb, 1.0), crisp);
      gl_FragColor = mix(base, mix(base, wavy, near), mousePow);
    }`;
  const POST = `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){gl_FragColor=texture2D(tDiffuse,vUv);}`;

  let S = null;
  const glOK = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } };

  PY.pages.about = {
    init(root, { first } = {}) {
      const html = document.documentElement;
      const mobile = PY.isMobile();
      const page = root.querySelector(".py-about__page");
      const content = root.querySelector(".py-about__content");
      const wrapper = root.querySelector(".py-about__wrapper");
      const sp = root.querySelector(".py-about__splash");
      const q = (s) => sp.querySelector(s);
      const front = q(".py-splash__front"), inner = q(".py-splash__front-inner"), fwrap = q(".py-splash__front-wrap");
      const bottom = q(".py-splash__bottom"), bg = q(".py-splash__bg"), title = q(".py-splash__title"), num = q(".py-splash__num");
      const outImg = root.querySelector(".py-about__photo-w");
      const headerBottom = document.querySelector(".py-header").getBoundingClientRect().bottom;
      S = { root, ttP: { v: 0 }, gone: false };
      PY.dynamic.about = "top";

      const clipPage = (y) => {
        const h = innerHeight;
        const n = 100 - wrapper.getBoundingClientRect().bottom / h * 100;
        page.style.clipPath = n > 0 ? `inset(0vw 0vw ${Math.min(n, 100)}vh 0vw)` : "";
        const i = y / Math.max(wrapper.offsetHeight, 1) * 100;
        outImg.style.top = `${i / 100 * -7}vh`;
        title.style.top = `${Math.max(50 + i / 100 * -50, 0)}vh`;
      };
      const splash = (y, e) => {
        const h = innerHeight;
        if (y > S.start && y <= S.end) {
          const i = e > 50 ? (e - 50) / 50 * 100 : 0;
          const r = mobile ? h / 1.5 * (e / 100) : h / 2 * (e / 100);
          bg.style.opacity = String(Math.max(0.25 - 0.0075 * e, 0));
          if (mobile) {
            fwrap.style.clipPath = `inset(${40 - 0.1 * i}vh ${40 - 0.15 * i}vw ${40 - 0.1 * i}vh ${40 - 0.15 * i}vw)`;
            inner.style.width = `${30 + 0.9 * i}%`;
          } else {
            fwrap.style.clipPath = `inset(${40 - 0.18 * i}vh ${46 - 0.08 * i}vw ${40 - 0.18 * i}vh ${46 - 0.08 * i}vw)`;
            inner.style.width = `${30 + 0.1 * i}%`;
          }
          front.style.top = `${Math.max(h / 2 - 2 * r, 0)}px`;
          bottom.style.bottom = `${e / 2 - 50}px`;
          num.textContent = String(Math.floor(Math.min(e + 2, 100)));
          html.classList.toggle("--b", y > S.start + h - headerBottom);
          if (y > S.start + h) PY.dynamic.about = "bottom";
          else if (e <= 110) PY.dynamic.about = "top";
          if (e >= 98 && !S.gone && !PY.transitioning && window.barba) { S.gone = true; barba.go(new URL("index.html", location.href).href); }
        } else {
          html.classList.remove("--b");
          num.textContent = "0";
          bg.style.opacity = "0.25";
          inner.style.width = "30%";
          fwrap.style.clipPath = mobile ? "inset(40vh 40vw 40vh 40vw)" : "inset(40vh 46vw 40vh 46vw)";
        }
      };
      const measure = () => {
        const h = innerHeight, ch = content.offsetHeight;
        S.start = ch - 4 * h; S.end = ch - h;
      };
      measure();
      S.scroller = new PY.Scroller({
        wrap: page, content, sections: [], dir: "vr", infinite: false,
        speed: mobile ? 200 : 150, ease: 0.125, drag: mobile, touchRatio: 1.8,
        onUpdate: (sc) => {
          const y = sc.x;
          clipPage(y);
          splash(y, (y - S.start) / (S.end - S.start) * 100);
        },
      });
      S.onResize = () => { measure(); };
      addEventListener("resize", S.onResize);

      /* Photo panel — set up after 100ms like the original */
      const setupGL = () => {
      if (!S) return;
      if (glOK()) {
        const st = (S.stage = PY.stage(root.querySelector(".py-canvas"), { uniforms: {}, fragment: POST }));
        const res = new THREE.Vector2(innerWidth * st.dpr, innerHeight * st.dpr);
        const target = root.querySelector(mobile ? ".py-about__profile [data-gl-photo]" : ".py-about__photo [data-gl-photo]");
        const r0 = target.getBoundingClientRect();
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            tA: { value: PY.paintPhoto("portrait", 7, 0.8, 1024) }, noise: { value: PY.noise() }, vUvScale: { value: new THREE.Vector2(1, 1) },
            uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(-10, -10) }, radius: { value: 0.001 }, ttP: { value: 0 },
            uRes: { value: res }, device: { value: mobile ? 1 : 0 }, mousePow: { value: 0.1 },
          },
          vertexShader: VERT, fragmentShader: FRAG, transparent: true,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(r0.width, 1), Math.max(r0.height, 1), 2, 2), mat);
        mesh.userData = { gw: Math.max(r0.width, 1), gh: Math.max(r0.height, 1), aspect: 0.8 };
        st.scene.add(mesh);
        st.warm();
        let time = 0;
        S.tick = () => {
          const vw = innerWidth, vh = innerHeight, r = target.getBoundingClientRect();
          res.set(vw * st.dpr, vh * st.dpr);
          mesh.scale.set(r.width / mesh.userData.gw, r.height / mesh.userData.gh, 1);
          mesh.position.set(r.left + r.width / 2 - vw / 2, vh / 2 - r.top - r.height / 2, 0);
          const box = r.width / r.height, img = mesh.userData.aspect;
          mat.uniforms.vUvScale.value.set(box > img ? 1 : box / img, box > img ? img / box : 1);
          time += 0.008;
          mat.uniforms.uTime.value = time;
          mat.uniforms.ttP.value = S.ttP.v;
          if (!mobile) {
            mat.uniforms.uMouse.value.set(st.mouse.cursor.ax, st.mouse.cursor.ay);
            mat.uniforms.mousePow.value = Math.max(st.mouse.pow, 0.1);
          }
          st.render();
        };
        gsap.ticker.add(S.tick);
      } else html.classList.add("no-gl");
      };
      S.glTimer = setTimeout(setupGL, 100);

      /* Entrance — text line rises after 600ms, photo plate ttP 0→1 after 500ms (2.5s, delay .25) */
      if (PY.reduce) { S.ttP.v = 1; PY.split(root); return; }
      /* On first load, after 150ms the panel rises from transparent over 1s (delay .5) — when arriving via a transition, shared.js applies the same thing */
      if (first) S.t0 = setTimeout(() => gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.5 }), 150);
      S.t1 = setTimeout(() => PY.split(root), 600);
      S.t2 = setTimeout(() => gsap.to(S.ttP, { v: 1, duration: 2.5, delay: 0.25 }), 500);
    },

    destroy() {
      if (!S) return;
      clearTimeout(S.t0); clearTimeout(S.t1); clearTimeout(S.t2); clearTimeout(S.glTimer);
      gsap.killTweensOf(S.ttP);
      if (S.tick) gsap.ticker.remove(S.tick);
      removeEventListener("resize", S.onResize);
      S.scroller.destroy();
      S.stage?.destroy();
      document.documentElement.classList.remove("--b");
      PY.dynamic.about = "top";
      S = null;
    },
  };
})();
