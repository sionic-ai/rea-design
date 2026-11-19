// Work spiral — image panels cut from a radius 7.7 cylinder as curved pieces (width .649rad · height 3.75), hanging 14 cells on a 1.5-turn spiral (WebGL).
// Follows the scroll progress of the plate height with 1-exp(-6dt), t per cell = i/14 + progress — circles along the spiral while rising, and appears then vanishes with sin over the cell’s first 25% and last 25%.
// Rolling fast bends the panel in the wind by half that speed (a value filtered by .8·.2), and the panel facing forward (-sin u > .55) can be clicked (fx:pick, the original moves on to that task)
(() => {
  const VS = `attribute vec3 position;attribute vec2 uv;uniform mat4 model,view,proj;uniform float wind;varying vec2 vUv;
void main(){vUv=uv;vec3 p=position;p.x+=wind*(uv.y-.5)*(uv.y-.5)*1.6;gl_Position=proj*view*model*vec4(p,1.);}`;
  const FS = `precision highp float;varying vec2 vUv;uniform sampler2D map;uniform vec2 planeSize;uniform float radius,opacity,imageAspect;
float rbox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){vec2 px=(vUv-.5)*planeSize;float d=rbox(px,planeSize*.5,radius);float alpha=1.-smoothstep(-.01,.01,d);if(alpha<.01)discard;
float pa=planeSize.x/planeSize.y;vec2 t=vUv;if(imageAspect>pa){t.x=.5+(vUv.x-.5)*(pa/imageAspect);}else{t.y=1.-(1.-vUv.y)*(imageAspect/pa);}
vec4 c=texture2D(map,vec2(t.x,1.-t.y));gl_FragColor=vec4(c.rgb,c.a*alpha*opacity);}`;
  const persp = (fov, asp, n, f) => { const s = 1 / Math.tan((fov * Math.PI) / 360), r = 1 / (n - f), m = new Float32Array(16); m[0] = s / asp; m[5] = s; m[10] = (f + n) * r; m[11] = -1; m[14] = 2 * f * n * r; return m; };

  kfFx.register("coil-helix-cards", (el, { options, reduce, scroller }) => {
    const imgs = [...el.querySelectorAll('[data-fx-part="card"]')];
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    if (!imgs.length || !window.gsap || !window.ScrollTrigger) return;
    const SLOTS = Math.max(4, +(options.slots || 14)), TURNS = +(options.turns ?? 1.5), R = +(options.radius ?? 7.7), ARC = +(options.arc ?? 0.6494), HT = +(options.height ?? 3.75);
    const STEP = +(options.step ?? 0.62), CAM = +(options.cam ?? 22), FOLLOW = +(options.follow ?? 6), RAD = +(options.round ?? 0.12);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-coil-canvas";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return;
    stage.prepend(canvas);
    const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    // Cylinder piece — 16 rows vertical · 64 columns horizontal, the center is the front (θ = π/2 - arc/2 … + arc)
    const pos = [], uvs = [], idx = [], th0 = Math.PI / 2 - ARC / 2;
    for (let j = 0; j <= 16; j++) { const v = j / 16, y = -(HT * v) + HT / 2; for (let i = 0; i <= 64; i++) { const u = i / 64, o = th0 + ARC * u; pos.push(R * Math.sin(o), y, R * Math.cos(o)); uvs.push(u, 1 - v); } }
    for (let j = 0; j < 16; j++) for (let i = 0; i < 64; i++) { const a = 65 * j + i, b = (j + 1) * 65 + i; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const buf = (data, loc, n) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0); return b; };
    const pb = buf(pos, gl.getAttribLocation(prog, "position"), 3), ub = buf(uvs, gl.getAttribLocation(prog, "uv"), 2);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    const U = (n) => gl.getUniformLocation(prog, n);
    const u = { model: U("model"), view: U("view"), proj: U("proj"), wind: U("wind"), map: U("map"), size: U("planeSize"), radius: U("radius"), opacity: U("opacity"), aspect: U("imageAspect") };
    const width = R * ARC;
    gl.uniform2f(u.size, width, HT); gl.uniform1f(u.radius, RAD); gl.uniform1i(u.map, 0);
    const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -CAM, 1]);
    gl.uniformMatrix4fv(u.view, false, view);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.DEPTH_TEST);

    // Drawing — turns on at .35s once all have arrived
    const tex = [], aspect = [], ready = imgs.map(() => 0), alive = { v: true };
    imgs.forEach((img, k) => {
      const up = () => {
        if (!alive.v || !img.naturalWidth) return;
        const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        tex[k] = t; aspect[k] = img.naturalWidth / img.naturalHeight;
      };
      if (img.complete && img.naturalWidth) up(); else img.addEventListener("load", up, { once: true });
    });

    let W = 1, H = 1, proj = persp(45, 1, 0.1, 1000);
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      proj = persp(45, W / H, 0.1, 1000); gl.uniformMatrix4fv(u.proj, false, proj);
    };
    const ro = new ResizeObserver(size); ro.observe(canvas); size();

    let target = +(options.rest ?? 0.4), P = target, vel = 0, last = performance.now(), raf = 0;
    const slots = Array.from({ length: SLOTS }, () => ({ k: 0, y: 0, u: 0, o: 0, active: false }));
    const model = new Float32Array(16);
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(Math.max(0.001, (now - last) / 1000), 0.1); last = now;
      const prev = P; P += (target - P) * (1 - Math.exp(-FOLLOW * dt)); vel = 0.8 * vel + (P - prev) * 0.2;
      imgs.forEach((_, k) => { if (tex[k] && ready[k] < 1) ready[k] = Math.min(1, ready[k] + dt / 0.35); });
      slots.forEach((s, i) => {
        const t = i / SLOTS + P, f = Math.floor(t), a = t - f;
        s.k = ((Math.floor(SLOTS / 2) - i + SLOTS * f) % imgs.length + imgs.length) % imgs.length;
        const e = a < 0.25 ? a / 0.25 : a > 0.75 ? (1 - a) / 0.25 : 1;
        s.o = Math.sin((Math.PI / 2) * e) * (ready[s.k] || 0);
        s.y = (a - 0.5) * STEP * SLOTS; s.u = a * Math.PI * 2 * TURNS;
        s.active = -Math.sin(s.u) > 0.55 && s.o > 0.5;
      });
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(u.wind, reduce ? 0 : 0.5 * vel * 60);
      [...slots].sort((a, b) => -Math.sin(a.u) + Math.sin(b.u)).forEach((s) => {
        if (s.o <= 0.001 || !tex[s.k]) return;
        const c = Math.cos(s.u), sn = Math.sin(s.u);
        model.fill(0); model[0] = c; model[2] = -sn; model[5] = 1; model[8] = sn; model[10] = c; model[13] = s.y; model[15] = 1;
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[s.k]);
        gl.uniform1f(u.aspect, aspect[s.k]); gl.uniform1f(u.opacity, s.o); gl.uniformMatrix4fv(u.model, false, model);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      });
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } else if (!e.isIntersecting) { cancelAnimationFrame(raf); raf = 0; } });
    io.observe(canvas);

    // Front-facing panel: move the panel’s four corners onto the screen, and if the cursor is inside
    const edge = [[R * Math.sin(th0), HT / 2, R * Math.cos(th0)], [R * Math.sin(th0 + ARC), HT / 2, R * Math.cos(th0 + ARC)], [R * Math.sin(th0 + ARC), -HT / 2, R * Math.cos(th0 + ARC)], [R * Math.sin(th0), -HT / 2, R * Math.cos(th0)]];
    const corner = (s, v) => { const c = Math.cos(s.u), sn = Math.sin(s.u), X = c * v[0] + sn * v[2], Y = v[1] + s.y, Z = -sn * v[0] + c * v[2] - CAM; return [((proj[0] * X) / -Z + 1) / 2 * W, (1 - (proj[5] * Y) / -Z) / 2 * H]; };
    const hit = (ev) => {
      const r = canvas.getBoundingClientRect(), p = [ev.clientX - r.left, ev.clientY - r.top];
      for (const s of slots) {
        if (!s.active) continue;
        const q = edge.map((v) => corner(s, v));
        let sign = 0, inside = true;
        for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], cr = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]), sg = Math.sign(cr); if (sg) { if (!sign) sign = sg; else if (sg !== sign) { inside = false; break; } } }
        if (inside) return imgs[s.k];
      }
      return null;
    };
    const over = (e) => { stage.style.cursor = hit(e) ? "pointer" : ""; };
    const click = (e) => { const card = hit(e); if (card) card.dispatchEvent(new CustomEvent("fx:pick", { bubbles: true, detail: { card } })); };
    stage.addEventListener("pointermove", over); stage.addEventListener("click", click);

    const st = reduce ? null : ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom bottom", scrub: true, onUpdate: (s) => { target = s.progress; el.dispatchEvent(new CustomEvent("fx:progress", { detail: { value: s.progress } })); } });
    return () => {
      alive.v = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); st?.kill();
      stage.removeEventListener("pointermove", over); stage.removeEventListener("click", click); stage.style.cursor = "";
      tex.forEach((t) => t && gl.deleteTexture(t)); [pb, ub, ib].forEach((b) => gl.deleteBuffer(b)); gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext(); canvas.remove();
    };
  });
})();
