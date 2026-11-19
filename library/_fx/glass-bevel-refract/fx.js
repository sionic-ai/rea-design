(() => {
  // Original Brand glass (pb-glass): a beveled glass circle or rectangle (circle hole in the center) refracts and disperses the background color and text behind it, with Fresnel light along the edge.
  // Original values: refractive index 1.45 · refraction 70 · dispersion .06 · fresnel .35 · reflection 1.1 · circle bevel 26 · square bevel 5.7 (per 100) · depth 8 · tilt .28.
  // The board tilts by how far the cursor is from its center (divided by half the screen width and height × tilt), so the light spot and refraction follow, easing .08 of the remaining distance each frame — after .9s of stillness it settles back to 0.
  const VS = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FS = `precision highp float;
varying vec2 v;
uniform sampler2D u_tex; uniform vec2 u_res; uniform float u_shape, u_bevel, u_hole, u_rad, u_refr, u_disp, u_fres, u_refl, u_ior, u_depth;
uniform vec2 u_tilt; uniform vec3 u_tint;
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
float sdf(vec2 p){
  float R = min(u_res.x, u_res.y) * .5 - 2.;
  if (u_shape < .5) return length(p) - R;
  return max(sdBox(p, vec2(R), R * u_rad * 2.), R * u_hole - length(p));
}
void main(){
  vec2 px = (v - .5) * u_res;
  float d = sdf(px);
  if (d > 1.) { gl_FragColor = vec4(0.); return; }
  vec2 e = vec2(1., 0.);
  vec2 g = normalize(vec2(sdf(px + e.xy) - sdf(px - e.xy), sdf(px + e.yx) - sdf(px - e.yx)) + 1e-5);
  float s = 1. - clamp(-d / u_bevel, 0., 1.);
  vec3 n = normalize(vec3(g * s * 1.6, sqrt(max(1. - s * s, 0.)) + .15));
  n.xy += u_tilt * .35; n = normalize(n);
  vec2 off = -n.xy * u_refr * (1. - 1. / u_ior) * 2. + u_tilt * u_depth;
  vec2 uv = v + off / u_res;
  vec3 col = vec3(texture2D(u_tex, uv + off * u_disp / u_res).r, texture2D(u_tex, uv).g, texture2D(u_tex, uv - off * u_disp / u_res).b);
  col *= mix(vec3(1.), u_tint, .55);
  float fr = u_fres * pow(1. - clamp(n.z, 0., 1.), 2.2);
  vec3 L = normalize(vec3(-.45 + u_tilt.x * 1.4, .55 + u_tilt.y * 1.4, .9));
  float spec = pow(max(dot(reflect(-L, n), vec3(0., 0., 1.)), 0.), 24.) * u_refl * .55;
  float rim = smoothstep(1.4, 0., abs(d)) * .28 + smoothstep(2.2, 0., abs(d + u_bevel)) * .06 * s;
  col = mix(col, u_tint, clamp(fr + spec + rim, 0., 1.));
  float a = clamp(.5 - d, 0., 1.);
  gl_FragColor = vec4(col * a, a);
}`;
  const pt = { x: 0, y: 0, t: -1e9 };
  let listening = false;
  const onMove = (e) => { pt.x = e.clientX; pt.y = e.clientY; pt.t = performance.now(); };
  const rgb = (css) => {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = css; c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const bgOf = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && c !== "transparent" && !/,\s*0\)$/.test(c)) return c;
    }
    return getComputedStyle(document.body).backgroundColor;
  };

  kfFx.register("glass-bevel-refract", (el, { options, reduce, hover }) => {
    if (!window.gsap) return;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const U = (n) => gl.getUniformLocation(prog, n);
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:-2px;width:calc(100% + 4px);height:calc(100% + 4px);pointer-events:none";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.append(canvas);
    const shape = options.shape === "square" ? 1 : 0;
    const tiltAmt = reduce || !hover ? 0 : +(options.tilt ?? 0.28);
    const P = { ior: +(options.ior ?? 1.45), refr: +(options.refraction ?? 70), disp: +(options.dispersion ?? 0.06), fres: +(options.fresnel ?? 0.35), refl: +(options.reflections ?? 1.1), bevel: +(options.bevel ?? (shape ? 5.7 : 26)), depth: +(options.depth ?? 8) };
    const back = document.createElement("canvas"), ctx = back.getContext("2d");
    const scope = el.closest("section, footer, [data-fx-scroller]") || el.parentElement;
    const texts = () => (options.text ? [...scope.querySelectorAll(options.text)] : []);
    let w = 0, h = 0, dpr = 1, bg = "", seen = true, last = "";
    const cur = [0, 0];
    const io = new IntersectionObserver(([en]) => (seen = en.isIntersecting));
    io.observe(el);
    const ro = new ResizeObserver(() => (w = 0));
    ro.observe(el);
    if (!listening) { addEventListener("pointermove", onMove, { passive: true }); listening = true; }
    const paint = (r) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, r.width, r.height);
      const range = document.createRange();
      texts().forEach((t) => {
        const cs = getComputedStyle(t);
        if (cs.visibility === "hidden" || +cs.opacity === 0) return;
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        ctx.fillStyle = cs.color;
        const walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
        for (let tn = walk.nextNode(); tn; tn = walk.nextNode()) {
          const re = /\S+/g;
          for (let m = re.exec(tn.textContent); m; m = re.exec(tn.textContent)) {
            range.setStart(tn, m.index); range.setEnd(tn, m.index + m[0].length);
            const b = range.getBoundingClientRect();
            if (b.right < r.left || b.left > r.right || b.bottom < r.top || b.top > r.bottom) continue;
            const mt = ctx.measureText(m[0]);
            const asc = mt.fontBoundingBoxAscent ?? b.height * 0.8, desc = mt.fontBoundingBoxDescent ?? b.height * 0.2;
            ctx.fillText(m[0], b.left - r.left, b.top - r.top + (b.height - asc - desc) / 2 + asc);
          }
        }
      });
    };
    const frame = () => {
      if (!seen) return;
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      if (!w || Math.abs(w - r.width) > 0.5 || Math.abs(h - r.height) > 0.5) {
        dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height;
        canvas.width = back.width = Math.round(w * dpr); canvas.height = back.height = Math.round(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        bg = bgOf(el.parentElement);
        const tint = rgb(getComputedStyle(el).getPropertyValue("--fx-tint").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-bg").trim());
        gl.uniform3f(U("u_tint"), tint[0], tint[1], tint[2]);
        gl.uniform2f(U("u_res"), canvas.width, canvas.height);
        gl.uniform1f(U("u_shape"), shape);
        const size = Math.min(canvas.width, canvas.height);
        gl.uniform1f(U("u_bevel"), shape ? (P.bevel / 100) * size * 1.6 : (P.bevel / 400) * size * 1.6);
        gl.uniform1f(U("u_hole"), 0.88);
        gl.uniform1f(U("u_rad"), 0.12467);
        gl.uniform1f(U("u_refr"), (P.refr / 400) * size * 0.35);
        gl.uniform1f(U("u_disp"), P.disp * 4);
        gl.uniform1f(U("u_fres"), P.fres);
        gl.uniform1f(U("u_refl"), P.refl);
        gl.uniform1f(U("u_ior"), P.ior);
        gl.uniform1f(U("u_depth"), P.depth * dpr);
        last = "";
      }
      const idle = performance.now() - pt.t > 900;
      const tx = idle ? 0 : gsap.utils.clamp(-1, 1, (pt.x - (r.left + r.width / 2)) / (innerWidth / 2)) * tiltAmt;
      const ty = idle ? 0 : gsap.utils.clamp(-1, 1, -(pt.y - (r.top + r.height / 2)) / (innerHeight / 2)) * tiltAmt;
      cur[0] += (tx - cur[0]) * 0.08; cur[1] += (ty - cur[1]) * 0.08;
      const key = `${Math.round(r.left)},${Math.round(r.top)},${cur[0].toFixed(4)},${cur[1].toFixed(4)}`;
      if (key === last && !options.text) return;
      last = key;
      paint(r);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, back); } catch (e) { return; }
      gl.uniform2f(U("u_tilt"), cur[0], cur[1]);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    gsap.ticker.add(frame);
    frame();
    return () => { gsap.ticker.remove(frame); io.disconnect(); ro.disconnect(); gl.getExtension("WEBGL_lose_context")?.loseContext(); canvas.remove(); };
  });
})();
