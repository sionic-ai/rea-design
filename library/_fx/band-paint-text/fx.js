// Filling is done by fx.css, and here we only decide when to send the band — once on scroll (only when scrolling down, not retracted again) or while hovering.
// Hover also turns on when the pointer is over a link or button containing the element (in the original the whole row is a link, so the band moves even over the arrow)
(() => {
  kfFx.register("band-paint-text", (el, { options, reduce, hover, scroller }) => {
    if (!el.textContent.trim()) return;
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    const on = () => el.classList.add("fx-band-on");
    // delay: postpones the start (both scroll and load) — for painting the title·subtitle·body of the same panel in order, .3s apart each
    const fire = () => { clearTimeout(timer); if (+(options.delay ?? 0) > 0) timer = setTimeout(on, +options.delay * 1000); else on(); };
    const off = () => el.classList.remove("fx-band-on");
    const modes = String(options.trigger || "scroll").split(/[\s,]+/);
    const ac = new AbortController();
    let st = null, timer = 0;
    if (modes.includes("scroll")) {
      if (reduce) on();
      else {
        const small = matchMedia("(max-width: 768px)").matches;
        const at = (small ? options["start-sm"] : null) ?? options.start ?? (small ? "80%" : "70%");
        st = ScrollTrigger.create({ trigger: (options["trigger-el"] && el.closest(options["trigger-el"])) || el, scroller, start: `top ${String(at).includes("%") ? at : `${at}%`}`, end: "max", once: true, onEnter: fire });
      }
    }
    // load: fires once, delay seconds after the document opens (original Brand hero vertical title 500ms)
    if (modes.includes("load")) {
      if (reduce) on();
      else fire();
    }
    if (modes.includes("hover") && hover) {
      const host = el.closest("a, button") || el;
      host.addEventListener("pointerenter", on, { signal: ac.signal });
      host.addEventListener("pointerleave", off, { signal: ac.signal });
      host.addEventListener("focusin", () => host.matches(":focus-visible") && on(), { signal: ac.signal });
      host.addEventListener("focusout", off, { signal: ac.signal });
    }
    return () => { ac.abort(); st?.kill(); clearTimeout(timer); off(); el.style.removeProperty("--fx-dur"); };
  });
})();
