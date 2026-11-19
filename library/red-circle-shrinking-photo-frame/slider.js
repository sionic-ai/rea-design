// Column slider: 3 per screen (1 at 767 and below) · 20px gap (15px) · red progress bar drag · arrows · drag by hand. The original uses the Swiper default .3s transition
(() => {
  document.querySelectorAll(".column-slider").forEach((root) => {
    const track = root.querySelector(".column__slide");
    const slides = [...track.children];
    const bar = root.querySelector(".scrollbar");
    const drag = bar.querySelector(".drag");
    const prev = root.querySelector(".prev");
    const next = root.querySelector(".next");
    let index = 0;
    const per = () => (matchMedia("(min-width: 768px)").matches ? 3 : 1);
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = () => slides[0].getBoundingClientRect().width + gap();
    const max = () => Math.max(0, slides.length - per());
    const dur = SW.reduced ? 0 : 0.3;
    const paint = (x) => {
      const p = max() ? -x / (step() * max()) : 0;
      const w = (per() / slides.length) * 100;
      drag.style.width = w + "%";
      drag.style.left = Math.min(1, Math.max(0, p)) * (100 - w) + "%";
    };
    const go = (i, d = dur) => {
      index = Math.max(0, Math.min(max(), i));
      const x = -index * step();
      gsap.to(track, { x, duration: d, ease: "power1.out", onUpdate: () => paint(gsap.getProperty(track, "x")) });
      prev.disabled = index === 0;
      next.disabled = index === max();
    };
    prev.addEventListener("click", () => go(index - 1));
    next.addEventListener("click", () => go(index + 1));

    // Drag by hand — on release it snaps to the nearest section
    let sx = 0, sxTrack = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
      sx = e.clientX; sxTrack = gsap.getProperty(track, "x"); moved = false;
      track.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const dx = ev.clientX - sx;
        if (Math.abs(dx) > 4) moved = true;
        gsap.set(track, { x: sxTrack + dx });
        paint(sxTrack + dx);
      };
      const up = () => {
        track.removeEventListener("pointermove", move);
        go(Math.round(-gsap.getProperty(track, "x") / step()));
      };
      track.addEventListener("pointermove", move);
      track.addEventListener("pointerup", up, { once: true });
    });
    track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);

    // Drag progress bar
    const fromBar = (clientX) => {
      const r = bar.getBoundingClientRect();
      const w = (per() / slides.length) * r.width;
      const p = Math.min(1, Math.max(0, (clientX - r.left - w / 2) / (r.width - w)));
      return p * max();
    };
    bar.addEventListener("pointerdown", (e) => {
      bar.setPointerCapture(e.pointerId);
      const move = (ev) => { const f = fromBar(ev.clientX); gsap.set(track, { x: -f * step() }); paint(-f * step()); };
      move(e);
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", () => { bar.removeEventListener("pointermove", move); go(Math.round(fromBar(e.clientX) && -gsap.getProperty(track, "x") / step())); }, { once: true });
    });
    addEventListener("resize", () => go(index, 0));
    go(0, 0);
  });
})();
