(() => {
  kfFx.register("brake-auto-strip", (el, { options, reduce }) => {
    const track = el.querySelector(".splide__track");
    if (!track || !window.Splide || !track.querySelector(".splide__slide")) return;
    const speed = +(options.speed ?? 0.4), narrow = +(options.narrow ?? 0.2);
    const at = +options.at || 768, brake = +(options.brake ?? 0.01);
    const count = el.querySelector('[data-fx-part="count"]');
    const total = el.querySelector('[data-fx-part="total"]');
    const bar = el.querySelector('[data-fx-part="bar"]');
    const AutoScroll = window.splide?.Extensions?.AutoScroll;
    const sp = new Splide(el, {
      type: "loop", speed: reduce ? 0 : +(options.move ?? 1000), autoWidth: true, isNavigation: false, pagination: false,
      mediaQuery: "min", clones: +options.clones || 10,
      drag: options.drag === "free" ? "free" : true, gap: options.gap != null ? `${+options.gap}px` : 0,
      autoScroll: { speed: narrow, pauseOnHover: false, pauseOnFocus: false, autoStart: !reduce },
      breakpoints: { [at]: { autoScroll: { speed } } },
    });
    // Holding deceleration paused during the swipe is also as in the original — it is released one beat (setTimeout) after, not right after moved
    let moving = false;
    sp.on("move", () => { moving = true; });
    sp.on("moved", () => { setTimeout(() => { moving = false; }); });
    sp.mount(AutoScroll && !reduce ? { AutoScroll } : {});
    if (total) total.textContent = sp.length;

    const setSpeed = (p) => { sp.options = { autoScroll: { speed: narrow * p }, breakpoints: { [at]: { autoScroll: { speed: speed * p } } } }; };
    let over = false, power = 1, prev = 0, raf = 0;
    const enter = () => { over = true; };
    const leave = () => { over = false; };
    // The arrow sits inside a link wrapping the band — it only slides and never follows the link
    const click = (e) => { if (e.target.closest(".splide__arrow")) e.preventDefault(); };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (count) count.textContent = sp.Components.Controller.getIndex() + 1;
      const third = sp.Components.Elements.list.scrollWidth / 3;
      let p = third ? (Math.abs(sp.Components.Move.getPosition()) % third) / third : 0;
      if (p < prev - 0.5) p = prev;
      prev = p;
      if (bar) bar.style.translate = `${-100 + p * 100}% 0`;
      if (moving || !AutoScroll || reduce) return;
      const auto = sp.Components.AutoScroll;
      if (!auto) return;
      // Original deceleration as is: while hovered, it shrinks by brake each frame and stops below .001, on release it returns to its own speed (1 + brake) in that very frame
      if (over && power > 0) {
        power -= power * brake;
        setSpeed(power);
        if (power < 0.001) { power = 0; auto.pause(); }
      } else if (!over && power <= 1) {
        auto.play();
        power += power * brake;
        if (power < 0.999) power = 1;
        setSpeed(power);
      }
    };
    track.addEventListener("mouseenter", enter);
    track.addEventListener("mouseleave", leave);
    el.addEventListener("click", click);
    loop();
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("mouseenter", enter);
      track.removeEventListener("mouseleave", leave);
      el.removeEventListener("click", click);
      sp.destroy(true);
    };
  });
})();
