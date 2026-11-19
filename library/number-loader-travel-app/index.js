// Home page — Hero video scene change, full-bleed photo parallax, partner card row drag and red bar
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero: after the loader, the video settles down from 1.1x, and the logo line, one-line text and vertical line turn on. The video slot alternates four scenes every 5 seconds over 1s
  const mv = document.querySelector(".ot-mv");
  if (mv) {
    document.addEventListener("ot:ready", () => mv.classList.add("is-ready"), { once: true });
    const scenes = [...mv.querySelectorAll(".ot-mv__scene")];
    let i = 0;
    if (!reduce && scenes.length > 1) setInterval(() => { scenes[i].classList.remove("is-on"); i = (i + 1) % scenes.length; scenes[i].classList.add("is-on"); }, 5000);
  }

  // Full-bleed photo — while it passes, the photo slowly rises within the band from −15% to 0
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-ot-parallax]").forEach((img) => {
        gsap.fromTo(img, { yPercent: -23 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
  }

  // Client card row — drag and it follows the hand, release and it slides with inertia (follow .1). The red bar below can also be dragged
  const rail = document.querySelector("[data-ot-rail]");
  if (rail) {
    const track = rail.querySelector("[data-ot-rail-track]");
    const bar = document.querySelector("[data-ot-rail-bar]");
    const knob = bar && bar.querySelector("b");
    let target = 0, cur = 0, max = 0, drag = null, moved = 0;
    const measure = () => { max = Math.max(0, track.scrollWidth - rail.clientWidth + parseFloat(getComputedStyle(rail).paddingLeft)); target = Math.min(max, Math.max(0, target)); };
    const clamp = (v) => Math.min(max, Math.max(0, v));
    const draw = () => {
      cur += (target - cur) * (reduce ? 1 : 0.1);
      if (Math.abs(target - cur) < 0.1) cur = target;
      track.style.transform = `translate3d(${-cur}px,0,0)`;
      if (knob && bar) knob.style.transform = `translate3d(${(bar.clientWidth - knob.offsetWidth) * (max ? cur / max : 0)}px,0,0)`;
      requestAnimationFrame(draw);
    };
    rail.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") return; drag = { x: e.clientX, t: target }; moved = 0; rail.classList.add("is-drag"); rail.setPointerCapture(e.pointerId); });
    rail.addEventListener("pointermove", (e) => { if (!drag) return; moved = Math.abs(e.clientX - drag.x); target = clamp(drag.t - (e.clientX - drag.x) * 1.5); });
    const up = () => { drag = null; rail.classList.remove("is-drag"); };
    rail.addEventListener("pointerup", up); rail.addEventListener("pointercancel", up);
    rail.addEventListener("click", (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener("scroll", () => { rail.scrollLeft = 0; });
    let kdrag = null;
    if (knob) {
      knob.addEventListener("pointerdown", (e) => { kdrag = { x: e.clientX, t: target }; knob.setPointerCapture(e.pointerId); e.stopPropagation(); });
      knob.addEventListener("pointermove", (e) => { if (!kdrag) return; const room = bar.clientWidth - knob.offsetWidth; target = clamp(kdrag.t + (e.clientX - kdrag.x) / room * max); });
      knob.addEventListener("pointerup", () => { kdrag = null; });
    }
    // Phone pages by swiping horizontally — vertical swipes are left to the page
    let touch = null;
    rail.addEventListener("touchstart", (e) => { touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: target, lock: 0 }; }, { passive: true });
    rail.addEventListener("touchmove", (e) => {
      if (!touch) return;
      const dx = e.touches[0].clientX - touch.x, dy = e.touches[0].clientY - touch.y;
      if (!touch.lock) touch.lock = Math.abs(dx) > Math.abs(dy) ? 1 : 2;
      if (touch.lock === 1) target = clamp(touch.t - dx);
    }, { passive: true });
    rail.addEventListener("touchend", () => { touch = null; });
    new ResizeObserver(measure).observe(track);
    addEventListener("resize", measure);
    measure();
    requestAnimationFrame(draw);
  }
})();
