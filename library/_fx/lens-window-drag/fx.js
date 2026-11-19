(() => {
  // One OS window — when visible it pops out from .8x and transparent in .12s power4.out, and dragging the title bar moves it (the pressed window comes to the front).
  // The lens plate inside the window body is always aligned to the top left of the plate where the window sits (offsetParent), so when the window is dragged the image inside stays put and only the window passes over (offset by ±shift/2 px)
  let top = 0;
  kfFx.register("lens-window-drag", (el, { options, reduce, hover }) => {
    const bar = el.querySelector('[data-fx-part="bar"]') || el;
    const lens = el.querySelector('[data-fx-part="lens"]');
    const shift = +(options.shift ?? 20);
    const delay = +(options.delay ?? 0);
    const dur = +(options.dur ?? 0.12);
    const from = +(options.from ?? 0.8);
    const ease = kfFx.ease(options.ease || "", "power4.out");
    const jitter = { x: (Math.random() - 0.5) * shift, y: (Math.random() - 0.5) * shift };
    const pos = { x: 0, y: 0 };
    const place = () => {
      if (!lens || !lens.parentElement) return;
      const stage = (el.offsetParent || document.body).getBoundingClientRect();
      const box = lens.parentElement.getBoundingClientRect();
      gsap.set(lens, { x: stage.left - box.left + jitter.x, y: stage.top - box.top + jitter.y });
    };
    const ro = new ResizeObserver(place);
    ro.observe(el);
    if (el.offsetParent) ro.observe(el.offsetParent);
    place();

    let tween = null, io = null;
    if (options.pop !== "false" && !reduce) {
      gsap.set(el, { opacity: 0, scale: from });
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        tween = gsap.to(el, { opacity: 1, scale: 1, duration: dur, delay, ease, onComplete: place });
      }));
      io.observe(el);
    }

    let grab = null;
    const move = (e) => {
      if (!grab) return;
      pos.x = grab.x + e.clientX - grab.cx;
      pos.y = grab.y + e.clientY - grab.cy;
      gsap.set(el, { x: pos.x, y: pos.y });
      place();
    };
    const up = () => { grab = null; document.body.style.userSelect = ""; el.removeAttribute("data-dragging"); };
    const down = (e) => {
      el.style.zIndex = String(++top + 10);
      if (!hover || e.button !== 0 || e.target.closest("button, a, input")) return;
      grab = { x: pos.x, y: pos.y, cx: e.clientX, cy: e.clientY };
      document.body.style.userSelect = "none";
      el.setAttribute("data-dragging", "");
    };
    bar.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("scroll", place, { passive: true });
    return () => {
      bar.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("scroll", place);
      ro.disconnect(); io?.disconnect(); tween?.kill();
      gsap.set(el, { clearProps: "transform,opacity,zIndex" });
      if (lens) gsap.set(lens, { clearProps: "transform" });
    };
  });
})();
