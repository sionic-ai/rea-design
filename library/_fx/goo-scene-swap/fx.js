// Two scenes are stacked, and a gooey filter (Gaussian blur + alpha threshold) melts the front scene’s text away in clumps while melting the back scene’s text into shape.
// Blur alone only smears the text into a haze — the alpha threshold (×n −m) must be raised together so the strokes fuse into a blob of ink and give the melting feel.
(() => {
  const BASE = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ";
  const SOLID = BASE + "1  0";
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  const filter = (svg, id) => {
    const f = document.createElementNS(NS, "filter");
    f.id = id;
    f.setAttribute("color-interpolation-filters", "sRGB");
    f.innerHTML = `<feGaussianBlur in="SourceGraphic" stdDeviation="0 0" result="blur"/><feColorMatrix in="blur" mode="matrix" values="${SOLID}" result="goo"/><feComposite in="SourceGraphic" in2="goo" operator="atop"/>`;
    svg.appendChild(f);
    return { blur: f.firstChild, matrix: f.children[1] };
  };

  kfFx.register("goo-scene-swap", (el, { options, reduce }) => {
    const first = el.querySelector('[data-fx-part="first"]'), second = el.querySelector('[data-fx-part="second"]');
    if (!first || !second) return;
    const melt = [...el.querySelectorAll('[data-fx-part="melt"]')];
    const soft = [...el.querySelectorAll('[data-fx-part="melt-soft"]')];
    const form = [...el.querySelectorAll('[data-fx-part="form"]')];
    const scrub = options.mode === "scrub";

    if (reduce) {
      gsap.set(el, { "--fx-p1": 0, "--fx-p2": 100 });
      return () => gsap.set(el, { clearProps: "--fx-p1,--fx-p2" });
    }

    const n = ++uid;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    el.appendChild(svg);
    const fm = filter(svg, `fx-goo-melt-${n}`), fs = filter(svg, `fx-goo-soft-${n}`), ff = filter(svg, `fx-goo-form-${n}`);
    melt.forEach((m) => (m.style.filter = `url(#fx-goo-melt-${n})`));
    soft.forEach((m) => (m.style.filter = `url(#fx-goo-soft-${n})`));
    form.forEach((m) => (m.style.filter = `url(#fx-goo-form-${n})`));

    const meltBlur = +(options["melt-blur"] ?? (scrub ? 8 : 45));
    const softBlur = +(options["soft-blur"] ?? (scrub ? 2 : 10));
    const meltCut = options["melt-cut"] || (scrub ? "50  -30" : "40  -20");
    const softCut = options["soft-cut"] || (scrub ? "8  -6" : "10  -4");
    const ease = options.ease || "power1.inOut";
    const events = (type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));
    const triggers = [];

    let tl;
    if (scrub) {
      // Original brand section — default 2s curve with only the blur stretched to 3s so the scene behind shows through before the text fully melts
      const dur = +(options.dur ?? 2), melt3 = dur * 1.5;
      gsap.set(el, { "--fx-p1": 100, "--fx-p2": 0 });
      tl = gsap.timeline({ paused: true, defaults: { duration: dur, ease } })
        .set(el, { "--fx-p1": 100, "--fx-p2": 0 })
        .set(second, { pointerEvents: "none" })
        .to(fm.blur, { duration: melt3, attr: { stdDeviation: `${meltBlur} ${meltBlur}` } })
        .to(fm.matrix, { duration: melt3, attr: { values: BASE + meltCut } }, "<")
        .to(fs.blur, { duration: melt3, attr: { stdDeviation: `${softBlur} ${softBlur}` } }, "<")
        .to(fs.matrix, { duration: melt3, attr: { values: BASE + softCut } }, "<")
        .to(el, { "--fx-p1": 0 }, "<")
        .to(el, { duration: melt3, "--fx-p2": 100 }, `-=${dur * 1.25}`)
        .set(second, { pointerEvents: "auto" }, "<");
      const len = +(options.length ?? 1);
      triggers.push(ScrollTrigger.create({ trigger: el, start: "top top", end: () => `+=${innerHeight * len}`, scrub: true, animation: tl, invalidateOnRefresh: true }));
    } else {
      const dur = +(options.dur ?? 1.2), at = +(options.at ?? 100);
      let step = 1, busy = false;
      gsap.set(el, { "--fx-p1": 100, "--fx-p2": 0 });
      // The 50px drop of the back scene and the Interaction blocking are applied when the timeline first runs (same as the original) — applying earlier shifts the back scene 50px off while idle
      gsap.set(ff.blur, { attr: { stdDeviation: `${softBlur} ${softBlur}` } });
      gsap.set(ff.matrix, { attr: { values: BASE + softCut } });
      tl = gsap.timeline({
        paused: true,
        defaults: { duration: dur, ease },
        onComplete: () => { busy = false; events("fx:done"); },
        onReverseComplete: () => { busy = false; events("fx:done"); },
      })
        .set(el, { "--fx-p1": 100, "--fx-p2": 0 })
        .set([fs.blur, fm.blur], { attr: { stdDeviation: "0 0" } })
        .set([fs.matrix, fm.matrix], { attr: { values: SOLID } })
        .set(ff.blur, { attr: { stdDeviation: `${softBlur} ${softBlur}` } })
        .set(ff.matrix, { attr: { values: BASE + softCut } })
        .set(second, { y: 50, pointerEvents: "none" })
        .to(fs.blur, { attr: { stdDeviation: `${softBlur} ${softBlur}` } })
        .to(fs.matrix, { attr: { values: BASE + softCut } }, "<")
        .to(fm.blur, { attr: { stdDeviation: `${meltBlur} ${meltBlur}` } }, "<")
        .to(fm.matrix, { attr: { values: BASE + meltCut } }, "<")
        .to(el, { "--fx-p1": 0 }, "<")
        .to(second, { y: 0, pointerEvents: "auto" }, "<")
        .to(ff.blur, { attr: { stdDeviation: "0 0" } }, "<")
        .to(ff.matrix, { attr: { values: SOLID } }, "<")
        .to(el, { duration: dur / 2, "--fx-p2": 100 }, `-=${dur / 2}`);
      // Once it passes, it runs to the end — fires fx:play to lock page scroll while it runs (the original stops Lenis at this point)
      triggers.push(ScrollTrigger.create({
        trigger: el, start: `top -${at}`,
        onEnter: () => { if (step === 2 || busy) return; busy = true; step = 2; events("fx:play"); tl.play(); },
        onLeaveBack: () => { if (step === 1 || busy) return; busy = true; step = 1; events("fx:play"); tl.reverse(0); },
      }));
      if (options.exit !== "off") {
        triggers.push(ScrollTrigger.create({
          trigger: el, start: () => `bottom bottom+=${innerHeight}`, invalidateOnRefresh: true,
          onEnter: () => { gsap.to(el, { duration: 0.4, "--fx-p2": 0 }); gsap.to(second, { duration: 0.8, y: -100 }); },
          onLeaveBack: () => { gsap.to(el, { duration: 0.4, "--fx-p2": 100 }); gsap.to(second, { duration: 0.4, y: 0 }); },
        }));
      }
    }

    return () => {
      triggers.forEach((t) => t.kill());
      tl.kill();
      gsap.killTweensOf([el, second]);
      [...melt, ...soft, ...form].forEach((m) => (m.style.filter = ""));
      gsap.set(el, { clearProps: "--fx-p1,--fx-p2" });
      gsap.set(second, { clearProps: "transform,pointerEvents" });
      svg.remove();
    };
  });
})();
