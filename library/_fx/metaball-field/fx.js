(() => {
  kfFx.register("metaball-field", (el, { options, reduce }) => {
    const T = window.THREE;
    const balls = [...el.querySelectorAll('[data-fx-part="ball"]')];
    if (!T || !balls.length) return;
    const N = balls.length, SAT = Math.max(0, Math.round(+(options.scatter ?? 4)));
    const shrinkAt = +options.shrink || 0.55, wobble = +(options.wobble ?? 1), tri = +(options.tri ?? 0.04);
    let renderer;
    try {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("data-fx-part", "gl");
      canvas.setAttribute("aria-hidden", "true");
      renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
    } catch (e) { return; }
    const canvas = renderer.domElement;
    el.prepend(canvas);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2) * (+options.ratio || 0.85));
    renderer.setClearColor(0x000000, 0);
    // Paints one dot of the child’s color (color, oklch, color-mix, anything) and reads it as rgb
    const dot = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgbOf = (b) => {
      dot.clearRect(0, 0, 1, 1);
      dot.fillStyle = getComputedStyle(b).color;
      dot.fillRect(0, 0, 1, 1);
      const d = dot.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
    const uni = {
      uRes: { value: new T.Vector2(1, 1) },
      uBall: { value: balls.map(() => new T.Vector4()) },
      uCol: { value: balls.map(() => new T.Vector3()) },
      uSeed: { value: balls.map((_, i) => i * 1.7 + 0.4) },
      uScatter: { value: 0 },
      uTime: { value: 0 },
      uWobble: { value: wobble },
      uTri: { value: tri },
    };
    const mat = new T.ShaderMaterial({
      uniforms: uni,
      transparent: true,
    premultipliedAlpha: true,
      vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        #define N ${N}
        #define SAT ${Math.max(SAT, 1)}
        uniform vec2 uRes; uniform vec4 uBall[N]; uniform vec3 uCol[N]; uniform float uSeed[N];
        uniform float uScatter, uTime, uWobble, uTri;
        float ball(vec2 p, vec2 c, vec2 r, float seed) {
          vec2 d = (p - c) / r;
          float q = dot(d, d);
          vec2 n = d * inversesqrt(q + 1e-6);
          // Use direction components instead of angles: cos(2a+s) and cos(3a+φ) — no atan or sin computed per pixel
          float c2 = n.x * n.x - n.y * n.y, s2 = 2.0 * n.x * n.y;
          float c3 = n.x * (4.0 * n.x * n.x - 3.0), s3 = n.y * (3.0 - 4.0 * n.y * n.y);
          float ph = uTime * 0.3 - seed * 1.3;
          float wob = 1.0 + uWobble * (0.07 * (c2 * cos(seed) - s2 * sin(seed)) + uTri * (c3 * cos(ph) - s3 * sin(ph)));
          float v = 1.0 / (q / (wob * wob) + 1e-4);
          // If the value grows endlessly at the center, the color weight (value²) overflows and dots appear — kept inside the boundary (1), so the shape is unchanged
          v = min(v, 30.0);
          return v * v;
        }
        void main() {
          vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
          float field = 0.0, wsum = 0.0; vec3 col = vec3(0.0);
          for (int i = 0; i < N; i++) {
            vec4 b = uBall[i];
            if (b.z < 1.0) continue;
            float f = ball(p, b.xy, b.zw, uSeed[i]);
            field += f; col += uCol[i] * f * f; wsum += f * f;
            for (int k = 0; k < SAT; k++) {
              if (${SAT} == 0) break;
              float fk = float(k);
              float ang = uSeed[i] * 2.3 + fk * 6.2832 / float(SAT) + uTime * 0.15;
              vec2 c = b.xy + vec2(cos(ang), sin(ang)) * b.zw * (1.05 + 0.22 * fk) * uScatter;
              vec2 r = b.zw * (0.22 + 0.05 * mod(fk, 2.0)) * uScatter;
              if (r.x < 1.0) continue;
              float fs = ball(p, c, r, uSeed[i] + fk);
              field += fs; col += uCol[i] * fs * fs; wsum += fs * fs;
            }
          }
          float edge = fwidth(field) * 1.2 + 1e-4;
          float a = smoothstep(1.0 - edge, 1.0 + edge, field);
          gl_FragColor = vec4(col / max(wsum, 1e-6) * a, a);
        }`,
    });
    const scene = new T.Scene(), camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new T.PlaneGeometry(2, 2);
    scene.add(new T.Mesh(geo, mat));
    el.classList.add("is-fx-gl");
    const size = () => {
      const r = el.getBoundingClientRect(), pr = renderer.getPixelRatio();
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
      uni.uRes.value.set(r.width * pr, r.height * pr);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    const base = balls.map((b) => b.offsetWidth || 1);
    let on = true, raf = 0;
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting));
    io.observe(el);
    const draw = (t) => {
      raf = requestAnimationFrame(draw);
      if (!on) return;
      const s = el.getBoundingClientRect(), pr = renderer.getPixelRatio();
      let shrink = 0;
      balls.forEach((b, i) => {
        const r = b.getBoundingClientRect();
        const alpha = +getComputedStyle(b).opacity;
        uni.uBall.value[i].set((r.left - s.left + r.width / 2) * pr, (r.top - s.top + r.height / 2) * pr, (r.width / 2) * pr * (alpha > 0 ? 1 : 0), (r.height / 2) * pr);
        uni.uCol.value[i].set(...rgbOf(b));
        shrink = Math.max(shrink, 1 - r.width / base[i]);
      });
      uni.uScatter.value = SAT ? Math.min(1, Math.max(0, shrink / shrinkAt)) : 0;
      uni.uTime.value = reduce ? 0 : t / 1000;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      geo.dispose(); mat.dispose(); renderer.dispose(); canvas.remove();
      el.classList.remove("is-fx-gl");
    };
  });
})();
