// Careers — photo collection: five photos fly in from below (the center one from further below) at 1.1x, and after .3s+.05s×distance settle into place with a .7s spring (bounce 0).
// After settling, each section floats at ±.5° · ±6px on a 4–8s cycle, and on hover that section goes 1.066x and up while the next one shifts aside (.35s spring)
(() => {
  const slots = [...document.querySelectorAll(".av-col__slot")];
  if (!slots.length) return;
  // Original position (x·y px, tilt in degrees) and how the next sheet steps aside on hover
  const REST = [{ x: 12, y: -52, r: 6.214 }, { x: -10, y: 40, r: -5.74 }, { x: -15, y: -46, r: 0.218 }, { x: -15, y: 48, r: -8.572 }, { x: -24, y: -36, r: 11.416 }];
  const NUDGE = [{ x: 36, r: -2 }, { x: 15, r: 2 }, { x: 15, r: -5 }, { x: 6, r: 5 }];
  const settle = avSpring({ visualDuration: 0.42, bounce: 0 });
  // The original framer spring (length .35 and .7, no bounce) finishes its visible motion at around .6
  const move = avSpring({ visualDuration: 0.21, bounce: 0 });
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = () => innerWidth < 768;
  const restOf = (i) => (narrow() ? { x: 0, y: 0, r: REST[i].r } : REST[i]);
  slots.forEach((s, i) => gsap.set(s, { x: restOf(i).x, y: restOf(i).y, rotation: restOf(i).r }));
  if (still) return;

  slots.forEach((s, i) => {
    const d = i - 2;
    const inner = s.querySelector(".av-col__card");
    gsap.fromTo(inner, { x: -100 * d, y: 500 + 400 * (d === 0 ? 1 : 0), rotation: -(2 * REST[i].r * d), scale: 1.1 },
      { x: 0, y: 0, rotation: 0, scale: 1, duration: settle.duration, ease: settle.ease, delay: 0.3 + 0.05 * Math.abs(d) });
    const float = s.querySelector(".av-col__float");
    const rnd = gsap.utils.random;
    gsap.fromTo(float, { rotation: -0.5 * Math.random(), y: -6 * Math.random() },
      { rotation: 0.5 * Math.random(), y: 6 * Math.random(), duration: rnd(4, 8), delay: Math.random(), repeat: -1, yoyo: true, repeatDelay: 0.5 * Math.random(), ease: "sine.inOut" });
  });

  let hovered = null;
  const place = () => {
    slots.forEach((s, i) => {
      const rest = restOf(i);
      let to = { x: rest.x, y: rest.y, rotation: rest.r, scale: 1, zIndex: 0 };
      if (hovered === i) to = { ...to, scale: 1.07, zIndex: 1 };
      else if (hovered != null && i === hovered + 1 && NUDGE[hovered] && !narrow()) to = { ...to, x: NUDGE[hovered].x, rotation: NUDGE[hovered].r };
      gsap.to(s, { ...to, duration: move.duration, ease: move.ease, overwrite: "auto" });
    });
  };
  slots.forEach((s, i) => {
    s.addEventListener("pointerenter", () => { hovered = i; place(); });
    s.addEventListener("pointerleave", () => { hovered = null; place(); });
    s.addEventListener("focusin", () => { hovered = i; place(); });
    s.addEventListener("focusout", () => { hovered = null; place(); });
  });
  addEventListener("resize", place);
})();
