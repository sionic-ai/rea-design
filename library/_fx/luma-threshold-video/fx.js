// Draws video·photos in black and white, erasing pixels darker than the threshold to the background color — lowering the threshold 1→.1 lifts from darkness starting with the brightest areas, and raising it sinks them back. Film noise over the whole screen
(() => {
  const VS = "attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
  const FS = `precision mediump float;
    uniform sampler2D t; uniform vec2 cover; uniform float gray; uniform vec3 bg; uniform float seed; uniform float grain; varying vec2 v;
    float r2(vec2 q){ return fract(sin(dot(q, vec2(12.9898 + seed, 78.233 + seed))) * 43758.5453 + seed); }
    void main(){ vec2 uv = (v - 0.5) * cover + 0.5; uv.y = 1.0 - uv.y;
      float l = dot(texture2D(t, uv).rgb, vec3(0.299, 0.587, 0.114));
      vec3 c = l < gray ? bg : vec3(l); c += grain * (r2(v) * 2.0 - 1.0); gl_FragColor = vec4(c, 1.0); }`;
  const rgb = (s) => {
    s = (s || "").trim();
    if (s[0] === "#") { const h = s.length === 4 ? s.slice(1).split("").map((c) => c + c).join("") : s.slice(1, 7); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
    const m = s.match(/\d+(\.\d+)?/g) || [0, 0, 0];
    return [m[0] / 255, m[1] / 255, m[2] / 255];
  };
  kfFx.register("luma-threshold-video", (el, { options, reduce }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media || !window.gsap) return;
    const from = +(options.from ?? 1), to = +(options.to ?? 0.1), dur = +(options.dur ?? 1.5), outDur = +(options.out ?? dur), grain = +(options.grain ?? 0.03);
    const ease = kfFx.ease(options.ease || "0.25,0.46,0.45,0.94", "power1.out");
    const cv = document.createElement("canvas");
    cv.className = "fx-luma-canvas";
    cv.setAttribute("aria-hidden", "true");
    el.appendChild(cv);
    const gl = cv.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl) { cv.remove(); return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    const U = (n) => gl.getUniformLocation(pr, n);
    const uCover = U("cover"), uGray = U("gray"), uBg = U("bg"), uSeed = U("seed"), uGrain = U("grain");
    const st = { gray: reduce ? to : from, seed: 0 };
    const bgColor = () => rgb(getComputedStyle(el).getPropertyValue("--fx-luma-bg") || getComputedStyle(document.documentElement).backgroundColor);
    let mw = 0, mh = 0, ready = false, bg = [0, 0, 0];
    const size = () => {
      const r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d));
      gl.viewport(0, 0, cv.width, cv.height);
      bg = bgColor();
    };
    // Video from another origin (or file://) can’t be read by WebGL — in that case remove the canvas and give the original video the same tempo with CSS grayscale and opacity.
    let tainted = false;
    const fallback = () => {
      tainted = true;
      gsap.ticker.remove(draw);
      cv.remove();
      el.classList.remove("fx-luma-on");
      el.classList.add("fx-luma-fallback");
      gsap.set(media, { opacity: 1 - st.gray });
    };
    const upload = () => {
      const vw = media.videoWidth || media.naturalWidth || media.width, vh = media.videoHeight || media.naturalHeight || media.height;
      if (!vw || (media.readyState !== undefined && media.readyState < 2)) return false;
      mw = vw; mh = vh;
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, media); } catch (e) { fallback(); return false; }
      return true;
    };
    const draw = () => {
      if (tainted) return;
      if (upload()) ready = true;
      if (!ready) return;
      const ea = cv.width / cv.height, ma = mw / mh;
      gl.uniform2f(uCover, ea > ma ? 1 : ea / ma, ea > ma ? ma / ea : 1);
      gl.uniform1f(uGray, st.gray);
      gl.uniform3fv(uBg, bg);
      st.seed = reduce ? 0 : (st.seed + 0.1) % 1;
      gl.uniform1f(uSeed, st.seed);
      gl.uniform1f(uGrain, grain);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const sync = () => tainted && gsap.set(media, { opacity: 1 - st.gray });
    const show = () => { gsap.killTweensOf(st); media.play && media.play().catch(() => {}); gsap.to(st, { gray: to, duration: reduce ? 0 : dur, ease, onUpdate: sync }); };
    const hide = () => { gsap.killTweensOf(st); gsap.to(st, { gray: from, duration: reduce ? 0 : outDur, ease, onUpdate: sync, onComplete: () => media.pause && media.pause() }); };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    gsap.ticker.add(draw);
    const ac = new AbortController();
    el.addEventListener("fx:play", show, { signal: ac.signal });
    el.addEventListener("fx:out", hide, { signal: ac.signal });
    el.addEventListener("fx:reset", () => { gsap.killTweensOf(st); st.gray = from; }, { signal: ac.signal });
    let io = null;
    if (options.on !== "manual") {
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? show() : hide()));
      io.observe(el);
    }
    el.classList.add("fx-luma-on");
    return () => {
      ac.abort(); io && io.disconnect(); ro.disconnect();
      gsap.ticker.remove(draw); gsap.killTweensOf(st);
      const lose = gl.getExtension("WEBGL_lose_context");
      lose && lose.loseContext();
      cv.remove();
      el.classList.remove("fx-luma-on", "fx-luma-fallback");
      gsap.set(media, { clearProps: "opacity" });
    };
  });
})();
