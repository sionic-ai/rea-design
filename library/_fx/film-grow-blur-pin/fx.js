// While the section is pinned, a video backdrop behind it turns on, the video floats small then grows past the screen and fades, text rises over it, and the backdrop turns off at the end.
// The curtain must sit outside the section (directly under body) so it isn’t trapped in the stacking context of the fixed section and lies beneath the other background layers — so it can also be found via the film option.
(() => {
  kfFx.register("film-grow-blur-pin", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const film = el.querySelector('[data-fx-part="film"]') || (options.film ? document.querySelector(options.film) : null);
    const media = film && film.querySelector('[data-fx-part="media"]');
    const text = el.querySelector('[data-fx-part="text"]');
    if (!film || !media) return;
    // Curtains picked outside the section fall outside the fx.css scope, so positioning is given here
    if (!el.contains(film)) {
      Object.assign(film.style, { position: "fixed", inset: "0", zIndex: "-1", pointerEvents: "none", overflow: "hidden" });
      Object.assign(media.style, { position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover" });
    }
    const from = +(options.from ?? 0.7), mid = +(options.mid ?? 0.94), to = +(options.to ?? 1.1);
    const blur = +(options.blur ?? 16), dim = +(options.dim ?? 0.38);
    if (reduce) {
      gsap.set(film, { opacity: 0 });
      if (text) gsap.set(text, { opacity: 1 });
      return () => gsap.set([film, text].filter(Boolean), { clearProps: "opacity" });
    }
    const b = { v: 0 };
    const setBlur = () => { media.style.filter = `blur(${b.v}px)`; };
    const tl = gsap.timeline({
      scrollTrigger: {
        scroller, trigger: el, start: options.start || "top top", end: options.end || "+=200%",
        pin: options.pin !== "false", pinSpacing: true, scrub: options.scrub && options.scrub !== "true" ? +options.scrub : true,
        anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    tl.fromTo(film, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.05 }, 0)
      .fromTo(media, { scale: from, opacity: 0 }, { scale: mid, opacity: 1, ease: "none", duration: 0.26 }, 0.04)
      .to(media, { scale: to, ease: "none", duration: 0.2 }, 0.3)
      .fromTo(b, { v: 0 }, { v: blur, ease: "none", duration: 0.22, onUpdate: setBlur }, 0.3)
      .to(media, { opacity: dim, ease: "none", duration: 0.2 }, 0.32);
    if (text) tl.fromTo(text, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.12 }, 0.5);
    tl.to(film, { opacity: 0, ease: "none", duration: 0.1 }, 0.9);
    return () => {
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
      gsap.set([film, media, text].filter(Boolean), { clearProps: "opacity,transform,filter" });
    };
  });
})();
