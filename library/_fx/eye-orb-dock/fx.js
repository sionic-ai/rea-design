// WebGL orb with sunset colors flowing around its surface, plus two pill-shaped eyes that follow the cursor. If dock is set, it shrinks as you scroll from its hero position and moves into the bottom-right corner.
(() => {
  const VERT = "attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}";
  // Seven colors are mixed in bell shapes with different positions, weights and widths — the blue and orange at the ends are wide, the gray and sand in the middle are thin
  const FRAG = `precision mediump float;
varying vec2 v;uniform float uT;uniform vec3 uC[7];uniform vec3 uS[7];
vec3 tint(float x){vec3 acc=vec3(0.);float w=0.;for(int i=0;i<7;i++){float d=(x-uS[i].x)/uS[i].z;float k=uS[i].y*exp(-d*d);acc+=uC[i]*k;w+=k;}return acc/max(w,1e-4);}
void main(){vec2 q=v/.8;float rr=dot(q,q);if(rr>1.){gl_FragColor=vec4(0.);return;}
vec3 n=vec3(q,sqrt(max(0.,1.-rr)));float a=uT*.16;vec2 f=mat2(cos(a),sin(a),-sin(a),cos(a))*q;
f+=.24*vec2(sin(f.y*2.8+uT*.22),sin(f.x*2.5-uT*.18));
float w=f.x+.22*sin(f.y*3.2+uT*.25)+.14*sin(n.z*3.+uT*.2);
vec3 c=tint(smoothstep(-1.,1.,w));
float lit=max(0.,dot(n,normalize(vec3(.45,.6,1.))));c*=1.-.03*smoothstep(.35,1.,rr)*(1.-lit);
float sp=pow(max(0.,dot(n,normalize(vec3(.36,.48,1.)))),20.);c=mix(c,vec3(1.),sp*.13);gl_FragColor=vec4(c,1.);}`;
  // Position (0~1) · weight · width
  const STOPS = [[0, 1, 0.28], [0.22, 0.65, 0.28], [0.43, 0.12, 0.25], [0.55, 0.18, 0.25], [0.68, 0.65, 0.28], [0.88, 1, 0.28], [1, 0.5, 0.28]];

  // Paints one dot of the skin variable (oklch, color-mix, anything) on a canvas and reads it back as rgb
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (el, name) => {
    const s = getComputedStyle(el).getPropertyValue(name).trim();
    if (!s || !probe) return [0.5, 0.5, 0.5];
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = s;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("eye-orb-dock", (el, { options, reduce, hover }) => {
    const ns = "http://www.w3.org/2000/svg";
    const ac = new AbortController(), on = { signal: ac.signal, passive: true };
    let body = el.querySelector(':scope [data-fx-part="body"]');
    const madeBody = !body;
    if (!body) { body = document.createElement("span"); body.setAttribute("data-fx-part", "body"); }
    const layer = document.createElement("span");
    layer.className = "fx-orb__hover";
    const bodyParent = body.parentNode;
    el.append(layer);
    layer.append(body);

    const canvas = document.createElement("canvas");
    canvas.className = "fx-orb__gl";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
    body.append(canvas);

    const eyes = document.createElementNS(ns, "svg");
    eyes.setAttribute("viewBox", "-125 -125 250 250");
    eyes.setAttribute("class", "fx-orb__eyes");
    eyes.setAttribute("aria-hidden", "true");
    const lids = [0, 1].map(() => { const p = document.createElementNS(ns, "path"); eyes.append(p); return p; });
    body.append(eyes);

    let prog = null, uT = null, buf = null;
    if (gl) {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
      const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
      if (vs && fs) {
        prog = gl.createProgram();
        gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
        gl.deleteShader(vs); gl.deleteShader(fs);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl.deleteProgram(prog); prog = null; }
      }
      if (prog) {
        gl.useProgram(prog);
        buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        uT = gl.getUniformLocation(prog, "uT");
        gl.uniform3fv(gl.getUniformLocation(prog, "uS"), STOPS.flat());
      }
    }
    if (!prog) el.classList.add("fx-orb--flat");

    const paint = () => {
      if (!prog) return;
      const cols = [1, 2, 3, 4, 5, 6, 7].map((i) => rgbOf(el, `--fx-orb-${i}`)).flat();
      gl.uniform3fv(gl.getUniformLocation(prog, "uC"), cols);
    };
    paint();
    // Re-read when the skin is swapped (theme.css replaced, data-theme)
    const themeWatch = new MutationObserver(paint);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });

    // Pill eye: place a border joining two semicircles on a unit sphere, rotate it by the head turn (yaw·pitch) and project orthographically
    const R = 0.093, H = 0.113, X = 0.22;
    const outline = [-X, X].map((cx) => {
      const pts = [];
      for (let i = 0; i <= 32; i++) { const a = (Math.PI * i) / 32; pts.push([cx + R * Math.cos(a), H + R * Math.sin(a)]); }
      for (let i = 0; i <= 32; i++) { const a = Math.PI + (Math.PI * i) / 32; pts.push([cx + R * Math.cos(a), -H + R * Math.sin(a)]); }
      return pts;
    });
    const reach = +(options.reach ?? 0.72), follow = +(options.follow ?? 14), speed = +(options.speed ?? 3);
    let pointer = null, lx = 0, ly = 0, blinkAt = -1e9, nextBlink = performance.now() + 3200;
    addEventListener("pointermove", (e) => { if (hover && e.pointerType !== "touch") pointer = [e.clientX, e.clientY]; }, on);
    document.documentElement.addEventListener("pointerleave", () => { pointer = null; }, on);
    const drawEyes = (now, dt) => {
      const b = body.getBoundingClientRect();
      let tx = 0, ty = 0;
      if (pointer && !reduce && b.width) {
        const dx = pointer[0] - (b.left + b.width / 2), dy = pointer[1] - (b.top + b.height / 2), d = Math.hypot(dx, dy) || 1;
        const k = reach * Math.tanh(d / Math.max(70, b.width * 0.87));
        tx = (dx / d) * k; ty = (dy / d) * k;
      }
      const mix = 1 - Math.exp(-dt * follow);
      lx += (tx - lx) * mix; ly += (ty - ly) * mix;
      if (!reduce && now > nextBlink) { blinkAt = now; nextBlink = now + 3800 + Math.random() * 2400; }
      const t = now - blinkAt, lid = reduce || t >= 170 ? 1 : 1 - 0.94 * Math.sin((Math.PI * t) / 170);
      const yaw = Math.asin(Math.max(-1, Math.min(1, lx))), pitch = -Math.asin(Math.max(-1, Math.min(1, ly)));
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      outline.forEach((pts, n) => {
        lids[n].setAttribute("d", pts.map(([u, v], i) => {
          v *= lid;
          const z = Math.sqrt(Math.max(0, 1 - u * u - v * v)), a = u * cy + z * sy, zz = -u * sy + z * cy;
          return `${i ? "L" : "M"}${(a * 100).toFixed(2)},${((v * cp - zz * sp) * 100).toFixed(2)}`;
        }).join("") + "Z");
      });
    };

    // dock: from the hero position (from) to the bottom-right corner — the orb art is 80% of the box, so the corner margin is reduced by 10% of the size
    const dock = options.dock === "corner";
    const from = dock && options.from ? document.querySelector(options.from) : null;
    const over = dock ? (options.over ? document.querySelector(options.over) : from?.closest("section")) : null;
    const base = 250;
    const narrow = matchMedia(`(max-width: ${options.mobile || 900}px)`);
    const fromM = dock && options["from-mobile"] ? document.querySelector(options["from-mobile"]) : null;
    let dockFrame = 0;
    const place = () => {
      dockFrame = 0;
      if (!dock || !over) return;
      const isM = narrow.matches && fromM;
      const anchor = isM ? fromM : from;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const cap = +(isM ? options["max-mobile"] ?? 170 : options.max ?? 1e4);
      const s0 = Math.max(1, Math.min(r.width, r.height, cap));
      const x0 = r.left + (r.width - s0) / 2, y0 = r.top + (r.height - s0) / 2;
      const s1 = +(isM ? options["size-mobile"] ?? 64 : options.size ?? 84);
      const g = +(isM ? options["gutter-mobile"] ?? 12 : options.gutter ?? 24) - s1 * 0.1;
      const x1 = document.body.getBoundingClientRect().right - s1 - g, y1 = innerHeight - s1 - g;
      const raw = Math.min(1, Math.max(0, -over.getBoundingClientRect().top / Math.max(1, over.offsetHeight * +(options.travel ?? 0.72))));
      const p = reduce ? (raw >= 1 ? 1 : 0) : raw * raw * (3 - 2 * raw);
      const s = s0 + (s1 - s0) * p;
      el.style.transform = `translate3d(${(x0 + (x1 - x0) * p).toFixed(2)}px, ${(y0 + (y1 - y0) * p).toFixed(2)}px, 0) scale(${(s / base).toFixed(4)})`;
      el.classList.add("is-placed");
      el.classList.toggle("is-docked", raw >= 1);
    };
    const askPlace = () => { if (!dockFrame) dockFrame = requestAnimationFrame(place); };
    let ro = null;
    if (dock) {
      el.classList.add("fx-orb--dock");
      addEventListener("scroll", askPlace, on);
      addEventListener("resize", askPlace, on);
      narrow.addEventListener("change", askPlace, on);
      ro = new ResizeObserver(askPlace);
      ro.observe(document.body);
      if (over) ro.observe(over);
      place();
    }

    let raf = 0, last = 0, clock = 0, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting || dock; if (visible && !raf) raf = requestAnimationFrame(tick); });
    io.observe(el);
    function tick(now) {
      raf = 0;
      if (document.hidden || !visible) return;
      const dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 0.016;
      last = now;
      if (!reduce) clock += dt * speed;
      if (prog) {
        const px = Math.max(1, Math.min(640, Math.round(body.clientWidth * Math.min(devicePixelRatio || 1, 2))));
        if (canvas.width !== px) { canvas.width = canvas.height = px; gl.viewport(0, 0, px, px); }
        gl.uniform1f(uT, clock);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      drawEyes(now, dt);
      if (!reduce) raf = requestAnimationFrame(tick);
    }
    const wake = () => { if (!raf && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } };
    document.addEventListener("visibilitychange", wake, on);
    raf = requestAnimationFrame(tick);
    canvas.addEventListener("webglcontextlost", () => { prog = null; el.classList.add("fx-orb--flat"); }, on);

    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(dockFrame);
      io.disconnect();
      ro?.disconnect();
      themeWatch.disconnect();
      if (gl && prog) { gl.deleteBuffer(buf); gl.deleteProgram(prog); }
      canvas.remove();
      eyes.remove();
      if (madeBody) body.remove();
      else if (bodyParent) bodyParent.append(body);
      layer.remove();
      el.classList.remove("fx-orb--dock", "fx-orb--flat", "is-placed", "is-docked");
      el.style.removeProperty("transform");
    };
  });
})();
