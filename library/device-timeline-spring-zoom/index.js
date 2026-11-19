// Timeline ↔ work zoom as one stage. The original (Next + react-spring) motion is rebuilt with the same spring integration (1ms steps, tension·friction) and the same constants.
//   zoom progress p: 300/35 · work advance g: 450/50 (phone 800/80) · year number: 400/30 clamp · intro·video curtain: 300/35
//   Progress range — head fades out over 0~.333 at .9925×, work text turns on .333~1, back button goes to .3 over .5~1
(() => {
  const root = document.documentElement;
  const stage = document.querySelector(".mm-stage");
  const world = document.querySelector(".mm-world");
  const head = document.querySelector(".mm-head");
  const back = document.querySelector(".mm-back");
  const dateEl = document.querySelector(".mm-date");
  const about = document.querySelector(".mm-about");
  const carousel = document.querySelector(".mm-carousel");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const D = window.mmDevices;

  // Window size → scale and margin rules carried over from the original constants table (desktop*·mobile*)
  const C = {
    desk: { fs: 20, breakW: 1300, breakH: 1000, minW: 380, minH: 300, hMin: 35, hMax: 150, vMin: 35, vMax: 130, maxH: 740, timeline: 530, header: 114, headScale: 0.9925 },
    mob: { fs: 13, breakW: 425, breakH: 450, minW: 100, minH: 200, hMin: 20, hMax: 60, vMin: 35, vMax: 75, maxH: 370, timeline: 150, header: 142, headScale: 0.945 },
  };
  const SPRING = { tension: 300, friction: 35, precision: 1e-4 };
  const PAGE = { tension: 450, friction: 50, precision: 1e-4 };
  const PAGE_MOB = { tension: 800, friction: 80, precision: 1e-4 };
  const DATE = { tension: 400, friction: 30, clamp: true, precision: 0.01 };
  const WHEEL_EXPAND = 100, DRAG_FRICTION = 0.96, PAGE_THRESHOLD = 0.33, DRAG_DISMISS = 200, GALLERY_W = 1.5;

  // Work fifteen: image ratio (original image width×height), timeline height share (tl), zoom height share (gal), back cell half gap (em), device side overhang (pad)
  const projects = [
    { name: "Project One", role: "Co-founding", org: "Acquired by another company", year: 2020, dv: "laptop", tl: 1, gap: 3, pad: 0.09406, screen: "App screen · photo category grid and left menu · bright screen", team: 8, clips: [1730, 1728, 1634] },
    { name: "Project Two", role: "Screen Design", org: "Company name", year: 2015, dv: "phone", w: 736, tl: 0.7333, gap: 1.375, screen: "Phone app · article opening with large photo and title", team: 6, clips: [1730, 1730] },
    { name: "Project Three", role: "Screen Design", org: "Company name", year: 2015, dv: "phone", w: 721, tl: 0.6333, gap: 3.5, screen: "Phone app · story card swipe", team: 7, clips: [1730, 1730] },
    { name: "Project Four", role: "Screen Design", org: "Acquired by another company", year: 2014, dv: "round", tl: 0.5333, gal: 0.8, gap: 4, screen: "Round screen · large temperature figure", team: 5, clips: [1730] },
    { name: "Project Five", role: "Co-founding", org: "Acquired by another company", year: 2011, dv: "tablet", tl: 1, gap: 1.375, screen: "Tablet book · page spread with photo and body text", team: 6, clips: [1730, 1730] },
    { name: "Project Six", role: "Screen Design", org: "Company name", year: 2010, dv: "tablet", tl: 1, gap: 1.375, screen: "Tablet photo app · dummy album", team: 4, clips: [1730] },
    { name: "Project Seven", role: "Screen Design", org: "Company name", year: 2010, dv: "tablet", tl: 1, gap: 4, screen: "Tablet map app · satellite map", team: 4, clips: [1730] },
    { name: "Project Eight", role: "Screen Design", org: "Company name", year: 2007, dv: "classic", tl: 0.7, gap: 1.375, screen: "Old phone map · directions", team: 5, clips: [1730] },
    { name: "Project Nine", role: "Screen Design", org: "Company name", year: 2007, dv: "classic", tl: 0.7, gap: 1.375, screen: "Old phone photo · grid", team: 4, clips: [1730] },
    { name: "Project Ten", role: "Screen Design", org: "Company name", year: 2007, dv: "classic", tl: 0.7, gap: 1.375, screen: "Old phone camera · shooting screen", team: 4, clips: [1730] },
    { name: "Project Eleven", role: "Screen Design", org: "Company name", year: 2007, dv: "classic", tl: 0.7, gap: 1.375, screen: "Old phone settings · list", team: 3, clips: [1730] },
    { name: "Project Twelve", role: "Screen Design", org: "Company name", year: 2007, dv: "classic", tl: 0.7, gap: 4, screen: "Old phone lock screen · charging indicator", team: 3, clips: [1730] },
    { name: "Project Thirteen", role: "Screen Design", org: "Company name", year: 2006, dv: "desktop", w: 1828, tl: 1, gap: 1.75, screen: "Desktop · scene of overlapping windows lined up behind", team: 5, clips: [1730] },
    { name: "Project Fourteen", role: "Screen Design", org: "Company name", year: 2005, dv: "desktop", w: 1518, tl: 0.9333, gap: 3.75, screen: "Desktop · four-frame photo booth", team: 4, clips: [1730] },
    { name: "Project Fifteen", role: "Co-founding", org: "Company name", year: 2004, dv: "desktop", w: 2183, tl: 0.6333, gap: 0, pad: 0.1008, screen: "Desktop · Book covers on a wooden shelf", team: 3, clips: [1730] },
  ];
  const memberNames = ["Team Member One", "Member Name", "Person Name", "Team Member Two", "Member Name Long", "Person Name Two", "Team Member", "Person Name"];

  // ───── Spring: react-spring v9 integration, as is ─────
  const springs = new Set();
  let raf = 0, last = 0;
  class Spring {
    constructor(x, cfg) { this.x = this.to = x; this.v = 0; Object.assign(this, { tension: 170, friction: 26, clamp: false, precision: 0.01 }, cfg); }
    set(to, { now = false } = {}) {
      this.to = to;
      if (now || reduce) { this.x = to; this.v = 0; springs.delete(this); render(); return; }
      springs.add(this); kick();
    }
    step(dt) {
      for (let i = 0; i < dt; i++) {
        this.v += -this.tension * 1e-6 * (this.x - this.to) - this.friction * 1e-3 * this.v;
        const next = this.x + this.v;
        if (this.clamp && (next - this.to) * (this.x - this.to) < 0) { this.x = this.to; this.v = 0; break; }
        this.x = next;
      }
      if (Math.abs(this.v) < this.precision / 10 && Math.abs(this.x - this.to) < this.precision) { this.x = this.to; this.v = 0; return false; }
      return true;
    }
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const frame = (now) => {
    const dt = Math.min(64, Math.max(1, Math.round(now - (last || now - 16))));
    last = now;
    for (const s of springs) if (!s.step(dt)) springs.delete(s);
    if (coast) coastStep(dt);
    render();
    raf = springs.size || coast ? requestAnimationFrame(frame) : 0;
    if (!raf) last = 0;
  };

  const p = new Spring(0, SPRING);           // Timeline 0 ↔ Work 1
  const g = new Spring(0, PAGE);             // Work switch position (index)
  const date = new Spring(new Date().getFullYear(), DATE);
  const ab = new Spring(0, SPRING), abText = new Spring(0, SPRING), abPhoto = new Spring(0, SPRING);
  const cv = new Spring(0, SPRING), cvPage = new Spring(0, PAGE);
  const intro = new Spring(0, SPRING);       // Hero: in the original a panel wrapping the whole app rises from transparent 0 with the same spring
  let tx = 0, coast = 0, maxTx = 0, moved = false;

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const map = (v, a, b) => clamp01((v - a) / (b - a));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ───── Building ─────
  const items = projects.map((pr, i) => {
    const dv = pr.dv === "phone" || pr.dv === "desktop" ? D[pr.dv](pr.w) : D[pr.dv]();
    const el = document.createElement("div");
    el.className = "mm-item";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `${pr.name} View Large`);
    el.innerHTML = `${dv.svg}<div class="mm-screen wf-img" style="left:${dv.screen.x}%;top:${dv.screen.y}%;width:${dv.screen.w}%;height:${dv.screen.h}%" data-label="${pr.screen}"><i class="mm-shine"></i></div>`;
    const text = document.createElement("div");
    text.className = "mm-text";
    const members = Array.from({ length: pr.team }, (_, k) => `<span>${memberNames[k % memberNames.length]}</span>`).join("");
    text.innerHTML = `<h2 class="mm-text__title" lang="en" data-label="Work English name">${pr.name}</h2>
      <p class="mm-text__sub"><span>${pr.role}</span><span>${pr.org}</span><span class="mm-text__date">${pr.year}</span></p>
      <button class="mm-play" type="button" data-clickable aria-label="Watch video"><svg viewBox="0 0 68 68" aria-hidden="true"><circle cx="34" cy="34" r="32.8"/><path d="M28 23l19 11-19 11z"/></svg></button>
      <p class="mm-text__team" lang="en" data-label="Contributor name in English">${members}</p>`;
    world.append(el, text);
    el.addEventListener("click", () => { if (!moved && p.to === 0) expand(i); });
    el.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && p.to === 0) { e.preventDefault(); expand(i); } });
    text.querySelector(".mm-play").addEventListener("click", () => openCarousel(i));
    return { pr, el, text, screen: dv.screen, shine: el.querySelector(".mm-shine"), ratio: dv.w / dv.h, pad: pr.pad || 0, tl: pr.tl, gal: pr.gal || 1, textW: 0, textH: 0, t: {} };
  });

  // ───── Measuring: original geometry (window size → letter scale · margin · cell height) ─────
  let G = {};
  const measure = () => {
    const W = innerWidth, H = innerHeight;
    const mobile = W <= 600 && H > W;
    const c = mobile ? C.mob : C.desk;
    // Phone scale is 12.02/13 of the original 390 width = .9246 was measured (not the .9176 you get by dividing by 425) — the original measures a screen width 3px wider
    const scale = Math.max(0.3, Math.min(1, (W + (mobile ? 3 : 0)) / c.breakW, H / c.breakH));
    const fs = c.fs * scale;
    const hm = c.hMin + (c.hMax - c.hMin) * clamp01((W - c.minW) / (c.breakW - c.minW));
    const vm = c.vMin + (c.vMax - c.vMin) * clamp01((H - c.minH) / (c.breakH - c.minH));
    const contentW = W - 2 * hm;
    const contentH = Math.min(c.maxH, H - 2 * vm);
    const top = (H - contentH) / 2;
    G = { W, H, mobile, c, scale, fs, hm, vm, contentW, contentH, top, bottom: top + contentH, tlH: c.timeline * scale };
    // Header cell width is 914.3 at the original 1440×900 (1.3705× the content height of 667.1) — keep that ratio
    G.headW = mobile ? contentW : Math.min(contentW, contentH * 1.37045);
    G.headLeft = (W - G.headW) / 2;
    root.style.setProperty("--mm-fs", `${fs}px`);
    // Phone: center the bundle of header + 3em + one timeline line vertically. Enlarged image at 340 scale, a 16em-tall text box 4em below, bundle shifted 20px down.
    if (mobile) {
      const headH = head.offsetHeight;
      const headTop = (H - (headH + 3 * fs + G.tlH)) / 2;
      root.style.setProperty("--mm-head-top", `${headTop}px`);
      G.tlBottom = headTop + headH + 3 * fs + G.tlH;
      G.galH = 340 * scale;
      G.galTop = (H - (G.galH + 20 * fs)) / 2 + 20;
    } else {
      root.style.setProperty("--mm-head-top", `${top}px`);
      G.tlBottom = G.bottom;
      G.galH = contentH;
    }
    root.style.setProperty("--mm-scale", scale);
    root.style.setProperty("--mm-top", `${top}px`);
    root.style.setProperty("--mm-content-h", `${contentH}px`);
    root.style.setProperty("--mm-hm", `${hm}px`);
    root.style.setProperty("--mm-head-left", `${G.headLeft}px`);
    root.style.setProperty("--mm-head-w", `${G.headW}px`);
    let x = G.headLeft;
    items.forEach((it, i) => {
      it.textW = it.text.offsetWidth;
      it.textH = it.text.offsetHeight;
      const h = G.tlH * it.tl, w = h * it.ratio;
      if (i === 0) x -= it.pad * w;
      it.t = { x, w, h };
      x += w + 2 * it.pr.gap * (mobile ? 0.4 : 1) * fs;
    });
    const lastIt = items[items.length - 1];
    maxTx = Math.max(0, x - lastIt.pad * lastIt.t.w + G.headLeft - W);
    tx = Math.min(tx, maxTx);
    Object.assign(g, mobile ? PAGE_MOB : PAGE);
  };

  // Zoom slot for work i — cards spaced 1.5 screen widths apart, centered if text + 7.5em + image is narrower than the content width
  const galleryRect = (it, i) => {
    const h = G.galH * it.gal, w = h * it.ratio;
    const container = G.hm + (i - g.x) * G.W * GALLERY_W;
    if (G.mobile) {
      // Image and text are each centered in the content width, and stick to the content start if they overflow (original column-reverse cell)
      const x = container + Math.max(0, (G.contentW - w * (1 - 2 * it.pad)) / 2) - it.pad * w;
      const y = G.galTop + (G.galH - h) / 2;
      return { x, y, w, h, tx: container + Math.max(0, (G.contentW - it.textW) / 2), ty: y + h + 4 * G.fs };
    }
    const body = it.textW + 7.5 * G.fs + w * (1 - 2 * it.pad);
    const start = container + Math.max(0, (G.contentW - body) / 2);
    return { x: start + it.textW + 7.5 * G.fs - it.pad * w, y: G.top + (G.contentH - h) / 2, w, h, tx: start, ty: G.top + (G.contentH - it.textH) / 2 };
  };

  // ───── Drawing ─────
  let lastDate = "";
  const render = () => {
    const P = p.x;
    const textOn = map(P, 0.333, 1) * (1 - map(cv.x, 0, 0.5));
    items.forEach((it, i) => {
      const gr = galleryRect(it, i);
      const tX = it.t.x - tx, tY = G.tlBottom - it.t.h;
      const x = lerp(tX, gr.x, P), y = lerp(tY, gr.y, P), w = lerp(it.t.w, gr.w, P), h = lerp(it.t.h, gr.h, P);
      it.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      it.el.style.width = `${w}px`;
      it.el.style.height = `${h}px`;
      const near = Math.abs(i - g.x) < 1.2;
      it.text.style.transform = `translate3d(${gr.tx}px, ${gr.ty}px, 0)`;
      it.text.style.opacity = near ? textOn : 0;
      it.text.style.visibility = near && textOn > 0.01 ? "visible" : "hidden";
      // Light beam: a diagonal band attached to the window, the device passes under it — push the band back by the amount of the screen slot.
      it.shine.style.backgroundPosition = `${-(x + w * it.screen.x / 100)}px ${-(y + h * it.screen.y / 100)}px`;
      it.shine.style.opacity = 0.3 * (1 - P);
    });
    const hp = map(P, 0, 0.333), ap = map(ab.x, 0, 0.333);
    const ho = (1 - hp) * (1 - ap);
    head.style.opacity = ho;
    head.style.transform = `scale(${lerp(1, G.c.headScale, Math.max(hp, ap))})`;
    head.style.visibility = ho < 0.01 ? "hidden" : "visible";
    const bo = Math.max(map(P, 0.5, 1), map(ab.x, 0.5, 1));
    back.style.opacity = 0.3 * bo;
    back.style.pointerEvents = p.to || ab.to || cv.to ? "auto" : "none";
    const d = String(Math.round(date.x));
    if (d !== lastDate) { dateEl.textContent = d; lastDate = d; }
    // About curtain: backdrop .1~.9 (white 94% + 15px blur), stage .93x, text 1.07→1 · 3px blur (100ms late), photo (200ms late)
    const aBg = map(ab.x, 0.1, 0.9), cBg = map(cv.x, 0.1, 0.9);
    about.style.visibility = ab.x > 0.001 ? "visible" : "hidden";
    about.style.setProperty("--mm-veil", aBg);
    about.style.setProperty("--mm-in", clamp01(abText.x));
    about.style.setProperty("--mm-in-photo", clamp01(abPhoto.x));
    const sAbout = lerp(1, G.mobile ? 0.875 : 0.93, clamp01(ab.x));
    const sCar = lerp(1, G.mobile ? 0.875 : 0.93, clamp01(cv.x));
    stage.style.transform = `scale(${Math.min(sAbout, sCar)})`;
    stage.style.opacity = intro.x;
    carousel.style.visibility = cv.x > 0.001 ? "visible" : "hidden";
    carousel.style.setProperty("--mm-veil", cBg);
    carousel.style.setProperty("--mm-in", map(cv.x, 0.5, 1));
    renderCarousel();
  };

  // ───── Motion ─────
  const centerIndex = () => {
    let best = 0, bd = Infinity;
    items.forEach((it, i) => { const d = Math.abs(it.t.x - tx + it.t.w / 2 - G.W / 2); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  const moveTimeline = (to) => {
    tx = Math.min(maxTx, Math.max(0, to));
    date.set(projects[centerIndex()].year);
  };
  const expand = (i) => {
    g.set(i, { now: true });
    p.set(1);
    date.set(projects[i].year);
  };
  const collapse = () => {
    const i = Math.round(g.to), it = items[i], vx = it.t.x - tx;
    // If the work being viewed is off the timeline screen, push the timeline so that work is centered
    if (vx < 0 || vx + it.t.w > G.W) tx = Math.min(maxTx, Math.max(0, it.t.x + it.t.w / 2 - G.W / 2));
    p.set(0);
  };
  const page = (dir) => {
    const to = Math.min(items.length - 1, Math.max(0, Math.round(g.to) + dir));
    g.set(to);
    date.set(projects[to].year);
  };
  back.addEventListener("click", () => { if (cv.to) closeCarousel(); else if (ab.to) closeAbout(); else collapse(); });

  // Wheel: one vertical roll (100) zooms/folds, horizontal = Timeline push · pass the work
  let wy = 0, wx = 0, wheelTimer = 0, wheelLock = false;
  addEventListener("wheel", (e) => {
    e.preventDefault();
    if (ab.to || cv.to) return;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wy = 0; wx = 0; wheelLock = false; }, 250);
    if (wheelLock) return;
    const dx = e.deltaX, dy = e.deltaY;
    if (Math.abs(dy) >= Math.abs(dx)) {
      wy += dy;
      if (p.to === 0 && wy >= WHEEL_EXPAND) { wheelLock = true; expand(centerIndex()); }
      else if (p.to === 1 && wy <= -WHEEL_EXPAND) { wheelLock = true; collapse(); }
    } else if (p.to === 0) {
      moveTimeline(tx + dx);
      render();
    } else {
      wx += dx;
      if (Math.abs(wx) > 120) { wheelLock = true; page(Math.sign(wx)); }
    }
  }, { passive: false });

  // Drag: the timeline moves with the hand and, on release, glides at .96x per frame. Work advances if dragged over a third or flicked quickly, and collapses if dragged down 200
  let drag = null;
  const coastStep = (dt) => {
    coast *= Math.pow(DRAG_FRICTION, dt / 16.67);
    moveTimeline(tx + coast * dt);
    if (Math.abs(coast) < 0.01 || tx === 0 || tx === maxTx) coast = 0;
  };
  addEventListener("pointerdown", (e) => {
    if (ab.to || cv.to || e.button !== 0 || e.target.closest("a, .mm-play, .mm-back, .wf-ui")) return;
    drag = { x: e.clientX, y: e.clientY, lx: e.clientX, t: performance.now(), vx: 0, tx, g: g.x, axis: null };
    moved = false; coast = 0;
  });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.axis && Math.hypot(dx, dy) > 10) drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (!drag.axis) return;
    moved = true;
    const now = performance.now();
    drag.vx = (e.clientX - drag.lx) / Math.max(1, now - drag.t); drag.lx = e.clientX; drag.t = now;
    const span = G.W * GALLERY_W;
    if (p.to === 0 && drag.axis === "x") { moveTimeline(drag.tx - dx); render(); }
    else if (p.to === 1 && drag.axis === "x") g.set(drag.g - dx / span, { now: true });
    else if (p.to === 1 && drag.axis === "y" && dy > 0) p.set(1 - Math.min(1, dy / (G.H * 0.6)), { now: true });
    else if (p.to === 0 && drag.axis === "y" && dy < -WHEEL_EXPAND) { drag = null; expand(centerIndex()); }
  });
  addEventListener("pointerup", (e) => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.axis) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (p.to === 0 && d.axis === "x") { coast = -d.vx; kick(); return; }
    if (p.to === 1 && d.axis === "x") {
      const span = G.W * GALLERY_W;
      page(Math.abs(dx) > span * PAGE_THRESHOLD * 0.5 || Math.abs(d.vx) > 0.1 ? -Math.sign(dx) : 0);
      return;
    }
    if (p.to === 1 && d.axis === "y") { if (dy > DRAG_DISMISS) collapse(); else p.set(1); }
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (cv.to) closeCarousel(); else if (ab.to) closeAbout(); else if (p.to) collapse(); return; }
    if (cv.to) { if (e.key === "ArrowRight") pageCarousel(1); if (e.key === "ArrowLeft") pageCarousel(-1); return; }
    if (p.to && e.key === "ArrowRight") page(1);
    if (p.to && e.key === "ArrowLeft") page(-1);
  });

  // ───── About curtain ─────
  let abTimers = [];
  const openAbout = () => {
    ab.set(1); about.setAttribute("aria-hidden", "false");
    abTimers.forEach(clearTimeout);
    abTimers = [setTimeout(() => abText.set(1), reduce ? 0 : 100), setTimeout(() => abPhoto.set(1), reduce ? 0 : 200)];
  };
  const closeAbout = () => {
    abTimers.forEach(clearTimeout);
    ab.set(0); abText.set(0); abPhoto.set(0); about.setAttribute("aria-hidden", "true");
  };
  document.querySelectorAll("[data-about-open]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); openAbout(); }));
  about.addEventListener("click", (e) => { if (!e.target.closest("a")) closeAbout(); });

  // ───── Video bundle: videos fit to content height line up 7px apart with only the center one sharp, dots below, controls hide after 3s without touch ─────
  const track = carousel.querySelector(".mm-carousel__track");
  const dots = carousel.querySelector(".mm-carousel__dots");
  let clips = [], hideTimer = 0;
  const openCarousel = (i) => {
    const pr = projects[i];
    track.innerHTML = pr.clips.map((vw, k) => `
      <div class="mm-clip" data-clickable data-ratio="${vw / 1080}">
        <div class="mm-clip__media wf-img wf-video" data-label="Screen recording video ${k + 1} · App demo · white background · landscape ${(vw / 1080).toFixed(2)}:1"><video src="media/clip.mp4" muted playsinline loop preload="none" aria-hidden="true"></video></div>
        <div class="mm-clip__title"><p lang="en" data-label="Video English Title">Video Title ${String(k + 1).padStart(2, "0")}</p><p>Company name 0000</p></div>
        <div class="mm-clip__bar">
          <button class="mm-clip__btn" type="button" data-clickable aria-label="Play · Pause"><svg viewBox="0 0 28 28" aria-hidden="true"><path class="is-play" d="M8 5l15 9-15 9z"/><path class="is-pause" d="M7 5h5v18H7zM16 5h5v18h-5z"/></svg></button>
          <div class="mm-clip__scrub"><i class="mm-clip__track"><b class="mm-clip__progress"></b></i></div>
          <button class="mm-clip__btn" type="button" data-clickable aria-label="View Large"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 11V4h7M17 4h7v7M24 17v7h-7M11 24H4v-7" fill="none"/></svg></button>
        </div>
      </div>`).join("");
    dots.innerHTML = pr.clips.length > 1 ? pr.clips.map(() => "<i></i>").join("") : "";
    clips = [...track.children];
    clips.forEach((c, k) => {
      const v = c.querySelector("video");
      c.querySelector(".mm-clip__btn").addEventListener("click", (e) => { e.stopPropagation(); v.paused ? v.play().catch(() => {}) : v.pause(); });
      v.addEventListener("timeupdate", () => { c.querySelector(".mm-clip__progress").style.transform = `scaleX(${v.duration ? v.currentTime / v.duration : 0})`; });
      v.addEventListener("play", () => c.classList.add("is-playing"));
      v.addEventListener("pause", () => c.classList.remove("is-playing"));
      c.addEventListener("click", (e) => { e.stopPropagation(); if (k !== Math.round(cvPage.to)) pageCarousel(k - Math.round(cvPage.to)); });
    });
    cvPage.set(0, { now: true });
    cv.set(1);
    carousel.setAttribute("aria-hidden", "false");
    playActive();
  };
  const playActive = () => {
    clips.forEach((c, k) => { const v = c.querySelector("video"); if (k === Math.round(cvPage.to)) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause(); });
    poke();
  };
  const pageCarousel = (dir) => {
    const to = Math.min(clips.length - 1, Math.max(0, Math.round(cvPage.to) + dir));
    if (to === cvPage.to) return;
    cvPage.set(to); playActive();
  };
  const closeCarousel = () => {
    clips.forEach((c) => c.querySelector("video").pause());
    cv.set(0); carousel.setAttribute("aria-hidden", "true");
  };
  const poke = () => { carousel.classList.remove("is-idle"); clearTimeout(hideTimer); hideTimer = setTimeout(() => carousel.classList.add("is-idle"), 3000); };
  carousel.addEventListener("pointermove", poke);
  carousel.addEventListener("click", (e) => { if (!e.target.closest(".mm-clip")) closeCarousel(); });
  const renderCarousel = () => {
    if (!clips.length) return;
    const gap = 7;
    const s = lerp(G.mobile ? 1.125 : 1.07, 1, map(cv.x, 0.5, 1));
    const sizes = clips.map((c) => {
      const r = +c.dataset.ratio;
      let h = G.contentH, w = h * r;
      const maxW = G.W - 30;
      if (w > maxW) { w = maxW; h = w / r; }
      return { w, h };
    });
    const cur = Math.max(0, Math.min(clips.length - 1, Math.round(cvPage.x)));
    const frac = cvPage.x - cur;
    let x0 = (G.W - sizes[cur].w) / 2;
    for (let k = 0; k < cur; k++) x0 -= sizes[k].w + gap;
    x0 -= frac * (sizes[cur].w + gap);
    let x = x0;
    clips.forEach((c, k) => {
      const { w, h } = sizes[k];
      c.style.width = `${w}px`; c.style.height = `${h}px`;
      c.style.transform = `translate3d(${x}px, ${(G.H - h) / 2}px, 0) scale(${s})`;
      c.style.setProperty("--mm-active", 1 - Math.min(1, Math.abs(k - cvPage.x)) * 0.85);
      x += w + gap;
    });
    [...dots.children].forEach((d, k) => d.classList.toggle("is-on", k === Math.round(cvPage.to)));
    dots.style.top = `${(G.H + sizes[cur].h) / 2 + 1.5 * G.fs}px`;
  };

  const resize = () => { measure(); render(); };
  addEventListener("resize", resize);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(resize);
  measure();
  render();
  intro.set(1);
})();
