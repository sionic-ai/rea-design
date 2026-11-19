// On hover the button shifts 5px down-left (.3s), the text line slides up and the same text rises from below (.1s, the second line .05s later).
// Moving the mouse inside the button drags it, delayed by .6s, by the distance from center to cursor (within ±10px horizontally and vertically). On release it reverses and returns to rest.
(() => {
  kfFx.register("magnet-glitch-btn", (el, { options, reduce, hover }) => {
    const top = el.querySelector('[data-fx-part="top"]');
    const bot = el.querySelector('[data-fx-part="bot"]');
    if (reduce || !hover || !window.gsap) return;
    const shiftX = +(options.x ?? -5), shiftY = +(options.y ?? 5);
    const swap = +(options.swap ?? 0.1), lag = +(options.lag ?? 0.05), push = +(options.push ?? 0.3);
    const pull = +(options.pull ?? 10), follow = +(options.follow ?? 0.6);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    // css hides the lower line with translateY(100%) — set y to 0 so GSAP reads that value as y and doesn’t stack yPercent on top
    if (top || bot) gsap.set([top, bot].filter(Boolean), { y: 0 });
    if (bot) gsap.set(bot, { yPercent: 100, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(el, { x: shiftX, y: shiftY, duration: push, ease }, 0);
    if (top) tl.fromTo(top, { yPercent: 0, opacity: 1 }, { yPercent: -100, opacity: 0, duration: swap, ease }, 0);
    if (bot) tl.fromTo(bot, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: swap, ease }, lag);
    const clamp = gsap.utils.clamp(-pull, pull);
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = gsap.getProperty(el, "x") || 0, y = gsap.getProperty(el, "y") || 0;
      const cx = r.left - x + r.width / 2, cy = r.top - y + r.height / 2;
      gsap.to(el, { x: clamp(e.clientX - cx), y: clamp(e.clientY - cy), duration: follow, ease: "power3.out", overwrite: "auto" });
    };
    const enter = () => tl.play();
    const leave = () => { tl.reverse(); gsap.to(el, { x: 0, y: 0, duration: follow, ease: "power3.out", overwrite: "auto" }); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      tl.kill();
      gsap.killTweensOf(el);
      gsap.set([el, top, bot].filter(Boolean), { clearProps: "transform,opacity" });
    };
  });
})();
