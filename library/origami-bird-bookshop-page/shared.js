// Shared by several pages: flapping bird (Lottie), vertical column open, same-page scroll link, wallet modal, book band.
document.documentElement.classList.add("js");

window.WB = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Resolve Skin variables into rgb that GSAP and Lottie can read — colors made with oklch(from …) are painted on an element to get the computed value, then a canvas gives the rgb
  const probe = document.createElement("i");
  const pen = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name) => {
    probe.style.cssText = `position:absolute;visibility:hidden;background-color:var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).backgroundColor;
    probe.remove();
    pen.clearRect(0, 0, 1, 1);
    pen.fillStyle = c;
    pen.fillRect(0, 0, 1, 1);
    const [r, g, b] = pen.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };
  const css = (name) => `rgb(${rgb(name).join(",")})`;
  const accentRGB = () => [...rgb("--kf-accent").map((v) => v / 255), 1];

  // Same frame as the original new Lottie: 500×500, 36fps, 27 frames = 0.75s wing flap flipping through 9 poses at 3 frames each.
  // The bird shape is our origami bird — one body + two front wings and two rear wings, wing tips flap up and down per pose.
  const VARIANTS = {
    0: { r: 0, flip: false, s: 100 },
    1: { r: -12, flip: false, s: 100 },
    2: { r: 18, flip: true, s: 92 },
    3: { r: -28, flip: false, s: 88 },
    4: { r: 6, flip: false, s: 100 },
    5: { r: -16, flip: true, s: 96 },
  };
  // Merging body and wings into one fill unifies the winding direction — where oppositely wound pieces overlap, a hole is punched
  const path = (raw) => {
    const area = raw.reduce((a, [x, y], i) => { const [x2, y2] = raw[(i + 1) % raw.length]; return a + x * y2 - x2 * y; }, 0);
    const pts = area < 0 ? [...raw].reverse() : raw;
    return { ty: "sh", ks: { a: 0, k: { i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: true } } };
  };
  // Original bird-like bold origami type — thick body, wings with wide roots and a trailing edge (the area must be large so the entrance is as visible as the original)
  const pose = (k) => {
    const ph = (Math.PI * 2 * k) / 9, c = Math.cos(ph), s = Math.sin(ph), c2 = Math.cos(ph - 0.5);
    const body = [[412, 198], [356, 212], [300, 234], [196, 262], [88, 284], [146, 306], [104, 338], [212, 318], [312, 298], [366, 258], [392, 226]];
    const near = [[342, 238], [300 - 12 * s, 248 - 104 * c], [188 + 24 * s, 250 - 210 * c], [146 + 12 * s, 260 - 124 * c], [186, 290]];
    const far = [[322, 232], [250, 248], [214 + 16 * s, 250 - 168 * c2], [268 - 6 * s, 246 - 86 * c2]];
    return [path(body), path(near), path(far)];
  };
  const birdData = (variant, rgb) => {
    const v = VARIANTS[variant] || VARIANTS[1];
    const layers = [];
    for (let k = 0; k < 9; k++) {
      layers.push({
        ddd: 0, ind: k + 1, ty: 4, nm: "pose " + k, sr: 1, ao: 0, ip: k * 3, op: k * 3 + 3, st: 0, bm: 0,
        ks: { o: { a: 0, k: 100 }, r: { a: 0, k: v.r }, p: { a: 0, k: [250, 250 - 9 * Math.cos((Math.PI * 2 * k) / 9), 0] }, a: { a: 0, k: [250, 250, 0] }, s: { a: 0, k: [v.flip ? -v.s : v.s, v.s, 100] } },
        shapes: [{
          ty: "gr", nm: "bird",
          it: [...pose(k), { ty: "fl", c: { a: 0, k: rgb }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }],
        }],
      });
    }
    return { v: "5.11.0", fr: 36, ip: 0, op: 27, w: 500, h: 500, nm: "bird " + variant, ddd: 0, assets: [], layers, markers: [] };
  };
  const flock = (root = document) => {
    if (!window.lottie) return [];
    const rgb = accentRGB();
    return [...root.querySelectorAll(".wb-bird")].map((el) =>
      lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: !reduce, animationData: birdData(el.dataset.bird, rgb) }));
  };

  // A bird that flaps only while hovered — the original rail logo (desktop) and the four footer banner birds. It rests on a set frame, spins on hover, and stops in place on release.
  // On phone the banner bird always flaps its wings, and the rail logo stays as a still-picture bird
  const flaps = () => {
    if (!window.lottie) return;
    const rgb = accentRGB(), pc = matchMedia("(min-width: 768px)").matches;
    document.querySelectorAll(".wb-flap").forEach((el) => {
      const mode = el.dataset.flap;
      if (mode === "hover-pc" && !pc) return;
      const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: false, animationData: birdData(el.dataset.bird, rgb) });
      a.goToAndStop(+el.dataset.goto || 0, true);
      const host = el.closest("a");
      if (mode === "hover-pc") { host.classList.add("has-flap"); host.querySelector(":scope > svg")?.remove(); }
      if (reduce) return;
      if (!pc) { a.play(); return; }
      host.addEventListener("mouseenter", () => a.play());
      host.addEventListener("mouseleave", () => a.pause());
    });
  };

  // Vertical column open — original Lottie mask: starting from the left column at frames 0·4·7·10·13 (30fps), each runs for 16 frames
  // Opens from bottom to top (cubic-bezier .333,0,0,1), and from frame 10 to 20 the accent color turns into the text color. Total 29 frames ≈ .97s
  const COL_AT = [0, 4, 7, 10, 13];
  const playCols = (el, { speed = 1 } = {}) => {
    const cols = [...el.querySelectorAll(".wb-vcol")].reverse();
    const ink = css("--kf-ink");
    const tl = gsap.timeline();
    if (reduce) { gsap.set(cols, { clipPath: "inset(0% 0 0 0)", color: ink }); return tl; }
    const f = (n) => (n / 30) * speed;
    cols.forEach((c, i) => {
      const at = i < COL_AT.length ? COL_AT[i] : COL_AT[COL_AT.length - 1] + (i - COL_AT.length + 1) * 3;
      tl.fromTo(c, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: f(16), ease: "wbCols" }, f(at));
    });
    tl.to(cols, { color: ink, duration: f(10), ease: "none" }, f(10));
    return tl;
  };
  if (window.gsap) {
    // cubic-bezier(.333,0,0,1) — solved the Bézier directly to use it without CustomEase
    const bez = (x1, y1, x2, y2) => (t) => {
      let u = t;
      for (let i = 0; i < 8; i++) {
        const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
        const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
        if (Math.abs(x) < 1e-5 || !dx) break;
        u = Math.min(1, Math.max(0, u - x / dx));
      }
      return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
    };
    gsap.registerEase("wbCols", bez(0.333, 0, 0, 1));
    gsap.registerEase("wbBar", bez(0.25, 1, 0.5, 1));
  }

  // Fit each wordmark line’s font size to the frame width — the original logo is a drawing where all three lines have the same width
  const fitMarks = () => document.querySelectorAll(".wb-mark").forEach((m) => {
    const w = m.clientWidth;
    if (!w) return;
    m.querySelectorAll(".wb-mark__latin, .wb-mark__name").forEach((l) => {
      l.style.fontSize = "";
      const fs = parseFloat(getComputedStyle(l).fontSize);
      l.style.fontSize = `${(fs * w) / l.scrollWidth}px`;
    });
  });
  fitMarks();
  document.fonts?.ready.then(fitMarks);
  addEventListener("resize", fitMarks);

  // Book band: initials at both ends + small wordmark in the middle + three birds
  const bandHTML =
    '<span class="wb-band__edge" lang="en">S<br>N<br>B</span>' +
    '<span class="wb-band__mark"><small lang="en">STUDIO NAME BRAND STUDIO</small><b>Shop name</b><small lang="en">NAME BRAND STUDIO NAME</small></span>' +
    '<span class="wb-band__edge wb-band__edge--r" lang="en">S<br>N<br>B</span>' +
    [1, 2, 3].map((n) => `<svg class="wb-band__bird wb-band__bird--${n}" viewBox="0 0 100 100"><use href="#wb-bird"/></svg>`).join("");
  document.querySelectorAll(".wb-band:empty").forEach((b) => (b.innerHTML = bandHTML));

  // Same-page links — slide with 1s easeInOutQuart like the original (react-scroll smooth)
  const scrollTo = (target) => {
    const y = target.getBoundingClientRect().top + scrollY;
    if (reduce || !window.gsap) return scrollTo.jump(y);
    const o = { y: scrollY };
    gsap.to(o, { y, duration: 1, ease: "power3.inOut", onUpdate: () => window.scrollTo(0, o.y) });
  };
  scrollTo.jump = (y) => window.scrollTo(0, y);
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.wb-scroll[href^='#']");
    if (!a) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    scrollTo(t);
  });

  // Wallet modal — in the original, backdrop and panel appear instantly
  const openModal = (name) => {
    const m = document.querySelector(`[data-modal="${name}"]`);
    if (!m) return;
    m.hidden = false;
    m.querySelector(".wb-modal__close")?.focus();
  };
  const closeModal = (m) => { m.hidden = true; };
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-modal-open]");
    if (o) { e.preventDefault(); openModal(o.dataset.modalOpen); return; }
    const c = e.target.closest("[data-modal-close]");
    if (c) closeModal(c.closest(".wb-modal"));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".wb-modal:not([hidden])").forEach(closeModal);
  });

  return { reduce, flock, flaps, playCols, birdData, css };
})();
