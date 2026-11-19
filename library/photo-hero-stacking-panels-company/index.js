// Home only: loader → hero photo shrinks into a card to form a collage · feature index · results tabs/filter · client logo row.
// Original values: card 300×390 · corner 5px (1.25× at 1600 and above) · scrub .4 for one screen · progress curved by 1-2^(-10p) · photo 1→0.6×
//           flying photo start points x -.75vw/-.5vw/+2vw/+2.5vw · y 300/100/400/800px · arrival thresholds 2/2/8/8px · loader letters 1.5s cubic-bezier(.25,1,.5,1) 30ms apart
window.BA_HOME_LOADER = (done) => {
  const BA = window.BA;
  const loader = document.querySelector(".ba-loader");
  const root = document.documentElement;
  const heroLines = [...document.querySelectorAll("[data-hero-lines]")];

  const finish = () => {
    root.classList.remove("is-loading");
    loader.remove();
    heroLines.forEach((el, i) => {
      const lines = BA.splitLines(el).lines;
      if (BA.reduced) return;
      gsap.fromTo(lines, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.3, ease: "expo.out", stagger: 0.1, delay: i * 0.12 });
    });
    if (!BA.reduced) gsap.from([".ba-logo", ".ba-nav", ".ba-menu-btn"], { opacity: 0, y: -10, duration: 0.5, ease: "power2.out", stagger: 0.05 });
    heroClip();
    done();
  };

  if (BA.reduced) return finish();

  CustomEase.create("baChar", "M0,0 C0.25,1 0.5,1 1,1");
  const word = loader.querySelector(".ba-loader__word");
  word.innerHTML = [...word.textContent].map((c) => `<span>${c}</span>`).join("");
  const mark = loader.querySelector(".ba-loader__mark span");
  mark.parentElement.innerHTML = [...mark.textContent].map((c) => `<span>${c}</span>`).join("");
  const frame = loader.querySelector(".ba-loader__frame");
  const pic = loader.querySelector(".ba-loader__pic");
  const bg = loader.querySelector(".ba-loader__bg");

  gsap.timeline({ onComplete: finish })
    .from(word.children, { yPercent: 110, duration: 1.5, ease: "baChar", stagger: 0.03 })
    .fromTo([frame, pic], { scale: 0, rotate: 45 }, { scale: 1, rotate: 20, duration: 0.6, ease: "power3.out" }, 0.9)
    .to(frame, { scale: 4.2, rotate: 0, duration: 1.1, ease: "baIO" }, 1.5)
    .to(pic, { width: "9rem", height: "9rem", rotate: 0, duration: 1.1, ease: "baIO" }, 1.5)
    .to(word, { y: () => -innerHeight * 0.36, duration: 1.1, ease: "baIO" }, 1.5)
    .from(loader.querySelectorAll(".ba-loader__mark span"), { yPercent: 110, duration: 1.3, ease: "baIO", stagger: 0.02 }, 1.5)
    .to(pic, { width: () => innerWidth, height: () => innerHeight, borderRadius: 0, duration: 1.3, ease: "baIO" }, 2.5)
    .to(frame, { opacity: 0, scale: 6, duration: 0.8, ease: "power2.in" }, 2.5)
    .to(word, { opacity: 0, duration: 0.4 }, 2.6)
    .to(loader.querySelector(".ba-loader__mark"), { opacity: 0, duration: 0.6 }, 3.1)
    .to(bg, { opacity: 0, duration: 0.01 }, 3.3)
    .to(pic, { opacity: 0, duration: 0.45, ease: "baIO" }, 3.6);
};

