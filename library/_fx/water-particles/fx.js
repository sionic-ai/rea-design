(() => {
  const ENTER = 1450, LEAVE = 1150, HEAL_DELAY = 80, PUSH_ATTACK = 100;
  // Per layer: depth·density·opacity·interaction response·flow speed — the farther back the layer, the more it scatters and the faster it flows
  // response is the share of particles reacting to the cursor, repel is the extra share of those pushed by radius .24~.34
  const LAYERS = [
    { depth: 1.25, density: 0.45, opacity: 0.25, response: 0.9, repel: 0, speed: 1.9 },
    { depth: 1, density: 1.1, opacity: 0.3, response: 0.3, repel: 0, speed: 1.65 },
    { depth: 0.5, density: 0.72, opacity: 0.38, response: 0.15, repel: 0, speed: 0.82 },
    { depth: 0, density: 1, opacity: 1, response: 0.95, repel: 0.1, speed: 1 },
  ];
  // Waves every 14px·0.9s, sparks every 8px·0.28s — one appears only when both the distance the cursor has traveled (based on 680 width) and the interval are met, up to three
  const RIPPLE = { travel: 14, gap: 0.9, life: 2.6 }, SPARK = { travel: 8, gap: 0.28, life: 0.78 };
  const NOISE = `
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 c = floor(p), f = fract(p);
      f = f * f * (3. - 2. * f);
      return mix(mix(hash(c), hash(c + vec2(1., 0.)), f.x), mix(hash(c + vec2(0., 1.)), hash(c + 1.), f.x), f.y);
    }
    float unravel(vec2 uv) {
      vec2 p = uv * (u_res / max(u_res.x, u_res.y)) * 6.2 + vec2(u_seed, u_seed * .73);
      float cloud = .76 * noise(p) + .24 * noise(p * 1.91 + 7.3);
      float delay = .6 * cloud;
      return smoothstep(delay, delay + .4, u_progress);
    }
  `;
  const PHOTO_VS = `
    attribute vec2 a_pos; varying vec2 v_uv;
    void main() { v_uv = vec2(a_pos.x * .5 + .5, .5 - a_pos.y * .5); gl_Position = vec4(a_pos, 0., 1.); }
  `;
  const PHOTO_FS = `
    precision highp float;
    uniform sampler2D u_image; uniform vec4 u_crop; uniform float u_progress; uniform float u_seed; uniform vec2 u_res;
    varying vec2 v_uv;
    ${NOISE}
    void main() {
      vec4 c = texture2D(u_image, u_crop.xy + v_uv * u_crop.zw);
      c.a *= 1. - unravel(v_uv);
      gl_FragColor = vec4(c.rgb * c.a, c.a);
    }
  `;
  const POINT_VS = `
    precision highp float;
    attribute vec2 a_uv; attribute vec4 a_rand;
    uniform sampler2D u_image; uniform vec4 u_crop; uniform float u_progress; uniform float u_seed; uniform vec2 u_res;
    uniform vec2 u_pointer; uniform float u_time; uniform float u_spread; uniform float u_size; uniform float u_dpr;
    uniform float u_radius; uniform float u_push; uniform float u_depth; uniform float u_opacity; uniform float u_response; uniform float u_speed;
    uniform float u_repel; uniform float u_scale;
    uniform vec3 u_ripple0; uniform vec3 u_ripple1; uniform vec3 u_ripple2;
    uniform vec3 u_spark0; uniform vec3 u_spark1; uniform vec3 u_spark2;
    varying vec3 v_color; varying float v_alpha; varying float v_gold; varying float v_tone;
    ${NOISE}
    // Current flowing sideways like a school of minnows — each line has a different phase so the strips overlap as they flow. It takes the time so it can re-measure the position at the exact moment a spark pops.
    vec2 drift(float time, float appear) {
      vec2 dir = normalize(a_rand.xy - .5 + .0001);
      float t = time * u_speed;
      vec2 current = vec2(sin(t * .6 + a_rand.w * 6.2832 + a_uv.y * 9.) * 1.4 + cos(t * .23 + a_uv.y * 3.) * .8,
                          cos(t * .5 + a_rand.x * 6.2832) * .6);
      return a_uv * u_res + (dir * u_spread * (.25 + a_rand.z) * (.35 + u_depth) + current * u_spread * .12 * (1. + u_depth)) * appear;
    }
    // Ripple ring on the back layer: a 19px-wide band spreading at 86px per second (at width 680) from .45R pushes 16px, fills in .16s, and fades out over .35~2.6s
    vec2 ripple(vec3 r, vec2 pos) {
      float age = u_time - r.z;
      if (r.z < 0. || age < 0. || age > 2.6) return vec2(0.);
      vec2 d = pos - r.xy; float dist = max(length(d), .01);
      float off = (dist - (u_radius * .45 + age * 86. * u_scale)) / (19. * u_scale);
      float swell = smoothstep(0., .16, age) * (1. - smoothstep(.35, 2.6, age));
      return d / dist * exp(-off * off) * swell * 16. * u_scale;
    }
    // Sparks in the middle layer: at the moment of the bounce, particles that were in the R ring around the cursor (tight ±.1R, faint out to .32R) fly outward and sideways by .55~.9R and return in .78s
    vec2 spark(vec3 s, float appear) {
      float age = u_time - s.z;
      if (s.z < 0. || age < 0. || age > .78) return vec2(0.);
      vec2 d = drift(s.z, appear) - s.xy; float dist = max(length(d), .01);
      float onRing = 1. - smoothstep(u_radius * .1, u_radius * .32, abs(dist - u_radius));
      vec2 outward = d / dist, side = vec2(-outward.y, outward.x);
      float fly = smoothstep(0., .12, age) * (1. - smoothstep(.18, .78, age));
      return (outward * (.55 + .35 * a_rand.z) + side * (a_rand.y - .5) * .5) * u_radius * onRing * fly;
    }
    void main() {
      float appear = unravel(a_uv);
      vec4 c = texture2D(u_image, u_crop.xy + a_uv * u_crop.zw);
      vec2 base = drift(u_time, appear);
      // The share each layer reacts with and its group (cluster 55 · spread 25 · own current 20) are fixed on the particle — not redrawn when the cursor moves
      float responds = step(fract(a_rand.x * 7.31 + a_rand.w * 2.17), u_response);
      float cohort = fract(a_rand.w * 23.9 + a_rand.y * 4.7 + a_rand.z * 2.3);
      float gathers = step(cohort, .55), spreads = step(.55, cohort) * step(cohort, .8);
      vec2 d = base - u_pointer; float dist = length(d);
      vec2 away = dist > .01 ? d / dist : normalize(a_rand.zw - .5 + .0001);
      vec2 push = vec2(0.);
      if (u_depth < .1 || u_depth > 1.1) {
        // Clears the inside of the radius — gathering groups go to the border (R~1.15R), spreading groups settle into place between .9~1.2R
        float rim = max(0., u_radius - dist) * (1. + a_rand.w * (u_depth < .1 ? .18 : .12));
        float home = u_radius * mix(.9, 1.2, fract(a_rand.y * 5.3 + a_rand.w * 2.9));
        float part = max(0., home - dist) * (1. - smoothstep(u_radius * .72, u_radius, dist));
        float field = 1. - smoothstep(0., u_radius, dist);
        float repel = step(1. - u_repel, a_rand.x) * u_radius * (.24 + a_rand.y * .1) * field * (gathers + spreads);
        push = away * ((rim * gathers + part * spreads) * responds + repel);
      } else if (u_depth < .9) {
        push = (spark(u_spark0, appear) + spark(u_spark1, appear) + spark(u_spark2, appear)) * responds;
      } else {
        push = (ripple(u_ripple0, base) + ripple(u_ripple1, base) + ripple(u_ripple2, base)) * responds;
      }
      vec2 pos = base + push * u_push * appear;
      // Even so, particles left inside (its own current group, the ones that don’t react) swim in place without crossing the border
      vec2 left = pos - u_pointer; float room = max(0., u_radius * .98 - length(left));
      float inside = 1. - smoothstep(u_radius * .8, u_radius * .98, length(left));
      float swimT = u_time * u_speed * (u_depth > .9 && u_depth < 1.1 ? mix(1.28, 1., responds) : 1.);
      vec2 swim = vec2(sin(swimT * .83 + a_rand.z * 6.2832) + .24 * sin(swimT * 1.37 + a_rand.w * 6.2832),
                       cos(swimT * .67 + a_rand.y * 6.2832) + .24 * sin(swimT * 1.19 + a_rand.z * 6.2832));
      pos += swim * min(u_radius * .07, room * .35) * inside * u_push * appear;
      gl_Position = vec4(pos / u_res * 2. - 1., 0., 1.);
      gl_Position.y *= -1.;
      gl_PointSize = u_size * u_dpr * (.75 + a_rand.y * .6) * (1. + u_depth * .35);
      float twinkle = .75 + .25 * sin(u_time * (1.5 + a_rand.z * 2.) + a_rand.w * 40.);
      v_color = c.rgb; v_gold = a_rand.z; v_tone = a_rand.w;
      v_alpha = appear * u_opacity * twinkle * c.a;
      // Of what remains inside from the previous layer, only a chosen 20% fades to half — so the holes do not look knife-cut
      if (u_depth < .1) v_alpha *= 1. - .5 * step(fract(a_rand.z * 11.3 + a_rand.x * 3.7), .2) * inside * u_push * appear;
    }
  `;
  const POINT_FS = `
    precision highp float;
    uniform vec3 u_gold;
    varying vec3 v_color; varying float v_alpha; varying float v_gold; varying float v_tone;
    void main() {
      vec2 p = gl_PointCoord - .5; float r = length(p);
      if (r > .5) discard;
      float lum = dot(v_color, vec3(.299, .587, .114));
      // Bright areas get gold leaf, some dark areas white light — the rest scatter in the photo’s own color
      float g = clamp(smoothstep(.70, .86, lum) * step(v_gold, .6) + step(v_gold, .2), 0., 1.);
      float w = (1. - smoothstep(.12, .44, lum)) * step(v_tone, .42) * (1. - g);
      vec3 gold = u_gold * (.88 + .3 * v_tone);
      vec3 col = mix(mix(v_color, gold, g), vec3(1.), w * .85);
      float a = v_alpha * (1. - smoothstep(.25, .5, r));
      gl_FragColor = vec4(col * a, a);
    }
  `;

  const smooth = (t) => t * t * (3 - 2 * t);

  function compile(gl, vs, fs) {
    const p = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(([type, src]) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name.replace(/^u_/, "")] = gl.getUniformLocation(p, name); }
    return { p, u };
  }

  function rgbOf(str) {
    if (!str || !str.trim()) return [1, 1, 1];
    const probe = document.createElement("canvas").getContext("2d");
    probe.fillStyle = str.trim();
    const v = probe.fillStyle;
    if (v.startsWith("#")) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
    const m = v.match(/[\d.]+/g) || [0, 0, 0];
    return m.slice(0, 3).map((x) => +x / 255);
  }

  // Placeholder boxes with no photo yet draw a water-ripple pattern in the box’s own background and text colors, then scatter it
  function paintPlaceholder(part, w, h) {
    const cv = document.createElement("canvas");
    cv.width = Math.max(2, Math.round(w)); cv.height = Math.max(2, Math.round(h));
    const ctx = cv.getContext("2d"), cs = getComputedStyle(part);
    const root = getComputedStyle(document.documentElement);
    const bg = cs.backgroundColor || "";
    ctx.fillStyle = bg && !bg.endsWith(", 0)") ? bg : root.getPropertyValue("--kf-surface");
    ctx.fillRect(0, 0, cv.width, cv.height);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const bands = [[cs.color, 0.22], [root.getPropertyValue("--kf-accent"), 0.5], [root.getPropertyValue("--kf-bg"), 0.55]];
    for (let i = 0; i < 70; i++) {
      const [col, alpha] = bands[i % 3];
      ctx.globalAlpha = alpha * (0.4 + rnd() * 0.6);
      ctx.strokeStyle = col; ctx.lineWidth = 2 + rnd() * cv.height * 0.025;
      const y0 = rnd() * cv.height, amp = 4 + rnd() * 18, k = 0.01 + rnd() * 0.03, ph = rnd() * 6.28;
      ctx.beginPath();
      for (let x = -10; x <= cv.width + 10; x += 8) ctx.lineTo(x, y0 + Math.sin(x * k + ph) * amp);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return cv;
  }

  kfFx.register("water-particles", (el, { options, reduce, hover }) => {
    const part = el.querySelector('[data-fx-part="image"]');
    if (!part || reduce) return;
    const enter = +(options.enter ?? ENTER), leave = +(options.leave ?? LEAVE);
    const heal = +(options.heal ?? 2600), spread = +(options.spread ?? 78);
    const gap = +(options.gap || 3.2), max = +(options.max || 120000), radius0 = +(options.radius ?? 31.625);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("data-fx-part", "canvas");
    el.append(canvas);
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) { canvas.remove(); return; }

    let photo, points, tex, quad, layers = [], crop = [0, 0, 1, 1], w = 0, h = 0, dpr = 1, scale = 1;
    try {
      photo = compile(gl, PHOTO_VS, PHOTO_FS);
      points = compile(gl, POINT_VS, POINT_FS);
    } catch (e) { canvas.remove(); return; }
    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    tex = gl.createTexture();

    const state = { progress: 0, from: 0, target: 0, started: 0, dur: 1, seed: 0, push: 0, healFrom: 0, healAt: 0, moved: 0, clock: 0, last: 0,
      ripples: [], sparks: [], lastRipple: -9, lastSpark: -9, travel: 0, rippleTravel: 0, sparkTravel: 0 };
    const pointer = { x: 0, y: 0 }, aim = { x: 0, y: 0 };
    let frame = 0, inView = true, ready = false, warmed = false;

    function upload() {
      const src = part.tagName === "IMG" && part.complete && part.naturalWidth ? part : paintPlaceholder(part, w, h);
      const iw = src.naturalWidth || src.width, ih = src.naturalHeight || src.height;
      const ra = w / h, ri = iw / ih;
      crop = ri > ra ? [(1 - ra / ri) / 2, 0, ra / ri, 1] : [0, (1 - ri / ra) / 2, 1, ri / ra];
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR));
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
    }

    function build() {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      w = r.width; h = r.height; dpr = Math.min(devicePixelRatio || 1, 2); scale = w / 680;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      const step = Math.max(1.6, gap * scale);
      const total = LAYERS.reduce((s, l) => s + l.density, 0) * (w / step) * (h / step);
      const thin = Math.min(1, max / total);
      layers.forEach((l) => gl.deleteBuffer(l.buf));
      let seed = 1;
      const rnd = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);
      layers = LAYERS.map((L) => {
        const n = Math.round((w / step) * (h / step) * L.density * thin), data = new Float32Array(n * 6);
        for (let i = 0; i < n; i++) {
          data.set([rnd(), rnd(), rnd(), rnd(), rnd(), rnd()], i * 6);
        }
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return { ...L, buf, n };
      });
      upload();
      ready = true;
      draw();
    }

    function setActive(on) {
      if (!ready) return;
      const target = on ? 1 : 0;
      if (target === state.target) return;
      const now = performance.now();
      advance(now);
      if (on && state.progress === 0) {
        Object.assign(pointer, aim);
        state.seed = Math.random() * 97; state.clock = 0; state.ripples = []; state.sparks = []; state.lastRipple = state.lastSpark = -9;
        state.push = state.healFrom = 1;
      }
      if (on) { state.moved = state.healAt = now; state.healFrom = state.push; }
      state.target = target; state.from = state.progress; state.started = now;
      state.dur = Math.max(180, (on ? enter : leave) * Math.abs(target - state.from));
      el.classList.toggle("is-fx-water", true);
      if (!frame) { state.last = now; frame = requestAnimationFrame(tick); }
    }

    function advance(now) {
      const f = Math.min(1, Math.max(0, (now - state.started) / state.dur));
      state.progress = f === 1 ? state.target : state.from + (state.target - state.from) * smooth(f);
    }

    function draw() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      const common = (u) => {
        gl.uniform1i(u.image, 0); gl.uniform4fv(u.crop, crop); gl.uniform1f(u.progress, state.progress);
        gl.uniform1f(u.seed, state.seed); gl.uniform2f(u.res, w, h);
      };
      gl.useProgram(photo.p); common(photo.u);
      const pa = gl.getAttribLocation(photo.p, "a_pos");
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(pa); gl.vertexAttribPointer(pa, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(pa);
      // Draw the particle shader once (transparent) before the first interaction — compiling it at first use freezes the screen
      if (state.progress <= 0 && warmed) return;
      warmed = true;
      gl.useProgram(points.p); common(points.u);
      const u = points.u, gold = rgbOf(getComputedStyle(el).getPropertyValue("--fx-gold") || getComputedStyle(document.documentElement).getPropertyValue("--kf-accent"));
      gl.uniform2f(u.pointer, pointer.x, pointer.y); gl.uniform1f(u.time, state.clock / 1000);
      gl.uniform1f(u.spread, spread * scale); gl.uniform1f(u.size, 1.35 * Math.max(0.8, scale) * 1.6); gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.radius, radius0 * Math.max(0.6, scale)); gl.uniform1f(u.scale, scale); gl.uniform1f(u.push, state.push); gl.uniform3fv(u.gold, gold);
      for (let i = 0; i < 3; i++) {
        gl.uniform3fv(u["ripple" + i], state.ripples[i] || [0, 0, -1]);
        gl.uniform3fv(u["spark" + i], state.sparks[i] || [0, 0, -1]);
      }
      const au = gl.getAttribLocation(points.p, "a_uv"), ar = gl.getAttribLocation(points.p, "a_rand");
      layers.forEach((L) => {
        gl.uniform1f(u.depth, L.depth); gl.uniform1f(u.opacity, L.opacity); gl.uniform1f(u.response, L.response); gl.uniform1f(u.repel, L.repel); gl.uniform1f(u.speed, L.speed);
        gl.bindBuffer(gl.ARRAY_BUFFER, L.buf);
        gl.enableVertexAttribArray(au); gl.vertexAttribPointer(au, 2, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(ar); gl.vertexAttribPointer(ar, 4, gl.FLOAT, false, 24, 8);
        gl.drawArrays(gl.POINTS, 0, L.n);
      });
      gl.disableVertexAttribArray(au); gl.disableVertexAttribArray(ar);
    }

    function tick(now) {
      frame = 0;
      const delta = Math.max(1, now - state.last);
      state.last = now; state.clock += delta;
      advance(now);
      if (state.target && now - state.moved <= HEAL_DELAY) {
        state.push += (1 - state.push) * (1 - Math.exp(-delta / PUSH_ATTACK));
        state.healFrom = state.push; state.healAt = now;
      } else {
        const e = Math.min(1, Math.max(0, (now - state.healAt) / Math.max(1, heal)));
        state.push = state.healFrom * (1 - smooth(e));
      }
      const follow = 1 - Math.exp(-delta * 0.009);
      pointer.x += (aim.x - pointer.x) * follow; pointer.y += (aim.y - pointer.y) * follow;
      const t = state.clock / 1000;
      state.ripples = state.ripples.filter((r) => t - r[2] < RIPPLE.life);
      state.sparks = state.sparks.filter((s) => t - s[2] < SPARK.life);
      if (state.progress === 0 && state.target === 0) {
        el.classList.remove("is-fx-water");
        draw();
        return;
      }
      draw();
      if (inView && !document.hidden) frame = requestAnimationFrame(tick);
    }

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (state.target) {
        // Distance travelled is counted in px at a 680 width — so ripples and sparks fire at the same frequency regardless of photo size
        const step = Math.hypot(x - aim.x, y - aim.y) / (scale || 1), t = state.clock / 1000;
        state.travel += step; state.rippleTravel += step; state.sparkTravel += step;
        if (state.travel >= 0.6) { state.moved = performance.now(); state.travel = 0; }
        if (step > 0.01 && state.rippleTravel >= RIPPLE.travel && t - state.lastRipple >= RIPPLE.gap) {
          state.ripples = [[x, y, t], ...state.ripples].slice(0, 3); state.lastRipple = t; state.rippleTravel = 0;
        }
        if (step > 0.01 && state.sparkTravel >= SPARK.travel && t - state.lastSpark >= SPARK.gap) {
          state.sparks = [[x, y, t], ...state.sparks].slice(0, 3); state.lastSpark = t; state.sparkTravel = 0;
        }
      }
      aim.x = x; aim.y = y;
    };
    const on = (e) => { if (e.pointerType === "touch") return; move(e); setActive(true); };
    const off = (e) => { if (e.pointerType === "touch") return; setActive(false); };
    const down = (e) => { if (e.pointerType !== "touch") return; move(e); setActive(state.target !== 1); };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", off);
    if (!hover) el.addEventListener("pointerdown", down);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && state.progress > 0 && !frame) { state.last = performance.now(); frame = requestAnimationFrame(tick); }
    });
    io.observe(el);
    const ro = new ResizeObserver(() => build());
    ro.observe(el);
    if (part.tagName === "IMG" && !part.complete) part.addEventListener("load", upload, { once: true });

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect(); ro.disconnect();
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("pointerdown", down);
      el.classList.remove("is-fx-water");
      layers.forEach((l) => gl.deleteBuffer(l.buf));
      gl.deleteBuffer(quad); gl.deleteTexture(tex);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
