// Full-screen CRT glass — one WebGL panel laid over the page (presses pass through) with 3px scanlines, a 4px vertical grid, a light band descending from the top every 9.1 seconds, grain,
// Draws the edge darkness, shoulders, lower-left reflection and the bezel outside the rounded corners at 30fps. Brightness flickers 5% with two sines at 43Hz and 13.7Hz.
// Inside the screen is thin glass (adds .6 of the background color and masks by the shade) so text below shows through, and only outside the rounded corners is blocked with the bezel color. Background and accent colors are read from the skin
(() => {
  const VERT = "attribute vec2 p;varying vec2 vUv;void main(){vUv=p*0.5+0.5;gl_Position=vec4(p,0.0,1.0);}";
  const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform float uMotion;uniform float uFlicker;uniform vec3 uPaper;uniform vec3 uInk;
uniform float uScan;uniform float uGrille;uniform float uSweep;uniform float uGrain;uniform float uRadius;
varying vec2 vUv;
float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float rounded(vec2 uv){vec2 px=uv*uRes;float r=clamp(uRadius*uRes.y,16.0,32.0);vec2 q=abs(px-uRes*0.5)-(uRes*0.5-vec2(r));
  float inside=-(length(max(q,0.0))+min(max(q.x,q.y),0.0)-r);return smoothstep(-1.25,1.25,inside);}
void main(){
  vec2 uv=vUv;float screen=rounded(uv);
  float scan=0.5+0.5*sin(uv.y*uRes.y*2.0944);
  float grille=0.5+0.5*sin(uv.x*uRes.x*1.5708);
  float sd=(uv.y-fract(uTime*uSweep))*14.0;
  float sweep=uMotion*0.05*exp(-sd*sd);
  float grain=uMotion*uGrain*(hash(uv*uRes+fract(uTime*61.7)*vec2(391.0,827.0))-0.5);
  float vb=max(0.0,16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));float vig=pow(vb,0.22);
  float shoulder=(1.0-smoothstep(0.0,0.10,min(min(uv.x,uv.y),min(1.0-uv.x,1.0-uv.y))))*0.13;
  float shade=clamp((scan*uScan+grille*uGrille+(1.0-vig)*0.18+shoulder)*uFlicker+min(grain,0.0),0.0,0.85);
  float glow=(sweep*1.8+max(grain,0.0)*0.8)*uFlicker;
  float rb=max(0.0,1.0-length((uv-vec2(0.32,0.86))*vec2(1.5,2.4)));float refl=0.05*rb*rb;
  vec3 bezel=uPaper*0.3;vec3 veil=uPaper*0.6;
  vec3 glass=bezel*shade+veil+uInk*glow+vec3(refl);
  gl_FragColor=vec4(mix(bezel,glass,screen),mix(1.0,shade+glow+refl,screen));
}`;
  const rgb = (v, fb) => {
    const c = document.createElement("canvas").getContext("2d");
    if (!c) return fb;
    c.fillStyle = v || "transparent";
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return d[3] ? [d[0] / 255, d[1] / 255, d[2] / 255] : fb;
  };

  kfFx.register("crt-glass", (el, { options, reduce }) => {
    const canvas = document.createElement("canvas");
    canvas.className = "fx-crt-glass";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    (options.screen === "off" ? el : document.body).append(canvas);
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const u = { res: U("uRes"), time: U("uTime"), motion: U("uMotion"), flicker: U("uFlicker"), paper: U("uPaper"), ink: U("uInk"), scan: U("uScan"), grille: U("uGrille"), sweep: U("uSweep"), grain: U("uGrain"), radius: U("uRadius") };
    const fps = +(options.fps || 30), motion = reduce ? 0 : 1;
    gl.uniform1f(u.scan, +(options.scan ?? 0.17));
    gl.uniform1f(u.grille, +(options.grille ?? 0.085));
    gl.uniform1f(u.sweep, +(options.sweep ?? 0.11));
    gl.uniform1f(u.grain, +(options.grain ?? 0.07));
    gl.uniform1f(u.radius, +(options.radius ?? 0.028));
    gl.uniform1f(u.motion, motion);
    const paint = () => {
      const s = getComputedStyle(document.documentElement);
      gl.uniform3fv(u.paper, rgb(s.getPropertyValue("--fx-crt-paper").trim() || s.getPropertyValue("--kf-bg").trim(), [0.08, 0.06, 0.04]));
      gl.uniform3fv(u.ink, rgb(s.getPropertyValue("--fx-crt-ink").trim() || s.getPropertyValue("--kf-accent").trim(), [1, 0.63, 0.18]));
    };
    const size = () => {
      const r = canvas.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.res, w, h);
    };
    paint(); size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style", "class"] });
    let raf = 0, last = 0;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (!reduce && now - last < 1000 / fps) return;
      last = now;
      const t = now / 1000;
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.flicker, 1 + motion * 0.05 * Math.sin(t * 43) * (0.55 + 0.45 * Math.sin(t * 13.7)));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (reduce) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(draw);
    const vis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) raf = requestAnimationFrame(draw); };
    document.addEventListener("visibilitychange", vis);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); document.removeEventListener("visibilitychange", vis); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
