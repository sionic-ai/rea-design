(() => {
  // Original values: waits 1s then fills over 2.5s CSS ease, at 3.4s the curtain lifts up over .3s ease-in-out (.5s ease-out on phones 835 and below).
  // The lift timing is .1s earlier than the end of the fill (3.5s) — the original times it separately with setTimeout 3400. When fully lifted, fx:done.
  kfFx.register("logo-fill-loader", (el, { options, reduce }) => {
    const logo = el.querySelector('[data-fx-part="logo"]');
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    if (reduce || !logo) {
      el.classList.add("is-gone");
      done();
      return () => el.classList.remove("is-gone");
    }
    const ink = logo.cloneNode(true);
    ink.setAttribute("data-fx-part", "ink");
    ink.setAttribute("aria-hidden", "true");
    ink.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    logo.append(ink);

    const narrow = matchMedia(`(max-width: ${+(options.narrow || 835)}px)`).matches;
    const delay = +(options.delay ?? 1);
    const fill = +(options.fill ?? 2.5);
    const outAt = +(options.out ?? 3.4);
    const outDur = +(narrow ? options["out-dur-narrow"] ?? 0.5 : options["out-dur"] ?? 0.3);
    const fillEase = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    const outEase = narrow
      ? kfFx.ease(options["out-ease-narrow"] || "0,0,0.58,1", "power1.out")
      : kfFx.ease(options["out-ease"] || "0.42,0,0.58,1", "sine.inOut");

    const tl = gsap.timeline({
      onComplete: () => {
        el.classList.add("is-gone");
        done();
      },
    });
    tl.fromTo(ink, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: fill, ease: fillEase }, delay)
      // look: fade, the curtain isn’t raised and it fades in place (media splash: after filling, rests .2s then .5s power1.in)
      .to(el, options.look === "fade" ? { opacity: 0, duration: outDur, ease: outEase } : { yPercent: -100, duration: outDur, ease: outEase }, outAt);
    // wait: load — starts filling only after waiting for both font readiness and window load (media-brand waits for both with Promise.all)
    let off = false;
    if (options.wait === "load") {
      tl.pause();
      const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
      Promise.all([document.fonts ? document.fonts.ready : null, loaded]).then(() => { if (!off) tl.play(0); });
    }

    return () => {
      off = true;
      tl.kill();
      ink.remove();
      gsap.set(el, { clearProps: "transform,opacity" });
      el.classList.remove("is-gone");
    };
  });
})();
