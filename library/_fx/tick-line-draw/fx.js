(() => {
  // Draws the 0.5px horizontal line under the title and the vertical tick at its end separately — once when the panel enters within the screen bottom + margin.
  // Horizontal lines grow from the left, right and center, and ticks grow up or down from one left end or from both ends. Order and length are options (css variables)
  kfFx.register("tick-line-draw", (el, { options, reduce, scroller }) => {
    const set = (k, v) => v != null && el.style.setProperty(k, v);
    const s = (v) => (v == null ? null : `${+v}s`);
    set("--fx-x-dur", s(options["x-dur"]));
    set("--fx-x-delay", s(options["x-delay"]));
    set("--fx-y-dur", s(options["y-dur"]));
    set("--fx-y-delay", s(options["y-delay"]));
    set("--fx-x-from", { left: "0", right: "100%", center: "50%" }[options.from] ?? null);
    set("--fx-y-from", options["tick-from"] === "bottom" ? "bottom" : null);
    if (options.ease) set("--fx-ease", `cubic-bezier(${options.ease})`);
    el.classList.toggle("fx-tld-ends", options.tick === "ends");
    el.classList.toggle("fx-tld-none", options.tick === "none");
    const on = () => el.classList.add("fx-tld-on");
    const off = () => {
      st?.kill();
      el.removeEventListener("fx:show", on);
      el.classList.remove("fx-tld-on", "fx-tld-ends", "fx-tld-none");
      ["--fx-x-dur", "--fx-x-delay", "--fx-y-dur", "--fx-y-delay", "--fx-x-from", "--fx-y-from", "--fx-ease"].forEach((k) => el.style.removeProperty(k));
    };
    let st = null;
    if (reduce) { el.classList.add("fx-tld-on", "fx-tld-done"); return () => { el.classList.remove("fx-tld-done"); off(); }; }
    el.addEventListener("fx:show", on);
    if (options.on !== "state" && window.ScrollTrigger && window.gsap) {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top bottom+=128", once: true, onEnter: on });
    } else if (options.on !== "state") on();
    return off;
  });
})();
