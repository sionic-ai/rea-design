(() => {
  // Redraws the photo in WebGL and scatters the edges as if rubbed with a brush — cuts edge distance plus two horizontally long noise layers with a threshold, and smears the cut margin outward by the noise
  const VERT = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FRAG = `precision highp float;
varying vec2 v;uniform sampler2D t;uniform vec2 res,img;uniform float prog,time,rough,soft,seed,blob,smear,rest,op;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int k=0;k<5;k++){s+=n(p)*a;p=p*2.03+17.1;a*=.5;}return s;}
void main(){
  float asp=res.x/res.y;vec2 q=abs(v-.5);
  float box=min(.5*asp-q.x*asp,.5-q.y)/.5;
  float rad=1.-length((v-.5)*vec2(asp,1.))*2./min(asp,1.);
  float d=mix(box,rad,blob);
  float streak=fbm(vec2(v.x*5.*asp,v.y*16.)+seed);
  float cloud=fbm(v*vec2(asp,1.)*3.+seed*1.7+time*.03);
  float e=d+(streak-.5)*rough+(cloud-.5)*rough*.7;
  float thr=mix(1.35,rest,prog);
  float a=smoothstep(thr,thr+soft,e);
  vec2 off=(vec2(fbm(v*7.+3.1+time*.05),fbm(v*7.+8.3-time*.05))-.5)*(1.-a)*smear;
  vec2 uv=v+off;
  float ra=res.x/res.y,ia=img.x/img.y;vec2 s=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);
  uv=(uv-.5)*s+.5;
  vec3 c=texture2D(t,vec2(uv.x,1.-uv.y)).rgb;
  a*=op;gl_FragColor=vec4(c*a,a);
}`;

  const css = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();

  // With no photo, a placeholder image is baked from the Skin color — an accent-color mist blob with a label saying what the photo is
  function placeholder(el, w, h) {
    const cv = document.createElement("canvas");
    cv.width = Math.max(64, Math.round(w)); cv.height = Math.max(64, Math.round(h));
    const c = cv.getContext("2d");
    const bg = css(el, "--kf-bg"), soft = css(el, "--kf-accent-soft"), acc = css(el, "--kf-accent"), dim = css(el, "--kf-dim"), ink = css(el, "--kf-ink-soft");
    const g = c.createLinearGradient(0, 0, 0, cv.height);
    g.addColorStop(0, soft); g.addColorStop(1, bg);
    c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
    let s = 7;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) {
      const x = r() * cv.width, y = r() * cv.height, rr = (0.08 + r() * 0.3) * Math.max(cv.width, cv.height);
      const gg = c.createRadialGradient(x, y, 0, x, y, rr);
      gg.addColorStop(0, i % 3 ? acc : dim); gg.addColorStop(1, "transparent");
      c.globalAlpha = 0.12 + r() * 0.18; c.fillStyle = gg; c.fillRect(0, 0, cv.width, cv.height);
    }
    c.globalAlpha = 1;
    const label = el.getAttribute("data-label");
    if (label) {
      const fs = Math.max(11, Math.round(cv.width / 48)), fam = css(el, "--kf-font-sans") || "sans-serif";
      c.font = `500 ${fs}px ${fam}`;
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = ink; c.globalAlpha = 0.75;
      c.fillText(label, cv.width / 2, cv.height / 2, cv.width * 0.86);
    }
    return cv;
  }

  kfFx.register("brush-edge-photo", (el, { options, reduce, hover }) => {
    const on = options.on || "view";
    const dur = +(options.dur ?? 1.6);
    const out = +(options.out ?? 0.6);
    const rough = +(options.rough ?? 0.45);
    const soft = +(options.soft ?? 0.12);
    const smear = +(options.smear ?? 0.07);
    const rest = +(options.rest ?? 0.06);
    const blob = options.look === "blob" ? 1 : 0;
    const op = +(options.opacity ?? 1);
    const seed = +(options.seed ?? 3.7);
    const ease = kfFx.ease(options.ease || "0.14,1,0.34,1", "expo.out");
    const photo = el.querySelector('img[data-fx-part="photo"]');
    const st = { p: reduce ? 1 : 0 };
    let gl = null, cv = null, prog = null, raf = 0, io = null, visible = false, tex = null, src = null, alive = true;

    const setup = () => {
      if (gl) return true;
      cv = document.createElement("canvas");
      cv.setAttribute("data-fx-part", "canvas");
      cv.setAttribute("aria-hidden", "true");
      el.append(cv);
      gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
      if (!gl) { cv.remove(); cv = null; el.classList.add("fx-bep-plain"); return false; }
      const sh = (type, code) => { const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); return s; };
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog); gl.useProgram(prog);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      upload();
      return true;
    };
    const upload = () => {
      if (!gl) return;
      const r = el.getBoundingClientRect();
      src = photo && photo.complete && photo.naturalWidth ? photo : placeholder(el, Math.min(1024, r.width || 400), Math.min(1024, r.height || 300));
      gl.bindTexture(gl.TEXTURE_2D, tex);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); } catch (e) { src = placeholder(el, 400, 300); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); }
    };
    photo?.addEventListener("load", upload);

    const U = (n) => gl.getUniformLocation(prog, n);
    const draw = (now) => {
      raf = 0;
      if (!gl || !alive) return;
      const dpr = Math.min(2, devicePixelRatio || 1), w = el.clientWidth, h = el.clientHeight;
      if (w < 1 || h < 1) return;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U("res"), w, h);
      gl.uniform2f(U("img"), src.naturalWidth || src.width, src.naturalHeight || src.height);
      gl.uniform1f(U("prog"), st.p); gl.uniform1f(U("time"), reduce ? 0 : now / 1000);
      gl.uniform1f(U("rough"), rough); gl.uniform1f(U("soft"), soft); gl.uniform1f(U("seed"), seed);
      gl.uniform1f(U("blob"), blob); gl.uniform1f(U("smear"), smear); gl.uniform1f(U("rest"), rest); gl.uniform1f(U("op"), op);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (visible && !reduce && (st.p > 0)) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const show = (yes) => {
      if (!setup()) { el.classList.toggle("is-shown", yes); return; }
      el.classList.toggle("is-shown", yes);
      if (reduce) { st.p = yes ? 1 : 0; kick(); return; }
      gsap.to(st, { p: yes ? 1 : 0, duration: yes ? dur : out, ease: yes ? ease : "power1.inOut", overwrite: true, onUpdate: kick });
      kick();
    };

    io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); if (on === "view" && visible) show(true); }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    const host = on === "hover" ? (options.host && el.closest(options.host)) || el.parentElement : null;
    const enter = (e) => { if (e.pointerType !== "touch") show(true); };
    const leave = (e) => { if (e.pointerType !== "touch") show(false); };
    if (host && hover) { host.addEventListener("pointerenter", enter); host.addEventListener("pointerleave", leave); }
    const ro = new ResizeObserver(() => { if (gl) { upload(); kick(); } });
    ro.observe(el);
    if (on === "load") show(true);
    const play = () => show(true);
    if (on === "manual") el.addEventListener("fx:play", play);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      gsap.killTweensOf(st);
      io.disconnect(); ro.disconnect();
      photo?.removeEventListener("load", upload);
      el.removeEventListener("fx:play", play);
      if (host) { host.removeEventListener("pointerenter", enter); host.removeEventListener("pointerleave", leave); }
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      cv?.remove();
      el.classList.remove("is-shown", "fx-bep-plain");
    };
  });
})();
