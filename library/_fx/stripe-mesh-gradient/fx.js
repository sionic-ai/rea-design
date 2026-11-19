(() => {
  // Lays a Stripe-style mesh gradient behind the cell — a board twice as large as the cell above and below is divided finely (horizontal .06 · vertical .16 cells/px),
  // At each vertex, 3D simplex noise pushes the plane up to make waves, and three colors are layered over the base color by the 4th power of the noise thresholds (.1 ~ .70·.77·.84).
  // Color is set at the vertices and blends inside each face, so it is smooth like flowing paint. Time adds ms but is capped at 66ms per frame.
  const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;
  const VERT = `
precision highp float;
attribute vec2 uv;
uniform vec2 res;
uniform float time, amp, vSpeed, vFlow, seed;
uniform vec3 c0, c1, c2, c3;
varying vec3 col;
${NOISE}
vec3 layer(vec3 base, vec3 c, vec2 nc, float e, float t) {
  float n = snoise(vec3(nc.x * (2. + e / 4.) + t * (6.5 + .3 * e), nc.y * (3. + e / 4.), t * (11. + .3 * e) + seed + 10. * e)) / 2. + .5;
  return mix(base, c, pow(smoothstep(.1, .63 + .07 * e, n), 4.));
}
void main() {
  vec2 un = uv * 2. - 1.;
  vec2 nc = res * un * vec2(14e-5, 29e-5);
  float t = time;
  float n = snoise(vec3(nc.x * 3. + t * vFlow, nc.y * 4., t * vSpeed + seed)) * amp;
  n *= 1. - pow(abs(un.y), 2.);
  n = max(0., n);
  vec2 pos = vec2(un.x * res.x * .5, un.y * res.y * .5 + res.y * .5 * un.y + n);
  col = layer(layer(layer(c0, c1, nc, 1., t), c2, nc, 2., t), c3, nc, 3., t);
  gl_Position = vec4(pos.x / (res.x * .5), pos.y / (res.y * .5), 0., 1.);
}`;
  const FRAG = "precision highp float;varying vec3 col;uniform float alpha;void main(){gl_FragColor=vec4(col*alpha,alpha);}";

  const toRgb = (() => {
    let ctx;
    return (css) => {
      ctx = ctx || Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = css || "transparent";
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
  })();

  kfFx.register("stripe-mesh-gradient", (el, { options, reduce }) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: true });
    if (!gl) { canvas.remove(); return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    const U = {};
    ["res", "time", "amp", "vSpeed", "vFlow", "seed", "c0", "c1", "c2", "c3", "alpha"].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
    const aUv = gl.getAttribLocation(prog, "uv");
    const vbo = gl.createBuffer(), ibo = gl.createBuffer();
    let count = 0;

    const amp = +(options.amp ?? 320), seed = +(options.seed ?? 5);
    const speed = +(options.speed ?? 5e-6);
    gl.uniform1f(U.amp, amp);
    gl.uniform1f(U.seed, seed);
    gl.uniform1f(U.vSpeed, +(options.vspeed ?? 10));
    gl.uniform1f(U.vFlow, +(options.vflow ?? 3));

    const readColors = () => {
      const cs = getComputedStyle(el);
      ["c0", "c1", "c2", "c3"].forEach((k, i) => {
        const probe = document.createElement("i");
        probe.style.cssText = `position:absolute;visibility:hidden;color:${cs.getPropertyValue(`--fx-mesh-${i + 1}`).trim() || "currentColor"}`;
        el.append(probe);
        const v = getComputedStyle(probe).color;
        probe.remove();
        gl.uniform3fv(U[k], toRgb(v));
      });
    };

    let w = 0, h = 0;
    const size = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      w = r.width; h = r.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      let xs = Math.ceil(w * +(options.densx ?? 0.06)), ys = Math.ceil(h * +(options.densy ?? 0.16));
      const cap = Math.sqrt(60000 / ((xs + 1) * (ys + 1)));
      if (cap < 1) { xs = Math.max(1, Math.floor(xs * cap)); ys = Math.max(1, Math.floor(ys * cap)); }
      const uv = new Float32Array((xs + 1) * (ys + 1) * 2), idx = new Uint16Array(xs * ys * 6);
      for (let j = 0, k = 0; j <= ys; j++) for (let i = 0; i <= xs; i++) { uv[k++] = i / xs; uv[k++] = j / ys; }
      for (let j = 0, k = 0; j < ys; j++) for (let i = 0; i < xs; i++) {
        const a = j * (xs + 1) + i, b = a + 1, c = a + xs + 1, d = c + 1;
        idx.set([a, b, c, c, b, d], k); k += 6;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      count = idx.length;
      gl.uniform2f(U.res, w, h);
      return true;
    };

    const state = { alpha: options.fade === "0" ? 1 : 0 };
    let t = 1253106, last = 0, raf = 0, seen = true, ready = false;
    const draw = () => {
      if (!ready) return;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.time, t * speed);
      gl.uniform1f(U.alpha, state.alpha);
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
    };
    const tick = (now) => {
      raf = 0;
      if (!last) last = now;
      t += Math.min(Math.max(1, now - last), 1000 / 15);
      last = now;
      draw();
      if (seen && !reduce) raf = requestAnimationFrame(tick);
    };
    const play = () => { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(tick); } };

    readColors();
    ready = size();
    draw();
    const ro = new ResizeObserver(() => { ready = size(); draw(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) play(); }, { rootMargin: "200px" });
    io.observe(el);
    const fade = +(options.fade ?? 0.8);
    const tw = reduce || fade === 0
      ? (state.alpha = 1, draw(), null)
      : gsap.to(state, { alpha: 1, duration: fade, delay: +(options.delay ?? 0), ease: kfFx.ease(options.ease || "power2.out", "power2.out") });
    play();
    const recolor = () => { readColors(); draw(); };
    el.addEventListener("fx:recolor", recolor);

    return () => {
      cancelAnimationFrame(raf); raf = 0;
      tw?.kill(); ro.disconnect(); io.disconnect();
      el.removeEventListener("fx:recolor", recolor);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
