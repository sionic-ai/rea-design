// Home page scene: layered brick vault hero (intro + spreads apart on scroll), needle timeline, video cell, wide photo parallax.
(() => {
  const { reduce } = window.eSite;

  // ── Hero image: the original photo (2000×1328) is cut into 11 pieces, and each slot is drawn with 11 layers of octagonal brick frames.
  // Draw order is the stacking order — from back (background, inner ring) to front (outer ring).
  const W = 2000;
  const H = 1328;
  const RATIO = W / H;
  const CX = 1000;
  const CY = 640;
  const TILT = (-33 * Math.PI) / 180;
  const SQUASH = 0.72;
  const LIGHT = (225 * Math.PI) / 180;

  // The original’s per-layer offsets (% and scale). mid and to travel only 70% from from, as in the original
  const toward = (a, b) => ({ x: a.x + (b.x - a.x) * 0.7, y: a.y + (b.y - a.y) * 0.7, scale: a.scale + (b.scale - a.scale) * 0.7 });
  const RAW = [
    ["bg", [-1, -0.98, 1.02], [4.38, -6.64, 1.103], [7.07, -9.47, 1.145], [1500, 9999]],
    ["inf-4", [0, 0, 1], [4.38, -8.14, 1.103], [6.57, -12.21, 1.155], [118, 196]],
    ["inf-3", [0, 0, 1], [4.38, -6.3, 1.103], [6.57, -9.45, 1.155], [196, 284]],
    ["inf-2", [0, 0, 1], [4.38, -5.15, 1.103], [6.57, -7.73, 1.155], [284, 384]],
    ["inf-1", [0, 0, 1], [4.38, -4.92, 1.103], [6.57, -7.38, 1.155], [384, 498]],
    ["centro", [0, -1.98, 1], [4.38, -4.32, 1.103], [6.57, -5.49, 1.155], [0, 128]],
    ["sup-1", [0, 0, 1], [4.38, -4.92, 1.103], [6.57, -7.38, 1.155], [498, 628]],
    ["sup-2", [0, 0, 1], [4.38, -5.38, 1.103], [6.57, -8.07, 1.155], [628, 778]],
    ["sup-3", [0, 0, 1], [4.38, -8.14, 1.103], [6.57, -12.21, 1.155], [778, 950]],
    ["sup-4", [0, 0, 1], [6.87, -10.6, 1.153], [10.31, -15.9, 1.23], [950, 1160]],
    ["sup-5", [0, 0, 1], [10.84, 3.83, 1.232], [16.26, 5.75, 1.348], [1160, 1500]],
  ];
  const v = ([x, y, scale]) => ({ x, y, scale });
  const LAYERS = RAW.map(([name, f, m, t, ring]) => ({ name, ring, from: v(f), mid: toward(v(f), v(m)), to: toward(v(f), v(t)) }));

  // In the original photo, brick frames around an octagonal skylight recede in layers, and outer frames slip further to the lower left, forming a diagonal band —
  // Each frame’s center is shifted to the lower left in proportion to its radius to follow that composition (around the inner skylight it stays nearly the same)
  const SIDES = 8;
  const DRIFT = [-0.34, 0.22];
  const oct = (r, dx = 0, dy = 0) => Array.from({ length: SIDES }, (_, k) => {
    const a = ((k + 0.5) * 2 * Math.PI) / SIDES;
    const lx = r * Math.cos(a);
    const ly = r * SQUASH * Math.sin(a);
    const ox = CX + dx + DRIFT[0] * Math.max(r - 200, 0);
    const oy = CY + dy + DRIFT[1] * Math.max(r - 200, 0);
    return [ox + lx * Math.cos(TILT) - ly * Math.sin(TILT), oy + lx * Math.sin(TILT) + ly * Math.cos(TILT)];
  });
  const trace = (ctx, pts) => { ctx.moveTo(...pts[0]); pts.slice(1).forEach((p) => ctx.lineTo(...p)); ctx.closePath(); };

  // Paint is read from the skin. Brick brown is --site-brick-* made by rotating the accent color (shared.css). Canvas can’t read var(), so paint once and resolve to rgb
  const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    swatch.clearRect(0, 0, 1, 1);
    swatch.fillStyle = getComputedStyle(probe).color;
    probe.remove();
    swatch.fillRect(0, 0, 1, 1);
    return [...swatch.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const hsl = ([r, g, b]) => {
    [r, g, b] = [r / 255, g / 255, b / 255];
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    if (!d) return [0, 0, l * 100];
    const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, (d / (1 - Math.abs(2 * l - 1))) * 100, l * 100];
  };
  const PAL = {};
  const readPalette = () => {
    const [bh, bs] = hsl(rgb("--site-brick-4"));
    Object.assign(PAL, { bh, bs, dark: rgb("--site-brick-dark"), mortar: rgb("--site-brick-mortar"), light: rgb("--site-brick-light"),
      sky0: rgb("--site-sky"), sky1: rgb("--site-sky-deep"), shade: rgb("--site-photo-shade") });
  };
  const paint = (c, a = 1) => `rgb(${c[0]} ${c[1]} ${c[2]} / ${a})`;

  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // One face: fill the trapezoid between inner and outer edges with bricks laid in that face’s direction, and set brightness by light direction
  const face = (ctx, a0, a1, b1, b0, normal, dark = 0) => {
    const lit = 0.5 + 0.5 * Math.cos(normal - LIGHT);
    const light = 20 + lit * 34 - dark;
    ctx.save();
    ctx.beginPath();
    trace(ctx, [a0, a1, b1, b0]);
    ctx.clip();
    ctx.fillStyle = `hsl(${PAL.bh - 2} ${PAL.bs - 12}% ${light - 12}%)`;
    ctx.fill();
    const ang = Math.atan2(b1[1] - b0[1], b1[0] - b0[0]);
    const len = Math.hypot(b1[0] - b0[0], b1[1] - b0[1]);
    const depth = Math.hypot(a0[0] - b0[0], a0[1] - b0[1]) + 80;
    ctx.translate(...b0);
    ctx.rotate(ang);
    const bw = 50;
    const bh = 31;
    for (let y = -depth; y < depth; y += bh) {
      const shift = (Math.round(y / bh) & 1) * (bw / 2);
      for (let x = -depth - bw; x < len + depth; x += bw) {
        const l = light + (rand() - 0.5) * 9;
        ctx.fillStyle = `hsl(${PAL.bh - 1 + (rand() - 0.5) * 6} ${PAL.bs + 1 + (rand() - 0.5) * 10}% ${l}%)`;
        ctx.fillRect(x + shift + 2, y + 2, bw - 4, bh - 4);
      }
    }
    ctx.restore();
  };

  const ring = (ctx, rIn, rOut, dark) => {
    const inner = oct(rIn);
    const outer = oct(rOut);
    const [ix, iy] = inner.reduce((m, p) => [m[0] + p[0] / SIDES, m[1] + p[1] / SIDES], [0, 0]);
    for (let k = 0; k < SIDES; k++) {
      const n = (k + 1) % SIDES;
      const mid = [(outer[k][0] + outer[n][0]) / 2 - ix, (outer[k][1] + outer[n][1]) / 2 - iy];
      face(ctx, inner[k], inner[n], outer[n], outer[k], Math.atan2(mid[1], mid[0]) + Math.PI, dark);
    }
    // So the inner frame looks tucked under the outer frame, a deep shadow runs along the inner edge and a thin highlight along the outer edge
    ctx.save();
    ctx.beginPath();
    trace(ctx, outer);
    trace(ctx, inner);
    ctx.clip("evenodd");
    ctx.beginPath();
    trace(ctx, inner);
    ctx.lineWidth = 34;
    ctx.strokeStyle = paint(PAL.dark, 0.82);
    ctx.stroke();
    ctx.beginPath();
    trace(ctx, outer);
    ctx.lineWidth = 6;
    ctx.strokeStyle = paint(PAL.light, 0.22);
    ctx.stroke();
    ctx.restore();
  };

  const paintLayer = (layer, scale) => {
    const c = document.createElement("canvas");
    c.width = Math.round(W * scale);
    c.height = Math.round(H * scale);
    const ctx = c.getContext("2d");
    ctx.scale(scale, scale);
    const [rIn, rOut] = layer.ring;
    if (layer.name === "bg") {
      // Dark ceiling outside the frame, and the sky seen through the central octagonal skylight
      ctx.fillStyle = paint(PAL.dark);
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = 0.55;
      const big = oct(2600), edge = oct(rIn);
      for (let k = 0; k < SIDES; k++) face(ctx, edge[k], edge[(k + 1) % SIDES], big[(k + 1) % SIDES], big[k], k * 0.8, 14);
      ctx.restore();
      const sky = ctx.createRadialGradient(CX, CY, 10, CX, CY, 200);
      sky.addColorStop(0, paint(PAL.sky0));
      sky.addColorStop(1, paint(PAL.sky1));
      ctx.beginPath();
      trace(ctx, oct(200));
      ctx.fillStyle = sky;
      ctx.fill();
    } else if (layer.name === "centro") {
      // Octagonal box hanging under the skylight: two sides and a bottom
      const top = oct(rOut, 0, 0);
      const bot = oct(rOut * 0.86, 46, 64);
      [[2, 3], [3, 4]].forEach(([a, b]) => face(ctx, top[a], top[b], bot[b], bot[a], b * 0.8, 6));
      face(ctx, bot[0], bot[1], oct(rOut * 0.3, 46, 64)[1], oct(rOut * 0.3, 46, 64)[0], 0.4, 10);
      ctx.beginPath();
      trace(ctx, bot);
      ctx.fillStyle = paint(PAL.mortar, 0.85);
      ctx.fill();
      ctx.beginPath();
      trace(ctx, oct(rOut * 0.42, 46, 64));
      ctx.fillStyle = paint(PAL.dark, 0.9);
      ctx.fill();
    } else {
      ring(ctx, rIn, rOut, rIn < 500 ? 4 : 0);
    }
    return c;
  };

  const lerp = (a, b, t) => a + (b - a) * t;
  const pose = (layer, p) => {
    const n = Math.min(Math.max(p, 0), 1.5);
    const [a, b, t] = n <= 1 ? [layer.from, layer.mid, n] : [layer.mid, layer.to, (n - 1) / 0.5];
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), scale: lerp(a.scale, b.scale, t) };
  };

  const hero = document.querySelector(".e-hero");
  const canvas = hero.querySelector(".e-hero__canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const phone = matchMedia("(max-width: 767px)").matches;
  readPalette();
  const bitmaps = LAYERS.map((l) => paintLayer(l, phone ? 0.5 : 0.7));
  const size = { w: 0, h: 0, dpr: 1 };
  const state = { progress: 0 };

  // Same fit as the original: image width is the larger of 1.02× screen width and 1.06× screen height, vertically aligned to the top edge
  const draw = () => {
    const { w, h, dpr } = size;
    const ow = Math.max(1.02 * w, 1.06 * h * RATIO);
    const oh = ow / RATIO;
    ctx.fillStyle = paint(PAL.shade);
    ctx.fillRect(0, 0, w * dpr, h * dpr);
    LAYERS.forEach((layer, i) => {
      const { x, y, scale } = pose(layer, state.progress);
      const fw = ow * scale;
      const fh = oh * scale;
      const gx = w / 2 + (x / 100) * ow;
      const gy = oh / 2 + (y / 100) * oh;
      ctx.drawImage(bitmaps[i], (gx - fw / 2) * dpr, (gy - fh / 2) * dpr, fw * dpr, fh * dpr);
    });
    const shade = 0.3 * (1 - Math.min(Math.max(state.progress, 0), 1.5) / 1.5);
    if (shade > 0) {
      ctx.fillStyle = paint(PAL.shade, shade);
      ctx.fillRect(0, 0, w * dpr, h * dpr);
    }
  };
  const resize = () => {
    size.w = canvas.clientWidth;
    size.h = canvas.clientHeight;
    size.dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.w * size.dpr);
    canvas.height = Math.round(size.h * size.dpr);
    draw();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  window.eSite.scene(() => {
    const chars = SplitText.create("[data-line]", { type: "chars", mask: "chars", charsClass: "char", propIndex: true }).chars;
    const divider = document.querySelector("[data-hero-divider]");
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(hero, { visibility: "visible" });
      divider.classList.add("is-inview");
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      window.lenis?.stop();
      // Intro: a photo opens through a narrow gap at screen center (48% top/bottom · 46% left/right) in 1s, then spreads full over the next 2s while name letters slide in at 0.01s intervals
      gsap.timeline()
        .set(hero, { visibility: "visible" })
        .fromTo("[data-scene]", { scale: 1.4 }, { scale: 1.2, duration: 1, ease: "power4.out" }, 0)
        .to("[data-scene]", { scale: 1, duration: 2, ease: "power4.inOut" }, 1)
        .fromTo("[data-scene-wrapper]", { clipPath: "inset(100% 100% 100% 100%)" }, { clipPath: "inset(48% 46% 48% 46%)", duration: 1, ease: "power4.out" }, 0)
        .from(chars, { duration: 2, x: "1em", ease: "power4.inOut", stagger: { each: 0.01, from: "start" } }, 1)
        .fromTo("[data-scene-wrapper]", { clipPath: "inset(48% 46% 48% 46%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 2, ease: "power4.inOut" }, "<")
        .call(() => divider.classList.add("is-inview"), undefined, "<50%")
        .from("[data-hero-nav] > *", { xPercent: 50, autoAlpha: 0, duration: 0.6, ease: "magic", stagger: 0.15 }, "<")
        .fromTo("[data-year]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power4.inOut" }, "<50%")
        .call(() => window.lenis?.start(), undefined, "-=0.8");

      // Over 1.5 screens of scroll the layers spread apart, the two name lines slide out left and right by 110%, and the menu and year fade away
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: "+=150%", scrub: true } })
        .to(state, { progress: 1.5, duration: 1.5, onUpdate: draw }, 0)
        .to('[data-line="1"]', { xPercent: -110, duration: 0.45 }, 0)
        .to('[data-line="2"]', { xPercent: 110, duration: 0.45 }, 0)
        .to("[data-hero-navwrap]", { autoAlpha: 0, duration: 0.45 }, 0)
        .fromTo("[data-year]", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.45, immediateRender: false }, 0);
    });

    // ── Brick texture inside the footer name: like the original, from the moment the name enters the bottom of the screen until it is fully visible (top bottom → bottom bottom) the pattern flows down by the name’s height (scrub 1.25)
    const brick = document.getElementById("e-brick");
    mm.add({ desk: "(min-width: 768px)", phone: "(max-width: 767px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
      const mark = document.querySelector(conditions.desk ? ".e-footer__mark.is-desk" : ".e-footer__mark.is-phone");
      if (!conditions.motion || !brick || !mark) return;
      const drift = { y: 0 };
      gsap.to(drift, {
        y: mark.viewBox.baseVal.height, ease: "none",
        onUpdate: () => brick.setAttribute("patternTransform", `translate(0 ${drift.y})`),
        scrollTrigger: { trigger: mark, start: "top bottom", end: "bottom bottom", scrub: 1.25 },
      });
      return () => brick.removeAttribute("patternTransform");
    });

    // ── Phone photo row: original BlossomCarousel as is (no repeat)
    const strip = document.querySelector(".e-gallery__scroller");
    if (strip && window.BlossomCarousel) BlossomCarousel.Blossom(strip, { repeat: false }).init();

    // ── Needle timeline
    const tl = document.querySelector("[data-timeline]");
    const fill = tl.querySelector("[data-timeline-fill]");
    const years = gsap.utils.toArray("[data-timeline-year]", tl);
    // The bright line first follows down to the center of the first year cell, then after that keeps its end at the screen center
    const grow = () => {
      const box = tl.getBoundingClientRect();
      const mid = innerHeight / 2;
      const first = years.find((y) => y.offsetParent) || tl.querySelector(".e-tl__cell");
      const r = first ? Math.max(first.getBoundingClientRect().top - box.top + first.offsetHeight / 2, 0) : 0;
      const n = mid - r;
      let s = r > 0 && box.top > n && innerHeight !== n ? r * Math.min(Math.max((innerHeight - box.top) / (innerHeight - n), 0), 1) : mid - box.top;
      s = Math.min(Math.max(s, 0), box.height);
      gsap.set(fill, { height: s });
    };
    ScrollTrigger.create({ trigger: tl, start: "top bottom", end: "bottom center", onUpdate: grow, onRefresh: grow });
    grow();

    const passed = (el) => { const b = el.getBoundingClientRect(); return b.top + b.height / 2 <= innerHeight / 2; };
    years.forEach((el) => {
      gsap.set(el, { opacity: passed(el) ? 1 : 0.4 });
      ScrollTrigger.create({
        trigger: el, start: "center center", end: "bottom top",
        onEnter: () => gsap.to(el, { opacity: 1, duration: 0.2, overwrite: "auto" }),
        onLeaveBack: () => gsap.to(el, { opacity: 0.4, duration: 0.2, overwrite: "auto" }),
      });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray("[data-timeline-item]", tl).forEach((item) => {
        const reveal = item.querySelector("[data-timeline-reveal]");
        gsap.timeline({ scrollTrigger: { trigger: item, start: "top bottom", end: "center center", scrub: true } })
          .fromTo(reveal, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "sine.inOut" }, 0)
          .fromTo(reveal.firstElementChild, { yPercent: -30 }, { yPercent: 0, ease: "sine.inOut" }, 0);
      });
      gsap.to("[data-timeline-tip]", { rotate: 2610, ease: "none", scrollTrigger: { trigger: tl, start: "top center", end: "bottom center", scrub: true } });
    });

    // ── Video slot (original VideoEmbed): when the slot comes one screen height ahead (rootMargin 100%) it loads a preview and loops it silently,
    // On click the cover peels away and the main player pops up in the same cell and plays right away
    const video = document.querySelector("[data-video]");
    const preview = video.querySelector(".e-video__preview");
    const near = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      near.disconnect();
      preview.src = preview.dataset.src;
      if (!reduce.matches) preview.play()?.catch(() => {});
    }, { rootMargin: "100% 0px", threshold: 0 });
    near.observe(video);
    video.addEventListener("click", () => {
      if (video.classList.contains("is-playing")) return;
      video.classList.add("is-playing");
      preview.pause();
      video.append(video.querySelector("template[data-video-player]").content.cloneNode(true));
      video.querySelector(".e-video__player").play()?.catch(() => {});
    });
  });
})();
