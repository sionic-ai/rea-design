// About — what-we-do interaction, melted red blackletter (text baked to a canvas and flowed like liquid by our shader — as in the original, it doesn’t react to the cursor)
(() => {
  const items = document.querySelectorAll(".slash__item[data-i]"), cols = document.querySelectorAll(".slash__col");
  const on = (i) => { items.forEach((x) => x.classList.toggle("is-on", x.dataset.i === i)); cols.forEach((x) => x.classList.toggle("is-on", x.dataset.i === i)); };
  items.forEach((x) => x.addEventListener("pointerenter", () => on(x.dataset.i)));

  const T = window.THREE, el = document.querySelector("[data-liquid]");
  if (!T || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const start = () => {
    let r;
    try { r = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); } catch { return; }
    const cv = r.domElement; cv.className = "liquid__gl"; cv.setAttribute("aria-hidden", "true");
    el.append(cv);
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const tex = document.createElement("canvas"), g = tex.getContext("2d");
    const bake = () => {
      const box = el.getBoundingClientRect(), cs = getComputedStyle(el), s = 2;
      const W = Math.round(box.width * 1.08), H = Math.round(box.height * 1.42);
      tex.width = W * s; tex.height = H * s;
      g.setTransform(s, 0, 0, s, 0, 0); g.clearRect(0, 0, W, H);
      g.fillStyle = el.classList.contains("is-gl") ? getComputedStyle(document.querySelector(".step__n")).color : cs.color;
      g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; g.textBaseline = "top";
      const words = el.firstChild.textContent.split(" "), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize);
      let line = "", y = H * 0.0845, x0 = W * 0.037;
      for (const w of words) { const t = line ? `${line} ${w}` : w; if (g.measureText(t).width > box.width && line) { g.fillText(line, x0, y); line = w; y += lh; } else line = t; }
      g.fillText(line, x0, y);
      U.uTex.value.needsUpdate = true;
      r.setSize(W, H, false);
    };
    const U = { uTex: { value: new T.CanvasTexture(tex) }, uTime: { value: 0 } };
    U.uTex.value.colorSpace = T.SRGBColorSpace;
    const m = new T.ShaderMaterial({ uniforms: U, transparent: true, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        uniform sampler2D uTex; uniform float uTime; varying vec2 vUv;
        float n(vec2 p){ return sin(p.x) * cos(p.y); }
        void main() {
          vec2 uv = vUv; float t = uTime * 0.6;
          float flow = n(vec2(uv.x * 9.0 + t, uv.y * 3.0 - t * 0.5)) * 0.5 + n(vec2(uv.x * 23.0 - t * 1.3, uv.y * 7.0)) * 0.25;
          float drip = pow(max(0.0, sin(uv.x * 37.0 + 1.7) * sin(uv.x * 11.0 - 0.6)), 6.0) * 0.06;
          vec2 q = uv + vec2(flow * 0.004, flow * 0.012 + drip * (0.6 + 0.4 * sin(t + uv.x * 5.0)));
          vec4 c = texture2D(uTex, vec2(q.x, 1.0 - q.y));
          float smear = texture2D(uTex, vec2(q.x, 1.0 - q.y + drip * 1.6)).a;
          c.a = max(c.a, smear * 0.35 * step(0.002, drip));
          c.rgb = c.a > 0.0 ? c.rgb / max(c.a, 0.001) * c.a : c.rgb;
          gl_FragColor = c;
        }` });
    const s = new T.Scene(), cam = new T.Camera();
    s.add(new T.Mesh(new T.PlaneGeometry(2, 2), m));
    bake();
    el.classList.add("is-gl");
    addEventListener("resize", bake);
    let vis = false, t0 = performance.now();
    new IntersectionObserver((es) => (vis = es[0].isIntersecting)).observe(el);
    gsap.ticker.add(() => { if (!vis) return; U.uTime.value = (performance.now() - t0) / 1000; r.render(s, cam); });
  };
  (document.fonts?.ready || Promise.resolve()).then(start);
})();
