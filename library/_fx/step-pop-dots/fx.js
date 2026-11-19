(() => {
  kfFx.register("step-pop-dots", (el, { options, reduce }) => {
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    if (!dots.length || reduce) return;
    const delay = +(options.delay ?? 1), each = +(options.each ?? 0.5), dur = +(options.dur ?? 1.5), every = +(options.every ?? 0);
    el.style.setProperty("--fx-dur", `${dur}s`);
    let timers = [];
    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
      dots.forEach((d) => d.classList.remove("fx-step-pop-on"));
    };
    // To replay the same keyframes, remove the class, measure once, then add it back
    const pop = (d) => { d.classList.remove("fx-step-pop-on"); void d.offsetWidth; d.classList.add("fx-step-pop-on"); };
    const play = () => {
      clear();
      dots.forEach((d, k) => timers.push(setTimeout(() => pop(d), (delay + each * k) * 1000)));
      if (every > 0) timers.push(setTimeout(play, every * 1000));
    };
    el.addEventListener("fx:play", play);
    if (options.on !== "event") play();
    return () => {
      clear();
      el.removeEventListener("fx:play", play);
      el.style.removeProperty("--fx-dur");
    };
  });
})();
