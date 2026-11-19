// Shared across pages: text scramble (enter · collapse), corner cursor, full-screen video stage (OGL cell-swap shader), flow map logo (OGL Flowmap)
(() => {
  gsap.registerPlugin(ScrambleTextPlugin);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = (window.T = { reduced });

  // Colors painted on the canvas are read only from the Skin variables — even expressions (color-mix, oklch from) are resolved by the browser, then one point is painted and taken back as rgba
  const swatch = document.createElement("span");
  swatch.hidden = true;
  document.body.append(swatch);
  const dot = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const tone = (expr, alpha = 1) => {
    swatch.style.color = expr;
    dot.clearRect(0, 0, 1, 1);
    dot.fillStyle = getComputedStyle(swatch).color;
    dot.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = dot.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${((a / 255) * alpha).toFixed(3)})`;
  };
  const fontStack = () => getComputedStyle(document.body).fontFamily;
  T.tone = tone;

  // Scramble: same character set as the original. On entry it uses a plugin, on collapse it erases one character at a time from the end and only the last one jitters
  const CHARS = "A!B@C#D$E%F&G*H?J[K]L{M}N=O+P-QRSTUVWXYZ";
  T.scrambleIn = (el, { duration = 2, revealDelay = 0.3, speed = 0.25 } = {}) => {
    const text = el.dataset.text || "";
    if (reduced) { el.textContent = text; return gsap.to(el, { duration: 0 }); }
    return gsap.to(el, { duration, ease: "none", scrambleText: { text, chars: CHARS, revealDelay, speed } });
  };
  T.scrambleOut = (el, duration = 1.2) => {
    const text = el.dataset.text || el.textContent;
    if (reduced) { el.textContent = ""; return gsap.to(el, { duration: 0 }); }
    const n = text.length;
    return gsap.to({ p: 0 }, {
      p: 1,
      duration,
      ease: "none",
      onUpdate() {
        const p = this.progress(), keep = Math.ceil(n * (1 - p));
        let s = "";
        for (let i = 0; i < keep; i++) {
          s += i === keep - 1 && p > 0 && p < 1 && text[i] !== " " ? CHARS[(Math.random() * CHARS.length) | 0] : text[i];
        }
        el.textContent = s;
      },
      onComplete: () => (el.textContent = ""),
    });
  };

  // ── Cursor (original values): each frame it closes 15% of the distance to the target. The target is the mouse, or the center of the box when over [data-cursor].
  // Size changes to that box (the project slot is +8px) with .4s power3.out, and the project slot ("sticky") stays wrapped even after the mouse leaves.
  // Project cell corners are 10% of the short side (min 8px) ──
  const cursor = document.querySelector(".t-cursor");
  if (cursor && matchMedia("(pointer: fine)").matches && !reduced) {
    const corners = [...cursor.children];
    const BASE = 15, CORNER = 8, PAD = 8, FOLLOW = 0.15, CORNER_SCALE = 0.1, DUR = 0.4, EASE = "power3.out";
    const TARGET = "[data-cursor]:not([aria-disabled='true'])";
    const isSticky = (el) => el.dataset.cursor === "sticky";
    const mouse = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, cur = { w: BASE, h: BASE };
    let visible = false, hidden = false, hovered = null, sticky = null, sizeTween = null, cornerTween = null;
    const setCorners = (s) => { cornerTween?.kill(); cornerTween = gsap.to(corners, { width: s, height: s, duration: DUR, ease: EASE }); };
    const morph = (el) => {
      const r = el.getBoundingClientRect(), pad = isSticky(el) ? PAD : 0;
      cur.w = r.width + pad * 2;
      cur.h = r.height + pad * 2;
      sizeTween?.kill();
      sizeTween = gsap.to(cursor, { width: cur.w, height: cur.h, duration: DUR, ease: EASE });
      setCorners(isSticky(el) ? Math.max(CORNER, Math.round(Math.min(cur.w, cur.h) * CORNER_SCALE)) : CORNER);
    };
    const reset = () => {
      cur.w = cur.h = BASE;
      sizeTween?.kill();
      sizeTween = gsap.to(cursor, { width: BASE, height: BASE, duration: DUR, ease: EASE });
      setCorners(CORNER);
    };
    const enter = (e) => {
      const t = e.target.closest?.(TARGET);
      if (!t) return;
      hovered = t;
      if (isSticky(t)) sticky = t;
      morph(t);
    };
    const leave = (e) => {
      const t = e.target.closest?.(TARGET);
      if (!t || e.relatedTarget?.closest?.(TARGET) === t) return;
      hovered = null;
      if (isSticky(t)) return;
      if (sticky) morph(sticky); else reset();
    };
    addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        pos.x = mouse.x;
        pos.y = mouse.y;
        if (!hidden) cursor.style.opacity = "1";
      }
    }, { passive: true });
    document.addEventListener("mouseleave", () => { visible = false; cursor.style.opacity = "0"; });
    document.addEventListener("mouseover", enter, { passive: true });
    document.addEventListener("mouseout", leave, { passive: true });
    document.addEventListener("focusin", enter, { passive: true });
    document.addEventListener("focusout", leave, { passive: true });
    // When what it wrapped leaves the document (the about panel goes down), it returns straight to 15px without waiting (original hardReset)
    const hardReset = () => {
      cur.w = cur.h = BASE;
      sizeTween?.kill();
      cornerTween?.kill();
      gsap.set(cursor, { width: BASE, height: BASE });
      gsap.set(corners, { width: CORNER, height: CORNER });
    };
    // Runs after GSAP has drawn the tweens — if it ran first, the wrapper tween just created hasn’t started yet and would use the size right away, losing the .4s growth.
    // In the original the cursor runs in its own rAF, separate from GSAP, and writes its position after what GSAP drew has passed once — so don’t write in the same callback, defer it until after
    const tick = () => {
      if (!visible) return;
      if (sticky && !sticky.isConnected) { sticky = null; if (!hovered) hardReset(); }
      if (hovered && !hovered.isConnected) { hovered = null; if (!sticky) hardReset(); }
      const el = hovered || sticky;
      let x = mouse.x, y = mouse.y;
      if (el) {
        const r = el.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
        if (!sizeTween?.isActive()) {
          const pad = isSticky(el) ? PAD : 0;
          cur.w = r.width + pad * 2;
          cur.h = r.height + pad * 2;
          cursor.style.width = `${cur.w}px`;
          cursor.style.height = `${cur.h}px`;
        }
      }
      pos.x += (x - pos.x) * FOLLOW;
      pos.y += (y - pos.y) * FOLLOW;
      cursor.style.transform = `translate3d(${pos.x - cur.w / 2}px, ${pos.y - cur.h / 2}px, 0)`;
    };
    gsap.ticker.add(() => queueMicrotask(tick));
    T.showCursor = (d = 0.3) => { hidden = false; return gsap.to(cursor, { opacity: visible ? 1 : 0, duration: d }); };
    T.hideCursor = (d = 0.3) => { hidden = true; return gsap.to(cursor, { opacity: 0, duration: d, ease: "power2.inOut" }); };
  } else {
    T.showCursor = T.hideCursor = () => gsap.to({}, { duration: 0 });
  }

  if (!window.OGL) return;
  const { Renderer, Program, Mesh, Triangle, Texture, Flowmap, Vec2, Vec4 } = window.OGL;
  const DPR = Math.min(devicePixelRatio || 1, 2);

  // ── Placeholder video: draws every frame on a 16:9 panel like the original video. Play · pause · loop · end <video> We treat it as the same kind of promise.
  // In the data-frames line "src" Give it, and that spot becomes real <video>(Loop · muted · autoplay) ──
  const CLIP_W = 960, CLIP_H = 540;
  const makeClip = (frame, i) => {
    if (frame.src) {
      const v = document.createElement("video");
      Object.assign(v, { src: frame.src, loop: true, muted: true, playsInline: true, preload: i === 0 ? "auto" : "none" });
      stage.append(v);
      return {
        el: v,
        get time() { return v.currentTime; },
        get duration() { return v.duration || frame.duration || 1; },
        get ended() { return v.ended; },
        set loop(on) { v.loop = on; },
        get aspect() { return v.videoWidth ? v.videoHeight / v.videoWidth : CLIP_H / CLIP_W; },
        play() { if (v.ended || v.currentTime === 0) v.currentTime = 0; v.play().catch(() => {}); },
        pause() { v.pause(); },
        tick() {},
      };
    }
    const el = document.createElement("canvas");
    stage.append(el);
    el.width = CLIP_W;
    el.height = CLIP_H;
    // When uploading as a texture, use a CPU canvas so nothing is read back from the GPU
    const g = el.getContext("2d", { willReadFrequently: true });
    const clip = {
      el, time: 0, duration: frame.duration || 12, paused: true, loop: true, ended: false, last: 0, aspect: CLIP_H / CLIP_W,
      play() { if (this.ended) this.time = 0; this.paused = false; this.ended = false; this.last = performance.now(); },
      pause() { this.paused = true; },
      tick(now) {
        if (!this.paused) {
          this.time += Math.max(0, now - this.last) / 1000;
          if (this.time >= this.duration) {
            if (this.loop) this.time %= this.duration;
            else { this.time = this.duration; this.ended = true; this.paused = true; }
          }
        }
        this.last = now;
        (i === 0 ? drawFlame : drawProject)(g, frame, i, this.time, this.duration);
      },
    };
    return clip;
  };

  let palette = null;
  const readPalette = () => {
    palette = {
      bg: tone("var(--kf-bg)"),
      line: tone("var(--kf-line)"),
      ink: tone("var(--kf-ink)"),
      soft: tone("var(--kf-ink-soft)"),
      shade: tone("var(--kf-bg)", 0.55),
      glow: (a) => tone("var(--kf-accent)", a),
      core: tone("color-mix(in oklab, var(--kf-accent-soft), var(--kf-ink) 55%)"),
      mid: tone("var(--kf-accent-soft)"),
      hot: tone("var(--kf-accent)"),
      fade: tone("var(--kf-accent)", 0),
      light: tone("var(--kf-ink)", 0.1),
      lightOut: tone("var(--kf-ink)", 0),
      // Rotate only the hue of the surface color per project so the videos differ
      frames: [0, 1, 2, 3, 4, 5, 6].map((i) => [
        tone(`oklch(from var(--kf-raised) calc(l + 0.1) calc(c + 0.04) calc(h + ${i * 52}))`),
        tone(`oklch(from var(--kf-bg) l calc(c + 0.02) calc(h + ${i * 52}))`),
      ]),
      font: fontStack(),
    };
  };
  const label = (g, text, x, y) => {
    g.font = `300 13px ${palette.font}`;
    const w = g.measureText(text).width + 20;
    g.fillStyle = palette.shade;
    g.fillRect(x - w / 2, y - 13, w, 26);
    g.fillStyle = palette.soft;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, x, y);
  };
  // Play time sits centered below the label — a spot that stays visible even when cropped by cover on 16:10 and phone screens
  const timecode = (g, time, duration, y) => {
    const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    g.font = `300 11px ${palette.font}`;
    g.fillStyle = palette.soft;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(`${mmss(time)} / ${mmss(duration)}`, CLIP_W / 2, y);
    g.fillStyle = palette.line;
    g.fillRect(CLIP_W * 0.4, y + 12, CLIP_W * 0.2, 1);
    g.fillStyle = palette.soft;
    g.fillRect(CLIP_W * 0.4, y + 11, CLIP_W * 0.2 * (time / duration), 3);
  };
  const drawProject = (g, frame, i, time, duration) => {
    const [a, b] = palette.frames[i];
    const grad = g.createLinearGradient(0, 0, CLIP_W, CLIP_H);
    grad.addColorStop(0, a);
    grad.addColorStop(1, b);
    g.fillStyle = grad;
    g.fillRect(0, 0, CLIP_W, CLIP_H);
    // A slowly drifting light — shows this is a playing video slot, not a still photo
    const k = (time / duration) * Math.PI * 2;
    const lx = CLIP_W * (0.5 + 0.3 * Math.cos(k + i)), ly = CLIP_H * (0.45 + 0.2 * Math.sin(k * 2 + i));
    const light = g.createRadialGradient(lx, ly, 0, lx, ly, CLIP_H * 0.6);
    light.addColorStop(0, palette.light);
    light.addColorStop(1, palette.lightOut);
    g.fillStyle = light;
    g.fillRect(0, 0, CLIP_W, CLIP_H);
    g.strokeStyle = palette.line;
    g.lineWidth = 1;
    g.beginPath();
    for (let x = -CLIP_H; x < CLIP_W; x += 60) { g.moveTo(x, CLIP_H); g.lineTo(x + CLIP_H, 0); }
    g.stroke();
    label(g, frame.label, CLIP_W / 2, CLIP_H * 0.5);
    timecode(g, time, duration, CLIP_H * 0.5 + 30);
  };
  // Flame spot: once playback starts, like flicking on a lighter, a flickering drop-shaped light blooms from bottom center in .4s (in the original video the fire is already burning while the cover lifts). This is where the real video goes
  const drawFlame = (g, frame, i, time) => {
    g.fillStyle = palette.bg;
    g.fillRect(0, 0, CLIP_W, CLIP_H);
    const rise = Math.min(1, time / 0.4);
    if (rise > 0) {
      const t = time * 1000;
      const e = 1 - Math.pow(1 - rise, 3);
      // Ripples after full bloom are slow and even — like filmed footage, the change per frame is almost constant
      const fh = CLIP_H * (0.12 + 0.5 * e) * (1 + 0.03 * Math.sin(t / 260));
      const bx = CLIP_W * 0.52, by = CLIP_H * 0.95, sway = Math.sin(t / 520) * CLIP_W * 0.01 * e;
      const fw = CLIP_H * 0.032 * (0.6 + 0.4 * e);
      const glow = g.createRadialGradient(bx, by - fh * 0.3, 0, bx, by - fh * 0.3, fh * 1.1);
      glow.addColorStop(0, palette.glow(0.22 * e));
      glow.addColorStop(1, palette.fade);
      g.fillStyle = glow;
      g.fillRect(0, 0, CLIP_W, CLIP_H);
      const fill = g.createLinearGradient(0, by, 0, by - fh);
      fill.addColorStop(0, palette.core);
      fill.addColorStop(0.35, palette.mid);
      fill.addColorStop(0.8, palette.hot);
      fill.addColorStop(1, palette.fade);
      g.fillStyle = fill;
      g.beginPath();
      g.moveTo(bx - fw * 0.5, by);
      g.bezierCurveTo(bx - fw * 1.6, by - fh * 0.25, bx - fw * 0.6 + sway, by - fh * 0.7, bx + sway * 2, by - fh);
      g.bezierCurveTo(bx + fw * 0.8 + sway, by - fh * 0.65, bx + fw * 1.6, by - fh * 0.25, bx + fw * 0.5, by);
      g.quadraticCurveTo(bx, by + fw * 0.6, bx - fw * 0.5, by);
      g.fill();
    }
    label(g, frame.label, CLIP_W * 0.5, CLIP_H * 0.3);
  };

  // ── Full-screen video stage: rewritten with the same formula as the original shader.
  // Splits the screen into 5×5 cells, when a cell’s noise crosses a threshold, a new video plays, pushed up to 15% of the screen mid-progress by (4p(1-p))² (the push direction changes as the noise drifts .04 per frame)
  // Red and blue shift 2.5% apart then return. Progress is .6s power3.out. Video is laid to cover the screen (cover) ──
  const stage = document.querySelector(".t-stage");
  const BLOCK_VERT = `attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;
  const BLOCK_FRAG = `precision highp float;
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
  // Noise plate: 256×256 gray, read by nearest point and repeated. Sums four layers of the common sin hash (12.9898·78.233), doubling each time from .02, then multiplies (v+1)/2 by 255.
  // That value exceeds 255 and wraps to 256 when stored in a Uint8 — the order in which the original cells change comes from this wrap and OGL’s default flipY (flips upside down on upload)
  const noiseTexture = (gl) => {
    const size = 256, data = new Uint8Array(size * size * 4);
    const hash = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      let v = 0, f = 0.02, amp = 1;
      for (let o = 0; o < 4; o++) { v += hash(x * f, y * f) * amp; f *= 2; amp *= 0.5; }
      const k = (y * size + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = Math.floor((v + 1) * 0.5 * 255);
      data[k + 3] = 255;
    }
    return new Texture(gl, { image: data, width: size, height: size, wrapS: gl.REPEAT, wrapT: gl.REPEAT, minFilter: gl.NEAREST, magFilter: gl.NEAREST, generateMipmaps: false });
  };

  if (stage) {
    readPalette();
    const FRAMES = JSON.parse(stage.dataset.frames);
    const renderer = new Renderer({ canvas: stage.querySelector("canvas"), dpr: DPR, alpha: false, depth: false, stencil: false, powerPreference: "high-performance" });
    const gl = renderer.gl;
    const clips = FRAMES.map(makeClip);
    const textures = clips.map((c) => {
      const t = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
      t.image = c.el;
      return t;
    });
    const program = new Program(gl, {
      vertex: BLOCK_VERT,
      fragment: BLOCK_FRAG,
      uniforms: {
        tFrom: { value: textures[0] },
        tTo: { value: textures[1] },
        tNoise: { value: noiseTexture(gl) },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uCells: { value: 5 },
        uDrift: { value: 0.04 },
        uWarp: { value: 0.15 },
        uSplit: { value: 0.025 },
        uRes: { value: new Vec4() },
      },
      cullFace: false,
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const veil = document.createElement("div");
    veil.className = "t-stage__veil";
    stage.append(veil);

    let current = 0, next = 0, target = 0, running = false, pending = null, onEnd = null;
    // When nothing changes, rest the shader and the current video slot (canvas·<video>) is laid straight on screen (original enterIdle). The WebGL panel is turned on only when switching
    const idle = (on) => {
      gl.canvas.style.visibility = on ? "hidden" : "visible";
      clips.forEach((c, k) => c.el.classList.toggle("is-shown", on && k === current));
    };
    const resize = () => {
      const w = innerWidth, h = innerHeight, o = clips[0].aspect;
      renderer.setSize(w, h);
      program.uniforms.uRes.value.set(w, h, h / w > o ? (w / h) * o : 1, h / w > o ? 1 : h / w / o);
    };
    let resizeTimer = 0;
    addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    resize();

    // Called once 1 second before the video ends (original AUTO_TRANSITION_BUFFER). Looping is off meanwhile. Cancelled if it moves to another video
    const cancelEnd = () => { if (onEnd) { clips[onEnd.i].loop = true; onEnd = null; } };
    T.onClipEnd = (fn) => {
      cancelEnd();
      const clip = clips[current];
      if (clip.ended) { clip.loop = true; fn(); return; }
      clip.loop = false;
      onEnd = { i: current, fn };
    };

    T.goTo = (i, onStart) => {
      if (i < 0 || i >= clips.length) return;
      cancelEnd();
      if (onStart) pending = onStart;
      if (running) { target = i; return; }
      if (i === current) return;
      target = next = i;
      clips[current].pause();
      clips[i].play();
      program.uniforms.tTo.value = textures[i];
      clips[current].tick(performance.now());
      textures[current].needsUpdate = true;
      program.uniforms.uProgress.value = 0;
      renderer.render({ scene: mesh });
      idle(false);
      if (pending) { const fn = pending; pending = null; requestAnimationFrame(fn); }
      const done = () => {
        current = i;
        program.uniforms.tFrom.value = textures[i];
        program.uniforms.uProgress.value = 0;
        running = false;
        if (target !== current) requestAnimationFrame(() => T.goTo(target));
        else idle(true);
      };
      running = true;
      if (reduced) done();
      else gsap.to(program.uniforms.uProgress, { value: 1, duration: 0.6, ease: "power3.out", onComplete: done });
    };
    // The intro video sits covered and paused, then when the intro text collapses it plays from the start while the cover lifts
    T.playIntro = () => {
      clips[0].play();
      veil.classList.add("is-off");
    };
    T.stageEl = stage;

    const loop = (now) => {
      requestAnimationFrame(loop);
      if (document.hidden) return;
      if (running) [current, next].forEach((k) => { clips[k].tick(now); textures[k].needsUpdate = true; });
      else clips[current].tick(now);
      if (onEnd && clips[onEnd.i].time >= clips[onEnd.i].duration - 1) {
        const { fn } = onEnd;
        cancelEnd();
        fn();
      }
      if (!running) return;
      program.uniforms.uTime.value += 0.05;
      renderer.render({ scene: mesh });
    };
    idle(true);
    if (reduced) veil.classList.add("is-off");
    requestAnimationFrame(loop);
  }

  // ── Flow-map logo (original values): moving the mouse over the logo panel stamps velocity into an OGL Flowmap (spread .4, trail .96),
  // By that flow the image shifts 15%, and within .2 around the mouse red, green and blue shift separately (strength .05), and the faster it moves, the more rainbow light (.1) mixes in.
  // Speed follows at .12 while moving and .02 when stopped, shader speed follows at .08 and decays by .985x each frame. Stops after 90 idle frames ──
  const logo = document.querySelector(".t-logo");
  const FLOW_FRAG = `precision highp float;
uniform sampler2D tMap;
uniform sampler2D tFlow;
uniform float uTime;
uniform float uVelo;
uniform float uWarp;
uniform float uSplit;
uniform float uTint;
uniform float uRadius;
uniform vec4 uRes;
uniform vec2 uMouse;
varying vec2 vUv;
void main() {
  vec3 flow = texture2D(tFlow, vUv).rgb;
  vec2 uv = (vUv - 0.5) * uRes.zw + 0.5 - flow.xy * uWarp;
  vec2 toMouse = vUv - uMouse;
  float d = length(toMouse);
  vec2 off = normalize(toMouse) * smoothstep(uRadius, 0.0, d) * uVelo * uSplit;
  vec4 base = texture2D(tMap, uv);
  if (base.a < 0.01) discard;
  vec3 c = vec3(texture2D(tMap, uv - off * 1.5).r, texture2D(tMap, uv + off * 0.5).g, texture2D(tMap, uv + off * 1.8).b);
  if (uVelo > 0.01) {
    float hue = uTime * 0.01 + d * 2.0;
    c = mix(c, vec3(sin(hue), sin(hue + 2.094), sin(hue + 4.188)) * 0.5 + 0.5, uVelo * uTint);
  }
  gl_FragColor = vec4(c, base.a);
}`;
  if (logo) {
    const IMG_W = 1500, IMG_H = 970;
    const canvas = document.createElement("canvas");
    logo.append(canvas);
    const renderer = new Renderer({ canvas, dpr: DPR, alpha: true, premultipliedAlpha: true });
    const gl = renderer.gl;
    const flowmap = new Flowmap(gl, { falloff: 0.4, dissipation: 0.96, alpha: 1 });
    // Draw the flow-map program and render target once now (mouse is -1 so nothing gets stamped) — drawing for the first time on the first cursor move freezes the screen.
    flowmap.mouse.set(-1);
    flowmap.update();
    const texture = new Texture(gl, { minFilter: gl.LINEAR, magFilter: gl.LINEAR, premultiplyAlpha: true, generateMipmaps: false });
    const program = new Program(gl, {
      vertex: BLOCK_VERT,
      fragment: FLOW_FRAG,
      uniforms: {
        tMap: { value: texture },
        tFlow: flowmap.uniform,
        uTime: { value: 0 },
        uVelo: { value: 0 },
        uWarp: { value: 0.15 },
        uSplit: { value: 0.05 },
        uTint: { value: 0.1 },
        uRadius: { value: 0.2 },
        uRes: { value: new Vec4() },
        uMouse: { value: new Vec2(0.5, 0.5) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    // Placeholder wordmark: a square mark + “Logo 0N” in ink color at the center of a 3000:1939 board
    const marks = new Map();
    const mark = (id) => {
      if (marks.has(id)) return marks.get(id);
      const c = document.createElement("canvas");
      c.width = IMG_W;
      c.height = IMG_H;
      const g = c.getContext("2d", { willReadFrequently: true });
      const ink = tone("var(--kf-ink)");
      const size = IMG_H * 0.2, x0 = IMG_W * 0.17, y0 = (IMG_H - size) / 2, line = size * 0.13;
      g.strokeStyle = g.fillStyle = ink;
      g.lineWidth = line;
      g.strokeRect(x0 + line / 2, y0 + line / 2, size - line, size - line);
      g.fillRect(x0 + size * 0.33, y0, line, size);
      g.font = `700 ${Math.round(size * 1.05)}px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display").trim()}`;
      g.textBaseline = "middle";
      g.fillText(`Logo 0${id}`, x0 + size * 1.25, IMG_H / 2 + size * 0.04, IMG_W * 0.83 - x0 - size * 1.25);
      marks.set(id, c);
      return c;
    };
    const mouse = new Vec2(-1), velocity = new Vec2(), scaled = new Vec2(), last = new Vec2();
    let lastTime = 0, target = 0, speed = 0, aspect = 1, idle = 91, frame = 0, lastFrame = 0, moved = false, visible = false, rect = null;
    const resize = () => {
      const w = logo.clientWidth || 800, h = logo.clientHeight || 600, o = IMG_H / IMG_W;
      renderer.setSize(w, h);
      program.uniforms.uRes.value.set(w, h, h / w < o ? 1 : (w / h) * o, h / w < o ? h / w / o : 1);
      aspect = w / h;
      rect = logo.getBoundingClientRect();
      if (!frame) renderer.render({ scene: mesh });
    };
    const render = (now) => {
      if (!visible) { frame = 0; return; }
      const steps = Math.min((now - lastFrame) / 16.667, 3);
      lastFrame = now;
      if (moved) idle = 0;
      else { mouse.set(-1); velocity.set(0); idle++; }
      moved = false;
      if (idle > 90) { frame = 0; return; }
      frame = requestAnimationFrame(render);
      flowmap.aspect = aspect;
      flowmap.mouse.copy(mouse);
      scaled.set(velocity.x * 1.2, velocity.y * 1.2);
      flowmap.velocity.lerp(scaled, 1 - Math.pow(1 - (velocity.len() ? 0.12 : 0.02), steps));
      flowmap.update();
      program.uniforms.uTime.value = now * 0.01;
      speed += (target - speed) * (1 - Math.pow(1 - 0.08, steps));
      program.uniforms.uVelo.value = speed;
      target *= Math.pow(0.985, steps);
      renderer.render({ scene: mesh });
    };
    const start = () => { if (!frame && visible && !reduced) { lastFrame = performance.now(); frame = requestAnimationFrame(render); } };
    const move = (x, y) => {
      rect ||= logo.getBoundingClientRect();
      const px = x - rect.left, py = y - rect.top;
      mouse.set(px / rect.width, 1 - py / rect.height);
      program.uniforms.uMouse.value.set(px / rect.width, py / rect.height);
      const now = performance.now();
      if (!lastTime) { lastTime = now; last.set(px, py); }
      const dx = px - last.x, dy = py - last.y, dt = Math.max(10.4, now - lastTime);
      last.set(px, py);
      lastTime = now;
      velocity.set(dx / dt, dy / dt);
      target = Math.min((Math.hypot(dx, dy) / dt) * 0.15, 2.5);
      moved = true;
      start();
    };
    // Original on touch devices takes only fingers (also registers once on touch-down, and dragging over the logo flows instead of scrolling) and ignores the mouse
    if ("ontouchstart" in window) {
      const touch = (e) => { e.preventDefault(); move(e.changedTouches[0].clientX, e.changedTouches[0].clientY); };
      logo.addEventListener("touchstart", touch, { passive: false });
      logo.addEventListener("touchmove", touch, { passive: false });
    } else logo.addEventListener("mousemove", (e) => move(e.clientX, e.clientY), { passive: true });
    let resizeTimer = 0;
    addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    T.showLogo = (id) => {
      texture.image = mark(id);
      visible = true;
      logo.classList.add("is-on");
      resize();
      idle = 0;
      renderer.render({ scene: mesh });
      start();
    };
    T.hideLogo = () => { visible = false; logo.classList.remove("is-on"); };
  }
})();
