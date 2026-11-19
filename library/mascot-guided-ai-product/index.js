// Home page: app window script (200ms beat), grid of 100 people, office steps, wiki, march, auto-advancing security strip, globe (our shader)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TICK = 200;
  const sleep = (n) => new Promise((r) => setTimeout(r, n * TICK));
  const COLORS = ["", "purple", "green", "blue", "pink", "teal", "yellow", "red", ""];

  document.querySelectorAll("[data-os]").forEach((e) => (e.innerHTML = window.tIcon.dl + window.tIcon.grid));
  document.querySelectorAll("[data-check]").forEach((e) => e.insertAdjacentHTML("afterbegin", window.tIcon.check));

  // ---------- 100-person grid — original positions (%) · delays (ms) kept as is, rising from the lower rows first (.36s cubic-bezier(.22,1,.36,1)) ----------
  const H = [[8.333,6.553,440,7],[13.889,6.553,448,8],[36.111,6.553,456,6],[41.667,6.553,464,7],[47.222,6.553,472,8],[52.778,6.553,480,6],[75,6.553,488,7],[80.556,6.553,496,8],[86.111,6.553,504,6],[91.667,6.553,512,7],[5.556,17.415,406,4],[11.111,17.415,414,5],[16.667,17.415,422,3],[33.333,17.415,360,3],[38.889,17.415,368,4],[44.444,17.415,376,5],[50,17.415,384,3],[55.556,17.415,392,4],[72.222,17.415,400,4],[77.778,17.415,408,5],[83.333,17.415,416,3],[88.889,17.415,424,4],[94.444,17.415,432,5],[2.778,28.277,318,1],[8.333,28.277,326,2],[13.889,28.277,334,0],[30.556,28.277,342,0],[36.111,28.277,350,1],[52.778,28.277,358,1],[58.333,28.277,366,2],[69.444,28.277,374,1],[75,28.277,382,2],[91.667,28.277,390,2],[97.222,28.277,398,0],[11.111,39.139,308,8],[16.667,39.139,316,6],[33.333,39.139,324,6],[38.889,39.139,332,7],[50,39.139,270,6],[55.556,39.139,278,7],[72.222,39.139,286,7],[77.778,39.139,294,8],[88.889,39.139,302,7],[94.444,39.139,310,8],[8.333,50.001,228,3],[13.889,50.001,236,4],[30.556,50.001,244,4],[36.111,50.001,252,5],[52.778,50.001,260,5],[58.333,50.001,268,3],[69.444,50.001,276,5],[75,50.001,284,3],[91.667,50.001,292,3],[97.222,50.001,300,4],[11.111,60.863,218,0],[16.667,60.863,226,1],[33.333,60.863,234,1],[38.889,60.863,242,2],[50,60.863,180,1],[55.556,60.863,188,2],[72.222,60.863,196,2],[77.778,60.863,204,0],[88.889,60.863,212,2],[94.444,60.863,220,0],[8.333,71.725,138,6],[13.889,71.725,146,7],[30.556,71.725,154,7],[36.111,71.725,162,8],[52.778,71.725,170,8],[58.333,71.725,178,6],[69.444,71.725,186,8],[75,71.725,194,6],[91.667,71.725,202,6],[97.222,71.725,210,7],[5.556,82.587,96,3],[11.111,82.587,104,4],[16.667,82.587,112,5],[22.222,82.587,120,3],[33.333,82.587,128,5],[38.889,82.587,136,3],[44.444,82.587,144,4],[50,82.587,152,5],[55.556,82.587,90,3],[72.222,82.587,98,3],[77.778,82.587,106,4],[83.333,82.587,114,5],[88.889,82.587,122,3],[94.444,82.587,130,4],[2.778,93.449,0,0],[8.333,93.449,8,1],[13.889,93.449,16,2],[19.444,93.449,24,0],[36.111,93.449,32,0],[41.667,93.449,40,1],[47.222,93.449,48,2],[52.778,93.449,56,0],[75,93.449,64,1],[80.556,93.449,72,2],[86.111,93.449,80,0],[91.667,93.449,88,1]];
  const hundred = $(".h-hundred");
  if (hundred) {
    hundred.innerHTML = H.map(([l, t, d, c]) => `<span class="t-tera" data-c="${COLORS[c]}" style="left:${l}%;top:${t}%;--d:${d}ms"></span>`).join("");
    window.tPaintTeras(hundred);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { hundred.setAttribute("data-in", ""); io.disconnect(); } }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(hundred);
  }

  // ---------- Parade — 19 small mascots waddle (.5s, staggered by −.09s each) ----------
  const parade = $(".h-parade");
  if (parade) {
    const row = (n, b, z, d0) => Array.from({ length: n }, (_, i) => `<span class="t-tera" data-flat data-c="${COLORS[(i * 3 + z) % 8]}" style="right:${142 + z * 16 + i * 32}px;bottom:${b}px;z-index:${2 - z};--d:${-(d0 + i * 0.09).toFixed(2)}s"></span>`).join("");
    parade.innerHTML = row(10, 0, 0, 2.19) + row(9, 12, 1, 2.24);
    window.tPaintTeras(parade);
  }

  // ---------- App window script: original FvStage, 200ms beat, calling → walking in → conversation → AI thinking · answer → going back → idea room → lounge ----------
  const floor = $(".h-floor");
  if (floor && !reduce) {
    const who = (k) => floor.querySelector(`[data-who="${k}"]`);
    const home = new Map($$("[data-who]", floor).map((el) => [el, [el.style.left, el.style.top]]));
    const say = (k, hold) => new Promise((res) => {
      const el = who(k), bubble = el?.querySelector(".h-say");
      if (!bubble) return res();
      el.setAttribute("data-speaking", "");
      bubble.addEventListener("fx:typed", () => { el.removeAttribute("data-speaking"); setTimeout(() => (bubble.textContent = ""), hold * TICK); res(); }, { once: true });
      bubble.dispatchEvent(new Event("fx:play"));
    });
    const think = async (k, n) => { const b = who(k)?.querySelector(".h-say"); if (!b) return; b.textContent = "Thinking…"; await sleep(n); b.textContent = ""; };
    const go = (k, to) => { const el = who(k); if (!el) return; const [l, t] = to || home.get(el); el.style.left = l; el.style.top = t; };
    const look = (f) => (floor.dataset.focus = f);
    const clearAll = () => $$(".h-say", floor).forEach((b) => (b.textContent = ""));
    let alive = true;
    const run = async () => {
      clearAll();
      while (alive) {
        await sleep(3); await say("caller", 14); await sleep(5);
        look("walker"); await say("walker", 8); await sleep(4);
        look("meeting"); go("walker", ["26%", "30%"]); await sleep(3);
        await say("walker", 12); await sleep(4); await say("caller", 30); await sleep(5);
        await think("tera", 5); await say("tera", 22); await sleep(8);
        await say("walker", 14); await sleep(6); await say("caller", 12); await sleep(8);
        go("walker"); await sleep(2); look("idea"); await sleep(2);
        await say("idea", 28); await sleep(4); await think("ideaTera", 5); await say("ideaTera", 22); await sleep(6); await say("idea", 12); await sleep(10);
        look("relax"); go("caller", ["37%", "72%"]); await sleep(3); await say("caller", 14); await sleep(5);
        await say("relax", 16); await sleep(6); await say("caller", 10); await sleep(6);
        go("caller"); look("meeting"); await sleep(5);
      }
    };
    // Runs only while visible on screen (the original also counts beats only when inView)
    let started = false;
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) { started = true; run(); } }).observe(floor);
    // Wandering AI — a few steps at a time with 1s cubic-bezier(.45,0,.2,1)
    $$(".h-agent--roam", floor).forEach((a, i) => {
      const step = () => { a.style.translate = `calc(-50% + ${Math.round(Math.sin(Date.now() / 900 + i) * 30)}px) calc(-50% + ${Math.round(Math.cos(Date.now() / 1100 + i * 2) * 18)}px)`; };
      a.style.transition = "translate 1s cubic-bezier(.45, 0, .2, 1)";
      // The original bottom AI starts moving from the script’s walk-in (about 6.8s) — it stays still for the first few seconds
      setTimeout(() => setInterval(step, 2400 + i * 600), 4200);
    });
    addEventListener("pagehide", () => (alive = false));
  }

  // ---------- The floating mascot follows the cursor (original BotPeekFollow — ratio of the whole window) ----------
  const fvWin = $(".h-window");
  if (fvWin && matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    let pr = 0, px = 0, py = 0;
    addEventListener("pointermove", (e) => {
      px = (e.clientX / innerWidth) * 2 - 1; py = (e.clientY / innerHeight) * 2 - 1;
      pr ||= requestAnimationFrame(() => { pr = 0; fvWin.style.setProperty("--peek-x", px.toFixed(3)); fvWin.style.setProperty("--peek-y", py.toFixed(3)); });
    }, { passive: true });
  }

  // ---------- Office steps — number of marker lines passed above 60% of the screen − 1 ----------
  const marks = $$(".h-shot-marks > div"), steps = $$(".h-step"), shots = $$(".h-shot");
  if (marks.length && steps.length) {
    let cur = -1, raf = 0;
    const set = (i) => {
      if (i === cur) return;
      cur = i;
      steps.forEach((s, k) => s.toggleAttribute("data-on", k === i));
      shots.forEach((s, k) => s.toggleAttribute("data-dim", k !== i));
    };
    const sync = () => { raf = 0; if (innerWidth < 1024) return set(0); set(Math.max(0, marks.filter((m) => m.getBoundingClientRect().top < innerHeight * 0.6).length - 1)); };
    addEventListener("scroll", () => (raf ||= requestAnimationFrame(sync)), { passive: true });
    addEventListener("resize", sync);
    sync();
    steps.forEach((s, k) => s.addEventListener("click", () => {
      if (innerWidth < 1024) return set(k);
      const m = marks[k]; scrollTo({ top: scrollY + m.getBoundingClientRect().top - innerHeight * 0.3, behavior: reduce ? "auto" : "smooth" });
    }));
  }

  // ---------- Wiki — pressing the side list changes the page ----------
  $$(".h-wk-item").forEach((b) => b.addEventListener("click", () => {
    $$(".h-wk-item").forEach((x) => x.removeAttribute("aria-current"));
    b.setAttribute("aria-current", "true");
    $$("[data-wk-title]").forEach((t) => (t.textContent = b.textContent));
  }));

  // ---------- Security band — advances one slot every 8 seconds, back to the start at the end. Pauses on press or focus ----------
  const track = $(".h-sec-track"), dotsBox = $(".h-sec-dots");
  if (track && dotsBox) {
    const dots = $$(".h-sec-pill button", dotsBox), play = $(".h-sec-play", dotsBox);
    let paused = reduce, idx = 0, acc = 0;
    const setPaused = (p) => { paused = p; dotsBox.toggleAttribute("data-paused", p); play.setAttribute("aria-label", p ? "Resume Auto-Advance" : "Pause auto-advance"); };
    setPaused(paused);
    const current = () => { const c = track.children; const x = track.scrollLeft; let best = 0; for (let i = 0; i < c.length; i++) if (Math.abs(c[i].offsetLeft - c[0].offsetLeft - x) < Math.abs(c[best].offsetLeft - c[0].offsetLeft - x)) best = i; return best; };
    const mark = (i) => { if (i === idx && dots[i].hasAttribute("data-on")) return; idx = i; dots.forEach((d, k) => { d.removeAttribute("data-on"); if (k === i) { void d.offsetWidth; d.setAttribute("data-on", ""); } }); };
    track.addEventListener("scroll", () => mark(current()), { passive: true });
    let seen = false;
    new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(track);
    setInterval(() => {
      if (paused || !seen) return;
      acc += 100;
      if (acc < 8000) return;
      acc = 0;
      const max = track.scrollWidth - track.clientWidth, w = track.children[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap);
      track.scrollTo({ left: track.scrollLeft >= max - 2 ? 0 : Math.min(max, track.scrollLeft + w), behavior: "smooth" });
    }, 100);
    track.addEventListener("pointerdown", () => setPaused(true));
    track.addEventListener("focus", () => setPaused(true));
    play.addEventListener("click", () => { setPaused(!paused); acc = 0; });
    dots.forEach((d, k) => d.addEventListener("click", () => { const c = track.children; track.scrollTo({ left: c[k].offsetLeft - c[0].offsetLeft, behavior: "smooth" }); acc = 0; }));
    mark(0);
  }

  // ---------- Globe — our own shader: paints noise continents on an orthographic sphere (ocean=Plane, ground=ink 10%), with latitude-longitude lines, arcs, orbits and city markers drawn on top in 2D ----------
  const land = $(".h-globe-land"), ink = $(".h-globe-ink");
  if (land && ink) {
    const RAD = Math.PI / 180;
    const CITIES = [[139.7, 35.7], [-122.4, 37.8], [-74, 40.7], [-46.6, -23.5], [13.4, 52.5], [77.6, 13], [36.8, -1.3], [151.2, -33.9]];
    const ARCS = [[0, 1], [0, 5], [0, 7], [1, 2], [2, 3], [2, 4], [4, 6], [4, 5]];
    const ORBITS = [{ r: 1.22, tilt: 62, roll: 78, dash: [], speed: 0.05, sats: [[0.1, "dot"], [0.55, "ring"]] }, { r: 1.28, tilt: 66, roll: 32, dash: [6, 5], speed: -0.035, sats: [[0.3, "ring"], [0.8, "pip"]] }, { r: 1.16, tilt: 76, roll: -14, dash: [12, 4, 2, 4], speed: 0.04, sats: [[0.2, "dot"], [0.65, "pip"]] }];
    const css = getComputedStyle(document.documentElement);
    const rgb = (v) => { const c = document.createElement("canvas").getContext("2d"); c.fillStyle = css.getPropertyValue(v).trim(); c.fillRect(0, 0, 1, 1); return [...c.getImageData(0, 0, 1, 1).data].slice(0, 3); };
    const sea = rgb("--kf-surface"), inkC = rgb("--kf-ink"), mk = rgb("--site-tera-green");
    const mix = (a, b, t) => a.map((x, i) => (x + (b[i] - x) * t) / 255);
    const inkStr = css.getPropertyValue("--kf-ink").trim(), paperStr = css.getPropertyValue("--kf-surface").trim();
    const project = (lon, lat, centre) => { const r = (lon - centre) * RAD, l = lat * RAD; return { x: Math.cos(l) * Math.sin(r), y: Math.sin(l), z: Math.cos(l) * Math.cos(r) }; };
    const vec = ([lo, la]) => [Math.cos(la * RAD) * Math.cos(lo * RAD), Math.cos(la * RAD) * Math.sin(lo * RAD), Math.sin(la * RAD)];
    const slerp = (a, b, t) => { const [p, q] = [vec(a), vec(b)]; const w = Math.acos(Math.min(1, Math.max(-1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]))); const s = Math.sin(w) || 1; const [u, v] = [Math.sin((1 - t) * w) / s, Math.sin(t * w) / s]; const [x, y, z] = p.map((e, i) => e * u + q[i] * v); return [Math.atan2(y, x) / RAD, Math.asin(Math.max(-1, Math.min(1, z))) / RAD]; };
    const orbitAt = (o, a) => { const [ct, st] = [Math.cos(o.tilt * RAD), Math.sin(o.tilt * RAD)]; let [x, y, z] = [Math.cos(a), Math.sin(a) * ct, Math.sin(a) * st]; const [cr, sr] = [Math.cos(o.roll * RAD), Math.sin(o.roll * RAD)]; [x, y] = [x * cr - y * sr, x * sr + y * cr]; return { x: x * o.r, y: y * o.r, z: z * o.r }; };

    const gl = land.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    let prog = null, uC = null;
    if (gl) {
      const vs = "attribute vec2 a; varying vec2 p; void main(){ p = a; gl_Position = vec4(a, 0., 1.); }";
      const fs = `precision highp float; varying vec2 p; uniform float uC, uBall, uEdge; uniform vec3 uSea, uLand, uMark, uShade;
        float h(vec3 q){ return fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
        float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
          return mix(mix(mix(h(i), h(i+vec3(1,0,0)), f.x), mix(h(i+vec3(0,1,0)), h(i+vec3(1,1,0)), f.x), f.y),
                     mix(mix(h(i+vec3(0,0,1)), h(i+vec3(1,0,1)), f.x), mix(h(i+vec3(0,1,1)), h(i+vec3(1,1,1)), f.x), f.y), f.z); }
        float fbm(vec3 x){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * n3(x); x *= 2.03; a *= .5; } return v; }
        void main(){
          vec2 q = p / uBall; float d = length(q); if (d > 1.) discard;
          float z = sqrt(1. - d*d);
          float lat = asin(q.y); float lon = atan(q.x, z) + uC;
          vec3 s = vec3(cos(lat)*cos(lon), cos(lat)*sin(lon), sin(lat));
          float g = fbm(s * 2.1 + vec3(3.1, 1.7, 0.4)) - abs(s.z) * .18;
          vec3 c = mix(uSea, uLand, smoothstep(.47, .5, g));
          c = mix(c, uMark, smoothstep(.62, .65, g));
          float lit = dot(vec3(q, z), normalize(vec3(-.45, .55, .7)));
          c = mix(c, uShade, .08 * (1. - smoothstep(.26, .3, lit)));
          float al = 1. - smoothstep(1. - uEdge / uBall, 1., d);
          gl_FragColor = vec4(c * al, al); }`;
      prog = gl.createProgram();
      for (const [t, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(t); gl.shaderSource(sh, src); gl.compileShader(sh); gl.attachShader(prog, sh); }
      gl.linkProgram(prog); gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const at = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
      gl.uniform3fv(gl.getUniformLocation(prog, "uSea"), mix(sea, sea, 0));
      gl.uniform3fv(gl.getUniformLocation(prog, "uLand"), mix(sea, inkC, 0.1));
      gl.uniform3fv(gl.getUniformLocation(prog, "uMark"), mix(sea, mk, 1));
      gl.uniform3fv(gl.getUniformLocation(prog, "uShade"), mix(inkC, inkC, 0));
      gl.uniform1f(gl.getUniformLocation(prog, "uBall"), 0.7);
      uC = gl.getUniformLocation(prog, "uC");
    }
    const persons = $$(".h-globe-person");
    let size = 0, ratio = 1, ctx = null;
    const fit = () => {
      size = land.clientWidth; ratio = Math.min(devicePixelRatio || 1, 2);
      const px = Math.round(size * ratio);
      land.width = land.height = ink.width = ink.height = px;
      if (gl) { gl.viewport(0, 0, px, px); gl.uniform1f(gl.getUniformLocation(prog, "uEdge"), 2 / px); }
      ctx = ink.getContext("2d");
    };
    const line = (pts, R, centre) => { let on = false; for (const [lo, la, lift = 0] of pts) { const v = project(lo, la, centre); if (v.z <= 0) { on = false; continue; } const k = R * (1 + lift); on ? ctx.lineTo(v.x * k, -v.y * k) : ctx.moveTo(v.x * k, -v.y * k); on = true; } };
    const draw = (t) => {
      if (!ctx || !size) return;
      const R = (size / 2) * 0.7, centre = 150 - ((t / 120000) * 360) % 360;
      if (gl) { gl.uniform1f(uC, centre * RAD); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, size, size); ctx.translate(size / 2, size / 2);
      ctx.strokeStyle = inkStr; ctx.fillStyle = inkStr; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let lo = -180; lo < 180; lo += 15) line(Array.from({ length: 81 }, (_, i) => [lo, -80 + i * 2]), R, centre);
      for (let la = -75; la <= 75; la += 15) line(Array.from({ length: 181 }, (_, i) => [-180 + i * 2, la]), R, centre);
      ctx.globalAlpha = 0.1; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5; ctx.stroke();
      ARCS.forEach(([a, b], i) => {
        const za = project(...CITIES[a], centre).z, zb = project(...CITIES[b], centre).z;
        const al = Math.max(0, Math.min(1, (Math.min(za, zb) - 0.08) / 0.25));
        if (!al) return;
        ctx.globalAlpha = al; ctx.beginPath(); line(Array.from({ length: 51 }, (_, k) => slerp(CITIES[a], CITIES[b], k / 50)), R, centre); ctx.stroke();
        const m = slerp(CITIES[a], CITIES[b], (t / 3200 + 0.29 * i) % 1), v = project(m[0], m[1], centre);
        if (v.z > 0) { ctx.beginPath(); ctx.arc(v.x * R, -v.y * R, 3, 0, Math.PI * 2); ctx.fill(); }
      });
      ctx.lineWidth = 1.3;
      for (const o of ORBITS) {
        ctx.globalAlpha = 0.65; ctx.setLineDash(o.dash); ctx.beginPath(); let on = false;
        for (let n = 0; n <= 160; n++) { const v = orbitAt(o, (n / 160) * Math.PI * 2); if (v.z < 0 && v.x * v.x + v.y * v.y < 1) { on = false; continue; } on ? ctx.lineTo(v.x * R, -v.y * R) : ctx.moveTo(v.x * R, -v.y * R); on = true; }
        ctx.stroke(); ctx.setLineDash([]);
        for (const [ph, kind] of o.sats) {
          const v = orbitAt(o, (ph + (t / 1000) * o.speed) * Math.PI * 2);
          if (v.z < 0 && v.x * v.x + v.y * v.y < 1) continue;
          ctx.globalAlpha = v.z < 0 ? 0.5 : 0.9; ctx.beginPath();
          if (kind === "ring") { ctx.arc(v.x * R, -v.y * R, 5, 0, Math.PI * 2); ctx.stroke(); } else { ctx.arc(v.x * R, -v.y * R, kind === "dot" ? 4 : 2.5, 0, Math.PI * 2); ctx.fill(); }
        }
      }
      ctx.globalAlpha = 1;
      const nodes = CITIES.map(([lo, la], i) => {
        const v = project(lo, la, centre), x = v.x * R, y = -v.y * R;
        if (v.z > 0) {
          const ph = (t / 2400 + 0.37 * i) % 1, s = 7 + 16 * ph;
          ctx.globalAlpha = (1 - ph) * 0.45; ctx.strokeRect(x - s, y - s, s * 2, s * 2);
          ctx.globalAlpha = 1; ctx.fillStyle = paperStr; ctx.fillRect(x - 7, y - 7, 14, 14); ctx.fillStyle = inkStr; ctx.fillRect(x - 5, y - 5, 10, 10);
        }
        return { x: size / 2 + x, y: size / 2 + y, z: v.z };
      });
      // Name tag — front (z>.3) onward without overlap, top right, otherwise top left
      const boxes = [];
      nodes.map((n, i) => ({ n, i })).filter(({ n }) => n.z > 0.3).sort((a, b) => b.n.z - a.n.z).forEach(({ n, i }) => {
        const el = persons[i]; if (!el) return;
        const w = el.offsetWidth, h = el.offsetHeight;
        for (const left of n.x > size / 2 ? [true, false] : [false, true]) {
          const x0 = left ? n.x - 12 - w : n.x + 12, b = { x0, x1: x0 + w, y0: n.y - 12 - h, y1: n.y - 12 };
          if (b.x0 < 0 || b.x1 > size || b.y0 < 0 || boxes.some((o) => o.x0 < b.x1 && b.x0 < o.x1 && o.y0 < b.y1 && b.y0 < o.y1)) continue;
          boxes.push(b); n.shown = true; n.left = left; break;
        }
      });
      persons.forEach((el, i) => { const n = nodes[i]; el.style.setProperty("--x", `${n.left ? n.x - 12 - el.offsetWidth : n.x + 12}px`); el.style.setProperty("--y", `${n.y - 12 - el.offsetHeight}px`); el.toggleAttribute("data-shown", !!n.shown); });
    };
    let raf = 0, elapsed = 0, last = 0, drawn = 0, visible = false;
    const loop = (now) => { elapsed += Math.min(now - (last || now), 100); last = now; if (now - drawn >= 30) { drawn = now; draw(elapsed); } raf = requestAnimationFrame(loop); };
    const kick = () => { cancelAnimationFrame(raf); last = 0; if (!visible || reduce || document.hidden) draw(elapsed); else raf = requestAnimationFrame(loop); };
    fit();
    new ResizeObserver(() => { fit(); draw(elapsed); }).observe(land);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(land);
    document.addEventListener("visibilitychange", kick);
  }
})();
