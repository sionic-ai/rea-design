// Project detail: the black head cover lifts at .4s, and photo cells turn on in .6s when they enter the screen. The main film plays on press (waveform progress line), and photos enlarge on press (veil .3s)
(() => {
  const PD = window.PD;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const init = () => {
    const cover = document.querySelector(".pd-phero__cover");
    if (cover) gsap.to(cover, { opacity: 0, duration: reduce ? 0 : 0.4, delay: 0.05, ease: "power2.out", onComplete: () => { cover.style.display = "none"; } });
    // Passing the header, name and meta rise slightly and fade (original projectHeaderFade: from when the header’s bottom edge passes screen bottom +20%)
    const text = document.querySelector(".pd-phero__text");
    if (text && !reduce) gsap.to(text, { opacity: 0, yPercent: -6, ease: "none", scrollTrigger: { trigger: ".pd-phero", start: "bottom bottom+=20%", end: "bottom top", scrub: true } });
    // Cursor text — starts at the screen center. When the cursor is inside the head, the text’s top-left follows, offset from the cursor by 24/1512 of the width, at .2s power3.out,
    // (confined within the header box) hides in .25s when outside the header or when the body covers the header
    const hero = document.querySelector(".pd-phero"), cur = document.querySelector(".pd-phero__cursor"), label = cur?.firstElementChild;
    if (hero && cur && label) {
      gsap.set(cur, { x: innerWidth / 2, y: innerHeight / 2 });
      const qx = gsap.quickTo(cur, "x", { duration: reduce ? 0 : 0.2, ease: "power3.out" }), qy = gsap.quickTo(cur, "y", { duration: reduce ? 0 : 0.2, ease: "power3.out" });
      // The header is fixed so the box is always on screen — before the body fully covers the header (scroll < follows only head height)
      let onHero = true, inside = true, px = -1, py = -1;
      const show = () => gsap.to(cur, { opacity: onHero && inside ? 1 : 0, duration: reduce ? 0 : 0.25, ease: "power2.out", overwrite: "auto" });
      // Text is centered on the point by CSS, so the point = Offset top left + half text size
      const place = (x, y) => {
        const r = hero.getBoundingClientRect(), b = label.getBoundingClientRect(), o = (24 / 1512) * innerWidth;
        const isIn = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        if (isIn !== inside) { inside = isIn; show(); }
        if (!isIn || !onHero) return;
        qx(Math.max(r.left, Math.min(x + o, r.right - b.width)) + b.width / 2);
        qy(Math.max(r.top, Math.min(y + o, r.bottom - b.height)) + b.height / 2);
      };
      addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; place(px, py); }, { passive: true });
      addEventListener("scroll", () => { if (px >= 0) place(px, py); }, { passive: true });
      ScrollTrigger.create({ trigger: ".pd-pbody", start: "top top", onEnter: () => { onHero = false; show(); }, onLeaveBack: () => { onHero = true; show(); if (px >= 0) place(px, py); } });
      hero.querySelector(".pd-phero__hit")?.addEventListener("click", () => cur.querySelector("[data-fx]")?.fxPixelChars?.hide());
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); gsap.to(e.target, { opacity: 1, duration: reduce ? 0 : 0.6, ease: "power2.out" }); } }), { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll("[data-media]").forEach((n) => io.observe(n));
    // Main feature — on press to play, the front waveform fills over 30 seconds (progress of the placeholder video)
    const player = document.querySelector(".pd-player"), front = player?.querySelector(".pd-player__wave.is-front"), btn = player?.querySelector(".pd-player__play");
    if (player && front) {
      const run = gsap.to(front, { clipPath: "inset(0% 0% 0% 0%)", duration: 30, ease: "none", paused: true });
      const toggle = () => { run.paused() ? run.play() : run.pause(); btn.setAttribute("aria-label", run.paused() ? "Play" : "Pause"); };
      btn.addEventListener("click", toggle);
      player.querySelector(".wf-img").addEventListener("click", toggle);
      player.querySelector(".pd-player__track").addEventListener("click", (e) => { const r = e.currentTarget.getBoundingClientRect(); run.progress((e.clientX - r.left) / r.width); });
    }
    // Enlarged view
    document.querySelectorAll(".pd-media-item:not(.pd-player)").forEach((it) => {
      const box = it.querySelector(".pd-media-item__box"), veil = it.querySelector(".pd-lightbox"), close = it.querySelector(".pd-lightbox__close");
      let flip = null;
      const open = () => {
        const r = box.getBoundingClientRect(), s = Math.min((innerWidth * 0.84) / r.width, (innerHeight * 0.84) / r.height);
        it.classList.add("is-big");
        PD.lenis.stop();
        flip = gsap.timeline({ defaults: { duration: reduce ? 0 : 0.5, ease: "power3.out" } })
          .to([veil, close], { opacity: 1, duration: reduce ? 0 : 0.3 }, 0)
          .to(box, { x: innerWidth / 2 - (r.left + r.width / 2), y: innerHeight / 2 - (r.top + r.height / 2), scale: s }, 0);
      };
      const shut = () => { flip?.reverse(); flip?.eventCallback("onReverseComplete", () => { it.classList.remove("is-big"); gsap.set(box, { clearProps: "transform" }); PD.lenis.start(); }); };
      it.querySelector(".pd-media-item__open").addEventListener("click", () => (it.classList.contains("is-big") ? shut() : open()));
      veil.addEventListener("click", shut);
      close.addEventListener("click", shut);
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
