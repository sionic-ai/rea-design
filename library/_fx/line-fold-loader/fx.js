(() => {
  // Two frames after attaching, is-on is added — adding it in the same frame means the first look never paints and lines and logo jump straight to the end look. Hides at hide (default 5s) and fires fx:done
  kfFx.register("line-fold-loader", (el, { options, reduce }) => {
    const hide = +(options.hide ?? 5) * 1000;
    const done = () => { el.classList.add("is-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    let raf = 0, timer = 0;
    if (reduce) { el.classList.add("is-on"); done(); return () => el.classList.remove("is-on", "is-done"); }
    raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => { el.classList.add("is-on"); timer = setTimeout(done, hide); }); });
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); el.classList.remove("is-on", "is-done"); };
  });
})();
