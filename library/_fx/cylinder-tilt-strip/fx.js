// While the Swiper photo strip flows endlessly with delay 0, for each cell the distance from screen center (d = e as the square of (distance/half-width, 0~1)
// Makes it look stuck on the inside of a cylinder — in CSS, rotateY(∓e·tilt°) · translateZ(−(1−e)·depth) · scale(1+e·scale) · left and right sides clipped by e·clip%,
// The image is WebGL, treating the whole strip as one cylinder, flattening the horizontal coordinate with sin and darkening toward the edges (0.7+0.3·cos).
// Only one WebGL board per strip (one per cell would exceed 16 including loop clones and the front boards would go off) and it is drawn onto the cell’s 2D board.
// Shaders are precompiled when the strip is set up. Inside the cell <img> If an image is present, draw it. Otherwise draw a placeholder labeled with the data-label text
(() => {
  const VERT = "attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}";
  // Treat the whole band as a cylinder angle in [-1,1], and convert the screen position of the [lo,hi] this cell covers into unrolled coordinates on the cylinder to get the drawing’s u
  const FRAG = [
    "precision mediump float;varying vec2 uv;uniform sampler2D tex;uniform float bend,mid,half;uniform vec4 crop;",
    "float unroll(float g){return sin(g*bend)/sin(bend);}",
    "void main(){",
    " float g=mid+(uv.x*2.-1.)*half;",
    " float u=uv.x;",
    " if(bend>.01){float lo=unroll(mid-half),hi=unroll(mid+half);u=hi-lo>.001?clamp((unroll(g)-lo)/(hi-lo),0.,1.):uv.x;}",
    " vec4 c=texture2D(tex,vec2(crop.x+u*(crop.y-crop.x),crop.z+uv.y*(crop.w-crop.z)));",
    " float shade=bend>.01?.7+.3*cos(g*bend):1.;",
    " gl_FragColor=vec4(c.rgb*shade,1.);",
    "}",
  ].join("\n");

  const css = (k) => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  // Placeholder artwork — since the strip often sits on a pale panel, it is filled with the line color and draws an X and the name in a faded text color
  function placeholder(label) {
    const w = 640, h = 360, c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = css("--kf-line") || css("--kf-raised");
    g.fillRect(0, 0, w, h);
    g.strokeStyle = css("--kf-dim");
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    if (label) {
      g.fillStyle = css("--kf-ink-soft") || css("--kf-dim");
      g.font = `500 22px ${css("--kf-font-sans") || "sans-serif"}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label.length > 34 ? `${label.slice(0, 33)}…` : label, w / 2, h / 2);
    }
    return c;
  }

  function makeGl() {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, VERT), f = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    // Draw once when setting up so compilation doesn’t stall on the first draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    const u = { bend: gl.getUniformLocation(p, "bend"), mid: gl.getUniformLocation(p, "mid"), half: gl.getUniformLocation(p, "half"), crop: gl.getUniformLocation(p, "crop") };
    return { canvas, gl, u };
  }

  kfFx.register("cylinder-tilt-strip", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || !window.Swiper || !track.querySelector(".swiper-slide")) return;
    const num = (k, d) => +(options[k] ?? d);
    const shape = (w) => (w >= 768
      ? { bend: num("curve", 0.75), tilt: num("tilt", 25), depth: num("depth", 150), grow: num("scale", 0.07), clip: num("clip", 5) }
      : { bend: num("curve-sp", 0.35), tilt: num("tilt-sp", 12), depth: num("depth-sp", 50), grow: num("scale-sp", 0.01), clip: num("clip-sp", 0) });
    const swiper = new Swiper(track, {
      centeredSlides: true,
      loop: true,
      loopAdditionalSlides: 1,
      slidesPerView: num("per-sp", 1.35),
      spaceBetween: num("gap-sp", 20),
      speed: num("speed", 6000),
      allowTouchMove: false,
      autoplay: reduce ? false : { delay: 0, disableOnInteraction: false, reverseDirection: options.dir !== "left" },
      breakpoints: { 768: { slidesPerView: num("per", 2.7), spaceBetween: num("gap", 60) } },
      on: { slideChange: () => el.dispatchEvent(new CustomEvent("fx:step")) },
    });
    const gl = makeGl();
    // After Swiper makes the loop clones, set up the 2D panel and image in each cell — clone cells must show the same image so the seam is invisible
    const plates = new Map();
    const itemOf = (slide) => slide.querySelector("[data-fx-part='item']") || slide;
    if (gl) {
      for (const slide of track.querySelectorAll(".swiper-slide")) {
        const item = itemOf(slide);
        const canvas = document.createElement("canvas");
        canvas.className = "fx-cts__plate";
        canvas.setAttribute("aria-hidden", "true");
        item.prepend(canvas);
        item.classList.add("fx-cts__has-plate");
        const tex = gl.gl.createTexture();
        const plate = { canvas, ctx: canvas.getContext("2d"), tex, iw: 1, ih: 1, ready: false };
        plate.upload = () => {
          const img = item.querySelector("img");
          const src = img && img.complete && img.naturalWidth ? img : placeholder(item.dataset.label || item.querySelector("[data-label]")?.dataset.label || "");
          const g = gl.gl;
          g.bindTexture(g.TEXTURE_2D, tex);
          [g.TEXTURE_WRAP_S, g.TEXTURE_WRAP_T].forEach((k) => g.texParameteri(g.TEXTURE_2D, k, g.CLAMP_TO_EDGE));
          [g.TEXTURE_MIN_FILTER, g.TEXTURE_MAG_FILTER].forEach((k) => g.texParameteri(g.TEXTURE_2D, k, g.LINEAR));
          try { g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, src); } catch { return; }
          plate.iw = src.naturalWidth || src.width; plate.ih = src.naturalHeight || src.height;
          plate.ready = true;
        };
        plate.upload();
        item.querySelector("img")?.addEventListener("load", plate.upload, { once: true });
        plates.set(slide, plate);
      }
    }
    el.classList.toggle("fx-cts-flat", !plates.size);
    let size = [0, 0];
    const fit = () => {
      const first = track.querySelector(".swiper-slide");
      if (!first || !gl) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(first.offsetWidth * dpr)), h = Math.max(2, Math.round(itemOf(first).offsetHeight * dpr));
      size = [w, h];
      gl.canvas.width = w; gl.canvas.height = h;
      gl.gl.viewport(0, 0, w, h);
      plates.forEach((p) => { p.canvas.width = w; p.canvas.height = h; });
    };
    fit();
    track.style.perspective = "1200px";
    let raf = 0;
    const frame = () => {
      const r = track.getBoundingClientRect();
      const centre = r.left + r.width / 2, reach = r.width / 2 || 1;
      const s = shape(r.width);
      const first = track.querySelector(".swiper-slide");
      const half = first ? first.offsetWidth / 2 / reach : 0.3;
      for (const slide of track.querySelectorAll(".swiper-slide")) {
        const sr = slide.getBoundingClientRect();
        const off = (sr.left + sr.width / 2 - centre) / reach;
        const e = Math.min(Math.abs(off), 1) ** 2;
        const side = off < 0 ? -1 : 1;
        slide.style.clipPath = `inset(0 ${e * s.clip}% 0 ${e * s.clip}%)`;
        slide.style.transform = `perspective(1200px) rotateY(${-side * e * s.tilt}deg) translateZ(${-(1 - e) * s.depth}px) scale(${1 + e * s.grow})`;
        const plate = plates.get(slide);
        // Off-screen cells are not drawn
        if (!plate || !plate.ready || sr.right < 0 || sr.left > innerWidth) continue;
        const g = gl.gl, va = size[0] / size[1], ia = plate.iw / plate.ih;
        const crop = ia > va ? [0.5 - (0.5 * va) / ia, 0.5 + (0.5 * va) / ia, 0, 1] : [0, 1, 0.5 - (0.5 * ia) / va, 0.5 + (0.5 * ia) / va];
        g.bindTexture(g.TEXTURE_2D, plate.tex);
        g.uniform1f(gl.u.bend, s.bend); g.uniform1f(gl.u.mid, off); g.uniform1f(gl.u.half, half); g.uniform4fv(gl.u.crop, crop);
        g.drawArrays(g.TRIANGLES, 0, 6);
        plate.ctx.drawImage(gl.canvas, 0, 0);
      }
      raf = requestAnimationFrame(frame);
    };
    frame();
    const ro = new ResizeObserver(fit);
    ro.observe(track);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      swiper.destroy(true, true);
      plates.forEach((p) => p.canvas.remove());
      track.querySelectorAll(".fx-cts__has-plate").forEach((n) => n.classList.remove("fx-cts__has-plate"));
      gl?.gl.getExtension("WEBGL_lose_context")?.loseContext();
      el.classList.remove("fx-cts-flat");
      track.style.perspective = "";
    };
  });
})();
