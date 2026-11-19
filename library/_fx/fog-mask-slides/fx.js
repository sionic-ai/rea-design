// Overlapping photos alternate through a mist mask — after resting wait seconds, the front sheet’s mist mask lifts from top right to bottom over fade seconds,
// The next sheet settles from zoom times to 1 in settle seconds. After settle seconds it counts wait again. Rests when off screen
(() => {
  kfFx.register("fog-mask-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll(':scope > [data-fx-part="slide"]')];
    if (!slides.length) return;
    let cur = Math.max(0, slides.findIndex((s) => s.classList.contains("is-fx-on")));
    slides.forEach((s, i) => s.classList.toggle("is-fx-on", i === cur));
    if (reduce || slides.length < 2) return () => slides.forEach((s) => s.classList.remove("is-fx-on", "is-fx-prev"));
    const wait = +(options.wait ?? 3), fade = +(options.fade ?? 3), settle = +(options.settle ?? 2);
    el.style.setProperty("--fx-fade", `${fade}s`);
    el.style.setProperty("--fx-settle", `${settle}s`);
    if (options.zoom != null) el.style.setProperty("--fx-zoom", +options.zoom);
    if (options.ease) el.style.setProperty("--fx-ease", `cubic-bezier(${options.ease})`);
    let timer, clear, running = false;
    const next = () => {
      const prev = slides[cur];
      cur = (cur + 1) % slides.length;
      slides.forEach((s) => s.classList.remove("is-fx-on", "is-fx-prev"));
      prev.classList.add("is-fx-prev");
      slides[cur].classList.add("is-fx-on");
      clearTimeout(clear);
      clear = setTimeout(() => prev.classList.remove("is-fx-prev"), settle * 1000);
    };
    const loop = () => { timer = setTimeout(() => { next(); timer = setTimeout(() => running && loop(), settle * 1000); }, wait * 1000); };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; loop(); }
      else if (!e.isIntersecting && running) { running = false; clearTimeout(timer); }
    });
    io.observe(el);
    return () => {
      io.disconnect(); running = false; clearTimeout(timer); clearTimeout(clear);
      slides.forEach((s) => s.classList.remove("is-fx-on", "is-fx-prev"));
      ["--fx-fade", "--fx-settle", "--fx-zoom", "--fx-ease"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
