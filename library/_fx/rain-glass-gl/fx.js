// Viewing through wet glass — the inner image (canvas, photo, video, [data-fx-part=source]) is covered with a frosted glass pane and raindrops are laid on top.
// Blurs the image twice horizontally and vertically with Gaussian on a small panel (1/4 size), and only at drop positions the refracted blurred image is brightened (+20%) · edges darkened · bluish tint (.85,.92,1.12 at 45%) ·
// Painted with edge shade (1−|uv−.5|²×.75) and mixed in at 85%, then the whole is lowered to .85. Droplets are two layers of standing drops that form and dry per cell, plus two layers of streaks that run down as intensity rises.
// On receiving fx:clear the glass clears in 1.2s power2.out (amount 1→0), the picture inside becomes sharp, the panel is hidden and then fx:cleared fires, and with fx:fog it covers again
(() => {
  const VERT = "attribute vec2 p;varying vec2 vUv;void main(){vUv=p*0.5+0.5;gl_Position=vec4(p,0.0,1.0);}";
  const BLUR = `precision mediump float;
uniform sampler2D uTex;uniform vec2 uDir;uniform vec2 uScale;uniform vec2 uOffset;varying vec2 vUv;
void main(){vec2 uv=vUv*uScale+uOffset;
vec3 c=texture2D(uTex,uv).rgb*0.2270270270;
c+=texture2D(uTex,uv+uDir*1.3846153846).rgb*0.3162162162;c+=texture2D(uTex,uv-uDir*1.3846153846).rgb*0.3162162162;
c+=texture2D(uTex,uv+uDir*3.2307692308).rgb*0.0702702703;c+=texture2D(uTex,uv-uDir*3.2307692308).rgb*0.0702702703;
gl_FragColor=vec4(c,1.0);}`;
  const FINAL = `precision highp float;
uniform sampler2D uSharp;uniform sampler2D uBlur;uniform vec2 uRes;uniform vec2 uScale;uniform vec2 uOffset;
uniform float uT;uniform float uIntensity;uniform float uSize;uniform float uDist;uniform float uAmount;uniform vec3 uTint;
varying vec2 vUv;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec3 still(vec2 uv,float t,float scale,float dens){
  vec2 g=uv*scale;vec2 id=floor(g);vec2 f=fract(g)-0.5;
  float r1=h21(id),r2=h21(id+3.7),r3=h21(id+9.1);
  if(r3>dens)return vec3(0.0);
  vec2 c=(vec2(r1,r2)-0.5)*0.6;
  float life=fract(t*(0.05+0.1*r1)+r2);
  float grow=smoothstep(0.0,0.06,life)*(1.0-smoothstep(0.55,1.0,life));
  float rad=(0.2+0.38*r1)*uSize*grow;
  vec2 d=f-c;float len=length(d);
  float m=smoothstep(rad,rad*0.55,len)*step(0.002,rad);
  return vec3(d/max(rad,0.001)*m,m);
}
vec3 falling(vec2 uv,float t,float scale){
  float gx=uv.x*scale;float id=floor(gx);float fx=fract(gx)-0.5;
  float r=h21(vec2(id,4.1)),r2=h21(vec2(id,8.3));
  float y=0.62-1.24*fract(t*(0.05+0.08*r)+r2);
  float cx=(r-0.5)*0.5+0.06*sin(uv.y*18.0+r*6.28);
  float rad=(0.12+0.1*r2)*uSize;
  vec2 d=vec2(fx-cx,(uv.y-y)*scale*0.8);
  float len=length(d);
  float m=smoothstep(rad,rad*0.55,len);
  float tv=fract(uv.y*scale*3.0)-0.5;
  vec2 td=vec2(fx-cx,tv*0.35);
  float tm=smoothstep(rad*0.45,rad*0.15,length(td))*step(y,uv.y)*smoothstep(y+0.28,y,uv.y);
  return vec3(d/max(rad,0.001)*m+td/max(rad*0.45,0.001)*tm*0.5,max(m,tm));
}
void main(){
  vec2 n=vUv;
  vec2 uv=(gl_FragCoord.xy-0.5*uRes)/uRes.y;
  float I=uIntensity;
  float stillAmt=smoothstep(-0.5,1.0,I)*2.0;
  float l1=smoothstep(0.25,0.75,I),l2=smoothstep(0.0,0.5,I);
  vec3 a=still(uv,uT,26.0,stillAmt*0.75);
  vec3 b=still(uv+0.37,uT*1.3,15.0,stillAmt*0.35);
  vec3 c=falling(uv,uT,7.0)*l1;
  vec3 e=falling(uv*1.6+0.21,uT*1.2,10.0)*l2;
  vec2 off=a.xy+b.xy+c.xy+e.xy;
  float m=clamp(a.z+b.z+c.z+e.z,0.0,1.0);
  vec2 g=n-off*uDist*uSize*0.6*(1.0+m*0.5)*vec2(uRes.y/uRes.x,1.0);
  vec3 col=texture2D(uBlur,g).rgb;
  col*=1.0+m*0.2;
  float rim=smoothstep(0.5,1.0,length(off))*m;
  col*=1.0-rim*0.65;
  col*=1.0-m*smoothstep(0.3,1.0,-off.y)*0.35;
  col+=vec3(smoothstep(0.35,0.0,length(off-vec2(-0.3,0.4)))*m*0.5);
  col*=mix(vec3(1.0),uTint,0.45);
  vec2 w=n-0.5;col*=1.0-dot(w,w)*0.75;
  vec3 fog=texture2D(uBlur,n).rgb;
  vec3 rain=mix(fog,col,m*0.85)*0.85;
  vec3 sharp=texture2D(uSharp,n*uScale+uOffset).rgb;
  gl_FragColor=vec4(mix(sharp,rain,uAmount),1.0);
}`;

  kfFx.register("rain-glass-gl", (el, { options, reduce }) => {
    const source = el.querySelector('[data-fx-part="source"]');
    if (!source) return;
    const num = (k, d) => (options[k] == null || options[k] === "" ? d : +options[k]);
    const cfg = {
      intensity: num("intensity", 0.05), speed: num("speed", 6), blur: num("blur", 2.5),
      distortion: num("distortion", 0.28), size: num("size", 0.45), passes: Math.max(1, Math.round(num("passes", 2))),
      clear: num("clear", 1.2), dpr: num("dpr", 1.5) || 1.5, scale: num("scale", 0.25) || 0.25,
    };
    const tint = (options.tint || ".85,.92,1.12").split(",").map(Number);
    const ease = kfFx.ease(options.ease || "0.215,0.61,0.355,1", "power2.out");

    const canvas = document.createElement("canvas");
    canvas.className = "fx-rgg";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    el.append(canvas);

    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const program = (frag) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag));
      gl.bindAttribLocation(p, 0, "p");
      gl.linkProgram(p);
      return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
    };
    // Both shaders are baked when the world is built — compiling on the first frame freezes the screen
    const pBlur = program(BLUR), pFinal = program(FINAL);
    if (!pBlur || !pFinal) { canvas.remove(); return; }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const loc = (p, names) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)]));
    const uB = loc(pBlur, ["uTex", "uDir", "uScale", "uOffset"]);
    const uF = loc(pFinal, ["uSharp", "uBlur", "uRes", "uScale", "uOffset", "uT", "uIntensity", "uSize", "uDist", "uAmount", "uTint"]);

    const tex = () => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const srcTex = tex();
    const fbos = [0, 1].map(() => { const t = tex(); const f = gl.createFramebuffer(); return { t, f, w: 1, h: 1 }; });
    const sizeFbo = (o, w, h) => {
      o.w = w; o.h = h;
      gl.bindTexture(gl.TEXTURE_2D, o.t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, o.f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, o.t, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const live = source.tagName === "CANVAS" || source.tagName === "VIDEO";
    let W = 1, H = 1, uploaded = false, map = [1, 1, 0, 0];
    const srcSize = () => [source.videoWidth || source.naturalWidth || source.width || 1, source.videoHeight || source.naturalHeight || source.height || 1];
    // If the image has a different ratio than the panel, crop the center like object-fit: cover
    const fit = () => {
      const [sw, sh2] = srcSize();
      const box = W / H, img = sw / sh2;
      map = img > box ? [box / img, 1, (1 - box / img) / 2, 0] : [1, img / box, 0, (1 - img / box) / 2];
    };
    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, cfg.dpr);
      W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
      canvas.width = W; canvas.height = H;
      const bw = Math.max(1, Math.round(W * cfg.scale)), bh = Math.max(1, Math.round(H * cfg.scale));
      fbos.forEach((o) => sizeFbo(o, bw, bh));
      fit();
      if (!raf) draw(performance.now());
    };
    const upload = () => {
      const [sw] = srcSize();
      if (sw < 2 || (source.tagName === "IMG" && !source.complete)) return false;
      gl.bindTexture(gl.TEXTURE_2D, srcTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source); } catch (e) { return false; }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      return true;
    };

    const state = { amount: num("amount", 1) };
    let raf = 0, t0 = performance.now(), visible = true, tween = null;
    function draw(now) {
      if (live || !uploaded) { if (upload()) { if (!uploaded) fit(); uploaded = true; } }
      if (!uploaded) return;
      const t = reduce ? 3 : (now - t0) / 1000 * 0.2 * cfg.speed;
      gl.useProgram(pBlur);
      gl.uniform1i(uB.uTex, 0);
      gl.activeTexture(gl.TEXTURE0);
      let read = srcTex;
      for (let i = 0; i < cfg.passes * 2; i++) {
        const o = fbos[i % 2];
        gl.bindFramebuffer(gl.FRAMEBUFFER, o.f);
        gl.viewport(0, 0, o.w, o.h);
        gl.bindTexture(gl.TEXTURE_2D, read);
        const first = i === 0;
        gl.uniform2f(uB.uScale, first ? map[0] : 1, first ? map[1] : 1);
        gl.uniform2f(uB.uOffset, first ? map[2] : 0, first ? map[3] : 0);
        const horiz = i % 2 === 0;
        gl.uniform2f(uB.uDir, horiz ? cfg.blur / o.w : 0, horiz ? 0 : cfg.blur / o.h);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        read = o.t;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(pFinal);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, srcTex); gl.uniform1i(uF.uSharp, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, read); gl.uniform1i(uF.uBlur, 1);
      gl.uniform2f(uF.uRes, W, H);
      gl.uniform2f(uF.uScale, map[0], map[1]);
      gl.uniform2f(uF.uOffset, map[2], map[3]);
      gl.uniform1f(uF.uT, t);
      gl.uniform1f(uF.uIntensity, cfg.intensity);
      gl.uniform1f(uF.uSize, cfg.size);
      gl.uniform1f(uF.uDist, cfg.distortion);
      gl.uniform1f(uF.uAmount, state.amount);
      gl.uniform3f(uF.uTint, tint[0] || 1, tint[1] || 1, tint[2] || 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.activeTexture(gl.TEXTURE0);
    }
    const loop = (now) => {
      raf = 0;
      if (!visible || state.amount <= 0) return;
      draw(now);
      if (!reduce || live) raf = requestAnimationFrame(loop);
    };
    const run = () => { if (!raf && visible && state.amount > 0) raf = requestAnimationFrame(loop); };

    const setAmount = (to, dur, done) => {
      tween?.kill?.();
      canvas.classList.remove("is-fx-clear");
      run();
      const finish = () => { if (state.amount <= 0) { canvas.classList.add("is-fx-clear"); el.classList.add("is-fx-clear"); } else el.classList.remove("is-fx-clear"); done?.(); };
      if (reduce || dur <= 0 || !window.gsap) { state.amount = to; draw(performance.now()); finish(); return; }
      tween = gsap.to(state, { amount: to, duration: dur, ease, onComplete: finish });
    };
    const dOf = (e, d) => (e?.detail && typeof e.detail === "object" && e.detail.dur != null ? +e.detail.dur : d);
    const onClear = (e) => setAmount(0, dOf(e, cfg.clear), () => el.dispatchEvent(new CustomEvent("fx:cleared", { bubbles: true })));
    const onFog = (e) => setAmount(1, dOf(e, cfg.clear), null);
    el.addEventListener("fx:clear", onClear);
    el.addEventListener("fx:fog", onFog);
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; run(); });
    io.observe(el);
    const onLoad = () => { uploaded = false; fit(); run(); };
    source.addEventListener("load", onLoad);
    source.addEventListener("loadeddata", onLoad);
    resize();
    if (state.amount <= 0) { canvas.classList.add("is-fx-clear"); el.classList.add("is-fx-clear"); }
    run();

    return () => {
      cancelAnimationFrame(raf);
      tween?.kill?.();
      ro.disconnect(); io.disconnect();
      el.removeEventListener("fx:clear", onClear);
      el.removeEventListener("fx:fog", onFog);
      source.removeEventListener("load", onLoad);
      source.removeEventListener("loadeddata", onLoad);
      el.classList.remove("is-fx-clear");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
