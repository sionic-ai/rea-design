// Pieces inside the panel gather into place on scroll (scrub) from their own scattered positions (reference width px — scales with screen width). Once all have gathered, is-fx-gathered is added to the panel
// Can float titles and text, and drops them when rewound. If scrolled past, it pins the end state, and if scrolled back above, the start state (so nothing is left half-way even on fast scrolls)
// If steps is given, per piece — it draws an arc, stepping cell by cell (steps(n)), and starts slightly later each (Brand pebble logo)
(() => {
  kfFx.register("scrub-gather", (el, { options, reduce, scroller }) => {
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (!pieces.length) return;
    const narrow = matchMedia("(max-width: 767px)").matches;
    const base = narrow ? +(options["base-sp"] || 376) : +(options.base || 1424);
    const k = () => innerWidth / base;
    const startPx = +(options.start ?? 250), length = +(options.length ?? 1050) || 1;
    const scrub = options.scrub != null ? +options.scrub : 2;
    const ease = options.ease ? kfFx.ease(options.ease, "power1.out") : "power1.out";
    const steps = Math.round(+(options.steps ?? 0));
    // data-key="x y" Or "x y | phone x phone y" — If there is no phone counterpart, multiply the same value by the phone base width
    const from = (p) => {
      const [wide, sp] = (p.dataset.key || "0 0").split("|").map((s) => s.trim().split(/\s+/).map(Number));
      const v = narrow && sp ? sp : wide;
      return { x: (v[0] || 0) * k(), y: (v[1] || 0) * k() };
    };
    if (reduce) { el.classList.add("is-fx-gathered"); return () => el.classList.remove("is-fx-gathered"); }

    if (steps > 1) {
      const each = +(options.each ?? 70), [arcLo, arcHi] = String(options.arc ?? "50 150").split(/\s+/).map(Number);
      const jitter = +(options.jitter ?? 4), spin = +(options.spin ?? 15), lean = +(options.lean ?? 0.5);
      const [sLo, sHi] = String(options.scrub ?? "0.1 1").split(/\s+/).map(Number);
      const tls = pieces.map((p, i) => {
        const f = from(p), ang = ((360 / pieces.length) * i + gsap.utils.random(-12, 12)) * Math.PI / 180, arc = gsap.utils.random(arcLo, arcHi ?? arcLo) * k();
        const path = (axis) => Array.from({ length: steps }, (_, n) => {
          if (n === steps - 1) return 0;
          const t = (n + 1) / steps, bow = Math.sin(t * Math.PI) * arc;
          return axis === "x" ? f.x * (1 - t) + bow * Math.cos(ang) * lean + gsap.utils.random(-jitter, jitter) * k() * lean
                              : f.y * (1 - t) + bow * Math.sin(ang) + gsap.utils.random(-jitter, jitter) * k();
        });
        gsap.set(p, { x: f.x, y: f.y });
        const tl = gsap.timeline({ scrollTrigger: {
          trigger: el, scroller, start: () => `${Math.round((startPx + i * each) * k())}px top`, end: () => `${Math.round((startPx + length) * k())}px top`,
          scrub: sHi != null && !Number.isNaN(sHi) ? gsap.utils.random(sLo, sHi, 0.2) : sLo, invalidateOnRefresh: true,
          onLeave: () => tl.progress(1), onLeaveBack: () => tl.progress(0) } });
        tl.fromTo(p, { x: f.x, y: f.y, rotation: 0 }, { duration: 6, keyframes: { x: path("x"), y: path("y"), rotation: Array.from({ length: steps }, (_, n) => (n === steps - 1 ? 0 : gsap.utils.random(-spin, spin))) }, ease: `steps(${steps})`, immediateRender: false });
        return tl;
      });
      const done = ScrollTrigger.create({ trigger: el, scroller, start: () => `${Math.round((startPx + length) * k())}px top`, onEnter: () => el.classList.add("is-fx-gathered"), onLeaveBack: () => el.classList.remove("is-fx-gathered") });
      return () => { tls.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); done.kill(); gsap.set(pieces, { clearProps: "transform" }); el.classList.remove("is-fx-gathered"); };
    }

    gsap.set(pieces, { x: (i, p) => from(p).x, y: (i, p) => from(p).y });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el, scroller, start: () => `${Math.round(startPx * k())}px top`, end: () => `+=${Math.round(length * k())}`, scrub, invalidateOnRefresh: true,
        onLeave: () => tl.progress(1), onLeaveBack: () => tl.progress(0),
      },
    });
    tl.fromTo(pieces, { x: (i, p) => from(p).x, y: (i, p) => from(p).y }, { x: 0, y: 0, duration: 1, ease, immediateRender: false }, 0);
    tl.call(() => el.classList.add("is-fx-gathered"), [], ">").call(() => el.classList.remove("is-fx-gathered"), [], 0);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set(pieces, { clearProps: "transform" }); el.classList.remove("is-fx-gathered"); };
  });
})();
