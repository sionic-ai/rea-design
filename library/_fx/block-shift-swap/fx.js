// The shader runs only during a change — while resting it shows the current picture (photo/video) element as is and hides the rest.
// Cell threshold and drift direction are read from a single 256² grayscale noise map (nearest point, repeat). Being gray, the drift is always diagonal.
(() => {
  const VERT = "attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}";
  const FRAG = `precision highp float;
uniform sampler2D tFrom;
uniform sampler2D tTo;
uniform sampler2D tNoise;
uniform float uProgress;
uniform float uTime;
uniform float uCells;
uniform float uDrift;
uniform float uWarp;
uniform float uSplit;
uniform vec4 uRes;
varying vec2 vUv;
vec4 split(sampler2D t, vec2 p, float s) {
  return vec4(texture2D(t, p + vec2(s, 0.0)).r, texture2D(t, p).g, texture2D(t, p - vec2(s, 0.0)).b, 1.0);
}
void main() {
  vec2 uv = (vUv - 0.5) * uRes.zw + 0.5;
  float bump = pow(4.0 * uProgress * (1.0 - uProgress), 2.0);
  float gate = step(texture2D(tNoise, floor(vUv * uCells) / uCells).g, uProgress);
  vec2 dir = (texture2D(tNoise, floor(fract(vUv + uTime * uDrift) * uCells) / uCells).rg - 0.5) * 2.0;
  vec2 p = uv + dir * bump * uWarp;
  float s = bump * uSplit;
  gl_FragColor = mix(split(tFrom, p, s), split(tTo, p, s), gate);
}`;
  const noise = (OGL, gl) => {
    const size = 256, data = new Uint8Array(size * size * 4);
    const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      let v = 0, f = 0.02, amp = 1;
      for (let o = 0; o < 4; o++) { v += hash(x * f + 0.37, y * f + 0.71) * amp; f *= 2; amp *= 0.5; }
      const c = 1 + Math.floor(((v / 1.875) % 1) * 254), k = (y * size + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = c;
      data[k + 3] = 255;
    }
    return new OGL.Texture(gl, { image: data, width: size, height: size, wrapS: gl.REPEAT, wrapT: gl.REPEAT, minFilter: gl.NEAREST, magFilter: gl.NEAREST, generateMipmaps: false, flipY: false });
  };
  const aspectOf = (m) => (m.videoWidth ? m.videoHeight / m.videoWidth : m.naturalWidth ? m.naturalHeight / m.naturalWidth : m.width ? m.height / m.width : 0);

  kfFx.register("block-shift-swap", (el, { options, reduce, hover }) => {
    const OGL = window.OGL;
    const media = [...el.querySelectorAll(':scope > [data-fx-part="media"]')];
    if (!OGL || media.length < 2) return;
    const dur = +(options.dur ?? 0.6);
    const ac = new AbortController(), on = { signal: ac.signal };
    const canvas = document.createElement("canvas");
    canvas.className = "fx-block-shift-swap__gl";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const renderer = new OGL.Renderer({ canvas, dpr: Math.min(devicePixelRatio || 1, 2), alpha: false, depth: false, stencil: false });
    const gl = renderer.gl;
    const textures = media.map((m) => { const t = new OGL.Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR }); t.image = m; return t; });
    const program = new OGL.Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      cullFace: false,
      uniforms: {
        tFrom: { value: textures[0] },
        tTo: { value: textures[1] },
        tNoise: { value: noise(OGL, gl) },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uCells: { value: +options.cells || 5 },
        uDrift: { value: +(options.drift ?? 0.04) },
        uWarp: { value: +(options.warp ?? 0.15) },
        uSplit: { value: +(options.split ?? 0.025) },
        uRes: { value: new OGL.Vec4() },
      },
    });
    const mesh = new OGL.Mesh(gl, { geometry: new OGL.Triangle(gl), program });
    let current = 0, target = 0, running = false, raf = 0, tw = null;
    const show = (i) => media.forEach((m, k) => {
      m.style.visibility = k === i ? "" : "hidden";
      if (m.play) { if (k === i) m.play().catch(() => {}); else m.pause(); }
    });
    const fit = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1, o = aspectOf(media[current]) || h / w;
      renderer.setSize(w, h);
      program.uniforms.uRes.value.set(w, h, h / w > o ? (w / h) * o : 1, h / w > o ? 1 : h / w / o);
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      [program.uniforms.tFrom.value, program.uniforms.tTo.value].forEach((t) => { if (t.image.tagName !== "IMG") t.needsUpdate = true; });
      program.uniforms.uTime.value += 0.05;
      renderer.render({ scene: mesh });
    };
    const go = (i) => {
      if (!(i >= 0 && i < media.length)) return;
      if (running) { target = i; return; }
      if (i === current) return;
      target = i;
      if (reduce) { current = i; show(i); return; }
      running = true;
      if (media[i].play) media[i].play().catch(() => {});
      fit();
      program.uniforms.tFrom.value = textures[current];
      program.uniforms.tTo.value = textures[i];
      textures[current].needsUpdate = textures[i].needsUpdate = true;
      program.uniforms.uProgress.value = 0;
      renderer.render({ scene: mesh });
      canvas.style.visibility = "visible";
      raf = requestAnimationFrame(frame);
      tw = gsap.to(program.uniforms.uProgress, {
        value: 1,
        duration: dur,
        ease: "power3.out",
        onComplete: () => {
          cancelAnimationFrame(raf);
          current = i;
          running = false;
          show(i);
          canvas.style.visibility = "hidden";
          if (target !== current) go(target);
        },
      });
    };
    show(0);
    el.addEventListener("fx:goto", (e) => go(Number(e.detail)), on);
    if (options.on) {
      const pick = (e) => { const t = e.target.closest?.(options.on); if (t) go(Number(t.getAttribute("data-key"))); };
      if (hover) { document.addEventListener("mouseover", pick, { signal: ac.signal, passive: true }); document.addEventListener("focusin", pick, { signal: ac.signal, passive: true }); }
      else document.addEventListener("click", pick, { signal: ac.signal, passive: true });
    }
    const ro = new ResizeObserver(() => { if (running) fit(); });
    ro.observe(el);
    return () => {
      ac.abort();
      ro.disconnect();
      tw?.kill();
      cancelAnimationFrame(raf);
      media.forEach((m) => { m.style.visibility = ""; });
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
