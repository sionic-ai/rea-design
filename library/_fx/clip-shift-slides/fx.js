(() => {
  // The current section is pushed sideways and cut away from the opposite side, while the next section comes from the other side cut by the same amount and unfolds — both with the same length and curve
  kfFx.register("clip-shift-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2) return;
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const every = +(options.every ?? 5);
    const dur = reduce ? 0 : +(options.dur ?? 0.7);
    const shift = +(options.shift ?? 25);
    const cut = +(options.cut ?? 75);
    const ease = kfFx.ease(options.ease || "power3.in", "power3.in");
    const IN = { xPercent: -shift, clipPath: `inset(0% ${cut}% 0% 0%)` };
    const ON = { xPercent: 0, clipPath: "inset(0% 0% 0% 0%)" };
    const OUT = { xPercent: shift, clipPath: `inset(0% 0% 0% ${cut}%)` };
    let cur = 0, timer = 0, tl = null, seen = false;

    slides.forEach((s, k) => gsap.set(s, k === 0 ? ON : IN));
    const mark = () => {
      slides.forEach((s, k) => s.toggleAttribute("data-on", k === cur));
      dots.forEach((d, k) => d.toggleAttribute("data-on", k === cur));
    };
    const go = (n, back = false) => {
      n = ((n % slides.length) + slides.length) % slides.length;
      if (!Number.isFinite(n) || n === cur) return;
      tl?.progress(1);
      tl = gsap.timeline({ defaults: { duration: dur, ease } })
        .fromTo(slides[cur], ON, back ? IN : OUT, 0)
        .fromTo(slides[n], back ? OUT : IN, ON, 0);
      cur = n;
      mark();
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: n } }));
    };
    const stop = () => clearTimeout(timer);
    const play = () => {
      stop();
      if (every > 0 && !reduce && seen) timer = setTimeout(() => { go(cur + 1); play(); }, every * 1000);
    };
    const onDot = (e) => {
      const k = dots.indexOf(e.currentTarget);
      go(k, k < cur);
      play();
    };
    const onGo = (e) => {
      go(+e.detail?.index, !!e.detail?.back);
      play();
    };
    dots.forEach((d) => d.addEventListener("click", onDot));
    el.addEventListener("fx:go", onGo);
    // Do not flip while off screen
    const io = new IntersectionObserver(([en]) => {
      seen = en.isIntersecting;
      if (seen) play();
      else stop();
    });
    io.observe(el);
    mark();

    return () => {
      stop();
      io.disconnect();
      tl?.kill();
      dots.forEach((d) => { d.removeEventListener("click", onDot); d.removeAttribute("data-on"); });
      el.removeEventListener("fx:go", onGo);
      slides.forEach((s) => s.removeAttribute("data-on"));
      gsap.set(slides, { clearProps: "transform,clipPath" });
    };
  });
})();
