// First page — back video parallax, front video progress bar, photo strip flowing with scroll, special card size (elliptical fog slide is data-fade-group in shared.js)
(() => {
  const site = window.sfSite;
  const fv = document.getElementById("fv");
  const front = fv.querySelector(".ix-fv__front video");
  const back = fv.querySelector(".ix-fv__back");
  const backVideo = back.querySelector("video");
  const bar = fv.querySelector(".ix-fv__bar");

  // Photo band — adds scroll speed to the base speed 4 and settles it with friction .9. Reversing the scroll reverses the flow
  const slider = (() => {
    const box = document.querySelector("[data-loop-slider]");
    if (!box) return null;
    const track = box.querySelector(".ix-sep__track");
    const items = [...box.querySelectorAll(".ix-sep__items")];
    const s = { moveX: 0, targetX: 0, v: 0, tv: 0, dir: 1, dirSmooth: 1, width: 0 };
    const speed = 4, friction = 0.9, maxV = 50, interp = 0.2, maxDelta = 0.06, dirLerp = 0.25;
    const lerp = (a, b, t) => a * (1 - t) + b * t;
    const wrap = (x) => { const w = s.width; if (!w) return x; let r = (x + w) % (2 * w); if (r < 0) r += 2 * w; return r - w; };
    const resize = () => { s.width = items[0].getBoundingClientRect().width; track.style.marginLeft = -s.width + "px"; };
    new ResizeObserver(resize).observe(items[0]);
    resize();
    let lastY = scrollY;
    addEventListener("scroll", () => {
      const d = scrollY - lastY;
      lastY = scrollY;
      if (!d) return;
      s.dir = d > 0 ? -1 : 1;
      s.tv = Math.max(-maxV, Math.min(-d, maxV));
    }, { passive: true });
    return (dt) => {
      const e = 10 * Math.min(dt, maxDelta);
      s.tv *= friction;
      if (Math.abs(s.tv) < 0.01) s.tv = 0;
      s.v = s.tv;
      s.dirSmooth = lerp(s.dirSmooth, s.dir, dirLerp);
      s.targetX += (speed * s.dirSmooth + s.v) * e;
      s.moveX = lerp(s.moveX, s.targetX, interp);
      track.style.transform = `translate3d(${wrap(s.moveX)}px,0,0)`;
    };
  })();

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) {
      [front, backVideo].forEach((v) => v?.pause());
      return;
    }
    // Only the back video is pushed 30% down while the Hero passes, so it follows later than the front window
    ScrollTrigger.create({
      trigger: fv,
      start: "top top",
      end: "bottom top",
      onUpdate: (st) => gsap.set(back, { yPercent: gsap.utils.interpolate(0, 30, st.progress) }),
      onEnterBack: () => { front.play().catch(() => {}); backVideo.play().catch(() => {}); },
      onLeave: () => { front.pause(); backVideo.pause(); },
    });

    // Special card — scales from .9 to 1 on entering, and back to .9 on leaving
    const card = document.querySelector(".ix-special__card");
    const cardVideo = card.querySelector("video");
    ScrollTrigger.create({
      trigger: card,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (st) => { if (document.body.dataset.menu !== "1") gsap.set(card, { scale: gsap.utils.interpolate([0.9, 1, 1, 0.9], st.progress) }); },
      onEnter: () => cardVideo.play().catch(() => {}),
      onEnterBack: () => cardVideo.play().catch(() => {}),
      onLeave: () => cardVideo.pause(),
      onLeaveBack: () => cardVideo.pause(),
    });
    gsap.set(card, { scale: 0.9 });

    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.max(1, now - last) / 1000;
      last = now;
      if (!site.isSp() && front.duration) bar.style.transform = `scale(1, ${front.currentTime / front.duration})`;
      slider?.(dt);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  });
})();
