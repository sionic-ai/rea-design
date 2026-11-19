// Symptom picker: ring icons appear (.35s power1 stagger .05), and a cell-line shader where hovering a cell bulges the space like a convex lens.
// Original values: bulge strength .16 · radius cell diagonal×.75 · (1-n²)² falloff · line text color 15% 1px · fill surface color · all .55s power3 overwrite auto · margin 60px
(() => {
  const SW = window.SW;
  const grid = document.querySelector(".cond__grid");
  const icons = [...grid.querySelectorAll("[data-ico]")];
  icons.forEach((el) => SW.ringIcon(el, el.dataset.ico));
  gsap.fromTo(icons, { autoAlpha: 0 }, { autoAlpha: 1, duration: SW.reduced ? 0 : 0.35, ease: "power1", stagger: 0.05, delay: 0.2 });

  if (SW.reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const PAD = 60;
  // Cell fill and line color come from the skin — the shader takes them as three 0~1 values
  const rgb = (v) => new Float32Array(SW.tone(v).match(/[\d.]+/g).slice(0, 3).map((n) => n / 255));
  const cells = [...grid.children].filter((n) => n.tagName === "LI");
  const hasTop = parseFloat(getComputedStyle(grid).borderTopWidth) > 0;
  const cv = document.createElement("canvas");
  cv.className = "cond__gl";
  const gl = cv.getContext("webgl", { premultipliedAlpha: true, antialias: true });
  if (!gl) return;
  const vs = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const fs = `precision highp float;
    varying vec2 v;
    uniform vec2 u_res; uniform float u_pad; uniform vec2 u_size;
    uniform float u_vx[4]; uniform float u_hy[6]; uniform float u_nv; uniform float u_nh;
    uniform vec2 u_center; uniform float u_radius; uniform float u_bulge;
    uniform vec4 u_cells[8]; uniform float u_fills[8]; uniform vec3 u_fill; uniform vec3 u_line;
    void main(){
      vec2 p=vec2(v.x,1.-v.y)*u_res-u_pad;
      vec2 q=p;
      if(u_bulge>0.){
        vec2 off=p-u_center; float n=length(off)/u_radius;
        if(n<1.){ float w=1.-n*n; q=u_center+off*(1.-u_bulge*.16*w*w); }
      }
      float d=1e5;
      for(int i=0;i<4;i++){ if(float(i)>=u_nv) break; float dy=max(abs(q.y-u_size.y*.5)-u_size.y*.5,0.); d=min(d,length(vec2(q.x-u_vx[i],dy))); }
      for(int i=0;i<6;i++){ if(float(i)>=u_nh) break; float dx=max(abs(q.x-u_size.x*.5)-u_size.x*.5,0.); d=min(d,length(vec2(dx,q.y-u_hy[i]))); }
      float line=1.-smoothstep(.5-.75,.5+.75,d);
      float fill=0.;
      for(int i=0;i<8;i++){
        float fa=u_fills[i]; if(fa<.004) continue;
        vec2 c=abs(q-u_cells[i].xy-u_cells[i].zw*.5)-u_cells[i].zw*.5;
        fill=max(fill,(1.-smoothstep(-1.,1.,max(c.x,c.y)))*fa);
      }
      float la=line*.15;
      vec3 col=u_fill*fill*(1.-la)+u_line*la;
      gl_FragColor=vec4(col,fill*(1.-la)+la);
    }`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(pr, "p");
  gl.enableVertexAttribArray(ap);
  gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(pr, n);

  grid.append(cv);
  grid.classList.add("has-gl");

  const st = { cx: 0, cy: 0, r: 1, b: 0, fills: cells.map(() => ({ v: 0 })) };
  let rects = [];
  const measure = () => {
    const g = grid.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 2);
    Object.assign(cv.style, { left: `${-PAD}px`, top: `${-PAD}px`, width: `${g.width + PAD * 2}px`, height: `${g.height + PAD * 2}px` });
    cv.width = Math.round((g.width + PAD * 2) * dpr);
    cv.height = Math.round((g.height + PAD * 2) * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    rects = cells.map((c) => { const r = c.getBoundingClientRect(); return [r.left - g.left, r.top - g.top, r.width, r.height]; });
    const vx = [...new Set([0, ...rects.map((r) => Math.round(r[0] + r[2]))])].slice(0, 4);
    const hy = [...new Set([...(hasTop ? [0] : []), ...rects.map((r) => Math.round(r[1] + r[3]))])].slice(0, 6);
    gl.uniform2f(U("u_res"), g.width + PAD * 2, g.height + PAD * 2);
    gl.uniform3fv(U("u_fill"), rgb("var(--kf-surface)"));
    gl.uniform3fv(U("u_line"), rgb("var(--kf-ink)"));
    gl.uniform1f(U("u_pad"), PAD);
    gl.uniform2f(U("u_size"), g.width, g.height);
    gl.uniform1fv(U("u_vx"), new Float32Array([...vx, 0, 0, 0, 0].slice(0, 4)));
    gl.uniform1fv(U("u_hy"), new Float32Array([...hy, 0, 0, 0, 0, 0, 0].slice(0, 6)));
    gl.uniform1f(U("u_nv"), vx.length);
    gl.uniform1f(U("u_nh"), hy.length);
    gl.uniform4fv(U("u_cells"), new Float32Array(rects.flat()));
  };
  const draw = () => {
    gl.uniform2f(U("u_center"), st.cx, st.cy);
    gl.uniform1f(U("u_radius"), st.r);
    gl.uniform1f(U("u_bulge"), st.b);
    gl.uniform1fv(U("u_fills"), new Float32Array(st.fills.map((f) => f.v)));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  measure();
  draw();
  addEventListener("resize", () => { measure(); draw(); });
  gsap.ticker.add(draw);

  const E = { duration: 0.55, ease: "power3", overwrite: "auto" };
  cells.forEach((c, i) => c.addEventListener("mouseenter", () => {
    const [x, y, w, h] = rects[i];
    const cx = x + w / 2, cy = y + h / 2, r = Math.hypot(w, h) * 0.75;
    if (st.b < 0.05) Object.assign(st, { cx, cy, r });
    else gsap.to(st, { cx, cy, r, ...E });
    gsap.to(st, { b: 1, ...E });
    st.fills.forEach((f, j) => (j === i ? gsap.to(f, { v: 1, ...E }) : f.v > 0.001 && gsap.to(f, { v: 0, ...E })));
  }));
  grid.addEventListener("mouseleave", () => {
    gsap.to(st, { b: 0, ...E });
    st.fills.forEach((f) => f.v > 0.001 && gsap.to(f, { v: 0, ...E }));
  });
})();
