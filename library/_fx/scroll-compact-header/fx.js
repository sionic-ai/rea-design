(() => {
  kfFx.register("scroll-compact-header", (el, { options, scroller }) => {
    const at = +(options.at ?? 500);
    const mq = matchMedia(options.wide || "(min-width: 1001px)");
    const src = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    let on = null;
    const check = () => {
      const next = mq.matches && top() > at;
      if (next === on) return;
      on = next;
      el.classList.toggle("is-compact", next);
      el.dispatchEvent(new CustomEvent(next ? "fx:compact" : "fx:expand", { bubbles: true }));
    };
    src.addEventListener("scroll", check, { passive: true });
    mq.addEventListener("change", check);
    check();
    return () => {
      src.removeEventListener("scroll", check);
      mq.removeEventListener("change", check);
      el.classList.remove("is-compact");
    };
  });
})();
