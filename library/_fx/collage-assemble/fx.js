// Each piece reads --seq (ms) from its style and runs it via Web Animations — CSS doesn’t hide pieces first, so every piece stays visible even if the script fails
(() => {
  const OUT = "cubic-bezier(0.2, 0.72, 0.22, 1)";
  const KIND = {
    name: { duration: 810, easing: OUT, frames: [{ opacity: 0, clipPath: "inset(0 0 18%)", translate: "0 14px" }, { opacity: 1, clipPath: "inset(0)", translate: "0 0" }] },
    drop: { duration: 470, easing: "cubic-bezier(0.24, 0.68, 0.26, 1)", frames: [{ opacity: 0, transform: "translate(14px, -16px) rotate(-2.6deg) scale(0.95)", offset: 0 }, { opacity: 1, transform: "translate(0, 0) rotate(0.8deg) scale(1.008)", offset: 0.64 }, { opacity: 1, transform: "none", offset: 1 }] },
    press: { duration: 380, easing: "cubic-bezier(0.3, 1.5, 0.5, 1)", frames: [{ opacity: 0, scale: "0.84" }, { opacity: 1, scale: "1" }] },
    rise: { duration: 450, easing: OUT, frames: [{ opacity: 0, transform: "translateY(26px) scale(0.968)" }, { opacity: 1, transform: "none" }] },
    write: { duration: 340, easing: OUT, frames: [{ opacity: 0, transform: "translate(-5px, 4px)" }, { opacity: 1, transform: "none" }] },
    rule: { duration: 380, easing: OUT, frames: [{ scale: "0 1" }, { scale: "1 1" }] },
  };
  const PLACE = { duration: 400, easing: OUT, frames: [{ opacity: 0, transform: "translateY(10px) scale(0.985)" }, { opacity: 1, transform: "none" }] };

  kfFx.register("collage-assemble", (el, { options, reduce }) => {
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (reduce || !pieces.length) return;
    const rate = +options.rate || 1, delay = +(options.delay ?? 0) * 1000;
    const kindOf = (p) => KIND[p.getAttribute("data-key")] || PLACE;
    let io = null, hold = [];
    const runs = [];
    const play = () => {
      hold.forEach((a) => a.cancel());
      hold = [];
      pieces.forEach((p) => {
        const k = kindOf(p), seq = parseFloat(getComputedStyle(p).getPropertyValue("--seq")) || 0;
        runs.push(p.animate(k.frames, { duration: k.duration, easing: k.easing, delay: delay + seq * rate, fill: "both" }));
      });
    };
    if (options.on === "scroll") {
      // Until visible, hold at the first frame (hidden), start attaching when the panel reaches 80% of the screen.
      hold = pieces.map((p) => p.animate([kindOf(p).frames[0]], { duration: 0, fill: "forwards" }));
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { rootMargin: "0px 0px -20% 0px" });
      io.observe(el);
    } else play();
    return () => { io?.disconnect(); [...hold, ...runs].forEach((a) => a.cancel()); };
  });
})();
