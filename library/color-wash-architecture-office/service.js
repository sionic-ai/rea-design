// Services: slide photos inside the accordion (Webflow slider — arrows push it over for .5s), before/after compare handle (dragging cuts the front photo)
(() => {
  const { E } = window.msMotion;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  $$("[data-slider]").forEach((sl) => {
    const slides = $$(".ms-svc-slider__slide", sl);
    if (slides.length < 2) return;
    let i = 0, busy = false;
    gsap.set(slides, { x: 0, xPercent: (k) => (k === 0 ? 0 : 100) });
    const go = (dir) => {
      if (busy) return;
      busy = true;
      const cur = slides[i];
      i = (i + dir + slides.length) % slides.length;
      const nxt = slides[i];
      gsap.set(nxt, { xPercent: dir * 100 });
      gsap.to(cur, { xPercent: -dir * 100, duration: 0.5, ease: E.ease });
      gsap.to(nxt, { xPercent: 0, duration: 0.5, ease: E.ease, onComplete: () => { busy = false; } });
    };
    $(".is-left", sl)?.addEventListener("click", () => go(-1));
    $(".is-right", sl)?.addEventListener("click", () => go(1));
  });

  $$("[data-before-after]").forEach((ba) => {
    const bar = $(".ms-ba__bar", ba);
    if (!bar) return;
    let drag = false;
    const at = (x) => {
      const r = ba.getBoundingClientRect();
      const p = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
      ba.style.setProperty("--ms-ba", p + "%");
    };
    bar.addEventListener("pointerdown", (e) => { drag = true; bar.setPointerCapture(e.pointerId); bar.style.cursor = "grabbing"; });
    bar.addEventListener("pointermove", (e) => { if (drag) at(e.clientX); });
    bar.addEventListener("pointerup", () => { drag = false; bar.style.cursor = ""; });
    ba.addEventListener("click", (e) => { if (e.target === ba || e.target.closest(".ms-ba__side")) at(e.clientX); });
  });
})();
