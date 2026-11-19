(() => {
  // Rounded-square tile plate — the middle color of a six-color ramp flowing through each tile, phase offset per vertical band, slanted light, four-pointed starlight at the cursor and scatter around it.
  // Rebuilt from measurements of a reference site’s field — the original shaders and code were not used.
  const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FS = `precision mediump float;
uniform vec2 uRes;uniform float uTile,uTime,uShift,uFlip,uCols,uLoop,uRad,uShrink,uHot,uGlint;uniform vec2 uMouse;
uniform vec3 c0,c1,c2,c3,c4,c5,gap;
float h1(float n){return fract(sin(n*91.345)*47453.21);}
vec3 ramp(float v){v=fract(v)*6.;
 if(v<1.)return mix(c0,c1,smoothstep(0.,1.,v));if(v<2.)return mix(c1,c2,smoothstep(0.,1.,v-1.));
 if(v<3.)return mix(c2,c3,smoothstep(0.,1.,v-2.));if(v<4.)return mix(c3,c4,smoothstep(0.,1.,v-3.));
 if(v<5.)return mix(c4,c5,smoothstep(0.,1.,v-4.));return mix(c5,c0,smoothstep(0.,1.,v-5.));}
void main(){
 vec2 fc=gl_FragCoord.xy; fc.y=uRes.y-fc.y; if(uFlip>.5)fc.y=uRes.y-fc.y;
 vec2 cell=floor(fc/uTile); vec2 ctr=(cell+.5)*uTile;
 float nc=max(1.,floor(uRes.x/uTile)); float slat=floor(cell.x/max(1.,ceil(nc/uCols)));
 float off=slat*.045+h1(slat+uShift*13.)*.035;
 float d=uRad>0.?length(ctr-uMouse)/(uRad*uTile):9.; float k=uHot*(1.-smoothstep(0.,1.,d));
 vec2 dir=normalize(ctr-uMouse+.0001);
 vec2 lp=(fc-ctr)/uTile+dir*k*.35;
 float s=.465*(1.-k*uShrink);
 vec2 q=abs(lp)-vec2(s-.09); float sd=length(max(q,0.))+min(max(q.x,q.y),0.)-.09;
 float v=(ctr.y/uRes.y)*.9-(uLoop>0.?uTime/uLoop:0.)+off+uShift;
 vec3 col=ramp(v);
 float edge=smoothstep(0.,.06,-sd);
 float e=clamp(-sd/.1,0.,1.); vec2 nd=normalize(lp+.0001); float bev=dot(nd,vec2(-.7071,-.7071))*(1.-e);
 col=col*(1.+bev*.55)*(1.-.12*length(lp))+vec3(.05)*(1.-e);
 col=mix(gap,col,edge);
 vec2 sd2=(fc-uMouse)/uTile; float r2=length(sd2);
 float star=exp(-r2*1.6)+.7*exp(-abs(sd2.x)*7.-abs(sd2.y)*.55)+.7*exp(-abs(sd2.y)*7.-abs(sd2.x)*.55);
 col=mix(col,col*1.25+.1,k*.1)+vec3(1.)*star*uHot*uGlint;
 gl_FragColor=vec4(col,1.);}`;
  const NAMES = "uRes uTile uTime uShift uFlip uCols uLoop uRad uShrink uHot uGlint uMouse c0 c1 c2 c3 c4 c5 gap".split(" ");
  const FALL = { c0: "--kf-raised", c1: "--kf-accent-soft", c2: "--kf-accent", c3: "--kf-accent-text", c4: "--kf-ink-soft", c5: "--kf-contrast-bg", gap: "--kf-contrast-bg" };

  kfFx.register("mosaic-ramp-field", (el, { options, reduce, hover }) => {
    let cv = el.querySelector('[data-fx-part="canvas"]');
    const made = !cv;
    if (made) { cv = document.createElement("canvas"); cv.setAttribute("data-fx-part", "canvas"); el.prepend(cv); }
    const gl = cv.getContext("webgl", { antialias: false });
    if (!gl) { el.classList.add("is-nogl"); return () => { el.classList.remove("is-nogl"); made && cv.remove(); }; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; NAMES.forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
    const tile = +(options.tile ?? 24), cols = +options.columns || 4, loop = +(options.loop ?? 6.6), rad = +(options.radius ?? 7), shrink = +(options.shrink ?? 0), ease = +(options.ease ?? 0.15), fade = +(options.fade ?? 0.05), glint = +(options.glint ?? 1), shift = +(options.shift ?? 0);
    const probe = document.createElement("i"); probe.style.display = "none"; el.appendChild(probe);
    const rgb = (n) => {
      probe.style.color = `var(--fx-${n}, var(${FALL[n]}))`;
      const c = document.createElement("canvas").getContext("2d"); c.fillStyle = getComputedStyle(probe).color; c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
    const paint = () => Object.keys(FALL).forEach((n) => gl.uniform3fv(U[n], rgb(n)));
    paint();
    const st = { mx: -1e4, my: -1e4, tx: -1e4, ty: -1e4, hot: 0, th: 0, on: true };
    const mv = (e) => { const r = el.getBoundingClientRect(); st.tx = e.clientX - r.left; st.ty = e.clientY - r.top; if (st.mx < -1e3) { st.mx = st.tx; st.my = st.ty; } st.th = 1; };
    const lv = () => (st.th = 0);
    if (hover && rad > 0 && !reduce) { el.addEventListener("pointermove", mv); el.addEventListener("pointerleave", lv); }
    const io = new IntersectionObserver(([e]) => (st.on = e.isIntersecting)); io.observe(el);
    let w = 0, h = 0;
    const t0 = performance.now();
    const draw = () => {
      if (!st.on) return;
      const dpr = Math.min(devicePixelRatio, 1.5);
      const W = Math.max(1, Math.round(el.clientWidth * dpr)), H = Math.max(1, Math.round(el.clientHeight * dpr));
      if (W !== w || H !== h) { cv.width = w = W; cv.height = h = H; gl.viewport(0, 0, w, h); }
      st.mx += (st.tx - st.mx) * ease; st.my += (st.ty - st.my) * ease; st.hot += (st.th - st.hot) * (st.th > st.hot ? ease : fade);
      const scale = Math.min(1920, Math.max(1440, innerWidth)) / 1920;
      gl.uniform2f(U.uRes, w, h); gl.uniform1f(U.uTile, Math.max(6, tile * (innerWidth < 900 ? 0.6 : scale)) * dpr);
      gl.uniform1f(U.uTime, reduce ? 0 : (performance.now() - t0) / 1000); gl.uniform1f(U.uShift, shift); gl.uniform1f(U.uFlip, options.flip === "y" ? 1 : 0);
      gl.uniform1f(U.uCols, cols); gl.uniform1f(U.uLoop, loop); gl.uniform1f(U.uRad, rad); gl.uniform1f(U.uShrink, shrink);
      gl.uniform2f(U.uMouse, st.mx * dpr, st.my * dpr); gl.uniform1f(U.uHot, st.hot); gl.uniform1f(U.uGlint, glint);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    draw();
    gsap.ticker.add(draw);
    const theme = () => paint(); addEventListener("fx:theme", theme);
    return () => {
      gsap.ticker.remove(draw); io.disconnect(); removeEventListener("fx:theme", theme);
      el.removeEventListener("pointermove", mv); el.removeEventListener("pointerleave", lv);
      probe.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); if (made) cv.remove();
    };
  });
})();
