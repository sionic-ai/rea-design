// Project detail — pin ring spread (1.2s In, repeating .2s apart), + icon −90°/−180° (.8s Out), draggable photo (inertia),
// Inner-things slider (covers from the side with clip, 1.5→1, 1.2s Ease) · construction carousel (swiper freeMode, speed 800) · video drawer
(() => {
  const LV = window.LV;
  const qa = (s, r) => [...r.querySelectorAll(s)];
  const pins = (root) => qa("[data-pin]", root).forEach((p) => {
    const r = p.offsetWidth, pulse = qa("[data-pin-pulse]", p), v = p.querySelector('[data-ico-plus="v"]');
    if (!LV.reduce && pulse.length) gsap.fromTo(pulse, { opacity: 1, width: r, height: r }, { opacity: 0, width: 2 * r, height: 2 * r, duration: LV.durL, ease: "In", stagger: 0.2, repeat: -1 });
    if (v) {
      p.addEventListener("mouseenter", () => gsap.fromTo(v, { rotate: 0 }, { rotate: -90, duration: LV.durM, ease: "Out", overwrite: true }));
      p.addEventListener("mouseleave", () => gsap.to(v, { rotate: -180, duration: LV.durM, ease: "Out", overwrite: true }));
    }
    p.addEventListener("click", () => { const o = !p.classList.contains("is-open"); qa("[data-pin].is-open", root).forEach((x) => x.classList.remove("is-open")); p.classList.toggle("is-open", o); });
  });
  const drag = (root) => qa("[data-drag-pan]", root).forEach((w) => {
    const img = w.firstElementChild;
    let x = 0, vx = 0, down = false, lx = 0, raf = 0;
    const max = () => Math.max(0, img.offsetWidth - w.offsetWidth);
    x = -max() / 2;
    const set = () => gsap.set(img, { x });
    set();
    const coast = () => { vx *= 0.94; x = gsap.utils.clamp(-max(), 0, x + vx); set(); if (Math.abs(vx) > 0.1) raf = requestAnimationFrame(coast); };
    w.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") return; down = true; lx = e.clientX; vx = 0; cancelAnimationFrame(raf); w.setPointerCapture(e.pointerId); });
    w.addEventListener("pointermove", (e) => { if (!down) return; vx = e.clientX - lx; lx = e.clientX; x = gsap.utils.clamp(-max(), 0, x + vx); set(); });
    const up = () => { if (!down) return; down = false; raf = requestAnimationFrame(coast); };
    w.addEventListener("pointerup", up); w.addEventListener("pointercancel", up);
    w.addEventListener("scroll", () => {}, { passive: true });
    if (matchMedia("(hover: none)").matches) { w.style.overflowX = "auto"; gsap.set(img, { x: 0 }); }
  });
  // Original initSlider — next covers from the right (inset 0 0 0 100%), previous from the left, and the front photo scales up to 1.5
  const slider = (root) => qa("[data-slider]", root).forEach((s) => {
    const slides = qa("[data-slider-slide]", s), imgs = qa("[data-slider-img]", s), cur = s.querySelector("[data-slider-current]");
    const R = "inset(0% 0% 0% 100%)", L = "inset(0% 100% 0% 0%)", F = "inset(0% 0% 0% 0%)";
    let i = 0, busy = false;
    gsap.set(slides, { clipPath: L }); gsap.set(slides[0], { clipPath: F });
    const go = (n, fwd) => {
      if (busy || n === i) return;
      busy = true;
      const prev = i; i = (n + slides.length) % slides.length;
      if (cur) cur.textContent = i + 1;
      slides[prev].style.zIndex = 1; slides[i].style.zIndex = 2;
      gsap.fromTo(imgs[prev], { scale: 1 }, { scale: 1.5, duration: LV.durL, ease: "Ease" });
      gsap.timeline().fromTo(slides[i], { clipPath: fwd ? R : L }, { clipPath: F, duration: LV.durL, ease: "Ease", onComplete: () => { slides[prev].style.zIndex = "auto"; slides[i].style.zIndex = 1; busy = false; } })
        .fromTo(imgs[i], { scale: 1.5 }, { scale: 1, duration: LV.durL, ease: "Ease" }, "<");
    };
    s.querySelector("[data-slider-next]")?.addEventListener("click", (e) => { e.stopPropagation(); go(i + 1, true); });
    s.querySelector("[data-slider-prev]")?.addEventListener("click", (e) => { e.stopPropagation(); go(i - 1, false); });
    s.addEventListener("click", () => go(i + 1, true));
    qa("[data-slide-go]", root).forEach((b) => b.addEventListener("click", () => { const n = +b.dataset.slideGo; go(n, n > i); }));
  });
  const carousel = (root) => qa("[data-carousel]", root).map((el) => {
    if (!window.Swiper) return null;
    const sec = el.closest(".section"), prog = sec.querySelector("[data-car-progress]"), cur = sec.querySelector("[data-car-current]");
    return new Swiper(el, {
      direction: "horizontal", freeMode: { enabled: true, momentum: true, momentumRatio: 1, momentumBounce: true, momentumBounceRatio: 1, sticky: false },
      slidesPerView: "auto", grabCursor: true, mousewheel: { forceToAxis: true }, speed: 800,
      navigation: { nextEl: sec.querySelector("[data-car-next]"), prevEl: sec.querySelector("[data-car-prev]") },
      on: { progress(sw, p) { if (prog) prog.style.width = 100 * p + "%"; }, slideChange(sw) { if (cur) cur.textContent = String(sw.activeIndex + 1).padStart(2, "0"); } },
    });
  });
  const reel = (root) => {
    const m = root.querySelector("[data-reel]"), b = root.querySelector("[data-reel-open]");
    if (!m || !b) return;
    const c = m.querySelector(".reel-c");
    b.addEventListener("click", () => { gsap.set(m, { display: "grid" }); gsap.fromTo(m, { opacity: 0 }, { opacity: 1, duration: LV.durM, ease: "Out" }); gsap.fromTo(c, { scale: 0.9 }, { scale: 1, duration: LV.durL, ease: "Out" }); LV.lock(); });
    const close = () => { gsap.to(m, { opacity: 0, duration: LV.durS, ease: "In", onComplete: () => gsap.set(m, { display: "none" }) }); LV.unlock(); };
    m.querySelector("[data-reel-close]").addEventListener("click", close);
    m.addEventListener("click", (e) => e.target === m && close());
  };
  LV.pages.project = (root) => {
    pins(root); drag(root); slider(root); reel(root);
    const sw = carousel(root);
    return () => sw.forEach((s) => s?.destroy?.());
  };
})();
