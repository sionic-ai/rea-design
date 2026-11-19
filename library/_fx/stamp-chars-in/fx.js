(() => {
  // When a line of brush lettering reaches the 80% line of the screen, the letters are stamped into place one by one — lifted, pressed, tilted — with no in-between values (set).
  // Per step ‹type start end› (seconds) — lift rises up and tilts 4° then settles, press is pushed down −6°→ half height −4° → back in place,
  // tilt tilts 6° and stands back up. - leaves it still. If there are more letters than sequence steps, the same sequence repeats from .1s after the last end
  const BRAND = "lift 0 .3, lift .2 .6, -, press .6 1.2, tilt .9 1.2, tilt 1.2 1.5, -, -, lift 1.6 1.9, lift 1.8 2.2";
  kfFx.register("stamp-chars-in", (el, { options, reduce, scroller }) => {
    const chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    if (!chars.length || reduce || !window.gsap) return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const sp = matchMedia("(max-width: 750px)").matches;
    const lift = sp ? +(options["lift-sp"] ?? options.lift ?? 0.35) : +(options.lift ?? 0.65);
    const seq = String(options.seq || BRAND).split(",").map((s) => s.trim().split(/\s+/));
    const span = Math.max(0, ...seq.filter((s) => s[0] !== "-").map((s) => +s[2] || +s[1] || 0)) + 0.1;
    gsap.set(chars, { transformOrigin: "50% 100%" });
    const start = options.start || "0% 80%";
    const tl = gsap.timeline(start === "none" || !window.ScrollTrigger ? {} : { scrollTrigger: { trigger: el, start, once: true, ...(scroller && { scroller }) } });
    chars.forEach((c, i) => {
      const [kind, a, b] = seq[i % seq.length];
      if (!kind || kind === "-") return;
      const off = Math.floor(i / seq.length) * span, t0 = +a + off, t1 = +(b ?? +a + 0.3) + off;
      if (kind === "lift") tl.set(c, { y: `-${lift}em`, rotate: 4 }, t0).set(c, { y: 0, rotate: 0 }, t1);
      else if (kind === "tilt") tl.set(c, { rotate: 6 }, t0).set(c, { rotate: 0 }, t1);
      else if (kind === "press") tl.set(c, { y: `${2 * lift}em`, rotate: -6 }, t0).set(c, { y: `${lift}em`, rotate: -4 }, (t0 + t1) / 2).set(c, { y: 0, rotate: 0 }, t1);
    });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set(chars, { clearProps: "transform" }); };
  });
})();
