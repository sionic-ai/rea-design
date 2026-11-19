// On a pinned panel, several photos melt into one another in turn as you scroll — the next one spreads in along noise (fbm) contours (edge ±.15),
// During the change the two sheets distort opposite to each other (strength × .5) and around the middle the color splits into red and blue (sin(progress·π) × split × .03).
// Even at rest the screen drifts slightly (drift × .008) and pulls in as if breathing, and the edges darken by .28 toward the cover color. One OGL triangle + our shader.
(() => {
  const VERT = "attribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }";
  const FRAG = `
    precision highp float;
    uniform sampler2D tA;
    uniform sampler2D tB;
    uniform vec2 uRes, uSizeA, uSizeB;
    uniform float uP, uIntensity, uScale, uSplit, uDrift, uTime, uCalm;
    uniform vec3 uShade;
    varying vec2 vUv;
    float h21(vec2 p) { p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int k = 0; k < 5; k++) { s += a * vnoise(p); p = p * 2.02 + 17.0; a *= 0.5; } return s; }
    vec2 cover(vec2 uv, vec2 img) {
      float r = (uRes.x / max(uRes.y, 1.0)) / max(img.x / max(img.y, 1.0), 1e-4);
      vec2 s = r > 1.0 ? vec2(1.0, 1.0 / r) : vec2(r, 1.0);
      return (uv - 0.5) * s + 0.5;
    }
    vec3 split(sampler2D t, vec2 st, float ca) { return vec3(texture2D(t, st + vec2(ca, 0.0)).r, texture2D(t, st).g, texture2D(t, st - vec2(ca, 0.0)).b); }
    void main() {
      float p = clamp(uP, 0.0, 1.0), env = sin(p * 3.14159265);
      vec2 uv = vUv + vec2(sin(uTime * 0.25 + vUv.y * 4.0), cos(uTime * 0.22 + vUv.x * 4.0)) * uDrift * 0.008;
      uv = (uv - 0.5) * (1.0 - uDrift * 0.02 * sin(uTime * 0.4)) + 0.5;
      vec2 a = uv, b = uv;
      float m = smoothstep(0.0, 1.0, p);
      if (uCalm < 0.5) {
        float n = fbm(uv * uScale + uTime * 0.03);
        vec2 g = vec2(n, fbm(uv * uScale * 1.7 - uTime * 0.02)) - 0.5;
        a = uv + g * uIntensity * 0.5 * p;
        b = uv - g * uIntensity * 0.5 * (1.0 - p);
        m = smoothstep(n - 0.15, n + 0.15, p);
      }
      float ca = uCalm < 0.5 ? uSplit * env * 0.03 : 0.0;
      vec3 c = mix(split(tA, cover(a, uSizeA), ca), split(tB, cover(b, uSizeB), ca), m);
      c = mix(c, uShade, (1.0 - smoothstep(1.25, 0.25, length(vUv - 0.5))) * 0.28);
      gl_FragColor = vec4(c, 1.0);
    }`;

  const colorOf = (el, expr) => {
    const probe = document.createElement("i");
    probe.style.cssText = `display:none;color:${expr}`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };
  const rgb01 = (css) => {
    const p = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
    p.fillStyle = css; p.fillRect(0, 0, 1, 1);
    const d = p.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  // For slots without a photo (placeholders), a canvas with a diagonal and label drawn over the panel color replaces the photo
  const placeholder = (item, w, h) => {
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    const g = c.getContext("2d"), cs = getComputedStyle(item);
    g.fillStyle = colorOf(item, "var(--wf-fill, var(--kf-surface))");
    g.fillRect(0, 0, w, h);
    g.strokeStyle = colorOf(item, "var(--wf-line, var(--kf-line))");
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    g.fillStyle = colorOf(item, "var(--wf-fill-ink, var(--kf-ink))");
    g.font = `500 28px ${cs.getPropertyValue("--kf-font-mono").trim() || "monospace"}`;
    g.textAlign = "center";
    g.fillText(item.dataset.label || "", w / 2, h / 2, w * 0.9);
    return c;
  };

  kfFx.register("melt-morph-scroll", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (items.length < 2 || !window.OGL) return;
    const { Renderer, Program, Mesh, Triangle, Texture } = OGL;
    const intensity = +(options.intensity ?? 0.55), scale = +(options.scale ?? 2.4), splitAmt = +(options.split ?? 0.35), drift = +(options.drift ?? 0.4);
    const stage = document.createElement("div");
    stage.dataset.fxPart = "stage";
    const canvas = document.createElement("canvas");
    stage.append(canvas);
    el.prepend(stage);
    let renderer;
    try { renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio || 1, 2), alpha: false }); } catch (e) { stage.remove(); return; }
    const gl = renderer.gl;
    const textures = [], sizes = [];
    const blank = new Texture(gl, { image: new Uint8Array([0, 0, 0, 255]), width: 1, height: 1, generateMipmaps: false });
    const u = {
      tA: { value: blank }, tB: { value: blank }, uRes: { value: [1, 1] }, uSizeA: { value: [1, 1] }, uSizeB: { value: [1, 1] },
      uP: { value: 0 }, uIntensity: { value: intensity }, uScale: { value: scale }, uSplit: { value: splitAmt }, uDrift: { value: reduce ? 0 : drift },
      uTime: { value: 0 }, uCalm: { value: reduce ? 1 : 0 }, uShade: { value: rgb01(colorOf(el, `var(${options.shade || "--kf-ink"})`)) },
    };
    const geo = new Triangle(gl);
    const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms: u });
    const mesh = new Mesh(gl, { geometry: geo, program });
    let cur = 0;
    const load = (item, i) => {
      const img = item.tagName === "IMG" ? item : item.querySelector("img");
      const set = (src, w, h) => { textures[i] = new Texture(gl, { image: src, generateMipmaps: false }); sizes[i] = [w, h]; place(); };
      if (img) {
        const go = () => set(img, img.naturalWidth || 1, img.naturalHeight || 1);
        img.complete && img.naturalWidth ? go() : img.addEventListener("load", go, { once: true });
      } else set(placeholder(item, 1200, 800), 1200, 800);
    };
    const place = () => {
      const n = items.length, i = Math.min(Math.floor(cur), n - 1), j = Math.min(i + 1, n - 1);
      u.tA.value = textures[i] || blank; u.tB.value = textures[j] || blank;
      u.uSizeA.value = sizes[i] || [1, 1]; u.uSizeB.value = sizes[j] || [1, 1];
      u.uP.value = i === j ? 0 : cur - i;
    };
    const size = () => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height);
      u.uRes.value = [gl.canvas.width, gl.canvas.height];
    };
    // From when the panel’s top edge touches the top of the screen until its end touches the bottom, mapped 0 → (section count − 1)
    const read = () => {
      const r = el.getBoundingClientRect(), vh = scroller ? scroller.clientHeight : innerHeight;
      const top = scroller ? r.top - scroller.getBoundingClientRect().top : r.top;
      cur = Math.max(0, Math.min(1, -top / Math.max(1, el.offsetHeight - stage.clientHeight || vh))) * (items.length - 1);
      place();
    };
    items.forEach(load);
    const ro = new ResizeObserver(() => { size(); read(); });
    ro.observe(stage);
    let on = false, raf = 0;
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && !raf) raf = requestAnimationFrame(loop); });
    io.observe(el);
    const loop = (t) => {
      raf = 0;
      if (!on) return;
      u.uTime.value = t / 1000;
      read();
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    size(); read(); renderer.render({ scene: mesh });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      stage.remove();
    };
  });
})();
