// The image that covered the screen (canvas·photo·video) shrinks into a round lens bead on scroll — radius shrinks from the screen diagonal to bead size, and the image inside scales from 1 → zoom times smaller,
// Refraction (ior), edge light (fresnel), color split and highlight fill from 0 → 1 using the sphere normal. The original did this with a three transmission material, rewritten here as our WebGL shader.
// If the source is a canvas or video, it is re-uploaded every frame while visible (a WebGL canvas must be created with preserveDrawingBuffer: true to be readable).
(() => {
  const VS = "attribute vec2 p; varying vec2 v; void main() { v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }";
  const FS = `precision highp float;
    uniform sampler2D t; uniform vec2 res, tex; uniform float R, zoom, k, ior; uniform vec3 rim, glow; varying vec2 v;
    vec3 pick(vec2 q) { vec2 s = res / tex, f = s / max(s.x, s.y); return texture2D(t, clamp((q / res - .5) * f + .5, 0., 1.)).rgb; }
    void main() {
      vec2 c = res * .5, o = v * res - c;
      float d = length(o) / R, a = 1. - smoothstep(1. - 1.5 / R, 1., d);
      if (a <= 0.) { gl_FragColor = vec4(0.); return; }
      float dd = min(d, .999), z = sqrt(1. - dd * dd);
      vec3 n = normalize(vec3(o / R, z)), r = refract(vec3(0., 0., -1.), n, 1. / ior);
      vec2 q = (o + r.xy * R * .6 * k) / zoom, s = r.xy * R * .025 * k;
      vec3 col = vec3(pick(c + q + s).r, pick(c + q).g, pick(c + q - s).b);
      col = mix(col, rim, pow(1. - z, 2.6) * k * .75);
      col += glow * smoothstep(.82, 1., d) * .35 * k;
      col += rim * pow(max(dot(n, normalize(vec3(-.45, .6, .66))), 0.), 60.) * .9 * k;
      gl_FragColor = vec4(col * a, a);
    }`;
  const rgb = (css) => {
    const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    g.fillStyle = css;
    g.fillRect(0, 0, 1, 1);
    return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3).map((x) => x / 255);
  };

  kfFx.register("lens-orb-fold", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const src = el.querySelector('[data-fx-part="source"]');
    if (reduce || !src || !window.ScrollTrigger) return;
    const size = +(options.size ?? 260), sizeNarrow = +(options["size-narrow"] ?? size), zoomTo = +(options.zoom ?? 0.34);
    const ior = +(options.ior ?? 1.45), span = +(options.span ?? 0.42);
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (!gl) return;
    const sh = (type, code) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, code);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
    const cs = getComputedStyle(el);
    gl.uniform3fv(U("rim"), rgb(cs.getPropertyValue("--fx-rim").trim() || "transparent"));
    gl.uniform3fv(U("glow"), rgb(cs.getPropertyValue("--fx-glow").trim() || "transparent"));
    gl.uniform1f(U("ior"), ior);

    const live = src.tagName === "CANVAS" || src.tagName === "VIDEO";
    const ready = () => (src.tagName === "IMG" ? src.complete && src.naturalWidth : src.tagName === "VIDEO" ? src.readyState >= 2 : src.width);
    const dims = () => (src.tagName === "IMG" ? [src.naturalWidth, src.naturalHeight] : src.tagName === "VIDEO" ? [src.videoWidth, src.videoHeight] : [src.width, src.height]);
    const st = { p: 0 };
    let uploaded = false;
    const draw = () => {
      if (!ready()) return;
      if (live || !uploaded) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
        gl.uniform2fv(U("tex"), dims());
        uploaded = true;
      }
      const pr = cv.width / Math.max(1, cv.clientWidth);
      const w = cv.clientWidth, h = cv.clientHeight, cover = Math.hypot(w, h) / 2 + 40;
      const end = (innerWidth < 768 ? sizeNarrow : size) / 2, p = st.p;
      gl.uniform1f(U("R"), (cover + (end - cover) * p) * pr);
      gl.uniform1f(U("zoom"), 1 + (zoomTo - 1) * p);
      gl.uniform1f(U("k"), p);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const fit = () => {
      const pr = Math.min(devicePixelRatio, 2);
      cv.width = Math.round(cv.clientWidth * pr);
      cv.height = Math.round(cv.clientHeight * pr);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2fv(U("res"), [cv.width, cv.height]);
      draw();
    };
    stage.append(cv);
    src.style.visibility = "hidden";
    const ro = new ResizeObserver(fit);
    ro.observe(cv);
    if (src.tagName === "IMG" && !ready()) src.addEventListener("load", draw, { once: true });
    let raf = 0, inView = false;
    const tick = () => {
      draw();
      raf = inView && live ? requestAnimationFrame(tick) : 0;
    };
    const trig = ScrollTrigger.create({
      trigger: el,
      scroller,
      start: "top top",
      end: () => `+=${Math.max(1, (el.offsetHeight - (scroller ? scroller.clientHeight : innerHeight)) * span)}`,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (s) => {
        st.p = s.progress;
        if (!raf) draw();
      },
    });
    const seen = ScrollTrigger.create({
      trigger: el,
      scroller,
      start: "top bottom",
      end: "bottom top",
      onToggle: (s) => {
        inView = s.isActive;
        if (inView && live && !raf) raf = requestAnimationFrame(tick);
      },
    });
    return () => {
      trig.kill();
      seen.kill();
      ro.disconnect();
      cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      cv.remove();
      src.style.visibility = "";
    };
  });
})();
