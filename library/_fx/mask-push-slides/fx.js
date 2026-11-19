// Flips a full-bleed photo panel to the next photo at set intervals (WebGL). By the value of a circular mask, 0 at center → 1 at edge
// The front photo is pushed out by (direction × strength × progress) and the next photo is pushed in the opposite way by (1 − progress), the two blending by progress —
// The center changes in place and the edges sweep and change more strongly. Without WebGL or three, it falls back to an overlapping change (opacity) of the same length.
(() => {
  const VERT = "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const FRAG = `varying vec2 vUv;
    uniform sampler2D uFrom, uTo, uMask;
    uniform float uProgress, uIntensity;
    uniform vec2 uFromFit, uToFit, uDir;
    vec2 fold(vec2 p) { vec2 m = mod(p, 2.0); return mix(m, 2.0 - m, step(1.0, m)); }
    void main() {
      vec2 a = vUv * uFromFit + (1.0 - uFromFit) * 0.5;
      vec2 b = vUv * uToFit + (1.0 - uToFit) * 0.5;
      vec2 push = texture2D(uMask, vUv).rg * uIntensity * uDir;
      gl_FragColor = mix(texture2D(uFrom, fold(a + push * uProgress)), texture2D(uTo, fold(b - push * (1.0 - uProgress))), uProgress);
    }`;

  // A placeholder (.wf-img) copies its background color, lines and label onto a canvas and uses it as an image
  const paint = (node, w, h) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    const cs = getComputedStyle(node), after = getComputedStyle(node, "::after");
    x.fillStyle = cs.backgroundColor;
    x.fillRect(0, 0, w, h);
    x.strokeStyle = cs.borderTopColor;
    x.lineWidth = Math.max(1, w / 700);
    x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke();
    const label = node.getAttribute("data-label") || "";
    if (label) {
      const fs = Math.round(h / 40);
      x.font = `500 ${fs}px ${after.fontFamily}`;
      const tw = x.measureText(label).width;
      x.fillStyle = after.backgroundColor;
      x.fillRect(w / 2 - tw / 2 - fs * 0.7, h / 2 - fs * 0.95, tw + fs * 1.4, fs * 1.9);
      x.fillStyle = after.color;
      x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(label, w / 2, h / 2);
    }
    return c;
  };
  const radial = () => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgb(0, 0, 0)"); /* Not skin: displacement strength 0 */
    g.addColorStop(1, "rgb(255, 255, 255)"); /* Not skin: displacement strength 1 */
    x.fillStyle = "rgb(255, 255, 255)"; /* Not skin: corners also at strength 1 */
    x.fillRect(0, 0, 256, 256);
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    return c;
  };

  kfFx.register("mask-push-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const interval = Number(options.interval || 5.4);
    const speed = +(options.speed ?? 1);
    const delay = +(options.delay ?? 0);
    const intensity = +(options.intensity ?? 0.5);
    const [dx, dy] = (options.dir || "1,1").split(",").map(Number);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const ratio = Number(options.ratio || 0.625);
    let cur = 0, timer = null, run = null;
    const emit = () => el.dispatchEvent(new CustomEvent("fx:mask-push-slides", { detail: { index: cur } }));
    const show = (i) => slides.forEach((s, k) => (s.style.opacity = k === i ? "1" : "0"));
    show(0);
    if (reduce || slides.length < 2) return () => slides.forEach((s) => (s.style.opacity = ""));

    let gl = null;
    const T = window.THREE;
    const probe = document.createElement("canvas");
    if (T && (probe.getContext("webgl") || probe.getContext("experimental-webgl"))) {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;z-index:1;pointer-events:none";
      stage.appendChild(canvas);
      const renderer = new T.WebGLRenderer({ canvas });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const camera = new T.PerspectiveCamera(45, 1, 1, 1e4);
      camera.position.z = 50;
      const scene = new T.Scene();
      const W = 1440, H = Math.round(W * ratio);
      const tex = slides.map((s) => {
        const img = s.querySelector("img");
        const t = img ? new T.Texture(img) : new T.CanvasTexture(paint(s.querySelector(".wf-img") || s, W, H));
        if (img) img.complete ? (t.needsUpdate = true) : img.addEventListener("load", () => (t.needsUpdate = true), { once: true });
        t.minFilter = T.LinearFilter;
        return t;
      });
      const u = {
        uFrom: { value: tex[0] }, uTo: { value: tex[0] }, uMask: { value: new T.CanvasTexture(radial()) },
        uProgress: { value: 0 }, uIntensity: { value: intensity }, uDir: { value: new T.Vector2(dx, dy) },
        uFromFit: { value: new T.Vector2(1, 1) }, uToFit: { value: new T.Vector2(1, 1) },
      };
      const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u });
      const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat);
      scene.add(mesh);
      const render = () => renderer.render(scene, camera);
      const size = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        const vh = Math.abs(camera.position.z * Math.tan((camera.fov * Math.PI) / 360) * 2);
        mesh.scale.set(vh * (w / h), vh, 1);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const a = w / h, ia = 1 / ratio;
        u.uFromFit.value.set(Math.min(a / ia, 1), Math.min(ia / a, 1));
        u.uToFit.value.copy(u.uFromFit.value);
        render();
      };
      const ro = new ResizeObserver(size);
      ro.observe(canvas);
      slides.forEach((s) => (s.style.visibility = "hidden"));
      gl = { canvas, renderer, mat, mesh, tex, u, render, ro };
      size();
    } else {
      slides.forEach((s) => (s.style.transition = `opacity ${speed}s ease`));
    }

    const next = () => {
      const to = (cur + 1) % slides.length;
      if (gl) {
        gl.u.uFrom.value = gl.tex[cur];
        gl.u.uTo.value = gl.tex[to];
        const p = { t: 0 };
        run = gsap.to(p, {
          t: 1, duration: speed, ease,
          onUpdate: () => { gl.u.uProgress.value = p.t; gl.render(); },
          onComplete: () => { gl.u.uFrom.value = gl.tex[to]; gl.u.uProgress.value = 0; gl.render(); },
        });
      } else show(to);
      cur = to;
      emit();
      timer = gsap.delayedCall(interval, next);
    };
    timer = gsap.delayedCall(delay + interval, next);
    return () => {
      timer?.kill();
      run?.kill();
      slides.forEach((s) => { s.style.opacity = ""; s.style.visibility = ""; s.style.transition = ""; });
      if (gl) {
        gl.ro.disconnect();
        gl.tex.forEach((t) => t.dispose());
        gl.u.uMask.value.dispose();
        gl.mat.dispose();
        gl.mesh.geometry.dispose();
        gl.renderer.dispose();
        gl.canvas.remove();
      }
    };
  });
})();
