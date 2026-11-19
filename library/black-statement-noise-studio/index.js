// Review slider — loops endlessly like the original Framer slide: one cell 402px (panel 400 + gap 2) in 683ms (curve is the measured value as is), Prev always moves one cell to the right.
// Arrow presses down to .93 in .108s on press and returns in .12s (value measured from the original press curve)
(() => {
  const box = document.querySelector("[data-sc-quote]");
  if (!box) return;
  const track = box.querySelector("[data-sc-quote-track]");
  const real = [...track.children], n = real.length;
  const before = real.map((li) => { const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); return c; });
  const after = real.map((li) => { const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); return c; });
  track.prepend(...before);
  track.append(...after);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = window.CustomEase ? CustomEase.create("sc-slide", "M0,0 L0.1,0.18 0.2,0.43 0.3,0.62 0.4,0.74 0.5,0.82 0.6,0.88 0.7,0.92 0.8,0.95 0.9,0.96 1,1") : "power2.out";
  const step = () => real[0].getBoundingClientRect().width + 2;
  let i = n;
  gsap.set(track, { x: -i * step() });
  // Moving into the clone slot happens secretly just before the next slide — the spot where the slide ended stays as is, like the original.
  const go = (d) => {
    if (i < n) { i += n; gsap.set(track, { x: -i * step() }); } else if (i >= 2 * n) { i -= n; gsap.set(track, { x: -i * step() }); }
    i += d;
    gsap.to(track, { x: -i * step(), duration: reduce ? 0 : 0.683, ease, overwrite: true });
  };
  // Original press (spring) kept exactly as measured — press in 108ms · return 120ms
  const pressIn = window.CustomEase ? CustomEase.create("sc-press-in", "M0,0 L0.2,0.11 0.4,0.63 0.6,0.78 0.8,0.97 1,1") : "power2.out";
  const pressOut = window.CustomEase ? CustomEase.create("sc-press-out", "M0,0 L0.18,0.36 0.37,0.51 0.55,0.65 0.73,0.87 0.91,0.95 1,1") : "sine.out";
  const press = (btn, d) => {
    let down = null;
    btn.addEventListener("pointerdown", () => { down = gsap.to(btn, { scale: 0.93, duration: reduce ? 0 : 0.108, ease: pressIn, overwrite: true }); });
    const up = () => { if (!down) return; const t = down; down = null; t.then(() => gsap.to(btn, { scale: 1, duration: reduce ? 0 : 0.12, ease: pressOut })); };
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointerleave", up);
    btn.addEventListener("click", () => go(d));
  };
  press(box.querySelector("[data-sc-quote-prev]"), -1);
  press(box.querySelector("[data-sc-quote-next]"), 1);
  addEventListener("resize", () => gsap.set(track, { x: -i * step() }));
})();
