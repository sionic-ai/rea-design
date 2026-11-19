(() => {
  // The paper curtain burns open like spreading ink (reveal) and covers again (cover). Distance from the start point plus warped noise is compared with a threshold,
  // Lay a wide band and a thin capillary band in the accent color right around the threshold. The film has paper grain (fine grain + coarse blotches).
  const VERT = "attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}";
  const FRAG = `
precision highp float;
varying vec2 v;
uniform vec2 res, org;
uniform float p, dir, seed, edge;
uniform vec3 paper, rim, deep;
float hs(vec2 q) { vec3 r = fract(vec3(q.xyx) * .1031); r += dot(r, r.yzx + 33.33); return fract((r.x + r.y) * r.z); }
float vn(vec2 q) {
  vec2 i = floor(q), f = fract(q), u = f * f * (3. - 2. * f);
  return mix(mix(hs(i), hs(i + vec2(1., 0.)), u.x), mix(hs(i + vec2(0., 1.)), hs(i + 1.), u.x), u.y);
}
float fb(vec2 q) {
  float s = 0., k = .5;
  for (int i = 0; i < 5; i++) { s += k * vn(q); q = mat2(1.62, 1.18, -1.18, 1.62) * q + vec2(3.7, 9.1); k *= .5; }
  return s;
}
void main() {
  vec2 sk = vec2(seed * 1.73, seed * -.91);
  vec2 ar = vec2(res.x / max(res.y, 1.), 1.);
  float far = length(max(org, 1. - org) * ar);
  float r = length((v - org) * ar) / max(far, .001);
  vec2 bend = vec2(fb(v * 2.4 + sk), fb(v * 2.4 - sk + vec2(2.9, 7.4)));
  float blot = fb(v * 1.9 + 2.1 * bend + sk * .7) - .5;
  float field = r + blot * .28 + (vn(v * vec2(18., 14.) + sk * 1.5) - .5) * .012;
  float cut = dir > .5 ? p * 1.18 - .06 : p * 1.24 + .01;
  float gap = field - cut;
  float soft = mix(.075, .038, p);
  float near = 1. - smoothstep(-soft, soft, gap);
  float a = dir > .5 ? near : 1. - near;
  float fiber = (hs(v * res * .35 + sk) - .5) * .024 + (vn(v * 42. + sk) - .5) * .014;
  vec3 sheet = clamp(paper + fiber * vec3(.9, .75, .55), 0., 1.);
  float live = smoothstep(.01, .08, p) * (1. - smoothstep(.92, .99, p));
  float wide = smoothstep(0., 1., 1. - smoothstep(0., mix(.068, .034, p), abs(gap))) * live;
  float thin = smoothstep(0., 1., 1. - smoothstep(0., mix(.022, .011, p), abs(gap))) * live;
  vec3 c = mix(sheet, rim, wide * edge);
  c = mix(c, mix(rim, deep, .45), thin * edge * 1.35);
  gl_FragColor = vec4(c * a, a);
}`;
  const KEY = "fx-ink-paper-veil";
  const rgb = (el, v) => {
    const probe = document.createElement("i");
    probe.style.color = v; el.append(probe);
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = getComputedStyle(probe).color; probe.remove();
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("ink-paper-veil", (root, { options, reduce }) => {
    const coverDur = +(options.cover ?? 2.8), revealDur = +(options.reveal ?? 2.8), at = +(options.at ?? 0.94);
    const ox = +(options.x ?? -0.16), oy = +(options.y ?? 1.16), edge = +(options.edge ?? 0.08);
    const first = options.first || "reveal";
    const box = document.createElement("div");
    box.className = "fx-ink-veil";
    box.setAttribute("aria-hidden", "true");
    const cv = document.createElement("canvas");
    box.append(cv);
    root.append(box);
    const cs = getComputedStyle(root);
    const gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    let prog = null, U = () => null;
    if (gl) {
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
    }
    if (prog) {
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const cache = {};
      U = (n) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(prog, n)));
      gl.uniform3fv(U("paper"), rgb(root, cs.getPropertyValue("--fx-paper").trim() || "var(--kf-bg)"));
      gl.uniform3fv(U("rim"), rgb(root, cs.getPropertyValue("--fx-rim").trim() || "var(--kf-accent)"));
      gl.uniform3fv(U("deep"), rgb(root, cs.getPropertyValue("--fx-rim-deep").trim() || "var(--kf-accent-text)"));
    }
    const s = { p: 0, dir: 0, x: ox, y: oy, seed: 1, edge };
    const fit = () => {
      if (!prog) return;
      const k = innerWidth <= 767 ? 1 : Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(box.clientWidth * k)), h = Math.max(1, Math.round(box.clientHeight * k));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      gl.viewport(0, 0, w, h);
      draw();
    };
    // Option x·y are relative to the top left of the screen (0~1) — GL has 0 at the bottom, so y is flipped when passed
    const draw = () => {
      if (!prog) { box.style.opacity = String(s.dir ? s.p : 1 - s.p); return; }
      gl.uniform2f(U("res"), cv.width, cv.height);
      gl.uniform2f(U("org"), s.x, 1 - s.y);
      gl.uniform1f(U("p"), s.p);
      gl.uniform1f(U("dir"), s.dir);
      gl.uniform1f(U("seed"), s.seed);
      gl.uniform1f(U("edge"), s.edge);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const show = (on, block) => { box.style.visibility = on ? "visible" : "hidden"; box.style.pointerEvents = block ? "auto" : "none"; };
    let tw = null;
    const play = (d = {}) => new Promise((done) => {
      tw?.kill();
      const cover = d.direction === "cover";
      Object.assign(s, { p: 0, dir: cover ? 1 : 0, x: +(d.x ?? ox), y: +(d.y ?? oy), seed: +(d.seed ?? Math.random() * 12), edge: +(d.edge ?? edge) });
      show(true, d.block ?? true);
      const end = () => { if (!cover) show(false, false); root.dispatchEvent(new CustomEvent(cover ? "fx:covered" : "fx:revealed", { bubbles: true })); done(); };
      if (reduce) { s.p = 1; draw(); d.onProgress?.(1); return void (tw = gsap.delayedCall(0.25, end)); }
      draw();
      tw = gsap.to(s, { p: 1, duration: +(d.dur ?? (cover ? coverDur : revealDur)), ease: d.ease || (cover ? "sine.in" : "sine.out"), onUpdate: () => { draw(); d.onProgress?.(s.p); }, onComplete: end });
    });
    const covered = (block = true) => { tw?.kill(); Object.assign(s, { p: 0, dir: 0 }); show(true, block); draw(); };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);

    // If arrived via a transition, start covered and then uncover — the first visit follows first (if wait, stays covered until fx:ink-play)
    let arrived = false;
    try { arrived = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch {}
    if (arrived) {
      document.documentElement.classList.add("fx-ink-arrived");
      covered();
      play({ direction: "reveal", dur: revealDur, ease: options["reveal-ease"] || "sine.out" });
    } else if (first === "wait") covered(false);
    else if (first === "reveal") { covered(); play({ direction: "reveal", dur: revealDur, ease: options["reveal-ease"] || "sine.out" }); }
    else show(false, false);

    const ac = new AbortController(), on = { signal: ac.signal };
    root.addEventListener("fx:ink-play", (e) => play(e.detail || {}).then(() => e.detail?.done?.()), on);
    addEventListener("pageshow", (e) => { if (e.persisted) { tw?.kill(); show(false, false); } }, on);
    if (options.links !== "off") root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || a.origin !== location.origin || a.href.split("#")[0] === location.href.split("#")[0]) return;
      e.preventDefault();
      if (reduce) return void (location.href = a.href);
      let gone = false;
      const go = () => { if (gone) return; gone = true; try { sessionStorage.setItem(KEY, "1"); } catch {} location.href = a.href; };
      play({ direction: "cover", dur: coverDur, ease: options["cover-ease"] || "sine.in", onProgress: (q) => q >= at && go() }).then(go);
    }, on);
    return () => { ac.abort(); tw?.kill(); ro.disconnect(); gl?.getExtension("WEBGL_lose_context")?.loseContext(); box.remove(); };
  });
})();
