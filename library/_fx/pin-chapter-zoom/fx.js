(() => {
  kfFx.register("pin-chapter-zoom", (el, { options, reduce, scroller }) => {
    const chapters = [...el.querySelectorAll('[data-fx-part="chapter"]')];
    if (!chapters.length || !window.ScrollTrigger) return;
    const intro = el.querySelector('[data-fx-part="intro"]');
    const ease = kfFx.ease(options.ease || "circ.out", "power2.out");
    const rest = +(options.rest ?? 5);
    const end = +(options.end ?? 16000);
    if (reduce) {
      if (intro) gsap.set(intro, { opacity: 0 });
      gsap.set(chapters[0], { display: "block" });
      return () => gsap.set([intro, chapters[0]].filter(Boolean), { clearProps: "all" });
    }
    el.classList.add("is-fx-on");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: `+=${end}`, pin: true, scrub: true } });
    if (intro) tl.fromTo(intro, { opacity: 1 }, { opacity: 0, duration: 5, ease }, `+=${rest * 2}`);
    chapters.forEach((ch) => {
      const film = ch.querySelector('[data-fx-part="film"]');
      const parts = [ch.querySelector('[data-fx-part="layer"]'), ch.querySelector('[data-fx-part="title"]')];
      tl.fromTo(ch, { display: "none" }, { display: "block", duration: 0.5 });
      if (film) tl.fromTo(film, { scale: 0 }, { scale: 1, duration: 5, ease }, `+=${rest}`);
      if (parts[0]) tl.fromTo(parts[0], { opacity: 0 }, { opacity: 1, duration: 2, ease });
      if (parts[1]) tl.fromTo(parts[1], { opacity: 0 }, { opacity: 1, duration: 2, ease }, "+=1");
      if (film) tl.to(film, { scale: 3, opacity: 0, duration: 5, ease }, `+=${rest}`);
      parts.forEach((p) => p && tl.to(p, { opacity: 0, duration: 2, ease }, "-=1"));
      tl.to(ch, { display: "none", duration: 0.5 });
    });
    return () => {
      tl.scrollTrigger?.kill(true);
      tl.kill();
      el.classList.remove("is-fx-on");
      gsap.set([intro, ...chapters, ...el.querySelectorAll('[data-fx-part="film"], [data-fx-part="layer"], [data-fx-part="title"]')].filter(Boolean), { clearProps: "opacity,transform,display" });
    };
  });
})();
