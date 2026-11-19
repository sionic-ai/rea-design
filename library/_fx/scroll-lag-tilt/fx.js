// Pushes the element the opposite way by the distance of one scroll move, then pulls it back late with a different elasticity per element, tilting slightly by that difference.
// The original cycles eight character personalities (elasticity · strength · rotation direction) in attach order — the point is that characters in the same line wobble differently
(() => {
  const TRAITS = [
    { lag: 0.12, amp: 0.35, dir: 1 }, { lag: 0.10, amp: 0.30, dir: -1 }, { lag: 0.14, amp: 0.40, dir: 1 }, { lag: 0.11, amp: 0.38, dir: -1 },
    { lag: 0.13, amp: 0.32, dir: 1 }, { lag: 0.09, amp: 0.36, dir: -1 }, { lag: 0.15, amp: 0.28, dir: 1 }, { lag: 0.11, amp: 0.42, dir: -1 },
  ];
  let order = 0;
  kfFx.register("scroll-lag-tilt", (el, { options, reduce, scroller }) => {
    const min = +(options.min ?? 769);
    if (reduce || innerWidth < min) return;
    const t = TRAITS[(options.trait != null ? +options.trait : order++) % TRAITS.length];
    const lag = +(options.lag ?? t.lag), amp = +(options.amp ?? t.amp), dir = +(options.dir ?? t.dir);
    const limit = +(options.max ?? 2.5);
    // The original sets the strength to .7 because laptop trackpads scroll less per swipe, and 1.2 otherwise
    const factor = +(options.factor ?? (/Mac/i.test(navigator.userAgent) ? 0.7 : 1.2));
    const rotAmp = 0.08 + Math.random() * 0.04;
    const src = scroller || window;
    const readY = () => (scroller ? scroller.scrollTop : scrollY);
    let lastY = readY(), lastTime = 0, y = 0, ty = 0, rot = 0, scrolling = false, timer = 0, raf = 0;
    const update = () => {
      let busy = false;
      if (scrolling || Math.abs(ty) > 0.1 || Math.abs(y) > 0.1 || Math.abs(rot) > 0.1) {
        busy = true;
        const diff = ty - y;
        y += diff * lag;
        rot += (diff * dir * rotAmp - rot) * lag * 1.2;
        if (!scrolling) { ty *= 0.85; rot *= 0.9; }
        if (Math.abs(y) < 0.1) y = 0;
        if (Math.abs(ty) < 0.1) ty = 0;
        if (Math.abs(rot) < 0.1) rot = 0;
        el.style.transform = `translateY(${y}px) rotate(${Math.min(Math.max(rot, -limit), limit)}deg)`;
      }
      raf = busy ? requestAnimationFrame(update) : 0;
    };
    const onScroll = () => {
      const now = Date.now();
      if (now - lastTime < 16) return;
      lastTime = now;
      const cur = readY(), delta = cur - lastY;
      lastY = cur;
      scrolling = true;
      clearTimeout(timer);
      timer = setTimeout(() => (scrolling = false), 150);
      if (Math.abs(delta) < 0.5) return;
      ty = -delta * amp * factor;
      if (!raf) raf = requestAnimationFrame(update);
    };
    el.style.transform = "translateY(0) rotate(0deg)";
    src.addEventListener("scroll", onScroll, { passive: true });
    return () => { src.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); clearTimeout(timer); el.style.transform = ""; };
  });
})();
