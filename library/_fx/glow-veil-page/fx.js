// Clicking a same-site link makes an accent glow swell from the bottom of the screen (1.7s) and cover it with a dark veil, while the destination name rises 18px and fades in.
// While the light fills to the screen edge (1.5s), the name slips 14px up at .38s and hands over at that spot .9s later. The arriving page continues filling from there, then lifts away at 50ms
(() => {
  const KEY = "fx-glow-veil";
  const FRAG = `precision highp float;
uniform vec2 uRes; uniform float uT; uniform float uReveal; uniform float uExit; uniform float uAlpha; uniform float uTop;
uniform vec3 uBase; uniform vec3 uA; uniform vec3 uB; uniform vec2 uM; uniform float uMk;
float hs(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hs(i), hs(i + vec2(1., 0.)), u.x), mix(hs(i + vec2(0., 1.)), hs(i + vec2(1.)), u.x), u.y); }
float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= .5; } return s; }
float th(float x){ float e = exp(2. * clamp(x, -10., 10.)); return (e - 1.) / (e + 1.); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; if (uTop > .5) uv.y = 1. - uv.y;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - vec2(.5, 0.)) * vec2(asp, 1.);
  vec2 w = vec2(fb(p * 1.4 + vec2(uT * .06, 0.)), fb(p * 1.4 + vec2(3.7, -uT * .05))) - .5;
  p += w * .35;
  float ex = clamp(uExit * 1.12, 0., 1.); ex = ex * (.5 + .5 * ex);
  float rv = clamp(uReveal, 0., 1.);
  vec2 c = vec2(sin(uT * .18) * .05 * asp, -.45 + .37 * rv + sin(uT * .26 + 2.1) * .03);
  c = mix(c, vec2(0., .5), ex);
  vec2 r = vec2(.5 * asp, .42) * (.05 + 1.6 * rv);
  r = mix(r, vec2(2.4 * asp, 2.6), ex);
  vec2 q = (p - c) / r; float d = (dot(q, q) - 1.) * min(r.x, r.y) * .5;
  float sg = .16 + .22 * rv + .3 * ex;
  float a = .5 - .5 * th(.85 * d / sg);
  vec2 mm = (uv - uM) * vec2(asp, 1.);
  a = clamp(a + uMk * exp(-dot(mm, mm) * 18.) * (1. - a), 0., 1.);
  vec3 g = mix(uA, uB, clamp(uv.y * .9 + a * .3 + ex * .4, 0., 1.));
  vec3 col = mix(uBase, g, a);
  float al = max(a, clamp(uAlpha, 0., 1.));
  gl_FragColor = vec4(col * al, al);
}`;
  const rgb = (probe, prop) => {
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    c.fillStyle = getComputedStyle(probe)[prop]; c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const cl = (v) => Math.max(0, Math.min(1, v));
  const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  kfFx.register("glow-veil-page", (root, { options, reduce }) => {
    const inMs = 1000 * +(options.dur ?? 1.7), holdMs = 1000 * +(options.hold ?? 1.5), outMs = 1000 * +(options.out ?? 0.05);
    const leaveAt = Math.min(holdMs, 1000 * +(options.leave ?? 0.9));
    const ac = new AbortController(), on = { signal: ac.signal };
    const veil = document.createElement("div"); veil.className = "fx-glow-veil"; veil.setAttribute("aria-hidden", "true");
    const cv = document.createElement("canvas"), grain = document.createElement("div"), label = document.createElement("div");
    grain.className = "fx-glow-veil__grain"; label.className = "fx-glow-veil__label";
    veil.append(cv, grain, label); document.body.append(veil);
    const gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    let draw = () => {};
    const st = { op: 0, reveal: 0, exit: 0, alpha: 0 };
    if (gl) {
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const U = (n) => gl.getUniformLocation(pr, n);
      gl.uniform3f(U("uBase"), ...rgb(cv, "outlineColor")); gl.uniform3f(U("uA"), ...rgb(cv, "color")); gl.uniform3f(U("uB"), ...rgb(cv, "borderTopColor"));
      gl.uniform1f(U("uTop"), 0); gl.uniform2f(U("uM"), 0.5, 0.5); gl.uniform1f(U("uMk"), 0);
      const size = () => { const k = Math.min(devicePixelRatio, 1.5) * 0.6; cv.width = Math.max(2, Math.round(innerWidth * k)); cv.height = Math.max(2, Math.round(innerHeight * k)); gl.viewport(0, 0, cv.width, cv.height); };
      size(); addEventListener("resize", () => (size(), draw()), on);
      const t0 = performance.now();
      draw = () => {
        gl.uniform2f(U("uRes"), cv.width, cv.height); gl.uniform1f(U("uT"), (performance.now() - t0) / 1000);
        gl.uniform1f(U("uReveal"), st.reveal); gl.uniform1f(U("uExit"), st.exit); gl.uniform1f(U("uAlpha"), st.alpha);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); if (st.op > 0) gl.drawArrays(gl.TRIANGLES, 0, 3);
        cv.style.opacity = String(st.op);
      };
    }
    const live = !!gl && !reduce && inMs > 0;
    let raf = 0;
    const run = (ms, step, done) => {
      let acc = 0, last = 0;
      const f = (now) => { acc += last ? Math.min(now - last, 34) : 0; last = now; const t = ms > 0 ? cl(acc / ms) : 1; const stop = step(t, acc); draw(); if (stop) return; if (t < 1) raf = requestAnimationFrame(f); else done && done(); };
      raf = requestAnimationFrame(f);
    };
    const hold = (from, until, done) => run(holdMs, (l, acc) => {
      const ms = from + acc, k = cl(ms / holdMs), c = io(cl(ms / 380));
      label.style.opacity = String(1 - c); label.style.transform = `translateY(${-14 * c}px)`;
      st.reveal = 0.65 + 0.35 * k; st.exit = k; grain.style.opacity = String(0.14 * (1 - cl((k - 0.55) / 0.35)));
      if (ms >= until) { done(); return true; }
    });
    const cover = (text, href) => {
      veil.classList.add("is-on"); label.textContent = text; st.op = 0; st.reveal = 0; st.alpha = 0; st.exit = 0;
      run(inMs, (t) => {
        st.op = io(t); st.reveal = t * (0.55 + 0.45 * t) * 0.65; st.alpha = io(cl((t - 0.4) / 0.5));
        grain.style.opacity = String(0.14 * io(cl((t - 0.35) / 0.5)));
        const u = io(cl((t - 0.6) / 0.4)); label.style.opacity = String(u); label.style.transform = `translateY(${(1 - u) * 18}px)`;
      }, () => hold(0, leaveAt, () => { sessionStorage.setItem(KEY, JSON.stringify({ text, at: leaveAt })); location.href = href; }));
    };
    // Router type (nav: router) — like a single-page app, the cover stays down while only the body changes. Links are received by the router (barba etc.),
    // The router covers with root.fxGlowVeil.cover(name) and swaps the body at the handoff point (.9s), then lifts the cover with reveal()
    const routed = options.nav === "router";
    let want = null;
    const finish = () => {
      veil.classList.remove("is-on"); veil.style.opacity = ""; st.op = 0; draw();
      document.documentElement.classList.remove("fx-veiled");
      dispatchEvent(new CustomEvent("fx:veil-done"));
    };
    // The full cover waits endlessly — even if the next body arrives late, the veil does not lift first. When a lift request comes, it announces early ahead of time and then lifts.
    // Time is measured by wall clock — so even if frames stall while the body is swapped and the new section stage is built, the clearing time isn’t pushed back by that much (the original walks it with a timer)
    const holdOpen = (atLeave) => {
      let acc = 0, t0 = 0, left = false, told = false, liftAt = 0;
      const f = (now) => {
        if (!t0) t0 = now; acc = now - t0;
        const ms = Math.min(acc, holdMs), k = cl(ms / holdMs), c = io(cl(ms / 380));
        label.style.opacity = String(1 - c); label.style.transform = `translateY(${-14 * c}px)`;
        st.reveal = 0.65 + 0.35 * k; st.exit = k; grain.style.opacity = String(0.14 * (1 - cl((k - 0.55) / 0.35))); draw();
        if (!left && acc >= leaveAt) { left = true; atLeave(); }
        if (want && !liftAt) liftAt = Math.max(holdMs, acc + want.early);
        if (want && !told && acc >= liftAt - want.early) { told = true; want.onEarly?.(); }
        if (want && acc >= liftAt) { const w = want; want = null; run(outMs, (t) => { veil.style.opacity = String(1 - io(t)); }, () => { finish(); w.res(); }); return; }
        raf = requestAnimationFrame(f);
      };
      raf = requestAnimationFrame(f);
    };
    root.fxGlowVeil = {
      cover: (text = "") => new Promise((res) => {
        if (!live) return res();
        cancelAnimationFrame(raf); want = null;
        veil.classList.add("is-on"); veil.style.opacity = ""; label.textContent = text; st.op = 0; st.reveal = 0; st.alpha = 0; st.exit = 0;
        document.documentElement.classList.add("fx-veiled");
        run(inMs, (t) => {
          st.op = io(t); st.reveal = t * (0.55 + 0.45 * t) * 0.65; st.alpha = io(cl((t - 0.4) / 0.5));
          grain.style.opacity = String(0.14 * io(cl((t - 0.35) / 0.5)));
          const u = io(cl((t - 0.6) / 0.4)); label.style.opacity = String(u); label.style.transform = `translateY(${(1 - u) * 18}px)`;
        }, () => holdOpen(res));
      }),
      reveal: ({ early = 0, onEarly } = {}) => new Promise((res) => {
        if (!live || !veil.classList.contains("is-on")) { onEarly?.(); return res(); }
        want = { early, onEarly, res };
      }),
    };
    const saved = sessionStorage.getItem(KEY);
    if (saved) {
      sessionStorage.removeItem(KEY);
      if (live) {
        const { text = "", at = leaveAt } = JSON.parse(saved);
        veil.classList.add("is-on"); label.textContent = text; st.op = 1; st.alpha = 1; draw();
        document.documentElement.classList.add("fx-veiled");
        run(Math.max(0, holdMs - at), (t, acc) => {
          const ms = at + acc, k = cl(ms / holdMs), c = io(cl(ms / 380));
          label.style.opacity = String(1 - c); st.reveal = 0.65 + 0.35 * k; st.exit = k; grain.style.opacity = String(0.14 * (1 - cl((k - 0.55) / 0.35)));
        }, () => run(outMs, (t) => { veil.style.opacity = String(1 - io(t)); }, finish));
      }
    }
    addEventListener("pageshow", (e) => { if (e.persisted) { cancelAnimationFrame(raf); veil.classList.remove("is-on"); st.op = 0; draw(); } }, on);
    if (!routed) root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || a.origin !== location.origin || a.href === location.href) return;
      e.preventDefault();
      if (!live) return void (location.href = a.href);
      cancelAnimationFrame(raf);
      cover((a.dataset.veilLabel || a.textContent || "").replace(/\s+/g, " ").trim(), a.href);
    }, on);
    return () => {
      ac.abort(); cancelAnimationFrame(raf); delete root.fxGlowVeil;
      document.documentElement.classList.remove("fx-veiled");
      gl?.getExtension("WEBGL_lose_context")?.loseContext(); veil.remove();
    };
  });
})();
