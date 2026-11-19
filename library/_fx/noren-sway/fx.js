// Draws a cloth (noren) panel hanging from its top edge as a curtains.js plane (60×60), rippling as if in the wind. Each frame gets a random target (0~2)
// Follows with very slow damping so the intensity rises and falls near the cap, folds back and forth (z) more toward the bottom, and the edges spread slightly outward.
// The folded face is shaded only 35% by light from the (.3, .3, 1) side. The panel image is the child’s <img>, if none, paints the canvas with the child’s background color and label.
(() => {
  const VS = `
    precision mediump float;
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform float uTime;
    uniform float uStrength;
    uniform float uFold;
    varying vec3 vPos;
    varying vec3 vOrig;
    varying vec2 vUv;
    void main() {
      vec3 p = aVertexPosition;
      float hang = p.y - 1.0;
      float wave = cos(35.0 * ((1.0 / (cos(abs(p.x)) - 2.0)) - uTime * 0.0015));
      float effect = hang * wave * uStrength * ((2.0 - abs(p.x)) / 2.0) * 0.5;
      p.z += effect / uFold;
      p.x += effect * 1.5 * (abs(hang) * sign(p.x)) / 240.0;
      gl_Position = uPMatrix * uMVMatrix * vec4(p, 1.0);
      vUv = aTextureCoord;
      vPos = p;
      vOrig = aVertexPosition;
    }`;
  const FS = `
    precision mediump float;
    varying vec3 vPos;
    varying vec3 vOrig;
    varying vec2 vUv;
    uniform sampler2D clothSampler;
    uniform float uShade;
    void main() {
      vec4 c = texture2D(clothSampler, vUv);
      vec3 n = normalize(cross(vec3(vOrig.x + 0.25, vOrig.y, vOrig.z) - vPos, vec3(vOrig.x, vPos.y + 0.25, vOrig.z) - vPos));
      float light = smoothstep(0.45, 1.0, dot(n, normalize(vec3(0.3, 0.3, 1.0))));
      c.rgb = c.rgb * light * uShade + c.rgb * (1.0 - uShade);
      gl_FragColor = vec4(c.rgb * c.a, c.a);
    }`;
  // Original strength cap · damping per screen width
  const tune = (w) => (w <= 575 ? [0.08, 4e-4] : w <= 767 ? [0.1, 6e-4] : w <= 1023 ? [0.2, 8e-4] : w <= 1299 ? [0.3, 0.001] : [0.5, 0.004]);

  const paint = (node) => {
    const r = node.getBoundingClientRect();
    const c = document.createElement("canvas");
    c.width = Math.max(64, Math.round(r.width * 1.5));
    c.height = Math.max(64, Math.round(r.height * 1.5));
    const x = c.getContext("2d");
    const cs = getComputedStyle(node);
    x.fillStyle = cs.backgroundColor;
    x.fillRect(0, 0, c.width, c.height);
    const label = node.getAttribute("data-label") || node.textContent.trim();
    if (label) {
      x.fillStyle = cs.color;
      x.font = `500 ${Math.round(c.height / 14)}px ${cs.fontFamily}`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(label.slice(0, 24), c.width / 2, c.height / 2);
    }
    return c;
  };

  kfFx.register("noren-sway", (el, { options, reduce }) => {
    const cloths = [...el.querySelectorAll('[data-fx-part="cloth"]')];
    if (!cloths.length || reduce || !window.Curtains || !window.Plane) return;
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl") || probe.getContext("experimental-webgl"))) return;
    const speed = +(options.speed ?? 1);
    const fold = Number(options.fold || 30);
    const shade = +(options.shade ?? 0.35);
    const fixedMax = options.max != null ? +options.max : null;
    const fixedDamp = options.damping != null ? +options.damping : null;
    const segments = Number(options.segments || 60);
    const stage = document.createElement("div");
    stage.setAttribute("aria-hidden", "true");
    stage.style.cssText = "position:absolute;inset:0;z-index:3;pointer-events:none";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.appendChild(stage);
    const curt = new Curtains({ container: stage, premultipliedAlpha: true, pixelRatio: Math.min(1.5, devicePixelRatio), watchScroll: false, production: true });
    const planes = cloths.map((cloth) => {
      const st = { max: 0, applied: 0 };
      const plane = new Plane(curt, cloth, {
        vertexShader: VS,
        fragmentShader: FS,
        widthSegments: segments,
        heightSegments: segments,
        drawCheckMargins: { top: 0, right: 0, bottom: 0, left: 0 },
        uniforms: {
          time: { name: "uTime", type: "1f", value: 0 },
          strength: { name: "uStrength", type: "1f", value: 0 },
          fold: { name: "uFold", type: "1f", value: fold },
          shade: { name: "uShade", type: "1f", value: shade },
        },
      });
      const img = cloth.querySelector("img");
      const src = img || paint(cloth.querySelector(".wf-img") || cloth);
      if (img) {
        img.setAttribute("data-sampler", "clothSampler");
        plane.loadImage(img);
      } else {
        src.setAttribute("data-sampler", "clothSampler");
        plane.loadCanvas(src);
      }
      plane.onReady(() => (cloth.style.visibility = "hidden"));
      plane.onRender(() => {
        const [m, d] = tune(innerWidth);
        const maxT = fixedMax ?? m, damp = fixedDamp ?? d;
        plane.uniforms.time.value += speed * (devicePixelRatio > 1.5 ? 0.5 : 1);
        st.max = Math.random() + Math.random();
        st.applied += (st.max - st.applied) * damp;
        if (st.applied > maxT) st.applied -= (st.max - st.applied) * damp;
        else st.applied += (st.max - st.applied) * damp;
        plane.uniforms.strength.value = st.applied;
      });
      return plane;
    });
    return () => {
      planes.forEach((p) => p.remove());
      curt.dispose();
      stage.remove();
      cloths.forEach((c) => (c.style.visibility = ""));
    };
  });
})();