function heroClip() {
  const hero = document.querySelector(".hero");
  const vis = hero.querySelector(".hero__vis");
  const media = hero.querySelector(".hero__media .wf-img");
  const g = (n) => hero.querySelector(`.hero__g--${n}`);
  // [photo, start x, start y, arrival threshold px] — the right two come from far away, so their threshold is wider
  const items = [
    [g(1), () => -innerWidth * 0.75, 300, 2],
    [g(2), () => -innerWidth * 0.5, 100, 2],
    [g(4), () => innerWidth * 2, 400, 8],
    [g(5), () => innerWidth * 2.5, 800, 8],
  ];
  const W = (p) => (p === 1 ? 1 : 1 - Math.pow(2, -10 * p));
  // Until the progress n where the remaining distance drops under the threshold px it comes straight, after that it decelerates with 1-(1-c)² and lands in place
  const settle = (e, sx, sy, th) => {
    const n = Math.min(Math.max(Math.max(sx ? 1 - th / Math.abs(sx) : 0, sy ? 1 - th / Math.abs(sy) : 0), 0), 0.9999);
    if (e <= n) return [sx * (1 - e), sy * (1 - e)];
    const c = (e - n) / (1 - n), d = 1 - (1 - c) * (1 - c);
    return [sx * (1 - n) * (1 - d), sy * (1 - n) * (1 - d)];
  };

  window.BA.mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    const update = (p) => {
      const e = W(p);
      const k = innerWidth >= 1600 ? 1.25 : 1;
      const h = Math.max((innerWidth - 300 * k) / 2, 0);
      const v = Math.max((innerHeight - 390 * k) / 2, 0);
      vis.style.clipPath = `inset(${v * e}px ${h * e}px round ${5 * k * e}px)`;
      const vw = innerWidth - h * e * 2, vh = innerHeight - v * e * 2;
      gsap.set(media, { scale: Math.max(1 - 0.4 * e, Math.min(1, Math.max(vw / innerWidth, vh / innerHeight) + 0.01)) });
      items.forEach(([el, sx, sy, th]) => {
        const [x, y] = settle(e, sx(), sy, th);
        gsap.set(el, { x, y });
      });
    };
    const state = { p: 0 };
    update(0);
    gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: () => update(state.p),
      scrollTrigger: { trigger: hero, start: "top top", end: () => "+=" + innerHeight, scrub: 0.4, invalidateOnRefresh: true },
    });
    return () => {
      vis.style.clipPath = "";
      gsap.set([media, ...items.map((i) => i[0])], { clearProps: "all" });
    };
  });
}

