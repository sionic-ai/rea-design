// First page: title letters rising, badge bounce, video box Flip, 3D collage, case strip (horizontal pin), stamp, work cloud parallax, service drum, studio 3D, review drag, quick tour
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const desktop = matchMedia("(min-width: 992px)");
  if (!window.gsap || !window.ScrollTrigger) return;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const hero = document.querySelector("[data-hero]");

  /* ────────── Hero entrance — per line, letters rise inside a mask from 140% below at 8° (1.15s expo.out, .035 stagger, .12 per line), the subtitle line from .75s ────────── */
  const chars = [...hero.querySelectorAll("[data-intro-chars]")];
  const sub = hero.querySelector("[data-intro-sub]"), btns = hero.querySelector("[data-intro-btns]"), tour = hero.querySelector("[data-tour-start]");
  Promise.all([document.fonts?.ready, window.siteIntro]).then(([, wait = 0.15]) => {
    if (reduce || !window.SplitText) return;
    const splits = chars.map((el) => SplitText.create(el, { type: "chars", mask: "chars", charsClass: "split-char", aria: "none" }));
    const lines = SplitText.create(sub, { type: "lines", mask: "lines", linesClass: "split-line", aria: "none" });
    const tl = gsap.timeline({ delay: wait });
    splits.forEach((s, i) => tl.from(s.chars, { yPercent: 140, rotate: 8, duration: 1.15, ease: "expo.out", stagger: 0.035 }, 0.12 * i));
    tl.from(lines.lines, { yPercent: 105, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.75)
      .from([btns, tour], { opacity: 0, y: 14, duration: 0.7, ease: "power2.out", stagger: 0.08 }, 0.9)
      .from("[data-reel-tilt]", { scale: 0.6, opacity: 0, duration: 1, ease: "expo.out" }, 0.3)
      .call(() => document.dispatchEvent(new Event("hero:intro-done")));
  });

  /* ────────── Video box — scrolls to the next section’s screen width via Flip (scrub .25), tilt −5° → 0. Tilts up to 14° toward the cursor (original data-max-rotate) and the badge shifts by the distance ────────── */
  const box = hero.querySelector("[data-flip='hero']"), target = document.querySelector("[data-flip='reel']"), tilt = hero.querySelector("[data-reel-tilt]");
  const pops = [...hero.querySelectorAll(".hero__pop")];
  let full = 0;
  const angle = { rx: 0, ry: 0 };
  gsap.set(pops, { scale: 0.5, autoAlpha: 0, rotation: (i, el) => +(el.dataset.r || 0) });
  let flipTl = null;
  const buildFlip = () => {
    if (flipTl) { flipTl.scrollTrigger?.kill(); flipTl.kill(); gsap.set(box, { clearProps: "all" }); }
    if (reduce || !window.Flip) return;
    flipTl = gsap.timeline({ scrollTrigger: { trigger: hero.querySelector("[data-reel-box]"), start: "clamp(center center)", endTrigger: target, end: "center center", scrub: 0.25 } });
    flipTl.add(Flip.fit(box, target, { duration: 1, ease: "none" }));
    flipTl.eventCallback("onUpdate", () => {
      full = Math.min(1, flipTl.progress() * 3);
      const k = 1 - full;
      gsap.set(tilt, { rotationZ: -5 * k, rotationX: angle.rx * k, rotationY: angle.ry * k });
      if (k < 0.9 && popsOut) hidePops();
    });
  };
  requestAnimationFrame(buildFlip);
  let lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; buildFlip(); } });
  let popsOut = false, wiggles = [];
  const hidePops = () => { popsOut = false; wiggles.forEach((w) => w.kill()); wiggles = []; gsap.to(pops, { scale: 0.6, autoAlpha: 0, duration: 0.2, ease: "power2.out", stagger: { each: 0.03, from: "random" }, overwrite: true }); };
  if (fine && !reduce) {
    const D = 14, follow = pops.map((p) => ({ x: gsap.quickTo(p, "x", { duration: 0.9, ease: "power3.out" }), y: gsap.quickTo(p, "y", { duration: 0.9, ease: "power3.out" }), d: +(p.dataset.d || 20) }));
    let px = innerWidth / 2, py = innerHeight / 2, queued = false;
    const apply = () => {
      queued = false;
      const r = box.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const nx = clamp((px - cx) / (r.width / 2 || 1), -1, 1), ny = clamp((py - cy) / (r.height / 2 || 1), -1, 1), k = 1 - full;
      follow.forEach((f) => { f.x(-(px / innerWidth * 2 - 1) * f.d); f.y(-(py / innerHeight * 2 - 1) * f.d); });
      gsap.to(angle, { rx: -ny * D * k, ry: nx * D * k, duration: 0.5, ease: "power3.out", overwrite: true, onUpdate: () => gsap.set(tilt, { rotationX: angle.rx, rotationY: angle.ry }) });
    };
    document.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; if (!queued) { queued = true; requestAnimationFrame(apply); } });
    const bx = gsap.quickTo(tilt, "x", { duration: 0.6, ease: "power3.out" }), by = gsap.quickTo(tilt, "y", { duration: 0.6, ease: "power3.out" });
    box.style.pointerEvents = "auto";
    box.addEventListener("mouseenter", () => {
      if (full > 0.1) return;
      popsOut = true;
      wiggles.forEach((w) => w.kill());
      gsap.fromTo(pops, { scale: 0.5, autoAlpha: 0, rotation: (i, el) => +(el.dataset.r || 0) + 40 * gsap.utils.random([-1, 1]), yPercent: 40 },
        { scale: 1, autoAlpha: 1, rotation: (i, el) => +(el.dataset.r || 0), yPercent: 0, duration: 0.7, ease: "back.out(2.6)", stagger: { each: 0.07, from: "random" }, overwrite: true,
          onComplete: () => { wiggles = pops.map((p, i) => gsap.to(p, { rotation: `+=${i % 2 ? 4 : -4}`, duration: 1.4 + (i % 3) * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1 })); } });
    });
    box.addEventListener("mousemove", (e) => { const r = box.getBoundingClientRect(); bx(0.16 * (e.clientX - (r.left + r.width / 2)) * (1 - full)); by(0.16 * (e.clientY - (r.top + r.height / 2)) * (1 - full)); });
    box.addEventListener("mouseleave", () => { bx(0); by(0); hidePops(); });
  }

  /* ────────── Work band — the collage tilts up to 9° toward the mouse and each piece has a different depth (z). The band is fixed to the screen and flows horizontally by card count × .85 screens ────────── */
  const story = document.querySelector("[data-story]"), band = story.querySelector("[data-band]"), track = story.querySelector("[data-track]");
  const collage = story.querySelector("[data-collage]");
  collage.querySelectorAll("[data-z]").forEach((el) => gsap.set(el, { z: +el.dataset.z }));
  if (fine && !reduce) {
    const M = +(collage.dataset.maxRotate || 9), rx = gsap.quickTo(collage, "rotationX", { duration: 0.8, ease: "power3.out" }), ry = gsap.quickTo(collage, "rotationY", { duration: 0.8, ease: "power3.out" });
    story.addEventListener("pointermove", (e) => { ry((e.clientX / innerWidth * 2 - 1) * M); rx(-(e.clientY / innerHeight * 2 - 1) * M); });
    story.addEventListener("pointerleave", () => { rx(0); ry(0); });
  }
  const cases = [...story.querySelectorAll("[data-case]")];
  // When the card lands: white flash (.04s on → .7s off), the plate bounces to 1.035× · ±1.8° and settles with elastic (1.1, .3), and the stamp wipes in from the left (.32s)
  const stamps = cases.map((c) => c.querySelector(".case__stamp"));
  const shades = cases.map((c) => c.querySelector(".case__shade"));
  gsap.set(stamps, { clipPath: "inset(-40% 100% -40% 0%)" });
  gsap.set(shades, { autoAlpha: 0 });
  const facts = cases.map((c) => c.querySelectorAll(".case__services, .case__review, .case__teaser"));
  if (!reduce) facts.forEach((f) => gsap.set(f, { autoAlpha: 0, y: 18 }));
  const stamped = cases.map(() => false);
  const stamp = (i) => {
    if (stamped[i]) return;
    stamped[i] = true;
    const c = cases[i], r = i % 2 ? -1 : 1;
    gsap.timeline()
      .fromTo(c.querySelector(".case__flash"), { opacity: 0 }, { opacity: 1, duration: 0.04, ease: "power1.out", immediateRender: false }, 0)
      .to(c.querySelector(".case__flash"), { opacity: 0, duration: 0.7, ease: "power2.out" }, 0.08)
      .to(c, { scale: 1.035, rotation: -1.8 * r, duration: 0.07, ease: "power2.out" }, 0)
      .to(c, { scale: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1.1, 0.3)" }, 0.07)
      .to(stamps[i], { clipPath: "inset(-40% 0% -40% 0%)", duration: 0.32, ease: "power1.inOut" }, 0.12)
      .to(shades[i], { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.45)
      .to(facts[i], { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.08 }, 0.55);
  };
  if (reduce) cases.forEach((_, i) => stamp(i));
  else {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: band, start: "top top", end: () => "+=" + cases.length * innerWidth * 0.85, pin: true, scrub: true, invalidateOnRefresh: true,
      onUpdate: () => cases.forEach((c, i) => { const r = c.getBoundingClientRect(); if (r.left < innerWidth * 0.6) stamp(i); }) } });
    gsap.from(collage.querySelector(".collage__statement"), { opacity: 0, y: 40, duration: 1, ease: "expo.out", scrollTrigger: { trigger: band, start: "top 60%", once: true } });
    gsap.from(collage.querySelectorAll(".collage__tile, .collage__badges"), { opacity: 0, scale: 0.85, duration: 1, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: band, start: "top 70%", once: true } });
  }

  /* Work clouds — each layer moves opposite the mouse by its depth (6 · 16 · 34px), text rises */
  const projects = story.querySelector("[data-projects]");
  // Random order per photo (30ms steps) — on hover they float up in that order
  projects.querySelectorAll(".projects__shot").forEach((s) => s.style.setProperty("--i", Math.floor(Math.random() * 17)));
  const clouds = [...projects.querySelectorAll("[data-depth]")].map((c) => ({ x: gsap.quickTo(c, "x", { duration: 1, ease: "power3.out" }), y: gsap.quickTo(c, "y", { duration: 1, ease: "power3.out" }), d: +c.dataset.depth }));
  if (fine && !reduce) projects.addEventListener("pointermove", (e) => { const nx = e.clientX / innerWidth * 2 - 1, ny = e.clientY / innerHeight * 2 - 1; clouds.forEach((c) => { c.x(-nx * c.d); c.y(-ny * c.d); }); });
  if (!reduce && window.SplitText) (document.fonts?.ready || Promise.resolve()).then(() => {
    const parts = [...projects.querySelectorAll("[data-intro-chars]")].map((el) => SplitText.create(el, { type: "chars", mask: "chars", aria: "none" }));
    const tl = gsap.timeline({ paused: true });
    parts.forEach((s, i) => tl.from(s.chars, { yPercent: 140, rotate: 8, duration: 1.15, ease: "expo.out", stagger: 0.035 }, 0.12 * i));
    ScrollTrigger.create({ trigger: projects, start: "top 60%", once: true, onEnter: () => tl.play() });
  });

  /* ────────── Service drum — over 240svh the rows rotate around a cylinder (radius row height × 1.6), only the center row stays sharp, and the tiles left and right of that row pop out ────────── */
  const drum = document.querySelector("[data-drum]");
  const drumLines = [...drum.querySelectorAll("[data-line]")], tiles = [...drum.querySelectorAll("[data-tile]")];
  const drumState = { p: 0 };
  let activeLine = -1;
  const paintDrum = () => {
    const n = drumLines.length, at = drumState.p * (n - 1), step = parseFloat(getComputedStyle(drumLines[0]).fontSize) * 1.6 * 1.6, ang = 24;
    drumLines.forEach((l, i) => {
      const d = i - at, a = d * ang;
      gsap.set(l, { rotationX: -a, z: -step * (1 - Math.cos((a * Math.PI) / 180)) * 2, y: Math.sin((a * Math.PI) / 180) * step * 2.2, opacity: clamp(1 - Math.abs(d) * 0.68, 0.18, 1) });
    });
    const now = Math.round(at);
    if (now !== activeLine) {
      activeLine = now;
      tiles.forEach((t) => {
        const on = +t.dataset.tile === now, side = t.dataset.side === "l" ? -1 : 1;
        gsap.to(t, on ? { scale: 1, autoAlpha: 1, rotation: side * 4, x: 0, duration: 0.7, ease: "back.out(1.7)", overwrite: true } : { scale: 0.6, autoAlpha: 0, rotation: side * 14, x: side * 40, duration: 0.35, ease: "power2.in", overwrite: true });
      });
    }
  };
  gsap.set(tiles, { scale: 0.6, autoAlpha: 0 });
  if (reduce) { drumState.p = 0; paintDrum(); }
  else {
    gsap.to(drumState, { p: 1, ease: "none", scrollTrigger: { trigger: drum.querySelector(".drum__track"), start: "top top", end: "bottom bottom", scrub: 0.6 }, onUpdate: paintDrum });
    paintDrum();
  }

  /* ────────── Studio — photo tilts up to 14° toward the cursor and is magnetically pulled, a badge pops on at a random angle ────────── */
  const studio = document.querySelector("[data-studio-3d]");
  const magnet = studio.querySelector(".studio__magnet"), tiltEl = studio.querySelector(".studio__tilt"), seals = [...studio.querySelectorAll(".studio__seal")];
  // Badge — from its own depth (z) and angle (r) at .4x and transparent, when it reaches 75% of the screen it stands up with .6s back.out(2.2) stagger .07.
  if (!reduce) {
    seals.forEach((el) => gsap.set(el, { z: +(el.dataset.z || 0), rotation: +(el.dataset.r || 0), scale: 0.4, autoAlpha: 0 }));
    ScrollTrigger.create({ trigger: studio, start: "top 75%", once: true, onEnter: () => gsap.to(seals, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(2.2)", stagger: 0.07 }) });
    // Photo — rests tilted 4° by default, tilts up to 14° toward the cursor (.7s) and is pulled like a magnet (.8s)
    if (fine) {
      const M = +(studio.dataset.maxRotate || 14);
      gsap.set(tiltEl, { rotation: 4, transformPerspective: 1200 });
      const rx = gsap.quickTo(tiltEl, "rotationX", { duration: 0.7, ease: "power3.out" }), ry = gsap.quickTo(tiltEl, "rotationY", { duration: 0.7, ease: "power3.out" }), rz = gsap.quickTo(tiltEl, "rotation", { duration: 0.9, ease: "power3.out" });
      const mx = gsap.quickTo(magnet, "x", { duration: 0.8, ease: "power3.out" }), my = gsap.quickTo(magnet, "y", { duration: 0.8, ease: "power3.out" });
      const zone = document.querySelector("#studio");
      zone.addEventListener("pointermove", (e) => {
        const r = studio.getBoundingClientRect(), nx = clamp((e.clientX - r.left - r.width / 2) / r.width, -1, 1), ny = clamp((e.clientY - r.top - r.height / 2) / r.height, -1, 1);
        ry(nx * M); rx(-ny * M); rz(4 - nx * 2); mx(nx * 18); my(ny * 18);
      });
      zone.addEventListener("pointerleave", () => { rx(0); ry(0); rz(4); mx(0); my(0); });
    }
  }

  /* ────────── Testimonial strip — drag to swipe, and on release it glides with inertia (speed × .35s). Without a pointer, it scrolls horizontally ────────── */
  const vc = document.querySelector("[data-vc]"), vtrack = vc.querySelector("[data-vc-track]");
  let vx = 0, drag = null;
  const bounds = () => Math.min(0, vc.clientWidth - vtrack.scrollWidth - 40);
  const setX = (x) => { vx = x; gsap.set(vtrack, { x }); };
  vc.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") return; drag = { x0: e.clientX, v0: vx, t: performance.now(), last: e.clientX, vel: 0, id: e.pointerId, held: false }; vc.classList.add("is-drag"); gsap.killTweensOf(vtrack); });
  vc.addEventListener("pointermove", (e) => { if (!drag) return; if (!drag.held && Math.abs(e.clientX - drag.x0) > 5) { drag.held = true; vc.setPointerCapture(drag.id); } const now = performance.now(); drag.vel = (e.clientX - drag.last) / Math.max(1, now - drag.t); drag.t = now; drag.last = e.clientX; setX(clamp(drag.v0 + e.clientX - drag.x0, bounds() - 80, 80)); });
  const release = () => { if (!drag) return; dragged = drag.held; const to = clamp(vx + drag.vel * 350, bounds(), 0); drag = null; vc.classList.remove("is-drag"); gsap.to(vtrack, { x: to, duration: 0.9, ease: "power3.out", onUpdate: () => { vx = gsap.getProperty(vtrack, "x"); } }); };
  vc.querySelectorAll(".vc__link").forEach((l) => {
    l.addEventListener("pointerenter", () => l.classList.add("is-on", "is-seen"));
    l.addEventListener("pointerleave", () => l.classList.remove("is-on"));
  });
  let dragged = false;
  vc.addEventListener("click", (e) => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
  vc.addEventListener("pointerup", release);
  vc.addEventListener("pointercancel", release);
  if (!reduce) gsap.from(vtrack.children, { opacity: 0, y: 60, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: vc, start: "top 80%", once: true } });

  /* ────────── Quick tour — on press glides to page end in 9s (original ‹Blitztour›), button at the end goes to top ────────── */
  const go = (to, dur) => { if (window.lenis) window.lenis.scrollTo(to, { duration: dur, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), force: true }); else scrollTo({ top: typeof to === "number" ? to : 0, behavior: "smooth" }); };
  document.querySelector("[data-tour-start]")?.addEventListener("click", () => go(document.querySelector(".footer__cta"), reduce ? 0 : 9));
  document.querySelector("[data-tour-again]")?.addEventListener("click", () => go(0, reduce ? 0 : 2.4));
})();
