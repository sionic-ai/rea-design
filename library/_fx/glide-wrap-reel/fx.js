// A horizontal strip of cells joined at their widths is pushed by a single GSAP tween — wheel and drag both overwrite it with a 1.5s power3.out tween of ‹add some px to the target›,
// The more you roll, the more the target piles up forward, and on release it glides then stops. Cell positions wrap by the band length with gsap.utils.wrap to join endlessly.
(() => {
  kfFx.register("glide-wrap-reel", (el, { options, reduce }) => {
    const itemsOf = () => [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!itemsOf().length) return;
    const wheelK = +(options.wheel ?? 10);
    const dragK = +(options.drag ?? 10);
    const dur = reduce ? 0 : +(options.dur ?? 1.5);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const auto = reduce ? 0 : +(options.auto ?? 0);
    const from = options.from || "item";
    const overlap = +(options.overlap ?? 0);
    const parallax = +(options.parallax ?? 0);
    const throttle = +(options.throttle ?? 30);
    const state = { scroll: +(options.start ?? 0) };
    let list = [];
    let total = 0;
    let viewW = el.clientWidth || innerWidth;
    let tween;
    let playing = false;

    const render = () => {
      let n = 0;
      for (const x of list) {
        const lo = from === "view" ? -viewW : -x.w;
        const pos = gsap.utils.wrap(lo, total + lo, n + state.scroll);
        gsap.set(x.it, { x: pos });
        if (x.inner && parallax) gsap.set(x.inner, { x: ((pos + x.w) / (x.w + viewW) - 0.5) * ((viewW / 1920) * -2 * parallax) });
        x.it.classList.toggle("is-fx-near", pos >= -1.1 * x.w && pos <= 1.1 * viewW);
        n += x.w - overlap;
      }
    };
    const measure = () => {
      viewW = el.clientWidth || innerWidth;
      list = itemsOf().map((it) => ({ it, inner: it.querySelector('[data-fx-part="inner"]'), w: it.offsetWidth }));
      total = list.reduce((s, x) => s + x.w, 0) - overlap * list.length;
      if (total > 0) render();
    };
    const to = (scroll, d = dur, e = ease) => {
      playing = false;
      tween = gsap.to(state, { scroll, duration: d, ease: e, overwrite: true, onUpdate: render });
      return tween;
    };
    const glide = (delta) => to(`-=${delta}`);
    const play = () => {
      if (!auto) return;
      playing = true;
      const step = () => {
        tween = gsap.to(state, { scroll: `-=${auto}`, duration: 1, ease: "none", overwrite: true, onUpdate: render, onComplete: () => playing && step() });
      };
      step();
    };
    const stop = () => to("-=0", reduce ? 0 : 0.1, "power3.out");
    const held = () => el.classList.contains("is-fx-hold");

    const onWheel = (e) => {
      if (held()) return;
      e.preventDefault();
      e.stopPropagation();
      glide(wheelK * e.deltaY + wheelK * e.deltaX);
    };
    let pressed = false;
    let moved = false;
    let prevX = 0;
    let lastMove = 0;
    let pendingX = null;
    let trail;
    const pointX = (e) => (e.pointerType === "mouse" ? e.screenX : e.pageX);
    const onDown = (e) => {
      if (held() || (e.pointerType === "mouse" && e.button !== 0)) return;
      pressed = true;
      moved = false;
      prevX = pointX(e);
      el.classList.add("is-fx-drag");
    };
    const step = (x) => {
      const dx = x - prevX;
      prevX = x;
      if (!dx) return;
      moved = true;
      glide(-dragK * dx);
    };
    const onMove = (e) => {
      if (!pressed || held()) return;
      const now = performance.now();
      if (now - lastMove >= throttle) {
        lastMove = now;
        step(pointX(e));
      } else {
        pendingX = pointX(e);
        clearTimeout(trail);
        trail = setTimeout(() => {
          if (pressed && pendingX !== null) {
            lastMove = performance.now();
            step(pendingX);
          }
          pendingX = null;
        }, throttle - (now - lastMove));
      }
    };
    const onUp = () => {
      if (!pressed) return;
      setTimeout(() => {
        pressed = false;
        el.classList.remove("is-fx-drag");
      }, 30);
    };
    const onClick = (e) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    };
    const onDragStart = (e) => e.preventDefault();
    const onBlur = () => stop();

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);
    addEventListener("blur", onBlur);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    measure();
    el.fxReel = { measure, render, glide, to, play, stop, get scroll() { return state.scroll; }, set scroll(v) { state.scroll = v; render(); }, get playing() { return playing; } };
    if (options.autoplay === "on") play();

    return () => {
      clearTimeout(trail);
      tween && tween.kill();
      gsap.killTweensOf(state);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
      removeEventListener("blur", onBlur);
      el.classList.remove("is-fx-drag");
      for (const x of list) {
        x.it.classList.remove("is-fx-near");
        gsap.set(x.it, { clearProps: "transform" });
        if (x.inner) gsap.set(x.inner, { clearProps: "transform" });
      }
      delete el.fxReel;
    };
  });
})();
