// About — line-by-line reveal (from 102% below → 0, 1.4s o6, .1s per line), parallax 0.13, underlined-word photo pile, portrait frame walking and glow around the mouse, spinning initials.
(() => {
  const { gsap } = window;
  const H = window.H;
  const REVEAL = { from: 102, duration: 1.4, ease: H.o6, step: 0.1, start: 0.85 };
  const PHOTO = { start: 0.8, rise: 100, zoom: 0.17, intro: 1.6, grid: 16, reveal: 2.2, mouse: 0.07, area: 0.05, radius: 190, click: 6 };
  const STACK = { interval: 240, spreadX: 50, fromY: 50, tilt: 10, in: 0.4, outDelay: 0.5, out: 0.25, outScale: 0.9, box: 248 };
  const PARALLAX = 0.13;
  const mobile = H.isMobile();

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  const page = document.querySelector("[data-page]");
  const progressEl = document.querySelector("[data-progress]");
  document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  // On phone, two paragraphs are joined into one and line breaks are removed (same as the original)
  if (mobile) {
    page.querySelectorAll(".p-big br, .p-44 br").forEach((br) => br.replaceWith(" "));
    const [first, second] = page.querySelectorAll(".p-big");
    first.append(" ", ...second.childNodes);
    second.remove();
  }

  function buildGroups() {
    const groups = new Map();
    page.querySelectorAll("[data-group]").forEach((el) => {
      const name = el.dataset.group;
      if (!groups.has(name)) groups.set(name, { name, els: [], steps: [], shown: false });
      const g = groups.get(name);
      const base = Number(el.dataset.step) || 0;
      g.els.push(el);
      H.splitLines(el).forEach((inner, i) => (g.steps[base + i] ||= []).push(inner));
    });
    return [...groups.values()];
  }
  const masks = (g) => g.steps.flat().filter(Boolean).map((i) => i.parentElement);
  function showGroup(g, delay = 0) {
    g.shown = true;
    g.steps.forEach((inners, k) => {
      if (!inners) return;
      gsap.to(inners, {
        yPercent: 0,
        duration: H.reduce ? 0 : REVEAL.duration,
        ease: REVEAL.ease,
        delay: H.reduce ? 0 : delay + k * REVEAL.step,
        onStart: () => gsap.set(inners.map((i) => i.parentElement), { visibility: "" }),
        onComplete: () => inners.forEach((i) => i.parentElement.classList.add("is-in")),
      });
    });
  }

  // ---------- Initials ----------
  // Top Y: our shape pushed out with three.js (stage3d.js) — one turn per 5.05s, speeds up with the scroll speed and follows its direction
  const glyph = (() => {
    const y = new Stage3D.Y3D(document.querySelector("[data-glyph]"));
    return { show: () => y.show(H.reduce), draw: (t, s) => y.update(t, s) };
  })();

  // ---------- Portrait ----------
  const photo = document.querySelector("[data-photo]");
  const photoGrid = photo.querySelector("[data-photo-grid]");
  const rows = Math.round((PHOTO.grid * 848) / 670);
  photoGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  for (let i = 0; i < PHOTO.grid * rows; i++) photoGrid.appendChild(document.createElement("span"));
  // Overlays two photos in WebGL, and inside a circle around the mouse cuts the top photo with a noise (layered fbm) edge to reveal the bottom photo.
  // Follows the mouse at .07 · radius .05. Pressing within 6px grows the circle 20x over 2.2s so the photo below rises up
  const portrait = (() => {
    const c = document.createElement("canvas");
    c.className = "p-photo-gl";
    photo.insertBefore(c, photoGrid);
    const gl = c.getContext("webgl", { premultipliedAlpha: false });
    if (!gl) return null;
    const VS = "attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = aPos * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(aPos, 0.0, 1.0); }";
    const FS = `precision highp float;
      uniform sampler2D uTop; uniform sampler2D uBottom; uniform vec2 uMouse; uniform vec2 uSize; uniform float uR; uniform float uTime;
      varying vec2 vUv;
      float h(vec2 p) { return fract(sin(dot(p, vec2(41.31, 289.17))) * 15731.743); }
      float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n(p); p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.03 + 3.1; a *= 0.5; } return v; }
      void main() {
        vec4 col = texture2D(uTop, vUv);
        float d = distance(vUv * uSize, uMouse);
        if (d < uR) {
          vec2 q = vUv * 20.0;
          float w = fbm(q + fbm(q + vec2(1.7, 9.2) + uTime * 0.08)) * (4.0 * d / uR);
          if (w * w * w + 0.6 * w * w + 0.5 * w < 0.5) col = texture2D(uBottom, vUv + (n(vUv * 20.0 - uTime / 5.0) - 0.5) / 70.0);
        }
        gl_FragColor = col;
      }`;
    const sh = (t, src) => { const x = gl.createShader(t); gl.shaderSource(x, src); gl.compileShader(x); return x; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(pr, "aPos");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    // Placeholder photo: a background in the skin’s surface color, with an X and a label of what the photo is (if you add a photo, that image is used as is)
    const paint = (el, lift) => {
      const img = el.querySelector("img");
      if (img && img.complete && img.naturalWidth) return img;
      const k = document.createElement("canvas"); k.width = 670; k.height = 848;
      const x = k.getContext("2d");
      x.fillStyle = H.cssColor("--kf-raised"); x.fillRect(0, 0, 670, 848);
      x.fillStyle = H.cssColor("--kf-ink", lift); x.fillRect(0, 0, 670, 848);
      x.strokeStyle = H.cssColor("--kf-ink", 0.16); x.lineWidth = 2;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(670, 848); x.moveTo(670, 0); x.lineTo(0, 848); x.stroke();
      x.font = `500 14px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-mono")}`;
      x.textAlign = "center"; x.fillStyle = H.cssColor("--kf-ink", 0.6);
      (el.dataset.label || "").split(" · ").forEach((l, i, a) => x.fillText(l, 335, 424 + (i - (a.length - 1) / 2) * 20));
      return k;
    };
    const tex = (src) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); return t; };
    const texs = [tex(paint(photo.querySelector(".p-photo-base"), 0.06)), tex(paint(photo.querySelector(".p-photo-hover"), 0.16))];
    let top = 0, revealing = false, down = null;
    const st = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0 };
    photo.style.pointerEvents = "auto";
    photo.addEventListener("mousemove", (e) => { const b = photo.getBoundingClientRect(); st.tx = e.clientX - b.left; st.ty = e.clientY - b.top; if (!revealing) st.tr = PHOTO.radius * H.px(); });
    photo.addEventListener("mouseleave", () => { if (!revealing) st.tr = 0; });
    addEventListener("pointerdown", (e) => (down = { x: e.clientX, y: e.clientY }));
    photo.addEventListener("click", (e) => {
      if (revealing || (down && Math.max(Math.abs(e.clientX - down.x), Math.abs(e.clientY - down.y)) > PHOTO.click)) return;
      if (mobile) { const b = photo.getBoundingClientRect(); st.x = st.tx = e.clientX - b.left; st.y = st.ty = e.clientY - b.top; }
      revealing = true;
      const from = st.r;
      gsap.to({ p: 0 }, { p: 1, duration: H.reduce ? 0 : PHOTO.reveal, ease: "none", onUpdate() { st.r = from + (PHOTO.radius * H.px() * 20 - from) * this.targets()[0].p; },
        onComplete: () => { top = 1 - top; st.r = st.tr = 0; revealing = false; } });
    });
    return {
      draw(t) {
        const b = photo.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
        if (b.bottom < 0 || b.top > innerHeight) return;
        if (c.width !== Math.round(b.width * d)) { c.width = Math.round(b.width * d); c.height = Math.round(b.height * d); gl.viewport(0, 0, c.width, c.height); }
        st.x += (st.tx - st.x) * PHOTO.mouse; st.y += (st.ty - st.y) * PHOTO.mouse;
        if (!revealing) st.r += (st.tr - st.r) * PHOTO.area;
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texs[top]); gl.uniform1i(U("uTop"), 0);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texs[1 - top]); gl.uniform1i(U("uBottom"), 1);
        gl.uniform2f(U("uMouse"), st.x, st.y); gl.uniform2f(U("uSize"), b.width, b.height);
        gl.uniform1f(U("uR"), st.r); gl.uniform1f(U("uTime"), t / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
    };
  })();
  let photoShown = false;
  function showPhoto() {
    photoShown = true;
    if (H.reduce) return gsap.set(photoGrid, { autoAlpha: 0 });
    gsap.fromTo(photo.querySelectorAll(".wf-img, .p-photo-gl"), { y: PHOTO.rise, scale: 1 + PHOTO.zoom }, { y: 0, scale: 1, duration: PHOTO.intro, ease: "expo.out" });
    // A 16-cell grid switches off in random order, revealing the photo
    gsap.to(photoGrid.children, { opacity: 0, duration: 0.25, ease: "none", stagger: { each: PHOTO.reveal / (PHOTO.grid * rows), from: "random" } });
  }

  // ---------- Underlined word photo pile ----------
  const layer = document.querySelector("[data-stack-layer]");
  const canHover = matchMedia("(hover: hover)");
  document.querySelectorAll("[data-stack]").forEach((word) => {
    const list = [...document.querySelectorAll(`[data-stack-media="${word.dataset.stack}"] > li`)];
    if (!list.length) return;
    let timer = 0, n = 0;
    const add = () => {
      const li = list[n++ % list.length];
      const px = H.px();
      const r = word.getBoundingClientRect(), p = page.getBoundingClientRect();
      const x = r.left - p.left + r.width / 2, y = r.top - p.top + r.height / 2;
      const [a, b] = (li.dataset.ratio || "1/1").split("/").map(Number);
      const box = STACK.box * px;
      const w = a >= b ? box : (box * a) / b, h = a >= b ? (box * b) / a : box;
      const item = document.createElement("div");
      item.className = "p-stack-item";
      item.innerHTML = `<div class="wf-img" data-label="${li.dataset.label}" style="width:${w}px;height:${h}px;background-color:${li.dataset.tone || ""}"></div>`;
      layer.appendChild(item);
      gsap.fromTo(item,
        { xPercent: -50, yPercent: -50, x: x + (Math.random() - 0.5) * STACK.spreadX * px, y: y + STACK.fromY * px, rotation: (Math.random() - 0.5) * STACK.tilt },
        { y, rotation: (Math.random() - 0.5) * STACK.tilt, ease: "power4.out", duration: STACK.in });
      gsap.to(item, { scale: STACK.outScale, delay: STACK.outDelay, duration: STACK.out, ease: "back.in(3)", onComplete: () => item.remove() });
    };
    const start = (limit = Infinity) => {
      let k = 0;
      clearInterval(timer);
      timer = setInterval(() => {
        add();
        if (++k >= limit) clearInterval(timer);
      }, STACK.interval);
    };
    word.addEventListener("mouseenter", () => canHover.matches && start());
    word.addEventListener("mouseleave", () => clearInterval(timer));
    word.addEventListener("click", (e) => {
      e.preventDefault();
      if (!canHover.matches) start(list.length);
    });
  });

  // ---------- Start ----------
  async function boot() {
    await document.fonts.ready;
    const groups = buildGroups();
    groups.forEach((g) => {
      gsap.set(g.steps.flat().filter(Boolean), { yPercent: REVEAL.from });
      gsap.set(masks(g), { visibility: "hidden" });
    });
    const names = groups.find((g) => g.name === "names");
    const heroes = groups.filter((g) => g.name.startsWith("hero"));
    const below = groups.filter((g) => g !== names && !heroes.includes(g));
    page.classList.add("is-ready");

    const parallaxEls = mobile ? [] : [...page.querySelectorAll("[data-parallax]")];
    let zero = 0;
    const measure = () => {
      if (!parallaxEls.length) return;
      const top = Math.min(...parallaxEls.map((el) => el.offsetTop));
      const bottom = Math.max(...parallaxEls.map((el) => el.offsetTop + el.offsetHeight));
      zero = (top + bottom) / 2 - innerHeight / 2;
    };
    if (!mobile) document.body.style.height = `${page.offsetHeight}px`;
    measure();
    addEventListener("resize", () => {
      if (!H.isMobile()) document.body.style.height = `${page.offsetHeight}px`;
      measure();
    });

    const smooth = H.smoothScroll();
    let shown = null;
    function frame(t) {
      if (smooth) smooth.raf(t);
      const s = smooth ? smooth.animatedScroll : scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const p = Math.round(Math.min(1, Math.max(0, s / max)) * 100);
      if (p !== shown) progressEl.textContent = String((shown = p)).padStart(3, "0");
      const y = Math.round(-(s - zero) * PARALLAX * 100) / 100;
      if (!H.reduce) parallaxEls.forEach((el) => (el.style.transform = `translate3d(0,${y}px,0)`));
      const limit = innerHeight * REVEAL.start;
      below.forEach((g) => !g.shown && g.els[0].getBoundingClientRect().top < limit && showGroup(g));
      heroes.forEach((g) => !g.shown && g.els[0].getBoundingClientRect().top < limit && showGroup(g));
      if (!photoShown && photo.getBoundingClientRect().top < innerHeight * PHOTO.start) showPhoto();

      portrait && portrait.draw(t);
      glyph.draw(t, s);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    H.enter();
    glyph.show();
    showGroup(names);
    const heroDelay = mobile ? 0 : names.steps.length * REVEAL.step;
    heroes.forEach((g) => g.els[0].getBoundingClientRect().top < innerHeight && showGroup(g, heroDelay));
  }
  boot();
})();
