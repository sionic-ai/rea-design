(() => {
  // One-screen panel: gathers wheel input to pull the panel up bit by bit (mouse wheel one notch 125px, trackpad deltaY × 2.5 clamped to ±35), and once it passes 30% of one cell height
  // Advances to the next cell (power2.out → expo.out blend, 700ms), if it can’t advance and rests 300ms it returns in place (cubic in-out, 620ms). While not advancing it follows 10% of the remaining distance each frame
  const cubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const blend = (t) => { const a = 1 - Math.pow(1 - t, 2), b = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t), w = Math.pow(t, 2.6); return a * (1 - w) + b * w; };
  kfFx.register("wheel-gather-snap", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const slides = () => Array.from(track.querySelectorAll(':scope > [data-fx-part="slide"]'));
    if (!slides().length) return;
    const step = +(options.step ?? 125), mul = +(options.pad ?? 2.5), padMax = +(options["pad-max"] ?? 35), pass = +(options.pass ?? 0.3);
    const idleMs = +(options.idle ?? 300), lerp = +(options.lerp ?? 0.1), next = +(options.next ?? 700), back = +(options.back ?? 620);
    let H = el.clientHeight || innerHeight, A = 0, P = 0, W = 0, anim = null, idle = 0, lock = 0, pad = false, raf = 0;
    const last = () => slides().length - 1;
    const report = () => { el.style.setProperty("--fx-index", W); el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: W } })); };
    const go = (i, ease, dur) => { clearTimeout(idle); W = Math.max(0, Math.min(last(), i)); anim = { from: A, to: W * H, t0: performance.now(), dur: reduce ? 1 : dur, ease }; P = anim.to; report(); };
    const frame = (now) => {
      if (anim) {
        const t = Math.min(1, (now - anim.t0) / Math.max(1, anim.dur));
        A = anim.from + (anim.to - anim.from) * anim.ease(t);
        if (t >= 1) { A = P; anim = null; }
      } else { A += (P - A) * lerp; if (Math.abs(P - A) < 1.2) A = P; }
      track.style.transform = `translate3d(0, ${-A}px, 0)`;
      raf = requestAnimationFrame(frame);
    };
    const wheel = (e) => {
      e.preventDefault();
      const now = performance.now();
      if (anim || now < lock) return;
      if (!pad && e.deltaMode === 0 && Math.abs(e.deltaX) >= 1) pad = true;
      const dir = e.deltaY > 0 ? 1 : -1;
      P = Math.max(0, Math.min(last() * H, P + (pad && e.deltaMode === 0 ? Math.max(-padMax, Math.min(padMax, e.deltaY * mul)) : dir * step)));
      const moved = P - W * H;
      if ((dir > 0 && moved >= pass * H && W < last()) || (dir < 0 && moved <= -pass * H && W > 0)) { go(W + dir, blend, next); lock = now + next + 50; }
      else { clearTimeout(idle); idle = setTimeout(() => { if (!anim) go(W, cubic, back); }, idleMs); }
    };
    const key = (e) => {
      if (anim || !el.matches(":hover, :focus-within") && document.activeElement !== document.body) return;
      if (["ArrowDown", "PageDown"].includes(e.key) && W < last()) { e.preventDefault(); go(W + 1, blend, next); }
      if (["ArrowUp", "PageUp"].includes(e.key) && W > 0) { e.preventDefault(); go(W - 1, blend, next); }
    };
    const ro = new ResizeObserver(() => { H = el.clientHeight || innerHeight; A = P = W * H; });
    ro.observe(el);
    el.addEventListener("wheel", wheel, { passive: false });
    addEventListener("keydown", key);
    raf = requestAnimationFrame(frame);
    report();
    return () => { cancelAnimationFrame(raf); clearTimeout(idle); ro.disconnect(); el.removeEventListener("wheel", wheel); removeEventListener("keydown", key); track.style.transform = ""; el.style.removeProperty("--fx-index"); };
  });
})();
