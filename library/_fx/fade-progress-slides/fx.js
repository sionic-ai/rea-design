(() => {
  // Slides stacked in one place switch to the next every each seconds — the new slide lands on top fading 0→1 over fade seconds, while the previous one stays beneath at 1 and turns off on the next frame.
  // On change, the new slide’s progress bar (fill) fills straight from 0 to 100% over each seconds. While hovered it does not advance, and on release it starts counting each seconds again.
  // While hovered, the current section’s photo (media) follows (cursor − photo bottom-right corner) × follow over in seconds, and returns over out seconds when released.
  kfFx.register("fade-progress-slides", (el, { options, reduce, hover }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const each = +(options.each ?? 3.6) * 1000, fade = +(options.fade ?? 0.6) * 1000, tick = (+options.tick || 0.25) * 1000;
    const ease = options.ease ? `cubic-bezier(${options.ease})` : "cubic-bezier(0.44, 0, 0.56, 1)";
    const follow = +(options.follow ?? 0.02), tin = +(options.in ?? 0.15), tout = +(options.out ?? 0.7);
    let now = 0, over = false, last = performance.now(), busy = 0, rect = null, raf = 0;
    const media = () => slides[now].querySelector('[data-fx-part="media"]');
    const settle = () => slides.forEach((s, i) => { s.style.transition = "none"; s.style.opacity = i === now ? "1" : "0"; s.style.zIndex = i === now ? "1" : "0"; s.style.pointerEvents = i === now ? "auto" : "none"; });
    const fill = (s) => {
      const f = s.querySelector('[data-fx-part="fill"]');
      if (!f || reduce) return;
      f.style.transition = "none";
      f.style.width = "0%";
      void f.offsetWidth;
      f.style.transition = `width ${each}ms linear`;
      f.style.width = "100%";
    };
    const go = () => {
      const prev = now;
      now = (now + 1) % slides.length;
      slides.forEach((s, i) => {
        s.style.transition = "none";
        if (i === now) { s.style.zIndex = "2"; s.style.pointerEvents = "auto"; s.style.opacity = "0"; void s.offsetWidth; s.style.transition = `opacity ${fade}ms ${ease}`; s.style.opacity = "1"; }
        else { s.style.zIndex = i === prev ? "1" : "0"; s.style.pointerEvents = "none"; s.style.opacity = i === prev ? "1" : "0"; }
      });
      fill(slides[now]);
      rect = null;
      last = performance.now();
      busy = last + fade + 60;
    };
    settle();
    fill(slides[now]);
    const timer = reduce || slides.length < 2 ? 0 : setInterval(() => {
      const t = performance.now();
      if (t < busy) return;
      if (!over && t - last >= each) go(); else settle();
    }, tick);

    const enter = () => { over = true; rect = media()?.getBoundingClientRect() ?? null; };
    const move = (e) => {
      if (!rect || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const m = media();
        if (!m || !rect) return;
        m.style.transition = `transform ${tin * 1000}ms ease-out`;
        m.style.transform = `translate(${(e.clientX - rect.width - rect.left) * follow}px, ${(e.clientY - rect.height - rect.top) * follow}px)`;
      });
    };
    const leave = () => {
      over = false; rect = null; last = performance.now();
      const m = media();
      if (m) { m.style.transition = `transform ${tout * 1000}ms ease-out`; m.style.transform = "translate(0px, 0px)"; }
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    if (hover && !reduce && follow) el.addEventListener("mousemove", move);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("mousemove", move);
      slides.forEach((s) => { s.style.cssText = ""; s.querySelectorAll('[data-fx-part="fill"],[data-fx-part="media"]').forEach((n) => { n.style.transition = ""; n.style.width = ""; n.style.transform = ""; }); });
    };
  });
})();
