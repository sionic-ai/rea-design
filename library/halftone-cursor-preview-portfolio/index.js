// Home scene: dot-rendered bust (scatters from the mouse and returns), hero entrance and retreat, work list covering the hero as it rises,
// Row hover preview (cursor follow, rotating sticker), star that spins with scroll speed, archive window, history vertical line, principles panel words drifting left and right.
(() => {
  const { reduced, fine } = window.ddMotion;
  const lg = matchMedia("(min-width: 1024px)").matches;

  // ── Dot Bust ──
  // If there is a photo (data-image-src) use it, otherwise stamp a plaster bust drawn with drawBust below at 7px intervals.
  // Only cells with alpha above 128 become dots, and the dot color is the color at that spot, so the image to insert must be a PNG with the background removed
  function drawBust(g, W, H) {
    const k = Math.min(W / 720, H / 900);
    g.save();
    g.translate((W - 720 * k) / 2, (H - 900 * k) / 2);
    g.scale(k, k);
    const lin = (x0, y0, x1, y1, stops) => {
      const gr = g.createLinearGradient(x0, y0, x1, y1);
      stops.forEach(([o, c]) => gr.addColorStop(o, c));
      return gr;
    };
    const rad = (x, y, r0, r1, stops) => {
      const gr = g.createRadialGradient(x, y, r0, x, y, r1);
      stops.forEach(([o, c]) => gr.addColorStop(o, c));
      return gr;
    };
    const blob = (x, y, rx, ry, rot, fill) => {
      g.fillStyle = fill;
      g.beginPath();
      g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
      g.fill();
    };

    // Shoulder: a plaster base cut diagonally from lower left to upper right, with light from the left
    g.fillStyle = lin(40, 900, 700, 740, [[0, "#d2d2d2"], [0.35, "#b0b0b0"], [0.7, "#5c5c5c"], [1, "#2e2e2e"]]); // Not a Skin color: the gray of the plaster bust drawn in the photo slot — halftone color follows the drawing color (with a photo, the photo color)
    g.beginPath();
    g.moveTo(40, 900);
    g.lineTo(40, 884);
    g.bezierCurveTo(150, 830, 330, 760, 560, 722);
    g.bezierCurveTo(640, 738, 690, 780, 700, 800);
    g.lineTo(700, 900);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(240,240,240,0.7)"; // Not a Skin color: the gray of the plaster bust drawn in the photo slot — halftone color follows the drawing color (with a photo, the photo color)
    g.lineWidth = 34;
    g.beginPath();
    g.moveTo(200, 900);
    g.lineTo(380, 760);
    g.stroke();

    // Neck: bright in the middle, dark on the right and under the chin
    g.fillStyle = lin(205, 0, 525, 0, [[0, "#7c7c7c"], [0.35, "#c8c8c8"], [0.7, "#959595"], [1, "#4c4c4c"]]); // Not a Skin color: the gray of the plaster bust drawn in the photo slot — halftone color follows the drawing color (with a photo, the photo color)
    g.beginPath();
    g.moveTo(208, 500);
    g.bezierCurveTo(214, 600, 212, 700, 218, 770);
    g.bezierCurveTo(330, 750, 440, 738, 522, 735);
    g.bezierCurveTo(516, 650, 520, 580, 528, 520);
    g.closePath();
    g.fill();
    blob(400, 628, 120, 26, -0.1, "rgba(40,40,40,0.55)"); // Not a Skin color: the gray of the plaster bust drawn in the photo slot — halftone color follows the drawing color (with a photo, the photo color)

    // Face: 3/4 front view looking slightly down to the right
    g.fillStyle = rad(410, 380, 30, 260, [[0, "#d2d2d2"], [0.55, "#ababab"], [1, "#6a6a6a"]]); // Not a Skin color: the gray of the plaster bust drawn in the photo slot — halftone color follows the drawing color (with a photo, the photo color)
    g.beginPath();
    g.moveTo(232, 260);
    g.bezierCurveTo(300, 222, 450, 210, 538, 296);
    g.bezierCurveTo(556, 360, 552, 470, 522, 540);
    g.bezierCurveTo(500, 590, 470, 612, 430, 618);
    g.bezierCurveTo(380, 624, 300, 600, 252, 556);
    g.bezierCurveTo(218, 500, 210, 380, 232, 260);
    g.closePath();
    g.fill();
    blob(258, 440, 44, 120, 0.05, "rgba(60,60,60,0.35)");       // Shaded left cheek // not clothing: the gray of a plaster bust drawn in the photo slot — the halftone color follows the drawing color (the photo color if a photo is put in)
    blob(432, 408, 36, 15, 0.12, "rgba(30,30,30,0.6)");          // Right eye socket // Not skin: the gray of a plaster bust drawn in the photo slot — halftone color follows the picture color (with a photo, the photo’s color)
    blob(290, 414, 32, 14, -0.08, "rgba(30,30,30,0.5)");         // Left eye socket // Not skin: the gray of the plaster bust drawn in the photo slot — the halftone color follows the drawing’s color (the photo’s color if a photo is put in)
    blob(372, 384, 110, 10, 0.04, "rgba(50,50,50,0.28)");        // Brow ridge // not skin: the gray of a plaster bust drawn in the photo slot — halftone color follows the drawing color (with a photo, the photo’s color)
    blob(372, 452, 14, 44, 0.12, "rgba(40,40,40,0.4)");          // Nose-bridge shadow // Not skin: the gray of the plaster bust drawn in the photo slot — the halftone color follows the art color (if a photo is placed, it uses the photo’s color)
    blob(400, 498, 34, 9, 0.1, "rgba(25,25,25,0.6)");            // Under the nose // not skin: the gray of the plaster bust drawn in the photo slot — halftone color follows the art color (photo color if a photo is placed)
    blob(410, 532, 46, 10, 0.08, "rgba(30,30,30,0.55)");         // Mouth // not Skin: the gray of the plaster bust drawn in the photo slot — halftone color follows the drawing color (a photo’s color if one is inserted)
    blob(420, 584, 40, 16, 0.1, "rgba(60,60,60,0.3)");           // Under-chin hollow // Not skin: the gray of the plaster bust drawn in the photo slot — halftone color follows the image color (with a photo, the photo color)

    // Curly hair: small clumps stacked from top to bottom from a fixed seed (the same hair on every reload)
    let s = 11;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const curls = [];
    for (let i = 0; i < 900 && curls.length < 300; i++) {
      const x = 120 + rnd() * 490;
      const y = 10 + rnd() * 500;
      const inMass = ((x - 370) / 245) ** 2 + ((y - 215) / 210) ** 2 < 1;
      const sideLock = x < 240 && y < 520 && ((x - 190) / 70) ** 2 + ((y - 380) / 150) ** 2 < 1;
      const onFace = y > 255 + Math.max(0, (x - 470) * 0.6) && x > 236 && x < 536;
      if ((inMass || sideLock) && !onFace) curls.push({ x, y, r: 13 + rnd() * 12 });
    }
    curls.sort((a, b) => a.y - b.y).forEach(({ x, y, r }) => {
      g.fillStyle = rad(x - r * 0.35, y - r * 0.35, 1, r, [[0, "#d4d4d4"], [0.5, "#8a8a8a"], [1, "#363636"]]); // Not a Skin color: the gray of the plaster bust drawn in the photo slot — halftone color follows the drawing color (with a photo, the photo color)
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    });
    g.restore();
  }

  function particleField(host, cfg) {
    const canvas = host.querySelector("canvas");
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const still = reduced || !cfg.interactive;
    let w = 0, h = 0, n = 0, groups = [], raf = 0, running = false, visible = true, readySent = false;
    let px, py, hx, hy, vx, vy;
    const mouse = { x: -1e3, y: -1e3 };
    const img = new Image();
    let imgOk = false;

    const source = (W, H) => {
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const g = c.getContext("2d", { willReadFrequently: true });
      if (imgOk) {
        const f = cfg.fit === "cover" ? Math.max(W / img.naturalWidth, H / img.naturalHeight) : Math.min(W / img.naturalWidth, H / img.naturalHeight);
        const iw = img.naturalWidth * f, ih = img.naturalHeight * f;
        g.save();
        if (cfg.flipX) { g.translate(W, 0); g.scale(-1, 1); }
        g.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
        g.restore();
      } else {
        drawBust(g, W, H);
      }
      return g.getImageData(0, 0, W, H);
    };

    const build = () => {
      w = host.clientWidth; h = host.clientHeight;
      if (!w || !h) { n = 0; return; }
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const data = source(canvas.width, canvas.height);
      const step = Math.max(1, Math.floor(cfg.density * dpr));
      const pts = [];
      for (let y = 0; y < data.height; y += step) {
        for (let x = 0; x < data.width; x += step) {
          const i = (y * data.width + x) * 4;
          if (data.data[i + 3] > 128) pts.push({ x: x / dpr, y: y / dpr, c: `rgb(${data.data[i]},${data.data[i + 1]},${data.data[i + 2]})` });
        }
      }
      n = pts.length;
      pts.sort((a, b) => (a.c > b.c ? 1 : -1));
      px = new Float32Array(n); py = new Float32Array(n); hx = new Float32Array(n); hy = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
      groups = [];
      pts.forEach((p, i) => {
        hx[i] = p.x; hy[i] = p.y;
        px[i] = still ? p.x : p.x + (Math.random() - 0.5) * 8;
        py[i] = still ? p.y : p.y + (Math.random() - 0.5) * 8;
        vx[i] = still ? 0 : (Math.random() - 0.5) * 2;
        vy[i] = still ? 0 : (Math.random() - 0.5) * 2;
        const last = groups[groups.length - 1];
        if (last && last.c === p.c) last.n++; else groups.push({ c: p.c, from: i, n: 1 });
      });
      draw();
      start();
      if (!readySent) {
        readySent = true;
        host.dataset.particleReady = "1";
        dispatchEvent(new Event("dd:particle-ready"));
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const r = cfg.size;
      for (const gr of groups) {
        ctx.fillStyle = gr.c;
        ctx.beginPath();
        for (let i = gr.from, end = gr.from + gr.n; i < end; i++) {
          ctx.moveTo(px[i] + r, py[i]);
          ctx.arc(px[i], py[i], r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };

    // Points within 120px of the cursor are pushed away in inverse proportion to distance, pulled back home by .08, and damped by .85 every frame.
    const physics = () => {
      const near = mouse.x !== -1e3;
      let moving = false;
      for (let i = 0; i < n; i++) {
        let x = px[i], y = py[i], ux = vx[i], uy = vy[i];
        if (near) {
          const dx = mouse.x - x, dy = mouse.y - y;
          if (dx > -120 && dx < 120 && dy > -120 && dy < 120) {
            const d2 = dx * dx + dy * dy;
            if (d2 < 14400 && d2 > 0.001) {
              const d = Math.sqrt(d2), f = (120 - d) / 120;
              ux -= (dx / d) * f * cfg.strength;
              uy -= (dy / d) * f * cfg.strength;
            }
          }
        }
        ux += (hx[i] - x) * cfg.ret;
        uy += (hy[i] - y) * cfg.ret;
        ux *= 0.85; uy *= 0.85;
        x += ux; y += uy;
        px[i] = x; py[i] = y; vx[i] = ux; vy[i] = uy;
        if (!moving && (Math.abs(ux) > 0.05 || Math.abs(uy) > 0.05 || Math.abs(hx[i] - x) > 0.1 || Math.abs(hy[i] - y) > 0.1)) moving = true;
      }
      return moving || near;
    };

    const frame = () => {
      if (!running) return;
      const more = physics();
      draw();
      if (more && visible) raf = requestAnimationFrame(frame);
      else { running = false; cancelAnimationFrame(raf); }
    };
    const start = () => {
      if (still || !visible || running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const aim = (cx, cy) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = cx - r.left;
      mouse.y = cy - r.top;
      start();
    };
    const leave = () => { mouse.x = -1e3; mouse.y = -1e3; start(); };

    let built = false;
    const once = () => { if (!built) { built = true; build(); } };
    if (cfg.src) {
      img.onload = () => { imgOk = true; once(); };
      img.onerror = once;
      img.src = cfg.src;
    } else {
      once();
    }
    new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; visible ? start() : stop(); }, { rootMargin: "50px" }).observe(canvas);
    new ResizeObserver(() => { if (built) build(); }).observe(host);
    if (!still) {
      canvas.addEventListener("mousemove", (e) => aim(e.clientX, e.clientY), { passive: true });
      canvas.addEventListener("mouseleave", leave, { passive: true });
      canvas.addEventListener("touchstart", (e) => e.touches[0] && aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
      canvas.addEventListener("touchmove", (e) => e.touches[0] && aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
      canvas.addEventListener("touchend", leave, { passive: true });
      addEventListener("scroll", leave, { passive: true, capture: true });
    }
  }

  const num = (v, d) => (Number.isNaN(parseFloat(v)) ? d : parseFloat(v));
  document.querySelectorAll("[data-particle]").forEach((host) => {
    const d = host.dataset;
    particleField(host, {
      src: d.imageSrc || "",
      fit: d.fit === "contain" ? "contain" : "cover",
      flipX: d.flipX === "true",
      size: num(d.particleSize, 1.5),
      density: num(d.particleDensity, 6),
      strength: num(d.dispersionStrength, 15),
      ret: num(d.returnSpeed, 0.08),
      interactive: d.interactive !== "false",
    });
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // ── Hero entrance: starts mid-paper-opening (loader open+.35) ──
    const lines = document.querySelectorAll("[data-hero-line]");
    const fades = document.querySelectorAll("[data-hero-fade]");
    const field = document.querySelector("[data-hero-particles]");
    const copy = document.querySelector("[data-hero-copy]");
    gsap.set(lines, { yPercent: 115, rotate: 3 });
    gsap.set(fades, { y: 26, opacity: 0 });
    if (field) gsap.set(field, { opacity: 0, scale: 1.06 });
    const intro = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } })
      .to(lines, { yPercent: 0, rotate: 0, duration: 1.15, stagger: 0.1 }, 0.05)
      .to(fades, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0.45);
    if (field) intro.to(field, { opacity: 1, scale: 1, duration: 1.4, ease: "expo.out" }, 0.8);
    let played = false;
    const play = () => { if (!played) { played = true; intro.play(); } };
    addEventListener("dd:loader-reveal", play, { once: true });
    addEventListener("dd:loader-done", play, { once: true });
    setTimeout(() => { if (!document.getElementById("site-loader")) play(); }, 4000);

    const scrollLine = document.querySelector("[data-hero-scrollline]");
    if (scrollLine) gsap.fromTo(scrollLine, { scaleX: 0.2 }, { scaleX: 1, duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    const arrow = document.querySelector("[data-hero-arrow]");
    const contact = arrow?.closest("a");
    contact?.addEventListener("mouseenter", () => gsap.to(arrow, { x: 5, y: -5, duration: 0.35, ease: "power3.out" }));
    contact?.addEventListener("mouseleave", () => gsap.to(arrow, { x: 0, y: 0, duration: 0.4, ease: "power3.out" }));

    // The hero stays pinned, the name blurs and rises while the bust descends and grows. The work list follows up from 10vh below and covers it
    if (lg) {
      if (copy) gsap.to(copy, { yPercent: -10, opacity: 0.15, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom 30%", scrub: true } });
      if (field) gsap.to(field, { yPercent: 12, scale: 1.1, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.fromTo("#work", { y: "10vh" }, { y: "0vh", ease: "none", scrollTrigger: { trigger: "#work", start: "top 100%", end: "top 20%", scrub: true } });
    }

    // ── Work List ──
    document.querySelectorAll(".dd-row").forEach((row) => {
      const inner = row.querySelector(".dd-row__inner");
      const idx = row.querySelector(".dd-row__index");
      gsap.fromTo(inner, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: row, start: "top 92%", once: true } });
      if (!fine) return;
      row.addEventListener("mouseenter", () => {
        gsap.to(inner, { x: 14, duration: 0.45, ease: "power3.out" });
        gsap.to(idx, { x: 4, duration: 0.35, ease: "power3.out" });
      });
      row.addEventListener("mouseleave", () => {
        gsap.to(inner, { x: 0, duration: 0.5, ease: "power3.out" });
        gsap.to(idx, { x: 0, duration: 0.4, ease: "power3.out" });
      });
    });

    // The star is spun by the glyph-spin-scroll part (original .g-star: ink center axis, -32° per second · scroll×.5 · return 1.6 · -170~-9)
  });

  // ── Cursor preview ──
  const follow = document.getElementById("follower");
  const frame = follow?.querySelector("[data-follow-frame]");
  const badge = follow?.querySelector("[data-follow-badge]");
  const badgeText = follow?.querySelector("[data-follow-badge-text]");
  if (follow && frame && fine && !reduced) {
    document.body.append(follow);
    const slides = [...frame.querySelectorAll(".dd-follow__slide")];
    gsap.set(follow, { opacity: 0, scale: 0.85, rotate: -4 });
    if (badge) gsap.to(badge, { rotation: 360, duration: 14, repeat: -1, ease: "none" });
    const fx = gsap.quickTo(follow, "x", { duration: 0.45, ease: "power3" });
    const fy = gsap.quickTo(follow, "y", { duration: 0.45, ease: "power3" });
    const tilt = gsap.quickTo(frame, "rotation", { duration: 0.6, ease: "power3" });
    let lastX = 0, fw = 300, fh = 200;
    const measure = () => { fw = frame.offsetWidth || 300; fh = frame.offsetHeight || 200; };
    addEventListener("resize", measure);
    // On reaching the right edge (window width - preview - 80px) it flips over and sticks to the left of the cursor
    addEventListener("mousemove", (e) => {
      const flip = e.clientX > innerWidth - fw - 80;
      fx(e.clientX + (flip ? -fw - 32 : 32));
      fy(e.clientY - fh / 2);
      tilt(gsap.utils.clamp(-10, 10, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    });
    document.querySelectorAll(".dd-row").forEach((row) => {
      row.addEventListener("mouseenter", () => {
        const junk = row.dataset.kind === "junkyard";
        if (badgeText) badgeText.innerHTML = junk ? "[ Archive<br>Open ]" : "[ Work<br>Example ]";
        slides.forEach((s) => s.classList.toggle("is-active", s.dataset.slide === row.dataset.cover));
        measure();
        gsap.to(follow, { opacity: 1, scale: 1, rotate: 0, duration: 0.4, ease: "back.out(1.4)" });
        gsap.fromTo(frame, { scale: 0.94 }, { scale: 1, duration: 0.45, ease: "power3.out" });
        if (badge) gsap.fromTo(badge, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });
      });
      row.addEventListener("mouseleave", () => gsap.to(follow, { opacity: 0, scale: 0.85, rotate: -4, duration: 0.3, ease: "power3.in" }));
    });
  } else {
    follow?.remove();
  }

  // ── Archive Window ──
  const junk = document.getElementById("junkyard");
  let lastFocus = null;
  const lock = (on) => {
    const html = document.documentElement;
    if (on) { lastFocus = document.activeElement; window.lenis?.stop(); html.style.overflow = "hidden"; }
    else { window.lenis?.start(); html.style.overflow = ""; if (lastFocus instanceof HTMLElement) lastFocus.focus(); }
  };
  const open = () => {
    if (!junk || junk.classList.contains("is-open")) return;
    junk.hidden = false;
    junk.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => junk.classList.add("is-open"));
    lock(true);
    document.getElementById("follower")?.style.setProperty("opacity", "0");
    junk.querySelector("[data-junkyard-close]")?.focus();
    junk.querySelector(".dd-junk__grid")?.scrollTo?.({ top: 0 });
  };
  const close = () => {
    if (!junk || !junk.classList.contains("is-open")) return;
    junk.classList.remove("is-open");
    junk.setAttribute("aria-hidden", "true");
    setTimeout(() => { junk.hidden = true; }, 180);
    lock(false);
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest?.("[data-junkyard-open]")) { e.preventDefault(); open(); return; }
    if (e.target.closest?.("[data-junkyard-close], [data-junkyard-backdrop]")) close();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // ── History · Principles Panel ──
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const bar = document.querySelector("[data-arsenal-bar]");
    if (bar) gsap.to(bar, { scaleX: 1, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: bar, start: "top 90%", once: true } });
    const line = document.querySelector("[data-timeline-line]");
    if (line) gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: line.parentElement, start: "top 80%", end: "bottom 60%", scrub: true } });

    // Each line is pushed in the opposite direction by as much as the word stays clear of the number and subtitle (max 45px, leaving 8px)
    const prin = document.getElementById("principle");
    const tweens = [];
    prin?.querySelectorAll(".dd-prin__row").forEach((row) => {
      const [numEl, word, side] = row.children;
      const dir = Number(row.dataset.dir || 1);
      const room = () => Math.min(
        word.offsetLeft - (numEl.offsetLeft + numEl.offsetWidth),
        (side.offsetWidth ? side.offsetLeft : row.clientWidth) - (word.offsetLeft + word.offsetWidth),
      );
      tweens.push(gsap.to(word, { x: () => dir * Math.max(0, Math.min(45, room() - 8)), ease: "none", scrollTrigger: { trigger: prin, start: "top bottom", end: "bottom top", scrub: 1.2 } }));
    });
    const inval = () => tweens.forEach((t) => t.invalidate());
    ScrollTrigger.addEventListener("refreshInit", inval);
    document.fonts?.ready.then(inval);
    return () => ScrollTrigger.removeEventListener("refreshInit", inval);
  });
})();
