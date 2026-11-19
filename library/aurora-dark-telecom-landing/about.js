// Brand panel: loader (3s) → ink bloom (ink-bloom-reveal) → section-turning stage.
// Original numbers: Lenis per section (duration .9 · wheelMultiplier 1.3), when the wheel total at the end of a panel passes 60, go to the next section (if the gap exceeds 400ms the total is discarded, edge 120px, wheels arriving within 160ms after a switch are ignored for 700ms),
// Transition = Old text exits -60px with .45s power2.in · new text enters from 80px below at .4s with .8s power3.out · background canvas melts down over 950ms (linear) · canvas clears at .75s over .25s.
// Letter = Clears from 5px blur and .1 opacity at .03s intervals (no curve), .2s between paragraphs, when reaching 70% of the screen. Pointer-following parallax .9s power3.out.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const view = document.querySelector(".br-view");
  const sections = [...document.querySelectorAll(".br-sec")];
  const scrollers = sections.map((s) => s.querySelector(".br-scroller"));
  const navLinks = [...document.querySelectorAll(".br-nav a")];
  const loader = document.querySelector(".br-loader");
  const cue = document.querySelector(".br-cue");
  const prevBtn = document.querySelector(".br-switch__prev"), nextBtn = document.querySelector(".br-switch__next");
  if (!view || !sections.length || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // ── Loader: the 3s bar fills and, when it disappears at .4s, it is removed (the ink spread starts 3.4s later)
  setTimeout(() => loader?.classList.add("is-gone"), reduce ? 0 : 3400);

  // ── Lenis per Section
  const lenises = scrollers.map((el) => window.Lenis ? new Lenis({ wrapper: el, content: el.firstElementChild, duration: 0.9, wheelMultiplier: 1.3, smoothWheel: !reduce, autoRaf: false }) : null);
  let current = 0, locked = false, accum = 0, lastWheel = 0, guard = false, guardAt = 0;
  lenises.forEach((l, i) => { if (!l) return; l.on("scroll", ScrollTrigger.update); i === 0 ? l.start() : l.stop(); });
  gsap.ticker.add((t) => lenises[current]?.raf(t * 1000));
  sections.forEach((s, i) => { if (i) s.setAttribute("inert", ""); });

  // ── Background transition canvas (WebGL) — melts two images into each other with vertically stretched stripes (our own shader)
  const cv = document.querySelector(".br-bg");
  const VERT = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FRAG = `
precision highp float;
varying vec2 uv;
uniform sampler2D ta, tb;
uniform float prog, t, seed;
float h1(vec2 c) { return fract(sin(dot(c, vec2(91.7, 233.3))) * 31718.927); }
float sn(vec2 x) { vec2 c = floor(x), f = fract(x), w = f * f * (3. - 2. * f); return mix(mix(h1(c), h1(c + vec2(1, 0)), w.x), mix(h1(c + vec2(0, 1)), h1(c + 1.), w.x), w.y); }
float layered(vec2 x) { float s = 0., a = .5; for (int k = 0; k < 3; k++) { s += a * sn(x); x = x * 2.03 + vec2(4.9, 7.3); a *= .5; } return s; }
vec3 smear(sampler2D tx, vec2 at, float len, float jit) {
  vec3 m = vec3(0.);
  for (int k = 0; k < 12; k++) { float o = (float(k) / 11. - .5 + jit) * len; m = max(m, texture2D(tx, clamp(at + vec2(0., o), 0., 1.)).rgb); }
  return m;
}
void main() {
  float p = clamp(prog, 0., 1.), bell = sin(p * 3.14159265);
  float w1 = layered(vec2(uv.x * 2.2 + seed, uv.y * 1.6 - t * .5)) - .5;
  float w2 = layered(vec2(uv.x * 3.1 + 7.7 + seed * 1.3, uv.y * 2.4 + t * .35)) - .5;
  float fx = uv.x + w1 * .08 * bell;
  float col = mix(h1(vec2(floor(fx * 260.), 3.7 + seed)), h1(vec2(floor(fx * 26.), 9.1 + seed * 1.7)), .55);
  float local = clamp((p - col * .4) / .6, 0., 1.), melt = sin(local * 3.14159265);
  vec2 at = vec2(uv.x + w1 * .05 * melt, uv.y + (col - .5) * .25 * melt + w2 * .06 * melt);
  float len = melt * (.08 + .3 * col), jit = (h1(gl_FragCoord.xy) - .5) / 11.;
  vec3 c = mix(smear(ta, at, len, jit), smear(tb, at, len, jit), smoothstep(.48, .52, local));
  float g = h1(gl_FragCoord.xy * .7 + floor(t * 24.) * 13.1 + seed);
  gl_FragColor = vec4(c * mix(1., .55 + .45 * step(.35, g), melt), 1.);
}`;
  let gl = null, texs = [], uP, uT, uS;
  // Bakes our own image for each section — a light band drawn in the skin’s color and the section name (the original shows the current scene of the section video)
  const paint = (i) => {
    const c = document.createElement("canvas"); c.width = 640; c.height = 360;
    const g = c.getContext("2d");
    const pal = [css("--kf-bg"), css("--kf-accent"), css("--kf-accent-soft"), css("--kf-accent-text"), css("--kf-ink-soft")];
    g.fillStyle = pal[0]; g.fillRect(0, 0, 640, 360);
    const gr = g.createLinearGradient(0, 0, 640, 360);
    gr.addColorStop(0, pal[0]); gr.addColorStop(0.5, pal[1 + (i % 3)]); gr.addColorStop(1, pal[0]);
    g.globalAlpha = 0.85; g.fillStyle = gr;
    for (let k = 0; k < 7; k++) { g.save(); g.translate(320, 180); g.rotate(i * 0.7 + k * 0.45); g.fillRect(-400, -18 - k * 6, 800, 26 + k * 5); g.restore(); }
    g.globalAlpha = 1; g.fillStyle = pal[4]; g.font = `200 44px ${css("--kf-font-display")}`; g.textAlign = "center";
    g.fillText(navLinks[i]?.textContent.trim() || "", 320, 196);
    return c;
  };
  if (cv && !reduce) {
    gl = cv.getContext("webgl", { antialias: false, depth: false, stencil: false, alpha: false });
    if (gl) {
      const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) gl = null;
      else {
        gl.useProgram(pr);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        uP = gl.getUniformLocation(pr, "prog"); uT = gl.getUniformLocation(pr, "t"); uS = gl.getUniformLocation(pr, "seed");
        gl.uniform1i(gl.getUniformLocation(pr, "ta"), 0); gl.uniform1i(gl.getUniformLocation(pr, "tb"), 1);
        texs = sections.map((_, i) => {
          const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paint(i));
          [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
          [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
          return tx;
        });
        const fit = () => { const k = Math.min(devicePixelRatio || 1, 1.5); cv.width = Math.round(innerWidth * k); cv.height = Math.round(innerHeight * k); gl.viewport(0, 0, cv.width, cv.height); };
        fit(); addEventListener("resize", fit);
      }
    }
  }
  const melt = (a, b, ms) => new Promise((done) => {
    if (!gl) return done();
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texs[a]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texs[b]);
    gl.uniform1f(uS, Math.random() * 100);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      gl.uniform1f(uP, p); gl.uniform1f(uT, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      p < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  });

  // ── Page turn
  const videoOf = (i) => sections[i].querySelector(".br-sec__video");
  const playVideo = (i) => { const v = videoOf(i); if (!v) return; if (!v.src && v.dataset.src) v.src = v.dataset.src; if (!reduce) v.play().catch(() => {}); };
  const nameEl = document.querySelector(".br-switch__name");
  const syncNav = () => {
    navLinks.forEach((a, i) => (i === current ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    if (nameEl) nameEl.textContent = sections[current].dataset.name || "";
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === sections.length - 1;
    cue?.classList.toggle("is-on", current === 0 && (lenises[0]?.scroll ?? 0) < 10);
  };
  const goTo = async (n) => {
    if (locked) return;
    n = Math.max(0, Math.min(sections.length - 1, n));
    if (n === current) return;
    const from = current, dir = n > from ? 1 : -1;
    locked = true; current = n;
    lenises[from]?.stop();
    sections[n].classList.add("is-active"); sections[n].removeAttribute("inert");
    sections[from].setAttribute("inert", "");
    playVideo(n);
    syncNav();
    const outEl = scrollers[from].firstElementChild, inEl = scrollers[n].firstElementChild;
    if (reduce) {
      sections[from].classList.remove("is-active");
    } else {
      const tl = gsap.timeline();
      tl.to(outEl, { opacity: 0, y: -60 * dir, duration: 0.45, ease: "power2.in" }, 0);
      if (gl) { tl.set(cv, { opacity: 1 }, 0); tl.to(cv, { opacity: 0, duration: 0.25, ease: "power1.out" }, 0.75); }
      tl.fromTo(inEl, { opacity: 0, y: 80 * dir }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.4);
      await Promise.all([melt(from, n, 950), tl]);
      gsap.set(outEl, { clearProps: "opacity,transform" });
      sections[from].classList.remove("is-active");
    }
    lenises[n]?.resize(); lenises[n]?.start();
    locked = false; guard = true; guardAt = performance.now();
    ScrollTrigger.refresh();
  };
  view.addEventListener("wheel", (e) => {
    const now = performance.now(), gap = now - lastWheel;
    lastWheel = now;
    if (locked) { e.preventDefault(); return; }
    if (guard) { if (gap < 160 && now - guardAt < 700) { e.preventDefault(); return; } guard = false; }
    const l = lenises[current];
    if (!l) return;
    const edge = Math.min(120, l.limit * 0.02);
    const atTop = l.targetScroll <= 1 && l.scroll <= edge, atBottom = l.targetScroll >= l.limit - 1 && l.scroll >= l.limit - edge;
    if (!atTop && !atBottom) { accum = 0; return; }
    if (gap > 400) accum = 0;
    accum += e.deltaY;
    const s = Math.sign(accum);
    if (!s || (s > 0 ? !atBottom : !atTop)) return;
    e.preventDefault();
    if (Math.abs(accum) >= 60) { accum = 0; goTo(current + s); }
  }, { passive: false });
  let ty = 0, edgeTop = false, edgeBottom = false;
  view.addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; const sc = scrollers[current]; edgeTop = sc.scrollTop <= 0; edgeBottom = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 1; }, { passive: true });
  view.addEventListener("touchend", (e) => { const d = ty - e.changedTouches[0].clientY; if (Math.abs(d) < 60 || locked) return; if (d > 0 && edgeBottom) goTo(current + 1); if (d < 0 && edgeTop) goTo(current - 1); });
  addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, textarea")) return;
    const l = lenises[current];
    if (["PageDown", "ArrowDown", " "].includes(e.key) && (!l || l.scroll >= l.limit - 2)) { e.preventDefault(); goTo(current + 1); }
    if (["PageUp", "ArrowUp"].includes(e.key) && (!l || l.scroll <= 1)) { e.preventDefault(); goTo(current - 1); }
  });
  navLinks.forEach((a, i) => a.addEventListener("click", (e) => { e.preventDefault(); goTo(i); }));

  // ── TOC proximity: when the pointer is within 200px left and 48px above or below the TOC, each line’s bar grows by vertical distance (smoothstep) and only the nearest line opens its name
  const nav = document.querySelector(".br-nav");
  const wide = matchMedia("(min-width: 841px)");
  if (nav && navLinks.length) {
    let box = null, inside = false, near = -1;
    const measure = () => {
      const r = nav.getBoundingClientRect();
      box = { left: r.left - 200, top: r.top - 48, bottom: r.bottom + 48, centers: navLinks.map((a) => { const b = a.getBoundingClientRect(); return b.top + b.height / 2; }) };
    };
    const clear = () => {
      if (!inside) return;
      inside = false; near = -1;
      navLinks.forEach((a) => { a.style.setProperty("--effect", "0"); a.classList.remove("is-near"); });
    };
    addEventListener("resize", () => (box = null));
    addEventListener("pointermove", (e) => {
      if (!wide.matches) return;
      if (!box) measure();
      if (e.clientX < box.left || e.clientY < box.top || e.clientY > box.bottom) return clear();
      inside = true;
      let best = 0, min = Infinity;
      navLinks.forEach((a, i) => {
        const d = Math.abs(e.clientY - box.centers[i]), t = Math.max(0, 1 - d / 48);
        a.style.setProperty("--effect", (t * t * (3 - 2 * t)).toFixed(3));
        if (d < min) { min = d; best = i; }
      });
      if (best !== near) { near = best; navLinks.forEach((a, i) => a.classList.toggle("is-near", i === best)); }
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", clear);
    wide.addEventListener("change", clear);
  }
  document.querySelectorAll('.br-lineup__item[href^="#s"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); goTo(sections.indexOf(document.querySelector(a.getAttribute("href")))); }));
  prevBtn?.addEventListener("click", () => goTo(current - 1));
  nextBtn?.addEventListener("click", () => goTo(current + 1));

  // ── First section: on scroll down, while the black curtain rolls over half the screen, up to .8
  const fv = document.querySelector(".br-fv");
  lenises[0]?.on("scroll", (l) => {
    if (fv) fv.style.opacity = String(Math.min(1, l.scroll / (scrollers[0].clientHeight * 0.5)) * 0.8);
    cue?.classList.toggle("is-on", current === 0 && l.scroll < 10);
  });

  // ── Progress bar (right edge) — share of the current section panel’s scroll
  const bar = document.querySelector(".br-progress"), barIn = bar?.querySelector("i");
  if (bar) gsap.ticker.add(() => {
    const l = lenises[current];
    const k = l && l.limit > 1 ? Math.min(1, l.scroll / l.limit) : 0;
    bar.classList.toggle("is-on", !!(l && l.limit > 1));
    if (barIn) barIn.style.scale = `1 ${k}`;
  });

  // ── Letter entrance: split letters inside a word chunk (spaces left as they are)
  let chainAt = 0;
  sections.forEach((sec, si) => {
    const ps = [...sec.querySelectorAll(".br-reveal")];
    ps.forEach((p) => {
      const words = p.textContent.trim().split(/(\s+)/);
      p.textContent = "";
      words.forEach((w) => {
        if (/^\s+$/.test(w)) { p.append(w); return; }
        const box = document.createElement("span"); box.className = "br-word";
        [...w].forEach((ch) => { const c = document.createElement("span"); c.className = "br-char"; c.textContent = ch; box.append(c); });
        p.append(box);
      });
      const chars = [...p.querySelectorAll(".br-char")];
      if (reduce) return;
      gsap.set(chars, { opacity: 0.1, filter: "blur(5px)" });
      const tw = gsap.to(chars, { opacity: 1, filter: "blur(0px)", ease: "none", stagger: 0.03, paused: true });
      ScrollTrigger.create({ trigger: p, scroller: scrollers[si], start: "top 70%", once: true, onEnter: () => {
        const now = gsap.ticker.time, at = Math.max(now, chainAt);
        chainAt = at + 0.2;
        gsap.delayedCall(at - now, () => tw.play(0));
      } });
    });
  });

  // ── Pointer-following parallax (wide screens only)
  const movers = [...document.querySelectorAll("[data-parallax]")].map((el) => ({ depth: Number(el.dataset.parallax) || 1, x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }) }));
  if (!reduce) view.addEventListener("pointermove", (e) => {
    if (!wide.matches) return;
    const nx = e.clientX / innerWidth * 2 - 1, ny = e.clientY / innerHeight * 2 - 1;
    movers.forEach((m) => { m.x(-nx * 20 * m.depth); m.y(-ny * 20 * m.depth); });
  });

  // ── Motion Pause Button
  const pause = document.querySelector(".br-pause");
  pause?.addEventListener("click", () => {
    const off = !document.body.hasAttribute("data-motion-paused");
    document.body.toggleAttribute("data-motion-paused", off);
    document.querySelectorAll("video").forEach((v) => (off ? v.pause() : v.play().catch(() => {})));
    pause.innerHTML = window.nrIcon ? window.nrIcon(off ? "play" : "pause") : "";
  });

  syncNav();
})();
