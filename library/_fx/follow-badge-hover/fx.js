// Hovering over a wide panel (photo link) makes a round badge appear there, growing from 0 in .2s, and it follows the cursor with a .5s delay
// When the pointer is released it shrinks and vanishes in place in .2s. The badge text turns on after it is fully grown and turns off first when leaving (at first the size is 0, so the text is left on)
(() => {
  kfFx.register("follow-badge-hover", (el, { options, reduce, hover }) => {
    const badge = el.querySelector('[data-fx-part="badge"]');
    if (!badge || !hover) return;
    const label = badge.querySelector('[data-fx-part="label"]');
    const shift = +(options.shift ?? 120), pop = +(options.pop ?? 0.2), lag = +(options.lag ?? 0.5);
    const fade = options.look === "fade";
    // With from, it appears growing from that size and opacity and disappears shrinking to that size — on entering it is first moved straight to the cursor spot (Brand .6)
    const from = options.from != null ? +options.from : null;
    const out = +(options.out ?? pop);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out"), popEase = kfFx.ease(options["pop-ease"] || "power1.out", "power1.out");
    const outEase = options["out-ease"] ? kfFx.ease(options["out-ease"], "power1.in") : popEase;
    // With center alignment, the middle of the badge lands on the cursor (the “Enter Archive” button in crl)
    const centre = options.center === "1";
    // Even on scroll, re-measures the last cursor position inside the panel — so the cursor stays put but the panel shifts and the badge doesn’t get stranded in the wrong place (change-agent)
    const follow = options.scroll === "1";
    let last = null;
    // The original starts with only the size at 0 and opacity at 1 — only on exit does opacity also drop to 0. The fade type leaves size alone and only switches opacity
    gsap.set(badge, fade ? { scale: 1, autoAlpha: 0 } : from != null ? { scale: from, autoAlpha: 0 } : { scale: 0 });
    if (centre) gsap.set(badge, { xPercent: -50, yPercent: -50 });
    const at = (e) => { const b = el.getBoundingClientRect(), s = centre ? 0 : shift; return { x: e.clientX - b.left - s, y: e.clientY - b.top - s }; };
    const shown = fade ? { autoAlpha: 1 } : from != null ? { scale: 1, autoAlpha: 1 } : { scale: 1, opacity: 1 };
    const hidden = fade ? { autoAlpha: 0 } : from != null ? { scale: from, autoAlpha: 0 } : { scale: 0, opacity: 0 };
    const enter = (e) => {
      last = e;
      const p = at(e);
      if (from != null) {
        gsap.set(badge, p);
        gsap.to(badge, { ...shown, duration: reduce ? 0 : pop, ease: popEase, overwrite: "auto" });
        if (label) gsap.set(label, { opacity: 1 });
        return;
      }
      // Fade type starts following right where it enters, and only the opacity is raised separately
      const tl = gsap.timeline().to(badge, { ...(fade ? {} : p), ...shown, duration: reduce ? 0 : pop, ease: popEase, overwrite: "auto" });
      if (fade) gsap.to(badge, { ...p, duration: reduce ? 0 : lag, ease, overwrite: "auto" });
      if (label) tl.set(label, { opacity: 1 });
    };
    const move = (e) => { last = e; gsap.to(badge, { ...at(e), duration: reduce ? 0 : lag, ease, overwrite: "auto" }); };
    const scrolled = () => { if (last) move(last); };
    const leave = (e) => {
      last = null;
      const tl = gsap.timeline();
      if (label) tl.set(label, { opacity: 0 });
      tl.to(badge, { ...(fade || from != null ? {} : at(e)), ...hidden, duration: reduce ? 0 : out, ease: outEase, overwrite: "auto" });
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    if (follow) addEventListener("scroll", scrolled, { passive: true });
    return () => {
      removeEventListener("scroll", scrolled);
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      gsap.killTweensOf(label ? [badge, label] : badge);
      gsap.set(label ? [badge, label] : badge, { clearProps: "all" });
    };
  });
})();
