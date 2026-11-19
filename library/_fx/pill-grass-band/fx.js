(() => {
  // Gradient pill strip — at first every other pill is tilted ±tilt° and joined by a white thread, then once attached (or when it enters the screen)
  // The thread fades in from transparent 0→1 (1.2s) while shortening, the pill stands upright, and the strip slides to half of one set’s width (dur, sine.inOut).
  // Behind the line, half the width flows right over flow seconds, looping endlessly — the pill count must be a multiple of 16 so the pattern matches when joined at the half
  kfFx.register("pill-grass-band", (el, { options, reduce, scroller }) => {
    const count = Math.max(2, Math.round(+options.count || 64));
    let pills = [...el.querySelectorAll(':scope > [data-fx-part="pill"]')];
    const made = !pills.length;
    if (made) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        p.setAttribute("data-fx-part", "pill");
        p.setAttribute("aria-hidden", "true");
        frag.append(p);
      }
      el.append(frag);
      pills = [...el.querySelectorAll(':scope > [data-fx-part="pill"]')];
    }
    const tilt = +(options.tilt ?? 8), dur = +(options.dur ?? 2.4), flow = +options.flow || 70;
    const gapFrom = +(options["gap-from"] ?? 64), gap = +(options.gap ?? 25), thread = +(options.thread ?? 26), threadFrom = +(options["thread-from"] ?? 65);
    const ease = kfFx.ease(options.ease || "sine.inOut", "sine.inOut");
    const odd = pills.filter((_, i) => i % 2 === 0), even = pills.filter((_, i) => i % 2 === 1);
    const stood = { "--fx-thread": `${thread}px`, "--fx-tilt": "0deg", "--fx-thread-tilt": "0deg", "--fx-thread-on": 1 };
    let loop = null, tl = null, io = null, st = null;
    const startLoop = () => {
      loop = gsap.fromTo(el, { xPercent: -50 }, { xPercent: 0, duration: flow, ease: "none", repeat: -1 });
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? loop.play() : loop.pause()), { root: scroller && scroller !== window ? scroller : null });
      io.observe(el.parentElement || el);
    };
    if (reduce) {
      gsap.set(el, { xPercent: -50, columnGap: gap });
      gsap.set(pills, stood);
    } else {
      gsap.set(el, { xPercent: -100, columnGap: gapFrom });
      gsap.set(pills, { "--fx-thread": `${threadFrom}px`, "--fx-thread-on": 0 });
      gsap.set(odd, { "--fx-tilt": `${-tilt}deg`, "--fx-thread-tilt": `${tilt * 2}deg` });
      gsap.set(even, { "--fx-tilt": `${tilt}deg`, "--fx-thread-tilt": `${-tilt * 2}deg` });
      tl = gsap.timeline({ paused: true, delay: +(options.delay ?? 0), onComplete: startLoop });
      tl.to(el, { xPercent: -50, columnGap: gap, duration: dur, ease }, 0)
        .to(pills, { "--fx-thread-on": 1, duration: dur / 2, ease }, 0)
        .to(pills, { ...stood, duration: dur, ease }, 0);
      if (options.on === "scroll") {
        gsap.registerPlugin(ScrollTrigger);
        st = ScrollTrigger.create({ trigger: el.parentElement || el, ...(scroller && { scroller }), start: "top 80%", once: true, onEnter: () => tl.play() });
      } else tl.play();
    }
    return () => {
      st?.kill();
      tl?.kill();
      loop?.kill();
      io?.disconnect();
      gsap.set(el, { clearProps: "transform,columnGap" });
      gsap.set(pills, { clearProps: "--fx-thread,--fx-tilt,--fx-thread-tilt,--fx-thread-on" });
      if (made) pills.forEach((p) => p.remove());
    };
  });
})();
