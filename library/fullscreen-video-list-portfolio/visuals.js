/* Video collection: screen-pinned channel switching (ScrollTrigger pin + snap) · noise effect on transition · name letter shuffle · live card.
   Original values: advance .38s power4.out · scanline from progress .88 in the preview range · parallax video y -28 and 1.05x · text fade .22s power2.out
   · snap .16~.38s power3.inOut · noise version .62× (480×270 ~ 854×480) · name shuffle 18ms interval·120~280ms. */
(() => {
  const { playVideo, scramble, reduce, lenis } = window.AL;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const list = $(".vs__list"), section = $(".vs__surf");
  const texts = $$("[data-text]"), slides = $$("[data-visual]"), lives = $$("[data-live]");
  const pairs = slides.map((visual, i) => ({ i, visual, media: $(".vs-slide__media", visual), video: $("video", visual), text: texts[i], name: $("[data-scramble]", texts[i]) }));
  const ZAP = 0.38, PRE = 0.88;
  let current = 0, zapping = false;

  // Overlay panel
  function makeFx() {
    const root = document.createElement("div");
    root.className = "vs-fx";
    root.innerHTML = '<canvas></canvas><div class="vs-fx__flash"></div><div class="vs-fx__scan"></div>' + '<div class="vs-fx__bar"></div>'.repeat(5);
    list.append(root);
    const canvas = $("canvas", root), ctx = canvas.getContext("2d"), flash = $(".vs-fx__flash", root), scan = $(".vs-fx__scan", root), bars = $$(".vs-fx__bar", root);
    let level = 0, tension = 0, running = false, raf = 0, buf = null, frame = 0;
    const size = () => {
      const w = Math.max(480, Math.min(854, (innerWidth * 0.62) | 0)), h = Math.max(270, Math.min(480, ((w * innerHeight) / innerWidth) | 0));
      if (buf && canvas.width === w && canvas.height === h) return;
      canvas.width = w; canvas.height = h;
      buf = ctx.createImageData(w, h);
    };
    const noise = () => { // Slightly misaligned red and blue over gray noise
      const d = buf.data, a = 25 + level * 130, chroma = 34 * level;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = Math.max(0, Math.min(255, v + (Math.random() - 0.5) * chroma));
        d[i + 1] = v;
        d[i + 2] = Math.max(0, Math.min(255, v - (Math.random() - 0.5) * chroma));
        d[i + 3] = Math.min(255, a * (0.28 + Math.random() * 0.72));
      }
      ctx.putImageData(buf, 0, 0);
      canvas.style.opacity = 0.28 + level * 0.55;
    };
    const tear = () => bars.forEach((b) => {
      if (Math.random() < 0.3 * level) {
        b.style.opacity = 0.3 + level * 0.55;
        b.style.top = Math.random() * 96 + "%";
        b.style.transform = `translate3d(${((Math.random() - 0.5) * 44 * level) | 0}px,0,0) skewX(${((Math.random() - 0.5) * 12 * level) | 0}deg)`;
      } else b.style.opacity = 0;
    });
    const sync = () => { scan.style.opacity = Math.max(tension, level) * 0.75; };
    const loop = () => {
      if (!running) return;
      if (level > 0.03) { noise(); if (++frame % 2 === 0 || level > 0.92) tear(); }
      sync();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => { level = 0; running = false; frame = 0; cancelAnimationFrame(raf); root.classList.remove("is-heavy"); canvas.style.opacity = 0; bars.forEach((b) => { b.style.opacity = 0; }); scan.style.opacity = tension * 0.75; };
    return {
      tension(v) { tension = Math.max(0, Math.min(1, v)); sync(); },
      level(v) {
        level = Math.max(0, Math.min(1, v));
        if (level > 0.03 && !running) { running = true; size(); root.classList.add("is-heavy"); loop(); }
        if (level <= 0.03) stop(); else sync();
      },
      flash() { gsap.fromTo(flash, { opacity: 0 }, { opacity: 0.45, duration: 0.05, ease: "power4.in", yoyo: true, repeat: 1 }); },
    };
  }
  const fx = reduce ? { tension() {}, level() {}, flash() {} } : makeFx();

  const parallax = (p, t) => gsap.set(p.media, { y: Math.max(0, Math.min(1, t)) * -28, scale: 1 + Math.max(0, Math.min(1, t)) * 0.05 });
  const rename = (p, from) => scramble(p.name, p.name.dataset.name, { stagger: 18, min: 120, max: 280, from: from || "" });
  function live(i) { lives.forEach((el, k) => { el.classList.toggle("is-active", k === i); const v = $("video", el); if (k === i) playVideo(v); else v.pause(); }); }

  function setActive(idx, force) {
    idx = Math.max(0, Math.min(pairs.length - 1, idx));
    if (!force && (idx === current || zapping)) return;
    const prev = pairs[current], next = pairs[idx];
    zapping = true;
    fx.level(1); fx.flash();
    parallax(prev, 0); parallax(next, 0);
    // Outgoing video: slides left, tilts, and fades
    prev.media.classList.add("is-zapping");
    prev.visual.classList.remove("is-on"); prev.visual.classList.add("is-out");
    gsap.to(prev.media, { x: -14, skewX: 6, scale: 1.02, filter: "contrast(1.4) saturate(0.3) brightness(1.2)", duration: 0.14, ease: "power3.in" });
    prev.video.pause();
    // Incoming video: tilted and blurred from the right → into place
    next.visual.classList.add("is-on");
    next.media.classList.add("is-zapping");
    gsap.set(next.media, { x: 16, y: 0, skewX: -5, scale: 1.08, filter: "contrast(1.5) brightness(1.4) blur(2px)" });
    playVideo(next.video);
    gsap.to(next.media, { x: 0, y: 0, skewX: 0, scale: 1, filter: "none", duration: ZAP, ease: "power4.out", onComplete: () => { next.media.classList.remove("is-zapping"); prev.media.classList.remove("is-zapping"); } });
    setTimeout(() => { prev.visual.classList.remove("is-out"); gsap.set(prev.media, { clearProps: "transform,filter" }); }, 140);
    // Letter
    gsap.to(prev.text, { opacity: 0, duration: 0.22, ease: "power2.out", onComplete: () => { prev.text.classList.remove("is-active"); gsap.set(prev.text, { visibility: "hidden" }); } });
    next.text.classList.add("is-active");
    gsap.set(next.text, { visibility: "visible" });
    gsap.fromTo(next.text, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
    rename(next, prev.name.dataset.name);
    live(idx);
    current = idx;
    pairs.forEach((p, i) => { if (i !== idx && p !== prev) { p.visual.classList.remove("is-on", "is-out"); p.video.pause(); } });
    setTimeout(() => { fx.level(0); fx.tension(0); zapping = false; }, ZAP * 1000);
  }

  pairs[0].text.classList.add("is-active");
  pairs[0].visual.classList.add("is-on");
  playVideo(pairs[0].video);
  rename(pairs[0], "");
  live(0);

  const total = pairs.length;
  if (window.ScrollTrigger && total > 1) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: section, start: "top top", end: () => "+=" + (total - 1) * innerHeight, pin: true, anticipatePin: 1,
      snap: reduce ? undefined : { snapTo: (v) => { const step = 1 / (total - 1); return Math.round(v / step) * step; }, duration: { min: 0.16, max: ZAP }, ease: "power3.inOut" },
      onUpdate(self) {
        if (zapping) return;
        const raw = self.progress * (total - 1), seg = Math.min(total - 1, Math.floor(raw + 0.0001));
        const local = seg >= total - 1 ? 0 : raw - seg;
        pairs.forEach((p, i) => { if (i === seg) parallax(p, local); else if (i !== current) parallax(p, 0); });
        fx.tension(local > PRE ? ((local - PRE) / (1 - PRE)) * 0.35 : 0);
        const target = Math.min(total - 1, Math.round(raw));
        if (target !== current) setActive(target);
      },
    });
    if (lenis) lenis.on("scroll", ScrollTrigger.update);
    addEventListener("load", () => ScrollTrigger.refresh());
  }

  // Live card → overlay: the original builds and attaches the overlay DOM on press — frame and button switch on a beat later (measured in the original at 88~136ms) with no curve
  const tpl = $("template[data-overlay]"), watch = $(".vs-live__watch");
  let overlay = null;
  const closeOverlay = () => {
    if (!overlay) return;
    const el = overlay; overlay = null;
    const v = $("video", el); if (v) v.pause();
    el.classList.remove("is-open");
    setTimeout(() => el.remove(), 300);
    if (lenis) lenis.start();
  };
  const openOverlay = () => {
    if (overlay || !tpl) return;
    overlay = tpl.content.firstElementChild.cloneNode(true);
    const parts = [$(".vs-overlay__dialog", overlay), $(".vs-overlay__frame", overlay), $(".vs-overlay__close", overlay)];
    parts.forEach((x) => { x.style.opacity = 0; });
    document.body.append(overlay);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => parts.forEach((x) => { x.style.willChange = "opacity"; })); // One frame off after attaching, so the moment it turns on reads as a change
    setTimeout(() => { parts.forEach((x) => { x.style.opacity = ""; }); if (overlay) { playVideo($("video", overlay)); $(".vs-overlay__close", overlay).focus(); } }, 45);
    $(".vs-overlay__close", overlay).addEventListener("click", closeOverlay);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });
    if (lenis) lenis.stop();
  };
  watch.addEventListener("click", (e) => { e.preventDefault(); openOverlay(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay) { e.stopImmediatePropagation(); closeOverlay(); } }, true);
})();