// Turn the wordmark before the hero into glass letters — rebuild the original physicalRenderer spot with our own shader.
// One convex lens (elliptic paraboloid) per letter: it bends the photo behind it with a refractive index of 1.5187 (path min(64, short radius×1.15) · gain 2 · min radius 28 · slope .9 · show-through .82),
// Within 160px of the screen edge the bend disappears. Cursor position (−1~1 relative to the window, inertia time constant .32s) moves the lens optical center toward the cursor by .28 of the radius, and
// Each axis has a large bend, flattening by distance² ×.26 and shifting 2.8px. One set of translucent lights follows the cursor by 130px horizontally and 92px vertically
// Reflection strength depends on cursor x: .95 (left edge)→.84 (center)→.66 (right edge). The light drifts on its own as a sum of three sines at 1.6x speed (.62·.27·.11 × 105px).
// Touch pointers are ignored, and when the pointer leaves the window or the window blurs, it returns to 0. With reduced motion, it settles at the center value without cursor or drifting.
function heroGlass() {
  const mark = document.querySelector(".hero__mark--front");
  const span = mark?.querySelector(".hero__rail span");
  const media = document.querySelector(".hero__media .wf-img");
  const host = document.querySelector(".hero__sticky");
  if (!span || !media || !window.THREE) return;
  const T = THREE, MAXG = 32;
  const still = window.BA.reduced;
  let renderer;
  try { renderer = new T.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "high-performance" }); } catch (e) { return; }
  renderer.outputColorSpace = T.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const cv = renderer.domElement;
  cv.className = "hero__glass";
  mark.append(cv);

  // The Skin color may be in a form THREE can’t read, so one dot is painted and read back as rgb
  const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (css) => { swatch.clearRect(0, 0, 1, 1); swatch.fillStyle = css; swatch.fillRect(0, 0, 1, 1); const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data; return new T.Vector3(r / 255, g / 255, b / 255); };
  const ms = getComputedStyle(media);
  const lineCss = ms.getPropertyValue("--wf-line").trim();

  const strip = document.createElement("canvas");
  const sctx = strip.getContext("2d");
  const cov = new T.CanvasTexture(strip);
  cov.minFilter = cov.magFilter = T.LinearFilter;
  cov.generateMipmaps = false;
  cov.flipY = false;
  const glyphs = Array.from({ length: MAXG }, () => new T.Vector4());
  const U = {
    uCov: { value: cov }, uSize: { value: new T.Vector2(1, 1) }, uOrigin: { value: new T.Vector2() }, uView: { value: new T.Vector2(1, 1) },
    uPeriod: { value: 1 }, uPhase: { value: 0 }, uG: { value: glyphs }, uN: { value: 0 },
    uPtr: { value: new T.Vector2() }, uLight: { value: new T.Vector2() }, uRefl: { value: 0.84 },
    uMedia: { value: new T.Vector4(0, 0, 1, 1) }, uFill: { value: rgb(ms.backgroundColor) }, uLine: { value: rgb(lineCss) },
  };
  const mat = new T.ShaderMaterial({
    uniforms: U,
    depthTest: false, depthWrite: false, transparent: true, blending: T.NoBlending,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
    fragmentShader: `
      precision highp float;
      #define MAXG ${MAXG}
      uniform sampler2D uCov;
      uniform vec2 uSize, uOrigin, uView, uPtr, uLight;
      uniform float uPeriod, uPhase, uRefl;
      uniform vec4 uG[MAXG];
      uniform int uN;
      uniform vec4 uMedia;
      uniform vec3 uFill, uLine;
      varying vec2 vUv;

      // Redraw the back photo placeholder in screen coordinates — background color · two diagonals joining the corners · bottom shade (.28 → 0 at 45%)
      vec3 backdrop(vec2 s) {
        vec2 q = s - uMedia.xy, wh = uMedia.zw;
        float len = length(wh);
        float d = min(abs(q.x * wh.y - q.y * wh.x), abs(q.x * wh.y + q.y * wh.x - wh.x * wh.y)) / len;
        vec3 c = mix(uFill, uLine, clamp(1. - d, 0., 1.) * .55);
        float up = (uView.y - s.y) / uView.y;
        return c * (1. - .28 * clamp(1. - up / .45, 0., 1.));
      }
      float cover(vec2 sp) { return texture2D(uCov, vec2(sp.x / uPeriod, sp.y / uSize.y)).a; }

      void main() {
        vec2 p = vec2(vUv.x, 1. - vUv.y) * uSize;
        vec2 sp = vec2(mod(p.x - uPhase, uPeriod), p.y);
        float a = cover(sp);
        if (a < .004) { gl_FragColor = vec4(0.); return; }

        vec4 g = uG[0];
        float best = 1e9;
        for (int i = 0; i < MAXG; i++) {
          if (i >= uN) break;
          float dx = abs(sp.x - uG[i].x) - uG[i].z;
          if (dx < best) { best = dx; g = uG[i]; }
        }
        // Lens: the paraboloid slope grows straighter the farther from center — the cursor shifts the optical center and reduces the bend on that axis
        vec2 R = max(g.zw, vec2(28.));
        float rMin = min(R.x, R.y);
        vec2 aim = clamp(uPtr, -1., 1.);
        vec2 off = sp - g.xy - aim * R * .28;
        vec2 tilt = off / (R * R) * rMin * .9 * (1. - aim * aim * .26);
        vec3 ray = refract(vec3(0., 0., -1.), normalize(vec3(tilt, 1.)), 1. / 1.5187);
        vec2 warp = ray.xy / max(-ray.z, .35) * min(64., rMin * 1.15) * 2. + aim * 2.8;
        vec2 s = p + uOrigin;
        warp *= smoothstep(vec2(0.), vec2(160.), max(min(s, uView - s), vec2(0.)));
        vec3 col = backdrop(s + warp) * .82;

        // Reflection: a set of lights moving with the cursor reflects on the flat front face — in the original recording the white window reflection sits 430px to the right of the light position
        // The white glow is about 440px wide and sits 40px lower, so when the cursor moves down it leaves the text band and fades
        vec2 L = s - uLight;
        float win = exp(-pow(max(abs(L.x - 430.) - 120., 0.) / 110., 2.)) * exp(-pow(max(abs(L.y - 40.) - 40., 0.) / 120., 2.));
        float warm = exp(-dot(L + vec2(420., 0.), L + vec2(420., 0.)) / (2. * 340. * 340.));
        // Edge: faint rim light where the coverage thins
        float e = min(min(cover(sp + vec2(1.5, 0.)), cover(sp - vec2(1.5, 0.))), min(cover(sp + vec2(0., 1.5)), cover(sp - vec2(0., 1.5))));
        float rim = clamp(1. - e, 0., 1.);
        vec3 refl = vec3(.06, .075, .09) + vec3(1.) * (win * .95 + rim * .1) + vec3(1., .97, .9) * warm * .1;
        col = col + refl * uRefl * (1. - col * .45);
        gl_FragColor = vec4(min(col, 1.) * a, a);
      }`,
  });
  const scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));

  // Draws a one-section-long text strip as an overlay texture — measures each letter’s box center and radius together (the strip flows via CSS so only positions are read)
  const buildStrip = () => {
    const cs = getComputedStyle(mark);
    const size = parseFloat(cs.fontSize), ls = parseFloat(cs.letterSpacing) || 0;
    const font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    const period = span.getBoundingClientRect().width, H = mark.clientHeight;
    const dpr = Math.min(devicePixelRatio, 2);
    strip.width = Math.ceil(period * dpr); strip.height = Math.ceil(H * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.font = font; sctx.letterSpacing = `${ls}px`; sctx.textBaseline = "alphabetic";
    // Only the cover is used, so any opaque color works. Used as the photo slot background color
    sctx.fillStyle = ms.backgroundColor;
    const text = span.textContent;
    const fm = sctx.measureText(text);
    const sx = period / Math.max(fm.width, 1);
    const base = (H - (fm.fontBoundingBoxAscent + fm.fontBoundingBoxDescent)) / 2 + fm.fontBoundingBoxAscent;
    sctx.clearRect(0, 0, period, H);
    sctx.save(); sctx.scale(sx, 1); sctx.fillText(text, 0, base); sctx.restore();
    let n = 0;
    [...text].forEach((c, i) => {
      if (!c.trim() || n >= MAXG) return;
      const pen = sctx.measureText(text.slice(0, i)).width, m = sctx.measureText(c);
      const l = pen - m.actualBoundingBoxLeft, r = pen + m.actualBoundingBoxRight;
      const t = base - m.actualBoundingBoxAscent, b = base + m.actualBoundingBoxDescent;
      glyphs[n++].set(((l + r) / 2) * sx, (t + b) / 2, ((r - l) / 2) * sx, (b - t) / 2);
    });
    U.uN.value = n; U.uPeriod.value = period;
    cov.needsUpdate = true;
  };
  const resize = () => {
    const w = mark.clientWidth, h = mark.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    U.uSize.value.set(w, h);
    buildStrip();
  };

  const aim = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const onMove = (e) => {
    if (e.pointerType === "touch") return;
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    aim.x = Math.min(Math.max(((e.clientX - r.left) / r.width) * 2 - 1, -1), 1);
    aim.y = Math.min(Math.max(((e.clientY - r.top) / r.height) * 2 - 1, -1), 1);
  };
  const onOut = (e) => { if (e.type === "pointerout" && e.relatedTarget) return; aim.x = aim.y = 0; };
  let live = false, last = performance.now();
  const io = new IntersectionObserver(([en]) => (live = en.isIntersecting));
  io.observe(host);
  const t0 = performance.now();
  const tick = () => {
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!live) return;
    const k = 1 - Math.exp(-dt / 0.32);
    cur.x += (aim.x - cur.x) * k; cur.y += (aim.y - cur.y) * k;
    if (Math.abs(aim.x - cur.x) < 2.5e-4) cur.x = aim.x;
    if (Math.abs(aim.y - cur.y) < 2.5e-4) cur.y = aim.y;
    const px = still ? 0 : cur.x, py = still ? 0 : cur.y;
    const s = still ? 0 : ((now - t0) / 1000) * 1.6;
    const drift = (Math.sin(s * 0.23) * 0.62 + Math.sin(s * 0.51) * 0.27 + Math.sin(s * 0.89) * 0.11) * 105;
    const mr = mark.getBoundingClientRect(), sr = span.getBoundingClientRect(), md = media.getBoundingClientRect();
    U.uOrigin.value.set(mr.left, mr.top);
    U.uView.value.set(innerWidth, innerHeight);
    U.uPhase.value = sr.left - mr.left;
    U.uMedia.value.set(md.left, md.top, md.width, md.height);
    U.uPtr.value.set(px, py);
    U.uLight.value.set(innerWidth / 2 + drift + px * 130, innerHeight / 2 + py * 92);
    U.uRefl.value = 0.84 - 0.145 * px - 0.035 * px * px;
    renderer.render(scene, cam);
  };

  const ro = new ResizeObserver(resize);
  let alive = true;
  document.fonts.load(`${getComputedStyle(mark).fontWeight} 10px ${getComputedStyle(mark).fontFamily}`).catch(() => {}).then(() => {
    if (!alive) return;
    resize();
    renderer.compile(scene, cam);
    mark.classList.add("is-glass");
    ro.observe(mark);
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);
    addEventListener("blur", onOut);
    gsap.ticker.add(tick);
  });
  return () => {
    alive = false;
    gsap.ticker.remove(tick);
    ro.disconnect(); io.disconnect();
    removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerout", onOut);
    removeEventListener("blur", onOut);
    mark.classList.remove("is-glass");
    cov.dispose(); mat.dispose(); renderer.dispose(); cv.remove();
  };
}
addEventListener("DOMContentLoaded", () => {
  window.BA.mm.add("(min-width: 1024px)", () => heroGlass());
});

