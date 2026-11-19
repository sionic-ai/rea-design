// The four pages share the same strip, header, phone menu and footer, so they are drawn here once, and smooth scroll, marquee, parallax and tree-ring drawing are hooked up here too.
(() => {
  const NAV = [
    { label: "Company About", links: [["Philosophy", "about.html"], ["Company overview", "#"]] },
    { label: "Service", links: [["Product", "product.html"], ["Retailer", "#"], ["Research institute", "#"]] },
    { label: "News and Contact", links: [["News", "#"], ["Inquiry", "#"]] },
    { label: "Hiring", links: [["Hiring guide", "recruit.html"]] },
    { label: "Store", links: [["Online store", "#"]] },
  ];
  const MARQUEE = [
    "Your brand line here",
    "BRAND LINE 00",
    "Your Store 1 address goes here on one line 00-00",
    "STORE 1 ADDRESS 00-00, CITY",
    "Your Store 2 address goes here on one line 00-00",
    "STORE 2 ADDRESS 00-00, CITY",
  ];
  const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" stroke-width="7" stroke-dasharray="9.4 6.31" transform="rotate(-78 20 20)"/></svg>';
  const FOOT = `<div class="ez-foot__bar">
      <div class="ez-foot__copy">&copy;Company name</div>
      <div class="ez-foot__addr">Your first address line here 00-0<br>Your address second line here</div>
      <div class="ez-foot__social"><a href="#">Social 1</a><a href="#">Social 2</a><a href="#">Social 3</a></div>
    </div>`;

  const page = document.body.dataset.page;
  const link = ([t, h]) => `<a href="${h}">${t}</a>`;

  const bar = document.querySelector('[data-slot="announcement-marquee"]');
  bar.className = "ez-bar";
  bar.innerHTML = `<div class="ez-bar__track">${MARQUEE.map((t) => `<span>${t}</span>`).join("")}</div>`;

  const head = document.querySelector('[data-slot="header"]');
  head.className = "ez-head";
  head.innerHTML = `<div class="ez-head__grid">
      <div class="ez-head__col"><a class="ez-logo" href="index.html" aria-label="Home">${LOGO}</a></div>
      ${NAV.slice(0, 3).map((g) => `<div class="ez-head__col">${g.links.map(link).join("")}</div>`).join("")}
      <div class="ez-head__col"><a href="recruit.html">${NAV[3].label}</a></div>
      <div class="ez-head__col"><a href="#">${NAV[4].label}</a></div>
    </div>`;

  const sp = document.createElement("div");
  sp.className = "ez-sphead";
  sp.innerHTML = `<div class="ez-sphead__in">
      <a class="ez-logo" href="index.html" aria-label="Home">${LOGO}</a>
      <button class="ez-burger" type="button" aria-label="Menu">
        <span class="is-open"><svg width="70" height="10" viewBox="0 0 70 10" fill="none"><rect width="70" height="1"/><rect y="9" width="70" height="1"/></svg></span>
        <span class="is-close"><svg width="70" height="22" viewBox="0 0 70 22" fill="none"><rect x="1" y="2" width="70" height="1" transform="rotate(15 1 2)"/><rect x="1" y="20" width="70" height="1" transform="rotate(-15 1 20)"/></svg></span>
      </button>
    </div>`;
  head.after(sp);

  const nav = document.querySelector('[data-slot="mobile-menu"]');
  nav.className = "ez-spnav";
  nav.innerHTML = `<div class="ez-spnav__in">${NAV.map((g) => `<div class="ez-spnav__sec">
        <h2 class="ez-spnav__label">${g.label}</h2>
        <div class="ez-spnav__links">${g.links.map(([t, h]) => link([t + " ↗", h])).join("")}</div>
      </div>`).join("")}</div><footer class="ez-foot">${FOOT}</footer>`;

  document.querySelector('[data-slot="footer"]').innerHTML = FOOT;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.querySelectorAll("video[autoplay]").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });
  gsap.registerPlugin(ScrollTrigger);

  // Original Lenis settings: duration 1.2 + expo.out curve, touch off
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), syncTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.ezLenis = lenis;

  const burger = sp.querySelector(".ez-burger");
  const setMenu = (open) => {
    nav.classList.toggle("is-active", open);
    burger.classList.toggle("is-active", open);
    sp.classList.toggle("is-active", open);
    document.body.classList.toggle("is-locked", open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-active")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  nav.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (!ctx.conditions.motion) return;

    // Join three copies of the set and drift only 1/3 so the seam is invisible
    const track = bar.querySelector(".ez-bar__track");
    track.innerHTML = track.innerHTML.repeat(3);
    const tw = gsap.to(track, { xPercent: -33.333, repeat: -1, duration: 28, ease: "none" }).totalProgress(0.5);
    track.addEventListener("mouseenter", () => tw.pause());
    track.addEventListener("mouseleave", () => tw.play());

    gsap.utils.toArray(".ph > .wf-img").forEach((img) => {
      gsap.set(img, { y: "-10%" });
      gsap.to(img, {
        y: "10%",
        ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // A wide photo opens from the center half-width to both sides, starting at the bottom of the screen and fully open at 20% from the top
    const wide = document.querySelector("[data-mask]");
    if (wide) {
      gsap.fromTo(wide, { "--mask": 0.5 }, {
        "--mask": 1,
        ease: "none",
        scrollTrigger: { trigger: wide, start: "top bottom", end: "top 20%", scrub: true },
      });
    }

    const cap = document.querySelector(".sub-hero__sub");
    const firstSec = document.querySelector(".sec-title");
    if (cap && firstSec) {
      gsap.to(cap, {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: firstSec, start: "top 100%", end: "top 80%", scrub: true },
      });
    }
  });

  // Text cells calculate how many rows of square cells they take from the text length and fit the grid
  const fitRows = () => {
    const els = document.querySelectorAll(".auto-h");
    if (!els.length) return;
    const grid = els[0].closest(".g");
    const size = (grid.clientWidth - 2 * parseFloat(getComputedStyle(grid).paddingLeft)) / 5;
    els.forEach((el) => {
      el.style.gridRowEnd = "auto";
      el.style.gridRowEnd = `span ${Math.max(1, Math.ceil(el.offsetHeight / size))}`;
    });
    ScrollTrigger.refresh();
  };
  fitRows();
  addEventListener("load", fitRows);
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(fitRows, 200); });

  // ---------- Growth rings: dots of the same square size on a 256-cell grid are switched on and off by error diffusion ----------
  // Density profile, edge roughness, and the top-heavy eccentricity are values measured from the original halftone image (the image is redrawn fresh)
  const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const PROFILE = [[0, .40], [.05, .34], [.2, .33], [.3, .34], [.4, .38], [.5, .40], [.55, .43], [.6, .48], [.65, .55], [.7, .58], [.78, .55], [.82, .50], [.86, .40], [.9, .38], [.93, .55], [.95, .8], [1, .85]];
  const HARM = [[2, .0152, -1.936], [3, .0129, 1.831], [1, .0067, .658], [4, .0062, -.314], [5, .0047, 1.882], [9, .005, .9], [13, .004, 2.6], [17, .004, .4], [21, .003, 1.3], [29, .003, 2.1]];
  const tone = (x) => {
    for (let k = 1; k < PROFILE.length; k++) {
      const [a, ta] = PROFILE[k - 1], [b, tb] = PROFILE[k];
      if (x <= b) return ta + ((tb - ta) * (x - a)) / (b - a);
    }
    return PROFILE[PROFILE.length - 1][1];
  };
  const drawRing = (cv) => {
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const g = cv.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim();
    const r = rand(7);
    const cols = 256;
    const step = w / cols;
    const rows = Math.floor(h / step);
    const sq = step * 0.8;
    const cx = w / 2;
    const cy = h / 2;
    const grid = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const dx = ((i + 0.5) * step - cx) / cx;
        const dy = ((j + 0.5) * step - cy) / cy;
        const th = Math.atan2(dy, dx);
        let edge = 1;
        for (const [n, a, p] of HARM) edge += a * Math.cos(n * th - p);
        const rho = Math.hypot(dx, dy) / (0.973 * edge);
        if (rho > 1 + (r() - 0.5) * 0.02) continue;
        const band = Math.max(0, 1 - Math.abs(rho - 0.72) / 0.12);
        grid[j * cols + i] = Math.min(1, Math.max(1e-3, tone(rho) - 0.18 * Math.sin(th) * band + (r() - 0.5) * 0.08));
      }
    }
    // Floyd-Steinberg that changes direction on each line — as in the original, a checkerboard texture appears at half density
    for (let j = 0; j < rows; j++) {
      const dir = j % 2 ? -1 : 1;
      for (let k = 0; k < cols; k++) {
        const i = dir > 0 ? k : cols - 1 - k;
        const v = grid[j * cols + i];
        if (v <= 0) continue;
        const on = v >= 0.5;
        const e = v - (on ? 1 : 0);
        if (on) g.fillRect(i * step, j * step, sq, sq);
        const push = (ii, jj, wgt) => {
          if (ii < 0 || ii >= cols || jj >= rows || grid[jj * cols + ii] <= 0) return;
          grid[jj * cols + ii] += e * wgt;
        };
        push(i + dir, j, 7 / 16);
        push(i - dir, j + 1, 3 / 16);
        push(i, j + 1, 5 / 16);
        push(i + dir, j + 1, 1 / 16);
      }
    }
  };
  const rings = document.querySelectorAll("[data-ring]");
  const paintRings = () => rings.forEach(drawRing);
  paintRings();
  let rr;
  addEventListener("resize", () => { clearTimeout(rr); rr = setTimeout(paintRings, 200); });
})();
