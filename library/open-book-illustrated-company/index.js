// Hero order — appear delay values from the original Studio: book 4000ms (from 60px above), figures 4500~5000ms (30px below · vertical .9), all lasting 1s cubic-bezier(.9,0,.1,1).
// The vertical-writing sentence is a brush-calligraphy GIF that plays once in the original (.5s pause → 15 frames at 100ms writing → .3s pause → 17 frames erasing → .6s blank frame), so it writes and erases in the same beats.
(() => {
  CustomEase.create("nslio", "M0,0 C0.9,0 0.1,1 1,1");
  const intro = document.querySelector(".nsl-intro");
  const tate = intro.querySelector(".nsl-tate");
  const chars = NSL.splitChars(tate);
  const loop = tate.querySelector(".nsl-tate__loop path");
  const book = document.querySelectorAll('.hero [data-intro="book"]');
  const figs = document.querySelectorAll('.hero [data-intro="fig"]');
  const head = document.querySelector(".nsl-head");
  const done = () => {
    document.body.removeAttribute("data-intro");
    intro.remove();
    NSL.watch?.();
  };

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline({ onComplete: done });
    // Write: letters over the first 11 strokes (.6~1.6s), pen loops on strokes 8~15 (1.2~2.0s). Erase: from 2.3s, 17 strokes (until 4.0s)
    const at = (start, frames, i) => start + 0.1 * Math.ceil(((i + 1) * frames) / chars.length);
    chars.forEach((c, i) => tl.call(() => c.classList.add("is-on"), null, at(0.5, 11, i)));
    tl.fromTo(loop, { strokeDashoffset: 260 }, { strokeDashoffset: 0, duration: 0.8, ease: "steps(8)" }, 1.2);
    chars.forEach((c, i) => tl.call(() => c.classList.remove("is-on"), null, at(2.3, 16, i)));
    tl.to(loop, { strokeDashoffset: 260, duration: 1.7, ease: "steps(17)" }, 2.3);
    tl.fromTo(book, { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 1, ease: "nslio" }, 4.0);
    figs.forEach((g) => {
      tl.fromTo(g, { opacity: 0, y: 30, scaleY: 0.9, transformOrigin: "50% 100%" }, { opacity: 1, y: 0, scaleY: 1, duration: 1, ease: "nslio" }, 4.5 + Number(g.dataset.d) * 0.714);
    });
    tl.fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, 6.0);
    // The About section entrance is observed only after the book has settled
    tl.call(() => NSL.watch?.(), null, 4.6);
    return () => tl.kill();
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set([book, figs, head], { opacity: 1 });
    done();
  });
})();