// Feature index: only the item currently passing is bold
(() => {
  const links = [...document.querySelectorAll(".feat__anchors a")];
  links.forEach((a) => {
    const t = document.querySelector(a.getAttribute("href"));
    ScrollTrigger.create({ trigger: t, start: "top 60%", end: "bottom 60%", onToggle: (st) => st.isActive && links.forEach((x) => x.classList.toggle("is-current", x === a)) });
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.BA.lenis ? window.BA.lenis.scrollTo(t, { offset: -200 }) : t.scrollIntoView();
    });
  });
})();

// Partner logo row: flows at a constant speed, reverses when you scroll backwards, and can be dragged and pushed
(() => {
  const rail = document.querySelector("[data-marquee]");
  if (!rail) return;
  const track = rail.querySelector(".client__track");
  track.innerHTML += track.innerHTML;
  let x = 0, dir = 1, drag = null;
  const speed = 40;
  ScrollTrigger.create({ trigger: rail, start: "top bottom", end: "bottom top", onUpdate: (st) => (dir = st.direction) });
  gsap.ticker.add((t, dt) => {
    if (!window.BA || window.BA.reduced) return;
    const half = track.scrollWidth / 2;
    if (!drag) x -= (speed * dir * dt) / 1000;
    x = ((x % half) - half) % half;
    track.style.transform = `translateX(${x}px)`;
  });
  rail.addEventListener("pointerdown", (e) => { drag = { sx: e.clientX, x0: x }; rail.setPointerCapture(e.pointerId); });
  rail.addEventListener("pointermove", (e) => drag && (x = drag.x0 + e.clientX - drag.sx));
  rail.addEventListener("pointerup", () => (drag = null));
})();


