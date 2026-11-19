// Shared by all pages — Lenis 1.0.45 (same defaults as the original), three brush-stroke Lottie layers per navy window (play only when visible, the whole page counts the loop timing together),
// Three-layer parallax (−25·−20·−5% × 1.3 screens when scrolled to the bottom of the document), phone drawer, the move button slides once when it first enters the screen, divider 600ms, float-up 1s.
(() => {
  const root = document.documentElement, body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => innerWidth <= 768;

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis();
    window.ygLenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  addEventListener("fx:lock", () => lenis?.stop());
  addEventListener("fx:unlock", () => lenis?.start());

  // Brush stroke — original LottieLayer: the ring enters at the time counted from when the document opened (29.97fps, 240 frames) so several windows spin in the same tempo
  const born = performance.now();
  const at = (anim) => (((performance.now() - born) / 1000) * anim.frameRate) % anim.totalFrames;
  const windows = [];
  document.querySelectorAll("[data-lines]").forEach((box) => {
    const layers = [...box.querySelectorAll(".yg-lines__layer")];
    const w = { box, layers, anims: [], seen: false, live: false };
    windows.push(w);
    const arm = () => {
      if (w.anims.length) return;
      layers.forEach((layer, n) => {
        const anim = lottie.loadAnimation({ container: layer, renderer: "svg", loop: true, autoplay: false, animationData: ygLines.loop(n, { mobile: mobile() }), rendererSettings: { preserveAspectRatio: "none", progressiveLoad: false } });
        anim.addEventListener("DOMLoaded", () => { if (w.live && !reduce) anim.goToAndPlay(at(anim), true); else anim.goToAndStop(0, true); });
        w.anims.push(anim);
      });
      requestAnimationFrame(() => box.classList.add("is-on"));
    };
    new IntersectionObserver(([en]) => { if (en.isIntersecting) { arm(); } }, { rootMargin: "400px 0px" }).observe(box);
    new IntersectionObserver(([en]) => {
      w.live = en.isIntersecting;
      w.anims.forEach((a) => (w.live && !reduce ? a.goToAndPlay(at(a), true) : a.pause()));
    }, { threshold: 0 }).observe(box);
  });

  // Parallax — original useParallax: y = Progress (scrollY ÷ (document height − screen)) × speed% × 1.3 × screen height
  const speeds = (l) => +l.dataset.speed || 0;
  const parallax = () => {
    if (reduce) return;
    const vh = innerHeight, max = Math.max(1, root.scrollHeight - vh), p = Math.min(1, Math.max(0, scrollY / max));
    windows.forEach((w) => w.layers.forEach((l) => { l.style.transform = `translate3d(0, ${p * (speeds(l) / 100) * 1.3 * vh}px, 0)`; }));
    // Work board cover — 7% lower when entering from the bottom of the screen, 0 when leaving upward
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const r = el.getBoundingClientRect(), q = Math.min(1, Math.max(0, (vh - r.top) / (vh + (r.height || 1))));
      el.style.transform = `translate3d(0, ${((1 - q) * 7).toFixed(2)}%, 0)`;
    });
  };
  addEventListener("scroll", parallax, { passive: true });
  addEventListener("resize", parallax);
  lenis?.on("scroll", parallax);
  parallax();

  // Opening sequence: draws the eight white lines in the curtain once (70 frames) and, when done, notifies the frame part
  const draw = document.querySelector("[data-first-view]");
  if (draw && !reduce) {
    const hero = draw.closest("[data-fx~='frame-bars-intro']");
    const fv = lottie.loadAnimation({ container: draw, renderer: "svg", loop: false, autoplay: true, animationData: ygLines.firstView({ mobile: mobile() }), rendererSettings: { preserveAspectRatio: "none" } });
    fv.addEventListener("complete", () => hero?.dispatchEvent(new CustomEvent("fx:art-done")));
  }

  // Phone drawer
  const setMenu = (open) => {
    body.classList.toggle("is-menu-open", open);
    root.toggleAttribute("data-menu-open", open);
    document.querySelector(".yg-drawer")?.setAttribute("aria-hidden", String(!open));
    document.querySelectorAll("[data-menu-toggle]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
  };
  document.querySelectorAll("[data-menu-toggle]").forEach((b) => b.addEventListener("click", () => setMenu(!body.classList.contains("is-menu-open"))));
  document.querySelectorAll(".yg-drawer a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Row interaction response — original Framer layout motion: the row size changes at once (.is-on), and a transform unwinds from the old position and size to the new one (FLIP).
  // Vertical menu · notification row · move buttons use .5s cubic-bezier(.9,-.1,.45,1.05), footer underline uses .3s cubic-bezier(.44,0,.56,1)
  // Why WAAPI is used: the inverse transform is exact from the first frame, and if the direction reverses mid-spin it continues from the current pose.
  // The original Product draws one frame of the inverse transform first and releases it from the next frame, so the curve returning from below 0 (-.1) is almost one frame late — hold the inverse transform during an 8ms delay (16ms is one frame late and 0 is one frame early, value tuned by measuring)
  const slow = "cubic-bezier(.9, -.1, .45, 1.05)", soft = "cubic-bezier(.44, 0, .56, 1)";
  const flip = (line, on, dur, easing) => {
    if (line.classList.contains("is-on") === on) return;
    const a = line.getBoundingClientRect();
    line.getAnimations().forEach((x) => x.cancel());
    line.classList.toggle("is-on", on);
    const b = line.getBoundingClientRect();
    if (reduce || !b.width || !b.height) return;
    const dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
    line.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width}, ${a.height / b.height})` },
      { transform: "none" },
    ], { duration: dur * 1000, delay: 8, fill: "backwards", easing });
  };
  const hoverFlip = (sel, part, dur, ease) => document.querySelectorAll(sel).forEach((a) => {
    const line = a.querySelector(part);
    if (!line) return;
    // The original Framer draws the changed look in the frame after the interaction lands. Hooking it on the same frame lets in a look one frame ahead.
    a.addEventListener("mouseenter", () => requestAnimationFrame(() => flip(line, true, dur, ease)));
    a.addEventListener("mouseleave", () => requestAnimationFrame(() => { if (!a.classList.contains("is-hot")) flip(line, false, dur, ease); }));
  });
  hoverFlip(".yg-vlink", ".yg-vlink__line", 0.5, slow);
  hoverFlip(".yg-row", ".yg-row__line", 0.5, slow);
  hoverFlip(".yg-foot__a", ".yg-foot__line", 0.3, soft);
  // Move button — in the original, line width (40→200px) and text position change at once (measured, only width changes over length 0)
  const moreLine = (el, on) => el.querySelector(".yg-more__line")?.classList.toggle("is-on", on);
  document.querySelectorAll(".yg-more").forEach((a) => { a.addEventListener("mouseenter", () => moreLine(a, true)); a.addEventListener("mouseleave", () => moreLine(a, a.classList.contains("is-hot"))); });
  const hot = (el, on) => { el.classList.toggle("is-hot", on); moreLine(el, on || el.matches(":hover")); };

  // When lifted 200px above the screen bottom — the move button slides once and returns after 1.5s, dividers are drawn, float-up cells float up
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    const el = en.target;
    if (el.hasAttribute("data-slide-once")) { hot(el, true); setTimeout(() => hot(el, false), 1500); }
    else el.classList.add("is-in");
  }), { rootMargin: "0px 0px -200px 0px" });
  if (reduce) document.querySelectorAll("[data-line-reveal], [data-rise]").forEach((el) => el.classList.add("is-in"));
  else document.querySelectorAll("[data-slide-once], [data-line-reveal], [data-rise]").forEach((el) => io.observe(el));
})();
