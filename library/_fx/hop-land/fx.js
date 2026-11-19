(() => {
  // The image drops from above (from) and lands at 44%, bounces once more small (again) at 77% and settles — ease-in coming down, ease-out bouncing up (.5s).
  // Once when visible (default), or on load (on: load), or when the host sends fx:play (on: event). An entrance where cutting board, teacup, brand and character settle down with a thud (Brand)
  kfFx.register("hop-land", (el, { options, reduce, scroller }) => {
    const set = (k, v) => v != null && el.style.setProperty(k, v);
    set("--fx-from", options.from != null ? (/[a-z%]/i.test(options.from) ? options.from : options.from + "px") : null);
    set("--fx-again", options.again != null ? (/[a-z%]/i.test(options.again) ? options.again : options.again + "px") : null);
    set("--fx-dur", options.dur != null ? +options.dur + "s" : null);
    set("--fx-delay", options.delay != null ? +options.delay + "s" : null);
    const play = () => { el.classList.remove("is-fx-hop"); void el.offsetWidth; el.classList.add("is-fx-hop"); };
    if (reduce) { el.classList.add("is-fx-done"); return () => el.classList.remove("is-fx-done"); }
    if (options.on === "load") {
      if (document.readyState === "complete") play(); else addEventListener("load", play, { once: true });
      return () => { removeEventListener("load", play); el.classList.remove("is-fx-hop"); };
    }
    if (options.on === "event") {
      el.addEventListener("fx:play", play);
      return () => { el.removeEventListener("fx:play", play); el.classList.remove("is-fx-hop"); };
    }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 75%", once: true, onEnter: play });
    return () => { st.kill(); el.classList.remove("is-fx-hop"); };
  });
})();