// Message CG: on wide screens it is fixed at screen center, and after the message’s top edge touches 90% of the screen it appears over the first 30% of 1.5 screen heights, scaling .6→1x and fading 0→1.
// Once the plate holding the message has fully passed above the screen it hides. On first appearance the room angle is reset to the start — the room is built by shared.js, so this runs after that
addEventListener("DOMContentLoaded", () => {
  const cg = document.querySelector(".msg__cg");
  const msg = document.querySelector(".msg");
  if (!cg || !msg) return;
  const zone = msg.closest("[data-sp]") || msg;
  const home = cg.parentElement, next = cg.nextSibling;
  window.BA.mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    document.body.append(cg);
    cg.classList.add("is-fixed");
    let shown = false;
    const st = ScrollTrigger.create({
      trigger: msg, start: "top 90%", end: () => "+=" + innerHeight * 1.5, scrub: true, invalidateOnRefresh: true,
      onUpdate: (s) => {
        const k = Math.min(1, s.progress / 0.3);
        gsap.set(cg, { scale: 0.6 + 0.4 * k, opacity: k });
        const live = k > 0.01;
        cg.classList.toggle("is-live", live);
        if (live && !shown) { shown = true; cg._room?.reset(); }
      },
    });
    const hide = (s) => cg.classList.toggle("is-gone", s.scroll() > s.end);
    const vt = ScrollTrigger.create({ trigger: zone, start: "top bottom", end: "bottom top", onUpdate: hide, onRefresh: hide });
    return () => {
      st.kill(); vt.kill();
      cg.classList.remove("is-fixed", "is-live", "is-gone");
      gsap.set(cg, { clearProps: "scale,opacity" });
      home.insertBefore(cg, next);
    };
  });
});
