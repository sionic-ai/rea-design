// About page — photo band parallax (global parallax preset 20 → −20%), stair slider (center 60% · sides 13% · .65s power3.inOut)
(() => {
  if (!window.gsap) return;
  const { reduce } = window.RC;
  if (!reduce) {
    document.querySelectorAll('[data-parallax="trigger"]').forEach((t) => {
      gsap.fromTo(t.querySelector('[data-parallax="target"]') || t, { yPercent: 20 }, { yPercent: -20, ease: "none", scrollTrigger: { trigger: t, start: "clamp(top bottom)", end: "clamp(bottom top)", scrub: true } });
    });
  }
  // Original initCascadingSlider: the center cell is 60% of the width, cells shrunk by 13% each step attach on both sides like stairs, and on slide each cell’s position and clipping change over .65s
  const list = document.querySelector(".rc-cas__list");
  const items = [...list.querySelectorAll(".rc-cas__item")];
  const n = items.length;
  let active = 0, busy = false;
  const layout = (animate) => {
    const W = list.clientWidth, small = innerWidth < 768;
    const aw = W * (small ? 0.7 : 0.6), sw = W * (small ? 0.1 : 0.13), gap = W * 0.01;
    items.forEach((it, i) => {
      let off = i - active;
      if (off > n / 2) off -= n; if (off < -n / 2) off += n;
      const d = Math.abs(off), w = d === 0 ? aw : sw;
      const center = W / 2 + Math.sign(off) * (aw / 2 + gap + (d - 1) * (sw + gap) + sw / 2) * (d ? 1 : 0);
      const vis = d <= 2;
      it.classList.toggle("is-active", d === 0);
      const to = { x: center - aw / 2, width: aw, clipPath: `inset(0px ${(aw - w) / 2}px round 0px)`, autoAlpha: vis ? 1 : 0, zIndex: 10 - d };
      animate && !reduce ? gsap.to(it, { ...to, duration: 0.65, ease: "power3.inOut" }) : gsap.set(it, to);
    });
  };
  const go = (d) => {
    if (busy) return;
    busy = true;
    active = (active + d + n) % n;
    layout(true);
    gsap.delayedCall(reduce ? 0 : 0.65, () => (busy = false));
  };
  document.querySelectorAll(".rc-cas__btn").forEach((b) => b.addEventListener("click", () => go(+b.dataset.dir)));
  items.forEach((it, i) => it.addEventListener("click", () => { let d = i - active; if (d > n / 2) d -= n; if (d < -n / 2) d += n; if (d) go(Math.sign(d)); }));
  addEventListener("resize", () => layout(false));
  layout(false);
})();
