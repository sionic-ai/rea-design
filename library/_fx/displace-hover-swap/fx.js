// Distortion hover: two photos are overlaid on one panel (WebGL), and on hover the first photo is pushed out along a noise distortion map while the second is pushed in (1.6s expo.out),
// On release it plays in reverse (1.2s). The distortion map is drawn with our own noise — modeled on a reference About page (hover-effect type: intensity .3)
(() => {
  const VS = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FS = `precision mediump float;varying vec2 v;uniform sampler2D a,b;uniform float f,k,ra,rb,rr;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),q=fract(p);q=q*q*(3.-2.*q);return mix(mix(h(i),h(i+vec2(1,0)),q.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),q.x),q.y);}
    vec2 cover(vec2 uv,float r){vec2 s=rr>r?vec2(1.,r/rr):vec2(rr/r,1.);return (uv-.5)*s+.5;}
    void main(){float d=n(v*6.)*.6+n(v*13.)*.4;
      vec2 u1=cover(vec2(v.x+f*(d*k),v.y),ra),u2=cover(vec2(v.x-(1.-f)*(d*k),v.y),rb);
      vec4 c1=texture2D(a,vec2(u1.x,1.-u1.y)),c2=texture2D(b,vec2(u2.x,1.-u2.y));gl_FragColor=mix(c1,c2,f);}`;
  // Photo placeholder (when there is no image) — two skin-colored panels with a label
  const placeholder = (el, label, tone) => {
    const c = document.createElement("canvas"); c.width = 800; c.height = 600;
    const g = c.getContext("2d"), cs = getComputedStyle(el);
    g.fillStyle = cs.getPropertyValue(tone ? "--kf-raised" : "--kf-line").trim() || cs.color; g.fillRect(0, 0, 800, 600);
    g.fillStyle = cs.getPropertyValue("--kf-ink").trim() || cs.color; g.globalAlpha = .7; g.font = `22px ${cs.getPropertyValue("--kf-font-sans").trim() || cs.fontFamily}`; g.fillText(label || "", 30, 560);
    return c;
  };
  kfFx.register("displace-hover-swap", (el, { options, reduce, hover }) => {
    const imgs = [...el.querySelectorAll('[data-fx-part="image"]')];
    const cv = document.createElement("canvas");
    cv.className = "fx-displace-hover-swap__gl";
    const gl = cv.getContext("webgl");
    if (!gl) return;
    el.append(cv);
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const ratio = [1, 1];
    const tex = (src, unit, i) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((w) => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      ratio[i] = (src.naturalWidth || src.width) / ((src.naturalHeight || src.height) || 1);
    };
    const load = (i) => {
      const im = imgs[i];
      if (im && im.tagName === "IMG" && im.complete && im.naturalWidth) return im;
      return placeholder(el, im?.getAttribute("data-label") || im?.textContent || "", i === 0);
    };
    tex(load(0), 0, 0); tex(load(1), 1, 1);
    gl.uniform1i(U("a"), 0); gl.uniform1i(U("b"), 1); gl.uniform1f(U("k"), +(options.intensity ?? 0.3));
    const s = { f: 0 };
    const draw = () => {
      gl.uniform1f(U("f"), s.f); gl.uniform1f(U("ra"), ratio[0]); gl.uniform1f(U("rb"), ratio[1]);
      gl.uniform1f(U("rr"), cv.width / (cv.height || 1)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const fit = () => { const r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio, 2); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); gl.viewport(0, 0, cv.width, cv.height); draw(); };
    const ro = new ResizeObserver(fit); ro.observe(el); fit();
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    const go = (to, d) => gsap.to(s, { f: to, duration: reduce ? 0 : d, ease, overwrite: true, onUpdate: draw });
    const on = () => go(1, +(options.in ?? 1.6)), off = () => go(0, +(options.out ?? 1.2));
    const ac = new AbortController();
    if (hover) { el.addEventListener("pointerenter", on, { signal: ac.signal }); el.addEventListener("pointerleave", off, { signal: ac.signal }); }
    else el.addEventListener("click", () => (s.f > 0.5 ? off() : on()), { signal: ac.signal });
    imgs.forEach((im, i) => im.tagName === "IMG" && !im.complete && im.addEventListener("load", () => { tex(im, i, i); draw(); }, { once: true, signal: ac.signal }));
    el.classList.add("is-live");
    return () => { ac.abort(); ro.disconnect(); gsap.killTweensOf(s); el.classList.remove("is-live"); cv.remove(); };
  });
})();
