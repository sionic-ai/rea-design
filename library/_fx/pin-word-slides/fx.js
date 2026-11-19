(() => {
  kfFx.register("pin-word-slides", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')].slice(0, slides.length);
    const fills = dots.map((d) => d.querySelector('[data-fx-part="fill"]'));
    const on = options.dot || "2.906em", off = options["dot-off"] || "5px";
    const dur = +(options.dur ?? 0.35), stagger = +(options.stagger ?? 0.01);
    const ease = kfFx.ease("0.65,0,0.35,1", "power2.inOut");
    const n = slides.length, box = slides[0].parentElement;
    let splits = [], current = 0, active = null, lastW = innerWidth;

    const measure = () => {
      gsap.set(slides, { autoAlpha: 1, position: "static" });
      const max = Math.max(...slides.map((s) => s.offsetHeight));
      gsap.set(slides, { clearProps: "position" });
      gsap.set(slides, { autoAlpha: 0 });
      box.style.height = max + "px";
    };
    const split = () => {
      splits.forEach((s) => s.revert());
      splits = slides.map((s) => SplitText.create(s, { type: "words", mask: "words" }));
      measure();
      splits.forEach((s, i) => { gsap.set(slides[i], { autoAlpha: i === current ? 1 : 0 }); gsap.set(s.words, { yPercent: i === current ? 0 : 100 }); });
      dots.forEach((d, i) => gsap.set(d, { width: i === current ? on : off }));
      fills.forEach((f, i) => f && gsap.set(f, { autoAlpha: i === current ? 1 : 0 }));
    };
    const snap = (i, show) => {
      gsap.killTweensOf([slides[i], splits[i].words, dots[i], fills[i]].filter(Boolean));
      gsap.set(slides[i], { autoAlpha: show ? 1 : 0 });
      gsap.set(splits[i].words, { yPercent: show ? 0 : 100 });
      if (dots[i]) gsap.set(dots[i], { width: show ? on : off });
      if (fills[i]) gsap.set(fills[i], { autoAlpha: show ? 1 : 0 });
    };
    const go = (next) => {
      if (next === current) return;
      const prev = current;
      current = next;
      active?.kill();
      for (let i = 0; i < n; i++) if (i !== next && i !== prev) snap(i, false);
      if (Math.abs(next - prev) > 1 || reduce) { snap(prev, false); snap(next, true); return; }
      gsap.set(slides[next], { autoAlpha: 1 });
      const tl = gsap.timeline({ onComplete: () => { if (current === next) { gsap.set(slides[prev], { autoAlpha: 0 }); gsap.set(splits[prev].words, { yPercent: 100 }); } active = null; } });
      active = tl;
      tl.to(splits[prev].words, { yPercent: -100, stagger, duration: dur, ease }, 0)
        .fromTo(splits[next].words, { yPercent: 100 }, { yPercent: 0, stagger, duration: dur, ease }, 0.1);
      if (dots[prev]) tl.to(dots[prev], { width: off, duration: 0.4, ease }, 0);
      if (dots[next]) tl.to(dots[next], { width: on, duration: 0.4, ease }, 0);
      if (fills[prev]) tl.to(fills[prev], { autoAlpha: 0, duration: 0.3, ease }, 0);
      if (fills[next]) tl.to(fills[next], { autoAlpha: 1, duration: 0.3, ease }, 0);
    };
    split();
    const seg = 1 / n;
    const st = ScrollTrigger.create({
      scroller, trigger: el, start: options.start || "top top", end: options.end || "bottom bottom", scrub: true,
      onUpdate: (self) => {
        const p = self.progress, i = Math.min(Math.floor(p / seg), n - 1), local = (p - i * seg) / seg;
        fills.forEach((f, k) => f && gsap.set(f, { scaleX: k < i ? 1 : k > i ? 0 : local }));
        if (i !== current) go(i);
      },
    });
    let t = 0;
    const ro = new ResizeObserver(() => { if (innerWidth === lastW && splits.length) return; lastW = innerWidth; clearTimeout(t); t = setTimeout(() => { active?.kill(); split(); }, 200); });
    ro.observe(el);
    return () => { st.kill(); ro.disconnect(); clearTimeout(t); active?.kill(); splits.forEach((s) => s.revert()); gsap.set([...slides, ...dots, ...fills.filter(Boolean)], { clearProps: "all" }); box.style.height = ""; };
  });
})();
