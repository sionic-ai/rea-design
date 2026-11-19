(() => {
  // Original Brand stripSection: turns the top of the image (0 ~ zone) into the color of a single zone row and stretches it into vertical stripes (edges softened by .002).
  // On load, zone 0 → .15 over 1.2s power2.out, then the panel is attached to the screen and while +400% scrolls, .15 + .83 × progress (no curve).
  // pin: false means no pinning and the panel passes through the screen, look: stretch makes the zone go to .7 like the original footer + the panel scales 2.5x vertically with its bottom as the axis.
  const VS = "attribute vec2 p;varying vec2 v;uniform vec2 r,o;void main(){v=(p*.5+.5-o)*r+o;gl_Position=vec4(p,0.,1.);}";
  const FS = `precision highp float;varying vec2 v;uniform sampler2D t;uniform float zs,ze;
void main(){ if(v.x<0.||v.x>1.||v.y<0.||v.y>1.) discard; float y=1.-v.y; float e=.002;
float band=smoothstep(zs-e,zs,y)*(1.-smoothstep(ze,ze+e,y));
vec4 a=texture2D(t,v); vec4 b=texture2D(t,vec2(v.x,1.-clamp(ze-.002,0.,1.))); gl_FragColor=mix(a,b,band);}`;
  kfFx.register("stripe-stretch-gl", (el, { options, reduce, scroller }) => {
    const src = el.querySelector('[data-fx-part="source"]');
    if (!src || !window.gsap) return;
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none";
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    const sh = (k, s) => { const x = gl.createShader(k); gl.shaderSource(x, s); gl.compileShader(x); return x; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const U = (n) => gl.getUniformLocation(pr, n);
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.append(cv);
    src.style.visibility = "hidden";
    const z = { s: 0, e: 0 };
    const fit = options.fit === "contain" ? "contain" : "cover";
    let ok = true;
    const size = () => {
      const r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d));
      gl.viewport(0, 0, cv.width, cv.height);
      const sw = src.videoWidth || src.naturalWidth || src.width || 1, shh = src.videoHeight || src.naturalHeight || src.height || 1;
      const a = r.width / Math.max(1, r.height), b = sw / shh;
      if (fit === "cover") { gl.uniform2f(U("o"), 0.5, 0.5); a > b ? gl.uniform2f(U("r"), 1, b / a) : gl.uniform2f(U("r"), a / b, 1); }
      else { gl.uniform2f(U("o"), 0.5, 0); a > b ? gl.uniform2f(U("r"), a / b, 1) : gl.uniform2f(U("r"), 1, b / a); }
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const draw = () => {
      if (!ok) return;
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); } catch (e) { ok = false; src.style.visibility = ""; cv.remove(); return; }
      gl.uniform1f(U("zs"), z.s); gl.uniform1f(U("ze"), z.e);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    size();
    gsap.ticker.add(draw);
    const stretch = /look:\s*stretch/.test(el.getAttribute("data-fx-stripe-stretch-gl") || "");
    const base = +(options.base ?? 0.15), span = +(options.span ?? 0.83), end = +(options.to ?? 0.7);
    const kills = [];
    if (reduce) { z.e = stretch ? end : base; if (stretch) gsap.set(el, { scaleY: +(options.scale ?? 2.5), transformOrigin: "bottom center" }); }
    else if (stretch) {
      const st = { trigger: el, scroller, start: options.start || "top 80%", end: options.end || "bottom 90%", scrub: true };
      kills.push(gsap.to(z, { e: end, ease: "none", scrollTrigger: st }), gsap.fromTo(el, { scaleY: 1 }, { scaleY: +(options.scale ?? 2.5), transformOrigin: "bottom center", ease: "none", scrollTrigger: { ...st } }));
    } else {
      kills.push(gsap.fromTo(z, { e: 0 }, { e: base, duration: +(options.intro ?? 1.2), ease: "power2.out" }));
      const pin = options.pin !== "false";
      kills.push(ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top top", end: options.end || "+=400%", pin, scrub: true, anticipatePin: 1, onUpdate: (s) => (z.e = base + span * s.progress) }));
    }
    return () => { gsap.ticker.remove(draw); ro.disconnect(); kills.forEach((k) => { k.scrollTrigger?.kill(); k.kill?.(); }); gsap.set(el, { clearProps: "transform" }); cv.remove(); src.style.visibility = ""; gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
