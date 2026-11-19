(() => {
  // When the top edge of the until element (footer etc.) enters the screen, the button hides downward (is-fx-hide).
  // With after, it stays hidden until the top edge of that element passes above the screen (not visible in the Hero, appears after passing the News section).
  // Spinning boards and bouncing (look: flip makes one full turn on the Y axis) run on fx.css alone
  kfFx.register("spin-badge-bounce", (el, { options, scroller }) => {
    if (options.turn != null) el.style.setProperty("--fx-turn", +options.turn + "s");
    if (options.bound != null) el.style.setProperty("--fx-bound", +options.bound + "s");
    const until = options.until, after = options.after;
    const box = scroller || window;
    const check = () => {
      const u = until && document.querySelector(until), a = after && document.querySelector(after);
      const beforeAfter = !!a && a.getBoundingClientRect().top > 0;
      const pastUntil = !!u && u.getBoundingClientRect().top <= innerHeight;
      el.classList.toggle("is-fx-hide", beforeAfter || pastUntil);
    };
    const watch = until || after;
    if (watch) { box.addEventListener("scroll", check, { passive: true }); addEventListener("resize", check); check(); }
    return () => {
      if (watch) { box.removeEventListener("scroll", check); removeEventListener("resize", check); }
      el.classList.remove("is-fx-hide");
      el.style.removeProperty("--fx-turn");
      el.style.removeProperty("--fx-bound");
    };
  });
})();
