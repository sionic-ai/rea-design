// Brand first page — red liquid wave (our shader), wordmark letter entrance, hero parallax·fade, word scrub, text-row hover reaction · preview panel swap, client cells, review slider, review strip grains
(() => {
  const T = window.THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => matchMedia("(max-width: 809.98px)").matches;
  const colorOf = (css) => { const i = document.createElement("i"); i.style.cssText = `display:none;color:${css}`; document.body.append(i); const c = getComputedStyle(i).color; i.remove(); const p = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d"); p.fillStyle = c; p.fillRect(0, 0, 1, 1); const d = p.getImageData(0, 0, 1, 1).data; return new T.Color(d[0] / 255, d[1] / 255, d[2] / 255); };

  // Ribbon card panel — each work gets its own brand color (the ribbon-card-gl part bakes the grain from the card background color)
  const TONES = ["#d6201a", "#2f6b1f", "#1d1b2a", "#1b3d8f", "#2b1458", "#181818", "#d9b52c"]; /* Not skin: brand color (content) */
  document.querySelectorAll(".proj__card").forEach((c, i) => c.style.setProperty("--tone", TONES[i % TONES.length]));

  // ───────── liquid ripple — original values (three colors · speed .8 · scale 1.82 · rotation 180° · push .04/.02 · intensity .08 · ripple .25) in our shader ─────────
  const wave = (canvas, look) => {
    if (!T || reduce) return null;
    let r;
    try { r = new T.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: "low-power" }); } catch { return null; }
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    const U = {
      uTime: { value: 0 }, uRes: { value: new T.Vector2(1, 1) }, uSpeed: { value: 0.8 }, uScale: { value: 1.82 }, uRot: { value: Math.PI },
      uOff: { value: new T.Vector2(0.04, 0.02) }, uAmp: { value: 0.25 }, uInt: { value: 0.08 }, uFlood: { value: look === "flood" ? 1 : 0 },
      c0: { value: colorOf("oklch(from var(--kf-accent) calc(l * 0.86) c h)") }, c1: { value: colorOf("var(--kf-accent)") }, c2: { value: colorOf("oklch(from var(--kf-accent) calc(l * 1.03) calc(c * 0.95) h)") }, cb: { value: colorOf("var(--kf-bg)") },
    };
    const m = new T.ShaderMaterial({ uniforms: U, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        uniform float uTime, uSpeed, uScale, uRot, uAmp, uInt, uFlood; uniform vec2 uRes, uOff; uniform vec3 c0, c1, c2, cb; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
          vec2 uv = vUv; float asp = uRes.x / uRes.y;
          vec2 p = (uv - 0.5) * vec2(asp, 1.0) * uScale;
          p = mat2(cos(uRot), -sin(uRot), sin(uRot), cos(uRot)) * p + uOff;
          float t = uTime * uSpeed * 0.25;
          p.y += sin(p.x * 1.6 + t) * uAmp;
          p.x += sin(p.y * 1.3 - t * 1.2) * uAmp * 0.8;
          float a = 0.5 + 0.5 * sin(p.x * 1.4 + t * 0.9);
          float b = 0.5 + 0.5 * sin(p.y * 1.9 - t * 0.7 + a * 2.0);
          vec3 col = mix(mix(c0, c1, a), c2, b * 0.6);
          float y = uFlood > 0.5 ? (1.0 - uv.y) : uv.y;
          float ripple = 0.08 * sin(p.x * 2.4 + t * 1.3) + 0.05 * sin(p.x * 5.1 - t);
          float glow = uFlood > 0.5 ? smoothstep(0.9, 0.4, y + ripple) : mix(0.42, 1.0, smoothstep(0.95, 0.15, y + ripple)) * smoothstep(-0.05, 0.25, uv.y);
          glow *= 0.78 + 0.22 * b;
          col = mix(cb, col, glow);
          col += (h(uv * uRes + uTime) - 0.5) * uInt;
          gl_FragColor = vec4(col, 1.0);
        }` });
    const s = new T.Scene(), cam = new T.Camera();
    s.add(new T.Mesh(new T.PlaneGeometry(2, 2), m));
    const fit = () => { const w = canvas.clientWidth, hh = canvas.clientHeight; if (w && hh) { r.setSize(w, hh, false); U.uRes.value.set(w, hh); } };
    new ResizeObserver(fit).observe(canvas);
    fit();
    let on = true, t0 = performance.now(), frames = 0, done;
    const ready = new Promise((res) => (done = res));
    new IntersectionObserver((es) => (on = es[0].isIntersecting)).observe(canvas);
    // Like the original readiness, ”ready” means after the shader has actually drawn two frames
    gsap.ticker.add(() => { if (!on) return; U.uTime.value = (performance.now() - t0) / 1000; r.render(s, cam); if (++frames === 2) done(); });
    return ready;
  };
  const heroReady = wave(document.querySelector(".hero__wave")) || Promise.resolve();
  const grain = document.querySelector(".kw__grain");
  if (grain) { const c = document.createElement("canvas"); grain.append(c); wave(c, "flood"); }

  // ───────── Hero — wordmark letters rise from 105% below in 1.2s (.06 stagger), the one-line intro follows .34s later at .1 stagger, and the info lines .2s later at .08 stagger ─────────
  const hero = document.querySelector(".hero"), inner = hero.querySelector(".hero__inner");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const wm = hero.querySelectorAll(".hero__wm span");
    const st = document.querySelectorAll(".atf__st .atf__m > span"), meta = document.querySelectorAll(".atf__meta .atf__m > span");
    const nav = document.querySelectorAll(".ml-top__in, .ml-top__logo");
    gsap.set(wm, { yPercent: 105 }); gsap.set([...st, ...meta], { yPercent: 105 }); gsap.set(nav, { yPercent: 105 });
    // As in the original, revealed after the font is ready (until then the wordmark and nav stay hidden)
    const tl = gsap.timeline({ paused: true, delay: 0.15 });
    Promise.all([document.fonts?.ready, heroReady]).then(() => tl.play());
    tl.to(wm, { yPercent: 0, duration: 1.2, ease: "reveal", stagger: 0.06 }, 0)
      .to(nav, { yPercent: 0, duration: 1.2, ease: "reveal", stagger: 0.05 }, 0.1)
      .to(st, { yPercent: 0, duration: 1.2, ease: "reveal", stagger: 0.1 }, 4 * 0.06 + 0.1)
      .to(meta, { yPercent: 0, duration: 1.2, ease: "reveal", stagger: 0.08 }, 4 * 0.06 + 0.1 + 0.2);
    // Stagger .4 · bottom fade 3%~22%
    const upd = () => {
      const h = hero.offsetHeight, y = Math.max(0, Math.min(scrollY, h));
      inner.style.transform = y ? `translate3d(0, ${(y * 0.4 * (phone() ? 0.6 : 1)).toFixed(2)}px, 0)` : "";
      hero.style.setProperty("--hero-fade", Math.min(1, Math.max(0, (y / h - 0.03) / (0.22 - 0.03))).toFixed(3));
    };
    const s = ScrollTrigger.create({ start: 0, end: "max", onUpdate: upd });
    upd();

    // Word scrub — between 92%~45% of the screen (phone 95%~60%) each word sharpens in its own .22 window
    const lede = document.querySelector("[data-words]");
    const split = SplitText.create(lede, { type: "words", wordsClass: "w" });
    const words = split.words, win = 0.22;
    const s2 = ScrollTrigger.create({ trigger: lede, start: phone() ? "top 95%" : "top 92%", end: phone() ? "bottom 60%" : "bottom 45%", onUpdate: (e) => {
      const p = e.progress;
      words.forEach((w, i) => { const a = (i / words.length) * (1 - win), k = Math.min(1, Math.max(0, (p - a) / win)); w.style.opacity = (0.18 + 0.82 * k).toFixed(3); w.classList.toggle("is-melt", k < 0.5); });
    } });
    return () => { tl.kill(); s.kill(); s2.kill(); split.revert(); };
  });

  // Text row — the red panel wipes in from the left (.38s power3.out) and rewinds to the left on leave (.3s power2.inOut). In the preview the old image is pushed up and the red panel follows .07s later (.62s hesitate)
  const frame = document.querySelector("[data-peek]");
  const layers = [...frame.querySelectorAll(".peek__l")], sheet = frame.querySelector(".peek__sheet");
  let cur = 0, tl = null;
  const show = (i) => {
    if (i === cur || reduce) { if (reduce) { layers.forEach((l, k) => l.classList.toggle("is-on", k === i)); cur = i; } return; }
    tl?.progress(1);
    const from = layers[cur], to = layers[i];
    cur = i;
    to.classList.add("is-on");
    gsap.set(to, { zIndex: 1 }); gsap.set(from, { zIndex: 3 }); gsap.set(sheet, { zIndex: 2, yPercent: 0, visibility: "visible" });
    const n = { v: 0 }, l = { v: 0 };
    tl = gsap.timeline({ defaults: { ease: "hesitate", duration: 0.62 }, onUpdate: () => { gsap.set(from, { yPercent: n.v }); gsap.set(sheet, { yPercent: Math.min(l.v, n.v + 9) }); },
      onComplete: () => { gsap.set(from, { clearProps: "transform,zIndex" }); from.classList.remove("is-on"); gsap.set(sheet, { yPercent: 101, visibility: "hidden" }); gsap.set(to, { clearProps: "zIndex" }); } })
      .to(n, { v: -101 }, 0).to(l, { v: -101 }, 0.07);
  };
  document.querySelectorAll(".note__a").forEach((a) => {
    const fill = a.querySelector(".note__fill");
    a.addEventListener("pointerenter", () => { a.classList.add("is-hot"); gsap.fromTo(fill, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.38, ease: "power3.out", overwrite: true }); show(+a.dataset.i); });
    a.addEventListener("pointerleave", () => { a.classList.remove("is-hot"); gsap.to(fill, { clipPath: "inset(0% 100% 0% 0%)", duration: 0.3, ease: "power2.inOut", overwrite: true }); });
    a.addEventListener("focus", () => show(+a.dataset.i));
  });

  // ───────── Client cell — on hover it fills with that brand’s color (.6s) and the name · arrow come up ─────────
  // Not skin: each customer’s own brand color (content) — the cell fills with that color
  const BRANDS = ["#e30613", "#111111", "#0057b8", "#ff6a13", "#00a651", "#6d28d9", "#ffd400", "#0f766e", "#e11d48", "#1d4ed8", "#f97316", "#16a34a", "#7c3aed", "#0ea5e9", "#be123c", "#ca8a04", "#334155", "#db2777", "#059669", "#2563eb", "#9333ea", "#dc2626", "#4d7c0f"]; /* Not skin: brand color (content) */
  const cl = document.querySelector("[data-cells]");
  const light = (hex) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255 > 0.62; };
  cl.innerHTML = BRANDS.map((b, i) => `<li class="cl__cell"><a class="cl__in" href="${i % 4 === 0 ? "detail.html" : "#"}" style="--lit:${b};--on:${light(b) ? "var(--kf-contrast-ink)" : "var(--kf-ink)"}"><span class="cl__mark">Logo ${String(i + 1).padStart(2, "0")}</span><span class="cl__cap"><span>Client ${String(i + 1).padStart(2, "0")}</span>${i % 4 === 0 ? "<span>Case study</span>" : ""}</span>${i % 4 === 0 ? `<svg class="cl__arr" viewBox="0 0 12 12"><path d="M2 10 10 2M4 2h6v6"/></svg>` : ""}</a></li>`).join("")
    + `<li class="cl__cell is-ask"><a class="cl__in" href="#contact"><span class="cl__ask">This seat is open.</span><span class="cl__cap"><span>Let’s talk ↗</span></span></a></li>`;
  cl.querySelectorAll(".cl__in").forEach((a) => { a.addEventListener("pointerenter", () => a.classList.add("is-lit")); a.addEventListener("pointerleave", () => a.classList.remove("is-lit")); });

  // ───────── Review transition — the old words slide up and blur out, the new words rise in ─────────
  const qs = [...document.querySelectorAll(".rv__q")], count = document.querySelector("[data-count]");
  let at = 0;
  document.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
    const n = (at + +b.dataset.step + qs.length) % qs.length, from = qs[at], to = qs[n];
    at = n;
    count.textContent = `${String(n + 1).padStart(2, "0")} / ${String(qs.length).padStart(2, "0")}`;
    if (reduce) { qs.forEach((q, k) => q.classList.toggle("is-on", k === n)); return; }
    gsap.to(from, { y: -12, autoAlpha: 0, duration: 0.3, ease: "power2.inOut", onComplete: () => { from.classList.remove("is-on"); gsap.set(from, { clearProps: "all" }); } });
    to.classList.add("is-on");
    gsap.fromTo(to, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out", delay: 0.2 });
  }));
})();
