(() => {
  // Adds two border layers (with look: single, just one thin inner layer), and attaches .fx-drawn when visible (default top 75%, once), when a state arrives (on: state — is-active), or right on load (on: load).
  // The drawing is a css clip-path transition — length, curve and delay are passed as css variables from the options
  kfFx.register("diagonal-frame-draw", (el, { options, reduce, scroller }) => {
    const single = options.look === "single";
    const made = (single ? ["in"] : ["out", "in"]).map((k) => {
      const s = document.createElement("span");
      s.className = `fx-dfd fx-dfd--${k}`;
      s.setAttribute("aria-hidden", "true");
      if (single) s.style.cssText = "width:100%;height:100%";
      el.prepend(s);
      return s;
    });
    const vars = { dur: "--fx-dur", delay: "--fx-delay", inset: "--fx-inset" };
    const set = [];
    for (const [k, v] of Object.entries(vars)) {
      if (options[k] == null) continue;
      el.style.setProperty(v, k === "inset" ? `${+options[k]}px` : `${+options[k]}s`);
      set.push(v);
    }
    if (options.ease) { el.style.setProperty("--fx-ease", /,/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease); set.push("--fx-ease"); }
    const draw = () => el.classList.add("fx-drawn");
    let st = null, mo = null;
    if (reduce || options.on === "load") draw();
    else if (options.on === "state") {
      // Remove it right after drawing — attaching fx-drawn is itself a class change, so leaving it on would endlessly wake itself up
      const check = () => { if (!el.classList.contains(options.state || "is-active")) return; mo.disconnect(); draw(); };
      mo = new MutationObserver(check);
      mo.observe(el, { attributes: true, attributeFilter: ["class"] });
      check();
    } else if (window.ScrollTrigger) {
      st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: options.start || "top 75%", once: true, onEnter: draw });
    } else draw();
    return () => {
      st && st.kill();
      mo && mo.disconnect();
      made.forEach((s) => s.remove());
      set.forEach((v) => el.style.removeProperty(v));
      el.classList.remove("fx-drawn");
    };
  });
})();
