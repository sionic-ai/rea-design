(() => {
  kfFx.register("pop-swap-loader", (el, { options, reduce }) => {
    const frames = [...el.querySelectorAll("[data-fx-part='frame']")];
    const every = +(options.every ?? 1) * 1000;
    const loops = +(options.loops ?? 2);
    const done = () => {
      if (el.classList.contains("is-done")) return;
      el.classList.add("is-done");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    if (reduce || frames.length === 0) {
      frames[0]?.classList.add("is-current");
      const t = setTimeout(done, 0);
      return () => { clearTimeout(t); el.classList.remove("is-done"); };
    }

    let index = 1, looped = 0, tick = 0, wait = 0, finish = 0, loaded = document.readyState === "complete";
    const pick = () => 1 + Math.floor(Math.random() * Math.max(1, frames.length - 1));
    const show = () => frames.forEach((f, i) => f.classList.toggle("is-current", i === index));
    const loop = () => {
      index = index !== 0 || frames.length < 2 ? 0 : pick();
      looped += 1;
      show();
      tick = setTimeout(loop, every);
    };
    // The original shows at least two beats (logo → character) even after loading ends, rests one more beat, then lifts
    const settle = () => {
      if (looped >= loops) finish = setTimeout(() => { done(); setTimeout(() => clearTimeout(tick), +(options.fade ?? 1) * 1000); }, every);
      else wait = setTimeout(settle, every);
    };
    const onLoad = () => { loaded = true; settle(); };
    el.style.setProperty("--fx-fade", `${+(options.fade ?? 1)}s`);
    loop();
    if (loaded) settle();
    else addEventListener("load", onLoad, { once: true });

    return () => {
      [tick, wait, finish].forEach(clearTimeout);
      removeEventListener("load", onLoad);
      frames.forEach((f) => f.classList.remove("is-current"));
      el.classList.remove("is-done");
      el.style.removeProperty("--fx-fade");
    };
  });
})();
