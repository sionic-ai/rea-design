(() => {
  kfFx.register("hop-pop-in", (el, { options, reduce, scroller }) => {
    // look: hop makes the inner image bounce twice only on hover — it ends with CSS :hover, so there is nothing to do here
    if (options.look === "hop") return;
    const show = () => el.classList.add("is-fx-in");
    if (reduce) { el.classList.add("is-fx-in", "is-fx-still"); return () => el.classList.remove("is-fx-in", "is-fx-still"); }
    let st = null;
    if (options.on === "scroll" && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 85%", once: true, onEnter: show });
    } else if (options.on === "ready" || document.readyState === "complete") show();
    // The original puts a mark on body after everything including images has loaded (load) and counts the delay from then
    else addEventListener("load", show, { once: true });
    return () => { st?.kill(); removeEventListener("load", show); el.classList.remove("is-fx-in"); };
  });
})();
